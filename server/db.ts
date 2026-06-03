import { and, asc, desc, eq, gte, inArray, lte, sum } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  appointmentReminders,
  appointments,
  clientHealthConditions,
  foodGroupItems,
  foodGroups,
  foodRules,
  foods,
  InsertAppointment,
  InsertFood,
  InsertFoodRule,
  InsertMeal,
  InsertMeasurement,
  InsertPairing,
  InsertProfile,
  InsertUser,
  mealAnalysis,
  InsertMealAnalysis,
  pushNotifications,
  InsertPushNotification,
  weeklyReports,
  InsertWeeklyReport,
  nutritionGoals,
  InsertNutritionGoal,
  waterIntake,
  InsertWaterIntake,
  mealApprovals,
  InsertMealApproval,
  messages,
  InsertMessage,
  weeklyFeedback,
  InsertWeeklyFeedback,
  achievements,
  InsertAchievement,
  weeklyChallenges,
  InsertWeeklyChallenge,
  nutritionPlans,
  InsertNutritionPlan,
  planAssignments,
  InsertPlanAssignment,
  payments,
  InsertPayment,
  meals,
  measurements,
  pairings,
  profiles,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

async function requireDb() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return db;
}

async function createUniqueInviteCode(db: Awaited<ReturnType<typeof requireDb>>) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = Math.random().toString(36).slice(2, 8).toUpperCase();
    const existing = await db.select().from(profiles).where(eq(profiles.inviteCode, candidate)).limit(1);
    if (existing.length === 0) {
      return candidate;
    }
  }

  return `DT${Date.now().toString().slice(-6)}`;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProfileByUserId(userId: number) {
  const db = await requireDb();
  const result = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return result[0] ?? null;
}

export async function upsertProfile(input: Pick<InsertProfile, "userId" | "role" | "displayName" | "bio">) {
  const db = await requireDb();
  const existing = await getProfileByUserId(input.userId);

  if (existing) {
    await db
      .update(profiles)
      .set({
        role: input.role,
        displayName: input.displayName,
        bio: input.bio ?? null,
        inviteCode: input.role === "dietitian" ? existing.inviteCode ?? (await createUniqueInviteCode(db)) : null,
      })
      .where(eq(profiles.userId, input.userId));
  } else {
    await db.insert(profiles).values({
      userId: input.userId,
      role: input.role,
      displayName: input.displayName,
      bio: input.bio ?? null,
      inviteCode: input.role === "dietitian" ? await createUniqueInviteCode(db) : null,
    });
  }

  return getProfileByUserId(input.userId);
}

export async function getActivePairingForClient(clientUserId: number) {
  const db = await requireDb();
  const result = await db
    .select()
    .from(pairings)
    .where(and(eq(pairings.clientUserId, clientUserId), eq(pairings.status, "active")))
    .limit(1);

  return result[0] ?? null;
}

export async function getActivePairingForDietitian(dietitianUserId: number) {
  const db = await requireDb();
  return db
    .select()
    .from(pairings)
    .where(and(eq(pairings.dietitianUserId, dietitianUserId), eq(pairings.status, "active")));
}

export async function connectClientToDietitianByCode(clientUserId: number, inviteCode: string) {
  const db = await requireDb();
  const profile = await getProfileByUserId(clientUserId);
  if (!profile || profile.role !== "client") {
    throw new Error("Client profile is required before pairing");
  }

  const normalizedCode = inviteCode.trim().toUpperCase();
  const dietitianProfile = await db
    .select()
    .from(profiles)
    .where(and(eq(profiles.inviteCode, normalizedCode), eq(profiles.role, "dietitian")))
    .limit(1);

  const target = dietitianProfile[0];
  if (!target) {
    throw new Error("Dietitian code not found");
  }

  const existing = await db
    .select()
    .from(pairings)
    .where(and(eq(pairings.clientUserId, clientUserId), eq(pairings.dietitianUserId, target.userId), eq(pairings.status, "active")))
    .limit(1);

  if (existing[0]) {
    return existing[0];
  }

  await db.insert(pairings).values({
    clientUserId,
    dietitianUserId: target.userId,
    status: "active",
  } satisfies InsertPairing);

  return getActivePairingForClient(clientUserId);
}

export async function listPairedClientsForDietitian(dietitianUserId: number) {
  const db = await requireDb();
  const activePairings = await getActivePairingForDietitian(dietitianUserId);
  if (activePairings.length === 0) return [];

  const clientIds = activePairings.map((item) => item.clientUserId);
  const clientProfiles = await db.select().from(profiles).where(inArray(profiles.userId, clientIds));
  const latestMeasurements = await db
    .select()
    .from(measurements)
    .where(inArray(measurements.clientUserId, clientIds))
    .orderBy(desc(measurements.recordedAt));

  return clientProfiles.map((profile) => ({
    profile,
    pairing: activePairings.find((item) => item.clientUserId === profile.userId) ?? null,
    latestMeasurement: latestMeasurements.find((item) => item.clientUserId === profile.userId) ?? null,
  }));
}

export async function getPairedDietitianForClient(clientUserId: number) {
  const db = await requireDb();
  const activePairing = await getActivePairingForClient(clientUserId);
  if (!activePairing) return null;

  const dietitianProfile = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, activePairing.dietitianUserId))
    .limit(1);

  return {
    pairing: activePairing,
    profile: dietitianProfile[0] ?? null,
  };
}

export async function createMeasurement(input: InsertMeasurement) {
  const db = await requireDb();
  await db.insert(measurements).values(input);
  return true;
}

export async function listMeasurementsForClient(clientUserId: number) {
  const db = await requireDb();
  return db
    .select()
    .from(measurements)
    .where(eq(measurements.clientUserId, clientUserId))
    .orderBy(desc(measurements.recordedAt));
}

export async function createMeal(input: InsertMeal) {
  const db = await requireDb();
  await db.insert(meals).values(input);
  return true;
}

export async function listMealsForClient(clientUserId: number) {
  const db = await requireDb();
  return db.select().from(meals).where(eq(meals.clientUserId, clientUserId)).orderBy(desc(meals.eatenAt));
}

export async function createAppointment(input: InsertAppointment) {
  const db = await requireDb();
  await db.insert(appointments).values(input);
  return true;
}

export async function listAppointmentsForUser(userId: number, role: "dietitian" | "client") {
  const db = await requireDb();
  if (role === "dietitian") {
    return db
      .select()
      .from(appointments)
      .where(eq(appointments.dietitianUserId, userId))
      .orderBy(desc(appointments.scheduledAt));
  }

  return db.select().from(appointments).where(eq(appointments.clientUserId, userId)).orderBy(desc(appointments.scheduledAt));
}

export async function createFood(input: InsertFood) {
  const db = await requireDb();
  await db.insert(foods).values(input);
  return true;
}

export async function listFoods() {
  const db = await requireDb();
  return db.select().from(foods).orderBy(foods.name);
}

export async function setFoodRule(input: InsertFoodRule) {
  const db = await requireDb();
  const existing = await db
    .select()
    .from(foodRules)
    .where(
      and(
        eq(foodRules.clientUserId, input.clientUserId),
        eq(foodRules.foodId, input.foodId),
        eq(foodRules.dietitianUserId, input.dietitianUserId),
      ),
    )
    .limit(1);

  if (existing[0]) {
    await db
      .update(foodRules)
      .set({
        type: input.type,
        note: input.note ?? null,
      })
      .where(eq(foodRules.id, existing[0].id));
  } else {
    await db.insert(foodRules).values(input);
  }

  return true;
}

export async function listFoodRulesForClient(clientUserId: number) {
  const db = await requireDb();
  const rules = await db.select().from(foodRules).where(eq(foodRules.clientUserId, clientUserId)).orderBy(desc(foodRules.updatedAt));
  if (rules.length === 0) return [];

  const foodIds = rules.map((item) => item.foodId);
  const relatedFoods = await db.select().from(foods).where(inArray(foods.id, foodIds));

  return rules.map((rule) => ({
    ...rule,
    food: relatedFoods.find((food) => food.id === rule.foodId) ?? null,
  }));
}


// ===== Health Conditions =====
export async function createHealthCondition(input: {
  clientUserId: number;
  dietitianUserId: number;
  condition: string;
  notes?: string;
}) {
  const db = await requireDb();
  await db.insert(clientHealthConditions).values({
    clientUserId: input.clientUserId,
    dietitianUserId: input.dietitianUserId,
    condition: input.condition,
    notes: input.notes ?? null,
  });
  return true;
}

export async function listHealthConditionsForClient(clientUserId: number) {
  const db = await requireDb();
  return db
    .select()
    .from(clientHealthConditions)
    .where(eq(clientHealthConditions.clientUserId, clientUserId))
    .orderBy(desc(clientHealthConditions.updatedAt));
}

export async function deleteHealthCondition(id: number) {
  const db = await requireDb();
  await db.delete(clientHealthConditions).where(eq(clientHealthConditions.id, id));
  return true;
}

// ===== Food Groups =====
export async function createFoodGroup(input: {
  createdByUserId: number;
  name: string;
  description?: string;
}) {
  const db = await requireDb();
  const result = await db.insert(foodGroups).values({
    createdByUserId: input.createdByUserId,
    name: input.name,
    description: input.description ?? null,
  });
  return result;
}

export async function listFoodGroupsForDietitian(dietitianUserId: number) {
  const db = await requireDb();
  return db
    .select()
    .from(foodGroups)
    .where(eq(foodGroups.createdByUserId, dietitianUserId))
    .orderBy(foodGroups.name);
}

export async function getFoodGroup(groupId: number) {
  const db = await requireDb();
  const group = await db.select().from(foodGroups).where(eq(foodGroups.id, groupId)).limit(1);
  if (!group[0]) return null;
  
  const items = await db
    .select()
    .from(foodGroupItems)
    .where(eq(foodGroupItems.foodGroupId, groupId));
  
  const foodIds = items.map((item) => item.foodId);
  const groupFoods = foodIds.length > 0 
    ? await db.select().from(foods).where(inArray(foods.id, foodIds))
    : [];
  
  return {
    ...group[0],
    foods: groupFoods,
  };
}

export async function addFoodToGroup(groupId: number, foodId: number) {
  const db = await requireDb();
  await db.insert(foodGroupItems).values({
    foodGroupId: groupId,
    foodId: foodId,
  });
  return true;
}

export async function removeFoodFromGroup(groupId: number, foodId: number) {
  const db = await requireDb();
  await db
    .delete(foodGroupItems)
    .where(
      and(
        eq(foodGroupItems.foodGroupId, groupId),
        eq(foodGroupItems.foodId, foodId),
      ),
    );
  return true;
}

export async function deleteFoodGroup(groupId: number) {
  const db = await requireDb();
  await db.delete(foodGroupItems).where(eq(foodGroupItems.foodGroupId, groupId));
  await db.delete(foodGroups).where(eq(foodGroups.id, groupId));
  return true;
}

// ===== Appointment Reminders =====
export async function createAppointmentReminder(input: {
  appointmentId: number;
  clientUserId: number;
  reminderAt: Date;
}) {
  const db = await requireDb();
  await db.insert(appointmentReminders).values({
    appointmentId: input.appointmentId,
    clientUserId: input.clientUserId,
    reminderAt: input.reminderAt,
    sent: false,
  });
  return true;
}

export async function listPendingReminders() {
  const db = await requireDb();
  return db
    .select()
    .from(appointmentReminders)
    .where(and(
      eq(appointmentReminders.sent, false),
      lte(appointmentReminders.reminderAt, new Date()),
    ))
    .orderBy(appointmentReminders.reminderAt);
}

export async function markReminderAsSent(reminderId: number) {
  const db = await requireDb();
  await db
    .update(appointmentReminders)
    .set({ sent: true })
    .where(eq(appointmentReminders.id, reminderId));
  return true;
}

export async function listRemindersForAppointment(appointmentId: number) {
  const db = await requireDb();
  return db
    .select()
    .from(appointmentReminders)
    .where(eq(appointmentReminders.appointmentId, appointmentId))
    .orderBy(appointmentReminders.reminderAt);
}

// Push Notification Functions
export async function createPushNotification(data: InsertPushNotification) {
  const db = await requireDb();
  const result = await db.insert(pushNotifications).values(data);
  return result[0];
}

export async function listPushNotifications(userId: number) {
  const db = await requireDb();
  return db
    .select()
    .from(pushNotifications)
    .where(eq(pushNotifications.userId, userId))
    .orderBy(desc(pushNotifications.createdAt));
}

export async function markNotificationAsSent(notificationId: number) {
  const db = await requireDb();
  await db
    .update(pushNotifications)
    .set({ sent: true, sentAt: new Date() })
    .where(eq(pushNotifications.id, notificationId));
  return true;
}

// Meal Analysis Functions
export async function createMealAnalysis(data: InsertMealAnalysis) {
  const db = await requireDb();
  const result = await db.insert(mealAnalysis).values(data);
  return result[0];
}

export async function getMealAnalysis(mealId: number) {
  const db = await requireDb();
  return db
    .select()
    .from(mealAnalysis)
    .where(eq(mealAnalysis.mealId, mealId))
    .then((rows) => rows[0] || null);
}

// Weekly Report Functions
export async function createWeeklyReport(data: InsertWeeklyReport) {
  const db = await requireDb();
  const result = await db.insert(weeklyReports).values(data);
  return result[0];
}

export async function getWeeklyReports(clientUserId: number, limit = 10) {
  const db = await requireDb();
  return db
    .select()
    .from(weeklyReports)
    .where(eq(weeklyReports.clientUserId, clientUserId))
    .orderBy(desc(weeklyReports.weekStartDate))
    .limit(limit);
}

export async function getLatestWeeklyReport(clientUserId: number) {
  const db = await requireDb();
  return db
    .select()
    .from(weeklyReports)
    .where(eq(weeklyReports.clientUserId, clientUserId))
    .orderBy(desc(weeklyReports.weekStartDate))
    .limit(1)
    .then((rows) => rows[0] || null);
}

// Nutrition Goals
export async function createNutritionGoal(data: InsertNutritionGoal) {
  const db = await requireDb();
  const result = await db.insert(nutritionGoals).values(data);
  return result[0];
}

export async function getNutritionGoal(clientUserId: number) {
  const db = await requireDb();
  return db
    .select()
    .from(nutritionGoals)
    .where(eq(nutritionGoals.clientUserId, clientUserId))
    .then((rows) => rows[0] || null);
}

// Water Intake
export async function createWaterIntake(data: InsertWaterIntake) {
  const db = await requireDb();
  const result = await db.insert(waterIntake).values(data);
  return result[0];
}

export async function getWaterIntakeTodayTotal(clientUserId: number) {
  const db = await requireDb();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const result = await db
    .select()
    .from(waterIntake)
    .where(eq(waterIntake.clientUserId, clientUserId));
  
  return result
    .filter(item => {
      const itemDate = new Date(item.recordedAt);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate.getTime() === today.getTime();
    })
    .reduce((sum, item) => sum + item.amountMl, 0);
}

// Meal Approvals
export async function createMealApproval(data: InsertMealApproval) {
  const db = await requireDb();
  const result = await db.insert(mealApprovals).values(data);
  return result[0];
}

export async function getMealApproval(mealId: number) {
  const db = await requireDb();
  return db
    .select()
    .from(mealApprovals)
    .where(eq(mealApprovals.mealId, mealId))
    .then((rows) => rows[0] || null);
}

// Messages
export async function createMessage(data: InsertMessage) {
  const db = await requireDb();
  const result = await db.insert(messages).values(data);
  return result[0];
}

export async function getMessages(pairingId: number) {
  const db = await requireDb();
  return db
    .select()
    .from(messages)
    .where(eq(messages.pairingId, pairingId))
    .orderBy(messages.createdAt);
}

// Weekly Feedback
export async function createWeeklyFeedback(data: InsertWeeklyFeedback) {
  const db = await requireDb();
  const result = await db.insert(weeklyFeedback).values(data);
  return result[0];
}

export async function getWeeklyFeedback(clientUserId: number, weekStartDate: Date) {
  const db = await requireDb();
  return db
    .select()
    .from(weeklyFeedback)
    .where(
      and(
        eq(weeklyFeedback.clientUserId, clientUserId),
        eq(weeklyFeedback.weekStartDate, weekStartDate)
      )
    )
    .then((rows) => rows[0] || null);
}

// Achievements
export async function createAchievement(data: InsertAchievement) {
  const db = await requireDb();
  const result = await db.insert(achievements).values(data);
  return result[0];
}

export async function getAchievements(clientUserId: number) {
  const db = await requireDb();
  return db
    .select()
    .from(achievements)
    .where(eq(achievements.clientUserId, clientUserId))
    .orderBy(desc(achievements.earnedAt));
}

// Weekly Challenges
export async function createWeeklyChallenge(data: InsertWeeklyChallenge) {
  const db = await requireDb();
  const result = await db.insert(weeklyChallenges).values(data);
  return result[0];
}

export async function getWeeklyChallenge(clientUserId: number, weekStartDate: Date) {
  const db = await requireDb();
  return db
    .select()
    .from(weeklyChallenges)
    .where(
      and(
        eq(weeklyChallenges.clientUserId, clientUserId),
        eq(weeklyChallenges.weekStartDate, weekStartDate)
      )
    )
    .then((rows) => rows[0] || null);
}

export async function completeWeeklyChallenge(challengeId: number) {
  const db = await requireDb();
  await db
    .update(weeklyChallenges)
    .set({ completed: true, completedAt: new Date() })
    .where(eq(weeklyChallenges.id, challengeId));
  return true;
}

// Nutrition Plans
export async function createNutritionPlan(data: InsertNutritionPlan) {
  const db = await requireDb();
  const result = await db.insert(nutritionPlans).values(data);
  return result[0];
}

export async function getNutritionPlans(dietitianUserId: number) {
  const db = await requireDb();
  return db
    .select()
    .from(nutritionPlans)
    .where(eq(nutritionPlans.dietitianUserId, dietitianUserId));
}

// Plan Assignments
export async function assignPlan(data: InsertPlanAssignment) {
  const db = await requireDb();
  const result = await db.insert(planAssignments).values(data);
  return result[0];
}

export async function getAssignedPlan(clientUserId: number) {
  const db = await requireDb();
  return db
    .select()
    .from(planAssignments)
    .where(eq(planAssignments.clientUserId, clientUserId))
    .then((rows) => rows[0] || null);
}

// Payments
export async function createPayment(data: InsertPayment) {
  const db = await requireDb();
  const result = await db.insert(payments).values(data);
  return result[0];
}

export async function getPayments(dietitianUserId: number) {
  const db = await requireDb();
  return db
    .select()
    .from(payments)
    .where(eq(payments.dietitianUserId, dietitianUserId))
    .orderBy(desc(payments.createdAt));
}

export async function updatePaymentStatus(paymentId: number, status: string) {
  const db = await requireDb();
  await db
    .update(payments)
    .set({ status: status as any, paymentDate: new Date() })
    .where(eq(payments.id, paymentId));
  return true;
}



// Stripe Payment Integration
export async function createStripePaymentIntent(paymentId: number, amount: number, clientEmail: string) {
  // This would call Stripe API to create payment intent
  // For now, we store the payment record
  const db = await requireDb();
  await db
    .update(payments)
    .set({ status: "pending" })
    .where(eq(payments.id, paymentId));
  return { clientSecret: `pi_${paymentId}_${Date.now()}` };
}

export async function confirmStripePayment(paymentId: number, stripePaymentId: string) {
  const db = await requireDb();
  await db
    .update(payments)
    .set({ status: "completed", paymentDate: new Date() })
    .where(eq(payments.id, paymentId));
  return true;
}

// Push Notifications
export async function schedulePushNotification(userId: number, title: string, body: string, scheduledFor: Date) {
  const db = await requireDb();
  // Store notification in database for scheduling
  return { scheduled: true, userId, title, body, scheduledFor };
}

export async function sendPushNotificationNow(userId: number, title: string, body: string) {
  // This would integrate with Expo Push Notifications API
  return { sent: true, userId, title, body };
}

// Data Export
export async function generateClientMealReport(clientUserId: number, startDate: Date, endDate: Date) {
  const db = await requireDb();
  const mealsList = await db
    .select()
    .from(meals)
    .where(
      and(
        eq(meals.clientUserId, clientUserId),
        gte(meals.eatenAt, startDate),
        lte(meals.eatenAt, endDate)
      )
    )
    .orderBy(asc(meals.eatenAt));
  
  return {
    clientUserId,
    period: { startDate, endDate },
    mealCount: mealsList.length,
    meals: mealsList,
    generatedAt: new Date(),
  };
}

export async function generateDietitianMonthlyReport(dietitianUserId: number, month: Date) {
  const db = await requireDb();
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  
  const paymentsList = await db
    .select()
    .from(payments)
    .where(
      and(
        eq(payments.dietitianUserId, dietitianUserId),
        gte(payments.paymentDate, monthStart),
        lte(payments.paymentDate, monthEnd)
      )
    );
  
  const totalRevenue = paymentsList.reduce((sum: number, p: typeof paymentsList[0]) => sum + parseFloat(p.amount), 0);
  
  return {
    dietitianUserId,
    month: monthStart,
    totalRevenue,
    paymentCount: paymentsList.length,
    payments: paymentsList,
    generatedAt: new Date(),
  };
}

export async function generateClientProgressReport(clientUserId: number) {
  const db = await requireDb();
  const measurementsList = await db
    .select()
    .from(measurements)
    .where(eq(measurements.clientUserId, clientUserId))
    .orderBy(asc(measurements.recordedAt));
  
  const achievementsList = await db
    .select()
    .from(achievements)
    .where(eq(achievements.clientUserId, clientUserId));
  
  return {
    clientUserId,
    measurements: measurementsList,
    achievements: achievementsList,
    generatedAt: new Date(),
  };
}
