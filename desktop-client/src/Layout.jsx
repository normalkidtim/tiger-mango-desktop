import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import {
  FiGrid, FiShoppingCart, FiBarChart2, FiFileText,
  FiUsers, FiUserPlus, FiLogOut
} from "react-icons/fi";

export default function Layout() {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo-circle"></div>
          <h2 className="sidebar-title">Tiger Mango</h2>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" className="sidebar-link"><FiGrid /> Inventory</NavLink>
          <NavLink to="/purchase-history" className="sidebar-link"><FiShoppingCart /> Purchase History</NavLink>
          <NavLink to="/sales-analytics" className="sidebar-link"><FiBarChart2 /> Sales Analytics</NavLink>
          <NavLink to="/stock-logs" className="sidebar-link"><FiFileText /> Stock Logs</NavLink>
          <NavLink to="/user-management" className="sidebar-link"><FiUsers /> User Management</NavLink>
          <NavLink to="/create-user" className="sidebar-link"><FiUserPlus /> Create User</NavLink>
        </nav>
        <div className="sidebar-bottom">
          {currentUser && (
            <p className="sidebar-user">{currentUser.displayName || currentUser.email}</p>
          )}
          <button onClick={handleLogout} className="logout-btn">
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}