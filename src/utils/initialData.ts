import { format } from 'date-fns';
import { GROUP_TO_CATEGORY, Group, MenuItem, User, getCategoryPrice } from '../types';

// サンプル利用者データ
export const generateInitialUsers = (): User[] => [
    {
        id: '1',
        name: '佐藤太郎',
        group: 'グループA',
        trialUser: false,
        price: getCategoryPrice('A型'),
        createdAt: '2024-01-01T00:00:00.000Z',
        category: 'A型',
        displayNumber: 1,
        isActive: true,
    },
    {
        id: '2',
        name: '田中花子',
        group: 'グループB',
        trialUser: false,
        price: getCategoryPrice('B型'),
        createdAt: '2024-01-01T00:00:00.000Z',
        category: 'B型',
        displayNumber: 1,
        isActive: true,
    },
    {
        id: '3',
        name: '鈴木一郎',
        group: 'グループC',
        trialUser: false,
        price: getCategoryPrice('職員'),
        createdAt: '2024-01-01T00:00:00.000Z',
        category: '職員',
        displayNumber: 1,
        isActive: true,
    },
    {
        id: '4',
        name: '高橋恵子',
        group: 'その他',
        trialUser: true,
        price: getCategoryPrice('体験者'),
        createdAt: '2024-01-01T00:00:00.000Z',
        category: '体験者',
        displayNumber: 1,
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
        localStorage.setItem('aoba-meal-users', JSON.stringify(generateInitialUsers()));
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
    group: Group,
    price?: number,
    displayNumber?: number
): Omit<User, 'id' | 'createdAt'> => {
    const category = GROUP_TO_CATEGORY[group];

    return {
        name,
        group,
        trialUser: false,
        price: price || getCategoryPrice(category),
        isActive: true,
        category: category,
        displayNumber: displayNumber || 1
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