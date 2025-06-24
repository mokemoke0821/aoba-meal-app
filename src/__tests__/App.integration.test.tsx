import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import App from '../App';
import { AppProvider } from '../contexts/AppContext';
import { AppState } from '../types';
import { mockMenuItem, mockUsers } from '../utils/testHelpers';

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

    return render(<AppProvider initialStateForTest={fullInitialState}>{ui}</AppProvider>);
};

describe('<App /> Integration Tests', () => {

    beforeEach(() => {
        // localStorageのモックは不要になったためクリア
    });

    test('初期画面が正しく表示されること', async () => {
        renderWithProviders(<App />);

        await waitFor(() => {
            expect(screen.getByText('🍽️ あおば給食管理')).toBeInTheDocument();
        });
        expect(screen.getByText('利用者区分を選択してください')).toBeInTheDocument();
    });

    test('カテゴリを選択するとユーザー選択画面に遷移すること', async () => {
        renderWithProviders(<App />);

        await waitFor(() => {
            expect(screen.getByText('A型作業所')).toBeInTheDocument();
        });
        expect(screen.getByText('B型作業所')).toBeInTheDocument();

        fireEvent.click(screen.getByText('A型作業所'));

        await waitFor(() => {
            expect(screen.getByText('利用者を選んでください')).toBeInTheDocument();
        });
        expect(screen.getByText('1 田中太郎')).toBeInTheDocument();
    });

    test('ユーザーを選択すると給食注文画面に遷移すること', async () => {
        renderWithProviders(<App />, {
            initialState: {
                currentView: 'userSelect',
                selectedCategory: 'A型'
            }
        });

        await waitFor(() => {
            expect(screen.getByText('1 田中太郎')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('1 田中太郎'));

        await waitFor(() => {
            expect(screen.getByText('🍱 今日の給食')).toBeInTheDocument();
        });
        expect(screen.getByText('注文する')).toBeInTheDocument();
    });

    test('注文後に評価画面に遷移し、評価後にカテゴリ選択画面に戻ること', async () => {
        renderWithProviders(<App />, {
            initialState: {
                currentView: 'mealOrder',
                selectedUser: mockUsers[0]
            }
        });

        await waitFor(() => {
            expect(screen.getByText('注文する')).toBeInTheDocument();
        });

        await userEvent.click(screen.getByText('注文する'));
        await userEvent.click(await screen.findByText('はい'));

        await waitFor(() => {
            expect(screen.getByText('評価を入力してください')).toBeInTheDocument();
        });
        expect(screen.getByText('5')).toBeInTheDocument();

        await userEvent.click(screen.getByText('評価を送信'));

        await waitFor(() => {
            expect(screen.getByText('カテゴリ選択画面')).toBeInTheDocument();
        });
    });

    test('管理者としてログインし、管理画面にアクセスできること', async () => {
        renderWithProviders(<App />);

        await userEvent.click(screen.getByLabelText('管理画面'));

        await waitFor(() => {
            expect(screen.getByLabelText('管理者パスワード')).toBeInTheDocument();
        });

        await userEvent.type(screen.getByLabelText('管理者パスワード'), 'test-admin-password');
        await userEvent.click(screen.getByText('認証'));

        await waitFor(() => {
            expect(screen.getByText('管理パネル')).toBeInTheDocument();
        });
        expect(screen.getByText('利用者管理')).toBeInTheDocument();
    });
}); 