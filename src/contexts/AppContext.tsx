import { format } from 'date-fns';
import React, { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';
import { AppAction, AppState, MealRecord, MenuItem, User } from '../types';
import {
    loadCurrentMenu,
    loadMealRecords,
    loadUsers,
    saveCurrentMenu,
    saveMealRecords,
    saveUsers,
} from '../utils/storage';

// 初期状態
const initialState: AppState = {
    users: [],
    mealRecords: [],
    currentMenu: null,
    selectedUser: null,
    currentView: 'userSelect',
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
    // ヘルパー関数
    addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
    updateUser: (user: User) => void;
    deleteUser: (userId: string) => void;
    selectUser: (user: User) => void;
    addMealRecord: (userId: string, rating: number) => void;
    setCurrentMenu: (menu: MenuItem) => void;
    navigateToView: (view: AppState['currentView']) => void;
    getTodayMealRecords: () => MealRecord[];
    getUserMealHistory: (userId: string) => MealRecord[];
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

    // 初期データ読み込み
    useEffect(() => {
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
    }, []);

    // ユーザーデータの保存
    useEffect(() => {
        if (state.users.length > 0) {
            saveUsers(state.users);
        }
    }, [state.users]);

    // 給食記録の保存
    useEffect(() => {
        if (state.mealRecords.length > 0) {
            saveMealRecords(state.mealRecords);
        }
    }, [state.mealRecords]);

    // 現在のメニューの保存
    useEffect(() => {
        saveCurrentMenu(state.currentMenu);
    }, [state.currentMenu]);

    // ヘルパー関数: ユーザー追加
    const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
        const newUser: User = {
            ...userData,
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
        };
        dispatch({ type: 'ADD_USER', payload: newUser });
    };

    // ヘルパー関数: ユーザー更新
    const updateUser = (user: User) => {
        dispatch({ type: 'UPDATE_USER', payload: user });
    };

    // ヘルパー関数: ユーザー削除
    const deleteUser = (userId: string) => {
        dispatch({ type: 'DELETE_USER', payload: userId });
    };

    // ヘルパー関数: ユーザー選択
    const selectUser = (user: User) => {
        dispatch({ type: 'SET_SELECTED_USER', payload: user });
    };

    // ヘルパー関数: 給食記録追加
    const addMealRecord = (userId: string, rating: number) => {
        const user = state.users.find(u => u.id === userId);
        if (!user) {
            console.error('ユーザーが見つかりません:', userId);
            return;
        }

        const newRecord: MealRecord = {
            id: `meal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: user.id,
            userName: user.name,
            userGroup: user.group,
            date: format(new Date(), 'yyyy-MM-dd'),
            rating,
            price: user.price,
            menuName: state.currentMenu?.name,
        };

        dispatch({ type: 'ADD_MEAL_RECORD', payload: newRecord });
    };

    // ヘルパー関数: 現在のメニュー設定
    const setCurrentMenu = (menu: MenuItem) => {
        dispatch({ type: 'SET_CURRENT_MENU', payload: menu });
    };

    // ヘルパー関数: 画面遷移
    const navigateToView = (view: AppState['currentView']) => {
        dispatch({ type: 'SET_CURRENT_VIEW', payload: view });
    };

    // ヘルパー関数: 今日の給食記録取得
    const getTodayMealRecords = (): MealRecord[] => {
        const today = format(new Date(), 'yyyy-MM-dd');
        return state.mealRecords.filter(record => record.date === today);
    };

    // ヘルパー関数: ユーザーの給食履歴取得
    const getUserMealHistory = (userId: string): MealRecord[] => {
        return state.mealRecords
            .filter(record => record.userId === userId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };

    const contextValue: AppContextType = {
        state,
        dispatch,
        addUser,
        updateUser,
        deleteUser,
        selectUser,
        addMealRecord,
        setCurrentMenu,
        navigateToView,
        getTodayMealRecords,
        getUserMealHistory,
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

// Custom Hook
export const useApp = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

export default AppContext; 