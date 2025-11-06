/**
 * ストレージアダプター
 * LocalStorageとGoogle Driveを統合し、シームレスなデータ管理を提供
 */

import type { MealRecord, User } from '../types';
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

// deep-diffは使用しないため一旦コメントアウト
// import * as diff from 'deep-diff';

// LocalStorageのキー
const KEYS = {
    USERS: 'aoba-meal-users',
    MEAL_RECORDS: 'aoba-meal-records',
    CURRENT_MENU: 'aoba-current-menu',
};

/**
 * Google Drive統合が有効かどうか
 */
function isGoogleDriveEnabled(): boolean {
    const config = loadSyncConfig();
    return config.enabled && isInitialized() && isAuthenticated();
}

/**
 * ユーザーデータを保存
 * LocalStorageに保存し、Google Drive統合が有効な場合は同期
 */
export async function saveUsersWithSync(users: User[]): Promise<void> {
    try {
        // LocalStorageに保存
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
        console.log('[Storage Adapter] ユーザーデータをLocalStorageに保存');

        // Google Drive統合が有効な場合は同期
        if (isGoogleDriveEnabled()) {
            console.log('[Storage Adapter] Google Driveに同期中...');
            await performSync();
        }
    } catch (error) {
        console.error('[Storage Adapter] ユーザーデータの保存に失敗:', error);
        throw error;
    }
}

/**
 * 給食記録を保存
 * LocalStorageに保存し、Google Drive統合が有効な場合は同期
 */
export async function saveMealRecordsWithSync(records: MealRecord[]): Promise<void> {
    try {
        // LocalStorageに保存
        localStorage.setItem(KEYS.MEAL_RECORDS, JSON.stringify(records));
        console.log('[Storage Adapter] 給食記録をLocalStorageに保存');

        // Google Drive統合が有効な場合は同期
        if (isGoogleDriveEnabled()) {
            console.log('[Storage Adapter] Google Driveに同期中...');
            await performSync();
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
 * Google Driveからデータを復元
 */
export async function restoreFromGoogleDrive(fileId: string): Promise<{
    users: User[];
    mealRecords: MealRecord[];
    currentMenu: any;
}> {
    try {
        console.log('[Storage Adapter] Google Driveからデータを復元中...');

        if (!isAuthenticated()) {
            throw new Error('Google Driveにサインインしてください');
        }

        // ファイルをダウンロード
        const fileContent = await downloadFile(fileId);
        const data = JSON.parse(fileContent);

        console.log('[Storage Adapter] データを復元しました');
        return {
            users: data.users || [],
            mealRecords: data.mealRecords || [],
            currentMenu: data.currentMenu || null,
        };
    } catch (error) {
        console.error('[Storage Adapter] データの復元に失敗:', error);
        throw new Error(`データの復元に失敗しました: ${(error as Error).message}`);
    }
}

/**
 * LocalStorageとGoogle Driveのデータをマージ
 */
export async function mergeData(): Promise<{
    users: User[];
    mealRecords: MealRecord[];
    conflicts: number;
}> {
    try {
        console.log('[Storage Adapter] データをマージ中...');

        if (!isAuthenticated()) {
            throw new Error('Google Driveにサインインしてください');
        }

        // LocalStorageからデータを取得
        const localUsers = loadUsersFromLocal();
        const localRecords = loadMealRecordsFromLocal();

        // Google Driveから最新のデータを取得
        const config = loadSyncConfig();
        if (!config.folderId) {
            const folderId = await findOrCreateFolder();
            config.folderId = folderId;
            saveSyncConfig(config);
        }

        // 最新のバックアップファイルを探す
        // 注: 簡略化のため、ここではLocalStorageのデータを優先
        // 実際の実装では、タイムスタンプを比較して最新のデータを選択

        let conflicts = 0;

        // ユーザーデータのマージ
        const mergedUsers = [...localUsers];
        
        // 給食記録のマージ
        const mergedRecords = [...localRecords];

        // データの差分を検出（簡易版）
        // 注: 本格的な差分検出は後で実装
        if (JSON.stringify(localUsers) !== JSON.stringify(mergedUsers)) {
            conflicts++;
        }
        if (JSON.stringify(localRecords) !== JSON.stringify(mergedRecords)) {
            conflicts++;
        }

        if (conflicts > 0) {
            console.log('[Storage Adapter] データの競合を検出:', conflicts);
        }

        console.log('[Storage Adapter] データのマージが完了');

        return {
            users: mergedUsers,
            mealRecords: mergedRecords,
            conflicts,
        };
    } catch (error) {
        console.error('[Storage Adapter] データのマージに失敗:', error);
        throw new Error(`データのマージに失敗しました: ${(error as Error).message}`);
    }
}

/**
 * 手動同期
 */
export async function manualSync(): Promise<void> {
    try {
        console.log('[Storage Adapter] 手動同期を開始...');

        if (!isAuthenticated()) {
            throw new Error('Google Driveにサインインしてください');
        }

        await performSync();
        console.log('[Storage Adapter] 手動同期が完了');
    } catch (error) {
        console.error('[Storage Adapter] 手動同期に失敗:', error);
        throw error;
    }
}

/**
 * 自動同期を設定
 */
export function setupAutoSync(): () => void {
    console.log('[Storage Adapter] 自動同期を設定中...');

    const config = loadSyncConfig();
    if (!config.autoSync || !config.enabled) {
        console.log('[Storage Adapter] 自動同期が無効です');
        return () => {}; // 何もしない
    }

    // 定期的に同期を実行
    const intervalId = setInterval(async () => {
        if (isGoogleDriveEnabled()) {
            try {
                console.log('[Storage Adapter] 自動同期を実行中...');
                await performSync();
            } catch (error) {
                console.error('[Storage Adapter] 自動同期に失敗:', error);
            }
        }
    }, config.syncInterval);

    console.log('[Storage Adapter] 自動同期を設定しました:', config.syncInterval / 60000, '分ごと');

    // クリーンアップ関数を返す
    return () => {
        console.log('[Storage Adapter] 自動同期を停止');
        clearInterval(intervalId);
    };
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
 * バックアップからデータを復元し、LocalStorageに保存
 */
export async function restoreAndSave(fileId: string): Promise<void> {
    try {
        console.log('[Storage Adapter] バックアップからデータを復元中...');

        // データを復元
        const { users, mealRecords, currentMenu } = await restoreFromGoogleDrive(fileId);

        // データの整合性チェック
        const validation = validateData(users, mealRecords);
        if (!validation.valid) {
            console.error('[Storage Adapter] データの整合性チェックに失敗:', validation.errors);
            throw new Error(`データの整合性チェックに失敗しました:\n${validation.errors.join('\n')}`);
        }

        // LocalStorageに保存
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
        localStorage.setItem(KEYS.MEAL_RECORDS, JSON.stringify(mealRecords));
        localStorage.setItem(KEYS.CURRENT_MENU, JSON.stringify(currentMenu));

        console.log('[Storage Adapter] データを復元してLocalStorageに保存しました');
    } catch (error) {
        console.error('[Storage Adapter] データの復元と保存に失敗:', error);
        throw error;
    }
}

