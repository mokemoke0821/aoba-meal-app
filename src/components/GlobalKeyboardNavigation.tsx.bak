import React, { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

const GlobalKeyboardNavigation: React.FC = () => {
    const { state, navigateToView } = useApp();

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            // Escキーで戻る機能
            if (event.key === 'Escape') {
                switch (state.currentView) {
                    case 'mealOrder':
                    case 'rating':
                        navigateToView('userSelect');
                        break;
                    case 'userManagement':
                    case 'statistics':
                    case 'settings':
                    case 'printReports':
                    case 'menuManagement':
                        navigateToView('admin');
                        break;
                    case 'admin':
                        navigateToView('userSelect');
                        break;
                    default:
                        break;
                }
            }

            // Alt + Hでホームに戻る
            if (event.altKey && event.key === 'h') {
                event.preventDefault();
                navigateToView('userSelect');
            }

            // Alt + Aで管理画面に移動
            if (event.altKey && event.key === 'a') {
                event.preventDefault();
                if (state.currentView !== 'admin') {
                    navigateToView('admin');
                }
            }
        };

        document.addEventListener('keydown', handleKeyPress);

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [state.currentView, navigateToView]);

    return null; // このコンポーネントは何もレンダリングしません
};

export default GlobalKeyboardNavigation; 