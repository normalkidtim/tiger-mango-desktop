import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Import your Firebase db
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc,
  runTransaction, // ✅ --- (NEW) We need this for the safe update
  increment         // ✅ --- (NEW) This helps subtract numbers
} from 'firebase/firestore';

import '../assets/styles/tables.css';
import '../assets/styles/orders.css';

// Helper function to make the date and time readable
const formatDate = (timestamp) => {
  if (timestamp && timestamp.toDate) {
    return timestamp.toDate().toLocaleString(); // e.g., "10/25/2025, 11:00:00 AM"
  }
  return 'Loading...';
};

// Helper function to show the items in the order
const renderOrderItems = (items) => {
  if (!items || items.length === 0) return <li>No items</li>;
  
  return (
    <ul style={{ margin: 0, paddingLeft: '20px' }}>
      {items.map((item, index) => (
        <li key={index}>
          {item.quantity}x {item.flavor} ({item.size})
          {item.addOns.length > 0 && ` w/ ${item.addOns.join(', ')}`}
        </li>
      ))}
    </ul>
  );
};

const Orders = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [finishedOrders, setFinishedOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // This function runs when the page loads
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const allOrders = [];
      querySnapshot.forEach((doc) => {
        allOrders.push({ id: doc.id, ...doc.data() });
      });

      // Split orders into "Pending" and "Finished"
      setPendingOrders(allOrders.filter(order => order.status === 'Pending'));
      setFinishedOrders(allOrders.filter(order => order.status !== 'Pending'));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ --- (THIS IS THE NEW, SMARTER FUNCTION) ---
  const handleUpdateStatus = async (order, newStatus) => {
    const orderId = order.id;
    const orderItems = order.items; // Get the items from the order object

    // 1. Show confirmation
    const prettyStatus = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
    if (!confirm(`Are you sure you want to mark this order as "${prettyStatus}"?`)) {
      return; 
    }

    // 2. If the new status is NOT 'Completed', just update and stop.
    // This is for "Cancel" or "Void"
    if (newStatus !== 'Completed') {
      try {
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, { status: newStatus });
        alert(`Order has been ${newStatus}!`);
      } catch (error) {
        console.error("Error updating order status: ", error);
        alert("Error updating order status.");
      }
      return; // Stop here
    }

    // 3. If the status IS 'Completed', run the BIG transaction
    // This is the "Magic Robot" logic, now inside your app!
    console.log("Order is 'Completed'. Running inventory transaction...");
    try {
      await runTransaction(db, async (transaction) => {
        // --- A. Define all the documents we need to touch ---
        const orderRef = doc(db, "orders", orderId);
        const cupRef = doc(db, "inventory/cups");
        const strawRef = doc(db, "inventory/straw");
        const addOnsRef = doc(db, "inventory/add-ons");

        // --- B. Read the inventory documents first ---
        // (We read them inside the transaction to make sure they are up-to-date)
        const [cupDoc, strawDoc, addOnsDoc] = await Promise.all([
          transaction.get(cupRef),
          transaction.get(strawRef),
          transaction.get(addOnsRef)
        ]);

        if (!cupDoc.exists()) throw new Error("CRITICAL: 'inventory/cups' document not found!");
        if (!strawDoc.exists()) throw new Error("CRITICAL: 'inventory/straw' document not found!");
        if (!addOnsDoc.exists()) throw new Error("CRITICAL: 'inventory/add-ons' document not found!");
        
        // --- C. Prepare the updates ---
        if (!orderItems || orderItems.length === 0) {
          console.log("Order has no items, but marking as complete.");
        } else {
          // Loop over every item in the order
          for (const item of orderItems) {
            if (!item || !item.quantity || !item.size || !item.addOns) {
              console.warn("Skipping a malformed item in the order:", item);
              continue;
            }

            const { quantity, size, addOns } = item;
            // 'increment()' with a negative number is how we subtract
            const dec = increment(-quantity); 

            // This logic MUST match your mobile app
            const cupKey = size === '1LITER' ? 'liter' : size.toLowerCase();
            
            // Tell the transaction to update the fields
            transaction.update(cupRef, { [cupKey]: dec });
            transaction.update(strawRef, { 'regular': dec });

            if (addOns.length > 0) {
              for (const addonName of addOns) {
                const addonKey = addonName.toLowerCase().replace(/ /g, '-');
                transaction.update(addOnsRef, { [addonKey]: dec });
              }
            }
          }
        }
        
        // --- D. Finally, update the order status ---
        // This only happens if all the inventory updates above are successful
        transaction.update(orderRef, { status: 'Completed' });
      });

      // If the transaction is successful:
      console.log("Transaction success! Order marked 'Completed' and inventory updated.");
      alert("Order Completed and stocks updated!");

    } catch (error) {
      // If the transaction fails:
      console.error("Transaction failed: ", error);
      alert(`Failed to complete order. Stocks were NOT updated. Error: ${error.message}`);
    }
  };


  if (loading) {
    return <div>Loading orders...</div>;
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
                <td>₱{order.totalPrice ? order.totalPrice.toFixed(2) : '0.00'}</td>
                <td className="order-actions">
                  <button 
                    className="order-button button-complete"
                    // ✅ --- (CHANGED) Pass the whole 'order' object ---
                    onClick={() => handleUpdateStatus(order, 'Completed')}
                  >
                    Complete
                  </button>
                  <button 
                    className="order-button button-cancel"
                    // ✅ --- (CHANGED) Pass the whole 'order' object ---
                    onClick={() => handleUpdateStatus(order, 'Cancelled')}
                  >
                    Cancel
                  </button>
                  <button 
                    className="order-button button-void"
                    // ✅ --- (CHANGED) Pass the whole 'order' object ---
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

      <h2 style={{marginTop: '40px'}}>Finished Orders</h2>
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
                <td>₱{order.totalPrice ? order.totalPrice.toFixed(2) : '0.00'}</td>
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