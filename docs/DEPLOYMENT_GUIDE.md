# 🚀 GitHub Pages デプロイガイド

## 📋 目次
- [クイックスタート](#クイックスタート)
- [デプロイ方法](#デプロイ方法)
- [トラブルシューティング](#トラブルシューティング)
- [GitHub Pages設定](#github-pages設定)
- [確認チェックリスト](#確認チェックリスト)

---

## ⚡ クイックスタート

### 通常のデプロイ（推奨）
```bash
npm run deploy:quick
```

### 強制リビルド付きデプロイ
```bash
npm run deploy:force
```

### homepage設定の確認のみ
```bash
npm run check:homepage
```

---

## 🔧 デプロイ方法

### 方法1: npm scriptsを使用（推奨）

**通常デプロイ**:
```bash
npm run deploy:quick
```

自動実行される内容:
1. homepage設定チェック
2. プロダクションビルド
3. gh-pagesブランチにデプロイ
4. GitHub Actionsが自動実行

**予想時間**: 3-5分

---

**強制リビルドデプロイ**（問題が起きた時）:
```bash
npm run deploy:force
```

自動実行される内容:
1. homepage設定チェック
2. プロダクションビルド
3. gh-pagesブランチにデプロイ
4. gh-pagesに空コミット（GitHub Pagesを強制トリガー）
5. mainブランチに戻る

**予想時間**: 5-10分

---

### 方法2: 手動デプロイ

```bash
# Step 1: ビルド
npm run build

# Step 2: デプロイ
npm run deploy

# Step 3: mainブランチにコミット（GitHub Actions用）
git add .
git commit -m "chore: deploy to GitHub Pages"
git push origin main
```

---

## 🚨 トラブルシューティング

### 問題1: homepage設定エラー

**エラーメッセージ**:
```
❌ ERROR: package.json の homepage が正しくありません
```

**原因**: `package.json` の `homepage` が `"."` になっている

**解決策**:
1. `package.json` を開く
2. `homepage` を以下に修正:
   ```json
   "homepage": "https://mokemoke0821.github.io/aoba-meal-app"
   ```
3. 保存して再実行

---

### 問題2: 古いバージョンが表示される

**症状**: デプロイ成功したが、アプリに古いバージョンが表示される

**原因**: ブラウザキャッシュまたはCDNキャッシュ

**解決策**:

**Step 1: ブラウザキャッシュクリア**
```
1. すべてのChromeウィンドウを閉じる
2. Chromeを再起動
3. Ctrl + Shift + Delete
4. 期間: "すべて"
5. "キャッシュされた画像とファイル" にチェック
6. "データを削除"
```

**Step 2: ハードリロード**
```
Ctrl + Shift + R
```

**Step 3: Service Worker削除**
```
1. F12 → Application タブ
2. Service Workers → Unregister
3. ページリロード
```

**Step 4: 強制リビルド**
```bash
npm run deploy:force
```

**Step 5: 待つ**
- CDN反映に5-15分かかる場合がある
- 10分待ってから再確認

---

### 問題3: GitHub Actionsが失敗

**確認方法**:
```
https://github.com/mokemoke0821/aoba-meal-app/actions
```

**よくあるエラーと解決策**:

#### エラー1: ビルドエラー
```bash
# 依存関係を再インストール
rm -rf node_modules
npm install --legacy-peer-deps
npm run build
```

#### エラー2: デプロイ権限エラー
```
GitHub Settings → Actions → General
→ Workflow permissions
→ "Read and write permissions" にチェック
→ Save
```

---

### 問題4: pages build and deployment が実行されない

**症状**: カスタムワークフロー（Deploy to GitHub Pages）は成功するが、GitHub公式の "pages build and deployment" が実行されない

**原因**: GitHub Pages設定が正しくない

**解決策**:

**Step 1: GitHub Pages設定確認**
```
https://github.com/mokemoke0821/aoba-meal-app/settings/pages
```

**Step 2: 設定を確認**
- Source: "Deploy from a branch"
- Branch: "gh-pages" / "/ (root)"

**Step 3: 設定が正しい場合、強制リビルド**
```bash
npm run deploy:force
```

---

## ⚙️ GitHub Pages設定

### 正しい設定

**GitHub Settings → Pages**

| 設定項目 | 正しい値 |
|---------|---------|
| Source | Deploy from a branch |
| Branch | gh-pages |
| Folder | / (root) |

### package.json設定

```json
{
  "homepage": "https://mokemoke0821.github.io/aoba-meal-app"
}
```

⚠️ **絶対に `"homepage": "."` にしないこと**

### craco.config.js設定

```javascript
navigateFallback: '/aoba-meal-app/index.html',
```

⚠️ **この設定は変更しないこと**

---

## ✅ 確認チェックリスト

### デプロイ前
- [ ] `npm run check:homepage` でエラーなし
- [ ] `npm run build` でビルド成功
- [ ] TypeScriptエラー 0件

### デプロイ後（2-3分後）
- [ ] GitHub Actions 確認: https://github.com/mokemoke0821/aoba-meal-app/actions
  - [ ] "Deploy to GitHub Pages" ワークフロー: ✅ 成功
  - [ ] "pages build and deployment" ワークフロー: ✅ 成功

### デプロイ後（5-10分後）
- [ ] 新しいJSファイルにアクセス: https://mokemoke0821.github.io/aoba-meal-app/static/js/main.xxxxxxxx.js
  - [ ] ステータス: 200 OK

### デプロイ後（8-15分後）
- [ ] ブラウザキャッシュクリア
- [ ] アプリにアクセス: https://mokemoke0821.github.io/aoba-meal-app
- [ ] Chrome DevTools 確認:
  - [ ] Console: エラーなし
  - [ ] Network: 全リソース 200 OK
  - [ ] Application → Service Worker: 登録済み
  - [ ] Application → Manifest: 正常

### 動作確認
- [ ] トップページが表示される
- [ ] カテゴリ選択が機能する
- [ ] 利用者一覧が表示される
- [ ] 摂食量記録が可能
- [ ] 統計画面が表示される
- [ ] PWAインストールボタンが表示される

---

## 🎯 デプロイフロー図

```
開発者
  ↓
npm run deploy:quick
  ↓
[自動] homepage チェック
  ↓
[自動] ビルド (npm run build)
  ↓
[自動] gh-pages デプロイ
  ↓
GitHub Actions (Deploy to GitHub Pages)
  ↓
gh-pages ブランチ更新
  ↓
GitHub Pages (pages build and deployment)
  ↓
CDN配信開始 (5-15分)
  ↓
ユーザーがアクセス可能
```

---

## 📊 タイムライン

| 時間 | イベント |
|------|---------|
| 0分 | デプロイコマンド実行 |
| 1分 | ビルド完了 |
| 2分 | gh-pagesプッシュ完了 |
| 3分 | Deploy to GitHub Pages 完了 |
| 5分 | pages build and deployment 完了 |
| 10分 | CDN反映完了（通常） |
| 15分 | CDN反映完了（最大） |

---

## 🛠️ 便利なコマンド一覧

```bash
# デプロイ関連
npm run deploy:quick          # 通常デプロイ
npm run deploy:force          # 強制リビルド
npm run check:homepage        # homepage確認

# ビルド関連
npm run build                 # プロダクションビルド
npm run build:dev             # 開発ビルド
npm run build:pwa             # PWAビルド+テスト

# 検証関連
npm run validate:manifest     # manifest.json検証
npm run test:pwa              # PWAテスト

# Git関連（手動）
git status                    # 変更確認
git log --oneline -5          # 最近のコミット
git checkout gh-pages         # gh-pagesブランチに切り替え
git checkout main             # mainブランチに戻る
```

---

## 📝 重要な注意事項

### ⚠️ 絶対にやってはいけないこと

1. **homepage を "." に変更**
   ```json
   // ❌ 絶対ダメ
   "homepage": "."
   
   // ✅ 正しい
   "homepage": "https://mokemoke0821.github.io/aoba-meal-app"
   ```

2. **craco.config.js の navigateFallback を変更**
   ```javascript
   // ❌ 変更しない
   navigateFallback: '/aoba-meal-app/index.html',
   ```

3. **GitHub Pages の Source を "GitHub Actions" に変更**
   - 必ず "Deploy from a branch" + "gh-pages" を使用

### ✅ 推奨事項

1. **デプロイ前に必ずチェック**
   ```bash
   npm run check:homepage
   ```

2. **定期的にGitHub Actionsを確認**
   - 週1回: https://github.com/mokemoke0821/aoba-meal-app/actions

3. **デプロイ後は必ずキャッシュクリア**
   - 古いバージョンが表示される原因の90%

---

## 🆘 サポート

問題が解決しない場合：

1. このドキュメントの「トラブルシューティング」を確認
2. GitHub Issues を検索
3. 以下の情報を集めて報告：
   - エラーメッセージ全文
   - `npm run check:homepage` の出力
   - GitHub Actions のログ
   - Chrome DevTools Console のエラー

---

**最終更新**: 2025年10月28日
**バージョン**: 2.1.0

