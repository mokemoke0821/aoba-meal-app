import { format } from 'date-fns';
import { MealRecord, User, UserCategory } from '../types';

// CSV出力用の基本ユーティリティ
export const downloadCSV = (filename: string, csvContent: string): void => {
    const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};

// CSVセル値をエスケープする関数
const escapeCsvValue = (value: any): string => {
    if (value === null || value === undefined) {
        return '';
    }
    const stringValue = String(value);
    // カンマ、ダブルクォート、改行が含まれている場合はダブルクォートで囲む
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
};

// 統計データCSV出力
export const exportStatisticsCSV = (
    mealRecords: MealRecord[],
    users: User[],
    startDate?: Date,
    endDate?: Date
): void => {
    const dateRange = startDate && endDate
        ? `_${format(startDate, 'yyyy-MM-dd')}_${format(endDate, 'yyyy-MM-dd')}`
        : '';
    const filename = `あおば給食統計${dateRange}_${format(new Date(), 'yyyy-MM-dd_HHmm')}.csv`;

    // フィルタリング
    let filteredRecords = mealRecords;
    if (startDate && endDate) {
        filteredRecords = mealRecords.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate >= startDate && recordDate <= endDate;
        });
    }

    // ユーザー情報マップを作成
    const userMap = new Map(users.map(user => [user.id, user]));

    // CSV内容生成
    const headers = [
        '日付',
        '利用者名',
        '表示番号',
        'カテゴリ',
        'グループ',
        '摂食量（割）',
        '料金（円）',
        'メニュー',
        '支援記録・備考'
    ];

    const rows = filteredRecords.map(record => {
        const user = userMap.get(record.userId);
        return [
            record.date,
            record.userName,
            user?.displayNumber || '',
            record.userCategory,
            record.userGroup,
            record.eatingRatio,
            record.price,
            record.menuName || '',
            record.supportNotes || ''
        ];
    });

    const csvContent = [
        headers.map(h => escapeCsvValue(h)).join(','),
        ...rows.map(row => row.map(cell => escapeCsvValue(cell)).join(','))
    ].join('\n');

    downloadCSV(filename, csvContent);
};

// 利用者データCSV出力
export const exportUsersCSV = (users: User[]): void => {
    const filename = `あおば利用者一覧_${format(new Date(), 'yyyy-MM-dd_HHmm')}.csv`;

    const headers = [
        '表示番号',
        '利用者名',
        'カテゴリ',
        'グループ',
        '料金（円）',
        '登録日',
        'アクティブ',
        '体験利用者',
        '備考'
    ];

    const activeUsers = users.filter(user => user.isActive !== false);

    const rows = activeUsers
        .sort((a, b) => a.displayNumber - b.displayNumber)
        .map(user => [
            user.displayNumber,
            user.name,
            user.category,
            user.group,
            user.price,
            user.createdAt ? format(new Date(user.createdAt), 'yyyy/MM/dd') : '',
            user.isActive !== false ? 'はい' : 'いいえ',
            user.trialUser ? 'はい' : 'いいえ',
            user.notes || ''
        ]);

    const csvContent = [
        headers.map(h => escapeCsvValue(h)).join(','),
        ...rows.map(row => row.map(cell => escapeCsvValue(cell)).join(','))
    ].join('\n');

    downloadCSV(filename, csvContent);
};

// 月次料金レポートCSV出力
export const exportMonthlyReportCSV = (
    mealRecords: MealRecord[],
    year: number,
    month: number
): void => {
    const filename = `あおば月次料金レポート_${year}年${month}月_${format(new Date(), 'yyyy-MM-dd_HHmm')}.csv`;

    // 指定月のデータをフィルタリング
    const monthRecords = mealRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getFullYear() === year && recordDate.getMonth() + 1 === month;
    });

    // カテゴリ別集計
    const categoryStats: Record<UserCategory, { count: number; total: number; avgEating: number }> = {
        'A型': { count: 0, total: 0, avgEating: 0 },
        'B型': { count: 0, total: 0, avgEating: 0 },
        '体験者': { count: 0, total: 0, avgEating: 0 },
        '職員': { count: 0, total: 0, avgEating: 0 }
    };

    // 個別記録とカテゴリ別集計の両方を生成
    monthRecords.forEach(record => {
        const category = record.userCategory;
        categoryStats[category].count++;
        categoryStats[category].total += record.price;
        categoryStats[category].avgEating += record.eatingRatio;
    });

    // 平均摂食量計算
    Object.keys(categoryStats).forEach(key => {
        const category = key as UserCategory;
        const stats = categoryStats[category];
        stats.avgEating = stats.count > 0 ? Math.round((stats.avgEating / stats.count) * 10) / 10 : 0;
    });

    // CSV内容生成
    const reportContent = [
        `${year}年${month}月 月次料金レポート`,
        `作成日: ${format(new Date(), 'yyyy年MM月dd日 HH:mm')}`,
        '',
        '【カテゴリ別集計】',
        ['カテゴリ', '利用回数', '料金合計（円）', '平均摂食量（割）'].map(h => escapeCsvValue(h)).join(','),
        ...Object.entries(categoryStats).map(([category, stats]) =>
            [category, stats.count, stats.total, stats.avgEating].map(cell => escapeCsvValue(cell)).join(',')
        ),
        '',
        '【詳細記録】',
        ['日付', '利用者名', 'カテゴリ', '摂食量（割）', '料金（円）', 'メニュー', '備考'].map(h => escapeCsvValue(h)).join(','),
        ...monthRecords
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(record => [
                record.date,
                record.userName,
                record.userCategory,
                record.eatingRatio,
                record.price,
                record.menuName || '',
                record.supportNotes || ''
            ].map(cell => escapeCsvValue(cell)).join(','))
    ].join('\n');

    downloadCSV(filename, reportContent);
};

// 期間指定統計レポートCSV出力
export const exportPeriodReportCSV = (
    mealRecords: MealRecord[],
    users: User[],
    startDate: Date,
    endDate: Date
): void => {
    const filename = `あおば期間レポート_${format(startDate, 'yyyy-MM-dd')}_${format(endDate, 'yyyy-MM-dd')}_${format(new Date(), 'yyyy-MM-dd_HHmm')}.csv`;

    // 期間内のデータをフィルタリング
    const periodRecords = mealRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate;
    });

    // 統計計算
    const totalRecords = periodRecords.length;
    const totalRevenue = periodRecords.reduce((sum, record) => sum + record.price, 0);
    const avgEatingRatio = totalRecords > 0
        ? Math.round((periodRecords.reduce((sum, record) => sum + record.eatingRatio, 0) / totalRecords) * 10) / 10
        : 0;

    // カテゴリ別統計
    const categoryStats: Record<UserCategory, { count: number; total: number; avgEating: number }> = {
        'A型': { count: 0, total: 0, avgEating: 0 },
        'B型': { count: 0, total: 0, avgEating: 0 },
        '体験者': { count: 0, total: 0, avgEating: 0 },
        '職員': { count: 0, total: 0, avgEating: 0 }
    };

    periodRecords.forEach(record => {
        const category = record.userCategory;
        categoryStats[category].count++;
        categoryStats[category].total += record.price;
        categoryStats[category].avgEating += record.eatingRatio;
    });

    // 平均摂食量計算
    Object.keys(categoryStats).forEach(key => {
        const category = key as UserCategory;
        const stats = categoryStats[category];
        stats.avgEating = stats.count > 0 ? Math.round((stats.avgEating / stats.count) * 10) / 10 : 0;
    });

    // CSV内容生成
    const reportContent = [
        `あおば給食 期間レポート`,
        `期間: ${format(startDate, 'yyyy年MM月dd日')} ～ ${format(endDate, 'yyyy年MM月dd日')}`,
        `作成日: ${format(new Date(), 'yyyy年MM月dd日 HH:mm')}`,
        '',
        '【期間サマリー】',
        ['項目', '値'].map(h => escapeCsvValue(h)).join(','),
        ['総利用回数', totalRecords].map(cell => escapeCsvValue(cell)).join(','),
        ['総料金記録', `${totalRevenue}円`].map(cell => escapeCsvValue(cell)).join(','),
        ['平均摂食量', `${avgEatingRatio}割`].map(cell => escapeCsvValue(cell)).join(','),
        '',
        '【カテゴリ別統計】',
        ['カテゴリ', '利用回数', '料金合計（円）', '平均摂食量（割）'].map(h => escapeCsvValue(h)).join(','),
        ...Object.entries(categoryStats).map(([category, stats]) =>
            [category, stats.count, stats.total, stats.avgEating].map(cell => escapeCsvValue(cell)).join(',')
        ),
        '',
        '【詳細記録】',
        ['日付', '利用者名', 'カテゴリ', '摂食量（割）', '料金（円）', 'メニュー', '備考'].map(h => escapeCsvValue(h)).join(','),
        ...periodRecords
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(record => [
                record.date,
                record.userName,
                record.userCategory,
                record.eatingRatio,
                record.price,
                record.menuName || '',
                record.supportNotes || ''
            ].map(cell => escapeCsvValue(cell)).join(','))
    ].join('\n');

    downloadCSV(filename, reportContent);
}; 