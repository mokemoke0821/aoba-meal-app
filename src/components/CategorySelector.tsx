import SettingsIcon from '@mui/icons-material/Settings';
import {
    Box,
    Card,
    CardContent,
    Container,
    Fab,
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
        <>
            {/* 管理者メニュー - 右上固定 */}
            <Fab
                color="primary"
                aria-label="settings"
                sx={{
                    position: 'fixed',
                    top: 16,
                    right: 16,
                    zIndex: 1000,
                    backgroundColor: '#424242',
                    '&:hover': {
                        backgroundColor: '#616161',
                    }
                }}
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'adminPanel' })}
            >
                <SettingsIcon />
            </Fab>

            <Container maxWidth="lg">
                <Box sx={{ py: 6 }}>
                    <Typography variant="h2" component="h1" gutterBottom align="center">
                        給食アプリ
                    </Typography>

                    {/* 1段目: A型利用者・B型利用者 */}
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 4 }}>
                            {categories.filter(category => category.id === 'A型' || category.id === 'B型').map((category) => (
                                <Card
                                    key={category.id}
                                    sx={{
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        border: '3px solid',
                                        borderColor: category.color,
                                        borderRadius: '16px',
                                        backgroundColor: `${category.color}15`,
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: 4,
                                            borderColor: category.color,
                                            backgroundColor: `${category.color}25`,
                                        }
                                    }}
                                    onClick={() => handleCategorySelect(category.id)}
                                >
                                    <CardContent sx={{ textAlign: 'center', p: 4 }}>
                                        <Typography
                                            variant="h2"
                                            component="div"
                                            sx={{ fontSize: '4rem', mb: 2 }}
                                        >
                                            {category.icon}
                                        </Typography>
                                        <Typography variant="h4" component="h3" gutterBottom sx={{ fontSize: '48px', fontWeight: 'bold' }}>
                                            {category.displayName}
                                        </Typography>
                                        <Typography variant="h6" color="text.secondary" sx={{ mb: 2, fontSize: '24px' }}>
                                            料金: {category.price}円
                                        </Typography>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    </Box>

                    {/* 2段目: 体験者・職員 */}
                    <Box sx={{ mb: 4 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 4 }}>
                            {categories.filter(category => category.id === '体験者' || category.id === '職員').map((category) => (
                                <Card
                                    key={category.id}
                                    sx={{
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        border: '3px solid',
                                        borderColor: category.color,
                                        borderRadius: '16px',
                                        backgroundColor: `${category.color}15`,
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: 4,
                                            borderColor: category.color,
                                            backgroundColor: `${category.color}25`,
                                        }
                                    }}
                                    onClick={() => handleCategorySelect(category.id)}
                                >
                                    <CardContent sx={{ textAlign: 'center', p: 4 }}>
                                        <Typography
                                            variant="h2"
                                            component="div"
                                            sx={{ fontSize: '4rem', mb: 2 }}
                                        >
                                            {category.icon}
                                        </Typography>
                                        <Typography variant="h4" component="h3" gutterBottom sx={{ fontSize: '48px', fontWeight: 'bold' }}>
                                            {category.displayName}
                                        </Typography>
                                        <Typography variant="h6" color="text.secondary" sx={{ mb: 2, fontSize: '24px' }}>
                                            料金: {category.price}円
                                        </Typography>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    </Box>

                </Box>
            </Container>
        </>
    );
};

export default CategorySelector; 