import { Box, Button, CssBaseline, ThemeProvider, Typography } from '@mui/material';
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

// 共通の戻るボタン付きプレースホルダーコンポーネント
const PlaceholderPage: React.FC<{ title: string; backTo?: string }> = ({ title, backTo = 'admin' }) => {
  const { dispatch } = useApp();

  const handleBack = () => {
    dispatch({ type: 'SET_VIEW', payload: backTo as any });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          ← 戻る
        </Button>
        <Typography variant="h4">
          {title}
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary">
        この機能は準備中です。
      </Typography>
    </Box>
  );
};

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

// 給食注文ページ
const MealOrderPage: React.FC = () => {
  const { dispatch } = useApp();

  const handleBack = () => {
    dispatch({ type: 'SET_VIEW', payload: 'userSelect' });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          ← 戻る
        </Button>
        <Typography variant="h4">
          給食注文
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary">
        給食注文機能は準備中です。
      </Typography>
    </Box>
  );
};

// 評価入力ページ
const RatingPage: React.FC = () => {
  const { dispatch } = useApp();

  const handleBack = () => {
    dispatch({ type: 'SET_VIEW', payload: 'userSelect' });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          ← 戻る
        </Button>
        <Typography variant="h4">
          評価入力
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary">
        評価入力機能は準備中です。
      </Typography>
    </Box>
  );
};

// 管理者認証ページ
const AdminAuthPage: React.FC = () => {
  const { dispatch } = useApp();

  const handleBack = () => {
    dispatch({ type: 'SET_VIEW', payload: 'categorySelect' });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          ← 戻る
        </Button>
        <Typography variant="h4">
          管理者認証
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary">
        管理者認証機能は準備中です。
      </Typography>
    </Box>
  );
};

// ビュー別コンポーネントマッピング
const VIEW_COMPONENTS = {
  categorySelect: CategorySelector,
  userSelect: UserSelector,
  mealOrder: MealOrderPage,
  rating: RatingPage,
  admin: AdminPanel,
  adminAuth: AdminAuthPage,
  statistics: StatisticsPanelWrapper,
  userManagement: UserManagementWrapper,
  menuManagement: () => <PlaceholderPage title="メニュー管理" backTo="admin" />,
  settings: () => <PlaceholderPage title="設定" backTo="admin" />,
  printReports: () => <PlaceholderPage title="レポート印刷" backTo="admin" />,
  dailyReport: () => <PlaceholderPage title="日次レポート" backTo="admin" />,
  weeklyReport: () => <PlaceholderPage title="週次レポート" backTo="admin" />,
  monthlyReport: () => <PlaceholderPage title="月次レポート" backTo="admin" />,
  billingReport: () => <PlaceholderPage title="料金レポート" backTo="admin" />,
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
