import { eachDayOfInterval, endOfMonth, format, isWithinInterval, parseISO, startOfMonth } from 'date-fns';
import { ja } from 'date-fns/locale';
import { MealRecord, MenuItem, User } from '../types';

// 月次利用統計
export interface MonthlyStats {
    userId: string;
    userName: string;
    userGroup: string;
    totalMeals: number;
    totalAmount: number;
    averageRating: number;
    attendanceRate: number;
    lastMealDate: string;
}

// 評価分析結果
export interface RatingAnalysis {
    period: string;
    averageRating: number;
    totalRecords: number;
    ratingDistribution: { rating: number; count: number; percentage: number }[];
    satisfactionTrend: { date: string; rating: number; count: number }[];
    menuRatingCorrelation: { menuName: string; averageRating: number; count: number }[];
}

// 利用パターン分析
export interface UsagePattern {
    dayOfWeek: { day: string; count: number; averageRating: number }[];
    hourlyPattern: { hour: number; count: number }[];
    monthlyTrend: { month: string; count: number; revenue: number }[];
}

// グループ別集計
export interface GroupSummary {
    group: string;
    userCount: number;
    totalMeals: number;
    totalRevenue: number;
    averageRating: number;
    averageMealsPerUser: number;
}

// 月次利用統計の計算
export const calculateMonthlyStats = (
    records: MealRecord[],
    users: User[],
    year: number,
    month: number
): MonthlyStats[] => {
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));

    // 指定月のレコードをフィルタリング
    const monthlyRecords = records.filter(record => {
        const recordDate = parseISO(record.date);
        return isWithinInterval(recordDate, { start: startDate, end: endDate });
    });

    // 利用者別の統計を計算
    const userStats = new Map<string, {
        records: MealRecord[];
        user: User | undefined;
    }>();

    // レコードを利用者別にグループ化
    monthlyRecords.forEach(record => {
        if (!userStats.has(record.userId)) {
            userStats.set(record.userId, {
                records: [],
                user: users.find(u => u.id === record.userId)
            });
        }
        userStats.get(record.userId)!.records.push(record);
    });

    // 統計計算
    const results: MonthlyStats[] = [];

    userStats.forEach((data, userId) => {
        const { records: userRecords, user } = data;
        if (!user) return;

        const totalMeals = userRecords.length;
        const totalAmount = userRecords.reduce((sum, record) => sum + record.price, 0);
        const averageRating = userRecords.reduce((sum, record) => sum + record.rating, 0) / totalMeals;
        const lastMealDate = userRecords
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date;

        // 出席率計算（営業日に対する利用率）
        const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate })
            .filter(date => date.getDay() !== 0 && date.getDay() !== 6) // 土日除外
            .length;
        const attendanceRate = (totalMeals / daysInMonth) * 100;

        results.push({
            userId,
            userName: user.name,
            userGroup: user.group,
            totalMeals,
            totalAmount,
            averageRating: Math.round(averageRating * 100) / 100,
            attendanceRate: Math.round(attendanceRate * 100) / 100,
            lastMealDate: lastMealDate || '',
        });
    });

    return results.sort((a, b) => a.userName.localeCompare(b.userName, 'ja'));
};

// 評価分析の実行
export const analyzeRatings = (
    records: MealRecord[],
    menus: MenuItem[],
    period: 'week' | 'month' | 'quarter' = 'month'
): RatingAnalysis => {
    if (records.length === 0) {
        return {
            period,
            averageRating: 0,
            totalRecords: 0,
            ratingDistribution: [],
            satisfactionTrend: [],
            menuRatingCorrelation: [],
        };
    }

    // 全体平均評価
    const averageRating = records.reduce((sum, record) => sum + record.rating, 0) / records.length;

    // 評価分布の計算
    const ratingCounts = new Map<number, number>();
    for (let i = 1; i <= 10; i++) {
        ratingCounts.set(i, 0);
    }

    records.forEach(record => {
        const count = ratingCounts.get(record.rating) || 0;
        ratingCounts.set(record.rating, count + 1);
    });

    const ratingDistribution = Array.from(ratingCounts.entries()).map(([rating, count]) => ({
        rating,
        count,
        percentage: Math.round((count / records.length) * 100 * 100) / 100,
    }));

    // 満足度トレンド（日別平均評価）
    const dailyRatings = new Map<string, { total: number; count: number }>();
    records.forEach(record => {
        const date = record.date;
        if (!dailyRatings.has(date)) {
            dailyRatings.set(date, { total: 0, count: 0 });
        }
        const data = dailyRatings.get(date)!;
        data.total += record.rating;
        data.count += 1;
    });

    const satisfactionTrend = Array.from(dailyRatings.entries())
        .map(([date, data]) => ({
            date,
            rating: Math.round((data.total / data.count) * 100) / 100,
            count: data.count,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

    // メニュー別評価相関
    const menuRatings = new Map<string, { total: number; count: number }>();
    records.forEach(record => {
        const menuName = record.menuName || '不明なメニュー';
        if (!menuRatings.has(menuName)) {
            menuRatings.set(menuName, { total: 0, count: 0 });
        }
        const data = menuRatings.get(menuName)!;
        data.total += record.rating;
        data.count += 1;
    });

    const menuRatingCorrelation = Array.from(menuRatings.entries())
        .map(([menuName, data]) => ({
            menuName,
            averageRating: Math.round((data.total / data.count) * 100) / 100,
            count: data.count,
        }))
        .sort((a, b) => b.averageRating - a.averageRating);

    return {
        period,
        averageRating: Math.round(averageRating * 100) / 100,
        totalRecords: records.length,
        ratingDistribution,
        satisfactionTrend,
        menuRatingCorrelation,
    };
};

// 利用パターン分析
export const analyzeUsagePatterns = (records: MealRecord[]): UsagePattern => {
    // 曜日別パターン
    const dayOfWeekStats = new Map<string, { count: number; totalRating: number }>();
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

    dayNames.forEach(day => {
        dayOfWeekStats.set(day, { count: 0, totalRating: 0 });
    });

    records.forEach(record => {
        const date = parseISO(record.date);
        const dayName = dayNames[date.getDay()];
        const stats = dayOfWeekStats.get(dayName)!;
        stats.count += 1;
        stats.totalRating += record.rating;
    });

    const dayOfWeek = Array.from(dayOfWeekStats.entries()).map(([day, stats]) => ({
        day,
        count: stats.count,
        averageRating: stats.count > 0 ? Math.round((stats.totalRating / stats.count) * 100) / 100 : 0,
    }));

    // 月別トレンド
    const monthlyStats = new Map<string, { count: number; revenue: number }>();
    records.forEach(record => {
        const month = format(parseISO(record.date), 'yyyy-MM', { locale: ja });
        if (!monthlyStats.has(month)) {
            monthlyStats.set(month, { count: 0, revenue: 0 });
        }
        const stats = monthlyStats.get(month)!;
        stats.count += 1;
        stats.revenue += record.price;
    });

    const monthlyTrend = Array.from(monthlyStats.entries())
        .map(([month, stats]) => ({
            month,
            count: stats.count,
            revenue: stats.revenue,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

    return {
        dayOfWeek,
        hourlyPattern: [], // 時間データがないため空配列
        monthlyTrend,
    };
};

// グループ別集計
export const calculateGroupSummary = (
    records: MealRecord[],
    users: User[]
): GroupSummary[] => {
    const groupStats = new Map<string, {
        userIds: Set<string>;
        totalMeals: number;
        totalRevenue: number;
        totalRating: number;
    }>();

    // 初期化
    const groups = ['A型', 'B型', '職員', '体験者'];
    groups.forEach(group => {
        groupStats.set(group, {
            userIds: new Set(),
            totalMeals: 0,
            totalRevenue: 0,
            totalRating: 0,
        });
    });

    // レコードを集計
    records.forEach(record => {
        const stats = groupStats.get(record.userGroup);
        if (stats) {
            stats.userIds.add(record.userId);
            stats.totalMeals += 1;
            stats.totalRevenue += record.price;
            stats.totalRating += record.rating;
        }
    });

    // 結果計算
    const results: GroupSummary[] = Array.from(groupStats.entries()).map(([group, stats]) => {
        const userCount = stats.userIds.size;
        const averageRating = stats.totalMeals > 0 ? stats.totalRating / stats.totalMeals : 0;
        const averageMealsPerUser = userCount > 0 ? stats.totalMeals / userCount : 0;

        return {
            group,
            userCount,
            totalMeals: stats.totalMeals,
            totalRevenue: stats.totalRevenue,
            averageRating: Math.round(averageRating * 100) / 100,
            averageMealsPerUser: Math.round(averageMealsPerUser * 100) / 100,
        };
    });

    return results.filter(result => result.userCount > 0);
};

// 期間フィルタリング用ヘルパー
export const filterRecordsByPeriod = (
    records: MealRecord[],
    startDate: string,
    endDate: string
): MealRecord[] => {
    return records.filter(record => {
        return record.date >= startDate && record.date <= endDate;
    });
};

// 収益計算
export const calculateRevenue = (
    records: MealRecord[],
    period: 'daily' | 'weekly' | 'monthly' = 'monthly'
): { period: string; revenue: number; mealCount: number }[] => {
    const revenueMap = new Map<string, { revenue: number; count: number }>();

    records.forEach(record => {
        let key: string;
        const date = parseISO(record.date);

        switch (period) {
            case 'daily':
                key = format(date, 'yyyy-MM-dd');
                break;
            case 'weekly':
                key = format(date, 'yyyy-ww');
                break;
            case 'monthly':
                key = format(date, 'yyyy-MM');
                break;
        }

        if (!revenueMap.has(key)) {
            revenueMap.set(key, { revenue: 0, count: 0 });
        }

        const data = revenueMap.get(key)!;
        data.revenue += record.price;
        data.count += 1;
    });

    return Array.from(revenueMap.entries())
        .map(([period, data]) => ({
            period,
            revenue: data.revenue,
            mealCount: data.count,
        }))
        .sort((a, b) => a.period.localeCompare(b.period));
}; 