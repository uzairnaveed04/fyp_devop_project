
// Import Firebase modules
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth'; // Removed getAuth
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCkdcyDoT33S_zxB2HrfZWXBHYRvGkuXMw",
  authDomain: "mesupervisme.firebaseapp.com",
  projectId: "mesupervisme",
  storageBucket: "mesupervisme.appspot.com", // Corrected storageBucket URL
  messagingSenderId: "230702471270",
  appId: "1:230702471270:android:42bdcb147c16c1cecf35a7",
  measurementId: "G-XXXXXXXXXX", // If not using Analytics, remove it
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with persistence
const auth = initializeAuth(app, {
  // persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firebase Services
const firestore = getFirestore(app);
const storage = getStorage(app);

// Export Firebase Services
export { app, auth, firestore, storage, collection, addDoc, serverTimestamp };
