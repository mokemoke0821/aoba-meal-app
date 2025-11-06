/**
 * ストレージアダプター
 * LocalStorageとGoogle Driveを統合し、シームレスなデータ管理を提供
 * 
 * ⚠️ Google Drive統合は現在無効化されています（v2.2.0で実装予定）
 */

import type { MealRecord, User } from '../types';

// LocalStorageのキー
const KEYS = {
    USERS: 'aoba-meal-users',
    MEAL_RECORDS: 'aoba-meal-records',
    CURRENT_MENU: 'aoba-current-menu',
};

/**
 * Google Drive統合が有効かどうか（現在は常にfalse）
 */
function isGoogleDriveEnabled(): boolean {
    // Google Drive統合は一時的に無効化
    return false;
}

/**
 * ユーザーデータを保存
 * LocalStorageに保存（Google Drive同期は無効化）
 */
export async function saveUsersWithSync(users: User[]): Promise<void> {
    try {
        // LocalStorageに保存
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
        console.log('[Storage Adapter] ユーザーデータをLocalStorageに保存');

        // Google Drive統合は無効化されています
        if (isGoogleDriveEnabled()) {
            console.log('[Storage Adapter] Google Driveに同期中...');
            // await performSync();
        }
    } catch (error) {
        console.error('[Storage Adapter] ユーザーデータの保存に失敗:', error);
        throw error;
    }
}

/**
 * 給食記録を保存
 * LocalStorageに保存（Google Drive同期は無効化）
 */
export async function saveMealRecordsWithSync(records: MealRecord[]): Promise<void> {
    try {
        // LocalStorageに保存
        localStorage.setItem(KEYS.MEAL_RECORDS, JSON.stringify(records));
        console.log('[Storage Adapter] 給食記録をLocalStorageに保存');

        // Google Drive統合は無効化されています
        if (isGoogleDriveEnabled()) {
            console.log('[Storage Adapter] Google Driveに同期中...');
            // await performSync();
        }
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
 * Google Driveからデータを復元（現在は無効化）
 */
export async function restoreFromGoogleDrive(fileId: string): Promise<{
    users: User[];
    mealRecords: MealRecord[];
    currentMenu: any;
}> {
    throw new Error('Google Drive統合は現在無効化されています（v2.2.0で実装予定）');
}

/**
 * LocalStorageとGoogle Driveのデータをマージ（現在は無効化）
 */
export async function mergeData(): Promise<{
    users: User[];
    mealRecords: MealRecord[];
    conflicts: number;
}> {
    throw new Error('Google Drive統合は現在無効化されています（v2.2.0で実装予定）');
}

/**
 * 手動同期（現在は無効化）
 */
export async function manualSync(): Promise<void> {
    throw new Error('Google Drive統合は現在無効化されています（v2.2.0で実装予定）');
}

/**
 * 自動同期を設定（現在は無効化）
 */
export function setupAutoSync(): () => void {
    console.log('[Storage Adapter] Google Drive統合は現在無効化されています（v2.2.0で実装予定）');
    return () => {}; // 何もしないクリーンアップ関数
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

/**
 * バックアップからデータを復元し、LocalStorageに保存（現在は無効化）
 */
export async function restoreAndSave(fileId: string): Promise<void> {
    throw new Error('Google Drive統合は現在無効化されています（v2.2.0で実装予定）');
}

/* ==========================================
 * 以下は元の実装（v2.2.0で復活予定）
 * ==========================================

import {
    isAuthenticated,
    isInitialized,
} from '../services/googleDrive/auth';
import {
    downloadFile,
    findOrCreateFolder,
    loadSyncConfig,
    performSync,
    saveSyncConfig,
    uploadFile,
} from '../services/googleDrive/sync';

function isGoogleDriveEnabled(): boolean {
    const config = loadSyncConfig();
    return config.enabled && isInitialized() && isAuthenticated();
}

export async function saveUsersWithSync(users: User[]): Promise<void> {
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    if (isGoogleDriveEnabled()) {
        await performSync();
    }
}

export async function saveMealRecordsWithSync(records: MealRecord[]): Promise<void> {
    localStorage.setItem(KEYS.MEAL_RECORDS, JSON.stringify(records));
    if (isGoogleDriveEnabled()) {
        await performSync();
    }
}

export async function restoreFromGoogleDrive(fileId: string): Promise<...> {
    if (!isAuthenticated()) {
        throw new Error('Google Driveにサインインしてください');
    }
    const fileContent = await downloadFile(fileId);
    const data = JSON.parse(fileContent);
    return { users: data.users || [], mealRecords: data.mealRecords || [], currentMenu: data.currentMenu || null };
}

export async function mergeData(): Promise<...> {
    if (!isAuthenticated()) {
        throw new Error('Google Driveにサインインしてください');
    }
    const localUsers = loadUsersFromLocal();
    const localRecords = loadMealRecordsFromLocal();
    const config = loadSyncConfig();
    if (!config.folderId) {
        const folderId = await findOrCreateFolder();
        config.folderId = folderId;
        saveSyncConfig(config);
    }
    // ... マージロジック ...
    return { users: mergedUsers, mealRecords: mergedRecords, conflicts };
}

export async function manualSync(): Promise<void> {
    if (!isAuthenticated()) {
        throw new Error('Google Driveにサインインしてください');
    }
    await performSync();
}

export function setupAutoSync(): () => void {
    const config = loadSyncConfig();
    if (!config.autoSync || !config.enabled) {
        return () => {};
    }
    const intervalId = setInterval(async () => {
        if (isGoogleDriveEnabled()) {
            await performSync();
        }
    }, config.syncInterval);
    return () => { clearInterval(intervalId); };
}

export async function restoreAndSave(fileId: string): Promise<void> {
    const { users, mealRecords, currentMenu } = await restoreFromGoogleDrive(fileId);
    const validation = validateData(users, mealRecords);
    if (!validation.valid) {
        throw new Error(`データの整合性チェックに失敗しました:\n${validation.errors.join('\n')}`);
    }
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(KEYS.MEAL_RECORDS, JSON.stringify(mealRecords));
    localStorage.setItem(KEYS.CURRENT_MENU, JSON.stringify(currentMenu));
}

========================================== */
