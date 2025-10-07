import React from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Inventory from "./pages/Inventory.jsx";
import SalesAnalytics from "./pages/SalesAnalytics.jsx";
import PurchaseHistory from "./pages/PurchaseHistory.jsx";
import StockLogs from "./pages/StockLogs.jsx";
import Login from "./Login.jsx";
import Register from "./Register.jsx";

function App() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      <Sidebar logout={logout} />
      <div className="main-view">
        <Routes>
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/analytics" element={<SalesAnalytics />} />
          <Route path="/history" element={<PurchaseHistory />} />
          <Route path="/logs" element={<StockLogs />} />
          <Route path="*" element={<Navigate to="/inventory" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function Sidebar({ logout }) {
  const location = useLocation();

  const menuItems = [
    { name: "Inventory", path: "/inventory", icon: "📋" },
    { name: "Sales Analytics", path: "/analytics", icon: "📊" },
    { name: "Purchase History", path: "/history", icon: "🧾" },
    { name: "Stock Logs", path: "/logs", icon: "📦" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-logo">🟡 Tiger M</span>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${location.pathname === item.path ? "active" : ""}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-text">{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button onClick={logout} className="logout-btn">
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}

export default App;
