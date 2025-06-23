import { CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import AdminPanel from './components/AdminPanel';
import ErrorBoundary from './components/ErrorBoundary';
import SettingsPage from './components/SettingsPage';
// import StatisticsPanel from './components/StatisticsPanel';
// import UserManagement from './components/UserManagement';
import UserSelector from './components/UserSelector';
import { AppProvider, useApp } from './contexts/AppContext';
import aobaTheme from './theme';

// ビュー別コンポーネントマッピング
const VIEW_COMPONENTS = {
  categorySelect: () => <div>カテゴリ選択</div>,
  userSelect: UserSelector,
  mealOrder: () => <div>給食注文</div>,
  rating: () => <div>評価入力</div>,
  admin: AdminPanel,
  adminAuth: () => <div>管理者認証</div>,
  statistics: () => <div>統計</div>,
  userManagement: () => <div>ユーザー管理</div>,
  menuManagement: () => <div>メニュー管理</div>,
  settings: SettingsPage,
  printReports: () => <div>レポート印刷</div>,
  dailyReport: () => <div>日次レポート</div>,
  weeklyReport: () => <div>週次レポート</div>,
  monthlyReport: () => <div>月次レポート</div>,
  billingReport: () => <div>料金レポート</div>,
} as const;

// メインアプリケーションコンポーネント
const AppContent: React.FC = () => {
  const { state } = useApp();
  const CurrentComponent = VIEW_COMPONENTS[state.currentView];

  return (
    <>
      <CssBaseline />
      <div className="app-container">
        <CurrentComponent />
      </div>
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
      <AppProvider>
        <ErrorBoundary
          onError={handleGlobalError}
          resetOnNavigate={true}
        >
          <AppContent />
        </ErrorBoundary>
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;
