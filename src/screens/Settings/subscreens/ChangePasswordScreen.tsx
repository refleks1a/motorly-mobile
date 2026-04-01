import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

interface Props {
  navigation: any;
}

export const ChangePasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push("At least 8 characters");
    if (!/\d/.test(password)) errors.push("At least 1 number");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push("At least 1 special character");
    if (!/[A-Z]/.test(password)) errors.push("At least 1 uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("At least 1 lowercase letter");
    return errors;
  };

  const handleChangePassword = () => {
    // Validation
    if (!currentPassword.trim()) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      Alert.alert(
        'Password Requirements',
        `Your password must include:\n• ${passwordErrors.join('\n• ')}`
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return;
    }

    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Success',
        'Your password has been changed successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }, 1500);
  };

  const passwordErrors = validatePassword(newPassword);
  const isFormValid = currentPassword.trim() && 
                     newPassword.trim() && 
                     confirmPassword.trim() && 
                     passwordErrors.length === 0 &&
                     newPassword === confirmPassword;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft size={24} color={Colors.onBackground} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Change Password</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Current Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Current Password</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color={Colors.onSurfaceVariant} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter current password"
                  placeholderTextColor={Colors.outlineVariant}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrentPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={styles.eyeButton}
                >
                  {showCurrentPassword ? (
                    <EyeOff size={20} color={Colors.onSurfaceVariant} />
                  ) : (
                    <Eye size={20} color={Colors.onSurfaceVariant} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color={Colors.onSurfaceVariant} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter new password"
                  placeholderTextColor={Colors.outlineVariant}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeButton}
                >
                  {showNewPassword ? (
                    <EyeOff size={20} color={Colors.onSurfaceVariant} />
                  ) : (
                    <Eye size={20} color={Colors.onSurfaceVariant} />
                  )}
                </TouchableOpacity>
              </View>
              
              {/* Password Strength Indicator */}
              {newPassword.length > 0 && (
                <View style={styles.passwordStrength}>
                  <Text style={styles.passwordStrengthLabel}>Password Strength:</Text>
                  <View style={styles.strengthBars}>
                    {[1, 2, 3, 4, 5].map((index) => (
                      <View
                        key={index}
                        style={[
                          styles.strengthBar,
                          index <= Math.max(1, 5 - passwordErrors.length) && styles.strengthBarFilled,
                        ]}
                      />
                    ))}
                  </View>
                  {passwordErrors.length > 0 && (
                    <View style={styles.passwordErrors}>
                      {passwordErrors.map((error, index) => (
                        <Text key={index} style={styles.passwordError}>
                          • {error}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Confirm New Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color={Colors.onSurfaceVariant} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm new password"
                  placeholderTextColor={Colors.outlineVariant}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={Colors.onSurfaceVariant} />
                  ) : (
                    <Eye size={20} color={Colors.onSurfaceVariant} />
                  )}
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                <Text style={styles.errorText}>Passwords do not match</Text>
              )}
            </View>

            {/* Requirements Hint */}
            <View style={styles.hintCard}>
              <Text style={styles.hintTitle}>Password Requirements</Text>
              <Text style={styles.hintText}>
                • At least 8 characters{'\n'}
                • At least 1 number{'\n'}
                • At least 1 special character{'\n'}
                • At least 1 uppercase letter{'\n'}
                • At least 1 lowercase letter
              </Text>
            </View>
          </View>

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* Submit Button */}
          <PrimaryButton
            title={isLoading ? "Changing Password..." : "Change Password"}
            onPress={handleChangePassword}
            disabled={!isFormValid || isLoading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.headlineLg,
    fontWeight: Typography.weightExtraBold,
    fontFamily: Typography.fontDisplay,
    color: Colors.onBackground,
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  form: {
    gap: Spacing.xl,
  },
  fieldGroup: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: Typography.labelMd,
    fontWeight: Typography.weightSemiBold,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    height: 52,
  },
  inputIcon: {
    marginRight: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: Typography.bodyLg,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
    height: '100%',
  },
  eyeButton: {
    padding: Spacing.sm,
  },
  passwordStrength: {
    marginTop: Spacing.sm,
  },
  passwordStrengthLabel: {
    fontSize: Typography.labelMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.xs,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Radius.full,
  },
  strengthBarFilled: {
    backgroundColor: Colors.primary,
  },
  passwordErrors: {
    gap: Spacing.xs,
  },
  passwordError: {
    fontSize: Typography.labelMd,
    fontFamily: Typography.fontBody,
    color: Colors.error,
  },
  errorText: {
    fontSize: Typography.labelMd,
    fontFamily: Typography.fontBody,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  hintCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  hintTitle: {
    fontSize: Typography.bodyLg,
    fontWeight: Typography.weightSemiBold,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
  },
  hintText: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
    lineHeight: 20,
  },
  spacer: {
    flex: 1,
    minHeight: Spacing.xxxl,
  },
});