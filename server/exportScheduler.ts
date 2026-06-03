import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { users, exportRecords } from "../drizzle/schema";
import * as exportService from "./export";
import * as s3Storage from "./s3Storage";

/**
 * Schedule daily export for a user
 */
export async function scheduleDailyExport(
  userId: number,
  exportType: "meals" | "measurements" | "income" | "performance",
  format: "csv" | "json" = "csv"
) {
  try {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    // Create export record
    await database.insert(exportRecords).values({
      userId,
      type: exportType as any,
      format,
      status: "pending",
    });

    console.log(`Daily export scheduled for user ${userId}: ${exportType}`);
    return { success: true };
  } catch (error) {
    console.error("Schedule daily export error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to schedule export",
    };
  }
}

/**
 * Execute pending exports
 */
export async function executePendingExports() {
  try {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    // Get all pending exports
    const pendingExports = await database
      .select()
      .from(exportRecords)
      .where(eq(exportRecords.status, "pending"));

    let successCount = 0;
    let failureCount = 0;

    for (const exportRecord of pendingExports) {
      try {
        let exportData: string | undefined;
        let s3Result: any;

        // Generate export based on type
        switch (exportRecord.type) {
          case "meals": {
            const mealReport = await exportService.generateClientMealReport(
              exportRecord.userId,
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              new Date(),
              exportRecord.format as "csv" | "json"
            );
            if (mealReport.success && mealReport.data) {
              exportData = mealReport.data;
              s3Result = await s3Storage.uploadMealReportToS3(
                exportRecord.userId,
                exportData,
                exportRecord.format as "csv" | "json"
              );
            }
            break;
          }
          case "measurements": {
            const measurementReport = await exportService.generateClientMeasurementsReport(
              exportRecord.userId,
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              new Date()
            );
            if (measurementReport.success && measurementReport.data) {
              exportData = measurementReport.data;
            s3Result = await s3Storage.uploadFileToS3(
              exportData,
              `measurements-${exportRecord.userId}-${Date.now()}.${exportRecord.format}`
            );
            }
            break;
          }
          case "income": {
            const incomeReport = await exportService.generateDietitianIncomeReport(
              exportRecord.userId,
              new Date(),
              exportRecord.format
            );
            if (incomeReport.success && incomeReport.data) {
              exportData = incomeReport.data;
            s3Result = await s3Storage.uploadFileToS3(
              exportData || "",
              `income-${exportRecord.userId}-${Date.now()}.${exportRecord.format}`,
              exportRecord.format
            );
            }
            break;
          }
          case "performance": {
            const performanceReport = await exportService.generateClientPerformanceReport(
              exportRecord.userId,
              new Date(),
              exportRecord.format
            );
            if (performanceReport.success && performanceReport.data) {
              exportData = performanceReport.data;
            s3Result = await s3Storage.uploadFileToS3(
              exportData || "",
              `performance-${exportRecord.userId}-${Date.now()}.${exportRecord.format}`,
              exportRecord.format
            );
            }
            break;
          }
        }

        // Update export record with results
        if (s3Result && s3Result.success) {
          const fileSize = exportData ? Buffer.byteLength(exportData) : 0;
          await database
            .update(exportRecords)
            .set({
              status: "completed",
              downloadUrl: s3Result.url || undefined,
              fileSize,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            })
            .where(eq(exportRecords.id, exportRecord.id));
          successCount++;
        } else {
          await database
            .update(exportRecords)
            .set({ status: "failed" })
            .where(eq(exportRecords.id, exportRecord.id));
          failureCount++;
        }
      } catch (error) {
        console.error(`Failed to execute export ${exportRecord.id}:`, error);
        await database
          .update(exportRecords)
          .set({ status: "failed" })
          .where(eq(exportRecords.id, exportRecord.id));
        failureCount++;
      }
    }

    console.log(`Export execution completed: ${successCount} success, ${failureCount} failed`);
    return { success: true, successCount, failureCount };
  } catch (error) {
    console.error("Execute pending exports error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to execute exports",
    };
  }
}

/**
 * Get export history for a user
 */
export async function getUserExportHistory(userId: number, limit: number = 50) {
  try {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    const history = await database
      .select()
      .from(exportRecords)
      .where(eq(exportRecords.userId, userId))
      .limit(limit);

    return { success: true, exports: history };
  } catch (error) {
    console.error("Get user export history error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get export history",
    };
  }
}

/**
 * Clean up expired exports
 */
export async function cleanupExpiredExports() {
  try {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    // Get all expired exports
    const now = new Date();
    const allExports = await database.select().from(exportRecords);
    const expiredExports = allExports.filter((e) => e.expiresAt && e.expiresAt < now);

    // Delete expired exports
    for (const exp of expiredExports) {
      await database.delete(exportRecords).where(eq(exportRecords.id, exp.id));
    }

    console.log(`Cleaned up ${expiredExports.length} expired exports`);
    return { success: true, deletedCount: expiredExports.length };
  } catch (error) {
    console.error("Cleanup expired exports error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cleanup exports",
    };
  }
}

/**
 * Get export statistics
 */
export async function getExportStatistics() {
  try {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    const allExports = await database.select().from(exportRecords);

    const stats = {
      total: allExports.length,
      byStatus: {
        completed: allExports.filter((e) => e.status === "completed").length,
        failed: allExports.filter((e) => e.status === "failed").length,
        pending: allExports.filter((e) => e.status === "pending").length,
      },
      byType: {
        meals: allExports.filter((e) => e.type === "meals").length,
        measurements: allExports.filter((e) => e.type === "measurements").length,
        income: allExports.filter((e) => e.type === "income").length,
        performance: allExports.filter((e) => e.type === "performance").length,
        "user-data": allExports.filter((e) => e.type === "user-data").length,
      },
      totalSize: allExports.reduce((sum, e) => sum + (e.fileSize || 0), 0),
    };

    return { success: true, statistics: stats };
  } catch (error) {
    console.error("Get export statistics error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get statistics",
    };
  }
}
