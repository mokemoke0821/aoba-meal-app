/**
 * ストレージアダプター
 * LocalStorageを使用してデータを管理
 */

import type { MealRecord, User } from '../types';

// LocalStorageのキー
const KEYS = {
    USERS: 'aoba-meal-users',
    MEAL_RECORDS: 'aoba-meal-records',
    CURRENT_MENU: 'aoba-current-menu',
};

/**
 * ユーザーデータを保存
 * LocalStorageに保存
 */
export async function saveUsersWithSync(users: User[]): Promise<void> {
    try {
        // LocalStorageに保存
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    } catch (error) {
        console.error('[Storage Adapter] ユーザーデータの保存に失敗:', error);
        throw error;
    }
}

/**
 * 給食記録を保存
 * LocalStorageに保存
 */
export async function saveMealRecordsWithSync(records: MealRecord[]): Promise<void> {
    try {
        // LocalStorageに保存
        localStorage.setItem(KEYS.MEAL_RECORDS, JSON.stringify(records));
    } catch (error) {
        console.error('[Storage Adapter] 給食記録の保存に失敗:', error);
        throw error;
    }
}

/**
 * データをLocalStorageから読み込み
 */
export function loadUsersFromLocal(): User[] {
    try {
        const data = localStorage.getItem(KEYS.USERS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('[Storage Adapter] ユーザーデータの読み込みに失敗:', error);
        return [];
    }
}

/**
 * データをLocalStorageから読み込み
 */
export function loadMealRecordsFromLocal(): MealRecord[] {
    try {
        const data = localStorage.getItem(KEYS.MEAL_RECORDS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('[Storage Adapter] 給食記録の読み込みに失敗:', error);
        return [];
    }
}

/**
 * データの整合性チェック
 */
export function validateData(users: User[], records: MealRecord[]): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    // ユーザーデータの検証
    if (!Array.isArray(users)) {
        errors.push('ユーザーデータが配列ではありません');
    } else {
        users.forEach((user, index) => {
            if (!user.id) errors.push(`ユーザー ${index}: IDがありません`);
            if (!user.name) errors.push(`ユーザー ${index}: 名前がありません`);
        });
    }

    // 給食記録の検証
    if (!Array.isArray(records)) {
        errors.push('給食記録が配列ではありません');
    } else {
        records.forEach((record, index) => {
            if (!record.id) errors.push(`給食記録 ${index}: IDがありません`);
            if (!record.userId) errors.push(`給食記録 ${index}: ユーザーIDがありません`);
            if (!record.date) errors.push(`給食記録 ${index}: 日付がありません`);
        });
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
