import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyChFJC-M01SJ-tN4Z_eejnMWWrVabPbrL8",
  authDomain: "school-management-e91b5.firebaseapp.com",
  projectId: "school-management-e91b5",
  storageBucket: "school-management-e91b5.firebasestorage.app",
  messagingSenderId: "645471049170",
  appId: "1:645471049170:web:366439c1fd6a8ee4cd240b",
  measurementId: "G-Q3XWE9JMGM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, analytics };
export default app;