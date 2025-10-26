import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import '../assets/styles/create-user.css'; // New CSS file

const CreateUser = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // NOTE: This creates a new user, but you'll need a backend
  // to assign specific "roles" (like Admin vs. Cashier)
  // This form creates a standard user.
  
  const handleCreate = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    const auth = getAuth();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert('User created successfully!');
      navigate('/users');
    } catch (err) {
      setError(err.message);
      console.error("Error creating user:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h2>Create New User</h2>
      <p>Create a new account for a staff member.</p>

      <div className="create-user-form-container">
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cashier@shop.com"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              required
            />
          </div>
          
          {error && <p className="form-error">{error}</p>}
          
          <div className="form-actions">
            <button 
              type="button" 
              className="form-btn-cancel" 
              onClick={() => navigate('/users')}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="form-btn-submit"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;