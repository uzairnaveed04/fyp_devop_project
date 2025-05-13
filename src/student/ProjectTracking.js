import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { firestore } from '../firebaseConfig.js';
import { collection, query, where, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

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

const ProjectSubmissionScreen = ({ navigation }) => {
  const [selectedTheme, setSelectedTheme] = useState('light');
  const [projects, setProjects] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  const theme = THEMES[selectedTheme];

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      }
    });
    return unsubscribeAuth;
  }, []);

  // Fetch projects assigned to current student
  useEffect(() => {
    if (userEmail) {
      const q = query(
        collection(firestore, 'projects'),
        where('studentEmail', '==', userEmail)
      );
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const projectsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setProjects(projectsData);
          setIsLoading(false);
        },
        (error) => {
          console.error("Error fetching projects:", error);
          showMessage("Failed to load projects");
          setIsLoading(false);
        }
      );
      
      return unsubscribe;
    }
  }, [userEmail]);

  // Fetch submissions by current student
  useEffect(() => {
    if (userEmail) {
      const q = query(
        collection(firestore, 'projectSubmissions'),
        where('studentEmail', '==', userEmail)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          setSubmissions(snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })));
        },
        (error) => {
          console.error("Error fetching submissions:", error);
          showMessage("Failed to load submissions");
        }
      );

      return unsubscribe;
    }
  }, [userEmail]);

  const showMessage = (message) => {
    setDialogMessage(message);
    setShowDialog(true);
    if (message.includes('successfully')) {
      setTimeout(() => {
        setShowDialog(false);
      }, 3000);
    }
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      showMessage('Please enter your submission message');
      return;
    }

    if (!selectedProject) {
      showMessage('No project selected');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(firestore, 'projectSubmissions'), {
        projectId: selectedProject.id,
        projectName: selectedProject.title,
        message: message.trim(),
        status: 'pending',
        studentEmail: userEmail,
        studentId: getAuth().currentUser?.uid,
        supervisorEmail: selectedProject.supervisorEmail,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setMessage('');
      setShowFormModal(false);
      showMessage('Submission created successfully!');
    } catch (error) {
      console.error('Submission error:', error);
      showMessage(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#28a745';
      case 'rejected': return '#dc3545';
      default: return '#FFA500';
    }
  };

  const renderProjectItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.projectCard, { backgroundColor: theme.card }]}
      onPress={() => {
        setSelectedProject(item);
        setShowFormModal(true);
      }}
    >
      <View style={styles.projectHeader}>
        <Ionicons name="document-text" size={20} color={theme.primary} />
        <Text style={[styles.projectTitle, { color: theme.text }]}>
          {item.title}
        </Text>
      </View>
      <Text style={[styles.projectDescription, { color: theme.text }]}>
        {item.description || 'No description available'}
      </Text>
      <View style={styles.projectFooter}>
        <Text style={[styles.projectDeadline, { color: theme.primary }]}>
          Deadline: {item.deadline}
        </Text>
        <Text style={[styles.projectStatus, { color: getStatusColor(item.status) }]}>
          Status: {item.status}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderSubmissionItem = ({ item }) => (
    <View style={[
      styles.submissionCard, 
      { 
        backgroundColor: theme.card,
        borderLeftWidth: 4,
        borderLeftColor: getStatusColor(item.status)
      }
    ]}>
      <View style={styles.submissionHeader}>
        <Ionicons 
          name={item.status === 'approved' ? 'checkmark-circle' : 
                item.status === 'rejected' ? 'close-circle' : 'time'}
          size={20}
          color={getStatusColor(item.status)}
        />
        <Text style={[styles.submissionTitle, { color: theme.text }]}>{item.projectName}</Text>
      </View>
      <Text style={[styles.submissionMessage, { color: theme.text }]}>{item.message}</Text>
      <View style={styles.submissionFooter}>
        <Text style={[styles.submissionStatus, { color: getStatusColor(item.status) }]}>
          Status: {item.status || 'pending'}
        </Text>
        <Text style={[styles.submissionDate, { color: theme.text }]}>
          {item.createdAt?.toDate?.().toLocaleDateString() || 'Unknown date'}
        </Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading your projects...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerText, { color: theme.primary }]}>Project Submissions</Text>
            <View style={styles.themeSelector}>
              {Object.keys(THEMES).map((themeName) => (
                <TouchableOpacity
                  key={themeName}
                  style={[
                    styles.themeButton,
                    { 
                      backgroundColor: THEMES[themeName].primary,
                      borderColor: selectedTheme === themeName ? theme.text : 'transparent',
                      transform: [{ scale: selectedTheme === themeName ? 1.1 : 1 }],
                    }
                  ]}
                  onPress={() => setSelectedTheme(themeName)}
                />
              ))}
            </View>
          </View>

          {/* Available Projects Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Projects</Text>
            
            {projects.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="folder-open" size={48} color={theme.primary} />
                <Text style={[styles.emptyText, { color: theme.text }]}>No projects assigned to you</Text>
              </View>
            ) : (
              <FlatList
                data={projects}
                scrollEnabled={false}
                renderItem={renderProjectItem}
                keyExtractor={item => item.id}
              />
            )}
          </View>

          {/* All Submissions Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Submissions</Text>
            
            {submissions.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-done" size={48} color={theme.primary} />
                <Text style={[styles.emptyText, { color: theme.text }]}>No submissions yet</Text>
              </View>
            ) : (
              <FlatList
                data={submissions}
                scrollEnabled={false}
                keyExtractor={item => item.id}
                renderItem={renderSubmissionItem}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Submission Form Modal */}
      <Modal
        visible={showFormModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFormModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              New Submission for: {selectedProject?.title || 'Project'}
            </Text>
            <TextInput
              style={[
                styles.input, 
                styles.multilineInput,
                { 
                  backgroundColor: theme.background,
                  borderColor: theme.primary,
                  color: theme.text
                }
              ]}
              placeholder="Describe your submission..."
              placeholderTextColor={theme.text + '99'}
              multiline
              numberOfLines={4}
              value={message}
              onChangeText={setMessage}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: theme.secondary }]}
                onPress={() => {
                  setShowFormModal(false);
                  setMessage('');
                }}
              >
                <Text style={{ color: '#fff' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: theme.primary }]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff' }}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Dialog Message Modal */}
      <Modal
        visible={showDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDialog(false)}
      >
        <View style={styles.dialogOverlay}>
          <View style={[styles.dialogBox, { backgroundColor: theme.card }]}>
            <Text style={{ color: theme.text }}>{dialogMessage}</Text>
            {!dialogMessage.includes('successfully') && (
              <TouchableOpacity
                onPress={() => setShowDialog(false)}
                style={[styles.closeDialogButton, { backgroundColor: theme.primary }]}
              >
                <Text style={{ color: '#fff' }}>Close</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },
  scrollContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginVertical: 30,
    textAlign: "center"
  },
  themeSelector: {
    flexDirection: 'row',
    gap: 15,
    textAlign: "center",
    justifyContent: 'center',
  },
  themeButton: {
    width: 28,
    height: 28,
    borderRadius: 15,
    borderWidth: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  projectCard: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 5,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  projectDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  projectDeadline: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  projectStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  submissionCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  submissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  submissionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  submissionMessage: {
    fontSize: 14,
    marginBottom: 6,
  },
  submissionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  submissionStatus: {
    fontSize: 13,
    fontWeight: '500',
  },
  submissionDate: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    marginVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    marginBottom: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  submitButton: {
    flex: 1,
    marginLeft: 10,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  dialogOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000088',
    padding: 16,
  },
  dialogBox: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  closeDialogButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
});

export default ProjectSubmissionScreen;