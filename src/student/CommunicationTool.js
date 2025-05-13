import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { firestore } from "../firebaseConfig.js";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  writeBatch,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Ionicons } from '@expo/vector-icons';

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

const CommunicationTool = ({ navigation }) => {
  const [selectedTheme, setSelectedTheme] = useState('light');
  const [supervisors, setSupervisors] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [message, setMessage] = useState("");
  const [studentId, setStudentId] = useState(null);
  const [sentMessages, setSentMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogTitle, setDialogTitle] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
  const [unsubscribeList, setUnsubscribeList] = useState([]);

  const theme = THEMES[selectedTheme];

  useEffect(() => {
    fetchSupervisors();
    fetchLoggedInStudent();
    return () => {
      unsubscribeList.forEach((unsub) => unsub && unsub());
    };
  }, []);

  const fetchSupervisors = async () => {
    try {
      const snapshot = await getDocs(collection(firestore, "supervisors"));
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        email: doc.data().email,
      }));
      setSupervisors(list);
    } catch (err) {
      console.log("Error fetching supervisors:", err);
      setDialogTitle("Error");
      setDialogMessage("Failed to fetch supervisors. Please try again.");
      setShowDialog(true);
    }
  };

  const fetchLoggedInStudent = () => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setStudentId(user.email);
        fetchSentMessages(user.email);
        fetchUnreadMessages(user.email);
      }
    });
  };

  const fetchSentMessages = (email) => {
    const q = query(collection(firestore, "messages"), where("senderId", "==", email));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSentMessages(data);
      setLoading(false);
    });
    setUnsubscribeList((prev) => [...prev, unsub]);
  };

  const fetchUnreadMessages = (studentEmail) => {
    const unsubscribes = supervisors.map((supervisor) => {
      const ref = collection(firestore, "chatss", `${studentEmail}_${supervisor.email}`, "messages");
      const q = query(ref, where("senderId", "==", supervisor.email), where("read", "==", false));
      const unsub = onSnapshot(q, (snap) => {
        setUnreadCounts((prev) => ({
          ...prev,
          [supervisor.email]: snap.size,
        }));
      });
      return unsub;
    });
    setUnsubscribeList((prev) => [...prev, ...unsubscribes]);
  };

  const sendMessage = async () => {
    if (!selectedSupervisor || !message.trim()) {
      setDialogTitle("Notice");
      setDialogMessage("Please select a supervisor and type a message.");
      setShowDialog(true);
      return;
    }
    if (!studentId) {
      setDialogTitle("Notice");
      setDialogMessage("Please login to send a message.");
      setShowDialog(true);
      return;
    }
    try {
      await addDoc(collection(firestore, "messages"), {
        message,
        senderId: studentId,
        receiverId: selectedSupervisor,
        createdAt: serverTimestamp(),
        status: "Pending",
      });
      setMessage("");
      setDialogTitle("Success");
      setDialogMessage("Message sent successfully!");
      setShowDialog(true);
    } catch (err) {
      console.error("Message send error:", err);
      setDialogTitle("Error");
      setDialogMessage("Failed to send message. Please try again.");
      setShowDialog(true);
    }
  };

  const clearMessages = async () => {
    if (sentMessages.length === 0) {
      setDialogTitle("Notice");
      setDialogMessage("No messages to clear.");
      setShowDialog(true);
      return;
    }

    setDialogTitle("Confirm Clear");
    setDialogMessage("Are you sure you want to clear all sent messages?");
    setShowConfirmDialog(true);
  };

  const handleConfirmClear = async () => {
    setShowConfirmDialog(false);
    try {
      const batch = writeBatch(firestore);
      const q = query(collection(firestore, "messages"), where("senderId", "==", studentId));
      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      setDialogTitle("Success");
      setDialogMessage("All messages cleared successfully!");
      setShowDialog(true);
    } catch (error) {
      console.error("Error clearing messages:", error);
      setDialogTitle("Error");
      setDialogMessage("Error clearing messages. Please try again.");
      setShowDialog(true);
    }
  };

  const goToChat = (supervisorEmail) => {
    navigation.navigate("ChatsScreen", {
      supervisorId: supervisorEmail,
      studentId,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#FFA500";
      case "Approved":
        return "#28a745";
      case "Rejected":
        return "#dc3545";
      default:
        return theme.text;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={[styles.headerText, { color: theme.primary }]}>Communication Tool</Text>
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

          <Text style={[styles.label, { color: theme.text }]}>Select a Supervisor:</Text>
          <FlatList
            data={supervisors}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.supervisorItem,
                  { 
                    backgroundColor: theme.card,
                    borderRadius: 20, // Increased border radius
                    borderWidth: 1,
                    borderColor: theme.primary + '30' // Semi-transparent border
                  },
                  selectedSupervisor === item.email && {
                    borderWidth: 2,
                    borderColor: theme.primary
                  }
                ]}
                onPress={() => setSelectedSupervisor(item.email)}
              >
                <Text style={[styles.supervisorText, { color: theme.text }]}>{item.email}</Text>
                {unreadCounts[item.email] > 0 && (
                  <View style={[styles.notificationBadge, { backgroundColor: theme.primary }]}>
                    <Text style={styles.notificationText}>{unreadCounts[item.email]}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          />

          {selectedSupervisor && (
            <View style={styles.messageSection}>
              <Text style={[styles.label, { color: theme.text }]}>Message for {selectedSupervisor}:</Text>
              <TextInput
                placeholder="Type your message here..."
                placeholderTextColor="#888"
                value={message}
                onChangeText={setMessage}
                style={[
                  styles.messageInput,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.primary,
                    color: theme.text,
                    borderRadius: 10 // Increased border radius
                  }
                ]}
                multiline
              />
              <TouchableOpacity
                onPress={sendMessage}
                style={[styles.sendButton, { 
                  backgroundColor: theme.primary,
                  borderRadius: 12 // Increased border radius
                }]}
              >
                <Ionicons name="send" size={20} color="#FFF" />
                <Text style={styles.sendButtonText}>Send Message</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.sentMessagesHeader}>
            <Text style={[styles.label, { color: theme.text }]}>Sent Messages:</Text>
            {sentMessages.length > 0 && (
              <TouchableOpacity 
                onPress={clearMessages}
                style={[styles.clearButton, { 
                  backgroundColor: theme.primary,
                  borderRadius: 12 // Increased border radius
                }]}
              >
                <Ionicons name="trash" size={16} color="#FFF" />
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
          ) : sentMessages.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="mail-open" size={48} color={theme.primary} />
              <Text style={[styles.noMessages, { color: theme.text }]}>No messages sent yet</Text>
            </View>
          ) : (
            sentMessages.map((item) => (
              <View key={item.id} style={[styles.messageCard, { 
                backgroundColor: theme.card,
                borderRadius: 10 // Increased border radius
              }]}>
                <Text style={[styles.messageTo, { color: theme.text }]}>To: {item.receiverId}</Text>
                <Text style={[styles.messageText, { color: theme.text }]}>{item.message}</Text>
                <Text style={[styles.messageStatus, { color: getStatusColor(item.status) }]}>
                  Status: {item.status}
                </Text>
                <Text style={[styles.messageDate, { color: theme.text }]}>
                  Sent on: {item.createdAt?.toDate().toLocaleString()}
                </Text>
                {item.status === "Approved" && (
                  <TouchableOpacity
                    onPress={() => goToChat(item.receiverId)}
                    style={[styles.chatButton, { 
                      backgroundColor: theme.secondary,
                      borderRadius: 12 // Increased border radius
                    }]}
                  >
                    <Ionicons name="chatbubble" size={20} color="#FFF" />
                    <Text style={styles.chatButtonText}>Chat with Supervisor</Text>
                    {unreadCounts[item.receiverId] > 0 && (
                      <View style={[styles.chatNotificationBadge, { backgroundColor: theme.primary }]}>
                        <Text style={styles.chatNotificationText}>
                          {unreadCounts[item.receiverId]}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success/Error/Notice Dialog */}
      <Modal
        visible={showDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDialog(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { 
            backgroundColor: theme.card,
            borderRadius: 12 // Increased border radius
          }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {dialogTitle}
            </Text>
            <Text style={[styles.modalMessage, { color: theme.text }]}>
              {dialogMessage}
            </Text>
            <TouchableOpacity
              onPress={() => setShowDialog(false)}
              style={[styles.modalButton, { 
                backgroundColor: theme.primary,
                borderRadius: 12 // Increased border radius
              }]}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Confirmation Dialog */}
      <Modal
        visible={showConfirmDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmDialog(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { 
            backgroundColor: theme.card,
            borderRadius: 12 // Increased border radius
          }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {dialogTitle}
            </Text>
            <Text style={[styles.modalMessage, { color: theme.text }]}>
              {dialogMessage}
            </Text>
            <View style={styles.confirmButtonContainer}>
              <TouchableOpacity
                onPress={() => setShowConfirmDialog(false)}
                style={[styles.confirmButton, { 
                  backgroundColor: '#ccc',
                  borderRadius: 12,
                  marginRight: 10
                }]}
              >
                <Text style={[styles.modalButtonText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmClear}
                style={[styles.confirmButton, { 
                  backgroundColor: theme.primary,
                  borderRadius: 12
                }]}
              >
                <Text style={styles.modalButtonText}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scrollContainer: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 8 , marginVertical:30 },
  headerText: { fontSize: 24, fontWeight: "bold", textAlign: "center" },
  label: { fontSize: 16, marginVertical: 8 }, 
  themeSelector: { 
    flexDirection: "row", 
    justifyContent: "center", 
    marginBottom: 10,
    marginTop: 10 
  },
  themeButton: { 
    width: 28,
    height: 28,
    borderRadius: 16, 
    marginHorizontal: 6, 
    borderWidth: 2 
  },
  supervisorItem: {
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    
  },
  supervisorText: { fontSize: 16 },
  notificationBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12
  },
  notificationText: { 
    color: "#fff", 
    fontSize: 12,
    fontWeight: 'bold' 
  },
  messageSection: { marginTop: 16 },
  messageInput: {
    borderWidth: 1,
    padding: 5,
    fontSize: 16,
    minHeight: 60,
    marginBottom: 12
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  sendButtonText: { 
    color: "#FFF", 
    fontWeight: "bold", 
    marginLeft: 8,
    fontSize: 16 
  },
  sentMessagesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clearButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 5,
    fontSize: 14
  },
  loader: { marginTop: 20 },
  emptyState: { 
    alignItems: "center", 
    marginTop: 30,
    padding: 20 
  },
  noMessages: { 
    fontSize: 16, 
    marginTop: 10 
  },
  messageCard: {
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageTo: { 
    fontWeight: "bold",
    fontSize: 16 
  },
  messageText: { 
    marginVertical: 8,
    fontSize: 14,
    lineHeight: 20 
  },
  messageStatus: { 
    fontStyle: "italic",
    fontWeight: 'bold',
    marginTop: 5 
  },
  messageDate: { 
    fontSize: 12, 
    marginTop: 5 
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    marginTop: 10
  },
  chatButtonText: { 
    color: "#FFF", 
    fontWeight: "bold", 
    marginLeft: 6,
    fontSize: 14 
  },
  chatNotificationBadge: {
    marginLeft: 8,
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2
  },
  chatNotificationText: { 
    color: "#fff", 
    fontSize: 10,
    fontWeight: 'bold' 
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center"
  },
  modalContainer: {
    padding: 25,
    width: '80%',
    alignItems: "center"
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    marginBottom: 10 
  },
  modalMessage: { 
    fontSize: 16, 
    marginBottom: 20, 
    textAlign: "center" 
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center'
  },
  modalButtonText: { 
    color: "#FFF", 
    fontWeight: "bold" 
  },
  confirmButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center'
  }
});

export default CommunicationTool;