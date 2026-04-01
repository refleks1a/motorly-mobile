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
import { X, Trash2, Fuel, Calendar, MapPin, DollarSign, FileText, Check } from 'lucide-react-native';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import type { FuelLog } from '@/types';

interface FuelLogDetailModalProps {
  visible: boolean;
  onClose: () => void;
  log: FuelLog | null;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updatedLog: FuelLog) => void;
}

export const FuelLogDetailModal: React.FC<FuelLogDetailModalProps> = ({
  visible,
  onClose,
  log,
  onDelete,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLog, setEditedLog] = useState<FuelLog | null>(null);
  const [internalVisible, setInternalVisible] = useState(visible);
  const slideAnim = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    if (visible && log) {
      setIsEditing(false);
      setEditedLog({ ...log });
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
  }, [visible, log, slideAnim]);

  const handleDelete = () => {
    if (!log) return;
    
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
            onClose();
          },
        },
      ]
    );
  };

  const handleSave = () => {
    if (editedLog && log) {
      onUpdate(log.id, editedLog);
    }
    setIsEditing(false);
  };

  const handleFieldChange = (field: keyof FuelLog, value: string) => {
    if (!editedLog) return;
    
    const updatedLog = { ...editedLog };
    
    if (field === 'date') {
      updatedLog.date = value;
    } else if (field === 'liters') {
      updatedLog.liters = parseFloat(value) || 0;
      // Recalculate total cost if cost per liter exists
      if (updatedLog.costPerLiter > 0) {
        updatedLog.totalCost = updatedLog.liters * updatedLog.costPerLiter;
      }
    } else if (field === 'costPerLiter') {
      updatedLog.costPerLiter = parseFloat(value) || 0;
      // Recalculate total cost
      updatedLog.totalCost = updatedLog.liters * updatedLog.costPerLiter;
    } else if (field === 'station') {
      updatedLog.station = value;
    } else if (field === 'mileageAtFill') {
      updatedLog.mileageAtFill = parseInt(value) || 0;
    }
    
    setEditedLog(updatedLog);
  };

  const handleCancelEdit = () => {
    if (log) {
      setEditedLog({ ...log });
    }
    setIsEditing(false);
  };

  if (!log || !editedLog) return null;

  const formattedDate = new Date(editedLog.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedShortDate = new Date(editedLog.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const hasMileageData = editedLog.mileageAtFill > 0;

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
              <Text style={styles.titleText}>Fuel Log Details</Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <X size={24} color={Colors.onSurfaceVariant} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Main Content */}
            <View style={styles.content}>
              {/* Fuel Icon and Summary */}
              <View style={styles.summaryCard}>
                <View style={styles.iconBadge}>
                  <Fuel size={32} color={Colors.primary} strokeWidth={2} />
                </View>
                <View style={styles.summaryText}>
                  {isEditing ? (
                    <>
                      <View style={styles.summaryEditRow}>
                        <View style={styles.summaryEditField}>
                          <Text style={styles.summaryEditLabel}>Fuel Amount (L)</Text>
                          <TextInput
                            style={styles.summaryEditInput}
                            value={editedLog.liters.toString()}
                            onChangeText={(value) => handleFieldChange('liters', value)}
                            keyboardType="numeric"
                            placeholder="0.0"
                          />
                        </View>
                        <Text style={styles.summarySeparator}>—</Text>
                        <View style={styles.summaryEditField}>
                          <Text style={styles.summaryEditLabel}>Total Cost (₼)</Text>
                          <TextInput
                            style={styles.summaryEditInput}
                            value={editedLog.totalCost.toString()}
                            onChangeText={(value) => {
                              if (!editedLog) return;
                              const total = parseFloat(value) || 0;
                              const updatedLog = { ...editedLog };
                              updatedLog.totalCost = total;
                              // Recalculate cost per liter if liters > 0
                              if (updatedLog.liters > 0) {
                                updatedLog.costPerLiter = total / updatedLog.liters;
                              }
                              setEditedLog(updatedLog);
                            }}
                            keyboardType="numeric"
                            placeholder="0.00"
                          />
                        </View>
                      </View>
                      <Text style={styles.summaryEditHint}>
                        Changing total cost updates cost per liter automatically
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.summaryTitle}>
                        {editedLog.liters.toFixed(1)}L — ₼{editedLog.totalCost.toFixed(2)}
                      </Text>
                      <Text style={styles.summarySubtitle}>
                        {formattedShortDate}
                      </Text>
                    </>
                  )}
                </View>
              </View>

              {/* Details - Simplified layout */}
              <View style={styles.detailsGrid}>
                {/* Date */}
                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <Calendar size={18} color={Colors.onSurfaceVariant} />
                  </View>
                  <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>Date</Text>
                    {isEditing ? (
                      <TextInput
                        style={styles.editInput}
                        value={editedLog.date}
                        onChangeText={(value) => handleFieldChange('date', value)}
                        placeholder="YYYY-MM-DD"
                      />
                    ) : (
                      <Text style={styles.detailValue}>{formattedDate}</Text>
                    )}
                  </View>
                </View>

                {/* Cost per Liter */}
                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <DollarSign size={18} color={Colors.onSurfaceVariant} />
                  </View>
                  <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>Cost per Liter</Text>
                    {isEditing ? (
                      <TextInput
                        style={styles.editInput}
                        value={editedLog.costPerLiter.toString()}
                        onChangeText={(value) => handleFieldChange('costPerLiter', value)}
                        keyboardType="numeric"
                        placeholder="0.00"
                      />
                    ) : (
                      <Text style={styles.detailValue}>₼{editedLog.costPerLiter.toFixed(2)}/L</Text>
                    )}
                  </View>
                </View>

                {/* Station */}
                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <MapPin size={18} color={Colors.onSurfaceVariant} />
                  </View>
                  <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>Station</Text>
                    {isEditing ? (
                      <TextInput
                        style={styles.editInput}
                        value={editedLog.station || ''}
                        onChangeText={(value) => handleFieldChange('station', value)}
                        placeholder="Station name"
                      />
                    ) : (
                      <Text style={styles.detailValue}>{editedLog.station || 'Not specified'}</Text>
                    )}
                  </View>
                </View>

                {/* Mileage */}
                {hasMileageData && (
                  <View style={styles.detailItem}>
                    <View style={styles.detailIcon}>
                      <FileText size={18} color={Colors.onSurfaceVariant} />
                    </View>
                    <View style={styles.detailText}>
                      <Text style={styles.detailLabel}>Mileage at Fill</Text>
                      {isEditing ? (
                        <TextInput
                          style={styles.editInput}
                          value={editedLog.mileageAtFill.toString()}
                          onChangeText={(value) => handleFieldChange('mileageAtFill', value)}
                          keyboardType="numeric"
                          placeholder="0"
                        />
                      ) : (
                        <Text style={styles.detailValue}>
                          {editedLog.mileageAtFill.toLocaleString()} km
                        </Text>
                      )}
                    </View>
                  </View>
                )}
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
                    <Text style={styles.buttonText}>Cancel</Text>
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
  summarySeparator: {
    fontSize: Typography.titleLg,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
    marginHorizontal: Spacing.sm,
  },
  summaryEditHint: {
    fontSize: Typography.labelSm,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
    fontStyle: 'italic',
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
  editInput: {
    fontSize: Typography.bodyLg,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
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
});