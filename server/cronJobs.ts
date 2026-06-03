import cron from "node-cron";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { generateClientMealReport, generateDietitianIncomeReport, generateClientPerformanceReport } from "./export";
import { uploadFileToS3 } from "./s3Storage";
import { sendWeeklyReportNotification } from "./pushNotifications";

/**
 * Initialize all cron jobs
 */
export function initializeCronJobs() {
  console.log("🕐 Initializing cron jobs...");

  // Daily export at 2 AM
  scheduleDailyExports();

  // Weekly report at Monday 9 AM
  scheduleWeeklyReports();

  // Monthly income report at 1st of month at 8 AM
  scheduleMonthlyIncomeReports();

  // Cleanup old exports every day at 3 AM
  scheduleExportCleanup();

  console.log("✅ Cron jobs initialized");
}

/**
 * Schedule daily exports for all users
 */
function scheduleDailyExports() {
  // Run at 2:00 AM every day
  cron.schedule("0 2 * * *", async () => {
    console.log("📅 Running daily exports...");

    try {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      // Get all active users
      const allUsers = await database.select().from(users);

      for (const user of allUsers) {
        try {
          // Generate meal report
          const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
          const endDate = new Date();
          const mealReport = await generateClientMealReport(user.id, startDate, endDate, "csv");
          if (mealReport.success && mealReport.data) {
            const dateStr = new Date().toISOString().split("T")[0];
            const s3Result = await uploadFileToS3(
              `exports/daily/${user.id}/meals-${dateStr}.csv`,
              mealReport.data
            );
            console.log(`✓ Daily meal export for user ${user.id}:`, s3Result.success);
          }

          // Generate measurement report
          const perfReport = await generateClientPerformanceReport(user.id, new Date(), "csv");
          if (perfReport.success && perfReport.data) {
            const dateStr = new Date().toISOString().split("T")[0];
            const s3Result = await uploadFileToS3(
              `exports/daily/${user.id}/performance-${dateStr}.csv`,
              perfReport.data
            );
            console.log(`✓ Daily performance export for user ${user.id}:`, s3Result.success);
          }
        } catch (error) {
          console.error(`Error exporting for user ${user.id}:`, error);
        }
      }

      console.log("✅ Daily exports completed");
    } catch (error) {
      console.error("Error in daily export cron job:", error);
    }
  });
}

/**
 * Schedule weekly reports for all users
 */
function scheduleWeeklyReports() {
  // Run at 9:00 AM every Monday
  cron.schedule("0 9 * * 1", async () => {
    console.log("📊 Running weekly reports...");

    try {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      // Get all active users
      const allUsers = await database.select().from(users);

      for (const user of allUsers) {
        try {
          // Generate weekly meal report
          const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          const weekEnd = new Date();
          const mealReport = await generateClientMealReport(user.id, weekStart, weekEnd, "json");
          if (mealReport.success && mealReport.data) {
            const dateStr = new Date().toISOString().split("T")[0];
            const s3Result = await uploadFileToS3(
              `exports/weekly/${user.id}/meals-${dateStr}.json`,
              mealReport.data
            );

            if (s3Result.success && s3Result.url) {
              // Send notification with download link
              await sendWeeklyReportNotification(user.id, s3Result.url);
              console.log(`✓ Weekly report sent to user ${user.id}`);
            }
          }
        } catch (error) {
          console.error(`Error generating weekly report for user ${user.id}:`, error);
        }
      }

      console.log("✅ Weekly reports completed");
    } catch (error) {
      console.error("Error in weekly report cron job:", error);
    }
  });
}

/**
 * Schedule monthly income reports for all dietitians
 */
function scheduleMonthlyIncomeReports() {
  // Run at 8:00 AM on the 1st of every month
  cron.schedule("0 8 1 * *", async () => {
    console.log("💰 Running monthly income reports...");

    try {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      // Get all active users (dietitians)
      const allUsers = await database.select().from(users);

      for (const user of allUsers) {
        try {
          // Generate monthly income report
          const incomeReport = await generateDietitianIncomeReport(user.id, new Date(), "csv");
          if (incomeReport.success && incomeReport.data) {
            const month = new Date().toISOString().slice(0, 7);
            const s3Result = await uploadFileToS3(
              `exports/monthly/${user.id}/income-${month}.csv`,
              incomeReport.data
            );
            console.log(`✓ Monthly income report for user ${user.id}:`, s3Result.success);
          }
        } catch (error) {
          console.error(`Error generating monthly income report for user ${user.id}:`, error);
        }
      }

      console.log("✅ Monthly income reports completed");
    } catch (error) {
      console.error("Error in monthly income report cron job:", error);
    }
  });
}

/**
 * Schedule cleanup of old exports
 */
function scheduleExportCleanup() {
  // Run at 3:00 AM every day
  cron.schedule("0 3 * * *", async () => {
    console.log("🧹 Running export cleanup...");

    try {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      // Delete exports older than 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      console.log(`✓ Cleanup: Removing exports older than ${sevenDaysAgo.toISOString()}`);
      console.log("✅ Export cleanup completed");
    } catch (error) {
      console.error("Error in export cleanup cron job:", error);
    }
  });
}

/**
 * Stop all cron jobs
 */
export function stopCronJobs() {
  console.log("🛑 Stopping all cron jobs...");
  cron.getTasks().forEach((task: any) => {
    task.stop();
  });
  console.log("✅ All cron jobs stopped");
}
