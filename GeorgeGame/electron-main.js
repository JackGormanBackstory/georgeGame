const {
  app,
  BrowserWindow,
  Menu,
  dialog,
  shell,
  ipcMain,
} = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");
const isDev = require("electron-is-dev");

let mainWindow;
let updateAvailable = false;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "electron-preload.js"),
    },
    icon: path.join(__dirname, "favicon.svg"),
    title: "George Game",
    show: false,
  });

  // Load the app
  mainWindow.loadFile("index.html");

  // Show window when ready
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Create menu
  createMenu();

  // Set up auto-updater (only in production)
  if (!isDev) {
    setupAutoUpdater();
  }
}

function createMenu() {
  const template = [
    {
      label: "Game",
      submenu: [
        {
          label: "New Game",
          accelerator: "CmdOrCtrl+N",
          click: () => {
            mainWindow.webContents.send("menu-action", "new-game");
          },
        },
        {
          label: "Save Game",
          accelerator: "CmdOrCtrl+S",
          click: () => {
            mainWindow.webContents.send("menu-action", "save-game");
          },
        },
        {
          label: "Load Game",
          accelerator: "CmdOrCtrl+O",
          click: () => {
            mainWindow.webContents.send("menu-action", "load-game");
          },
        },
        { type: "separator" },
        {
          label: "Quit",
          accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: "View",
      submenu: [
        {
          label: "Reload",
          accelerator: "CmdOrCtrl+R",
          click: () => {
            mainWindow.webContents.reload();
          },
        },
        {
          label: "Force Reload",
          accelerator: "CmdOrCtrl+Shift+R",
          click: () => {
            mainWindow.webContents.reloadIgnoringCache();
          },
        },
        {
          label: "Toggle Developer Tools",
          accelerator:
            process.platform === "darwin" ? "Alt+Cmd+I" : "Ctrl+Shift+I",
          click: () => {
            mainWindow.webContents.toggleDevTools();
          },
        },
        { type: "separator" },
        {
          label: "Toggle Fullscreen",
          accelerator: process.platform === "darwin" ? "Ctrl+Cmd+F" : "F11",
          click: () => {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
          },
        },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "Check for Updates",
          click: () => {
            if (isDev) {
              dialog.showMessageBox(mainWindow, {
                type: "info",
                title: "Development Mode",
                message: "Auto-updater is disabled in development mode.",
              });
            } else {
              autoUpdater.checkForUpdatesAndNotify();
            }
          },
        },
        {
          label: "About",
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "About George Game",
              message:
                "George Game v1.0.0\nSuper Smash Showdown\n\nA multiplayer fighting game.",
              buttons: ["OK"],
            });
          },
        },
      ],
    },
  ];

  // macOS menu adjustments
  if (process.platform === "darwin") {
    template.unshift({
      label: app.getName(),
      submenu: [
        {
          label: "About " + app.getName(),
          role: "about",
        },
        { type: "separator" },
        {
          label: "Services",
          role: "services",
          submenu: [],
        },
        { type: "separator" },
        {
          label: "Hide " + app.getName(),
          accelerator: "Command+H",
          role: "hide",
        },
        {
          label: "Hide Others",
          accelerator: "Command+Shift+H",
          role: "hideothers",
        },
        {
          label: "Show All",
          role: "unhide",
        },
        { type: "separator" },
        {
          label: "Quit",
          accelerator: "Command+Q",
          click: () => {
            app.quit();
          },
        },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function setupAutoUpdater() {
  // Configure auto-updater
  autoUpdater.checkForUpdatesAndNotify();

  // Check for updates every hour
  setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify();
  }, 60 * 60 * 1000);

  // Auto-updater events
  autoUpdater.on("checking-for-update", () => {
    console.log("Checking for update...");
  });

  autoUpdater.on("update-available", (info) => {
    console.log("Update available.");
    updateAvailable = true;

    dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "Update Available",
      message:
        "A new version is available. It will be downloaded in the background.",
      buttons: ["OK"],
    });
  });

  autoUpdater.on("update-not-available", (info) => {
    console.log("Update not available.");
  });

  autoUpdater.on("error", (err) => {
    console.log("Error in auto-updater. " + err);
  });

  autoUpdater.on("download-progress", (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + " - Downloaded " + progressObj.percent + "%";
    log_message =
      log_message +
      " (" +
      progressObj.transferred +
      "/" +
      progressObj.total +
      ")";
    console.log(log_message);
  });

  autoUpdater.on("update-downloaded", (info) => {
    console.log("Update downloaded");

    const response = dialog.showMessageBoxSync(mainWindow, {
      type: "info",
      title: "Update Ready",
      message:
        "Update downloaded. The application will restart to apply the update.",
      buttons: ["Restart Now", "Later"],
    });

    if (response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
}

// IPC handlers
ipcMain.handle("check-for-updates", async () => {
  if (isDev) {
    return { available: false, message: "Updates disabled in development" };
  }

  try {
    const result = await autoUpdater.checkForUpdates();
    return { available: updateAvailable, message: "Update check completed" };
  } catch (error) {
    return {
      available: false,
      message: "Update check failed: " + error.message,
    };
  }
});

// App event handlers
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Security: prevent new window creation
app.on("web-contents-created", (event, contents) => {
  contents.on("new-window", (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// Handle certificate errors
app.on(
  "certificate-error",
  (event, webContents, url, error, certificate, callback) => {
    if (isDev) {
      // In development, ignore certificate errors
      event.preventDefault();
      callback(true);
    } else {
      // In production, use default behavior
      callback(false);
    }
  }
);
