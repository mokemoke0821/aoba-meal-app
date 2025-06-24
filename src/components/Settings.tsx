import {
    ArrowBack as ArrowBackIcon,
    Notifications as NotificationsIcon,
    Palette as PaletteIcon,
    Security as SecurityIcon,
    Settings as SettingsIcon,
    Storage as StorageIcon
} from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    List,
    ListItem,
    ListItemText,
    Switch,
    Typography
} from '@mui/material';
import React from 'react';

interface SettingsProps {
    onBack?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
    const handleBack = () => {
        if (onBack) {
            onBack();
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* ヘッダー */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Button
                    variant="outlined"
                    onClick={handleBack}
                    sx={{ mr: 2 }}
                    startIcon={<ArrowBackIcon />}
                >
                    ← 戻る
                </Button>
                <Box>
                    <Typography variant="h3" component="h1" sx={{ color: 'primary.main' }}>
                        ⚙️ 設定
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        アプリケーションの設定を管理します
                    </Typography>
                </Box>
            </Box>

            {/* 通知設定 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <NotificationsIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h5" component="h2">
                            通知設定
                        </Typography>
                    </Box>
                    <List>
                        <ListItem>
                            <ListItemText
                                primary="給食注文の通知"
                                secondary="新しい注文があった際に通知を受け取る"
                            />
                            <Switch defaultChecked />
                        </ListItem>
                        <ListItem>
                            <ListItemText
                                primary="評価入力の通知"
                                secondary="評価入力の締切が近づいた際に通知を受け取る"
                            />
                            <Switch defaultChecked />
                        </ListItem>
                    </List>
                </CardContent>
            </Card>

            {/* セキュリティ設定 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h5" component="h2">
                            セキュリティ設定
                        </Typography>
                    </Box>
                    <List>
                        <ListItem>
                            <ListItemText
                                primary="自動ログアウト"
                                secondary="一定時間操作がない場合に自動的にログアウトする"
                            />
                            <Switch defaultChecked />
                        </ListItem>
                        <ListItem>
                            <ListItemText
                                primary="データ暗号化"
                                secondary="保存データを暗号化して保護する"
                            />
                            <Switch defaultChecked />
                        </ListItem>
                    </List>
                </CardContent>
            </Card>

            {/* データ管理 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <StorageIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h5" component="h2">
                            データ管理
                        </Typography>
                    </Box>
                    <List>
                        <ListItem>
                            <ListItemText
                                primary="データのバックアップ"
                                secondary="定期的にデータをバックアップする"
                            />
                            <Switch defaultChecked />
                        </ListItem>
                        <ListItem>
                            <ListItemText
                                primary="古いデータの自動削除"
                                secondary="1年以上前のデータを自動的に削除する"
                            />
                            <Switch />
                        </ListItem>
                    </List>
                </CardContent>
            </Card>

            {/* 表示設定 */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PaletteIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h5" component="h2">
                            表示設定
                        </Typography>
                    </Box>
                    <List>
                        <ListItem>
                            <ListItemText
                                primary="ダークモード"
                                secondary="画面を暗いテーマで表示する"
                            />
                            <Switch />
                        </ListItem>
                        <ListItem>
                            <ListItemText
                                primary="大きな文字"
                                secondary="文字を大きく表示して見やすくする"
                            />
                            <Switch />
                        </ListItem>
                    </List>
                </CardContent>
            </Card>

            {/* システム情報 */}
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <SettingsIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h5" component="h2">
                            システム情報
                        </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                        アプリバージョン: 1.0.0
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                        最終更新: 2024年1月
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        開発者: あおば給食管理システム開発チーム
                    </Typography>
                </CardContent>
            </Card>
        </Container>
    );
};

export default Settings; 