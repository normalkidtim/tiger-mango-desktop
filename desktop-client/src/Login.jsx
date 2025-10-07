import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "./firebase";
import "./assets/styles/auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [welcome, setWelcome] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setWelcome("");

    try {
      const auth = getAuth(app);
      const cred = await signInWithEmailAndPassword(auth, email, password);

      if (window.electronAPI?.authLogin) {
        window.electronAPI.authLogin(email, password);
      }

      setWelcome(`👋 Welcome, ${cred.user.email}`);
      setTimeout(() => navigate("/inventory"), 1200);
    } catch (err) {
      setError("❌ Invalid email or password");
      console.error(err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">🟡 Tiger Mango</h1>
        <h2 className="auth-subtitle">Login</h2>
        {error && <p className="auth-error">{error}</p>}
        {welcome && <p className="auth-success">{welcome}</p>}
        <form onSubmit={handleLogin} className="auth-form">
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
          <button type="submit" className="auth-btn">
            Login
          </button>
        </form>
        <p className="auth-switch">
          Don’t have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}
