const { GenerateSW } = require('workbox-webpack-plugin');

module.exports = {
  webpack: {
    plugins: {
      add: [
        new GenerateSW({
          clientsClaim: true,
          skipWaiting: true,

          // GitHub Pages対応
          navigateFallback: '/aoba-meal-app/index.html',
          navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],

          // キャッシュ対象から除外するパターン
          exclude: [
            /\.map$/,
            /asset-manifest\.json$/,
            /LICENSE/,
            /chrome-extension/,
          ],

          // ランタイムキャッシュ設定（オフライン対応強化）
          runtimeCaching: [
            {
              // すべてのナビゲーションリクエスト（HTMLページ）
              urlPattern: ({ request }) => request.mode === 'navigate',
              handler: 'CacheFirst',
              options: {
                cacheName: 'pages',
                expiration: {
                  maxEntries: 50,
                },
              },
            },
            {
              // すべての静的アセット（JS/CSS）
              urlPattern: ({ request }) =>
                request.destination === 'script' ||
                request.destination === 'style',
              handler: 'CacheFirst',
              options: {
                cacheName: 'static-resources',
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 30 * 24 * 60 * 60, // 30日
                },
              },
            },
            {
              // 画像のキャッシュ
              urlPattern: ({ request }) => request.destination === 'image',
              handler: 'CacheFirst',
              options: {
                cacheName: 'images',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 30 * 24 * 60 * 60, // 30日
                },
              },
            },
            {
              // フォントのキャッシュ
              urlPattern: ({ request }) => request.destination === 'font',
              handler: 'CacheFirst',
              options: {
                cacheName: 'fonts',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 365 * 24 * 60 * 60, // 1年
                },
              },
            },
            {
              // manifest.jsonとアイコン
              urlPattern: /\.(json|png|ico)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'assets',
                expiration: {
                  maxEntries: 30,
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
