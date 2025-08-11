const { app, BrowserWindow, ipcMain } = require("electron");
const isDev = require("electron-is-dev");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  console.log("Creating main window...");
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: false, // Keep false for security
      contextIsolation: true, // Keep true
      // preload: path.join(__dirname, 'preload.js') // We'll add this later for IPC
    },
  });

  if (isDev) {
    console.log(
      "Development mode: Loading from Vite dev server (e.g., http://localhost:5173)"
    );
    mainWindow.loadURL("http://localhost:5173"); // Adjust port if Vite uses a different one
    mainWindow.webContents.openDevTools();
  } else {
    console.log("Production mode: Loading from build files");
    mainWindow.loadFile(path.join(__dirname, "ui-src", "dist", "index.html"));
  }

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

const { ipcMain } = require("electron");
// ...
ipcMain.on("quit-app", () => {
  app.quit();
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
