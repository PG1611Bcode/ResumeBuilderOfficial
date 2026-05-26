import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

// Use your provided Firebase Client SDK config block
const firebaseConfig = {
  apiKey: "AIzaSyBAYgJg-nyilgMjW7wXKa2Q9RIVCJ6Qjio",
  authDomain: "resume-builder-6b2bc.firebaseapp.com",
  projectId: "resume-builder-6b2bc",
  storageBucket: "resume-builder-6b2bc.firebasestorage.app",
  messagingSenderId: "361585388386",
  appId: "1:361585388386:web:bf88e695a3c0f749b5da3b",
  measurementId: "G-FFNZ7GGQ4M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
