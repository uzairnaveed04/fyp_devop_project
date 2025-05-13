import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions
} from 'react-native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { firestore } from '../firebaseConfig.js';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import Modal from 'react-native-modal';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const SupervisorLogin = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState({ title: '', message: '', type: 'error' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1)),
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      })
    ]).start();
  };

  const showModal = (title, message, type = 'error') => {
    setModalMessage({ title, message, type });
    setModalVisible(true);
  };

  const handleLogin = async () => {
    animateButton();
    
    if (!email || !password) {
      showModal('Error', 'Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const supervisorRef = collection(firestore, 'supervisors');
      const q = query(supervisorRef, where('email', '==', email));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        showModal('Error', 'Email not found in Firestore. Access denied.');
        setLoading(false);
        return;
      }

      const supervisorData = snapshot.docs[0].data();
      let storedPassword = supervisorData.password || '123456';

      if (storedPassword === '123456') {
        showModal('Notice', 'You are logged in with the default password. Please change it now.', 'warning');
      }

      setTimeout(() => {
        setLoading(false);
        navigation.replace('SupervisorDashboard', { email });
      }, 1000);

    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      if (error.code === 'auth/wrong-password') {
        showModal('Error', 'Incorrect password. Please try again.');
      } else if (error.code === 'auth/user-not-found') {
        showModal('Error', 'No supervisor found with this email.');
      } else {
        showModal('Error', 'An error occurred. Please try again.');
      }
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword) {
      showModal('Error', 'Please enter a new password.');
      return;
    }

    setLoading(true);

    try {
      const supervisorRef = collection(firestore, 'supervisors');
      const q = query(supervisorRef, where('email', '==', email));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const supervisorDoc = snapshot.docs[0];
        const supervisorDocRef = doc(firestore, 'supervisors', supervisorDoc.id);

        await updateDoc(supervisorDocRef, { password: newPassword });
        showModal('Success', 'Password updated successfully!', 'success');
        setNewPassword('');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      showModal('Error', 'An error occurred while updating the password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://i.pinimg.com/736x/3a/27/81/3a278166cff0c2490ab626f99231b82e.jpg' }}
      style={styles.container}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.4)']}
        style={styles.gradientOverlay}
      >
        <View style={styles.content}>
          <Animated.View style={[
            styles.header,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }] 
            }
          ]}>
            <Text style={styles.title}>Supervisor Login</Text>
          </Animated.View>

          <Animated.View style={[
            styles.inputContainer,
            { opacity: fadeAnim }
          ]}>
            <Ionicons name="mail" size={24} color="#aaa" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="University Email"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </Animated.View>

          <Animated.View style={[
            styles.inputContainer,
            { opacity: fadeAnim }
          ]}>
            <Ionicons name="lock-closed" size={24} color="#aaa" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={showPassword ? "eye-off" : "eye"} 
                size={24} 
                color="#aaa" 
              />
            </TouchableOpacity>
          </Animated.View>

          {loading ? (
            <ActivityIndicator size="large" color="#6C63FF" style={styles.loader} />
          ) : (
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity 
                style={styles.button}
                onPress={handleLogin}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#6C63FF', '#8A63FF']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.buttonText}>Login</Text>
                  <Ionicons name="arrow-forward" size={24} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}

          {newPassword && (
            <Animated.View style={[
              styles.inputContainer,
              { opacity: fadeAnim }
            ]}>
              <Ionicons name="lock-closed" size={24} color="#aaa" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="New Password"
                placeholderTextColor="#aaa"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
            </Animated.View>
          )}

          {newPassword && (
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity 
                style={[styles.button, styles.changePasswordButton]}
                onPress={handlePasswordChange}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Change Password</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </LinearGradient>

      <Modal isVisible={modalVisible} animationIn="zoomIn" animationOut="zoomOut">
        <View style={[
          styles.modalContainer, 
          modalMessage.type === 'success' ? styles.successModal : 
          modalMessage.type === 'warning' ? styles.warningModal : styles.errorModal
        ]}>
          <Ionicons 
            name={
              modalMessage.type === 'success' ? "checkmark-circle" :
              modalMessage.type === 'warning' ? "warning" : "close-circle"
            } 
            size={50} 
            color="#fff" 
            style={styles.modalIcon} 
          />
          <Text style={styles.modalTitle}>{modalMessage.title}</Text>
          <Text style={styles.modalMessage}>{modalMessage.message}</Text>
          <TouchableOpacity 
            style={styles.modalButton} 
            onPress={() => setModalVisible(false)}
            activeOpacity={0.7}
          >
            <Text style={styles.modalButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: '950',
  },
  gradientOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    alignItems: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
    position: 'relative',
  },
  input: {
    width: '100%',
    padding: 18,
    paddingLeft: 50,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    color: '#333',
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    top: 18,
    zIndex: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 18,
    zIndex: 1,
  },
  button: {
    width: width * 0.85,
    borderRadius: 30,
    overflow: 'hidden',
    marginTop: 20,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 30,
  },
  changePasswordButton: {
    backgroundColor: '#4BB543',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  loader: {
    marginTop: 30,
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
  },
  successModal: {
    backgroundColor: '#4BB543',
  },
  errorModal: {
    backgroundColor: '#FF5252',
  },
  warningModal: {
    backgroundColor: '#FFA500',
  },
  modalIcon: {
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 12,
    paddingHorizontal: 35,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default SupervisorLogin;