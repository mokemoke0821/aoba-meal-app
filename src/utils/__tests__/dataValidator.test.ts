import {
    checkDuplicates,
    validateArray,
    validateDataIntegrity,
    validateDate,
    validateDateRange,
    validateGroup,
    validateMealRecord,
    validateNumber,
    validateString,
    validateUser,
} from '../dataValidator';
import {
    createMockMealRecord,
    createMockUser,
    mockMealRecords,
    mockUsers
} from '../testHelpers';

describe('データ検証機能', () => {
    describe('validateString', () => {
        it('正常な文字列を受け入れる', () => {
            const result = validateString('テスト文字列', 'テストフィールド');

            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
            expect(result.warnings).toEqual([]);
        });

        it('空文字列を拒否する（allowEmpty: false）', () => {
            const result = validateString('', 'テストフィールド');

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('テストフィールドは空にできません');
        });

        it('空文字列を許可する（allowEmpty: true）', () => {
            const result = validateString('', 'テストフィールド', { allowEmpty: true });

            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('null/undefinedを適切に処理する', () => {
            const nullResult = validateString(null, 'テストフィールド');
            const undefinedResult = validateString(undefined, 'テストフィールド');

            expect(nullResult.isValid).toBe(false);
            expect(nullResult.errors).toContain('テストフィールドは必須項目です');

            expect(undefinedResult.isValid).toBe(false);
            expect(undefinedResult.errors).toContain('テストフィールドは必須項目です');
        });

        it('文字列以外の型を拒否する', () => {
            const result = validateString(123, 'テストフィールド');

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('テストフィールドは文字列である必要があります');
        });

        it('最大長制限を正しく適用する', () => {
            const longString = 'a'.repeat(101);
            const result = validateString(longString, 'テストフィールド', { maxLength: 100 });

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('テストフィールドは100文字以内で入力してください');
        });

        it('XSS攻撃パターンを検出する', () => {
            const xssPatterns = [
                '<script>alert("xss")</script>',
                // eslint-disable-next-line no-script-url
                'javascript:alert("xss")',
                'onload=alert("xss")',
            ];

            xssPatterns.forEach(pattern => {
                const result = validateString(pattern, 'テストフィールド');
                expect(result.isValid).toBe(false);
                expect(result.errors).toContain('テストフィールドに危険な文字列が含まれています');
            });
        });

        it('制御文字を警告として検出する', () => {
            const controlCharString = 'テスト\x00文字列\x1f';
            const result = validateString(controlCharString, 'テストフィールド');

            expect(result.warnings).toContain('テストフィールドに制御文字が含まれています');
        });
    });

    describe('validateNumber', () => {
        it('正常な数値を受け入れる', () => {
            const result = validateNumber(42, 'テスト数値');

            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('文字列数値を正しく処理する', () => {
            const result = validateNumber('42', 'テスト数値');

            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('NaN/Infinityを拒否する', () => {
            const nanResult = validateNumber(NaN, 'テスト数値');
            const infinityResult = validateNumber(Infinity, 'テスト数値');

            expect(nanResult.isValid).toBe(false);
            expect(nanResult.errors).toContain('テスト数値は有効な数値である必要があります');

            expect(infinityResult.isValid).toBe(false);
            expect(infinityResult.errors).toContain('テスト数値は有効な数値である必要があります');
        });

        it('範囲制限を正しく適用する', () => {
            const belowMinResult = validateNumber(5, 'テスト数値', { min: 10 });
            const aboveMaxResult = validateNumber(15, 'テスト数値', { max: 10 });

            expect(belowMinResult.isValid).toBe(false);
            expect(belowMinResult.errors).toContain('テスト数値は10以上である必要があります');

            expect(aboveMaxResult.isValid).toBe(false);
            expect(aboveMaxResult.errors).toContain('テスト数値は10以下である必要があります');
        });

        it('ゼロの許可/拒否を正しく処理する', () => {
            const allowZeroResult = validateNumber(0, 'テスト数値');
            const rejectZeroResult = validateNumber(0, 'テスト数値', { allowZero: false });

            expect(allowZeroResult.isValid).toBe(true);

            expect(rejectZeroResult.isValid).toBe(false);
            expect(rejectZeroResult.errors).toContain('テスト数値は0にできません');
        });
    });

    describe('validateDate', () => {
        it('正常なDateオブジェクトを受け入れる', () => {
            const result = validateDate(new Date(), 'テスト日付');

            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('正常な日付文字列を受け入れる', () => {
            const result = validateDate('2024-01-01', 'テスト日付');

            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('無効な日付を拒否する', () => {
            const invalidDates = [
                'invalid-date',
                '2024-13-01', // 無効な月
                '2024-01-32', // 無効な日
                new Date('invalid'),
            ];

            invalidDates.forEach(invalidDate => {
                const result = validateDate(invalidDate, 'テスト日付');
                expect(result.isValid).toBe(false);
                expect(result.errors).toContain('テスト日付は有効な日付である必要があります');
            });
        });

        it('過去日の制限を正しく適用する', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            const result = validateDate(yesterday, 'テスト日付', { allowPast: false });

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('テスト日付は今日以降の日付を選択してください');
        });

        it('未来日の制限を正しく適用する', () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            const result = validateDate(tomorrow, 'テスト日付', { allowFuture: false });

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('テスト日付は今日以前の日付を選択してください');
        });

        it('極端な年の警告を出す', () => {
            const extremeDate = new Date('1800-01-01');
            const result = validateDate(extremeDate, 'テスト日付');

            expect(result.warnings.length).toBeGreaterThan(0);
            expect(result.warnings[0]).toContain('年が現在から');
        });
    });

    describe('validateGroup', () => {
        it('有効なグループを受け入れる', () => {
            const validGroups = ['グループA', 'グループB', 'グループC', 'その他'];

            validGroups.forEach(group => {
                const result = validateGroup(group, 'group');
                expect(result.isValid).toBe(true);
                expect(result.errors).toEqual([]);
            });
        });

        it('無効なグループを拒否する', () => {
            const invalidGroups = ['グループE', 'Group A', '', null, undefined];

            invalidGroups.forEach(group => {
                const result = validateGroup(group, 'group');
                expect(result.isValid).toBe(false);
                expect(result.errors.length).toBeGreaterThan(0);
            });
        });
    });

    describe('validateUser', () => {
        it('正常なユーザーデータを受け入れる', () => {
            const validUser = createMockUser();
            const result = validateUser(validUser);

            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('必須フィールドの不足を検出する', () => {
            const incompleteUser = {
                name: '', // 空の名前
                group: 'グループA',
                price: 500,
            };

            const result = validateUser(incompleteUser);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('利用者名は空にできません');
        });

        it('無効なグループを検出する', () => {
            const userWithInvalidGroup = createMockUser({
                group: 'グループZ' as any
            });

            const result = validateUser(userWithInvalidGroup);

            expect(result.isValid).toBe(false);
            expect(result.errors.some(error => error.includes('有効なグループ'))).toBe(true);
        });

        it('無効な料金を検出する', () => {
            const userWithInvalidPrice = createMockUser({
                price: -100
            });

            const result = validateUser(userWithInvalidPrice);

            expect(result.isValid).toBe(false);
            expect(result.errors.some(error => error.includes('0以上'))).toBe(true);
        });

        it('長すぎる名前を検出する', () => {
            const userWithLongName = createMockUser({
                name: 'a'.repeat(100)
            });

            const result = validateUser(userWithLongName);

            expect(result.isValid).toBe(false);
            expect(result.errors.some(error => error.includes('50文字以内'))).toBe(true);
        });
    });

    describe('validateMealRecord', () => {
        it('正常な給食記録を受け入れる', () => {
            const validRecord = createMockMealRecord();
            const result = validateMealRecord(validRecord);

            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('必須フィールドの不足を検出する', () => {
            const incompleteRecord = {
                userId: '',
                userName: 'テストユーザー',
                userGroup: 'グループA',
                date: '2024-01-01',
                rating: 5,
                price: 500,
            };

            const result = validateMealRecord(incompleteRecord);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('利用者IDは空にできません');
        });

        it('無効な評価値を検出する', () => {
            const recordWithInvalidRating = createMockMealRecord({
                rating: 15
            });

            const result = validateMealRecord(recordWithInvalidRating);

            expect(result.isValid).toBe(false);
            expect(result.errors.some(error => error.includes('10以下'))).toBe(true);
        });

        it('無効な日付を検出する', () => {
            const recordWithInvalidDate = createMockMealRecord({
                date: 'invalid-date'
            });

            const result = validateMealRecord(recordWithInvalidDate);

            expect(result.isValid).toBe(false);
            expect(result.errors.some(error => error.includes('有効な日付'))).toBe(true);
        });
    });

    describe('validateDateRange', () => {
        it('正常な日付範囲を受け入れる', () => {
            const startDate = new Date('2024-01-01');
            const endDate = new Date('2024-01-31');

            const result = validateDateRange(startDate, endDate, '日付範囲');

            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('両方nullの場合を受け入れる', () => {
            const result = validateDateRange(null, null, '日付範囲');

            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('片方だけnullの場合を拒否する', () => {
            const startOnlyResult = validateDateRange(new Date(), null, '日付範囲');
            const endOnlyResult = validateDateRange(null, new Date(), '日付範囲');

            expect(startOnlyResult.isValid).toBe(false);
            expect(startOnlyResult.errors).toContain('日付範囲の開始日と終了日は両方指定するか、両方未指定にしてください');

            expect(endOnlyResult.isValid).toBe(false);
            expect(endOnlyResult.errors).toContain('日付範囲の開始日と終了日は両方指定するか、両方未指定にしてください');
        });

        it('逆順の日付範囲を拒否する', () => {
            const startDate = new Date('2024-01-31');
            const endDate = new Date('2024-01-01');

            const result = validateDateRange(startDate, endDate, '日付範囲');

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('開始日は終了日より前の日付を選択してください');
        });

        it('長期間の警告を出す', () => {
            const startDate = new Date('2023-01-01');
            const endDate = new Date('2024-01-01');

            const result = validateDateRange(startDate, endDate, '日付範囲');

            expect(result.warnings.some(warning => warning.includes('長期間'))).toBe(true);
        });

        it('同じ日付の警告を出す', () => {
            const sameDate = new Date('2024-01-01');

            const result = validateDateRange(sameDate, sameDate, '日付範囲');

            expect(result.warnings).toContain('開始日と終了日が同じです');
        });
    });

    describe('validateArray', () => {
        it('正常な配列を受け入れる', () => {
            const validArray = [
                createMockUser(),
                createMockUser(),
            ];

            const result = validateArray(
                validArray,
                'ユーザー配列',
                { minLength: 1, maxLength: 10 }
            );

            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('配列以外を拒否する', () => {
            const result = validateArray(
                'not an array',
                'テスト配列',
                {}
            );

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('テスト配列は配列である必要があります');
        });

        it('長さ制限を正しく適用する', () => {
            const shortArray = [1];
            const longArray = [1, 2, 3, 4, 5, 6];

            const shortResult = validateArray(
                shortArray,
                'テスト配列',
                { minLength: 2 }
            );

            const longResult = validateArray(
                longArray,
                'テスト配列',
                { maxLength: 5 }
            );

            expect(shortResult.isValid).toBe(false);
            expect(shortResult.errors).toContain('テスト配列は最低2個の要素が必要です');

            expect(longResult.isValid).toBe(false);
            expect(longResult.errors).toContain('テスト配列は最大5個の要素までです');
        });

        it('個別項目検証テストする', () => {
            const validArray = [1, 2, 3];

            const result = validateArray(
                validArray,
                'テスト配列',
                { minLength: 1, maxLength: 5 }
            );

            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });
    });

    describe('checkDuplicates', () => {
        it('重複なしの配列を受け入れる', () => {
            const users = [
                createMockUser({ id: 'user1', name: 'ユーザー1' }),
                createMockUser({ id: 'user2', name: 'ユーザー2' }),
            ];

            const result = checkDuplicates(
                users,
                (user) => user.id,
                'ユーザーID'
            );

            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('重複を検出する', () => {
            const users = [
                createMockUser({ id: 'user1', name: 'ユーザー1' }),
                createMockUser({ id: 'user1', name: 'ユーザー2' }), // 重複ID
            ];

            const result = checkDuplicates(
                users,
                (user) => user.id,
                'ユーザーID'
            );

            expect(result.isValid).toBe(false);
            expect(result.errors.some(error => error.includes('重複した値「user1」'))).toBe(true);
        });
    });

    describe('validateDataIntegrity', () => {
        it('整合性のあるデータを受け入れる', () => {
            const users = mockUsers;
            const records = mockMealRecords;

            const result = validateDataIntegrity(users, records);

            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it('存在しないユーザーIDの参照を検出する', () => {
            const users = mockUsers;
            const records = [
                ...mockMealRecords,
                createMockMealRecord({
                    userId: 'nonexistent_user',
                    userName: '存在しないユーザー'
                }),
            ];

            const result = validateDataIntegrity(users, records);

            expect(result.isValid).toBe(false);
            expect(result.errors.some(error =>
                error.includes('存在しない利用者ID「nonexistent_user」')
            )).toBe(true);
        });

        it('ユーザー名の不一致を警告として検出する', () => {
            const users = mockUsers;
            const records = [
                createMockMealRecord({
                    userId: users[0].id,
                    userName: '間違った名前', // 実際の名前と異なる
                }),
            ];

            const result = validateDataIntegrity(users, records);

            expect(result.warnings.some(warning =>
                warning.includes('利用者名が一致しません')
            )).toBe(true);
        });

        it('非アクティブユーザーの最近の記録を警告として検出する', () => {
            const users = [
                createMockUser({
                    id: 'inactive_user',
                    name: '非アクティブユーザー',
                    isActive: false
                }),
            ];

            const today = new Date();
            const records = [
                createMockMealRecord({
                    userId: 'inactive_user',
                    userName: '非アクティブユーザー',
                    date: today.toISOString().split('T')[0],
                }),
            ];

            const result = validateDataIntegrity(users, records);

            expect(result.warnings.some(warning =>
                warning.includes('非アクティブな利用者')
            )).toBe(true);
        });
    });

    describe('パフォーマンステスト', () => {
        it('大量データでも合理的な時間で検証される', () => {
            const largeUserArray = Array.from({ length: 1000 }, (_, i) =>
                createMockUser({ id: `user_${i}`, name: `ユーザー${i}` })
            );

            const startTime = performance.now();
            const result = validateArray(
                largeUserArray,
                '大量ユーザー配列',
                { maxLength: 2000 }
            );
            const endTime = performance.now();

            const processingTime = endTime - startTime;

            // 1秒以内で処理完了することを期待
            expect(processingTime).toBeLessThan(1000);
            expect(result.isValid).toBe(true);
        });
    });
}); 