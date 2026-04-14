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
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Clipboard from 'expo-clipboard';
import { Copy, Pencil } from 'lucide-react-native';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const MENU_WIDTH = 150;

interface Props {
  text: string;
  timestamp?: string;
  onEdit?: () => void;
  imageUri?: string;
}

export const UserMessage: React.FC<Props> = ({ text, timestamp, onEdit, imageUri }) => {
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

  const handleEdit = () => {
    setMenuVisible(false);
    onEdit?.();
  };

  // Fix menu to right side (mirroring right-aligned bubble)
  const menuRight = Spacing.xxl;

  return (
    <>
      <Pressable
        style={styles.wrapper}
        onLongPress={handleLongPress}
        delayLongPress={350}
      >
        <View ref={bubbleRef} style={styles.bubble} collapsable={false}>
          {imageUri && (
            <Image 
              source={{ uri: imageUri }} 
              style={styles.attachedImage} 
              resizeMode="cover" 
            />
          )}
          {text ? <Text style={styles.text}>{text}</Text> : null}
        </View>
      </Pressable>

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
              style={[styles.menu, { top: menuTop, right: menuRight }]}
            >
              {timestamp && <Text style={styles.timestamp}>{timestamp}</Text>}
              {timestamp && <View style={styles.divider} />}

              <TouchableOpacity style={styles.menuItem} onPress={handleCopy} activeOpacity={0.7}>
                <Copy size={16} color="rgba(255,255,255,0.9)" strokeWidth={2} />
                <Text style={styles.menuLabel}>Copy</Text>
              </TouchableOpacity>

              {onEdit && (
                <>
                  <View style={styles.divider} />
                  <TouchableOpacity style={styles.menuItem} onPress={handleEdit} activeOpacity={0.7}>
                    <Pencil size={16} color="rgba(255,255,255,0.9)" strokeWidth={2} />
                    <Text style={styles.menuLabel}>Edit</Text>
                  </TouchableOpacity>
                </>
              )}
            </BlurView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'flex-end',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xxl,
  },
  bubble: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.md,
    borderBottomRightRadius: 4,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    maxWidth: '82%',
  },
  text: {
    fontSize: Typography.bodyLg,
    fontFamily: Typography.fontBody,
    color: Colors.onPrimary,
    lineHeight: 24,
  },
  attachedImage: {
    width: 200,
    height: 200,
    borderRadius: Radius.sm,
    marginBottom: Spacing.sm,
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
