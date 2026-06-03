import {
  boolean,
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const profiles = mysqlTable("profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  role: mysqlEnum("profileRole", ["dietitian", "client"]).notNull(),
  displayName: varchar("displayName", { length: 160 }).notNull(),
  inviteCode: varchar("inviteCode", { length: 12 }).unique(),
  bio: text("bio"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const pairings = mysqlTable("pairings", {
  id: int("id").autoincrement().primaryKey(),
  dietitianUserId: int("dietitianUserId").notNull(),
  clientUserId: int("clientUserId").notNull(),
  status: mysqlEnum("pairingStatus", ["pending", "active", "archived"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const measurements = mysqlTable("measurements", {
  id: int("id").autoincrement().primaryKey(),
  clientUserId: int("clientUserId").notNull(),
  dietitianUserId: int("dietitianUserId").notNull(),
  heightCm: decimal("heightCm", { precision: 6, scale: 2 }).notNull(),
  weightKg: decimal("weightKg", { precision: 6, scale: 2 }).notNull(),
  bodyFatPercent: decimal("bodyFatPercent", { precision: 5, scale: 2 }),
  muscleMassKg: decimal("muscleMassKg", { precision: 6, scale: 2 }),
  notes: text("notes"),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  dietitianUserId: int("dietitianUserId").notNull(),
  clientUserId: int("clientUserId").notNull(),
  scheduledAt: timestamp("scheduledAt").notNull(),
  note: text("note"),
  status: mysqlEnum("appointmentStatus", ["scheduled", "completed", "cancelled"]).default("scheduled").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const foods = mysqlTable("foods", {
  id: int("id").autoincrement().primaryKey(),
  createdByUserId: int("createdByUserId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  calories: int("calories").notNull(),
  portionLabel: varchar("portionLabel", { length: 80 }).notNull(),
  category: varchar("category", { length: 80 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const foodRules = mysqlTable("foodRules", {
  id: int("id").autoincrement().primaryKey(),
  clientUserId: int("clientUserId").notNull(),
  dietitianUserId: int("dietitianUserId").notNull(),
  foodId: int("foodId").notNull(),
  type: mysqlEnum("foodRuleType", ["allowed", "forbidden"]).notNull(),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const clientHealthConditions = mysqlTable("clientHealthConditions", {
  id: int("id").autoincrement().primaryKey(),
  clientUserId: int("clientUserId").notNull(),
  dietitianUserId: int("dietitianUserId").notNull(),
  condition: varchar("condition", { length: 80 }).notNull(), // e.g., "şeker", "tansiyon", "kalp"
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const foodGroups = mysqlTable("foodGroups", {
  id: int("id").autoincrement().primaryKey(),
  createdByUserId: int("createdByUserId").notNull(),
  name: varchar("name", { length: 160 }).notNull(), // e.g., "Yemekler", "Meyveler", "Tatlılar"
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const foodGroupItems = mysqlTable("foodGroupItems", {
  id: int("id").autoincrement().primaryKey(),
  foodGroupId: int("foodGroupId").notNull(),
  foodId: int("foodId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const appointmentReminders = mysqlTable("appointmentReminders", {
  id: int("id").autoincrement().primaryKey(),
  appointmentId: int("appointmentId").notNull(),
  clientUserId: int("clientUserId").notNull(),
  reminderAt: timestamp("reminderAt").notNull(),
  sent: boolean("sent").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const meals = mysqlTable("meals", {
  id: int("id").autoincrement().primaryKey(),
  clientUserId: int("clientUserId").notNull(),
  recordedByUserId: int("recordedByUserId").notNull(),
  mealType: mysqlEnum("mealType", ["breakfast", "lunch", "dinner", "snack"]).default("snack").notNull(),
  customMealType: varchar("customMealType", { length: 100 }), // Custom meal type (e.g., "Second Breakfast", "Afternoon Snack")
  eatenAt: timestamp("eatenAt").notNull(),
  description: text("description"),
  photoUri: text("photoUri"),
  status: mysqlEnum("mealStatus", ["planned", "eaten", "skipped"]).default("eaten").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const mealAnalysis = mysqlTable("mealAnalysis", {
  id: int("id").autoincrement().primaryKey(),
  mealId: int("mealId").notNull().unique(),
  estimatedCalories: decimal("estimatedCalories", { precision: 7, scale: 1 }),
  estimatedProtein: decimal("estimatedProtein", { precision: 5, scale: 1 }),
  estimatedCarbs: decimal("estimatedCarbs", { precision: 5, scale: 1 }),
  estimatedFat: decimal("estimatedFat", { precision: 5, scale: 1 }),
  foodItems: text("foodItems"), // JSON array of detected foods
  confidence: decimal("confidence", { precision: 3, scale: 2 }), // 0.00 to 1.00
  analyzedAt: timestamp("analyzedAt").defaultNow().notNull(),
});

export const pushNotifications = mysqlTable("pushNotifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  body: text("body").notNull(),
  type: mysqlEnum("notificationType", ["appointment_reminder", "meal_reminder", "health_alert", "report_ready"]).notNull(),
  relatedId: int("relatedId"), // appointment ID, meal ID, etc.
  sent: boolean("sent").default(false).notNull(),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const weeklyReports = mysqlTable("weeklyReports", {
  id: int("id").autoincrement().primaryKey(),
  clientUserId: int("clientUserId").notNull(),
  dietitianUserId: int("dietitianUserId").notNull(),
  weekStartDate: timestamp("weekStartDate").notNull(),
  weekEndDate: timestamp("weekEndDate").notNull(),
  totalMeals: int("totalMeals").default(0).notNull(),
  averageDailyCalories: decimal("averageDailyCalories", { precision: 7, scale: 1 }),
  weightChange: decimal("weightChange", { precision: 5, scale: 2 }),
  notes: text("notes"),
  pdfUrl: text("pdfUrl"),
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

export type Pairing = typeof pairings.$inferSelect;
export type InsertPairing = typeof pairings.$inferInsert;

export type Measurement = typeof measurements.$inferSelect;
export type InsertMeasurement = typeof measurements.$inferInsert;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

export type Food = typeof foods.$inferSelect;
export type InsertFood = typeof foods.$inferInsert;

export type FoodRule = typeof foodRules.$inferSelect;
export type InsertFoodRule = typeof foodRules.$inferInsert;

export type Meal = typeof meals.$inferSelect;
export type InsertMeal = typeof meals.$inferInsert;

export type MealAnalysis = typeof mealAnalysis.$inferSelect;
export type InsertMealAnalysis = typeof mealAnalysis.$inferInsert;

export type PushNotification = typeof pushNotifications.$inferSelect;
export type InsertPushNotification = typeof pushNotifications.$inferInsert;

export type WeeklyReport = typeof weeklyReports.$inferSelect;
export type InsertWeeklyReport = typeof weeklyReports.$inferInsert;

// Nutrition Goals
export const nutritionGoals = mysqlTable("nutritionGoals", {
  id: int("id").autoincrement().primaryKey(),
  clientUserId: int("clientUserId").notNull(),
  dietitianUserId: int("dietitianUserId").notNull(),
  dailyCalorieGoal: int("dailyCalorieGoal"),
  dailyProteinGoal: decimal("dailyProteinGoal", { precision: 6, scale: 2 }),
  dailyCarbsGoal: decimal("dailyCarbsGoal", { precision: 6, scale: 2 }),
  dailyFatGoal: decimal("dailyFatGoal", { precision: 6, scale: 2 }),
  waterIntakeGoal: int("waterIntakeGoal"), // ml
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Water Intake Tracking
export const waterIntake = mysqlTable("waterIntake", {
  id: int("id").autoincrement().primaryKey(),
  clientUserId: int("clientUserId").notNull(),
  amountMl: int("amountMl").notNull(),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
});

// Meal Approval
export const mealApprovals = mysqlTable("mealApprovals", {
  id: int("id").autoincrement().primaryKey(),
  mealId: int("mealId").notNull(),
  dietitianUserId: int("dietitianUserId").notNull(),
  status: mysqlEnum("approvalStatus", ["pending", "approved", "warning", "needs_revision"]).default("pending").notNull(),
  feedback: text("feedback"),
  approvedAt: timestamp("approvedAt"),
});

// Messages
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  pairingId: int("pairingId").notNull(),
  senderUserId: int("senderUserId").notNull(),
  content: text("content").notNull(),
  mealId: int("mealId"), // optional reference to meal
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Weekly Feedback Notes
export const weeklyFeedback = mysqlTable("weeklyFeedback", {
  id: int("id").autoincrement().primaryKey(),
  clientUserId: int("clientUserId").notNull(),
  dietitianUserId: int("dietitianUserId").notNull(),
  weekStartDate: timestamp("weekStartDate").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Achievements/Badges
export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  clientUserId: int("clientUserId").notNull(),
  type: mysqlEnum("achievementType", ["consistency_7days", "goal_met", "water_goal", "weekly_challenge"]).notNull(),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
});

// Weekly Challenges
export const weeklyChallenges = mysqlTable("weeklyChallenges", {
  id: int("id").autoincrement().primaryKey(),
  clientUserId: int("clientUserId").notNull(),
  dietitianUserId: int("dietitianUserId").notNull(),
  weekStartDate: timestamp("weekStartDate").notNull(),
  challenge: text("challenge").notNull(),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completedAt"),
});

// Nutrition Plans
export const nutritionPlans = mysqlTable("nutritionPlans", {
  id: int("id").autoincrement().primaryKey(),
  dietitianUserId: int("dietitianUserId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Plan Assignments
export const planAssignments = mysqlTable("planAssignments", {
  id: int("id").autoincrement().primaryKey(),
  planId: int("planId").notNull(),
  clientUserId: int("clientUserId").notNull(),
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
});

// Payments
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  dietitianUserId: int("dietitianUserId").notNull(),
  clientUserId: int("clientUserId").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("paymentStatus", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  paymentDate: timestamp("paymentDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Type exports
export type NutritionGoal = typeof nutritionGoals.$inferSelect;
export type InsertNutritionGoal = typeof nutritionGoals.$inferInsert;

export type WaterIntake = typeof waterIntake.$inferSelect;
export type InsertWaterIntake = typeof waterIntake.$inferInsert;

export type MealApproval = typeof mealApprovals.$inferSelect;
export type InsertMealApproval = typeof mealApprovals.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

export type WeeklyFeedback = typeof weeklyFeedback.$inferSelect;
export type InsertWeeklyFeedback = typeof weeklyFeedback.$inferInsert;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

export type WeeklyChallenge = typeof weeklyChallenges.$inferSelect;
export type InsertWeeklyChallenge = typeof weeklyChallenges.$inferInsert;

export type NutritionPlan = typeof nutritionPlans.$inferSelect;
export type InsertNutritionPlan = typeof nutritionPlans.$inferInsert;

export type PlanAssignment = typeof planAssignments.$inferSelect;
export type InsertPlanAssignment = typeof planAssignments.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;



export const pushNotificationTokens = mysqlTable("pushNotificationTokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  token: text("token").notNull(),
  platform: mysqlEnum("platform", ["ios", "android", "web"]).notNull(),
  deviceId: varchar("deviceId", { length: 255 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PushNotificationToken = typeof pushNotificationTokens.$inferSelect;
export type InsertPushNotificationToken = typeof pushNotificationTokens.$inferInsert;

export const notificationPreferences = mysqlTable("notificationPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  appointmentReminders: boolean("appointmentReminders").default(true).notNull(),
  mealApprovals: boolean("mealApprovals").default(true).notNull(),
  achievements: boolean("achievements").default(true).notNull(),
  weeklyReports: boolean("weeklyReports").default(true).notNull(),
  messages: boolean("messages").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;

export const webhookLogs = mysqlTable("webhookLogs", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("webhookType", ["stripe", "expo"]).notNull(),
  event: varchar("event", { length: 255 }).notNull(),
  status: mysqlEnum("webhookStatus", ["success", "failed", "pending"]).notNull(),
  payload: text("payload"),
  response: text("response"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WebhookLog = typeof webhookLogs.$inferSelect;
export type InsertWebhookLog = typeof webhookLogs.$inferInsert;

export const exportRecords = mysqlTable("exportRecords", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("exportType", ["meals", "measurements", "income", "performance", "user-data"]).notNull(),
  format: mysqlEnum("exportFormat", ["csv", "json"]).notNull(),
  status: mysqlEnum("exportStatus", ["completed", "failed", "pending"]).notNull(),
  fileSize: int("fileSize"),
  downloadUrl: text("downloadUrl"),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExportRecord = typeof exportRecords.$inferSelect;
export type InsertExportRecord = typeof exportRecords.$inferInsert;
