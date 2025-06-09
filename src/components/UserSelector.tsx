import {
    Add as AddIcon,
    Person as PersonIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Card,
    CardActionArea,
    CardContent,
    Chip,
    Container,
    Fab,
    Grid,
    InputAdornment,
    TextField,
    Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { GROUP_COLORS, User } from '../types';

// 50音順ソート用の関数
const sortUsersByKana = (users: User[]): User[] => {
    return users.sort((a, b) => {
        return a.name.localeCompare(b.name, 'ja', { sensitivity: 'base' });
    });
};

// 利用者検索フィルター
const filterUsers = (users: User[], searchTerm: string): User[] => {
    if (!searchTerm) return users;

    const term = searchTerm.toLowerCase();
    return users.filter(user =>
        user.name.toLowerCase().includes(term) ||
        user.group.includes(term)
    );
};

const UserSelector: React.FC = () => {
    const { state, selectUser, navigateToView } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

    // ユーザーリストの更新とフィルタリング
    useEffect(() => {
        const activeUsers = state.users.filter(user => user.isActive);
        const sortedUsers = sortUsersByKana(activeUsers);
        const filtered = filterUsers(sortedUsers, searchTerm);
        setFilteredUsers(filtered);
    }, [state.users, searchTerm]);

    // 利用者選択ハンドラー
    const handleUserSelect = (user: User) => {
        selectUser(user);
        navigateToView('mealOrder');
    };

    // 新規利用者追加ハンドラー
    const handleAddUser = () => {
        navigateToView('admin');
    };

    // グループ別の統計情報
    const getGroupStats = () => {
        const stats = filteredUsers.reduce((acc, user) => {
            acc[user.group] = (acc[user.group] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return stats;
    };

    const groupStats = getGroupStats();

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* ヘッダー */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h2" component="h1" sx={{ mb: 2, color: 'primary.main' }}>
                    🍱 あおば給食システム
                </Typography>
                <Typography variant="h4" component="h2" sx={{ mb: 3 }}>
                    利用者を選んでください
                </Typography>

                {/* グループ別統計 */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    {Object.entries(groupStats).map(([group, count]) => (
                        <Chip
                            key={group}
                            label={`${group}: ${count}人`}
                            sx={{
                                backgroundColor: GROUP_COLORS[group as keyof typeof GROUP_COLORS],
                                color: 'white',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                px: 2,
                                py: 1,
                            }}
                        />
                    ))}
                </Box>
            </Box>

            {/* 検索バー */}
            <Box sx={{ mb: 4 }}>
                <TextField
                    fullWidth
                    label="利用者名で検索"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ fontSize: '2rem' }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiInputBase-root': {
                            fontSize: '1.5rem',
                            minHeight: '80px',
                        },
                        '& .MuiInputLabel-root': {
                            fontSize: '1.25rem',
                        },
                    }}
                />
            </Box>

            {/* 利用者リスト */}
            {filteredUsers.length === 0 ? (
                <Alert
                    severity="info"
                    sx={{
                        fontSize: '1.25rem',
                        py: 3,
                        textAlign: 'center'
                    }}
                >
                    {searchTerm ? '該当する利用者が見つかりません' : '利用者が登録されていません'}
                </Alert>
            ) : (
                <Grid container spacing={3}>
                    {filteredUsers.map((user) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={user.id}>
                            <Card
                                sx={{
                                    minHeight: '180px',
                                    border: `3px solid ${GROUP_COLORS[user.group]}`,
                                    borderRadius: '16px',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'scale(1.05)',
                                        boxShadow: `0 8px 24px ${GROUP_COLORS[user.group]}40`,
                                    },
                                }}
                            >
                                <CardActionArea
                                    onClick={() => handleUserSelect(user)}
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        p: 3,
                                    }}
                                    aria-label={`${user.name}さんを選択`}
                                >
                                    <CardContent sx={{ textAlign: 'center', p: 0 }}>
                                        {/* アイコン */}
                                        <PersonIcon
                                            sx={{
                                                fontSize: '4rem',
                                                color: GROUP_COLORS[user.group],
                                                mb: 2,
                                            }}
                                        />

                                        {/* 利用者名 */}
                                        <Typography
                                            variant="h4"
                                            component="h3"
                                            sx={{
                                                fontWeight: 700,
                                                mb: 1,
                                                color: 'text.primary',
                                                wordBreak: 'break-word',
                                            }}
                                        >
                                            {user.name}
                                        </Typography>

                                        {/* グループバッジ */}
                                        <Chip
                                            label={user.group}
                                            sx={{
                                                backgroundColor: GROUP_COLORS[user.group],
                                                color: 'white',
                                                fontSize: '1.1rem',
                                                fontWeight: 600,
                                                mb: 1,
                                            }}
                                        />

                                        {/* 料金 */}
                                        <Typography
                                            variant="h5"
                                            sx={{
                                                fontWeight: 600,
                                                color: 'text.secondary',
                                            }}
                                        >
                                            ¥{user.price}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* 新規利用者追加ボタン（管理者用） */}
            <Fab
                color="secondary"
                aria-label="新規利用者追加"
                onClick={handleAddUser}
                sx={{
                    position: 'fixed',
                    bottom: 32,
                    right: 32,
                    width: 80,
                    height: 80,
                    fontSize: '2rem',
                }}
            >
                <AddIcon sx={{ fontSize: '2.5rem' }} />
            </Fab>
        </Container>
    );
};

export default UserSelector; 