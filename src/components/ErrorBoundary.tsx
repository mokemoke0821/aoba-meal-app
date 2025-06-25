import {
    BugReport as BugReportIcon,
    Error as ErrorIcon,
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon,
    Home as HomeIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Collapse,
    Container,
    IconButton,
    Typography
} from '@mui/material';
import { format } from 'date-fns';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    errorId: string;
    showDetails: boolean;
}

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    resetOnNavigate?: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    private resetTimeoutId: number | null = null;

    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: '',
            showDetails: false,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        // UUID v4形式のエラーID生成
        const errorId = uuidv4();

        return {
            hasError: true,
            error,
            errorId,
            showDetails: false,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({
            errorInfo,
        });

        // エラー情報をローカルストレージに保存
        this.saveErrorToStorage(error, errorInfo);

        // 親コンポーネントのエラーハンドラーを呼び出し
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // コンソールにエラー詳細を出力
        console.group('🚨 Error Boundary - エラーが発生しました');
        console.error('Error:', error);
        console.error('Error Info:', errorInfo);
        console.error('Component Stack:', errorInfo.componentStack);
        console.groupEnd();
    }

    private saveErrorToStorage = (error: Error, errorInfo: ErrorInfo) => {
        try {
            const errorRecord = {
                id: this.state.errorId,
                timestamp: new Date().toISOString(),
                message: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack,
                userAgent: navigator.userAgent,
                url: window.location.href,
            };

            // 既存のエラーログを取得（安全な方法で）
            let existingErrors: any[] = [];
            try {
                const stored = localStorage.getItem('aobaErrorLogs');
                if (stored) {
                    existingErrors = JSON.parse(stored);
                    // 配列でない場合は空配列に初期化
                    if (!Array.isArray(existingErrors)) {
                        existingErrors = [];
                    }
                }
            } catch (parseError) {
                // JSONパースエラーの場合は新しい配列で開始
                existingErrors = [];
                console.warn('Existing error logs were corrupted, starting fresh:', parseError);
            }

            // 最新の10件のエラーのみ保持
            const updatedErrors = [errorRecord, ...existingErrors].slice(0, 10);

            // LocalStorageに保存（容量制限も考慮）
            localStorage.setItem('aobaErrorLogs', JSON.stringify(updatedErrors));

        } catch (storageError) {
            console.error('エラーログの保存に失敗しました:', storageError);

            // 容量制限の場合は古いエラーを削除して再試行
            if (storageError instanceof Error && storageError.name === 'QuotaExceededError') {
                try {
                    // 最新の5件だけ保持
                    const minimalRecord = {
                        id: this.state.errorId,
                        timestamp: new Date().toISOString(),
                        message: error.message
                    };
                    localStorage.setItem('aobaErrorLogs', JSON.stringify([minimalRecord]));
                } catch (retryError) {
                    console.error('最小限のエラーログ保存も失敗しました:', retryError);
                }
            }
        }
    };

    private handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: '',
            showDetails: false,
        });
    };

    private handleReload = () => {
        window.location.reload();
    };

    private handleGoHome = () => {
        // ローカルストレージをクリアしてリロード
        localStorage.removeItem('aobaAppData');
        window.location.href = '/';
    };

    private toggleDetails = () => {
        this.setState((prevState) => ({
            showDetails: !prevState.showDetails,
        }));
    };

    private handleReportError = () => {
        const { error, errorInfo, errorId } = this.state;

        // あおば事業所給食管理アプリ形式のレポート
        const reportLines = [
            'あおば事業所給食管理アプリ - エラーレポート',
            '=======================================',
            '',
            `エラーID: ${errorId}`,
            `発生時刻: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`,
            `エラーメッセージ: ${error?.message || 'Unknown error'}`,
            '',
            '技術的詳細:',
            '----------',
            `ユーザーエージェント: ${navigator.userAgent}`,
            `URL: ${window.location.href}`,
            `画面解像度: ${window.screen.width}x${window.screen.height}`,
            '',
            'スタックトレース:',
            '-------------',
            error?.stack || 'No stack trace',
            '',
            'コンポーネントスタック:',
            '------------------',
            errorInfo?.componentStack || 'No component stack',
        ];

        const reportText = reportLines.join('\n');

        // エラーレポートをクリップボードにコピー
        navigator.clipboard.writeText(reportText)
            .then(() => {
                alert('エラーレポートがクリップボードにコピーされました。管理者に報告してください。');
            })
            .catch(() => {
                alert('エラーレポートのコピーに失敗しました。');
            });
    };

    render() {
        if (this.state.hasError) {
            // カスタムフォールバックがある場合はそれを使用
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // デフォルトのエラー表示
            return (
                <ErrorFallback
                    error={this.state.error}
                    errorInfo={this.state.errorInfo}
                    errorId={this.state.errorId}
                    showDetails={this.state.showDetails}
                    onRetry={this.handleRetry}
                    onReload={this.handleReload}
                    onGoHome={this.handleGoHome}
                    onToggleDetails={this.toggleDetails}
                    onReportError={this.handleReportError}
                />
            );
        }

        return this.props.children;
    }
}

// エラー表示用のフォールバックコンポーネント
interface ErrorFallbackProps {
    error: Error | null;
    errorInfo: ErrorInfo | null;
    errorId: string;
    showDetails: boolean;
    onRetry: () => void;
    onReload: () => void;
    onGoHome: () => void;
    onToggleDetails: () => void;
    onReportError: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
    error,
    errorInfo,
    errorId,
    showDetails,
    onRetry,
    onReload,
    onGoHome,
    onToggleDetails,
    onReportError,
}) => {
    return (
        <Container
            maxWidth="md"
            sx={{
                padding: { xs: 2, sm: 3, md: 4 },
                minHeight: '50vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
            }}
        >
            <Card sx={{ borderRadius: '16px', boxShadow: 4 }}>
                <CardContent sx={{ p: 4 }}>
                    {/* エラーアイコンとタイトル */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <ErrorIcon sx={{ fontSize: '4rem', color: 'error.main', mb: 2 }} />
                        <Typography
                            variant="h4"
                            sx={{ mb: 2, fontWeight: 600, color: 'error.main' }}
                            id="error-title"
                        >
                            問題が発生しました
                        </Typography>
                        <Typography
                            variant="h6"
                            color="text.secondary"
                            sx={{ mb: 3 }}
                            id="error-description"
                        >
                            アプリケーションでエラーが発生しました
                        </Typography>
                    </Box>

                    {/* エラー概要 - メインエラー情報 */}
                    <Box
                        role="alert"
                        aria-labelledby="error-title"
                        aria-describedby="error-description"
                        aria-live="assertive"
                        sx={{ mb: 3 }}
                    >
                        <Alert severity="error" sx={{ borderRadius: '8px' }} role="none">
                            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                                エラー詳細:
                            </Typography>
                            <Typography variant="body2">
                                {error?.message || '不明なエラーが発生しました'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                エラーID: {errorId}
                            </Typography>
                        </Alert>
                    </Box>

                    {/* 対処方法の案内 - 情報提供のみ */}
                    <Box sx={{ mb: 3 }}>
                        <Alert severity="info" sx={{ borderRadius: '8px' }} role="none">
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                <strong>対処方法:</strong>
                            </Typography>
                            <Typography variant="body2" component="div">
                                1. 「再試行」ボタンを押してください<br />
                                2. 問題が続く場合は「ページを再読み込み」を試してください<br />
                                3. それでも解決しない場合は「ホームに戻る」をお試しください
                            </Typography>
                        </Alert>
                    </Box>

                    {/* 操作ボタン */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<RefreshIcon />}
                            onClick={onRetry}
                            sx={{ borderRadius: '8px' }}
                            aria-label="エラーから復旧するため再試行"
                        >
                            再試行
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={onReload}
                            sx={{ borderRadius: '8px' }}
                            aria-label="ページを再読み込みして問題を解決"
                        >
                            ページを再読み込み
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<HomeIcon />}
                            onClick={onGoHome}
                            sx={{ borderRadius: '8px' }}
                            aria-label="メイン画面に戻って新しくスタート"
                        >
                            ホームに戻る
                        </Button>
                    </Box>

                    {/* エラーレポート */}
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Button
                            variant="text"
                            color="warning"
                            startIcon={<BugReportIcon />}
                            onClick={onReportError}
                            sx={{ borderRadius: '8px' }}
                            aria-label="管理者に報告するためエラーレポートをコピー"
                        >
                            エラーレポートをコピー
                        </Button>
                    </Box>

                    {/* 詳細表示トグル */}
                    <Box sx={{ textAlign: 'center' }}>
                        <IconButton
                            onClick={onToggleDetails}
                            color="primary"
                            aria-label={showDetails ? 'エラー詳細を非表示にする' : 'エラー詳細を表示する'}
                            aria-expanded={showDetails}
                            aria-controls="error-details"
                        >
                            {showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            <Typography variant="body2" sx={{ ml: 1 }}>
                                {showDetails ? '詳細を非表示' : '詳細を表示'}
                            </Typography>
                        </IconButton>
                    </Box>

                    {/* エラー詳細 */}
                    <Collapse in={showDetails}>
                        <Box
                            id="error-details"
                            sx={{ mt: 3, p: 2, backgroundColor: 'grey.100', borderRadius: '8px' }}
                            role="region"
                            aria-label="エラーの技術的詳細情報"
                        >
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                <strong>エラースタック:</strong><br />
                                {error?.stack || 'スタックトレースなし'}
                            </Typography>
                            {errorInfo?.componentStack && (
                                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', mt: 2 }}>
                                    <strong>コンポーネントスタック:</strong><br />
                                    {errorInfo.componentStack}
                                </Typography>
                            )}
                            {showDetails && (
                                <Typography variant="body2" sx={{ mt: 1, fontSize: '0.75rem' }}>
                                    詳細表示テスト
                                </Typography>
                            )}
                        </Box>
                    </Collapse>
                </CardContent>
            </Card>
        </Container>
    );
};

export default ErrorBoundary; 