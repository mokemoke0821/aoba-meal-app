import { Group, MealRecord, User } from '../types';

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export interface ValidationOptions {
    strict?: boolean;
    allowEmpty?: boolean;
    maxLength?: number;
}

/**
 * 基本的な文字列検証
 */
export const validateString = (
    value: any,
    fieldName: string,
    options: ValidationOptions = {}
): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // null/undefined チェック
    if (value === null || value === undefined) {
        if (!options.allowEmpty) {
            errors.push(`${fieldName}は必須項目です`);
        }
        return { isValid: errors.length === 0, errors, warnings };
    }

    // 型チェック
    if (typeof value !== 'string') {
        errors.push(`${fieldName}は文字列である必要があります`);
        return { isValid: false, errors, warnings };
    }

    // 空文字チェック
    if (value.trim() === '' && !options.allowEmpty) {
        errors.push(`${fieldName}は空にできません`);
    }

    // 長さチェック
    if (options.maxLength && value.length > options.maxLength) {
        errors.push(`${fieldName}は${options.maxLength}文字以内で入力してください`);
    }

    // XSSリスクのチェック
    if (/<script|javascript:|on\w+=/i.test(value)) {
        errors.push(`${fieldName}に危険な文字列が含まれています`);
    }

    // 制御文字のチェック
    if (/[\u0000-\u001f\u007f-\u009f]/.test(value)) {
        warnings.push(`${fieldName}に制御文字が含まれています`);
    }

    return { isValid: errors.length === 0, errors, warnings };
};

/**
 * 数値検証
 */
export const validateNumber = (
    value: any,
    fieldName: string,
    options: { min?: number; max?: number; allowZero?: boolean } = {}
): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // null/undefined チェック
    if (value === null || value === undefined) {
        errors.push(`${fieldName}は必須項目です`);
        return { isValid: false, errors, warnings };
    }

    // 型・数値チェック
    const numValue = Number(value);
    if (isNaN(numValue) || !isFinite(numValue)) {
        errors.push(`${fieldName}は有効な数値である必要があります`);
        return { isValid: false, errors, warnings };
    }

    // ゼロチェック
    if (numValue === 0 && options.allowZero === false) {
        errors.push(`${fieldName}は0にできません`);
    }

    // 範囲チェック
    if (options.min !== undefined && numValue < options.min) {
        errors.push(`${fieldName}は${options.min}以上である必要があります`);
    }

    if (options.max !== undefined && numValue > options.max) {
        errors.push(`${fieldName}は${options.max}以下である必要があります`);
    }

    return { isValid: errors.length === 0, errors, warnings };
};

/**
 * 日付検証
 */
export const validateDate = (
    value: any,
    fieldName: string,
    options: { allowPast?: boolean; allowFuture?: boolean } = {}
): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // null/undefined チェック
    if (value === null || value === undefined) {
        errors.push(`${fieldName}は必須項目です`);
        return { isValid: false, errors, warnings };
    }

    // Date型または文字列からの日付生成
    let dateValue: Date;
    if (value instanceof Date) {
        dateValue = value;
    } else if (typeof value === 'string') {
        dateValue = new Date(value);
    } else {
        errors.push(`${fieldName}は有効な日付である必要があります`);
        return { isValid: false, errors, warnings };
    }

    // 有効な日付かチェック
    if (isNaN(dateValue.getTime())) {
        errors.push(`${fieldName}は有効な日付である必要があります`);
        return { isValid: false, errors, warnings };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const inputDate = new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate());

    // 過去日チェック
    if (options.allowPast === false && inputDate < today) {
        errors.push(`${fieldName}は今日以降の日付を選択してください`);
    }

    // 未来日チェック
    if (options.allowFuture === false && inputDate > today) {
        errors.push(`${fieldName}は今日以前の日付を選択してください`);
    }

    // 極端な日付の警告
    const yearDiff = Math.abs(dateValue.getFullYear() - now.getFullYear());
    if (yearDiff > 100) {
        warnings.push(`${fieldName}の年が現在から${yearDiff}年離れています`);
    }

    return { isValid: errors.length === 0, errors, warnings };
};

/**
 * グループ検証
 */
export const validateGroup = (
    value: any,
    fieldName: string = 'グループ'
): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (value === null || value === undefined) {
        errors.push(`${fieldName}は必須項目です`);
        return { isValid: false, errors, warnings };
    }

    const validGroups: Group[] = ['グループA', 'グループB', 'グループC', 'グループD'];
    if (!validGroups.includes(value)) {
        errors.push(`${fieldName}は有効なグループ（${validGroups.join(', ')}）である必要があります`);
    }

    return { isValid: errors.length === 0, errors, warnings };
};

/**
 * 利用者データ検証
 */
export const validateUser = (user: Partial<User>): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 名前検証
    const nameResult = validateString(user.name, '利用者名', { maxLength: 50 });
    errors.push(...nameResult.errors);
    warnings.push(...nameResult.warnings);

    // グループ検証
    const groupResult = validateGroup(user.group);
    errors.push(...groupResult.errors);
    warnings.push(...groupResult.warnings);

    // 料金検証
    const priceResult = validateNumber(user.price, '料金', { min: 0, max: 10000 });
    errors.push(...priceResult.errors);
    warnings.push(...priceResult.warnings);

    // 作成日検証
    if (user.createdAt) {
        const createdAtResult = validateDate(user.createdAt, '作成日', { allowFuture: false });
        errors.push(...createdAtResult.errors);
        warnings.push(...createdAtResult.warnings);
    }

    // ID検証（更新時）
    if (user.id) {
        const idResult = validateString(user.id, 'ID', { maxLength: 100 });
        errors.push(...idResult.errors);
        warnings.push(...idResult.warnings);
    }

    // ノート検証（オプション）
    if (user.notes) {
        const notesResult = validateString(user.notes, 'ノート', { maxLength: 500, allowEmpty: true });
        errors.push(...notesResult.errors);
        warnings.push(...notesResult.warnings);
    }

    // 試用ユーザーフラグ検証
    if (user.trialUser !== undefined && typeof user.trialUser !== 'boolean') {
        errors.push('試用ユーザーフラグはboolean型である必要があります');
    }

    // アクティブフラグ検証
    if (user.isActive !== undefined && typeof user.isActive !== 'boolean') {
        errors.push('アクティブフラグはboolean型である必要があります');
    }

    return { isValid: errors.length === 0, errors, warnings };
};

/**
 * 給食記録データ検証
 */
export const validateMealRecord = (record: Partial<MealRecord>): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 利用者ID検証
    const userIdResult = validateString(record.userId, '利用者ID', { maxLength: 100 });
    errors.push(...userIdResult.errors);
    warnings.push(...userIdResult.warnings);

    // 利用者名検証
    const userNameResult = validateString(record.userName, '利用者名', { maxLength: 50 });
    errors.push(...userNameResult.errors);
    warnings.push(...userNameResult.warnings);

    // 利用者グループ検証
    const userGroupResult = validateString(record.userGroup, '利用者グループ', { maxLength: 20 });
    errors.push(...userGroupResult.errors);
    warnings.push(...userGroupResult.warnings);

    // 日付検証
    const dateResult = validateDate(record.date, '日付');
    errors.push(...dateResult.errors);
    warnings.push(...dateResult.warnings);

    // 評価検証
    const ratingResult = validateNumber(record.rating, '評価', { min: 0, max: 10, allowZero: true });
    errors.push(...ratingResult.errors);
    warnings.push(...ratingResult.warnings);

    // 料金検証
    const priceResult = validateNumber(record.price, '料金', { min: 0, max: 10000 });
    errors.push(...priceResult.errors);
    warnings.push(...priceResult.warnings);

    // ID検証（更新時）
    if (record.id) {
        const idResult = validateString(record.id, 'ID', { maxLength: 100 });
        errors.push(...idResult.errors);
        warnings.push(...idResult.warnings);
    }

    // メニュー名検証（オプション）
    if (record.menuName) {
        const menuNameResult = validateString(record.menuName, 'メニュー名', { maxLength: 100, allowEmpty: true });
        errors.push(...menuNameResult.errors);
        warnings.push(...menuNameResult.warnings);
    }

    // ノート検証（オプション）
    if (record.notes) {
        const notesResult = validateString(record.notes, 'ノート', { maxLength: 500, allowEmpty: true });
        errors.push(...notesResult.errors);
        warnings.push(...notesResult.warnings);
    }

    return { isValid: errors.length === 0, errors, warnings };
};

/**
 * 日付範囲検証
 */
export const validateDateRange = (
    startDate: Date | null,
    endDate: Date | null,
    fieldName: string = '日付範囲'
): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 両方nullの場合は有効
    if (startDate === null && endDate === null) {
        return { isValid: true, errors, warnings };
    }

    // 片方だけnullの場合
    if (startDate === null && endDate !== null) {
        errors.push(`${fieldName}の開始日が設定されていません`);
        return { isValid: false, errors, warnings };
    }

    if (startDate !== null && endDate === null) {
        errors.push(`${fieldName}の終了日が設定されていません`);
        return { isValid: false, errors, warnings };
    }

    // 両方設定されている場合
    if (startDate && endDate) {
        // 開始日検証
        const startResult = validateDate(startDate, '開始日');
        errors.push(...startResult.errors);
        warnings.push(...startResult.warnings);

        // 終了日検証
        const endResult = validateDate(endDate, '終了日');
        errors.push(...endResult.errors);
        warnings.push(...endResult.warnings);

        // 日付の順序チェック
        if (startDate > endDate) {
            errors.push('開始日は終了日より前の日付を選択してください');
        }

        // 期間の長さチェック
        const daysDiff = Math.abs((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff > 365) {
            warnings.push(`選択期間が${Math.round(daysDiff)}日と長期間です`);
        }

        if (daysDiff === 0) {
            warnings.push('開始日と終了日が同じです');
        }
    }

    return { isValid: errors.length === 0, errors, warnings };
};

/**
 * 配列データの検証
 */
export const validateArray = <T>(
    array: any,
    fieldName: string,
    itemValidator: (item: T, index: number) => ValidationResult,
    options: { minLength?: number; maxLength?: number } = {}
): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 配列型チェック
    if (!Array.isArray(array)) {
        errors.push(`${fieldName}は配列である必要があります`);
        return { isValid: false, errors, warnings };
    }

    // 長さチェック
    if (options.minLength !== undefined && array.length < options.minLength) {
        errors.push(`${fieldName}は最低${options.minLength}件必要です`);
    }

    if (options.maxLength !== undefined && array.length > options.maxLength) {
        errors.push(`${fieldName}は最大${options.maxLength}件までです`);
    }

    // 各項目の検証
    array.forEach((item, index) => {
        const itemResult = itemValidator(item, index);
        const itemErrors = itemResult.errors.map(err => `${fieldName}[${index}]: ${err}`);
        const itemWarnings = itemResult.warnings.map(warn => `${fieldName}[${index}]: ${warn}`);

        errors.push(...itemErrors);
        warnings.push(...itemWarnings);
    });

    return { isValid: errors.length === 0, errors, warnings };
};

/**
 * 重複チェック
 */
export const checkDuplicates = <T>(
    array: T[],
    keyExtractor: (item: T) => string,
    fieldName: string
): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const seen = new Set<string>();
    const duplicates = new Set<string>();

    array.forEach((item, index) => {
        const key = keyExtractor(item);
        if (seen.has(key)) {
            duplicates.add(key);
            errors.push(`${fieldName}[${index}]: 重複した値「${key}」があります`);
        } else {
            seen.add(key);
        }
    });

    return { isValid: errors.length === 0, errors, warnings };
};

/**
 * 全体的なデータ整合性チェック
 */
export const validateDataIntegrity = (
    users: User[],
    mealRecords: MealRecord[]
): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // ユーザーIDの整合性チェック
    const userIds = new Set(users.map(u => u.id));
    mealRecords.forEach((record, index) => {
        if (!userIds.has(record.userId)) {
            errors.push(`給食記録[${index}]: 存在しない利用者ID「${record.userId}」が参照されています`);
        }
    });

    // ユーザー名の整合性チェック
    const userMap = new Map(users.map(u => [u.id, u.name]));
    mealRecords.forEach((record, index) => {
        const expectedName = userMap.get(record.userId);
        if (expectedName && record.userName !== expectedName) {
            warnings.push(`給食記録[${index}]: 利用者名が一致しません（記録: ${record.userName}, マスター: ${expectedName}）`);
        }
    });

    // 非アクティブユーザーの記録チェック
    const activeUserIds = new Set(users.filter(u => u.isActive !== false).map(u => u.id));
    const recentRecords = mealRecords.filter(r => {
        const recordDate = new Date(r.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return recordDate >= thirtyDaysAgo;
    });

    recentRecords.forEach((record, index) => {
        if (!activeUserIds.has(record.userId)) {
            warnings.push(`最近の給食記録[${index}]: 非アクティブな利用者「${record.userName}」の記録があります`);
        }
    });

    return { isValid: errors.length === 0, errors, warnings };
}; 