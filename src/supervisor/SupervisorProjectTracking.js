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
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  updateDoc,
  doc,
  onSnapshot,
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';

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
  },
};

const SupervisorProjectTracking = ({ navigation }) => {
  const [selectedTheme, setSelectedTheme] = useState('light');
  const [projectList, setProjectList] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogTitle, setDialogTitle] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [showConfirmClear, setShowConfirmClear] = useState(false); // For the clear all dialog

  const theme = THEMES[selectedTheme];

  useEffect(() => {
    const q = query(collection(firestore, 'projects'));
    const unsubscribeProjects = onSnapshot(q, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    });

    return () => unsubscribeProjects();
  }, []);

  const addProject = async () => {
    const projectTitles = projectList.split('\n').map(title => title.trim()).filter(Boolean);

    if (projectTitles.length === 0) {
      showMessage('Notice', 'Please enter at least one project title');
      return;
    }
    if (!description) {
      showMessage('Notice', 'Please enter a project description');
      return;
    }
    if (!deadline) {
      showMessage('Notice', 'Please enter a deadline');
      return;
    }
    if (!studentEmail) {
      showMessage('Notice', 'Please enter student email');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(studentEmail)) {
      showMessage('Notice', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      for (let title of projectTitles) {
        await addDoc(collection(firestore, 'projects'), {
          title,
          description,
          deadline,
          status: 'open',
          studentEmail: studentEmail,
          supervisorEmail: getAuth().currentUser?.email,
          createdAt: serverTimestamp(),
        });
      }
      showMessage('Success', 'Projects created and assigned successfully!');
      setProjectList('');
      setDescription('');
      setDeadline('');
      setStudentEmail('');
    } catch (error) {
      console.error('Error adding project:', error);
      showMessage('Error', 'Failed to create projects: ' + error.message);
    }
    setIsLoading(false);
  };

  const showMessage = (title, message) => {
    setDialogTitle(title);
    setDialogMessage(message);
    setShowDialog(true);
  };

  const updateProjectStatus = async (projectId, newStatus) => {
    try {
      await updateDoc(doc(firestore, 'projects', projectId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      showMessage('Success', 'Project status updated successfully');
    } catch (error) {
      console.error('Error updating project:', error);
      showMessage('Error', 'Failed to update project status');
    }
  };

  const clearAllProjects = async () => {
    if (projects.length === 0) {
      showMessage('Notice', 'No projects to clear');
      return;
    }

    try {
      const batch = writeBatch(firestore);
      const q = query(collection(firestore, 'projects'));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      showMessage('Success', 'All projects cleared successfully');
    } catch (error) {
      console.error('Error clearing projects:', error);
      showMessage('Error', 'Failed to clear projects');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#FFA500';
      case 'in-progress': return '#17a2b8';
      case 'completed': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return theme.text;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerText, { color: theme.text }]}>Project Management</Text>
          </View>

          {/* Theme Selector */}
          <View style={styles.themeSelector}>
            {Object.keys(THEMES).map((themeName) => (
              <TouchableOpacity
                key={themeName}
                style={[styles.themeButton, { 
                  backgroundColor: THEMES[themeName].primary,
                  borderColor: selectedTheme === themeName ? theme.text : 'transparent',
                  transform: [{ scale: selectedTheme === themeName ? 1.1 : 1 }] 
                }]}
                onPress={() => setSelectedTheme(themeName)}
              />
            ))}
          </View>

          {/* Create Project Section */}
          <View style={[styles.centeredSection, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Create New Projects</Text>
            <Text style={[styles.label, { color: theme.text }]}>Student Email</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.background,
                  borderColor: theme.primary,
                  color: theme.text
                }
              ]}
              placeholder="Enter student's email"
              placeholderTextColor="#888"
              value={studentEmail}
              onChangeText={setStudentEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={[styles.label, { color: theme.text }]}>Project Titles (one per line)</Text>
            <TextInput
              style={[
                styles.input,
                styles.multilineInput,
                { 
                  backgroundColor: theme.background,
                  borderColor: theme.primary,
                  color: theme.text,
                  textAlign: 'left', 
                  textAlignVertical: 'top', 
                   paddingLeft: 10, 
                }
              ]}
              placeholder="Enter project titles, one per line..."
              placeholderTextColor="#888"
              value={projectList}
              onChangeText={setProjectList}
              multiline
            />
            <Text style={[styles.label, { color: theme.text }]}>Description</Text>
            <TextInput
              style={[
                styles.input,
                styles.multilineInput,
                { 
                  backgroundColor: theme.background,
                  borderColor: theme.primary,
                  color: theme.text,
                  textAlign: 'left', 
                  textAlignVertical: 'top', 
                  paddingLeft: 10, 
                }
              ]}
              placeholder="Enter project description..."
              placeholderTextColor="#888"
              value={description}
              onChangeText={setDescription}
              multiline
            />
            <Text style={[styles.label, { color: theme.text }]}>Deadline</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.background,
                  borderColor: theme.primary,
                  color: theme.text
                }
              ]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#888"
              value={deadline}
              onChangeText={setDeadline}
            />
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.primary }]}
              onPress={addProject}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="add" size={20} color="#FFF" />
                  <Text style={styles.buttonText}>Create Projects</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Clear All Projects Button */}
          {projects.length > 0 && (
            <TouchableOpacity
              style={[styles.clearButton, { backgroundColor: theme.primary }]}
              onPress={() => setShowConfirmClear(true)} // Open confirmation dialog
            >
              <Ionicons name="trash" size={18} color="#FFF" />
              <Text style={styles.buttonText}>Clear All Projects</Text>
            </TouchableOpacity>
          )}

          {/* Projects List Section */}
          <View style={[styles.centeredSection, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>All Projects</Text>
            {projects.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="folder-open" size={48} color={theme.primary} />
                <Text style={[styles.emptyText, { color: theme.text }]}>No projects found</Text>
              </View>
            ) : (
              <FlatList
                data={projects}
                scrollEnabled={false}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <View style={[styles.projectCard, { 
                    backgroundColor: theme.card,
                    borderLeftWidth: 5,
                    borderLeftColor: getStatusColor(item.status)
                  }]}>
                    <Text style={[styles.projectTitle, { color: theme.text }]}>{item.title}</Text>
                    <Text style={[styles.projectDescription, { color: theme.text }]}>{item.description}</Text>
                    <Text style={[styles.projectInfo, { color: theme.text }]}>
                      Assigned to: {item.studentEmail}
                    </Text>
                    <View style={styles.projectFooter}>
                      <Text style={[styles.projectDeadline, { color: theme.primary }]}>
                        Deadline: {item.deadline}
                      </Text>
                      <Text style={[styles.projectStatus, { color: getStatusColor(item.status) }]}>
                        Status: {item.status}
                      </Text>
                    </View>
                    <View style={styles.buttonGroup}>
                      <TouchableOpacity
                        style={[styles.statusButton, { backgroundColor: '#17a2b8' }]}
                        onPress={() => updateProjectStatus(item.id, 'in-progress')}
                      >
                        <Text style={styles.buttonText}>In Progress</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.statusButton, { backgroundColor: '#28a745' }]}
                        onPress={() => updateProjectStatus(item.id, 'completed')}
                      >
                        <Text style={styles.buttonText}>Complete</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.statusButton, { backgroundColor: '#dc3545' }]}
                        onPress={() => updateProjectStatus(item.id, 'cancelled')}
                      >
                        <Text style={styles.buttonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Dialog Box */}
      {showDialog && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={showDialog}
          onRequestClose={() => setShowDialog(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{dialogTitle}</Text>
              <Text style={[styles.modalMessage, { color: theme.text }]}>{dialogMessage}</Text>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                onPress={() => setShowDialog(false)}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Confirmation Modal for Clear All Projects */}
      {showConfirmClear && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={showConfirmClear}
          onRequestClose={() => setShowConfirmClear(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Confirm Clear All Projects</Text>
              <Text style={[styles.modalMessage, { color: theme.text }]}>Are you sure you want to clear all projects? This action cannot be undone.</Text>
              <View style={styles.modalButtonGroup}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: theme.primary }]}
                  onPress={() => setShowConfirmClear(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: '#dc3545' }]}
                  onPress={clearAllProjects}
                >
                  <Text style={styles.modalButtonText}>Clear</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 2,
    marginVertical:30
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  themeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  themeButton: {
    width: 30,
    height: 30,
    borderRadius: 20,
    margin: 5,
  },
  centeredSection: {
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    paddingLeft: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  multilineInput: {
    height: 100,
  },
  primaryButton: {
    width: '100%',
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    flexDirection: 'row',
  },
  buttonText: {
    fontSize: 16,
    color: '#FFF',
    marginLeft: 10,
  },
  clearButton: {
    width: '80%', // reduced from 100%
    height: 45,   // reduced from 45
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 2,
    flexDirection: 'row',
    alignSelf: 'center', // to center it horizontally
  },
  
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
  },
  projectCard: {
    marginVertical: 10,
    padding: 15,
    borderRadius: 5,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  projectDescription: {
    fontSize: 14,
    marginVertical: 5,
  },
  projectInfo: {
    fontSize: 12,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  projectDeadline: {
    fontSize: 12,
  },
  projectStatus: {
    fontSize: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusButton: {
    width: "30%",
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalButton: {
    width: '45%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  modalButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap:10
  },
});

export default SupervisorProjectTracking;
