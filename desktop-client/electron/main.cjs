// electron/main.cjs
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');

// ✅ --- ADDED: Firebase Admin Setup ---
const admin = require('firebase-admin');
//const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
 //credential: admin.credential.cert(serviceAccount)
});
// --- End of Admin Setup ---

const firebaseConfig = {
    apiKey: "AIzaSyAMqdQMw5xNo_JyVP453x13_gGcxvPZdnc",
    authDomain: "tiger-mango.firebaseapp.com",
    projectId: "tiger-mango",
    storageBucket: "tiger-mango.firebasestorage.app",
    messagingSenderId: "468721196593",
    appId: "1:468721196593:web:7fb67ce445f4fe639fbf10",
};
initializeApp(firebaseConfig);
const auth = getAuth();

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (!app.isPackaged) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Auth: Login
ipcMain.handle('auth-login', async (event, { email, password }) => {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = cred.user;
    return { success: true, user: { uid: user.uid, email: user.email, displayName: user.displayName } };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Auth: Signup
ipcMain.handle('auth-signup', async (event, { email, password }) => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;
    return { success: true, user: { uid: user.uid, email: user.email, displayName: user.displayName } };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ✅ --- ADDED: Handle User Deletion from Authentication ---
ipcMain.handle('delete-firebase-user', async (event, uid) => {
  try {
    await admin.auth().deleteUser(uid);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete user from Firebase Auth:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-app-version', () => app.getVersion());