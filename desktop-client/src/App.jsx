import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';

import Layout from './Layout';
import Login from './Login';
import Register from './Register';

import POS from './pages/POS';
import Orders from './pages/Orders';
import Inventory from './pages/Inventory';

// ✅ --- (NEW) Import the new pages ---
import SalesAnalytics from './pages/SalesAnalytics';
import UserManagement from './pages/UserManagement';
import CreateUser from './pages/CreateUser';


// A protected route component
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<POS />} /> 
          <Route path="orders" element={<Orders />} />
          <Route path="inventory" element={<Inventory />} />

          {/* ✅ --- (NEW) Add new routes here --- */}
          <Route path="sales" element={<SalesAnalytics />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="users/create" element={<CreateUser />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;