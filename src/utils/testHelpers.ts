import { addDays, format, subDays } from 'date-fns';
import React from 'react';
import { AppState, Group, MealRecord, MenuItem, User } from '../types';

/**
 * テスト用モックデータ生成
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
    },
    {
        id: 'user_2',
        name: '佐藤花子',
        group: 'グループB',
        price: 450,
        createdAt: '2024-01-02T00:00:00.000Z',
        isActive: true,
        trialUser: true,
        notes: 'テスト用ユーザー2',
    },
    {
        id: 'user_3',
        name: '山田次郎',
        group: 'グループC',
        price: 600,
        createdAt: '2024-01-03T00:00:00.000Z',
        isActive: false,
        trialUser: false,
        notes: 'テスト用ユーザー3（非アクティブ）',
    },
];

// テスト用メニューデータ
export const mockMenuItems: MenuItem[] = [
    {
        id: 'menu_1',
        name: 'カレーライス',
        date: format(new Date(), 'yyyy-MM-dd'),
        description: 'スパイシーなカレーライス',
        price: 500,
        category: 'main',
    },
    {
        id: 'menu_2',
        name: 'ハンバーグ定食',
        date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        description: 'ジューシーなハンバーグ',
        price: 600,
        category: 'main',
    },
];

// テスト用給食記録データ
export const mockMealRecords: MealRecord[] = [
    {
        id: 'meal_1',
        userId: 'user_1',
        userName: '田中太郎',
        userGroup: 'グループA',
        date: format(new Date(), 'yyyy-MM-dd'),
        rating: 8,
        price: 500,
        menuName: 'カレーライス',
        notes: '美味しかった',
    },
    {
        id: 'meal_2',
        userId: 'user_2',
        userName: '佐藤花子',
        userGroup: 'グループB',
        date: format(new Date(), 'yyyy-MM-dd'),
        rating: 7,
        price: 450,
        menuName: 'カレーライス',
    },
    {
        id: 'meal_3',
        userId: 'user_1',
        userName: '田中太郎',
        userGroup: 'グループA',
        date: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
        rating: 9,
        price: 500,
        menuName: 'ハンバーグ定食',
        notes: 'とても美味しかった',
    },
];

// テスト用アプリケーション状態
export const mockAppState: AppState = {
    users: mockUsers,
    mealRecords: mockMealRecords,
    currentMenu: mockMenuItems[0],
    selectedUser: mockUsers[0],
    currentView: 'userSelect',
};

/**
 * ファクトリー関数（動的データ生成）
 */

export const createMockUser = (overrides?: Partial<User>): User => ({
    id: `user_${Math.random().toString(36).substr(2, 9)}`,
    name: `テストユーザー${Math.floor(Math.random() * 1000)}`,
    group: 'グループA' as Group,
    price: 500,
    createdAt: new Date().toISOString(),
    isActive: true,
    trialUser: false,
    ...overrides,
});

export const createMockMealRecord = (overrides?: Partial<MealRecord>): MealRecord => ({
    id: `meal_${Math.random().toString(36).substr(2, 9)}`,
    userId: 'user_1',
    userName: 'テストユーザー',
    userGroup: 'グループA',
    date: format(new Date(), 'yyyy-MM-dd'),
    rating: 7,
    price: 500,
    menuName: 'テストメニュー',
    ...overrides,
});

export const createMockMenuItem = (overrides?: Partial<MenuItem>): MenuItem => ({
    id: `menu_${Math.random().toString(36).substr(2, 9)}`,
    name: 'テストメニュー',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: 'テスト用のメニューです',
    price: 500,
    category: 'main',
    ...overrides,
});

/**
 * 大量データ生成（パフォーマンステスト用）
 */

export const generateMockUsers = (count: number): User[] => {
    return Array.from({ length: count }, (_, index) =>
        createMockUser({
            id: `user_${index + 1}`,
            name: `テストユーザー${index + 1}`,
            group: (['グループA', 'グループB', 'グループC', 'グループD'] as Group[])[index % 4],
            price: 400 + (index % 5) * 50, // 400-600円の範囲
        })
    );
};

export const generateMockMealRecords = (
    users: User[],
    days: number = 30
): MealRecord[] => {
    const records: MealRecord[] = [];

    for (let dayOffset = 0; dayOffset < days; dayOffset++) {
        const date = format(subDays(new Date(), dayOffset), 'yyyy-MM-dd');

        // 各日に各ユーザーの記録を作成（ランダムに80%の確率で）
        users.forEach((user, userIndex) => {
            if (Math.random() > 0.2) { // 80%の確率で記録あり
                records.push(createMockMealRecord({
                    id: `meal_${dayOffset}_${userIndex}`,
                    userId: user.id,
                    userName: user.name,
                    userGroup: user.group,
                    date,
                    rating: Math.floor(Math.random() * 10) + 1, // 1-10の評価
                    price: user.price,
                    menuName: `メニュー${dayOffset % 7 + 1}`, // 週替わりメニュー
                }));
            }
        });
    }

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