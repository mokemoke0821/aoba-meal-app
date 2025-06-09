import { CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import AdminPanel from './components/AdminPanel';
import MealOrder from './components/MealOrder';
import MenuManagement from './components/MenuManagement';
import PrintReports from './components/PrintReports';
import RatingInput from './components/RatingInput';
import Settings from './components/Settings';
import Statistics from './components/Statistics';
import UserManagement from './components/UserManagement';
import UserSelector from './components/UserSelector';
import { AppProvider, useApp } from './contexts/AppContext';
import aobaTheme from './theme';

// メインアプリケーションコンポーネント
const AppContent: React.FC = () => {
  const { state, dispatch } = useApp();

  // 管理画面のナビゲーションハンドラー
  const handleNavigateToUserManagement = () => {
    dispatch({ type: 'SET_CURRENT_VIEW', payload: 'userManagement' });
  };

  const handleNavigateToStatistics = () => {
    dispatch({ type: 'SET_CURRENT_VIEW', payload: 'statistics' });
  };

  const handleNavigateToMenuManagement = () => {
    dispatch({ type: 'SET_CURRENT_VIEW', payload: 'menuManagement' });
  };

  const handleNavigateToSettings = () => {
    dispatch({ type: 'SET_CURRENT_VIEW', payload: 'settings' });
  };

  const handleNavigateToPrintReports = () => {
    dispatch({ type: 'SET_CURRENT_VIEW', payload: 'printReports' });
  };

  const handleBackToAdmin = () => {
    dispatch({ type: 'SET_CURRENT_VIEW', payload: 'admin' });
  };

  const handleBackToMain = () => {
    dispatch({ type: 'SET_CURRENT_VIEW', payload: 'userSelect' });
  };

  // Users update handler
  const handleUpdateUsers = (users: any[]) => {
    dispatch({ type: 'SET_USERS', payload: users });
  };

  // Settings handlers
  const handleUpdateSettings = (settings: any) => {
    // Save settings to localStorage
    localStorage.setItem('aobaSettings', JSON.stringify(settings));
  };

  const handleExportData = () => {
    return JSON.stringify({
      users: state.users,
      mealHistory: state.mealHistory || [],
      currentDate: new Date().toISOString()
    });
  };

  const handleImportData = (data: string) => {
    try {
      const parsedData = JSON.parse(data);
      if (parsedData.users) {
        dispatch({ type: 'SET_USERS', payload: parsedData.users });
      }
      // Note: SET_MEAL_HISTORY action needs to be added to context
    } catch (error) {
      console.error('Failed to import data:', error);
    }
  };

  const handleClearData = () => {
    // Clear users data
    dispatch({ type: 'SET_USERS', payload: [] });
    // Clear meal records
    dispatch({ type: 'SET_MEAL_RECORDS', payload: [] });
    // Clear localStorage
    localStorage.removeItem('aobaAppData');
    localStorage.removeItem('aobaSettings');
  };

  // Facility info
  const facilityInfo = {
    name: 'あおば障害者支援事業所',
    address: '〒123-4567 東京都あおば区...',
    phone: '03-1234-5678',
    email: 'info@aoba-facility.jp'
  };

  // 現在のビューに応じて適切なコンポーネントを表示
  const renderCurrentView = () => {
    switch (state.currentView) {
      case 'userSelect':
        return <UserSelector />;
      case 'mealOrder':
        return <MealOrder />;
      case 'rating':
        return <RatingInput />;
      case 'admin':
        return (
          <AdminPanel
            onNavigateToUserManagement={handleNavigateToUserManagement}
            onNavigateToStatistics={handleNavigateToStatistics}
            onNavigateToMenuManagement={handleNavigateToMenuManagement}
            onNavigateToSettings={handleNavigateToSettings}
            onNavigateToPrintReports={handleNavigateToPrintReports}
            onClose={handleBackToMain}
          />
        );
      case 'statistics':
        return <Statistics onBack={handleBackToAdmin} />;
      case 'userManagement':
        return (
          <UserManagement
            users={state.users}
            onUpdateUsers={handleUpdateUsers}
          />
        );
      case 'menuManagement':
        return (
          <MenuManagement
            dailyMenus={[]} // Placeholder until context is updated
            menuHistory={state.mealHistory || []}
            onUpdateMenus={(menus) => {
              // Placeholder until SET_DAILY_MENUS action is added
              console.log('Update menus:', menus);
            }}
          />
        );
      case 'settings':
        return (
          <Settings
            appData={{
              users: state.users,
              mealHistory: state.mealHistory || []
            }}
            onUpdateSettings={handleUpdateSettings}
            onExportData={handleExportData}
            onImportData={handleImportData}
            onClearData={handleClearData}
          />
        );
      case 'printReports':
        return (
          <PrintReports
            users={state.users}
            mealHistory={state.mealHistory || []}
            facilityInfo={facilityInfo}
          />
        );
      default:
        return <UserSelector />;
    }
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
  return (
    <ThemeProvider theme={aobaTheme}>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;
