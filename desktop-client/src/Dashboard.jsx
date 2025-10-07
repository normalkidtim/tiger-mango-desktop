// src/Dashboard.jsx
import React, { useEffect, useState } from "react";
import './App.css'; // ensure styling is loaded (this restores the design)
import { db } from './firebase';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { useAuth } from './AuthContext';
import Register from './Register';
import Login from './Login';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";

/**
 * Restored Dashboard — this is the original App UI moved into a Dashboard component.
 * It uses your App.css classes so the visuals match what you originally sent.
 */

export default function Dashboard() {
  const { currentUser, logout, getUsers, updateUser } = useAuth();

  // Basic UI state
  const [activeTab, setActiveTab] = useState('inventory'); // inventory | history | analytics | admin
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Inventory & analytics state
  const [cups, setCups] = useState([]);
  const [straws, setStraws] = useState([]);
  const [addons, setAddons] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [stockLogs, setStockLogs] = useState([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [addOnFilter, setAddOnFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // UI helpers
  const [exportNotification, setExportNotification] = useState(null);
  const [appVersion, setAppVersion] = useState('1.0.0');
  const [userRole, setUserRole] = useState(currentUser?.role || 'employee');

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => {
    // window size responsive
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    window.addEventListener('resize', handleResize);

    // subscribe to Firestore collections if available
    let unsubOrders = () => {};
    let unsubLogs = () => {};
    let unsubCups = () => {};
    let unsubStraws = () => {};

    try {
      const cupsCol = collection(db, "cups");
      const qCups = query(cupsCol, orderBy("name"));
      unsubCups = onSnapshot(qCups, (snap) => {
        const arr = [];
        snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
        setCups(arr);
      });

      const strawsCol = collection(db, "straws");
      const qStraws = query(strawsCol, orderBy("name"));
      unsubStraws = onSnapshot(qStraws, (snap) => {
        const arr = [];
        snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
        setStraws(arr);
      });

      const ordersCol = collection(db, "orders");
      const qOrders = query(ordersCol, orderBy("createdAt", "desc"));
      unsubOrders = onSnapshot(qOrders, (snap) => {
        const arr = [];
        snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
        setPurchaseHistory(arr);
        setFilteredHistory(arr);
      });

      const logsCol = collection(db, "stock-logs");
      const qLogs = query(logsCol, orderBy("timestamp", "desc"));
      unsubLogs = onSnapshot(qLogs, (snap) => {
        const arr = [];
        snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
        setStockLogs(arr);
      });
    } catch (err) {
      // Firestore may be unavailable in browser fallback — we swallow errors here
      console.warn('Firestore subscribe error (may be running in web fallback):', err.message);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      try { unsubOrders(); } catch {}
      try { unsubLogs(); } catch {}
      try { unsubCups(); } catch {}
      try { unsubStraws(); } catch {}
    };
  }, []);

  // Filtering logic
  useEffect(() => {
    applyFilters();
  }, [searchTerm, sizeFilter, addOnFilter, dateFilter, startDate, endDate, purchaseHistory]);

  function applyFilters() {
    let filtered = [...purchaseHistory];

    if (searchTerm) {
      filtered = filtered.filter(order =>
        (order.flavor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.addOns || []).some(a => a.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (sizeFilter !== 'all') {
      filtered = filtered.filter(o => o.size === sizeFilter);
    }

    if (addOnFilter !== 'all') {
      filtered = filtered.filter(o => (o.addOns || []).includes(addOnFilter));
    }

    if (startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      e.setHours(23,59,59,999);
      filtered = filtered.filter(o => {
        if (!o.createdAt) return false;
        const dt = o.createdAt.toDate();
        return dt >= s && dt <= e;
      });
    }

    setFilteredHistory(filtered);
  }

  // Export CSV (desktop via electron API or browser fallback)
  async function handleExportData() {
    const csv = convertToCSV(filteredHistory);
    if (window.electronAPI) {
      const filename = `tiger-mango-export-${new Date().toISOString().split('T')[0]}`;
      const result = await window.electronAPI.exportDataCSV(csv, filename);
      if (result && result.success) {
        showNotification(`Data exported to ${result.path}`, 'success');
      } else {
        showNotification('Export cancelled or failed', 'info');
      }
    } else {
      // browser fallback
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tiger-mango-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification('Data exported (browser)', 'success');
    }
  }

  function convertToCSV(data) {
    if (!data || !data.length) return 'No data';
    const headers = ['Flavor','Size','Add-Ons','Quantity','Price','Date'];
    const rows = data.map(o => [
      `"${o.flavor || ''}"`,
      `"${o.size || ''}"`,
      `"${(o.addOns || []).join('; ')}"`,
      o.quantity || '',
      o.price || '',
      `"${o.createdAt ? o.createdAt.toDate().toLocaleString() : ''}"`
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  function showNotification(message, type = 'info') {
    setExportNotification({ message, type, id: Date.now() });
    setTimeout(() => setExportNotification(null), 4000);
  }

  // Update user role (admin area)
  async function updateUserRole(email, role) {
    try {
      await updateUser(email, { role });
      showNotification('User role updated', 'success');
    } catch (err) {
      showNotification('Failed to update user: ' + err.message, 'error');
    }
  }

  // Small UI helpers
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (isMobile) setSidebarCollapsed(true);
  };

  // Render
  return (
    <div className="dashboard">
      {/* Optional Electron title bar / platform badge */}
      <div className="desktop-title-bar">
        <div className="title-bar-content">
          <div className="platform-badge">Desktop</div>
          <div style={{marginLeft: '12px', fontWeight: 600}}>Tiger Mango Inventory</div>
        </div>
      </div>

      <div className="app-layout" style={{display: 'flex', gap: '20px', padding: '20px'}}>
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} style={{width: sidebarCollapsed ? 80 : 240}}>
          <div style={{padding: '16px', fontWeight: 700}}>Menu</div>
          <button className="sidebar-btn" onClick={() => handleTabClick('inventory')}>Inventory</button>
          <button className="sidebar-btn" onClick={() => handleTabClick('history')}>History</button>
          <button className="sidebar-btn" onClick={() => handleTabClick('analytics')}>Analytics</button>
          {currentUser?.role === 'admin' && (
            <button className="sidebar-btn" onClick={() => handleTabClick('admin')}>Admin</button>
          )}

          <div style={{marginTop: 'auto', padding: 12}}>
            <button className="export-btn-sidebar" onClick={handleExportData}>Export Data</button>
          </div>
        </aside>

        {/* Main content */}
        <main className="main-content" style={{flex: 1}}>
          {/* Top area: controls */}
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
            <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
              <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="btn">☰</button>
              <h2 style={{margin: 0}}>Tiger Mango Inventory</h2>
              <div style={{marginLeft: 16, fontSize: 12, color: '#666'}}>v{appVersion}</div>
            </div>

            <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
              <div style={{fontSize: 14, color: '#555'}}>User: {currentUser?.firstName || currentUser?.email}</div>
              <button onClick={() => { logout(); window.location.href = '/login'; }} className="btn">Logout</button>
            </div>
          </div>

          {/* Active tab content */}
          {activeTab === 'inventory' && (
            <section className="card">
              <h3>Inventory Overview</h3>

              <div style={{display: 'flex', gap: 20}}>
                <div style={{flex: 1}} className="card">
                  <h4>Cups</h4>
                  <ul>
                    {cups.map(c => (
                      <li key={c.id}>{c.name} — {c.quantity}</li>
                    ))}
                    {!cups.length && <div className="no-data">No cups data</div>}
                  </ul>
                </div>

                <div style={{flex: 1}} className="card">
                  <h4>Straws</h4>
                  <ul>
                    {straws.map(s => (
                      <li key={s.id}>{s.name} — {s.quantity}</li>
                    ))}
                    {!straws.length && <div className="no-data">No straws data</div>}
                  </ul>
                </div>

                <div style={{flex: 1}} className="card">
                  <h4>Add-ons</h4>
                  <ul>
                    {addons.map(a => (
                      <li key={a.id}>{a.name} — {a.quantity}</li>
                    ))}
                    {!addons.length && <div className="no-data">No add-ons data</div>}
                  </ul>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'history' && (
            <section className="card">
              <div className="export-header">
                <button className="export-btn" onClick={handleExportData}>Export CSV</button>
              </div>

              <h3>Purchase History</h3>
              <div style={{overflowX: 'auto'}}>
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Flavor</th>
                      <th>Size</th>
                      <th>Add-ons</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.length === 0 && (
                      <tr><td colSpan={6}><div className="no-results">No history yet</div></td></tr>
                    )}
                    {filteredHistory.map(order => (
                      <tr key={order.id}>
                        <td className="flavor-cell">{order.flavor}</td>
                        <td className="size-cell">{order.size}</td>
                        <td className="addons-cell">{(order.addOns || []).join(', ')}</td>
                        <td className="quantity-cell">{order.quantity}</td>
                        <td className="price-cell">{order.price}</td>
                        <td className="date-cell">{order.createdAt ? order.createdAt.toDate().toLocaleString() : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'analytics' && (
            <section className="card chart-card">
              <h3>Analytics</h3>
              <div style={{display: 'flex', gap: 20}}>
                <div style={{flex: 1, height: 250}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={(purchaseHistory || []).slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="flavor" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="quantity" name="Qty" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{flex: 1, height: 250}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={(purchaseHistory || []).slice(0, 6)} dataKey="quantity" nameKey="flavor" outerRadius={80}>
                        {(purchaseHistory || []).slice(0,6).map((entry, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'admin' && currentUser?.role === 'admin' && (
            <section className="card admin-panel">
              <h3>Admin Panel</h3>
              <AdminSection
                onUpdateRole={updateUserRole}
                getUsers={getUsers}
                updateUser={updateUser}
              />
            </section>
          )}
        </main>
      </div>

      {/* Notifications */}
      {exportNotification && (
        <div className={`desktop-notification ${exportNotification.type === 'error' ? 'error' : ''}`}>
          <div className="notification-content">
            <div className="notification-icon">🔔</div>
            <div>
              <div style={{fontWeight: 700}}>{exportNotification.type}</div>
              <div>{exportNotification.message}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * AdminSection component (kept inside this file for simplicity).
 * It fetches users via getUsers() provided by AuthContext and shows simple
 * approve / set role UI similar to your original admin area.
 */
function AdminSection({ onUpdateRole, getUsers, updateUser }) {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await getUsers();
        if (cancelled) return;
        setUsers(res || []);
        setPendingUsers((res || []).filter(u => !u.isActive));
      } catch (err) {
        console.warn('Failed to load users', err);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [getUsers]);

  async function approveUser(email) {
    try {
      await updateUser(email, { isActive: true, role: 'employee' });
      setUsers(prev => prev.map(u => u.email === email ? { ...u, isActive: true } : u));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="admin-section">
      <h4>Pending Users ({pendingUsers.length})</h4>
      {pendingUsers.length === 0 ? <div className="no-data">No pending users</div> : (
        <div className="user-grid">
          {pendingUsers.map(user => (
            <div key={user.email} className="user-card pending">
              <div className="user-card-info">
                <h4>{user.firstName} {user.lastName}</h4>
                <p>{user.email}</p>
                <div className="user-actions">
                  <button className="btn-approve" onClick={() => approveUser(user.email)}>Approve</button>
                  <button className="btn-reject" onClick={() => updateUser(user.email, { isActive: false })}>Reject</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
