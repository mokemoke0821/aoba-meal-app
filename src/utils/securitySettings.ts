/**
 * セキュリティ設定管理ユーティリティ
 */

const SECURITY_SETTINGS_KEY = 'aoba-security-settings';

export interface SecuritySettings {
    passcodeEnabled: boolean;
    passcode: string | null; // 4桁の数字文字列
}

const DEFAULT_SETTINGS: SecuritySettings = {
    passcodeEnabled: false,
    passcode: null
};

/**
 * セキュリティ設定を読み込む
 */
export const loadSecuritySettings = (): SecuritySettings => {
    try {
        const stored = localStorage.getItem(SECURITY_SETTINGS_KEY);
        if (stored) {
            const settings = JSON.parse(stored) as SecuritySettings;
            return {
                passcodeEnabled: settings.passcodeEnabled || false,
                passcode: settings.passcode || null
            };
        }
    } catch (error) {
        console.error('セキュリティ設定の読み込みに失敗しました:', error);
    }
    return DEFAULT_SETTINGS;
};

/**
 * セキュリティ設定を保存する
 */
export const saveSecuritySettings = (settings: SecuritySettings): void => {
    try {
        localStorage.setItem(SECURITY_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error('セキュリティ設定の保存に失敗しました:', error);
        throw new Error('セキュリティ設定の保存に失敗しました');
    }
};

/**
 * パスコードが有効かどうかを確認
 */
export const isPasscodeEnabled = (): boolean => {
    const settings = loadSecuritySettings();
    return settings.passcodeEnabled && settings.passcode !== null;
};

/**
 * パスコードを検証
 */
export const validatePasscode = (input: string): boolean => {
    const settings = loadSecuritySettings();
    if (!settings.passcodeEnabled || !settings.passcode) {
        return false;
    }
    return input === settings.passcode;
};

/**
 * パスコードが有効な形式かどうかを確認（4桁の数字）
 */
export const isValidPasscodeFormat = (passcode: string): boolean => {
    return /^\d{4}$/.test(passcode);
};

