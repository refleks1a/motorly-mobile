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
import { X, Trash2, Wrench, Calendar, MapPin, DollarSign, FileText, Check } from 'lucide-react-native';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import type { ServiceRecord } from '@/types';

interface ServiceHistoryDetailModalProps {
  visible: boolean;
  onClose: () => void;
  record: ServiceRecord | null;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updatedRecord: ServiceRecord) => void;
}

// Date validation helpers (copied from AddHistoryModal)
const isValidDateFormat = (dateStr: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(dateStr);
};

const isValidDate = (dateStr: string): boolean => {
  if (!isValidDateFormat(dateStr)) return false;
  
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  
  // Check if the date string matches the parsed date (catches invalid dates like 2024-02-30)
  const [year, month, day] = dateStr.split('-').map(Number);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

const isDateInValidRange = (dateStr: string): boolean => {
  if (!isValidDate(dateStr)) return false;
  
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  
  const minDate = new Date('1980-01-01'); // Reasonable minimum date
  
  return date >= minDate && date <= today;
};

// Currency symbol mapping
const getCurrencySymbol = (currencyCode?: string): string => {
  switch (currencyCode) {
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'TRY': return '₺';
    case 'AZN':
    default:
      return '₼';
  }
};

export const ServiceHistoryDetailModal: React.FC<ServiceHistoryDetailModalProps> = ({
  visible,
  onClose,
  record,
  onDelete,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRecord, setEditedRecord] = useState<ServiceRecord | null>(null);
  const [dateError, setDateError] = useState('');
  const [internalVisible, setInternalVisible] = useState(visible);
  const slideAnim = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    if (visible && record) {
      setIsEditing(false);
      setDateError('');
      // Ensure record has currency field (default to AZN if missing)
      const recordWithCurrency = {
        ...record,
        currency: record.currency || 'AZN',
      };
      setEditedRecord(recordWithCurrency);
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
  }, [visible, record, slideAnim]);

  // Validate date whenever it changes in edit mode
  useEffect(() => {
    if (!isEditing || !editedRecord) return;

    const date = editedRecord.date;
    if (!date.trim()) {
      setDateError('');
      return;
    }

    if (!isValidDateFormat(date)) {
      setDateError('Use format: YYYY-MM-DD');
      return;
    }

    if (!isValidDate(date)) {
      setDateError('Invalid date');
      return;
    }

    if (!isDateInValidRange(date)) {
      const inputDate = new Date(date);
      const today = new Date();
      
      if (inputDate > today) {
        setDateError('Date cannot be in the future');
      } else {
        setDateError('Date must be after 1980');
      }
      return;
    }

    setDateError('');
  }, [editedRecord?.date, isEditing]);

  const handleDelete = () => {
    if (!record) return;
    
    Alert.alert(
      'Delete Service Record',
      'Are you sure you want to delete this service record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete(record.id);
            onClose();
          },
        },
      ]
    );
  };

  const handleSave = () => {
    if (editedRecord && record && !dateError) {
      onUpdate(record.id, editedRecord);
    }
    setIsEditing(false);
  };

  const handleFieldChange = (field: keyof ServiceRecord, value: string) => {
    if (!editedRecord) return;
    
    const updatedRecord = { ...editedRecord };
    
    if (field === 'date') {
      updatedRecord.date = value;
    } else if (field === 'serviceType') {
      updatedRecord.serviceType = value;
    } else if (field === 'mileageAtService') {
      updatedRecord.mileageAtService = parseInt(value) || 0;
    } else if (field === 'shopName') {
      updatedRecord.shopName = value || undefined;
    } else if (field === 'cost') {
      updatedRecord.cost = value ? parseFloat(value) : undefined;
    } else if (field === 'currency') {
      updatedRecord.currency = value || 'AZN';
    }
    
    setEditedRecord(updatedRecord);
  };

  const handleCancelEdit = () => {
    if (record) {
      setEditedRecord({ ...record, currency: record.currency || 'AZN' });
      setDateError('');
    }
    setIsEditing(false);
  };

  if (!record || !editedRecord) return null;

  const formattedDate = new Date(editedRecord.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedShortDate = new Date(editedRecord.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const currencySymbol = getCurrencySymbol(editedRecord.currency);
  const hasCost = editedRecord.cost !== undefined && editedRecord.cost !== null;
  const hasShopName = editedRecord.shopName && editedRecord.shopName.trim() !== '';

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
              <Text style={styles.titleText}>Service Details</Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <X size={24} color={Colors.onSurfaceVariant} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Main Content */}
            <View style={styles.content}>
              {/* Service Icon and Summary */}
              <View style={styles.summaryCard}>
                <View style={styles.iconBadge}>
                  <Wrench size={32} color={Colors.primary} strokeWidth={2} />
                </View>
                <View style={styles.summaryText}>
                  {isEditing ? (
                    <>
                      <View style={styles.summaryEditRow}>
                        <View style={styles.summaryEditField}>
                          <Text style={styles.summaryEditLabel}>Service Type</Text>
                          <TextInput
                            style={styles.summaryEditInput}
                            value={editedRecord.serviceType}
                            onChangeText={(value) => handleFieldChange('serviceType', value)}
                            placeholder="e.g. Oil Change"
                          />
                        </View>
                      </View>
                      {hasCost && (
                        <View style={styles.summaryEditRow}>
                          <View style={styles.summaryEditField}>
                            <Text style={styles.summaryEditLabel}>Cost</Text>
                            <View style={styles.costInputContainer}>
                              <TextInput
                                style={styles.costInput}
                                value={editedRecord.cost?.toString() || ''}
                                onChangeText={(value) => handleFieldChange('cost', value)}
                                keyboardType="numeric"
                                placeholder="0.00"
                              />
                              <TextInput
                                style={styles.currencyInput}
                                value={editedRecord.currency || 'AZN'}
                                onChangeText={(value) => handleFieldChange('currency', value)}
                                placeholder="AZN"
                                maxLength={3}
                              />
                            </View>
                          </View>
                        </View>
                      )}
                    </>
                  ) : (
                    <>
                      <Text style={styles.summaryTitle}>
                        {editedRecord.serviceType}
                      </Text>
                      <Text style={styles.summarySubtitle}>
                        {formattedShortDate}
                        {hasCost && ` · ${currencySymbol}${editedRecord.cost?.toFixed(2)}`}
                      </Text>
                    </>
                  )}
                </View>
              </View>

              {/* Details */}
              <View style={styles.detailsGrid}>
                {/* Date */}
                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <Calendar size={18} color={Colors.onSurfaceVariant} />
                  </View>
                  <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>Date</Text>
                    {isEditing ? (
                      <>
                        <TextInput
                          style={[styles.editInput, dateError && styles.inputError]}
                          value={editedRecord.date}
                          onChangeText={(value) => handleFieldChange('date', value)}
                          placeholder="YYYY-MM-DD"
                        />
                        {dateError ? (
                          <Text style={styles.errorText}>{dateError}</Text>
                        ) : null}
                      </>
                    ) : (
                      <Text style={styles.detailValue}>{formattedDate}</Text>
                    )}
                  </View>
                </View>

                {/* Mileage */}
                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <FileText size={18} color={Colors.onSurfaceVariant} />
                  </View>
                  <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>Mileage at Service</Text>
                    {isEditing ? (
                      <TextInput
                        style={styles.editInput}
                        value={editedRecord.mileageAtService.toString()}
                        onChangeText={(value) => handleFieldChange('mileageAtService', value)}
                        keyboardType="numeric"
                        placeholder="0"
                      />
                    ) : (
                      <Text style={styles.detailValue}>
                        {editedRecord.mileageAtService.toLocaleString()} km
                      </Text>
                    )}
                  </View>
                </View>

                {/* Shop Name */}
                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <MapPin size={18} color={Colors.onSurfaceVariant} />
                  </View>
                  <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>Shop Name</Text>
                    {isEditing ? (
                      <TextInput
                        style={styles.editInput}
                        value={editedRecord.shopName || ''}
                        onChangeText={(value) => handleFieldChange('shopName', value)}
                        placeholder="Shop name (optional)"
                      />
                    ) : (
                      <Text style={styles.detailValue}>
                        {hasShopName ? editedRecord.shopName : 'Not specified'}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Cost (only show if has cost) */}
                {hasCost && (
                  <View style={styles.detailItem}>
                    <View style={styles.detailIcon}>
                      <DollarSign size={18} color={Colors.onSurfaceVariant} />
                    </View>
                    <View style={styles.detailText}>
                      <Text style={styles.detailLabel}>Cost</Text>
                      {isEditing ? (
                        <View style={styles.costEditContainer}>
                          <TextInput
                            style={styles.costEditInput}
                            value={editedRecord.cost?.toString() || ''}
                            onChangeText={(value) => handleFieldChange('cost', value)}
                            keyboardType="numeric"
                            placeholder="0.00"
                          />
                          <TextInput
                            style={styles.currencyEditInput}
                            value={editedRecord.currency || 'AZN'}
                            onChangeText={(value) => handleFieldChange('currency', value)}
                            placeholder="AZN"
                            maxLength={3}
                          />
                        </View>
                      ) : (
                        <Text style={styles.detailValue}>
                          {currencySymbol}{editedRecord.cost?.toFixed(2)} {editedRecord.currency}
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
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.button, styles.saveButton, dateError && styles.buttonDisabled]} 
                      onPress={handleSave}
                      activeOpacity={0.8}
                      disabled={!!dateError}
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
  costInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    overflow: 'hidden',
  },
  costInput: {
    flex: 1,
    fontSize: Typography.titleLg,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  currencyInput: {
    fontSize: Typography.titleLg,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderLeftWidth: 1,
    borderLeftColor: Colors.outlineVariant,
    minWidth: 60,
    textAlign: 'center',
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
  inputError: {
    backgroundColor: Colors.errorContainer,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: Typography.labelMd,
    fontFamily: Typography.fontBody,
    color: Colors.error,
    marginTop: 4,
  },
  costEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  costEditInput: {
    flex: 1,
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
  currencyEditInput: {
    fontSize: Typography.bodyLg,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    minWidth: 60,
    textAlign: 'center',
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
  buttonDisabled: {
    opacity: 0.5,
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
