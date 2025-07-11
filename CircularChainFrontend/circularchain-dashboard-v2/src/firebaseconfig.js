// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDru0dQm5hogUv2iSMYIkzxHE8Vxa3rElw",
  authDomain: "circular-chain-6769e.firebaseapp.com",
  projectId: "circular-chain-6769e",
  storageBucket: "circular-chain-6769e.firebasestorage.app",
  messagingSenderId: "769436740555",
  appId: "1:769436740555:web:88f537a12476fdb881a44e",
  measurementId: "G-M66Y37GTBV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with error handling
export const auth = getAuth(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Add additional scopes if needed
googleProvider.addScope('email');
googleProvider.addScope('profile');

export default app;
