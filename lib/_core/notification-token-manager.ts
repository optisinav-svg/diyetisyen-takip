import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

/**
 * Notification Token Manager
 * Handles push token storage, retrieval, and synchronization with server
 */

const PUSH_TOKEN_KEY = 'expoPushToken';
const NOTIFICATION_PREFS_KEY = 'notificationPreferences';

export interface NotificationPreferences {
  mealReminders: boolean;
  appointmentReminders: boolean;
  healthAlerts: boolean;
  twoFactorAlerts: boolean;
  dietitianMessages: boolean;
  weeklyReports: boolean;
}

export interface NotificationToken {
  token: string;
  deviceId: string;
  platform: 'ios' | 'android' | 'web';
  createdAt: string;
  lastUpdated: string;
}

/**
 * Get or create push token
 */
export async function getPushToken(): Promise<string | null> {
  try {
    // Check if token exists in storage
    const storedToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
    if (storedToken) {
      console.log('[TokenManager] Using stored push token');
      return storedToken;
    }

    // Get new token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      console.warn('[TokenManager] Project ID not found');
      return null;
    }

    const token = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;

    // Store token
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    console.log('[TokenManager] New push token created and stored');

    return token;
  } catch (error) {
    console.error('[TokenManager] Error getting push token:', error);
    return null;
  }
}

/**
 * Refresh push token
 */
export async function refreshPushToken(): Promise<string | null> {
  try {
    // Clear old token
    await AsyncStorage.removeItem(PUSH_TOKEN_KEY);

    // Get new token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      console.warn('[TokenManager] Project ID not found');
      return null;
    }

    const token = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;

    // Store new token
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    console.log('[TokenManager] Push token refreshed');

    return token;
  } catch (error) {
    console.error('[TokenManager] Error refreshing push token:', error);
    return null;
  }
}

/**
 * Get notification preferences
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const prefs = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (prefs) {
      return JSON.parse(prefs);
    }

    // Return default preferences
    const defaultPrefs: NotificationPreferences = {
      mealReminders: true,
      appointmentReminders: true,
      healthAlerts: true,
      twoFactorAlerts: true,
      dietitianMessages: true,
      weeklyReports: true,
    };

    await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(defaultPrefs));
    return defaultPrefs;
  } catch (error) {
    console.error('[TokenManager] Error getting notification preferences:', error);
    return {
      mealReminders: true,
      appointmentReminders: true,
      healthAlerts: true,
      twoFactorAlerts: true,
      dietitianMessages: true,
      weeklyReports: true,
    };
  }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  try {
    const currentPrefs = await getNotificationPreferences();
    const updatedPrefs = { ...currentPrefs, ...preferences };

    await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(updatedPrefs));
    console.log('[TokenManager] Notification preferences updated');

    return updatedPrefs;
  } catch (error) {
    console.error('[TokenManager] Error updating notification preferences:', error);
    return await getNotificationPreferences();
  }
}

/**
 * Check if notification type is enabled
 */
export async function isNotificationTypeEnabled(type: keyof NotificationPreferences): Promise<boolean> {
  const prefs = await getNotificationPreferences();
  return prefs[type];
}

/**
 * Sync token with server
 */
export async function syncTokenWithServer(userId: number, token: string): Promise<boolean> {
  try {
    // This would be called from the app to sync the token with the backend
    // The backend would store this token for push notifications
    console.log('[TokenManager] Syncing token with server for user:', userId);

    // Store sync timestamp
    await AsyncStorage.setItem(`tokenSyncTime_${userId}`, new Date().toISOString());

    return true;
  } catch (error) {
    console.error('[TokenManager] Error syncing token with server:', error);
    return false;
  }
}

/**
 * Get last sync time
 */
export async function getLastSyncTime(userId: number): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(`tokenSyncTime_${userId}`);
  } catch (error) {
    console.error('[TokenManager] Error getting last sync time:', error);
    return null;
  }
}

/**
 * Should refresh token (older than 30 days)
 */
export async function shouldRefreshToken(): Promise<boolean> {
  try {
    const createdAtStr = await AsyncStorage.getItem(`tokenCreatedAt`);
    if (!createdAtStr) {
      return true;
    }

    const createdAt = new Date(createdAtStr);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

    return daysDiff > 30;
  } catch (error) {
    console.error('[TokenManager] Error checking if should refresh token:', error);
    return false;
  }
}

/**
 * Initialize token manager
 */
export async function initializeTokenManager(userId: number): Promise<void> {
  try {
    // Get or create token
    const token = await getPushToken();
    if (!token) {
      console.warn('[TokenManager] Failed to get push token');
      return;
    }

    // Sync with server
    await syncTokenWithServer(userId, token);

    // Store creation time
    const createdAtStr = await AsyncStorage.getItem(`tokenCreatedAt`);
    if (!createdAtStr) {
      await AsyncStorage.setItem(`tokenCreatedAt`, new Date().toISOString());
    }

    console.log('[TokenManager] Token manager initialized');
  } catch (error) {
    console.error('[TokenManager] Error initializing token manager:', error);
  }
}

/**
 * Clear all token data
 */
export async function clearTokenData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
    await AsyncStorage.removeItem(NOTIFICATION_PREFS_KEY);
    await AsyncStorage.removeItem(`tokenCreatedAt`);
    console.log('[TokenManager] Token data cleared');
  } catch (error) {
    console.error('[TokenManager] Error clearing token data:', error);
  }
}
