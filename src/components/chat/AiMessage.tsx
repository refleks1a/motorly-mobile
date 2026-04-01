import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Clipboard from 'expo-clipboard';
import { Bot, Copy } from 'lucide-react-native';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { DiagnosisCard } from './DiagnosisCard';

interface DiagnosisCardData {
  issue: string;
  recommendation: string;
}

interface Props {
  text: string;
  timestamp?: string;
  diagnosisCard?: DiagnosisCardData;
}

const MENU_WIDTH = 150;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export const AiMessage: React.FC<Props> = ({ text, timestamp, diagnosisCard }) => {
  const bubbleRef = useRef<View>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuTop, setMenuTop] = useState(0);

  const handleLongPress = () => {
    bubbleRef.current?.measure((_x, _y, _w, height, _pageX, pageY) => {
      const estimatedMenuHeight = 130; // approx height of menu elements combined
      const bottomBoundary = SCREEN_HEIGHT - 110; // reserve space for input bar
      let topPosition = pageY + height + 6;

      // if menu would overlap the input bar or fall off, push it above the bubble instead
      if (topPosition + estimatedMenuHeight > bottomBoundary) {
        topPosition = pageY - estimatedMenuHeight - 6;
      }

      setMenuTop(topPosition);
      setMenuVisible(true);
    });
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(text);
    setMenuVisible(false);
  };

  const menuLeft = Spacing.xxl + 36 + Spacing.md; // avatar width + gap

  return (
    <>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Bot size={18} color={Colors.onPrimary} strokeWidth={2} />
        </View>

        <Pressable
          style={styles.bubbleWrapper}
          onLongPress={handleLongPress}
          delayLongPress={350}
        >
          <View ref={bubbleRef} style={styles.bubble} collapsable={false}>
            <Text style={styles.text}>{text}</Text>
            {diagnosisCard && (
              <DiagnosisCard
                issue={diagnosisCard.issue}
                recommendation={diagnosisCard.recommendation}
              />
            )}
          </View>
        </Pressable>
      </View>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={StyleSheet.absoluteFill}>
            <BlurView
              intensity={8}
              tint="dark"
              style={[styles.menu, { top: menuTop, left: menuLeft }]}
            >
              {timestamp && <Text style={styles.timestamp}>{timestamp}</Text>}
              {timestamp && <View style={styles.divider} />}

              <TouchableOpacity style={styles.menuItem} onPress={handleCopy} activeOpacity={0.7}>
                <Copy size={16} color="rgba(255,255,255,0.9)" strokeWidth={2} />
                <Text style={styles.menuLabel}>Copy</Text>
              </TouchableOpacity>
            </BlurView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  bubbleWrapper: { flex: 1 },
  bubble: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderTopLeftRadius: 4,
    padding: Spacing.lg,
    shadowColor: '#1a1a1a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  text: {
    fontSize: Typography.bodyLg,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
    lineHeight: 24,
  },

  // Anchored glass menu
  menu: {
    position: 'absolute',
    width: MENU_WIDTH,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: 'rgba(30,30,30,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  timestamp: {
    fontSize: Typography.labelMd,
    fontFamily: Typography.fontBody,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  menuLabel: {
    fontSize: Typography.bodyLg,
    fontFamily: Typography.fontBody,
    fontWeight: Typography.weightSemiBold,
    color: 'rgba(255,255,255,0.92)',
  },
});
