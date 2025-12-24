# プロジェクト調査レポート

## 1. 技術スタックと構成

### 1.1 主要フレームワーク・ライブラリ

#### コアフレームワーク
- **React**: `^19.2.0` - UIフレームワーク
- **TypeScript**: `^4.9.5` - 型安全性の確保
- **react-scripts**: `5.0.1` - Create React Appベースのビルドツール

#### UIライブラリ
- **@mui/material**: `^7.1.2` - Material-UIコンポーネントライブラリ
- **@mui/icons-material**: `^7.1.2` - Material-UIアイコン
- **@mui/x-data-grid**: `^8.5.3` - データグリッドコンポーネント（ユーザー管理画面で使用）
- **@mui/x-date-pickers**: `^8.5.3` - 日付選択コンポーネント
- **@emotion/react**: `^11.14.0` - CSS-in-JS（Material-UIの依存）
- **@emotion/styled**: `^11.14.0` - スタイルコンポーネント
- **framer-motion**: `^12.19.1` - アニメーションライブラリ

#### 状態管理・フォーム
- **react-hook-form**: `^7.58.1` - フォーム管理（ユーザー登録・編集で使用）
- **React Context API + useReducer** - グローバル状態管理（カスタム実装）

#### ユーティリティ
- **date-fns**: `^4.1.0` - 日付操作
- **uuid**: `^11.1.0` - 一意ID生成
- **file-saver**: `^2.0.5` - ファイルダウンロード（CSV/JSON出力）
- **csv-writer**: `^1.6.0` - CSV生成（一部で使用）
- **recharts**: `^2.15.4` - チャート表示（統計画面）

#### データ可視化・出力
- **html2canvas**: `^1.4.1` - HTML→画像変換
- **jspdf**: `^3.0.1` - PDF生成
- **react-to-print**: `^3.1.0` - 印刷機能

#### PWA関連
- **workbox-webpack-plugin**: `^7.3.0` - Service Worker生成
- **workbox-window**: `^7.3.0` - Service Worker管理

#### その他
- **axios**: `^1.13.2` - HTTP通信（将来のGoogle Drive統合用）
- **@react-oauth/google**: `^0.12.2` - Google OAuth（将来実装予定）
- **gapi-script**: `^1.2.0` - Google API（将来実装予定）

### 1.2 ビルドツール・開発環境

#### ビルドツール
- **@craco/craco**: `^7.1.0` - Create React App設定のカスタマイズ
- **craco-workbox**: `^0.2.0` - Workbox統合
- **cross-env**: `^7.0.3` - クロスプラットフォーム環境変数

#### Electron（デスクトップアプリ対応）
- **electron**: `^32.3.3` - Electronフレームワーク
- **electron-builder**: `^25.1.8` - Electronアプリビルド
- **electron-store**: `^11.0.2` - Electron用データストレージ

#### テスト
- **@testing-library/react**: `^16.3.0` - Reactコンポーネントテスト
- **@testing-library/jest-dom**: `^6.6.3` - Jest DOMマッチャー
- **@testing-library/user-event**: `^14.6.1` - ユーザーイベントシミュレーション
- **jest**: `^29.7.0` - テストフレームワーク

### 1.3 プロジェクトディレクトリ構造

```
src/
├── components/          # Reactコンポーネント
│   ├── AdminPanel.tsx           # 管理者メニュー画面
│   ├── CategorySelector.tsx     # カテゴリ選択画面（エントリーポイント）
│   ├── UserSelector.tsx         # 利用者選択画面
│   ├── MealOrder.tsx            # 給食注文画面
│   ├── RatingInput.tsx          # 食べた量記録画面
│   ├── UserManagement.tsx       # 利用者管理画面
│   ├── StatisticsPanel.tsx     # 統計・データ管理画面
│   ├── BackupConfigPanel.tsx   # バックアップ設定画面
│   ├── DataDiagnosticsPanel.tsx # データ診断画面
│   ├── InstallPrompt.tsx        # PWAインストールプロンプト
│   ├── ErrorBoundary.tsx        # エラーハンドリング
│   └── common/                  # 共通コンポーネント
│       └── BackButton.tsx
│
├── contexts/           # React Context（グローバル状態管理）
│   ├── AppContext.tsx           # アプリケーション全体の状態管理
│   └── NotificationContext.tsx  # 通知管理
│
├── types/              # TypeScript型定義
│   └── index.ts                 # すべての型定義（User, MealRecord等）
│
├── utils/              # ユーティリティ関数
│   ├── storage.ts               # LocalStorage操作
│   ├── csvExport.ts             # CSV出力処理
│   ├── autoBackup.ts            # 自動バックアップ処理
│   ├── statisticsCalculator.ts  # 統計計算
│   ├── dataValidator.ts         # データバリデーション
│   └── initialData.ts           # 初期データ生成
│
├── services/           # 外部サービス統合（将来拡張用）
│   └── googleDrive/            # Google Drive API（未実装）
│
├── hooks/              # カスタムフック
├── theme/              # テーマ設定
├── App.tsx             # アプリケーションルートコンポーネント
├── index.tsx           # エントリーポイント
├── custom-service-worker.ts  # カスタムService Worker
└── registerServiceWorker.ts  # Service Worker登録
```

---

## 2. データモデル定義（最重要）

### 2.1 主要データ型

#### User（利用者）
```typescript
interface User {
  id: string;                    // 一意ID（例: "user_a1"）
  name: string;                   // 利用者名
  group: Group;                   // グループ（'グループA' | 'グループB' | 'グループC' | 'その他'）
  category: UserCategory;         // カテゴリ（'A型' | 'B型' | '体験者' | '職員'）
  displayNumber: number;          // 表示用番号（1, 2, 3...）
  price: number;                  // 料金（A型: 100円、B型: 0円、職員/体験者: 400円）
  createdAt: string;              // 登録日時（ISO 8601形式）
  isActive?: boolean;             // 有効/無効フラグ（デフォルト: true）
  trialUser: boolean;             // お試しユーザーフラグ
  notes?: string;                  // 備考
}
```

#### MealRecord（給食記録）
```typescript
interface MealRecord {
  id: string;                     // 一意ID
  userId: string;                 // 利用者ID
  userName: string;                // 利用者名（記録時点）
  userGroup: string;               // グループ（記録時点）
  userCategory: UserCategory;      // カテゴリ（記録時点）
  date: string;                    // 日付（YYYY-MM-DD形式）
  eatingRatio: number;            // 食べた量（1-10: 1割～10割）
  price: number;                  // 料金
  menuName?: string;              // メニュー名
  supportNotes?: string;          // 支援記録・備考
}
```

#### MenuItem（メニュー情報）
```typescript
interface MenuItem {
  id: string;                     // 一意ID
  name: string;                   // メニュー名
  date: string;                   // 日付（YYYY-MM-DD形式）
  description?: string;           // 説明
  price?: number;                  // 価格
  category?: 'main' | 'side' | 'soup' | 'dessert';
}
```

#### AppState（アプリケーション状態）
```typescript
interface AppState {
  currentView: ViewType;          // 現在の画面
  users: User[];                  // 利用者リスト
  mealRecords: MealRecord[];      // 給食記録リスト
  groups: Group[];                 // グループリスト
  selectedDate: Date;             // 選択された日付
  selectedUser: User | null;       // 選択された利用者
  selectedGroup: Group | null;     // 選択されたグループ
  selectedCategory: UserCategory | null;  // 選択されたカテゴリ
  currentMenu: MenuItem | null;   // 現在のメニュー
  dailyMenus: DailyMenu[];        // 日別メニューリスト
  requireAdminAuth: boolean;      // 管理者認証要求フラグ
}
```

#### ViewType（画面タイプ）
```typescript
type ViewType =
  | 'categorySelect'    // カテゴリ選択画面
  | 'userSelect'        // 利用者選択画面
  | 'mealOrder'         // 給食注文画面
  | 'rating'            // 食べた量記録画面
  | 'adminPanel'        // 管理者パネル
  | 'userManagement'    // 利用者管理画面
  | 'statistics';       // 統計・データ管理画面
```

#### BackupConfig（バックアップ設定）
```typescript
interface BackupConfig {
  enabled: boolean;                // 自動バックアップ有効/無効
  frequency: number;                // バックアップ頻度（ミリ秒）
  customPath: string | null;       // カスタムバックアップパス
  keepLast: number;                // 保持するバックアップ数
  lastBackupTime: string | null;   // 最終バックアップ日時
}
```

### 2.2 データ保存形式（LocalStorage）

#### ストレージキー定義
```typescript
const STORAGE_KEYS = {
  USERS: 'aoba-meal-users',              // 利用者データ
  MEAL_RECORDS: 'aoba-meal-records',     // 給食記録データ
  CURRENT_MENU: 'aoba-current-menu',      // 現在のメニュー
  BACKUP_CONFIG: 'aoba-backup-config',   // バックアップ設定
  AUTO_BACKUP_ENABLED: 'aoba-auto-backup-enabled',  // 自動バックアップ有効フラグ
  LAST_BACKUP_TIMESTAMP: 'aoba-last-backup-timestamp'  // 最終バックアップ日時
}
```

#### 保存データ構造
- **利用者データ**: `User[]` をJSON文字列化して保存
- **給食記録**: `MealRecord[]` をJSON文字列化して保存
- **メニュー**: `MenuItem | null` をJSON文字列化して保存
- **バックアップ設定**: `BackupConfig` をJSON文字列化して保存

#### バックアップファイル形式
```json
{
  "users": User[],
  "mealRecords": MealRecord[],
  "currentMenu": MenuItem | null,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

## 3. アプリケーションの機能フロー

### 3.1 画面遷移図

```
[起動]
  ↓
[CategorySelector] (カテゴリ選択画面)
  ├─→ [UserSelector] (利用者選択画面)
  │     ├─→ [MealOrder] (給食注文画面)
  │     │     └─→ [UserSelector] (戻る)
  │     └─→ [RatingInput] (食べた量記録画面)
  │           └─→ [UserSelector] (戻る)
  │
  └─→ [AdminPanel] (管理者メニュー) ← 右上の設定アイコンから
        ├─→ [UserManagement] (利用者管理画面)
        │     └─→ [AdminPanel] (戻る)
        │
        └─→ [StatisticsPanel] (統計・データ管理画面)
              ├─→ [BackupConfigPanel] (バックアップ設定)
              ├─→ [DataDiagnosticsPanel] (データ診断)
              └─→ [AdminPanel] (戻る)
```

### 3.2 ルーティング実装

**URLルーティング**: なし（SPA、画面遷移はContextの`currentView`で管理）

**画面遷移の実装**:
- `App.tsx`の`renderCurrentView()`関数で`state.currentView`に基づいてコンポーネントを切り替え
- 各画面から`dispatch({ type: 'SET_VIEW', payload: ViewType })`で画面遷移

### 3.3 Global State管理（AppContext）

#### 管理されている状態
- **users**: 利用者リスト（全画面で共有）
- **mealRecords**: 給食記録リスト（全画面で共有）
- **currentView**: 現在の画面（画面遷移制御）
- **selectedUser**: 選択された利用者（給食注文・記録で使用）
- **selectedCategory**: 選択されたカテゴリ（利用者フィルタリングで使用）
- **currentMenu**: 現在のメニュー（給食注文で使用）
- **requireAdminAuth**: 管理者認証要求フラグ（現在未使用）

#### 状態更新フロー
1. **起動時**: `AppContext.tsx`の`useEffect`でLocalStorageからデータを読み込み
2. **データ変更時**: `useEffect`で自動的にLocalStorageへ保存
3. **画面遷移**: `dispatch({ type: 'SET_VIEW', payload: ViewType })`で状態更新

#### アクションタイプ
```typescript
type AppAction =
  | { type: 'SET_VIEW'; payload: ViewType }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'SET_MEAL_RECORDS'; payload: MealRecord[] }
  | { type: 'ADD_MEAL_RECORD'; payload: MealRecord }
  | { type: 'SET_SELECTED_USER'; payload: User | null }
  | { type: 'SET_SELECTED_CATEGORY'; payload: UserCategory | null }
  | { type: 'SET_CURRENT_MENU'; payload: MenuItem | null }
  | { type: 'SET_REQUIRE_ADMIN_AUTH'; payload: boolean }
```

---

## 4. 重要なビジネスロジック

### 4.1 CSV出力処理

#### 実装場所
- **ファイル**: `src/utils/csvExport.ts`
- **主要関数**:
  - `exportStatisticsCSV()` - 統計データCSV出力
  - `exportUsersCSV()` - 利用者マスターCSV出力
  - `exportMonthlyReportCSV()` - 月次レポートCSV出力
  - `exportPeriodReportCSV()` - 期間指定レポートCSV出力
  - `exportTodayCSV()` - 本日の給食記録CSV出力
  - `exportMonthlyUserStatsCSV()` - 月次利用者統計CSV出力

#### 特徴
- UTF-8 BOM付きCSV（Excel互換性）
- カンマ・ダブルクォート・改行のエスケープ処理
- `file-saver`ライブラリでダウンロード

#### 使用箇所
- `StatisticsPanel.tsx` - 統計画面のCSV出力ボタン
- `UserManagement.tsx` - 利用者管理画面のCSV出力ボタン

### 4.2 バックアップ/復元処理

#### 実装場所
- **ファイル**: `src/utils/storage.ts`
- **主要関数**:
  - `createBackup()` - バックアップファイル作成（JSON形式）
  - `importBackup(file: File)` - バックアップファイルから復元
  - `saveBackupToCustomPath()` - カスタムパスへのバックアップ保存

#### 自動バックアップ
- **ファイル**: `src/utils/autoBackup.ts`
- **主要関数**:
  - `performAutoBackup()` - 自動バックアップ実行（7日ごと）
  - `isAutoBackupEnabled()` - 自動バックアップ有効/無効確認
  - `setAutoBackupEnabled()` - 自動バックアップ設定
  - `shouldCreateBackup()` - バックアップ必要判定

#### バックアップ設定
- **ファイル**: `src/components/BackupConfigPanel.tsx`
- **設定項目**:
  - 自動バックアップ有効/無効
  - バックアップ頻度（5分/10分/30分/1時間）
  - 保持するバックアップ数

#### バックアップファイル形式
```json
{
  "users": User[],
  "mealRecords": MealRecord[],
  "currentMenu": MenuItem | null,
  "timestamp": "ISO 8601形式の日時"
}
```

### 4.3 管理者認証

#### 実装状況
**現在の実装**: **オプションでパスコード認証あり**

**パスコード認証機能**:
- **設定場所**: AdminPanel内の「セキュリティ設定」セクション
- **設定方法**: 「管理者パスコードを有効にする」トグルスイッチをONにし、4桁の数字を入力・確認
- **保存場所**: LocalStorage（`aoba-security-settings`キー）
- **パスコード形式**: 4桁の数字のみ

**アクセス時の挙動**:
- **パスコード設定時**: CategorySelectorの歯車アイコンクリック時に認証モーダルを表示
  - 正しい4桁数字入力時のみ管理者画面へ遷移
  - 間違ったパスコード時はエラーメッセージ表示
- **パスコード未設定時**: 従来通り即座に管理者画面へ遷移（認証不要）

**実装場所**:
- **認証モーダル**: `src/components/AdminPasscodeAuth.tsx`
- **セキュリティ設定管理**: `src/utils/securitySettings.ts`
- **セキュリティ設定UI**: `src/components/AdminPanel.tsx`（セキュリティ設定セクション）
- **認証チェック**: `src/components/CategorySelector.tsx`（歯車アイコンクリック時）

**主要関数**:
- `loadSecuritySettings()`: セキュリティ設定の読み込み
- `saveSecuritySettings()`: セキュリティ設定の保存
- `isPasscodeEnabled()`: パスコード有効/無効の確認
- `validatePasscode()`: パスコード検証
- `isValidPasscodeFormat()`: パスコード形式チェック（4桁数字）

**注意事項**:
- パスコードはLocalStorageに平文で保存（暗号化なし）
- パスコードを忘れた場合: LocalStorageをクリアすることでリセット可能
- パスコード無効化: AdminPanelのセキュリティ設定でトグルOFFにすることで無効化可能

### 4.4 利用者一括登録処理

#### 実装場所
- **ファイル**: `src/components/UserManagement.tsx`
- **主要関数**: `handleBulkRegister()`

#### 機能概要
- テキストエリアに改行区切りで利用者名を入力し、一括登録
- 空行の自動無視
- 同名ユーザーの重複チェック（大文字小文字区別なし）
- グループ/カテゴリ選択可能
- 重複スキップ件数の通知

#### 使用箇所
- `UserManagement.tsx` - 利用者管理画面の一括登録アコーディオン

### 4.5 その他の重要なビジネスロジック

#### 統計計算
- **ファイル**: `src/utils/statisticsCalculator.ts`
- **機能**: 日次統計、月次統計、食べた量分布の計算

#### データバリデーション
- **ファイル**: `src/utils/dataValidator.ts`
- **機能**: ユーザーデータ、給食記録のバリデーション

#### 料金計算ロジック
- **ファイル**: `src/types/index.ts`
- **関数**: `getCategoryPrice(category: UserCategory): number`
- **料金設定**:
  - A型: 100円
  - B型: 0円
  - 職員: 400円
  - 体験者: 400円

#### グループ→カテゴリ変換
- **ファイル**: `src/types/index.ts`
- **マッピング**: `GROUP_TO_CATEGORY`
  - 'グループA' → 'A型'
  - 'グループB' → 'B型'
  - 'グループC' → '職員'
  - 'その他' → '体験者'

---

## 補足情報

### PWA機能
- Service Worker実装済み（`custom-service-worker.ts`）
- オフライン対応
- インストールプロンプト（`InstallPrompt.tsx`）
- マニフェストファイル（`public/manifest.json`）

### Electron対応
- Electronアプリとしてもビルド可能
- `electron/main.js` - メインプロセス
- `electron/preload.js` - プリロードスクリプト

### デプロイ環境
- **Netlify**: 本番環境（`build:netlify`スクリプト）
- **GitHub Pages**: デプロイ可能（`deploy`スクリプト）
- **Electron**: デスクトップアプリとして配布可能

---

---

## 5. 具体的な仕様ロジック（詳細仕様）

### 5.1 CSV出力仕様（マニュアル記載用）

#### 実装されている6種類のCSV出力関数とカラム名

1. **統計データCSV (`exportStatisticsCSV`)**
   - カラム名: `日付`, `利用者名`, `表示番号`, `カテゴリ`, `グループ`, `食べた量（割）`, `料金（円）`, `支援記録・備考`
   - ファイル名形式: `あおば給食統計_[開始日]_[終了日]_[作成日時].csv` または `あおば給食統計_[作成日時].csv`
   - 日付フォーマット: `YYYY-MM-DD`形式（例: `2025-01-15`）
   - BOM: **あり**（UTF-8 BOM `\uFEFF`付き、Excel互換性のため）

2. **利用者データCSV (`exportUsersCSV`)**
   - カラム名: `表示番号`, `利用者名`, `カテゴリ`, `グループ`, `料金（円）`, `登録日`, `アクティブ`, `体験利用者`, `備考`
   - ファイル名形式: `あおば利用者一覧_[作成日時].csv`
   - 日付フォーマット: 登録日は `YYYY/MM/DD`形式（例: `2025/01/15`）
   - BOM: **あり**

3. **月次料金レポートCSV (`exportMonthlyReportCSV`)**
   - 構造: 複数セクション（サマリー、カテゴリ別集計、利用者別集計、詳細記録）
   - サマリーセクション: `対象年月`, `作成日`, `合計料金`, `総利用回数`
   - カテゴリ別集計: `カテゴリ`, `利用回数`, `料金合計`, `平均食べた量`
   - 利用者別集計: `利用者名`, `カテゴリ`, `注文回数`, `料金合計`, `平均食べた量`
   - 詳細記録: `日付`, `利用者名`, `カテゴリ`, `食べた量（割）`, `料金（円）`, `備考`
   - ファイル名形式: `あおば月次料金レポート_[年]年[月]月_[作成日時].csv`
   - 日付フォーマット: `YYYY-MM-DD`形式
   - BOM: **あり**

4. **期間指定統計レポートCSV (`exportPeriodReportCSV`)**
   - 構造: 複数セクション（期間サマリー、カテゴリ別統計、詳細記録）
   - 期間サマリー: `項目`, `値`（総利用回数、総料金記録、平均食べた量）
   - カテゴリ別統計: `カテゴリ`, `利用回数`, `料金合計（円）`, `平均食べた量（割）`
   - 詳細記録: `日付`, `利用者名`, `カテゴリ`, `食べた量（割）`, `料金（円）`, `備考`
   - ファイル名形式: `あおば期間レポート_[開始日]_[終了日]_[作成日時].csv`
   - 日付フォーマット: `YYYY-MM-DD`形式
   - BOM: **あり**

5. **今日のデータCSV (`exportTodayCSV`)**
   - カラム名: `日付`, `利用者名`, `表示番号`, `カテゴリ`, `グループ`, `食べた量（割）`, `料金（円）`, `支援記録・備考`
   - ファイル名形式: `あおば給食_本日_[日付]_[時刻].csv`
   - 日付フォーマット: `YYYY-MM-DD`形式
   - BOM: **あり**

6. **月別利用状況CSV (`exportMonthlyUserStatsCSV`)**
   - カラム名: `利用者名`, `表示番号`, `カテゴリ`, `注文回数`, `料金合計`, `平均食べた量`
   - ファイル名形式: `あおば月別利用状況_[年]年[月]月_[作成日時].csv`
   - 日付フォーマット: なし（集計データのみ）
   - BOM: **あり**

#### CSV出力の共通仕様
- **文字エンコーディング**: UTF-8 BOM付き（Excel互換性）
- **エスケープ処理**: カンマ、ダブルクォート、改行を含む値は自動的にダブルクォートで囲まれ、内部のダブルクォートは`""`にエスケープ
- **日付フォーマット**: 基本的に`YYYY-MM-DD`形式（登録日のみ`YYYY/MM/DD`形式）
- **作成日時フォーマット**: `YYYY-MM-DD_HHmm`形式（例: `2025-01-15_1430`）

### 5.2 集計・統計ロジック

#### 喫食率（Eating Ratio）の計算式

**基本仕様**:
- **値の範囲**: 1-10の整数（1割～10割、10は完食）
- **計算方法**: **単純平均**（重み付けなし）
- **小数点以下の扱い**: **小数点第1位まで表示、四捨五入**

**計算式の詳細**:

1. **日次平均喫食率**:
   ```
   平均喫食率 = Σ(各記録のeatingRatio) / 記録数
   結果 = Math.round(平均喫食率 * 10) / 10
   ```
   - 有効な喫食率（1-10の範囲）のみを集計対象とする
   - 0や無効値は集計から除外

2. **月次平均喫食率**:
   ```
   月次平均 = Σ(月内の全記録のeatingRatio) / 月内の記録数
   結果 = Math.round(月次平均 * 10) / 10
   ```

3. **利用者別平均喫食率**:
   ```
   利用者平均 = Σ(該当利用者の全記録のeatingRatio) / 該当利用者の記録数
   結果 = Math.round(利用者平均 * 10) / 10
   ```

4. **カテゴリ別平均喫食率**:
   ```
   カテゴリ平均 = Σ(該当カテゴリの全記録のeatingRatio) / 該当カテゴリの記録数
   結果 = Math.round(カテゴリ平均 * 10) / 10
   ```

**実装場所**:
- `src/utils/statisticsCalculator.ts`: `calculateDailyStats()`, `calculateMonthlyTrends()`, `calculateOverallStatistics()`
- `src/utils/csvExport.ts`: `exportMonthlyReportCSV()`, `exportPeriodReportCSV()`

**評価スコア**: 本アプリケーションでは「評価スコア」という概念はなく、「喫食率（食べた量）」のみを使用。喫食率がそのまま評価として機能する。

### 5.3 入力バリデーション仕様

#### 利用者登録時の制限事項

**必須項目**:
- `name`（利用者名）: **必須**
- `group`（グループ）: **必須**（'グループA' | 'グループB' | 'グループC' | 'その他'のいずれか）
- `category`（カテゴリ）: **必須**（'A型' | 'B型' | '体験者' | '職員'のいずれか）

**文字数制限**:
- `name`（利用者名）: **最大50文字**
- `notes`（備考）: 制限なし（任意項目）

**数値制限**:
- `price`（料金）: **0円～10,000円**の範囲
- `displayNumber`（表示番号）: **1以上の整数**

**その他の制限**:
- 利用者名の重複チェック: 同じ名前の利用者は登録不可
- 利用者名の前後空白は自動的にトリムされる

**実装場所**: `src/components/UserManagement.tsx`の`validateUserData()`関数

#### 給食記録登録時の制限事項

**必須項目**:
- `userId`（利用者ID）: **必須**
- `date`（日付）: **必須**（有効な日付形式）
- `eatingRatio`（食べた量）: **必須**（1-10の整数）
- `price`（料金）: **必須**（0以上の数値）

**数値制限**:
- `eatingRatio`（食べた量）: **1-10の整数**（1割～10割）
- `price`（料金）: **0以上の数値**（0円も可）

**その他の制限**:
- `menuName`（メニュー名）: 任意項目、制限なし
- `supportNotes`（支援記録）: 任意項目、制限なし

**実装場所**: `src/utils/dataValidator.ts`の`validateMealRecord()`関数

#### メニュー登録時の制限事項

**必須項目**:
- `name`（メニュー名）: **必須**
- `date`（日付）: **必須**（有効な日付形式）

**文字数制限**:
- メニュー名、説明文: 明示的な制限なし（ただし、XSS対策のサニタイゼーションあり）

**実装場所**: `src/utils/dataValidator.ts`の`validateString()`関数

#### セキュリティ対策
- XSS攻撃パターンの検出（`<script>`, `javascript:`, `on*=`属性）
- 制御文字の検出（警告として表示）
- 入力値のサニタイゼーション（`sanitizeInput()`関数）

### 5.4 利用者一括登録仕様

#### UI仕様

**配置場所**: 利用者管理画面（`UserManagement.tsx`）のToolbar下

**UIコンポーネント**:
- **Accordion（アコーディオン）**: 展開/折りたたみ可能なパネル
- **グループ選択**: ドロップダウンでグループを選択（デフォルト: グループB）
- **テキストエリア**: 8行のマルチライン入力（等幅フォント）
- **登録ボタン**: 「登録する」ボタンと「キャンセル」ボタン

**プレースホルダー**:
```
（例）
山田 太郎
鈴木 花子
佐藤 次郎
```

#### 登録ロジック

**入力処理**:
1. テキストエリアの内容を行ごとに分割（`\n`で分割）
2. 各行をトリム（前後空白削除）
3. 空行を無視

**重複チェック**:
- 既存ユーザー名と大文字小文字を区別せずに比較
- 重複する名前は自動的にスキップ
- 重複スキップ件数をカウント

**バリデーション**:
- 名前の長さチェック: 最大50文字（超過時はスキップ）
- 空文字列チェック: 空行は無視
- 入力全体が空の場合: エラーメッセージ表示

**登録処理**:
- カテゴリ別の表示番号を自動採番（既存の最大値+1）
- グループ選択に基づいてカテゴリを自動設定
- 新規ユーザーのみを一括登録
- 登録後、テキストエリアをクリアしてパネルを閉じる

**結果メッセージ**:
- **成功時（重複なし）**: 「○件の利用者を追加しました」
- **成功時（重複あり）**: 「○件の利用者を追加しました（重複スキップ: ○件）」
- **エラー時**: 適切なエラーメッセージ（空入力、無効な名前など）

**実装場所**: `src/components/UserManagement.tsx`の`handleBulkRegister()`関数

**使用例**:
```
山田 太郎
鈴木 花子
佐藤 次郎
```
この入力で3名の利用者が一括登録されます（グループ選択に基づいてカテゴリが自動設定）。

### 5.5 管理画面へのアクセス経路

#### UI上の遷移方法

**アクセス経路**:
1. **CategorySelector（カテゴリ選択画面）**の右上に固定表示されている**設定アイコン（歯車アイコン）**をクリック
2. クリックすると即座に`AdminPanel`（管理者メニュー）に遷移

**実装詳細**:
- **コンポーネント**: `src/components/CategorySelector.tsx`
- **UI要素**: Material-UIの`Fab`（Floating Action Button）コンポーネント
- **位置**: `position: fixed`, `top: 16px`, `right: 16px`（画面右上固定）
- **アイコン**: `SettingsIcon`（Material-UIの設定アイコン）
- **色**: グレー系（`backgroundColor: '#424242'`）

**遷移処理**:
```typescript
onClick={() => dispatch({ type: 'SET_VIEW', payload: 'adminPanel' })}
```
- 確認ダイアログなし
- 認証チェックなし
- 即座に画面遷移

#### アクセス制限の有無

**現在の実装**: **オプションでパスコード認証あり**

**パスコード認証機能**:
- **設定場所**: AdminPanel内の「セキュリティ設定」セクション
- **設定方法**: 「管理者パスコードを有効にする」トグルスイッチをONにし、4桁の数字を入力・確認
- **保存場所**: LocalStorage（`aoba-security-settings`キー）
- **パスコード形式**: 4桁の数字のみ（`/^\d{4}$/`）

**アクセス時の挙動**:
- **パスコード設定時**: CategorySelectorの歯車アイコンクリック時に認証モーダル（数字キーパッド）を表示
  - 正しい4桁数字入力時のみ管理者画面へ遷移
  - 間違ったパスコード時はエラーメッセージ表示
- **パスコード未設定時**: 従来通り即座に管理者画面へ遷移（認証不要）

**認証モーダルの仕様**:
- **UI**: 数字キーパッド（電卓風UI、タブレット対応）
- **入力表示**: 4桁の入力状態を●で表示
- **機能**: バックスペース、クリア、キャンセル機能あり
- **実装場所**: `src/components/AdminPasscodeAuth.tsx`

**セキュリティ設定管理**:
- **実装場所**: `src/utils/securitySettings.ts`
- **主要関数**:
  - `loadSecuritySettings()`: セキュリティ設定の読み込み
  - `saveSecuritySettings()`: セキュリティ設定の保存
  - `isPasscodeEnabled()`: パスコード有効/無効の確認
  - `validatePasscode()`: パスコード検証
  - `isValidPasscodeFormat()`: パスコード形式チェック

**注意事項**:
- パスコードはLocalStorageに平文で保存（暗号化なし）
- パスコードを忘れた場合: LocalStorageをクリアすることでリセット可能
- パスコード無効化: AdminPanelのセキュリティ設定でトグルOFFにすることで無効化可能

---

---

## 6. 新機能追加履歴

### 6.1 管理者アクセス制御機能（v2.1.0以降）

**実装日**: 2025年1月

**機能概要**:
- 管理者画面へのアクセスをパスコードで保護可能
- 4桁の数字パスコードを設定・管理
- 数字キーパッドによる認証モーダル

**実装ファイル**:
- `src/utils/securitySettings.ts` - セキュリティ設定管理
- `src/components/AdminPasscodeAuth.tsx` - 認証モーダル
- `src/components/AdminPanel.tsx` - セキュリティ設定UI
- `src/components/CategorySelector.tsx` - 認証チェック

### 6.2 利用者一括登録機能（v2.1.0以降）

**実装日**: 2025年1月

**機能概要**:
- テキストエリアへの改行区切り入力で複数利用者を一括登録
- 重複チェックと自動スキップ
- グループ/カテゴリ選択対応

**実装ファイル**:
- `src/components/UserManagement.tsx` - 一括登録UIとロジック

---

**最終更新**: 2025年1月
**バージョン**: 2.1.0

