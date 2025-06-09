import { createTheme, Theme } from '@mui/material/styles';

// 大きなボタン用のカスタムテーマ
export const aobaTheme: Theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
            dark: '#1565c0',
            light: '#42a5f5',
        },
        secondary: {
            main: '#dc004e',
            dark: '#c51162',
            light: '#ff5983',
        },
        success: {
            main: '#2e7d32',
            dark: '#1b5e20',
            light: '#4caf50',
        },
        warning: {
            main: '#f57c00',
            dark: '#ef6c00',
            light: '#ff9800',
        },
        error: {
            main: '#d32f2f',
            dark: '#c62828',
            light: '#ef5350',
        },
        background: {
            default: '#f5f5f5',
            paper: '#ffffff',
        },
        text: {
            primary: '#212121',
            secondary: '#757575',
        },
    },
    typography: {
        fontSize: 16,
        h1: {
            fontSize: '2.5rem',
            fontWeight: 700,
            color: '#212121',
        },
        h2: {
            fontSize: '2rem',
            fontWeight: 600,
            color: '#212121',
        },
        h3: {
            fontSize: '1.75rem',
            fontWeight: 600,
            color: '#212121',
        },
        h4: {
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#212121',
        },
        button: {
            fontSize: '1.25rem',
            fontWeight: 600,
            textTransform: 'none',
        },
        body1: {
            fontSize: '1.125rem',
            lineHeight: 1.6,
        },
        body2: {
            fontSize: '1rem',
            lineHeight: 1.6,
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    minHeight: '80px',
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    padding: '16px 32px',
                    margin: '8px',
                    borderRadius: '12px',
                    textTransform: 'none',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    '&:hover': {
                        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
                        transform: 'scale(1.02)',
                    },
                    '&:active': {
                        transform: 'scale(0.98)',
                    },
                },
                sizeLarge: {
                    minHeight: '100px',
                    fontSize: '1.75rem',
                    padding: '20px 40px',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '16px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                    border: '2px solid transparent',
                    '&:hover': {
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                        transform: 'translateY(-2px)',
                    },
                },
            },
        },
        MuiCardActionArea: {
            styleOverrides: {
                root: {
                    minHeight: '120px',
                    padding: '16px',
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    minWidth: '60px',
                    minHeight: '60px',
                    fontSize: '2rem',
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: '16px',
                    padding: '16px',
                },
            },
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    fontSize: '1.75rem',
                    fontWeight: 600,
                    textAlign: 'center',
                },
            },
        },
        MuiDialogContent: {
            styleOverrides: {
                root: {
                    fontSize: '1.25rem',
                    textAlign: 'center',
                    padding: '24px',
                },
            },
        },
        MuiDialogActions: {
            styleOverrides: {
                root: {
                    justifyContent: 'center',
                    gap: '16px',
                    padding: '24px',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiInputBase-root': {
                        fontSize: '1.25rem',
                        minHeight: '60px',
                    },
                    '& .MuiInputLabel-root': {
                        fontSize: '1.125rem',
                    },
                },
            },
        },
    },
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 960,
            lg: 1280,
            xl: 1920,
        },
    },
    spacing: 8,
});

export default aobaTheme; 