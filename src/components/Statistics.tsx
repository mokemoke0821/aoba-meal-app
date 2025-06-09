import {
    ArrowBack as ArrowBackIcon,
    GetApp as GetAppIcon
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Fab,
    MenuItem,
    Tab,
    Tabs,
    TextField,
    Typography,
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import React, { useEffect, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
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
import {
    exportBillingData,
    exportDailyRecords,
    exportMonthlyReport,
    exportRatingAnalysis,
} from '../utils/csvExport';
import {
    analyzeRatings,
    analyzeUsagePatterns,
    calculateGroupSummary,
    calculateMonthlyStats,
    GroupSummary,
    MonthlyStats,
    RatingAnalysis,
    UsagePattern,
} from '../utils/statistics';

interface StatisticsProps {
    onBack: () => void;
}

const Statistics: React.FC<StatisticsProps> = ({ onBack }) => {
    const { state } = useApp();
    const [activeTab, setActiveTab] = useState(0);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
    const [ratingAnalysis, setRatingAnalysis] = useState<RatingAnalysis | null>(null);
    const [groupSummary, setGroupSummary] = useState<GroupSummary[]>([]);
    const [usagePattern, setUsagePattern] = useState<UsagePattern | null>(null);

    // データ計算
    useEffect(() => {
        const stats = calculateMonthlyStats(state.mealRecords, state.users, selectedYear, selectedMonth);
        const ratings = analyzeRatings(state.mealRecords, []);
        const groups = calculateGroupSummary(state.mealRecords, state.users);
        const patterns = analyzeUsagePatterns(state.mealRecords);

        setMonthlyStats(stats);
        setRatingAnalysis(ratings);
        setGroupSummary(groups);
        setUsagePattern(patterns);
    }, [selectedYear, selectedMonth, state.mealRecords, state.users]);

    // 年月リスト生成
    const generateYearOptions = () => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 3 }, (_, i) => currentYear - i);
    };

    const generateMonthOptions = () => {
        return Array.from({ length: 12 }, (_, i) => i + 1);
    };

    // CSV出力
    const handleExport = (type: string) => {
        try {
            switch (type) {
                case 'monthly':
                    exportMonthlyReport(state.mealRecords, state.users, selectedYear, selectedMonth);
                    break;
                case 'rating':
                    exportRatingAnalysis(state.mealRecords, []);
                    break;
                case 'billing':
                    exportBillingData(state.mealRecords, state.users, selectedYear, selectedMonth);
                    break;
                case 'daily':
                    const startDate = format(new Date(selectedYear, selectedMonth - 1, 1), 'yyyy-MM-dd');
                    const endDate = format(new Date(selectedYear, selectedMonth, 0), 'yyyy-MM-dd');
                    exportDailyRecords(state.mealRecords, startDate, endDate);
                    break;
            }
        } catch (error) {
            alert(`出力エラー: ${error}`);
        }
    };

    // グラフデータ準備
    const prepareTrendData = () => {
        if (!ratingAnalysis) return [];
        return ratingAnalysis.satisfactionTrend.map(item => ({
            date: format(parseISO(item.date), 'MM/dd'),
            rating: item.rating,
            count: item.count,
        }));
    };

    const prepareGroupData = () => {
        return groupSummary.map(group => ({
            name: group.group,
            users: group.userCount,
            meals: group.totalMeals,
            revenue: group.totalRevenue,
            rating: group.averageRating,
        }));
    };

    const prepareRatingDistribution = () => {
        if (!ratingAnalysis) return [];
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'];
        return ratingAnalysis.ratingDistribution.map((item, index) => ({
            name: `${item.rating}点`,
            value: item.count,
            percentage: item.percentage,
            fill: colors[index % colors.length],
        }));
    };

    const prepareDayOfWeekData = () => {
        if (!usagePattern) return [];
        return usagePattern.dayOfWeek.map(item => ({
            day: item.day,
            count: item.count,
            rating: item.averageRating,
        }));
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* ヘッダー */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h2" component="h1" sx={{ color: 'primary.main' }}>
                    📊 統計・レポート
                </Typography>
                <Fab color="secondary" onClick={onBack} sx={{ width: 60, height: 60 }}>
                    <ArrowBackIcon />
                </Fab>
            </Box>

            {/* 期間選択 */}
            <Card sx={{ mb: 4, borderRadius: '16px' }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                        分析期間設定
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                        <TextField
                            select
                            label="年"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            sx={{ minWidth: '120px' }}
                        >
                            {generateYearOptions().map(year => (
                                <MenuItem key={year} value={year}>{year}年</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select
                            label="月"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            sx={{ minWidth: '120px' }}
                        >
                            {generateMonthOptions().map(month => (
                                <MenuItem key={month} value={month}>{month}月</MenuItem>
                            ))}
                        </TextField>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Button
                                variant="outlined"
                                startIcon={<GetAppIcon />}
                                onClick={() => handleExport('monthly')}
                            >
                                月次レポート
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<GetAppIcon />}
                                onClick={() => handleExport('billing')}
                            >
                                請求データ
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* タブナビゲーション */}
            <Card sx={{ mb: 4, borderRadius: '16px' }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, newValue) => setActiveTab(newValue)}
                    variant="fullWidth"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab label="🏠 利用者統計" />
                    <Tab label="📈 評価分析" />
                    <Tab label="👥 グループ別" />
                    <Tab label="📅 利用パターン" />
                </Tabs>

                <CardContent sx={{ p: 4 }}>
                    {/* タブ1: 利用者統計 */}
                    {activeTab === 0 && (
                        <Box>
                            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                                {selectedYear}年{selectedMonth}月 利用者統計
                            </Typography>

                            {monthlyStats.length === 0 ? (
                                <Alert severity="info">選択した期間にデータがありません</Alert>
                            ) : (
                                <>
                                    {/* サマリーカード */}
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
                                        <Box sx={{ minWidth: '200px', flex: 1 }}>
                                            <Card sx={{ backgroundColor: 'primary.light', textAlign: 'center', p: 2 }}>
                                                <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700 }}>
                                                    {monthlyStats.length}
                                                </Typography>
                                                <Typography variant="h6">利用者数</Typography>
                                            </Card>
                                        </Box>
                                        <Box sx={{ minWidth: '200px', flex: 1 }}>
                                            <Card sx={{ backgroundColor: 'success.light', textAlign: 'center', p: 2 }}>
                                                <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 700 }}>
                                                    {monthlyStats.reduce((sum, stat) => sum + stat.totalMeals, 0)}
                                                </Typography>
                                                <Typography variant="h6">総利用回数</Typography>
                                            </Card>
                                        </Box>
                                        <Box sx={{ minWidth: '200px', flex: 1 }}>
                                            <Card sx={{ backgroundColor: 'warning.light', textAlign: 'center', p: 2 }}>
                                                <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 700 }}>
                                                    ¥{monthlyStats.reduce((sum, stat) => sum + stat.totalAmount, 0).toLocaleString()}
                                                </Typography>
                                                <Typography variant="h6">総売上</Typography>
                                            </Card>
                                        </Box>
                                    </Box>

                                    {/* 利用者詳細テーブル */}
                                    <Box sx={{ overflowX: 'auto' }}>
                                        <Box sx={{ minWidth: '800px' }}>
                                            <Box sx={{ display: 'flex', fontWeight: 600, p: 2, backgroundColor: 'grey.100' }}>
                                                <Box sx={{ flex: 2 }}>利用者名</Box>
                                                <Box sx={{ flex: 1 }}>グループ</Box>
                                                <Box sx={{ flex: 1 }}>利用回数</Box>
                                                <Box sx={{ flex: 1 }}>合計料金</Box>
                                                <Box sx={{ flex: 1 }}>平均評価</Box>
                                                <Box sx={{ flex: 1 }}>出席率</Box>
                                            </Box>
                                            {monthlyStats.map((stat, index) => (
                                                <Box
                                                    key={stat.userId}
                                                    sx={{
                                                        display: 'flex',
                                                        p: 2,
                                                        borderBottom: 1,
                                                        borderColor: 'grey.200',
                                                        backgroundColor: index % 2 === 0 ? 'grey.50' : 'white',
                                                    }}
                                                >
                                                    <Box sx={{ flex: 2 }}>{stat.userName}</Box>
                                                    <Box sx={{ flex: 1 }}>{stat.userGroup}</Box>
                                                    <Box sx={{ flex: 1 }}>{stat.totalMeals}回</Box>
                                                    <Box sx={{ flex: 1 }}>¥{stat.totalAmount.toLocaleString()}</Box>
                                                    <Box sx={{ flex: 1 }}>{stat.averageRating}</Box>
                                                    <Box sx={{ flex: 1 }}>{stat.attendanceRate}%</Box>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                </>
                            )}
                        </Box>
                    )}

                    {/* タブ2: 評価分析 */}
                    {activeTab === 1 && (
                        <Box>
                            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                                評価分析
                            </Typography>

                            {ratingAnalysis && (
                                <>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
                                        <Box sx={{ minWidth: '300px', flex: 1 }}>
                                            <Card sx={{ p: 3 }}>
                                                <Typography variant="h6" sx={{ mb: 2 }}>評価推移</Typography>
                                                <ResponsiveContainer width="100%" height={300}>
                                                    <LineChart data={prepareTrendData()}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="date" />
                                                        <YAxis domain={[1, 10]} />
                                                        <Tooltip />
                                                        <Line type="monotone" dataKey="rating" stroke="#8884d8" strokeWidth={3} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </Card>
                                        </Box>

                                        <Box sx={{ minWidth: '300px', flex: 1 }}>
                                            <Card sx={{ p: 3 }}>
                                                <Typography variant="h6" sx={{ mb: 2 }}>評価分布</Typography>
                                                <ResponsiveContainer width="100%" height={300}>
                                                    <PieChart>
                                                        <Pie
                                                            data={prepareRatingDistribution()}
                                                            cx="50%"
                                                            cy="50%"
                                                            outerRadius={80}
                                                            dataKey="value"
                                                            label={({ name, percentage }) => `${name}: ${percentage}%`}
                                                        >
                                                            {prepareRatingDistribution().map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </Card>
                                        </Box>
                                    </Box>

                                    <Card sx={{ p: 3 }}>
                                        <Typography variant="h6" sx={{ mb: 2 }}>総合評価</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="h3" sx={{ color: 'primary.main', fontWeight: 700 }}>
                                                    {ratingAnalysis.averageRating}
                                                </Typography>
                                                <Typography variant="body1">全体平均</Typography>
                                            </Box>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="h3" sx={{ color: 'success.main', fontWeight: 700 }}>
                                                    {ratingAnalysis.totalRecords}
                                                </Typography>
                                                <Typography variant="body1">総評価件数</Typography>
                                            </Box>
                                        </Box>
                                    </Card>
                                </>
                            )}
                        </Box>
                    )}

                    {/* タブ3: グループ別統計 */}
                    {activeTab === 2 && (
                        <Box>
                            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                                グループ別統計
                            </Typography>

                            {groupSummary.length > 0 && (
                                <>
                                    <Card sx={{ p: 3, mb: 4 }}>
                                        <Typography variant="h6" sx={{ mb: 2 }}>グループ別利用状況</Typography>
                                        <ResponsiveContainer width="100%" height={400}>
                                            <BarChart data={prepareGroupData()}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Bar dataKey="meals" fill="#8884d8" name="利用回数" />
                                                <Bar dataKey="revenue" fill="#82ca9d" name="売上" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Card>

                                    <Box sx={{ overflowX: 'auto' }}>
                                        <Box sx={{ minWidth: '600px' }}>
                                            <Box sx={{ display: 'flex', fontWeight: 600, p: 2, backgroundColor: 'grey.100' }}>
                                                <Box sx={{ flex: 1 }}>グループ</Box>
                                                <Box sx={{ flex: 1 }}>利用者数</Box>
                                                <Box sx={{ flex: 1 }}>総利用回数</Box>
                                                <Box sx={{ flex: 1 }}>総売上</Box>
                                                <Box sx={{ flex: 1 }}>平均評価</Box>
                                                <Box sx={{ flex: 1 }}>一人当たり利用</Box>
                                            </Box>
                                            {groupSummary.map((group, index) => (
                                                <Box
                                                    key={group.group}
                                                    sx={{
                                                        display: 'flex',
                                                        p: 2,
                                                        borderBottom: 1,
                                                        borderColor: 'grey.200',
                                                        backgroundColor: index % 2 === 0 ? 'grey.50' : 'white',
                                                    }}
                                                >
                                                    <Box sx={{ flex: 1 }}>{group.group}</Box>
                                                    <Box sx={{ flex: 1 }}>{group.userCount}名</Box>
                                                    <Box sx={{ flex: 1 }}>{group.totalMeals}回</Box>
                                                    <Box sx={{ flex: 1 }}>¥{group.totalRevenue.toLocaleString()}</Box>
                                                    <Box sx={{ flex: 1 }}>{group.averageRating}</Box>
                                                    <Box sx={{ flex: 1 }}>{group.averageMealsPerUser}回</Box>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                </>
                            )}
                        </Box>
                    )}

                    {/* タブ4: 利用パターン */}
                    {activeTab === 3 && (
                        <Box>
                            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                                利用パターン分析
                            </Typography>

                            {usagePattern && (
                                <Card sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ mb: 2 }}>曜日別利用状況</Typography>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <BarChart data={prepareDayOfWeekData()}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="day" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="count" fill="#8884d8" name="利用回数" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Card>
                            )}
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
};

export default Statistics; 