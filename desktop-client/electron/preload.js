// electron/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // --- Auth Handlers ---
  login: (credentials) => ipcRenderer.invoke('auth-login', credentials),
  signup: (credentials) => ipcRenderer.invoke('auth-signup', credentials),
  deleteFirebaseUser: (uid) => ipcRenderer.invoke('delete-firebase-user', uid),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // --- Order Handler ---
  // This one creates the PENDING order
  placeOrder: (orderData) => ipcRenderer.invoke('place-order', orderData),

  // We have removed completeOrder to start fresh
});
