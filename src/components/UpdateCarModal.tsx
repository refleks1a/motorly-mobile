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
  Image,
} from 'react-native';
import { X, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

export interface VehicleDetails {
  productionYear: string;
  brand: string;
  model: string;
  mileage: string;
  licensePlate: string;
  imageUrl: string;
}

interface UpdateCarModalProps {
  visible: boolean;
  onClose: () => void;
  vehicle: VehicleDetails;
  onSave: (details: Partial<VehicleDetails>) => void;
}

export const UpdateCarModal: React.FC<UpdateCarModalProps> = ({
  visible,
  onClose,
  vehicle,
  onSave,
}) => {
  const [details, setDetails] = useState(vehicle);
  const [mileageInput, setMileageInput] = useState(() => vehicle.mileage.replace(/\D/g, ''));

  useEffect(() => {
    setDetails(vehicle);
    setMileageInput(vehicle.mileage.replace(/\D/g, ''));
  }, [vehicle]);

  const [internalVisible, setInternalVisible] = useState(visible);
  const slideAnim = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    if (visible) {
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

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setDetails({ ...details, imageUrl: result.assets[0].uri });
    }
  };

  const handleSave = () => {
    // Format back to string with commas if needed, or pass raw
    const formattedMileage = Number(mileageInput).toLocaleString() + ' km';
    onSave({
      ...details,
      mileage: formattedMileage,
    });
    onClose();
  };

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
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
              {/* Header */}
              <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View>
                  <View style={styles.header}>
                    <Text style={styles.title}>Update Vehicle</Text>
                    <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                      <X size={24} color={Colors.onSurfaceVariant} strokeWidth={2} />
                    </TouchableOpacity>
                  </View>

                  {/* Form */}
              <View style={styles.form}>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Car Image</Text>
                  {details.imageUrl ? (
                    <TouchableOpacity style={styles.imagePreviewContainer} onPress={handlePickImage} activeOpacity={0.8}>
                      <Image source={{ uri: details.imageUrl }} style={styles.imagePreview} resizeMode="cover" />
                      <View style={styles.changeImageOverlay}>
                        <Camera size={20} color={Colors.surface} strokeWidth={2} />
                        <Text style={styles.changeImageText}>Change</Text>
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.uploadButton} onPress={handlePickImage} activeOpacity={0.8}>
                      <View style={styles.uploadIconCircle}>
                        <Camera size={24} color={Colors.primary} strokeWidth={2} />
                      </View>
                      <Text style={styles.uploadButtonText}>Upload Car Photo</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Brand</Text>
                    <TextInput
                      style={styles.input}
                      value={details.brand}
                      onChangeText={(t) => setDetails({ ...details, brand: t })}
                      placeholder="e.g. Honda"
                      placeholderTextColor={Colors.outlineVariant}
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Model</Text>
                    <TextInput
                      style={styles.input}
                      value={details.model}
                      onChangeText={(t) => setDetails({ ...details, model: t })}
                      placeholder="e.g. Civic"
                      placeholderTextColor={Colors.outlineVariant}
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Year</Text>
                    <TextInput
                      style={styles.input}
                      value={details.productionYear}
                      onChangeText={(t) => setDetails({ ...details, productionYear: t })}
                      keyboardType="numeric"
                      placeholder="e.g. 2019"
                      placeholderTextColor={Colors.outlineVariant}
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Odometer (km)</Text>
                    <TextInput
                      style={styles.input}
                      value={mileageInput}
                      onChangeText={setMileageInput}
                      keyboardType="numeric"
                      placeholder="e.g. 45000"
                      placeholderTextColor={Colors.outlineVariant}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>License Plate</Text>
                  <TextInput
                    style={styles.input}
                    value={details.licensePlate}
                    onChangeText={(t) => setDetails({ ...details, licensePlate: t })}
                    autoCapitalize="characters"
                    placeholder="ABC-1234"
                    placeholderTextColor={Colors.outlineVariant}
                  />
                </View>
              </View>

                  {/* Actions */}
                  <View style={styles.footer}>
                    <TouchableOpacity style={styles.button} onPress={handleSave} activeOpacity={0.8}>
                      <Text style={styles.buttonText}>Save Changes</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
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
  keyboardView: {
    width: '100%',
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
  title: {
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
  uploadButton: {
    height: 80,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
    borderStyle: 'dashed',
  },
  uploadIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    fontSize: Typography.bodyLg,
    fontFamily: Typography.fontBody,
    fontWeight: Typography.weightSemiBold,
    color: Colors.onSurfaceVariant,
  },
  imagePreviewContainer: {
    height: 120,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceContainerLow,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  changeImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  changeImageText: {
    color: Colors.surface,
    fontSize: Typography.labelSm,
    fontFamily: Typography.fontBody,
    fontWeight: Typography.weightBold,
    textTransform: 'uppercase',
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
  buttonText: {
    color: Colors.onPrimary,
    fontSize: Typography.titleSm,
    fontWeight: Typography.weightBold,
    fontFamily: Typography.fontBody,
  },
});
