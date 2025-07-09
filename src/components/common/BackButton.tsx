import { ArrowBack } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { ViewType } from '../../types';

interface BackButtonProps {
  text?: string;
  destination?: ViewType;
  position?: 'top-left' | 'bottom-left' | 'top-right' | 'bottom-right';
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'success' | 'error';
  size?: 'small' | 'medium' | 'large';
  sx?: object;
  onClick?: () => void;
  'aria-label'?: string;
}

const BackButton: React.FC<BackButtonProps> = ({
  text = "← 戻る",
  destination,
  position = 'top-left',
  variant = 'outlined',
  color = 'primary',
  size = 'medium',
  sx = {},
  onClick,
  'aria-label': ariaLabel = '前の画面に戻る'
}) => {
  const { dispatch } = useApp();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (destination) {
      dispatch({ type: 'SET_VIEW', payload: destination });
    }
  };

  const getPositionStyles = (pos: string) => {
    const baseStyles = {
      position: 'fixed',
      zIndex: 1000,
    };

    const responsiveMargin = {
      xs: '8px',
      sm: '12px',
      md: '16px',
    };

    switch (pos) {
      case 'top-left':
        return { 
          ...baseStyles, 
          top: 0, 
          left: 0,
          margin: responsiveMargin,
        };
      case 'bottom-left':
        return { 
          ...baseStyles, 
          bottom: 0, 
          left: 0,
          margin: responsiveMargin,
        };
      case 'top-right':
        return { 
          ...baseStyles, 
          top: 0, 
          right: 0,
          margin: responsiveMargin,
        };
      case 'bottom-right':
        return { 
          ...baseStyles, 
          bottom: 0, 
          right: 0,
          margin: responsiveMargin,
        };
      default:
        return { 
          ...baseStyles, 
          top: 0, 
          left: 0,
          margin: responsiveMargin,
        };
    }
  };

  return (
    <Box sx={{ ...getPositionStyles(position), ...sx }}>
      <Button
        variant={variant}
        color={color}
        size={size}
        startIcon={<ArrowBack />}
        onClick={handleClick}
        aria-label={ariaLabel}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        sx={{
          minWidth: 'auto',
          padding: {
            xs: '6px 12px',
            sm: '8px 16px',
            md: '8px 16px',
          },
          fontSize: {
            xs: '0.875rem',
            sm: '1rem',
            md: '1rem',
          },
          borderRadius: '8px',
          fontWeight: 'bold',
          textTransform: 'none',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: 2,
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        {text}
      </Button>
    </Box>
  );
};

export default BackButton; 