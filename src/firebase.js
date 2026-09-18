// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration (Firebase console se copy karein)
const firebaseConfig = {
apiKey: "AIzaSyDbvQEPBdvs3ztSVkKeUr5QlpzQ8qKJ4yQ",
  authDomain: "kabbadi-6bb9d.firebaseapp.com",
  projectId: "kabbadi-6bb9d",
  storageBucket: "kabbadi-6bb9d.firebasestorage.app",
  messagingSenderId: "686958078922",
  appId: "1:686958078922:web:56056fba3d1df9c6237d33",
  measurementId: "G-F9EBYYDP17"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export default app;