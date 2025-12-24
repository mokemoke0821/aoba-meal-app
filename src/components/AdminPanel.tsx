import {
    Assessment as AssessmentIcon,
    Lock as LockIcon,
    People as PeopleIcon,
    Security as SecurityIcon,
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    Switch,
    TextField,
    Typography
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import {
    loadSecuritySettings,
    saveSecuritySettings,
    isValidPasscodeFormat,
    type SecuritySettings
} from '../utils/securitySettings';
import BackButton from './common/BackButton';

const AdminPanel: React.FC = () => {
    const { dispatch } = useApp();
    const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(loadSecuritySettings());
    const [passcodeDialogOpen, setPasscodeDialogOpen] = useState(false);
    const [newPasscode, setNewPasscode] = useState('');
    const [confirmPasscode, setConfirmPasscode] = useState('');
    const [passcodeError, setPasscodeError] = useState('');

    useEffect(() => {
        setSecuritySettings(loadSecuritySettings());
    }, []);

    const handleBackToHome = () => {
        dispatch({ type: 'SET_VIEW', payload: 'categorySelect' });
    };

    const handlePasscodeToggle = (enabled: boolean) => {
        if (enabled) {
            setPasscodeDialogOpen(true);
        } else {
            const newSettings: SecuritySettings = {
                ...securitySettings,
                passcodeEnabled: false,
                passcode: null
            };
            saveSecuritySettings(newSettings);
            setSecuritySettings(newSettings);
        }
    };

    const handlePasscodeDialogClose = () => {
        setPasscodeDialogOpen(false);
        setNewPasscode('');
        setConfirmPasscode('');
        setPasscodeError('');
    };

    const handlePasscodeSave = () => {
        setPasscodeError('');

        if (!isValidPasscodeFormat(newPasscode)) {
            setPasscodeError('4桁の数字を入力してください');
            return;
        }

        if (newPasscode !== confirmPasscode) {
            setPasscodeError('パスコードが一致しません');
            return;
        }

        const newSettings: SecuritySettings = {
            passcodeEnabled: true,
            passcode: newPasscode
        };
        saveSecuritySettings(newSettings);
        setSecuritySettings(newSettings);
        handlePasscodeDialogClose();
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

                {/* セキュリティ設定セクション */}
                <Box sx={{ mt: 6 }}>
                    <Divider sx={{ my: 4 }} />
                    <Card
                        sx={{
                            border: '2px solid',
                            borderColor: 'divider',
                            borderRadius: 2
                        }}
                    >
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="h6" component="h2">
                                    セキュリティ設定
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                管理者画面へのアクセスをパスコードで保護できます
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="body1" fontWeight="medium">
                                        管理者パスコードを有効にする
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                        {securitySettings.passcodeEnabled
                                            ? 'パスコード認証が有効です'
                                            : 'パスコード認証が無効です'}
                                    </Typography>
                                </Box>
                                <Switch
                                    checked={securitySettings.passcodeEnabled}
                                    onChange={(e) => handlePasscodeToggle(e.target.checked)}
                                    color="primary"
                                />
                            </Box>

                            {securitySettings.passcodeEnabled && (
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    パスコードが設定されています。管理者画面にアクセスする際に認証が必要です。
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </Box>

                <Box sx={{ mt: 6, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        シンプルな給食管理システム - 必要な機能のみに特化
                    </Typography>
                </Box>
            </Box>

            {/* パスコード設定ダイアログ */}
            <Dialog
                open={passcodeDialogOpen}
                onClose={handlePasscodeDialogClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LockIcon />
                        <Typography variant="h6">パスコード設定</Typography>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                        <TextField
                            label="パスコード（4桁の数字）"
                            type="password"
                            value={newPasscode}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                setNewPasscode(value);
                                setPasscodeError('');
                            }}
                            inputProps={{
                                maxLength: 4,
                                inputMode: 'numeric',
                                pattern: '[0-9]*'
                            }}
                            fullWidth
                            error={!!passcodeError}
                            helperText={passcodeError || '4桁の数字を入力してください'}
                            autoFocus
                        />
                        <TextField
                            label="パスコード確認"
                            type="password"
                            value={confirmPasscode}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                setConfirmPasscode(value);
                                setPasscodeError('');
                            }}
                            inputProps={{
                                maxLength: 4,
                                inputMode: 'numeric',
                                pattern: '[0-9]*'
                            }}
                            fullWidth
                            error={!!passcodeError && newPasscode !== confirmPasscode}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handlePasscodeDialogClose}>キャンセル</Button>
                    <Button
                        onClick={handlePasscodeSave}
                        variant="contained"
                        disabled={newPasscode.length !== 4 || confirmPasscode.length !== 4}
                    >
                        設定
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminPanel; 