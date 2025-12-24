import { ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { AppContent, theme } from '../App';
import { AppProvider } from '../contexts/AppContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { AppState } from '../types';
import { mockMenuItem, mockUsers } from '../utils/testHelpers';

// window.matchMedia のモック
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// ResizeObserver のモック
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// file-saver のモック
jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}));

// html2canvas のモック
jest.mock('html2canvas', () => jest.fn());

// jsPDF のモック
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    addImage: jest.fn(),
    save: jest.fn(),
  }));
});

// テスト用のカスタムレンダー関数
const renderWithProviders = (
  ui: React.ReactElement,
  {
    initialState = {}
  }: { initialState?: Partial<AppState> } = {}
) => {
  const fullInitialState: AppState = {
    users: mockUsers,
    mealRecords: [],
    currentMenu: mockMenuItem,
    selectedUser: null,
    selectedCategory: null,
    currentView: 'categorySelect',
    requireAdminAuth: false,
    ...initialState
  };

  return render(
    <ThemeProvider theme={theme}>
      <NotificationProvider>
        <AppProvider initialStateForTest={fullInitialState}>
          {ui}
        </AppProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
};

describe('<App /> Integration Tests', () => {

  beforeEach(() => {
    // localStorageのモックは不要になったためクリア
  });

  test('初期画面が正しく表示されること', async () => {
    renderWithProviders(<AppContent />);

    await waitFor(() => {
      expect(screen.getByText('給食アプリ')).toBeInTheDocument();
    });
  });

  test('カテゴリを選択するとユーザー選択画面に遷移すること', async () => {
    renderWithProviders(<AppContent />);

    await waitFor(() => {
      expect(screen.getByText('A型')).toBeInTheDocument();
    });
    expect(screen.getByText('B型')).toBeInTheDocument();

    fireEvent.click(screen.getByText('A型'));

    await waitFor(() => {
      expect(screen.getByText('利用者を選択してください')).toBeInTheDocument();
    });
    expect(screen.getByText('1. 田中太郎')).toBeInTheDocument();
  });

  test('ユーザーを選択すると給食注文画面に遷移すること', async () => {
    renderWithProviders(<AppContent />, {
      initialState: {
        currentView: 'userSelect',
        selectedCategory: 'A型'
      }
    });

    await waitFor(() => {
      expect(screen.getByText('1. 田中太郎')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('1. 田中太郎'));

    await waitFor(() => {
      expect(screen.getByText('🍱 給食注文')).toBeInTheDocument();
    });
    expect(screen.getByText('給食を注文する')).toBeInTheDocument();
  });

  test('注文後にカテゴリ選択画面に戻ること', async () => {
    renderWithProviders(<AppContent />, {
      initialState: {
        currentView: 'mealOrder',
        selectedUser: mockUsers[0]
      }
    });

    await waitFor(() => {
      expect(screen.getByText('給食を注文する')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('給食を注文する'));
    await userEvent.click(await screen.findByText('注文する'));

    await waitFor(() => {
      expect(screen.getByText('A型')).toBeInTheDocument();
    });
    expect(screen.getByText('B型')).toBeInTheDocument();
  });

  test('管理者としてログインし、管理画面にアクセスできること', async () => {
    renderWithProviders(<AppContent />);

    await userEvent.click(screen.getByLabelText('settings'));

    // デフォルトでは認証なしで管理画面に遷移する
    await waitFor(() => {
      expect(screen.getByText('管理者メニュー')).toBeInTheDocument();
    });
    expect(screen.getByText('ユーザー管理')).toBeInTheDocument();
  });
});