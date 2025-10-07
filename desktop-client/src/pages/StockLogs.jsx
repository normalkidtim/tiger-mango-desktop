// src/pages/StockLogs.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

// ✅ Import needed styles
import "../assets/styles/global.css";
import "../assets/styles/tables.css";
import "../assets/styles/sales-analytics.css"; // for header underline

export default function StockLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "stock-logs"), orderBy("timestamp", "desc")),
      (snap) => {
        setLogs(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      }
    );
    return () => unsub();
  }, []);

  return (
    <div className="page-container">
      <h2 className="sales-header">📜 Stock Update Logs</h2>
      <div className="section-underline"></div>

      <div className="table-box">
        <table className="logs-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>New Value</th>
              <th>User</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? (
              logs.map((l) => (
                <tr key={l.id}>
                  <td>{l.item}</td>
                  <td>{l.newValue}</td>
                  <td>{l.user}</td>
                  <td>{l.timestamp?.toDate().toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-data">
                  No stock logs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
