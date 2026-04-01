import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, ArrowUp, MoreHorizontal, Trash2 } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { AiMessage } from '@/components/chat/AiMessage';
import { UserMessage } from '@/components/chat/UserMessage';
import { DateSeparator } from '@/components/chat/DateSeparator';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

// ── Types ───────────────────────────────────────────────────────────────────

type MsgType = 'date' | 'ai' | 'user';

interface BaseMsg { id: string; type: MsgType; }
interface DateMsg extends BaseMsg { type: 'date'; label: string; }
interface AiMsg   extends BaseMsg { type: 'ai';   text: string; timestamp?: string; diagnosisCard?: { issue: string; recommendation: string; image?: any; }; }
interface UserMsg extends BaseMsg { type: 'user'; text: string; timestamp?: string; }
type Message = DateMsg | AiMsg | UserMsg;

// ── Seed data (matches design) ───────────────────────────────────────────────

const SEED: Message[] = [
  { id: 'd1', type: 'date', label: 'Today' },
  {
    id: 'a1',
    type: 'ai',
    text: "Hello! I'm your Motorly AI assistant. What seems to be the problem with your vehicle today?",
    timestamp: 'March 27, 10:40',
  },
  {
    id: 'u1',
    type: 'user',
    text: 'My car is making a high-pitched squealing sound when I brake, especially in the morning.',
    timestamp: 'March 27, 10:42',
  },
  {
    id: 'a2',
    type: 'ai',
    text: 'That sound is often related to the brake pads. It could be the "wear indicator" — a small metal tab designed to scrape the rotor when pads are low.',
    timestamp: 'March 27, 10:42',
    diagnosisCard: {
      issue: 'Likely Issue: Brake Pad Wear',
      recommendation: 'Recommended: Visual Inspection',
      image: require('@/assets/images/brake.png'),
    },
  },
  {
    id: 'u2',
    type: 'user',
    text: 'Is it safe to drive to work tomorrow?',
    timestamp: 'March 27, 10:43',
  },
];

// ── Component ────────────────────────────────────────────────────────────────

export const DiagnoseScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(SEED);
  const [input, setInput] = useState('');
  const [headerMenuVisible, setHeaderMenuVisible] = useState(false);
  const [headerMenuPos, setHeaderMenuPos] = useState({ top: 0, right: 0 });

  const listRef = useRef<FlatList>(null);
  const moreBtnRef = useRef<View>(null);

  const handleMorePress = () => {
    moreBtnRef.current?.measure((x, y, w, h, px, py) => {
      const screenWidth = Dimensions.get('window').width;
      setHeaderMenuPos({ top: py + h + 8, right: screenWidth - (px + w) });
      setHeaderMenuVisible(true);
    });
  };

  const handleClearChat = () => {
    setMessages([]);
    setHeaderMenuVisible(false);
  };

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const now = new Date();
    const timestamp = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
      + ', '
      + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    setMessages(prev => [
      ...prev,
      { id: `u${Date.now()}`, type: 'user', text, timestamp },
    ]);
    setInput('');

    // Simulate AI thinking → response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: `a${Date.now()}`,
          type: 'ai',
          text: "I'm analyzing your description. Could you tell me more about when you first noticed this — and whether the sound changes with speed?",
        },
      ]);
    }, 1200);
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
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={m => m.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />

        {/* ── Input bar ── */}
        <View style={styles.inputContainer}>
          <LinearGradient
            colors={['rgba(249, 249, 247, 0)', Colors.surface]}
            style={styles.fadeGradient}
            pointerEvents="none"
          />
          <View style={styles.inputBar}>
          <TouchableOpacity style={styles.cameraBtn} activeOpacity={0.7}>
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
            />
            <TouchableOpacity
              style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
              activeOpacity={0.8}
              onPress={sendMessage}
              disabled={!input.trim()}
            >
              <ArrowUp 
                size={20} 
                color={!input.trim() ? Colors.onSurfaceVariant : Colors.onPrimary} 
                strokeWidth={3} 
              />
            </TouchableOpacity>
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
