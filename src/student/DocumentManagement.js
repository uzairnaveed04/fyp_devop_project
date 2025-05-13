// import React, { useState, useEffect } from 'react';
// import { View, Text, FlatList, StyleSheet, Button } from 'react-native';
// import { db } from '../firebaseConfig.js';
// import { collection, getDocs, addDoc } from 'firebase/firestore';

// const DocumentScreen = ({ route }) => {
//   const { email } = route.params; // Student email from login/signup
//   const [documents, setDocuments] = useState([]);

//   useEffect(() => {
//     const fetchDocuments = async () => {
//       const querySnapshot = await getDocs(collection(db, 'documents'));
//       const documentsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//       setDocuments(documentsList);
//     };

//     fetchDocuments();
//   }, []);

//   const addDocument = async () => {
//     await addDoc(collection(db, 'documents'), {
//       studentEmail: email,
//       title: "New Document",
//       fileUrl: "https://example.com/new-document.pdf",
//       uploadedAt: new Date(),
//     });
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Document Management</Text>
//       <Button title="Add Document" onPress={addDocument} />
//       <FlatList
//         data={documents}
//         keyExtractor={item => item.id}
//         renderItem={({ item }) => (
//           <View style={styles.documentItem}>
//             <Text style={styles.documentTitle}>{item.title}</Text>
//             <Text>{item.fileUrl}</Text>
//           </View>
//         )}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20 },
//   title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
//   documentItem: { marginBottom: 20, padding: 10, backgroundColor: '#f9f9f9', borderRadius: 5 },
//   documentTitle: { fontSize: 18, fontWeight: 'bold' },
// });

// export default DocumentScreen;