import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import React, { useEffect } from 'react';
import AdminPanel from './components/AdminPanel';
import CategorySelector from './components/CategorySelector';
import InstallPrompt from './components/InstallPrompt';
import MealOrder from './components/MealOrder';
import { PlaceholderPage } from './components/PlaceholderPage';
import RatingInput from './components/RatingInput';
import StatisticsPanel from './components/StatisticsPanel';
import UserManagement from './components/UserManagement';
import UserSelector from './components/UserSelector';
import { AppProvider, useApp } from './contexts/AppContext';
import { NotificationProvider } from './contexts/NotificationContext';
// Google Drive統合は今後実装予定（現在は簡易バックアップ機能のみ使用）
// import { GoogleDriveProvider } from './contexts/GoogleDriveContext';
import { register as registerServiceWorker } from './registerServiceWorker';
import { User } from './types';
import { loadBackupConfig, saveBackupToCustomPath } from './utils/storage';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Wrapper components to provide proper props
const UserManagementWrapper: React.FC = () => {
  const { state, dispatch } = useApp();

  const handleUpdateUsers = (users: User[]) => {
    dispatch({ type: 'SET_USERS', payload: users });
  };

  return (
    <UserManagement
      users={state.users}
      onUpdateUsers={handleUpdateUsers}
      onBack={() => dispatch({ type: 'SET_VIEW', payload: 'adminPanel' })}
    />
  );
};

const StatisticsPanelWrapper: React.FC = () => {
  const { dispatch } = useApp();
  return (
    <StatisticsPanel
      onBack={() => dispatch({ type: 'SET_VIEW', payload: 'adminPanel' })}
    />
  );
};

const MealOrderWrapper: React.FC = () => {
  const { dispatch } = useApp();
  return (
    <MealOrder
      onBack={() => dispatch({ type: 'SET_VIEW', payload: 'userSelect' })}
    />
  );
};

const RatingInputWrapper: React.FC = () => {
  const { dispatch } = useApp();
  return (
    <RatingInput
      onBack={() => dispatch({ type: 'SET_VIEW', payload: 'userSelect' })}
    />
  );
};

export const AppContent: React.FC = () => {
  const { state, dispatch } = useApp();

  const renderCurrentView = () => {
    switch (state.currentView) {
      case 'categorySelect':
        return <CategorySelector />;
      case 'userSelect':
        return <UserSelector />;
      case 'admin':
      case 'adminPanel':
        return <AdminPanel />;
      case 'userManagement':
        return <UserManagementWrapper />;
      case 'statistics':
        return <StatisticsPanelWrapper />;
      case 'mealOrder':
        return <MealOrderWrapper />;
      case 'rating':
        return <RatingInputWrapper />;
      case 'adminAuth':
        return (
          <PlaceholderPage
            title="管理者認証"
            description="管理者としてログインしてください"
            onBack={() => dispatch({ type: 'SET_VIEW', payload: 'categorySelect' })}
          />
        );
      default:
        return <CategorySelector />;
    }
  };

  return (
    <div className="App">
      {renderCurrentView()}
    </div>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    // Service Worker登録（production環境のみ）
    registerServiceWorker({
      onSuccess: () => {
        // PWAインストール完了
      },
      onUpdate: () => {
        // 新しいコンテンツ利用可能
      },
    });

    // 自動バックアップタイマー設定
    const config = loadBackupConfig();
    if (config.enabled) {
      const intervalId = setInterval(async () => {
        try {
          await saveBackupToCustomPath(config.customPath);
        } catch (error) {
          console.error('[自動バックアップ] 失敗:', error);
        }
      }, config.frequency);

      // クリーンアップ
      return () => {
        clearInterval(intervalId);
      };
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        {/* Google Drive統合は今後実装予定 */}
        {/* <GoogleDriveProvider> */}
        <AppProvider>
          <AppContent />
          <InstallPrompt />
        </AppProvider>
        {/* </GoogleDriveProvider> */}
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;
