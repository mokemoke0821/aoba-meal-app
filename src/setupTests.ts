// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Global timeout
jest.setTimeout(60000);

// TextEncoder/TextDecoder のモック（Material-UI X DataGrid用）
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// Console error suppression for known warnings
const originalError = console.error;
console.error = (...args: any[]) => {
    if (
        typeof args[0] === 'string' &&
        (args[0].includes('Warning: ReactDOM.render is deprecated') ||
            args[0].includes('Warning: React.createFactory is deprecated'))
    ) {
        return;
    }
    originalError.call(console, ...args);
};

// LocalStorage のモック
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// SessionStorage のモック
const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
});

// Clipboard API のモック
Object.defineProperty(navigator, 'clipboard', {
    value: {
        writeText: jest.fn().mockResolvedValue(undefined),
        readText: jest.fn().mockResolvedValue(''),
    },
});

// ResizeObserver のモック（Recharts用）
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// IntersectionObserver のモック
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// window.matchMedia のモック（Material-UI用）
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// console のモック（テスト中のログを制御）
const originalWarn = console.warn;

beforeAll(() => {
    console.warn = jest.fn();
});

afterAll(() => {
    console.warn = originalWarn;
});

// 各テスト後のクリーンアップ
afterEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();

    sessionStorageMock.getItem.mockClear();
    sessionStorageMock.setItem.mockClear();
    sessionStorageMock.removeItem.mockClear();
    sessionStorageMock.clear.mockClear();

    jest.clearAllMocks();
});

// テストユーティリティの追加
export const testUtils = {
    // LocalStorage操作のヘルパー
    mockLocalStorageData: (data: any) => {
        localStorageMock.getItem.mockReturnValue(JSON.stringify(data));
    },

    // エラーの期待値テスト用ヘルパー
    expectError: (fn: () => void, expectedMessage?: string) => {
        expect(() => fn()).toThrow(expectedMessage);
    },

    // 非同期エラーの期待値テスト用ヘルパー
    expectAsyncError: async (fn: () => Promise<any>, expectedMessage?: string) => {
        await expect(fn()).rejects.toThrow(expectedMessage);
    },

    // 時間を進めるヘルパー
    advanceTime: (ms: number) => {
        jest.advanceTimersByTime(ms);
    },

    // モックリセットヘルパー
    resetAllMocks: () => {
        jest.clearAllMocks();
        localStorageMock.getItem.mockClear();
        localStorageMock.setItem.mockClear();
        localStorageMock.removeItem.mockClear();
        localStorageMock.clear.mockClear();
    },
};
