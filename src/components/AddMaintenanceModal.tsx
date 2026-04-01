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
} from 'react-native';
import { X } from 'lucide-react-native';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

export interface MaintenanceRecordInput {
  title: string;
  subtitle: string;
  status: 'scheduled' | 'priority' | 'good';
}

interface AddMaintenanceModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (record: MaintenanceRecordInput) => void;
}

export const AddMaintenanceModal: React.FC<AddMaintenanceModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [status, setStatus] = useState<'scheduled' | 'priority' | 'good'>('scheduled');

  const [internalVisible, setInternalVisible] = useState(visible);
  const slideAnim = useRef(new Animated.Value(600)).current;

  // Reset form when opened
  useEffect(() => {
    if (visible) {
      setTitle('');
      setSubtitle('');
      setStatus('scheduled');
      
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

  const handleSave = () => {
    if (!title.trim()) return;
    
    onSave({
      title: title.trim(),
      subtitle: subtitle.trim(),
      status,
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
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.titleText}>Add Maintenance</Text>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                  <X size={24} color={Colors.onSurfaceVariant} strokeWidth={2} />
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Service Name</Text>
                  <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="e.g. Oil Change"
                    placeholderTextColor={Colors.outlineVariant}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Due / Subtitle</Text>
                  <TextInput
                    style={styles.input}
                    value={subtitle}
                    onChangeText={setSubtitle}
                    placeholder="e.g. Due in 500 km"
                    placeholderTextColor={Colors.outlineVariant}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Priority Status</Text>
                  <View style={styles.statusChipsContainer}>
                    {(['scheduled', 'priority', 'good'] as const).map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={[
                          styles.statusChip,
                          status === s && styles.statusChipActive,
                        ]}
                        onPress={() => setStatus(s)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.statusChipText,
                            status === s && styles.statusChipTextActive,
                          ]}
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

              </View>

              {/* Actions */}
              <View style={styles.footer}>
                <TouchableOpacity 
                  style={[styles.button, !title.trim() && styles.buttonDisabled]} 
                  onPress={handleSave} 
                  activeOpacity={0.8}
                  disabled={!title.trim()}
                >
                  <Text style={styles.buttonText}>Save</Text>
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
