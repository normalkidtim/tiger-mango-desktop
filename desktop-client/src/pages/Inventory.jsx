import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import '../assets/styles/inventory.css';
import '../assets/styles/tables.css';

const Inventory = () => {
  const [cups, setCups] = useState(null);
  const [straws, setStraws] = useState(null);
  const [addOns, setAddOns] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const docRefs = [
      doc(db, 'inventory', 'cups'),
      doc(db, 'inventory', 'straw'),
      doc(db, 'inventory', 'add-ons'),
    ];

    const unsubscribes = docRefs.map((docRef, index) => {
      return onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          if (index === 0) setCups(data);
          if (index === 1) setStraws(data);
          if (index === 2) setAddOns(data);
        } else {
          console.warn(`Document not found at path: ${docRef.path}`);
        }
      });
    });

    setLoading(false);
    
    return () => unsubscribes.forEach(unsub => unsub());
  }, []);

  // ✅ --- (NEW) Helper function to format the item names ---
  const formatItemName = (key) => {
    return key
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderTable = (title, data) => {
    if (!data) return <p>Loading {title}...</p>;
    return (
      <div className="table-box">
        <h3>{title}</h3>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Current Stock</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data).map(([key, value]) => (
              <tr key={key}>
                {/* ✅ --- (MODIFIED) Use the helper function here --- */}
                <td>{formatItemName(key)}</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) return <div>Loading Inventory...</div>;

  return (
    <div className="page-container">
      <h2>Inventory Management</h2>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
        {renderTable('Cups', cups)}
        {renderTable('Straws', straws)}
        {renderTable('Add-ons', addOns)}
      </div>
    </div>
  );
};

export default Inventory;