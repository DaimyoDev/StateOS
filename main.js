const { app, BrowserWindow, ipcMain } = require("electron");
const isDev = require("electron-is-dev");
const fs = require("fs");
const path = require("path");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  console.log("Creating main window...");
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (isDev) {
    console.log(
      "Development mode: Loading from Vite dev server (e.g., http://localhost:5173)"
    );
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    console.log("Production mode: Loading from build files");
    mainWindow.loadFile(path.join(__dirname, "ui-src", "dist", "index.html"));
  }

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

// IPC Handlers for file system operations
const ELECTION_SETUPS_DIR = path.join(__dirname, "election-setups");

// Ensure election setups directory exists
if (!fs.existsSync(ELECTION_SETUPS_DIR)) {
  fs.mkdirSync(ELECTION_SETUPS_DIR, { recursive: true });
}

// Save election setup to file
ipcMain.handle("save-election-setup", async (event, setupData) => {
  try {
    const filename = `${setupData.id}.json`;
    const filepath = path.join(ELECTION_SETUPS_DIR, filename);
    await fs.promises.writeFile(filepath, JSON.stringify(setupData, null, 2));
    return { success: true };
  } catch (error) {
    console.error("Error saving election setup:", error);
    return { success: false, error: error.message };
  }
});

// Load all election setups
ipcMain.handle("load-election-setups", async () => {
  try {
    const files = await fs.promises.readdir(ELECTION_SETUPS_DIR);
    const setups = [];
    
    for (const file of files) {
      if (file.endsWith(".json")) {
        const filepath = path.join(ELECTION_SETUPS_DIR, file);
        const data = await fs.promises.readFile(filepath, "utf8");
        setups.push(JSON.parse(data));
      }
    }
    
    return { success: true, setups };
  } catch (error) {
    console.error("Error loading election setups:", error);
    return { success: false, error: error.message, setups: [] };
  }
});

// Delete election setup
ipcMain.handle("delete-election-setup", async (event, setupId) => {
  try {
    const filename = `${setupId}.json`;
    const filepath = path.join(ELECTION_SETUPS_DIR, filename);
    await fs.promises.unlink(filepath);
    return { success: true };
  } catch (error) {
    console.error("Error deleting election setup:", error);
    return { success: false, error: error.message };
  }
});

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
