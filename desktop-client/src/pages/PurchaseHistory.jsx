// src/pages/PurchaseHistory.jsx
import React, { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import "../assets/styles/global.css";

export default function PurchaseHistory() {
  const [orders, setOrders] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const filteredOrders = useMemo(() => {
    if (!startDate || !endDate) return orders;
    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T23:59:59.999");
    return orders.filter((o) => {
      const d = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
      return d >= start && d <= end;
    });
  }, [orders, startDate, endDate]);

  return (
    <div className="page-container">
      <h2 className="sales-header">🧾 Purchase History</h2>
      <div className="section-underline"></div>

      <div className="history-filters">
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <span>to</span>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <button className="btn small outline" onClick={() => { setStartDate(""); setEndDate(""); }}>
          Clear
        </button>
      </div>

      <div className="table-box">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Flavor</th>
              <th>Add-ons</th>
              <th>Size</th>
              <th>Qty</th>
              <th>Price (₱)</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders
                .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
                .map((o) => {
                  const d = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
                  const dateStr = d.toLocaleString();
                  const addons = Array.isArray(o.addOns) ? o.addOns.join(", ") : "";
                  const total = (o.price || 0) * (o.quantity || 1);
                  return (
                    <tr key={o.id}>
                      <td>{dateStr}</td>
                      <td>{o.flavor}</td>
                      <td>{addons}</td>
                      <td>{o.size}</td>
                      <td>{o.quantity}</td>
                      <td>{total.toLocaleString()}</td>
                    </tr>
                  );
                })
            ) : (
              <tr>
                <td colSpan="6" className="no-data">No orders</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
