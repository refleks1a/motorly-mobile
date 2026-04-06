import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react-native';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useVehicles } from '@/contexts/VehicleContext';

interface Props {
  navigation: any;
}

export const AuthScreen: React.FC<Props> = ({ navigation }) => {
  const { login, register, isLoading } = useAuth();
  const { refreshVehicles } = useVehicles();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'email' | 'reset'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  
  // Separate states for Sign In and Sign Up forms
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Forgot Password states
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState<'success' | 'error'>('success');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push("At least 8 characters");
    if (!/\d/.test(password)) errors.push("At least 1 number");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push("At least 1 special character");
    if (!/[A-Z]/.test(password)) errors.push("At least 1 uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("At least 1 lowercase letter");
    return errors;
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  const handleSignIn = async () => {
    const email = signInEmail;
    const password = signInPassword;
    
    if (!email.trim()) {
      showNotification('Please enter your email', 'error');
      return;
    }
    if (!validateEmail(email)) {
      showNotification('Please enter a valid email', 'error');
      return;
    }
    if (!password.trim()) {
      showNotification('Please enter your password', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
      showNotification('Signed in successfully!', 'success');
      
      // Refresh vehicles to get the latest user's vehicles
      const userVehicles = await refreshVehicles();
      
      setTimeout(() => {
        // Check if user has any vehicles
        if (userVehicles && userVehicles.length > 0) {
          navigation.navigate('MainApp');
        } else {
          navigation.navigate('AddCar');
        }
      }, 1500);
    } catch (error: any) {
      showNotification(error.message || 'Login failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async () => {
    const email = signUpEmail;
    const password = signUpPassword;
    
    if (!email.trim()) {
      showNotification('Please enter your email', 'error');
      return;
    }
    if (!validateEmail(email)) {
      showNotification('Please enter a valid email', 'error');
      return;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      showNotification(`Password requirements: ${passwordErrors.join(', ')}`, 'error');
      return;
    }

    if (password !== confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await register(email, password);
      showNotification('Account created successfully!', 'success');
      
      // Refresh vehicles for newly created account
      const userVehicles = await refreshVehicles();
      
      setTimeout(() => {
        setIsSignUp(false);
        setSignUpEmail('');
        setSignUpPassword('');
        setConfirmPassword('');
        
        // Check if user has any vehicles (new users should have none)
        if (userVehicles && userVehicles.length > 0) {
          navigation.navigate('MainApp');
        } else {
          navigation.navigate('AddCar');
        }
      }, 1500);
    } catch (error: any) {
      showNotification(error.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialAuth = (provider: 'google' | 'facebook') => {
    showNotification(`${provider.charAt(0).toUpperCase() + provider.slice(1)} sign in is not implemented yet`, 'error');
  };

  // Forgot Password handlers
  const handleForgotPassword = () => {
    setIsForgotPassword(true);
    setForgotPasswordStep('email');
  };

  const handleSendResetCode = () => {
    if (!forgotPasswordEmail.trim()) {
      showNotification('Please enter your email', 'error');
      return;
    }
    if (!validateEmail(forgotPasswordEmail)) {
      showNotification('Please enter a valid email', 'error');
      return;
    }

    // Mock sending reset code
    showNotification('Reset code sent to your email', 'success');
    setForgotPasswordStep('reset');
  };

  const handleResetPassword = () => {
    if (!resetCode.trim()) {
      showNotification('Please enter the reset code', 'error');
      return;
    }
    if (resetCode.length !== 6) {
      showNotification('Reset code must be 6 digits', 'error');
      return;
    }

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      showNotification(`Password requirements: ${passwordErrors.join(', ')}`, 'error');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }

    // Mock password reset
    showNotification('Password reset successful!', 'success');
    
    // Reset states and navigate back to Sign In
    setTimeout(() => {
      setIsForgotPassword(false);
      setForgotPasswordStep('email');
      setForgotPasswordEmail('');
      setResetCode('');
      setNewPassword('');
      setConfirmNewPassword('');
    }, 1500);
  };

  const handleBackToSignIn = () => {
    setIsForgotPassword(false);
    setForgotPasswordStep('email');
    setForgotPasswordEmail('');
    setResetCode('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const passwordErrors = validatePassword(signUpPassword);
  
  const isSignInValid = signInEmail.trim() && signInPassword.trim();
  const isSignUpValid = signUpEmail.trim() && signUpPassword.trim() && confirmPassword.trim() && passwordErrors.length === 0;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo and App Name in one line */}
          <View style={styles.logoContainer}>
            <View style={styles.logoRow}>
              <Image
                source={require('@/assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.appName}>Motorly</Text>
            </View>
            <Text style={styles.tagline}>Your Car's Health Companion</Text>
          </View>

          {/* Forgot Password Form */}
          {isForgotPassword ? (
            <View style={styles.forgotPasswordContainer}>
              <Text style={styles.formTitle}>Reset Password</Text>
              
              <View style={styles.form}>
                {/* Email Step */}
                {forgotPasswordStep === 'email' ? (
                  <>
                    <View style={styles.fieldGroup}>
                      <Text style={styles.label}>Email</Text>
                      <View style={styles.inputContainer}>
                        <Mail size={20} color={Colors.onSurfaceVariant} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="you@example.com"
                          placeholderTextColor={Colors.outlineVariant}
                          value={forgotPasswordEmail}
                          onChangeText={setForgotPasswordEmail}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      </View>
                    </View>

                    <PrimaryButton
                      title="Send Reset Code"
                      onPress={handleSendResetCode}
                      disabled={!forgotPasswordEmail.trim()}
                      style={styles.submitButton}
                    />

                    <TouchableOpacity
                      style={styles.backLink}
                      onPress={handleBackToSignIn}
                    >
                      <Text style={styles.backLinkText}>Back to Sign In</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  /* Reset Step */
                  <>
                    <View style={styles.fieldGroup}>
                      <Text style={styles.label}>Reset Code</Text>
                      <View style={styles.inputContainer}>
                        <Lock size={20} color={Colors.onSurfaceVariant} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Enter 6-digit code"
                          placeholderTextColor={Colors.outlineVariant}
                          value={resetCode}
                          onChangeText={setResetCode}
                          keyboardType="numeric"
                          maxLength={6}
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      </View>
                      <Text style={styles.hintText}>Check your email for the 6-digit code</Text>
                    </View>

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
                                  index <= Math.max(1, 5 - validatePassword(newPassword).length) && styles.strengthBarFilled,
                                ]}
                              />
                            ))}
                          </View>
                          {validatePassword(newPassword).length > 0 && (
                            <View style={styles.passwordErrors}>
                              {validatePassword(newPassword).map((error, index) => (
                                <Text key={index} style={styles.passwordError}>
                                  • {error}
                                </Text>
                              ))}
                            </View>
                          )}
                        </View>
                      )}
                    </View>

                    <View style={styles.fieldGroup}>
                      <Text style={styles.label}>Confirm New Password</Text>
                      <View style={styles.inputContainer}>
                        <Lock size={20} color={Colors.onSurfaceVariant} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Confirm new password"
                          placeholderTextColor={Colors.outlineVariant}
                          value={confirmNewPassword}
                          onChangeText={setConfirmNewPassword}
                          secureTextEntry={!showConfirmNewPassword}
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                        <TouchableOpacity
                          onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                          style={styles.eyeButton}
                        >
                          {showConfirmNewPassword ? (
                            <EyeOff size={20} color={Colors.onSurfaceVariant} />
                          ) : (
                            <Eye size={20} color={Colors.onSurfaceVariant} />
                          )}
                        </TouchableOpacity>
                      </View>
                      {confirmNewPassword.length > 0 && newPassword !== confirmNewPassword && (
                        <Text style={styles.errorText}>Passwords do not match</Text>
                      )}
                    </View>

                    <PrimaryButton
                      title="Reset Password"
                      onPress={handleResetPassword}
                      disabled={!resetCode.trim() || !newPassword.trim() || !confirmNewPassword.trim()}
                      style={styles.submitButton}
                    />

                    <TouchableOpacity
                      style={styles.backLink}
                      onPress={() => setForgotPasswordStep('email')}
                    >
                      <Text style={styles.backLinkText}>Back</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ) : (
            /* Regular Sign In / Sign Up Form */
            <>
              {/* Form Title */}
              <Text style={styles.formTitle}>
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </Text>

              {/* Form */}
              <View style={styles.form}>
            {/* Email Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color={Colors.onSurfaceVariant} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.outlineVariant}
                  value={isSignUp ? signUpEmail : signInEmail}
                  onChangeText={isSignUp ? setSignUpEmail : setSignInEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color={Colors.onSurfaceVariant} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.outlineVariant}
                  value={isSignUp ? signUpPassword : signInPassword}
                  onChangeText={isSignUp ? setSignUpPassword : setSignInPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={Colors.onSurfaceVariant} />
                  ) : (
                    <Eye size={20} color={Colors.onSurfaceVariant} />
                  )}
                </TouchableOpacity>
              </View>
              
              {/* Password Strength Indicator (Sign Up only) */}
              {isSignUp && signUpPassword.length > 0 && (
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

            {/* Confirm Password Field (Sign Up only) */}
            {isSignUp && (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                  <Lock size={20} color={Colors.onSurfaceVariant} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
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
                {confirmPassword.length > 0 && signUpPassword !== confirmPassword && (
                  <Text style={styles.errorText}>Passwords do not match</Text>
                )}
              </View>
            )}

            {/* Forgot Password (Sign In only) */}
            {!isSignUp && !isForgotPassword && (
              <TouchableOpacity 
                style={styles.forgotPassword}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Submit Button - Moved higher */}
          <PrimaryButton
            title={isSignUp ? 'Sign Up' : 'Sign In'}
            onPress={isSignUp ? handleSignUp : handleSignIn}
            disabled={isSignUp ? !isSignUpValid : !isSignInValid}
            loading={isSubmitting}
            style={styles.submitButton}
          />

          {/* Social Auth Buttons */}
          <View style={styles.socialAuthContainer}>
            <Text style={styles.socialAuthLabel}>Or continue with</Text>
            <View style={styles.socialButtons}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialAuth('google')}
                activeOpacity={0.8}
              >
                <View style={styles.socialButtonContent}>
                  <Mail size={20} color={Colors.onBackground} />
                  <Text style={styles.socialButtonText}>Google</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialAuth('facebook')}
                activeOpacity={0.8}
              >
                <View style={styles.socialButtonContent}>
                  <Text style={styles.facebookIcon}>f</Text>
                  <Text style={styles.socialButtonText}>Facebook</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Switch Mode Prompt */}
          <TouchableOpacity
            style={styles.switchMode}
            onPress={() => setIsSignUp(!isSignUp)}
          >
            <Text style={styles.switchModeText}>
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <Text style={styles.switchModeLink}>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Text>
            </Text>
          </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Toast Notification */}
      <Modal
        visible={showPopup}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPopup(false)}
      >
        <View style={styles.toastContainer}>
          <View style={[
            styles.toast,
            popupType === 'success' ? styles.toastSuccess : styles.toastError
          ]}>
            {popupType === 'success' ? (
              <CheckCircle size={20} color={Colors.onSurface} />
            ) : (
              <XCircle size={20} color={Colors.onSurface} />
            )}
            <Text style={styles.toastText}>{popupMessage}</Text>
          </View>
        </View>
      </Modal>
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
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: Spacing.sm,
  },
  appName: {
    fontSize: Typography.headlineMd,
    fontWeight: Typography.weightExtraBold,
    fontFamily: Typography.fontDisplay,
    color: Colors.onBackground,
  },
  tagline: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
  },
  formTitle: {
    fontSize: Typography.headlineLg,
    fontWeight: Typography.weightExtraBold,
    fontFamily: Typography.fontDisplay,
    color: Colors.onBackground,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  form: {
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.sm,
  },
  forgotPasswordText: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.primary,
    fontWeight: Typography.weightMedium,
  },
  submitButton: {
    marginBottom: Spacing.xl,
  },
  socialAuthContainer: {
    marginBottom: Spacing.xl,
  },
  socialAuthLabel: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  socialButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
    paddingVertical: Spacing.md,
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  socialButtonText: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    fontWeight: Typography.weightSemiBold,
    color: Colors.onBackground,
  },
  facebookIcon: {
    fontSize: Typography.titleLg,
    fontFamily: Typography.fontBody,
    fontWeight: Typography.weightBold,
    color: '#1877F2', // Facebook blue
  },
  switchMode: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  switchModeText: {
    fontSize: Typography.bodyLg,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
  },
  switchModeLink: {
    color: Colors.primary,
    fontWeight: Typography.weightSemiBold,
  },
  toastContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: Spacing.xl,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    gap: Spacing.md,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  toastSuccess: {
    backgroundColor: Colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  toastError: {
    backgroundColor: Colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },
  toastText: {
    flex: 1,
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurface,
    fontWeight: Typography.weightMedium,
  },
  forgotPasswordContainer: {
    width: '100%',
  },
  backLink: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  backLinkText: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.primary,
    fontWeight: Typography.weightMedium,
  },
  hintText: {
    fontSize: Typography.labelMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.xs,
  },
});
