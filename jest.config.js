module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
    
    // 大幅なタイムアウト設定
    testTimeout: 60000,
    
    // リソース制限
    maxWorkers: 2,
    cache: false,
    
    // Transform設定
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
            tsconfig: 'tsconfig.json',
            isolatedModules: true,
        }],
        '^.+\\.(js|jsx)$': 'babel-jest',
    },
    
    // ES Modules対応
    transformIgnorePatterns: [
        'node_modules/(?!(date-fns|recharts|@mui|@emotion|@testing-library)/)',
    ],
    
    // モジュール解決
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
        '^@/(.*)$': '<rootDir>/src/$1',
        '^date-fns/locale$': '<rootDir>/node_modules/date-fns/locale/index.js',
        '^date-fns/(.*)$': '<rootDir>/node_modules/date-fns/$1',
    },
    
    // テストパターン
    testMatch: [
        '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js)',
        '<rootDir>/src/**/?(*.)(test|spec).(ts|tsx|js)',
    ],
    
    // カバレッジ設定
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/index.tsx',
        '!src/reportWebVitals.ts',
        '!src/serviceWorker.ts',
        '!src/**/*.test.{ts,tsx}',
    ],
    
    // エラー表示
    verbose: true,
    errorOnDeprecated: false,
};