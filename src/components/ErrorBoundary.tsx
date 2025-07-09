import {
    BugReport as BugReportIcon,
    ContentCopy as ContentCopyIcon,
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon,
    Home as HomeIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Collapse,
    Container,
    Paper,
    Stack,
    Typography
} from '@mui/material';
import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    errorId: string;
    showDetails: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: '',
            showDetails: false
        };
    }

    static getDerivedStateFromError(error: Error): State {
        const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return {
            hasError: true,
            error,
            errorInfo: null,
            errorId,
            showDetails: false
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        
        this.setState({
            error,
            errorInfo
        });

        // エラーログをローカルストレージに保存
        this.saveErrorLog(error, errorInfo);
    }

    private saveErrorLog = (error: Error, errorInfo: ErrorInfo) => {
        try {
            const errorLog = {
                timestamp: new Date().toISOString(),
                errorId: this.state.errorId,
                message: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack,
                userAgent: navigator.userAgent,
                url: window.location.href
            };

            const existingLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
            existingLogs.push(errorLog);
            
            // 最新の10件のみ保持
            if (existingLogs.length > 10) {
                existingLogs.splice(0, existingLogs.length - 10);
            }
            
            localStorage.setItem('errorLogs', JSON.stringify(existingLogs));
        } catch (e) {
            console.error('Failed to save error log:', e);
        }
    };

    private copyErrorReport = async () => {
        try {
            const errorReport = this.generateErrorReport();
            await navigator.clipboard.writeText(errorReport);
            // showSuccess('エラーレポートがクリップボードにコピーされました。管理者に報告してください。');
            // 通知システムを使用する場合は、コンポーネントを関数コンポーネントに変換する必要があります
            // 一時的にconsole.logで代替
            console.log('エラーレポートがクリップボードにコピーされました。');
        } catch (err) {
            console.error('Failed to copy error report:', err);
            // showError('エラーレポートのコピーに失敗しました。');
            console.log('エラーレポートのコピーに失敗しました。');
        }
    };

    private generateErrorReport = (): string => {
        const { error, errorInfo, errorId } = this.state;
        
        return `
=== あおば給食アプリ エラーレポート ===
エラーID: ${errorId}
発生時刻: ${new Date().toLocaleString('ja-JP')}
URL: ${window.location.href}
ユーザーエージェント: ${navigator.userAgent}

=== エラー内容 ===
${error?.message || 'Unknown error'}

=== スタックトレース ===
${error?.stack || 'No stack trace available'}

=== コンポーネントスタック ===
${errorInfo?.componentStack || 'No component stack available'}

=== ローカルストレージ情報 ===
${this.getLocalStorageInfo()}

=== 追加情報 ===
- React Version: ${React.version}
- Browser: ${this.getBrowserInfo()}
- Screen Resolution: ${window.screen.width}x${window.screen.height}
- Viewport: ${window.innerWidth}x${window.innerHeight}
`;
    };

    private getLocalStorageInfo = (): string => {
        try {
            const keys = Object.keys(localStorage);
            return keys.map(key => {
                const value = localStorage.getItem(key);
                const size = value ? value.length : 0;
                return `${key}: ${size} characters`;
            }).join('\n');
        } catch (e) {
            return 'LocalStorage access denied';
        }
    };

    private getBrowserInfo = (): string => {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        return 'Unknown';
    };

    private handleReload = () => {
        window.location.reload();
    };

    private handleGoHome = () => {
        window.location.href = '/aoba-meal-app';
    };

    private toggleDetails = () => {
        this.setState(prevState => ({
            showDetails: !prevState.showDetails
        }));
    };

    render() {
        if (this.state.hasError) {
            const { error, errorId, showDetails } = this.state;

            return (
                <Container maxWidth="md" sx={{ py: 4 }}>
                    <Card 
                        sx={{ 
                            borderRadius: '16px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                            overflow: 'hidden'
                        }}
                    >
                        <Box 
                            sx={{ 
                                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                                color: 'white',
                                p: 4,
                                textAlign: 'center'
                            }}
                        >
                            <BugReportIcon sx={{ fontSize: '4rem', mb: 2, opacity: 0.9 }} />
                            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                                エラーが発生しました
                            </Typography>
                            <Typography variant="h6" sx={{ opacity: 0.9 }}>
                                申し訳ございません。予期しないエラーが発生しました
                            </Typography>
                        </Box>

                        <CardContent sx={{ p: 4 }}>
                            <Alert 
                                severity="error" 
                                sx={{ 
                                    mb: 3,
                                    borderRadius: '12px',
                                    '& .MuiAlert-message': {
                                        fontSize: '1rem',
                                        fontWeight: 500
                                    }
                                }}
                            >
                                アプリケーションでエラーが発生し、正常に動作できません。
                                下記の方法で解決を試してください。
                            </Alert>

                            <Paper 
                                elevation={1} 
                                sx={{ 
                                    p: 3, 
                                    mb: 3, 
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '12px'
                                }}
                            >
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                                    📋 エラー情報
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                    <strong>エラーID:</strong> {errorId}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                    <strong>発生時刻:</strong> {new Date().toLocaleString('ja-JP')}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    <strong>エラーメッセージ:</strong> {error?.message || 'Unknown error'}
                                </Typography>
                            </Paper>

                            <Stack spacing={2} sx={{ mb: 3 }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<RefreshIcon />}
                                    onClick={this.handleReload}
                                    sx={{
                                        borderRadius: '12px',
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                        boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                                    }}
                                >
                                    ページを再読み込み
                                </Button>

                                <Button
                                    variant="outlined"
                                    size="large"
                                    startIcon={<HomeIcon />}
                                    onClick={this.handleGoHome}
                                    sx={{
                                        borderRadius: '12px',
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        borderWidth: 2,
                                        '&:hover': {
                                            borderWidth: 2,
                                        }
                                    }}
                                >
                                    ホーム画面に戻る
                                </Button>

                                <Button
                                    variant="outlined"
                                    startIcon={<ContentCopyIcon />}
                                    onClick={this.copyErrorReport}
                                    sx={{
                                        borderRadius: '12px',
                                        py: 1,
                                        color: 'text.secondary',
                                        borderColor: 'divider',
                                        '&:hover': {
                                            borderColor: 'primary.main',
                                            backgroundColor: 'action.hover'
                                        }
                                    }}
                                >
                                    エラーレポートをコピー
                                </Button>
                            </Stack>

                            <Paper 
                                elevation={0} 
                                sx={{ 
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: '12px',
                                    overflow: 'hidden'
                                }}
                            >
                                <Button
                                    fullWidth
                                    onClick={this.toggleDetails}
                                    endIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    sx={{
                                        py: 2,
                                        justifyContent: 'space-between',
                                        color: 'text.secondary',
                                        fontSize: '0.95rem',
                                        fontWeight: 500,
                                        textTransform: 'none',
                                        '&:hover': {
                                            backgroundColor: 'action.hover'
                                        }
                                    }}
                                >
                                    技術詳細を表示
                                </Button>
                                
                                <Collapse in={showDetails}>
                                    <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                            詳細なエラー情報:
                                        </Typography>
                                        <Paper 
                                            elevation={0}
                                            sx={{ 
                                                p: 2, 
                                                backgroundColor: '#1e1e1e',
                                                color: '#f8f8f2',
                                                borderRadius: '8px',
                                                border: '1px solid #333',
                                                fontFamily: 'monospace',
                                                fontSize: '0.8rem',
                                                lineHeight: 1.4,
                                                overflow: 'auto',
                                                maxHeight: '300px'
                                            }}
                                        >
                                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                                                {this.generateErrorReport()}
                                            </pre>
                                        </Paper>
                                    </Box>
                                </Collapse>
                            </Paper>
                        </CardContent>
                    </Card>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 