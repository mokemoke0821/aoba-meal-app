import { CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import AdminPanel from './components/AdminPanel';
import CategorySelector from './components/CategorySelector';
import ErrorBoundary from './components/ErrorBoundary';
import MealOrder from './components/MealOrder';
import SettingsPage from './components/SettingsPage';
import StatisticsPanel from './components/StatisticsPanel';
import UserManagement from './components/UserManagement';
import UserSelector from './components/UserSelector';
import { AppProvider, useApp } from './contexts/AppContext';
import aobaTheme from './theme';
import { User } from './types';

// --- Placeholder Components for missing files ---
const AdminAuth: React.FC = () => <div>Admin Auth (Placeholder)</div>;
const MealRating: React.FC = () => <div>Meal Rating (Placeholder)</div>;
const MenuManagement: React.FC = () => <div>Menu Management (Placeholder)</div>;
const PrintReports: React.FC = () => <div>Print Reports (Placeholder)</div>;
const DailyReport: React.FC = () => <div>Daily Report (Placeholder)</div>;
const WeeklyReport: React.FC = () => <div>Weekly Report (Placeholder)</div>;
const MonthlyReport: React.FC = () => <div>Monthly Report (Placeholder)</div>;
const BillingReport: React.FC = () => <div>Billing Report (Placeholder)</div>;

const VIEW_COMPONENTS = {
  categorySelect: CategorySelector,
  userSelect: UserSelector,
  mealOrder: MealOrder,
  rating: MealRating,
  admin: AdminPanel,
  adminAuth: AdminAuth,
  statistics: StatisticsPanel,
  userManagement: UserManagement,
  menuManagement: MenuManagement,
  settings: SettingsPage,
  printReports: PrintReports,
  dailyReport: DailyReport,
  weeklyReport: WeeklyReport,
  monthlyReport: MonthlyReport,
  billingReport: BillingReport,
};

// メインアプリケーションコンポーネント
const AppContent: React.FC = () => {
  const { state, dispatch, clearAllData } = useApp();
  const { currentView, selectedUser } = state;

  const handleNavigation = (view: keyof typeof VIEW_COMPONENTS) => {
    dispatch({ type: 'SET_CURRENT_VIEW', payload: view });
  };

  const handleUpdateUsers = (users: User[]) => {
    dispatch({ type: 'SET_USERS', payload: users });
  };

  const handleUpdateSettings = (settings: any) => {
    localStorage.setItem('aobaSettings', JSON.stringify(settings));
  };

  const handleExportData = () => {
    return JSON.stringify({
      users: state.users,
      mealRecords: state.mealRecords,
      currentDate: new Date().toISOString()
    });
  };

  const handleImportData = (data: string) => {
    const parsedData = JSON.parse(data);
    if (parsedData.users) {
      dispatch({ type: 'SET_USERS', payload: parsedData.users });
    }
    if (parsedData.mealRecords) {
      dispatch({ type: 'SET_MEAL_RECORDS', payload: parsedData.mealRecords });
    }
  };

  const renderCurrentView = () => {
    if (currentView === 'mealOrder' && selectedUser) {
      return <MealOrder />;
    }

    if (currentView === 'admin') {
      return (
        <AdminPanel
          onNavigateToUserManagement={() => handleNavigation('userManagement')}
          onNavigateToStatistics={() => handleNavigation('statistics')}
          onNavigateToSettings={() => handleNavigation('settings')}
          onNavigateToDailyReport={() => handleNavigation('dailyReport')}
          onNavigateToWeeklyReport={() => handleNavigation('weeklyReport')}
          onNavigateToMonthlyReport={() => handleNavigation('monthlyReport')}
          onNavigateToBillingReport={() => handleNavigation('billingReport')}
          onClose={() => handleNavigation('categorySelect')}
        />
      );
    }

    if (currentView === 'statistics') {
      return <StatisticsPanel onBack={() => handleNavigation('admin')} />;
    }

    if (currentView === 'userManagement') {
      return <UserManagement users={state.users} onUpdateUsers={handleUpdateUsers} onBack={() => handleNavigation('admin')} />;
    }

    if (currentView === 'settings') {
      return (
        <SettingsPage
          onBack={() => handleNavigation('admin')}
          onUpdateSettings={handleUpdateSettings}
          onExportData={handleExportData}
          onImportData={handleImportData}
          onClearData={clearAllData}
        />
      );
    }

    const ViewComponent = VIEW_COMPONENTS[currentView] || UserSelector;
    return <ViewComponent />;
  };

  return (
    <>
      <CssBaseline />
      {renderCurrentView()}
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
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
