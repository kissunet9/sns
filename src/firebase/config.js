import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const rawApiKey = import.meta.env.VITE_FIREBASE_API_KEY || "";
const rawAppId = import.meta.env.VITE_FIREBASE_APP_ID || "";
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || "";

// Validate if API Key & App ID are valid real Firebase credentials
const isValidKey = rawApiKey && 
  !rawApiKey.includes("YOUR_API_KEY") && 
  rawApiKey.length > 25;

const isValidAppId = rawAppId && 
  rawAppId.startsWith("1:") && 
  !rawAppId.includes("dev_app");

export const isFirebaseConfigured = Boolean(isValidKey && isValidAppId && projectId);

const firebaseConfig = {
  apiKey: rawApiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
  projectId: projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: rawAppId
};

let app;
let auth;
let db;
let storage;
let googleProvider;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    googleProvider = new GoogleAuthProvider();
    // Force Google OAuth to show Account Selector
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (e) {
    console.warn("Firebase Init failed, falling back to Demo Mode:", e);
  }
} else {
  console.info("⚡ Running in Demo / Mock Mode. To enable real Firebase, fill in valid .env variables.");
}

export { app, auth, db, storage, googleProvider };
