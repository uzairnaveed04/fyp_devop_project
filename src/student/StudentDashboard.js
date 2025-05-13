import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
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

const StudentDashboard = ({ navigation }) => {
  const [email, setEmail] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState('light');
  const [pressedButton, setPressedButton] = useState(null);
  
  const theme = THEMES[selectedTheme];

  useEffect(() => {
    const user = getAuth().currentUser;
    if (user) setEmail(user.email);
  }, []);

  const buttons = [
    { title: 'Project Tracking', navigateTo: 'ProjectTracking', icon: 'bar-chart' },
    { title: 'Document Management', navigateTo: 'DocumentManagement', icon: 'document' },
    { title: 'Communication Tool', navigateTo: 'CommunicationTool', icon: 'chatbubbles' },
    { title: 'Prerequisite Subjects', navigateTo: 'PrerequisiteSubjects', icon: 'book' },
    { title: 'Feedback & Evaluation', navigateTo: 'FeedbackEvaluation', icon: 'thumbs-up' },
    { title: 'Task & Reward', navigateTo: 'TaskReward', icon: 'checkbox' },
    { title: 'Automated Reminder', navigateTo: 'AutomatedReminder', icon: 'alarm' },
  ];

  const handleLogout = () => {
    navigation.replace('Login');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerText, { color: theme.primary }]}>Student Portal</Text>
          <Text style={[styles.subHeader, { color: theme.text }]}>
            {email ? `Welcome, ${email.split('@')[0]}` : 'Loading...'}
          </Text>
        </View>

        {/* Dashboard Cards */}
        <View style={styles.cardsContainer}>
          {buttons.map((item, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.9}
              onPressIn={() => setPressedButton(index)}
              onPressOut={() => setPressedButton(null)}
              onPress={() => navigation.navigate(item.navigateTo)}
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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical:35
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

export default StudentDashboard;