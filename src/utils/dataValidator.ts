import { Group, MealRecord, User } from '../types';

// バリデーション結果の型定義
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

// 文字列バリデーションのオプション
export interface StringValidationOptions {
    allowEmpty?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: RegExp;
}

// 数値バリデーションのオプション
export interface NumberValidationOptions {
    min?: number;
    max?: number;
    allowZero?: boolean;
    allowNegative?: boolean;
    isInteger?: boolean;
}

// 日付バリデーションのオプション
export interface DateValidationOptions {
    allowPast?: boolean;
    allowFuture?: boolean;
    minDate?: Date;
    maxDate?: Date;
}

// 文字列バリデーション
export const validateString = (
    value: any,
    fieldName: string,
    options: StringValidationOptions = {}
): ValidationResult => {
    const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
    };

    const {
        allowEmpty = false,
        maxLength,
        minLength,
        pattern
    } = options;

    // null/undefined チェック
    if (value === null || value === undefined) {
        result.isValid = false;
        result.errors.push(`${fieldName}は必須項目です`);
        return result;
    }

    // 型チェック
    if (typeof value !== 'string') {
        result.isValid = false;
        result.errors.push(`${fieldName}は文字列である必要があります`);
        return result;
    }

    // 空文字列チェック
    if (value === '' && !allowEmpty) {
        result.isValid = false;
        result.errors.push(`${fieldName}は空にできません`);
        return result;
    }

    // 長さチェック
    if (maxLength && value.length > maxLength) {
        result.isValid = false;
        result.errors.push(`${fieldName}は${maxLength}文字以内で入力してください`);
    }

    if (minLength && value.length < minLength) {
        result.isValid = false;
        result.errors.push(`${fieldName}は${minLength}文字以上で入力してください`);
    }

    // パターンチェック
    if (pattern && !pattern.test(value)) {
        result.isValid = false;
        result.errors.push(`${fieldName}の形式が正しくありません`);
    }

    // XSS攻撃パターンチェック
    const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi
    ];

    if (xssPatterns.some(pattern => pattern.test(value))) {
        result.isValid = false;
        result.errors.push(`${fieldName}に危険な文字列が含まれています`);
    }

    // 制御文字チェック
    // eslint-disable-next-line no-control-regex
    if (/[\x00-\x1f\x7f]/.test(value)) {
        result.warnings.push(`${fieldName}に制御文字が含まれています`);
    }

    return result;
};

// 数値バリデーション
export const validateNumber = (
    value: any,
    fieldName: string,
    options: NumberValidationOptions = {}
): ValidationResult => {
    const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
    };

    const {
        min,
        max,
        allowZero = true,
        allowNegative = true,
        isInteger = false
    } = options;

    // 文字列から数値に変換を試行
    let numValue: number;
    if (typeof value === 'string') {
        numValue = Number(value);
    } else if (typeof value === 'number') {
        numValue = value;
    } else {
        result.isValid = false;
        result.errors.push(`${fieldName}は数値である必要があります`);
        return result;
    }

    // NaN/Infinity チェック
    if (isNaN(numValue) || !isFinite(numValue)) {
        result.isValid = false;
        result.errors.push(`${fieldName}は有効な数値である必要があります`);
        return result;
    }

    // ゼロチェック
    if (numValue === 0 && !allowZero) {
        result.isValid = false;
        result.errors.push(`${fieldName}は0にできません`);
    }

    // 負数チェック
    if (numValue < 0 && !allowNegative) {
        result.isValid = false;
        result.errors.push(`${fieldName}は正の数である必要があります`);
    }

    // 整数チェック
    if (isInteger && !Number.isInteger(numValue)) {
        result.isValid = false;
        result.errors.push(`${fieldName}は整数である必要があります`);
    }

    // 範囲チェック
    if (min !== undefined && numValue < min) {
        result.isValid = false;
        result.errors.push(`${fieldName}は${min}以上である必要があります`);
    }

    if (max !== undefined && numValue > max) {
        result.isValid = false;
        result.errors.push(`${fieldName}は${max}以下である必要があります`);
    }

    return result;
};

// 日付バリデーション
export const validateDate = (
    value: any,
    fieldName: string,
    options: DateValidationOptions = {}
): ValidationResult => {
    const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
    };

    const {
        allowPast = true,
        allowFuture = true,
        minDate,
        maxDate
    } = options;

    let dateValue: Date;

    // 日付オブジェクトまたは文字列から Date を作成
    if (value instanceof Date) {
        dateValue = value;
    } else if (typeof value === 'string') {
        dateValue = new Date(value);
    } else {
        result.isValid = false;
        result.errors.push(`${fieldName}は日付である必要があります`);
        return result;
    }

    // 無効な日付チェック
    if (isNaN(dateValue.getTime())) {
        result.isValid = false;
        result.errors.push(`${fieldName}は有効な日付である必要があります`);
        return result;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inputDate = new Date(dateValue);
    inputDate.setHours(0, 0, 0, 0);

    // 過去日チェック
    if (!allowPast && inputDate < today) {
        result.isValid = false;
        result.errors.push(`${fieldName}は今日以降の日付を選択してください`);
    }

    // 未来日チェック
    if (!allowFuture && inputDate > today) {
        result.isValid = false;
        result.errors.push(`${fieldName}は今日以前の日付を選択してください`);
    }

    // 日付範囲チェック
    if (minDate && dateValue < minDate) {
        result.isValid = false;
        result.errors.push(`${fieldName}は${minDate.toLocaleDateString()}以降の日付を選択してください`);
    }

    if (maxDate && dateValue > maxDate) {
        result.isValid = false;
        result.errors.push(`${fieldName}は${maxDate.toLocaleDateString()}以前の日付を選択してください`);
    }

    // 極端な年の警告
    const currentYear = new Date().getFullYear();
    const inputYear = dateValue.getFullYear();
    if (Math.abs(inputYear - currentYear) > 100) {
        result.warnings.push(`${fieldName}の年が現在から大きく離れています（${inputYear}年）`);
    }

    return result;
};

// 日付範囲バリデーション
export const validateDateRange = (
    startDate: any,
    endDate: any,
    fieldName: string
): ValidationResult => {
    const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
    };

    const startResult = validateDate(startDate, `${fieldName}の開始日`);
    const endResult = validateDate(endDate, `${fieldName}の終了日`);

    // 個別の日付バリデーション結果をマージ
    result.errors.push(...startResult.errors, ...endResult.errors);
    result.warnings.push(...startResult.warnings, ...endResult.warnings);

    if (!startResult.isValid || !endResult.isValid) {
        result.isValid = false;
        return result;
    }

    // 開始日と終了日の順序チェック
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
        result.isValid = false;
        result.errors.push(`${fieldName}の開始日は終了日より前である必要があります`);
    }

    return result;
};

// グループバリデーション
export const validateGroup = (value: any, fieldName: string): ValidationResult => {
    const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
    };

    const validGroups: Group[] = ['グループA', 'グループB', 'グループC', 'その他'];

    if (!validGroups.includes(value)) {
        result.isValid = false;
        result.errors.push(`${fieldName}は有効なグループを選択してください`);
    }

    return result;
};

// 配列バリデーション
export const validateArray = (
    value: any,
    fieldName: string,
    options: { minLength?: number; maxLength?: number } = {}
): ValidationResult => {
    const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
    };

    const { minLength, maxLength } = options;

    if (!Array.isArray(value)) {
        result.isValid = false;
        result.errors.push(`${fieldName}は配列である必要があります`);
        return result;
    }

    if (minLength !== undefined && value.length < minLength) {
        result.isValid = false;
        result.errors.push(`${fieldName}は最低${minLength}個の要素が必要です`);
    }

    if (maxLength !== undefined && value.length > maxLength) {
        result.isValid = false;
        result.errors.push(`${fieldName}は最大${maxLength}個の要素までです`);
    }

    return result;
};

// 重複チェック
export const checkDuplicates = <T>(
    array: T[],
    getKey: (item: T) => string,
    fieldName: string
): ValidationResult => {
    const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
    };

    const keys = array.map(getKey);
    const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);

    if (duplicates.length > 0) {
        result.isValid = false;
        result.errors.push(`${fieldName}に重複があります: ${duplicates.join(', ')}`);
    }

    return result;
};

// ユーザーバリデーション
export const validateUser = (user: any): ValidationResult => {
    const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
    };

    // 名前バリデーション
    const nameResult = validateString(user.name, '利用者名', { maxLength: 50 });
    result.errors.push(...nameResult.errors);
    result.warnings.push(...nameResult.warnings);

    // グループバリデーション
    const groupResult = validateGroup(user.group, 'グループ');
    result.errors.push(...groupResult.errors);
    result.warnings.push(...groupResult.warnings);

    // 表示番号バリデーション
    const displayNumberResult = validateNumber(user.displayNumber, '表示番号', {
        min: 1,
        isInteger: true
    });
    result.errors.push(...displayNumberResult.errors);
    result.warnings.push(...displayNumberResult.warnings);

    // 料金バリデーション
    const priceResult = validateNumber(user.price, '料金', {
        min: 0,
        allowZero: true
    });
    result.errors.push(...priceResult.errors);
    result.warnings.push(...priceResult.warnings);

    result.isValid = result.errors.length === 0;
    return result;
};

// 給食記録バリデーション
export const validateMealRecord = (record: any): ValidationResult => {
    const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
    };

    // 日付バリデーション
    const dateResult = validateDate(record.date, '日付');
    result.errors.push(...dateResult.errors);
    result.warnings.push(...dateResult.warnings);

    // 評価バリデーション
    const ratingResult = validateNumber(record.rating, '評価', {
        min: 1,
        max: 10,
        isInteger: true
    });
    result.errors.push(...ratingResult.errors);
    result.warnings.push(...ratingResult.warnings);

    // 料金バリデーション
    const priceResult = validateNumber(record.price, '料金', {
        min: 0,
        allowZero: true
    });
    result.errors.push(...priceResult.errors);
    result.warnings.push(...priceResult.warnings);

    // ユーザー名バリデーション
    const userNameResult = validateString(record.userName, '利用者名');
    result.errors.push(...userNameResult.errors);
    result.warnings.push(...userNameResult.warnings);

    result.isValid = result.errors.length === 0;
    return result;
};

// データ整合性チェック
export const validateDataIntegrity = (
    users: User[],
    mealRecords: MealRecord[]
): ValidationResult => {
    const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
    };

    // ユーザーID重複チェック
    const userIdDuplicates = checkDuplicates(users, user => user.id, 'ユーザーID');
    result.errors.push(...userIdDuplicates.errors);

    // 表示番号重複チェック
    const displayNumberDuplicates = checkDuplicates(
        users,
        user => user.displayNumber.toString(),
        '表示番号'
    );
    result.errors.push(...displayNumberDuplicates.errors);

    // 給食記録の孤児チェック
    const userIds = new Set(users.map(user => user.id));
    const orphanRecords = mealRecords.filter(record => !userIds.has(record.userId));

    if (orphanRecords.length > 0) {
        result.warnings.push(`存在しないユーザーの給食記録が${orphanRecords.length}件あります`);
    }

    // 日付の整合性チェック
    const invalidDateRecords = mealRecords.filter(record => {
        const dateResult = validateDate(record.date, '給食記録の日付');
        return !dateResult.isValid;
    });

    if (invalidDateRecords.length > 0) {
        result.errors.push(`無効な日付の給食記録が${invalidDateRecords.length}件あります`);
    }

    result.isValid = result.errors.length === 0;
    return result;
};

// ヘルパー関数：testHelpersとの互換性のため
export const createMockUser = (overrides: Partial<User> = {}): User => {
    return {
        id: 'mock-user-id',
        name: 'テストユーザー',
        group: 'グループA',
        category: 'A型',
        displayNumber: 1,
        price: 100,
        createdAt: new Date().toISOString(),
        isActive: true,
        trialUser: false,
        ...overrides
    };
};

export const createMockMealRecord = (overrides: Partial<MealRecord> = {}): MealRecord => {
    return {
        id: 'mock-meal-record-id',
        userId: 'mock-user-id',
        userName: 'テストユーザー',
        userGroup: 'グループA',
        userCategory: 'A型',
        date: new Date().toISOString().split('T')[0],
        rating: 7,
        price: 100,
        menuName: 'テストメニュー',
        notes: 'テスト記録',
        ...overrides
    };
};

export const mockUsers: User[] = [
    createMockUser({ id: '1', name: '田中太郎', displayNumber: 1 }),
    createMockUser({ id: '2', name: '佐藤花子', displayNumber: 2, category: 'B型', price: 0 }),
    createMockUser({ id: '3', name: '山田次郎', displayNumber: 3, category: '職員', price: 400 }),
    createMockUser({ id: '4', name: '鈴木美咲', displayNumber: 4, category: '体験者', price: 400 })
];

export const mockMealRecords: MealRecord[] = [
    createMockMealRecord({ id: '1', userId: '1' }),
    createMockMealRecord({ id: '2', userId: '2' }),
    createMockMealRecord({ id: '3', userId: '3' }),
    createMockMealRecord({ id: '4', userId: '4' })
];

