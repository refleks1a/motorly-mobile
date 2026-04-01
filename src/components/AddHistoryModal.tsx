import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  ScrollView,
} from 'react-native';
import { X, ChevronDown } from 'lucide-react-native';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

export interface ServiceRecordInput {
  serviceType: string;
  date: string;
  mileageAtService: number;
  shopName?: string;
  cost?: number;
  currency?: string;
}

interface AddHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (record: ServiceRecordInput) => void;
}

// Date validation helpers
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

export const AddHistoryModal: React.FC<AddHistoryModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [serviceType, setServiceType] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dateError, setDateError] = useState('');
  const [mileage, setMileage] = useState('');
  const [mileageUnit, setMileageUnit] = useState('km');
  const [showMileageUnitDropdown, setShowMileageUnitDropdown] = useState(false);
  const [shopName, setShopName] = useState('');
  const [cost, setCost] = useState('');
  const [currency, setCurrency] = useState('AZN');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  const [internalVisible, setInternalVisible] = useState(visible);
  const slideAnim = useRef(new Animated.Value(600)).current;

  const currencies = [
    { code: 'AZN', symbol: '₼', name: 'Manat' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  ];

  const mileageUnits = [
    { code: 'km', name: 'Kilometers' },
    { code: 'mi', name: 'Miles' },
  ];

  // Reset form when opened
  useEffect(() => {
    if (visible) {
      setServiceType('');
      setDate(new Date().toISOString().split('T')[0]);
      setDateError('');
      setMileage('');
      setMileageUnit('km');
      setShowMileageUnitDropdown(false);
      setShopName('');
      setCost('');
      setCurrency('AZN');
      setShowCurrencyDropdown(false);
      
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
  }, [visible, slideAnim]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showCurrencyDropdown) {
        setShowCurrencyDropdown(false);
      }
      if (showMileageUnitDropdown) {
        setShowMileageUnitDropdown(false);
      }
    };

    // Add event listener when dropdown is open
    if (showCurrencyDropdown || showMileageUnitDropdown) {
      // Use a small timeout to ensure the click event is captured
      const timer = setTimeout(() => {
        // This will be handled by the TouchableWithoutFeedback in the modal
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showCurrencyDropdown, showMileageUnitDropdown]);

  // Validate date whenever it changes
  useEffect(() => {
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
  }, [date]);

  const handleDateChange = (text: string) => {
    // Remove all non-digit characters
    const digitsOnly = text.replace(/\D/g, '');
    
    // Limit to 8 digits (YYYYMMDD)
    const limitedDigits = digitsOnly.slice(0, 8);
    
    // Auto-format with dashes
    let formatted = limitedDigits;
    if (limitedDigits.length > 4) {
      formatted = `${limitedDigits.slice(0, 4)}-${limitedDigits.slice(4)}`;
    }
    if (limitedDigits.length > 6) {
      formatted = `${limitedDigits.slice(0, 4)}-${limitedDigits.slice(4, 6)}-${limitedDigits.slice(6)}`;
    }
    
    setDate(formatted);
  };

  const handleSave = () => {
    if (!serviceType.trim() || !date.trim() || !mileage.trim() || dateError) return;
    
    onSave({
      serviceType: serviceType.trim(),
      date: date.trim(),
      mileageAtService: parseInt(mileage, 10) || 0,
      shopName: shopName.trim() || undefined,
      cost: cost.trim() ? parseFloat(cost) : undefined,
      currency: cost.trim() ? currency : undefined,
    });
    onClose();
  };

  const isSaveDisabled = !serviceType.trim() || !date.trim() || !mileage.trim() || !!dateError;

  const selectedCurrency = currencies.find(c => c.code === currency) || currencies[0];
  const selectedMileageUnit = mileageUnits.find(u => u.code === mileageUnit) || mileageUnits[0];

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
            setShowCurrencyDropdown(false);
            setShowMileageUnitDropdown(false);
          }}
        >
          <View>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.titleText}>Add Service History</Text>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                  <X size={24} color={Colors.onSurfaceVariant} strokeWidth={2} />
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Service Type</Text>
                  <TextInput
                    style={styles.input}
                    value={serviceType}
                    onChangeText={(text) => {
                      setServiceType(text);
                      setShowCurrencyDropdown(false);
                      setShowMileageUnitDropdown(false);
                    }}
                    onFocus={() => {
                      setShowCurrencyDropdown(false);
                      setShowMileageUnitDropdown(false);
                    }}
                    placeholder="e.g. Oil Change"
                    placeholderTextColor={Colors.outlineVariant}
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 0.7 }]}>
                    <Text style={styles.label}>Date</Text>
                    <TextInput
                      style={[styles.dateInput, dateError && styles.inputError]}
                      value={date}
                      onChangeText={(text) => {
                        handleDateChange(text);
                        setShowCurrencyDropdown(false);
                        setShowMileageUnitDropdown(false);
                      }}
                      onFocus={() => {
                        setShowCurrencyDropdown(false);
                        setShowMileageUnitDropdown(false);
                      }}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={Colors.outlineVariant}
                      keyboardType="numbers-and-punctuation"
                      maxLength={10}
                    />
                    {dateError ? (
                      <Text style={styles.errorText}>{dateError}</Text>
                    ) : null}
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Odometer</Text>
                    <View style={styles.mileageContainer}>
                      <TextInput
                        style={styles.mileageInput}
                        value={mileage}
                        onChangeText={(text) => {
                          setMileage(text);
                          setShowCurrencyDropdown(false);
                          setShowMileageUnitDropdown(false);
                        }}
                        onFocus={() => {
                          setShowCurrencyDropdown(false);
                          setShowMileageUnitDropdown(false);
                        }}
                        keyboardType="numeric"
                        placeholder="e.g. 45000"
                        placeholderTextColor={Colors.outlineVariant}
                      />
                      <TouchableOpacity 
                        style={styles.mileageUnitSelector}
                        onPress={() => {
                          setShowMileageUnitDropdown(!showMileageUnitDropdown);
                          setShowCurrencyDropdown(false);
                        }}
                      >
                        <Text style={styles.mileageUnitText}>{selectedMileageUnit.code}</Text>
                        <ChevronDown size={16} color={Colors.onSurfaceVariant} />
                      </TouchableOpacity>
                    </View>
                    
                    {showMileageUnitDropdown && (
                      <TouchableWithoutFeedback onPress={() => setShowMileageUnitDropdown(false)}>
                        <View style={styles.dropdownContainer}>
                          <View style={[styles.dropdown, styles.mileageDropdown]}>
                            <ScrollView 
                              style={styles.dropdownScroll}
                              showsVerticalScrollIndicator={false}
                              nestedScrollEnabled={true}
                            >
                              {mileageUnits.map((unit) => (
                                <TouchableOpacity
                                  key={unit.code}
                                  style={[
                                    styles.dropdownItem,
                                    mileageUnit === unit.code && styles.dropdownItemSelected
                                  ]}
                                  onPress={() => {
                                    setMileageUnit(unit.code);
                                    setShowMileageUnitDropdown(false);
                                  }}
                                >
                                  <Text style={styles.dropdownItemText}>
                                    {unit.name} ({unit.code})
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>
                        </View>
                      </TouchableWithoutFeedback>
                    )}
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 2 }]}>
                    <Text style={styles.label}>Shop Name (Optional)</Text>
                    <TextInput
                      style={styles.input}
                      value={shopName}
                      onChangeText={(text) => {
                        setShopName(text);
                        setShowCurrencyDropdown(false);
                        setShowMileageUnitDropdown(false);
                      }}
                      onFocus={() => {
                        setShowCurrencyDropdown(false);
                        setShowMileageUnitDropdown(false);
                      }}
                      placeholder="e.g. City Center Motors"
                      placeholderTextColor={Colors.outlineVariant}
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Cost (Optional)</Text>
                    <View style={styles.costContainer}>
                      <TextInput
                        style={styles.costInput}
                        value={cost}
                        onChangeText={(text) => {
                          setCost(text);
                          setShowCurrencyDropdown(false);
                          setShowMileageUnitDropdown(false);
                        }}
                        onFocus={() => {
                          setShowCurrencyDropdown(false);
                          setShowMileageUnitDropdown(false);
                        }}
                        keyboardType="numeric"
                        placeholder="0.00"
                        placeholderTextColor={Colors.outlineVariant}
                      />
                      <TouchableOpacity 
                        style={styles.currencySelector}
                        onPress={() => {
                          setShowCurrencyDropdown(!showCurrencyDropdown);
                          setShowMileageUnitDropdown(false);
                        }}
                      >
                        <Text style={styles.currencyText}>{selectedCurrency.symbol}</Text>
                        <ChevronDown size={16} color={Colors.onSurfaceVariant} />
                      </TouchableOpacity>
                    </View>
                    
                    {showCurrencyDropdown && (
                      <TouchableWithoutFeedback onPress={() => setShowCurrencyDropdown(false)}>
                        <View style={styles.dropdownContainer}>
                          <View style={styles.dropdown}>
                            <ScrollView 
                              style={styles.dropdownScroll}
                              showsVerticalScrollIndicator={false}
                              nestedScrollEnabled={true}
                            >
                              {currencies.map((curr) => (
                                <TouchableOpacity
                                  key={curr.code}
                                  style={[
                                    styles.dropdownItem,
                                    currency === curr.code && styles.dropdownItemSelected
                                  ]}
                                  onPress={() => {
                                    setCurrency(curr.code);
                                    setShowCurrencyDropdown(false);
                                  }}
                                >
                                  <Text style={styles.dropdownItemText}>
                                    {curr.symbol} {curr.name} ({curr.code})
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>
                        </View>
                      </TouchableWithoutFeedback>
                    )}
                  </View>
                </View>

              </View>

              {/* Actions */}
              <View style={styles.footer}>
                <TouchableOpacity 
                  style={[styles.button, isSaveDisabled && styles.buttonDisabled]} 
                  onPress={handleSave} 
                  activeOpacity={0.8}
                  disabled={isSaveDisabled}
                >
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              </View>
          </View>
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
  form: {
    gap: Spacing.lg,
    marginBottom: Spacing.xxxl,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: Typography.labelMd,
    fontFamily: Typography.fontBody,
    fontWeight: Typography.weightSemiBold,
    color: Colors.onSurfaceVariant,
  },
  input: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.lg,
    height: 56,
    fontSize: Typography.bodyLg,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
  },
  dateInput: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.lg,
    height: 56,
    fontSize: Typography.bodyLg,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
    textAlign: 'center', // Center text since date has fixed length
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
  mileageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  mileageInput: {
    flex: 0.6, // Reduced from 0.75 to 0.6 (60% of container width)
    height: 56,
    fontSize: Typography.bodyLg,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
    paddingHorizontal: Spacing.lg,
  },
  mileageUnitSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.4, // Increased from 0.25 to 0.4 (40% of container width)
    height: 56,
    backgroundColor: Colors.surfaceContainerHigh,
    borderLeftWidth: 1,
    borderLeftColor: Colors.outlineVariant,
  },
  mileageUnitText: {
    fontSize: Typography.bodyLg,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
    marginRight: Spacing.xs,
  },
  mileageDropdown: {
    top: 90, // Position below the input field (label height ~20 + gap 8 + input height 56 + buffer 6)
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  costInput: {
    flex: 1,
    height: 56,
    fontSize: Typography.bodyLg,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
    paddingHorizontal: Spacing.lg,
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    height: 56,
    backgroundColor: Colors.surfaceContainerHigh,
    borderLeftWidth: 1,
    borderLeftColor: Colors.outlineVariant,
  },
  currencyText: {
    fontSize: Typography.bodyLg,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
    marginRight: Spacing.xs,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  dropdown: {
    position: 'absolute',
    top: 90, // Position below the input field (label height ~20 + gap 8 + input height 56 + buffer 6)
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    borderWidth: 1, // More prominent border
    borderColor: Colors.outlineVariant, // More visible border color
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxHeight: 180, // Limit height to prevent overflow
    overflow: 'hidden', // Prevent content from overflowing rounded corners
  },
  dropdownScroll: {
    maxHeight: 180,
  },
  dropdownItem: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerLow,
  },
  dropdownItemSelected: {
    backgroundColor: '#fff0e6', // Light orange background (15% opacity of primary color)
  },
  dropdownItemText: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
  },
  footer: {
    marginTop: 'auto',
  },
  button: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
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
});
