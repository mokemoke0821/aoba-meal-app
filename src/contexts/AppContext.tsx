import {
    Alert,
    AlertColor,
    Snackbar,
    ThemeProvider,
} from '@mui/material';
import { format } from 'date-fns';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useReducer, useState } from 'react';
import { AppAction, AppState, MealRecord, MenuItem, migrateUserFromGroup, User, UserCategory } from '../types';
import { validateMealRecord, validateUser } from '../utils/dataValidator';
import {
    loadCurrentMenu,
    loadMealRecords,
    loadUsers
} from '../utils/storage';
import { storageManager } from '../utils/storageManager';
import { appReducer, loadInitialData } from './appReducer';

// エラー状態の型定義
interface ErrorState {
    hasError: boolean;
    message: string;
    details: string | null;
    timestamp: string;
}

// 初期状態
const initialState: AppState = {
    users: [],
    mealRecords: [],
    currentMenu: null,
    selectedUser: null,
    selectedCategory: null,
    currentView: 'categorySelect',
    dailyMenus: [],
    requireAdminAuth: false,
};

// 初期エラー状態
const initialErrorState: ErrorState = {
    hasError: false,
    message: '',
    details: null,
    timestamp: '',
};

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
    switch (action.type) {
        case 'SET_USERS':
            return { ...state, users: action.payload };

        case 'ADD_USER':
            return { ...state, users: [...state.users, action.payload] };

        case 'UPDATE_USER':
            return {
                ...state,
                users: state.users.map(user =>
                    user.id === action.payload.id ? action.payload : user
                ),
            };

        case 'DELETE_USER':
            return {
                ...state,
                users: state.users.filter(user => user.id !== action.payload),
            };

        case 'SET_MEAL_RECORDS':
            return { ...state, mealRecords: action.payload };

        case 'ADD_MEAL_RECORD':
            return { ...state, mealRecords: [...state.mealRecords, action.payload] };

        case 'SET_CURRENT_MENU':
            return { ...state, currentMenu: action.payload };

        case 'SET_SELECTED_USER':
            return { ...state, selectedUser: action.payload };

        case 'SET_SELECTED_CATEGORY':
            return { ...state, selectedCategory: action.payload };

        case 'SET_CURRENT_VIEW':
            return { ...state, currentView: action.payload };

        case 'SET_REQUIRE_ADMIN_AUTH':
            return { ...state, requireAdminAuth: action.payload };

        case 'RESET_STATE':
            return action.payload;

        default:
            return state;
    }
};

// Context型定義
interface AppContextType {
    state: AppState;
    dispatch: React.Dispatch<AppAction>;
    errorState: ErrorState;

    // エラーハンドリング関数
    clearError: () => void;
    setError: (message: string, details?: string) => void;

    // 安全なヘルパー関数
    addUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>;
    updateUser: (user: User) => Promise<{ success: boolean; error?: string }>;
    deleteUser: (userId: string) => Promise<{ success: boolean; error?: string }>;
    selectUser: (user: User) => void;
    addMealRecord: (userId: string, rating: number) => Promise<{ success: boolean; error?: string }>;
    setCurrentMenu: (menu: MenuItem) => void;
    navigateToView: (view: AppState['currentView']) => void;

    // カテゴリ関連ヘルパー関数
    selectCategory: (category: UserCategory) => void;
    getUsersByCategory: (category: UserCategory) => User[];
    getCategoryUsers: () => Record<UserCategory, User[]>;
    migrateOldData: () => Promise<{ success: boolean; migrated: boolean; error?: string }>;

    // 安全なデータ取得関数
    getTodayMealRecords: () => MealRecord[];
    getUserMealHistory: (userId: string) => MealRecord[];

    // データ管理関数
    saveAllData: () => Promise<{ success: boolean; error?: string }>;
    loadAllData: () => Promise<{ success: boolean; error?: string; warning?: string }>;
    resetAllData: () => Promise<{ success: boolean; error?: string }>;
    getStorageStats: () => any;
    setRequireAdminAuth: (flag: boolean) => void;

    // 新しい関数
    showSnackbar: (message: string, severity?: AlertColor) => void;
    clearAllData: () => Promise<void>;
}

// Context作成
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider Props
interface AppProviderProps {
    children: ReactNode;
    initialStateForTest?: AppState;
}

// Provider Component
export const AppProvider: React.FC<AppProviderProps> = ({ children, initialStateForTest }) => {
    const [state, dispatch] = useReducer(appReducer, initialStateForTest || loadInitialData());
    const [errorState, setErrorState] = useState<ErrorState>({
        hasError: false,
        message: '',
        details: null,
        timestamp: '',
    });
    const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: AlertColor }>({
        open: false,
        message: '',
        severity: 'info',
    });

    // エラー管理関数
    const clearError = () => {
        setErrorState(initialErrorState);
    };

    const setError = (message: string, details?: string) => {
        const newErrorState: ErrorState = {
            hasError: true,
            message,
            details,
            timestamp: new Date().toISOString(),
        };
        setErrorState(newErrorState);

        // コンソールにもログ出力
        console.group('🚨 AppContext Error');
        console.error('Error:', message);
        if (details) {
            console.error('Details:', details);
        }
        console.groupEnd();
    };

    // 安全なデータ保存
    const saveAllData = async (): Promise<{ success: boolean; error?: string }> => {
        try {
            const result = storageManager.saveData(state);
            if (!result.success) {
                setError('データの保存に失敗しました', result.error);
                return { success: false, error: result.error };
            }
            return { success: true };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '不明なエラー';
            setError('データ保存中にエラーが発生しました', errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    // 安全なデータ読み込み
    const loadAllData = useCallback(async (): Promise<{ success: boolean; error?: string; warning?: string }> => {
        try {
            const result = storageManager.loadData();
            if (!result.success) {
                setError('データの読み込みに失敗しました', result.error);
                return { success: false, error: result.error };
            }

            if (result.data) {
                dispatch({ type: 'SET_USERS', payload: result.data.users || [] });
                dispatch({ type: 'SET_MEAL_RECORDS', payload: result.data.mealRecords || [] });
                if (result.data.selectedUser) {
                    dispatch({ type: 'SET_SELECTED_USER', payload: result.data.selectedUser });
                }
                if (result.data.currentView) {
                    dispatch({ type: 'SET_CURRENT_VIEW', payload: result.data.currentView });
                }
            }

            return {
                success: true,
                warning: result.warning
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '不明なエラー';
            setError('データ読み込み中にエラーが発生しました', errorMessage);
            return { success: false, error: errorMessage };
        }
    }, [dispatch]);

    // 全データリセット
    const resetAllData = async (): Promise<{ success: boolean; error?: string }> => {
        try {
            const result = storageManager.resetAllData();
            if (!result.success) {
                setError('データのリセットに失敗しました', result.error);
                return { success: false, error: result.error };
            }

            // 状態をクリア
            dispatch({ type: 'SET_USERS', payload: [] });
            dispatch({ type: 'SET_MEAL_RECORDS', payload: [] });
            dispatch({ type: 'SET_SELECTED_USER', payload: null });
            dispatch({ type: 'SET_CURRENT_VIEW', payload: 'userSelect' });
            dispatch({ type: 'SET_CURRENT_MENU', payload: null });

            clearError();
            return { success: true };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '不明なエラー';
            setError('データリセット中にエラーが発生しました', errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    // ストレージ統計取得
    const getStorageStats = () => {
        return storageManager.getStorageStats();
    };

    // 初期データ読み込み（従来の方法をフォールバックとして維持）
    useEffect(() => {
        const initializeData = async () => {
            // 新しいStorageManagerでの読み込みを試行
            const storageResult = await loadAllData();

            if (!storageResult.success) {
                // フォールバック: 従来の方法で読み込み
                console.warn('StorageManagerでの読み込みに失敗。従来の方法を試行します。');

                try {
                    const users = loadUsers();
                    const mealRecords = loadMealRecords();
                    const currentMenu = loadCurrentMenu();

                    dispatch({ type: 'SET_USERS', payload: users });
                    dispatch({ type: 'SET_MEAL_RECORDS', payload: mealRecords });

                    if (currentMenu) {
                        dispatch({ type: 'SET_CURRENT_MENU', payload: currentMenu });
                    }

                    // 初期データがない場合はサンプルデータを設定
                    if (users.length === 0 && !currentMenu) {
                        import('../utils/initialData').then(({ setupInitialData }) => {
                            setupInitialData();
                            // 設定後にデータを再読み込み
                            const newUsers = loadUsers();
                            const newMenu = loadCurrentMenu();
                            dispatch({ type: 'SET_USERS', payload: newUsers });
                            if (newMenu) {
                                dispatch({ type: 'SET_CURRENT_MENU', payload: newMenu });
                            }
                        });
                    }
                } catch (error) {
                    setError('初期データの読み込みに失敗しました', error instanceof Error ? error.message : '不明なエラー');
                }
            } else if (storageResult.warning) {
                console.warn('データ読み込み時の警告:', storageResult.warning);
            }
        };

        initializeData();
    }, [loadAllData]);

    // 自動保存（データ変更時）
    useEffect(() => {
        const autoSave = async () => {
            if (state.users.length > 0 || state.mealRecords.length > 0) {
                const result = await saveAllData();
                if (!result.success) {
                    console.warn('自動保存に失敗しました:', result.error);
                }
            }
        };

        // デバウンス処理（500ms後に保存）
        const timeoutId = setTimeout(autoSave, 500);
        return () => clearTimeout(timeoutId);
    }, [state.users, state.mealRecords, state.currentMenu, saveAllData]);

    // ヘルパー関数: 安全なユーザー追加
    const addUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<{ success: boolean; error?: string }> => {
        try {
            // データ検証
            const validation = validateUser(userData as User);
            if (!validation.isValid) {
                const errorMessage = validation.errors.join(', ');
                setError('ユーザーデータが無効です', errorMessage);
                return { success: false, error: errorMessage };
            }

            const newUser: User = {
                ...(userData as any),
                id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                createdAt: new Date().toISOString(),
            };

            dispatch({ type: 'ADD_USER', payload: newUser });
            return { success: true };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '不明なエラー';
            setError('ユーザー追加中にエラーが発生しました', errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    // ヘルパー関数: 安全なユーザー更新
    const updateUser = async (user: User): Promise<{ success: boolean; error?: string }> => {
        try {
            // データ検証
            const validation = validateUser(user);
            if (!validation.isValid) {
                const errorMessage = validation.errors.join(', ');
                setError('ユーザーデータが無効です', errorMessage);
                return { success: false, error: errorMessage };
            }

            dispatch({ type: 'UPDATE_USER', payload: user });
            return { success: true };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '不明なエラー';
            setError('ユーザー更新中にエラーが発生しました', errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    // ヘルパー関数: 安全なユーザー削除
    const deleteUser = async (userId: string): Promise<{ success: boolean; error?: string }> => {
        try {
            if (!userId || typeof userId !== 'string') {
                setError('無効なユーザーIDです', userId);
                return { success: false, error: '無効なユーザーID' };
            }

            const userExists = state.users.some(u => u.id === userId);
            if (!userExists) {
                setError('指定されたユーザーが見つかりません', userId);
                return { success: false, error: 'ユーザーが見つかりません' };
            }

            dispatch({ type: 'DELETE_USER', payload: userId });
            return { success: true };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '不明なエラー';
            setError('ユーザー削除中にエラーが発生しました', errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    // ヘルパー関数: ユーザー選択
    const selectUser = (user: User) => {
        try {
            dispatch({ type: 'SET_SELECTED_USER', payload: user });
        } catch (error) {
            setError('ユーザー選択中にエラーが発生しました', error instanceof Error ? error.message : '不明なエラー');
        }
    };

    // ヘルパー関数: 安全な給食記録追加
    const addMealRecord = async (userId: string, rating: number): Promise<{ success: boolean; error?: string }> => {
        try {
            const user = state.users.find(u => u.id === userId);
            if (!user) {
                setError('ユーザーが見つかりません', userId);
                return { success: false, error: 'ユーザーが見つかりません' };
            }

            const recordData: Partial<MealRecord> = {
                userId: user.id,
                userName: user.name,
                userGroup: user.group,
                date: format(new Date(), 'yyyy-MM-dd'),
                rating,
                price: user.price,
                menuName: state.currentMenu?.name,
            };

            // データ検証
            const validation = validateMealRecord(recordData);
            if (!validation.isValid) {
                const errorMessage = validation.errors.join(', ');
                setError('給食記録データが無効です', errorMessage);
                return { success: false, error: errorMessage };
            }

            const newRecord: MealRecord = {
                ...recordData as MealRecord,
                id: `meal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            };

            dispatch({ type: 'ADD_MEAL_RECORD', payload: newRecord });
            return { success: true };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '不明なエラー';
            setError('給食記録追加中にエラーが発生しました', errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    // ヘルパー関数: 現在のメニュー設定
    const setCurrentMenu = (menu: MenuItem) => {
        try {
            dispatch({ type: 'SET_CURRENT_MENU', payload: menu });
        } catch (error) {
            setError('メニュー設定中にエラーが発生しました', error instanceof Error ? error.message : '不明なエラー');
        }
    };

    // ヘルパー関数: 画面遷移
    const navigateToView = (view: AppState['currentView']) => {
        try {
            dispatch({ type: 'SET_CURRENT_VIEW', payload: view });
        } catch (error) {
            setError('画面遷移中にエラーが発生しました', error instanceof Error ? error.message : '不明なエラー');
        }
    };

    // ヘルパー関数: 今日の給食記録取得
    const getTodayMealRecords = (): MealRecord[] => {
        try {
            const today = format(new Date(), 'yyyy-MM-dd');
            return state.mealRecords.filter(record => record.date === today);
        } catch (error) {
            setError('今日の給食記録取得中にエラーが発生しました', error instanceof Error ? error.message : '不明なエラー');
            return [];
        }
    };

    // ヘルパー関数: ユーザーの給食記録履歴取得
    const getUserMealHistory = (userId: string): MealRecord[] => {
        try {
            if (!userId) {
                return [];
            }
            return state.mealRecords
                .filter(record => record.userId === userId)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } catch (error) {
            setError('ユーザー給食記録取得中にエラーが発生しました', error instanceof Error ? error.message : '不明なエラー');
            return [];
        }
    };

    const setRequireAdminAuth = (flag: boolean) => {
        dispatch({ type: 'SET_REQUIRE_ADMIN_AUTH', payload: flag });
    };

    // ヘルパー関数: カテゴリ選択（新追加）
    const selectCategory = (category: UserCategory) => {
        try {
            dispatch({ type: 'SET_SELECTED_CATEGORY', payload: category });
        } catch (error) {
            setError('カテゴリ選択中にエラーが発生しました', error instanceof Error ? error.message : '不明なエラー');
        }
    };

    // ヘルパー関数: カテゴリ別ユーザー取得（新追加）
    const getUsersByCategory = (category: UserCategory): User[] => {
        try {
            return state.users
                .filter(user => user.category === category)
                .sort((a, b) => (a.displayNumber || 0) - (b.displayNumber || 0));
        } catch (error) {
            setError('カテゴリ別ユーザー取得中にエラーが発生しました', error instanceof Error ? error.message : '不明なエラー');
            return [];
        }
    };

    // ヘルパー関数: 全カテゴリのユーザー取得（新追加）
    const getCategoryUsers = (): Record<UserCategory, User[]> => {
        try {
            const result: Record<UserCategory, User[]> = {
                'A型': [],
                'B型': [],
                '体験者': [],
                '職員': []
            };

            state.users.forEach(user => {
                if (user.category && result[user.category]) {
                    result[user.category].push(user);
                }
            });

            // 各カテゴリ内で番号順にソート
            Object.keys(result).forEach(category => {
                result[category as UserCategory].sort((a, b) => (a.displayNumber || 0) - (b.displayNumber || 0));
            });

            return result;
        } catch (error) {
            setError('カテゴリ別ユーザー取得中にエラーが発生しました', error instanceof Error ? error.message : '不明なエラー');
            return {
                'A型': [],
                'B型': [],
                '体験者': [],
                '職員': []
            };
        }
    };

    // ヘルパー関数: 旧データ移行（新追加）
    const migrateOldData = async (): Promise<{ success: boolean; migrated: boolean; error?: string }> => {
        try {
            let migrated = false;
            const updatedUsers = state.users.map(user => {
                // 既にカテゴリが設定されている場合はスキップ
                if (user.category) {
                    return user;
                }

                // 旧グループからカテゴリに変換
                const migratedUser = migrateUserFromGroup(user);
                migrated = true;
                return migratedUser;
            });

            if (migrated) {
                dispatch({ type: 'SET_USERS', payload: updatedUsers });
                await saveAllData();
            }

            return { success: true, migrated };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '不明なエラー';
            setError('データ移行中にエラーが発生しました', errorMessage);
            return { success: false, migrated: false, error: errorMessage };
        }
    };

    const showSnackbar = (message: string, severity: AlertColor = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const clearAllData = async () => {
        try {
            await resetAllData();
            dispatch({ type: 'RESET_STATE', payload: loadInitialData() });
        } catch (error: any) {
            setErrorState({
                hasError: true,
                message: 'データのリセットに失敗しました。',
                details: error.message,
                timestamp: new Date().toISOString(),
            });
        }
    };

    const value: AppContextType = {
        state,
        dispatch,
        errorState,
        clearError,
        setError,
        addUser,
        updateUser,
        deleteUser,
        selectUser,
        addMealRecord,
        setCurrentMenu,
        navigateToView,
        selectCategory,
        getUsersByCategory,
        getCategoryUsers,
        migrateOldData,
        getTodayMealRecords,
        getUserMealHistory,
        saveAllData,
        loadAllData,
        resetAllData,
        getStorageStats,
        setRequireAdminAuth,
        showSnackbar,
        clearAllData,
    };

    return (
        <AppContext.Provider value={value}>
            <ThemeProvider theme={aobaTheme}>
                {children}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert
                        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                        severity={snackbar.severity}
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </ThemeProvider>
        </AppContext.Provider>
    );
};

// カスタムhook
export const useApp = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppはAppProvider内で使用してください');
    }
    return context;
};

export default AppContext; 