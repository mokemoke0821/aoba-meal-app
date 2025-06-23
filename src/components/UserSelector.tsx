import {
    ArrowBack as ArrowBackIcon,
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
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import {
    User,
    getCategoryInfo,
    getUserDisplayName
} from '../types';
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
    const {
        state,
        selectUser,
        navigateToView,
        getTodayMealRecords,
        setRequireAdminAuth,
        getUsersByCategory  // 新追加
    } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // 選択されたカテゴリの利用者を取得
    const categoryUsers = state.selectedCategory
        ? getUsersByCategory(state.selectedCategory)
        : [];

    // カテゴリ情報取得
    const categoryInfo = state.selectedCategory
        ? getCategoryInfo(state.selectedCategory)
        : null;

    // カテゴリ選択画面に戻る
    const handleBackToCategory = () => {
        navigateToView('categorySelect');
    };

    // カテゴリが選択されていない場合はカテゴリ選択画面に戻る
    useEffect(() => {
        if (!state.selectedCategory) {
            navigateToView('categorySelect');
        }
    }, [state.selectedCategory, navigateToView]);

    // 今日の給食記録を取得
    const todayRecords = getTodayMealRecords();

    // ユーザーリストの更新とフィルタリング
    useEffect(() => {
        const activeUsers = categoryUsers.filter(user => user.isActive !== false);
        const sortedUsers = sortUsersByKana(activeUsers);
        const filtered = filterUsers(sortedUsers, searchTerm);
        setFilteredUsers(filtered);
    }, [categoryUsers, searchTerm]);  // state.usersからcategoryUsersに変更

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
        setRequireAdminAuth(true);
        navigateToView('admin');
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

    const statusStats = getStatusStats();

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* ヘッダー */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                {/* 戻るボタン */}
                <Box sx={{ textAlign: 'left', mb: 3 }}>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={handleBackToCategory}
                        sx={{
                            minHeight: isMobile ? '50px' : '60px',
                            fontSize: isMobile ? '1rem' : '1.1rem',
                            fontWeight: 600,
                            borderRadius: '12px',
                            px: 3
                        }}
                    >
                        カテゴリ選択に戻る
                    </Button>
                </Box>

                <Typography
                    variant={isMobile ? "h4" : "h2"}
                    component="h1"
                    sx={{
                        mb: 2,
                        color: categoryInfo?.color || 'primary.main',
                        fontWeight: 700
                    }}
                >
                    {categoryInfo?.icon} {categoryInfo?.displayName}
                </Typography>

                <Typography variant="h4" component="h2" sx={{ mb: 3 }}>
                    利用者を選んでください
                </Typography>

                {/* 料金情報 */}
                <Typography
                    variant="h5"
                    sx={{
                        mb: 2,
                        color: categoryInfo?.color,
                        fontWeight: 600
                    }}
                >
                    {categoryInfo?.price === 0 ? '無料' : `${categoryInfo?.price}円/食`}
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

                {/* カテゴリ内統計 */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <Chip
                        label={`登録済み: ${categoryUsers.length}人`}
                        sx={{
                            backgroundColor: categoryInfo?.color || 'primary.main',
                            color: 'white',
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            px: 2,
                            py: 1,
                        }}
                    />
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
                            fontSize: '1.2rem',
                            minHeight: '60px',
                            borderRadius: '12px',
                        },
                        '& .MuiInputLabel-root': {
                            fontSize: '1.1rem',
                        },
                    }}
                />
            </Box>

            {/* 利用者リスト */}
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fill, minmax(300px, 1fr))' } }}>
                {filteredUsers.map((user) => {
                    const status = getUserStatus(user);
                    const hasRecord = todayRecords.some(r => r.userId === user.id);
                    const record = todayRecords.find(r => r.userId === user.id);

                    return (
                        <Card
                            key={user.id}
                            sx={{
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                border: `2px solid ${status === 'rated' ? 'success.main' : status === 'ordered' ? 'warning.main' : 'grey.300'}`,
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 4,
                                },
                                borderRadius: '16px',
                            }}
                            onClick={() => handleUserSelectForOrder(user)}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar
                                        sx={{
                                            width: 60,
                                            height: 60,
                                            fontSize: '1.5rem',
                                            backgroundColor: categoryInfo?.color || 'primary.main',
                                            mr: 2,
                                        }}
                                    >
                                        <PersonIcon sx={{ fontSize: '2rem' }} />
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
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
                                            {getUserDisplayName(user)}  {/* 番号付きの名前表示 */}
                                        </Typography>
                                        <Chip
                                            label={categoryInfo?.displayName || '未分類'}
                                            size="small"
                                            sx={{
                                                backgroundColor: categoryInfo?.color || 'grey.500',
                                                color: 'white',
                                                fontWeight: 600,
                                            }}
                                        />
                                    </Box>
                                </Box>

                                {/* 状態表示 */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Chip
                                        icon={status === 'rated' ? <CheckCircleIcon /> : status === 'ordered' ? <StarIcon /> : <RestaurantIcon />}
                                        label={
                                            status === 'rated' ? '評価済み' :
                                                status === 'ordered' ? '注文済み' : '未注文'
                                        }
                                        color={
                                            status === 'rated' ? 'success' :
                                                status === 'ordered' ? 'warning' : 'default'
                                        }
                                        sx={{ fontWeight: 600 }}
                                    />
                                    {hasRecord && record && (
                                        <Typography variant="body2" color="text.secondary">
                                            評価: {record.rating}/10
                                        </Typography>
                                    )}
                                </Box>

                                {/* 料金表示 */}
                                <Typography
                                    variant="body1"
                                    sx={{
                                        fontWeight: 600,
                                        color: categoryInfo?.color || 'text.primary',
                                        textAlign: 'right'
                                    }}
                                >
                                    {user.price === 0 ? '無料' : `${user.price}円`}
                                </Typography>
                            </CardContent>
                        </Card>
                    );
                })}
            </Box>

            {/* 利用者が見つからない場合 */}
            {filteredUsers.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Alert severity="info" sx={{ fontSize: '1.1rem', py: 2 }}>
                        {searchTerm ? '検索条件に一致する利用者が見つかりません' : 'このカテゴリに登録された利用者がいません'}
                    </Alert>
                </Box>
            )}

            {/* 管理画面アクセスボタン */}
            <Fab
                color="secondary"
                onClick={handleAddUser}
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    width: 64,
                    height: 64,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    '&:hover': {
                        transform: 'scale(1.1)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                aria-label="管理画面"
            >
                <SettingsIcon sx={{ fontSize: '2rem' }} />
            </Fab>

            {/* ヘルプボタン */}
            <HelpButton />
        </Container>
    );
};

export default UserSelector; 