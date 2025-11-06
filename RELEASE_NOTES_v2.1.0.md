# 🎉 あおば給食管理アプリ v2.1.0 リリースノート

**リリース日**: 2025年11月6日  
**バージョン**: v2.1.0

---

## ✨ **新機能**

### 💾 **簡易バックアップ機能**

#### **1. バックアップ保存先の設定**
- ユーザーが任意のフォルダを指定可能
- デフォルト: ユーザーのドキュメントフォルダ
- カスタムパス対応: Dropbox、OneDrive、iCloud等のクラウドフォルダも指定可能
- LocalStorageに保存先を永続化

#### **2. 自動バックアップ**
- 頻度選択: 5分/10分/30分/1時間
- 最新10件を自動保持（古いバックアップは自動削除）
- バックアップファイル名: 日時を含む（例: `aoba-meal-backup-20251106-143022.json`）
- トグルスイッチで簡単に有効化/無効化

#### **3. クイック共有ボタン**
- ワンクリックで現在のデータを指定フォルダにエクスポート
- 成功メッセージとファイルパスを表示
- Material-UIの洗練されたUI

---

## 🔧 **改善**

### **データ管理パネルの強化**
- バックアップ設定セクションを追加
- 自動バックアップ頻度設定UI
- 最終バックアップ時刻の表示
- より直感的な操作フロー

### **TypeScript型安全性の向上**
- 新しい型定義を追加:
  - `BackupConfig`
  - `BackupFrequency`
  - その他のGoogle Drive関連型（今後使用予定）

---

## 📝 **技術詳細**

### **実装ファイル**
- `src/types/index.ts` - 型定義追加
- `src/utils/storage.ts` - バックアップ処理
- `src/hooks/useAutoBackup.ts` - 自動バックアップフック
- `src/components/BackupSettings.tsx` - バックアップ設定UI
- `src/components/DataManagementPanel.tsx` - UI統合
- `src/App.tsx` - フック統合

### **ドキュメント**
- `BACKUP_GUIDE.md` - バックアップ設定ガイド
- `README.md` - バックアップ機能の使い方を追加

---

## 🚀 **今後の予定**

### **v2.2.0（予定）**
- **Google Drive統合**（新しいGoogle Identity Servicesを使用）
  - 自動同期機能
  - データ競合検出とマージ
  - 複数デバイス間でのシームレスなデータ共有

---

## 🐛 **既知の問題**

### **Google Drive統合**
- 現在、Google Driveへの自動同期は利用できません
- 手動でバックアップファイルをGoogle Driveにアップロードする必要があります
- v2.2.0で実装予定

---

## 📦 **インストール方法**

### **Windows**
1. [Releases ページ](https://github.com/mokemoke0821/aoba-meal-app/releases) から `あおば給食管理-Setup-2.1.0.exe` をダウンロード
2. インストーラーを実行
3. インストールウィザードに従ってインストール

### **macOS**
1. [Releases ページ](https://github.com/mokemoke0821/aoba-meal-app/releases) から `あおば給食管理-2.1.0.dmg` をダウンロード
2. DMGファイルをマウント
3. アプリを Applications フォルダにドラッグ

### **Linux**
1. [Releases ページ](https://github.com/mokemoke0821/aoba-meal-app/releases) から AppImage / deb / rpm を選択してダウンロード
2. インストールまたは実行権限を付与して起動

### **ポータブル版（Windows）**
1. `あおば給食管理-portable-2.1.0.exe` をダウンロード
2. 任意のフォルダに配置
3. ダブルクリックで起動

---

## 💡 **使用方法**

### **バックアップ設定**

1. **管理者パネル** → **データ管理** を開く
2. **「バックアップ設定」** セクションで以下を設定:
   - バックアップ保存先フォルダ
   - 自動バックアップ頻度
3. **「自動バックアップを有効化」** トグルをON

### **手動バックアップ**

1. **データ管理パネル** で **「クイック共有」** ボタンをクリック
2. 指定したフォルダにバックアップファイルが保存される

### **Google Driveへの手動アップロード**

1. バックアップファイルを作成
2. ファイルマネージャーで保存先フォルダを開く
3. バックアップファイルをGoogle Driveにドラッグ&ドロップ

**ヒント**: Google Drive、Dropbox、OneDriveのローカル同期フォルダを保存先に指定すると、自動的にクラウドに同期されます！

---

## 🙏 **フィードバック**

問題やフィードバックがあれば、[GitHub Issues](https://github.com/mokemoke0821/aoba-meal-app/issues) でお知らせください。

---

## 📄 **ライセンス**

MIT License

---

## 👤 **作者**

mokemoke0821

---

**以前のバージョン**: [v2.0.0](https://github.com/mokemoke0821/aoba-meal-app/releases/tag/v2.0.0)

