# 🔧 Google Cloud Console 完全セットアップガイド

現在のエラーを解決するための完全な再設定手順です。

---

## ❌ **現在のエラー**

```
Not a valid origin for the client: http://localhost
```

ポート番号が認識されていないため、設定を根本から見直す必要があります。

---

## 📋 **Step 1: 現在の設定を確認**

### **1-1: Google Cloud Console にアクセス**

1. [Google Cloud Console](https://console.cloud.google.com/) を開く
2. 右上のプロジェクト名をクリック
3. **現在選択されているプロジェクト名を確認**

### **1-2: OAuth 2.0 クライアント ID を開く**

1. 左メニュー → 「APIとサービス」→「認証情報」
2. **「OAuth 2.0 クライアント ID」** セクションを確認
3. クライアント ID: `394222242539-nf5gs6h998k3norf6lo35od44bboen76` を探す

**⚠️ 重要**: このクライアントIDが見つからない場合、間違ったプロジェクトを選択しています！

### **1-3: クライアントの種類を確認**

クライアントIDをクリックして、以下を確認：

```
✅ 種類: ウェブ アプリケーション
❌ 種類: デスクトップ アプリ、Android、iOS など → 間違い！
```

**種類が「ウェブ アプリケーション」でない場合、新しく作成する必要があります。**

---

## 🆕 **Step 2: 新しいOAuth 2.0クライアントを作成（推奨）**

古い設定に問題がある可能性があるため、新規作成をお勧めします。

### **2-1: 新規作成**

1. 「認証情報」ページで「＋ 認証情報を作成」をクリック
2. 「OAuth クライアント ID」を選択

### **2-2: アプリケーションの種類**

```
✅ ウェブ アプリケーション
```

を選択（これが最重要！）

### **2-3: 名前を入力**

```
名前: あおば給食管理アプリ（開発・ポート3001）
```

### **2-4: JavaScript生成元を設定**

「承認済みのJavaScript生成元」で「URIを追加」をクリック：

```
✅ http://localhost:3001
```

**注意事項：**
- ポート番号 `:3001` を**必ず含める**
- 末尾にスラッシュ `/` は**付けない**
- `https` ではなく `http`

### **2-5: リダイレクトURIを設定**

「承認済みのリダイレクトURI」で「URIを追加」をクリック：

```
✅ http://localhost:3001
```

### **2-6: 作成**

「作成」ボタンをクリック

### **2-7: 認証情報をコピー**

表示されたポップアップから：
- **クライアント ID**: コピーして保存
- **クライアント シークレット**: コピーして保存（今回は使用しませんが、念のため）

---

## 🔑 **Step 3: APIキーを確認**

### **3-1: 既存のAPIキーを確認**

1. 「認証情報」ページで「APIキー」セクション
2. 使用中のAPIキー（`AIzaSyDUh-...`）をクリック

### **3-2: 制限を確認**

#### **アプリケーションの制限：**

デバッグのため、一時的に：
```
✅ なし（一時的）
```

または

```
✅ HTTPリファラー（ウェブサイト）
   ├─ http://localhost:3001/*
   └─ http://localhost:3001
```

#### **API の制限：**

```
✅ キーを制限
   └─ ✅ Google Drive API
```

### **3-3: 保存**

「保存」をクリック

---

## 📝 **Step 4: .env.local を更新**

新しく作成したクライアントIDで `.env.local` を更新：

```bash
# Google Drive API設定
REACT_APP_GOOGLE_CLIENT_ID=【新しいクライアントID】
REACT_APP_GOOGLE_API_KEY=AIzaSyDUh-XQFjVTl8EaGgsj-aNttLPnHdt3y4k

# Google Drive設定
REACT_APP_GOOGLE_DRIVE_FOLDER_NAME=あおば給食データ
REACT_APP_GOOGLE_DRIVE_BACKUP_INTERVAL=600000
```

---

## 🔄 **Step 5: アプリケーションを再起動**

### **5-1: サーバーを再起動**

PowerShellで：
```powershell
# Node.jsプロセスを停止
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# 開発サーバーを起動
cd C:\Users\prelude\Documents\Cline\MCP\MCP_FINAL\aoba-meal-app
$env:PORT = '3001'
$env:BROWSER = 'none'
npm start
```

### **5-2: ブラウザをリセット**

1. すべてのChromeウィンドウを閉じる
2. タスクマネージャーでChromeプロセスを終了
3. Chromeを再起動
4. `chrome://settings/clearBrowserData` でキャッシュをクリア
5. `http://localhost:3001` にアクセス
6. `Ctrl + Shift + R` でハードリロード

---

## ✅ **Step 6: 動作確認**

### **6-1: コンソールで確認**

F12で開発者ツールを開き、以下のログを確認：

#### **成功時のログ：**
```
✅ Google API (gapi) loaded successfully
✅ [Google Drive Auth] 初期化開始...
✅ [Google Drive Auth] CLIENT_ID: あり
✅ [Google Drive Auth] API_KEY: あり
✅ [Google Drive Auth] gapiライブラリのロード完了
✅ [Google Drive Auth] gapi.client.init 完了  ← これが表示されればOK！
✅ [Google Drive Auth] 初期化完了
```

#### **まだエラーが出る場合：**

新しいエラーメッセージをスクリーンショットで共有してください。

---

## 📸 **Step 7: 設定のスクリーンショットを共有**

以下のスクリーンショットを撮って共有してください：

### **Google Cloud Console:**

1. **OAuth 2.0 クライアント ID の編集画面**
   - 種類（ウェブ アプリケーションと表示されているか）
   - 承認済みのJavaScript生成元
   - 承認済みのリダイレクトURI

2. **APIキーの設定画面**
   - アプリケーションの制限
   - API の制限

これにより、設定が正しいか最終確認できます。

---

## 🎯 **チェックリスト**

設定を確認してください：

- [ ] プロジェクトが正しく選択されている
- [ ] OAuth 2.0 クライアントの**種類**が「ウェブ アプリケーション」
- [ ] JavaScript生成元に `http://localhost:3001` が設定されている
- [ ] リダイレクトURIに `http://localhost:3001` が設定されている
- [ ] APIキーがGoogle Drive APIに制限されている
- [ ] `.env.local` に新しいクライアントIDを設定した
- [ ] サーバーを再起動した
- [ ] ブラウザのキャッシュをクリアした
- [ ] ブラウザを完全に再起動した

---

## 🚨 **よくある間違い**

### **間違い1: ポート番号なし**
```
❌ http://localhost
✅ http://localhost:3001
```

### **間違い2: 末尾にスラッシュ**
```
❌ http://localhost:3001/
✅ http://localhost:3001
```

### **間違い3: httpsを使用**
```
❌ https://localhost:3001
✅ http://localhost:3001
```

### **間違い4: ワイルドカード**
```
❌ http://localhost:*
❌ http://localhost:3001/*
✅ http://localhost:3001
```

### **間違い5: クライアントの種類**
```
❌ デスクトップ アプリ
❌ Android
❌ iOS
✅ ウェブ アプリケーション
```

---

## 💡 **それでも解決しない場合**

1. Google Cloud Consoleの設定画面のスクリーンショットを共有
2. ブラウザのコンソールの完全なエラーログを共有
3. 別のブラウザ（Edge、Firefox）で試してみる
4. シークレットモード（Ctrl+Shift+N）で試してみる

