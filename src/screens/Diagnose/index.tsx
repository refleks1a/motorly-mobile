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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ArrowUp, MoreHorizontal, Trash2, X, Sparkles, ChevronDown, MessageSquare } from 'lucide-react-native';
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
interface AiMsg   extends BaseMsg { type: 'ai';   text: string; timestamp?: string; diagnosisCard?: { issue: string; recommendation: string; image?: any; }; isLoading?: boolean; suggestedReplies?: string[]; }
interface UserMsg extends BaseMsg { type: 'user'; text: string; timestamp?: string; imageUri?: string; }
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
        imageUri: (msg as any).imageUrl || undefined,
      });
    } else if (msg.role === 'assistant') {
      const uiMessage: AiMsg = {
        id: msg.id,
        type: 'ai',
        text: msg.content,
        timestamp,
        suggestedReplies: msg.suggestedReplies,
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
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [headerMenuVisible, setHeaderMenuVisible] = useState(false);
  const [headerMenuPos, setHeaderMenuPos] = useState({ top: 0, right: 0 });
  const [useAgenticAI, setUseAgenticAI] = useState(true);
  const [agentDropdownVisible, setAgentDropdownVisible] = useState(false);

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

  const handlePickImage = () => {
    Alert.alert(
      'Attach Image',
      'Choose a source',
      [
        {
          text: 'Camera',
          onPress: async () => {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
              Alert.alert('Permission needed', 'Camera access is required to take photos.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              quality: 0.7,
              allowsEditing: true,
            });
            if (!result.canceled && result.assets[0]) {
              setSelectedImageUri(result.assets[0].uri);
            }
          },
        },
        {
          text: 'Photo Library',
          onPress: async () => {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
              Alert.alert('Permission needed', 'Photo library access is required to select images.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              quality: 0.7,
              allowsEditing: true,
            });
            if (!result.canceled && result.assets[0]) {
              setSelectedImageUri(result.assets[0].uri);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const sendMessage = async () => {
    const text = input.trim();
    const imageToSend = selectedImageUri;
    if ((!text && !imageToSend) || isSendingMessage || !currentSessionId) return;

    const now = new Date();
    const timestamp = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
      + ', '
      + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    // Add user message to UI immediately - use timestamp + random for unique ID
    const userMessageId = `u${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setMessages(prev => [
      ...prev,
      { id: userMessageId, type: 'user', text: text || (imageToSend ? '📷 Image' : ''), timestamp, imageUri: imageToSend || undefined },
    ]);
    setInput('');
    setSelectedImageUri(null);
    setIsSendingMessage(true);

    // Create AI message with loading state
    const aiMessageId = `a${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const aiMessage: Message = {
      id: aiMessageId,
      type: 'ai',
      text: 'Thinking',
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
      const response = await chatService.sendMessage(currentSessionId, { 
        content: text || 'Please analyze this image', 
        imageUri: imageToSend || undefined,
        useAgent: useAgenticAI,
      });
      
      // Clear timeout since we got a response
      clearTimeout(timeoutId);
      
      // Update AI message with actual response
      const updatedAiMessage: AiMsg = {
        id: response.id || aiMessageId,
        type: 'ai',
        text: response.content || 'I received your message but my response was empty. Please try again.',
        timestamp: new Date(response.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        isLoading: false,
        suggestedReplies: response.suggestedReplies,
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
          const retryResponse = await chatService.sendMessage(currentSessionId, { content: text, useAgent: useAgenticAI });
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

  const handleQuickReply = (reply: string) => {
    setInput(reply);
    // Dismiss suggested replies on all AI messages
    setMessages(prev => prev.map(msg =>
      msg.type === 'ai' ? { ...msg, suggestedReplies: undefined } : msg
    ));
  };

  const renderItem = ({ item }: { item: Message }) => {
    if (item.type === 'date') return <DateSeparator label={item.label} />;
    if (item.type === 'ai')
      return (
        <AiMessage
          text={item.text}
          timestamp={item.timestamp}
          diagnosisCard={item.diagnosisCard}
          isLoading={item.isLoading}
          suggestedReplies={item.suggestedReplies}
          onQuickReply={handleQuickReply}
        />
      );
    if (item.type === 'user')
      return (
        <UserMessage
          text={item.text}
          timestamp={item.timestamp}
          imageUri={item.imageUri}
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
          {/* Image preview */}
          {selectedImageUri && (
            <View style={styles.imagePreviewContainer}>
              <View style={styles.imagePreviewWrapper}>
                <Image source={{ uri: selectedImageUri }} style={styles.imagePreview} resizeMode="cover" />
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => setSelectedImageUri(null)}
                  activeOpacity={0.7}
                >
                  <X size={14} color="#fff" strokeWidth={3} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          {/* The switch is now moved inside the input bar */}
          
          <View style={styles.inputBar}>
            <TouchableOpacity style={styles.cameraBtn} activeOpacity={0.7} disabled={isLoadingSession} onPress={handlePickImage}>
              <Camera size={26} color={selectedImageUri ? Colors.primary : Colors.onSurfaceVariant} strokeWidth={2} />
            </TouchableOpacity>
            <View style={styles.inputWrapper}>
              {/* Agent mode selector pill */}
              <TouchableOpacity
                style={styles.agentDropdownBtn}
                onPress={() => setAgentDropdownVisible(true)}
                activeOpacity={0.7}
              >
                {useAgenticAI
                  ? <Sparkles size={16} color={Colors.primary} />
                  : <MessageSquare size={16} color={Colors.onSurfaceVariant} />}
                <ChevronDown size={11} color={useAgenticAI ? Colors.primary : Colors.onSurfaceVariant} />
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.agentDivider} />

              <TextInput
                style={styles.input}
                placeholder={selectedImageUri ? 'Add a message (optional)...' : 'Ask Motorly...'}
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
                  style={[styles.sendBtn, (!input.trim() && !selectedImageUri) && styles.sendBtnDisabled]}
                  activeOpacity={0.8}
                  onPress={sendMessage}
                  disabled={(!input.trim() && !selectedImageUri) || isSendingMessage}
                >
                  <ArrowUp
                    size={20}
                    color={(!input.trim() && !selectedImageUri) ? Colors.onSurfaceVariant : Colors.onPrimary}
                    strokeWidth={3}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* ── Agent Mode Dropdown ── */}
      <Modal visible={agentDropdownVisible} transparent animationType="fade">
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setAgentDropdownVisible(false)}>
          <View style={styles.agentDropdownMenu}>
            <Text style={styles.agentDropdownMenuTitle}>AI Mode</Text>

            {/* Agentic option */}
            <TouchableOpacity
              style={[styles.agentModeOption, useAgenticAI && styles.agentModeOptionActive]}
              onPress={() => { setUseAgenticAI(true); setAgentDropdownVisible(false); }}
              activeOpacity={0.7}
            >
              <View style={[styles.agentModeIconWrap, useAgenticAI && styles.agentModeIconWrapActive]}>
                <Sparkles size={17} color={useAgenticAI ? Colors.primary : Colors.onSurfaceVariant} />
              </View>
              <View style={styles.agentModeTextWrap}>
                <Text style={[styles.agentModeLabel, useAgenticAI && styles.agentModeLabelActive]}>Agentic</Text>
                <Text style={styles.agentModeDesc}>AI with tools & vehicle data</Text>
              </View>
              {useAgenticAI && <View style={styles.agentModeDot} />}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.agentMenuDivider} />

            {/* Standard option */}
            <TouchableOpacity
              style={[styles.agentModeOption, !useAgenticAI && styles.agentModeOptionActive]}
              onPress={() => { setUseAgenticAI(false); setAgentDropdownVisible(false); }}
              activeOpacity={0.7}
            >
              <View style={[styles.agentModeIconWrap, !useAgenticAI && styles.agentModeIconWrapActive]}>
                <MessageSquare size={17} color={!useAgenticAI ? Colors.primary : Colors.onSurfaceVariant} />
              </View>
              <View style={styles.agentModeTextWrap}>
                <Text style={[styles.agentModeLabel, !useAgenticAI && styles.agentModeLabelActive]}>Standard</Text>
                <Text style={styles.agentModeDesc}>Fast, direct responses</Text>
              </View>
              {!useAgenticAI && <View style={styles.agentModeDot} />}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

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
    paddingBottom: Platform.OS === 'ios' ? Spacing.lg : Spacing.md,
    backgroundColor: Colors.surface,
  },
  // Agent mode dropdown button (inside input pill)
  agentDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.sm,
    paddingVertical: Spacing.sm,
    alignSelf: 'center',
  },
  agentDropdownLabel: {
    fontSize: Typography.labelMd,
    fontWeight: Typography.weightSemiBold,
    fontFamily: Typography.fontBody,
    color: Colors.primary,
  },
  agentDropdownLabelInactive: {
    color: Colors.onSurfaceVariant,
  },
  agentDivider: {
    width: 1,
    height: 18,
    backgroundColor: Colors.outlineVariant,
    alignSelf: 'center',
    marginRight: Spacing.xs,
    opacity: 0.5,
  },

  // Agent mode dropdown menu (modal card)
  agentDropdownMenu: {
    position: 'absolute',
    bottom: 130,
    left: Spacing.lg,
    width: 258,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  agentDropdownMenuTitle: {
    fontSize: Typography.labelSm,
    fontWeight: Typography.weightSemiBold,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  agentModeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    gap: Spacing.sm,
  },
  agentModeOptionActive: {
    backgroundColor: 'rgba(168, 57, 0, 0.05)',
  },
  agentModeIconWrap: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentModeIconWrapActive: {
    backgroundColor: 'rgba(168, 57, 0, 0.1)',
  },
  agentModeTextWrap: {
    flex: 1,
  },
  agentModeLabel: {
    fontSize: Typography.bodyMd,
    fontWeight: Typography.weightSemiBold,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
  },
  agentModeLabelActive: {
    color: Colors.primary,
  },
  agentModeDesc: {
    fontSize: Typography.labelSm,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
    marginTop: 1,
  },
  agentModeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  agentMenuDivider: {
    height: 1,
    backgroundColor: Colors.outlineVariant,
    marginHorizontal: Spacing.md,
    opacity: 0.4,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 22,
    minHeight: 44,
    paddingTop: 4,
    paddingRight: 4,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
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

  // Image preview
  imagePreviewContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    backgroundColor: Colors.surface,
  },
  imagePreviewWrapper: {
    width: 72,
    height: 72,
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginLeft: 52, // align with text input (cameraBtn width + gap)
  },
  imagePreview: {
    width: 72,
    height: 72,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
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
