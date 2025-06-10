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
        // エラーIDを生成（デバッグ用）
        const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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

            const existingErrors = JSON.parse(
                localStorage.getItem('aobaErrorLogs') || '[]'
            );

            // 最新の10件のエラーのみ保持
            const updatedErrors = [errorRecord, ...existingErrors].slice(0, 10);

            localStorage.setItem('aobaErrorLogs', JSON.stringify(updatedErrors));
        } catch (storageError) {
            console.error('エラーログの保存に失敗しました:', storageError);
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

        const reportData = {
            errorId,
            timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            message: error?.message || 'Unknown error',
            stack: error?.stack || 'No stack trace',
            componentStack: errorInfo?.componentStack || 'No component stack',
            userAgent: navigator.userAgent,
            url: window.location.href,
        };

        // エラーレポートをクリップボードにコピー
        navigator.clipboard.writeText(JSON.stringify(reportData, null, 2))
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
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Card sx={{ borderRadius: '16px', boxShadow: 4 }}>
                <CardContent sx={{ p: 4 }}>
                    {/* エラーアイコンとタイトル */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <ErrorIcon sx={{ fontSize: '4rem', color: 'error.main', mb: 2 }} />
                        <Typography variant="h4" sx={{ mb: 2, fontWeight: 600, color: 'error.main' }}>
                            問題が発生しました
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                            アプリケーションでエラーが発生しました
                        </Typography>
                    </Box>

                    {/* エラー概要 */}
                    <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
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

                    {/* 対処方法の案内 */}
                    <Alert severity="info" sx={{ mb: 3, borderRadius: '8px' }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>対処方法:</strong>
                        </Typography>
                        <Typography variant="body2" component="div">
                            1. 「再試行」ボタンを押してください<br />
                            2. 問題が続く場合は「ページを再読み込み」を試してください<br />
                            3. それでも解決しない場合は「メイン画面に戻る」をお試しください
                        </Typography>
                    </Alert>

                    {/* 操作ボタン */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<RefreshIcon />}
                            onClick={onRetry}
                            sx={{ borderRadius: '8px' }}
                        >
                            再試行
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={onReload}
                            sx={{ borderRadius: '8px' }}
                        >
                            ページを再読み込み
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={<HomeIcon />}
                            onClick={onGoHome}
                            sx={{ borderRadius: '8px' }}
                        >
                            メイン画面に戻る
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
                        >
                            エラーレポートをコピー
                        </Button>
                    </Box>

                    {/* 詳細表示トグル */}
                    <Box sx={{ textAlign: 'center' }}>
                        <IconButton onClick={onToggleDetails} color="primary">
                            {showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            <Typography variant="body2" sx={{ ml: 1 }}>
                                {showDetails ? '詳細を非表示' : '詳細を表示'}
                            </Typography>
                        </IconButton>
                    </Box>

                    {/* エラー詳細 */}
                    <Collapse in={showDetails}>
                        <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.100', borderRadius: '8px' }}>
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
                        </Box>
                    </Collapse>
                </CardContent>
            </Card>
        </Container>
    );
};

export default ErrorBoundary; 