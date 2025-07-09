import { Alert, AlertColor, Snackbar } from '@mui/material';
import { createContext, ReactNode, useContext, useState } from 'react';

export interface NotificationMessage {
  id: string;
  message: string;
  type: AlertColor;
  duration?: number;
}

interface NotificationContextType {
  showNotification: (message: string, type: AlertColor, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);

  const showNotification = (message: string, type: AlertColor, duration: number = 3000) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: NotificationMessage = { id, message, type, duration };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // 自動消去タイマー
    setTimeout(() => {
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    }, duration);
  };

  const showSuccess = (message: string, duration: number = 3000) => {
    showNotification(message, 'success', duration);
  };

  const showError = (message: string, duration: number = 4000) => {
    showNotification(message, 'error', duration);
  };

  const showInfo = (message: string, duration: number = 3000) => {
    showNotification(message, 'info', duration);
  };

  const showWarning = (message: string, duration: number = 3500) => {
    showNotification(message, 'warning', duration);
  };

  const handleClose = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  return (
    <NotificationContext.Provider value={{
      showNotification,
      showSuccess,
      showError,
      showInfo,
      showWarning
    }}>
      {children}
      
      {/* 複数通知対応のSnackbar */}
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={true}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{ 
            position: 'fixed',
            top: `${100 + (index * 80)}px`, // 複数通知を縦に並べる
            zIndex: 9999 
          }}
        >
          <Alert
            onClose={() => handleClose(notification.id)}
            severity={notification.type}
            variant="filled"
            sx={{
              width: '100%',
              fontSize: '1.1rem',
              fontWeight: 600,
              '& .MuiAlert-icon': {
                fontSize: '1.5rem'
              }
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
} 