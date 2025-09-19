// firebase-config.js
const API_URL = process.env.REACT_APP_API_URL;
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyDhO4UXmi830hb_TSMCxKYOq7vP9mZ4KS4",
  authDomain: "appointifyotpverification.firebaseapp.com",
  projectId: "appointifyotpverification",
  storageBucket: "appointifyotpverification.firebasestorage.app",
  messagingSenderId: "877698122890",
  appId: "1:877698122890:web:1d657b6d5b886573155973"
};

// Initialize Firebase app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Authentication
const auth = getAuth(app);

// Connect to Firebase Authentication Emulator (only in local environment)
if (window.location.hostname === "103.224.247.28") {
  connectAuthEmulator(auth, "http://103.224.247.28:9090");
}

export { auth };
