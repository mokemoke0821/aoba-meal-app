import { format } from 'date-fns';
import { Group, MenuItem, User } from '../types';

// サンプル利用者データ
export const generateInitialUsers = (): User[] => [
    {
        id: '1',
        name: '佐藤太郎',
        group: 'グループA',
        trialUser: false,
        price: 400,
        createdAt: '2024-01-01T00:00:00.000Z',
    },
    {
        id: '2',
        name: '田中花子',
        group: 'グループB',
        trialUser: false,
        price: 400,
        createdAt: '2024-01-15T00:00:00.000Z',
    },
    {
        id: '3',
        name: '山田一郎',
        group: 'グループA',
        trialUser: true,
        price: 0,
        createdAt: '2024-02-01T00:00:00.000Z',
    },
    {
        id: '4',
        name: '鈴木美咲',
        group: 'グループB',
        trialUser: false,
        price: 400,
        createdAt: '2024-02-15T00:00:00.000Z',
    },
    {
        id: '5',
        name: '職員・田中',
        group: 'グループC',
        trialUser: false,
        price: 500,
        createdAt: '2024-03-01T00:00:00.000Z',
    },
    {
        id: '6',
        name: '体験・山本',
        group: 'グループD',
        trialUser: true,
        price: 0,
        createdAt: '2024-03-10T00:00:00.000Z',
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
    price?: number
): Omit<User, 'id' | 'createdAt'> => {
    const defaultPrices = {
        'グループA': 400,
        'グループB': 350,
        'グループC': 500,
        'グループD': 300,
    };

    return {
        name,
        group,
        trialUser: false,
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

const generateRandomUser = (): Omit<User, 'id' | 'createdAt'> => {
    const names = ['田中', '佐藤', '鈴木', '高橋', '渡辺', '山田', '中村', '小林', '加藤', '吉田'];
    const firstNames = ['太郎', '次郎', '花子', '美咲', '健太', '由美', '翔太', '愛子', '大輔', '真理'];
    const groups = ['グループA', 'グループB', 'グループC', 'グループD'];

    const lastName = names[Math.floor(Math.random() * names.length)];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const group = groups[Math.floor(Math.random() * groups.length)] as Group;
    const trialUser = Math.random() < 0.2; // 20%の確率で体験利用者

    return {
        name: `${lastName}${firstName}`,
        group,
        trialUser,
        price: trialUser ? 0 : 400,
    };
}; 