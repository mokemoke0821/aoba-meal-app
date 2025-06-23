import SettingsIcon from '@mui/icons-material/Settings';
import {
    alpha,
    Box,
    Card,
    Container,
    Fab,
    Grid,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';
import { useApp } from '../contexts/AppContext';
import { CATEGORY_CONFIG, getCategoryInfo, UserCategory } from '../types';

interface CategoryCardProps {
    category: UserCategory;
    userCount: number;
    onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, userCount, onClick }) => {
    const categoryInfo = getCategoryInfo(category);
    const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));

    return (
        <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card
                onClick={onClick}
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    borderRadius: 4,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    border: `2px solid ${categoryInfo.color}`,
                    backgroundColor: alpha(categoryInfo.color, 0.05),
                    '&:hover': {
                        boxShadow: `0 8px 24px ${alpha(categoryInfo.color, 0.2)}`,
                        transform: 'translateY(-4px)',
                    },
                    transition: 'all 0.3s ease-in-out',
                    p: isMobile ? 2 : 3,
                }}
            >
                <Typography variant={isMobile ? "h3" : "h2"} sx={{ mb: 1 }}>
                    {categoryInfo.icon}
                </Typography>
                <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    {categoryInfo.displayName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {userCount}名
                </Typography>
            </Card>
        </motion.div>
    );
};

const CategorySelector: React.FC = () => {
    const { state, dispatch } = useApp();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const getUserCountByCategory = (category: UserCategory) => {
        return state.users.filter(user => user.category === category).length;
    };

    const handleCategorySelect = (category: UserCategory) => {
        dispatch({ type: 'SET_SELECTED_CATEGORY', payload: category });
        dispatch({ type: 'SET_CURRENT_VIEW', payload: 'userSelect' });
    };

    const handleAdminAccess = () => {
        dispatch({ type: 'SET_CURRENT_VIEW', payload: 'adminAuth' });
    };

    return (
        <Container maxWidth="md" sx={{ py: 4, minHeight: '100vh' }}>
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

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {Object.values(CATEGORY_CONFIG).map((categoryInfo) => (
                    <Grid xs={6} key={categoryInfo.id}>
                        <CategoryCard
                            category={categoryInfo.id}
                            userCount={getUserCountByCategory(categoryInfo.id)}
                            onClick={() => handleCategorySelect(categoryInfo.id)}
                        />
                    </Grid>
                ))}
            </Grid>

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