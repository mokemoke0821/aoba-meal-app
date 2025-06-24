import { CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import AdminPanel from './components/AdminPanel';
import CategorySelector from './components/CategorySelector';
import ErrorBoundary from './components/ErrorBoundary';
// import MenuManagement from './components/MenuManagement';
import StatisticsPanel from './components/StatisticsPanel';
import UserManagement from './components/UserManagement';
import UserSelector from './components/UserSelector';
import { AppProvider, useApp } from './contexts/AppContext';
import aobaTheme from './theme';

// UserManagementコンポーネントをラップして必要なpropsを提供
const UserManagementWrapper: React.FC = () => {
  const { state, dispatch } = useApp();

  const handleUpdateUsers = (users: any[]) => {
    dispatch({ type: 'SET_USERS', payload: users });
  };

  const handleBack = () => {
    dispatch({ type: 'SET_VIEW', payload: 'admin' });
  };

  return (
    <UserManagement
      users={state.users}
      onUpdateUsers={handleUpdateUsers}
      onBack={handleBack}
    />
  );
};

// StatisticsPanelコンポーネントをラップして必要なpropsを提供
const StatisticsPanelWrapper: React.FC = () => {
  const { dispatch } = useApp();

  const handleBack = () => {
    dispatch({ type: 'SET_VIEW', payload: 'admin' });
  };

  return (
    <StatisticsPanel onBack={handleBack} />
  );
};

// MenuManagementコンポーネントをラップして必要なpropsを提供
// const MenuManagementWrapper: React.FC = () => {
//   const { dispatch } = useApp();
//   
//   const handleBack = () => {
//     dispatch({ type: 'SET_VIEW', payload: 'admin' });
//   };
//   
//   return (
//     <MenuManagement onBack={handleBack} />
//   );
// };

// Settingsコンポーネントをラップして必要なpropsを提供
// const SettingsWrapper: React.FC = () => {
//   const { dispatch } = useApp();
//   
//   const handleBack = () => {
//     dispatch({ type: 'SET_VIEW', payload: 'admin' });
//   };
//   
//   return (
//     <Settings onBack={handleBack} />
//   );
// };

// ビュー別コンポーネントマッピング
const VIEW_COMPONENTS = {
  categorySelect: CategorySelector,
  userSelect: UserSelector,
  mealOrder: () => <div>給食注文</div>,
  rating: () => <div>評価入力</div>,
  admin: AdminPanel,
  adminAuth: () => <div>管理者認証</div>,
  statistics: StatisticsPanelWrapper,
  userManagement: UserManagementWrapper,
  menuManagement: () => <div>メニュー管理（準備中）</div>,
  settings: () => <div>設定（準備中）</div>,
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
      <div className="app-container" style={{ minHeight: '100vh', padding: '20px' }}>
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
