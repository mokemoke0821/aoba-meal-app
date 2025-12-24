# 📱 PWA実装技術仕様書

## 📋 目次

1. [概要](#概要)
2. [PWA要件と対応状況](#pwa要件と対応状況)
3. [GitHub Pagesサブパス対応](#github-pagesサブパス対応)
4. [Service Worker設計](#service-worker設計)
5. [Workbox設定詳細](#workbox設定詳細)
6. [キャッシュ戦略](#キャッシュ戦略)
7. [manifest.json設計](#manifestjson設計)
8. [トラブルシューティング](#トラブルシューティング)
9. [今後の改善提案](#今後の改善提案)

---

## 概要

あおば給食摂食量管理アプリは、**Progressive Web App (PWA)** として実装されており、以下の特徴を持ちます：

- ✅ **インストール可能**: スマートフォン・タブレット・デスクトップにインストール可能
- ✅ **オフライン動作**: Service Workerによるキャッシュでオフライン時も起動可能
- ✅ **高速読み込み**: 静的アセットのキャッシュにより瞬時に起動
- ✅ **ネイティブアプリ体験**: スタンドアロンモードで動作（ブラウザUIなし）
- ✅ **自動更新**: 新バージョンリリース時の自動更新機能

### 技術スタック

| 項目 | 技術 | バージョン |
|-----|------|-----------|
| フロントエンド | React | 19.1.0 |
| 言語 | TypeScript | 4.9.5 |
| PWAツール | Workbox | 7.3.0 |
| ビルドツール | Create React App + CRACO | 5.0.1 / 7.1.0 |
| デプロイ先 | GitHub Pages | - |

---

## PWA要件と対応状況

PWAとして認識されるためには、以下の要件を満たす必要があります：

| 要件 | 状態 | 実装詳細 |
|-----|------|---------|
| **HTTPS配信** | ✅ | GitHub Pagesが自動的にHTTPS提供 |
| **manifest.json** | ✅ | `/public/manifest.json` に完全実装 |
| **Service Worker** | ✅ | Workboxで自動生成（`craco.config.js`） |
| **アイコン（192x192）** | ✅ | `/public/icons/icon-192x192.png` |
| **アイコン（512x512）** | ✅ | `/public/icons/icon-512x512.png` |
| **start_url** | ✅ | `/aoba-meal-app/`（サブパス対応） |
| **display: standalone** | ✅ | manifest.jsonで指定 |
| **theme_color** | ✅ | `#1976d2`（Material-UI Blue） |

### Lighthouse監査スコア目標

- **PWA**: 95点以上
- **Performance**: 90点以上
- **Accessibility**: 95点以上
- **Best Practices**: 95点以上
- **SEO**: 90点以上

---

## GitHub Pagesサブパス対応

GitHub Pagesでは、リポジトリ名がURLのサブパスになります：

```
https://mokemoke0821.github.io/aoba-meal-app/
                                  ^^^^^^^^^^^^^^^^
                                  サブパス（リポジトリ名）
```

### 対応実装

#### 1. package.json

```json
{
  "homepage": "https://mokemoke0821.github.io/aoba-meal-app"
}
```

この設定により、Create React Appが自動的にすべてのパスに `/aoba-meal-app/` プレフィックスを追加します。

#### 2. manifest.json

```json
{
  "id": "/aoba-meal-app/",
  "start_url": "/aoba-meal-app/",
  "scope": "/aoba-meal-app/"
}
```

- **id**: PWAの一意識別子（同一アプリとして認識）
- **start_url**: アプリ起動時のURL
- **scope**: Service Workerの制御範囲

#### 3. Service Worker

```javascript
// craco.config.js 内の設定
navigateFallback: '/aoba-meal-app/index.html',
```

SPA（Single Page Application）のルーティングをサポートするため、すべてのナビゲーションリクエストを `/aoba-meal-app/index.html` にフォールバックします。

---

## Service Worker設計

Service Workerは、PWAのオフライン動作とキャッシュ戦略を制御する中核技術です。

### 生成方法

`workbox-webpack-plugin` の `GenerateSW` プラグインを使用して、ビルド時に自動生成します：

```javascript
// craco.config.js
const { GenerateSW } = require('workbox-webpack-plugin');

module.exports = {
  webpack: {
    plugins: {
      add: [
        new GenerateSW({
          clientsClaim: true,  // 即座にService Workerを有効化
          skipWaiting: true,   // 新バージョンを即座にアクティブ化
          // ...その他の設定
        }),
      ],
    },
  },
};
```

### ライフサイクル管理

- **clientsClaim**: `true` - Service Worker登録後、即座にページを制御
- **skipWaiting**: `true` - 新バージョンのService Worker検出時、即座に切り替え

これにより、ユーザーは常に最新版のアプリを使用できます（旧バージョンで待機しない）。

### 除外パターン

以下のファイルはキャッシュから除外します：

```javascript
exclude: [
  /\.map$/,               // ソースマップ（デバッグ用）
  /^manifest\.json$/,     // manifest.jsonは常に最新版を取得
  /asset-manifest\.json$/, // アセットマニフェスト
  /LICENSE/,              // ライセンスファイル
  /chrome-extension/,     // Chrome拡張機能
]
```

---

## Workbox設定詳細

Workboxは、Service Workerの実装を簡素化するGoogleのライブラリです。

### craco.config.js 完全設定

```javascript
const { GenerateSW } = require('workbox-webpack-plugin');

module.exports = {
  webpack: {
    plugins: {
      add: [
        new GenerateSW({
          clientsClaim: true,
          skipWaiting: true,

          // GitHub Pagesサブパス対応
          navigateFallback: '/aoba-meal-app/index.html',
          navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],

          // キャッシュ対象から除外するパターン
          exclude: [
            /\.map$/,
            /^manifest\.json$/,
            /asset-manifest\.json$/,
            /LICENSE/,
            /chrome-extension/,
          ],

          // ランタイムキャッシュ設定
          runtimeCaching: [
            // 画像キャッシュ
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 30 * 24 * 60 * 60, // 30日
                },
              },
            },
            // フォントキャッシュ
            {
              urlPattern: /\.(?:woff|woff2|ttf|otf)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'fonts',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 365 * 24 * 60 * 60, // 1年
                },
              },
            },
            // ナビゲーションリクエスト（サブパス対応）
            {
              urlPattern: ({ request, url }) => {
                return request.mode === 'navigate' &&
                       url.origin === self.location.origin &&
                       url.pathname.startsWith('/aoba-meal-app/');
              },
              handler: 'NetworkFirst',
              options: {
                cacheName: 'pages',
                networkTimeoutSeconds: 3,
              },
            },
            // 静的アセット（JS/CSS）
            {
              urlPattern: /\/aoba-meal-app\/static\/.*/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'static-assets',
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 30 * 24 * 60 * 60, // 30日
                },
              },
            },
          ],
        }),
      ],
    },
  },
};
```

---

## キャッシュ戦略

Workboxは、リソースの種類に応じて最適なキャッシュ戦略を提供します。

### 1. CacheFirst（キャッシュ優先）

```
リクエスト → キャッシュ確認 → あればキャッシュから返す
                           → なければネットワークから取得 → キャッシュに保存
```

**適用対象**: 画像、フォント、静的アセット（JS/CSS）

**理由**: これらのファイルは変更頻度が低く、キャッシュから提供することで高速化できる。

### 2. NetworkFirst（ネットワーク優先）

```
リクエスト → ネットワークから取得（3秒タイムアウト）→ 成功すればキャッシュに保存
           → タイムアウト/失敗 → キャッシュから返す
```

**適用対象**: ナビゲーションリクエスト（ページ遷移）

**理由**: 常に最新のHTMLを取得し、オフライン時のみキャッシュを使用する。

### キャッシュ有効期限

| リソース | 戦略 | 有効期限 | 最大エントリ数 |
|---------|------|---------|--------------|
| 画像 | CacheFirst | 30日 | 50 |
| フォント | CacheFirst | 1年 | 10 |
| JS/CSS | CacheFirst | 30日 | 60 |
| ページ | NetworkFirst | - | - |

---

## manifest.json設計

`manifest.json` は、PWAのメタデータを定義するJSONファイルです。

### 完全設定

```json
{
  "id": "/aoba-meal-app/",
  "short_name": "あおば給食",
  "name": "あおば給食摂食量管理アプリ",
  "description": "あおば給食の摂食量を記録・管理するPWAアプリ",
  "icons": [
    {
      "src": "icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "start_url": "/aoba-meal-app/",
  "scope": "/aoba-meal-app/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#1976d2",
  "background_color": "#ffffff",
  "categories": ["productivity", "health"],
  "lang": "ja"
}
```

### フィールド解説

| フィールド | 説明 | 値 |
|----------|------|-----|
| **id** | PWAの一意識別子 | `/aoba-meal-app/` |
| **short_name** | ホーム画面に表示される短い名前 | `あおば給食` |
| **name** | 完全なアプリ名 | `あおば給食摂食量管理アプリ` |
| **description** | アプリの説明 | PWAアプリであることを明示 |
| **start_url** | アプリ起動時のURL | `/aoba-meal-app/`（サブパス） |
| **scope** | Service Workerの制御範囲 | `/aoba-meal-app/` |
| **display** | 表示モード | `standalone`（ブラウザUIなし） |
| **orientation** | 画面の向き | `portrait`（縦向き） |
| **theme_color** | テーマカラー | `#1976d2`（Material-UI Blue） |
| **background_color** | スプラッシュ画面の背景色 | `#ffffff`（白） |
| **categories** | アプリカテゴリ | `productivity`, `health` |
| **lang** | 言語 | `ja`（日本語） |

### アイコン設計

PWAアイコンは、2つの `purpose` を持つ必要があります：

1. **any**: 通常のアイコン（パディングあり）
2. **maskable**: マスク可能アイコン（Android Adaptive Icons対応）

各サイズ（192x192、512x512）に対して両方の purpose を定義することで、すべてのプラットフォームで最適な表示を実現します。

---

## トラブルシューティング

### 問題1: インストールボタンが表示されない

**原因**:
- HTTPSで配信されていない（GitHub Pagesは自動HTTPS）
- Service Workerが登録されていない
- manifest.jsonが読み込まれていない

**解決方法**:
1. Chrome DevTools（F12）→ Application → Manifest を確認
2. Service Workers セクションを確認（status: activated）
3. ブラウザのキャッシュをクリアして再読み込み

### 問題2: オフラインで動作しない

**原因**:
- Service Workerのキャッシュが正常に機能していない
- navigateFallback が正しく設定されていない

**解決方法**:
1. DevTools → Application → Cache Storage を確認
2. 以下のキャッシュが存在するか確認：
   - `workbox-precache-v2-...`
   - `images`
   - `fonts`
   - `pages`
   - `static-assets`
3. Service Workerを「Unregister」して再登録

### 問題3: アプリが更新されない

**原因**:
- ブラウザが古いService Workerをキャッシュしている
- `skipWaiting: true` が機能していない

**解決方法**:
1. DevTools → Application → Service Workers → Skip waiting（手動）
2. ブラウザを完全に閉じて再起動
3. アプリを再インストール（削除 → 再インストール）

### 問題4: GitHub Pagesでルーティングが機能しない

**原因**:
- SPAのクライアントサイドルーティングがGitHub Pagesで正常に動作しない
- 404エラーが発生する

**解決方法**:
- `navigateFallback: '/aoba-meal-app/index.html'` を設定（既に実装済み）
- すべてのナビゲーションリクエストを `index.html` にフォールバック

---

## 今後の改善提案

### 1. スクリーンショット追加

manifest.jsonに `screenshots` フィールドを追加することで、インストール前にアプリのプレビューを表示できます：

```json
{
  "screenshots": [
    {
      "src": "screenshots/home.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide",
      "label": "ホーム画面"
    },
    {
      "src": "screenshots/statistics.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide",
      "label": "統計画面"
    }
  ]
}
```

### 2. Push通知機能

Service Workerを活用して、プッシュ通知機能を実装することで、ユーザーエンゲージメントを向上させることができます：

- 給食注文のリマインダー
- 統計レポートの自動配信
- 重要なお知らせの通知

### 3. Background Sync API

オフライン時のデータ送信を、ネットワーク接続時に自動的に同期する機能：

- オフラインで記録したデータを、オンライン復帰時に自動送信
- データの損失を防止

### 4. Periodic Background Sync API

定期的なバックグラウンド同期により、アプリを開かなくてもデータを最新状態に保つ：

- 統計データの定期更新
- 新しいお知らせの自動取得

### 5. Web Share API

ネイティブの共有機能を活用して、統計データやレポートを簡単に共有：

```javascript
if (navigator.share) {
  await navigator.share({
    title: '摂食量統計レポート',
    text: '今月の統計データ',
    files: [csvFile],
  });
}
```

### 6. Install Prompt最適化

カスタムインストールプロンプトを実装して、インストール率を向上：

- 初回訪問時のインストール誘導
- 適切なタイミングでのプロンプト表示
- インストール後のオンボーディング

### 7. App Shortcuts

manifest.jsonに `shortcuts` を追加して、よく使う機能への直接アクセスを提供：

```json
{
  "shortcuts": [
    {
      "name": "摂食量記録",
      "short_name": "記録",
      "description": "新しい摂食量を記録",
      "url": "/aoba-meal-app/?action=record",
      "icons": [{ "src": "icons/shortcut-record.png", "sizes": "96x96" }]
    },
    {
      "name": "統計表示",
      "short_name": "統計",
      "description": "統計データを表示",
      "url": "/aoba-meal-app/?action=statistics",
      "icons": [{ "src": "icons/shortcut-stats.png", "sizes": "96x96" }]
    }
  ]
}
```

---

## 参考資料

- [MDN Web Docs - Progressive Web Apps](https://developer.mozilla.org/ja/docs/Web/Progressive_web_apps)
- [web.dev - PWA](https://web.dev/progressive-web-apps/)
- [Workbox公式ドキュメント](https://developers.google.com/web/tools/workbox)
- [PWA Builder](https://www.pwabuilder.com/)
- [Web App Manifest仕様](https://www.w3.org/TR/appmanifest/)

---

**作成日**: 2025年10月2日  
**バージョン**: 1.0.0  
**作成者**: Claude (Sonnet 4.5)  
**最終更新**: 2025年10月2日


