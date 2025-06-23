import {
    ArrowBack as ArrowBackIcon,
    Delete as DeleteIcon,
    Download as DownloadIcon,
    Edit as EditIcon,
    Group as GroupIcon,
    Save as SaveIcon,
    Security as SecurityIcon,
    Storage as StorageIcon,
    Upload as UploadIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon
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
    FormControlLabel,
    IconButton,
    InputAdornment,
    Paper,
    Snackbar,
    Switch,
    TextField,
    Typography
} from '@mui/material';
import { saveAs } from 'file-saver';
import React, { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Group } from '../types';

interface SettingsPageProps {
    onBack: () => void;
    onUpdateSettings: (settings: any) => void;
    onExportData: () => string;
    onImportData: (data: string) => void;
    onClearData: () => void;
}

interface GroupSettings {
    name: string;
    color: string;
    enabled: boolean;
}

interface AppSettings {
    groups: {
        [key in Group]: GroupSettings;
    };
    adminPassword: string;
    autoBackup: boolean;
    showInactiveUsers: boolean;
    defaultMealPrice: number;
    facilityName: string;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
    onBack,
    onUpdateSettings,
    onExportData,
    onImportData,
    onClearData
}) => {
    const { clearAllData } = useApp();
    const [settings, setSettings] = useState<AppSettings>({
        groups: {
            'グループA': { name: 'A型', color: '#1976d2', enabled: true },
            'グループB': { name: 'B型', color: '#2e7d32', enabled: true },
            'グループC': { name: '職員', color: '#f57c00', enabled: true },
            'その他': { name: '体験者', color: '#9c27b0', enabled: true }
        },
        adminPassword: '1234',
        autoBackup: true,
        showInactiveUsers: false,
        defaultMealPrice: 400,
        facilityName: 'あおば就労移行支援事業所'
    });

    const [editingGroup, setEditingGroup] = useState<Group | null>(null);
    const [groupDialog, setGroupDialog] = useState(false);
    const [tempGroupName, setTempGroupName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error' | 'info'
    });

    // 設定の読み込み
    useEffect(() => {
        const savedSettings = localStorage.getItem('aobaSettings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setSettings(prevSettings => ({ ...prevSettings, ...parsed }));
            } catch (error) {
                console.error('設定の読み込みに失敗しました:', error);
            }
        }
    }, []);

    // 設定の保存
    const handleSaveSettings = () => {
        try {
            localStorage.setItem('aobaSettings', JSON.stringify(settings));
            onUpdateSettings(settings);
            setSnackbar({ open: true, message: '設定を保存しました', severity: 'success' });
        } catch (error) {
            setSnackbar({ open: true, message: '設定の保存に失敗しました', severity: 'error' });
        }
    };

    // グループ名編集
    const handleEditGroup = (groupKey: Group) => {
        setEditingGroup(groupKey);
        setTempGroupName(settings.groups[groupKey].name);
        setGroupDialog(true);
    };

    const handleSaveGroup = () => {
        if (!editingGroup || !tempGroupName.trim()) return;

        const newSettings = {
            ...settings,
            groups: {
                ...settings.groups,
                [editingGroup]: {
                    ...settings.groups[editingGroup],
                    name: tempGroupName.trim()
                }
            }
        };
        setSettings(newSettings);
        setGroupDialog(false);
        setEditingGroup(null);

        setSnackbar({ open: true, message: `${tempGroupName}の設定を更新しました`, severity: 'success' });
    };

    // データエクスポート
    const handleExportData = () => {
        try {
            const dataStr = onExportData();
            const blob = new Blob([dataStr], { type: 'application/json' });
            saveAs(blob, `aoba-backup-${new Date().toISOString().split('T')[0]}.json`);

            setSnackbar({ open: true, message: 'データをエクスポートしました', severity: 'success' });
        } catch (error) {
            setSnackbar({ open: true, message: 'エクスポートに失敗しました', severity: 'error' });
        }
    };

    // データインポート
    const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const dataStr = e.target?.result as string;
                onImportData(dataStr);

                setSnackbar({ open: true, message: 'データをインポートしました', severity: 'success' });
            } catch (error) {
                setSnackbar({ open: true, message: 'インポートに失敗しました', severity: 'error' });
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const handleClearData = () => {
        clearAllData();
        setSnackbar({ open: true, message: 'すべてのデータが正常に初期化されました。', severity: 'info' });
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, overflow: 'hidden' }}>
                {/* ヘッダー */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h3" component="h1" sx={{ color: 'primary.main', fontWeight: 700 }}>
                        ⚙️ システム設定
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<ArrowBackIcon />}
                        onClick={onBack}
                        size="large"
                        sx={{ borderRadius: '12px', px: 3 }}
                    >
                        管理画面に戻る
                    </Button>
                </Box>

                {/* グループ設定 */}
                <Card sx={{ borderRadius: '16px', mb: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <GroupIcon color="primary" />
                            グループ名設定
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {Object.entries(settings.groups).map(([key, group]) => (
                                <Box
                                    key={key}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        p: 2,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: '8px'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box
                                            sx={{
                                                width: 24,
                                                height: 24,
                                                borderRadius: '50%',
                                                backgroundColor: group.color
                                            }}
                                        />
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                            {group.name}
                                        </Typography>
                                    </Box>
                                    <IconButton
                                        onClick={() => handleEditGroup(key as Group)}
                                        size="small"
                                        color="primary"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
                    </CardContent>
                </Card>

                {/* 基本設定 */}
                <Card sx={{ borderRadius: '16px', mb: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SecurityIcon color="primary" />
                            基本設定
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <TextField
                                label="事業所名"
                                value={settings.facilityName}
                                onChange={(e) => setSettings({ ...settings, facilityName: e.target.value })}
                                fullWidth
                            />

                            <TextField
                                label="管理画面パスワード"
                                type={showPassword ? 'text' : 'password'}
                                value={settings.adminPassword}
                                onChange={(e) => setSettings({ ...settings, adminPassword: e.target.value })}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                                fullWidth
                            />

                            <TextField
                                label="デフォルト給食料金"
                                type="number"
                                value={settings.defaultMealPrice}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    defaultMealPrice: parseInt(e.target.value) || 400
                                })}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">¥</InputAdornment>
                                }}
                                fullWidth
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.showInactiveUsers}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            showInactiveUsers: e.target.checked
                                        })}
                                    />
                                }
                                label="無効な利用者も表示"
                            />
                        </Box>
                    </CardContent>
                </Card>

                {/* データ管理 */}
                <Card sx={{ borderRadius: '16px', mb: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <StorageIcon color="primary" />
                            データ管理
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<DownloadIcon />}
                                onClick={handleExportData}
                                fullWidth
                                sx={{ justifyContent: 'flex-start', p: 2 }}
                            >
                                データをバックアップ
                            </Button>

                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<UploadIcon />}
                                fullWidth
                                sx={{ justifyContent: 'flex-start', p: 2 }}
                            >
                                データを復元
                                <input
                                    type="file"
                                    accept=".json"
                                    hidden
                                    onChange={handleImportData}
                                />
                            </Button>

                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={handleClearData}
                                fullWidth
                                sx={{ justifyContent: 'flex-start', p: 2 }}
                            >
                                すべてのデータをリセット
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                {/* 保存ボタン */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<SaveIcon />}
                        onClick={handleSaveSettings}
                        sx={{ borderRadius: '12px', px: 4, py: 1.5, fontSize: '1.1rem' }}
                    >
                        設定を保存
                    </Button>
                </Box>

                {/* グループ編集ダイアログ */}
                <Dialog open={groupDialog} onClose={() => setGroupDialog(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>グループ名編集</DialogTitle>
                    <DialogContent>
                        <Box sx={{ pt: 2 }}>
                            <TextField
                                label="グループ名"
                                value={tempGroupName}
                                onChange={(e) => setTempGroupName(e.target.value)}
                                fullWidth
                                autoFocus
                                placeholder="例: A型、B型、職員、体験者"
                            />

                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                💡 利用者に分かりやすい名前に変更できます
                            </Typography>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setGroupDialog(false)}>キャンセル</Button>
                        <Button
                            onClick={handleSaveGroup}
                            variant="contained"
                            disabled={!tempGroupName.trim()}
                        >
                            保存
                        </Button>
                    </DialogActions>
                </Dialog>
            </Paper>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    severity={snackbar.severity as any}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default SettingsPage; 