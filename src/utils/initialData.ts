import { format } from 'date-fns';
import { MenuItem, User } from '../types';

// サンプル利用者データ
export const sampleUsers: User[] = [
    {
        id: 'user_001',
        name: '田中 太郎',
        group: 'A型',
        price: 400,
        createdAt: '2024-01-01T00:00:00.000Z',
        isActive: true,
    },
    {
        id: 'user_002',
        name: '佐藤 花子',
        group: 'B型',
        price: 350,
        createdAt: '2024-01-01T00:00:00.000Z',
        isActive: true,
    },
    {
        id: 'user_003',
        name: '鈴木 一郎',
        group: 'A型',
        price: 400,
        createdAt: '2024-01-01T00:00:00.000Z',
        isActive: true,
    },
    {
        id: 'user_004',
        name: '高橋 美咲',
        group: 'B型',
        price: 350,
        createdAt: '2024-01-01T00:00:00.000Z',
        isActive: true,
    },
    {
        id: 'user_005',
        name: '山田 職員',
        group: '職員',
        price: 500,
        createdAt: '2024-01-01T00:00:00.000Z',
        isActive: true,
    },
    {
        id: 'user_006',
        name: '体験 次郎',
        group: '体験者',
        price: 300,
        createdAt: '2024-01-01T00:00:00.000Z',
        isActive: true,
    },
];

// 今日のサンプルメニュー
export const sampleTodayMenu: MenuItem = {
    id: 'menu_today',
    name: 'ハンバーグ定食',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: 'ジューシーなハンバーグに、ご飯・味噌汁・サラダが付いた栄養バランスの良い定食です。',
};

// 初期データ設定関数
export const setupInitialData = (): void => {
    // LocalStorageが空の場合のみ初期データを設定
    const existingUsers = localStorage.getItem('aoba-meal-users');
    const existingMenu = localStorage.getItem('aoba-current-menu');

    if (!existingUsers) {
        localStorage.setItem('aoba-meal-users', JSON.stringify(sampleUsers));
        console.log('サンプル利用者データを設定しました');
    }

    if (!existingMenu) {
        localStorage.setItem('aoba-current-menu', JSON.stringify(sampleTodayMenu));
        console.log('本日のサンプルメニューを設定しました');
    }
};

// 追加の利用者作成用のテンプレート
export const createUserTemplate = (
    name: string,
    group: 'A型' | 'B型' | '職員' | '体験者',
    price?: number
): Omit<User, 'id' | 'createdAt'> => {
    const defaultPrices = {
        'A型': 400,
        'B型': 350,
        '職員': 500,
        '体験者': 300,
    };

    return {
        name,
        group,
        price: price || defaultPrices[group],
        isActive: true,
    };
};

// メニューテンプレート作成
export const createMenuTemplate = (
    name: string,
    description?: string,
    date?: string
): MenuItem => ({
    id: `menu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    date: date || format(new Date(), 'yyyy-MM-dd'),
    description,
}); 