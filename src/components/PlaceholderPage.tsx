import { Box, Typography } from '@mui/material';
import React from 'react';
import BackButton from './common/BackButton';

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
                    <BackButton 
                        text="← 戻る"
                        onClick={onBack}
                        sx={{ position: 'relative', margin: 0, mr: 2 }}
                        aria-label="前の画面に戻る"
                    />
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