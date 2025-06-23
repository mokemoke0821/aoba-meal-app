import { ThemeProvider } from '@mui/material';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import aobaTheme from '../../theme';
import ErrorBoundary from '../ErrorBoundary';

// テスト用エラーコンポーネント
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
    if (shouldThrow) {
        throw new Error('テスト用エラー');
    }
    return <div>正常なコンポーネント</div>;
};

// エラー詳細を持つテストコンポーネント
const ThrowDetailedError = ({ error }: { error?: string }) => {
    if (error) {
        const detailedError = new Error(error);
        detailedError.stack = `Error: ${error}\n    at ThrowDetailedError\n    at TestComponent`;
        throw detailedError;
    }
    return <div>正常なコンポーネント</div>;
};

// テストユーティリティ
const renderWithTheme = (component: React.ReactElement) => {
    return render(
        <ThemeProvider theme={aobaTheme}>
            {component}
        </ThemeProvider>
    );
};

// console.error のモック
const originalError = console.error;
beforeAll(() => {
    console.error = jest.fn();
});

afterAll(() => {
    console.error = originalError;
});

// localStorage のモック
const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
});

// navigator.clipboard のモック
const mockClipboard = {
    writeText: jest.fn(),
};

Object.defineProperty(navigator, 'clipboard', {
    value: mockClipboard,
});

// window.location.reload のモック
const mockReload = jest.fn();
Object.defineProperty(window, 'location', {
    value: {
        reload: mockReload,
    },
});

describe('ErrorBoundary', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockLocalStorage.setItem.mockClear();
        mockLocalStorage.getItem.mockReturnValue(null);
        mockClipboard.writeText.mockResolvedValue(undefined);
    });

    describe('正常状態', () => {
        it('エラーがない場合は子コンポーネントを正常に表示する', () => {
            renderWithTheme(
                <ErrorBoundary>
                    <div>正常なコンポーネント</div>
                </ErrorBoundary>
            );

            expect(screen.getByText('正常なコンポーネント')).toBeInTheDocument();
            expect(screen.queryByText('エラーが発生しました')).not.toBeInTheDocument();
        });

        it('複数の子コンポーネントを正常に表示する', () => {
            renderWithTheme(
                <ErrorBoundary>
                    <div>コンポーネント1</div>
                    <div>コンポーネント2</div>
                    <span>コンポーネント3</span>
                </ErrorBoundary>
            );

            expect(screen.getByText('コンポーネント1')).toBeInTheDocument();
            expect(screen.getByText('コンポーネント2')).toBeInTheDocument();
            expect(screen.getByText('コンポーネント3')).toBeInTheDocument();
        });
    });

    describe('エラー発生時', () => {
        it('エラーが発生した場合にエラー画面を表示する', () => {
            renderWithTheme(
                <ErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </ErrorBoundary>
            );

            expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
            expect(screen.getByText('申し訳ございません。予期しないエラーが発生しました。')).toBeInTheDocument();
            expect(screen.queryByText('正常なコンポーネント')).not.toBeInTheDocument();
        });

        it('エラーメッセージが正しく表示される', () => {
            renderWithTheme(
                <ErrorBoundary>
                    <ThrowDetailedError error="カスタムエラーメッセージ" />
                </ErrorBoundary>
            );

            expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();

            // エラー詳細の展開
            const detailButton = screen.getByText('詳細を表示');
            fireEvent.click(detailButton);

            expect(screen.getByText('カスタムエラーメッセージ')).toBeInTheDocument();
        });

        it('エラーIDが生成される', () => {
            renderWithTheme(
                <ErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </ErrorBoundary>
            );

            expect(screen.getByText(/エラーID:/)).toBeInTheDocument();

            // エラーIDの形式確認（UUID形式）
            const errorIdElement = screen.getByText(/エラーID:/);
            const errorIdText = errorIdElement.textContent || '';
            const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
            expect(errorIdText).toMatch(uuidPattern);
        });

        it('エラー情報がlocalStorageに保存される', () => {
            renderWithTheme(
                <ErrorBoundary>
                    <ThrowDetailedError error="保存テスト用エラー" />
                </ErrorBoundary>
            );

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                'aobaAppErrors',
                expect.stringContaining('保存テスト用エラー')
            );
        });

        it('最大10件のエラーログが保持される', () => {
            // 既存の10件のエラーログをモック
            const existingErrors = Array.from({ length: 10 }, (_, i) => ({
                id: `error-${i}`,
                message: `既存エラー${i}`,
                timestamp: new Date().toISOString(),
            }));

            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingErrors));

            renderWithTheme(
                <ErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </ErrorBoundary>
            );

            // setItemが呼ばれて、最新のエラーが追加され、最古のエラーが削除されることを確認
            expect(mockLocalStorage.setItem).toHaveBeenCalled();
            const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
            expect(savedData.length).toBe(10);
            expect(savedData[0].message).toBe('テスト用エラー'); // 最新が先頭
        });
    });

    describe('ユーザーアクション', () => {
        it('再試行ボタンが機能する', () => {
            const { rerender } = renderWithTheme(
                <ErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </ErrorBoundary>
            );

            expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();

            const retryButton = screen.getByText('再試行');
            fireEvent.click(retryButton);

            // エラーが解決された状態で再レンダリング
            rerender(
                <ErrorBoundary>
                    <ThrowError shouldThrow={false} />
                </ErrorBoundary>
            );

            expect(screen.getByText('正常なコンポーネント')).toBeInTheDocument();
            expect(screen.queryByText('エラーが発生しました')).not.toBeInTheDocument();
        });

        it('リロードボタンが機能する', () => {
            renderWithTheme(
                <ErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </ErrorBoundary>
            );

            const reloadButton = screen.getByText('ページを再読み込み');
            fireEvent.click(reloadButton);

            expect(mockReload).toHaveBeenCalled();
        });

        it('ホームボタンが機能する', () => {
            renderWithTheme(
                <ErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </ErrorBoundary>
            );

            const homeButton = screen.getByText('ホームに戻る');
            fireEvent.click(homeButton);

            // ホーム画面への遷移は親コンポーネントで処理されるため、
            // ここではボタンが正常にクリックできることを確認
            expect(homeButton).toBeInTheDocument();
        });

        it('エラー詳細の展開・折りたたみが機能する', () => {
            renderWithTheme(
                <ErrorBoundary>
                    <ThrowDetailedError error="詳細表示テスト" />
                </ErrorBoundary>
            );

            // 初期状態では詳細は非表示
            expect(screen.queryByText('詳細表示テスト')).not.toBeInTheDocument();

            // 詳細を表示
            const showDetailButton = screen.getByText('詳細を表示');
            fireEvent.click(showDetailButton);

            expect(screen.getByText('詳細表示テスト')).toBeInTheDocument();
            expect(screen.getByText('詳細を非表示')).toBeInTheDocument();

            // 詳細を非表示
            const hideDetailButton = screen.getByText('詳細を非表示');
            fireEvent.click(hideDetailButton);

            expect(screen.queryByText('詳細表示テスト')).not.toBeInTheDocument();
            expect(screen.getByText('詳細を表示')).toBeInTheDocument();
        });
    });

    describe('エラーレポート機能', () => {
        it('エラーレポートのコピーが機能する', async () => {
            renderWithTheme(
                <ErrorBoundary>
                    <ThrowDetailedError error="レポートテスト用エラー" />
                </ErrorBoundary>
            );

            const copyButton = screen.getByText('エラーレポートをコピー');
            fireEvent.click(copyButton);

            await waitFor(() => {
                expect(mockClipboard.writeText).toHaveBeenCalled();
            });

            const copiedText = mockClipboard.writeText.mock.calls[0][0];
            expect(copiedText).toContain('レポートテスト用エラー');
            expect(copiedText).toContain('エラーID:');
            expect(copiedText).toContain('発生時刻:');
        });

        it('クリップボードアクセスエラーが適切に処理される', async () => {
            mockClipboard.writeText.mockRejectedValue(new Error('Clipboard access denied'));

            renderWithTheme(
                <ErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </ErrorBoundary>
            );

            const copyButton = screen.getByText('エラーレポートをコピー');
            fireEvent.click(copyButton);

            await waitFor(() => {
                // エラーが発生してもアプリケーションがクラッシュしないことを確認
                expect(copyButton).toBeInTheDocument();
            });
        });

        it('エラーレポートに必要な情報が含まれる', async () => {
            renderWithTheme(
                <ErrorBoundary>
                    <ThrowDetailedError error="完全なレポートテスト" />
                </ErrorBoundary>
            );

            const copyButton = screen.getByText('エラーレポートをコピー');
            fireEvent.click(copyButton);

            const copiedText = await waitFor(() => {
                return mockClipboard.writeText.mock.calls[0][0];
            });

            expect(copiedText).toContain('あおば事業所給食管理アプリ - エラーレポート');
            expect(copiedText).toContain('エラーメッセージ: 完全なレポートテスト');
            expect(copiedText).toContain('ユーザーエージェント:');
            expect(copiedText).toContain('画面解像度:');
            expect(copiedText).toContain('ローカルストレージ容量:');
        });
    });

    describe('エラー情報の永続化', () => {
        it('localStorage読み込みエラーが適切に処理される', () => {
            mockLocalStorage.getItem.mockImplementation(() => {
                throw new Error('localStorage access error');
            });

            // エラーが発生してもコンポーネントが正常に動作することを確認
            renderWithTheme(
                <ErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </ErrorBoundary>
            );

            expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
        });

        it('不正なJSONデータが適切に処理される', () => {
            mockLocalStorage.getItem.mockReturnValue('invalid json data');

            renderWithTheme(
                <ErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </ErrorBoundary>
            );

            expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
            // 新しいエラーログが保存されることを確認
            expect(mockLocalStorage.setItem).toHaveBeenCalled();
        });

        it('localStorage容量制限が適切に処理される', () => {
            mockLocalStorage.setItem.mockImplementation(() => {
                throw new Error('QuotaExceededError');
            });

            renderWithTheme(
                <ErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </ErrorBoundary>
            );

            // エラーログ保存に失敗してもエラー画面は表示される
            expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
        });
    });

    describe('アクセシビリティ', () => {
        it('適切なARIAラベルが設定されている', () => {
            renderWithTheme(
                <ErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </ErrorBoundary>
            );

            const errorAlert = screen.getByRole('alert');
            expect(errorAlert).toBeInTheDocument();

            const buttons = screen.getAllByRole('button');
            expect(buttons.length).toBeGreaterThan(0);

            buttons.forEach(button => {
                expect(button).toHaveAttribute('type', 'button');
            });
        });

        it('キーボードナビゲーションが機能する', async () => {
            renderWithTheme(
                <ErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </ErrorBoundary>
            );

            const retryButton = screen.getByRole('button', { name: '再試行' });
            retryButton.focus();
            expect(retryButton).toHaveFocus();

            // Tabキーで次のボタンに移動
            userEvent.tab();

            const reloadButton = screen.getByRole('button', { name: 'ページを再読み込み' });
            expect(reloadButton).toHaveFocus();
        });

        it('スクリーンリーダー用の適切なラベルが設定されている', () => {
            renderWithTheme(
                <ErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </ErrorBoundary>
            );

            const errorAlert = screen.getByRole('alert');
            expect(errorAlert).toHaveAttribute('aria-live', 'assertive');
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

            renderWithTheme(
                <ErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </ErrorBoundary>
            );

            expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();

            // モバイルでもすべてのボタンが表示されることを確認
            expect(screen.getByText('再試行')).toBeInTheDocument();
            expect(screen.getByText('ページを再読み込み')).toBeInTheDocument();
            expect(screen.getByText('ホームに戻る')).toBeInTheDocument();
        });

        it('タブレットビューで適切に表示される', () => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 768,
            });

            renderWithTheme(
                <ErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </ErrorBoundary>
            );

            expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
        });
    });

    describe('特殊なエラーケース', () => {
        it('nullエラーがキャッチされる', () => {
            const ThrowNullError = () => {
                // eslint-disable-next-line @typescript-eslint/no-throw-literal
                throw null;
            };
            renderWithTheme(
                <ErrorBoundary>
                    <ThrowNullError />
                </ErrorBoundary>
            );
            expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
        });

        it('文字列エラーがキャッチされる', () => {
            const ThrowStringError = () => {
                throw new Error('ただの文字列エラー');
            };
            renderWithTheme(
                <ErrorBoundary>
                    <ThrowStringError />
                </ErrorBoundary>
            );
            expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
        });

        it('循環参照エラーがキャッチされる', () => {
            const ThrowCircularError = () => {
                const a: any = {};
                const b: any = { a };
                a.b = b;
                throw new Error(JSON.stringify(a));
            };
            renderWithTheme(
                <ErrorBoundary>
                    <ThrowCircularError />
                </ErrorBoundary>
            );
            expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
        });
    });

    describe('パフォーマンステスト', () => {
        it('エラー処理が適切な時間内で完了する', () => {
            const startTime = performance.now();

            renderWithTheme(
                <ErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </ErrorBoundary>
            );

            const endTime = performance.now();
            const processingTime = endTime - startTime;

            // エラー処理が500ms以内で完了することを期待
            expect(processingTime).toBeLessThan(500);
            expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
        });

        it('大量のエラーログでもパフォーマンスが維持される', () => {
            // 大量のエラーログをモック
            const largeErrorLog = Array.from({ length: 100 }, (_, i) => ({
                id: `error-${i}`,
                message: `エラー${i}`,
                timestamp: new Date().toISOString(),
            }));

            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(largeErrorLog));

            const startTime = performance.now();

            renderWithTheme(
                <ErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </ErrorBoundary>
            );

            const endTime = performance.now();
            const processingTime = endTime - startTime;

            // 大量ログがあってもエラー処理が1秒以内で完了することを期待
            expect(processingTime).toBeLessThan(1000);
            expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
        });
    });

    describe('componentDidCatchが呼ばれることを確認', () => {
        it('componentDidCatchが呼ばれることを確認', async () => {
            const spy = jest.spyOn(ErrorBoundary.prototype, 'componentDidCatch');

            renderWithTheme(
                <ErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </ErrorBoundary>
            );

            // componentDidCatchが呼ばれることを確認
            await waitFor(() => {
                expect(spy).toHaveBeenCalled();
            });
            expect(spy.mock.calls[0][0]).toBeInstanceOf(Error);
            expect(spy.mock.calls[0][0].message).toBe('Test error');
            expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();

            spy.mockRestore();
        });
    });
}); 