import AsyncStorage from "@react-native-async-storage/async-storage";

export type NotificationType = "appointment" | "message" | "goal" | "meal" | "activity" | "2fa" | "system";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  relatedId?: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

const NOTIFICATIONS_KEY = "notifications";

/**
 * Bildirim oluştur
 */
export async function createNotification(
  notification: Omit<Notification, "id" | "createdAt" | "read">
): Promise<Notification> {
  try {
    const notifications = await getNotifications();
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    notifications.unshift(newNotification);
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    return newNotification;
  } catch (error) {
    console.error("Failed to create notification:", error);
    throw error;
  }
}

/**
 * Tüm bildirimleri al
 */
export async function getNotifications(): Promise<Notification[]> {
  try {
    const data = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    if (!data) return [];
    return JSON.parse(data) as Notification[];
  } catch (error) {
    console.error("Failed to get notifications:", error);
    return [];
  }
}

/**
 * Kullanıcıya ait bildirimleri al
 */
export async function getUserNotifications(userId: string): Promise<Notification[]> {
  try {
    const notifications = await getNotifications();
    return notifications.filter((n) => n.userId === userId);
  } catch (error) {
    console.error("Failed to get user notifications:", error);
    return [];
  }
}

/**
 * Okunmamış bildirimleri al
 */
export async function getUnreadNotifications(userId: string): Promise<Notification[]> {
  try {
    const notifications = await getUserNotifications(userId);
    return notifications.filter((n) => !n.read);
  } catch (error) {
    console.error("Failed to get unread notifications:", error);
    return [];
  }
}

/**
 * Bildirimi oku olarak işaretle
 */
export async function markAsRead(notificationId: string): Promise<Notification | null> {
  try {
    const notifications = await getNotifications();
    const notification = notifications.find((n) => n.id === notificationId);
    if (!notification) return null;

    notification.read = true;
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    return notification;
  } catch (error) {
    console.error("Failed to mark as read:", error);
    throw error;
  }
}

/**
 * Tüm bildirimleri oku olarak işaretle
 */
export async function markAllAsRead(userId: string): Promise<void> {
  try {
    const notifications = await getNotifications();
    const userNotifications = notifications.filter((n) => n.userId === userId);
    userNotifications.forEach((n) => {
      n.read = true;
    });
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error("Failed to mark all as read:", error);
    throw error;
  }
}

/**
 * Bildirimi sil
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  try {
    const notifications = await getNotifications();
    const filtered = notifications.filter((n) => n.id !== notificationId);
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete notification:", error);
    throw error;
  }
}

/**
 * Bildirimleri türe göre filtrele
 */
export async function getNotificationsByType(userId: string, type: NotificationType): Promise<Notification[]> {
  try {
    const notifications = await getUserNotifications(userId);
    return notifications.filter((n) => n.type === type);
  } catch (error) {
    console.error("Failed to get notifications by type:", error);
    return [];
  }
}

/**
 * Tüm bildirimleri sil
 */
export async function clearAllNotifications(userId: string): Promise<void> {
  try {
    const notifications = await getNotifications();
    const filtered = notifications.filter((n) => n.userId !== userId);
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to clear notifications:", error);
    throw error;
  }
}
