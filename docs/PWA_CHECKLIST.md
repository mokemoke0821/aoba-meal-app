# ✅ PWA品質保証チェックリスト

## 📋 目次

1. [デプロイ前チェックリスト](#デプロイ前チェックリスト)
2. [ブラウザ別動作確認](#ブラウザ別動作確認)
3. [Lighthouse監査基準](#lighthouse監査基準)
4. [Service Worker更新手順](#service-worker更新手順)
5. [トラブルシューティングチェック](#トラブルシューティングチェック)

---

## デプロイ前チェックリスト

PWAをデプロイする前に、以下の項目を確認してください。

### 📦 ビルド検証（必須）

- [ ] **1. npm run build が成功**
  - エラー0件
  - 警告0件（可能な限り）
  - ビルド時間が正常範囲内（2-5分程度）

- [ ] **2. build/ディレクトリ内容確認**
  - `index.html` が生成されている
  - `service-worker.js` が生成されている
  - `manifest.json` が正しくコピーされている
  - `static/js/` ディレクトリにJSファイルが存在
  - `static/css/` ディレクトリにCSSファイルが存在

- [ ] **3. ファイルサイズ確認**
  - メインJSバンドル: 500KB以下（gzip後）
  - メインCSSファイル: 50KB以下（gzip後）
  - Service Worker: 10KB以下

### 🎨 manifest.json 検証（必須）

- [ ] **4. 必須フィールド存在確認**
  - `id` フィールドが存在（例: `/aoba-meal-app/`）
  - `name` フィールドが存在
  - `short_name` フィールドが存在
  - `start_url` フィールドが存在
  - `display` が `standalone` または `fullscreen`

- [ ] **5. アイコン設定確認**
  - 192x192 アイコンが存在（`purpose: "any"`）
  - 192x192 アイコンが存在（`purpose: "maskable"`）
  - 512x512 アイコンが存在（`purpose: "any"`）
  - 512x512 アイコンが存在（`purpose: "maskable"`）
  - アイコンファイルが実際に存在する

- [ ] **6. サブパス対応確認**
  - `start_url` がサブパスを含む（例: `/aoba-meal-app/`）
  - `scope` がサブパスを含む（例: `/aoba-meal-app/`）
  - `id` がサブパスを含む（例: `/aoba-meal-app/`）

- [ ] **7. テーマ設定確認**
  - `theme_color` が適切な色（例: `#1976d2`）
  - `background_color` が適切な色（例: `#ffffff`）
  - `orientation` が設定されている（例: `portrait`）

### 🔧 Service Worker 検証（必須）

- [ ] **8. Service Worker生成確認**
  - `build/service-worker.js` が存在
  - ファイルサイズが0バイトでない
  - Workbox関連のコードが含まれている

- [ ] **9. Precache設定確認**
  - `index.html` がプリキャッシュに含まれる
  - 静的アセット（JS/CSS）がプリキャッシュに含まれる
  - manifest.jsonはプリキャッシュから除外される

- [ ] **10. Runtime Caching設定確認**
  - 画像のキャッシュ戦略が定義されている
  - フォントのキャッシュ戦略が定義されている
  - ナビゲーションのキャッシュ戦略が定義されている
  - 静的アセットのキャッシュ戦略が定義されている

### 📝 package.json 確認

- [ ] **11. homepage フィールド確認**
  - GitHub PagesのURLが正しい
  - サブパスが含まれている（例: `/aoba-meal-app`）

- [ ] **12. dependencies 確認**
  - `workbox-webpack-plugin` がインストールされている
  - バージョンが最新の安定版（7.x以上）

- [ ] **13. scripts 確認**
  - `build` スクリプトが定義されている
  - `deploy` スクリプトが定義されている（GitHub Pages用）
  - `test:pwa` スクリプトが定義されている（PWAテスト用）

### 🖼️ アイコンファイル確認

- [ ] **14. アイコンファイル存在確認**
  - `public/icons/icon-192x192.png` が存在
  - `public/icons/icon-512x512.png` が存在
  - ファイルサイズが適切（192x192: ~5-20KB、512x512: ~20-50KB）

- [ ] **15. アイコン画質確認**
  - 画像が鮮明（ピクセル化していない）
  - 透過PNG形式
  - 適切な余白（maskable用）

### 📄 TypeScript/ESLint 確認

- [ ] **16. TypeScriptエラー0件**
  - `tsc --noEmit` でエラーがない
  - `any` 型の使用がない（型安全性）

- [ ] **17. ESLintエラー0件**
  - `npm run lint` でエラーがない
  - 警告も可能な限り解消

### 🧪 ローカルテスト

- [ ] **18. ローカルサーバーで動作確認**
  - `npm run build` 後、静的サーバーで確認
  - Service Workerが正常に登録される
  - オフラインモードで動作する

- [ ] **19. Chrome DevTools確認**
  - Application → Manifest が正常に表示
  - Application → Service Workers が "activated" 状態
  - Application → Cache Storage にキャッシュが存在

- [ ] **20. インストールテスト**
  - Chrome/Edgeで「インストール」ボタンが表示される
  - インストール後、スタンドアロンモードで起動
  - ホーム画面にアイコンが表示される

---

## ブラウザ別動作確認

### 🖥️ デスクトップブラウザ

#### Chrome（Windows/macOS/Linux）

- [ ] **21. インストール可能性**
  - アドレスバーに「インストール」アイコン表示
  - インストール後、デスクトップにショートカット作成
  - スタンドアロンモードで起動（ブラウザUIなし）

- [ ] **22. オフライン動作**
  - DevToolsでオフラインモードに設定
  - アプリが正常に動作（キャッシュから読み込み）
  - 「オフライン」メッセージが表示されない

- [ ] **23. Service Worker更新**
  - アプリ更新後、新バージョンが自動適用
  - リロード後、最新版が表示される

#### Edge（Windows/macOS）

- [ ] **24. インストール可能性**
  - アドレスバーに「アプリのインストール」ボタン表示
  - インストール後、タスクバーにピン留め可能
  - Windowsスタートメニューに追加される

- [ ] **25. PWA機能**
  - Chromeと同等の動作
  - Edgeの拡張機能との互換性

#### Firefox（Windows/macOS/Linux）

- [ ] **26. 基本動作**
  - アプリが正常に表示される
  - Service Workerが動作する（キャッシュ機能）
  - **注意**: Firefoxは現時点でPWAインストールをサポートしていない

#### Safari（macOS）

- [ ] **27. 基本動作**
  - アプリが正常に表示される
  - Service Workerが動作する
  - **注意**: macOS SafariはPWAインストールをサポートしていない（iOS Safariはサポート）

### 📱 モバイルブラウザ

#### Android Chrome

- [ ] **28. インストール可能性**
  - 画面上部に「ホーム画面に追加」バナー表示
  - メニュー → 「アプリをインストール」が表示される
  - インストール後、アプリドロワーにアイコン追加

- [ ] **29. ネイティブ体験**
  - ステータスバーの色が `theme_color` と一致
  - スプラッシュ画面が表示される（白背景 + アイコン）
  - 戻るボタンでアプリ内ナビゲーション

- [ ] **30. オフライン動作**
  - 機内モードでアプリが起動
  - キャッシュされたデータが表示される

#### iOS Safari

- [ ] **31. インストール手順**
  - 「共有」ボタン（□↑）→「ホーム画面に追加」が表示される
  - インストール後、ホーム画面にアイコン追加
  - タップで起動（Safari UIなし）

- [ ] **32. 制限事項の理解**
  - iOS SafariはService Workerの制限あり
  - プッシュ通知は未サポート
  - キャッシュは定期的にクリアされる可能性

- [ ] **33. 画面表示**
  - ステータスバーが適切に表示
  - セーフエリアの考慮（notch対応）

### 🖥️ タブレット

#### iPad（iPadOS Safari）

- [ ] **34. レイアウト確認**
  - 縦向き・横向き両方で適切に表示
  - タッチ操作が正常に動作

#### Android Tablet

- [ ] **35. レイアウト確認**
  - 大画面で適切にレイアウト
  - レスポンシブデザインが機能

---

## Lighthouse監査基準

Google Chromeの**Lighthouse**を使用して、PWA品質を監査します。

### 🚀 監査実行方法

1. Chrome DevTools（F12）を開く
2. 「Lighthouse」タブを選択
3. 「Progressive Web App」にチェック
4. 「Analyze page load」をクリック

### 📊 スコア目標

| カテゴリ | 目標スコア | 最低スコア |
|---------|-----------|-----------|
| **Progressive Web App** | 95点以上 | 90点 |
| **Performance** | 90点以上 | 85点 |
| **Accessibility** | 95点以上 | 90点 |
| **Best Practices** | 95点以上 | 90点 |
| **SEO** | 90点以上 | 85点 |

### ✅ PWA監査項目

- [ ] **36. Fast and reliable**
  - ページが200で応答する（サーバーエラーなし）
  - Service Workerが正常に登録されている
  - オフラインで動作する

- [ ] **37. Installable**
  - manifest.jsonが存在し、正しく設定されている
  - アイコンが適切なサイズで提供されている
  - `start_url` が正しく機能する

- [ ] **38. PWA Optimized**
  - `theme_color` が設定されている
  - ビューポートが設定されている
  - コンテンツが適切にサイズ調整されている

- [ ] **39. Additional checks**
  - HTTPSで配信されている
  - HTTPからHTTPSにリダイレクトされる
  - スプラッシュ画面が適切に設定されている

### 📈 Performance監査項目

- [ ] **40. Core Web Vitals**
  - **LCP (Largest Contentful Paint)**: 2.5秒以下
  - **FID (First Input Delay)**: 100ms以下
  - **CLS (Cumulative Layout Shift)**: 0.1以下

- [ ] **41. 読み込み速度**
  - **First Contentful Paint**: 1.8秒以下
  - **Speed Index**: 3.4秒以下
  - **Time to Interactive**: 3.8秒以下

- [ ] **42. 最適化**
  - 画像が適切にサイズ調整されている
  - 未使用のJavaScript/CSSが最小限
  - 効率的なキャッシュポリシー

### ♿ Accessibility監査項目

- [ ] **43. ARIA属性**
  - すべてのインタラクティブ要素にARIAラベル
  - ボタンに適切なaria-label

- [ ] **44. カラーコントラスト**
  - テキストと背景のコントラスト比が4.5:1以上

- [ ] **45. キーボード操作**
  - すべての機能がキーボードで操作可能
  - フォーカス順序が論理的

---

## Service Worker更新手順

アプリを更新する際の、Service Worker更新フローを理解しておきます。

### 🔄 更新フロー

```
1. コード変更・ビルド
   ↓
2. GitHub Pagesデプロイ
   ↓
3. ユーザーがアプリにアクセス
   ↓
4. Service Workerが新バージョンを検出
   ↓
5. 新Service Workerをインストール
   ↓
6. skipWaiting: trueにより即座にアクティブ化
   ↓
7. ページがリロードされ、新バージョンが適用
```

### ✅ 更新確認チェックリスト

- [ ] **46. ビルド前確認**
  - すべてのコード変更がコミット済み
  - TypeScriptエラー0件
  - ESLintエラー0件

- [ ] **47. ビルド実行**
  - `npm run build` が成功
  - `build/service-worker.js` のハッシュが変更されている

- [ ] **48. デプロイ実行**
  - `npm run deploy` が成功
  - GitHub Pagesが更新されている（2-3分待機）

- [ ] **49. 更新確認**
  - ブラウザで本番URL（https://mokemoke0821.github.io/aoba-meal-app）にアクセス
  - DevTools → Application → Service Workers で新バージョンを確認
  - 必要に応じて「Update」ボタンをクリック

- [ ] **50. 機能テスト**
  - 新機能が正常に動作する
  - 既存機能が壊れていない
  - オフライン動作が継続している

### 🔧 手動Service Worker更新（トラブル時）

ユーザーがアプリ更新を認識しない場合の対処法：

1. **ソフトリフレッシュ**
   - [ ] **51.** Ctrl+R（Windows）または Cmd+R（macOS）でリロード

2. **ハードリフレッシュ**
   - [ ] **52.** Ctrl+Shift+R（Windows）または Cmd+Shift+R（macOS）でキャッシュクリア

3. **Service Worker手動更新**
   - [ ] **53.** DevTools → Application → Service Workers → Update

4. **完全リセット**
   - [ ] **54.** DevTools → Application → Clear storage → Clear site data
   - [ ] **55.** アプリを再インストール

---

## トラブルシューティングチェック

問題が発生した場合の診断チェックリストです。

### 🚨 問題: インストールボタンが表示されない

- [ ] **56.** HTTPSで配信されているか確認
- [ ] **57.** manifest.jsonが正しく読み込まれているか確認（DevTools → Application → Manifest）
- [ ] **58.** Service Workerが登録されているか確認（DevTools → Application → Service Workers）
- [ ] **59.** 必須アイコン（192x192、512x512）が存在するか確認
- [ ] **60.** `start_url` が正しく設定されているか確認

### 🚨 問題: オフラインで動作しない

- [ ] **61.** Service Workerが "activated" 状態か確認
- [ ] **62.** Cache Storageにキャッシュが存在するか確認
- [ ] **63.** `navigateFallback` が正しく設定されているか確認
- [ ] **64.** プリキャッシュに `index.html` が含まれているか確認

### 🚨 問題: アプリが更新されない

- [ ] **65.** GitHub Pagesが更新されているか確認（2-3分待機）
- [ ] **66.** ブラウザのキャッシュをクリア
- [ ] **67.** Service Workerを手動で「Unregister」
- [ ] **68.** ハードリフレッシュ（Ctrl+Shift+R）

### 🚨 問題: Service Workerエラー

- [ ] **69.** DevTools → Console でエラーメッセージを確認
- [ ] **70.** `service-worker.js` の構文エラーがないか確認
- [ ] **71.** Workbox設定（craco.config.js）が正しいか確認
- [ ] **72.** `workbox-webpack-plugin` のバージョンが最新か確認

### 🚨 問題: GitHub Pagesでルーティングエラー

- [ ] **73.** `package.json` の `homepage` が正しいか確認
- [ ] **74.** `navigateFallback` がサブパスを含むか確認
- [ ] **75.** manifest.jsonの `start_url`/`scope` がサブパスを含むか確認

---

## 最終確認チェックリスト

デプロイ直前の最終確認です。

### 🎯 本番環境デプロイ前（必須）

- [ ] **76.** すべてのビルド検証が完了
- [ ] **77.** すべてのブラウザ動作確認が完了
- [ ] **78.** Lighthouse監査で目標スコア達成
- [ ] **79.** Service Worker更新手順を理解している
- [ ] **80.** トラブルシューティング方法を把握している

### 📝 ドキュメント確認

- [ ] **81.** README.mdにPWA実装セクションが記載されている
- [ ] **82.** 技術仕様書（PWA_IMPLEMENTATION.md）が最新
- [ ] **83.** このチェックリスト（PWA_CHECKLIST.md）が最新

### 🚀 デプロイ後確認

- [ ] **84.** 本番URLにアクセスして動作確認
- [ ] **85.** 実機（スマートフォン）でインストールテスト
- [ ] **86.** オフライン動作の最終確認
- [ ] **87.** Lighthouse監査（本番環境）で目標スコア確認

---

## チェックリスト完了証明

すべてのチェック項目が完了したら、以下に記入してください：

```
✅ チェックリスト完了日: _______________
✅ 実施者: _______________
✅ 確認者: _______________

Lighthouse監査結果:
- PWA: _____点
- Performance: _____点
- Accessibility: _____点
- Best Practices: _____点
- SEO: _____点

コメント:
_________________________________________________
_________________________________________________
_________________________________________________
```

---

**作成日**: 2025年10月2日  
**バージョン**: 1.0.0  
**チェック項目数**: 87項目  
**作成者**: Claude (Sonnet 4.5)  
**最終更新**: 2025年10月2日


