/**
 * Google Drive設定コンポーネント
 * Google Drive統合の設定UI
 */

import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Switch,
    FormControlLabel,
    Alert,
    Divider,
    Chip,
    CircularProgress,
    Avatar,
} from '@mui/material';
import CloudIcon from '@mui/icons-material/Cloud';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import SyncIcon from '@mui/icons-material/Sync';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useGoogleDrive } from '../contexts/GoogleDriveContext';

export const GoogleDriveSettings: React.FC = () => {
    const {
        authState,
        syncConfig,
        lastSyncResult,
        isInitializing,
        isSyncing,
        initialize,
        handleSignIn,
        handleSignOut,
        handleSync,
        updateSyncConfig,
        enableAutoSync,
    } = useGoogleDrive();

    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

    /**
     * サインインボタンのハンドラ
     */
    const onSignIn = async () => {
        try {
            if (!authState.isInitialized) {
                setMessage({ type: 'info', text: 'Google Drive APIを初期化中...' });
                await initialize();
            }
            await handleSignIn();
            setMessage({ type: 'success', text: 'Google Driveに接続しました' });
        } catch (error) {
            setMessage({
                type: 'error',
                text: `接続に失敗しました: ${(error as Error).message}`,
            });
        }
    };

    /**
     * サインアウトボタンのハンドラ
     */
    const onSignOut = async () => {
        try {
            await handleSignOut();
            setMessage({ type: 'success', text: 'Google Driveから切断しました' });
        } catch (error) {
            setMessage({
                type: 'error',
                text: `切断に失敗しました: ${(error as Error).message}`,
            });
        }
    };

    /**
     * 同期ボタンのハンドラ
     */
    const onSync = async () => {
        try {
            setMessage({ type: 'info', text: '同期中...' });
            await handleSync();
            if (lastSyncResult?.status === 'success') {
                setMessage({ type: 'success', text: '同期が完了しました' });
            } else {
                setMessage({
                    type: 'error',
                    text: lastSyncResult?.message || '同期に失敗しました',
                });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: `同期に失敗しました: ${(error as Error).message}`,
            });
        }
    };

    /**
     * 自動同期の有効/無効切り替え
     */
    const onToggleAutoSync = (event: React.ChangeEvent<HTMLInputElement>) => {
        const enabled = event.target.checked;
        enableAutoSync(enabled);
        setMessage({
            type: 'success',
            text: enabled ? '自動同期を有効にしました' : '自動同期を無効にしました',
        });
    };

    /**
     * 同期設定の有効/無効切り替え
     */
    const onToggleSyncEnabled = (event: React.ChangeEvent<HTMLInputElement>) => {
        const enabled = event.target.checked;
        updateSyncConfig({ ...syncConfig, enabled });
        setMessage({
            type: 'success',
            text: enabled ? 'Google Drive統合を有効にしました' : 'Google Drive統合を無効にしました',
        });
    };

    /**
     * 最終同期時刻をフォーマット
     */
    const formatLastSyncTime = (time: string | null): string => {
        if (!time) return 'まだ同期していません';
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

    return (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
                <CloudIcon sx={{ mr: 1, color: 'primary.main', fontSize: 32 }} />
                <Typography variant="h6">Google Drive統合</Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* メッセージ表示 */}
            {message && (
                <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
                    {message.text}
                </Alert>
            )}

            {/* エラー表示 */}
            {authState.error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {authState.error}
                </Alert>
            )}

            {/* 初期化中 */}
            {isInitializing && (
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <CircularProgress size={24} />
                    <Typography>Google Drive APIを初期化中...</Typography>
                </Box>
            )}

            {/* 認証状態 */}
            <Box mb={3}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Typography variant="body1" fontWeight="bold">
                        接続状態:
                    </Typography>
                    {authState.isAuthenticated ? (
                        <Chip
                            label="接続済み"
                            color="success"
                            icon={<CheckCircleIcon />}
                            size="small"
                        />
                    ) : (
                        <Chip
                            label="未接続"
                            color="default"
                            icon={<CloudOffIcon />}
                            size="small"
                        />
                    )}
                </Box>

                {/* ユーザー情報 */}
                {authState.isAuthenticated && authState.user && (
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                        {authState.user.picture && (
                            <Avatar src={authState.user.picture} alt={authState.user.name} />
                        )}
                        <Box>
                            <Typography variant="body2" fontWeight="bold">
                                {authState.user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {authState.user.email}
                            </Typography>
                        </Box>
                    </Box>
                )}

                {/* サインイン/サインアウトボタン */}
                <Box>
                    {authState.isAuthenticated ? (
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<CloudOffIcon />}
                            onClick={onSignOut}
                            fullWidth
                        >
                            Google Driveから切断
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<CloudIcon />}
                            onClick={onSignIn}
                            disabled={isInitializing}
                            fullWidth
                        >
                            Google Driveと連携
                        </Button>
                    )}
                </Box>
            </Box>

            {/* 同期設定 */}
            {authState.isAuthenticated && (
                <>
                    <Divider sx={{ mb: 2 }} />

                    {/* Google Drive統合の有効/無効 */}
                    <FormControlLabel
                        control={
                            <Switch
                                checked={syncConfig.enabled}
                                onChange={onToggleSyncEnabled}
                                color="primary"
                            />
                        }
                        label="Google Drive統合を有効にする"
                    />

                    {/* 自動同期の有効/無効 */}
                    {syncConfig.enabled && (
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={syncConfig.autoSync}
                                    onChange={onToggleAutoSync}
                                    color="primary"
                                />
                            }
                            label="自動同期を有効にする"
                        />
                    )}

                    {/* 最終同期時刻 */}
                    {syncConfig.enabled && (
                        <Box mt={2} mb={2}>
                            <Typography variant="body2" color="text.secondary">
                                最終同期: {formatLastSyncTime(syncConfig.lastSyncTime)}
                            </Typography>
                            {lastSyncResult && (
                                <Box display="flex" alignItems="center" gap={1} mt={1}>
                                    {lastSyncResult.status === 'success' ? (
                                        <CheckCircleIcon color="success" fontSize="small" />
                                    ) : lastSyncResult.status === 'error' ? (
                                        <ErrorIcon color="error" fontSize="small" />
                                    ) : null}
                                    <Typography variant="caption">
                                        {lastSyncResult.message}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    )}

                    {/* 手動同期ボタン */}
                    {syncConfig.enabled && (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={isSyncing ? <CircularProgress size={20} /> : <SyncIcon />}
                            onClick={onSync}
                            disabled={isSyncing}
                            fullWidth
                        >
                            {isSyncing ? '同期中...' : '今すぐ同期'}
                        </Button>
                    )}
                </>
            )}

            {/* 説明文 */}
            <Alert severity="info" sx={{ mt: 2 }}>
                Google Drive統合を有効にすると、データが自動的にGoogle Driveにバックアップされます。
                <br />
                複数のデバイス間でデータを共有できます。
            </Alert>
        </Paper>
    );
};

export default GoogleDriveSettings;

