import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { saveAs } from 'file-saver';
import { MealRecord, MenuItem, User } from '../types';
import {
    analyzeRatings,
    calculateGroupSummary,
    calculateMonthlyStats,
    filterRecordsByPeriod
} from './statistics';

// CSV共通ヘルパー
const createCSVContent = (headers: string[], rows: string[][]): string => {
    const csvData = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
    return '\uFEFF' + csvData; // BOM付きUTF-8
};

const downloadCSV = (content: string, filename: string): void => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, filename);
};

// 1. 日次利用記録の出力
export const exportDailyRecords = (
    records: MealRecord[],
    startDate: string,
    endDate: string
): void => {
    try {
        const filteredRecords = filterRecordsByPeriod(records, startDate, endDate);

        if (filteredRecords.length === 0) {
            throw new Error('指定期間にデータがありません');
        }

        const headers = [
            '日付',
            '曜日',
            '利用者名',
            'グループ',
            '料金',
            '評価',
            'メニュー名',
            '満足度'
        ];

        const rows = filteredRecords.map(record => {
            const date = parseISO(record.date);
            const dayOfWeek = format(date, 'EEEE', { locale: ja });
            const satisfaction = record.rating >= 7 ? '満足' : record.rating >= 4 ? '普通' : '不満';

            return [
                format(date, 'yyyy年MM月dd日', { locale: ja }),
                dayOfWeek,
                record.userName,
                record.userGroup,
                record.price.toString(),
                record.rating.toString(),
                record.menuName || '不明',
                satisfaction
            ];
        });

        const csvContent = createCSVContent(headers, rows);
        const filename = `日次利用記録_${startDate}_${endDate}.csv`;
        downloadCSV(csvContent, filename);
    } catch (error) {
        console.error('日次記録CSV出力エラー:', error);
        throw error;
    }
};

// 2. 月次集計レポートの出力
export const exportMonthlyReport = (
    records: MealRecord[],
    users: User[],
    year: number,
    month: number
): void => {
    try {
        const monthlyStats = calculateMonthlyStats(records, users, year, month);
        const groupSummary = calculateGroupSummary(
            records.filter(r => {
                const recordDate = parseISO(r.date);
                return recordDate.getFullYear() === year && recordDate.getMonth() === month - 1;
            }),
            users
        );

        if (monthlyStats.length === 0) {
            throw new Error('指定月にデータがありません');
        }

        // 利用者別統計
        const userHeaders = [
            '利用者名',
            'グループ',
            '利用回数',
            '合計料金',
            '平均評価',
            '出席率(%)',
            '最終利用日'
        ];

        const userRows = monthlyStats.map(stat => [
            stat.userName,
            stat.userGroup,
            stat.totalMeals.toString(),
            stat.totalAmount.toString(),
            stat.averageRating.toString(),
            stat.attendanceRate.toString(),
            stat.lastMealDate ? format(parseISO(stat.lastMealDate), 'MM月dd日', { locale: ja }) : '未利用'
        ]);

        // グループ別統計
        const groupHeaders = [
            'グループ',
            '利用者数',
            '総利用回数',
            '総売上',
            '平均評価',
            '一人当たり利用回数'
        ];

        const groupRows = groupSummary.map(summary => [
            summary.group,
            summary.userCount.toString(),
            summary.totalMeals.toString(),
            summary.totalRevenue.toString(),
            summary.averageRating.toString(),
            summary.averageMealsPerUser.toString()
        ]);

        // 合計行を追加
        const totalMeals = monthlyStats.reduce((sum, stat) => sum + stat.totalMeals, 0);
        const totalRevenue = monthlyStats.reduce((sum, stat) => sum + stat.totalAmount, 0);
        const overallAverage = monthlyStats.reduce((sum, stat) => sum + stat.averageRating, 0) / monthlyStats.length;

        userRows.push([
            '合計',
            '',
            totalMeals.toString(),
            totalRevenue.toString(),
            Math.round(overallAverage * 100) / 100 + '',
            '',
            ''
        ]);

        // CSV作成
        const csvContent = [
            `あおば就労移行支援事業所 ${year}年${month}月 利用統計レポート`,
            `作成日時: ${format(new Date(), 'yyyy年MM月dd日 HH:mm', { locale: ja })}`,
            '',
            '■ 利用者別統計',
            userHeaders.join(','),
            ...userRows.map(row => row.map(cell => `"${cell}"`).join(',')),
            '',
            '■ グループ別統計',
            groupHeaders.join(','),
            ...groupRows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const filename = `月次集計レポート_${year}年${month}月.csv`;
        downloadCSV('\uFEFF' + csvContent, filename);
    } catch (error) {
        console.error('月次レポートCSV出力エラー:', error);
        throw error;
    }
};

// 3. 評価分析レポートの出力
export const exportRatingAnalysis = (
    records: MealRecord[],
    menus: MenuItem[],
    period: 'month' | 'week' = 'month'
): void => {
    try {
        const analysis = analyzeRatings(records, menus, period);

        if (analysis.totalRecords === 0) {
            throw new Error('分析対象のデータがありません');
        }

        // 評価分布データ
        const distributionHeaders = ['評価', '件数', '割合(%)'];
        const distributionRows = analysis.ratingDistribution.map(item => [
            item.rating.toString(),
            item.count.toString(),
            item.percentage.toString()
        ]);

        // メニュー別評価データ
        const menuHeaders = ['メニュー名', '平均評価', '評価件数'];
        const menuRows = analysis.menuRatingCorrelation.map(item => [
            item.menuName,
            item.averageRating.toString(),
            item.count.toString()
        ]);

        // 満足度トレンドデータ
        const trendHeaders = ['日付', '平均評価', '利用件数'];
        const trendRows = analysis.satisfactionTrend.map(item => [
            format(parseISO(item.date), 'MM月dd日', { locale: ja }),
            item.rating.toString(),
            item.count.toString()
        ]);

        const csvContent = [
            `あおば就労移行支援事業所 評価分析レポート (${period})`,
            `作成日時: ${format(new Date(), 'yyyy年MM月dd日 HH:mm', { locale: ja })}`,
            `分析期間: ${analysis.period}`,
            `総レコード数: ${analysis.totalRecords}`,
            `全体平均評価: ${analysis.averageRating}`,
            '',
            '■ 評価分布',
            distributionHeaders.join(','),
            ...distributionRows.map(row => row.map(cell => `"${cell}"`).join(',')),
            '',
            '■ メニュー別評価',
            menuHeaders.join(','),
            ...menuRows.map(row => row.map(cell => `"${cell}"`).join(',')),
            '',
            '■ 満足度推移',
            trendHeaders.join(','),
            ...trendRows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const filename = `評価分析レポート_${format(new Date(), 'yyyyMMdd')}.csv`;
        downloadCSV('\uFEFF' + csvContent, filename);
    } catch (error) {
        console.error('評価分析CSV出力エラー:', error);
        throw error;
    }
};

// 4. 請求書データの出力
export const exportBillingData = (
    records: MealRecord[],
    users: User[],
    year: number,
    month: number
): void => {
    try {
        const monthlyStats = calculateMonthlyStats(records, users, year, month);

        // 有料利用者のみ（体験者除外）
        const billingStats = monthlyStats.filter(stat => stat.userGroup !== '体験者');

        if (billingStats.length === 0) {
            throw new Error('請求対象のデータがありません');
        }

        const headers = [
            '利用者名',
            'グループ',
            '利用回数',
            '単価',
            '合計料金',
            'メモ'
        ];

        const rows = billingStats.map(stat => {
            const unitPrice = stat.totalAmount / stat.totalMeals;
            return [
                stat.userName,
                stat.userGroup,
                stat.totalMeals.toString(),
                Math.round(unitPrice).toString(),
                stat.totalAmount.toString(),
                `平均評価: ${stat.averageRating}`
            ];
        });

        // 合計行
        const totalAmount = billingStats.reduce((sum, stat) => sum + stat.totalAmount, 0);
        const totalMeals = billingStats.reduce((sum, stat) => sum + stat.totalMeals, 0);

        rows.push([
            '合計',
            '',
            totalMeals.toString(),
            '',
            totalAmount.toString(),
            ''
        ]);

        const csvContent = [
            `あおば就労移行支援事業所 ${year}年${month}月 請求データ`,
            `作成日時: ${format(new Date(), 'yyyy年MM月dd日 HH:mm', { locale: ja })}`,
            `請求対象者: ${billingStats.length}名`,
            `総売上: ¥${totalAmount.toLocaleString()}`,
            '',
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const filename = `請求データ_${year}年${month}月.csv`;
        downloadCSV('\uFEFF' + csvContent, filename);
    } catch (error) {
        console.error('請求データCSV出力エラー:', error);
        throw error;
    }
};

// 5. 利用者マスターデータの出力
export const exportUserMasterData = (users: User[]): void => {
    try {
        if (users.length === 0) {
            throw new Error('出力対象の利用者がいません');
        }

        const headers = [
            '利用者ID',
            '利用者名',
            'グループ',
            '料金',
            '登録日',
            '状態',
            '登録期間'
        ];

        const rows = users.map(user => {
            const registrationDate = parseISO(user.createdAt);
            const daysSinceRegistration = Math.floor(
                (new Date().getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            return [
                user.id,
                user.name,
                user.group,
                user.price.toString(),
                format(registrationDate, 'yyyy年MM月dd日', { locale: ja }),
                user.isActive ? '有効' : '無効',
                `${daysSinceRegistration}日`
            ];
        });

        const csvContent = createCSVContent(headers, rows);
        const filename = `利用者マスター_${format(new Date(), 'yyyyMMdd')}.csv`;
        downloadCSV(csvContent, filename);
    } catch (error) {
        console.error('利用者マスターCSV出力エラー:', error);
        throw error;
    }
};

// 6. 統合レポートの出力（全データ）
export const exportComprehensiveReport = (
    records: MealRecord[],
    users: User[],
    menus: MenuItem[]
): void => {
    try {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        // 各種分析データを取得
        const monthlyStats = calculateMonthlyStats(records, users, currentYear, currentMonth);
        const groupSummary = calculateGroupSummary(records, users);
        const ratingAnalysis = analyzeRatings(records, menus);

        // 全体統計
        const totalUsers = users.filter(u => u.isActive).length;
        const totalRecords = records.length;
        const totalRevenue = records.reduce((sum, r) => sum + r.price, 0);
        const averageRating = records.reduce((sum, r) => sum + r.rating, 0) / records.length;

        const csvContent = [
            `あおば就労移行支援事業所 統合レポート`,
            `作成日時: ${format(currentDate, 'yyyy年MM月dd日 HH:mm', { locale: ja })}`,
            '',
            '■ 全体統計',
            `登録利用者数: ${totalUsers}名`,
            `総利用記録: ${totalRecords}件`,
            `総売上: ¥${totalRevenue.toLocaleString()}`,
            `全体平均評価: ${Math.round(averageRating * 100) / 100}`,
            '',
            '■ グループ別統計',
            'グループ,利用者数,総利用回数,総売上,平均評価',
            ...groupSummary.map(s =>
                `"${s.group}","${s.userCount}","${s.totalMeals}","${s.totalRevenue}","${s.averageRating}"`
            ),
            '',
            '■ 評価分析',
            `平均評価: ${ratingAnalysis.averageRating}`,
            `総評価件数: ${ratingAnalysis.totalRecords}`,
            '評価,件数,割合(%)',
            ...ratingAnalysis.ratingDistribution.map(d =>
                `"${d.rating}","${d.count}","${d.percentage}"`
            ),
            '',
            '■ メニュー別評価（上位10件）',
            'メニュー名,平均評価,評価件数',
            ...ratingAnalysis.menuRatingCorrelation.slice(0, 10).map(m =>
                `"${m.menuName}","${m.averageRating}","${m.count}"`
            )
        ].join('\n');

        const filename = `統合レポート_${format(currentDate, 'yyyyMMdd')}.csv`;
        downloadCSV('\uFEFF' + csvContent, filename);
    } catch (error) {
        console.error('統合レポートCSV出力エラー:', error);
        throw error;
    }
};

// 統計レポートの出力
export const exportStatisticsReport = (
    statisticsData: any,
    startDate: Date,
    endDate: Date
): void => {
    try {
        const periodText = startDate && endDate
            ? `${format(startDate, 'yyyy年MM月dd日')} 〜 ${format(endDate, 'yyyy年MM月dd日')}`
            : '全期間';

        // 基本統計情報
        const basicStatsHeaders = ['項目', '値'];
        const basicStatsRows = [
            ['分析期間', periodText],
            ['総利用者数', `${statisticsData.totalUsers}名`],
            ['総注文数', `${statisticsData.totalOrders}件`],
            ['総売上', `${statisticsData.totalRevenue.toLocaleString()}円`],
            ['平均評価', `${statisticsData.averageRating}点`],
        ];

        // 日別統計
        const dailyHeaders = ['日付', '注文数', '評価数', '平均評価', '売上'];
        const dailyRows = statisticsData.dailyOrders.map((day: any) => [
            format(new Date(day.date), 'yyyy年MM月dd日'),
            day.orderCount.toString(),
            day.evaluationCount.toString(),
            day.averageRating.toFixed(1),
            `${day.totalRevenue.toLocaleString()}円`
        ]);

        // 評価分布
        const ratingHeaders = ['評価', '件数', '割合(%)'];
        const ratingRows = statisticsData.userRatings.map((rating: any) => [
            `${rating.rating}点`,
            rating.count.toString(),
            `${rating.percentage}%`
        ]);

        // メニュー人気度
        const menuHeaders = ['メニュー', '注文数', '平均評価', '割合(%)'];
        const menuRows = statisticsData.menuPopularity.map((menu: any) => [
            menu.menuType,
            menu.count.toString(),
            menu.averageRating.toFixed(1),
            `${menu.percentage}%`
        ]);

        // 月次トレンド
        const trendHeaders = ['月', '注文数', '平均評価', '売上'];
        const trendRows = statisticsData.monthlyTrends.map((trend: any) => [
            format(new Date(trend.month + '-01'), 'yyyy年MM月'),
            trend.orderCount.toString(),
            trend.averageRating.toFixed(1),
            `${trend.revenue.toLocaleString()}円`
        ]);

        // CSV作成
        const csvContent = [
            `あおば就労移行支援事業所 統計分析レポート`,
            `作成日時: ${format(new Date(), 'yyyy年MM月dd日 HH:mm')}`,
            '',
            '■ 基本統計情報',
            basicStatsHeaders.join(','),
            ...basicStatsRows.map((row: string[]) => row.map((cell: string) => `"${cell}"`).join(',')),
            '',
            '■ 日別統計',
            dailyHeaders.join(','),
            ...dailyRows.map((row: string[]) => row.map((cell: string) => `"${cell}"`).join(',')),
            '',
            '■ 評価分布',
            ratingHeaders.join(','),
            ...ratingRows.map((row: string[]) => row.map((cell: string) => `"${cell}"`).join(',')),
            '',
            '■ メニュー人気度',
            menuHeaders.join(','),
            ...menuRows.map((row: string[]) => row.map((cell: string) => `"${cell}"`).join(',')),
            '',
            '■ 月次トレンド',
            trendHeaders.join(','),
            ...trendRows.map((row: string[]) => row.map((cell: string) => `"${cell}"`).join(','))
        ].join('\n');

        const filename = `統計分析レポート_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`;
        downloadCSV('\uFEFF' + csvContent, filename);
    } catch (error) {
        console.error('統計レポートCSV出力エラー:', error);
        throw error;
    }
}; 