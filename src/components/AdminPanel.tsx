import {
    Assessment as AssessmentIcon,
    AttachMoney as AttachMoneyIcon,
    Close as CloseIcon,
    GetApp as GetAppIcon,
    Home as HomeIcon,
    People as PeopleIcon,
    Restaurant as RestaurantIcon,
    Settings as SettingsIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Fab,
    TextField,
    Typography
} from '@mui/material';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import {
    exportBillingData,
    exportComprehensiveReport,
    exportMonthlyReport,
    exportRatingAnalysis
} from '../utils/csvExport';
import {
    calculateGroupSummary,
    calculateRevenue
} from '../utils/statistics';

interface AdminPanelProps {
    onNavigateToUserManagement: () => void;
    onNavigateToStatistics: () => void;
    onNavigateToMenuManagement: () => void;
    onNavigateToSettings: () => void;
    onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
    onNavigateToUserManagement,
    onNavigateToStatistics,
    onNavigateToMenuManagement,
    onNavigateToSettings,
    onClose,
}) => {
    const { state } = useApp();
    const [accessDialog, setAccessDialog] = useState(true);
    const [accessCode, setAccessCode] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [groupSummary, setGroupSummary] = useState<any[]>([]);
    const [currentMonthRevenue, setCurrentMonthRevenue] = useState(0);

    // 簡易認証（実際の運用では設定画面で変更可能）
    const ADMIN_CODE = '1234';

    // 認証処理
    const handleAuthentication = () => {
        if (accessCode === ADMIN_CODE) {
            setIsAuthenticated(true);
            setAccessDialog(false);
        } else {
            alert('パスワードが正しくありません');
        }
    };

    // 統計データの計算
    useEffect(() => {
        if (isAuthenticated) {
            const groupStats = calculateGroupSummary(state.mealRecords, state.users);
            const revenueData = calculateRevenue(state.mealRecords, 'monthly');
            const thisMonthRevenue = revenueData.find(r =>
                r.period === format(new Date(), 'yyyy-MM')
            )?.revenue || 0;

            setGroupSummary(groupStats);
            setCurrentMonthRevenue(thisMonthRevenue);
        }
    }, [isAuthenticated, state.mealRecords, state.users]);

    // CSV出力ハンドラー
    const handleExportCSV = (type: string) => {
        try {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth() + 1;

            switch (type) {
                case 'comprehensive':
                    exportComprehensiveReport(state.mealRecords, state.users, []);
                    break;
                case 'monthly':
                    exportMonthlyReport(state.mealRecords, state.users, currentYear, currentMonth);
                    break;
                case 'rating':
                    exportRatingAnalysis(state.mealRecords, []);
                    break;
                case 'billing':
                    exportBillingData(state.mealRecords, state.users, currentYear, currentMonth);
                    break;
            }
        } catch (error) {
            alert(`CSV出力エラー: ${error}`);
        }
    };

    // 認証ダイアログ
    if (!isAuthenticated) {
        return (
            <Dialog
                open={accessDialog}
                onClose={onClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '16px', p: 2 }
                }}
            >
                <DialogTitle sx={{ textAlign: 'center', fontSize: '1.75rem', fontWeight: 700 }}>
                    管理者認証
                </DialogTitle>
                <DialogContent sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="h5" sx={{ mb: 3 }}>
                        管理機能にアクセスするためのパスワードを入力してください
                    </Typography>
                    <TextField
                        fullWidth
                        type="password"
                        label="パスワード"
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAuthentication()}
                        sx={{
                            '& .MuiInputBase-root': {
                                fontSize: '1.5rem',
                                minHeight: '60px',
                            },
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', gap: 2, p: 3 }}>
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        size="large"
                        startIcon={<CloseIcon />}
                    >
                        キャンセル
                    </Button>
                    <Button
                        onClick={handleAuthentication}
                        variant="contained"
                        size="large"
                        disabled={!accessCode}
                    >
                        認証
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* ヘッダー */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h2" component="h1" sx={{ color: 'primary.main' }}>
                    🛠️ 管理画面
                </Typography>
                <Fab
                    color="secondary"
                    onClick={onClose}
                    sx={{ width: 60, height: 60 }}
                    aria-label="メイン画面に戻る"
                >
                    <HomeIcon />
                </Fab>
            </Box>

            {/* 統計カード */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
                <Box sx={{ minWidth: '250px', flex: 1 }}>
                    <Card sx={{ borderRadius: '16px', backgroundColor: 'primary.light' }}>
                        <CardContent sx={{ textAlign: 'center', p: 3 }}>
                            <PeopleIcon sx={{ fontSize: '3rem', color: 'primary.main', mb: 1 }} />
                            <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                {state.users.filter(u => u.isActive).length}
                            </Typography>
                            <Typography variant="h6">登録利用者</Typography>
                        </CardContent>
                    </Card>
                </Box>

                <Box sx={{ minWidth: '250px', flex: 1 }}>
                    <Card sx={{ borderRadius: '16px', backgroundColor: 'success.light' }}>
                        <CardContent sx={{ textAlign: 'center', p: 3 }}>
                            <RestaurantIcon sx={{ fontSize: '3rem', color: 'success.main', mb: 1 }} />
                            <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                                {state.mealRecords.length}
                            </Typography>
                            <Typography variant="h6">総利用回数</Typography>
                        </CardContent>
                    </Card>
                </Box>

                <Box sx={{ minWidth: '250px', flex: 1 }}>
                    <Card sx={{ borderRadius: '16px', backgroundColor: 'warning.light' }}>
                        <CardContent sx={{ textAlign: 'center', p: 3 }}>
                            <AttachMoneyIcon sx={{ fontSize: '3rem', color: 'warning.main', mb: 1 }} />
                            <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main' }}>
                                ¥{currentMonthRevenue.toLocaleString()}
                            </Typography>
                            <Typography variant="h6">今月の売上</Typography>
                        </CardContent>
                    </Card>
                </Box>

                <Box sx={{ minWidth: '250px', flex: 1 }}>
                    <Card sx={{ borderRadius: '16px', backgroundColor: 'info.light' }}>
                        <CardContent sx={{ textAlign: 'center', p: 3 }}>
                            <TrendingUpIcon sx={{ fontSize: '3rem', color: 'info.main', mb: 1 }} />
                            <Typography variant="h3" sx={{ fontWeight: 700, color: 'info.main' }}>
                                {state.mealRecords.length > 0
                                    ? Math.round((state.mealRecords.reduce((sum, r) => sum + r.rating, 0) / state.mealRecords.length) * 100) / 100
                                    : 0
                                }
                            </Typography>
                            <Typography variant="h6">平均評価</Typography>
                        </CardContent>
                    </Card>
                </Box>
            </Box>



            {/* 管理機能メニュー */}
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                管理機能
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
                <Box sx={{ minWidth: '300px', flex: 1 }}>
                    <Card sx={{ borderRadius: '16px' }}>
                        <CardActionArea
                            onClick={onNavigateToUserManagement}
                            sx={{ minHeight: '150px', p: 3, textAlign: 'center' }}
                        >
                            <PeopleIcon sx={{ fontSize: '4rem', color: 'primary.main', mb: 2 }} />
                            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                                利用者管理
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                利用者の追加・編集・削除
                            </Typography>
                        </CardActionArea>
                    </Card>
                </Box>

                <Box sx={{ minWidth: '300px', flex: 1 }}>
                    <Card sx={{ borderRadius: '16px' }}>
                        <CardActionArea
                            onClick={onNavigateToStatistics}
                            sx={{ minHeight: '150px', p: 3, textAlign: 'center' }}
                        >
                            <AssessmentIcon sx={{ fontSize: '4rem', color: 'success.main', mb: 2 }} />
                            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                                統計・レポート
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                詳細な分析とレポート表示
                            </Typography>
                        </CardActionArea>
                    </Card>
                </Box>

                <Box sx={{ minWidth: '300px', flex: 1 }}>
                    <Card sx={{ borderRadius: '16px' }}>
                        <CardActionArea
                            onClick={onNavigateToMenuManagement}
                            sx={{ minHeight: '150px', p: 3, textAlign: 'center' }}
                        >
                            <RestaurantIcon sx={{ fontSize: '4rem', color: 'warning.main', mb: 2 }} />
                            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                                メニュー管理
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                メニューの設定と管理
                            </Typography>
                        </CardActionArea>
                    </Card>
                </Box>

                <Box sx={{ minWidth: '300px', flex: 1 }}>
                    <Card sx={{ borderRadius: '16px' }}>
                        <CardActionArea
                            onClick={onNavigateToSettings}
                            sx={{ minHeight: '150px', p: 3, textAlign: 'center' }}
                        >
                            <SettingsIcon sx={{ fontSize: '4rem', color: 'info.main', mb: 2 }} />
                            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                                設定
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                システム設定とデータ管理
                            </Typography>
                        </CardActionArea>
                    </Card>
                </Box>
            </Box>

            {/* CSV出力メニュー */}
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                データ出力
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ minWidth: '200px', flex: 1 }}>
                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={() => handleExportCSV('comprehensive')}
                        startIcon={<GetAppIcon />}
                        sx={{ minHeight: '80px', fontSize: '1.2rem' }}
                    >
                        統合レポート
                    </Button>
                </Box>

                <Box sx={{ minWidth: '200px', flex: 1 }}>
                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={() => handleExportCSV('monthly')}
                        startIcon={<GetAppIcon />}
                        sx={{ minHeight: '80px', fontSize: '1.2rem' }}
                    >
                        月次レポート
                    </Button>
                </Box>

                <Box sx={{ minWidth: '200px', flex: 1 }}>
                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={() => handleExportCSV('rating')}
                        startIcon={<GetAppIcon />}
                        sx={{ minHeight: '80px', fontSize: '1.2rem' }}
                    >
                        評価分析
                    </Button>
                </Box>

                <Box sx={{ minWidth: '200px', flex: 1 }}>
                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={() => handleExportCSV('billing')}
                        startIcon={<GetAppIcon />}
                        sx={{ minHeight: '80px', fontSize: '1.2rem' }}
                    >
                        請求データ
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default AdminPanel; 