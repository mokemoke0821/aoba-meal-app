import {
    Engineering as EngineeringIcon,
    Factory as FactoryIcon,
    Group as GroupIcon,
    LocalFlorist as LocalFloristIcon,
    Settings as SettingsIcon
} from '@mui/icons-material';
import {
    alpha,
    Box,
    Card,
    CardContent,
    Container,
    Fab,
    Grid,
    Typography,
    useMediaQuery,
    useTheme,
    Zoom
} from '@mui/material';
import React from 'react';
import { useApp } from '../contexts/AppContext';
import { CATEGORY_CONFIG, getCategoryInfo, UserCategory } from '../types';

// カテゴリアイコンマッピング
const CATEGORY_ICONS: Record<UserCategory, React.ReactElement> = {
    'A型': <FactoryIcon sx={{ fontSize: '4rem' }} />,
    'B型': <EngineeringIcon sx={{ fontSize: '4rem' }} />,
    '体験者': <LocalFloristIcon sx={{ fontSize: '4rem' }} />,
    '職員': <GroupIcon sx={{ fontSize: '4rem' }} />
};

interface CategoryCardProps {
    category: UserCategory;
    userCount: number;
    onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, userCount, onClick }) => {
    const theme = useTheme();
    const categoryInfo = getCategoryInfo(category);

    return (
        <Zoom in timeout={500}>
            <Card
                onClick={onClick}
                sx={{
                    height: '200px',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    borderRadius: '20px',
                    border: `3px solid ${alpha(categoryInfo.color, 0.3)}`,
                    background: `linear-gradient(135deg, ${alpha(categoryInfo.color, 0.05)} 0%, ${alpha(categoryInfo.color, 0.15)} 100%)`,
                    '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 12px 40px ${alpha(categoryInfo.color, 0.4)}`,
                        border: `3px solid ${categoryInfo.color}`,
                        background: `linear-gradient(135deg, ${alpha(categoryInfo.color, 0.1)} 0%, ${alpha(categoryInfo.color, 0.25)} 100%)`,
                    },
                    '&:active': {
                        transform: 'translateY(-4px)',
                    }
                }}
            >
                <CardContent
                    sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        p: 3
                    }}
                >
                    <Box
                        sx={{
                            color: categoryInfo.color,
                            mb: 2,
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                                transform: 'scale(1.1)'
                            }
                        }}
                    >
                        {CATEGORY_ICONS[category]}
                    </Box>

                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            color: categoryInfo.color,
                            mb: 1,
                            fontSize: { xs: '1.2rem', sm: '1.5rem' }
                        }}
                    >
                        {categoryInfo.displayName}
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            fontSize: '0.9rem',
                            fontWeight: 500
                        }}
                    >
                        {userCount}名 登録済み
                    </Typography>

                    <Typography
                        variant="caption"
                        sx={{
                            mt: 1,
                            color: categoryInfo.color,
                            fontWeight: 600,
                            opacity: 0.8
                        }}
                    >
                        {categoryInfo.price === 0 ? '無料' : `${categoryInfo.price}円/食`}
                    </Typography>
                </CardContent>
            </Card>
        </Zoom>
    );
};

const CategorySelector: React.FC = () => {
    const { state, dispatch } = useApp();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // カテゴリ別利用者数を計算
    const getUserCountByCategory = (category: UserCategory): number => {
        return state.users.filter(user => user.category === category).length;
    };

    const handleCategorySelect = (category: UserCategory) => {
        dispatch({ type: 'SET_SELECTED_CATEGORY', payload: category });
        dispatch({ type: 'SET_CURRENT_VIEW', payload: 'userSelect' });
    };

    const handleAdminAccess = () => {
        dispatch({ type: 'SET_CURRENT_VIEW', payload: 'admin' });
    };

    return (
        <Container maxWidth="md" sx={{ py: 4, minHeight: '100vh' }}>
            {/* ヘッダー */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography
                    variant={isMobile ? 'h4' : 'h3'}
                    sx={{
                        fontWeight: 800,
                        background: 'linear-gradient(45deg, #1976d2 30%, #2e7d32 90%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                        mb: 2
                    }}
                >
                    🍽️ あおば給食管理
                </Typography>

                <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{
                        fontWeight: 500,
                        opacity: 0.8
                    }}
                >
                    利用者区分を選択してください
                </Typography>
            </Box>

            {/* カテゴリグリッド（2x2） */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {Object.values(CATEGORY_CONFIG).map((categoryInfo) => (
                    // @ts-ignore
                    <Grid item xs={6} key={categoryInfo.id}>
                        <CategoryCard
                            category={categoryInfo.id}
                            userCount={getUserCountByCategory(categoryInfo.id)}
                            onClick={() => handleCategorySelect(categoryInfo.id)}
                        />
                    </Grid>
                ))}
            </Grid>

            {/* 統計情報 */}
            <Box
                sx={{
                    textAlign: 'center',
                    p: 3,
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    borderRadius: '16px',
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    mb: 4
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    📊 本日の状況
                </Typography>

                <Typography variant="body1" color="text.secondary">
                    総利用者数: <strong>{state.users.length}名</strong> /
                    本日の注文: <strong>
                        {state.mealRecords.filter(record =>
                            record.date === new Date().toISOString().split('T')[0]
                        ).length}件
                    </strong>
                </Typography>
            </Box>

            {/* 管理画面アクセスボタン */}
            <Fab
                color="secondary"
                onClick={handleAdminAccess}
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

            {/* フッター情報 */}
            <Box
                sx={{
                    textAlign: 'center',
                    mt: 6,
                    pt: 3,
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}
            >
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                        display: 'block',
                        opacity: 0.6,
                        fontSize: '0.75rem'
                    }}
                >
                    あおば就労移行支援事業所 給食管理システム v2.0
                </Typography>

                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                        display: 'block',
                        opacity: 0.6,
                        fontSize: '0.75rem',
                        mt: 0.5
                    }}
                >
                    {new Date().toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long'
                    })}
                </Typography>
            </Box>
        </Container>
    );
};

export default CategorySelector; 