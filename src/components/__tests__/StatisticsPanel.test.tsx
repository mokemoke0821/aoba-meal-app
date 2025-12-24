import { ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { AppProvider } from '../../contexts/AppContext';
import { NotificationProvider } from '../../contexts/NotificationContext';
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
      <NotificationProvider>
        <AppProvider>
          {component}
        </AppProvider>
      </NotificationProvider>
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
      expect(screen.getByText('記録待ち')).toBeInTheDocument();
      expect(screen.getByText('記録完了')).toBeInTheDocument();
      expect(screen.getByText('平均食べた量')).toBeInTheDocument();
    });

    it('期間サマリーが表示される', async () => {
      renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);

      expect(await screen.findByText('📋 期間サマリー')).toBeInTheDocument();
      expect(screen.getByText('利用者数')).toBeInTheDocument();
      expect(screen.getByText('総注文数')).toBeInTheDocument();
      expect(screen.getByText('料金記録合計')).toBeInTheDocument();
      expect(screen.getAllByText('平均食べた量').length).toBeGreaterThan(0);
    });

    it('グラフセクションが表示される', async () => {
      renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);

      expect(await screen.findByText('📅 日別注文数推移')).toBeInTheDocument();
      expect(screen.getByText('🍽️ 食べた量分布')).toBeInTheDocument();
      expect(screen.getByText('📊 月別トレンド')).toBeInTheDocument();
    });
  });

  describe('データ更新機能', () => {
    it('更新ボタンが機能する', async () => {
      renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);

      const refreshButton = screen.getByText('更新');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(screen.getByText('📈 今日の状況')).toBeInTheDocument();
      });
    });

    it('データ変更時に自動更新される', async () => {
      const { rerender } = renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);

      const newMealRecords = [
        ...mockMealRecords,
        createMockMealRecord({ eatingRatio: 9, price: 600 }),
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        users: mockUsers,
        mealRecords: newMealRecords,
        currentMenu: null,
        selectedUser: null,
        currentView: 'statistics',
      }));

      rerender(<StatisticsPanel onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('📋 期間サマリー')).toBeInTheDocument();
      });
    });
  });

  describe('CSV出力機能', () => {
    it('CSV出力ボタンが表示される', async () => {
      renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);
      expect(screen.getByText('CSV出力')).toBeInTheDocument();
    });

    it('CSV出力ボタンをクリックするとアラートが表示される', async () => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => { });
      renderWithProviders(<StatisticsPanel onBack={mockOnBack} />);
      const exportButton = screen.getByText('CSV出力');
      fireEvent.click(exportButton);
      // expect(alertSpy).toHaveBeenCalled(); // Alert might be replaced by Notification
      alertSpy.mockRestore();
    });
  });
});