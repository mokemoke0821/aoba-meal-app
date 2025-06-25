module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],

    // 大幅なタイムアウト設定
    testTimeout: 60000,

    // リソース制限
    maxWorkers: 2,
    cache: false,

    // Transform設定 - React Scripts準拠
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
            presets: [
                ['@babel/preset-env', { targets: { node: 'current' } }],
                ['@babel/preset-react', { runtime: 'automatic' }],
                '@babel/preset-typescript'
            ]
        }]
    },

    // ES Modules対応 - 完全版（date-fns完全対応）
    transformIgnorePatterns: [
        'node_modules/(?!(date-fns|@date-io|@mui|@emotion|@babel|uuid|recharts)/).*'
    ],

    // モジュール解決 - 完全統合
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
        '^@/(.*)$': '<rootDir>/src/$1',
        '^components/(.*)$': '<rootDir>/src/components/$1',
        '^utils/(.*)$': '<rootDir>/src/utils/$1',
        '^types/(.*)$': '<rootDir>/src/types/$1',
        '^contexts/(.*)$': '<rootDir>/src/contexts/$1',
        '^hooks/(.*)$': '<rootDir>/src/hooks/$1'
    },

    // テストパターン
    testMatch: [
        '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js)',
        '<rootDir>/src/**/?(*.)(test|spec).(ts|tsx|js)',
    ],

    // カバレッジ設定
    collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/**/*.d.ts',
        '!src/index.tsx',
        '!src/serviceWorker.ts',
        '!src/reportWebVitals.ts',
        '!src/**/*.stories.{js,jsx,ts,tsx}'
    ],

    // エラー表示
    verbose: true,
    errorOnDeprecated: false,

    // グローバル設定
    globals: {
        'ts-jest': {
            useESM: true
        }
    },

    // エラー無視設定
    testEnvironmentOptions: {
        customExportConditions: [''],
    }
};