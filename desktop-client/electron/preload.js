// electron/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Existing functions...
  authLogin: (email, password) => ipcRenderer.invoke('auth-login', { email, password }),
  authSignup: (email, password) => ipcRenderer.invoke('auth-signup', { email, password }),
  deleteFirebaseUser: (uid) => ipcRenderer.invoke('delete-firebase-user', uid),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  placeOrder: (cartData) => ipcRenderer.invoke('place-order', cartData),
  
  // ✅ NEW: Channel for Inventory Update
  updateInventoryStock: (docId, fieldId, newStock) => ipcRenderer.invoke('update-inventory-stock', docId, fieldId, newStock), 

  // Add more channels here...
});