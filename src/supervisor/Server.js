// Server.js
import { db } from './firebaseConfig.js';
import {
  collection,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';

const projectsCollection = collection(db, 'projects');

const testProject = {
  title: 'Test Project',
  description: 'Sample data insert test',
  deadline: '2025-06-01',
  studentEmail: 'student@example.com',
  supervisorEmail: 'supervisor@example.com'
};

const createProject = async (projectData) => {
  try {
    const docRef = await addDoc(projectsCollection, {
      ...projectData,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('✅ Project added with ID:', docRef.id);
  } catch (error) {
    console.error('❌ Failed to add project:', error.message);
  }
};

createProject(testProject);
