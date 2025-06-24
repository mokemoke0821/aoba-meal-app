import { addDays, format, subDays } from 'date-fns';
import {
    calculateDailyStats,
    calculateMenuPopularity,
    calculateMonthlyTrends,
    calculateOverallStatistics,
    calculateRatingDistribution,
    calculateTodayStats
} from '../statisticsCalculator';
import {
    createMockMealRecord,
    createTestDateStrings,
    generateMockMealRecords,
    generateMockUsers,
    mockUsers
} from '../testHelpers';

describe('統計計算機能', () => {
    describe('calculateDailyStats', () => {
        it('正常な日別統計を計算できる', () => {
            const today = format(new Date(), 'yyyy-MM-dd');
            const todayRecords = [
                createMockMealRecord({ date: today, rating: 8, price: 500 }),
                createMockMealRecord({ date: today, rating: 7, price: 450 }),
            ];

            const result = calculateDailyStats(todayRecords);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                date: today,
                orderCount: 2,
                evaluationCount: 2,
                averageRating: 7.5,
                totalRevenue: 950,
            });
        });

        it('複数日のデータを正しく集計できる', () => {
            const today = new Date();
            const yesterday = subDays(today, 1);

            const records = [
                createMockMealRecord({
                    date: format(today, 'yyyy-MM-dd'),
                    rating: 8,
                    price: 500
                }),
                createMockMealRecord({
                    date: format(yesterday, 'yyyy-MM-dd'),
                    rating: 6,
                    price: 400
                }),
                createMockMealRecord({
                    date: format(yesterday, 'yyyy-MM-dd'),
                    rating: 9,
                    price: 600
                }),
            ];

            const result = calculateDailyStats(records);

            expect(result).toHaveLength(2);

            // 今日の統計
            const todayStats = result.find(s => s.date === format(today, 'yyyy-MM-dd'));
            expect(todayStats).toBeDefined();
            expect(todayStats!.orderCount).toBe(1);
            expect(todayStats!.averageRating).toBe(8);

            // 昨日の統計
            const yesterdayStats = result.find(s => s.date === format(yesterday, 'yyyy-MM-dd'));
            expect(yesterdayStats).toBeDefined();
            expect(yesterdayStats!.orderCount).toBe(2);
            expect(yesterdayStats!.averageRating).toBe(7.5);
        });

        it('空のデータに対して空配列を返す', () => {
            const result = calculateDailyStats([]);
            expect(result).toEqual([]);
        });

        it('評価なしの記録を適切に処理する', () => {
            const today = format(new Date(), 'yyyy-MM-dd');
            const records = [
                createMockMealRecord({ date: today, rating: 0, price: 500 }),
                createMockMealRecord({ date: today, rating: 8, price: 450 }),
            ];

            const result = calculateDailyStats(records);

            expect(result[0].orderCount).toBe(2);
            expect(result[0].evaluationCount).toBe(1); // rating > 0 のもののみ
            expect(result[0].averageRating).toBe(8); // 評価ありのもののみで計算
        });
    });

    describe('calculateRatingDistribution', () => {
        it('評価分布を正しく計算できる', () => {
            const records = [
                createMockMealRecord({ rating: 1 }),
                createMockMealRecord({ rating: 3 }),
                createMockMealRecord({ rating: 3 }),
                createMockMealRecord({ rating: 5 }),
                createMockMealRecord({ rating: 5 }),
                createMockMealRecord({ rating: 5 }),
            ];

            const result = calculateRatingDistribution(records);

            expect(result).toEqual([
                { rating: 1, count: 1, percentage: 16.7 },
                { rating: 2, count: 0, percentage: 0 },
                { rating: 3, count: 2, percentage: 33.3 },
                { rating: 4, count: 0, percentage: 0 },
                { rating: 5, count: 3, percentage: 50 },
            ]);
        });

        it('評価0の記録を除外する', () => {
            const records = [
                createMockMealRecord({ rating: 0 }),
                createMockMealRecord({ rating: 5 }),
            ];

            const result = calculateRatingDistribution(records);

            expect(result.find(r => r.rating === 5)?.count).toBe(1);
            expect(result.reduce((sum, r) => sum + r.count, 0)).toBe(1);
        });

        it('範囲外の評価を適切に処理する', () => {
            const records = [
                createMockMealRecord({ rating: -1 }),
                createMockMealRecord({ rating: 11 }),
                createMockMealRecord({ rating: 3 }),
            ];

            const result = calculateRatingDistribution(records);

            expect(result.find(r => r.rating === 3)?.count).toBe(1);
            expect(result.reduce((sum, r) => sum + r.count, 0)).toBe(1);
        });
    });

    describe('calculateMenuPopularity', () => {
        it('メニュー人気度を正しく計算できる', () => {
            const records = [
                createMockMealRecord({ menuName: 'カレーライス', rating: 8 }),
                createMockMealRecord({ menuName: 'カレーライス', rating: 7 }),
                createMockMealRecord({ menuName: 'ハンバーグ', rating: 9 }),
                createMockMealRecord({ menuName: 'ハンバーグ', rating: 6 }),
                createMockMealRecord({ menuName: 'うどん', rating: 5 }),
            ];

            const result = calculateMenuPopularity(records);

            expect(result).toHaveLength(3);

            const curry = result.find(m => m.menuType === 'カレーライス');
            expect(curry).toEqual({
                menuType: 'カレーライス',
                count: 2,
                averageRating: 7.5,
                percentage: expect.any(Number),
            });

            const hamburg = result.find(m => m.menuType === 'ハンバーグ');
            expect(hamburg?.count).toBe(2);
            expect(hamburg?.averageRating).toBe(7.5);
        });

        it('メニュー名がundefinedの記録を適切に処理する', () => {
            const records = [
                createMockMealRecord({ menuName: undefined, rating: 8 }),
                createMockMealRecord({ menuName: 'カレーライス', rating: 7 }),
            ];

            const result = calculateMenuPopularity(records);

            expect(result).toHaveLength(2);
            expect(result.some(m => m.menuType === '通常食')).toBe(true);
            expect(result.some(m => m.menuType === 'カレーライス')).toBe(true);
        });

        it('注文数で降順ソートされる', () => {
            const records = [
                createMockMealRecord({ menuName: 'A', rating: 5 }),
                createMockMealRecord({ menuName: 'B', rating: 5 }),
                createMockMealRecord({ menuName: 'B', rating: 5 }),
                createMockMealRecord({ menuName: 'C', rating: 5 }),
                createMockMealRecord({ menuName: 'C', rating: 5 }),
                createMockMealRecord({ menuName: 'C', rating: 5 }),
            ];

            const result = calculateMenuPopularity(records);

            expect(result[0].menuType).toBe('C');
            expect(result[0].count).toBe(3);
            expect(result[1].menuType).toBe('B');
            expect(result[1].count).toBe(2);
            expect(result[2].menuType).toBe('A');
            expect(result[2].count).toBe(1);
        });
    });

    describe('calculateMonthlyTrends', () => {
        it('月別トレンドを正しく計算できる', () => {
            const today = new Date();
            const records = [
                // 今月
                createMockMealRecord({
                    date: format(today, 'yyyy-MM-dd'),
                    price: 500,
                    rating: 8
                }),
                createMockMealRecord({
                    date: format(today, 'yyyy-MM-dd'),
                    price: 450,
                    rating: 7
                }),
                // 先月
                createMockMealRecord({
                    date: format(subDays(today, 35), 'yyyy-MM-dd'),
                    price: 600,
                    rating: 9
                }),
            ];

            const result = calculateMonthlyTrends(records);

            expect(result.length).toBeGreaterThan(0);

            const thisMonth = result.find(m => m.month === format(today, 'yyyy-MM'));
            expect(thisMonth).toBeDefined();
            expect(thisMonth!.orderCount).toBe(2);
            expect(thisMonth!.revenue).toBe(950);
            expect(thisMonth!.averageRating).toBe(7.5);
        });

        it('過去6ヶ月分のデータを返す', () => {
            const result = calculateMonthlyTrends([]);

            expect(result).toHaveLength(6);

            // 月が昇順でソートされているかチェック（過去→現在）
            for (let i = 0; i < result.length - 1; i++) {
                expect(result[i].month <= result[i + 1].month).toBe(true);
            }
        });

        it('データがない月は0で初期化される', () => {
            const result = calculateMonthlyTrends([]);

            result.forEach(month => {
                expect(month.orderCount).toBe(0);
                expect(month.revenue).toBe(0);
                expect(month.averageRating).toBe(0);
            });
        });
    });

    describe('calculateTodayStats', () => {
        it('今日の統計を正しく計算できる', () => {
            const today = format(new Date(), 'yyyy-MM-dd');
            const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

            const records = [
                // 今日の記録
                createMockMealRecord({ date: today, rating: 8 }),
                createMockMealRecord({ date: today, rating: 0 }), // 評価待ち
                createMockMealRecord({ date: today, rating: 7 }),
                // 昨日の記録（除外される）
                createMockMealRecord({ date: yesterday, rating: 5 }),
            ];

            const result = calculateTodayStats(records);

            expect(result).toEqual({
                totalOrders: 3,
                pendingEvaluations: 1,
                completedEvaluations: 2,
                averageRating: 7.5,
            });
        });

        it('今日のデータがない場合は0を返す', () => {
            const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
            const records = [
                createMockMealRecord({ date: yesterday, rating: 5 }),
            ];

            const result = calculateTodayStats(records);

            expect(result).toEqual({
                totalOrders: 0,
                pendingEvaluations: 0,
                completedEvaluations: 0,
                averageRating: 0,
            });
        });
    });

    describe('calculateOverallStatistics', () => {
        it('全体統計を正しく計算できる', () => {
            const users = generateMockUsers(5);
            const records = generateMockMealRecords(users, 7);

            const result = calculateOverallStatistics(records, users);

            expect(result).toEqual({
                dailyOrders: expect.any(Array),
                userRatings: expect.any(Array),
                menuPopularity: expect.any(Array),
                monthlyTrends: expect.any(Array),
                totalUsers: 5,
                totalOrders: expect.any(Number),
                totalRevenue: expect.any(Number),
                averageRating: expect.any(Number),
            });

            expect(result.totalUsers).toBe(5);
            expect(result.totalOrders).toBeGreaterThanOrEqual(0);
            expect(result.totalRevenue).toBeGreaterThanOrEqual(0);
        });

        it('日付範囲フィルターが正しく動作する', () => {
            const { todayString, sevenDaysAgoString } = createTestDateStrings();
            const users = generateMockUsers(3);
            const records = [
                createMockMealRecord({
                    date: todayString,
                    price: 500,
                    userId: users[0].id
                }),
                createMockMealRecord({
                    date: sevenDaysAgoString,
                    price: 400,
                    userId: users[1].id
                }),
                createMockMealRecord({
                    date: format(subDays(new Date(), 14), 'yyyy-MM-dd'),
                    price: 600,
                    userId: users[2].id
                }),
            ];

            const startDate = subDays(new Date(), 7);
            const endDate = new Date();

            const result = calculateOverallStatistics(
                records,
                users,
                startDate,
                endDate
            );

            // 期間内の記録のみが集計される
            expect(result.totalOrders).toBe(2);
            expect(result.totalRevenue).toBe(900);
        });

        it('空のデータでも正常に動作する', () => {
            const result = calculateOverallStatistics([], []);

            expect(result).toEqual({
                dailyOrders: [],
                userRatings: expect.any(Array),
                menuPopularity: [],
                monthlyTrends: expect.any(Array),
                totalUsers: 0,
                totalOrders: 0,
                totalRevenue: 0,
                averageRating: 0,
            });

            expect(result.dailyOrders).toEqual([]);
            expect(result.userRatings).toHaveLength(5); // 1-5の評価
            expect(result.menuPopularity).toEqual([]);
            expect(result.monthlyTrends).toHaveLength(6); // 6ヶ月分
        });
    });

    describe('パフォーマンステスト', () => {
        it('大量データでも合理的な時間で処理される', () => {
            const users = generateMockUsers(100);
            const records = generateMockMealRecords(users, 365); // 1年分

            const startTime = performance.now();
            const result = calculateOverallStatistics(records, users);
            const endTime = performance.now();

            const processingTime = endTime - startTime;

            // 1秒以内で処理完了することを期待
            expect(processingTime).toBeLessThan(1000);
            expect(result.totalOrders).toBeGreaterThan(0);
        });
    });

    describe('エッジケーステスト', () => {
        it('異常な評価値を適切に処理する', () => {
            const records = [
                createMockMealRecord({ rating: -10 }),
                createMockMealRecord({ rating: 100 }),
                createMockMealRecord({ rating: NaN }),
                createMockMealRecord({ rating: 5 }),
            ];

            const result = calculateOverallStatistics(records, mockUsers);

            // 正常な評価値のみが計算に使用される
            expect(result.averageRating).toBe(5);
        });

        it('未来の日付の記録を適切に処理する', () => {
            const futureDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');
            const records = [
                createMockMealRecord({ date: futureDate, rating: 8 }),
                createMockMealRecord({ rating: 7 }),
            ];

            const result = calculateOverallStatistics(records, mockUsers);

            // 未来の記録も含めて処理される
            expect(result.totalOrders).toBe(2);
        });

        it('不正な日付形式を適切に処理する', () => {
            const records = [
                createMockMealRecord({ date: 'invalid-date', rating: 8 }),
                createMockMealRecord({ date: '', rating: 7 }),
                createMockMealRecord({ rating: 6 }),
            ];

            // エラーが発生せず、有効なデータのみ処理される
            expect(() => {
                calculateOverallStatistics(records, mockUsers);
            }).not.toThrow();
        });
    });
}); 