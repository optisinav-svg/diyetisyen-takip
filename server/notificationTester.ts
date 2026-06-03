import { sendPushNotification, sendBulkPushNotifications, sendAppointmentReminder, sendMealApprovalNotification, sendAchievementNotification, sendWeeklyReportNotification } from "./pushNotifications";

/**
 * Test real-time notification delivery
 */
export async function testNotificationDelivery() {
  console.log("🧪 Testing Real-time Notification Delivery...\n");

  // Test 1: Send single notification
  console.log("Test 1: Single Notification");
  const result1 = await sendPushNotification(
    1,
    "Test Notification",
    "This is a test notification from the system",
    { type: "test" }
  );
  console.log("Result:", result1);
  console.log("");

  // Test 2: Send appointment reminder
  console.log("Test 2: Appointment Reminder");
  const result2 = await sendAppointmentReminder(
    1,
    "Dr. Ayşe Yılmaz",
    new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
  );
  console.log("Result:", result2);
  console.log("");

  // Test 3: Send meal approval notification
  console.log("Test 3: Meal Approval Notification");
  const result3 = await sendMealApprovalNotification(
    1,
    "approved",
    "Öğün mükemmel! Devam et 👍"
  );
  console.log("Result:", result3);
  console.log("");

  // Test 4: Send achievement notification
  console.log("Test 4: Achievement Notification");
  const result4 = await sendAchievementNotification(
    1,
    "7 Gün Serisi",
    "7 gün boyunca tüm öğünleri kaydettin!"
  );
  console.log("Result:", result4);
  console.log("");

  // Test 5: Send weekly report notification
  console.log("Test 5: Weekly Report Notification");
  const result5 = await sendWeeklyReportNotification(
    1,
    "https://app.example.com/reports/weekly/1"
  );
  console.log("Result:", result5);
  console.log("");

  // Test 6: Send bulk notifications
  console.log("Test 6: Bulk Notifications");
  const result6 = await sendBulkPushNotifications(
    [1, 2, 3],
    "Sistem Duyurusu",
    "Yeni özellikler eklendi! Uygulamayı güncelleyin.",
    { type: "system_announcement" }
  );
  console.log("Result:", result6);
  console.log("");

  console.log("✅ All notification tests completed!");
}

/**
 * Simulate real-time appointment reminders
 */
export async function simulateAppointmentReminders() {
  console.log("📅 Simulating Appointment Reminders...\n");

  // Get appointments from database and send reminders
  // This would typically be called by a cron job

  const mockAppointments = [
    { clientId: 1, dietitianName: "Dr. Ayşe Yılmaz", time: new Date(Date.now() + 30 * 60 * 1000) },
    { clientId: 2, dietitianName: "Dr. Mehmet Kaya", time: new Date(Date.now() + 60 * 60 * 1000) },
    { clientId: 3, dietitianName: "Dr. Fatma Demir", time: new Date(Date.now() + 90 * 60 * 1000) },
  ];

  for (const appointment of mockAppointments) {
    const result = await sendAppointmentReminder(
      appointment.clientId,
      appointment.dietitianName,
      appointment.time
    );
    console.log(`Reminder sent to client ${appointment.clientId}:`, result);
  }

  console.log("\n✅ Appointment reminder simulation completed!");
}

/**
 * Simulate real-time meal feedback notifications
 */
export async function simulateMealFeedback() {
  console.log("🍽️ Simulating Meal Feedback Notifications...\n");

  const mockFeedback = [
    { clientId: 1, status: "approved" as const, message: "Mükemmel bir seçim! 👍" },
    { clientId: 2, status: "warning" as const, message: "Kalori miktarı biraz yüksek" },
    { clientId: 3, status: "needs_revision" as const, message: "Lütfen protein miktarını artır" },
  ];

  for (const feedback of mockFeedback) {
    const result = await sendMealApprovalNotification(
      feedback.clientId,
      feedback.status,
      feedback.message
    );
    console.log(`Meal feedback sent to client ${feedback.clientId}:`, result);
  }

  console.log("\n✅ Meal feedback simulation completed!");
}

/**
 * Simulate real-time achievement notifications
 */
export async function simulateAchievements() {
  console.log("🏆 Simulating Achievement Notifications...\n");

  const mockAchievements = [
    { clientId: 1, badge: "7 Gün Serisi", description: "7 gün boyunca tüm öğünleri kaydettin!" },
    { clientId: 2, badge: "Hedef Ulaşıldı", description: "Haftalık kalori hedefine ulaştın!" },
    { clientId: 3, badge: "Tutarlılık Uzmanı", description: "30 gün boyunca hiç gün kaçırmadın!" },
  ];

  for (const achievement of mockAchievements) {
    const result = await sendAchievementNotification(
      achievement.clientId,
      achievement.badge,
      achievement.description
    );
    console.log(`Achievement sent to client ${achievement.clientId}:`, result);
  }

  console.log("\n✅ Achievement simulation completed!");
}
