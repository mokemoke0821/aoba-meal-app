import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import React from 'react';
import AdminPanel from './components/AdminPanel';
import CategorySelector from './components/CategorySelector';
import MealOrder from './components/MealOrder';
import { PlaceholderPage } from './components/PlaceholderPage';
import RatingInput from './components/RatingInput';
import StatisticsPanel from './components/StatisticsPanel';
import UserManagement from './components/UserManagement';
import UserSelector from './components/UserSelector';
import { AppProvider, useApp } from './contexts/AppContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { User } from './types';

const theme = createTheme({
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

const AppContent: React.FC = () => {
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
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;
