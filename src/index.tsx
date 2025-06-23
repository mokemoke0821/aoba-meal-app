import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';
import * as serviceWorker from './serviceWorker';

// PWA install prompt
let deferredPrompt: any;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;

  // Show custom install button
  const installButton = document.createElement('button');
  installButton.innerText = 'アプリをインストール';
  installButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #1976d2;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    z-index: 9999;
    font-family: inherit;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  `;

  installButton.addEventListener('click', () => {
    // Hide the custom button
    installButton.style.display = 'none';
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      deferredPrompt = null;
    });
  });

  document.body.appendChild(installButton);

  // Hide after 10 seconds
  setTimeout(() => {
    if (installButton.parentNode) {
      installButton.remove();
    }
  }, 10000);
});

// Handle app installed
window.addEventListener('appinstalled', () => {
  console.log('PWA was installed');
});

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
