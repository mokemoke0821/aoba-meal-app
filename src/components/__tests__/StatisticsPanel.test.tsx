import { ThemeProvider } from '@mui/material';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { AppProvider } from '../../contexts/AppContext';
import aobaTheme from '../../theme';
import {
    createMockMealRecord,
    generateMockMealRecords,
    mockUsers
} from '../../utils/testHelpers';
import StatisticsPanel from '../StatisticsPanel';

// モック関数
const mockOnBack = jest.fn();
const mockMealRecords = generateMockMealRecords(mockUsers, 10);

// テストユーティリティ
const renderWithProviders = (component: React.ReactElement) => {
    return render(
        <ThemeProvider theme={aobaTheme}>
            <AppProvider>
                {component}
            </AppProvider>
        </ThemeProvider>
    );
};

// LocalStorageのモック
const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
});

// file-saverのモックは不要（CSV出力機能が無効化されているため）

describe('StatisticsPanel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
            users: mockUsers,
            mealRecords: mockMealRecords,
            currentMenu: null,
            selectedUser: null,
            currentView: 'statistics',
        }));
    });

    describe('基本表示', () => {
        it('統計パネルが正しくレンダリングされる', async () => {
            renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);

            expect(await screen.findByText('📊 統計・分析')).toBeInTheDocument();
            expect(screen.getByText('更新')).toBeInTheDocument();
            expect(screen.getByText('CSV出力')).toBeInTheDocument();
        });

        it('今日の統計カードが表示される', async () => {
            renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);

            expect(await screen.findByText('📈 今日の状況')).toBeInTheDocument();
            expect(screen.getByText('注文数')).toBeInTheDocument();
            expect(screen.getByText('評価待ち')).toBeInTheDocument();
            expect(screen.getByText('評価完了')).toBeInTheDocument();
            expect(screen.getByText('平均評価')).toBeInTheDocument();
        });

        it('期間サマリーが表示される', async () => {
            renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);

            expect(await screen.findByText('📋 期間サマリー')).toBeInTheDocument();
            expect(screen.getByText('利用者数')).toBeInTheDocument();
            expect(screen.getByText('総注文数')).toBeInTheDocument();
            expect(screen.getByText('総売上')).toBeInTheDocument();
            expect(screen.getAllByText('平均評価').length).toBeGreaterThan(0);
        });

        it('グラフセクションが表示される', async () => {
            renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);

            expect(await screen.findByText('📈 日別注文・評価推移')).toBeInTheDocument();
            expect(screen.getByText('⭐ 評価分布')).toBeInTheDocument();
            expect(screen.getByText('🍽️ メニュー人気度')).toBeInTheDocument();
            expect(screen.getByText('📊 月別トレンド')).toBeInTheDocument();
        });
    });

    describe.skip('データフィルタリング', () => {
        // 期間フィルター機能は一時的に無効化されているためテストをスキップ
        it('日付範囲フィルターが表示される', () => {
            renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);

            expect(screen.getByText('期間フィルター')).toBeInTheDocument();
            expect(screen.getByText('今日')).toBeInTheDocument();
            expect(screen.getByText('今週')).toBeInTheDocument();
            expect(screen.getByText('今月')).toBeInTheDocument();
        });

        it('期間プリセットボタンが機能する', async () => {
            renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);

            const todayButton = screen.getByText('今日');
            fireEvent.click(todayButton);

            // フィルター適用後の変化を確認
            await waitFor(() => {
                // 今日のデータのみに絞られることを想定
                expect(screen.getByText('📈 今日の状況')).toBeInTheDocument();
            });
        });

        it('カスタム日付範囲を設定できる', async () => {
            renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);

            // 開始日の設定
            const startDateInput = screen.getByLabelText('開始日');
            fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });

            // 終了日の設定
            const endDateInput = screen.getByLabelText('終了日');
            fireEvent.change(endDateInput, { target: { value: '2024-01-31' } });

            // フィルター適用
            const applyButton = screen.getByText('適用');
            fireEvent.click(applyButton);

            await waitFor(() => {
                // カスタム期間でのデータ表示を確認
                expect(screen.getByText('📋 期間サマリー')).toBeInTheDocument();
            });
        });
    });

    describe('データ更新機能', () => {
        it('更新ボタンが機能する', async () => {
            renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);

            const refreshButton = screen.getByText('更新');
            fireEvent.click(refreshButton);

            // 統計データが再計算されることを確認
            await waitFor(() => {
                expect(screen.getByText('📈 今日の状況')).toBeInTheDocument();
            });
        });

        it('データ変更時に自動更新される', async () => {
            const { rerender } = renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);

            // 新しいデータでモックを更新
            const newMealRecords = [
                ...mockMealRecords,
                createMockMealRecord({ rating: 9, price: 600 }),
            ];

            mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
                users: mockUsers,
                mealRecords: newMealRecords,
                currentMenu: null,
                selectedUser: null,
                currentView: 'statistics',
            }));

            // 再レンダリング
            rerender(<StatisticsPanel onBack={mockOnBack} />);

            await waitFor(() => {
                // 統計が更新されることを確認
                expect(screen.getByText('📋 期間サマリー')).toBeInTheDocument();
            });
        });
    });

    describe('CSV出力機能', () => {
        it('CSV出力ボタンが表示される', async () => {
            renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);

            const exportButton = screen.getByText('CSV出力');
            expect(exportButton).toBeInTheDocument();
        });

        it('CSV出力ボタンをクリックするとアラートが表示される', async () => {
            // window.alertをモック
            const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => { });

            renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);

            const exportButton = screen.getByText('CSV出力');
            fireEvent.click(exportButton);

            expect(alertSpy).toHaveBeenCalledWith('CSV出力機能は一時的に無効化されています');

            alertSpy.mockRestore();
        });
    });

    describe('グラフ表示', () => {
        it('日別推移グラフが表示される', async () => {
            renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);
            const chartContainer = await screen.findByRole('region', { name: /日別注文・評価推移/i });
            expect(chartContainer).toBeInTheDocument();
        });

        it('評価分布グラフが表示される', async () => {
            renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);
            const chartContainer = await screen.findByRole('region', { name: /評価分布/i });
            expect(chartContainer).toBeInTheDocument();
        });

        it('メニュー人気度グラフが表示される', async () => {
            renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);
            const chartContainer = await screen.findByRole('region', { name: /メニュー人気度/i });
            expect(chartContainer).toBeInTheDocument();
        });

        it('月別トレンドグラフが表示される', async () => {
            renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);
            const chartContainer = await screen.findByRole('region', { name: /月別トレンド/i });
            expect(chartContainer).toBeInTheDocument();
        });
    });
}); 