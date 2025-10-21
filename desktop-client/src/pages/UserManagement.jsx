// src/pages/UserManagement.jsx
import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { FiUsers, FiEdit, FiTrash2 } from "react-icons/fi";
import "../assets/styles/user-management.css";

function EditUserModal({ user, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    contactNumber: user.contactNumber || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const updatedData = {
      ...formData,
      displayName: `${formData.firstName} ${formData.lastName}`
    };
    await onUpdate(updatedData);
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Edit Profile</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>First Name</label>
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Contact Number</label>
            <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} />
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn">Cancel</button>
          <button onClick={handleSave} className="btn btn-gold" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function UserRow({ user, onSelectUser, onDeleteUser }) {
  const [role, setRole] = useState(user.role);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRoleChange = async () => {
    if (role === user.role) return;
    setIsUpdating(true);
    const userDocRef = doc(db, "users", user.uid);
    try {
      await updateDoc(userDocRef, { role: role });
    } catch (error) {
      console.error("Error updating role:", error);
      setRole(user.role);
    }
    setIsUpdating(false);
  };

  return (
    <div className="user-card active">
      <div className="user-info-container">
        <div className="user-info">
          <strong className="user-name">{user.displayName}</strong>
          <span className="user-email">{user.email}</span>
          <span className="user-contact">{user.contactNumber}</span>
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
        <button className="btn-icon edit-btn" onClick={() => onSelectUser(user)}><FiEdit /></button>
        <button className="btn-icon delete-btn" onClick={() => onDeleteUser(user)}><FiTrash2 /></button>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

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

  const handleUpdateUser = async (updatedData) => {
    if (!selectedUser) return;
    const userDocRef = doc(db, "users", selectedUser.uid);
    try {
      await updateDoc(userDocRef, updatedData);
    } catch (error) {
      console.error("Error updating user profile:", error);
    }
  };

  // ✅ --- UPDATED Delete Function ---
  const handleDeleteUser = async (userToDelete) => {
    if (window.confirm(`Are you sure you want to delete "${userToDelete.displayName}"? This action will permanently delete their login and cannot be undone.`)) {
      try {
        // Step 1: Call the backend to delete the user from Firebase Authentication
        if (window.electronAPI?.deleteFirebaseUser) {
          const result = await window.electronAPI.deleteFirebaseUser(userToDelete.uid);
          if (!result.success) {
            throw new Error(result.error || "Failed to delete user from authentication.");
          }
        } else {
          // This provides a fallback warning if not running in Electron
          alert("Error: Delete function is only available in the desktop app.");
          return;
        }

        // Step 2: If successful, delete the user's profile from Firestore
        await deleteDoc(doc(db, "users", userToDelete.uid));

      } catch (error) {
        console.error("Error deleting user:", error);
        alert(`An error occurred while deleting the user: ${error.message}`);
      }
    }
  };

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
          <p className="no-users-text">No users have been created yet.</p>
        ) : (
          users.map((user) => (
            <UserRow 
              key={user.uid} 
              user={user} 
              onSelectUser={setSelectedUser}
              onDeleteUser={handleDeleteUser}
            />
          ))
        )}
      </div>

      {selectedUser && (
        <EditUserModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
          onUpdate={handleUpdateUser}
        />
      )}
    </div>
  );
}