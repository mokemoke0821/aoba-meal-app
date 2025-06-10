import {
    KeyboardArrowLeft as BackIcon,
    Close as CloseIcon,
    Help as HelpIcon,
    Home as HomeIcon,
    Settings as SettingsIcon
} from '@mui/icons-material';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Fab,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography
} from '@mui/material';
import React, { useState } from 'react';

const HelpButton: React.FC = () => {
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <>
            <Fab
                color="info"
                size="small"
                onClick={handleOpen}
                sx={{
                    position: 'fixed',
                    bottom: 32,
                    left: 32,
                    width: 56,
                    height: 56,
                    opacity: 0.8,
                    '&:hover': {
                        opacity: 1
                    }
                }}
                aria-label="ヘルプ"
            >
                <HelpIcon />
            </Fab>

            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                    }
                }}
            >
                <DialogTitle sx={{
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: 'primary.main'
                }}>
                    📱 あおば給食システム ヘルプ
                </DialogTitle>

                <DialogContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        🔄 画面間の移動方法
                    </Typography>

                    <List dense>
                        <ListItem>
                            <ListItemIcon>
                                <BackIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                                primary="戻るボタン"
                                secondary="各画面の右上や下部にある「戻る」ボタンで前の画面に移動"
                            />
                        </ListItem>

                        <ListItem>
                            <ListItemIcon>
                                <HomeIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                                primary="メイン画面に戻る"
                                secondary="管理画面から「メイン画面に戻る」ボタンで利用者選択に戻る"
                            />
                        </ListItem>

                        <ListItem>
                            <ListItemIcon>
                                <SettingsIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                                primary="管理画面アクセス"
                                secondary="メイン画面右下の設定ボタンから管理画面へ移動"
                            />
                        </ListItem>
                    </List>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        🎯 各画面の操作手順
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
                            1. 📋 利用者選択 → 🍱 給食注文 → ⭐ 評価入力
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            通常の給食利用の流れです
                        </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
                            2. 🛠️ 管理画面 → 👥 利用者管理・📊 統計・⚙️ 設定
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            管理者機能のアクセス方法
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                        🔐 管理画面パスワード: <strong>1234</strong>
                    </Typography>
                </DialogContent>

                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button
                        variant="contained"
                        onClick={handleClose}
                        startIcon={<CloseIcon />}
                        sx={{
                            minHeight: '50px',
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            borderRadius: '12px',
                            px: 4
                        }}
                    >
                        閉じる
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default HelpButton; 