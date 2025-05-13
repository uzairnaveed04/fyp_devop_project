import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ImageBackground, 
  Dimensions,
  Animated,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const [button1Scale] = useState(new Animated.Value(1));
  const [button2Scale] = useState(new Animated.Value(1));

  const animateButton = (buttonScale) => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <ImageBackground
      source={{ uri: 'https://i.pinimg.com/736x/52/fb/0a/52fb0a8d64f08472449afc061c6d520d.jpg' }}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* Animated Title */}
        <Animatable.View 
          animation="fadeInDown"
          duration={1000}
          style={styles.titleContainer}
        >
          <Text style={styles.title}>Welcome to</Text>
          <Animatable.Text 
            animation="pulse"
            iterationCount="infinite"
            direction="alternate"
            style={styles.appName}
          >
            SuperviseMe
          </Animatable.Text>
          <View style={styles.divider} />
        </Animatable.View>

        {/* Buttons with Animation */}
        <View style={styles.buttonsContainer}>
          <Animatable.View 
            animation="fadeInUp"
            duration={800}
            delay={300}
          >
            <Animated.View style={{ transform: [{ scale: button1Scale }] }}>
              <TouchableOpacity 
                style={[styles.button, styles.studentButton]}
                onPress={() => {
                  animateButton(button1Scale);
                  navigation.navigate('Login');
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="school" size={24} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>I'm a Student</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          </Animatable.View>

          <Animatable.View 
            animation="fadeInUp"
            duration={800}
            delay={500}
          >
            <Animated.View style={{ transform: [{ scale: button2Scale }] }}>
              <TouchableOpacity 
                style={[styles.button, styles.supervisorButton]}
                onPress={() => {
                  animateButton(button2Scale);
                  navigation.navigate('SLogin');
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="people" size={24} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>I'm a Supervisor</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          </Animatable.View>
        </View>

        {/* Footer */}
        <Animatable.View 
          animation="fadeIn"
          duration={1500}
          delay={1000}
          style={styles.footer}
        >
          <Text style={styles.footerText}>Empowering Academic Excellence</Text>
        </Animatable.View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    width: width,
    height: 1000,
  },
  overlay: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 25,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: '#fff',
    letterSpacing: 2,
    textTransform: 'uppercase'
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5
  },
  divider: {
    height: 3,
    width: 100,
    backgroundColor: '#6C63FF',
    marginTop: 15,
    borderRadius: 3
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center'
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 25,
    width: width * 0.85,
    borderRadius: 30,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  studentButton: {
    backgroundColor: '#6C63FF',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  supervisorButton: {
    backgroundColor: '#FF5252',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    flex: 1,
    textAlign: 'center'
  },
  buttonIcon: {
    marginRight: 10
  },
  footer: {
    position: 'absolute',
    bottom: 30
  },
  footerText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    letterSpacing: 0.5,
    fontStyle: 'italic'
  }
});

export default WelcomeScreen;