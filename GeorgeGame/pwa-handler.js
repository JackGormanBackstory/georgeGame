// PWA Installation and Update Handler
class PWAHandler {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.serviceWorker = null;

    this.init();
  }

  init() {
    // Register service worker
    if ("serviceWorker" in navigator) {
      this.registerServiceWorker();
    }

    // Handle install prompt
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    // Check if app is already installed
    window.addEventListener("appinstalled", () => {
      this.isInstalled = true;
      this.hideInstallButton();
      console.log("PWA was installed");
    });

    // Check for updates every 30 seconds when app is active
    setInterval(() => {
      this.checkForUpdates();
    }, 30000);

    // Check for updates when app regains focus
    window.addEventListener("focus", () => {
      this.checkForUpdates();
    });
  }

  async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register("./sw.js");
      this.serviceWorker = registration;

      console.log("Service Worker registered successfully");

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "UPDATE_AVAILABLE") {
          this.showUpdateNotification(event.data.message);
        }
      });

      // Check for updates when service worker is ready
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed") {
            if (navigator.serviceWorker.controller) {
              this.showUpdateNotification("New version available!");
            }
          }
        });
      });
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  }

  showInstallButton() {
    // Create install button if it doesn't exist
    if (!document.getElementById("pwa-install-btn")) {
      const installBtn = document.createElement("button");
      installBtn.id = "pwa-install-btn";
      installBtn.className = "snes-btn";
      installBtn.textContent = "Install Game";
      installBtn.style.cssText = `
        position: fixed;
        top: 24px;
        right: 24px;
        z-index: 1000;
        font-size: 0.9em;
        padding: 12px 20px;
      `;

      installBtn.addEventListener("click", () => {
        this.installApp();
      });

      document.body.appendChild(installBtn);
    }
  }

  hideInstallButton() {
    const installBtn = document.getElementById("pwa-install-btn");
    if (installBtn) {
      installBtn.remove();
    }
  }

  async installApp() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
        this.hideInstallButton();
      } else {
        console.log("User dismissed the install prompt");
      }

      this.deferredPrompt = null;
    }
  }

  async checkForUpdates() {
    if (!this.serviceWorker) return;

    try {
      const messageChannel = new MessageChannel();

      const updatePromise = new Promise((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.hasUpdate);
        };
      });

      this.serviceWorker.active.postMessage({ type: "CHECK_FOR_UPDATES" }, [
        messageChannel.port2,
      ]);

      const hasUpdate = await updatePromise;

      if (hasUpdate) {
        this.showUpdateNotification("New version available!");
      }
    } catch (error) {
      console.error("Error checking for updates:", error);
    }
  }

  showUpdateNotification(message) {
    // Remove existing notification
    const existingNotification = document.getElementById("update-notification");
    if (existingNotification) {
      existingNotification.remove();
    }

    // Create update notification
    const notification = document.createElement("div");
    notification.id = "update-notification";
    notification.style.cssText = `
      position: fixed;
      top: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: #4caf50;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      font-family: "Press Start 2P", monospace;
      font-size: 0.8em;
      z-index: 10000;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      border: 2px solid #fff;
      text-align: center;
      max-width: 90vw;
      animation: slideDown 0.3s ease-out;
    `;

    notification.innerHTML = `
      <div style="margin-bottom: 12px;">${message}</div>
      <button id="update-btn" style="
        background: #fff;
        color: #4caf50;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        font-family: inherit;
        font-size: 0.9em;
        cursor: pointer;
        margin-right: 8px;
      ">Update Now</button>
      <button id="dismiss-btn" style="
        background: transparent;
        color: #fff;
        border: 1px solid #fff;
        padding: 8px 16px;
        border-radius: 4px;
        font-family: inherit;
        font-size: 0.9em;
        cursor: pointer;
      ">Later</button>
    `;

    // Add CSS animation
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideDown {
        from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Add event listeners
    document.getElementById("update-btn").addEventListener("click", () => {
      this.applyUpdate();
    });

    document.getElementById("dismiss-btn").addEventListener("click", () => {
      notification.remove();
    });

    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 10000);
  }

  async applyUpdate() {
    // Clear all caches
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    }

    // Reload the page to get the latest version
    window.location.reload(true);
  }

  // Method to manually check for updates (can be called from game UI)
  manualUpdateCheck() {
    this.checkForUpdates();

    // Show checking message
    const checkingMsg = document.createElement("div");
    checkingMsg.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #333;
      color: white;
      padding: 20px;
      border-radius: 8px;
      font-family: "Press Start 2P", monospace;
      font-size: 0.8em;
      z-index: 10000;
      border: 2px solid #fff;
    `;
    checkingMsg.textContent = "Checking for updates...";
    document.body.appendChild(checkingMsg);

    setTimeout(() => {
      checkingMsg.remove();
    }, 2000);
  }
}

// Initialize PWA handler when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.pwaHandler = new PWAHandler();
});

// Export for use in other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = PWAHandler;
}
