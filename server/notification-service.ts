import axios from 'axios';

/**
 * Server-side Notification Service
 * Sends push notifications to users via Expo Push Notifications
 */

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

export interface PushNotificationPayload {
  to: string; // Expo push token
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: 'default' | 'none';
  badge?: number;
  priority?: 'default' | 'high';
}

export interface NotificationResult {
  success: boolean;
  ticketId?: string;
  error?: string;
}

/**
 * Send push notification via Expo
 */
export async function sendPushNotification(
  payload: PushNotificationPayload
): Promise<NotificationResult> {
  try {
    const response = await axios.post(EXPO_PUSH_URL, payload, {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
    });

    if (response.data.errors && response.data.errors.length > 0) {
      console.error('[NotificationService] Push error:', response.data.errors[0]);
      return {
        success: false,
        error: response.data.errors[0].message,
      };
    }

    console.log('[NotificationService] Push sent:', response.data.data[0].id);
    return {
      success: true,
      ticketId: response.data.data[0].id,
    };
  } catch (error) {
    console.error('[NotificationService] Error sending push notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send notification to multiple users
 */
export async function sendBulkNotifications(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<NotificationResult[]> {
  const results: NotificationResult[] = [];

  for (const token of tokens) {
    const result = await sendPushNotification({
      to: token,
      title,
      body,
      data,
      sound: 'default',
      priority: 'high',
    });
    results.push(result);
  }

  return results;
}

/**
 * Send 2FA failure notification to user
 */
export async function send2FAFailureNotification(
  userToken: string,
  attemptNumber: number
): Promise<NotificationResult> {
  return sendPushNotification({
    to: userToken,
    title: '🔒 2FA Doğrulaması Başarısız',
    body: `${attemptNumber}. başarısız deneme. Lütfen kodunuzu kontrol edin.`,
    data: {
      type: '2fa_failure',
      attempt: attemptNumber,
    },
    priority: 'high',
  });
}

/**
 * Send health goal alert to user
 */
export async function sendHealthGoalAlert(
  userToken: string,
  goalType: string,
  message: string
): Promise<NotificationResult> {
  return sendPushNotification({
    to: userToken,
    title: `💪 ${goalType} Uyarısı`,
    body: message,
    data: {
      type: 'health_goal_alert',
      goalType,
    },
    priority: 'high',
  });
}

/**
 * Send meal reminder to user
 */
export async function sendMealReminder(
  userToken: string,
  mealType: string
): Promise<NotificationResult> {
  const mealLabels: Record<string, string> = {
    breakfast: '🌅 Kahvaltı',
    lunch: '🍽️ Öğle Yemeği',
    dinner: '🌙 Akşam Yemeği',
    snack: '🍎 Ara Öğün',
  };

  return sendPushNotification({
    to: userToken,
    title: `${mealLabels[mealType] || mealType} Zamanı`,
    body: 'Öğün kaydı yapmayı unutmayın',
    data: {
      type: 'meal_reminder',
      mealType,
    },
  });
}

/**
 * Send appointment reminder to user
 */
export async function sendAppointmentReminder(
  userToken: string,
  dietitianName: string,
  appointmentTime: string
): Promise<NotificationResult> {
  return sendPushNotification({
    to: userToken,
    title: '📅 Randevu Hatırlatması',
    body: `${dietitianName} ile ${appointmentTime} tarihinde randevunuz var`,
    data: {
      type: 'appointment_reminder',
      dietitianName,
      appointmentTime,
    },
  });
}

/**
 * Send client adherence alert to dietitian
 */
export async function sendClientAdherenceAlert(
  dietitianToken: string,
  clientName: string,
  adherenceRate: number
): Promise<NotificationResult> {
  return sendPushNotification({
    to: dietitianToken,
    title: '⚠️ Danışan Uyum Uyarısı',
    body: `${clientName} danışanınızın uyum oranı ${adherenceRate}% olarak düştü`,
    data: {
      type: 'adherence_alert',
      clientName,
      adherenceRate,
    },
    priority: 'high',
  });
}

/**
 * Send new message notification
 */
export async function sendNewMessageNotification(
  userToken: string,
  senderName: string,
  messagePreview: string
): Promise<NotificationResult> {
  return sendPushNotification({
    to: userToken,
    title: `💬 Yeni Mesaj`,
    body: `${senderName}: ${messagePreview.substring(0, 50)}...`,
    data: {
      type: 'new_message',
      senderName,
    },
  });
}

/**
 * Send weekly report notification
 */
export async function sendWeeklyReportNotification(
  userToken: string,
  weekNumber: number
): Promise<NotificationResult> {
  return sendPushNotification({
    to: userToken,
    title: '📊 Haftalık Rapor Hazır',
    body: `${weekNumber}. hafta sağlık raporunuz hazır. Detayları görmek için tıklayın.`,
    data: {
      type: 'weekly_report',
      weekNumber,
    },
  });
}

/**
 * Send dietitian assignment notification
 */
export async function sendDietitianAssignmentNotification(
  clientToken: string,
  dietitianName: string
): Promise<NotificationResult> {
  return sendPushNotification({
    to: clientToken,
    title: '👨‍⚕️ Yeni Diyetisyen',
    body: `${dietitianName} sizin diyetisyeniniz olarak atandı`,
    data: {
      type: 'dietitian_assignment',
      dietitianName,
    },
  });
}

/**
 * Send meal photo feedback notification
 */
export async function sendMealPhotoFeedbackNotification(
  clientToken: string,
  dietitianName: string,
  feedback: string
): Promise<NotificationResult> {
  return sendPushNotification({
    to: clientToken,
    title: `📸 ${dietitianName} Geri Bildirim Verdi`,
    body: feedback.substring(0, 100),
    data: {
      type: 'meal_photo_feedback',
      dietitianName,
    },
  });
}
