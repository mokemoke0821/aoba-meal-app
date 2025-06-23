import { CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import aobaTheme from './theme';

// メインアプリケーションコンポーネント
const AppContent: React.FC = () => {

  return (
    <>
      <CssBaseline />
      <div>アプリケーションは現在メンテナンス中です。</div>
    </>
  );
};

// ルートAppコンポーネント
const App: React.FC = () => {
  const handleGlobalError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.group('🚨 Global Error Handler');
    console.error('アプリケーションレベルのエラーが発生しました:', error);
    console.error('エラー情報:', errorInfo);
    console.groupEnd();

    // 必要に応じて外部のエラー監視サービスに送信
    // analytics.track('app_error', { message: error.message, stack: error.stack });
  };

  return (
    <ThemeProvider theme={aobaTheme}>
      <ErrorBoundary
        onError={handleGlobalError}
        resetOnNavigate={true}
      >
        <AppContent />
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
