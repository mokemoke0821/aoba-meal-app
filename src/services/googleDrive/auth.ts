/**
 * Google Drive 認証モジュール
 * Google OAuth 2.0を使用した認証機能を提供
 */

import type { GoogleDriveAuthState, GoogleDriveUser } from '../../types';

// gapiはブラウザでのみ利用可能
declare const gapi: any;

// 環境変数から設定を読み込み
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY || '';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

// 認証状態管理
let authState: GoogleDriveAuthState = {
    isAuthenticated: false,
    isInitialized: false,
    user: null,
    error: null,
};

// 認証状態変更リスナー
type AuthStateListener = (state: GoogleDriveAuthState) => void;
const listeners: Set<AuthStateListener> = new Set();

/**
 * 認証状態変更を通知
 */
function notifyListeners(): void {
    listeners.forEach((listener) => listener({ ...authState }));
}

/**
 * 認証状態リスナーを追加
 */
export function addAuthStateListener(listener: AuthStateListener): () => void {
    listeners.add(listener);
    // 現在の状態を即座に通知
    listener({ ...authState });
    // リスナー削除用の関数を返す
    return () => listeners.delete(listener);
}

/**
 * Google API クライアントの初期化
 */
export async function initializeGoogleAuth(): Promise<void> {
    if (!CLIENT_ID || !API_KEY) {
        const error = 'Google Drive API の認証情報が設定されていません。.env.localファイルを確認してください。';
        console.error('[Google Drive Auth] ', error);
        authState = {
            ...authState,
            isInitialized: false,
            error,
        };
        notifyListeners();
        throw new Error(error);
    }

    // gapiが利用可能か確認
    if (typeof gapi === 'undefined') {
        const error = 'gapi (Google API Client Library) がロードされていません。';
        console.error('[Google Drive Auth] ', error);
        authState = {
            ...authState,
            isInitialized: false,
            error,
        };
        notifyListeners();
        throw new Error(error);
    }

    try {
        console.log('[Google Drive Auth] 初期化開始...');
        console.log('[Google Drive Auth] CLIENT_ID:', CLIENT_ID ? 'あり' : 'なし');
        console.log('[Google Drive Auth] CLIENT_ID（先頭20文字）:', CLIENT_ID ? CLIENT_ID.substring(0, 20) + '...' : 'なし');
        console.log('[Google Drive Auth] API_KEY:', API_KEY ? 'あり' : 'なし');
        console.log('[Google Drive Auth] API_KEY（先頭10文字）:', API_KEY ? API_KEY.substring(0, 10) + '...' : 'なし');
        console.log('[Google Drive Auth] DISCOVERY_DOCS:', DISCOVERY_DOCS);
        console.log('[Google Drive Auth] SCOPES:', SCOPES);
        
        // gapiライブラリをロード
        console.log('[Google Drive Auth] gapiライブラリをロード中...');
        await new Promise<void>((resolve, reject) => {
            try {
                gapi.load('client:auth2', {
                    callback: () => {
                        console.log('[Google Drive Auth] gapiライブラリのロード完了');
                        resolve();
                    },
                    onerror: (error: any) => {
                        console.error('[Google Drive Auth] gapiロードエラー:', error);
                        reject(new Error(`gapi load failed: ${JSON.stringify(error)}`));
                    },
                    timeout: 10000,
                    ontimeout: () => {
                        console.error('[Google Drive Auth] gapiロードタイムアウト');
                        reject(new Error('gapi load timeout (10秒)'));
                    },
                });
            } catch (error) {
                console.error('[Google Drive Auth] gapi.load実行エラー:', error);
                reject(error);
            }
        });

        // Google APIクライアントを初期化
        console.log('[Google Drive Auth] Google APIクライアントを初期化中...');
        try {
            await gapi.client.init({
                apiKey: API_KEY,
                clientId: CLIENT_ID,
                discoveryDocs: DISCOVERY_DOCS,
                scope: SCOPES,
            });
            console.log('[Google Drive Auth] gapi.client.init 完了');
        } catch (initError: any) {
            console.error('[Google Drive Auth] gapi.client.init エラー:', initError);
            console.error('[Google Drive Auth] エラー詳細:', {
                message: initError?.message,
                error: initError?.error,
                details: initError?.details,
                result: initError?.result,
            });
            throw new Error(`gapi.client.init failed: ${initError?.error || initError?.message || 'Unknown error'}`);
        }

        console.log('[Google Drive Auth] 初期化完了');

        // 認証状態リスナーを設定
        console.log('[Google Drive Auth] 認証インスタンスを取得中...');
        const authInstance = gapi.auth2.getAuthInstance();
        console.log('[Google Drive Auth] 認証インスタンス取得完了');
        
        authInstance.isSignedIn.listen(updateAuthState);

        // 現在の認証状態を更新
        updateAuthState(authInstance.isSignedIn.get());

        authState = {
            ...authState,
            isInitialized: true,
            error: null,
        };
        notifyListeners();
        console.log('[Google Drive Auth] すべての初期化処理が完了しました');
    } catch (error: any) {
        const errorMessage = `Google Drive APIの初期化に失敗しました: ${error?.message || error?.error || JSON.stringify(error)}`;
        console.error('[Google Drive Auth] 初期化失敗:', error);
        console.error('[Google Drive Auth] エラーの型:', typeof error);
        console.error('[Google Drive Auth] エラーオブジェクト:', error);
        authState = {
            ...authState,
            isInitialized: false,
            error: errorMessage,
        };
        notifyListeners();
        throw new Error(errorMessage);
    }
}

/**
 * 認証状態を更新
 */
function updateAuthState(isSignedIn: boolean): void {
    if (isSignedIn) {
        const authInstance = gapi.auth2.getAuthInstance();
        const currentUser = authInstance.currentUser.get();
        const profile = currentUser.getBasicProfile();

        const user: GoogleDriveUser = {
            id: profile.getId(),
            email: profile.getEmail(),
            name: profile.getName(),
            picture: profile.getImageUrl(),
        };

        console.log('[Google Drive Auth] サインイン成功:', user.email);
        authState = {
            ...authState,
            isAuthenticated: true,
            user,
            error: null,
        };
    } else {
        console.log('[Google Drive Auth] サインアウト');
        authState = {
            ...authState,
            isAuthenticated: false,
            user: null,
        };
    }
    notifyListeners();
}

/**
 * サインイン
 */
export async function signIn(): Promise<void> {
    try {
        console.log('[Google Drive Auth] サインイン開始...');
        const authInstance = gapi.auth2.getAuthInstance();
        await authInstance.signIn();
        console.log('[Google Drive Auth] サインイン完了');
    } catch (error) {
        const errorMessage = `サインインに失敗しました: ${(error as Error).message}`;
        console.error('[Google Drive Auth] サインイン失敗:', error);
        authState = {
            ...authState,
            error: errorMessage,
        };
        notifyListeners();
        throw new Error(errorMessage);
    }
}

/**
 * サインアウト
 */
export async function signOut(): Promise<void> {
    try {
        console.log('[Google Drive Auth] サインアウト開始...');
        const authInstance = gapi.auth2.getAuthInstance();
        await authInstance.signOut();
        console.log('[Google Drive Auth] サインアウト完了');
    } catch (error) {
        console.error('[Google Drive Auth] サインアウト失敗:', error);
        throw new Error(`サインアウトに失敗しました: ${(error as Error).message}`);
    }
}

/**
 * 現在の認証状態を取得
 */
export function getAuthState(): GoogleDriveAuthState {
    return { ...authState };
}

/**
 * 認証済みかどうか
 */
export function isAuthenticated(): boolean {
    return authState.isAuthenticated;
}

/**
 * 初期化済みかどうか
 */
export function isInitialized(): boolean {
    return authState.isInitialized;
}

/**
 * 現在のユーザー情報を取得
 */
export function getCurrentUser(): GoogleDriveUser | null {
    return authState.user ? { ...authState.user } : null;
}

