import React, { useState, useEffect } from 'react'; // Fixed the brackets here
import { db } from '../firebase';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc
} from 'firebase/firestore';

import '../assets/styles/tables.css';
import '../assets/styles/orders.css';

const formatPrice = (price) => `₱${(price || 0).toFixed(2)}`;

const formatDate = (timestamp) => {
  if (timestamp && timestamp.toDate) {
    return timestamp.toDate().toLocaleString();
  }
  return 'Loading...';
};

const renderOrderItems = (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return <li>No items</li>;
  }
  return (
    <ul style={{ margin: 0, paddingLeft: '20px' }}>
      {items.map((item, index) => {
        const quantity = item.quantity || 1;
        const name = item.name || 'Unknown Item';
        const category = item.categoryName || null;
        const size = item.size || 'N/A';
        const sugar = item.sugar || null;
        const ice = item.ice || null;
        const addons = item.addons || [];
        return (
          <li key={index}>
            {category && (
              <span className="order-item-category">{category}</span>
            )}
            <span className="order-item-name">
              <strong>{quantity}x {name} ({size})</strong>
            </span>
            {sugar && ice && (
              <span className="order-item-details">
                {sugar}, {ice}
                {addons.length > 0 && ` w/ ${addons.map(a => a.name).join(', ')}`}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
};

const Orders = () => {
  // --- ✅ FIX: Corrected the useState syntax below ---
  const [pendingOrders, setPendingOrders] = useState([]); 
  // --- End of Fix ---
  const [finishedOrders, setFinishedOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const allOrders = [];
      querySnapshot.forEach((doc) => {
        allOrders.push({ id: doc.id, ...doc.data() });
      });
      setPendingOrders(allOrders.filter(order => order.status === 'Pending'));
      setFinishedOrders(allOrders.filter(order => order.status !== 'Pending'));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders: ", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- Simplified function: Only updates status ---
  const handleUpdateStatus = async (order, newStatus) => {
    
    if (!order || !order.id) {
      console.error("Invalid order object:", order);
      alert("An error occurred. The order data is missing.");
      return; 
    }

    const prettyStatus = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
    if (!confirm(`Are you sure you want to mark this order as "${prettyStatus}"?`)) {
      return;
    }

    try {
      const orderRef = doc(db, "orders", order.id);
      await updateDoc(orderRef, { status: newStatus });
      alert(`Order has been ${newStatus}!`);
      
      if (newStatus === 'Completed') {
          console.log("Order marked as Completed (Stock was NOT deducted).");
      }

    } catch (error) {
      console.error("Error updating order status: ", error);
      alert(`Error: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="page-container">Loading orders...</div>;
  }

  return (
    <div className="page-container">
      <h2>Pending Orders</h2>
      <p>These orders need to be confirmed. (Stock deduction is currently turned off).</p>

      <div className="table-box">
        <table>
          <thead>
            <tr>
              <th>Order Time</th>
              <th>Items</th>
              <th>Total Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingOrders.length === 0 && (
              <tr>
                <td colSpan="4" className="no-data">No pending orders. Good job!</td>
              </tr>
            )}
            {pendingOrders.map((order) => (
              <tr key={order.id}>
                <td>{formatDate(order.createdAt)}</td>
                <td>{renderOrderItems(order.items)}</td>
                <td>{formatPrice(order.totalPrice)}</td>
                <td className="order-actions">
                  <button
                    className="order-button button-complete"
                    onClick={() => handleUpdateStatus(order, 'Completed')}
                  >
                    Complete
                  </button>
                  <button
                    className="order-button button-cancel"
                    onClick={() => handleUpdateStatus(order, 'Cancelled')}
                  >
                    Cancel
                  </button>
                  <button
                    className="order-button button-void"
                    onClick={() => handleUpdateStatus(order, 'Voided')}
                  >
                    Void
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Finished Orders</h2>
      <p>These are past orders that are already completed, cancelled, or voided.</p>

      <div className="table-box">
        <table>
          <thead>
            <tr>
              <th>Order Time</th>
              <th>Items</th>
              <th>Total Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {finishedOrders.length === 0 && (
              <tr>
                <td colSpan="4" className="no-data">No finished orders yet.</td>
              </tr>
            )}
            {finishedOrders.map((order) => (
              <tr key={order.id}>
                <td>{formatDate(order.createdAt)}</td>
                <td>{renderOrderItems(order.items)}</td>
                <td>{formatPrice(order.totalPrice)}</td>
                <td>{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> 
      
    </div> 
  );
};

export default Orders;

