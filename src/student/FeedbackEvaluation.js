// import React, { useState, useEffect } from 'react';
// import { View, Text, FlatList, StyleSheet, Button, TextInput } from 'react-native';
// import { db } from '../firebaseConfig.js';
// import { collection, getDocs, addDoc } from 'firebase/firestore';

// const FeedbackScreen = ({ route }) => {
//   const { email } = route.params; // Student email from login/signup
//   const [feedbacks, setFeedbacks] = useState([]);
//   const [newFeedback, setNewFeedback] = useState('');

//   useEffect(() => {
//     const fetchFeedbacks = async () => {
//       const querySnapshot = await getDocs(collection(db, 'feedbacks'));
//       const feedbacksList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//       setFeedbacks(feedbacksList);
//     };

//     fetchFeedbacks();
//   }, []);

//   const addFeedback = async () => {
//     if (!newFeedback) return;

//     await addDoc(collection(db, 'feedbacks'), {
//       studentEmail: email,
//       feedback: newFeedback,
//       timestamp: new Date(),
//     });

//     setNewFeedback('');
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Feedback & Evaluation</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Type your feedback"
//         value={newFeedback}
//         onChangeText={setNewFeedback}
//       />
//       <Button title="Add Feedback" onPress={addFeedback} />
//       <FlatList
//         data={feedbacks}
//         keyExtractor={item => item.id}
//         renderItem={({ item }) => (
//           <View style={styles.feedbackItem}>
//             <Text style={styles.feedbackText}>{item.feedback}</Text>
//             <Text style={styles.feedbackTimestamp}>{item.timestamp.toDate().toString()}</Text>
//           </View>
//         )}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20 },
//   title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
//   input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 10 },
//   feedbackItem: { marginBottom: 20, padding: 10, backgroundColor: '#f9f9f9', borderRadius: 5 },
//   feedbackText: { fontSize: 16 },
//   feedbackTimestamp: { fontSize: 12, color: '#666' },
// });

// export default FeedbackScreen;