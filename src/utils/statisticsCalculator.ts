import { endOfDay, endOfMonth, endOfWeek, format, startOfDay, startOfMonth, startOfWeek } from 'date-fns';
import { MealRecord, User } from '../types';

export interface DailyOrderData {
    date: string;
    orderCount: number;
    evaluationCount: number;
    averageRating: number;
    totalRevenue: number;
}

export interface UserRatingData {
    rating: number;
    count: number;
    percentage: number;
}

export interface MenuPopularityData {
    menuType: string;
    count: number;
    averageRating: number;
    percentage: number;
}

export interface MonthlyTrendData {
    month: string;
    orderCount: number;
    averageRating: number;
    revenue: number;
}

export interface StatisticsData {
    dailyOrders: DailyOrderData[];
    userRatings: UserRatingData[];
    menuPopularity: MenuPopularityData[];
    monthlyTrends: MonthlyTrendData[];
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    averageRating: number;
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
        const dateKey = format(new Date(record.date), 'yyyy-MM-dd');

        if (!dailyMap.has(dateKey)) {
            dailyMap.set(dateKey, {
                date: dateKey,
                orderCount: 0,
                evaluationCount: 0,
                averageRating: 0,
                totalRevenue: 0,
            });
        }

        const dayData = dailyMap.get(dateKey)!;
        dayData.orderCount++;
        dayData.totalRevenue += record.price || 500; // デフォルト価格

        if (record.rating > 0) {
            dayData.evaluationCount++;
        }
    });

    // 平均評価を計算
    dailyMap.forEach(dayData => {
        const dayRecords = records.filter(r =>
            format(new Date(r.date), 'yyyy-MM-dd') === dayData.date && r.rating > 0
        );

        if (dayRecords.length > 0) {
            dayData.averageRating = dayRecords.reduce((sum, r) => sum + r.rating, 0) / dayRecords.length;
        }
    });

    return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * 評価分布データを計算
 */
export const calculateRatingDistribution = (records: MealRecord[]): UserRatingData[] => {
    const ratingCounts = new Map<number, number>();
    const evaluatedRecords = records.filter(r => r.rating > 0);

    // 評価カウント
    evaluatedRecords.forEach(record => {
        const rating = record.rating;
        ratingCounts.set(rating, (ratingCounts.get(rating) || 0) + 1);
    });

    const total = evaluatedRecords.length;
    const result: UserRatingData[] = [];

    // 1-5の評価で結果を生成
    for (let rating = 1; rating <= 5; rating++) {
        const count = ratingCounts.get(rating) || 0;
        const percentage = total > 0 ? (count / total) * 100 : 0;

        result.push({
            rating,
            count,
            percentage: Math.round(percentage * 10) / 10, // 小数点1桁
        });
    }

    return result;
};

/**
 * メニュー人気度データを計算
 */
export const calculateMenuPopularity = (records: MealRecord[]): MenuPopularityData[] => {
    const menuMap = new Map<string, { count: number; totalRating: number; ratingCount: number }>();

    records.forEach(record => {
        const menuType = record.menuName || '通常食';

        if (!menuMap.has(menuType)) {
            menuMap.set(menuType, { count: 0, totalRating: 0, ratingCount: 0 });
        }

        const menuData = menuMap.get(menuType)!;
        menuData.count++;

        if (record.rating > 0) {
            menuData.totalRating += record.rating;
            menuData.ratingCount++;
        }
    });

    const total = records.length;
    const result: MenuPopularityData[] = [];

    menuMap.forEach((data, menuType) => {
        const averageRating = data.ratingCount > 0 ? data.totalRating / data.ratingCount : 0;
        const percentage = total > 0 ? (data.count / total) * 100 : 0;

        result.push({
            menuType,
            count: data.count,
            averageRating: Math.round(averageRating * 10) / 10,
            percentage: Math.round(percentage * 10) / 10,
        });
    });

    return result.sort((a, b) => b.count - a.count);
};

/**
 * 月次トレンドデータを計算
 */
export const calculateMonthlyTrends = (records: MealRecord[], months: number = 6): MonthlyTrendData[] => {
    const now = new Date();
    const result: MonthlyTrendData[] = [];

    for (let i = months - 1; i >= 0; i--) {
        const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = startOfMonth(targetDate);
        const monthEnd = endOfMonth(targetDate);

        const monthRecords = filterRecordsByDateRange(records, monthStart, monthEnd);
        const evaluatedRecords = monthRecords.filter(r => r.rating > 0);

        const averageRating = evaluatedRecords.length > 0
            ? evaluatedRecords.reduce((sum, r) => sum + r.rating, 0) / evaluatedRecords.length
            : 0;

        const revenue = monthRecords.reduce((sum, r) => sum + (r.price || 500), 0);

        result.push({
            month: format(targetDate, 'yyyy-MM'),
            orderCount: monthRecords.length,
            averageRating: Math.round(averageRating * 10) / 10,
            revenue,
        });
    }

    return result;
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

    if (startDate && endDate) {
        filteredRecords = filterRecordsByDateRange(records, startDate, endDate);
    }

    const evaluatedRecords = filteredRecords.filter(r => r.rating > 0);
    const averageRating = evaluatedRecords.length > 0
        ? evaluatedRecords.reduce((sum, r) => sum + r.rating, 0) / evaluatedRecords.length
        : 0;

    const totalRevenue = filteredRecords.reduce((sum, r) => sum + (r.price || 500), 0);

    return {
        dailyOrders: calculateDailyStats(filteredRecords),
        userRatings: calculateRatingDistribution(filteredRecords),
        menuPopularity: calculateMenuPopularity(filteredRecords),
        monthlyTrends: calculateMonthlyTrends(records), // 全期間のトレンド
        totalUsers: users.length,
        totalOrders: filteredRecords.length,
        totalRevenue,
        averageRating: Math.round(averageRating * 10) / 10,
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
    const today = new Date();
    const todayRecords = filterRecordsByDateRange(records, today, today);
    const evaluatedRecords = todayRecords.filter(r => r.rating > 0);

    const averageRating = evaluatedRecords.length > 0
        ? evaluatedRecords.reduce((sum, r) => sum + r.rating, 0) / evaluatedRecords.length
        : 0;

    return {
        totalOrders: todayRecords.length,
        pendingEvaluations: todayRecords.length - evaluatedRecords.length,
        completedEvaluations: evaluatedRecords.length,
        averageRating: Math.round(averageRating * 10) / 10,
    };
};

/**
 * 週間統計を計算
 */
export const calculateWeeklyStats = (records: MealRecord[]): DailyOrderData[] => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // 月曜始まり
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const weekRecords = filterRecordsByDateRange(records, weekStart, weekEnd);
    return calculateDailyStats(weekRecords);
}; 