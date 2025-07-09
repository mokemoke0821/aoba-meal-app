import React, { createContext, ReactNode, useContext, useReducer } from 'react';
import { DailyMenu, Group, MealRecord, MenuItem, User, UserCategory, ViewType } from '../types';

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
  users: [
    // A型利用者（10人）
    { id: 'user_a1', name: '田中太郎', group: 'グループA', category: 'A型', displayNumber: 1, price: 100, createdAt: new Date().toISOString(), isActive: true, trialUser: false, notes: '' },
    { id: 'user_a2', name: '佐藤健一', group: 'グループA', category: 'A型', displayNumber: 2, price: 100, createdAt: new Date().toISOString(), isActive: true, trialUser: false, notes: '' },
    { id: 'user_a3', name: '高橋美子', group: 'グループA', category: 'A型', displayNumber: 3, price: 100, createdAt: new Date().toISOString(), isActive: true, trialUser: false, notes: '' },
    { id: 'user_a4', name: '鈴木一郎', group: 'グループA', category: 'A型', displayNumber: 4, price: 100, createdAt: new Date().toISOString(), isActive: true, trialUser: false, notes: '' },
    { id: 'user_a5', name: '伊藤花音', group: 'グループA', category: 'A型', displayNumber: 5, price: 100, createdAt: new Date().toISOString(), isActive: true, trialUser: false, notes: '' },
    { id: 'user_a6', name: '渡辺雄介', group: 'グループA', category: 'A型', displayNumber: 6, price: 100, createdAt: new Date().toISOString(), isActive: true, trialUser: false, notes: '' },
    { id: 'user_a7', name: '小林さくら', group: 'グループA', category: 'A型', displayNumber: 7, price: 100, createdAt: new Date().toISOString(), isActive: true, trialUser: false, notes: '' },
    { id: 'user_a8', name: '松本拓也', group: 'グループA', category: 'A型', displayNumber: 8, price: 100, createdAt: new Date().toISOString(), isActive: true, trialUser: false, notes: '' },
    { id: 'user_a9', name: '青木結衣', group: 'グループA', category: 'A型', displayNumber: 9, price: 100, createdAt: new Date().toISOString(), isActive: true, trialUser: false, notes: '' },
    { id: 'user_a10', name: '中村大輝', group: 'グループA', category: 'A型', displayNumber: 10, price: 100, createdAt: new Date().toISOString(), isActive: true, trialUser: false, notes: '' },

    // B型利用者（10人）
    { id: 'user_b1', name: '佐藤花子', group: 'グループB', category: 'B型', displayNumber: 1, price: 0, createdAt: new Date().toISOString(), isActive: true, trialUser: false, notes: '' },
    { id: 'user_b2', name: '山田智子', group: 'グループB', category: 'B型', displayNumber: 2, price: 0, createdAt: new Date().toISOString(), isActive: true, trialUser: false, notes: '' },
    { id: 'user_b3', name: '加藤翔太', group: 'グループB', category: 'B型', displayNumber: 3, price: 0, createdAt: new Date().toISOString(), isActive: true, trialUser: false, notes: '' },
    { id: 'user_b4', name: '井上萌香', group: 'グループB', category: 'B型', displayNumber: 4, price: 0, createdAt: new Date().toISOString(), isActive: true, trialUser: false, notes: '' },
    { id: 'user_b5', name: '森川誠', group: 'グループB', category: 'B型', displayNumber: 5, price: 0, createdAt: new Date().toISOString(), isActive: true, trialUser: false, notes: '' },
    { id: 'user_b6', name: '斎藤由美', group: 'グループB', category: 'B型', displayNumber: 6, price: 0, createdAt: new Date().toISOString(), isActive: true, trialUser: false, notes: '' },
    { id: 'user_b7', name: '武田康平', group: 'グループB', category: 'B型', displayNumber: 7, price: 0, createdAt: new Date().toISOString(), isActive: true, trialUser: false, notes: '' },
    { id: 'user_b8', name: '西川真奈', group: 'グループB', category: 'B型', displayNumber: 8, price: 0, createdAt: new Date().toISOString(), isActive: true, trialUser: false, notes: '' },
    { id: 'user_b9', name: '岡田雅人', group: 'グループB', category: 'B型', displayNumber: 9, price: 0, createdAt: new Date().toISOString(), isActive: true, trialUser: false, notes: '' },
    { id: 'user_b10', name: '菅原咲希', group: 'グループB', category: 'B型', displayNumber: 10, price: 0, createdAt: new Date().toISOString(), isActive: true, trialUser: false, notes: '' },

    // 職員（10人）
    { id: 'user_s1', name: '山田次郎', group: 'グループC', category: '職員', displayNumber: 1, price: 400, createdAt: new Date().toISOString(), isActive: true, trialUser: false, notes: '' },
    { id: 'user_s2', name: '田村美香', group: 'グループC', category: '職員', displayNumber: 2, price: 400, createdAt: new Date().toISOString(), isActive: true, trialUser: false, notes: '' },
    { id: 'user_s3', name: '橋本亮', group: 'グループC', category: '職員', displayNumber: 3, price: 400, createdAt: new Date().toISOString(), isActive: true, trialUser: false, notes: '' },
    { id: 'user_s4', name: '清水優香', group: 'グループC', category: '職員', displayNumber: 4, price: 400, createdAt: new Date().toISOString(), isActive: true, trialUser: false, notes: '' },
    { id: 'user_s5', name: '福田隆志', group: 'グループC', category: '職員', displayNumber: 5, price: 400, createdAt: new Date().toISOString(), isActive: true, trialUser: false, notes: '' },
    { id: 'user_s6', name: '野村恵子', group: 'グループC', category: '職員', displayNumber: 6, price: 400, createdAt: new Date().toISOString(), isActive: true, trialUser: false, notes: '' },
    { id: 'user_s7', name: '石井正人', group: 'グループC', category: '職員', displayNumber: 7, price: 400, createdAt: new Date().toISOString(), isActive: true, trialUser: false, notes: '' },
    { id: 'user_s8', name: '木村千春', group: 'グループC', category: '職員', displayNumber: 8, price: 400, createdAt: new Date().toISOString(), isActive: true, trialUser: false, notes: '' },
    { id: 'user_s9', name: '長谷川達也', group: 'グループC', category: '職員', displayNumber: 9, price: 400, createdAt: new Date().toISOString(), isActive: true, trialUser: false, notes: '' },
    { id: 'user_s10', name: '平野麻衣', group: 'グループC', category: '職員', displayNumber: 10, price: 400, createdAt: new Date().toISOString(), isActive: true, trialUser: false, notes: '' },

    // 体験者（10人）
    { id: 'user_t1', name: '鈴木美咲', group: 'その他', category: '体験者', displayNumber: 1, price: 400, createdAt: new Date().toISOString(), isActive: true, trialUser: true, notes: '' },
    { id: 'user_t2', name: '新井健太', group: 'その他', category: '体験者', displayNumber: 2, price: 400, createdAt: new Date().toISOString(), isActive: true, trialUser: true, notes: '' },
    { id: 'user_t3', name: '宮崎愛', group: 'その他', category: '体験者', displayNumber: 3, price: 400, createdAt: new Date().toISOString(), isActive: true, trialUser: true, notes: '' },
    { id: 'user_t4', name: '内田洋平', group: 'その他', category: '体験者', displayNumber: 4, price: 400, createdAt: new Date().toISOString(), isActive: true, trialUser: true, notes: '' },
    { id: 'user_t5', name: '原田みゆき', group: 'その他', category: '体験者', displayNumber: 5, price: 400, createdAt: new Date().toISOString(), isActive: true, trialUser: true, notes: '' },
    { id: 'user_t6', name: '藤井慎一', group: 'その他', category: '体験者', displayNumber: 6, price: 400, createdAt: new Date().toISOString(), isActive: true, trialUser: true, notes: '' },
    { id: 'user_t7', name: '村上彩香', group: 'その他', category: '体験者', displayNumber: 7, price: 400, createdAt: new Date().toISOString(), isActive: true, trialUser: true, notes: '' },
    { id: 'user_t8', name: '谷口俊介', group: 'その他', category: '体験者', displayNumber: 8, price: 400, createdAt: new Date().toISOString(), isActive: true, trialUser: true, notes: '' },
    { id: 'user_t9', name: '坂本理沙', group: 'その他', category: '体験者', displayNumber: 9, price: 400, createdAt: new Date().toISOString(), isActive: true, trialUser: true, notes: '' },
    { id: 'user_t10', name: '吉田航', group: 'その他', category: '体験者', displayNumber: 10, price: 400, createdAt: new Date().toISOString(), isActive: true, trialUser: true, notes: '' }
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
  initialStateForTest?: Partial<AppState>;
}

export function AppProvider({ children, initialStateForTest }: AppProviderProps) {
  const testInitialState = initialStateForTest
    ? { ...initialState, ...initialStateForTest }
    : initialState;

  const [state, dispatch] = useReducer(appReducer, testInitialState);

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