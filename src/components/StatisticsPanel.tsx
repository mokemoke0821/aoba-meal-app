import {
    ArrowBack as ArrowBackIcon,
    Download as DownloadIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Fab,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { format } from 'date-fns';
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
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { useApp } from '../contexts/AppContext';
import { exportStatisticsReport } from '../utils/csvExport';
import {
    calculateOverallStatistics,
    calculateTodayStats,
    StatisticsData,
} from '../utils/statisticsCalculator';
import DateRangeFilter, { DateRange } from './DateRangeFilter';

interface StatisticsPanelProps {
    onBack: () => void;
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ onBack }) => {
    const { state } = useApp();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [dateRange, setDateRange] = useState<DateRange>({
        startDate: null,
        endDate: null,
    });
    const [statisticsData, setStatisticsData] = useState<StatisticsData | null>(null);

    // 今日の統計（リアルタイム）
    const todayStats = useMemo(
        () => calculateTodayStats(state.mealRecords),
        [state.mealRecords]
    );

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
        }
    }, [state.mealRecords, state.users, dateRange]);

    const handleDateRangeChange = (newRange: DateRange) => {
        setDateRange(newRange);
    };

    const handleApplyFilter = () => {
        // フィルターは useEffect で自動適用される
    };

    const handleRefresh = () => {
        // 強制的に再計算
        const stats = calculateOverallStatistics(
            state.mealRecords,
            state.users,
            dateRange.startDate || undefined,
            dateRange.endDate || undefined
        );
        setStatisticsData(stats);
    };

    const handleExportReport = () => {
        try {
            if (statisticsData) {
                exportStatisticsReport(
                    statisticsData,
                    dateRange.startDate || new Date(),
                    dateRange.endDate || new Date()
                );
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('レポート出力中にエラーが発生しました');
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

    const ratingColors = {
        1: '#ef5350', // 赤
        2: '#ff9800', // オレンジ
        3: '#ffeb3b', // 黄色
        4: '#4caf50', // 緑
        5: '#2196f3', // 青
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

                <Box sx={{ display: 'flex', gap: 1 }}>
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
                        CSV出力
                    </Button>
                </Box>
            </Box>

            {/* 期間フィルター */}
            <Box sx={{ p: 3 }}>
                <DateRangeFilter
                    dateRange={dateRange}
                    onDateRangeChange={handleDateRangeChange}
                    onApplyFilter={handleApplyFilter}
                />
            </Box>

            {/* 今日の統計カード */}
            <Box sx={{ px: 3, mb: 3 }}>
                <Card sx={{ borderRadius: '16px', boxShadow: theme.shadows[3] }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
                            📈 今日の状況 ({format(new Date(), 'MM月dd日')})
                        </Typography>
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
                                gap: 2,
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
                                    評価待ち
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 700 }}>
                                    {todayStats.completedEvaluations}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    評価済み
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" sx={{ color: 'secondary.main', fontWeight: 700 }}>
                                    {todayStats.averageRating.toFixed(1)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    平均評価
                                </Typography>
                            </Box>
                        </Box>
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
                                label={`総売上: ${statisticsData.totalRevenue.toLocaleString()}円`}
                                color="success"
                                variant="outlined"
                            />
                            <Chip
                                label={`平均評価: ${statisticsData.averageRating}点`}
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
                                    name="評価数"
                                    dot={{ fill: chartColors[1], strokeWidth: 2, r: 3 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </Box>

            {/* 評価分布グラフ */}
            <Box sx={{ px: 3, mb: 3 }}>
                <Card sx={{ borderRadius: '16px', boxShadow: theme.shadows[3] }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
                            ⭐ 評価分布
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={statisticsData.userRatings}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="rating"
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => `${value}点`}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="count" name="件数">
                                    {statisticsData.userRatings.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={ratingColors[entry.rating as keyof typeof ratingColors]}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </Box>

            {/* メニュー人気度グラフ */}
            <Box sx={{ px: 3, mb: 3 }}>
                <Card sx={{ borderRadius: '16px', boxShadow: theme.shadows[3] }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
                            🍽️ メニュー人気度
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={statisticsData.menuPopularity}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                    nameKey="menuType"
                                >
                                    {statisticsData.menuPopularity.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
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
                                    name="売上"
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

            {/* 戻るボタン（フローティング） */}
            <Fab
                color="secondary"
                onClick={onBack}
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    width: 64,
                    height: 64,
                    zIndex: 1000,
                }}
            >
                <ArrowBackIcon sx={{ fontSize: 32 }} />
            </Fab>
        </Box>
    );
};

export default StatisticsPanel;
