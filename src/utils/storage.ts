import { saveAs } from 'file-saver';
import { MealRecord, MenuItem, User } from '../types';

// LocalStorageのキー定義
const STORAGE_KEYS = {
    USERS: 'aoba-meal-users',
    MEAL_RECORDS: 'aoba-meal-records',
    CURRENT_MENU: 'aoba-current-menu',
} as const;

// ユーザーデータの保存
export const saveUsers = (users: User[]): void => {
    try {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (error) {
        console.error('ユーザーデータの保存に失敗しました:', error);
        throw new Error('ユーザーデータの保存に失敗しました');
    }
};

// ユーザーデータの読み込み
export const loadUsers = (): User[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.USERS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('ユーザーデータの読み込みに失敗しました:', error);
        return [];
    }
};

// 給食記録の保存
export const saveMealRecords = (records: MealRecord[]): void => {
    try {
        localStorage.setItem(STORAGE_KEYS.MEAL_RECORDS, JSON.stringify(records));
    } catch (error) {
        console.error('給食記録の保存に失敗しました:', error);
        throw new Error('給食記録の保存に失敗しました');
    }
};

// 給食記録の読み込み
export const loadMealRecords = (): MealRecord[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.MEAL_RECORDS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('給食記録の読み込みに失敗しました:', error);
        return [];
    }
};

// 現在のメニューの保存
export const saveCurrentMenu = (menu: MenuItem | null): void => {
    try {
        if (menu) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_MENU, JSON.stringify(menu));
        } else {
            localStorage.removeItem(STORAGE_KEYS.CURRENT_MENU);
        }
    } catch (error) {
        console.error('メニューデータの保存に失敗しました:', error);
        throw new Error('メニューデータの保存に失敗しました');
    }
};

// 現在のメニューの読み込み
export const loadCurrentMenu = (): MenuItem | null => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.CURRENT_MENU);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('メニューデータの読み込みに失敗しました:', error);
        return null;
    }
};

// CSV出力用のデータ変換
const convertRecordsToCSV = (records: MealRecord[]): string => {
    const headers = ['日付', '利用者名', 'グループ', '料金', '摂食量', 'メニュー名', '支援記録'];
    const csvData = records.map(record => [
        record.date,
        record.userName,
        record.userGroup,
        record.price.toString(),
        record.eatingRatio.toString(),
        record.menuName || '',
        record.supportNotes || ''
    ]);

    const csvContent = [headers, ...csvData]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

    return '\uFEFF' + csvContent; // BOM付きUTF-8
};

// 給食記録のCSV出力
export const exportMealRecordsToCSV = (records: MealRecord[]): void => {
    try {
        const csvContent = convertRecordsToCSV(records);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        const timestamp = new Date().toISOString().slice(0, 10);
        saveAs(blob, `給食記録_${timestamp}.csv`);
    } catch (error) {
        console.error('CSV出力に失敗しました:', error);
        throw new Error('CSV出力に失敗しました');
    }
};

// 期間指定での給食記録のCSV出力
export const exportMealRecordsByDateRange = (
    records: MealRecord[],
    startDate: string,
    endDate: string
): void => {
    try {
        const filteredRecords = records.filter(record => {
            return record.date >= startDate && record.date <= endDate;
        });

        if (filteredRecords.length === 0) {
            throw new Error('指定期間にデータがありません');
        }

        const csvContent = convertRecordsToCSV(filteredRecords);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        saveAs(blob, `給食記録_${startDate}_${endDate}.csv`);
    } catch (error) {
        console.error('期間指定CSV出力に失敗しました:', error);
        throw error;
    }
};

// ユーザー一覧のCSV出力
export const exportUsersToCSV = (users: User[]): void => {
    try {
        const headers = ['利用者名', 'グループ', '料金', '登録日', '状態'];
        const csvData = users.map(user => [
            user.name,
            user.group,
            user.price.toString(),
            user.createdAt,
            user.isActive ? '有効' : '無効'
        ]);

        const csvContent = [headers, ...csvData]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
        const timestamp = new Date().toISOString().slice(0, 10);
        saveAs(blob, `利用者一覧_${timestamp}.csv`);
    } catch (error) {
        console.error('ユーザー一覧CSV出力に失敗しました:', error);
        throw new Error('ユーザー一覧CSV出力に失敗しました');
    }
};

// データの完全削除（管理機能）
export const clearAllData = (): void => {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    } catch (error) {
        console.error('データの削除に失敗しました:', error);
        throw new Error('データの削除に失敗しました');
    }
};

// データのバックアップ作成
export const createBackup = (): void => {
    try {
        const backupData = {
            users: loadUsers(),
            mealRecords: loadMealRecords(),
            currentMenu: loadCurrentMenu(),
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const timestamp = new Date().toISOString().slice(0, 10);
        saveAs(blob, `あおば給食データバックアップ_${timestamp}.json`);
    } catch (error) {
        console.error('バックアップ作成に失敗しました:', error);
        throw new Error('バックアップ作成に失敗しました');
    }
}; 