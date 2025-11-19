import {
    BugReport,
    CheckCircle,
    Error as ErrorIcon,
    Refresh,
    Storage
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { loadMealRecords, loadUsers } from '../utils/storage';

interface DiagnosticsInfo {
    localStorageSupported: boolean;
    localStorageSize: number;
    userDataExists: boolean;
    userDataCount: number;
    mealRecordExists: boolean;
    mealRecordCount: number;
    contextUserCount: number;
    contextRecordCount: number;
    lastUpdate: string;
}

export const DataDiagnosticsPanel: React.FC = () => {
    const { state, dispatch } = useApp();
    const [diagnostics, setDiagnostics] = useState<DiagnosticsInfo | null>(null);

    const runDiagnostics = () => {
        try {
            // LocalStorageのサポート確認
            const localStorageSupported = typeof localStorage !== 'undefined';

            // LocalStorageのサイズ計算
            let localStorageSize = 0;
            if (localStorageSupported) {
                for (const key in localStorage) {
                    if (localStorage.hasOwnProperty(key)) {
                        localStorageSize += localStorage[key].length + key.length;
                    }
                }
            }

            // データの読み込み
            const usersFromStorage = loadUsers();
            const recordsFromStorage = loadMealRecords();

            const info: DiagnosticsInfo = {
                localStorageSupported,
                localStorageSize,
                userDataExists: usersFromStorage.length > 0,
                userDataCount: usersFromStorage.length,
                mealRecordExists: recordsFromStorage.length > 0,
                mealRecordCount: recordsFromStorage.length,
                contextUserCount: state.users.length,
                contextRecordCount: state.mealRecords.length,
                lastUpdate: new Date().toLocaleString('ja-JP')
            };

            setDiagnostics(info);
        } catch (error) {
            console.error('[診断] 診断エラー:', error);
        }
    };

    useEffect(() => {
        runDiagnostics();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.users, state.mealRecords]);

    const handleReloadFromStorage = () => {
        const usersFromStorage = loadUsers();
        const recordsFromStorage = loadMealRecords();

        if (usersFromStorage.length > 0) {
            dispatch({ type: 'SET_USERS', payload: usersFromStorage });
        }

        if (recordsFromStorage.length > 0) {
            dispatch({ type: 'SET_MEAL_RECORDS', payload: recordsFromStorage });
        }

        runDiagnostics();
    };

    const getStorageStatus = () => {
        if (!diagnostics) return null;

        const isHealthy = diagnostics.localStorageSupported &&
            diagnostics.userDataExists &&
            diagnostics.contextUserCount > 0;

        return {
            status: isHealthy ? 'healthy' : 'warning',
            message: isHealthy
                ? 'データは正常に保存・読み込まれています'
                : 'データの保存または読み込みに問題があります'
        };
    };

    if (!diagnostics) {
        return (
            <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto', my: 4 }}>
                <Typography variant="h6">診断中...</Typography>
            </Paper>
        );
    }

    const storageStatus = getStorageStatus();

    return (
        <Paper sx={{ p: 3, maxWidth: 900, mx: 'auto', my: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BugReport color="primary" />
                    <Typography variant="h5">
                        🔍 データ診断ツール
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={runDiagnostics}
                >
                    再診断
                </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* ステータス表示 */}
            {storageStatus && (
                <Alert
                    severity={storageStatus.status === 'healthy' ? 'success' : 'warning'}
                    icon={storageStatus.status === 'healthy' ? <CheckCircle /> : <ErrorIcon />}
                    sx={{ mb: 3 }}
                >
                    {storageStatus.message}
                </Alert>
            )}

            {/* LocalStorage情報 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Storage /> LocalStorage 状態
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                        <Chip
                            label={diagnostics.localStorageSupported ? 'サポート: 有効' : 'サポート: 無効'}
                            color={diagnostics.localStorageSupported ? 'success' : 'error'}
                            icon={diagnostics.localStorageSupported ? <CheckCircle /> : <ErrorIcon />}
                        />
                        <Chip
                            label={`使用量: ${(diagnostics.localStorageSize / 1024).toFixed(2)} KB`}
                            color="info"
                            variant="outlined"
                        />
                        <Chip
                            label={`最終更新: ${diagnostics.lastUpdate}`}
                            color="default"
                            variant="outlined"
                        />
                    </Box>
                </CardContent>
            </Card>

            {/* データ比較テーブル */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        📊 データ状態の比較
                    </Typography>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>データ種類</TableCell>
                                    <TableCell align="center">LocalStorage</TableCell>
                                    <TableCell align="center">アプリ内メモリ</TableCell>
                                    <TableCell align="center">状態</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>利用者データ</TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={`${diagnostics.userDataCount}件`}
                                            size="small"
                                            color={diagnostics.userDataCount > 0 ? 'primary' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={`${diagnostics.contextUserCount}件`}
                                            size="small"
                                            color={diagnostics.contextUserCount > 0 ? 'success' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        {diagnostics.userDataCount === diagnostics.contextUserCount ? (
                                            <Chip label="同期済み" size="small" color="success" icon={<CheckCircle />} />
                                        ) : (
                                            <Chip label="不一致" size="small" color="warning" icon={<ErrorIcon />} />
                                        )}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>給食記録</TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={`${diagnostics.mealRecordCount}件`}
                                            size="small"
                                            color={diagnostics.mealRecordCount > 0 ? 'primary' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={`${diagnostics.contextRecordCount}件`}
                                            size="small"
                                            color={diagnostics.contextRecordCount > 0 ? 'success' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        {diagnostics.mealRecordCount === diagnostics.contextRecordCount ? (
                                            <Chip label="同期済み" size="small" color="success" icon={<CheckCircle />} />
                                        ) : (
                                            <Chip label="不一致" size="small" color="warning" icon={<ErrorIcon />} />
                                        )}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box sx={{ mt: 2 }}>
                        <Button
                            variant="contained"
                            startIcon={<Refresh />}
                            onClick={handleReloadFromStorage}
                            fullWidth
                        >
                            LocalStorageから強制的に再読み込み
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* 推奨対応 */}
            {storageStatus?.status === 'warning' && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        ⚠️ データ保存の問題が検出されました
                    </Typography>
                    <Typography variant="body2">
                        以下の対応を推奨します：
                    </Typography>
                    <ul style={{ marginTop: 8, marginBottom: 0 }}>
                        <li>ブラウザのプライベートモード（シークレットモード）を使用していないか確認</li>
                        <li>ブラウザの設定で「Cookieとサイトデータ」が有効になっているか確認</li>
                        <li>タブレットの空き容量を確認</li>
                        <li>データ管理パネルから定期的にバックアップを作成</li>
                    </ul>
                </Alert>
            )}

            {/* デバッグ情報 */}
            <Card>
                <CardContent>
                    <Typography variant="subtitle2" gutterBottom color="text.secondary">
                        🔧 デバッグ情報
                    </Typography>
                    <Typography variant="caption" component="pre" sx={{
                        bgcolor: 'grey.100',
                        p: 2,
                        borderRadius: 1,
                        overflow: 'auto',
                        fontSize: '0.75rem'
                    }}>
                        {JSON.stringify(diagnostics, null, 2)}
                    </Typography>
                </CardContent>
            </Card>
        </Paper>
    );
};

