// src/Layout.jsx
import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function Layout() {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="app-container" style={{ display: "flex" }}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo-circle"></div>
          <h2 className="sidebar-title">Tiger Mango</h2>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/inventory"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            Inventory
          </NavLink>

          <NavLink
            to="/purchase-history"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            Purchase History
          </NavLink>

          <NavLink
            to="/sales-analytics"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            Sales Analytics
          </NavLink>

          <NavLink
            to="/stock-logs"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            Stock Logs
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          {currentUser && (
            <p className="sidebar-user">{currentUser.email}</p>
          )}
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
