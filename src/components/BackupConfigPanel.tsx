import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Switch,
    FormControlLabel,
    RadioGroup,
    Radio,
    Button,
    Alert,
    Divider,
    Chip,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import BackupIcon from '@mui/icons-material/Backup';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
    loadBackupConfig,
    saveBackupConfig,
    saveBackupToCustomPath,
} from '../utils/storage';
import type { BackupConfig, BackupFrequency } from '../types';

interface BackupConfigPanelProps {
    onBackupCreated?: () => void;
}

const BackupConfigPanel: React.FC<BackupConfigPanelProps> = ({ onBackupCreated }) => {
    const [config, setConfig] = useState<BackupConfig>(loadBackupConfig());
    const [lastBackup, setLastBackup] = useState<string | null>(null);
    const [message, setMessage] = useState<string>('');
    const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');

    useEffect(() => {
        const savedConfig = loadBackupConfig();
        setConfig(savedConfig);
        setLastBackup(savedConfig.lastBackupTime);
    }, []);

    // バックアップ有効/無効切り替え
    const handleToggleEnabled = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newEnabled = event.target.checked;
        const newConfig = { ...config, enabled: newEnabled };
        setConfig(newConfig);
        saveBackupConfig(newConfig);
        showMessage(
            newEnabled ? 'バックアップを有効にしました' : 'バックアップを無効にしました',
            'success'
        );
    };

    // 頻度変更
    const handleFrequencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const minutes = parseInt(event.target.value, 10) as BackupFrequency;
        const newConfig = { ...config, frequency: minutes * 60 * 1000 };
        setConfig(newConfig);
        saveBackupConfig(newConfig);
        showMessage(`バックアップ頻度を ${minutes} 分に設定しました`, 'success');
    };

    // 手動バックアップ実行
    const handleManualBackup = async () => {
        try {
            setMessage('バックアップを作成中...');
            setMessageType('info');

            const filename = await saveBackupToCustomPath(config.customPath);

            // 設定を更新
            const updatedConfig = loadBackupConfig();
            setConfig(updatedConfig);
            setLastBackup(updatedConfig.lastBackupTime);

            showMessage(`バックアップを作成しました: ${filename}`, 'success');
            onBackupCreated?.();
        } catch (error) {
            console.error('手動バックアップ失敗:', error);
            showMessage('バックアップの作成に失敗しました', 'error');
        }
    };

    // メッセージ表示
    const showMessage = (msg: string, type: 'success' | 'error' | 'info') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 5000);
    };

    // 最終バックアップ時刻をフォーマット
    const formatLastBackupTime = (time: string | null): string => {
        if (!time) return 'まだバックアップが作成されていません';
        try {
            const date = new Date(time);
            return date.toLocaleString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
        } catch {
            return '不明';
        }
    };

    const currentFrequencyMinutes = (config.frequency / (60 * 1000)).toString();

    return (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
                <BackupIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">バックアップ設定</Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* メッセージ表示 */}
            {message && (
                <Alert severity={messageType} sx={{ mb: 2 }}>
                    {message}
                </Alert>
            )}

            {/* 有効/無効切り替え */}
            <FormControlLabel
                control={
                    <Switch
                        checked={config.enabled}
                        onChange={handleToggleEnabled}
                        color="primary"
                    />
                }
                label={
                    <Box display="flex" alignItems="center">
                        <Typography variant="body1">
                            自動バックアップを有効にする
                        </Typography>
                        {config.enabled && (
                            <Chip
                                label="有効"
                                color="success"
                                size="small"
                                icon={<CheckCircleIcon />}
                                sx={{ ml: 1 }}
                            />
                        )}
                    </Box>
                }
            />

            {/* 頻度設定 */}
            {config.enabled && (
                <Box mt={3}>
                    <Box display="flex" alignItems="center" mb={1}>
                        <ScheduleIcon sx={{ mr: 1, color: 'secondary.main' }} />
                        <Typography variant="body1" fontWeight="bold">
                            バックアップ頻度
                        </Typography>
                    </Box>
                    <RadioGroup
                        value={currentFrequencyMinutes}
                        onChange={handleFrequencyChange}
                    >
                        <FormControlLabel
                            value="5"
                            control={<Radio />}
                            label="5分ごと（頻繁）"
                        />
                        <FormControlLabel
                            value="10"
                            control={<Radio />}
                            label="10分ごと（推奨）"
                        />
                        <FormControlLabel
                            value="30"
                            control={<Radio />}
                            label="30分ごと"
                        />
                        <FormControlLabel
                            value="60"
                            control={<Radio />}
                            label="1時間ごと"
                        />
                    </RadioGroup>
                </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* 最終バックアップ時刻 */}
            <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                    最終バックアップ: {formatLastBackupTime(lastBackup)}
                </Typography>
            </Box>

            {/* 手動バックアップボタン */}
            <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleManualBackup}
                fullWidth
                size="large"
            >
                今すぐバックアップを作成
            </Button>

            {/* 説明文 */}
            <Alert severity="info" sx={{ mt: 2 }}>
                バックアップは自動的にダウンロードフォルダに保存されます。
                <br />
                保存されたファイルは、データ管理パネルから復元できます。
            </Alert>
        </Paper>
    );
};

export default BackupConfigPanel;

