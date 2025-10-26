import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import '../assets/styles/inventory.css';
import '../assets/styles/tables.css';

// ✅ --- (THIS IS THE FIX) ---
// We no longer need to format the name. We just return the key as is.
// Firebase already has "Coffee Jelly", so we'll display that directly.
const formatItemName = (key) => {
  return key;
};

// This component listens to a single inventory document
const InventoryTable = ({ docPath, title, unit }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const docRef = doc(db, 'inventory', docPath);
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        setData(doc.data());
      } else {
        console.warn(`Document not found: inventory/${docPath}`);
        setData({});
      }
    });
    return () => unsubscribe();
  }, [docPath]);

  return (
    <div className="table-box inventory-table-box">
      <h3>{title}</h3>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Current Stock ({unit})</th>
          </tr>
        </thead>
        <tbody>
          {!data && (
            <tr>
              <td colSpan="2" className="no-data">Loading...</td>
            </tr>
          )}
          {data && Object.keys(data).length === 0 && (
            <tr>
              <td colSpan="2" className="no-data">Document 'inventory/{docPath}' not found.</td>
            </tr>
          )}
          {data && Object.entries(data).map(([key, value]) => (
            <tr key={key}>
              <td>{formatItemName(key)}</td>
              <td>{value.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Main Inventory Page
const Inventory = () => {
  return (
    <div className="page-container">
      <h2>Inventory Management</h2>
      <p>This is a read-only view of current stock levels.</p>

      <div className="inventory-grid">
        <InventoryTable docPath="cups" title="Cups" unit="pcs" />
        <InventoryTable docPath="straws" title="Straws" unit="pcs" />
        <InventoryTable docPath="toppings" title="Toppings" unit="servings" />
      </div>
    </div>
  );
};

export default Inventory;