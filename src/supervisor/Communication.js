import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { firestore } from "../firebaseConfig.js";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from '@expo/vector-icons';
import { Audio } from "expo-av";

const THEMES = {
  light: {
    primary: '#4A6FA5',
    secondary: '#166088',
    background: '#F8F9FA',
    text: '#333333',
    card: '#FFFFFF',
  },
  dark: {
    primary: '#6A11CB',
    secondary: '#2575FC',
    background: '#121212',
    text: '#FFFFFF',
    card: '#1E1E1E',
  },
  nature: {
    primary: '#2E8B57',
    secondary: '#3CB371',
    background: '#F5FFFA',
    text: '#2F4F4F',
    card: '#FFFFFF',
  },
  professional: {
    primary: '#1A365D',
    secondary: '#2C5282',
    background: '#EDF2F7',
    text: '#2D3748',
    card: '#FFFFFF',
  }
};

const SupervisorMessages = ({ route, navigation }) => {
  const [selectedTheme, setSelectedTheme] = useState('light');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState({});
  const [statusMessage, setStatusMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  
  const supervisorEmail = route.params?.email?.toLowerCase();
  const theme = THEMES[selectedTheme];

  const playSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require("../assets/notification.mp3")
    );
    await sound.playAsync();
  };

  useEffect(() => {
    const messagesRef = collection(firestore, "messages");
    const q = query(messagesRef, where("receiverId", "==", supervisorEmail));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const messagesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const newMessages = messagesData.filter(
        (msg) => !messages.some((m) => m.id === msg.id)
      );

      setNewMessageCount(newMessages.length);

      if (newMessages.length > 0 && !initialLoad) {
        await playSound();
      }

      setMessages(messagesData);
      setLoading(false);

      if (initialLoad) {
        setInitialLoad(false);
      }
    });

    return () => unsubscribe();
  }, [supervisorEmail, messages.length, initialLoad]);

  const handleResponse = async (messageId, status, studentEmail) => {
    try {
      const comment = comments[messageId] || "No comment";
      const messageRef = doc(firestore, "messages", messageId);
      
      await updateDoc(messageRef, {
        status,
        supervisorComment: comment,
      });

      const requestRef = collection(firestore, "requests");
      await addDoc(requestRef, {
        messageId,
        studentEmail,
        supervisorEmail,
        status,
        comment,
        createdAt: serverTimestamp(),
      });

      if (status === "Approved") {
        setSelectedStudent(studentEmail);
        setSelectedMessageId(messageId);
        setShowProjectDialog(true);
      } else {
        setDialogMessage(`Message ${status.toLowerCase()} successfully!`);
        setShowDialog(true);
      }
    } catch (error) {
      console.error("Error:", error);
      setDialogMessage("Error submitting response. Please try again.");
      setShowDialog(true);
    }
  };

  const handleCreateProject = () => {
    setShowProjectDialog(false);
    navigation.navigate("SupervisorProjectTracking", { 
      studentEmail: selectedStudent,
      supervisorEmail,
      messageId: selectedMessageId
    });
  };

  const handleSkipProjectCreation = () => {
    setShowProjectDialog(false);
    setDialogMessage("Request approved successfully! Chat option enabled.");
    setShowDialog(true);
  };

  const clearMessages = async () => {
    try {
      const messagesRef = collection(firestore, "messages");
      const q = query(messagesRef, where("receiverId", "==", supervisorEmail));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.docs.length === 0) {
        setStatusMessage("No messages found to delete.");
        return;
      }

      const batch = writeBatch(firestore);
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      setMessages([]);
      setStatusMessage("All messages cleared successfully!");
      setNewMessageCount(0);
    } catch (error) {
      console.error("Error clearing messages:", error);
      setStatusMessage("Error clearing messages. Please try again.");
    }
  };

  const goToChat = (studentEmail) => {
    navigation.navigate("SChatScreen", {
      studentId: studentEmail,
      supervisorId: supervisorEmail,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={[styles.headerText, { color: theme.primary }]}>Student Messages</Text>
          <View style={styles.iconContainer}>
            <Ionicons name="mail" size={24} color={theme.primary} />
            {newMessageCount > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                <Text style={styles.badgeText}>{newMessageCount}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.themeSelector}>
          {Object.keys(THEMES).map((themeName) => (
            <TouchableOpacity
              key={themeName}
              style={[
                styles.themeButton,
                { 
                  backgroundColor: THEMES[themeName].primary,
                  borderColor: selectedTheme === themeName ? theme.text : 'transparent',
                  transform: [{ scale: selectedTheme === themeName ? 1.1 : 1 }]
                }
              ]}
              onPress={() => setSelectedTheme(themeName)}
            />
          ))}
        </View>

        {statusMessage ? (
          <Text
            style={[
              styles.statusMessage,
              {
                color: statusMessage.includes("Error") ? '#FF3B30' : theme.primary,
              },
            ]}
          >
            {statusMessage}
          </Text>
        ) : null}

        <TouchableOpacity 
          onPress={clearMessages} 
          style={[styles.clearButton, { backgroundColor: theme.primary }]}
        >
          <Ionicons name="trash" size={20} color="#FFF" />
          <Text style={styles.clearButtonText}>Clear All Messages</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} />
        ) : messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done" size={48} color={theme.primary} />
            <Text style={[styles.emptyText, { color: theme.text }]}>No messages found</Text>
          </View>
        ) : (
          <View style={styles.cardsContainer}>
            {messages.map((item) => (
              <View key={item.id} style={[styles.messageCard, { backgroundColor: theme.card }]}>
                <Text style={[styles.messageFrom, { color: theme.text }]}>From: {item.senderId}</Text>
                <Text style={[styles.messageText, { color: theme.text }]}>{item.message}</Text>
                <Text style={[styles.messageStatus, { color: theme.text }]}>
                  Status: {item.status || "Pending"}
                </Text>
                <TextInput
                  style={[styles.commentInput, { 
                    backgroundColor: theme.background,
                    borderColor: theme.primary,
                    color: theme.text 
                  }]}
                  placeholder="Add a comment (optional)"
                  placeholderTextColor="#888"
                  value={comments[item.id] || ""}
                  onChangeText={(text) =>
                    setComments({ ...comments, [item.id]: text })
                  }
                />
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={() => handleResponse(item.id, "Approved", item.senderId)}
                    style={[styles.button, styles.approveButton]}
                  >
                    <Ionicons name="checkmark" size={20} color="#FFF" />
                    <Text style={styles.buttonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleResponse(item.id, "Rejected", item.senderId)}
                    style={[styles.button, styles.rejectButton]}
                  >
                    <Ionicons name="close" size={20} color="#FFF" />
                    <Text style={styles.buttonText}>Reject</Text>
                  </TouchableOpacity>
                  {item.status === "Approved" && (
                    <TouchableOpacity
                      onPress={() => goToChat(item.senderId)}
                      style={[styles.button, styles.chatButton]}
                    >
                      <Ionicons name="chatbubble" size={20} color="#FFF" />
                      <Text style={styles.buttonText}>Chat</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        <Modal
          visible={showDialog}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDialog(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {dialogMessage.includes("Error") ? "Error" : "Success"}
              </Text>
              <Text style={[styles.modalMessage, { color: theme.text }]}>{dialogMessage}</Text>
              <TouchableOpacity 
                onPress={() => setShowDialog(false)} 
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showProjectDialog}
          transparent
          animationType="fade"
          onRequestClose={() => setShowProjectDialog(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Create Project?
              </Text>
              <Text style={[styles.modalMessage, { color: theme.text }]}>
                Do you want to create a project for {selectedStudent}?
              </Text>
              <View style={styles.confirmButtonContainer}>
                <TouchableOpacity
                  onPress={handleSkipProjectCreation}
                  style={[styles.confirmButton, { 
                    backgroundColor: '#ccc',
                    marginRight: 10
                  }]}
                >
                  <Text style={[styles.modalButtonText, { color: theme.text }]}>No</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCreateProject}
                  style={[styles.confirmButton, { 
                    backgroundColor: theme.primary
                  }]}
                >
                  <Text style={styles.modalButtonText}>Yes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 40
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -3,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  themeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  themeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 8,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  statusMessage: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 6,
    borderTopWidth: 2,
    borderTopColor: 'rgba(255,255,255,0.3)',
  },
  clearButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
  },
  cardsContainer: {
    marginBottom: 20,
  },
  messageCard: {
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  messageFrom: {
    fontSize: 16,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 14,
    marginVertical: 8,
    lineHeight: 20,
  },
  messageStatus: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  approveButton: {
    backgroundColor: '#28a745',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
  },
  chatButton: {
    backgroundColor: '#17a2b8',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 5,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    borderRadius: 12,
    padding: 25,
    width: '80%',
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  confirmButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },
  confirmButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center'
  },
});

export default SupervisorMessages;