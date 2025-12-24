import React, { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';
import { DailyMenu, Group, MealRecord, MenuItem, User, UserCategory, ViewType } from '../types';
import { performAutoBackup } from '../utils/autoBackup';
import { loadMealRecords, loadUsers, saveMealRecords, saveUsers } from '../utils/storage';

// アプリの状態の型定義
export interface AppState {
  currentView: ViewType;
  users: User[];
  mealRecords: MealRecord[];
  groups: Group[];
  selectedDate: Date;
  selectedUser: User | null;
  selectedGroup: Group | null;
  selectedCategory: UserCategory | null;
  currentMenu: MenuItem | null;
  dailyMenus: DailyMenu[];
  requireAdminAuth: boolean;
}

// アクションの型定義
type AppAction =
  | { type: 'SET_VIEW'; payload: ViewType }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'SET_MEAL_RECORDS'; payload: MealRecord[] }
  | { type: 'ADD_MEAL_RECORD'; payload: MealRecord }
  | { type: 'SET_GROUPS'; payload: Group[] }
  | { type: 'SET_SELECTED_DATE'; payload: Date }
  | { type: 'SET_SELECTED_USER'; payload: User | null }
  | { type: 'SET_SELECTED_GROUP'; payload: Group | null }
  | { type: 'SET_SELECTED_CATEGORY'; payload: UserCategory | null }
  | { type: 'SET_CURRENT_MENU'; payload: MenuItem | null }
  | { type: 'SET_DAILY_MENUS'; payload: DailyMenu[] }
  | { type: 'SET_REQUIRE_ADMIN_AUTH'; payload: boolean };

// 初期状態
const initialState: AppState = {
  currentView: 'categorySelect',
  users: [],
  mealRecords: [],
  groups: ['グループA', 'グループB', 'グループC', 'その他'],
  selectedDate: new Date(),
  selectedUser: null,
  selectedGroup: null,
  selectedCategory: null,
  currentMenu: null,
  dailyMenus: [],
  requireAdminAuth: false,
};

// リデューサー関数
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
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
    case 'SET_GROUPS':
      return { ...state, groups: action.payload };
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload };
    case 'SET_SELECTED_USER':
      return { ...state, selectedUser: action.payload };
    case 'SET_SELECTED_GROUP':
      return { ...state, selectedGroup: action.payload };
    case 'SET_SELECTED_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    case 'SET_CURRENT_MENU':
      return { ...state, currentMenu: action.payload };
    case 'SET_DAILY_MENUS':
      return { ...state, dailyMenus: action.payload };
    case 'SET_REQUIRE_ADMIN_AUTH':
      return { ...state, requireAdminAuth: action.payload };
    default:
      return state;
  }
}

// コンテキストの型定義
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

// コンテキスト作成
const AppContext = createContext<AppContextType | undefined>(undefined);

// プロバイダーコンポーネント
interface AppProviderProps {
  children: ReactNode;
  initialStateForTest?: Partial<AppState>;
}

export function AppProvider({ children, initialStateForTest }: AppProviderProps) {
  const testInitialState = initialStateForTest
    ? { ...initialState, ...initialStateForTest }
    : initialState;

  const [state, dispatch] = useReducer(appReducer, testInitialState);

  // 🔄 起動時: localStorageからデータを読み込む
  useEffect(() => {
    const loadedUsers = loadUsers();
    const loadedRecords = loadMealRecords();

    if (loadedUsers.length > 0) {
      dispatch({ type: 'SET_USERS', payload: loadedUsers });
    } else {
      // 初回起動時は初期データを保存
      saveUsers(state.users);
    }

    if (loadedRecords.length > 0) {
      dispatch({ type: 'SET_MEAL_RECORDS', payload: loadedRecords });
    }

    // 自動バックアップを実行（必要な場合のみ）
    performAutoBackup();
  }, []); // 初回マウント時のみ実行

  // 💾 データ変更時: localStorageへ自動保存
  useEffect(() => {
    // ユーザーデータは必ず保存（初期データを含む）
    saveUsers(state.users);
  }, [state.users]);

  useEffect(() => {
    // 給食記録も必ず保存（空配列でも保存して、削除を反映）
    saveMealRecords(state.mealRecords);
  }, [state.mealRecords]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// カスタムフック
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}