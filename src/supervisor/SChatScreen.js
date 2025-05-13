// SupervisorChatScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar,
  Appearance, Animated, Dimensions, Modal
} from 'react-native';
import { firestore } from '../firebaseConfig.js';
import {
  collection, addDoc, query, orderBy, onSnapshot,
  serverTimestamp, writeBatch, getDocs
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');

const SupervisorChatScreen = ({ route, navigation }) => {
  const colorScheme = Appearance.getColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { supervisorId, studentId, supervisorName } = route.params;
  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid;
  const chatId = studentId < supervisorId
    ? `${studentId}_${supervisorId}`
    : `${supervisorId}_${studentId}`;

  const flatListRef = useRef();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastCount, setLastCount] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);

  const receiveSoundRef = useRef();
  const sendSoundRef = useRef();

  const colors = isDarkMode ? themeColors.dark : themeColors.light;

  useEffect(() => {
    // Preload sounds
    Audio.Sound.createAsync(require('../assets/messenger.mp3'))
      .then(({ sound }) => { receiveSoundRef.current = sound; });
    Audio.Sound.createAsync(require('../assets/bubblee.mp3'))
      .then(({ sound }) => { sendSoundRef.current = sound; });

    // Fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 500, useNativeDriver: true
    }).start();

    const q = query(
      collection(firestore, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, async snap => {
      const fetched = snap.docs.map(d => ({
        id: d.id,
        text: d.data().text,
        senderId: d.data().senderId,
        createdAt: d.data().createdAt?.toDate() || new Date()
      }));
      // Play receive sound on new incoming
      if (fetched.length > lastCount && fetched[fetched.length - 1].senderId !== currentUserId) {
        await receiveSoundRef.current?.replayAsync();
      }
      setLastCount(fetched.length);
      setMessages(fetched);
      setLoading(false);
      flatListRef.current?.scrollToEnd({ animated: true });
    });
    return () => {
      unsubscribe();
      receiveSoundRef.current?.unloadAsync();
      sendSoundRef.current?.unloadAsync();
    };
  }, [chatId, currentUserId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const text = newMessage.trim();
    setNewMessage('');
    await sendSoundRef.current?.replayAsync();
    try {
      await addDoc(
        collection(firestore, 'chats', chatId, 'messages'),
        { text, senderId: currentUserId, createdAt: serverTimestamp() }
      );
    } catch (e) {
      console.error('Send error:', e);
    }
  };

  const promptClear = () => setShowConfirm(true);
  const clearChat = async () => {
    setShowConfirm(false);
    const msgs = await getDocs(collection(firestore, 'chats', chatId, 'messages'));
    const batch = writeBatch(firestore);
    msgs.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    setMessages([]);
    setLastCount(0);
  };

  const renderMessage = ({ item, index }) => {
    const isSent = item.senderId === currentUserId;
    const next = messages[index + 1];
    const tail = !next || next.senderId !== item.senderId;
    return (
      <View style={[
        styles.messageRow,
        isSent ? styles.sentRow : styles.receivedRow,
        { marginBottom: tail ? 8 : 2 }
      ]}>
        <View style={[
          styles.messageBubble,
          {
            backgroundColor: isSent ? colors.messageSent : colors.messageReceived,
            borderBottomRightRadius: isSent && tail ? 0 : 12,
            borderBottomLeftRadius: !isSent && tail ? 0 : 12
          }
        ]}>
          <Text style={[styles.messageText, { color: isSent ? '#fff' : colors.text }]}>
            {item.text}
          </Text>
          <Text style={[styles.messageTime, { color: isSent ? '#ddd' : colors.timeText }]}>
            {item.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.background, opacity: fadeAnim }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
        <TouchableOpacity onPress={promptClear} style={styles.headBtn}>
          <Ionicons name="trash" size={24} color={colors.text}/>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Supervisor Chat Screen
        </Text>
        <TouchableOpacity onPress={() => setIsDarkMode(!isDarkMode)} style={styles.headBtn}>
          <Ionicons name={isDarkMode ? 'sunny' : 'moon'} size={24} color={colors.text}/>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.messageSent} style={styles.loader}/>
      ) : !messages.length ? (
        <View style={styles.emptyContainer}>
          <FontAwesome name="comments-o" size={60} color={colors.placeholder}/>
          <Text style={[styles.emptyText, { color: colors.text }]}>No messages</Text>
          <Text style={[styles.emptySubText, { color: colors.placeholder }]}>Start conversation</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={i => i.id}
          contentContainerStyle={{ padding: 10 }}
        />
      )}

      {/* Clear Confirmation */}
      <Modal transparent visible={showConfirm} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.inputBg }]}>
            <Text style={[styles.modalText, { color: colors.text }]}>
              Are you sure you want to clear all messages?
            </Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setShowConfirm(false)} style={styles.modalBtn}>
                <Text style={{ color: colors.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={clearChat} style={styles.modalBtn}>
                <Text style={{ color: 'red' }}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
        style={[styles.inputWrapper, { borderTopColor: colors.border, backgroundColor: colors.background }]}
      >
        <View style={[styles.inputContainer, { backgroundColor: colors.inputBg }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Type a message..."
            placeholderTextColor={colors.placeholder}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            onPress={sendMessage}
            style={[
              styles.sendButton,
              { backgroundColor: newMessage.trim() ? colors.messageSent : colors.placeholder }
            ]}
          >
            <Ionicons name="send" size={20} color="#fff"/>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
};

const themeColors = {
  light: {
    background: '#fff', headerBg: '#f8f9fa', text: '#2c3e50',
    inputBg: '#f1f3f4', messageSent: '#007AFF', messageReceived: '#e9ecef',
    timeText: '#6c757d', placeholder: '#adb5bd', border: '#dee2e6'
  },
  dark: {
    background: '#121212', headerBg: '#1e1e1e', text: '#fff',
    inputBg: '#2d2d2d', messageSent: '#0a84ff', messageReceived: '#2d2d2d',
    timeText: '#aaa', placeholder: '#666', border: '#333'
  }
};

const styles = StyleSheet.create({
  container:{ flex:1 },
  header:{
    flexDirection:'row', alignItems:'center', justifyContent:'space-between',
    padding:12, borderBottomWidth:1
  },
  headBtn:{ padding:5 },
  headerTitle:{ fontSize:18, fontWeight:'600' },
  loader:{ flex:1, justifyContent:'center' },
  emptyContainer:{ flex:1, justifyContent:'center', alignItems:'center' },
  emptyText:{ fontSize:18, fontWeight:'bold', marginTop:20 },
  emptySubText:{ fontSize:14, marginTop:4 },
  messageRow:{ flexDirection:'row', paddingHorizontal:10 },
  sentRow:{ justifyContent:'flex-end' },
  receivedRow:{ justifyContent:'flex-start' },
  messageBubble:{
    padding:10, borderRadius:12, maxWidth:'75%', marginVertical:2
  },
  messageText:{ fontSize:15 },
  messageTime:{ fontSize:10, alignSelf:'flex-end', marginTop:4 },
  inputWrapper:{ padding:8, borderTopWidth:1 },
  inputContainer:{
    flexDirection:'row', borderRadius:25,
    paddingHorizontal:10, alignItems:'center'
  },
  input:{ flex:1, fontSize:15, paddingVertical:8 },
  sendButton:{ marginLeft:8, padding:10, borderRadius:20 },
  modalOverlay:{
    flex:1, backgroundColor:'rgba(0,0,0,0.5)',
    justifyContent:'center', alignItems:'center'
  },
  modalContainer:{
    width:'80%', padding:20, borderRadius:10
  },
  modalText:{ fontSize:16, textAlign:'center', marginBottom:20 },
  modalBtns:{ flexDirection:'row', justifyContent:'space-between' },
  modalBtn:{ padding:10 }
});

export default SupervisorChatScreen;
