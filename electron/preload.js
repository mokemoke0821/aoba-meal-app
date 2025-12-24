const { contextBridge, ipcRenderer } = require('electron');

// セキュアなAPIをウィンドウオブジェクトに公開
contextBridge.exposeInMainWorld('electronAPI', {
  // アプリケーション情報
  getAppVersion: () => {
    return '2.1.0';
  },
  getPlatform: () => {
    return process.platform;
  },
  isElectron: () => {
    return true;
  },
});

// バージョン情報をコンソールに出力
console.log('🚀 あおば給食摂食量管理アプリ v2.1.0');
console.log('📦 Electron版で実行中');
console.log('💻 Platform:', process.platform);



