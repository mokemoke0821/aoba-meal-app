import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import React from 'react';

interface PlaceholderPageProps {
    title: string;
    description?: string;
    onBack?: () => void;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description, onBack }) => {
    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                {onBack && (
                    <Button
                        variant="outlined"
                        onClick={onBack}
                        sx={{ mr: 2 }}
                        startIcon={<ArrowBackIcon />}
                    >
                        ← 戻る
                    </Button>
                )}
                <Typography variant="h4">
                    {title}
                </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
                {description || 'この機能は準備中です。'}
            </Typography>
        </Box>
    );
}; 