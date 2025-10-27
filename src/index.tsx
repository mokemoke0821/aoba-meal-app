import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';
import * as serviceWorker from './serviceWorker';

// PWA install prompt with enhanced debugging
let deferredPrompt: any;
let installButton: HTMLButtonElement | null = null;

// Debug: Check PWA installability
console.log('🔍 PWA Debug: Checking install conditions...');
console.log('- HTTPS:', window.location.protocol === 'https:');
console.log('- Service Worker support:', 'serviceWorker' in navigator);
console.log('- Current URL:', window.location.href);

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('✅ beforeinstallprompt event fired! App is installable.');
  
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;

  // Remove existing button if any
  if (installButton && installButton.parentNode) {
    installButton.remove();
  }

  // Show custom install button
  installButton = document.createElement('button');
  installButton.innerText = '📱 アプリをインストール';
  installButton.title = 'ホーム画面に追加してネイティブアプリのように使用できます';
  installButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
    color: white;
    border: none;
    padding: 14px 28px;
    border-radius: 12px;
    cursor: pointer;
    z-index: 9999;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(25, 118, 210, 0.4);
    transition: all 0.3s ease;
    animation: slideIn 0.5s ease;
  `;

  // Add close button
  const closeButton = document.createElement('span');
  closeButton.innerText = '✕';
  closeButton.style.cssText = `
    position: absolute;
    top: -8px;
    right: -8px;
    background: #f44336;
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  `;

  closeButton.addEventListener('click', (event) => {
    event.stopPropagation();
    if (installButton && installButton.parentNode) {
      installButton.remove();
      console.log('ℹ️ Install button manually closed by user');
    }
  });

  installButton.appendChild(closeButton);

  installButton.addEventListener('click', async () => {
    console.log('👆 Install button clicked');
    if (!deferredPrompt) {
      console.error('❌ No deferred prompt available');
      return;
    }

    // Show the prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('✅ User accepted the install prompt');
      if (installButton && installButton.parentNode) {
        installButton.remove();
      }
    } else {
      console.log('❌ User dismissed the install prompt');
    }
    
    deferredPrompt = null;
  });

  // Hover effect
  installButton.addEventListener('mouseenter', () => {
    if (installButton) {
      installButton.style.transform = 'translateY(-2px)';
      installButton.style.boxShadow = '0 6px 16px rgba(25, 118, 210, 0.5)';
    }
  });

  installButton.addEventListener('mouseleave', () => {
    if (installButton) {
      installButton.style.transform = 'translateY(0)';
      installButton.style.boxShadow = '0 4px 12px rgba(25, 118, 210, 0.4)';
    }
  });

  document.body.appendChild(installButton);
  console.log('✅ Install button added to page');
});

// Handle app installed
window.addEventListener('appinstalled', () => {
  console.log('🎉 PWA was successfully installed!');
  if (installButton && installButton.parentNode) {
    installButton.remove();
  }
});

// Debug: Log if event doesn't fire after 5 seconds
setTimeout(() => {
  if (!deferredPrompt) {
    console.log('⚠️ beforeinstallprompt event did not fire.');
    console.log('Possible reasons:');
    console.log('1. App is already installed (check chrome://apps/)');
    console.log('2. Not enough user engagement (visit the site a few times)');
    console.log('3. PWA criteria not fully met');
    console.log('4. Using incognito/private browsing mode');
  }
}, 5000);

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// PWA Service Worker登録
serviceWorker.register({
  onSuccess: () => {
    console.log('PWA: アプリがオフラインで利用可能になりました');
  },
  onUpdate: (registration) => {
    const waitingServiceWorker = registration.waiting;

    if (waitingServiceWorker) {
      if (window.confirm('新しいバージョンが利用可能です。更新しますか？')) {
        waitingServiceWorker.addEventListener('statechange', event => {
          if ((event.target as any).state === 'activated') {
            window.location.reload();
          }
        });
        waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
      }
    }
  }
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
