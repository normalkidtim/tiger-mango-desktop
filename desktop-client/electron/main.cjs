// electron/main.cjs
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');

// --- FIREBASE ADMIN SETUP ---
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
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
const db = admin.firestore(); // Use admin Firestore for backend operations

// --- ✅ (MODIFIED) ---
// This is now set to your new collection name
const INVENTORY_COLLECTION_NAME = 'inventory-v3';
// ---

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

// --- AUTH HANDLERS ---
ipcMain.handle('auth-login', async (event, { email, password }) => {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = cred.user;
    return { success: true, user: { uid: user.uid, email: user.email, displayName: user.displayName } };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('auth-signup', async (event, { email, password }) => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;
    return { success: true, user: { uid: user.uid, email: user.email, displayName: user.displayName } };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('delete-firebase-user', async (event, uid) => {
  try {
    await admin.auth().deleteUser(uid);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-app-version', () => app.getVersion());

// --- ORDER HANDLERS ---

// ✅ HANDLER 1: Creates the PENDING order (no stock deduction)
ipcMain.handle('place-order', async (event, { cart, cartTotal }) => {
  if (!cart || cart.length === 0) {
    return { success: false, error: "Cart is empty." };
  }
  try {
    await db.collection('orders').add({
      items: cart,
      totalPrice: cartTotal,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'Pending',
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to create pending order: ", error);
    return { success: false, error: error.message };
  }
});

// ✅ HANDLER 2: COMPLETES the order and DEDUCTS stock
ipcMain.handle('order-complete', async (event, orderId) => {
  if (!orderId) {
    return { success: false, error: "No Order ID provided." };
  }

  const orderRef = db.collection('orders').doc(orderId);
  
  // --- ✅ (MODIFIED) ---
  // Now using your new collection name
  const inventoryRef = db.collection(INVENTORY_COLLECTION_NAME);
  // ---

  try {
    const transactionError = await db.runTransaction(async (transaction) => {
      const orderDoc = await transaction.get(orderRef);
      if (!orderDoc.exists) {
        throw new Error("Order document not found.");
      }

      const orderData = orderDoc.data();
      if (orderData.status !== 'Pending') {
        throw new Error("This order is already completed or cancelled.");
      }

      if (!orderData || !Array.isArray(orderData.items)) {
        throw new Error("Order data or items list is invalid.");
      }

      const inventoryUpdates = new Map();
      const inventoryRefsToGet = new Set();

      for (const item of orderData.items) {
        const quantity = item.quantity || 1;
        if (!item.size) throw new Error(`Item "${item.name}" is missing a size.`);
        
        const cupId = `cup-${item.size.toLowerCase()}`;
        inventoryRefsToGet.add(cupId);
        inventoryUpdates.set(cupId, (inventoryUpdates.get(cupId) || 0) + quantity);

        const strawId = 'straw-boba';
        inventoryRefsToGet.add(strawId);
        inventoryUpdates.set(strawId, (inventoryUpdates.get(strawId) || 0) + quantity);

        if (item.addons && Array.isArray(item.addons)) {
          for (const addon of item.addons) {
            const addonId = `addon-${addon.id}`;
            inventoryRefsToGet.add(addonId);
            inventoryUpdates.set(addonId, (inventoryUpdates.get(addonId) || 0) + quantity);
          }
        }
      }

      // --- ✅ (MODIFIED) ---
      // Now using your new collection name
      const inventoryGetPromises = Array.from(inventoryRefsToGet).map(docId =>
        transaction.get(inventoryRef.doc(docId))
      );
      // ---
      
      const inventorySnaps = await Promise.all(inventoryGetPromises);
      const inventoryDocs = new Map();

      for (const snap of inventorySnaps) {
        if (!snap.exists) {
          throw new Error(`Inventory item not found in database: ${snap.id} (in collection ${INVENTORY_COLLECTION_NAME})`);
        }
        inventoryDocs.set(snap.id, snap.data());
      }

      for (const [docId, amountNeeded] of inventoryUpdates.entries()) {
        const itemDoc = inventoryDocs.get(docId);
        const itemName = (itemDoc && itemDoc.name) ? itemDoc.name : docId;

        if (!itemDoc || itemDoc.stock === undefined) {
          throw new Error(`Inventory item "${itemName}" has no 'stock' field.`);
        }
        if (itemDoc.stock < amountNeeded) {
          throw new Error(`Not enough stock for: ${itemName}. Need ${amountNeeded}, have ${itemDoc.stock}.`);
        }
        
        // --- ✅ (MODIFIED) ---
        // Now using your new collection name
        transaction.update(inventoryRef.doc(docId), { 
          stock: admin.firestore.FieldValue.increment(-amountNeeded) 
        });
        // ---
      }

      transaction.update(orderRef, { status: 'Completed' });
    });

    if (transactionError) {
      return { success: false, error: transactionError.message };
    }

    return { success: true };

  } catch (error) {
    console.error("Stock Deduction Transaction FAILED: ", error);
    return { success: false, error: error.message };
  }
});

