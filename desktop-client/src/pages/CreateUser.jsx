// src/pages/CreateUser.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import "../assets/styles/create-user.css";

export default function CreateUser() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "", // ✅ ADDED
    role: "Employee",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      const displayName = `${formData.firstName} ${formData.lastName}`;
      await updateProfile(user, { displayName });

      // ✅ ADDED contactNumber to the user document
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: displayName,
        email: formData.email,
        contactNumber: formData.contactNumber,
        role: formData.role,
        createdAt: serverTimestamp(),
        status: "active",
      });

      setSuccess("User created successfully! Redirecting...");
      setTimeout(() => navigate("/user-management"), 2000);

    } catch (err) {
      console.error("Error creating user:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email address is already in use.");
      } else {
        setError("Failed to create user. Please try again.");
      }
    }
  };

  return (
    <div className="create-user-card">
      <div className="create-user-header">
        <h2>Create a New User Account</h2>
        <p>Fill out the details below to add a new member to the team.</p>
      </div>

      {error && <p className="auth-error">{error}</p>}
      {success && <p className="auth-success">{success}</p>}

      <form onSubmit={handleSubmit} className="create-user-form">
        <div className="name-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              type="text"
              name="firstName"
              placeholder="e.g., John"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              type="text"
              name="lastName"
              placeholder="e.g., Doe"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="e.g., john.doe@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        {/* ✅ ADDED Contact Number Input */}
        <div className="form-group">
          <label htmlFor="contactNumber">Contact Number</label>
          <input
            id="contactNumber"
            type="tel"
            name="contactNumber"
            placeholder="e.g., 09171234567"
            value={formData.contactNumber}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="role">User Role</label>
          <select id="role" name="role" value={formData.role} onChange={handleChange}>
            <option value="Employee">Employee</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <div className="name-row">
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Min. 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button type="submit" className="create-user-button">
          Create User
        </button>
      </form>
    </div>
  );
}