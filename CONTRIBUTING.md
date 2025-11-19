# 🤝 貢献ガイドライン

## はじめに

あおば給食摂食量管理アプリへの貢献に興味をお持ちいただき、ありがとうございます！このドキュメントでは、プロジェクトへの貢献方法をご案内します。

## 📋 目次

1. [行動規範](#行動規範)
2. [開発環境のセットアップ](#開発環境のセットアップ)
3. [貢献の流れ](#貢献の流れ)
4. [コーディング規約](#コーディング規約)
5. [コミットメッセージ規約](#コミットメッセージ規約)
6. [プルリクエストガイドライン](#プルリクエストガイドライン)
7. [バグ報告](#バグ報告)
8. [機能提案](#機能提案)

---

## 行動規範

すべての貢献者は、尊重と協力の精神でコミュニケーションを行うことを期待されます。

### 期待される行動

- 建設的なフィードバックを提供する
- 異なる視点や経験を尊重する
- プロジェクトとコミュニティの利益を優先する
- 丁寧で包括的な言葉遣いを使用する

### 許容されない行動

- 個人攻撃や侮辱的なコメント
- ハラスメントや差別
- プライバシーの侵害
- その他、プロフェッショナルでない行動

---

## 開発環境のセットアップ

### 必要な環境

- **OS**: Windows 11 / macOS / Linux
- **Node.js**: 18.x 以上
- **npm**: 9.x 以上
- **Git**: 最新版
- **エディタ**: VS Code / Cursor 推奨

### セットアップ手順

```bash
# リポジトリをクローン
git clone https://github.com/mokemoke0821/aoba-meal-app.git
cd aoba-meal-app

# 依存パッケージをインストール
npm install

# 開発サーバーを起動
npm start

# ブラウザで http://localhost:3000 にアクセス
```

### ビルドとテスト

```bash
# 本番ビルド
npm run build

# テスト実行
npm test

# カバレッジ付きテスト
npm run test:ci

# Lint実行
npm run lint

# Lint自動修正
npm run lint:fix
```

---

## 貢献の流れ

### 1. Issue を作成または選択

- 新機能やバグ修正を始める前に、関連する Issue を作成または選択します
- 既存の Issue を確認し、重複を避けます
- Issue に自分をアサインします

### 2. ブランチを作成

```bash
# 最新のmainブランチを取得
git checkout main
git pull origin main

# 新しいブランチを作成
git checkout -b feature/your-feature-name
# または
git checkout -b fix/bug-name
```

**ブランチ命名規則**:
- `feature/` - 新機能
- `fix/` - バグ修正
- `docs/` - ドキュメント更新
- `refactor/` - リファクタリング
- `test/` - テスト追加・修正
- `chore/` - ビルド設定など

### 3. コードを変更

- コーディング規約に従ってコードを記述
- 適切なコメントを追加
- 必要に応じてテストを追加

### 4. テストとLint

```bash
# テスト実行
npm test

# Lint実行
npm run lint

# 型チェック
npx tsc --noEmit
```

### 5. コミット

```bash
git add .
git commit -m "feat: 新機能の説明"
```

### 6. プッシュとプルリクエスト

```bash
git push origin feature/your-feature-name
```

GitHub上でプルリクエストを作成します。

---

## コーディング規約

### TypeScript

#### 型定義

```typescript
// ✅ 良い例
interface User {
  id: string;
  name: string;
  age: number;
}

// ❌ 悪い例（any型禁止）
interface User {
  id: any;
  name: any;
  age: any;
}
```

#### 関数定義

```typescript
// ✅ 良い例
const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// ❌ 悪い例
const calculateTotal = (items: any): any => {
  return items.reduce((sum: any, item: any) => sum + item.price, 0);
};
```

### React コンポーネント

#### 関数コンポーネント

```typescript
// ✅ 良い例
interface Props {
  title: string;
  count: number;
}

export const MyComponent: React.FC<Props> = ({ title, count }) => {
  return (
    <div>
      <h1>{title}</h1>
      <p>Count: {count}</p>
    </div>
  );
};

// ❌ 悪い例
export const MyComponent = (props: any) => {
  return <div>{props.title}</div>;
};
```

#### Hooks の使用

```typescript
// ✅ 良い例
const [count, setCount] = useState<number>(0);

useEffect(() => {
  console.log('Count changed:', count);
}, [count]);

// ❌ 悪い例
const [count, setCount] = useState(0); // 型推論に依存
```

### ファイル構成

```
src/
├── components/          # Reactコンポーネント
│   ├── common/         # 共通コンポーネント
│   └── __tests__/      # コンポーネントテスト
├── contexts/           # Context API
├── hooks/              # カスタムHooks
├── utils/              # ユーティリティ関数
├── types/              # 型定義
└── App.tsx             # メインコンポーネント
```

### 命名規則

- **コンポーネント**: PascalCase（例: `UserSelector.tsx`）
- **関数・変数**: camelCase（例: `calculateTotal`）
- **定数**: UPPER_SNAKE_CASE（例: `MAX_USERS`）
- **型・インターフェース**: PascalCase（例: `User`, `MealRecord`）

---

## コミットメッセージ規約

### Conventional Commits

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type（必須）

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント更新
- `style`: コードスタイル変更（機能変更なし）
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: ビルド設定、依存関係更新など

### 例

```bash
feat(statistics): 記録待ち利用者リスト機能を追加

- カテゴリ別グループ化表示
- リアルタイム更新対応
- 視覚的な強調表示

Closes #123
```

```bash
fix(meal-order): 給食希望画面で戻るボタンが機能しない問題を修正

バグの詳細:
- 戻るボタンのonClickイベントが正しく設定されていなかった

修正内容:
- handleBackを正しくバインド

Fixes #45
```

---

## プルリクエストガイドライン

### プルリクエストの作成前

- [ ] すべてのテストがパスすることを確認
- [ ] Lintエラーがないことを確認
- [ ] TypeScriptエラーがないことを確認
- [ ] 変更内容に対応するテストを追加
- [ ] ドキュメントを更新（必要に応じて）

### プルリクエストのテンプレート

```markdown
## 概要
<!-- 変更内容の簡単な説明 -->

## 変更内容
<!-- 具体的な変更内容をリストアップ -->
- 
- 

## 関連Issue
<!-- 関連するIssue番号 -->
Closes #

## スクリーンショット
<!-- UIに変更がある場合、スクリーンショットを添付 -->

## テスト
<!-- テストの実行結果 -->
- [ ] ユニットテストパス
- [ ] 手動テスト実施

## チェックリスト
- [ ] コードレビューを受ける準備ができている
- [ ] ドキュメントを更新した
- [ ] テストを追加・更新した
- [ ] Lintエラーなし
- [ ] TypeScriptエラーなし
```

### レビュープロセス

1. プルリクエスト作成
2. 自動テスト実行（GitHub Actions）
3. コードレビュー（1名以上）
4. フィードバック対応
5. 承認後、マージ

---

## バグ報告

### バグ報告テンプレート

```markdown
## バグの説明
<!-- バグの詳細な説明 -->

## 再現手順
1. 
2. 
3. 

## 期待される動作
<!-- 正しい動作の説明 -->

## 実際の動作
<!-- 実際に発生した動作 -->

## スクリーンショット
<!-- 可能であればスクリーンショットを添付 -->

## 環境
- **OS**: 
- **ブラウザ**: 
- **バージョン**: 
- **デバイス**: 

## 追加情報
<!-- その他の関連情報 -->
```

### 優先度ラベル

- `priority: critical` - 即座に修正が必要
- `priority: high` - 早急に修正が必要
- `priority: medium` - 通常の修正
- `priority: low` - 低優先度

---

## 機能提案

### 機能提案テンプレート

```markdown
## 機能の概要
<!-- 提案する機能の簡単な説明 -->

## 背景と動機
<!-- なぜこの機能が必要か -->

## 提案する解決策
<!-- 具体的な実装方法の提案 -->

## 代替案
<!-- 他に考えられる実装方法 -->

## 追加コンテキスト
<!-- その他の関連情報、スクリーンショットなど -->
```

### 機能提案の評価基準

- ユーザーへの価値
- 実装の複雑さ
- 既存機能との整合性
- 保守性への影響

---

## 開発のヒント

### デバッグ

```bash
# デバッグモードで開発サーバー起動
npm start

# React DevToolsを使用
# Chrome拡張機能: React Developer Tools
```

### LocalStorage確認

```javascript
// ブラウザのコンソールで実行
localStorage.getItem('aoba-meal-users');
localStorage.getItem('aoba-meal-records');
```

### Service Worker のクリア

```javascript
// ブラウザのコンソールで実行
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister());
});
```

---

## 質問がある場合

- **Issue**: GitHub Issueで質問を作成
- **メール**: プロジェクトメンテナーに連絡
- **ドキュメント**: [README.md](./README.md)、[仕様書](./仕様書_最新版_2025.md) を参照

---

## 謝辞

このプロジェクトに貢献していただき、ありがとうございます！あなたの貢献は、就労移行支援事業所での給食管理業務の改善に大きく貢献します。

---

**最終更新**: 2025年11月5日  
**バージョン**: 2.1.0  
**ライセンス**: MIT


