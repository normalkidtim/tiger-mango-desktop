import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/tables.css';
import '../assets/styles/user-management.css';

const UserManagement = () => {
  const navigate = useNavigate();

  // NOTE: Listing users requires a Firebase Admin SDK on a backend.
  // We cannot securely list all users from the client.
  // For now, we will show a placeholder.
  
  const handleCreateUser = () => {
    navigate('/users/create');
  };

  return (
    <div className="page-container">
      <div className="user-header">
        <div>
          <h2>User Management</h2>
          <p>Create and manage user accounts for your staff.</p>
        </div>
        <button className="create-user-btn" onClick={handleCreateUser}>
          + Create New User
        </button>
      </div>

      <div className="table-box">
        <h3>All Users</h3>
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* This section is a placeholder. Listing users securely 
              requires a backend function. 
            */}
            <tr>
              <td colSpan="3" className="no-data">
                User listing is not available directly from the client.
                <br />
                Please use the Firebase Authentication console to see all users.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;