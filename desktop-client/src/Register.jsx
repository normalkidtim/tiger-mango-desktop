import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { app } from "./firebase";
import "./assets/styles/auth.css";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("❌ Passwords do not match.");
      return;
    }

    try {
      const auth = getAuth(app);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      if (displayName.trim() !== "") {
        await updateProfile(userCredential.user, { displayName });
      }

      if (window.electronAPI?.authRegister) {
        window.electronAPI.authRegister(email, password);
      }

      setSuccess("✅ Account created successfully! Redirecting...");
      setTimeout(() => navigate("/inventory"), 1500);
    } catch (err) {
      console.error(err);
      setError(`❌ ${err.message}`);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">🟡 Tiger Mango</h1>
        <h2 className="auth-subtitle">Register</h2>
        {error && <p className="auth-error">{error}</p>}
        {success && <p className="auth-success">{success}</p>}
        <form onSubmit={handleRegister} className="auth-form">
          <input
            type="text"
            placeholder="Display Name (optional)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" className="auth-btn">
            Register
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
