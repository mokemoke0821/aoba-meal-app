import { MealRecord, MenuItem, User, UserCategory } from '../types';

// モックユーザーデータ
export const mockUsers: User[] = [
    {
        id: '1',
        name: '田中太郎',
        group: 'グループA',
        category: 'A型' as UserCategory,
        displayNumber: 1,
        price: 100,
        createdAt: '2024-01-01T00:00:00.000Z',
        isActive: true,
        trialUser: false,
        notes: 'テストユーザー1'
    },
    {
        id: '2',
        name: '佐藤花子',
        group: 'グループB',
        category: 'B型' as UserCategory,
        displayNumber: 2,
        price: 0,
        createdAt: '2024-01-02T00:00:00.000Z',
        isActive: true,
        trialUser: false,
        notes: 'テストユーザー2'
    },
    {
        id: '3',
        name: '山田次郎',
        group: 'グループA',
        category: '職員' as UserCategory,
        displayNumber: 3,
        price: 400,
        createdAt: '2024-01-03T00:00:00.000Z',
        isActive: true,
        trialUser: false,
        notes: 'テストユーザー3'
    },
    {
        id: '4',
        name: '鈴木美咲',
        group: 'グループC',
        category: '体験者' as UserCategory,
        displayNumber: 4,
        price: 400,
        createdAt: '2024-01-04T00:00:00.000Z',
        isActive: true,
        trialUser: true,
        notes: 'テストユーザー4'
    }
];

// モックメニューアイテム
export const mockMenuItem: MenuItem = {
    id: '1',
    name: '今日のおすすめ定食',
    date: new Date().toISOString().split('T')[0],
    description: 'メイン料理、ご飯、味噌汁、小鉢のセット',
    price: 400,
    category: 'main'
};

// モック給食記録作成関数
export const createMockMealRecord = (overrides: Partial<MealRecord> = {}): MealRecord => {
    const baseRecord: MealRecord = {
        id: `meal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: mockUsers[0].id,
        userName: mockUsers[0].name,
        userGroup: mockUsers[0].group,
        userCategory: mockUsers[0].category,
        date: new Date().toISOString().split('T')[0], // 'yyyy-MM-dd' format
        rating: 7,
        price: mockUsers[0].price,
        menuName: mockMenuItem.name,
        notes: 'テスト用の給食記録'
    };

    return { ...baseRecord, ...overrides };
};

// 複数のモック給食記録を生成
export const generateMockMealRecords = (users: User[], count: number): MealRecord[] => {
    const records: MealRecord[] = [];
    const today = new Date();

    for (let i = 0; i < count; i++) {
        const user = users[i % users.length];
        const recordDate = new Date(today);
        recordDate.setDate(today.getDate() - Math.floor(i / users.length));

        records.push(createMockMealRecord({
            id: `meal-${i + 1}`,
            userId: user.id,
            userName: user.name,
            userGroup: user.group,
            userCategory: user.category,
            date: recordDate.toISOString().split('T')[0],
            rating: Math.floor(Math.random() * 10) + 1, // 1-10のランダム評価
            price: user.price,
            menuName: `テストメニュー${i + 1}`,
            notes: `テスト記録 ${i + 1}`
        }));
    }

    return records;
};

// 日付範囲内のモック記録を生成
export const generateMockMealRecordsForDateRange = (
    users: User[],
    startDate: Date,
    endDate: Date,
    recordsPerDay: number = 2
): MealRecord[] => {
    const records: MealRecord[] = [];
    const currentDate = new Date(startDate);
    let recordId = 1;

    while (currentDate <= endDate) {
        for (let i = 0; i < recordsPerDay && i < users.length; i++) {
            const user = users[i];
            records.push(createMockMealRecord({
                id: `meal-${recordId}`,
                userId: user.id,
                userName: user.name,
                userGroup: user.group,
                userCategory: user.category,
                date: currentDate.toISOString().split('T')[0],
                rating: Math.floor(Math.random() * 10) + 1,
                price: user.price,
                menuName: `${currentDate.toLocaleDateString('ja-JP')}のメニュー`,
                notes: `${currentDate.toLocaleDateString('ja-JP')}の記録`
            }));
            recordId++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return records;
};

// テスト用のローカルストレージモック
export const createMockLocalStorage = () => {
    let store: { [key: string]: string } = {};

    return {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => {
            store[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
            delete store[key];
        }),
        clear: jest.fn(() => {
            store = {};
        }),
        key: jest.fn((index: number) => {
            const keys = Object.keys(store);
            return keys[index] || null;
        }),
        get length() {
            return Object.keys(store).length;
        }
    };
};

// テスト用のファイルダウンロードモック
export const createMockFileDownload = () => ({
    saveAs: jest.fn(),
    createObjectURL: jest.fn(() => 'mock-url'),
    revokeObjectURL: jest.fn()
});

// テスト用の日付ユーティリティ
export const createTestDate = (dateString: string): Date => {
    return new Date(dateString + 'T00:00:00.000Z');
};

// テスト用のランダムデータ生成
export const generateRandomRating = (): number => {
    return Math.floor(Math.random() * 10) + 1;
};

export const generateRandomPrice = (category: UserCategory): number => {
    switch (category) {
        case 'A型':
            return 100;
        case 'B型':
            return 0;
        case '職員':
        case '体験者':
            return 400;
        default:
            return 0;
    }
};

// テスト用のCSVデータ生成
export const generateMockCSVData = (records: MealRecord[]): string => {
    const headers = ['日付', '利用者名', 'グループ', 'カテゴリ', '料金', '評価', 'メニュー名', '備考'];
    const csvRows = [headers.join(',')];

    records.forEach(record => {
        const row = [
            record.date,
            record.userName,
            record.userGroup,
            record.userCategory,
            record.price.toString(),
            record.rating.toString(),
            record.menuName || '',
            record.notes || ''
        ];
        csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
};

// エラーテスト用のヘルパー
export const expectToThrowAsync = async (asyncFn: () => Promise<any>, expectedError?: string) => {
    try {
        await asyncFn();
        throw new Error('Expected function to throw, but it did not');
    } catch (error) {
        if (expectedError && error instanceof Error) {
            expect(error.message).toContain(expectedError);
        }
    }
};

// DOM要素のテストヘルパー
export const waitForElementToBeRemoved = async (element: HTMLElement, timeout = 5000) => {
    return new Promise<void>((resolve, reject) => {
        const startTime = Date.now();
        const checkElement = () => {
            if (!document.contains(element)) {
                resolve();
            } else if (Date.now() - startTime > timeout) {
                reject(new Error(`Element was not removed within ${timeout}ms`));
            } else {
                setTimeout(checkElement, 100);
            }
        };
        checkElement();
    });
};

// フォーム入力のテストヘルパー
export const fillForm = async (formData: { [key: string]: string }) => {
    const { fireEvent } = await import('@testing-library/react');

    Object.entries(formData).forEach(([fieldName, value]) => {
        const field = document.querySelector(`[name="${fieldName}"]`) as HTMLInputElement;
        if (field) {
            fireEvent.change(field, { target: { value } });
        }
    });
};

// 統計テスト用のヘルパー関数
export const generateMockUsers = (count: number): User[] => {
    const users: User[] = [];
    for (let i = 0; i < count; i++) {
        const user: User = {
            id: `user-${i + 1}`,
            name: `テストユーザー${i + 1}`,
            group: 'グループA',
            category: 'A型',
            displayNumber: i + 1,
            price: 100,
            createdAt: new Date().toISOString(),
            isActive: true,
            trialUser: false
        };
        users.push(user);
    }
    return users;
};

// 日付範囲のテストデータ作成
export const createDateRangeTestData = (
    startDate: Date,
    endDate: Date,
    recordsPerDay: number = 1
): MealRecord[] => {
    return generateMockMealRecordsForDateRange(mockUsers, startDate, endDate, recordsPerDay);
}; 