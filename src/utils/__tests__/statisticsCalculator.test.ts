import { format, subDays } from 'date-fns';
import {
    calculateEatingRatioDistribution,
    calculateOverallStatistics,
    calculateTodayStats
} from '../statisticsCalculator';
import { createMockMealRecord, generateMockUsers } from '../testHelpers';

describe('摂食量統計計算機能', () => {
    describe('calculateEatingRatioDistribution', () => {
        it('摂食量分布を正しく計算できる', () => {
            const records = [
                createMockMealRecord({ eatingRatio: 1 }),
                createMockMealRecord({ eatingRatio: 3 }),
                createMockMealRecord({ eatingRatio: 3 }),
                createMockMealRecord({ eatingRatio: 10 }),
                createMockMealRecord({ eatingRatio: 10 }),
                createMockMealRecord({ eatingRatio: 10 }),
            ];

            const result = calculateEatingRatioDistribution(records);

            expect(result).toHaveLength(10); // 1-10割の全範囲

            const ratio1 = result.find(r => r.ratio === 1);
            expect(ratio1).toEqual({
                ratio: 1,
                count: 1,
                percentage: 16.7,
                label: '1割程度'
            });

            const ratio3 = result.find(r => r.ratio === 3);
            expect(ratio3).toEqual({
                ratio: 3,
                count: 2,
                percentage: 33.3,
                label: '3割程度'
            });

            const ratio10 = result.find(r => r.ratio === 10);
            expect(ratio10).toEqual({
                ratio: 10,
                count: 3,
                percentage: 50.0,
                label: '完食'
            });
        });

        it('摂食量0の記録を除外する', () => {
            const records = [
                createMockMealRecord({ eatingRatio: 0 }),
                createMockMealRecord({ eatingRatio: 5 }),
            ];

            const result = calculateEatingRatioDistribution(records);

            expect(result.find(r => r.ratio === 5)?.count).toBe(1);
            expect(result.reduce((sum, r) => sum + r.count, 0)).toBe(1);
        });
    });

    describe('calculateTodayStats', () => {
        it('今日の統計を正しく計算できる', () => {
            const today = format(new Date(), 'yyyy-MM-dd');
            const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

            const records = [
                createMockMealRecord({ date: today, eatingRatio: 8 }),
                createMockMealRecord({ date: today, eatingRatio: 0 }), // 記録待ち
                createMockMealRecord({ date: today, eatingRatio: 7 }),
                createMockMealRecord({ date: yesterday, eatingRatio: 5 }), // 昨日（除外）
            ];

            const result = calculateTodayStats(records);

            expect(result).toEqual({
                totalOrders: 3,
                pendingEvaluations: 1,
                completedEvaluations: 2,
                averageRating: 7.5, // 互換性のため名前維持
            });
        });
    });

    describe('摂食量システム統合テスト', () => {
        it('就労移行支援事業所の実用シナリオをテストする', () => {
            const users = [
                { ...generateMockUsers(1)[0], category: 'A型' as const, price: 100 },
                { ...generateMockUsers(1)[0], category: 'B型' as const, price: 0 },
                { ...generateMockUsers(1)[0], category: '職員' as const, price: 400 },
            ];

            const records = [
                // A型利用者：完食
                createMockMealRecord({
                    eatingRatio: 10,
                    price: 100,
                    userId: users[0].id,
                    userCategory: 'A型',
                    supportNotes: 'しっかり食べられました'
                }),
                // B型利用者：半分程度
                createMockMealRecord({
                    eatingRatio: 5,
                    price: 0,
                    userId: users[1].id,
                    userCategory: 'B型',
                    supportNotes: '食欲が少なめでした'
                }),
                // 職員：8割程度
                createMockMealRecord({
                    eatingRatio: 8,
                    price: 400,
                    userId: users[2].id,
                    userCategory: '職員',
                    supportNotes: '美味しくいただきました'
                }),
            ];

            const result = calculateOverallStatistics(records, users);

            // 事業所全体の統計が正しく計算されることを確認
            expect(result.totalOrders).toBe(3);
            expect(result.totalRevenue).toBe(500); // 100 + 0 + 400
            expect(result.averageEatingRatio).toBeCloseTo(7.67, 1); // (10 + 5 + 8) / 3

            // 摂食量分布が適切に計算されることを確認
            const distribution = result.eatingRatioDistribution;
            expect(distribution.find(d => d.ratio === 5)?.count).toBe(1);
            expect(distribution.find(d => d.ratio === 8)?.count).toBe(1);
            expect(distribution.find(d => d.ratio === 10)?.count).toBe(1);
        });
    });
}); 