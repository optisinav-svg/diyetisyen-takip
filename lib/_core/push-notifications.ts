import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Push Notifications Service
 * Handles push notification setup, permissions, and sending
 */

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: string;
}

/**
 * Initialize push notifications
 */
export async function initializePushNotifications(): Promise<string | null> {
  try {
    // Check if device is physical
    if (!Device.isDevice) {
      console.warn('[Notifications] Push notifications only work on physical devices');
      return null;
    }

    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[Notifications] Failed to get push notification permissions');
      return null;
    }

    // Get Expo push token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      console.warn('[Notifications] Project ID not found in app.json');
      return null;
    }

    const token = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;

    console.log('[Notifications] Expo push token:', token);

    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        return {
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        };
      },
    });

    // Save token to AsyncStorage
    await AsyncStorage.setItem('expoPushToken', token);

    return token;
  } catch (error) {
    console.error('[Notifications] Error initializing push notifications:', error);
    return null;
  }
}

/**
 * Send local notification
 */
export async function sendLocalNotification(payload: NotificationPayload): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        sound: payload.sound || 'default',
      },
      trigger: null, // Send immediately
    });

    console.log('[Notifications] Local notification sent:', payload.title);
  } catch (error) {
    console.error('[Notifications] Error sending local notification:', error);
  }
}

/**
 * Send notification with delay
 */
export async function sendDelayedNotification(
  payload: NotificationPayload,
  delaySeconds: number
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        sound: payload.sound || 'default',
      },
      trigger: {
        seconds: delaySeconds,
      } as any,
    });

    console.log('[Notifications] Delayed notification scheduled:', payload.title);
  } catch (error) {
    console.error('[Notifications] Error scheduling delayed notification:', error);
  }
}

/**
 * Send daily notification
 */
export async function sendDailyNotification(
  payload: NotificationPayload,
  hour: number,
  minute: number = 0
): Promise<void> {
  try {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const secondsUntilNotification = Math.floor((scheduledTime.getTime() - now.getTime()) / 1000);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        sound: payload.sound || 'default',
      },
      trigger: {
        seconds: secondsUntilNotification,
        repeats: true,
      } as any,
    });

    console.log('[Notifications] Daily notification scheduled:', payload.title);
  } catch (error) {
    console.error('[Notifications] Error scheduling daily notification:', error);
  }
}

/**
 * Get Expo push token
 */
export async function getExpoPushToken(): Promise<string | null> {
  try {
    const token = await AsyncStorage.getItem('expoPushToken');
    return token;
  } catch (error) {
    console.error('[Notifications] Error getting Expo push token:', error);
    return null;
  }
}

/**
 * Listen to notification events
 */
export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationTapped?: (notification: Notifications.Notification) => void
): () => void {
  const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
    console.log('[Notifications] Notification received:', notification);
    onNotificationReceived?.(notification);
  });

  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('[Notifications] Notification tapped:', response.notification);
    onNotificationTapped?.(response.notification);
  });

  // Return cleanup function
  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}

/**
 * Send 2FA failure notification
 */
export async function send2FAFailureNotification(attemptNumber: number): Promise<void> {
  await sendLocalNotification({
    title: '🔒 2FA Doğrulaması Başarısız',
    body: `${attemptNumber}. başarısız deneme. Lütfen kodunuzu kontrol edin.`,
    data: {
      type: '2fa_failure',
      attempt: attemptNumber,
    },
  });
}

/**
 * Send health goal alert notification
 */
export async function sendHealthGoalAlertNotification(
  goalType: string,
  message: string
): Promise<void> {
  await sendLocalNotification({
    title: `💪 ${goalType} Uyarısı`,
    body: message,
    data: {
      type: 'health_goal_alert',
      goalType,
    },
  });
}

/**
 * Send meal reminder notification
 */
export async function sendMealReminderNotification(mealType: string): Promise<void> {
  const mealLabels: Record<string, string> = {
    breakfast: '🌅 Kahvaltı',
    lunch: '🍽️ Öğle Yemeği',
    dinner: '🌙 Akşam Yemeği',
    snack: '🍎 Ara Öğün',
  };

  await sendLocalNotification({
    title: `${mealLabels[mealType] || mealType} Zamanı`,
    body: 'Öğün kaydı yapmayı unutmayın',
    data: {
      type: 'meal_reminder',
      mealType,
    },
  });
}

/**
 * Send appointment reminder notification
 */
export async function sendAppointmentReminderNotification(
  dietitianName: string,
  appointmentTime: string
): Promise<void> {
  await sendLocalNotification({
    title: '📅 Randevu Hatırlatması',
    body: `${dietitianName} ile ${appointmentTime} tarihinde randevunuz var`,
    data: {
      type: 'appointment_reminder',
      dietitianName,
      appointmentTime,
    },
  });
}
