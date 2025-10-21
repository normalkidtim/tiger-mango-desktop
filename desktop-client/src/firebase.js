// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// 🔑 Your Firebase config (same as mobile/web)
const firebaseConfig = {
  apiKey: "AIzaSyAMqdQMw5xNo_JyVP453x13_gGcxvPZdnc",
  authDomain: "tiger-mango.firebaseapp.com",
  projectId: "tiger-mango",
  storageBucket: "tiger-mango.firebasestorage.app",
  messagingSenderId: "468721196593",
  appId: "1:468721196593:web:7fb67ce445f4fe639fbf10",
  measurementId: "G-VTDXVZ5V0B"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Export Firestore and Auth services
export const auth = getAuth(app);
export const db = getFirestore(app);