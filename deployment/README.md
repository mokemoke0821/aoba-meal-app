# 📦 配布パッケージ - あおば給食管理アプリ v2.1.0

## 📋 概要

このフォルダには、あおば給食管理アプリ Electron版の配布パッケージとドキュメントが含まれています。

---

## 📁 フォルダ構成

```
deployment/
├── installer-package/       # インストーラー版パッケージ
│   ├── windows/            # Windows用
│   ├── macos/              # macOS用
│   └── linux/              # Linux用
├── portable-package/        # ポータブル版パッケージ
│   └── windows/            # Windows用
├── distribution-list.xlsx   # 配布先リスト
├── rollout-schedule.md      # 展開スケジュール
└── README.md               # このファイル

実際のビルド成果物(.exe, .dmg, .AppImageなど)は生成されていません。以下のコマンドでビルドしてください:
- Windows: npm run electron:build:win
- macOS: npm run electron:build:mac
- Linux: npm run electron:build:linux

ビルド成果物は ../dist-electron/ に生成されます。
```

---

## 🔨 ビルド方法

### 前提条件

- Node.js 18.x 以上
- npm 9.x 以上
- 各プラットフォームのビルド環境（macOS/Linux の場合）

### ビルドコマンド

```bash
# 依存関係のインストール
npm install

# Windows向けビルド
npm run electron:build:win

# macOS向けビルド（macOS環境が必要）
npm run electron:build:mac

# Linux向けビルド（Linux環境が必要）
npm run electron:build:linux

# 全プラットフォーム向けビルド（各環境が必要）
npm run electron:build
```

### ビルド成果物

| プラットフォーム | ファイル | サイズ（推定） | 場所 |
|----------------|---------|---------------|------|
| **Windows** | `あおば給食管理-Setup-2.1.0.exe` | ~150MB | `dist-electron/` |
| **Windows（ポータブル）** | `あおば給食管理-portable-2.1.0.exe` | ~120MB | `dist-electron/` |
| **macOS** | `あおば給食管理-2.1.0.dmg` | ~160MB | `dist-electron/` |
| **Linux（AppImage）** | `あおば給食管理-2.1.0.AppImage` | ~140MB | `dist-electron/` |
| **Linux（deb）** | `あおば給食管理_2.1.0_amd64.deb` | ~130MB | `dist-electron/` |

---

## 📦 パッケージ種類

### 1. インストーラー版

**特徴**:
- システムにインストール
- スタートメニュー登録
- デスクトップショートカット作成
- 自動更新機能（将来実装予定）

**対象ユーザー**:
- 長期利用
- 複数ユーザーでの共有

**配布方法**:
- ダウンロードサイト
- USBメモリ
- 社内ネットワーク

---

### 2. ポータブル版

**特徴**:
- インストール不要
- USBメモリから直接実行可能
- レジストリ変更なし
- 設定ファイルは実行フォルダに保存

**対象ユーザー**:
- 一時利用
- 管理者権限がない環境
- 複数PCでの使用

**配布方法**:
- USBメモリ
- 共有フォルダ

---

## 🚀 配布準備チェックリスト

### ビルド前

- [ ] バージョン番号を確認（package.json）
- [ ] CHANGELOGを更新
- [ ] READMEを更新
- [ ] ライセンスファイルを確認
- [ ] テストを実行（`npm test`）
- [ ] Lintを実行（`npm run lint`）

### ビルド

- [ ] React アプリをビルド（`npm run build:electron`）
- [ ] Electronアプリをパッケージ化（`npm run electron:build:win`）
- [ ] ビルド成果物を確認
- [ ] ファイルサイズを確認
- [ ] ウイルススキャンを実行

### パッケージング

- [ ] インストーラー版を作成
- [ ] ポータブル版を作成
- [ ] インストールガイドPDFを作成
- [ ] README.txtを作成
- [ ] 配布用ZIPを作成
- [ ] チェックサム（SHA-256）を生成

### ドキュメント

- [ ] ユーザーマニュアルを準備
- [ ] クイックスタートガイドを準備
- [ ] FAQを準備
- [ ] トラブルシューティングガイドを準備

### 配布

- [ ] GitHub Releasesにアップロード
- [ ] 配布先リストを確認
- [ ] 配布スケジュールを作成
- [ ] テスター候補者に通知
- [ ] サポート体制を確認

---

## 📊 配布統計（予定）

### 配布先

| カテゴリ | 対象数 | 配布方法 | ステータス |
|---------|--------|----------|-----------|
| **テスター** | 5名 | メール＋ダウンロードリンク | ⏳ 準備中 |
| **パイロット事業所** | 3事業所 | 訪問インストール | ⏳ 準備中 |
| **全事業所** | 20事業所 | ダウンロードサイト | ⏳ 準備中 |

### 展開スケジュール

| フェーズ | 期間 | 対象 | 活動 |
|---------|------|------|------|
| **Phase 1: Alpha** | Week 1 | テスター5名 | バグ修正、フィードバック収集 |
| **Phase 2: Beta** | Week 2-3 | パイロット事業所3箇所 | 実運用テスト |
| **Phase 3: GA** | Week 4～ | 全事業所20箇所 | 一般公開 |

---

## 🔒 セキュリティ

### コード署名（推奨）

**Windows**:
```powershell
# コード署名証明書を使用してsigntoolで署名
signtool sign /f "certificate.pfx" /p "password" /t http://timestamp.digicert.com "あおば給食管理-Setup-2.1.0.exe"
```

**macOS**:
```bash
# Apple Developer ID で署名
codesign --deep --force --verify --verbose --sign "Developer ID Application: Your Name" "あおば給食管理.app"
```

### チェックサム生成

```bash
# SHA-256
sha256sum あおば給食管理-Setup-2.1.0.exe > checksums.txt

# Windows (PowerShell)
Get-FileHash -Algorithm SHA256 "あおば給食管理-Setup-2.1.0.exe" | Format-List
```

---

## 📝 配布時の注意事項

### Windows Defender SmartScreen

初回実行時に警告が表示される場合があります。

**対処方法**:
1. 「詳細情報」をクリック
2. 「実行」をクリック

**根本的な解決**:
- コード署名証明書を取得して署名

---

### macOS Gatekeeper

未署名アプリの場合、実行が拒否されます。

**対処方法**:
1. アプリを右クリック
2. 「開く」を選択
3. 「開く」ボタンをクリック

**根本的な解決**:
- Apple Developer ID で署名
- 公証（Notarization）を実施

---

### Linux権限

AppImage実行時に権限エラーが発生する場合があります。

**対処方法**:
```bash
chmod +x あおば給食管理-2.1.0.AppImage
./あおば給食管理-2.1.0.AppImage
```

---

## 📞 サポート

配布・インストールに関する問い合わせ:

- **GitHub Issues**: https://github.com/mokemoke0821/aoba-meal-app/issues
- **メール**: [準備中]
- **電話**: [準備中]

---

## 🔄 更新手順

### 新バージョンのリリース

1. バージョン番号を更新（package.json）
2. CHANGELOGを更新
3. ビルドを実行
4. テストを実施
5. GitHub Releasesに公開
6. ユーザーに通知

---

## 📚 関連ドキュメント

- [README.md](../README.md) - プロジェクト概要
- [CHANGELOG.md](../CHANGELOG.md) - 変更履歴
- [USER_MANUAL.md](../support/user-manual-v2.1.0.md) - ユーザーマニュアル
- [TROUBLESHOOTING.md](../support/TROUBLESHOOTING.md) - トラブルシューティング

---

**作成日**: 2025年11月5日  
**最終更新**: 2025年11月5日  
**バージョン**: 2.1.0


