import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SupervisorDocumentManagement = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Document Management Module</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default SupervisorDocumentManagement;
