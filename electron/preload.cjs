const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// functionality from the main process
contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  isElectron: true,
  
  // Add any Electron-specific APIs you need
  // Example: Save file dialog, notifications, etc.
  
  // Example: Get app version
  getVersion: () => require('electron').app.getVersion(),
  
  // Example: Minimize/maximize/close window controls
  // (if you want custom title bar)
  // minimize: () => ipcRenderer.send('window-minimize'),
  // maximize: () => ipcRenderer.send('window-maximize'),
  // close: () => ipcRenderer.send('window-close'),
});

// Prevent any unwanted behavior
window.addEventListener('DOMContentLoaded', () => {
  // Disable right-click context menu in production
  if (!process.env.ELECTRON_START_URL) {
    document.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  
  // Disable F5 refresh in production
  if (!process.env.ELECTRON_START_URL) {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
      }
    });
  }
});