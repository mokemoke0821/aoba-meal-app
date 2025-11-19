import { createBackup, loadUsers } from './storage';

/**
 * 自動バックアップ設定のキー
 */
const AUTO_BACKUP_KEY = 'aoba-auto-backup-enabled';
const LAST_BACKUP_KEY = 'aoba-last-backup-timestamp';
const BACKUP_INTERVAL_DAYS = 7; // 7日ごとにバックアップ

/**
 * 自動バックアップが有効かどうかを確認
 */
export const isAutoBackupEnabled = (): boolean => {
    try {
        const enabled = localStorage.getItem(AUTO_BACKUP_KEY);
        return enabled === 'true';
    } catch (error) {
        console.error('自動バックアップ設定の確認エラー:', error);
        return false;
    }
};

/**
 * 自動バックアップの有効/無効を設定
 */
export const setAutoBackupEnabled = (enabled: boolean): void => {
    try {
        localStorage.setItem(AUTO_BACKUP_KEY, enabled.toString());
    } catch (error) {
        console.error('自動バックアップ設定の保存エラー:', error);
    }
};

/**
 * 最後のバックアップ日時を取得
 */
export const getLastBackupTimestamp = (): Date | null => {
    try {
        const timestamp = localStorage.getItem(LAST_BACKUP_KEY);
        return timestamp ? new Date(timestamp) : null;
    } catch (error) {
        console.error('最終バックアップ日時の取得エラー:', error);
        return null;
    }
};

/**
 * バックアップが必要かどうかを判定
 */
export const shouldCreateBackup = (): boolean => {
    if (!isAutoBackupEnabled()) {
        return false;
    }

    const lastBackup = getLastBackupTimestamp();
    if (!lastBackup) {
        return true; // 一度もバックアップしていない
    }

    const daysSinceLastBackup = (Date.now() - lastBackup.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceLastBackup >= BACKUP_INTERVAL_DAYS;
};

/**
 * 自動バックアップを実行
 */
export const performAutoBackup = async (): Promise<boolean> => {
    try {
        if (!shouldCreateBackup()) {
            return false;
        }

        // データが存在するか確認
        const users = loadUsers();

        if (users.length === 0) {
            return false;
        }

        // バックアップ作成
        createBackup();

        // 最終バックアップ日時を保存
        localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());

        return true;
    } catch (error) {
        console.error('[自動バックアップ] エラー:', error);
        return false;
    }
};

/**
 * 自動バックアップの状態を取得
 */
export const getAutoBackupStatus = () => {
    const enabled = isAutoBackupEnabled();
    const lastBackup = getLastBackupTimestamp();
    const shouldBackup = shouldCreateBackup();

    return {
        enabled,
        lastBackup,
        shouldBackup,
        nextBackupDate: lastBackup
            ? new Date(lastBackup.getTime() + BACKUP_INTERVAL_DAYS * 24 * 60 * 60 * 1000)
            : new Date(),
        intervalDays: BACKUP_INTERVAL_DAYS
    };
};

