import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
// ✅ --- (FIXED THE TYPO HERE: 'in' is now 'from') ---
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'; 
import { FiBox, FiCoffee, FiPlus } from 'react-icons/fi';
import '../assets/styles/inventory.css'; // Your existing CSS file

// Helper function to make 'crushed-oreos' look like 'Crushed Oreos'
const formatItemName = (key) => {
  if (!key) return '';
  return key.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const Inventory = () => {
  // We are now fetching 3 objects, not 3 arrays
  const [addonsData, setAddonsData] = useState(null);
  const [cupsData, setCupsData] = useState(null);
  const [strawsData, setStrawsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // This now listens to the 3 specific documents
  useEffect(() => {
    setLoading(true);
    const docPaths = {
      addons: 'inventory/add-ons',
      cups: 'inventory/cups',
      straws: 'inventory/straw',
    };

    // Set up listeners for each document
    const unsubAddons = onSnapshot(doc(db, docPaths.addons), (doc) => {
      setAddonsData(doc.exists() ? doc.data() : {});
    }, (err) => console.error("Addons listener error:", err));

    const unsubCups = onSnapshot(doc(db, docPaths.cups), (doc) => {
      setCupsData(doc.exists() ? doc.data() : {});
    }, (err) => console.error("Cups listener error:", err));

    const unsubStraws = onSnapshot(doc(db, docPaths.straws), (doc) => {
      setStrawsData(doc.exists() ? doc.data() : {});
    }, (err) => console.error("Straws listener error:", err));

    // Stop listening when the page is closed
    return () => {
      unsubAddons();
      unsubCups();
      unsubStraws();
    };
  }, []);

  // Update loading state
  useEffect(() => {
    if (addonsData !== null && cupsData !== null && strawsData !== null) {
      setLoading(false);
    }
  }, [addonsData, cupsData, strawsData]);

  // This now updates a 'field' inside a document
  const handleStockChange = async (docPath, fieldName, newStock) => {
    const stockValue = Number(newStock);
    if (isNaN(stockValue) || stockValue < 0) {
      console.error("Invalid stock value");
      // Revert UI change (or just rely on onSnapshot to do it)
      return;
    }
    
    // Temporarily update the UI for a fast feel
    if (docPath === 'inventory/add-ons') setAddonsData(prev => ({ ...prev, [fieldName]: stockValue }));
    if (docPath === 'inventory/cups') setCupsData(prev => ({ ...prev, [fieldName]: stockValue }));
    if (docPath === 'inventory/straws') setStrawsData(prev => ({ ...prev, [fieldName]: stockValue }));

    const itemRef = doc(db, docPath);
    try {
      // This uses dot notation for fields, which is safer
      await updateDoc(itemRef, {
        [fieldName]: stockValue
      });
      // The onSnapshot listener will soon get this change and confirm it
    } catch (error) {
      console.error("Error updating stock: ", error);
      // TODO: Revert the UI state if the update fails
    }
  };

  // This now takes an object (data) and loops over its keys
  const renderInventorySection = (title, data, icon, docPath) => {
    if (loading || !data) {
      return (
        <div className="inventory-card">
          <div className="inventory-card-header">{icon} {title}</div>
          <div className="inventory-item-list">
            <p className="no-items-message">Loading...</p>
          </div>
        </div>
      );
    }
    
    // Turn the object { 'cheesecake': 100 } into an array [['cheesecake', 100]]
    const items = Object.entries(data);

    return (
      <div className="inventory-card">
        <div className="inventory-card-header">{icon} {title}</div>
        <div className="inventory-item-list">
          {items.length > 0 ? (
            items.map(([key, stock]) => ( // 'key' is 'cheesecake', 'stock' is 100
              <div className="inventory-item" key={key}>
                <span className="inventory-item-name">{formatItemName(key)}</span>
                <div className="inventory-item-stock">
                  <input
                    type="number"
                    value={stock} // Use the stock value directly
                    onChange={(e) => {
                      // This updates the local state right away for a snappy feel
                      const val = e.target.value;
                      if (docPath === 'inventory/add-ons') setAddonsData(prev => ({ ...prev, [key]: val }));
                      if (docPath === 'inventory/cups') setCupsData(prev => ({ ...prev, [key]: val }));
                      if (docPath === 'inventory/straws') setStrawsData(prev => ({ ...prev, [key]: val }));
                    }}
                    onBlur={(e) => {
                      // When the user clicks away, send the final value to Firebase
                      handleStockChange(docPath, key, e.target.value)
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="no-items-message">No items in this category.</p>
          )}
        </div>
      </div>
    );
  };

  // The props we send to renderInventorySection are now different
  return (
    <div className="page-container">
      <h1>Inventory Management</h1>
      <div className="inventory-sections">
        {renderInventorySection(
          "Add-Ons",
          addonsData,
          <FiPlus />,
          "inventory/add-ons"
        )}
        {renderInventorySection(
          "Cups",
          cupsData,
          <FiCoffee />,
          "inventory/cups"
        )}
        {renderInventorySection(
          "Straws",
          strawsData,
          <FiBox />,
          "inventory/straw"
        )}
      </div>
    </div>
  );
};

export default Inventory;