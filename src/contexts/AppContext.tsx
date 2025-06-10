import { format } from 'date-fns';
import React, { createContext, ReactNode, useContext, useEffect, useReducer, useState } from 'react';
import { AppAction, AppState, MealRecord, MenuItem, User } from '../types';
import { validateMealRecord, validateUser } from '../utils/dataValidator';
import {
    loadCurrentMenu,
    loadMealRecords,
    loadUsers
} from '../utils/storage';
import { storageManager } from '../utils/storageManager';

// エラー状態の型定義
interface ErrorState {
    hasError: boolean;
    message: string;
    details?: string;
    timestamp: string;
}

// 初期状態
const initialState: AppState = {
    users: [],
    mealRecords: [],
    currentMenu: null,
    selectedUser: null,
    currentView: 'userSelect',
};

// 初期エラー状態
const initialErrorState: ErrorState = {
    hasError: false,
    message: '',
    details: '',
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

        case 'SET_CURRENT_VIEW':
            return { ...state, currentView: action.payload };

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

    // 安全なデータ取得関数
    getTodayMealRecords: () => MealRecord[];
    getUserMealHistory: (userId: string) => MealRecord[];

    // データ管理関数
    saveAllData: () => Promise<{ success: boolean; error?: string }>;
    loadAllData: () => Promise<{ success: boolean; error?: string; warning?: string }>;
    resetAllData: () => Promise<{ success: boolean; error?: string }>;
    getStorageStats: () => any;
}

// Context作成
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider Props
interface AppProviderProps {
    children: ReactNode;
}

// Provider Component
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);
    const [errorState, setErrorState] = useState<ErrorState>(initialErrorState);

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
    const loadAllData = async (): Promise<{ success: boolean; error?: string; warning?: string }> => {
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
    };

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
    }, []);

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
    }, [state.users, state.mealRecords, state.currentMenu]);

    // ヘルパー関数: 安全なユーザー追加
    const addUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<{ success: boolean; error?: string }> => {
        try {
            // データ検証
            const validation = validateUser(userData);
            if (!validation.isValid) {
                const errorMessage = validation.errors.join(', ');
                setError('ユーザーデータが無効です', errorMessage);
                return { success: false, error: errorMessage };
            }

            const newUser: User = {
                ...userData,
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

    const contextValue: AppContextType = {
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
        getTodayMealRecords,
        getUserMealHistory,
        saveAllData,
        loadAllData,
        resetAllData,
        getStorageStats,
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
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