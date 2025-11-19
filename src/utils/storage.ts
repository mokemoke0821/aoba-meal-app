import { saveAs } from 'file-saver';
import { MealRecord, MenuItem, User, UserCategory, BackupConfig } from '../types';

// LocalStorageのキー定義
const STORAGE_KEYS = {
    USERS: 'aoba-meal-users',
    MEAL_RECORDS: 'aoba-meal-records',
    CURRENT_MENU: 'aoba-current-menu',
    BACKUP_CONFIG: 'aoba-backup-config',
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
    const headers = ['日付', '利用者名', 'グループ', '料金', '食べた量', 'メニュー名', '支援記録'];
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

/**
 * JSONバックアップファイルからデータを復元
 * @param file - アップロードされたJSONファイル
 * @returns Promise<void>
 * @throws Error - ファイル読み込み失敗、無効なフォーマット時
 */
export const importBackup = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const backupData = JSON.parse(content);

                // バリデーション
                if (!backupData.users || !Array.isArray(backupData.users)) {
                    throw new Error('無効なバックアップファイル: usersデータが見つかりません');
                }
                if (!backupData.mealRecords || !Array.isArray(backupData.mealRecords)) {
                    throw new Error('無効なバックアップファイル: mealRecordsデータが見つかりません');
                }

                // データ復元
                saveUsers(backupData.users);
                saveMealRecords(backupData.mealRecords);

                if (backupData.currentMenu) {
                    saveCurrentMenu(backupData.currentMenu);
                }

                resolve();
            } catch (error) {
                console.error('データ復元エラー:', error);
                if (error instanceof SyntaxError) {
                    reject(new Error('JSONファイルの形式が正しくありません'));
                } else {
                    reject(error);
                }
            }
        };

        reader.onerror = () => {
            console.error('ファイル読み込みエラー');
            reject(new Error('ファイルの読み込みに失敗しました'));
        };

        reader.readAsText(file);
    });
};

/**
 * 料金からユーザーカテゴリを判定
 * @param price - 料金
 * @returns UserCategory
 */
const determineCategory = (price: number): UserCategory => {
    if (price === 100) return 'A型';
    if (price === 0) return 'B型';
    if (price === 400) return '職員';
    return '体験者';
};

/**
 * CSVファイルからユーザーデータをインポート
 * @param file - アップロードされたCSVファイル
 * @returns Promise<User[]> - インポートされたユーザーリスト
 * @throws Error - ファイル読み込み失敗、無効なフォーマット時
 */
export const importUsersFromCSV = (file: File): Promise<User[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const lines = content.split('\n');

                if (lines.length < 2) {
                    throw new Error('CSVファイルが空です');
                }

                // ヘッダー行を確認
                const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

                const users: User[] = [];

                // データ行を処理（ヘッダー行をスキップ）
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;

                    const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));

                    if (columns.length < 5) {
                        continue;
                    }

                    // CSVフォーマット: 利用者名, グループ, 料金, 登録日, 状態
                    const price = parseInt(columns[2]) || 0;
                    const category = determineCategory(price);

                    const user: User = {
                        id: `user-${Date.now()}-${i}`,
                        name: columns[0],
                        group: columns[1] as any, // グループ型は既存の型に従う
                        category: category,
                        displayNumber: i,
                        price: price,
                        createdAt: columns[3] || new Date().toISOString(),
                        isActive: columns[4] === '有効',
                        trialUser: category === '体験者'
                    };

                    users.push(user);
                }

                if (users.length === 0) {
                    throw new Error('有効なユーザーデータが見つかりませんでした');
                }

                resolve(users);
            } catch (error) {
                console.error('CSVインポートエラー:', error);
                reject(error);
            }
        };

        reader.onerror = () => {
            console.error('CSVファイル読み込みエラー');
            reject(new Error('CSVファイルの読み込みに失敗しました'));
        };

        reader.readAsText(file);
    });
};

// =====================================
// バックアップ設定関連（新追加）
// =====================================

// デフォルトバックアップ設定
const DEFAULT_BACKUP_CONFIG: BackupConfig = {
    enabled: true,
    frequency: 10 * 60 * 1000, // 10分（ミリ秒）
    customPath: null,
    keepLast: 10,
    lastBackupTime: null,
};

/**
 * バックアップ設定の保存
 * @param config バックアップ設定
 */
export const saveBackupConfig = (config: BackupConfig): void => {
    try {
        localStorage.setItem(STORAGE_KEYS.BACKUP_CONFIG, JSON.stringify(config));
    } catch (error) {
        console.error('[バックアップ設定] 保存失敗:', error);
        throw new Error('バックアップ設定の保存に失敗しました');
    }
};

/**
 * バックアップ設定の読み込み
 * @returns バックアップ設定
 */
export const loadBackupConfig = (): BackupConfig => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.BACKUP_CONFIG);
        if (stored) {
            const config = JSON.parse(stored);
            return config;
        }
    } catch (error) {
        console.error('[バックアップ設定] 読み込み失敗:', error);
    }
    return DEFAULT_BACKUP_CONFIG;
};

/**
 * バックアップファイル名生成（日時付き）
 * @returns ファイル名（例: あおば給食データバックアップ_2025-11-05_14-30-00.json）
 */
export const generateBackupFilename = (): string => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    return `あおば給食データバックアップ_${dateStr}_${timeStr}.json`;
};

/**
 * カスタムパスへのバックアップ保存
 * @param customPath カスタムパス（未使用、将来拡張用）
 * @returns 保存されたファイル名
 */
export const saveBackupToCustomPath = async (
    customPath: string | null
): Promise<string> => {
    try {
        // バックアップデータを作成
        const backupData = {
            users: loadUsers(),
            mealRecords: loadMealRecords(),
            currentMenu: loadCurrentMenu(),
            timestamp: new Date().toISOString(),
        };
        
        // ファイル名生成
        const filename = generateBackupFilename();
        
        // Blob作成
        const blob = new Blob([JSON.stringify(backupData, null, 2)], {
            type: 'application/json',
        });
        
        // ファイル保存（file-saver使用）
        saveAs(blob, filename);
        
        // 最終バックアップ時刻を更新
        const config = loadBackupConfig();
        config.lastBackupTime = new Date().toISOString();
        saveBackupConfig(config);
        
        return filename;
    } catch (error) {
        console.error('[バックアップ] 作成失敗:', error);
        throw error;
    }
}; 