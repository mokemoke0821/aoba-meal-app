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
    displayName: 'A型',
    color: '#1976d2',
    icon: '',
    price: 100
  },
  'B型': {
    id: 'B型',
    name: 'B型',
    displayName: 'B型',
    color: '#2e7d32',
    icon: '',
    price: 0
  },
  '体験者': {
    id: '体験者',
    name: '体験者',
    displayName: '体験者',
    color: '#9c27b0',
    icon: '',
    price: 400
  },
  '職員': {
    id: '職員',
    name: '職員',
    displayName: '職員',
    color: '#f57c00',
    icon: '',
    price: 400
  }
} as const;

// グループ表示名マッピング（職員にとって分かりやすい名前）
export const GROUP_DISPLAY_NAMES = {
  'グループA': 'A型',
  'グループB': 'B型',
  'グループC': '職員',
  'その他': '体験者'
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
  eatingRatio: number;  // 食べた量（1-10: 1割～10割）
  price: number;
  menuName?: string;
  supportNotes?: string;  // 支援記録・備考
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

// ビュータイプ定義（簡素化版）
export type ViewType =
  | 'categorySelect'    // カテゴリ選択
  | 'userSelect'        // 利用者選択
  | 'mealOrder'         // 給食希望
  | 'rating'            // 食べた量記録
  | 'admin'             // 後方互換性のため
  | 'adminPanel'        // 管理者パネル
  | 'adminAuth'         // 管理者認証
  | 'statistics'        // 統計・データ管理
  | 'userManagement';   // 利用者管理

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
  | { type: 'SET_VIEW'; payload: ViewType }  // SET_CURRENT_VIEW から変更
  | { type: 'SET_DAILY_MENUS'; payload: DailyMenu[] }
  | { type: 'SET_MEAL_HISTORY'; payload: MealRecord[] }
  | { type: 'SET_REQUIRE_ADMIN_AUTH'; payload: boolean }
  | { type: 'RESET_STATE'; payload: AppState };

// 食べた量用の絵文字マッピング
export const EATING_RATIO_EMOJIS = {
  1: '🍽️', 2: '🥄', 3: '🍴', 4: '🥢', 5: '🍽️',
  6: '🍽️', 7: '🍽️', 8: '🍽️', 9: '🍽️', 10: '✨🍽️'
} as const;

// 食べた量ラベル
export const EATING_RATIO_LABELS = {
  1: '1割程度', 2: '2割程度', 3: '3割程度', 4: '4割程度', 5: '5割程度',
  6: '6割程度', 7: '7割程度', 8: '8割程度', 9: '9割程度', 10: '完食'
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

// 統計関連の型定義（新追加）
export interface EatingRatioDistribution {
  ratio: number;      // 1-10
  count: number;      // 該当件数
  percentage: number; // 割合
  label: string;      // "1割程度" ～ "完食"
}

export interface DailyStats {
  date: string;
  orderCount: number;
  evaluationCount: number;
  averageEatingRatio: number;  // 平均食べた量
  totalRevenue: number;
}

export interface MonthlyTrendStats {
  month: string;
  orderCount: number;
  averageEatingRatio: number;  // 平均食べた量
  revenue: number;
}

export interface StatisticsResult {
  dailyOrders: DailyStats[];
  eatingRatioDistribution: EatingRatioDistribution[];  // 食べた量分布
  monthlyTrends: MonthlyTrendStats[];
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  averageEatingRatio: number;  // 平均食べた量
}

// エラー処理用型定義（新追加）
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export type ErrorHandler = (error: AppError | Error) => void;

// バックアップ設定（新追加）
export interface BackupConfig {
  enabled: boolean;
  frequency: number; // ミリ秒（5分/10分/30分/1時間）
  customPath: string | null; // カスタムバックアップパス
  keepLast: number; // 保持するバックアップ数（デフォルト: 10）
  lastBackupTime: string | null;
}

// バックアップ頻度オプション（分単位）
export type BackupFrequency = 5 | 10 | 30 | 60;

// =====================================
// Google Drive統合関連の型定義
// =====================================

// Google Drive認証状態
export interface GoogleDriveAuthState {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: GoogleDriveUser | null;
  error: string | null;
}

// Google Driveユーザー情報
export interface GoogleDriveUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

// Google Drive同期設定
export interface GoogleDriveSyncConfig {
  enabled: boolean;
  autoSync: boolean;
  syncInterval: number; // ミリ秒
  lastSyncTime: string | null;
  folderId: string | null;
}

// Google Driveファイル情報
export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
  size?: string;
}

// 同期ステータス
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

// 同期結果
export interface SyncResult {
  status: SyncStatus;
  message: string;
  timestamp: string;
  filesUploaded?: number;
  filesDownloaded?: number;
  conflicts?: number;
}