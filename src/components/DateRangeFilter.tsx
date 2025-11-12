import { Clear as ClearIcon, Download as DownloadIcon } from '@mui/icons-material';
import {
    Box,
    Button,
    Paper,
    Typography
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import React from 'react';

export interface DateRange {
    startDate: Date | null;
    endDate: Date | null;
}

interface DateRangeFilterProps {
    dateRange: DateRange;
    onDateRangeChange: (range: DateRange) => void;
    onExport: () => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
    dateRange,
    onDateRangeChange,
    onExport
}) => {
    const handleStartDateChange = (newDate: Date | null) => {
        onDateRangeChange({
            ...dateRange,
            startDate: newDate
        });
    };

    const handleEndDateChange = (newDate: Date | null) => {
        onDateRangeChange({
            ...dateRange,
            endDate: newDate
        });
    };

    const resetDateRange = () => {
        onDateRangeChange({
            startDate: null,
            endDate: null
        });
    };

    // 日付範囲が設定されているかチェック
    const isDateRangeValid = dateRange.startDate && dateRange.endDate &&
        dateRange.startDate <= dateRange.endDate;

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
            <Paper sx={{ p: 3, mb: 3, borderRadius: '12px' }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                    📅 期間指定CSV出力
                </Typography>

                <Box sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    mb: 2
                }}>
                    <DatePicker
                        label="開始日"
                        value={dateRange.startDate}
                        onChange={handleStartDateChange}
                        maxDate={new Date()}
                        slotProps={{
                            textField: {
                                size: 'small',
                                sx: { minWidth: 160 }
                            }
                        }}
                        format="yyyy/MM/dd"
                    />

                    <Typography variant="body2" color="text.secondary">
                        〜
                    </Typography>

                    <DatePicker
                        label="終了日"
                        value={dateRange.endDate}
                        onChange={handleEndDateChange}
                        minDate={dateRange.startDate || undefined}
                        maxDate={new Date()}
                        slotProps={{
                            textField: {
                                size: 'small',
                                sx: { minWidth: 160 }
                            }
                        }}
                        format="yyyy/MM/dd"
                    />
                </Box>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={onExport}
                        disabled={!isDateRangeValid}
                        sx={{ borderRadius: '8px' }}
                    >
                        期間指定CSV出力
                    </Button>

                    <Button
                        variant="outlined"
                        startIcon={<ClearIcon />}
                        onClick={resetDateRange}
                        disabled={!dateRange.startDate && !dateRange.endDate}
                        sx={{ borderRadius: '8px' }}
                    >
                        クリア
                    </Button>

                    {isDateRangeValid && (
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                            期間: {format(dateRange.startDate!, 'yyyy/MM/dd')} 〜 {format(dateRange.endDate!, 'yyyy/MM/dd')}
                        </Typography>
                    )}
                </Box>

                {dateRange.startDate && dateRange.endDate && dateRange.startDate > dateRange.endDate && (
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                        開始日は終了日より前の日付を選択してください
                    </Typography>
                )}
            </Paper>
        </LocalizationProvider>
    );
};

export default DateRangeFilter; 