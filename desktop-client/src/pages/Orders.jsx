import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  runTransaction,
  increment,
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

  // ✅ --- (THIS IS THE FINAL, ROBUST FIX) ---
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

    // --- 1. If status is NOT 'Completed', just update status and stop. ---
    if (newStatus !== 'Completed') {
      try {
        await updateDoc(orderRef, { status: newStatus });
        alert(`Order has been ${newStatus}!`);
      } catch (error) {
        console.error("Error updating order status: ", error);
        alert(`Error: ${error.message}`);
      }
      return;
    }

    // --- 2. If status IS 'Completed', run the full, safe transaction. ---
    try {
      await runTransaction(db, async (transaction) => {
        console.log("Starting SIMPLE inventory transaction...");

        // ✅ --- (THE REAL FIX) ---
        // We re-fetch the order *inside* the transaction to avoid stale data.
        const orderDoc = await transaction.get(orderRef);
        if (!orderDoc.exists()) {
          throw new Error("Order document not found. It may have been deleted.");
        }
        
        // We now use orderData from the transaction, NOT the 'order' prop
        const orderData = orderDoc.data(); 
        
        // Safety check on the fresh data
        if (!orderData || !Array.isArray(orderData.items)) {
          throw new Error("Order data or items list is invalid in the database.");
        }
        // --- End of Fix ---

        const cupRef = doc(db, 'inventory', 'cups');
        const strawRef = doc(db, 'inventory', 'straws');

        const cupDoc = await transaction.get(cupRef);
        const strawDoc = await transaction.get(strawRef);

        if (!cupDoc.exists()) throw new Error("CRITICAL: 'inventory/cups' document not found!");
        if (!strawDoc.exists()) throw new Error("CRITICAL: 'inventory/straws' document not found!");

        const cupData = cupDoc.data();
        const strawData = strawDoc.data();

        let cupsMediumToDeduct = 0;
        let cupsLargeToDeduct = 0;
        let strawsToDeduct = 0;

        // This loop now uses the 100% fresh orderData.items
        for (const item of orderData.items) {
          const q = item.quantity || 1;
          strawsToDeduct += q;

          if (item.size === 'medium') {
            cupsMediumToDeduct += q;
          } else if (item.size === 'large') {
            cupsLargeToDeduct += q;
          }
        }

        if ((cupData.Medium || 0) < cupsMediumToDeduct) {
          throw new Error(`Not enough MEDIUM cups. Need ${cupsMediumToDeduct}, have ${cupData.Medium || 0}.`);
        }
        if ((cupData.Large || 0) < cupsLargeToDeduct) {
          throw new Error(`Not enough LARGE cups. Need ${cupsLargeToDeduct}, have ${cupData.Large || 0}.`);
        }
        if ((strawData.Boba || 0) < strawsToDeduct) {
          throw new Error(`Not enough Boba straws. Need ${strawsToDeduct}, have ${strawData.Boba || 0}.`);
        }

        const cupUpdates = {};
        if (cupsMediumToDeduct > 0) {
          cupUpdates.Medium = increment(-cupsMediumToDeduct);
        }
        if (cupsLargeToDeduct > 0) {
          cupUpdates.Large = increment(-cupsLargeToDeduct);
        }

        if (Object.keys(cupUpdates).length > 0) {
          transaction.update(cupRef, cupUpdates);
        }
        if (strawsToDeduct > 0) {
          transaction.update(strawRef, { Boba: increment(-strawsToDeduct) });
        }

        // Finally, update the order status
        transaction.update(orderRef, { status: 'Completed' });
      });

      console.log("Transaction successful! Cups and straws updated.");
      alert("Order Completed and stocks (cups & straws) have been deducted!");

    } catch (error) {
      console.error("Simple Transaction FAILED: ", error);
      alert(`Order update failed. Stocks were NOT deducted. Error: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="page-container">Loading orders...</div>;
  }

  return (
    <div className="page-container">
      <h2>Pending Orders</h2>
      <p>These orders need to be confirmed. Completing them will decrease stock.</p>

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