// electron/main.cjs
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');

// ✅ --- ADDED: Firebase Admin Setup ---
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
 credential: admin.credential.cert(serviceAccount)
});
// --- End of Admin Setup ---

// --- NEW IMPORTS FOR INVENTORY/ORDER LOGIC ---
// 1. Initialize Firestore Database for Admin operations
const db = admin.firestore();
// --- END NEW IMPORTS ---

// ❌ FIX: The menuData.js is an ES Module, so we need to use dynamic import.
// We declare a mutable variable to hold the menu data once imported.
let menuData = null;

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

// ✅ NEW FUNCTION: Load menuData using dynamic import
async function loadMenuData() {
    try {
        const module = await import('../src/menuData.js');
        menuData = module.menuData;
        console.log("menuData loaded successfully.");
    } catch (error) {
        console.error("Failed to load menuData:", error);
    }
}


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

// ✅ FIX: Load menuData before creating the window and setting up IPC handles
app.whenReady().then(async () => {
    await loadMenuData(); // Wait for menuData to load
    createWindow();
});

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


// --- RECIPE HELPER FUNCTIONS (Uses the new menuData.js structure) ---
// These functions now check if menuData is loaded and access it from the global variable
function getProductRecipe(productId, size) {
  if (!menuData) return null;
  for (const category of menuData.categories) {
    const product = category.products.find(p => p.id === productId);
    if (product && product.recipe && product.recipe[size]) {
      return product.recipe[size];
    }
  }
  return null;
}

function getAddonRecipe(addonId) {
  if (!menuData) return null;
  const addon = menuData.addons.find(a => a.id === addonId);
  if (addon && addon.recipe) {
    return addon.recipe;
  }
  return null;
}
// --- END RECIPE HELPER FUNCTIONS ---


// ✅ --- ADDED: Handle Order and Deduct Stock (Inventory) ---
ipcMain.handle('place-order', async (event, { cart, cartTotal }) => {
  if (!menuData) {
     return { success: false, error: "System startup incomplete. menuData is not loaded." };
  }
  if (cart.length === 0) {
    return { success: false, error: "Cart is empty." };
  }

  // 1. Build a map of all inventory items needed: { "collection/field": quantity_needed }
  const itemsToDeduct = {};
  for (const item of cart) {
    // a. Get the recipe for the main drink (e.g., "consumables/medium-cup": 1)
    const productRecipe = getProductRecipe(item.id, item.size);
    if (productRecipe) {
      for (const [ingredient, quantity] of Object.entries(productRecipe)) {
        const key = ingredient; // e.g., "consumables/medium-cup"
        const amount = quantity * item.quantity;
        itemsToDeduct[key] = (itemsToDeduct[key] || 0) + amount;
      }
    }

    // b. Get the recipe for each addon (e.g., "toppings/pearl": 1)
    for (const addon of item.addons) {
      const addonRecipe = getAddonRecipe(addon.id);
      if (addonRecipe) {
        for (const [ingredient, quantity] of Object.entries(addonRecipe)) {
          const key = ingredient; // e.g., "toppings/pearl"
          const amount = quantity * item.quantity;
          itemsToDeduct[key] = (itemsToDeduct[key] || 0) + amount;
        }
      }
    }
  }
  
  // 2. Process the transaction (ensures atomic stock deduction)
  try {
    await db.runTransaction(async (t) => {
      const inventoryRef = db.collection('inventory');
      const stockLogsRef = db.collection('stockLogs');

      // Get list of unique top-level collection documents we need to fetch (e.g., 'consumables', 'toppings')
      const uniqueCollections = [...new Set(Object.keys(itemsToDeduct).map(key => key.split('/')[0]))];
      
      // Fetch all required inventory documents
      const docs = await Promise.all(
        uniqueCollections.map(docId => t.get(inventoryRef.doc(docId)))
      );
      
      const newStockUpdates = {}; // Prepare the updates { 'collectionId': { 'fieldId': new_value } }
      
      // 3. Check stock levels for ALL required items
      for (const [key, quantityNeeded] of Object.entries(itemsToDeduct)) {
        const [collectionId, fieldId] = key.split('/');
        const docSnapshot = docs.find(doc => doc.id === collectionId);

        if (!docSnapshot || !docSnapshot.exists) {
            throw new Error(`Inventory category '${collectionId}' not found in database.`);
        }
        
        const currentStock = docSnapshot.data()[fieldId];

        if (currentStock === undefined) {
             throw new Error(`Inventory item '${fieldId}' not tracked in category '${collectionId}'.`);
        }
        
        if (currentStock < quantityNeeded) {
          // Log a failed order attempt
          t.set(stockLogsRef.doc(), {
              timestamp: admin.firestore.FieldValue.serverTimestamp(),
              type: 'ORDER_FAILED',
              category: collectionId,
              item: fieldId,
              quantity: currentStock,
              needed: quantityNeeded,
              reason: 'INSUFFICIENT_STOCK_FOR_ORDER',
          });
          // Stop the transaction and report error to user
          throw new Error(`Insufficient stock for ${fieldId}. Current: ${currentStock}, Needed: ${quantityNeeded}`);
        }
        
        const newStock = currentStock - quantityNeeded;
        
        // Prepare the update for later
        if (!newStockUpdates[collectionId]) {
          newStockUpdates[collectionId] = {};
        }
        newStockUpdates[collectionId][fieldId] = newStock;
      }

      // 4. Perform the updates (deductions) inside the transaction
      for (const collectionId of Object.keys(newStockUpdates)) {
        t.update(inventoryRef.doc(collectionId), newStockUpdates[collectionId]);
      }
      
      // 5. Save the successful order record
      const ordersRef = db.collection('orders');
      t.set(ordersRef.doc(), {
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        cart: cart, 
        total: cartTotal,
        itemsDeducted: itemsToDeduct,
        status: 'Pending', // New orders start as Pending
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
    }); // End of db.runTransaction

    return { success: true };

  } catch (error) {
    console.error("Transaction failed:", error);
    // Return a user-friendly error message
    if (error.message.includes("Insufficient stock")) {
       return { success: false, error: error.message };
    }
    return { success: false, error: "Database error: Could not complete order. Check console for details." };
  }
});
// --- END ADDED ORDER LOGIC ---
// electron/main.cjs (New snippet to be added at the END of the file)
// Note: This assumes 'db' (admin.firestore()) and 'admin' are already defined at the top of main.cjs

// Handler to update specific stock fields securely
ipcMain.handle('update-inventory-stock', async (event, docId, fieldId, newStock) => {
    // 1. Basic validation
    if (!docId || !fieldId || newStock === undefined || isNaN(newStock)) {
        return { success: false, error: "Invalid input provided." };
    }
    
    // Ensure stock is an integer and non-negative
    const stockValue = parseInt(newStock);
    if (stockValue < 0 || stockValue === null) {
        return { success: false, error: "Stock must be a non-negative integer." };
    }
    
    const db = admin.firestore(); 

    try {
        const inventoryRef = db.collection('inventory').doc(docId);
        
        // Use a dynamic object key for the field to update (e.g., { 'medium-cup': 150 })
        const updateObject = {
            [fieldId]: stockValue
        };

        await inventoryRef.update(updateObject);
        
        // Log the stock change for history/auditing (Recommended)
        await db.collection('stockLogs').add({
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            type: 'MANUAL_ADJUSTMENT',
            document: docId,
            field: fieldId,
            newQuantity: stockValue,
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to update inventory stock:", error.details || error.message);
        // Specifically check for 'No document to update' errors
        if (error.message.includes('NOT_FOUND')) {
             return { success: false, error: `Error: Inventory item not found. Check if '${docId}' exists.` };
        }
        return { success: false, error: `Database update failed. Check console for details.` };
    }
});