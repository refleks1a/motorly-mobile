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
import { Vehicle, UpdateVehicleRequest } from '@/services/vehicle.service';

interface UpdateCarModalProps {
  visible: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  onSave: (details: UpdateVehicleRequest) => Promise<void> | void;
}

export const UpdateCarModal: React.FC<UpdateCarModalProps> = ({
  visible,
  onClose,
  vehicle,
  onSave,
}) => {
  // Convert Vehicle to local state with the fields we need for the form
  const [make, setMake] = useState(vehicle.make || '');
  const [model, setModel] = useState(vehicle.model || '');
  const [year, setYear] = useState(vehicle.year ? String(vehicle.year) : '');
  const [mileageInput, setMileageInput] = useState(() => 
    vehicle.mileage ? String(vehicle.mileage).replace(/\D/g, '') : ''
  );
  const [licensePlate, setLicensePlate] = useState(vehicle.licensePlate || '');
  const [imageUrl, setImageUrl] = useState(vehicle.imageUrl || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMake(vehicle.make || '');
    setModel(vehicle.model || '');
    setYear(vehicle.year ? String(vehicle.year) : '');
    setMileageInput(vehicle.mileage ? String(vehicle.mileage).replace(/\D/g, '') : '');
    setLicensePlate(vehicle.licensePlate || '');
    setImageUrl(vehicle.imageUrl || '');
    setIsSaving(false); // Reset saving state when vehicle changes
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
      setImageUrl(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    // Prepare update data
    const updateData: UpdateVehicleRequest = {};
    
    if (make !== vehicle.make) updateData.make = make;
    if (model !== vehicle.model) updateData.model = model;
    
    const yearNum = parseInt(year, 10);
    if (!isNaN(yearNum) && yearNum !== vehicle.year) {
      updateData.year = yearNum;
    }
    
    const mileageNum = parseInt(mileageInput.replace(/\D/g, ''), 10);
    if (!isNaN(mileageNum) && mileageNum !== vehicle.mileage) {
      updateData.mileage = mileageNum;
    }
    
    if (licensePlate !== vehicle.licensePlate) {
      updateData.licensePlate = licensePlate || undefined;
    }
    
    if (imageUrl && imageUrl !== vehicle.imageUrl) {
      updateData.imageUrl = imageUrl;
    }
    
    // Only call onSave if there are actual changes
    if (Object.keys(updateData).length > 0) {
      setIsSaving(true);
      try {
        await onSave(updateData);
        // Modal will be closed by the parent component after successful save
      } catch (error) {
        console.error('Error saving vehicle:', error);
        setIsSaving(false);
        // Keep modal open on error
      }
    } else {
      // No changes, just close the modal
      onClose();
    }
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
              {imageUrl ? (
                <TouchableOpacity style={styles.imagePreviewContainer} onPress={handlePickImage} activeOpacity={0.8}>
                  <Image source={{ uri: imageUrl }} style={styles.imagePreview} resizeMode="cover" />
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
                <Text style={styles.label}>Make</Text>
                <TextInput
                  style={styles.input}
                  value={make}
                  onChangeText={setMake}
                  placeholder="e.g. Honda"
                  placeholderTextColor={Colors.outlineVariant}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Model</Text>
                <TextInput
                  style={styles.input}
                  value={model}
                  onChangeText={setModel}
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
                  value={year}
                  onChangeText={setYear}
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
                value={licensePlate}
                onChangeText={setLicensePlate}
                autoCapitalize="characters"
                placeholder="ABC-1234"
                placeholderTextColor={Colors.outlineVariant}
              />
            </View>
          </View>

          {/* Actions */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.button, isSaving && styles.buttonDisabled]} 
              onPress={handleSave} 
              activeOpacity={0.8}
              disabled={isSaving}
            >
              <Text style={styles.buttonText}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
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
  buttonDisabled: {
    backgroundColor: Colors.outlineVariant,
  },
});
