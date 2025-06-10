import { ArrowBack as ArrowBackIcon, Construction as ConstructionIcon } from '@mui/icons-material';
import { Button, Card, CardContent, Container, CssBaseline, ThemeProvider, Typography } from '@mui/material';
import React from 'react';
import AdminPanel from './components/AdminPanel';
import ErrorBoundary from './components/ErrorBoundary';
import MealOrder from './components/MealOrder';
// import MenuManagement from './components/MenuManagement';
// import PrintReports from './components/PrintReports';
import RatingInput from './components/RatingInput';
// import Settings from './components/Settings';
import StatisticsPanel from './components/StatisticsPanel';
import UserManagement from './components/UserManagement';
import UserSelector from './components/UserSelector';
import { AppProvider, useApp } from './contexts/AppContext';
import aobaTheme from './theme';

// 準備中画面コンポーネント
const ComingSoonPage: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
  <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
    <Card sx={{ borderRadius: '16px', boxShadow: 4 }}>
      <CardContent sx={{ p: 6 }}>
        <ConstructionIcon sx={{ fontSize: '4rem', color: 'warning.main', mb: 3 }} />
        <Typography variant="h3" sx={{ mb: 3, fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          この機能は現在準備中です
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          より良いサービスを提供するため、機能を開発中です。<br />
          しばらくお待ちください。
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          sx={{
            minHeight: '60px',
            fontSize: '1.25rem',
            fontWeight: 600,
            borderRadius: '12px',
            px: 4,
          }}
        >
          管理画面に戻る
        </Button>
      </CardContent>
    </Card>
  </Container>
);

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
            onNavigateToSettings={handleNavigateToSettings}
            onClose={handleBackToMain}
          />
        );
      case 'statistics':
        return <StatisticsPanel onBack={handleBackToAdmin} />;
      case 'userManagement':
        return (
          <UserManagement
            users={state.users}
            onUpdateUsers={handleUpdateUsers}
            onBack={handleBackToAdmin}
          />
        );
      case 'menuManagement':
        return <ComingSoonPage title="メニュー管理機能" onBack={handleBackToAdmin} />;
      case 'settings':
        return <ComingSoonPage title="設定機能" onBack={handleBackToAdmin} />;
      case 'printReports':
        return <ComingSoonPage title="印刷機能" onBack={handleBackToAdmin} />;
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
