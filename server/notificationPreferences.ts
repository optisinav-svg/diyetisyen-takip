import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { notificationPreferences } from "../drizzle/schema";

/**
 * Get user's notification preferences
 */
export async function getUserNotificationPreferences(userId: number) {
  try {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    const prefs = await database
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1);

    if (prefs.length > 0) {
      return { success: true, preferences: prefs[0] };
    }

    // Create default preferences if not exists
    await database.insert(notificationPreferences).values({
      userId,
      appointmentReminders: true,
      mealApprovals: true,
      achievements: true,
      weeklyReports: true,
      messages: true,
    });

    const newPrefs = await database
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1);

    return { success: true, preferences: newPrefs[0] };
  } catch (error) {
    console.error("Get notification preferences error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get preferences",
    };
  }
}

/**
 * Update user's notification preferences
 */
export async function updateUserNotificationPreferences(
  userId: number,
  preferences: {
    appointmentReminders?: boolean;
    mealApprovals?: boolean;
    achievements?: boolean;
    weeklyReports?: boolean;
    messages?: boolean;
  }
) {
  try {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    // First check if preferences exist
    const existing = await database
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1);

    if (existing.length === 0) {
      // Create new preferences
      await database.insert(notificationPreferences).values({
        userId,
        ...preferences,
      });
    } else {
      // Update existing preferences
      await database
        .update(notificationPreferences)
        .set(preferences)
        .where(eq(notificationPreferences.userId, userId));
    }

    const updated = await database
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1);

    console.log(`Notification preferences updated for user ${userId}`);
    return { success: true, preferences: updated[0] };
  } catch (error) {
    console.error("Update notification preferences error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update preferences",
    };
  }
}

/**
 * Reset notification preferences to defaults
 */
export async function resetNotificationPreferences(userId: number) {
  try {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    await database
      .update(notificationPreferences)
      .set({
        appointmentReminders: true,
        mealApprovals: true,
        achievements: true,
        weeklyReports: true,
        messages: true,
      })
      .where(eq(notificationPreferences.userId, userId));

    console.log(`Notification preferences reset for user ${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Reset notification preferences error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reset preferences",
    };
  }
}

/**
 * Check if user has a specific notification type enabled
 */
export async function isNotificationEnabled(userId: number, notificationType: string): Promise<boolean> {
  try {
    const result = await getUserNotificationPreferences(userId);
    if (!result.success || !result.preferences) return true; // Default to enabled

    const prefs = result.preferences as any;
    const typeKey = `${notificationType}s`; // e.g., "appointmentReminder" -> "appointmentReminders"
    return prefs[typeKey] !== false;
  } catch (error) {
    console.error("Check notification enabled error:", error);
    return true; // Default to enabled on error
  }
}

/**
 * Disable all notifications for a user
 */
export async function disableAllNotifications(userId: number) {
  try {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    await database
      .update(notificationPreferences)
      .set({
        appointmentReminders: false,
        mealApprovals: false,
        achievements: false,
        weeklyReports: false,
        messages: false,
      })
      .where(eq(notificationPreferences.userId, userId));

    console.log(`All notifications disabled for user ${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Disable all notifications error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to disable notifications",
    };
  }
}

/**
 * Enable all notifications for a user
 */
export async function enableAllNotifications(userId: number) {
  try {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    await database
      .update(notificationPreferences)
      .set({
        appointmentReminders: true,
        mealApprovals: true,
        achievements: true,
        weeklyReports: true,
        messages: true,
      })
      .where(eq(notificationPreferences.userId, userId));

    console.log(`All notifications enabled for user ${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Enable all notifications error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to enable notifications",
    };
  }
}
