// 利用者情報
export interface User {
  id: string;
  name: string;
  group: Group;
  price: number;
  createdAt: string;
  isActive?: boolean;
  trialUser: boolean;
  notes?: string;
}

// グループ型定義
export type Group = 'グループA' | 'グループB' | 'グループC' | 'グループD';

// グループ表示名マッピング（職員にとって分かりやすい名前）
export const GROUP_DISPLAY_NAMES = {
  'グループA': 'A型作業所',
  'グループB': 'B型作業所',
  'グループC': '職員',
  'グループD': '体験利用者'
} as const;

// グループ表示名を取得する関数
export const getGroupDisplayName = (group: Group): string => {
  return GROUP_DISPLAY_NAMES[group] || group;
};

// 給食記録情報
export interface MealRecord {
  id: string;
  userId: string;
  userName: string;
  userGroup: string;
  date: string;
  rating: number;
  price: number;
  menuName?: string;
  notes?: string;
}

// メニュー情報
export interface MenuItem {
  id: string;
  name: string;
  date: string;
  description?: string;
  price?: number;
  category?: 'main' | 'side' | 'soup' | 'dessert';
}

// 日別メニュー
export interface DailyMenu {
  date: string;
  menuItems: MenuItem[];
  specialNotes?: string;
}

// アプリケーション状態
export interface AppState {
  users: User[];
  mealRecords: MealRecord[];
  mealHistory?: MealRecord[]; // 互換性のため
  currentMenu: MenuItem | null;
  selectedUser: User | null;
  currentView: ViewType;
  dailyMenus?: DailyMenu[];
}

// ビュータイプ定義
export type ViewType =
  | 'userSelect'
  | 'mealOrder'
  | 'rating'
  | 'admin'
  | 'statistics'
  | 'userManagement'
  | 'menuManagement'
  | 'settings'
  | 'printReports';

// アクション型定義
export type AppAction =
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'SET_MEAL_RECORDS'; payload: MealRecord[] }
  | { type: 'ADD_MEAL_RECORD'; payload: MealRecord }
  | { type: 'SET_CURRENT_MENU'; payload: MenuItem | null }
  | { type: 'SET_SELECTED_USER'; payload: User | null }
  | { type: 'SET_CURRENT_VIEW'; payload: ViewType }
  | { type: 'SET_DAILY_MENUS'; payload: DailyMenu[] }
  | { type: 'SET_MEAL_HISTORY'; payload: MealRecord[] };

// 評価用の絵文字マッピング
export const RATING_EMOJIS = {
  1: '😢', 2: '😢',
  3: '😞', 4: '😞',
  5: '😐', 6: '😐',
  7: '😊', 8: '😊',
  9: '😍', 10: '😍'
} as const;

// グループ別カラー設定
export const GROUP_COLORS = {
  'グループA': '#1976d2',    // 青
  'グループB': '#2e7d32',    // 緑
  'グループC': '#f57c00',    // オレンジ
  'グループD': '#9c27b0'     // 紫
} as const;