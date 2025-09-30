const { GenerateSW } = require('workbox-webpack-plugin');

module.exports = {
  webpack: {
    plugins: {
      add: [
        new GenerateSW({
          clientsClaim: true,
          skipWaiting: true,

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
            {
              // 画像のキャッシュ
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
            {
              // フォントのキャッシュ
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
            {
              // 同一オリジンのナビゲーションリクエスト
              urlPattern: ({ request, url }) => {
                return request.mode === 'navigate' &&
                       url.origin === self.location.origin;
              },
              handler: 'NetworkFirst',
              options: {
                cacheName: 'pages',
                networkTimeoutSeconds: 3,
              },
            },
          ],
        }),
      ],
    },
  },
};