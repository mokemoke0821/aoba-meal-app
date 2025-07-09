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
import { getCategoryInfo } from '../types';
import BackButton from './common/BackButton';

const UserSelector: React.FC = () => {
    const { state, dispatch } = useApp();

    const handleBackToCategory = () => {
        dispatch({ type: 'SET_SELECTED_CATEGORY', payload: null });
        dispatch({ type: 'SET_VIEW', payload: 'categorySelect' });
    };

    const handleUserSelect = (userId: string) => {
        const user = state.users.find(u => u.id === userId);
        if (user) {
            dispatch({ type: 'SET_SELECTED_USER', payload: user });
            dispatch({ type: 'SET_VIEW', payload: 'mealOrder' });
        }
    };

    const categoryInfo = state.selectedCategory ? getCategoryInfo(state.selectedCategory) : null;
    const categoryUsers = state.users.filter(user =>
        state.selectedCategory && user.category === state.selectedCategory
    );

    if (!state.selectedCategory || !categoryInfo) {
        return (
            <Container maxWidth="md">
                <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="h5">カテゴリが選択されていません</Typography>
                    <Button
                        variant="contained"
                        onClick={handleBackToCategory}
                        sx={{ mt: 2 }}
                    >
                        カテゴリ選択に戻る
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <Box sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <BackButton 
                        text="← カテゴリ選択に戻る"
                        onClick={handleBackToCategory}
                        sx={{ position: 'relative', margin: 0, mr: 2 }}
                        aria-label="カテゴリ選択に戻る"
                    />
                    <Typography variant="h4" component="h1">
                        {categoryInfo.icon} {categoryInfo.displayName}
                    </Typography>
                </Box>

                <Typography variant="h6" gutterBottom color="text.secondary">
                    利用者を選択してください
                </Typography>

                {categoryUsers.length === 0 ? (
                    <Card sx={{ mt: 4, p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom>
                            登録された利用者がいません
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            管理者メニューから利用者を登録してください
                        </Typography>
                        <Button
                            variant="outlined"
                            sx={{ mt: 2 }}
                            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'adminPanel' })}
                        >
                            管理者メニューへ
                        </Button>
                    </Card>
                ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2, mt: 2 }}>
                        {categoryUsers.map((user) => (
                            <Card
                                key={user.id}
                                sx={{
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: 3,
                                    }
                                }}
                                onClick={() => handleUserSelect(user.id)}
                            >
                                <CardContent>
                                    <Typography variant="h6" component="h3">
                                        {user.displayNumber}. {user.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {user.group}
                                    </Typography>
                                    <Typography variant="body2" color="primary">
                                        料金: {user.price}円
                                    </Typography>
                                    {user.trialUser && (
                                        <Typography variant="caption" color="secondary">
                                            体験利用
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                )}

                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Button
                        variant="outlined"
                        onClick={() => dispatch({ type: 'SET_VIEW', payload: 'adminPanel' })}
                    >
                        管理者メニュー
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default UserSelector; 