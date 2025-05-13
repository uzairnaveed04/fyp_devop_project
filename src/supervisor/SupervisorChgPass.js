import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { firestore } from '../firebaseConfig.js';
import { doc, updateDoc } from 'firebase/firestore';

const SupervisorChangePassword = ({ route, navigation }) => {
  const { email } = route.params || {}; 
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
     alert('Error', 'Please enter a new password and confirm it.');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Error', 'Passwords do not match.');
      return;
    }

    try {
      const supervisorRef = doc(firestore, 'supervisors', email);
      await updateDoc(supervisorRef, { password: newPassword });

     alert('Success', 'Password changed successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating password:', error);
    alert('Error', `Failed to update password: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Password</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter new password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        placeholderTextColor="#888"
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm new password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholderTextColor="#888"
      />

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleChangePassword} 
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F4F6F9',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 3, 
    marginBottom: 20,
    fontSize: 16,
    color: '#333',
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: '#007BFF',
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SupervisorChangePassword;
