import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import React from 'react';
import AdminPanel from './components/AdminPanel';
import CategorySelector from './components/CategorySelector';
import MealOrder from './components/MealOrder';
import MenuManagement from './components/MenuManagement';
import { PlaceholderPage } from './components/PlaceholderPage';
import RatingInput from './components/RatingInput';
import Settings from './components/Settings';
import StatisticsPanel from './components/StatisticsPanel';
import UserManagement from './components/UserManagement';
import UserSelector from './components/UserSelector';
import { AppProvider, useApp } from './contexts/AppContext';
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

const MenuManagementWrapper: React.FC = () => {
  const { dispatch } = useApp();
  return (
    <MenuManagement
      onBack={() => dispatch({ type: 'SET_VIEW', payload: 'adminPanel' })}
    />
  );
};

const SettingsWrapper: React.FC = () => {
  const { dispatch } = useApp();
  return (
    <Settings
      onBack={() => dispatch({ type: 'SET_VIEW', payload: 'adminPanel' })}
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
      case 'menuManagement':
        return <MenuManagementWrapper />;
      case 'settings':
        return <SettingsWrapper />;
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
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;
