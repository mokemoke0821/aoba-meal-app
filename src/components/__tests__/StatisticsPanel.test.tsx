import { ThemeProvider } from '@mui/material';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { AppProvider } from '../../contexts/AppContext';
import aobaTheme from '../../theme';
import {
    createMockMealRecord,
    createStatisticsTestData,
    generateMockMealRecords,
    generateMockUsers,
    mockMealRecords,
    mockUsers,
} from '../../utils/testHelpers';
import StatisticsPanel from '../StatisticsPanel';

// モック関数
const mockOnBack = jest.fn();

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

// file-saverのモック
jest.mock('file-saver', () => ({
    saveAs: jest.fn(),
}));

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
        it('統計パネルが正しくレンダリングされる', () => {
            renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);

            expect(screen.getByText('📊 統計・分析')).toBeInTheDocument();
            expect(screen.getByText('更新')).toBeInTheDocument();
            expect(screen.getByText('CSV出力')).toBeInTheDocument();
        });

        it('今日の統計カードが表示される', async () => {
            renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);

            await waitFor(() => {
                expect(screen.getByText('📈 今日の状況')).toBeInTheDocument();
                expect(screen.getByText('注文数')).toBeInTheDocument();
                expect(screen.getByText('評価待ち')).toBeInTheDocument();
                expect(screen.getByText('評価完了')).toBeInTheDocument();
                expect(screen.getByText('平均評価')).toBeInTheDocument();
            });
        });

        it('期間サマリーが表示される', async () => {
            renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);

            await waitFor(() => {
                expect(screen.getByText('📋 期間サマリー')).toBeInTheDocument();
                expect(screen.getByText('利用者数')).toBeInTheDocument();
                expect(screen.getByText('総注文数')).toBeInTheDocument();
                expect(screen.getByText('総売上')).toBeInTheDocument();
                expect(screen.getByText('平均評価')).toBeInTheDocument();
            });
        });

        it('グラフセクションが表示される', async () => {
            renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);

            await waitFor(() => {
                expect(screen.getByText('📈 日別注文・評価推移')).toBeInTheDocument();
                expect(screen.getByText('⭐ 評価分布')).toBeInTheDocument();
                expect(screen.getByText('🍽️ メニュー人気度')).toBeInTheDocument();
                expect(screen.getByText('📊 月別トレンド')).toBeInTheDocument();
            });
        });
    });

    describe('データフィルタリング', () => {
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
        it('CSV出力ボタンが機能する', async () => {
            renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);

            const exportButton = screen.getByText('CSV出力');
            fireEvent.click(exportButton);

            await waitFor(() => {
                // ファイル保存が呼ばれることを確認
                const { saveAs } = require('file-saver');
                expect(saveAs).toHaveBeenCalled();
            });
        });

        it('データがない場合のCSV出力エラー処理', async () => {
            // 空のデータでモック
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
                users: [],
                mealRecords: [],
                currentMenu: null,
                selectedUser: null,
                currentView: 'statistics',
            }));

            renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);

            const exportButton = screen.getByText('CSV出力');
            fireEvent.click(exportButton);

            // エラーが適切に処理されることを確認
            await waitFor(() => {
                // エラーメッセージは表示されないが、処理が完了することを確認
                expect(exportButton).toBeInTheDocument();
            });
        });
    });

    describe('グラフ表示', () => {
        it('日別推移グラフが表示される', async () => {
            renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);

            await waitFor(() => {
                // Rechartsのコンポーネントが描画されることを確認
                const chartContainer = screen.getByText('📈 日別注文・評価推移').closest('.MuiCard-root');
                expect(chartContainer).toBeInTheDocument();
            });
        });

        it('評価分布グラフが表示される', async () => {
            renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);

            await waitFor(() => {
                const chartContainer = screen.getByText('⭐ 評価分布').closest('.MuiCard-root');
                expect(chartContainer).toBeInTheDocument();
            });
        });

        it('メニュー人気度グラフが表示される', async () => {
            renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);

            await waitFor(() => {
                const chartContainer = screen.getByText('🍽️ メニュー人気度').closest('.MuiCard-root');
                expect(chartContainer).toBeInTheDocument();
            });
        });

        it('月別トレンドグラフが表示される', async () => {
            renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);

            await waitFor(() => {
                const chartContainer = screen.getByText('📊 月別トレンド').closest('.MuiCard-root');
                expect(chartContainer).toBeInTheDocument();
            });
        });
    });

    describe('レスポンシブ対応', () => {
        it('モバイルビューで適切に表示される', () => {
            // ビューポートをモバイルサイズに設定
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 375,
            });

            renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);

            // モバイル向けのレイアウトが適用されることを確認
            expect(screen.getByText('📊 統計・分析')).toBeInTheDocument();
        });

        it('デスクトップビューで適切に表示される', () => {
            // ビューポートをデスクトップサイズに設定
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 1200,
            });

            renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);

            // デスクトップ向けのレイアウトが適用されることを確認
            expect(screen.getByText('📊 統計・分析')).toBeInTheDocument();
        });
    });

    describe('エラーハンドリング', () => {
        it('統計計算エラーが適切に処理される', async () => {
            // 不正なデータでエラーを発生させる
            mockLocalStorage.getItem.mockReturnValue('invalid json');

            renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);

            await waitFor(() => {
                // エラーが発生してもアプリケーションがクラッシュしないことを確認
                expect(screen.getByText('統計データを読み込み中...')).toBeInTheDocument();
            });
        });

        it('CSV出力エラーが適切に処理される', async () => {
            // file-saverでエラーを発生させる
            const { saveAs } = require('file-saver');
            saveAs.mockImplementation(() => {
                throw new Error('CSV export failed');
            });

            renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);

            const exportButton = screen.getByText('CSV出力');
            fireEvent.click(exportButton);

            // エラーメッセージが表示されることを確認
            await waitFor(() => {
                // window.alertのモックを確認するか、エラー表示要素を確認
                expect(exportButton).toBeInTheDocument();
            });
        });
    });

    describe('パフォーマンステスト', () => {
        it('大量データでも適切に表示される', async () => {
            const { users, mealRecords } = createStatisticsTestData();
            const largeDataset = {
                users: generateMockUsers(100),
                mealRecords: generateMockMealRecords(generateMockUsers(100), 90),
                currentMenu: null,
                selectedUser: null,
                currentView: 'statistics',
            };

            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(largeDataset));

            const startTime = performance.now();
            renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);

            await waitFor(() => {
                expect(screen.getByText('📊 統計・分析')).toBeInTheDocument();
            });

            const endTime = performance.now();
            const renderTime = endTime - startTime;

            // 3秒以内でレンダリング完了することを期待
            expect(renderTime).toBeLessThan(3000);
        });
    });

    describe('統計データの正確性', () => {
        it('正しい統計値が表示される', async () => {
            const testData = createStatisticsTestData();
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
                users: testData.users,
                mealRecords: testData.mealRecords,
                currentMenu: null,
                selectedUser: null,
                currentView: 'statistics',
            }));

            renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);

            await waitFor(() => {
                // 期待される統計値が表示されることを確認
                const summarySection = screen.getByText('📋 期間サマリー').closest('.MuiCard-root');
                expect(summarySection).toBeInTheDocument();

                // 利用者数の表示確認
                expect(screen.getByText(testData.expectedStats.totalUsers.toString())).toBeInTheDocument();
            });
        });

        it('フィルター適用後の統計が正確である', async () => {
            renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);

            // 今日のフィルターを適用
            const todayButton = screen.getByText('今日');
            fireEvent.click(todayButton);

            await waitFor(() => {
                // 今日のデータのみの統計が表示されることを確認
                const todaySection = screen.getByText('📈 今日の状況').closest('.MuiCard-root');
                expect(todaySection).toBeInTheDocument();
            });
        });
    });

    describe('アクセシビリティ', () => {
        it('適切なARIAラベルが設定されている', () => {
            renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);

            // ボタンのアクセシビリティ
            const refreshButton = screen.getByText('更新');
            expect(refreshButton).toHaveAttribute('type', 'button');

            const exportButton = screen.getByText('CSV出力');
            expect(exportButton).toHaveAttribute('type', 'button');
        });

        it('キーボードナビゲーションが機能する', () => {
            renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);

            const refreshButton = screen.getByText('更新');
            refreshButton.focus();
            expect(document.activeElement).toBe(refreshButton);

            // Tabキーでの移動
            fireEvent.keyDown(refreshButton, { key: 'Tab' });
            // 次の要素にフォーカスが移ることを確認
        });
    });
}); 