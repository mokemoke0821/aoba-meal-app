import {
    Alert,
    Avatar,
    Box,
    ButtonBase,
    Card,
    CardContent,
    Chip,
    Container,
    TextField,
    Typography
} from '@mui/material';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useNotification } from '../contexts/NotificationContext';
import {
    EATING_RATIO_EMOJIS,
    EATING_RATIO_LABELS,
    getGroupDisplayName,
    GROUP_COLORS
} from '../types';
import BackButton from './common/BackButton';

interface EatingRatioInputProps {
    onBack?: () => void;
}

const EatingRatioInput: React.FC<EatingRatioInputProps> = ({ onBack }) => {
    const { state, dispatch } = useApp();
    const { showSuccess } = useNotification();
    const [eatingRatio, setEatingRatio] = useState<number>(10);
    const [supportNotes, setSupportNotes] = useState<string>('');


    const { selectedUser } = state;

    // 戻るボタンハンドラー
    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            dispatch({ type: 'SET_VIEW', payload: 'userSelect' });
        }
    };

    // 食べた量選択ハンドラー（選択と同時に記録保存）
    const handleEatingRatioSelect = async (ratio: number) => {
        setEatingRatio(ratio);
        
        if (selectedUser) {
            // 既存の給食記録を更新（食べた量を追加）
            const todayRecords = state.mealRecords;
            const recordIndex = todayRecords.findIndex(
                record => record.userId === selectedUser.id &&
                    record.date === format(new Date(), 'yyyy-MM-dd')
            );

            if (recordIndex !== -1) {
                const updatedRecords = [...todayRecords];
                updatedRecords[recordIndex] = {
                    ...updatedRecords[recordIndex],
                    eatingRatio: ratio,
                    supportNotes: supportNotes
                };
                dispatch({ type: 'SET_MEAL_RECORDS', payload: updatedRecords });
                
                // 🆕 成功メッセージを追加
                const ratioLabel = EATING_RATIO_LABELS[ratio as keyof typeof EATING_RATIO_LABELS];
                showSuccess(
                    `🍽️ ${selectedUser.name}さんの摂食量を記録しました！\n摂食量: ${ratioLabel}\n\n次の利用者の方は、カテゴリを選択してください。`, 
                    4000
                );
            }

            // 利用者選択状態をクリア
            dispatch({ type: 'SET_SELECTED_USER', payload: null });
            dispatch({ type: 'SET_SELECTED_CATEGORY', payload: null });

            // 画面遷移を少し遅らせる（メッセージを見せるため）
            setTimeout(() => {
                dispatch({ type: 'SET_VIEW', payload: 'categorySelect' });
            }, 500);
        }
    };



    // ユーザーが選択されていない場合
    if (!selectedUser) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ fontSize: '1.25rem', textAlign: 'center', mb: 4 }}>
                    利用者が選択されていません。最初の画面に戻ります。
                </Alert>
                <Box sx={{ textAlign: 'center' }}>
                    <BackButton 
                        text="← 利用者選択に戻る"
                        onClick={handleBack}
                        variant="contained"
                        size="large"
                        sx={{ 
                            position: 'relative',
                            margin: 0,
                            minHeight: '80px',
                            fontSize: '1.5rem',
                            fontWeight: 600,
                            borderRadius: '12px',
                        }}
                        aria-label="利用者選択に戻る"
                    />
                </Box>
            </Container>
        );
    }

    // 食べた量ボタンの生成
    const renderEatingRatioButtons = () => {
        const buttons = [];
        for (let i = 1; i <= 10; i++) {
            const emoji = EATING_RATIO_EMOJIS[i as keyof typeof EATING_RATIO_EMOJIS];
            const label = EATING_RATIO_LABELS[i as keyof typeof EATING_RATIO_LABELS];
            const isSelected = eatingRatio === i;

            buttons.push(
                <ButtonBase
                    key={i}
                    onClick={() => handleEatingRatioSelect(i)}
                    sx={{
                        width: '100%',
                        minHeight: '120px',
                        borderRadius: '16px',
                        border: isSelected ? '4px solid' : '2px solid',
                        borderColor: isSelected ? 'primary.main' : 'grey.300',
                        backgroundColor: isSelected ? 'primary.light' : 'background.paper',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'scale(1.05)',
                            borderColor: 'primary.main',
                            backgroundColor: 'primary.light',
                        },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 2,
                    }}
                    aria-label={`食べた量 ${label}`}
                >
                    <Typography
                        sx={{
                            fontSize: '3rem',
                            mb: 1,
                        }}
                    >
                        {emoji}
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            color: isSelected ? 'primary.main' : 'text.primary',
                            textAlign: 'center',
                        }}
                    >
                        {label}
                    </Typography>
                </ButtonBase>
            );
        }
        return buttons;
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* ヘッダー */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <BackButton 
                    text="← 戻る"
                    onClick={handleBack}
                    sx={{ position: 'relative', margin: 0, mr: 2 }}
                    aria-label="利用者選択に戻る"
                />
                <Box>
                    <Typography variant="h3" component="h1" sx={{ color: 'primary.main' }}>
                        🍽️ 食べた量記録
                    </Typography>
                    <Typography variant="h6" component="h2">
                        食べた量を押すと自動で記録されます
                    </Typography>
                </Box>
            </Box>

            {/* 利用者情報表示 */}
            <Card
                sx={{
                    mb: 4,
                    border: `3px solid ${GROUP_COLORS[selectedUser.group]}`,
                    borderRadius: '16px',
                }}
            >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                        <Avatar
                            sx={{
                                width: 60,
                                height: 60,
                                bgcolor: GROUP_COLORS[selectedUser.group],
                                mr: 2,
                            }}
                        >
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                {selectedUser.name.charAt(0)}
                            </Typography>
                        </Avatar>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                                {selectedUser.name} さん
                            </Typography>
                            <Chip
                                label={getGroupDisplayName(selectedUser.group)}
                                sx={{
                                    backgroundColor: GROUP_COLORS[selectedUser.group],
                                    color: 'white',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                }}
                            />
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* 食べた量選択エリア */}
            <Card sx={{ mb: 4, borderRadius: '16px' }}>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" sx={{ textAlign: 'center', mb: 3, fontWeight: 600 }}>
                        食べた量を押してください（1割〜完食）
                    </Typography>

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: 'repeat(2, 1fr)',
                                sm: 'repeat(5, 1fr)',
                                md: 'repeat(5, 1fr)',
                            },
                            gap: 2,
                            mb: 4,
                        }}
                    >
                        {renderEatingRatioButtons()}
                    </Box>

                    {/* 支援記録入力 */}
                    <Box sx={{ textAlign: 'center' }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="支援記録・備考（任意）"
                            placeholder="食事の様子や特記事項があれば入力してください..."
                            value={supportNotes}
                            onChange={(e) => setSupportNotes(e.target.value)}
                            sx={{
                                '& .MuiInputBase-root': {
                                    fontSize: '1.1rem',
                                },
                                '& .MuiInputLabel-root': {
                                    fontSize: '1.1rem',
                                },
                                maxWidth: '600px',
                                mx: 'auto'
                            }}
                        />
                        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary', fontStyle: 'italic' }}>
                            💡 食べた量ボタンを押すと自動で記録され、メイン画面に戻ります
                        </Typography>
                    </Box>
                </CardContent>
            </Card>


        </Container>
    );
};

export default EatingRatioInput; 