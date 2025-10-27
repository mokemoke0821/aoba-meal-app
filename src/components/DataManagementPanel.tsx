import {
    DeleteForever,
    Download,
    Schedule,
    Upload
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    FormControlLabel,
    Paper,
    Switch,
    Typography
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import {
    getAutoBackupStatus,
    performAutoBackup,
    setAutoBackupEnabled
} from '../utils/autoBackup';
import {
    clearAllData,
    createBackup,
    exportMealRecordsToCSV,
    exportUsersToCSV,
    importBackup,
    importUsersFromCSV,
    loadMealRecords,
    loadUsers,
    saveUsers
} from '../utils/storage';

export const DataManagementPanel: React.FC = () => {
    const jsonFileInputRef = useRef<HTMLInputElement>(null);
    const csvFileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [autoBackupStatus, setAutoBackupStatus] = useState(getAutoBackupStatus());

    // 自動バックアップの状態を定期的に更新
    useEffect(() => {
        const interval = setInterval(() => {
            setAutoBackupStatus(getAutoBackupStatus());
        }, 60000); // 1分ごとに更新

        return () => clearInterval(interval);
    }, []);

    const handleToggleAutoBackup = (enabled: boolean) => {
        setAutoBackupEnabled(enabled);
        setAutoBackupStatus(getAutoBackupStatus());
        setMessage({
            type: 'success',
            text: `自動バックアップを${enabled ? '有効' : '無効'}にしました`
        });
    };

    const handleManualBackup = async () => {
        setLoading(true);
        try {
            await performAutoBackup();
            setAutoBackupStatus(getAutoBackupStatus());
            setMessage({
                type: 'success',
                text: 'バックアップを作成しました'
            });
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'バックアップの作成に失敗しました'
            });
        } finally {
            setLoading(false);
        }
    };

    /**
     * JSONバックアップ復元ハンドラー
     */
    const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setMessage(null);

        try {
            await importBackup(file);
            setMessage({
                type: 'success',
                text: 'データの復元が完了しました。ページを再読み込みします...'
            });

            // 2秒後にリロード
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            setMessage({
                type: 'error',
                text: `データの復元に失敗しました: ${(error as Error).message}`
            });
        } finally {
            setLoading(false);
            // input要素をリセット（同じファイルを再選択可能にする）
            if (jsonFileInputRef.current) {
                jsonFileInputRef.current.value = '';
            }
        }
    };

    /**
     * CSVユーザーインポートハンドラー
     */
    const handleImportUsers = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setMessage(null);

        try {
            const importedUsers = await importUsersFromCSV(file);

            // 確認ダイアログ
            const confirmed = window.confirm(
                `${importedUsers.length}人のユーザーをインポートします。\n` +
                '既存のユーザーデータは保持され、新しいユーザーが追加されます。\n' +
                '続行しますか？'
            );

            if (!confirmed) {
                setMessage({ type: 'success', text: 'キャンセルしました' });
                return;
            }

            // 既存ユーザーと結合
            const existingUsers = loadUsers();
            const mergedUsers = [...existingUsers, ...importedUsers];
            saveUsers(mergedUsers);

            setMessage({
                type: 'success',
                text: `${importedUsers.length}人のユーザーをインポートしました`
            });

            // 2秒後にリロード
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            setMessage({
                type: 'error',
                text: `ユーザーのインポートに失敗しました: ${(error as Error).message}`
            });
        } finally {
            setLoading(false);
            if (csvFileInputRef.current) {
                csvFileInputRef.current.value = '';
            }
        }
    };

    /**
     * 全データ削除ハンドラー
     */
    const handleClearAllData = () => {
        const confirmed = window.confirm(
            '⚠️ 警告: すべてのデータを削除します\n\n' +
            'この操作は取り消せません。\n' +
            '本当に削除しますか？'
        );

        if (!confirmed) return;

        const doubleConfirm = window.confirm(
            '最終確認: 本当にすべてのデータを削除しますか？\n\n' +
            'ユーザー、給食記録、メニューがすべて削除されます。'
        );

        if (!doubleConfirm) return;

        try {
            clearAllData();
            setMessage({
                type: 'success',
                text: 'すべてのデータを削除しました。ページを再読み込みします...'
            });
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            setMessage({
                type: 'error',
                text: `データの削除に失敗しました: ${(error as Error).message}`
            });
        }
    };

    return (
        <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto', my: 4 }}>
            <Typography variant="h5" gutterBottom>
                📊 データ管理
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* メッセージ表示 */}
            {message && (
                <Alert
                    severity={message.type}
                    sx={{ mb: 2 }}
                    onClose={() => setMessage(null)}
                >
                    {message.text}
                </Alert>
            )}

            {/* ローディング表示 */}
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* 自動バックアップセクション */}
            <Card
                elevation={4}
                sx={{
                    mb: 4,
                    bgcolor: '#e3f2fd',
                    border: '2px solid #1976d2',
                    borderRadius: 2
                }}
            >
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Schedule color="primary" sx={{ fontSize: 32 }} />
                            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                🤖 自動バックアップ
                            </Typography>
                        </Box>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={autoBackupStatus.enabled}
                                    onChange={(e) => handleToggleAutoBackup(e.target.checked)}
                                    color="primary"
                                />
                            }
                            label={autoBackupStatus.enabled ? '有効' : '無効'}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        <Chip
                            label={`間隔: ${autoBackupStatus.intervalDays}日ごと`}
                            size="small"
                            color="info"
                            variant="outlined"
                        />
                        {autoBackupStatus.lastBackup && (
                            <Chip
                                label={`最終: ${autoBackupStatus.lastBackup.toLocaleString('ja-JP')}`}
                                size="small"
                                color="success"
                                variant="outlined"
                            />
                        )}
                        {autoBackupStatus.enabled && (
                            <Chip
                                label={`次回: ${autoBackupStatus.nextBackupDate.toLocaleDateString('ja-JP')}`}
                                size="small"
                                color="warning"
                                variant="outlined"
                            />
                        )}
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        💡 自動バックアップを有効にすると、{autoBackupStatus.intervalDays}日ごとに自動でバックアップファイルが作成されます
                    </Typography>

                    <Button
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={handleManualBackup}
                        disabled={loading}
                        fullWidth
                    >
                        今すぐバックアップ実行
                    </Button>
                </CardContent>
            </Card>

            <Divider sx={{ my: 2 }} />

            {/* バックアップ・復元セクション */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    💾 バックアップ・復元
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                        variant="contained"
                        startIcon={<Download />}
                        onClick={() => createBackup()}
                        disabled={loading}
                    >
                        JSONバックアップ作成
                    </Button>

                    <Button
                        variant="outlined"
                        startIcon={<Upload />}
                        onClick={() => jsonFileInputRef.current?.click()}
                        disabled={loading}
                    >
                        JSONバックアップ復元
                    </Button>

                    <input
                        type="file"
                        ref={jsonFileInputRef}
                        accept=".json"
                        style={{ display: 'none' }}
                        onChange={handleImportBackup}
                    />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    💡 ヒント: 定期的にバックアップを作成することをお勧めします
                </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* CSV出力・インポートセクション */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    📄 CSV出力・インポート
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                        variant="contained"
                        startIcon={<Download />}
                        onClick={() => exportUsersToCSV(loadUsers())}
                        disabled={loading}
                    >
                        ユーザー一覧CSV出力
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<Download />}
                        onClick={() => exportMealRecordsToCSV(loadMealRecords())}
                        disabled={loading}
                    >
                        給食記録CSV出力
                    </Button>

                    <Button
                        variant="outlined"
                        startIcon={<Upload />}
                        onClick={() => csvFileInputRef.current?.click()}
                        disabled={loading}
                    >
                        ユーザーCSVインポート
                    </Button>

                    <input
                        type="file"
                        ref={csvFileInputRef}
                        accept=".csv"
                        style={{ display: 'none' }}
                        onChange={handleImportUsers}
                    />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    💡 CSVフォーマット: 利用者名, グループ, 料金, 登録日, 状態
                </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* 危険な操作セクション */}
            <Box>
                <Typography variant="h6" gutterBottom color="error">
                    ⚠️ 危険な操作
                </Typography>

                <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        以下の操作は取り消せません。実行前に必ずバックアップを作成してください。
                    </Typography>
                </Alert>

                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteForever />}
                    onClick={handleClearAllData}
                    disabled={loading}
                >
                    全データ削除
                </Button>
            </Box>
        </Paper>
    );
};

