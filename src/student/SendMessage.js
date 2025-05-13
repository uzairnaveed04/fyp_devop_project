// import React, { useState } from 'react';
// import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// import { firestore } from './firebaseConfig';

// const SendMessage = ({ route, navigation }) => {
//   const [message, setMessage] = useState('');
//   const { supervisorId, supervisorEmail } = route.params;
//   const studentId = 'student_123'; // Replace with actual student ID (from auth)

//   const handleSendMessage = async () => {
//     if (!message) {
//       alert('Error', 'Please enter a message.');
//       return;
//     }

//     try {
//       const requestsRef = collection(firestore, 'requests');
//       await addDoc(requestsRef, {
//         studentID: studentId,
//         supervisorID: supervisorId,
//         supervisorEmail: supervisorEmail, // Add supervisor email to the request
//         message: message,
//         status: 'pending',
//         timestamp: serverTimestamp(), // Use serverTimestamp for accurate timing
//       });

//       alert('Success', 'Message sent successfully!');
//       navigation.goBack();
//     } catch (error) {
//       console.error('Error sending message:', error);
//      alert('Error', 'Failed to send message.');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>Send Message to: {supervisorEmail}</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Type your message..."
//         value={message}
//         onChangeText={setMessage}
//         multiline
//       />
//       <Button title="Send Message" onPress={handleSendMessage} />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   header: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//     padding: 10,
//     marginBottom: 20,
//     height: 100,
//     textAlignVertical: 'top',
//   },
// });

// export default SendMessage;