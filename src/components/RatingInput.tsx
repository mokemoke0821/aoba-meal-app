import {
    Home as HomeIcon,
    ThumbUp as ThumbUpIcon,
} from '@mui/icons-material';
import {
    Avatar,
    Box,
    Button,
    ButtonBase,
    Card,
    CardContent,
    Chip,
    Container,
    Dialog,
    DialogContent,
    Grid,
    Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { GROUP_COLORS, RATING_EMOJIS } from '../types';

const RatingInput: React.FC = () => {
    const { state, addMealRecord, navigateToView } = useApp();
    const [selectedRating, setSelectedRating] = useState<number | null>(null);
    const [showThankYou, setShowThankYou] = useState(false);

    const selectedUser = state.selectedUser;

    // 評価選択ハンドラー
    const handleRatingSelect = (rating: number) => {
        setSelectedRating(rating);
    };

    // 評価送信ハンドラー
    const handleSubmit = async () => {
        if (selectedRating && selectedUser) {
            // 給食記録を追加
            addMealRecord(selectedUser.id, selectedRating);

            // ありがとうメッセージを表示
            setShowThankYou(true);

            // 3秒後に利用者選択画面に戻る
            setTimeout(() => {
                setShowThankYou(false);
                navigateToView('userSelect');
            }, 3000);
        }
    };

    // トップに戻るハンドラー
    const handleBackToHome = () => {
        navigateToView('userSelect');
    };

    // ユーザーが選択されていない場合
    if (!selectedUser) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Typography variant="h4" sx={{ textAlign: 'center', color: 'error.main' }}>
                    利用者が選択されていません
                </Typography>
            </Container>
        );
    }

    // 評価ボタンの生成
    const renderRatingButtons = () => {
        const buttons = [];
        for (let i = 1; i <= 10; i++) {
            const emoji = RATING_EMOJIS[i as keyof typeof RATING_EMOJIS];
            const isSelected = selectedRating === i;

            buttons.push(
                <Grid item xs={6} sm={4} md={3} key={i}>
                    <ButtonBase
                        onClick={() => handleRatingSelect(i)}
                        sx={{
                            width: '100%',
                            minHeight: '120px',
                            borderRadius: '16px',
                            border: isSelected ? '4px solid' : '2px solid',
                            borderColor: isSelected ? 'primary.main' : 'grey.300',
                            backgroundColor: isSelected ? 'primary.light' : 'background.paper',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'scale(1.05)',
                                borderColor: 'primary.main',
                                backgroundColor: 'primary.light',
                            },
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 2,
                        }}
                        aria-label={`評価 ${i}点`}
                    >
                        <Typography
                            sx={{
                                fontSize: '3rem',
                                mb: 1,
                            }}
                        >
                            {emoji}
                        </Typography>
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 700,
                                color: isSelected ? 'primary.main' : 'text.primary',
                            }}
                        >
                            {i}
                        </Typography>
                    </ButtonBase>
                </Grid>
            );
        }
        return buttons;
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* ヘッダー */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h2" component="h1" sx={{ mb: 2, color: 'primary.main' }}>
                    🍱 給食の評価
                </Typography>
                <Typography variant="h4" component="h2" sx={{ mb: 3 }}>
                    今日の給食はいかがでしたか？
                </Typography>
            </Box>

            {/* 利用者情報表示 */}
            <Card
                sx={{
                    mb: 4,
                    border: `3px solid ${GROUP_COLORS[selectedUser.group]}`,
                    borderRadius: '16px',
                }}
            >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                        <Avatar
                            sx={{
                                width: 60,
                                height: 60,
                                bgcolor: GROUP_COLORS[selectedUser.group],
                                mr: 2,
                            }}
                        >
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                {selectedUser.name.charAt(0)}
                            </Typography>
                        </Avatar>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                                {selectedUser.name} さん
                            </Typography>
                            <Chip
                                label={selectedUser.group}
                                sx={{
                                    backgroundColor: GROUP_COLORS[selectedUser.group],
                                    color: 'white',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                }}
                            />
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* 評価説明 */}
            <Card sx={{ mb: 4, borderRadius: '16px', backgroundColor: 'info.light' }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                        評価の説明
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '2rem' }}>😢</Typography>
                            <Typography variant="body2">1-2点<br />美味しくない</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '2rem' }}>😞</Typography>
                            <Typography variant="body2">3-4点<br />あまり美味しくない</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '2rem' }}>😐</Typography>
                            <Typography variant="body2">5-6点<br />普通</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '2rem' }}>😊</Typography>
                            <Typography variant="body2">7-8点<br />美味しい</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '2rem' }}>😍</Typography>
                            <Typography variant="body2">9-10点<br />とても美味しい</Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* 評価ボタン */}
            <Card sx={{ mb: 4, borderRadius: '16px' }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h4" sx={{ textAlign: 'center', mb: 3, fontWeight: 600 }}>
                        評価を選んでください
                    </Typography>
                    <Grid container spacing={2}>
                        {renderRatingButtons()}
                    </Grid>
                </CardContent>
            </Card>

            {/* 送信ボタン */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Button
                    variant="contained"
                    size="large"
                    onClick={handleSubmit}
                    disabled={selectedRating === null}
                    sx={{
                        minHeight: '100px',
                        fontSize: '1.75rem',
                        fontWeight: 700,
                        borderRadius: '16px',
                        backgroundColor: selectedRating ? 'success.main' : 'grey.400',
                        '&:hover': {
                            backgroundColor: selectedRating ? 'success.dark' : 'grey.500',
                        },
                    }}
                    startIcon={<ThumbUpIcon sx={{ fontSize: '2rem' }} />}
                >
                    {selectedRating ? `評価 ${selectedRating}点 で送信` : '評価を選んでください'}
                </Button>

                <Button
                    variant="outlined"
                    size="large"
                    onClick={handleBackToHome}
                    sx={{
                        minHeight: '80px',
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        borderRadius: '12px',
                    }}
                    startIcon={<HomeIcon sx={{ fontSize: '2rem' }} />}
                >
                    最初に戻る
                </Button>
            </Box>

            {/* ありがとうメッセージダイアログ */}
            <Dialog
                open={showThankYou}
                PaperProps={{
                    sx: {
                        borderRadius: '24px',
                        p: 4,
                        textAlign: 'center',
                        minWidth: '400px',
                    },
                }}
            >
                <DialogContent sx={{ p: 4 }}>
                    <Typography
                        sx={{
                            fontSize: '6rem',
                            mb: 3,
                        }}
                    >
                        🎉
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: 'success.main' }}>
                        ありがとうございました！
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
                        {selectedUser.name} さん
                    </Typography>
                    <Typography variant="h5" sx={{ color: 'text.secondary', mb: 3 }}>
                        評価: {selectedRating}点 {selectedRating && RATING_EMOJIS[selectedRating as keyof typeof RATING_EMOJIS]}
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                        自動的に最初の画面に戻ります...
                    </Typography>
                </DialogContent>
            </Dialog>
        </Container>
    );
};

export default RatingInput; 