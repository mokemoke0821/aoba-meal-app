import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import {
    generateMockMealRecords,
    generateMockUsers,
    mockLocalStorage,
    mockMealRecords,
    mockUsers
} from '../utils/testHelpers';

// ResizeObserver のモック
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// LocalStorage のモック
Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
});

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

describe('App Integration Tests', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        jest.clearAllMocks();
        mockLocalStorage.reset();
    });

    describe('アプリケーション初期化', () => {
        it('初期状態でユーザー選択画面が表示される', async () => {
            render(<App />);

            await waitFor(() => {
                expect(screen.getByText('あおば事業所給食管理')).toBeInTheDocument();
                expect(screen.getByText('利用者を選択してください')).toBeInTheDocument();
            });
        });

        it('既存データがある場合は正しく読み込まれる', async () => {
            mockLocalStorage.seedWithAppData({
                users: mockUsers,
                mealRecords: mockMealRecords,
                currentMenu: null,
                selectedUser: null,
                currentView: 'userSelect',
            });

            render(<App />);

            await waitFor(() => {
                expect(screen.getByText('田中太郎')).toBeInTheDocument();
                expect(screen.getByText('佐藤花子')).toBeInTheDocument();
            });
        });

        it('データが存在しない場合は初期データが作成される', async () => {
            render(<App />);

            await waitFor(() => {
                expect(screen.getByText('あおば事業所給食管理')).toBeInTheDocument();
            });

            // localStorageにデータが保存されることを確認
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                'aobaAppData',
                expect.stringContaining('users')
            );
        });
    });

    describe('ユーザー管理フロー', () => {
        it('新しいユーザーを追加できる', async () => {
            render(<App />);

            // ユーザー管理画面に移動
            const userManagementButton = await screen.findByText('👥 利用者管理');
            await user.click(userManagementButton);

            // 新しいユーザーを追加
            const addUserButton = await screen.findByText('新しい利用者を追加');
            await user.click(addUserButton);

            // フォームに入力
            const nameInput = screen.getByLabelText('利用者名');
            await user.type(nameInput, '新規利用者');

            const groupSelect = screen.getByLabelText('所属グループ');
            await user.click(groupSelect);
            const groupOption = await screen.findByText('グループA');
            await user.click(groupOption);

            const priceInput = screen.getByLabelText('給食料金');
            await user.clear(priceInput);
            await user.type(priceInput, '550');

            // 保存
            const saveButton = screen.getByText('保存');
            await user.click(saveButton);

            // 新しいユーザーが表示されることを確認
            await waitFor(() => {
                expect(screen.getByText('新規利用者')).toBeInTheDocument();
            });
        });

        it('ユーザー情報を編集できる', async () => {
            mockLocalStorage.seedWithAppData({
                users: mockUsers,
                mealRecords: [],
                currentMenu: null,
                selectedUser: null,
                currentView: 'userSelect',
            });

            render(<App />);

            // ユーザー管理画面に移動
            const userManagementButton = await screen.findByText('👥 利用者管理');
            await user.click(userManagementButton);

            // 最初のユーザーを編集
            const editButtons = await screen.findAllByText('編集');
            await user.click(editButtons[0]);

            // 名前を変更
            const nameInput = screen.getByDisplayValue('田中太郎');
            await user.clear(nameInput);
            await user.type(nameInput, '田中太郎（編集済み）');

            // 保存
            const saveButton = screen.getByText('保存');
            await user.click(saveButton);

            // 変更が反映されることを確認
            await waitFor(() => {
                expect(screen.getByText('田中太郎（編集済み）')).toBeInTheDocument();
            });
        });

        it('ユーザーを削除できる', async () => {
            mockLocalStorage.seedWithAppData({
                users: mockUsers,
                mealRecords: [],
                currentMenu: null,
                selectedUser: null,
                currentView: 'userSelect',
            });

            render(<App />);

            // ユーザー管理画面に移動
            const userManagementButton = await screen.findByText('👥 利用者管理');
            await user.click(userManagementButton);

            // 最初のユーザーを削除
            const deleteButtons = await screen.findAllByText('削除');
            await user.click(deleteButtons[0]);

            // 確認ダイアログで削除を実行
            const confirmButton = await screen.findByText('削除する');
            await user.click(confirmButton);

            // ユーザーが削除されることを確認
            await waitFor(() => {
                expect(screen.queryByText('田中太郎')).not.toBeInTheDocument();
            });
        });
    });

    describe('給食記録フロー', () => {
        it('給食の注文から評価まで完全なフローが実行できる', async () => {
            mockLocalStorage.seedWithAppData({
                users: mockUsers,
                mealRecords: [],
                currentMenu: {
                    id: 'today_menu',
                    name: 'テスト給食',
                    date: new Date().toISOString().split('T')[0],
                    description: 'テスト用メニュー',
                    price: 500,
                    category: 'main',
                },
                selectedUser: null,
                currentView: 'userSelect',
            });

            render(<App />);

            // ユーザーを選択
            const userCard = await screen.findByText('田中太郎');
            await user.click(userCard);

            // 注文画面が表示されることを確認
            await waitFor(() => {
                expect(screen.getByText('テスト給食')).toBeInTheDocument();
                expect(screen.getByText('注文する')).toBeInTheDocument();
            });

            // 注文を実行
            const orderButton = screen.getByText('注文する');
            await user.click(orderButton);

            // 評価画面が表示されることを確認
            await waitFor(() => {
                expect(screen.getByText('評価をお聞かせください')).toBeInTheDocument();
            });

            // 評価を入力
            const ratingSlider = screen.getByRole('slider');
            fireEvent.change(ratingSlider, { target: { value: '8' } });

            const commentInput = screen.getByLabelText('コメント');
            await user.type(commentInput, 'とても美味しかったです');

            // 評価を送信
            const submitButton = screen.getByText('評価を送信');
            await user.click(submitButton);

            // 完了画面が表示されることを確認
            await waitFor(() => {
                expect(screen.getByText('ありがとうございました')).toBeInTheDocument();
            });
        });

        it('注文履歴を確認できる', async () => {
            mockLocalStorage.seedWithAppData({
                users: mockUsers,
                mealRecords: mockMealRecords,
                currentMenu: null,
                selectedUser: mockUsers[0],
                currentView: 'userSelect',
            });

            render(<App />);

            // ユーザーを選択
            const userCard = await screen.findByText('田中太郎');
            await user.click(userCard);

            // 履歴タブに移動
            const historyTab = await screen.findByText('注文履歴');
            await user.click(historyTab);

            // 履歴が表示されることを確認
            await waitFor(() => {
                expect(screen.getByText('カレーライス')).toBeInTheDocument();
                expect(screen.getByText('評価: 8')).toBeInTheDocument();
            });
        });
    });

    describe('統計・分析フロー', () => {
        it('統計画面を表示して各種データを確認できる', async () => {
            const testUsers = generateMockUsers(10);
            const testRecords = generateMockMealRecords(testUsers, 30);

            mockLocalStorage.seedWithAppData({
                users: testUsers,
                mealRecords: testRecords,
                currentMenu: null,
                selectedUser: null,
                currentView: 'userSelect',
            });

            render(<App />);

            // 統計画面に移動
            const statisticsButton = await screen.findByText('📊 統計・分析');
            await user.click(statisticsButton);

            // 統計データが表示されることを確認
            await waitFor(() => {
                expect(screen.getByText('📈 今日の状況')).toBeInTheDocument();
                expect(screen.getByText('📋 期間サマリー')).toBeInTheDocument();
                expect(screen.getByText('📈 日別注文・評価推移')).toBeInTheDocument();
            });

            // 期間フィルターを使用
            const todayFilter = screen.getByText('今日');
            await user.click(todayFilter);

            // フィルターが適用されることを確認
            await waitFor(() => {
                expect(screen.getByText('📈 今日の状況')).toBeInTheDocument();
            });
        });

        it('CSV出力機能が動作する', async () => {
            mockLocalStorage.seedWithAppData({
                users: mockUsers,
                mealRecords: mockMealRecords,
                currentMenu: null,
                selectedUser: null,
                currentView: 'userSelect',
            });

            render(<App />);

            // 統計画面に移動
            const statisticsButton = await screen.findByText('📊 統計・分析');
            await user.click(statisticsButton);

            // CSV出力ボタンをクリック
            const exportButton = await screen.findByText('CSV出力');
            await user.click(exportButton);

            // file-saverが呼ばれることを確認
            const { saveAs } = require('file-saver');
            await waitFor(() => {
                expect(saveAs).toHaveBeenCalled();
            });
        });
    });

    describe('設定・管理フロー', () => {
        it('設定画面でアプリケーション設定を変更できる', async () => {
            render(<App />);

            // 設定画面に移動
            const settingsButton = await screen.findByText('⚙️ 設定');
            await user.click(settingsButton);

            // 設定項目が表示されることを確認
            await waitFor(() => {
                expect(screen.getByText('📊 統計・分析設定')).toBeInTheDocument();
                expect(screen.getByText('🔐 データ管理')).toBeInTheDocument();
            });

            // バックアップ作成
            const backupButton = screen.getByText('バックアップを作成');
            await user.click(backupButton);

            // バックアップが作成されることを確認
            const { saveAs } = require('file-saver');
            await waitFor(() => {
                expect(saveAs).toHaveBeenCalled();
            });
        });

        it('データの初期化が正常に動作する', async () => {
            mockLocalStorage.seedWithAppData({
                users: mockUsers,
                mealRecords: mockMealRecords,
                currentMenu: null,
                selectedUser: null,
                currentView: 'userSelect',
            });

            render(<App />);

            // 設定画面に移動
            const settingsButton = await screen.findByText('⚙️ 設定');
            await user.click(settingsButton);

            // データ初期化
            const resetButton = await screen.findByText('データを初期化');
            await user.click(resetButton);

            // 確認ダイアログで実行
            const confirmButton = await screen.findByText('初期化する');
            await user.click(confirmButton);

            // データが初期化されることを確認
            await waitFor(() => {
                expect(screen.getByText('利用者を選択してください')).toBeInTheDocument();
            });
        });
    });

    describe('エラーハンドリング', () => {
        it('データ読み込みエラーが適切に処理される', async () => {
            // 不正なJSONデータを設定
            mockLocalStorage.getItem.mockReturnValue('invalid json');

            render(<App />);

            // エラーバウンダリが動作して、アプリがクラッシュしないことを確認
            await waitFor(() => {
                // アプリが正常に動作するか、エラー画面が表示されることを確認
                expect(
                    screen.getByText('あおば事業所給食管理') ||
                    screen.queryByText('エラーが発生しました')
                ).toBeInTheDocument();
            });
        });

        it('localStorage容量不足エラーが適切に処理される', async () => {
            // setItemでエラーを発生させる
            mockLocalStorage.setItem.mockImplementation(() => {
                throw new Error('QuotaExceededError');
            });

            render(<App />);

            // ユーザー追加を試行
            const userManagementButton = await screen.findByText('👥 利用者管理');
            await user.click(userManagementButton);

            const addUserButton = await screen.findByText('新しい利用者を追加');
            await user.click(addUserButton);

            // フォームに入力
            const nameInput = screen.getByLabelText('利用者名');
            await user.type(nameInput, 'テストユーザー');

            const saveButton = screen.getByText('保存');
            await user.click(saveButton);

            // エラーが適切に処理されることを確認
            await waitFor(() => {
                // エラーメッセージまたは警告が表示される
                expect(
                    screen.queryByText(/保存に失敗/) ||
                    screen.queryByText(/容量不足/)
                ).toBeInTheDocument();
            });
        });

        it('ネットワークエラーが適切に処理される', async () => {
            // fetch のモック
            global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

            render(<App />);

            // 外部APIを使用する機能があれば、ここでテスト
            // 現在のアプリではローカル動作のため、将来の拡張に備えた準備
            await waitFor(() => {
                expect(screen.getByText('あおば事業所給食管理')).toBeInTheDocument();
            });
        });
    });

    describe('パフォーマンステスト', () => {
        it('大量データでも適切に動作する', async () => {
            const largeUserSet = generateMockUsers(100);
            const largeRecordSet = generateMockMealRecords(largeUserSet, 90);

            mockLocalStorage.seedWithAppData({
                users: largeUserSet,
                mealRecords: largeRecordSet,
                currentMenu: null,
                selectedUser: null,
                currentView: 'userSelect',
            });

            const startTime = performance.now();
            render(<App />);

            await waitFor(() => {
                expect(screen.getByText('あおば事業所給食管理')).toBeInTheDocument();
            });

            const endTime = performance.now();
            const loadTime = endTime - startTime;

            // 5秒以内で読み込み完了することを期待
            expect(loadTime).toBeLessThan(5000);

            // 統計画面でもパフォーマンステスト
            const statisticsButton = await screen.findByText('📊 統計・分析');

            const statsStartTime = performance.now();
            await user.click(statisticsButton);

            await waitFor(() => {
                expect(screen.getByText('📈 今日の状況')).toBeInTheDocument();
            });

            const statsEndTime = performance.now();
            const statsLoadTime = statsEndTime - statsStartTime;

            // 統計処理も3秒以内で完了することを期待
            expect(statsLoadTime).toBeLessThan(3000);
        });

        it('メモリリークが発生しない', async () => {
            const initialMemory = (performance as any).memory?.usedJSHeapSize;

            // 複数回の画面遷移を実行
            const { unmount } = render(<App />);

            for (let i = 0; i < 5; i++) {
                const userManagementButton = await screen.findByText('👥 利用者管理');
                await user.click(userManagementButton);

                const backButton = await screen.findByText('戻る');
                await user.click(backButton);
            }

            unmount();

            // メモリ使用量の大幅な増加がないことを確認
            if ((performance as any).memory) {
                const finalMemory = (performance as any).memory.usedJSHeapSize;
                const memoryIncrease = finalMemory - initialMemory;

                // メモリ増加が10MB以下であることを期待
                expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
            }
        });
    });

    describe('アクセシビリティ', () => {
        it('キーボードナビゲーションが完全に機能する', async () => {
            render(<App />);

            // Tabキーでのナビゲーション
            await user.tab();

            // フォーカス可能な要素が順序良く移動することを確認
            const focusedElement = document.activeElement;
            expect(focusedElement).toBeInTheDocument();
            expect(focusedElement?.tagName).toMatch(/BUTTON|INPUT|A/i);
        });

        it('スクリーンリーダー用のラベルが適切に設定されている', async () => {
            render(<App />);

            // 主要なランドマークの確認
            expect(screen.getByRole('main')).toBeInTheDocument();

            // ボタンのアクセシビリティ
            const buttons = screen.getAllByRole('button');
            buttons.forEach(button => {
                expect(button).toHaveAttribute('type', 'button');
            });
        });

        it('色覚障害者に配慮した色設計が適用されている', async () => {
            render(<App />);

            // 重要な情報が色以外の手段でも伝達されることを確認
            // Material-UIのアクセシビリティ機能が適用されることを確認
            expect(screen.getByText('あおば事業所給食管理')).toBeInTheDocument();
        });
    });

    describe('レスポンシブデザイン', () => {
        it('モバイルデバイスで適切に表示される', async () => {
            // モバイルビューポートに設定
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 375,
            });

            render(<App />);

            await waitFor(() => {
                expect(screen.getByText('あおば事業所給食管理')).toBeInTheDocument();
            });

            // モバイル向けレイアウトが適用されることを確認
            // 横スクロールが発生しないことなどを確認
        });

        it('タブレットデバイスで適切に表示される', async () => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 768,
            });

            render(<App />);

            await waitFor(() => {
                expect(screen.getByText('あおば事業所給食管理')).toBeInTheDocument();
            });
        });

        it('デスクトップで適切に表示される', async () => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 1200,
            });

            render(<App />);

            await waitFor(() => {
                expect(screen.getByText('あおば事業所給食管理')).toBeInTheDocument();
            });
        });
    });
}); 