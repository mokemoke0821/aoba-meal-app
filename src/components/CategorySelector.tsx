import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Typography
} from '@mui/material';
import React from 'react';
import { useApp } from '../contexts/AppContext';
import { CATEGORY_CONFIG, UserCategory } from '../types';

const CategorySelector: React.FC = () => {
    const { dispatch } = useApp();

    const handleCategorySelect = (category: UserCategory) => {
        dispatch({ type: 'SET_SELECTED_CATEGORY', payload: category });
        dispatch({ type: 'SET_VIEW', payload: 'userSelect' });
    };

    const categories = Object.values(CATEGORY_CONFIG);

    return (
        <Container maxWidth="md">
            <Box sx={{ py: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom align="center">
                    あおば給食管理システム
                </Typography>
                <Typography variant="h5" component="h2" gutterBottom align="center" color="text.secondary">
                    利用者カテゴリを選択してください
                </Typography>

                {/* 利用案内メッセージ */}
                <Box sx={{ textAlign: 'center', mb: 4, mt: 2 }}>
                    <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                        👥 ご利用される方のカテゴリを選択してください
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        複数の利用者が連続してご利用いただけます
                    </Typography>
                </Box>

                {/* 1段目: A型利用者・B型利用者 */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" align="center" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                        🏢 就労継続支援事業
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                        {categories.filter(category => category.id === 'A型' || category.id === 'B型').map((category) => (
                            <Card
                                key={category.id}
                                sx={{
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4,
                                    }
                                }}
                                onClick={() => handleCategorySelect(category.id)}
                            >
                                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                    <Typography
                                        variant="h2"
                                        component="div"
                                        sx={{ fontSize: '3rem', mb: 2 }}
                                    >
                                        {category.icon}
                                    </Typography>
                                    <Typography variant="h6" component="h3" gutterBottom>
                                        {category.displayName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        料金: {category.price}円
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        sx={{
                                            backgroundColor: category.color,
                                            '&:hover': {
                                                backgroundColor: category.color,
                                                filter: 'brightness(0.9)',
                                            }
                                        }}
                                    >
                                        選択
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                </Box>

                {/* 2段目: 体験者・職員 */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" align="center" sx={{ mb: 2, color: 'secondary.main', fontWeight: 600 }}>
                        👥 体験利用・スタッフ
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                        {categories.filter(category => category.id === '体験者' || category.id === '職員').map((category) => (
                            <Card
                                key={category.id}
                                sx={{
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4,
                                    }
                                }}
                                onClick={() => handleCategorySelect(category.id)}
                            >
                                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                    <Typography
                                        variant="h2"
                                        component="div"
                                        sx={{ fontSize: '3rem', mb: 2 }}
                                    >
                                        {category.icon}
                                    </Typography>
                                    <Typography variant="h6" component="h3" gutterBottom>
                                        {category.displayName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        料金: {category.price}円
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        sx={{
                                            backgroundColor: category.color,
                                            '&:hover': {
                                                backgroundColor: category.color,
                                                filter: 'brightness(0.9)',
                                            }
                                        }}
                                    >
                                        選択
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                </Box>

                {/* 管理者メニュー */}
                <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid #e0e0e0' }}>
                    <Typography variant="h6" align="center" sx={{ mb: 2, color: 'text.secondary', fontWeight: 600 }}>
                        ⚙️ システム管理
                    </Typography>
                    <Box sx={{ textAlign: 'center' }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'adminPanel' })}
                            sx={{
                                backgroundColor: '#424242',
                                color: 'white',
                                px: 4,
                                py: 1.5,
                                fontSize: '1.1rem',
                                '&:hover': {
                                    backgroundColor: '#616161',
                                }
                            }}
                        >
                            🔐 管理者メニュー
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Container>
    );
};

export default CategorySelector; 