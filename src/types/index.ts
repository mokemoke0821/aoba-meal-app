// 利用者情報
export interface User {
  id: string;
  name: string;
  group: Group;
  category: UserCategory;  // 新追加：カテゴリ
  displayNumber: number;   // 新追加：表示用番号
  price: number;
  createdAt: string;
  isActive?: boolean;
  trialUser: boolean;
  notes?: string;
}

// グループ型定義
export type Group = 'グループA' | 'グループB' | 'グループC' | 'その他';

// 利用者カテゴリ型定義（新追加）
export type UserCategory = 'A型' | 'B型' | '体験者' | '職員';

// カテゴリ情報（新追加）
export interface CategoryInfo {
  id: UserCategory;
  name: string;
  displayName: string;
  color: string;
  icon: string;
  price: number;
}

// カテゴリ設定（新追加）
export const CATEGORY_CONFIG: Record<UserCategory, CategoryInfo> = {
  'A型': {
    id: 'A型',
    name: 'A型',
    displayName: 'A型作業所',
    color: '#1976d2',
    icon: '🏭',
    price: 100
  },
  'B型': {
    id: 'B型',
    name: 'B型',
    displayName: 'B型作業所',
    color: '#2e7d32',
    icon: '🛠️',
    price: 0
  },
  '体験者': {
    id: '体験者',
    name: '体験者',
    displayName: '体験利用者',
    color: '#9c27b0',
    icon: '🌱',
    price: 400
  },
  '職員': {
    id: '職員',
    name: '職員',
    displayName: '職員',
    color: '#f57c00',
    icon: '👥',
    price: 400
  }
} as const;

// グループ表示名マッピング（職員にとって分かりやすい名前）
export const GROUP_DISPLAY_NAMES = {
  'グループA': 'A型作業所',
  'グループB': 'B型作業所',
  'グループC': '職員',
  'その他': '体験利用者'
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
  userCategory: UserCategory;  // 新追加：カテゴリ
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
  selectedCategory: UserCategory | null;  // 新追加：選択されたカテゴリ
  currentView: ViewType;
  dailyMenus?: DailyMenu[];
  requireAdminAuth: boolean; // 管理者認証要求フラグ
}

// ビュータイプ定義
export type ViewType =
  | 'categorySelect'    // 新追加：カテゴリ選択
  | 'userSelect'
  | 'mealOrder'
  | 'rating'
  | 'admin'
  | 'adminPanel'        // 新追加：管理者パネル
  | 'adminAuth'
  | 'statistics'
  | 'userManagement'
  | 'menuManagement'
  | 'settings'
  | 'printReports'
  | 'dailyReport'       // 新追加：当日レポート
  | 'weeklyReport'      // 新追加：週次レポート
  | 'monthlyReport'     // 新追加：月次レポート
  | 'billingReport';    // 新追加：料金レポート

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
  | { type: 'SET_SELECTED_CATEGORY'; payload: UserCategory | null }  // 新追加
  | { type: 'SET_CURRENT_VIEW'; payload: ViewType }
  | { type: 'SET_DAILY_MENUS'; payload: DailyMenu[] }
  | { type: 'SET_MEAL_HISTORY'; payload: MealRecord[] }
  | { type: 'SET_REQUIRE_ADMIN_AUTH'; payload: boolean }
  | { type: 'RESET_STATE'; payload: AppState };

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
  'その他': '#9c27b0'        // 紫
} as const;

// ユーティリティ関数（新追加）
export const getCategoryInfo = (category: UserCategory): CategoryInfo => {
  return CATEGORY_CONFIG[category];
};

export const getCategoryPrice = (category: UserCategory): number => {
  return CATEGORY_CONFIG[category].price;
};

export const getUserDisplayName = (user: User): string => {
  return `${user.displayNumber} ${user.name}`;
};

// 旧グループからカテゴリへの変換マッピング（データ移行用）
export const GROUP_TO_CATEGORY: Record<Group, UserCategory> = {
  'グループA': 'A型',
  'グループB': 'B型',
  'グループC': '職員',
  'その他': '体験者',
};

// データ移行用ユーティリティ（新追加）
export const migrateUserFromGroup = (oldUser: any): User => {
  const category = oldUser.group ? GROUP_TO_CATEGORY[oldUser.group as Group] || 'B型' : 'B型';

  return {
    id: oldUser.id,
    name: oldUser.name,
    group: oldUser.group,
    category,
    displayNumber: oldUser.displayNumber || 1,
    price: getCategoryPrice(category),
    createdAt: oldUser.createdAt,
    isActive: oldUser.isActive,
    trialUser: oldUser.trialUser || false,
    notes: oldUser.notes
  };
};

export const ALL_GROUPS: Group[] = ['グループA', 'グループB', 'グループC', 'その他'];