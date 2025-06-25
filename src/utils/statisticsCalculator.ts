import { endOfDay, endOfWeek, format, startOfDay, startOfWeek } from 'date-fns';
import { EATING_RATIO_LABELS, EatingRatioDistribution, MealRecord, User } from '../types';

export interface DailyOrderData {
    date: string;
    orderCount: number;
    evaluationCount: number;
    averageEatingRatio: number;  // 平均摂食量
    totalRevenue: number;
}

export interface MonthlyTrendData {
    month: string;
    orderCount: number;
    averageEatingRatio: number;  // 平均摂食量
    revenue: number;
}

export interface StatisticsData {
    dailyOrders: DailyOrderData[];
    eatingRatioDistribution: EatingRatioDistribution[];  // 摂食量分布
    monthlyTrends: MonthlyTrendData[];
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    averageEatingRatio: number;  // 平均摂食量
}

/**
 * 指定期間内のレコードをフィルタリング
 */
export const filterRecordsByDateRange = (
    records: MealRecord[],
    startDate: Date,
    endDate: Date
): MealRecord[] => {
    return records.filter(record => {
        if (!isValidDate(record.date)) return false;

        const recordDate = new Date(record.date);
        return recordDate >= startOfDay(startDate) && recordDate <= endOfDay(endDate);
    });
};

/**
 * 日別統計データを計算
 */
export const calculateDailyStats = (records: MealRecord[]): DailyOrderData[] => {
    const dailyMap = new Map<string, DailyOrderData>();

    records.forEach(record => {
        if (!isValidDate(record.date)) return;

        const dateKey = format(new Date(record.date), 'yyyy-MM-dd');

        if (!dailyMap.has(dateKey)) {
            dailyMap.set(dateKey, {
                date: dateKey,
                orderCount: 0,
                evaluationCount: 0,
                averageEatingRatio: 0,
                totalRevenue: 0,
            });
        }

        const dayData = dailyMap.get(dateKey)!;
        dayData.orderCount++;
        dayData.totalRevenue += record.price || 0;

        if (isValidEatingRatio(record.eatingRatio)) {
            dayData.evaluationCount++;
        }
    });

    // 平均摂食量を計算
    dailyMap.forEach(dayData => {
        const dayRecords = records.filter(r => {
            if (!isValidDate(r.date)) return false;

            try {
                return format(new Date(r.date), 'yyyy-MM-dd') === dayData.date && isValidEatingRatio(r.eatingRatio);
            } catch (error) {
                return false;
            }
        });

        if (dayRecords.length > 0) {
            dayData.averageEatingRatio = dayRecords.reduce((sum, r) => sum + r.eatingRatio, 0) / dayRecords.length;
        }
    });

    return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * 摂食量が有効かどうかをチェック
 */
const isValidEatingRatio = (eatingRatio: number): boolean => {
    return typeof eatingRatio === 'number' &&
        !isNaN(eatingRatio) &&
        eatingRatio >= 1 &&
        eatingRatio <= 10 &&
        isFinite(eatingRatio);
};

/**
 * 日付が有効かどうかをチェック
 */
const isValidDate = (date: string): boolean => {
    if (!date || typeof date !== 'string') return false;
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime()) && date !== '';
};

/**
 * 摂食量分布データを計算
 */
export const calculateEatingRatioDistribution = (records: MealRecord[]): EatingRatioDistribution[] => {
    const ratioCounts = new Map<number, number>();
    const evaluatedRecords = records.filter(r => isValidEatingRatio(r.eatingRatio));

    // 摂食量カウント
    evaluatedRecords.forEach(record => {
        const ratio = record.eatingRatio;
        ratioCounts.set(ratio, (ratioCounts.get(ratio) || 0) + 1);
    });

    const total = evaluatedRecords.length;
    const result: EatingRatioDistribution[] = [];

    // 1-10の摂食量で結果を生成
    for (let ratio = 1; ratio <= 10; ratio++) {
        const count = ratioCounts.get(ratio) || 0;
        const percentage = total > 0 ? (count / total) * 100 : 0;
        const label = EATING_RATIO_LABELS[ratio as keyof typeof EATING_RATIO_LABELS];

        result.push({
            ratio,
            count,
            percentage: Math.round(percentage * 10) / 10, // 小数点1桁
            label,
        });
    }

    return result;
};

/**
 * 月次トレンドデータを計算
 */
export const calculateMonthlyTrends = (records: MealRecord[], months: number = 6): MonthlyTrendData[] => {
    const monthlyMap = new Map<string, MonthlyTrendData>();
    const now = new Date();

    // 過去N月分の月を初期化
    for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = format(date, 'yyyy-MM');
        monthlyMap.set(monthKey, {
            month: monthKey,
            orderCount: 0,
            averageEatingRatio: 0,
            revenue: 0,
        });
    }

    // レコードを月別に集計
    records.forEach(record => {
        if (!isValidDate(record.date)) return;

        const monthKey = format(new Date(record.date), 'yyyy-MM');
        if (monthlyMap.has(monthKey)) {
            const monthData = monthlyMap.get(monthKey)!;
            monthData.orderCount++;
            monthData.revenue += record.price || 0;
        }
    });

    // 平均摂食量を計算
    monthlyMap.forEach(monthData => {
        const monthRecords = records.filter(r => {
            if (!isValidDate(r.date)) return false;
            try {
                return format(new Date(r.date), 'yyyy-MM') === monthData.month && isValidEatingRatio(r.eatingRatio);
            } catch (error) {
                return false;
            }
        });

        if (monthRecords.length > 0) {
            monthData.averageEatingRatio = monthRecords.reduce((sum, r) => sum + r.eatingRatio, 0) / monthRecords.length;
        }
    });

    return Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));
};

/**
 * 全体統計データを計算
 */
export const calculateOverallStatistics = (
    records: MealRecord[],
    users: User[],
    startDate?: Date,
    endDate?: Date
): StatisticsData => {
    let filteredRecords = records;

    // 期間フィルタリング
    if (startDate && endDate) {
        filteredRecords = filterRecordsByDateRange(records, startDate, endDate);
    }

    const totalRevenue = filteredRecords.reduce((sum, record) => sum + (record.price || 0), 0);
    const evaluatedRecords = filteredRecords.filter(r => isValidEatingRatio(r.eatingRatio));
    const averageEatingRatio = evaluatedRecords.length > 0
        ? evaluatedRecords.reduce((sum, r) => sum + r.eatingRatio, 0) / evaluatedRecords.length
        : 0;

    return {
        dailyOrders: calculateDailyStats(filteredRecords),
        eatingRatioDistribution: calculateEatingRatioDistribution(filteredRecords),
        monthlyTrends: calculateMonthlyTrends(filteredRecords),
        totalUsers: users.length,
        totalOrders: filteredRecords.length,
        totalRevenue,
        averageEatingRatio: Math.round(averageEatingRatio * 10) / 10,
    };
};

/**
 * 今日の統計を計算
 */
export const calculateTodayStats = (records: MealRecord[]): {
    totalOrders: number;
    pendingEvaluations: number;
    completedEvaluations: number;
    averageRating: number;
} => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayRecords = records.filter(r => {
        try {
            return isValidDate(r.date) && format(new Date(r.date), 'yyyy-MM-dd') === today;
        } catch (error) {
            return false;
        }
    });

    const evaluatedRecords = todayRecords.filter(r => isValidEatingRatio(r.eatingRatio));
    const averageEatingRatio = evaluatedRecords.length > 0
        ? evaluatedRecords.reduce((sum, r) => sum + r.eatingRatio, 0) / evaluatedRecords.length
        : 0;

    return {
        totalOrders: todayRecords.length,
        pendingEvaluations: todayRecords.length - evaluatedRecords.length,
        completedEvaluations: evaluatedRecords.length,
        averageRating: Math.round(averageEatingRatio * 10) / 10, // 互換性のため名前を維持
    };
};

/**
 * 週次統計を計算
 */
export const calculateWeeklyStats = (records: MealRecord[]): DailyOrderData[] => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // 月曜日開始
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const weekRecords = filterRecordsByDateRange(records, weekStart, weekEnd);
    return calculateDailyStats(weekRecords);
}; 