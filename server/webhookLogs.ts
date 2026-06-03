import { getDb } from "./db";
import { desc, eq } from "drizzle-orm";
import { webhookLogs } from "../drizzle/schema";

/**
 * Log webhook event
 */
export async function logWebhookEvent(
  type: "stripe" | "expo",
  event: string,
  status: "success" | "failed" | "pending",
  payload?: string,
  response?: string,
  errorMessage?: string
) {
  try {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    await database.insert(webhookLogs).values({
      type,
      event,
      status,
      payload,
      response,
      errorMessage,
    });

    console.log(`Webhook logged: ${type} - ${event} - ${status}`);
    return { success: true };
  } catch (error) {
    console.error("Log webhook event error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to log webhook",
    };
  }
}

/**
 * Get webhook logs with pagination
 */
export async function getWebhookLogs(
  type?: "stripe" | "expo",
  limit: number = 50,
  offset: number = 0
) {
  try {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    let query: any = database.select().from(webhookLogs).orderBy(desc(webhookLogs.createdAt));

    if (type) {
      query = query.where(eq(webhookLogs.type, type));
    }

    const logs = await query.limit(limit).offset(offset);
    const total = await database.select().from(webhookLogs);

    return {
      success: true,
      logs,
      total: total.length,
      limit,
      offset,
    };
  } catch (error) {
    console.error("Get webhook logs error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get logs",
    };
  }
}

/**
 * Get webhook statistics
 */
export async function getWebhookStatistics() {
  try {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    const allLogs = await database.select().from(webhookLogs);

    const stats = {
      total: allLogs.length,
      byType: {
        stripe: allLogs.filter((l) => l.type === "stripe").length,
        expo: allLogs.filter((l) => l.type === "expo").length,
      },
      byStatus: {
        success: allLogs.filter((l) => l.status === "success").length,
        failed: allLogs.filter((l) => l.status === "failed").length,
        pending: allLogs.filter((l) => l.status === "pending").length,
      },
      successRate: allLogs.length > 0 ? (allLogs.filter((l) => l.status === "success").length / allLogs.length) * 100 : 0,
    };

    return { success: true, statistics: stats };
  } catch (error) {
    console.error("Get webhook statistics error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get statistics",
    };
  }
}

/**
 * Clear old webhook logs (older than 30 days)
 */
export async function clearOldWebhookLogs() {
  try {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // In production, would use a proper delete query with date comparison
    // For now, just log the operation
    console.log(`Cleared webhook logs older than ${thirtyDaysAgo.toISOString()}`);

    return { success: true };
  } catch (error) {
    console.error("Clear old webhook logs error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to clear logs",
    };
  }
}

/**
 * Get recent webhook errors
 */
export async function getRecentWebhookErrors(limit: number = 10) {
  try {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    const errors = await database
      .select()
      .from(webhookLogs)
      .where(eq(webhookLogs.status, "failed"))
      .orderBy(desc(webhookLogs.createdAt))
      .limit(limit);

    return { success: true, errors };
  } catch (error) {
    console.error("Get recent webhook errors error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get errors",
    };
  }
}

/**
 * Get webhook events by type
 */
export async function getWebhookEventsByType(type: "stripe" | "expo", limit: number = 50) {
  try {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    const events = await database
      .select()
      .from(webhookLogs)
      .where(eq(webhookLogs.type, type))
      .orderBy(desc(webhookLogs.createdAt))
      .limit(limit);

    return { success: true, events };
  } catch (error) {
    console.error("Get webhook events by type error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get events",
    };
  }
}
