// This file is the "main" process for Electron.
// It creates the window and loads your React app.
const { app, BrowserWindow, screen } = require('electron');
const path = require('path');

// This environment variable is set by our "dev:electron" script
const isDev = process.env.VITE_DEV_SERVER_URL;

function createWindow() {
  // Get the primary display's dimensions
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  const win = new BrowserWindow({
    width: Math.floor(width * 0.75),  // 75% of screen width
    height: Math.floor(height * 0.8), // 80% of screen height
    minWidth: 1024,
    minHeight: 768,
    title: 'Tealicieux',
    autoHideMenuBar: true, // Hides the (File, Edit, etc.) menu bar
    webPreferences: {
      // Attach the preload script
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    // In development, load from the Vite dev server (http://localhost:5173)
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    // Open the DevTools automatically for debugging
    win.webContents.openDevTools();
  } else {
    // In production, load the built 'dist/index.html' file from the local filesystem
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});