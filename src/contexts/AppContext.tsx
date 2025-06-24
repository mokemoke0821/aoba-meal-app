import React, { createContext, ReactNode, useContext, useReducer } from 'react';
import { DailyMenu, Group, MealRecord, MenuItem, User, UserCategory, ViewType } from '../types';

// アプリの状態の型定義
interface AppState {
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
  users: [
    {
      id: 'user_1',
      name: '田中太郎',
      group: 'グループA',
      category: 'A型',
      displayNumber: 1,
      price: 100,
      createdAt: new Date().toISOString(),
      isActive: true,
      trialUser: false,
      notes: ''
    },
    {
      id: 'user_2',
      name: '佐藤花子',
      group: 'グループB',
      category: 'B型',
      displayNumber: 1,
      price: 0,
      createdAt: new Date().toISOString(),
      isActive: true,
      trialUser: false,
      notes: ''
    },
    {
      id: 'user_3',
      name: '山田次郎',
      group: 'グループC',
      category: '職員',
      displayNumber: 1,
      price: 400,
      createdAt: new Date().toISOString(),
      isActive: true,
      trialUser: false,
      notes: ''
    },
    {
      id: 'user_4',
      name: '鈴木美咲',
      group: 'その他',
      category: '体験者',
      displayNumber: 1,
      price: 400,
      createdAt: new Date().toISOString(),
      isActive: true,
      trialUser: true,
      notes: ''
    }
  ],
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
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

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