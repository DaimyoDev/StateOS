const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Election setup file operations
  saveElectionSetup: (setupData) => ipcRenderer.invoke("save-election-setup", setupData),
  loadElectionSetups: () => ipcRenderer.invoke("load-election-setups"),
  deleteElectionSetup: (setupId) => ipcRenderer.invoke("delete-election-setup", setupId),
  
  // Other existing IPC methods
  quitApp: () => ipcRenderer.send("quit-app"),
});