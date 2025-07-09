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

    // 両方nullの場合は有効とする
    if (startDate === null && endDate === null) {
        return result;
    }

    // 片方だけnullの場合はエラー
    if ((startDate === null && endDate !== null) || (startDate !== null && endDate === null)) {
        result.isValid = false;
        result.errors.push(`${fieldName}の開始日と終了日は両方指定するか、両方未指定にしてください`);
        return result;
    }

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
        return result;
    }

    // 同一日付警告
    if (start.getTime() === end.getTime()) {
        result.warnings.push(`開始日と終了日が同じです`);
    }

    // 長期間警告（365日以上）
    const daysDiff = Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff >= 365) {
        result.warnings.push(`長期間（${Math.floor(daysDiff)}日）の期間が選択されています`);
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

    const seen = new Set<string>();
    const duplicateKeys = new Set<string>();

    array.forEach(item => {
        const key = getKey(item);
        if (seen.has(key)) {
            duplicateKeys.add(key);
        } else {
            seen.add(key);
        }
    });

    if (duplicateKeys.size > 0) {
        result.isValid = false;
        duplicateKeys.forEach(key => {
            result.errors.push(`${fieldName}に重複した値「${key}」があります`);
        });
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

    // ユーザーIDバリデーション
    const userIdResult = validateString(record.userId, '利用者ID');
    result.errors.push(...userIdResult.errors);
    result.warnings.push(...userIdResult.warnings);

    // 日付バリデーション
    const dateResult = validateDate(record.date, '日付');
    result.errors.push(...dateResult.errors);
    result.warnings.push(...dateResult.warnings);

    // 食べた量バリデーション
    const eatingRatioResult = validateNumber(record.eatingRatio, '食べた量', {
        min: 1,
        max: 10,
        isInteger: true
    });
    result.errors.push(...eatingRatioResult.errors);
    result.warnings.push(...eatingRatioResult.warnings);

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

    // ユーザーIDマップを作成
    const userMap = new Map<string, User>();
    users.forEach(user => {
        userMap.set(user.id, user);
    });

    // 各給食記録をチェック
    mealRecords.forEach(record => {
        // 存在しないユーザーIDの参照をチェック
        const user = userMap.get(record.userId);
        if (!user) {
            result.isValid = false;
            result.errors.push(`存在しない利用者ID「${record.userId}」が参照されています`);
            return;
        }

        // 利用者名の不一致をチェック
        if (user.name !== record.userName) {
            result.warnings.push(`利用者ID「${record.userId}」の利用者名が一致しません（期待: ${user.name}, 実際: ${record.userName}）`);
        }

        // 非アクティブユーザーの最近の記録をチェック
        if (!user.isActive) {
            const recordDate = new Date(record.date);
            const today = new Date();
            const daysDiff = Math.abs(today.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24);

            // 7日以内の記録を「最近」とする
            if (daysDiff <= 7) {
                result.warnings.push(`非アクティブな利用者「${user.name}」の最近の記録があります（${record.date}）`);
            }
        }
    });

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
        eatingRatio: 7,
        price: 100,
        menuName: 'テストメニュー',
        supportNotes: 'テスト記録',
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

// セキュリティ強化: XSS対策とデータサニタイゼーション
export const sanitizeInput = (input: string): string => {
    if (typeof input !== 'string') {
        throw new Error('入力は文字列である必要があります');
    }

    // HTMLタグとスクリプトの除去
    const sanitized = input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();

    return sanitized;
};

export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\d{10,11}$/;
    return phoneRegex.test(phone.replace(/[-\s]/g, ''));
};

// CSRFトークン生成（基本実装）
export const generateCSRFToken = (): string => {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
};

// パスワード強度チェック
export const validatePasswordStrength = (password: string): ValidationResult => {
    const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
    };

    if (password.length < 8) {
        result.isValid = false;
        result.errors.push('パスワードは8文字以上である必要があります');
    }

    if (!/[A-Za-z]/.test(password)) {
        result.warnings.push('英字を含めることを推奨します');
    }

    if (!/[0-9]/.test(password)) {
        result.warnings.push('数字を含めることを推奨します');
    }

    return result;
};

