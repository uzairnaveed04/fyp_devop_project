import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  ImageBackground,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleStart = () => {
    // Button press animation
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
    ]).start(() => navigation.navigate('WelcomeScreen')); // Change 'Home' to your target screen
  };

  return (
    <ImageBackground
      source={{ uri: 'https://i.pinimg.com/736x/60/94/63/609463bd8b98a60cfae2d429ef89bddf.jpg' }} // COMSATS University Islamabad image
      style={styles.container}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.4)']}
        style={styles.gradientOverlay}
      >
        <View style={styles.content}>
          {/* Welcome Header */}
          <Animated.View style={[
            styles.header,
            { 
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }] 
            }
          ]}>
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.appName}>SuperviseMe</Text>
            <Text style={styles.universityText}>COMSATS University Islamabad</Text>
          </Animated.View>

          {/* Motivational Text */}
          <Animated.View style={[styles.quoteContainer, { opacity: fadeAnim }]}>
            <Text style={styles.quoteText}>
              Success comes from setting goals and managing them effectively.
              SuperviseMe makes that possible.
            </Text>
          </Animated.View>

          {/* Start Button */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity 
              style={styles.button}
              onPress={handleStart}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#1E3A8A', '#1E40AF']} // COMSATS blue colors
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>Let's Start</Text>
                <Ionicons 
                  name="arrow-forward" 
                  size={24} 
                  color="#fff" 
                  style={styles.buttonIcon} 
                />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: '850',
  },
  gradientOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '300',
    color: '#fff',
    letterSpacing: 3,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  universityText: {
    fontSize: 18,
    color: '#fff',
    marginTop: 10,
    fontWeight: '500',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
  },
  quoteContainer: {
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  quoteText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 26,
    letterSpacing: 0.5,
    fontStyle: 'italic',
  },
  button: {
    width: width * 0.7,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#1E3A8A',
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
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginRight: 10,
  },
  buttonIcon: {
    marginLeft: 5,
  },
});

export default WelcomeScreen;