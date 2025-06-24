import {
    ArrowBack as ArrowBackIcon,
    ThumbUp as ThumbUpIcon,
} from '@mui/icons-material';
import {
    Alert,
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
    Typography
} from '@mui/material';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { GROUP_COLORS, RATING_EMOJIS, getGroupDisplayName } from '../types';

interface RatingInputProps {
    onBack?: () => void;
}

const RatingInput: React.FC<RatingInputProps> = ({ onBack }) => {
    const { state, dispatch } = useApp();
    const [rating, setRating] = useState<number>(5);
    const [showThankYou, setShowThankYou] = useState(false);

    const { selectedUser } = state;

    // 戻るボタンハンドラー
    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            dispatch({ type: 'SET_VIEW', payload: 'userSelect' });
        }
    };

    // 評価選択ハンドラー
    const handleRatingSelect = (rating: number) => {
        setRating(rating);
    };

    // 評価送信ハンドラー
    const handleSubmit = async () => {
        if (selectedUser) {
            // 既存の給食記録を更新（評価を追加）
            const todayRecords = state.mealRecords;
            const recordIndex = todayRecords.findIndex(
                record => record.userId === selectedUser.id &&
                    record.date === format(new Date(), 'yyyy-MM-dd')
            );

            if (recordIndex !== -1) {
                const updatedRecords = [...todayRecords];
                updatedRecords[recordIndex] = {
                    ...updatedRecords[recordIndex],
                    rating: rating
                };
                dispatch({ type: 'SET_MEAL_RECORDS', payload: updatedRecords });
            }

            // ありがとうメッセージを表示
            setShowThankYou(true);

            // 3秒後に利用者選択画面に戻る
            setTimeout(() => {
                setShowThankYou(false);
                handleBack();
            }, 3000);
        }
    };

    // ユーザーが選択されていない場合
    if (!selectedUser) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ fontSize: '1.25rem', textAlign: 'center', mb: 4 }}>
                    利用者が選択されていません。最初の画面に戻ります。
                </Alert>
                <Box sx={{ textAlign: 'center' }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleBack}
                        sx={{
                            minHeight: '80px',
                            fontSize: '1.5rem',
                            fontWeight: 600,
                            borderRadius: '12px',
                        }}
                        startIcon={<ArrowBackIcon sx={{ fontSize: '2rem' }} />}
                    >
                        利用者選択に戻る
                    </Button>
                </Box>
            </Container>
        );
    }

    // 評価ボタンの生成
    const renderRatingButtons = () => {
        const buttons = [];
        for (let i = 1; i <= 10; i++) {
            const emoji = RATING_EMOJIS[i as keyof typeof RATING_EMOJIS];
            const isSelected = rating === i;

            buttons.push(
                <ButtonBase
                    key={i}
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
            );
        }
        return buttons;
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* ヘッダー */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Button
                    variant="outlined"
                    onClick={handleBack}
                    sx={{ mr: 2 }}
                    startIcon={<ArrowBackIcon />}
                >
                    ← 戻る
                </Button>
                <Box>
                    <Typography variant="h3" component="h1" sx={{ color: 'primary.main' }}>
                        🍱 給食の評価
                    </Typography>
                    <Typography variant="h6" component="h2">
                        今日の給食はいかがでしたか？
                    </Typography>
                </Box>
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
                                label={getGroupDisplayName(selectedUser.group)}
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

            {/* 評価選択エリア */}
            <Card sx={{ mb: 4, borderRadius: '16px' }}>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" sx={{ textAlign: 'center', mb: 3, fontWeight: 600 }}>
                        評価を選んでください（1-10点）
                    </Typography>

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: 'repeat(2, 1fr)',
                                sm: 'repeat(5, 1fr)',
                                md: 'repeat(5, 1fr)',
                            },
                            gap: 2,
                            mb: 4,
                        }}
                    >
                        {renderRatingButtons()}
                    </Box>

                    {/* 選択された評価の表示 */}
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Typography variant="h4" sx={{ mb: 2 }}>
                            選択中: {RATING_EMOJIS[rating as keyof typeof RATING_EMOJIS]} {rating}点
                        </Typography>
                    </Box>

                    {/* 送信ボタン */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleSubmit}
                            sx={{
                                minHeight: '80px',
                                fontSize: '1.5rem',
                                fontWeight: 600,
                                borderRadius: '12px',
                                px: 6,
                            }}
                            startIcon={<ThumbUpIcon sx={{ fontSize: '2rem' }} />}
                        >
                            評価を送信
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* ありがとうダイアログ */}
            <Dialog
                open={showThankYou}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '20px',
                        p: 4,
                        textAlign: 'center',
                    },
                }}
            >
                <DialogContent sx={{ p: 6 }}>
                    <Typography variant="h2" sx={{ mb: 3 }}>
                        🎉
                    </Typography>
                    <Typography variant="h3" sx={{ mb: 2, fontWeight: 700, color: 'primary.main' }}>
                        ありがとうございました！
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 3, color: 'text.secondary' }}>
                        評価が送信されました
                    </Typography>
                    <Typography variant="h4" sx={{ mb: 2 }}>
                        {RATING_EMOJIS[rating as keyof typeof RATING_EMOJIS]} {rating}点
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        自動的に前の画面に戻ります...
                    </Typography>
                </DialogContent>
            </Dialog>
        </Container>
    );
};

export default RatingInput; 