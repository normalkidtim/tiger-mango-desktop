import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore'; 

import '../assets/styles/inventory.css';
import '../assets/styles/filters.css';
import '../assets/styles/tables.css'; 

// --- MODAL COMPONENT (Defined within the file for simplicity) ---
const EditStockModal = ({ item, onClose, onSave }) => {
    // Use toString() to handle number input field state correctly
    const [newStock, setNewStock] = useState(item.stock.toString()); 
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        const value = parseInt(newStock);
        if (isNaN(value) || value < 0) {
            alert("Please enter a valid, non-negative number for stock.");
            return;
        }

        setIsSaving(true);
        try {
            await onSave(item.firestoreDoc, item.firestoreField, value);
            onClose();
        } catch (error) {
            alert(`Failed to save stock: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h3>Edit Stock for {item.name}</h3>
                <p>Category: <strong>{item.category}</strong></p>
                <p>Current Stock: <strong>{item.stock}</strong></p>

                <div className="form-group">
                    <label htmlFor="newStock">New Stock Quantity:</label>
                    <input
                        id="newStock"
                        type="number"
                        value={newStock}
                        onChange={(e) => setNewStock(e.target.value)}
                        min="0"
                        required
                    />
                </div>
                
                <div className="modal-actions">
                    <button onClick={onClose} className="button-cancel" disabled={isSaving}>
                        Cancel
                    </button>
                    <button onClick={handleSave} className="button-primary" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};
// --- END MODAL COMPONENT ---


// --- DATA MAPPING FOR USER-FRIENDLY NAMES AND CATEGORIES ---
const FRIENDLY_NAMES = {
  'medium-cup': 'Medium Cup', 'large-cup': 'Large Cup', 'hot-cup': 'Hot Cup',
  'sealing-film': 'Sealing Film (Lid)', 'dome-lid': 'Dome Lid', 'flat-lid': 'Flat Lid',
  'hot-cup-lid': 'Hot Cup Lid', 'boba-straw': 'Boba Straw', 'regular-straw': 'Regular Straw',
  'thin-straw': 'Thin Straw', 'pearl': 'Pearl', 'nata': 'Nata De Coco',
  'fruit-jelly': 'Fruit Jelly', 'coffee-jelly': 'Coffee Jelly', 'creamcheese': 'Creamcheese',
  'crushed-oreo': 'Crushed Oreo', 'crushed-graham': 'Crushed Graham', 'coffee-shot': 'Coffee Shot',
};

const ITEM_CATEGORY_MAP = {
  'medium-cup': 'Cups', 'large-cup': 'Cups', 'hot-cup': 'Cups',
  'sealing-film': 'Lids', 'dome-lid': 'Lids', 'flat-lid': 'Lids', 'hot-cup-lid': 'Lids',
  'boba-straw': 'Straws', 'regular-straw': 'Straws', 'thin-straw': 'Straws', 
  'pearl': 'Add-ons', 'nata': 'Add-ons', 'fruit-jelly': 'Add-ons', 'coffee-jelly': 'Add-ons',
  'creamcheese': 'Add-ons', 'crushed-oreo': 'Add-ons', 'crushed-graham': 'Add-ons', 'coffee-shot': 'Add-ons',
};


function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [itemToEdit, setItemToEdit] = useState(null);

  const filterCategories = ['All', 'Cups', 'Lids', 'Straws', 'Add-ons'];

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(db, 'inventory'));
      const inventoryList = [];
      
      querySnapshot.docs.forEach(docSnapshot => {
        const firestoreDocId = docSnapshot.id; 
        const data = docSnapshot.data();

        for (const itemKey in data) {
          if (data.hasOwnProperty(itemKey)) {
            const friendlyName = FRIENDLY_NAMES[itemKey] || itemKey;
            const categoryName = ITEM_CATEGORY_MAP[itemKey] || firestoreDocId; 
            
            inventoryList.push({
              id: `${firestoreDocId}/${itemKey}`, 
              name: friendlyName, 
              category: categoryName, 
              // Convert stock to number if it's stored as a string
              stock: data[itemKey] !== null ? Number(data[itemKey]) : 0, 
              firestoreDoc: firestoreDocId, 
              firestoreField: itemKey,      
            });
          }
        }
      });
      
      setInventory(inventoryList);
    } catch (err) {
      console.error("Error fetching inventory: ", err);
      setError("Failed to fetch inventory.");
    }
    setLoading(false);
  };
  
  // Function to securely update stock via Electron backend
  const handleSaveStock = async (docId, fieldId, newStock) => {
    // The preload.js exposes this channel to the main process
    const result = await window.electron.updateInventoryStock(docId, fieldId, newStock);
    
    if (result.success) {
      alert(`Stock for ${FRIENDLY_NAMES[fieldId] || fieldId} successfully updated to ${newStock}.`);
      fetchInventory(); // Re-fetch inventory to update the list
    } else {
      // Throw error so the Modal can catch it
      throw new Error(result.error); 
    }
  };

  const handleEdit = (item) => {
    setItemToEdit(item);
  };

  const filteredInventory = inventory.filter(item => {
    if (filter === 'All') return true;
    return item.category === filter;
  });

  // --- RENDERING LOGIC ---
  const renderItemRow = (item) => (
    <tr key={item.id}>
      <td className="item-name">{item.name}</td>
      <td className="stock-count">{item.stock !== undefined ? item.stock : 'N/A'}</td>
      <td className="item-actions">
        <button 
          className="edit-btn" 
          onClick={() => handleEdit(item)} 
        >
          Edit
        </button>
      </td>
    </tr>
  );
  
  const renderInventoryTable = (items, category) => (
    <div key={category} className="category-group table-box">
      <h3 className="category-header">{category}</h3>
      <table className="inventory-table">
        <thead>
          <tr>
            <th>Item Name</th>
            <th className="stock-col">Stock</th>
            <th className="action-col">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => renderItemRow(item))}
        </tbody>
      </table>
    </div>
  );
  // --- END RENDERING LOGIC ---


  if (loading) return <div className="loading">Loading inventory...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="inventory-container">
        {/* MODAL RENDER */}
        {itemToEdit && (
            <EditStockModal
                item={itemToEdit}
                onClose={() => setItemToEdit(null)}
                onSave={handleSaveStock}
            />
        )}
        {/* END MODAL RENDER */}

      <h2>Inventory Management</h2>
      
      <div className="filter-container">
        {filterCategories.map(category => (
          <button
            key={category}
            className={`filter-btn ${filter === category ? 'active' : ''}`}
            onClick={() => setFilter(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="inventory-display-content"> 
        {filter === 'All' ? (
          <div>
            {filterCategories.filter(c => c !== 'All').map(category => {
              const itemsInCategory = inventory.filter(item => item.category === category);
              
              if (itemsInCategory.length === 0) return null; 

              return renderInventoryTable(itemsInCategory, category);
            })}
          </div>
        ) : (
          <div className="filtered-table-wrapper">
            {filteredInventory.length > 0 ? (
              renderInventoryTable(filteredInventory, filter)
            ) : (
              <p>No items found for category "{filter}".</p>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

export default Inventory;