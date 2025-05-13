import { db } from './firebaseConfig.js'; // Firebase config import karna
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const addRequestToFirestore = async () => {
  try {
    await addDoc(collection(db, 'requests'), {
      projectId: "NSVv571Dq503",
      studentId: "student123",
      supervisorId: "super456",
      message: "I want to work on ML part",
      attachments: [],
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      comments: [],
    });
    console.log("Request added successfully!");
  } catch (error) {
    console.error("Error adding request:", error);
  }
};

// Function ko call karo
addRequestToFirestore();
