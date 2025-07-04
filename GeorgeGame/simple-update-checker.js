// Simple Update Checker for Beginners
// This is a basic version that's easy to understand and modify

class SimpleUpdateChecker {
  constructor() {
    this.currentVersion = "1.0.0"; // Update this when you release new versions
    this.checkInterval = 5 * 60 * 1000; // Check every 5 minutes
    this.init();
  }

  init() {
    // Check for updates when page loads
    this.checkForUpdates();

    // Check periodically
    setInterval(() => {
      this.checkForUpdates();
    }, this.checkInterval);
  }

  async checkForUpdates() {
    try {
      // Simple method: Check if a special "version.txt" file exists on your server
      const response = await fetch("./version.txt?" + Date.now());

      if (response.ok) {
        const serverVersion = await response.text();
        const cleanServerVersion = serverVersion.trim();

        if (cleanServerVersion !== this.currentVersion) {
          this.showUpdateNotification(cleanServerVersion);
        }
      }
    } catch (error) {
      console.log("Could not check for updates:", error);
      // Don't show error to user - just log it
    }
  }

  showUpdateNotification(newVersion) {
    // Remove any existing notification
    const existing = document.getElementById("simple-update-notification");
    if (existing) {
      existing.remove();
    }

    // Create a simple notification
    const notification = document.createElement("div");
    notification.id = "simple-update-notification";
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        font-family: Arial, sans-serif;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 300px;
      ">
        <strong>Update Available!</strong><br>
        New version ${newVersion} is ready.<br>
        <button onclick="location.reload()" style="
          background: white;
          color: #4CAF50;
          border: none;
          padding: 8px 15px;
          border-radius: 3px;
          cursor: pointer;
          margin-top: 10px;
          margin-right: 10px;
        ">Update Now</button>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: transparent;
          color: white;
          border: 1px solid white;
          padding: 8px 15px;
          border-radius: 3px;
          cursor: pointer;
          margin-top: 10px;
        ">Later</button>
      </div>
    `;

    document.body.appendChild(notification);
  }
}

// Start the simple update checker when page loads
document.addEventListener("DOMContentLoaded", () => {
  new SimpleUpdateChecker();
});
