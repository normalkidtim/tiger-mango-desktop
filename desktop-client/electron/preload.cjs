// This file is a secure bridge between your React app and the Electron app.
// You can use it to expose Node.js features to your React code safely.
const { contextBridge } = require('electron');

// Expose a simple API to your React app (renderer process)
contextBridge.exposeInMainWorld('electronAPI', {
  // You can add functions here later, for example:
  // getAppName: () => 'Tealicieux Desktop'
});

console.log('Preload script loaded.');