import {
    CalendarMonth as CalendarMonthIcon,
    CheckCircle as CheckCircleIcon,
    Download as DownloadIcon,
    ExpandMore as ExpandMoreIcon,
    HourglassEmpty as HourglassEmptyIcon,
    MonetizationOn as MonetizationOnIcon,
    Refresh as RefreshIcon,
    RemoveCircle as RemoveCircleIcon,
    Today as TodayIcon
} from '@mui/icons-material';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { useApp } from '../contexts/AppContext';
import { useNotification } from '../contexts/NotificationContext';
import {
    exportMonthlyReportCSV,
    exportPeriodReportCSV,
    exportStatisticsCSV,
    exportUsersCSV
} from '../utils/csvExport';
import {
    calculateOverallStatistics,
    calculateTodayStats,
    StatisticsData,
} from '../utils/statisticsCalculator';
import BackButton from './common/BackButton';
import { DataDiagnosticsPanel } from './DataDiagnosticsPanel';
import { DataManagementPanel } from './DataManagementPanel';
import DateRangeFilter, { DateRange } from './DateRangeFilter';

interface MonthlyPaidUserStats {
    month: string;                    // 'yyyy-MM'形式
    users: Array<{
        userId: string;
        userName: string;
        category: string;               // 'A型' | '職員' | '体験者'
        orderCount: number;            // 月次利用回数
        totalCost: number;             // 月次費用合計
        averageEatingRatio: number;    // 月次平均食べた量
    }>;
    totalOrderCount: number;         // 月合計注文数
    totalRevenue: number;           // 月合計料金記録
}

interface StatisticsPanelProps {
    onBack: () => void;
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ onBack }) => {
    const { state } = useApp();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { showSuccess, showError, showWarning } = useNotification();

    const [dateRange, setDateRange] = useState<DateRange>({
        startDate: null,
        endDate: null,
    });
    const [statisticsData, setStatisticsData] = useState<StatisticsData | null>(null);

    // 有料ユーザー判定関数
    const isPaidUser = (userCategory: string) => {
        return ['A型', '体験者', '職員'].includes(userCategory);
    };

    // 今日の統計（リアルタイム）
    const todayStats = useMemo(
        () => calculateTodayStats(state.mealRecords),
        [state.mealRecords]
    );

    // 今日の有料ユーザー統計計算
    const todayPaidStats = useMemo(() => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const todayRecords = state.mealRecords.filter(record => record.date === today);
        const paidRecords = todayRecords.filter(record => isPaidUser(record.userCategory));

        return {
            totalPaidOrders: paidRecords.length,
            totalPaidRevenue: paidRecords.reduce((sum, record) => sum + record.price, 0),
            averagePaidEatingRatio: paidRecords.length > 0
                ? parseFloat((paidRecords.reduce((sum, record) => sum + record.eatingRatio, 0) / paidRecords.length).toFixed(1))
                : 0
        };
    }, [state.mealRecords]);

    // 本日の利用者状況（3つの状態に分類）
    const todayUserStatus = useMemo(() => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const todayRecords = state.mealRecords.filter(record => record.date === today);

        // アクティブな利用者のみ対象
        const activeUsers = state.users.filter(user => user.isActive !== false);

        // 記録済み利用者（eatingRatio: 1-10）
        const completedRecords = todayRecords.filter(record =>
            record.eatingRatio >= 1 && record.eatingRatio <= 10
        );
        const completedUserIds = new Set(completedRecords.map(record => record.userId));

        // 記録待ち利用者（eatingRatio: 0）
        const pendingRecords = todayRecords.filter(record =>
            record.eatingRatio === 0
        );
        const pendingUserIds = new Set(pendingRecords.map(record => record.userId));

        // 注文なし利用者（MealRecordなし）
        const orderedUserIds = new Set(todayRecords.map(record => record.userId));

        // 各状態の利用者を取得
        const completed = activeUsers.filter(user => completedUserIds.has(user.id));
        const pending = activeUsers.filter(user => pendingUserIds.has(user.id));
        const noOrder = activeUsers.filter(user => !orderedUserIds.has(user.id));

        // カテゴリごとにグループ化するヘルパー関数
        const groupByCategory = (users: typeof activeUsers) => {
            const grouped = users.reduce((acc, user) => {
                if (!acc[user.category]) {
                    acc[user.category] = [];
                }
                acc[user.category].push(user);
                return acc;
            }, {} as Record<string, typeof users>);

            // 各カテゴリ内で表示番号順にソート
            Object.values(grouped).forEach(categoryUsers => {
                categoryUsers.sort((a, b) => a.displayNumber - b.displayNumber);
            });

            return grouped;
        };

        return {
            completed: groupByCategory(completed),
            pending: groupByCategory(pending),
            noOrder: groupByCategory(noOrder),
            completedCount: completed.length,
            pendingCount: pending.length,
            noOrderCount: noOrder.length,
        };
    }, [state.users, state.mealRecords]);

    // 後方互換性のため、pendingUsers を残す
    const pendingUsers = todayUserStatus.pending;

    // 月次有料ユーザー統計計算
    const monthlyPaidUserStats = useMemo(() => {
        const monthlyStats: { [key: string]: MonthlyPaidUserStats } = {};

        // 過去6ヶ月分のデータを準備
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = format(date, 'yyyy-MM');
            monthlyStats[monthKey] = {
                month: monthKey,
                users: [],
                totalOrderCount: 0,
                totalRevenue: 0
            };
        }

        // 有料ユーザーのデータをグループ化
        const paidRecords = state.mealRecords.filter(record => isPaidUser(record.userCategory));

        paidRecords.forEach(record => {
            try {
                const recordDate = parseISO(record.date);
                const monthKey = format(recordDate, 'yyyy-MM');

                if (monthlyStats[monthKey]) {
                    const existingUser = monthlyStats[monthKey].users.find(u => u.userId === record.userId);

                    if (existingUser) {
                        existingUser.orderCount++;
                        existingUser.totalCost += record.price;
                        existingUser.averageEatingRatio = parseFloat(
                            ((existingUser.averageEatingRatio * (existingUser.orderCount - 1) + record.eatingRatio) / existingUser.orderCount).toFixed(1)
                        );
                    } else {
                        monthlyStats[monthKey].users.push({
                            userId: record.userId,
                            userName: record.userName,
                            category: record.userCategory,
                            orderCount: 1,
                            totalCost: record.price,
                            averageEatingRatio: record.eatingRatio
                        });
                    }

                    monthlyStats[monthKey].totalOrderCount++;
                    monthlyStats[monthKey].totalRevenue += record.price;
                }
            } catch (error) {
                console.warn('日付の解析に失敗しました:', record.date, error);
            }
        });

        // 各月のユーザーを費用順でソート
        Object.values(monthlyStats).forEach(stat => {
            stat.users.sort((a, b) => b.totalCost - a.totalCost);
        });

        return Object.values(monthlyStats).reverse(); // 新しい月から表示
    }, [state.mealRecords]);

    // 統計データの計算
    useEffect(() => {
        try {
            const stats = calculateOverallStatistics(
                state.mealRecords,
                state.users,
                dateRange.startDate || undefined,
                dateRange.endDate || undefined
            );
            setStatisticsData(stats);
        } catch (error) {
            console.error('Statistics calculation error:', error);
            // デフォルト統計データを設定
            setStatisticsData({
                dailyOrders: [],
                eatingRatioDistribution: [
                    { ratio: 1, count: 0, percentage: 0, label: '1割程度' },
                    { ratio: 2, count: 0, percentage: 0, label: '2割程度' },
                    { ratio: 3, count: 0, percentage: 0, label: '3割程度' },
                    { ratio: 4, count: 0, percentage: 0, label: '4割程度' },
                    { ratio: 5, count: 0, percentage: 0, label: '5割程度' },
                    { ratio: 6, count: 0, percentage: 0, label: '6割程度' },
                    { ratio: 7, count: 0, percentage: 0, label: '7割程度' },
                    { ratio: 8, count: 0, percentage: 0, label: '8割程度' },
                    { ratio: 9, count: 0, percentage: 0, label: '9割程度' },
                    { ratio: 10, count: 0, percentage: 0, label: '完食' },
                ],
                monthlyTrends: [],
                totalUsers: state.users.length,
                totalOrders: 0,
                totalRevenue: 0,
                averageEatingRatio: 0,
            });
        }
    }, [state.mealRecords, state.users, dateRange]);


    const handleRefresh = () => {
        try {
            const stats = calculateOverallStatistics(
                state.mealRecords,
                state.users,
                dateRange.startDate || undefined,
                dateRange.endDate || undefined
            );
            setStatisticsData(stats);
        } catch (error) {
            console.error('Statistics refresh error:', error);
            showError('統計データの更新中にエラーが発生しました');
        }
    };

    const handleExportReport = () => {
        try {
            if (statisticsData) {
                // 統計データCSV出力
                exportStatisticsCSV(
                    state.mealRecords,
                    state.users,
                    dateRange.startDate || undefined,
                    dateRange.endDate || undefined
                );

                // 成功メッセージ
                showSuccess('📊 統計データをCSVファイルとしてダウンロードしました');
            } else {
                showWarning('出力するデータがありません');
            }
        } catch (error) {
            console.error('CSV出力エラー:', error);
            showError('CSV出力中にエラーが発生しました');
        }
    };

    // 利用者CSVエクスポート
    const handleExportUsers = () => {
        try {
            exportUsersCSV(state.users);
            showSuccess('👥 利用者データをCSVファイルとしてダウンロードしました');
        } catch (error) {
            console.error('CSV出力エラー:', error);
            showError('CSV出力中にエラーが発生しました');
        }
    };

    // 月次CSVエクスポート
    const handleExportMonthly = () => {
        try {
            const now = new Date();
            exportMonthlyReportCSV(state.mealRecords, now.getFullYear(), now.getMonth() + 1);
            showSuccess('📅 月次レポートをCSVファイルとしてダウンロードしました');
        } catch (error) {
            console.error('CSV出力エラー:', error);
            showError('CSV出力中にエラーが発生しました');
        }
    };

    // 期間指定CSVエクスポート
    const handleExportPeriodReport = () => {
        try {
            if (dateRange.startDate && dateRange.endDate) {
                exportPeriodReportCSV(
                    state.mealRecords,
                    state.users,
                    dateRange.startDate,
                    dateRange.endDate
                );
                showSuccess('📋 期間指定レポートをCSVファイルとしてダウンロードしました');
            } else {
                showWarning('開始日と終了日を両方とも選択してください');
            }
        } catch (error) {
            console.error('CSV出力エラー:', error);
            showError('CSV出力中にエラーが発生しました');
        }
    };

    // グラフの色設定
    const chartColors = [
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.success.main,
        theme.palette.warning.main,
        theme.palette.error.main,
    ];

    // 食べた量色設定
    const eatingRatioColors = {
        1: '#f44336', 2: '#ff5722', 3: '#ff9800', 4: '#ffb300', 5: '#ffc107',
        6: '#ffeb3b', 7: '#8bc34a', 8: '#4caf50', 9: '#2196f3', 10: '#009688'
    };

    // カテゴリ別色設定
    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'A型': return theme.palette.primary.main;
            case '職員': return theme.palette.warning.main;
            case '体験者': return theme.palette.secondary.main;
            default: return theme.palette.grey[500];
        }
    };

    // カスタムツールチップ
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <Box
                    sx={{
                        backgroundColor: 'background.paper',
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: '8px',
                        p: 2,
                        boxShadow: theme.shadows[3],
                    }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        {label}
                    </Typography>
                    {payload.map((entry: any, index: number) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                                sx={{
                                    width: 12,
                                    height: 12,
                                    backgroundColor: entry.color,
                                    borderRadius: '50%',
                                }}
                            />
                            <Typography variant="body2">
                                {entry.name}: {entry.value}
                                {entry.dataKey === 'averageRating' && '点'}
                                {entry.dataKey === 'totalRevenue' && '円'}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            );
        }
        return null;
    };

    if (!statisticsData) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6">統計データを読み込み中...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', pb: 10 }}>
            {/* ヘッダー */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 3,
                    backgroundColor: 'background.paper',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <BackButton
                        text="← 管理画面に戻る"
                        onClick={onBack}
                        sx={{ position: 'relative', margin: 0 }}
                        aria-label="管理画面に戻る"
                    />
                    <Typography
                        variant={isMobile ? 'h5' : 'h4'}
                        component="h1"
                        sx={{
                            color: 'primary.main',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                        }}
                    >
                        📊 統計・分析
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={handleRefresh}
                        sx={{ borderRadius: '8px' }}
                    >
                        更新
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={handleExportReport}
                        sx={{ borderRadius: '8px' }}
                    >
                        統計CSV
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleExportUsers}
                        sx={{ borderRadius: '8px' }}
                        size={isMobile ? 'small' : 'medium'}
                    >
                        利用者CSV
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleExportMonthly}
                        sx={{ borderRadius: '8px' }}
                        size={isMobile ? 'small' : 'medium'}
                    >
                        月次CSV
                    </Button>
                </Box>
            </Box>

            {/* 期間指定フィルター */}
            <Box sx={{ px: 3, pt: 3 }}>
                <DateRangeFilter
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                    onExport={handleExportPeriodReport}
                />
            </Box>

            {/* 今日の統計カード（改善版） */}
            <Box sx={{ px: 3, mb: 3 }}>
                <Card sx={{ borderRadius: '16px', boxShadow: theme.shadows[3] }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TodayIcon /> 今日の状況 ({format(new Date(), 'MM月dd日')})
                        </Typography>

                        {/* 全体統計 */}
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                            📊 全体統計
                        </Typography>
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                                gap: 2,
                                mb: 3,
                            }}
                        >
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700 }}>
                                    {todayStats.totalOrders}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    注文数
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 700 }}>
                                    {todayStats.pendingEvaluations}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    記録待ち
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 700 }}>
                                    {todayStats.completedEvaluations}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    記録完了
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" sx={{ color: 'secondary.main', fontWeight: 700 }}>
                                    {todayStats.averageRating.toFixed(1)}割
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    平均食べた量
                                </Typography>
                            </Box>
                        </Box>

                        {/* 有料ユーザー統計 */}
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MonetizationOnIcon /> 有料ユーザー統計
                        </Typography>
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: 2,
                            }}
                        >
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" sx={{ color: 'info.main', fontWeight: 700 }}>
                                    {todayPaidStats.totalPaidOrders}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    有料注文数
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 700 }}>
                                    ¥{todayPaidStats.totalPaidRevenue.toLocaleString()}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    本日料金記録
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 700 }}>
                                    {todayPaidStats.averagePaidEatingRatio.toFixed(1)}割
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    有料平均食べた量
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            {/* 月次有料ユーザー統計カード（新規追加） */}
            <Box sx={{ px: 3, mb: 3 }}>
                <Card sx={{ borderRadius: '16px', boxShadow: theme.shadows[3] }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarMonthIcon /> 月次有料ユーザー統計（過去6ヶ月）
                        </Typography>

                        {monthlyPaidUserStats.map((monthStat, index) => (
                            <Accordion
                                key={monthStat.month}
                                sx={{
                                    mb: 1,
                                    borderRadius: '8px !important',
                                    '&:before': { display: 'none' },
                                    boxShadow: theme.shadows[1]
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    sx={{
                                        backgroundColor: theme.palette.grey[50],
                                        borderRadius: '8px',
                                        '&.Mui-expanded': {
                                            borderBottomLeftRadius: 0,
                                            borderBottomRightRadius: 0,
                                        }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                            {format(new Date(monthStat.month + '-01'), 'yyyy年MM月')}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Chip
                                                label={`${monthStat.totalOrderCount}件`}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                            <Chip
                                                label={`¥${monthStat.totalRevenue.toLocaleString()}`}
                                                size="small"
                                                color="success"
                                                variant="outlined"
                                            />
                                        </Box>
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails sx={{ p: 0 }}>
                                    {monthStat.users.length > 0 ? (
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>利用者名</TableCell>
                                                        <TableCell>カテゴリ</TableCell>
                                                        <TableCell align="right">利用回数</TableCell>
                                                        <TableCell align="right">費用合計</TableCell>
                                                        <TableCell align="right">平均食べた量</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {monthStat.users.map((user) => (
                                                        <TableRow key={user.userId}>
                                                            <TableCell>{user.userName}</TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={user.category === 'A型' ? 'A型利用者' : user.category === '体験者' ? '体験利用者' : user.category}
                                                                    size="small"
                                                                    sx={{
                                                                        backgroundColor: getCategoryColor(user.category),
                                                                        color: 'white',
                                                                        fontWeight: 600
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell align="right">{user.orderCount}回</TableCell>
                                                            <TableCell align="right">¥{user.totalCost.toLocaleString()}</TableCell>
                                                            <TableCell align="right">{user.averageEatingRatio.toFixed(1)}割</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    ) : (
                                        <Box sx={{ p: 3, textAlign: 'center' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                この月のデータはありません
                                            </Typography>
                                        </Box>
                                    )}
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </CardContent>
                </Card>
            </Box>

            {/* 本日の利用者状況（3つの状態で表示） */}
            <Box sx={{ px: 3, mb: 3 }}>
                <Card sx={{ borderRadius: '16px', boxShadow: theme.shadows[3] }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                            📋 本日の利用者状況
                        </Typography>

                        {/* 状態サマリー */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                            <Chip
                                icon={<CheckCircleIcon />}
                                label={`記録完了: ${todayUserStatus.completedCount}名`}
                                color="success"
                                sx={{ fontWeight: 600, fontSize: '1rem', py: 2.5 }}
                            />
                            <Chip
                                icon={<HourglassEmptyIcon />}
                                label={`記録待ち: ${todayUserStatus.pendingCount}名`}
                                color="warning"
                                sx={{ fontWeight: 600, fontSize: '1rem', py: 2.5 }}
                            />
                            <Chip
                                icon={<RemoveCircleIcon />}
                                label={`注文なし: ${todayUserStatus.noOrderCount}名`}
                                color="default"
                                sx={{ fontWeight: 600, fontSize: '1rem', py: 2.5 }}
                            />
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        {/* 記録完了 */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'success.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CheckCircleIcon /> 記録完了（{todayUserStatus.completedCount}名）
                            </Typography>
                            {todayUserStatus.completedCount === 0 ? (
                                <Alert severity="info" sx={{ borderRadius: '8px' }}>
                                    記録完了した利用者はまだいません
                                </Alert>
                            ) : (
                                <Box>
                                    {Object.entries(todayUserStatus.completed).map(([category, users]) => (
                                        <Box key={category} sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Chip label={category} size="small" sx={{ backgroundColor: getCategoryColor(category), color: 'white', fontWeight: 600 }} />
                                                <span>({users.length}名)</span>
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                {users.map((user) => (
                                                    <Chip
                                                        key={user.id}
                                                        label={`${user.displayNumber} ${user.name}`}
                                                        size="medium"
                                                        sx={{
                                                            backgroundColor: 'success.light',
                                                            color: 'success.dark',
                                                            fontWeight: 600,
                                                            '&:hover': { backgroundColor: 'success.main', color: 'white' }
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        {/* 記録待ち */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'warning.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <HourglassEmptyIcon /> 記録待ち（{todayUserStatus.pendingCount}名）
                            </Typography>
                            {todayUserStatus.pendingCount === 0 ? (
                                <Alert severity="success" sx={{ borderRadius: '8px' }}>
                                    ✅ 記録待ちの利用者はいません！
                                </Alert>
                            ) : (
                                <Box>
                                    {Object.entries(todayUserStatus.pending).map(([category, users]) => (
                                        <Box key={category} sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Chip label={category} size="small" sx={{ backgroundColor: getCategoryColor(category), color: 'white', fontWeight: 600 }} />
                                                <span>({users.length}名)</span>
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                {users.map((user) => (
                                                    <Chip
                                                        key={user.id}
                                                        label={`${user.displayNumber} ${user.name}`}
                                                        size="medium"
                                                        sx={{
                                                            backgroundColor: 'warning.light',
                                                            color: 'warning.dark',
                                                            fontWeight: 600,
                                                            '&:hover': { backgroundColor: 'warning.main', color: 'white' }
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        {/* 注文なし */}
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <RemoveCircleIcon /> 注文なし（{todayUserStatus.noOrderCount}名）
                            </Typography>
                            {todayUserStatus.noOrderCount === 0 ? (
                                <Alert severity="info" sx={{ borderRadius: '8px' }}>
                                    全員が給食を注文しています
                                </Alert>
                            ) : (
                                <Box>
                                    {Object.entries(todayUserStatus.noOrder).map(([category, users]) => (
                                        <Box key={category} sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Chip label={category} size="small" sx={{ backgroundColor: getCategoryColor(category), color: 'white', fontWeight: 600 }} />
                                                <span>({users.length}名)</span>
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                {users.map((user) => (
                                                    <Chip
                                                        key={user.id}
                                                        label={`${user.displayNumber} ${user.name}`}
                                                        size="medium"
                                                        sx={{
                                                            backgroundColor: 'grey.300',
                                                            color: 'text.secondary',
                                                            fontWeight: 600,
                                                            '&:hover': { backgroundColor: 'grey.400' }
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            {/* 記録待ち利用者リスト（旧版 - 後方互換性のため残す） */}
            <Box sx={{ px: 3, mb: 3 }}>
                <Card sx={{ borderRadius: '16px', boxShadow: theme.shadows[3], border: '2px solid', borderColor: 'warning.main' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6" sx={{ color: 'warning.main', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <HourglassEmptyIcon /> 本日の記録待ち利用者（簡易版）
                            </Typography>
                            <Chip
                                label={`${Object.values(pendingUsers).flat().length}名`}
                                color="warning"
                                sx={{ fontWeight: 600 }}
                            />
                        </Box>

                        {Object.values(pendingUsers).flat().length === 0 ? (
                            <Alert severity="success" sx={{ borderRadius: '8px' }}>
                                ✅ 本日は全員の記録が完了しています！
                            </Alert>
                        ) : (
                            <Box>
                                {Object.entries(pendingUsers).map(([category, users]) => (
                                    <Box key={category} sx={{ mb: 2 }}>
                                        <Typography
                                            variant="subtitle2"
                                            sx={{
                                                mb: 1,
                                                color: 'text.secondary',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}
                                        >
                                            <Chip
                                                label={category}
                                                size="small"
                                                sx={{
                                                    backgroundColor: getCategoryColor(category),
                                                    color: 'white',
                                                    fontWeight: 600
                                                }}
                                            />
                                            <span>({users.length}名)</span>
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {users.map((user) => (
                                                <Chip
                                                    key={user.id}
                                                    label={`${user.displayNumber} ${user.name}`}
                                                    variant="outlined"
                                                    size="medium"
                                                    sx={{
                                                        borderColor: getCategoryColor(category),
                                                        color: getCategoryColor(category),
                                                        fontWeight: 500,
                                                        '&:hover': {
                                                            backgroundColor: `${getCategoryColor(category)}15`,
                                                            borderWidth: 2
                                                        }
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                ))}
                                <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                                    <Typography variant="caption" color="text.secondary">
                                        💡 ヒント: 記録画面から利用者を選択して摂食量を記録してください
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Box>

            {/* 統計サマリー */}
            <Box sx={{ px: 3, mb: 3 }}>
                <Card sx={{ borderRadius: '16px', boxShadow: theme.shadows[3] }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
                            📋 期間統計サマリー
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                            <Chip
                                label={`総利用者数: ${statisticsData.totalUsers}名`}
                                color="primary"
                                variant="outlined"
                            />
                            <Chip
                                label={`総注文数: ${statisticsData.totalOrders}件`}
                                color="secondary"
                                variant="outlined"
                            />
                            <Chip
                                label={`料金記録合計: ${statisticsData.totalRevenue.toLocaleString()}円`}
                                color="success"
                                variant="outlined"
                            />
                            <Chip
                                label={`平均食べた量: ${statisticsData.averageEatingRatio}割`}
                                color="warning"
                                variant="outlined"
                            />
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            {/* 日別注文数グラフ */}
            <Box sx={{ px: 3, mb: 3 }}>
                <Card sx={{ borderRadius: '16px', boxShadow: theme.shadows[3] }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
                            📅 日別注文数推移
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={statisticsData.dailyOrders}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => format(new Date(value), 'MM/dd')}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="orderCount"
                                    stroke={chartColors[0]}
                                    strokeWidth={3}
                                    name="注文数"
                                    dot={{ fill: chartColors[0], strokeWidth: 2, r: 4 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="evaluationCount"
                                    stroke={chartColors[1]}
                                    strokeWidth={2}
                                    name="記録数"
                                    dot={{ fill: chartColors[1], strokeWidth: 2, r: 3 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </Box>

            {/* 食べた量分布グラフ */}
            <Box sx={{ px: 3, mb: 3 }}>
                <Card sx={{ borderRadius: '16px', boxShadow: theme.shadows[3] }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
                            🍽️ 食べた量分布
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={statisticsData.eatingRatioDistribution}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 12 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="count" name="件数">
                                    {statisticsData.eatingRatioDistribution.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={eatingRatioColors[entry.ratio as keyof typeof eatingRatioColors]}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                ※ 1割（少量）から10割（完食）までの食べた量分布
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            {/* 月次トレンドグラフ */}
            <Box sx={{ px: 3, mb: 3 }}>
                <Card sx={{ borderRadius: '16px', boxShadow: theme.shadows[3] }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
                            📈 月次トレンド（過去6ヶ月）
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={statisticsData.monthlyTrends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => format(new Date(value + '-01'), 'MM月')}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="orderCount"
                                    stackId="1"
                                    stroke={chartColors[0]}
                                    fill={chartColors[0]}
                                    fillOpacity={0.6}
                                    name="注文数"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stackId="2"
                                    stroke={chartColors[2]}
                                    fill={chartColors[2]}
                                    fillOpacity={0.4}
                                    name="料金記録"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </Box>

            {state.mealRecords.length === 0 && (
                <Box sx={{ px: 3, mb: 3 }}>
                    <Alert severity="info" sx={{ borderRadius: '8px' }}>
                        📊 まだデータがありません。給食の注文や評価が行われると、統計データが表示されます。
                    </Alert>
                </Box>
            )}

            {/* データ診断パネル */}
            <Box sx={{ px: 3, mb: 3 }}>
                <DataDiagnosticsPanel />
            </Box>

            {/* データ管理パネル */}
            <Box sx={{ px: 3, mb: 3 }}>
                <DataManagementPanel />
            </Box>

        </Box>
    );
};

export default StatisticsPanel;
