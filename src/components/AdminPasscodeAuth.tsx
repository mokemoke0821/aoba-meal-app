import { Backspace as BackspaceIcon } from '@mui/icons-material';
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography
} from '@mui/material';
import React, { useState } from 'react';
import { validatePasscode } from '../utils/securitySettings';

interface AdminPasscodeAuthProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AdminPasscodeAuth: React.FC<AdminPasscodeAuthProps> = ({ open, onClose, onSuccess }) => {
    const [input, setInput] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleNumberClick = (num: string) => {
        if (input.length < 4) {
            setInput(prev => prev + num);
            setError('');
        }
    };

    const handleBackspace = () => {
        setInput(prev => prev.slice(0, -1));
        setError('');
    };

    const handleClear = () => {
        setInput('');
        setError('');
    };

    const handleSubmit = () => {
        if (input.length !== 4) {
            setError('4桁の数字を入力してください');
            return;
        }

        if (validatePasscode(input)) {
            setInput('');
            setError('');
            onSuccess();
        } else {
            setError('パスコードが正しくありません');
            setInput('');
        }
    };

    const handleClose = () => {
        setInput('');
        setError('');
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    p: 2
                }
            }}
        >
            <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
                <Typography variant="h5" component="div" fontWeight="bold">
                    管理者認証
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    4桁のパスコードを入力してください
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* 入力表示 */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: 1,
                            mb: 2
                        }}
                    >
                        {[0, 1, 2, 3].map((index) => (
                            <Box
                                key={index}
                                sx={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: 2,
                                    border: '2px solid',
                                    borderColor: input.length > index ? 'primary.main' : 'divider',
                                    backgroundColor: input.length > index ? 'primary.light' : 'background.paper',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {input.length > index ? '●' : ''}
                            </Box>
                        ))}
                    </Box>

                    {/* エラーメッセージ */}
                    {error && (
                        <Typography
                            variant="body2"
                            color="error"
                            sx={{ textAlign: 'center', minHeight: '20px' }}
                        >
                            {error}
                        </Typography>
                    )}

                    {/* 数字キーパッド */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 1.5,
                            mt: 2
                        }}
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <Button
                                key={num}
                                variant="outlined"
                                onClick={() => handleNumberClick(num.toString())}
                                sx={{
                                    minHeight: 60,
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    borderWidth: 2,
                                    '&:hover': {
                                        borderWidth: 2,
                                        backgroundColor: 'action.hover'
                                    }
                                }}
                            >
                                {num}
                            </Button>
                        ))}
                        <Button
                            variant="outlined"
                            onClick={handleClear}
                            sx={{
                                minHeight: 60,
                                fontSize: '0.875rem',
                                borderWidth: 2,
                                '&:hover': {
                                    borderWidth: 2,
                                    backgroundColor: 'action.hover'
                                }
                            }}
                        >
                            クリア
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => handleNumberClick('0')}
                            sx={{
                                minHeight: 60,
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                borderWidth: 2,
                                '&:hover': {
                                    borderWidth: 2,
                                    backgroundColor: 'action.hover'
                                }
                            }}
                        >
                            0
                        </Button>
                        <IconButton
                            onClick={handleBackspace}
                            sx={{
                                minHeight: 60,
                                border: '2px solid',
                                borderColor: 'divider',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    backgroundColor: 'action.hover'
                                }
                            }}
                        >
                            <BackspaceIcon />
                        </IconButton>
                    </Box>

                    {/* 送信ボタン */}
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleSubmit}
                        disabled={input.length !== 4}
                        sx={{
                            mt: 2,
                            py: 1.5,
                            fontSize: '1.1rem',
                            fontWeight: 'bold'
                        }}
                    >
                        認証
                    </Button>

                    {/* キャンセルボタン */}
                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={handleClose}
                        sx={{
                            py: 1.5
                        }}
                    >
                        キャンセル
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default AdminPasscodeAuth;

