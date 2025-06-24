import { RestaurantMenu as MenuIcon } from '@mui/icons-material';
import { Box, Button, Paper, Typography } from '@mui/material';
import React from 'react';

interface MenuManagementProps {
    onBack?: () => void;
}

const MenuManagement: React.FC<MenuManagementProps> = ({ onBack }) => {
    const handleBack = () => {
        if (onBack) {
            onBack();
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <MenuIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
                    <Typography variant="h4" component="h1">
                        メニュー管理
                    </Typography>
                </Box>

                <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                    メニュー管理機能は現在開発中です。
                </Typography>

                <Typography variant="body2" sx={{ mb: 4 }}>
                    以下の機能が利用可能になる予定です：
                </Typography>

                <Box component="ul" sx={{ mb: 4, pl: 2 }}>
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                        日別メニューの作成・編集
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                        メニューテンプレートの管理
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                        人気メニューの分析
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                        栄養情報の管理
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    onClick={handleBack}
                    sx={{ mt: 2 }}
                >
                    戻る
                </Button>
            </Paper>
        </Box>
    );
};

export default MenuManagement; 