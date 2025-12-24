import { format } from 'date-fns';
import { GROUP_TO_CATEGORY, Group, MenuItem, User, getCategoryPrice } from '../types';

// サンプル利用者データ（本番環境では空）
export const generateInitialUsers = (): User[] => [];

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
  }

  if (!existingMenu) {
    localStorage.setItem('aoba-current-menu', JSON.stringify(sampleTodayMenu));
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