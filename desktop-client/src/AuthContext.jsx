// src/AuthContext.jsx
import React, { useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";

const AuthContext = React.createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // ✅ Proper logout function
  const logout = async () => {
    try {
      await signOut(auth);
      if (window.electronAPI?.authLogout) {
        window.electronAPI.authLogout();
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const value = {
    currentUser,
    logout, // ✅ make sure it's included here
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
