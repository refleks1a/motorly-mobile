import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { X, Trash2, Wrench, Clock, AlertTriangle, CheckCircle2, Check } from 'lucide-react-native';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

export type StatusType = 'scheduled' | 'priority' | 'good';

export interface MaintenanceItem {
  id: string;
  title: string;
  subtitle: string;
  status: StatusType;
  icon: React.ReactNode;
}

interface MaintenanceDetailModalProps {
  visible: boolean;
  onClose: () => void;
  item: MaintenanceItem | null;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updatedItem: MaintenanceItem) => void;
}

const STATUS_ICON: Record<StatusType, React.ReactNode> = {
  scheduled: <Clock size={20} color="#F59E0B" strokeWidth={2.5} />,
  priority: <AlertTriangle size={20} color={Colors.error} strokeWidth={2.5} />,
  good: <CheckCircle2 size={20} color={Colors.success} strokeWidth={2.5} />,
};

const STATUS_DISPLAY_NAMES: Record<StatusType, string> = {
  scheduled: 'Scheduled',
  priority: 'Priority',
  good: 'Good',
};

export const MaintenanceDetailModal: React.FC<MaintenanceDetailModalProps> = ({
  visible,
  onClose,
  item,
  onDelete,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState<MaintenanceItem | null>(null);
  const [internalVisible, setInternalVisible] = useState(visible);
  const slideAnim = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    if (visible && item) {
      setIsEditing(false);
      setEditedItem({ ...item });
      setInternalVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 600,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setInternalVisible(false);
      });
    }
  }, [visible, item, slideAnim]);

  const handleDelete = () => {
    if (!item) return;
    
    Alert.alert(
      'Delete Maintenance Item',
      'Are you sure you want to delete this maintenance item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete(item.id);
            onClose();
          },
        },
      ]
    );
  };

  const handleSave = () => {
    if (editedItem && item) {
      onUpdate(item.id, editedItem);
    }
    setIsEditing(false);
  };

  const handleFieldChange = (field: keyof MaintenanceItem, value: string) => {
    if (!editedItem) return;
    
    const updatedItem = { ...editedItem };
    
    if (field === 'title') {
      updatedItem.title = value;
    } else if (field === 'subtitle') {
      updatedItem.subtitle = value;
    } else if (field === 'status') {
      updatedItem.status = value as StatusType;
    }
    
    setEditedItem(updatedItem);
  };

  const handleCancelEdit = () => {
    if (item) {
      setEditedItem({ ...item });
    }
    setIsEditing(false);
  };

  if (!item || !editedItem) return null;

  if (!internalVisible && !visible) return null;

  return (
    <Modal
      visible={internalVisible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
        
        <Animated.View 
          style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
          onStartShouldSetResponder={() => true}
          onResponderRelease={() => {
            Keyboard.dismiss();
          }}
        >
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.titleText}>Maintenance Details</Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <X size={24} color={Colors.onSurfaceVariant} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Main Content */}
            <View style={styles.content}>
              {/* Service Icon and Summary */}
              <View style={styles.summaryCard}>
                <View style={styles.iconBadge}>
                  {editedItem.icon}
                </View>
                <View style={styles.summaryText}>
                  {isEditing ? (
                    <>
                      <View style={styles.summaryEditRow}>
                        <View style={styles.summaryEditField}>
                          <Text style={styles.summaryEditLabel}>Service Name</Text>
                          <TextInput
                            style={styles.summaryEditInput}
                            value={editedItem.title}
                            onChangeText={(value) => handleFieldChange('title', value)}
                            placeholder="e.g. Oil Change"
                          />
                        </View>
                      </View>
                      <View style={styles.summaryEditRow}>
                        <View style={styles.summaryEditField}>
                          <Text style={styles.summaryEditLabel}>Due / Subtitle</Text>
                          <TextInput
                            style={styles.summaryEditInput}
                            value={editedItem.subtitle}
                            onChangeText={(value) => handleFieldChange('subtitle', value)}
                            placeholder="e.g. Due in 500 km"
                          />
                        </View>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={styles.summaryTitle}>
                        {editedItem.title}
                      </Text>
                      <Text style={styles.summarySubtitle}>
                        {editedItem.subtitle}
                      </Text>
                    </>
                  )}
                </View>
              </View>

              {/* Details */}
              <View style={styles.detailsGrid}>
                {/* Status */}
                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    {STATUS_ICON[editedItem.status]}
                  </View>
                  <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>Status</Text>
                    {isEditing ? (
                      <View style={styles.statusChipsContainer}>
                        {(['scheduled', 'priority', 'good'] as const).map((s) => (
                          <TouchableOpacity
                            key={s}
                            style={[
                              styles.statusChip,
                              editedItem.status === s && styles.statusChipActive,
                            ]}
                            onPress={() => handleFieldChange('status', s)}
                            activeOpacity={0.8}
                          >
                            <Text
                              style={[
                                styles.statusChipText,
                                editedItem.status === s && styles.statusChipTextActive,
                              ]}
                            >
                              {STATUS_DISPLAY_NAMES[s]}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.detailValue}>
                        {STATUS_DISPLAY_NAMES[editedItem.status]}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.footer}>
              {isEditing ? (
                <>
                  <TouchableOpacity 
                    style={[styles.button, styles.cancelButton]} 
                    onPress={handleCancelEdit}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.button, styles.saveButton]} 
                    onPress={handleSave}
                    activeOpacity={0.8}
                  >
                    <Check size={20} color={Colors.onPrimary} />
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity 
                    style={[styles.button, styles.editButton]} 
                    onPress={() => setIsEditing(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.button, styles.deleteButton]} 
                    onPress={handleDelete}
                    activeOpacity={0.8}
                  >
                    <Trash2 size={20} color={Colors.onPrimary} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    maxHeight: '85%',
  },
  scrollView: {
    maxHeight: '100%',
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  titleText: {
    fontSize: Typography.titleLg,
    fontWeight: Typography.weightExtraBold,
    fontFamily: Typography.fontDisplay,
    color: Colors.onBackground,
  },
  content: {
    gap: Spacing.xl,
    marginBottom: Spacing.xxxl,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: Radius.md,
    backgroundColor: '#fce8e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryText: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: Typography.headlineMd,
    fontWeight: Typography.weightExtraBold,
    fontFamily: Typography.fontDisplay,
    color: Colors.onBackground,
    marginBottom: Spacing.xs,
  },
  summarySubtitle: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
  },
  summaryEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  summaryEditField: {
    flex: 1,
  },
  summaryEditLabel: {
    fontSize: Typography.labelSm,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
    marginBottom: 2,
  },
  summaryEditInput: {
    fontSize: Typography.titleLg,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  detailsGrid: {
    gap: Spacing.lg,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    padding: Spacing.lg,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailText: {
    flex: 1,
  },
  detailLabel: {
    fontSize: Typography.labelMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: Typography.bodyLg,
    fontFamily: Typography.fontBody,
    fontWeight: Typography.weightSemiBold,
    color: Colors.onBackground,
  },
  statusChipsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statusChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerLow,
  },
  statusChipActive: {
    backgroundColor: Colors.primary,
  },
  statusChipText: {
    fontSize: Typography.labelMd,
    fontFamily: Typography.fontBody,
    fontWeight: Typography.weightSemiBold,
    color: Colors.onSurfaceVariant,
  },
  statusChipTextActive: {
    color: Colors.onPrimary,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: 'auto',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: Radius.sm,
    gap: Spacing.sm,
  },
  editButton: {
    backgroundColor: Colors.primaryContainer,
  },
  saveButton: {
    backgroundColor: Colors.success,
  },
  cancelButton: {
    backgroundColor: Colors.surfaceContainerHigh,
  },
  deleteButton: {
    backgroundColor: Colors.error,
  },
  buttonText: {
    color: Colors.onPrimary,
    fontSize: Typography.titleSm,
    fontWeight: Typography.weightBold,
    fontFamily: Typography.fontBody,
  },
  cancelButtonText: {
    color: Colors.onSurface,
    fontSize: Typography.titleSm,
    fontWeight: Typography.weightBold,
    fontFamily: Typography.fontBody,
  },
});