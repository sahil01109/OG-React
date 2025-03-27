// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAp_XAPJB9VsJYAfBoCNVdOgOEB56AWqVI",
  authDomain: "testoxy-66dd0.firebaseapp.com",
  projectId: "testoxy-66dd0",
  storageBucket: "testoxy-66dd0.firebasestorage.app",
  messagingSenderId: "799494006380",
  appId: "1:799494006380:web:43746695fb631450c89a49",
  measurementId: "G-SZ3WT5EP53"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
export const auth = getAuth(app);