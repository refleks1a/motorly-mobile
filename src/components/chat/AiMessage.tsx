import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Platform,
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
  isLoading?: boolean;
}

const MENU_WIDTH = 150;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export const AiMessage: React.FC<Props> = ({ text, timestamp, diagnosisCard, isLoading = false }) => {
  const bubbleRef = useRef<View>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top?: number; bottom?: number }>({});
  // store bubble geometry for re-positioning once menu is measured
  const bubbleGeom = useRef<{ pageY: number; height: number } | null>(null);

  const computePosition = (bubblePageY: number, bubbleHeight: number, menuHeight: number) => {
    const topBoundary = 60;
    const bottomBoundary = SCREEN_HEIGHT - 130; // input bar + safe gap

    const belowTop = bubblePageY + bubbleHeight;
    const hasSpaceBelow = belowTop + menuHeight <= bottomBoundary;
    const hasSpaceAbove = bubblePageY - menuHeight >= topBoundary;

    if (hasSpaceBelow) {
      return { top: belowTop };
    } else if (hasSpaceAbove) {
      return { bottom: SCREEN_HEIGHT - bubblePageY };
    } else {
      // overlay: clamp inside visible area, above the input bar
      return { top: bottomBoundary - menuHeight };
    }
  };

  const handleLongPress = () => {
    bubbleRef.current?.measure((_x, _y, _w, height, _pageX, pageY) => {
      bubbleGeom.current = { pageY, height };
      // show hidden first so onLayout can measure it
      setMenuPosition({ top: -9999 });
      setMenuVisible(true);
    });
  };

  const handleMenuLayout = (e: { nativeEvent: { layout: { height: number } } }) => {
    if (!bubbleGeom.current) return;
    const menuHeight = e.nativeEvent.layout.height;
    const { pageY, height } = bubbleGeom.current;
    setMenuPosition(computePosition(pageY, height, menuHeight));
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(text);
    setMenuVisible(false);
  };

  const menuLeft = Spacing.xxl;

  // Loading dots animation state
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isLoading]);

  const renderMarkdown = (textStr: string) => {
    const lines = textStr.split('\n');
    return lines.map((line, lineIndex) => {
      let isHeader = false;
      let lineText = line;
      if (line.startsWith('### ')) {
        isHeader = true;
        lineText = line.substring(4);
      } else if (line.startsWith('## ')) {
        isHeader = true;
        lineText = line.substring(3);
      } else if (line.startsWith('# ')) {
        isHeader = true;
        lineText = line.substring(2);
      }

      // Split by **, *, and `
      const parts = lineText.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
      
      const lineElements = parts.map((part, partIndex) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <Text key={`bold-${partIndex}`} style={[styles.text, { fontWeight: 'bold' }]}>{part.slice(2, -2)}</Text>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <Text key={`italic-${partIndex}`} style={[styles.text, { fontStyle: 'italic' }]}>{part.slice(1, -1)}</Text>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <Text key={`code-${partIndex}`} style={[styles.text, { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', backgroundColor: 'rgba(0,0,0,0.05)' }]}>
              {part.slice(1, -1)}
            </Text>
          );
        }
        return <Text key={`text-${partIndex}`} style={styles.text}>{part}</Text>;
      });

      return (
        <Text 
          key={`line-${lineIndex}`} 
          style={[
            styles.text,
            isHeader && { fontWeight: 'bold', fontSize: 18, marginTop: 8, marginBottom: 4 }
          ]}
        >
          {lineElements}
          {lineIndex < lines.length - 1 ? '\n' : ''}
        </Text>
      );
    });
  };

  return (
    <>
      <View style={styles.wrapper}>
        <View style={styles.avatarLabel}>
          <Bot size={22} color={Colors.primary} strokeWidth={2} />
        </View>

        <Pressable
          style={styles.bubbleWrapper}
          onLongPress={isLoading ? undefined : handleLongPress}
          delayLongPress={350}
        >
          <View ref={bubbleRef} style={styles.bubble} collapsable={false}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>{text}{dots}</Text>
                <View style={styles.loadingDots}>
                  <View style={[styles.dot, styles.dot1]} />
                  <View style={[styles.dot, styles.dot2]} />
                  <View style={[styles.dot, styles.dot3]} />
                </View>
              </View>
            ) : (
              <View>
                {renderMarkdown(text)}
                {diagnosisCard && (
                  <DiagnosisCard
                    issue={diagnosisCard.issue}
                    recommendation={diagnosisCard.recommendation}
                  />
                )}
              </View>
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
              style={[styles.menu, menuPosition, { left: menuLeft }]}
              onLayout={handleMenuLayout}
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
  wrapper: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xxl,
  },
  avatarLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  bubbleWrapper: {},
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

  // Loading state
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    gap: Spacing.xs,
  },
  loadingText: {
    fontSize: Typography.bodyLg,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
    opacity: 0.7,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 2,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.onBackground,
    opacity: 0.5,
  },
  dot1: { opacity: 0.4 },
  dot2: { opacity: 0.6 },
  dot3: { opacity: 0.8 },
});
