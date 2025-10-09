// src/pages/UserManagement.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { FiUsers } from "react-icons/fi";
import "../assets/styles/user-management.css";

// This is a new component for each user row
function UserRow({ user }) {
  const [role, setRole] = useState(user.role);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRoleChange = async () => {
    if (role === user.role) return; // No change
    setIsUpdating(true);
    const userDocRef = doc(db, "users", user.uid);
    try {
      await updateDoc(userDocRef, { role: role });
      // You can add a success notification here if you like
    } catch (error) {
      console.error("Error updating role:", error);
      setRole(user.role); // Revert on error
    }
    setIsUpdating(false);
  };

  return (
    <div className="user-card active">
      <div className="user-info-container">
        <div className="user-info">
          <strong className="user-name">{user.displayName}</strong>
          <span className="user-email">{user.email}</span>
        </div>
        <span className="role-badge">{user.role}</span>
      </div>
      <div className="role-manager">
        <select value={role} onChange={(e) => setRole(e.target.value)} disabled={isUpdating}>
          <option value="Employee">Employee</option>
          <option value="Admin">Admin</option>
        </select>
        <button className="btn btn-gold" onClick={handleRoleChange} disabled={isUpdating || role === user.role}>
          {isUpdating ? "Saving..." : "Update Role"}
        </button>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ ...doc.data() }));
      setUsers(usersData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <div className="page-header">
        <FiUsers />
        <h2>User Management</h2>
      </div>
      <div className="page-header-underline"></div>
      
      <div className="user-card-section">
        <div className="section-title-container">
          <h3>✅ Created Accounts ({users.length})</h3>
        </div>
        {loading ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <p className="no-users-text">No users have been created through the app yet.</p>
        ) : (
          users.map((user) => <UserRow key={user.uid} user={user} />)
        )}
      </div>
    </div>
  );
}