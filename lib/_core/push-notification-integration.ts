import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  type: "recommendation" | "feedback_response" | "appointment" | "health_alert" | "message";
}

/**
 * Push notification handler'ı ayarla
 */
export async function setupPushNotifications() {
  try {
    // Notification handler'ı ayarla
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      } as any),
    });

    // iOS için izin iste
    if (Platform.OS === "ios") {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.warn("Notification permission denied");
      }
    }

    // Android için channel oluştur
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }
  } catch (error) {
    console.error("Failed to setup push notifications:", error);
  }
}

/**
 * Diyetisyen önerisini danışana push notification olarak gönder
 */
export async function sendRecommendationNotification(
  clientName: string,
  recommendationTitle: string,
  recommendationBody: string
) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "💡 Yeni Diyetisyen Önerisi",
        body: `${recommendationTitle}: ${recommendationBody}`,
        data: {
          type: "recommendation",
          title: recommendationTitle,
        },
      },
      trigger: { seconds: 1 } as any,
    });
  } catch (error) {
    console.error("Failed to send recommendation notification:", error);
  }
}

/**
 * Feedback yanıtını danışana push notification olarak gönder
 */
export async function sendFeedbackResponseNotification(
  clientName: string,
  response: string
) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "💬 Diyetisyen Yanıtladı",
        body: response.substring(0, 100),
        data: {
          type: "feedback_response",
        },
      },
      trigger: { seconds: 1 } as any,
    });
  } catch (error) {
    console.error("Failed to send feedback response notification:", error);
  }
}

/**
 * Randevu hatırlatması push notification'ı gönder
 */
export async function sendAppointmentReminderNotification(
  clientName: string,
  appointmentTime: string,
  appointmentTitle: string
) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "📅 Randevu Hatırlatması",
        body: `${appointmentTitle} - ${appointmentTime}`,
        data: {
          type: "appointment",
        },
      },
      trigger: { seconds: 1 } as any,
    });
  } catch (error) {
    console.error("Failed to send appointment reminder notification:", error);
  }
}

/**
 * Sağlık uyarısı push notification'ı gönder
 */
export async function sendHealthAlertNotification(
  clientName: string,
  alertTitle: string,
  alertMessage: string
) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⚠️ Sağlık Uyarısı",
        body: `${alertTitle}: ${alertMessage}`,
        data: {
          type: "health_alert",
        },
      },
      trigger: { seconds: 1 } as any,
    });
  } catch (error) {
    console.error("Failed to send health alert notification:", error);
  }
}

/**
 * Mesaj push notification'ı gönder
 */
export async function sendMessageNotification(
  senderName: string,
  messagePreview: string
) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `💬 ${senderName}`,
        body: messagePreview,
        data: {
          type: "message",
        },
      },
      trigger: { seconds: 1 } as any,
    });
  } catch (error) {
    console.error("Failed to send message notification:", error);
  }
}

/**
 * Scheduled notification'ı iptal et
 */
export async function cancelNotification(notificationId: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error("Failed to cancel notification:", error);
  }
}

/**
 * Tüm scheduled notification'ları iptal et
 */
export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Failed to cancel all notifications:", error);
  }
}

/**
 * Notification listener'ı ekle
 */
export function addNotificationListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    callback(response.notification);
  });
}

/**
 * Notification listener'ı kaldır
 */
export function removeNotificationListener(
  subscription: Notifications.EventSubscription
) {
  subscription.remove();
}
