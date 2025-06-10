module.exports = {
    // 基本設定
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],

    // ファイル変換設定
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
            tsconfig: 'tsconfig.json',
        }],
        '^.+\\.(js|jsx)$': 'babel-jest',
    },

    // ES Modules 変換の除外設定
    transformIgnorePatterns: [
        'node_modules/(?!(date-fns|recharts|@mui|@emotion)/)',
    ],

    // モジュール名マッピング
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
        '^@/(.*)$': '<rootDir>/src/$1',
    },

    // テストファイルパターン
    testMatch: [
        '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js)',
        '<rootDir>/src/**/?(*.)(test|spec).(ts|tsx|js)',
    ],

    // 収集対象外ディレクトリ
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/build/',
    ],

    // カバレッジ設定
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/index.tsx',
        '!src/reportWebVitals.ts',
        '!src/serviceWorker.ts',
    ],

    // カバレッジ閾値
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70,
        },
    },

    // カバレッジレポート形式
    coverageReporters: [
        'text',
        'lcov',
        'html',
    ],

    // モジュール解決
    moduleDirectories: ['node_modules', '<rootDir>/src'],

    // 拡張子解決順序
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

    // グローバル設定
    globals: {
        'ts-jest': {
            isolatedModules: true,
        },
    },

    // テスト環境設定
    testEnvironmentOptions: {
        url: 'http://localhost:3000',
    },

    // タイムアウト設定
    testTimeout: 10000,

    // 詳細出力
    verbose: true,

    // エラー時の詳細表示
    errorOnDeprecated: true,

    // キャッシュ設定
    cache: true,
    cacheDirectory: '<rootDir>/node_modules/.cache/jest',

    // 並列実行設定
    maxWorkers: '50%',

    // ウォッチモード設定
    watchPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/build/',
        '<rootDir>/coverage/',
    ],
}; 