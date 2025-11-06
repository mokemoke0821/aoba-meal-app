/**
 * Google Drive Context
 * Google Drive統合のグローバル状態管理
 * 
 * ⚠️ 現在は一時的に無効化されています（v2.2.0で実装予定）
 * Google Identity Services (GIS) への移行が必要なため、一旦無効化
 */

import React, { createContext, useContext } from 'react';
import type {
    GoogleDriveAuthState,
    GoogleDriveSyncConfig,
    SyncResult,
} from '../types';

// Context の型定義
interface GoogleDriveContextType {
    authState: GoogleDriveAuthState;
    syncConfig: GoogleDriveSyncConfig;
    lastSyncResult: SyncResult | null;
    isInitializing: boolean;
    isSyncing: boolean;
    
    // 認証関連
    initialize: () => Promise<void>;
    handleSignIn: () => Promise<void>;
    handleSignOut: () => Promise<void>;
    
    // 同期関連
    handleSync: () => Promise<void>;
    updateSyncConfig: (config: GoogleDriveSyncConfig) => void;
    enableAutoSync: (enabled: boolean) => void;
}

// デフォルトの認証状態
const defaultAuthState: GoogleDriveAuthState = {
    isAuthenticated: false,
    isInitialized: false,
    user: null,
    error: null,
};

// デフォルトの同期設定
const defaultSyncConfig: GoogleDriveSyncConfig = {
    enabled: false,
    autoSync: false,
    syncInterval: 5 * 60 * 1000, // 5分
    lastSyncTime: null,
    folderId: null,
};

// ダミーのコンテキスト値
const dummyContextValue: GoogleDriveContextType = {
    authState: defaultAuthState,
    syncConfig: defaultSyncConfig,
    lastSyncResult: null,
    isInitializing: false,
    isSyncing: false,
    initialize: async () => {
        console.warn('[Google Drive Context] Google Drive統合は現在無効化されています（v2.2.0で実装予定）');
    },
    handleSignIn: async () => {
        console.warn('[Google Drive Context] Google Drive統合は現在無効化されています（v2.2.0で実装予定）');
    },
    handleSignOut: async () => {
        console.warn('[Google Drive Context] Google Drive統合は現在無効化されています（v2.2.0で実装予定）');
    },
    handleSync: async () => {
        console.warn('[Google Drive Context] Google Drive統合は現在無効化されています（v2.2.0で実装予定）');
    },
    updateSyncConfig: () => {
        console.warn('[Google Drive Context] Google Drive統合は現在無効化されています（v2.2.0で実装予定）');
    },
    enableAutoSync: () => {
        console.warn('[Google Drive Context] Google Drive統合は現在無効化されています（v2.2.0で実装予定）');
    },
};

const GoogleDriveContext = createContext<GoogleDriveContextType>(dummyContextValue);

/**
 * Google Drive Context Provider（ダミー実装）
 */
export const GoogleDriveProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    return (
        <GoogleDriveContext.Provider value={dummyContextValue}>
            {children}
        </GoogleDriveContext.Provider>
    );
};

/**
 * Google Drive Context Hook
 */
export const useGoogleDrive = (): GoogleDriveContextType => {
    const context = useContext(GoogleDriveContext);
    return context;
};

/* ==========================================
 * 以下は元の実装（v2.2.0で復活予定）
 * ==========================================

import {
    addAuthStateListener,
    getAuthState,
    initializeGoogleAuth,
    signIn,
    signOut,
} from '../services/googleDrive/auth';
import {
    loadSyncConfig,
    performSync,
    saveSyncConfig,
} from '../services/googleDrive/sync';
import { setupAutoSync } from '../utils/storageAdapter';

export const GoogleDriveProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [authState, setAuthState] = useState<GoogleDriveAuthState>(getAuthState());
    const [syncConfig, setSyncConfig] = useState<GoogleDriveSyncConfig>(loadSyncConfig());
    const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
    const [isInitializing, setIsInitializing] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const initialize = async () => {
        if (isInitializing || authState.isInitialized) return;
        setIsInitializing(true);
        try {
            await initializeGoogleAuth();
        } catch (error) {
            console.error('[Google Drive Context] 初期化に失敗:', error);
        } finally {
            setIsInitializing(false);
        }
    };

    const handleSignIn = async () => {
        try {
            await signIn();
        } catch (error) {
            console.error('[Google Drive Context] サインインに失敗:', error);
            throw error;
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('[Google Drive Context] サインアウトに失敗:', error);
            throw error;
        }
    };

    const handleSync = async () => {
        if (isSyncing) return;
        setIsSyncing(true);
        try {
            const result = await performSync();
            setLastSyncResult(result);
            const updatedConfig = loadSyncConfig();
            setSyncConfig(updatedConfig);
        } catch (error) {
            console.error('[Google Drive Context] 同期に失敗:', error);
            setLastSyncResult({
                status: 'error',
                message: `同期に失敗しました: ${(error as Error).message}`,
                timestamp: new Date().toISOString(),
            });
        } finally {
            setIsSyncing(false);
        }
    };

    const updateSyncConfig = (config: GoogleDriveSyncConfig) => {
        saveSyncConfig(config);
        setSyncConfig(config);
    };

    const enableAutoSync = (enabled: boolean) => {
        const updatedConfig = { ...syncConfig, autoSync: enabled };
        updateSyncConfig(updatedConfig);
    };

    useEffect(() => {
        const unsubscribe = addAuthStateListener((state) => {
            setAuthState(state);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (syncConfig.autoSync && syncConfig.enabled && authState.isAuthenticated) {
            const cleanup = setupAutoSync();
            return cleanup;
        }
    }, [syncConfig.autoSync, syncConfig.enabled, authState.isAuthenticated]);

    useEffect(() => {
        const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
        if (clientId && clientId !== 'your-client-id-here.apps.googleusercontent.com') {
            let checkCount = 0;
            const maxChecks = 50;
            const checkGapiLoaded = setInterval(() => {
                checkCount++;
                if (typeof window !== 'undefined' && (window as any).gapi) {
                    clearInterval(checkGapiLoaded);
                    setTimeout(() => { initialize(); }, 500);
                } else if (checkCount >= maxChecks) {
                    console.error('[Google Drive Context] gapiのロードがタイムアウトしました');
                    clearInterval(checkGapiLoaded);
                }
            }, 100);
            return () => { clearInterval(checkGapiLoaded); };
        }
    }, []);

    const contextValue: GoogleDriveContextType = {
        authState,
        syncConfig,
        lastSyncResult,
        isInitializing,
        isSyncing,
        initialize,
        handleSignIn,
        handleSignOut,
        handleSync,
        updateSyncConfig,
        enableAutoSync,
    };

    return (
        <GoogleDriveContext.Provider value={contextValue}>
            {children}
        </GoogleDriveContext.Provider>
    );
};

========================================== */
