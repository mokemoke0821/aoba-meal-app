/**
 * Google Drive 同期モジュール
 * LocalStorageとGoogle Drive間のデータ同期機能を提供
 */

import type { GoogleDriveFile, GoogleDriveSyncConfig, SyncResult } from '../../types';
import { isAuthenticated } from './auth';

// gapiはブラウザでのみ利用可能
declare const gapi: any;

// 同期設定キー
const SYNC_CONFIG_KEY = 'aoba-meal-google-drive-sync-config';

// デフォルト同期設定
const DEFAULT_SYNC_CONFIG: GoogleDriveSyncConfig = {
    enabled: false,
    autoSync: false,
    syncInterval: 10 * 60 * 1000, // 10分
    lastSyncTime: null,
    folderId: null,
};

// Google Driveフォルダ名
const FOLDER_NAME = process.env.REACT_APP_GOOGLE_DRIVE_FOLDER_NAME || 'あおば給食データ';

/**
 * 同期設定を保存
 */
export function saveSyncConfig(config: GoogleDriveSyncConfig): void {
    try {
        localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(config));
        console.log('[Google Drive Sync] 同期設定を保存しました');
    } catch (error) {
        console.error('[Google Drive Sync] 同期設定の保存に失敗:', error);
        throw new Error('同期設定の保存に失敗しました');
    }
}

/**
 * 同期設定を読み込み
 */
export function loadSyncConfig(): GoogleDriveSyncConfig {
    try {
        const stored = localStorage.getItem(SYNC_CONFIG_KEY);
        if (stored) {
            const config = JSON.parse(stored);
            console.log('[Google Drive Sync] 同期設定を読み込みました');
            return config;
        }
    } catch (error) {
        console.error('[Google Drive Sync] 同期設定の読み込みに失敗:', error);
    }
    console.log('[Google Drive Sync] デフォルト同期設定を使用');
    return DEFAULT_SYNC_CONFIG;
}

/**
 * Google Driveフォルダを検索または作成
 */
export async function findOrCreateFolder(): Promise<string> {
    if (!isAuthenticated()) {
        throw new Error('Google Driveにサインインしてください');
    }

    try {
        console.log('[Google Drive Sync] フォルダを検索中:', FOLDER_NAME);

        // フォルダを検索
        const response = await gapi.client.drive.files.list({
            q: `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
            fields: 'files(id, name)',
            spaces: 'drive',
        });

        const files = response.result.files || [];

        if (files.length > 0) {
            const folderId = files[0].id || '';
            console.log('[Google Drive Sync] フォルダが見つかりました:', folderId);
            return folderId;
        }

        // フォルダが見つからない場合は作成
        console.log('[Google Drive Sync] フォルダを作成中:', FOLDER_NAME);
        const createResponse = await gapi.client.drive.files.create({
            resource: {
                name: FOLDER_NAME,
                mimeType: 'application/vnd.google-apps.folder',
            },
            fields: 'id',
        });

        const folderId = createResponse.result.id || '';
        console.log('[Google Drive Sync] フォルダを作成しました:', folderId);
        return folderId;
    } catch (error) {
        console.error('[Google Drive Sync] フォルダの検索/作成に失敗:', error);
        throw new Error(`フォルダの検索/作成に失敗しました: ${(error as Error).message}`);
    }
}

/**
 * ファイルをGoogle Driveにアップロード
 */
export async function uploadFile(
    folderId: string,
    fileName: string,
    content: string
): Promise<string> {
    if (!isAuthenticated()) {
        throw new Error('Google Driveにサインインしてください');
    }

    try {
        console.log('[Google Drive Sync] ファイルをアップロード中:', fileName);

        // 既存のファイルを検索
        const searchResponse = await gapi.client.drive.files.list({
            q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
            fields: 'files(id, name)',
            spaces: 'drive',
        });

        const existingFiles = searchResponse.result.files || [];
        const boundary = '-------314159265358979323846';
        const delimiter = `\r\n--${boundary}\r\n`;
        const closeDelim = `\r\n--${boundary}--`;

        const metadata = {
            name: fileName,
            mimeType: 'application/json',
            parents: [folderId],
        };

        const multipartRequestBody =
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            content +
            closeDelim;

        if (existingFiles.length > 0) {
            // 既存のファイルを更新
            const fileId = existingFiles[0].id || '';
            console.log('[Google Drive Sync] 既存のファイルを更新:', fileId);

            const response = await gapi.client.request({
                path: `/upload/drive/v3/files/${fileId}`,
                method: 'PATCH',
                params: { uploadType: 'multipart', fields: 'id' },
                headers: {
                    'Content-Type': `multipart/related; boundary="${boundary}"`,
                },
                body: multipartRequestBody,
            });

            console.log('[Google Drive Sync] ファイルを更新しました:', fileId);
            return fileId;
        } else {
            // 新規ファイルを作成
            const response = await gapi.client.request({
                path: '/upload/drive/v3/files',
                method: 'POST',
                params: { uploadType: 'multipart', fields: 'id' },
                headers: {
                    'Content-Type': `multipart/related; boundary="${boundary}"`,
                },
                body: multipartRequestBody,
            });

            const fileId = response.result.id;
            console.log('[Google Drive Sync] ファイルを作成しました:', fileId);
            return fileId;
        }
    } catch (error) {
        console.error('[Google Drive Sync] ファイルのアップロードに失敗:', error);
        throw new Error(`ファイルのアップロードに失敗しました: ${(error as Error).message}`);
    }
}

/**
 * ファイルをGoogle Driveからダウンロード
 */
export async function downloadFile(fileId: string): Promise<string> {
    if (!isAuthenticated()) {
        throw new Error('Google Driveにサインインしてください');
    }

    try {
        console.log('[Google Drive Sync] ファイルをダウンロード中:', fileId);

        const response = await gapi.client.drive.files.get({
            fileId,
            alt: 'media',
        });

        console.log('[Google Drive Sync] ファイルをダウンロードしました:', fileId);
        return JSON.stringify(response.result);
    } catch (error) {
        console.error('[Google Drive Sync] ファイルのダウンロードに失敗:', error);
        throw new Error(`ファイルのダウンロードに失敗しました: ${(error as Error).message}`);
    }
}

/**
 * フォルダ内のファイル一覧を取得
 */
export async function listFiles(folderId: string): Promise<GoogleDriveFile[]> {
    if (!isAuthenticated()) {
        throw new Error('Google Driveにサインインしてください');
    }

    try {
        console.log('[Google Drive Sync] ファイル一覧を取得中:', folderId);

        const response = await gapi.client.drive.files.list({
            q: `'${folderId}' in parents and trashed=false`,
            fields: 'files(id, name, mimeType, createdTime, modifiedTime, size)',
            spaces: 'drive',
            orderBy: 'modifiedTime desc',
        });

        const files: GoogleDriveFile[] = (response.result.files || []).map((file: any) => ({
            id: file.id || '',
            name: file.name || '',
            mimeType: file.mimeType || '',
            createdTime: file.createdTime || '',
            modifiedTime: file.modifiedTime || '',
            size: file.size,
        }));

        console.log('[Google Drive Sync] ファイル一覧を取得しました:', files.length);
        return files;
    } catch (error) {
        console.error('[Google Drive Sync] ファイル一覧の取得に失敗:', error);
        throw new Error(`ファイル一覧の取得に失敗しました: ${(error as Error).message}`);
    }
}

/**
 * ファイルを削除
 */
export async function deleteFile(fileId: string): Promise<void> {
    if (!isAuthenticated()) {
        throw new Error('Google Driveにサインインしてください');
    }

    try {
        console.log('[Google Drive Sync] ファイルを削除中:', fileId);

        await gapi.client.drive.files.delete({
            fileId,
        });

        console.log('[Google Drive Sync] ファイルを削除しました:', fileId);
    } catch (error) {
        console.error('[Google Drive Sync] ファイルの削除に失敗:', error);
        throw new Error(`ファイルの削除に失敗しました: ${(error as Error).message}`);
    }
}

/**
 * 完全な同期処理
 */
export async function performSync(): Promise<SyncResult> {
    const startTime = new Date().toISOString();

    try {
        console.log('[Google Drive Sync] 同期を開始します...');

        if (!isAuthenticated()) {
            throw new Error('Google Driveにサインインしてください');
        }

        // フォルダIDを取得または作成
        const config = loadSyncConfig();
        let folderId = config.folderId;

        if (!folderId) {
            folderId = await findOrCreateFolder();
            config.folderId = folderId;
            saveSyncConfig(config);
        }

        // LocalStorageからデータを取得
        const usersData = localStorage.getItem('aoba-meal-users') || '[]';
        const recordsData = localStorage.getItem('aoba-meal-records') || '[]';
        const menuData = localStorage.getItem('aoba-current-menu') || 'null';

        // バックアップデータを作成
        const backupData = {
            users: JSON.parse(usersData),
            mealRecords: JSON.parse(recordsData),
            currentMenu: JSON.parse(menuData),
            timestamp: startTime,
        };

        // Google Driveにアップロード
        const fileName = `backup_${new Date().toISOString().split('T')[0]}.json`;
        await uploadFile(folderId, fileName, JSON.stringify(backupData, null, 2));

        // 同期設定を更新
        config.lastSyncTime = startTime;
        saveSyncConfig(config);

        console.log('[Google Drive Sync] 同期が完了しました');

        return {
            status: 'success',
            message: '同期が完了しました',
            timestamp: startTime,
            filesUploaded: 1,
        };
    } catch (error) {
        console.error('[Google Drive Sync] 同期に失敗:', error);
        return {
            status: 'error',
            message: `同期に失敗しました: ${(error as Error).message}`,
            timestamp: startTime,
        };
    }
}

