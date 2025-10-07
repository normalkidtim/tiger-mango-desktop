// electron/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  authLogin: (email, password) => ipcRenderer.invoke('auth-login', { email, password }),
  authSignup: (email, password, firstName, lastName) =>
    ipcRenderer.invoke('auth-signup', { email, password, firstName, lastName }),
});
