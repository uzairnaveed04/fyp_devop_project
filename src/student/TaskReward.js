// import React, { useState, useEffect } from 'react';
// import { View, Text, FlatList, StyleSheet, Button, TextInput } from 'react-native';
// import { db } from '../firebaseConfig.js';
// import { collection, getDocs, addDoc } from 'firebase/firestore';

// const TaskScreen = ({ route }) => {
//   const { email } = route.params; // Student email from login/signup
//   const [tasks, setTasks] = useState([]);
//   const [newTask, setNewTask] = useState('');
//   const [newReward, setNewReward] = useState('');

//   useEffect(() => {
//     const fetchTasks = async () => {
//       const querySnapshot = await getDocs(collection(db, 'tasks'));
//       const tasksList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//       setTasks(tasksList);
//     };

//     fetchTasks();
//   }, []);

//   const addTask = async () => {
//     if (!newTask || !newReward) return;

//     await addDoc(collection(db, 'tasks'), {
//       studentEmail: email,
//       task: newTask,
//       reward: newReward,
//       status: "Pending",
//       createdAt: new Date(),
//     });

//     setNewTask('');
//     setNewReward('');
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Task & Reward</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Task"
//         value={newTask}
//         onChangeText={setNewTask}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Reward"
//         value={newReward}
//         onChangeText={setNewReward}
//       />
//       <Button title="Add Task" onPress={addTask} />
//       <FlatList
//         data={tasks}
//         keyExtractor={item => item.id}
//         renderItem={({ item }) => (
//           <View style={styles.taskItem}>
//             <Text style={styles.taskText}>{item.task}</Text>
//             <Text>Reward: {item.reward}</Text>
//             <Text>Status: {item.status}</Text>
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
//   taskItem: { marginBottom: 20, padding: 10, backgroundColor: '#f9f9f9', borderRadius: 5 },
//   taskText: { fontSize: 16, fontWeight: 'bold' },
// });

// export default TaskScreen;