import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import { Fuel, ChevronRight, Trash2 } from 'lucide-react-native';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import type { FuelLog } from '@/types';

interface SwipeableFuelLogCardProps {
  log: FuelLog;
  onPress: () => void;
  onDelete: (id: string) => void;
}

const SWIPE_THRESHOLD = -80; // Minimum swipe distance to trigger delete
const DELETE_BUTTON_WIDTH = 80;

export const SwipeableFuelLogCard: React.FC<SwipeableFuelLogCardProps> = ({
  log,
  onPress,
  onDelete,
}) => {
  const [isSwiped, setIsSwiped] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);
  const swipeAnim = useRef(new Animated.Value(0)).current;
  const containerRef = useRef<View>(null);

  // Track the current animation value
  useEffect(() => {
    const listenerId = swipeAnim.addListener(({ value }) => {
      setCurrentOffset(value);
    });
    
    return () => {
      swipeAnim.removeListener(listenerId);
    };
  }, [swipeAnim]);

  const animateBackToZero = () => {
    Animated.spring(swipeAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
    setIsSwiped(false);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal swipes
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow swiping left (negative dx)
        if (gestureState.dx < 0) {
          swipeAnim.setValue(Math.max(gestureState.dx, -DELETE_BUTTON_WIDTH));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Auto-complete swipe if past 40px (50% of threshold)
        const SWIPE_AUTO_COMPLETE_THRESHOLD = -40; // 50% of -80px
        if (gestureState.dx < SWIPE_AUTO_COMPLETE_THRESHOLD) {
          // User swiped past 40px - auto-complete to full delete position
          Animated.spring(swipeAnim, {
            toValue: -DELETE_BUTTON_WIDTH,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }).start();
          setIsSwiped(true);
        } else if (gestureState.dx < 0) {
          // Swiped left but not enough - animate back to zero
          animateBackToZero();
        }
        // If dx >= 0 (right swipe or no movement), do nothing
      },
    })
  ).current;

  const resetSwipe = () => {
    if (isSwiped) {
      animateBackToZero();
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Fuel Log',
      'Are you sure you want to delete this fuel log?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete(log.id);
            animateBackToZero();
          },
        },
      ]
    );
  };

  const handleCardPress = () => {
    // If card is offset at all (negative value), animate back
    if (currentOffset < 0) {
      animateBackToZero();
      return; // Don't open detail modal when resetting
    }
    onPress();
  };

  // Auto-reset after 1.8 seconds if swiped (as requested)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSwiped) {
      timer = setTimeout(() => {
        animateBackToZero();
      }, 1800); // Auto-reset after 1.8 seconds
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isSwiped]);

  const formattedDate = new Date(log.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        // Handle click outside - if card is swiped, reset it
        if (currentOffset < 0) {
          animateBackToZero();
        }
      }}
    >
      <View style={styles.container} ref={containerRef}>
        {/* Delete Button (hidden behind card) */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <Trash2 size={24} color={Colors.onPrimary} />
        </TouchableOpacity>

        {/* Swipeable Card */}
        <Animated.View
          style={[
            styles.cardWrapper,
            {
              transform: [{ translateX: swipeAnim }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity
            style={styles.card}
            onPress={handleCardPress}
            activeOpacity={0.8}
            delayPressIn={200}
          >
            {/* Icon badge */}
            <View style={styles.iconBadge}>
              <Fuel size={22} color={Colors.primary} strokeWidth={2} />
            </View>

            {/* Text */}
            <View style={styles.textGroup}>
              <Text style={styles.title}>
                {log.liters.toFixed(1)}L — ₼{log.totalCost.toFixed(2)}
              </Text>
              <Text style={styles.subtitle}>
                {formattedDate}{log.station ? ` · ${log.station}` : ''}
              </Text>
            </View>

            {/* Chevron and Cost per Liter */}
            <View style={styles.right}>
              <Text style={styles.costPerLiter}>
                ₼{log.costPerLiter.toFixed(2)}/L
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  deleteButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: DELETE_BUTTON_WIDTH,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radius.md,
  },
  deleteText: {
    fontSize: Typography.labelSm,
    fontFamily: Typography.fontBody,
    color: Colors.onPrimary,
    fontWeight: Typography.weightSemiBold,
    marginTop: Spacing.xs,
  },
  cardWrapper: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: Radius.sm,
    backgroundColor: '#fce8e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textGroup: {
    flex: 1,
  },
  title: {
    fontSize: Typography.titleSm,
    fontWeight: Typography.weightSemiBold,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
  },
  right: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  costPerLiter: {
    fontSize: Typography.labelMd,
    fontWeight: Typography.weightSemiBold,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
  },
});