// src/pages/StockLogs.jsx
import React, { useEffect, useState, useMemo } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { FiFileText, FiSearch } from "react-icons/fi";
import "../assets/styles/tables.css"; // We'll keep this for the table style
// filters.css is already imported in main.jsx

export default function StockLogs() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "stock-logs"), orderBy("timestamp", "desc")),
      (snap) => {
        setLogs(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      }
    );
    return () => unsub();
  }, []);

  // Filter logs based on the search term
  const filteredLogs = useMemo(() => {
    if (!searchTerm) {
      return logs;
    }
    return logs.filter(log => 
      log.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [logs, searchTerm]);

  return (
    <div>
      <div className="page-header">
        <FiFileText />
        <h2>Stock Update Logs</h2>
      </div>
      <div className="page-header-underline"></div>

      <div className="filter-bar">
        <div className="filter-group" style={{width: '100%'}}>
          <FiSearch />
          <input 
            type="text" 
            placeholder="Search by item or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '1rem'
            }}
          />
        </div>
      </div>

      <div className="table-box">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>New Value</th>
              <th>User</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.item}</td>
                  <td>{log.newValue}</td>
                  <td>{log.user}</td>
                  <td>{log.timestamp?.toDate().toLocaleString()}</td>
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