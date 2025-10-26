// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./Layout.jsx";

// ✅ Correct imports from the pages folder
import Inventory from "./pages/Inventory.jsx";
import PurchaseHistory from "./pages/PurchaseHistory.jsx";
import SalesAnalytics from "./pages/SalesAnalytics.jsx";
import StockLogs from "./pages/StockLogs.jsx";
import UserManagement from "./pages/UserManagement.jsx";
import CreateUser from "./pages/CreateUser.jsx";
import Orders from "./pages/Orders.jsx"; // ✅ --- (1. IMPORT YOUR NEW PAGE) ---
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import { useAuth } from "./AuthContext.jsx";

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes inside Layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/orders" element={<Orders />} /> {/* ✅ --- (2. ADD THIS RULE) --- */}
        <Route path="/purchase-history" element={<PurchaseHistory />} />
        <Route path="/sales-analytics" element={<SalesAnalytics />} />
        <Route path="/stock-logs" element={<StockLogs />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/create-user" element={<CreateUser />} />

      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/inventory" replace />} />
    </Routes>
  );
}