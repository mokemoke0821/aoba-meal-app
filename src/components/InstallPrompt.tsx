import React, { useState, useEffect } from 'react';
import { Snackbar, Button, Box } from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // デフォルトの動作を防止
      e.preventDefault();
      
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // インストールプロンプトを表示
    deferredPrompt.prompt();

    // ユーザーの選択を待つ
    await deferredPrompt.userChoice;

    // プロンプトを閉じる
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleClose = () => {
    setShowInstallPrompt(false);
  };

  return (
    <Snackbar
      open={showInstallPrompt}
      onClose={handleClose}
      message="このアプリをホーム画面に追加できます"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      action={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            color="secondary"
            size="small"
            onClick={handleInstallClick}
            startIcon={<GetAppIcon />}
            variant="contained"
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0',
              },
            }}
          >
            インストール
          </Button>
          <Button color="inherit" size="small" onClick={handleClose}>
            閉じる
          </Button>
        </Box>
      }
      sx={{
        '& .MuiSnackbarContent-root': {
          backgroundColor: '#424242',
          color: '#fff',
          fontSize: '0.95rem',
          minWidth: '320px',
        },
      }}
    />
  );
};

export default InstallPrompt;
