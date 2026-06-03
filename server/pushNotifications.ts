import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { pushNotificationTokens } from "../drizzle/schema";

// Expo Push Notifications API endpoint
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

/**
 * Save or update push notification token
 */
export async function savePushNotificationToken(
  userId: number,
  token: string,
  platform: "ios" | "android" | "web",
  deviceId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    // Check if token already exists
    const existingToken = await database
      .select()
      .from(pushNotificationTokens)
      .where(eq(pushNotificationTokens.token, token))
      .limit(1);

    if (existingToken.length > 0) {
      // Update existing token
      await database
        .update(pushNotificationTokens)
        .set({ isActive: true, updatedAt: new Date() })
        .where(eq(pushNotificationTokens.token, token));
    } else {
      // Insert new token
      await database
        .insert(pushNotificationTokens)
        .values({
          userId,
          token,
          platform,
          deviceId,
          isActive: true,
        });
    }

    console.log(`Push notification token saved for user ${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Save push notification token error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save token",
    };
  }
}

/**
 * Get all active tokens for a user
 */
export async function getUserPushTokens(userId: number): Promise<
  | {
      success: true;
      tokens: Array<{
        id: number;
        token: string;
        platform: "ios" | "android" | "web";
        deviceId?: string;
      }>;
    }
  | { success: false; error: string }
> {
  try {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    const tokens = await database
      .select()
      .from(pushNotificationTokens)
      .where(eq(pushNotificationTokens.userId, userId));

    return {
      success: true,
      tokens: tokens.map((t: any) => ({
        id: t.id,
        token: t.token,
        platform: t.platform as "ios" | "android" | "web",
        deviceId: t.deviceId || undefined,
      })),
    };
  } catch (error) {
    console.error("Get user push tokens error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get tokens",
    };
  }
}

/**
 * Delete push notification token
 */
export async function deletePushNotificationToken(
  userId: number,
  tokenId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    await database
      .delete(pushNotificationTokens)
      .where(eq(pushNotificationTokens.id, tokenId));

    console.log(`Push notification token ${tokenId} deleted for user ${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Delete push notification token error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete token",
    };
  }
}

/**
 * Send push notification to user via Expo
 */
export async function sendPushNotification(
  userId: number,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ success: boolean; sentCount: number; error?: string }> {
  try {
    // Get user's push tokens
    const tokensResult = await getUserPushTokens(userId);
    if (!tokensResult.success || tokensResult.tokens.length === 0) {
      console.log(`No push tokens found for user ${userId}`);
      return { success: true, sentCount: 0 };
    }

    let sentCount = 0;

    // Send notification to each token
    for (const tokenObj of tokensResult.tokens) {
      try {
        const response = await fetch(EXPO_PUSH_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            to: tokenObj.token,
            sound: "default",
            title,
            body,
            data: data || {},
            badge: 1,
            priority: "high",
          }),
        });

        if (response.ok) {
          sentCount++;
          console.log(`Push notification sent to user ${userId}`);
        } else {
          console.error(`Failed to send push notification: ${response.statusText}`);
          // Mark token as inactive if it fails
          await deactivatePushToken(userId, tokenObj.id);
        }
      } catch (error) {
        console.error(`Error sending push notification to token:`, error);
      }
    }

    return { success: true, sentCount };
  } catch (error) {
    console.error("Send push notification error:", error);
    return {
      success: false,
      sentCount: 0,
      error: error instanceof Error ? error.message : "Failed to send notification",
    };
  }
}

/**
 * Send push notification to multiple users
 */
export async function sendBulkPushNotifications(
  userIds: number[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ success: boolean; totalSent: number; error?: string }> {
  try {
    let totalSent = 0;

    for (const userId of userIds) {
      const result = await sendPushNotification(userId, title, body, data);
      if (result.success) {
        totalSent += result.sentCount;
      }
    }

    console.log(`Bulk push notifications sent to ${userIds.length} users, total sent: ${totalSent}`);
    return { success: true, totalSent };
  } catch (error) {
    console.error("Send bulk push notifications error:", error);
    return {
      success: false,
      totalSent: 0,
      error: error instanceof Error ? error.message : "Failed to send notifications",
    };
  }
}

/**
 * Mark token as inactive
 */
export async function deactivatePushToken(
  userId: number,
  tokenId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    await database
      .update(pushNotificationTokens)
      .set({ isActive: false })
      .where(eq(pushNotificationTokens.id, tokenId));

    console.log(`Push token ${tokenId} deactivated for user ${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Deactivate push token error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to deactivate token",
    };
  }
}

/**
 * Clean up expired or invalid tokens
 */
export async function cleanupExpiredTokens(): Promise<{ success: boolean; deletedCount: number; error?: string }> {
  try {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    // Delete tokens that are marked as inactive
    const result = await database
      .delete(pushNotificationTokens)
      .where(eq(pushNotificationTokens.isActive, false));

    console.log(`Cleaned up expired push tokens`);
    return { success: true, deletedCount: 0 };
  } catch (error) {
    console.error("Cleanup expired tokens error:", error);
    return {
      success: false,
      deletedCount: 0,
      error: error instanceof Error ? error.message : "Failed to cleanup tokens",
    };
  }
}

/**
 * Send appointment reminder notification
 */
export async function sendAppointmentReminder(
  clientUserId: number,
  dietitianName: string,
  appointmentTime: Date
): Promise<{ success: boolean; sentCount: number; error?: string }> {
  const timeStr = appointmentTime.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return sendPushNotification(
    clientUserId,
    "Randevu Hatırlatması",
    `${dietitianName} ile ${timeStr}'de randevunuz var`,
    { type: "appointment_reminder" }
  );
}

/**
 * Send meal approval notification
 */
export async function sendMealApprovalNotification(
  clientUserId: number,
  status: "approved" | "warning" | "needs_revision",
  message?: string
): Promise<{ success: boolean; sentCount: number; error?: string }> {
  const titles: Record<string, string> = {
    approved: "Öğün Onaylandı ✓",
    warning: "Öğün Uyarısı ⚠️",
    needs_revision: "Öğün Düzeltilmesi Gerekli",
  };

  const bodies: Record<string, string> = {
    approved: "Öğün diyetisyen tarafından onaylandı",
    warning: "Öğün hakkında bir uyarı aldınız",
    needs_revision: "Öğün hakkında geri bildirim aldınız",
  };

  return sendPushNotification(
    clientUserId,
    titles[status],
    message || bodies[status],
    { type: "meal_approval", status }
  );
}

/**
 * Send achievement notification
 */
export async function sendAchievementNotification(
  clientUserId: number,
  badgeName: string,
  badgeDescription: string
): Promise<{ success: boolean; sentCount: number; error?: string }> {
  return sendPushNotification(
    clientUserId,
    "🏆 Yeni Rozet Kazandınız!",
    `${badgeName}: ${badgeDescription}`,
    { type: "achievement", badge: badgeName }
  );
}

/**
 * Send weekly report notification
 */
export async function sendWeeklyReportNotification(
  clientUserId: number,
  reportUrl: string
): Promise<{ success: boolean; sentCount: number; error?: string }> {
  return sendPushNotification(
    clientUserId,
    "📊 Haftalık Rapor Hazır",
    "Haftalık ilerleme raporunuzu görüntülemek için tıklayın",
    { type: "weekly_report", url: reportUrl }
  );
}
