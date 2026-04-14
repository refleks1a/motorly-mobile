import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Dimensions,
  Modal,
  Pressable,
  ActivityIndicator,
  Animated,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { Camera, ArrowUp, MoreHorizontal, Trash2 } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { AiMessage } from '@/components/chat/AiMessage';
import { UserMessage } from '@/components/chat/UserMessage';
import { DateSeparator } from '@/components/chat/DateSeparator';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import chatService, { ChatMessage as ServiceChatMessage, ChatSession, SendMessageRequest } from '@/services/chat.service';
import { useVehicles } from '@/contexts/VehicleContext';

// ── Types ───────────────────────────────────────────────────────────────────

type MsgType = 'date' | 'ai' | 'user';

interface BaseMsg { id: string; type: MsgType; }
interface DateMsg extends BaseMsg { type: 'date'; label: string; }
interface AiMsg   extends BaseMsg { type: 'ai';   text: string; timestamp?: string; diagnosisCard?: { issue: string; recommendation: string; image?: any; }; isLoading?: boolean; }
interface UserMsg extends BaseMsg { type: 'user'; text: string; timestamp?: string; }
type Message = DateMsg | AiMsg | UserMsg;

// ── Helper Functions ─────────────────────────────────────────────────────────

const convertChatMessagesToUIMessages = (chatMessages: ServiceChatMessage[]): Message[] => {
  const messages: Message[] = [];
  let currentDate = '';
  
  chatMessages.forEach((msg, index) => {
    const msgDate = new Date(msg.createdAt).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
    
    // Add date separator if date changed - use index to ensure uniqueness
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      messages.push({
        id: `date-${msgDate}-${index}`,
        type: 'date',
        label: msgDate === new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) 
          ? 'Today' 
          : msgDate,
      });
    }
    
    // Convert chat message to UI message
    const timestamp = new Date(msg.createdAt).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
    
    if (msg.role === 'user') {
      messages.push({
        id: msg.id,
        type: 'user',
        text: msg.content,
        timestamp,
      });
    } else if (msg.role === 'assistant') {
      const uiMessage: Message = {
        id: msg.id,
        type: 'ai',
        text: msg.content,
        timestamp,
      };
      
      // Add diagnosis card if metadata exists
      if (msg.metadata?.diagnosis) {
        uiMessage.diagnosisCard = {
          issue: msg.metadata.diagnosis,
          recommendation: msg.metadata.recommendations?.[0] || 'Recommended: Further Inspection',
          image: require('@/assets/images/brake.png'), // Default image
        };
      }
      
      messages.push(uiMessage);
    }
    // Note: system messages are not displayed in UI
  });
  
  return messages;
};

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ── Component ────────────────────────────────────────────────────────────────

export const DiagnoseScreen: React.FC = () => {
  const { primaryVehicle } = useVehicles();
  
  // Chat session state
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  // UI state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [headerMenuVisible, setHeaderMenuVisible] = useState(false);
  const [headerMenuPos, setHeaderMenuPos] = useState({ top: 0, right: 0 });

  const listRef = useRef<FlatList>(null);
  const moreBtnRef = useRef<View>(null);
  const listOpacity = useRef(new Animated.Value(0)).current;

  // Load messages from local storage on mount
  useEffect(() => {
    loadMessagesFromStorage();
  }, []);

  // Reload messages when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadMessagesFromBackend();
    }, [currentSessionId])
  );

  // Save messages to local storage whenever they change
  useEffect(() => {
    saveMessagesToStorage();
  }, [messages]);

  const loadMessagesFromStorage = async () => {
    try {
      const storedMessages = await SecureStore.getItemAsync('chat_messages');
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages);
        setMessages(parsedMessages);
      }
    } catch (error) {
      console.error('Failed to load messages from storage:', error);
    }
  };

  const saveMessagesToStorage = async () => {
    try {
      await SecureStore.setItemAsync('chat_messages', JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save messages to storage:', error);
    }
  };

  const fadeInList = () => {
    Animated.timing(listOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const loadMessagesFromBackend = async () => {
    if (!currentSessionId) return;
    
    try {
      setIsLoadingSession(true);
      listOpacity.setValue(0);
      const sessionData = await chatService.getChatSession(currentSessionId);
      const loadedMessages = convertChatMessagesToUIMessages(sessionData.messages);
      setMessages(loadedMessages);
    } catch (error) {
      console.error('Failed to load messages from backend:', error);
    } finally {
      setIsLoadingSession(false);
      fadeInList();
    }
  };

  // Initialize or load chat session
  useEffect(() => {
    const initializeChatSession = async () => {
      try {
        setIsLoadingSession(true);
        
        // Check if we have an existing session, otherwise create a new one
        const sessions = await chatService.getChatSessions();
        
        if (sessions.length > 0) {
          // Use the most recent session
          const latestSession = sessions[0];
          setCurrentSessionId(latestSession.id);
          
          // Load messages from the session
          const sessionData = await chatService.getChatSession(latestSession.id);
          const loadedMessages = convertChatMessagesToUIMessages(sessionData.messages);
          setMessages(loadedMessages);
          fadeInList();
        } else {
          // Create a new session
          const vehicleName = primaryVehicle 
            ? `${primaryVehicle.year} ${primaryVehicle.make} ${primaryVehicle.model}`
            : 'My Vehicle';
          
          const newSession = await chatService.createChatSession({
            title: `Diagnosis for ${vehicleName}`,
            vehicleId: primaryVehicle?.id,
          });
          
          setCurrentSessionId(newSession.id);
          setMessages([]);
          fadeInList();
        }
      } catch (error) {
        console.error('Failed to initialize chat session:', error);
        // Fallback to empty state
        setMessages([]);
      } finally {
        setIsLoadingSession(false);
      }
    };

    initializeChatSession();
  }, [primaryVehicle]);

  const handleMorePress = () => {
    moreBtnRef.current?.measure((x, y, w, h, px, py) => {
      const screenWidth = Dimensions.get('window').width;
      setHeaderMenuPos({ top: py + h + 8, right: screenWidth - (px + w) });
      setHeaderMenuVisible(true);
    });
  };

  const handleClearChat = async () => {
    try {
      if (currentSessionId) {
        await chatService.deleteChatSession(currentSessionId);
      }
      setCurrentSessionId(null);
      setMessages([]);
      setHeaderMenuVisible(false);
      
      // Clear local storage
      await SecureStore.deleteItemAsync('chat_messages');
      
      // Create a new session
      const vehicleName = primaryVehicle 
        ? `${primaryVehicle.year} ${primaryVehicle.make} ${primaryVehicle.model}`
        : 'My Vehicle';
      
      const newSession = await chatService.createChatSession({
        title: `Diagnosis for ${vehicleName}`,
        vehicleId: primaryVehicle?.id,
      });
      
      setCurrentSessionId(newSession.id);
      
      // Don't add any initial messages - keep it empty
      setMessages([]);
    } catch (error) {
      console.error('Failed to clear chat:', error);
      // Still clear local messages even if backend fails
      setMessages([]);
      await SecureStore.deleteItemAsync('chat_messages');
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isSendingMessage || !currentSessionId) return;

    const now = new Date();
    const timestamp = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
      + ', '
      + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    // Add user message to UI immediately - use timestamp + random for unique ID
    const userMessageId = `u${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setMessages(prev => [
      ...prev,
      { id: userMessageId, type: 'user', text, timestamp },
    ]);
    setInput('');
    setIsSendingMessage(true);

    // Create AI message with loading state
    const aiMessageId = `a${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const aiMessage: Message = {
      id: aiMessageId,
      type: 'ai',
      text: 'Thinking...',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      isLoading: true,
    };
    
    setMessages(prev => [...prev, aiMessage]);

    // Set timeout for 5 seconds
    const timeoutId = setTimeout(() => {
      // Update message to show timeout warning
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { ...msg, text: 'Taking longer than expected...', isLoading: true } 
          : msg
      ));
    }, 5000);

    try {
      // Send message to the current session
      const response = await chatService.sendMessage(currentSessionId, { content: text });
      
      // Clear timeout since we got a response
      clearTimeout(timeoutId);
      
      // Update AI message with actual response
      const updatedAiMessage: Message = {
        id: response.id || aiMessageId,
        type: 'ai',
        text: response.content || 'I received your message but my response was empty. Please try again.',
        timestamp: new Date(response.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        isLoading: false,
      };

      // Check if we have diagnosis metadata to show a diagnosis card
      if (response.metadata?.diagnosis) {
        updatedAiMessage.diagnosisCard = {
          issue: response.metadata.diagnosis,
          recommendation: response.metadata.recommendations?.[0] || 'Recommended: Further Inspection',
          image: require('@/assets/images/brake.png'), // Default image
        };
      }

      // Smooth animation for expanding the chat bubble
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      // Replace the loading message with the actual response
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId ? updatedAiMessage : msg
      ));
    } catch (error: any) {
      console.error('Failed to send message:', error);
      
      // Clear timeout
      clearTimeout(timeoutId);
      
      // Update message to show error
      const errorMessage: Message = {
        id: aiMessageId,
        type: 'ai',
        text: "I'm having trouble connecting right now. I'll try again in the background.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        isLoading: false,
      };
      
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId ? errorMessage : msg
      ));
      
      // Automatic retry in background (non-blocking)
      setTimeout(async () => {
        try {
          const retryResponse = await chatService.sendMessage(currentSessionId, { content: text });
          const retryMessage: Message = {
            id: retryResponse.id || `retry-${aiMessageId}`,
            type: 'ai',
            text: retryResponse.content || 'Retry successful but response was empty.',
            timestamp: new Date(retryResponse.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            isLoading: false,
          };
          
          if (retryResponse.metadata?.diagnosis) {
            retryMessage.diagnosisCard = {
              issue: retryResponse.metadata.diagnosis,
              recommendation: retryResponse.metadata.recommendations?.[0] || 'Recommended: Further Inspection',
              image: require('@/assets/images/brake.png'),
            };
          }
          
          // Update the error message with successful retry
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId ? retryMessage : msg
          ));
        } catch (retryError) {
          console.error('Background retry failed:', retryError);
          // Keep the error message as is
        }
      }, 3000); // Retry after 3 seconds
    } finally {
      setIsSendingMessage(false);
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    if (item.type === 'date') return <DateSeparator label={item.label} />;
    if (item.type === 'ai')
      return <AiMessage text={item.text} timestamp={item.timestamp} diagnosisCard={item.diagnosisCard} />;
    if (item.type === 'user')
      return (
        <UserMessage
          text={item.text}
          timestamp={item.timestamp}
          onEdit={() => setInput(item.text)}
        />
      );
    return null;
  };

  // Ensure all messages have unique IDs for FlatList
  const getMessageKey = (item: Message, index: number): string => {
    // Use the item's ID if it exists and is not empty
    if (item.id && item.id.trim() !== '') {
      return item.id;
    }
    // Fallback to index-based key
    return `msg-${index}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.wordmark}>Motorly</Text>
        </View>

        <TouchableOpacity 
          ref={moreBtnRef}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={handleMorePress}
          disabled={isLoadingSession}
        >
          <MoreHorizontal size={24} color={Colors.onBackground} />
        </TouchableOpacity>
      </View>

      {/* ── Chat ── */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {isLoadingSession ? (
          // Loading state
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading chat...</Text>
          </View>
        ) : messages.length === 0 ? (
          // Empty state
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>AI Car Diagnosis</Text>
            <Text style={styles.emptyDescription}>
              Describe your car issue and get AI-powered diagnosis and recommendations.
            </Text>
          </View>
        ) : (
          // Chat messages
          <Animated.View style={[styles.flex, { opacity: listOpacity }]}>
            <FlatList
              ref={listRef}
              data={[...messages].reverse()}
              keyExtractor={(item, index) => getMessageKey(item, index)}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              style={styles.list}
              inverted
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              removeClippedSubviews={false}
            />
          </Animated.View>
        )}

        {/* ── Input bar ── */}
        <View style={styles.inputContainer}>
          <LinearGradient
            colors={['rgba(249, 249, 247, 0)', Colors.surface]}
            style={styles.fadeGradient}
            pointerEvents="none"
          />
          <View style={styles.inputBar}>
            <TouchableOpacity style={styles.cameraBtn} activeOpacity={0.7} disabled={isLoadingSession}>
              <Camera size={26} color={Colors.onSurfaceVariant} strokeWidth={2} />
            </TouchableOpacity>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Ask Motorly..."
                placeholderTextColor={Colors.onSurfaceVariant}
                value={input}
                onChangeText={setInput}
                multiline
                returnKeyType="send"
                onSubmitEditing={sendMessage}
                editable={!isLoadingSession && !isSendingMessage}
              />
              {isSendingMessage ? (
                <View style={[styles.sendBtn, styles.sendBtnDisabled]}>
                  <ActivityIndicator size="small" color={Colors.onSurfaceVariant} />
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
                  activeOpacity={0.8}
                  onPress={sendMessage}
                  disabled={!input.trim() || isSendingMessage}
                >
                  <ArrowUp 
                    size={20} 
                    color={!input.trim() ? Colors.onSurfaceVariant : Colors.onPrimary} 
                    strokeWidth={3} 
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* ── Header Context Menu ── */}
      <Modal visible={headerMenuVisible} transparent animationType="fade">
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setHeaderMenuVisible(false)}
        >
          <BlurView
            intensity={8}
            tint="dark"
            style={[
              styles.headerMenu,
              { top: headerMenuPos.top, right: headerMenuPos.right },
            ]}
          >
            <TouchableOpacity style={styles.menuItem} onPress={handleClearChat}>
              <Text style={styles.menuTextLabel}>Clear Chat</Text>
              <Trash2 size={18} color="#fff" />
            </TouchableOpacity>
          </BlurView>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logo: { width: 26, height: 26 },
  wordmark: {
    fontSize: Typography.titleLg,
    fontWeight: Typography.weightExtraBold,
    fontFamily: Typography.fontDisplay,
    color: Colors.primary,
  },

  // List
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },

  // Input bar
  inputContainer: {
    backgroundColor: Colors.surface,
  },
  fadeGradient: {
    position: 'absolute',
    top: -24,
    left: 0,
    right: 0,
    height: 24,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 22,
    minHeight: 44,
    paddingRight: 4,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.sm,
    paddingTop: Platform.OS === 'ios' ? 12 : 10,
    paddingBottom: Platform.OS === 'ios' ? 12 : 10,
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
    textAlignVertical: 'center',
  },
  cameraBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  sendBtnDisabled: {
    backgroundColor: Colors.surfaceContainerLow,
  },

  // Loading state
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  loadingText: {
    marginTop: Spacing.lg,
    fontSize: Typography.bodyLg,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingBottom: 100,
  },
  emptyTitle: {
    fontSize: Typography.headlineMd,
    fontWeight: Typography.weightBold,
    fontFamily: Typography.fontDisplay,
    color: Colors.onBackground,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: Typography.bodyLg,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Header Menu
  headerMenu: {
    position: 'absolute',
    width: 160,
    backgroundColor: 'rgba(30,30,30,0.55)',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    padding: Spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  menuTextLabel: {
    fontSize: Typography.bodyLg,
    fontWeight: Typography.weightSemiBold,
    color: '#fff',
  },
});
