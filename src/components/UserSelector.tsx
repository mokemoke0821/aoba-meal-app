import {
    CheckCircle as CheckCircleIcon,
    Person as PersonIcon,
    Restaurant as RestaurantIcon,
    Search as SearchIcon,
    Settings as SettingsIcon,
    Star as StarIcon
} from '@mui/icons-material';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Fab,
    InputAdornment,
    TextField,
    Typography
} from '@mui/material';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { GROUP_COLORS, User, getGroupDisplayName } from '../types';
import HelpButton from './HelpButton';

// 50音順ソート
const sortUsersByKana = (users: User[]): User[] => {
    return users.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
};

// ユーザーフィルタリング
const filterUsers = (users: User[], searchTerm: string): User[] => {
    if (!searchTerm) return users;
    return users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
};

const UserSelector: React.FC = () => {
    const { state, selectUser, navigateToView, getTodayMealRecords } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

    // 今日の給食記録を取得
    const todayRecords = getTodayMealRecords();

    // ユーザーリストの更新とフィルタリング
    useEffect(() => {
        const activeUsers = state.users.filter(user => user.isActive);
        const sortedUsers = sortUsersByKana(activeUsers);
        const filtered = filterUsers(sortedUsers, searchTerm);
        setFilteredUsers(filtered);
    }, [state.users, searchTerm]);

    // 利用者の今日の状態を取得
    const getUserStatus = (user: User) => {
        const record = todayRecords.find(r => r.userId === user.id);
        if (!record) return 'no_order'; // 未注文
        if (record.rating === 0) return 'ordered'; // 注文済み未評価
        return 'rated'; // 評価済み
    };

    // 利用者選択ハンドラー（注文用）
    const handleUserSelectForOrder = (user: User) => {
        selectUser(user);
        navigateToView('mealOrder');
    };

    // 利用者選択ハンドラー（評価用）
    const handleUserSelectForRating = (user: User) => {
        selectUser(user);
        navigateToView('rating');
    };

    // 新規利用者追加ハンドラー
    const handleAddUser = () => {
        navigateToView('admin');
    };

    // グループ別の統計情報
    const getGroupStats = () => {
        const stats = filteredUsers.reduce((acc, user) => {
            const displayName = getGroupDisplayName(user.group);
            acc[displayName] = (acc[displayName] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return stats;
    };

    // 状態別統計
    const getStatusStats = () => {
        const stats = {
            no_order: 0,
            ordered: 0,
            rated: 0
        };
        filteredUsers.forEach(user => {
            const status = getUserStatus(user);
            stats[status]++;
        });
        return stats;
    };

    const groupStats = getGroupStats();
    const statusStats = getStatusStats();

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

                {/* 今日の日付表示 */}
                <Typography variant="h5" sx={{ mb: 3, color: 'text.secondary' }}>
                    {format(new Date(), 'yyyy年MM月dd日')}
                </Typography>

                {/* 状態別統計 */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <Chip
                        icon={<RestaurantIcon />}
                        label={`未注文: ${statusStats.no_order}人`}
                        sx={{
                            backgroundColor: 'grey.300',
                            fontSize: '1rem',
                            fontWeight: 600,
                            px: 2,
                            py: 1,
                        }}
                    />
                    <Chip
                        icon={<StarIcon />}
                        label={`注文済み: ${statusStats.ordered}人`}
                        sx={{
                            backgroundColor: 'warning.main',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: 600,
                            px: 2,
                            py: 1,
                        }}
                    />
                    <Chip
                        icon={<CheckCircleIcon />}
                        label={`評価済み: ${statusStats.rated}人`}
                        sx={{
                            backgroundColor: 'success.main',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: 600,
                            px: 2,
                            py: 1,
                        }}
                    />
                </Box>

                {/* グループ別統計 */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    {Object.entries(groupStats).map(([displayName, count]) => (
                        <Chip
                            key={displayName}
                            label={`${displayName}: ${count}人`}
                            sx={{
                                backgroundColor: 'primary.main',
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
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3, mb: 4 }}>
                {filteredUsers.length === 0 ? (
                    <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 8 }}>
                        <Alert severity="info" sx={{ fontSize: '1.2rem', py: 2 }}>
                            {searchTerm ? '検索条件に一致する利用者が見つかりません' : '利用者が登録されていません'}
                        </Alert>
                    </Box>
                ) : (
                    filteredUsers.map(user => {
                        const status = getUserStatus(user);
                        const statusText = status === 'no_order' ? '未注文' : status === 'ordered' ? '注文済み' : '評価済み';
                        const statusColor = status === 'no_order' ? 'grey.300' : status === 'ordered' ? 'warning.main' : 'success.main';
                        const statusIcon = status === 'no_order' ? <RestaurantIcon /> : status === 'ordered' ? <StarIcon /> : <CheckCircleIcon />;

                        return (
                            <Card
                                key={user.id}
                                sx={{
                                    minHeight: '220px',
                                    border: `3px solid ${GROUP_COLORS[user.group]}`,
                                    borderRadius: '16px',
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                }}
                            >
                                {/* 状態表示バッジ */}
                                <Chip
                                    icon={statusIcon}
                                    label={statusText}
                                    sx={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        backgroundColor: statusColor,
                                        color: status === 'no_order' ? 'text.primary' : 'white',
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        zIndex: 1,
                                    }}
                                />

                                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    {/* アイコンと基本情報 */}
                                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                                        <Avatar
                                            sx={{
                                                width: 60,
                                                height: 60,
                                                bgcolor: GROUP_COLORS[user.group],
                                                mx: 'auto',
                                                mb: 2,
                                            }}
                                        >
                                            <PersonIcon sx={{ fontSize: '2rem' }} />
                                        </Avatar>

                                        <Typography
                                            variant="h5"
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

                                        <Chip
                                            label={getGroupDisplayName(user.group)}
                                            sx={{
                                                backgroundColor: GROUP_COLORS[user.group],
                                                color: 'white',
                                                fontSize: '1rem',
                                                fontWeight: 600,
                                                mb: 1,
                                            }}
                                        />

                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 600,
                                                color: 'text.secondary',
                                            }}
                                        >
                                            ¥{user.price}
                                        </Typography>
                                    </Box>

                                    {/* アクションボタン */}
                                    <Box sx={{ mt: 'auto', display: 'flex', gap: 1, flexDirection: 'column' }}>
                                        {status === 'no_order' && (
                                            <Button
                                                variant="contained"
                                                size="large"
                                                onClick={() => handleUserSelectForOrder(user)}
                                                startIcon={<RestaurantIcon />}
                                                sx={{
                                                    minHeight: '50px',
                                                    fontSize: '1.1rem',
                                                    fontWeight: 600,
                                                    borderRadius: '12px',
                                                    backgroundColor: 'primary.main',
                                                }}
                                            >
                                                給食注文
                                            </Button>
                                        )}

                                        {status === 'ordered' && (
                                            <Button
                                                variant="contained"
                                                size="large"
                                                onClick={() => handleUserSelectForRating(user)}
                                                startIcon={<StarIcon />}
                                                sx={{
                                                    minHeight: '50px',
                                                    fontSize: '1.1rem',
                                                    fontWeight: 600,
                                                    borderRadius: '12px',
                                                    backgroundColor: 'warning.main',
                                                }}
                                            >
                                                評価入力
                                            </Button>
                                        )}

                                        {status === 'rated' && (
                                            <Button
                                                variant="outlined"
                                                size="large"
                                                onClick={() => handleUserSelectForRating(user)}
                                                startIcon={<CheckCircleIcon />}
                                                sx={{
                                                    minHeight: '50px',
                                                    fontSize: '1.1rem',
                                                    fontWeight: 600,
                                                    borderRadius: '12px',
                                                    color: 'success.main',
                                                    borderColor: 'success.main',
                                                }}
                                            >
                                                評価確認・修正
                                            </Button>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </Box>

            {/* 管理画面ボタン */}
            <Box sx={{ position: 'fixed', bottom: 32, right: 32, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Fab
                    color="secondary"
                    aria-label="管理画面"
                    onClick={handleAddUser}
                    sx={{
                        width: 80,
                        height: 80,
                        fontSize: '2rem',
                    }}
                >
                    <SettingsIcon sx={{ fontSize: '2.5rem' }} />
                </Fab>
                <Typography
                    variant="caption"
                    sx={{
                        textAlign: 'center',
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        color: 'white',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.75rem'
                    }}
                >
                    管理画面
                </Typography>
            </Box>

            {/* ヘルプボタン */}
            <HelpButton />
        </Container>
    );
};

export default UserSelector; 