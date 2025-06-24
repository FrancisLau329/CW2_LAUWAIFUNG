import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { AuthContext } from '../context/AuthContext';

export default function AuthScreen() {
  const { login } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [biometricType, setBiometricType] = useState(null);
  
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    acceptTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  
  React.useEffect(() => {
    checkBiometricType();
  }, []);

  const checkBiometricType = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (hasHardware && isEnrolled) {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('Fingerprint');
        } else {
          setBiometricType('Biometric');
        }
      }
    } catch (error) {
      console.log('error:', error);
    }
  };

  
  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  
  const validateForm = () => {
    const { email, password, confirmPassword, displayName, acceptTerms } = formData;
    
    
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter email address');
      return false;
    }
    
    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter password');
      return false;
    }
    
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }

    
    if (!isLogin) {
      if (!displayName.trim()) {
        Alert.alert('Error', 'Please enter username');
        return false;
      }
      
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Password confirmation does not match');
        return false;
      }
      
      if (!acceptTerms) {
        Alert.alert('Error', 'Please agree to Terms of Service and Privacy Policy');
        return false;
      }
    }
    
    return true;
  };

  
  const handleEmailAuth = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const userData = {
        email: formData.email,
        uid: `user_${Date.now()}`,
        displayName: formData.displayName || formData.email.split('@')[0],
        isNewUser: !isLogin
      };
      
      await login(userData);
      
      
      console.log('✅ 認證成功:', userData.displayName);
    } catch (error) {
      Alert.alert(
        '❌ Error', 
        isLogin ? 'Login failed, please check your credentials' : 'Registration failed, please try again'
      );
    } finally {
      setLoading(false);
    }
  };

  
  const handleBiometricAuth = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (!hasHardware || !isEnrolled) {
        Alert.alert('Error', 'Your device does not support biometric authentication or is not set up');
        return;
      }

      setLoading(true);
      
      
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: biometricType === 'Face ID' ? 'Use Face ID to login to VocabLens' : `Use ${biometricType} to login to VocabLens`,
        fallbackLabel: 'Use Password',
        disableDeviceFallback: false,
        requireConfirmation: false, 
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        const userData = {
          email: 'biometric@vocablens.com',
          uid: 'biometric_user',
          displayName: `${biometricType} User`
        };
        
        await login(userData);
        console.log('✅ ok');
      } else if (result.error === 'user_cancel') {
        console.log('cancel');
      } else {
        Alert.alert('Authentication Failed', 'Biometric authentication failed, please try again');
      }
    } catch (error) {
      Alert.alert('Error', `Biometric authentication error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  
  const useDemoAccount = async () => {
    setLoading(true);
    try {
      const userData = {
        email: 'demo@vocablens.com',
        uid: 'demo_user',
        displayName: 'Demo User'
      };
      
      await login(userData);
      console.log('ok');
    } catch (error) {
      Alert.alert('Error', 'Demo account login failed');
    } finally {
      setLoading(false);
    }
  };

  
  const handleForgotPassword = () => {
    Alert.alert(
      '🔒 Reset Password',
      'Please enter your email address and we will send you a password reset link.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send', 
          onPress: () => {
            if (formData.email) {
              Alert.alert('📧 Sent', 'Password reset link has been sent to your email');
            } else {
              Alert.alert('Error', 'Please enter your email address first');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          
          <View style={styles.header}>
            <MaterialIcons name="school" size={64} color="#5D5CDE" />
            <Text style={styles.title}>VocabLens</Text>
            <Text style={styles.subtitle}>Learn English Through Vision</Text>
            <Text style={styles.modeText}>
              {isLogin ? 'Welcome Back!' : 'Create New Account'}
            </Text>
          </View>

         
          <View style={styles.form}>
           
            {!isLogin && (
              <View style={styles.inputContainer}>
                <MaterialIcons name="person" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="#9CA3AF"
                  value={formData.displayName}
                  onChangeText={(text) => updateFormData('displayName', text)}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>
            )}

            
            <View style={styles.inputContainer}>
              <MaterialIcons name="email" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#9CA3AF"
                value={formData.email}
                onChangeText={(text) => updateFormData('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
              />
            </View>

           
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={formData.password}
                onChangeText={(text) => updateFormData('password', text)}
                secureTextEntry={!showPassword}
                autoComplete="password"
                returnKeyType={isLogin ? "done" : "next"}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <MaterialIcons 
                  name={showPassword ? "visibility" : "visibility-off"} 
                  size={20} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
            </View>

            
            {!isLogin && (
              <View style={styles.inputContainer}>
                <MaterialIcons name="lock-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor="#9CA3AF"
                  value={formData.confirmPassword}
                  onChangeText={(text) => updateFormData('confirmPassword', text)}
                  secureTextEntry={!showConfirmPassword}
                  returnKeyType="done"
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  <MaterialIcons 
                    name={showConfirmPassword ? "visibility" : "visibility-off"} 
                    size={20} 
                    color="#6B7280" 
                  />
                </TouchableOpacity>
              </View>
            )}

         
            {!isLogin && (
              <TouchableOpacity 
                style={styles.termsContainer}
                onPress={() => updateFormData('acceptTerms', !formData.acceptTerms)}
              >
                <MaterialIcons 
                  name={formData.acceptTerms ? "check-box" : "check-box-outline-blank"} 
                  size={20} 
                  color={formData.acceptTerms ? "#5D5CDE" : "#9CA3AF"} 
                />
                <Text style={styles.termsText}>
                  I agree to <Text style={styles.termsLink}>Terms of Service</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
            )}

            
            <TouchableOpacity 
              style={[styles.authButton, loading && styles.disabledButton]} 
              onPress={handleEmailAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.authButtonText}>
                  {isLogin ? 'Sign In' : 'Sign Up'}
                </Text>
              )}
            </TouchableOpacity>

        
            {isLogin && (
              <TouchableOpacity 
                style={styles.forgotButton}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotButtonText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

          
            <TouchableOpacity 
              style={styles.switchButton}
              onPress={() => {
                setIsLogin(!isLogin);
                setFormData(prev => ({ 
                  ...prev, 
                  confirmPassword: '', 
                  acceptTerms: false 
                }));
              }}
              disabled={loading}
            >
              <Text style={styles.switchButtonText}>
                {isLogin ? "Don't have an account? Sign up now" : "Already have an account? Sign in now"}
              </Text>
            </TouchableOpacity>

           
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>


            {isLogin && biometricType && (
              <TouchableOpacity 
                style={styles.biometricButton}
                onPress={handleBiometricAuth}
                disabled={loading}
              >
                <MaterialIcons 
                  name={biometricType === 'Face ID' ? "face" : "fingerprint"} 
                  size={24} 
                  color="#5D5CDE" 
                />
                <Text style={styles.biometricButtonText}>Sign in with {biometricType}</Text>
              </TouchableOpacity>
            )}

           \
            <TouchableOpacity 
              style={styles.demoButton}
              onPress={useDemoAccount}
              disabled={loading}
            >
              <MaterialIcons name="play-circle-outline" size={20} color="#9CA3AF" />
              <Text style={styles.demoButtonText}>Use Demo Account</Text>
            </TouchableOpacity>

      \
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>✨ App Features</Text>
              <Text style={styles.featuresText}>
                • 🤖 AI Image Recognition Learning{'\n'}
                • 🔊 Real Voice Playback{'\n'}
                • 📚 Smart Practice System{'\n'}
                • 📊 Learning Progress Tracking
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#5D5CDE',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  modeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  form: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  inputIcon: {
    marginLeft: 16,
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#374151',
  },
  eyeButton: {
    padding: 16,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    lineHeight: 20,
  },
  termsLink: {
    color: '#5D5CDE',
    fontWeight: '600',
  },
  authButton: {
    backgroundColor: '#5D5CDE',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#5D5CDE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  authButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotButton: {
    alignItems: 'center',
    marginBottom: 16,
  },
  forgotButtonText: {
    color: '#5D5CDE',
    fontSize: 14,
    fontWeight: '500',
  },
  switchButton: {
    alignItems: 'center',
    marginBottom: 24,
  },
  switchButtonText: {
    color: '#5D5CDE',
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#9CA3AF',
    fontSize: 12,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#5D5CDE',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 16,
  },
  biometricButtonText: {
    color: '#5D5CDE',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginBottom: 20,
  },
  demoButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginLeft: 6,
  },
  featuresContainer: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#5D5CDE',
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  featuresText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});