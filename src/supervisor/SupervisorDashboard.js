import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { firestore } from '../firebaseConfig.js';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
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

const SupervisorDashboard = ({ route, navigation }) => {
  const [supervisorData, setSupervisorData] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState('light');
  const [pressedButton, setPressedButton] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const theme = THEMES[selectedTheme];
  const email = route.params?.email || getAuth().currentUser?.email;

  useEffect(() => {
    if (!email) {
      alert('Error', 'No email found for supervisor.');
      navigation.navigate('SLogin');
      return;
    }

    const fetchSupervisorData = async () => {
      try {
        const supervisorRef = doc(firestore, 'supervisors', email);
        const docSnap = await getDoc(supervisorRef);

        if (docSnap.exists()) {
          setSupervisorData(docSnap.data());
        } else {
          alert('Error', 'Supervisor not found.');
        }
      } catch (error) {
        console.error('Error fetching supervisor data:', error);
        alert('Error', 'Failed to fetch supervisor data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSupervisorData();
  }, [email]);

  const buttons = [
    { title: 'Project Tracking', screen: 'SupervisorProjectTracking', icon: 'bar-chart' },
    { title: 'Document Management', screen: 'SupervisorDocumentManagement', icon: 'document' },
    { title: 'Communication Tool', screen: 'SupervisorCommunicationTool', icon: 'chatbubbles' },
    { title: 'Feedback & Evaluation', screen: 'SupervisorFeedbackEvaluation', icon: 'thumbs-up' },
    { title: 'Task Management', screen: 'SupervisorTaskManagement', icon: 'list' },
    { title: 'Automated Reminder', screen: 'SupervisorAutomatedReminder', icon: 'alarm' },
    { title: 'Change Password', screen: 'SupervisorChgPass', icon: 'lock' },
  ];

  const handleLogout = () => {
    navigation.replace('SLogin');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerText, { color: theme.primary }]}>Supervisor Portal</Text>
          <Text style={[styles.subHeader, { color: theme.text }]}>
            {supervisorData ? `Welcome, ${supervisorData.email.split('@')[0]}` : 'Loading...'}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginVertical: 20 }} />
        ) : (
          <>
            {/* Dashboard Cards */}
            <View style={styles.cardsContainer}>
              {buttons.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.9}
                  onPressIn={() => setPressedButton(index)}
                  onPressOut={() => setPressedButton(null)}
                  onPress={() => navigation.navigate(item.screen, { email })}
                  style={[
                    styles.card, 
                    { 
                      backgroundColor: theme.card,
                      transform: [{ translateY: pressedButton === index ? 4 : 0 }],
                      shadowColor: theme.primary,
                      shadowOffset: { 
                        width: 0, 
                        height: pressedButton === index ? 2 : 5 
                      },
                    }
                  ]}
                >
                  <View style={styles.cardContent}>
                    <View style={[
                      styles.iconContainer,
                      { backgroundColor: `${theme.primary}20` }
                    ]}>
                      <Ionicons 
                        name={item.icon} 
                        size={20} 
                        color={theme.primary}
                      />
                    </View>
                    <Text style={[styles.cardText, { color: theme.text }]}>
                      {item.title}
                    </Text>
                  </View>
                  <Ionicons 
                    name="chevron-forward" 
                    size={18} 
                    color={theme.secondary} 
                    style={{ opacity: 0.7 }}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Theme Selector */}
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

            {/* 3D Logout Button */}
            <TouchableOpacity 
              activeOpacity={0.8}
              style={[
                styles.logoutButton, 
                { 
                  backgroundColor: theme.primary,
                  shadowColor: theme.secondary,
                  transform: [{ translateY: 3 }]
                }
              ]}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
};

// Use the EXACT same styles as your Student Dashboard
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 35
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subHeader: {
    fontSize: 16,
    marginTop: 5,
    opacity: 0.8,
  },
  cardsContainer: {
    marginBottom: 20,
  },
  card: {
    borderRadius: 50,
    padding: 18,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 8,
    marginRight: 15,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
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
  logoutButton: {
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 15,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 6,
    borderTopWidth: 2,
    borderTopColor: 'rgba(255,255,255,0.3)',
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SupervisorDashboard;