// import React, { useState, useEffect } from 'react';
// import { View, Text, FlatList, StyleSheet, Button, TextInput } from 'react-native';
// import { db } from '../firebaseConfig.js';
// import { collection, getDocs, addDoc } from 'firebase/firestore';

// const ReminderScreen = ({ route }) => {
//   const { email } = route.params; // Student email from login/signup
//   const [reminders, setReminders] = useState([]);
//   const [newReminder, setNewReminder] = useState('');

//   useEffect(() => {
//     const fetchReminders = async () => {
//       const querySnapshot = await getDocs(collection(db, 'reminders'));
//       const remindersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//       setReminders(remindersList);
//     };

//     fetchReminders();
//   }, []);

//   const addReminder = async () => {
//     if (!newReminder) return;

//     await addDoc(collection(db, 'reminders'), {
//       studentEmail: email,
//       reminder: newReminder,
//       timestamp: new Date(),
//     });

//     setNewReminder('');
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Automated Reminder</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Type a reminder"
//         value={newReminder}
//         onChangeText={setNewReminder}
//       />
//       <Button title="Add Reminder" onPress={addReminder} />
//       <FlatList
//         data={reminders}
//         keyExtractor={item => item.id}
//         renderItem={({ item }) => (
//           <View style={styles.reminderItem}>
//             <Text style={styles.reminderText}>{item.reminder}</Text>
//             <Text style={styles.reminderTimestamp}>{item.timestamp.toDate().toString()}</Text>
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
//   reminderItem: { marginBottom: 20, padding: 10, backgroundColor: '#f9f9f9', borderRadius: 5 },
//   reminderText: { fontSize: 16 },
//   reminderTimestamp: { fontSize: 12, color: '#666' },
// });

// export default ReminderScreen;