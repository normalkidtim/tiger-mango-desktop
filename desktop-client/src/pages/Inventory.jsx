import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Siguraduhin na tama ang path sa firebase config
import { collection, getDocs } from 'firebase/firestore';
import '../assets/styles/inventory.css';
import '../assets/styles/filters.css';

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');

  const categories = ['All', 'Straw', 'Cups', 'Lids', 'Add-ons'];

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(db, 'inventory'));
      const inventoryList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInventory(inventoryList);
    } catch (err) {
      console.error("Error fetching inventory: ", err);
      setError("Failed to fetch inventory.");
    }
    setLoading(false);
  };

  const filteredInventory = inventory.filter(item => {
    if (filter === 'All') return true;
    return item.category === filter;
  });

  const handleEdit = (item) => {
    alert(`Edit item: ${item.name}\n(Kasalukuyang stock: ${item.stock})`);
  };

  // --- BAGO ANG STRUCTURE NITO ---
  // Ginawa na natin itong "list item" o "row"
  const renderItemRow = (item) => (
    <div key={item.id} className="inventory-list-item">
      {/* Details ng item (pangalan at category) */}
      <div className="item-details">
        <h3 className="item-name">{item.name}</h3>
        <p className="item-category">{item.category}</p>
      </div>
      
      {/* Stock count */}
      <p className="stock-count">
        {item.stock !== undefined ? item.stock : 'N/A'}
      </p>

      {/* Edit button */}
      <div className="item-actions">
        <button 
          className="edit-btn" 
          onClick={() => handleEdit(item)}
        >
          Edit
        </button>
      </div>
    </div>
  );

  if (loading) return <div className="loading">Loading inventory...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="inventory-container">
      <h2>Inventory Management</h2>
      
      {/* Filter Buttons */}
      <div className="filter-container">
        {categories.map(category => (
          <button
            key={category}
            className={`filter-btn ${filter === category ? 'active' : ''}`}
            onClick={() => setFilter(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* --- Main Content Area --- */}
      <div className="inventory-display-area">
        {filter === 'All' ? (
          // --- GROUPED VIEW (Kapag 'All' ang pinili) ---
          <div>
            {categories.filter(c => c !== 'All').map(category => {
              const itemsInCategory = inventory.filter(item => item.category === category);
              if (itemsInCategory.length === 0) return null;

              return (
                <div key={category} className="category-group">
                  <h3 className="category-header">{category}</h3>
                  {/* Pinalitan ang class galing "inventory-grid" */}
                  <div className="inventory-list-container">
                    {itemsInCategory.map(item => renderItemRow(item))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // --- FILTERED VIEW (Kapag specific category ang pinili) ---
          /* Pinalitan ang class galing "inventory-grid" */
          <div className="inventory-list-container">
            {filteredInventory.length > 0 ? (
              filteredInventory.map(item => renderItemRow(item))
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