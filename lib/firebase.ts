import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// Your Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBEg5Am28BsJ95j5Mzoujk0Tw-l0Lth9uY",
  authDomain: "lingkod-ph-snphs.firebaseapp.com",
  projectId: "lingkod-ph-snphs",
  storageBucket: "lingkod-ph-snphs.firebasestorage.app",
  messagingSenderId: "34924082188",
  appId: "1:34924082188:web:c6aa43d7ef5fbc019daa29"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
// Note: The AsyncStorage warning is informational and won't affect functionality
// Auth state will persist during the app session but not between app restarts
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
export default app;
