import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc // We only need updateDoc for status updates
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
        const name = item.name || item.flavor || 'Unknown Item';
        const category = item.categoryName || null;
        const size = item.size || 'N/A';
        const sugar = item.sugar || null;
        const ice = item.ice || null;
        const addons = item.addons || item.addOns || [];

        return (
          <li key={index}>
            {category && (
              <span className="order-item-category">
                {category}
              </span>
            )}
            <span className="order-item-name">
              <strong>{quantity}x {name} ({size})</strong>
            </span>
            {sugar && ice && (
              <span className="order-item-details">
                {sugar}, {ice}
                {addons.length > 0 && ` w/ ${addons.map(a => a.name || a).join(', ')}`}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
};

const Orders = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [finishedOrders, setFinishedOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Assuming the field name in Firestore for timestamp is 'createdAt'
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const allOrders = [];
      querySnapshot.forEach((doc) => {
        // Ensure we are using the correct field name for the total price from the database (e.g., 'total' or 'totalPrice')
        allOrders.push({ id: doc.id, ...doc.data(), totalPrice: doc.data().total || doc.data().totalPrice }); 
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

  // ✅ --- (THE NEW, SIMPLIFIED FIX FOR STATUS UPDATE) ---
  const handleUpdateStatus = async (order, newStatus) => {
    
    // Safety Check 1: Check the order object on function call
    if (!order || !order.id) {
      console.error("handleUpdateStatus was called with an invalid order:", order);
      alert("An error occurred. The order data is missing. Please refresh the page and try again.");
      return; 
    }

    const orderId = order.id;
    const orderRef = doc(db, "orders", orderId);

    const prettyStatus = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
    if (!confirm(`Are you sure you want to mark this order as "${prettyStatus}"?`)) {
      return;
    }

    // Stock Deduction is handled by the POS/Electron backend when the order is created.
    // This page only updates the status.
    try {
      await updateDoc(orderRef, { status: newStatus });
      
      // Provide feedback based on the status change
      if (newStatus === 'Completed') {
        alert("Order Completed! (Stock was already deducted when the order was placed.)");
      } else {
        alert(`Order has been marked as ${prettyStatus}.`);
      }

    } catch (error) {
      console.error(`Error updating order status to ${newStatus}: `, error);
      alert(`Order update failed. Error: ${error.message}`);
    }
  };
// --- END OF FIX ---

  if (loading) {
    return <div className="page-container">Loading orders...</div>;
  }

  return (
    <div className="page-container">
      <h2>Pending Orders</h2>
      <p>These orders need to be confirmed. Stock has already been deducted by the POS system.</p>

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
                <td>{renderOrderItems(order.cart || order.items)}</td>
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
                <td>{renderOrderItems(order.cart || order.items)}</td>
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