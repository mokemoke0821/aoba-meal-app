import { format, subDays } from 'date-fns';
import React from 'react';
import { AppState, Group, GROUP_TO_CATEGORY_MAP, MealRecord, MenuItem, User, UserCategory } from '../types';

/**
 * テストヘルパー
 * 概要: Jestテスト環境で共通して利用されるモックデータや関数を提供します。
 * これにより、テストコードの冗長性を排除し、一貫性のあるテストデータを保証します。
 */

// テスト用ユーザーデータ
export const mockUsers: User[] = [
    {
        id: 'user_1',
        name: '田中太郎',
        group: 'グループA',
        price: 500,
        createdAt: '2024-01-01T00:00:00.000Z',
        isActive: true,
        trialUser: false,
        notes: 'テスト用ユーザー1',
        category: 'A型',
        displayNumber: 1
    },
    {
        id: 'user_2',
        name: '佐藤花子',
        group: 'グループB',
        price: 450,
        createdAt: '2024-01-15T00:00:00.000Z',
        isActive: false,
        trialUser: true,
        notes: 'テスト用ユーザー2',
        category: 'B型',
        displayNumber: 1
    },
    {
        id: 'user_3',
        name: '鈴木三郎',
        group: 'グループC',
        price: 400,
        createdAt: '2024-02-01T00:00:00.000Z',
        isActive: true,
        trialUser: false,
        notes: 'テスト用ユーザー3',
        category: '職員',
        displayNumber: 1
    },
];

// テスト用給食記録データ
export const mockMealRecord: MealRecord = {
    id: 'record_1',
    userId: 'user_1',
    userName: '田中太郎',
    userGroup: 'グループA',
    userCategory: 'A型',
    date: format(new Date(), 'yyyy-MM-dd'),
    rating: 8,
    price: 500,
    menuName: 'テストメニュー',
    notes: 'テスト備考',
};

// テスト用メニューアイテム
export const mockMenuItem: MenuItem = {
    id: 'menu_1',
    name: 'テストランチ',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '栄養満点テストランチ',
};

// テスト用アプリケーション状態
export const mockAppState: AppState = {
    users: mockUsers,
    mealRecords: [mockMealRecord],
    currentMenu: mockMenuItem,
    selectedUser: mockUsers[0],
    selectedCategory: 'A型',
    currentView: 'userSelect',
    requireAdminAuth: false,
};

// モックユーザー生成関数
export const createMockUser = (overrides: Partial<User> = {}): User => {
    const group = overrides.group || 'グループA';
    const category = GROUP_TO_CATEGORY_MAP[group];
    return {
        id: 'user_default',
        name: 'デフォルトユーザー',
        group,
        price: 400,
        createdAt: new Date().toISOString(),
        isActive: true,
        trialUser: false,
        category,
        displayNumber: 1,
        ...overrides,
    };
};

// モック給食記録生成関数
export const createMockMealRecord = (overrides: Partial<MealRecord> = {}): MealRecord => {
    const user = mockUsers[0];
    return {
        id: `record_${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userGroup: user.group,
        userCategory: user.category,
        date: format(new Date(), 'yyyy-MM-dd'),
        rating: 5,
        price: user.price,
        menuName: '日替わりランチ',
        ...overrides,
    };
};

export const generateMockUsers = (count: number): User[] => {
    return Array.from({ length: count }, (_, i) => {
        const group: Group = (['グループA', 'グループB', 'グループC', 'グループD'] as const)[i % 4];
        const category: UserCategory = GROUP_TO_CATEGORY_MAP[group];
        return {
            id: `user_${i + 1}`,
            name: `テストユーザー${i + 1}`,
            group,
            price: 400 + (i % 5) * 10,
            createdAt: `2024-01-${String(i % 30 + 1).padStart(2, '0')}T10:00:00.000Z`,
            isActive: i % 5 !== 0,
            trialUser: i % 3 === 0,
            notes: `備考 ${i + 1}`,
            category,
            displayNumber: i + 1,
        };
    });
};

export const generateMockMealRecords = (users: User[], days: number): MealRecord[] => {
    const records: MealRecord[] = [];
    users.forEach(user => {
        for (let i = 0; i < days; i++) {
            if (Math.random() > 0.3) { // 70%の確率で記録を作成
                records.push(
                    createMockMealRecord({
                        userId: user.id,
                        userName: user.name,
                        userGroup: user.group,
                        userCategory: user.category,
                        date: format(subDays(new Date(), i), 'yyyy-MM-dd'),
                        rating: Math.floor(Math.random() * 5) + 5, // 5-9の評価
                        price: user.price,
                    })
                );
            }
        }
    });
    return records;
};

/**
 * テストユーティリティ関数
 */

export const waitForElement = (selector: string, timeout = 5000): Promise<Element> => {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) {
            resolve(element);
            return;
        }

        const observer = new MutationObserver(() => {
            const element = document.querySelector(selector);
            if (element) {
                observer.disconnect();
                resolve(element);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        }, timeout);
    });
};

export const waitForNoElement = (selector: string, timeout = 5000): Promise<void> => {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (!element) {
            resolve();
            return;
        }

        const observer = new MutationObserver(() => {
            const element = document.querySelector(selector);
            if (!element) {
                observer.disconnect();
                resolve();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element ${selector} still exists after ${timeout}ms`));
        }, timeout);
    });
};

/**
 * LocalStorage テストヘルパー
 */

export const mockLocalStorage = {
    store: {} as Record<string, string>,

    getItem: function (key: string) {
        return this.store[key] || null;
    },

    setItem: function (key: string, value: string) {
        this.store[key] = value;
    },

    removeItem: function (key: string) {
        delete this.store[key];
    },

    clear: function () {
        this.store = {};
    },

    reset: function () {
        this.store = {};
    },

    // テスト用の初期データ設定
    seedWithAppData: function (data: AppState) {
        this.setItem('aobaAppData', JSON.stringify(data));
    },
};

/**
 * エラーテスト用ヘルパー
 */

export const createErrorBoundaryWrapper = () => {
    let errorThrown = false;
    let errorMessage = '';

    const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        const [hasError, setHasError] = React.useState(false);

        React.useEffect(() => {
            const handleError = (error: ErrorEvent) => {
                errorThrown = true;
                errorMessage = error.message;
                setHasError(true);
            };

            window.addEventListener('error', handleError);
            return () => window.removeEventListener('error', handleError);
        }, []);

        if (hasError) {
            return React.createElement('div', { 'data-testid': 'error-boundary' }, `Error occurred: ${errorMessage}`);
        }

        return React.createElement(React.Fragment, null, children);
    };

    return {
        ErrorBoundary,
        getErrorInfo: () => ({ errorThrown, errorMessage }),
        resetError: () => {
            errorThrown = false;
            errorMessage = '';
        },
    };
};

/**
 * 非同期処理テスト用ヘルパー
 */

export const flushPromises = (): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, 0));
};

export const waitForNextTick = (): Promise<void> => {
    return new Promise(resolve => process.nextTick(resolve));
};

/**
 * 統計計算テスト用データ
 */

export const createStatisticsTestData = () => {
    const users = generateMockUsers(10);
    const mealRecords = generateMockMealRecords(users, 30);

    return {
        users,
        mealRecords,
        expectedStats: {
            totalUsers: users.length,
            totalRecords: mealRecords.length,
            averageRating: mealRecords.reduce((sum, record) => sum + record.rating, 0) / mealRecords.length,
            totalRevenue: mealRecords.reduce((sum, record) => sum + record.price, 0),
        },
    };
};

/**
 * 日付範囲テスト用ヘルパー
 */

export const createDateRangeTestData = () => {
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);
    const sevenDaysAgo = subDays(today, 7);

    return {
        today,
        sevenDaysAgo,
        thirtyDaysAgo,
        todayString: format(today, 'yyyy-MM-dd'),
        sevenDaysAgoString: format(sevenDaysAgo, 'yyyy-MM-dd'),
        thirtyDaysAgoString: format(thirtyDaysAgo, 'yyyy-MM-dd'),
    };
}; 