import React, { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { FiShoppingCart, FiCalendar } from "react-icons/fi";

export default function PurchaseHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (startDate && endDate) {
      const start = new Date(startDate + "T00:00:00");
      const end = new Date(endDate + "T23:59:59.999");
      filtered = filtered.filter((o) => {
        const d = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
        return d >= start && d <= end;
      });
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }

    return filtered;
  }, [orders, startDate, endDate, statusFilter]);


  return (
    <div>
      <div className="page-header">
        <FiShoppingCart />
        <h2>Purchase History</h2>
      </div>
      <div className="page-header-underline"></div>

      <div className="filter-bar">
        <div className="filter-group">
          <FiCalendar />
          <label>From:</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="filter-group">
          <label>To:</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div className="filter-group">
          <label>Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="Completed">Completed</option>
            <option value="Voided">Voided</option>
          </select>
        </div>
      </div>

      <div className="table-box">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Item</th>
              <th>Add-ons</th>
              <th>Size</th>
              <th>Qty</th>
              <th>Price (₱)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="no-data">Loading...</td></tr>
            ) : filteredOrders.flatMap((order) => {
                // This logic now handles BOTH old (single item) and new (multi-item) order formats
                const itemsToRender = order.items ? order.items : [order];
                return itemsToRender.map((item, index) => {
                  const d = order.createdAt?.toDate ? order.createdAt.toDate() : new Date();
                  const addons = Array.isArray(item.addOns) ? item.addOns.join(", ") : "";
                  const total = item.price || 0;
                  return (
                    <tr key={`${order.id}-${index || 0}`}>
                      <td>{index === 0 ? d.toLocaleString('en-US', { timeZone: 'Asia/Manila' }) : ""}</td>
                      <td>{item.flavor}</td>
                      <td>{addons || '-'}</td>
                      <td>{item.size}</td>
                      <td>{item.quantity}</td>
                      <td>{total.toLocaleString()}</td>
                      <td>{order.status}</td>
                    </tr>
                  );
                });
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}