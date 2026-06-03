import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import * as Auth from './auth';
import * as Api from './api';

export type BiometricType = 'face' | 'fingerprint' | 'none';

export interface BiometricLoginResult {
  success: boolean;
  error?: string;
  biometricType?: BiometricType;
}

/**
 * Check if biometric authentication is available on the device
 */
export async function isBiometricAvailable(): Promise<boolean> {
  try {
    // Biometric only available on native platforms
    if (Platform.OS === 'web') {
      console.log('[Biometric] Web platform does not support biometric auth');
      return false;
    }

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    console.log('[Biometric] Hardware available:', hasHardware, 'Enrolled:', isEnrolled);
    return hasHardware && isEnrolled;
  } catch (error) {
    console.error('[Biometric] Error checking availability:', error);
    return false;
  }
}

/**
 * Get the type of biometric authentication available
 */
export async function getBiometricType(): Promise<BiometricType> {
  try {
    if (Platform.OS === 'web') {
      return 'none';
    }

    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      console.log('[Biometric] Facial recognition available');
      return 'face';
    }

    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      console.log('[Biometric] Fingerprint available');
      return 'fingerprint';
    }

    return 'none';
  } catch (error) {
    console.error('[Biometric] Error getting biometric type:', error);
    return 'none';
  }
}

/**
 * Authenticate user with biometric
 * This should be called AFTER OAuth login to verify the user with biometric
 */
export async function authenticateWithBiometric(): Promise<BiometricLoginResult> {
  try {
    if (Platform.OS === 'web') {
      console.log('[Biometric] Web platform does not support biometric auth');
      return { success: false, error: 'Biometric not supported on web' };
    }

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      console.log('[Biometric] No biometric hardware available');
      return { success: false, error: 'No biometric hardware available' };
    }

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) {
      console.log('[Biometric] No biometric enrolled');
      return { success: false, error: 'No biometric enrolled' };
    }

    const biometricType = await getBiometricType();
    const promptMessage = biometricType === 'face' 
      ? 'Yüzünüzle giriş yapın' 
      : 'Parmağınızla giriş yapın';

    console.log('[Biometric] Starting authentication with', biometricType);

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      promptDescription: 'Hesabınıza erişmek için doğrulama yapın',
      fallbackLabel: 'PIN kullan',
      disableDeviceFallback: false,
    });

    if (result.success) {
      console.log('[Biometric] Authentication successful');
      return { success: true, biometricType };
    }

    if (result.error === 'user_cancel') {
      console.log('[Biometric] User cancelled authentication');
      return { success: false, error: 'user_cancel' };
    }

    console.error('[Biometric] Authentication failed:', result.error, result.warning);
    return { success: false, error: result.warning || result.error };
  } catch (error) {
    console.error('[Biometric] Error during authentication:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Enable biometric login for the current user
 * This stores a flag that the user wants to use biometric auth
 */
export async function enableBiometricLogin(): Promise<boolean> {
  try {
    const available = await isBiometricAvailable();
    if (!available) {
      console.log('[Biometric] Biometric not available, cannot enable');
      return false;
    }

    // Store preference in secure storage
    if (Platform.OS !== 'web') {
      const SecureStore = await import('expo-secure-store');
      await SecureStore.default.setItemAsync('biometric_login_enabled', 'true');
      console.log('[Biometric] Biometric login enabled');
      return true;
    }

    return false;
  } catch (error) {
    console.error('[Biometric] Error enabling biometric login:', error);
    return false;
  }
}

/**
 * Disable biometric login for the current user
 */
export async function disableBiometricLogin(): Promise<boolean> {
  try {
    if (Platform.OS !== 'web') {
      const SecureStore = await import('expo-secure-store');
      await SecureStore.default.deleteItemAsync('biometric_login_enabled');
      console.log('[Biometric] Biometric login disabled');
      return true;
    }

    return false;
  } catch (error) {
    console.error('[Biometric] Error disabling biometric login:', error);
    return false;
  }
}

/**
 * Check if biometric login is enabled for the current user
 */
export async function isBiometricLoginEnabled(): Promise<boolean> {
  try {
    if (Platform.OS === 'web') {
      return false;
    }

    const SecureStore = await import('expo-secure-store');
    const enabled = await SecureStore.default.getItemAsync('biometric_login_enabled');
    console.log('[Biometric] Biometric login enabled:', !!enabled);
    return !!enabled;
  } catch (error) {
    console.error('[Biometric] Error checking biometric login status:', error);
    return false;
  }
}

/**
 * Quick biometric login - authenticate and restore session
 * This is used when user has already logged in once and wants to use biometric to unlock
 */
export async function quickBiometricLogin(): Promise<BiometricLoginResult> {
  try {
    console.log('[Biometric] Starting quick biometric login');

    // Check if biometric login is enabled
    const enabled = await isBiometricLoginEnabled();
    if (!enabled) {
      console.log('[Biometric] Biometric login not enabled');
      return { success: false, error: 'Biometric login not enabled' };
    }

    // Authenticate with biometric
    const authResult = await authenticateWithBiometric();
    if (!authResult.success) {
      console.log('[Biometric] Biometric authentication failed');
      return authResult;
    }

    // Check if we have a cached session
    const sessionToken = await Auth.getSessionToken();
    const cachedUser = await Auth.getUserInfo();

    if (sessionToken && cachedUser) {
      console.log('[Biometric] Quick login successful with cached session');
      return { success: true, biometricType: authResult.biometricType };
    }

    console.log('[Biometric] No cached session available');
    return { success: false, error: 'No cached session available' };
  } catch (error) {
    console.error('[Biometric] Error during quick biometric login:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
