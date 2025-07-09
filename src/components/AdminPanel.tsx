import {
    Assessment as AssessmentIcon,
    People as PeopleIcon,
} from '@mui/icons-material';
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
import BackButton from './common/BackButton';

const AdminPanel: React.FC = () => {
    const { dispatch } = useApp();

    const handleBackToHome = () => {
        dispatch({ type: 'SET_VIEW', payload: 'categorySelect' });
    };

    const adminMenuItems = [
        {
            title: 'ユーザー管理',
            description: '利用者の登録・編集・削除',
            icon: <PeopleIcon sx={{ fontSize: '3rem' }} />,
            action: () => dispatch({ type: 'SET_VIEW', payload: 'userManagement' }),
            color: '#1976d2',
        },
        {
            title: '統計・データ管理',
            description: '給食利用状況・料金管理・データ出力',
            icon: <AssessmentIcon sx={{ fontSize: '3rem' }} />,
            action: () => dispatch({ type: 'SET_VIEW', payload: 'statistics' }),
            color: '#f57c00',
        },
    ];

    return (
        <Container maxWidth="md">
            <Box sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <BackButton 
                        text="← メイン画面に戻る"
                        onClick={handleBackToHome}
                        sx={{ position: 'relative', margin: 0, mr: 2 }}
                        aria-label="メイン画面に戻る"
                    />
                    <Typography variant="h4" component="h1">
                        管理者メニュー
                    </Typography>
                </Box>

                <Typography variant="h6" gutterBottom color="text.secondary">
                    管理機能を選択してください
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mt: 4 }}>
                    {adminMenuItems.map((item, index) => (
                        <Card
                            key={index}
                            sx={{
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 4,
                                }
                            }}
                            onClick={item.action}
                        >
                            <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                <Box sx={{ color: item.color, mb: 2 }}>
                                    {item.icon}
                                </Box>
                                <Typography variant="h6" component="h3" gutterBottom>
                                    {item.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {item.description}
                                </Typography>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    sx={{
                                        backgroundColor: item.color,
                                        '&:hover': {
                                            backgroundColor: item.color,
                                            filter: 'brightness(0.9)',
                                        }
                                    }}
                                >
                                    開く
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </Box>

                <Box sx={{ mt: 6, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        シンプルな給食管理システム - 必要な機能のみに特化
                    </Typography>
                </Box>
            </Box>
        </Container>
    );
};

export default AdminPanel; 