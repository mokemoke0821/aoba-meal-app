import {
    ArrowBack as ArrowBackIcon,
    Check as CheckIcon,
    Person as PersonIcon,
    Restaurant as RestaurantIcon,
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
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { GROUP_COLORS } from '../types';

const MealOrder: React.FC = () => {
    const { state, navigateToView, getTodayMealRecords } = useApp();
    const [confirmOpen, setConfirmOpen] = useState(false);

    const selectedUser = state.selectedUser;
    const currentMenu = state.currentMenu;
    const todayRecords = getTodayMealRecords();

    // 選択されたユーザーが今日既に食事をしているかチェック
    const hasOrderedToday = selectedUser
        ? todayRecords.some(record => record.userId === selectedUser.id)
        : false;

    // 戻るボタンハンドラー
    const handleBack = () => {
        navigateToView('userSelect');
    };

    // 給食注文確認ダイアログ表示
    const handleOrderConfirm = () => {
        setConfirmOpen(true);
    };

    // 給食注文実行
    const handleOrderExecute = () => {
        if (selectedUser) {
            // 仮の評価値（後で評価画面で正しい値を入力）
            navigateToView('rating');
        }
        setConfirmOpen(false);
    };

    // 確認ダイアログのキャンセル
    const handleConfirmCancel = () => {
        setConfirmOpen(false);
    };

    // ユーザーが選択されていない場合
    if (!selectedUser) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ fontSize: '1.25rem', textAlign: 'center' }}>
                    利用者が選択されていません。最初の画面に戻ります。
                </Alert>
            </Container>
        );
    }

    const today = format(new Date(), 'yyyy年MM月dd日（EEEE）', { locale: ja });

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* ヘッダー */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h3" component="h1" sx={{ mb: 2, color: 'primary.main' }}>
                    🍱 給食注文
                </Typography>
                <Typography variant="h5" component="h2" sx={{ color: 'text.secondary' }}>
                    {today}
                </Typography>
            </Box>

            {/* 利用者情報カード */}
            <Card
                sx={{
                    mb: 4,
                    border: `3px solid ${GROUP_COLORS[selectedUser.group]}`,
                    borderRadius: '16px',
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar
                            sx={{
                                width: 80,
                                height: 80,
                                bgcolor: GROUP_COLORS[selectedUser.group],
                                mr: 3,
                            }}
                        >
                            <PersonIcon sx={{ fontSize: '3rem' }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h3" component="h3" sx={{ fontWeight: 700, mb: 1 }}>
                                {selectedUser.name} さん
                            </Typography>
                            <Chip
                                label={selectedUser.group}
                                sx={{
                                    backgroundColor: GROUP_COLORS[selectedUser.group],
                                    color: 'white',
                                    fontSize: '1.2rem',
                                    fontWeight: 600,
                                    px: 2,
                                    py: 1,
                                }}
                            />
                        </Box>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                            給食料金
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            ¥{selectedUser.price}
                        </Typography>
                    </Box>
                </CardContent>
            </Card>

            {/* 今日のメニューカード */}
            {currentMenu ? (
                <Card sx={{ mb: 4, borderRadius: '16px' }}>
                    <CardContent sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <RestaurantIcon sx={{ fontSize: '3rem', color: 'primary.main', mr: 2 }} />
                            <Typography variant="h4" component="h3" sx={{ fontWeight: 700 }}>
                                今日のメニュー
                            </Typography>
                        </Box>

                        <Typography variant="h3" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                            {currentMenu.name}
                        </Typography>

                        {currentMenu.description && (
                            <Typography variant="h5" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                                {currentMenu.description}
                            </Typography>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Alert severity="warning" sx={{ mb: 4, fontSize: '1.25rem', textAlign: 'center' }}>
                    今日のメニューが設定されていません
                </Alert>
            )}

            {/* 既に注文済みの場合の警告 */}
            {hasOrderedToday && (
                <Alert severity="info" sx={{ mb: 4, fontSize: '1.25rem', textAlign: 'center' }}>
                    {selectedUser.name}さんは今日既に給食を注文されています
                </Alert>
            )}

            {/* アクションボタン */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* 给食注文ボタン */}
                <Button
                    variant="contained"
                    size="large"
                    onClick={handleOrderConfirm}
                    disabled={!currentMenu}
                    sx={{
                        minHeight: '120px',
                        fontSize: '2rem',
                        fontWeight: 700,
                        borderRadius: '16px',
                        backgroundColor: hasOrderedToday ? 'warning.main' : 'primary.main',
                        '&:hover': {
                            backgroundColor: hasOrderedToday ? 'warning.dark' : 'primary.dark',
                        },
                    }}
                    startIcon={<RestaurantIcon sx={{ fontSize: '2.5rem' }} />}
                >
                    {hasOrderedToday ? '再度給食を食べる' : '給食を食べる'}
                </Button>

                {/* 戻るボタン */}
                <Button
                    variant="outlined"
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

            {/* 確認ダイアログ */}
            <Dialog
                open={confirmOpen}
                onClose={handleConfirmCancel}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        p: 2,
                    },
                }}
            >
                <DialogTitle sx={{ textAlign: 'center', fontSize: '1.75rem', fontWeight: 700 }}>
                    給食注文の確認
                </DialogTitle>

                <DialogContent sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="h5" sx={{ mb: 3 }}>
                        以下の内容で給食を注文しますか？
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                            {selectedUser.name} さん
                        </Typography>
                        <Chip
                            label={selectedUser.group}
                            sx={{
                                backgroundColor: GROUP_COLORS[selectedUser.group],
                                color: 'white',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                mb: 2,
                            }}
                        />
                        <Typography variant="h5" sx={{ color: 'text.secondary' }}>
                            料金: ¥{selectedUser.price}
                        </Typography>
                    </Box>

                    {currentMenu && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                                メニュー: {currentMenu.name}
                            </Typography>
                        </Box>
                    )}

                    {hasOrderedToday && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            この利用者は今日既に給食を注文されています
                        </Alert>
                    )}
                </DialogContent>

                <DialogActions sx={{ justifyContent: 'center', gap: 2, p: 3 }}>
                    <Button
                        onClick={handleConfirmCancel}
                        variant="outlined"
                        size="large"
                        sx={{
                            fontSize: '1.25rem',
                            fontWeight: 600,
                            px: 4,
                            py: 2,
                        }}
                    >
                        キャンセル
                    </Button>
                    <Button
                        onClick={handleOrderExecute}
                        variant="contained"
                        size="large"
                        sx={{
                            fontSize: '1.25rem',
                            fontWeight: 600,
                            px: 4,
                            py: 2,
                        }}
                        startIcon={<CheckIcon />}
                    >
                        注文する
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default MealOrder; 