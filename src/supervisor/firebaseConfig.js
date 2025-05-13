// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCkdcyDoT33S_zxB2HrfZWXBHYRvGkuXMw",
  authDomain: "mesupervisme.firebaseapp.com",
  projectId: "mesupervisme",
  storageBucket: "mesupervisme.appspot.com",
  messagingSenderId: "230702471270",
  appId: "1:230702471270:android:42bdcb147c16c1cecf35a7",
  measurementId: "G-XXXXXXXXXX",
};

// Initialize Firebase App and Services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export Services
export { app, auth, db, storage };
