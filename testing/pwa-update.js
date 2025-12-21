// PWA Update Manager
class PWAUpdateManager {
  constructor() {
    this.registration = null;
    this.updateAvailable = false;
  }

  async register() {
    if (!('serviceWorker' in navigator)) {
      console.log('[PWA] Service Worker nicht unterstützt');
      return;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
      });
      console.log('[PWA] Service Worker registriert:', this.registration);

      // Prüfe auf Updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Update verfügbar
            this.updateAvailable = true;
            this.notifyUpdateAvailable();
          }
        });
      });

      // Prüfe regelmäßig auf Updates (alle 24h)
      setInterval(() => {
        this.registration.update();
      }, 24 * 60 * 60 * 1000);
    } catch (error) {
      console.error('[PWA] Service Worker Registration fehlgeschlagen:', error);
    }
  }

  notifyUpdateAvailable() {
    // Benachrichtige User über verfügbares Update
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.showUpdatePrompt();
      });
    } else {
      this.showUpdatePrompt();
    }
  }

  showUpdatePrompt() {
    const banner = document.createElement('div');
    banner.id = 'pwa-update-banner';
    banner.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      background: #333;
      color: white;
      padding: 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-family: system-ui, -apple-system, sans-serif;
    `;

    const message = document.createElement('span');
    message.textContent = 'Neue Version verfügbar. Die App wird neu geladen...';
    message.style.flex = '1';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      padding: 0 8px;
    `;
    closeBtn.onclick = () => banner.remove();

    banner.appendChild(message);
    banner.appendChild(closeBtn);
    document.body.appendChild(banner);

    // Auto-reload nach 5s
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  }

  async skipWaiting() {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }
}

// Initialisiere PWA Update Manager
if (window.location.protocol === 'https:' || window.location.hostname === 'localhost') {
  const pwaManager = new PWAUpdateManager();
  pwaManager.register();
}
