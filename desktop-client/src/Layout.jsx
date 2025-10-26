import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './assets/styles/sidebar.css';
import './assets/styles/global.css';

const Layout = () => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <div className="layout-container">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h3>Milk Tea POS</h3>
          <p>Welcome, {currentUser?.email}</p>
        </div>
        
        <ul className="sidebar-menu">
          <li><NavLink to="/">POS</NavLink></li>
          <li><NavLink to="/orders">Order History</NavLink></li>
          <li><NavLink to="/inventory">Inventory</NavLink></li>
          
          {/* ✅ --- (NEW) Links added back --- */}
          <li><NavLink to="/sales">Sales Analytics</NavLink></li>
          <li><NavLink to="/users">User Management</NavLink></li>
          
          {/* We will add Stock Logs & Purchase History later */}
        </ul>
        
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            Log Out
          </button>
        </div>
      </nav>
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;