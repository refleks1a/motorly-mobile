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

export interface FuelLogInput {
  date?: string;                    // Optional
  fuelAmount: number;               // Required
  fuelUnit: 'liters' | 'gallons';
  totalCost: number;                // Required
  currency: string;
  pricePerUnit?: number;
  fuelType?: string;                // Changed from enum to string (text input)
  stationName?: string;
  notes?: string;
}

interface AddFuelLogModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (record: FuelLogInput) => void;
}

// Date validation helpers (reused from AddHistoryModal)
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

// Fuel amount validation
const isValidFuelAmount = (amount: string): boolean => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && num <= 200; // Reasonable max: 200 liters/gallons
};

// Cost validation
const isValidCost = (cost: string): boolean => {
  const num = parseFloat(cost);
  return !isNaN(num) && num >= 0 && num <= 10000; // Max $10,000
};

export const AddFuelLogModal: React.FC<AddFuelLogModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dateError, setDateError] = useState('');
  const [fuelAmount, setFuelAmount] = useState('');
  const [fuelAmountError, setFuelAmountError] = useState('');
  const [fuelUnit, setFuelUnit] = useState<'liters' | 'gallons'>('liters');
  const [showFuelUnitDropdown, setShowFuelUnitDropdown] = useState(false);
  const [totalCost, setTotalCost] = useState('');
  const [totalCostError, setTotalCostError] = useState('');
  const [currency, setCurrency] = useState('AZN');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [fuelType, setFuelType] = useState(''); // Changed to string for text input
  const [stationName, setStationName] = useState('');
  const [notes, setNotes] = useState('');

  const [internalVisible, setInternalVisible] = useState(visible);
  const slideAnim = useRef(new Animated.Value(600)).current;

  const currencies = [
    { code: 'AZN', symbol: '₼', name: 'Manat' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  ];

  const fuelUnits = [
    { code: 'liters', name: 'Liters', symbol: 'L' },
    { code: 'gallons', name: 'Gallons', symbol: 'gal' },
  ];

  // Reset form when opened
  useEffect(() => {
    if (visible) {
      setDate(new Date().toISOString().split('T')[0]);
      setDateError('');
      setFuelAmount('');
      setFuelAmountError('');
      setFuelUnit('liters');
      setShowFuelUnitDropdown(false);
      setTotalCost('');
      setTotalCostError('');
      setCurrency('AZN');
      setShowCurrencyDropdown(false);
      setPricePerUnit('');
      setFuelType('');
      setStationName('');
      setNotes('');
      
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
      if (showCurrencyDropdown) setShowCurrencyDropdown(false);
      if (showFuelUnitDropdown) setShowFuelUnitDropdown(false);
    };

    if (showCurrencyDropdown || showFuelUnitDropdown) {
      const timer = setTimeout(() => {
        // This will be handled by the TouchableWithoutFeedback in the modal
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showCurrencyDropdown, showFuelUnitDropdown]);

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

  // Validate fuel amount whenever it changes
  useEffect(() => {
    if (!fuelAmount.trim()) {
      setFuelAmountError('');
      return;
    }

    if (!isValidFuelAmount(fuelAmount)) {
      setFuelAmountError('Invalid amount (0-200)');
      return;
    }

    setFuelAmountError('');
  }, [fuelAmount]);

  // Validate total cost whenever it changes
  useEffect(() => {
    if (!totalCost.trim()) {
      setTotalCostError('');
      return;
    }

    if (!isValidCost(totalCost)) {
      setTotalCostError('Invalid cost (0-10,000)');
      return;
    }

    setTotalCostError('');
  }, [totalCost]);

  // Calculate price per unit when fuel amount or total cost changes
  useEffect(() => {
    if (fuelAmount.trim() && totalCost.trim()) {
      const amount = parseFloat(fuelAmount);
      const cost = parseFloat(totalCost);
      
      if (amount > 0 && cost >= 0) {
        const price = cost / amount;
        setPricePerUnit(price.toFixed(2));
      } else {
        setPricePerUnit('');
      }
    } else {
      setPricePerUnit('');
    }
  }, [fuelAmount, totalCost]);

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
    // Only fuel amount and total cost are required
    if (!fuelAmount.trim() || !totalCost.trim() || fuelAmountError || totalCostError) return;
    
    onSave({
      date: date.trim() || undefined,
      fuelAmount: parseFloat(fuelAmount),
      fuelUnit,
      totalCost: parseFloat(totalCost),
      currency,
      pricePerUnit: pricePerUnit.trim() ? parseFloat(pricePerUnit) : undefined,
      fuelType: fuelType.trim() || undefined,
      stationName: stationName.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  const isSaveDisabled = !fuelAmount.trim() || !totalCost.trim() || 
    !!fuelAmountError || !!totalCostError;

  const selectedCurrency = currencies.find(c => c.code === currency) || currencies[0];
  const selectedFuelUnit = fuelUnits.find(u => u.code === fuelUnit) || fuelUnits[0];

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
            setShowFuelUnitDropdown(false);
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
              <Text style={styles.titleText}>Add Fuel Entry</Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <X size={24} color={Colors.onSurfaceVariant} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Fuel Amount and Unit Row */}
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Fuel Amount *</Text>
                  <View style={styles.fuelAmountContainer}>
                    <TextInput
                      style={[styles.fuelAmountInput, fuelAmountError && styles.inputError]}
                      value={fuelAmount}
                      onChangeText={(text) => {
                        setFuelAmount(text);
                        setShowCurrencyDropdown(false);
                        setShowFuelUnitDropdown(false);
                      }}
                      onFocus={() => {
                        setShowCurrencyDropdown(false);
                        setShowFuelUnitDropdown(false);
                      }}
                      keyboardType="numeric"
                      placeholder="e.g. 45.5"
                      placeholderTextColor={Colors.outlineVariant}
                    />
                    <TouchableOpacity 
                      style={styles.fuelUnitSelector}
                      onPress={() => {
                        setShowFuelUnitDropdown(!showFuelUnitDropdown);
                        setShowCurrencyDropdown(false);
                      }}
                    >
                      <Text style={styles.fuelUnitText}>{selectedFuelUnit.symbol}</Text>
                      <ChevronDown size={16} color={Colors.onSurfaceVariant} />
                    </TouchableOpacity>
                  </View>
                  {fuelAmountError ? (
                    <Text style={styles.errorText}>{fuelAmountError}</Text>
                  ) : null}
                  
                  {showFuelUnitDropdown && (
                    <TouchableWithoutFeedback onPress={() => setShowFuelUnitDropdown(false)}>
                      <View style={styles.dropdownContainer}>
                        <View style={styles.dropdown}>
                          <ScrollView 
                            style={styles.dropdownScroll}
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled={true}
                          >
                            {fuelUnits.map((unit) => (
                              <TouchableOpacity
                                key={unit.code}
                                style={[
                                  styles.dropdownItem,
                                  fuelUnit === unit.code && styles.dropdownItemSelected
                                ]}
                                onPress={() => {
                                  setFuelUnit(unit.code as 'liters' | 'gallons');
                                  setShowFuelUnitDropdown(false);
                                }}
                              >
                                <Text style={styles.dropdownItemText}>
                                  {unit.name} ({unit.symbol})
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      </View>
                    </TouchableWithoutFeedback>
                  )}
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Total Cost *</Text>
                  <View style={styles.costContainer}>
                    <TextInput
                      style={[styles.costInput, totalCostError && styles.inputError]}
                      value={totalCost}
                      onChangeText={(text) => {
                        setTotalCost(text);
                        setShowCurrencyDropdown(false);
                        setShowFuelUnitDropdown(false);
                      }}
                      onFocus={() => {
                        setShowCurrencyDropdown(false);
                        setShowFuelUnitDropdown(false);
                      }}
                      keyboardType="numeric"
                      placeholder="0.00"
                      placeholderTextColor={Colors.outlineVariant}
                    />
                    <TouchableOpacity 
                      style={styles.currencySelector}
                      onPress={() => {
                        setShowCurrencyDropdown(!showCurrencyDropdown);
                        setShowFuelUnitDropdown(false);
                      }}
                    >
                      <Text style={styles.currencyText}>{selectedCurrency.symbol}</Text>
                      <ChevronDown size={16} color={Colors.onSurfaceVariant} />
                    </TouchableOpacity>
                  </View>
                  {totalCostError ? (
                    <Text style={styles.errorText}>{totalCostError}</Text>
                  ) : null}
                  
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

              {/* Price per unit (calculated) */}
              {pricePerUnit && (
                <View style={styles.calculatedPriceContainer}>
                  <Text style={styles.calculatedPriceLabel}>Price per {selectedFuelUnit.symbol}:</Text>
                  <Text style={styles.calculatedPriceValue}>
                    {selectedCurrency.symbol}{pricePerUnit} per {selectedFuelUnit.symbol}
                  </Text>
                </View>
              )}

              {/* Date and Fuel Type Row */}
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 0.7 }]}>
                  <Text style={styles.label}>Date (Optional)</Text>
                  <TextInput
                    style={[styles.dateInput, dateError && styles.inputError]}
                    value={date}
                    onChangeText={(text) => {
                      handleDateChange(text);
                      setShowCurrencyDropdown(false);
                      setShowFuelUnitDropdown(false);
                    }}
                    onFocus={() => {
                      setShowCurrencyDropdown(false);
                      setShowFuelUnitDropdown(false);
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
                  <Text style={styles.label}>Fuel Type (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    value={fuelType}
                    onChangeText={(text) => {
                      setFuelType(text);
                      setShowCurrencyDropdown(false);
                      setShowFuelUnitDropdown(false);
                    }}
                    onFocus={() => {
                      setShowCurrencyDropdown(false);
                      setShowFuelUnitDropdown(false);
                    }}
                    placeholder="e.g. 95, Diesel, Premium"
                    placeholderTextColor={Colors.outlineVariant}
                  />
                </View>
              </View>

              {/* Station Name (full width) */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Station Name (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={stationName}
                  onChangeText={(text) => {
                    setStationName(text);
                    setShowCurrencyDropdown(false);
                    setShowFuelUnitDropdown(false);
                  }}
                  onFocus={() => {
                    setShowCurrencyDropdown(false);
                    setShowFuelUnitDropdown(false);
                  }}
                  placeholder="e.g. BP Station, SOCAR #12, Shell Express"
                  placeholderTextColor={Colors.outlineVariant}
                />
              </View>

              {/* Notes */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Notes (Optional)</Text>
                <TextInput
                  style={styles.notesInput}
                  value={notes}
                  onChangeText={(text) => {
                    setNotes(text);
                    setShowCurrencyDropdown(false);
                    setShowFuelUnitDropdown(false);
                  }}
                  onFocus={() => {
                    setShowCurrencyDropdown(false);
                    setShowFuelUnitDropdown(false);
                  }}
                  placeholder="Any additional notes about this fuel entry"
                  placeholderTextColor={Colors.outlineVariant}
                  multiline
                  numberOfLines={3}
                />
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
    maxHeight: '80%',
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
    textAlign: 'center',
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
  fuelAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  fuelAmountInput: {
    flex: 0.6,
    height: 56,
    fontSize: Typography.bodyLg,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
    paddingHorizontal: Spacing.lg,
  },
  fuelUnitSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.4,
    height: 56,
    backgroundColor: Colors.surfaceContainerHigh,
    borderLeftWidth: 1,
    borderLeftColor: Colors.outlineVariant,
  },
  fuelUnitText: {
    fontSize: Typography.bodyLg,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
    marginRight: Spacing.xs,
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
  calculatedPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  calculatedPriceLabel: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
  },
  calculatedPriceValue: {
    fontSize: Typography.bodyLg,
    fontFamily: Typography.fontBody,
    fontWeight: Typography.weightSemiBold,
    color: Colors.primary,
  },
  notesInput: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.bodyLg,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
    minHeight: 80,
    textAlignVertical: 'top',
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
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxHeight: 180,
    overflow: 'hidden',
  },
  dropdownScroll: {
    maxHeight: 180,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainerLow,
  },
  dropdownItemSelected: {
    backgroundColor: '#fff0e6',
  },
  dropdownItemText: {
    flex: 1,
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
