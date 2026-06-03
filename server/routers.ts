import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { COOKIE_NAME } from "../shared/const";
import * as db from "./db";
import * as stripe from "./stripe";
import * as notifications from "./notifications";
import * as exportService from "./export";
import * as pushNotifications from "./pushNotifications";
import * as notificationPrefs from "./notificationPreferences";
import * as webhookLogsService from "./webhookLogs";
import * as exportSchedulerService from "./exportScheduler";
import * as biometricAuth from "./biometricAuth";
import * as twoFactorAuth from "./twoFactorAuth";
import * as advancedAnalytics from "./advancedAnalytics";
import * as wearableIntegration from "./wearableIntegration";
import {
  createNutritionGoal,
  getNutritionGoal,
  createWaterIntake,
  getWaterIntakeTodayTotal,
  createMealApproval,
  getMealApproval,
  createMessage,
  getMessages,
  createWeeklyFeedback,
  createAchievement,
  getAchievements,
  createWeeklyChallenge,
  completeWeeklyChallenge,
  createNutritionPlan,
  getNutritionPlans,
  assignPlan,
  createPayment,
  getPayments,
  updatePaymentStatus,
} from "./db";

const roleSchema = z.enum(["dietitian", "client"]);

async function requireProfile(userId: number) {
  const profile = await db.getProfileByUserId(userId);
  if (!profile) {
    throw new Error("Profile not found");
  }
  return profile;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  profile: router({
    me: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getProfileByUserId(ctx.user.id);
      if (!profile) {
        return {
          profile: null,
          pairedDietitian: null,
          pairedClients: [],
        };
      }

      if (profile.role === "dietitian") {
        return {
          profile,
          pairedDietitian: null,
          pairedClients: await db.listPairedClientsForDietitian(ctx.user.id),
        };
      }

      return {
        profile,
        pairedDietitian: await db.getPairedDietitianForClient(ctx.user.id),
        pairedClients: [],
      };
    }),
    setup: protectedProcedure
      .input(
        z.object({
          role: roleSchema,
          displayName: z.string().min(2).max(160),
          bio: z.string().max(500).optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        return db.upsertProfile({
          userId: ctx.user.id,
          role: input.role,
          displayName: input.displayName,
          bio: input.bio,
        });
      }),
  }),
  pairing: router({
    connectByCode: protectedProcedure
      .input(
        z.object({
          inviteCode: z.string().min(4).max(12),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const profile = await requireProfile(ctx.user.id);
        if (profile.role !== "client") {
          throw new Error("Only clients can connect with invite code");
        }
        return db.connectClientToDietitianByCode(ctx.user.id, input.inviteCode.trim().toUpperCase());
      }),
  }),
  dashboard: router({
    overview: protectedProcedure.query(async ({ ctx }) => {
      const profile = await requireProfile(ctx.user.id);
      const appointments = await db.listAppointmentsForUser(ctx.user.id, profile.role);

      if (profile.role === "dietitian") {
        return {
          role: profile.role,
          profile,
          pairedClients: await db.listPairedClientsForDietitian(ctx.user.id),
          appointments: appointments.slice(0, 5),
          foods: await db.listFoods(),
        };
      }

      const pairedDietitian = await db.getPairedDietitianForClient(ctx.user.id);
      return {
        role: profile.role,
        profile,
        pairedDietitian,
        appointments: appointments.slice(0, 5),
        measurements: (await db.listMeasurementsForClient(ctx.user.id)).slice(0, 5),
        meals: (await db.listMealsForClient(ctx.user.id)).slice(0, 5),
        foodRules: await db.listFoodRulesForClient(ctx.user.id),
      };
    }),
  }),
  measurements: router({
    list: protectedProcedure
      .input(
        z.object({
          clientUserId: z.number().optional(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const profile = await requireProfile(ctx.user.id);
        const clientUserId = profile.role === "dietitian" ? input.clientUserId ?? ctx.user.id : ctx.user.id;
        return db.listMeasurementsForClient(clientUserId);
      }),
    create: protectedProcedure
      .input(
        z.object({
          clientUserId: z.number(),
          heightCm: z.number().positive(),
          weightKg: z.number().positive(),
          bodyFatPercent: z.number().min(0).max(100).optional(),
          muscleMassKg: z.number().positive().optional(),
          notes: z.string().max(500).optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const profile = await requireProfile(ctx.user.id);
        if (profile.role !== "dietitian") {
          throw new Error("Only dietitians can create measurements");
        }

        await db.createMeasurement({
          clientUserId: input.clientUserId,
          dietitianUserId: ctx.user.id,
          heightCm: input.heightCm.toFixed(2),
          weightKg: input.weightKg.toFixed(2),
          bodyFatPercent: input.bodyFatPercent?.toFixed(2) ?? null,
          muscleMassKg: input.muscleMassKg?.toFixed(2) ?? null,
          notes: input.notes,
          recordedAt: new Date(),
        });

        return { success: true } as const;
      }),
  }),
  meals: router({
    list: protectedProcedure
      .input(
        z.object({
          clientUserId: z.number().optional(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const profile = await requireProfile(ctx.user.id);
        const clientUserId = profile.role === "client" ? ctx.user.id : input.clientUserId;
        if (!clientUserId) {
          return [];
        }
        return db.listMealsForClient(clientUserId);
      }),
    create: protectedProcedure
      .input(
        z.object({
          mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
          customMealType: z.string().max(100).optional(),
          eatenAt: z.string(),
          description: z.string().max(1000).optional(),
          photoUri: z.string().url().optional().or(z.literal("")),
          status: z.enum(["planned", "eaten", "skipped"]).default("eaten"),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const profile = await requireProfile(ctx.user.id);
        if (profile.role !== "client") {
          throw new Error("Only clients can create meals");
        }

        await db.createMeal({
          clientUserId: ctx.user.id,
          recordedByUserId: ctx.user.id,
          mealType: input.mealType,
          customMealType: input.customMealType || null,
          eatenAt: new Date(input.eatenAt),
          description: input.description,
          photoUri: input.photoUri || null,
          status: input.status,
        });

        return { success: true } as const;
      }),
  }),
  appointments: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const profile = await requireProfile(ctx.user.id);
      return db.listAppointmentsForUser(ctx.user.id, profile.role);
    }),
    create: protectedProcedure
      .input(
        z.object({
          clientUserId: z.number(),
          scheduledAt: z.string(),
          note: z.string().max(500).optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const profile = await requireProfile(ctx.user.id);
        if (profile.role !== "dietitian") {
          throw new Error("Only dietitians can create appointments");
        }

        await db.createAppointment({
          clientUserId: input.clientUserId,
          dietitianUserId: ctx.user.id,
          scheduledAt: new Date(input.scheduledAt),
          note: input.note,
          status: "scheduled",
        });

        return { success: true } as const;
      }),
  }),
  foods: router({
    list: protectedProcedure.query(async () => db.listFoods()),
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(2).max(160),
          calories: z.number().int().positive(),
          portionLabel: z.string().min(1).max(80),
          category: z.string().max(80).optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const profile = await requireProfile(ctx.user.id);
        if (profile.role !== "dietitian") {
          throw new Error("Only dietitians can create foods");
        }

        await db.createFood({
          createdByUserId: ctx.user.id,
          name: input.name,
          calories: input.calories,
          portionLabel: input.portionLabel,
          category: input.category,
        });

        return { success: true } as const;
      }),
    rules: router({
      list: protectedProcedure
        .input(
          z.object({
            clientUserId: z.number().optional(),
          }),
        )
        .query(async ({ ctx, input }) => {
          const profile = await requireProfile(ctx.user.id);
          const clientUserId = profile.role === "client" ? ctx.user.id : input.clientUserId;
          if (!clientUserId) {
            return [];
          }
          return db.listFoodRulesForClient(clientUserId);
        }),
      set: protectedProcedure
        .input(
          z.object({
            clientUserId: z.number(),
            foodId: z.number(),
            type: z.enum(["allowed", "forbidden"]),
            note: z.string().max(500).optional(),
          }),
        )
        .mutation(async ({ ctx, input }) => {
          const profile = await requireProfile(ctx.user.id);
          if (profile.role !== "dietitian") {
            throw new Error("Only dietitians can update food rules");
          }

          await db.setFoodRule({
            clientUserId: input.clientUserId,
            dietitianUserId: ctx.user.id,
            foodId: input.foodId,
            type: input.type,
            note: input.note,
          });

          return { success: true } as const;
        }),
    }),
  }),
  health: router({
    list: protectedProcedure
      .input(
        z.object({
          clientUserId: z.number().optional(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const profile = await requireProfile(ctx.user.id);
        const clientUserId = profile.role === "client" ? ctx.user.id : input.clientUserId;
        if (!clientUserId) {
          return [];
        }
        return db.listHealthConditionsForClient(clientUserId);
      }),
    add: protectedProcedure
      .input(
        z.object({
          clientUserId: z.number(),
          condition: z.string().min(2).max(80),
          notes: z.string().max(500).optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const profile = await requireProfile(ctx.user.id);
        if (profile.role !== "dietitian") {
          throw new Error("Only dietitians can add health conditions");
        }

        await db.createHealthCondition({
          clientUserId: input.clientUserId,
          dietitianUserId: ctx.user.id,
          condition: input.condition,
          notes: input.notes,
        });

        return { success: true } as const;
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const profile = await requireProfile(ctx.user.id);
        if (profile.role !== "dietitian") {
          throw new Error("Only dietitians can delete health conditions");
        }

        await db.deleteHealthCondition(input.id);
        return { success: true } as const;
      }),
  }),
  foodGroups: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const profile = await requireProfile(ctx.user.id);
      if (profile.role !== "dietitian") {
        return [];
      }
      return db.listFoodGroupsForDietitian(ctx.user.id);
    }),
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getFoodGroup(input.id);
      }),
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(2).max(160),
          description: z.string().max(500).optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const profile = await requireProfile(ctx.user.id);
        if (profile.role !== "dietitian") {
          throw new Error("Only dietitians can create food groups");
        }

        await db.createFoodGroup({
          createdByUserId: ctx.user.id,
          name: input.name,
          description: input.description,
        });

        return { success: true } as const;
      }),
    addFood: protectedProcedure
      .input(
        z.object({
          groupId: z.number(),
          foodId: z.number(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const profile = await requireProfile(ctx.user.id);
        if (profile.role !== "dietitian") {
          throw new Error("Only dietitians can add foods to groups");
        }

        await db.addFoodToGroup(input.groupId, input.foodId);
        return { success: true } as const;
      }),
    removeFood: protectedProcedure
      .input(
        z.object({
          groupId: z.number(),
          foodId: z.number(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const profile = await requireProfile(ctx.user.id);
        if (profile.role !== "dietitian") {
          throw new Error("Only dietitians can remove foods from groups");
        }

        await db.removeFoodFromGroup(input.groupId, input.foodId);
        return { success: true } as const;
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const profile = await requireProfile(ctx.user.id);
        if (profile.role !== "dietitian") {
          throw new Error("Only dietitians can delete food groups");
        }

        await db.deleteFoodGroup(input.id);
        return { success: true } as const;
      }),
  }),
  appointmentReminders: router({
    list: protectedProcedure
      .input(
        z.object({
          appointmentId: z.number(),
        }),
      )
      .query(async ({ input }) => {
        return db.listRemindersForAppointment(input.appointmentId);
      }),
    create: protectedProcedure
      .input(
        z.object({
          appointmentId: z.number(),
          clientUserId: z.number(),
          minutesBefore: z.number().int().positive(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const profile = await requireProfile(ctx.user.id);
        if (profile.role !== "dietitian") {
          throw new Error("Only dietitians can create reminders");
        }

        const reminderAt = new Date();
        reminderAt.setMinutes(reminderAt.getMinutes() + input.minutesBefore);

        await db.createAppointmentReminder({
          appointmentId: input.appointmentId,
          clientUserId: input.clientUserId,
          reminderAt,
        });

        return { success: true } as const;
      }),
  }),
  pushNotifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.listPushNotifications(ctx.user.id);
    }),
    create: protectedProcedure
      .input(
        z.object({
          userId: z.number(),
          title: z.string(),
          body: z.string(),
          type: z.enum(["appointment_reminder", "meal_reminder", "health_alert", "report_ready"]),
          relatedId: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Only dietitian can send notifications
        const profile = await db.getProfileByUserId(ctx.user.id);
        if (profile?.role !== "dietitian") {
          throw new Error("Only dietitians can send notifications");
        }

        return db.createPushNotification(input);
      }),
  }),
  mealAnalysis: router({
    get: protectedProcedure.input(z.object({ mealId: z.number() })).query(async ({ input }) => {
      return db.getMealAnalysis(input.mealId);
    }),
    create: protectedProcedure
      .input(
        z.object({
          mealId: z.number(),
          estimatedCalories: z.number().optional(),
          estimatedProtein: z.number().optional(),
          estimatedCarbs: z.number().optional(),
          estimatedFat: z.number().optional(),
          foodItems: z.string().optional(),
          confidence: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.createMealAnalysis({
          mealId: input.mealId,
          estimatedCalories: input.estimatedCalories?.toString(),
          estimatedProtein: input.estimatedProtein?.toString(),
          estimatedCarbs: input.estimatedCarbs?.toString(),
          estimatedFat: input.estimatedFat?.toString(),
          foodItems: input.foodItems,
          confidence: input.confidence?.toString(),
        });
      }),
  }),
  waterIntake: router({
    add: publicProcedure
      .input(z.object({
        clientUserId: z.number(),
        amountMl: z.number(),
      }))
      .mutation(async ({ input }) => {
        return createWaterIntake(input);
      }),
    getTodayTotal: publicProcedure
      .input(z.object({ clientUserId: z.number() }).optional())
      .query(async ({ input, ctx }) => {
        const userId = input?.clientUserId ?? ctx.user?.id ?? 0;
        return getWaterIntakeTodayTotal(userId);
      }),
  }),
  nutritionGoals: router({
    create: publicProcedure
      .input(z.object({
        clientUserId: z.number(),
        dietitianUserId: z.number(),
        dailyCalorieGoal: z.number().optional(),
        dailyProteinGoal: z.string().optional(),
        dailyCarbsGoal: z.string().optional(),
        dailyFatGoal: z.string().optional(),
        waterIntakeGoal: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return createNutritionGoal(input);
      }),
    get: publicProcedure
      .input(z.object({ clientUserId: z.number() }))
      .query(async ({ input }) => {
        return getNutritionGoal(input.clientUserId);
      }),
  }),
  weeklyReports: router({
    list: protectedProcedure.input(z.object({ clientUserId: z.number() })).query(async ({ input, ctx }) => {
      const profile = await db.getProfileByUserId(ctx.user.id);
      if (profile?.role === "client" && ctx.user.id !== input.clientUserId) {
        throw new Error("Unauthorized");
      }
      return db.getWeeklyReports(input.clientUserId);
    }),
    latest: protectedProcedure.input(z.object({ clientUserId: z.number() })).query(async ({ input, ctx }) => {
      const profile = await db.getProfileByUserId(ctx.user.id);
      if (profile?.role === "client" && ctx.user.id !== input.clientUserId) {
        throw new Error("Unauthorized");
      }
      return db.getLatestWeeklyReport(input.clientUserId);
    }),
    create: protectedProcedure
      .input(
        z.object({
          clientUserId: z.number(),
          weekStartDate: z.date(),
          weekEndDate: z.date(),
          totalMeals: z.number().optional(),
          averageDailyCalories: z.number().optional(),
          weightChange: z.number().optional(),
          notes: z.string().optional(),
          pdfUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const profile = await db.getProfileByUserId(ctx.user.id);
        if (profile?.role !== "dietitian") {
          throw new Error("Only dietitians can create reports");
        }

        return db.createWeeklyReport({
          clientUserId: input.clientUserId,
          dietitianUserId: ctx.user.id,
          weekStartDate: new Date(input.weekStartDate),
          weekEndDate: new Date(input.weekEndDate),
          totalMeals: input.totalMeals || 0,
          averageDailyCalories: input.averageDailyCalories?.toString(),
          weightChange: input.weightChange?.toString(),
          notes: input.notes,
          pdfUrl: input.pdfUrl,
        });
      }),
    




    // Meal Approvals
    approveMeal: publicProcedure
      .input(z.object({
        mealId: z.number(),
        dietitianUserId: z.number(),
        status: z.enum(["approved", "warning", "needs_revision"]),
        feedback: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return createMealApproval({
          mealId: input.mealId,
          dietitianUserId: input.dietitianUserId,
          status: input.status,
          feedback: input.feedback,
        });
      }),
    
    getMealApproval: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return getMealApproval(input);
      }),

    // Messages
    sendMessage: publicProcedure
      .input(z.object({
        pairingId: z.number(),
        senderUserId: z.number(),
        content: z.string(),
        mealId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return createMessage(input);
      }),
    
    getMessages: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return getMessages(input);
      }),

    // Weekly Feedback
    createWeeklyFeedback: publicProcedure
      .input(z.object({
        clientUserId: z.number(),
        dietitianUserId: z.number(),
        weekStartDate: z.date(),
        notes: z.string(),
      }))
      .mutation(async ({ input }) => {
        return createWeeklyFeedback(input);
      }),

    // Achievements
    grantAchievement: publicProcedure
      .input(z.object({
        clientUserId: z.number(),
        type: z.enum(["consistency_7days", "goal_met", "water_goal", "weekly_challenge"]),
      }))
      .mutation(async ({ input }) => {
        return createAchievement(input);
      }),
    
    getAchievements: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return getAchievements(input);
      }),

    // Weekly Challenges
    createChallenge: publicProcedure
      .input(z.object({
        clientUserId: z.number(),
        dietitianUserId: z.number(),
        weekStartDate: z.date(),
        challenge: z.string(),
      }))
      .mutation(async ({ input }) => {
        return createWeeklyChallenge(input);
      }),
    
    completeChallenge: publicProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        return completeWeeklyChallenge(input);
      }),

    // Nutrition Plans
    createPlan: publicProcedure
      .input(z.object({
        dietitianUserId: z.number(),
        name: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return createNutritionPlan(input);
      }),
    
    getPlans: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return getNutritionPlans(input);
      }),

    // Plan Assignments
    assignPlanToClient: publicProcedure
      .input(z.object({
        planId: z.number(),
        clientUserId: z.number(),
      }))
      .mutation(async ({ input }) => {
        return assignPlan(input);
      }),

    // Payments
    createPaymentRecord: publicProcedure
      .input(z.object({
        dietitianUserId: z.number(),
        clientUserId: z.number(),
        amount: z.string(),
        status: z.enum(["pending", "completed", "failed", "refunded"]).default("pending"),
      }))
      .mutation(async ({ input }) => {
        return createPayment({
          dietitianUserId: input.dietitianUserId,
          clientUserId: input.clientUserId,
          amount: input.amount,
          status: input.status,
        });
      }),
    
    getPaymentHistory: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return getPayments(input);
      }),
    
    updatePaymentStatus: publicProcedure
      .input(z.object({
        paymentId: z.number(),
        status: z.enum(["pending", "completed", "failed", "refunded"]),
      }))
      .mutation(async ({ input }) => {
        return updatePaymentStatus(input.paymentId, input.status);
      }),
  }),
  stripe: router({
    createPaymentIntent: protectedProcedure
      .input(z.object({
        amount: z.number().positive(),
        currency: z.string().default("usd"),
      }))
      .mutation(async ({ ctx, input }) => {
        return stripe.createPaymentIntent(input.amount, input.currency, {
          userId: ctx.user.id.toString(),
        });
      }),

    getPaymentIntentStatus: protectedProcedure
      .input(z.string())
      .query(async ({ input }) => {
        return stripe.getPaymentIntentStatus(input);
      }),

    createCustomer: protectedProcedure
      .input(z.object({
        email: z.string().email(),
        name: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return stripe.createStripeCustomer(input.email, input.name, {
          userId: ctx.user.id.toString(),
        });
      }),

    createSubscription: protectedProcedure
      .input(z.object({
        customerId: z.string(),
        priceId: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        return stripe.createSubscription(input.customerId, input.priceId, {
          userId: ctx.user.id.toString(),
        });
      }),

    getSubscriptionDetails: protectedProcedure
      .input(z.string())
      .query(async ({ input }) => {
        return stripe.getSubscriptionDetails(input);
      }),

    cancelSubscription: protectedProcedure
      .input(z.string())
      .mutation(async ({ input }) => {
        return stripe.cancelSubscription(input);
      }),
  }),

  payments: router({
    history: protectedProcedure.query(async ({ ctx }) => {
      const profile = await requireProfile(ctx.user.id);
      if (profile.role !== "dietitian") {
        throw new Error("Only dietitians can view payment history");
      }
      return db.getPayments(ctx.user.id);
    }),
    subscribe: protectedProcedure
      .input(z.object({
        planId: z.string(),
        cardNumber: z.string(),
        expiryDate: z.string(),
        cvv: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await requireProfile(ctx.user.id);
        if (profile.role !== "dietitian") {
          throw new Error("Only dietitians can subscribe");
        }
        // In production, this would call Stripe API
        // For now, we'll create a payment record
        const planPrices: Record<string, string> = {
          basic: "99",
          pro: "199",
          enterprise: "499",
        };
        const amount = planPrices[input.planId] || "99";
        await db.createPayment({
          dietitianUserId: ctx.user.id,
          clientUserId: ctx.user.id,
          amount,
          status: "completed",
        });
        return { success: true } as const;
      }),
  }),

  notifications: router({
    sendAppointmentReminder: protectedProcedure
      .input(z.object({
        clientUserId: z.number(),
        appointmentDate: z.date(),
        appointmentTitle: z.string(),
      }))
      .mutation(async ({ input }) => {
        return notifications.sendAppointmentReminder(
          input.clientUserId,
          input.appointmentDate,
          input.appointmentTitle
        );
      }),

    sendMealApprovalNotification: protectedProcedure
      .input(z.object({
        clientUserId: z.number(),
        mealId: z.number(),
        approvalStatus: z.enum(["approved", "rejected"]),
      }))
      .mutation(async ({ input }) => {
        return notifications.sendMealApprovalNotification(
          input.clientUserId,
          input.mealId,
          input.approvalStatus
        );
      }),

    sendAchievementNotification: protectedProcedure
      .input(z.object({
        clientUserId: z.number(),
        achievementType: z.string(),
        achievementTitle: z.string(),
      }))
      .mutation(async ({ input }) => {
        return notifications.sendAchievementNotification(
          input.clientUserId,
          input.achievementType,
          input.achievementTitle
        );
      }),

    sendWeeklyReportNotification: protectedProcedure
      .input(z.object({
        clientUserId: z.number(),
        weekStartDate: z.date(),
        reportSummary: z.string(),
      }))
      .mutation(async ({ input }) => {
        return notifications.sendWeeklyReportNotification(
          input.clientUserId,
          input.weekStartDate,
          input.reportSummary
        );
      }),

    sendMessageNotification: protectedProcedure
      .input(z.object({
        recipientUserId: z.number(),
        senderName: z.string(),
        messagePreview: z.string(),
      }))
      .mutation(async ({ input }) => {
        return notifications.sendMessageNotification(
          input.recipientUserId,
          input.senderName,
          input.messagePreview
        );
      }),

    scheduleAppointmentReminders: publicProcedure.mutation(async () => {
      return notifications.scheduleAppointmentReminders();
    }),

    scheduleWeeklyReports: publicProcedure.mutation(async () => {
      return notifications.scheduleWeeklyReports();
    }),

    scheduleMonthlyIncomeReports: publicProcedure.mutation(async () => {
      return notifications.scheduleMonthlyIncomeReports();
    }),

    scheduleClientPerformanceReports: publicProcedure.mutation(async () => {
      return notifications.scheduleClientPerformanceReports();
    }),

    getUserPreferences: protectedProcedure.query(async ({ ctx }) => {
      return notifications.getUserNotificationPreferences(ctx.user.id);
    }),

    updateUserPreferences: protectedProcedure
      .input(z.object({
        appointmentReminders: z.boolean().optional(),
        mealApprovals: z.boolean().optional(),
        achievements: z.boolean().optional(),
        weeklyReports: z.boolean().optional(),
        messages: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return notifications.updateUserNotificationPreferences(ctx.user.id, input);
      }),
  }),

  export: router({
    generateClientMealReport: protectedProcedure
      .input(z.object({
        clientUserId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
        format: z.enum(["csv", "json"]).default("csv"),
      }))
      .mutation(async ({ input }) => {
        return exportService.generateClientMealReport(
          input.clientUserId,
          input.startDate,
          input.endDate,
          input.format
        );
      }),

    generateClientMeasurementsReport: protectedProcedure
      .input(z.object({
        clientUserId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
        format: z.enum(["csv", "json"]).default("csv"),
      }))
      .mutation(async ({ input }) => {
        return exportService.generateClientMeasurementsReport(
          input.clientUserId,
          input.startDate,
          input.endDate,
          input.format
        );
      }),

    generateDietitianIncomeReport: protectedProcedure
      .input(z.object({
        dietitianUserId: z.number(),
        month: z.date(),
        format: z.enum(["csv", "json"]).default("csv"),
      }))
      .mutation(async ({ input }) => {
        return exportService.generateDietitianIncomeReport(
          input.dietitianUserId,
          input.month,
          input.format
        );
      }),

    generateClientPerformanceReport: protectedProcedure
      .input(z.object({
        clientUserId: z.number(),
        month: z.date(),
        format: z.enum(["csv", "json"]).default("csv"),
      }))
      .mutation(async ({ input }) => {
        return exportService.generateClientPerformanceReport(
          input.clientUserId,
          input.month,
          input.format
        );
      }),

    exportAllUserData: protectedProcedure
      .input(z.object({
        format: z.enum(["csv", "json"]).default("json"),
      }))
      .mutation(async ({ ctx, input }) => {
        return exportService.exportAllUserData(ctx.user.id, input.format);
      }),
  }),

  pushTokens: router({
    savePushToken: protectedProcedure
      .input(z.object({
        token: z.string(),
        platform: z.enum(["ios", "android", "web"]),
        deviceId: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return pushNotifications.savePushNotificationToken(
          ctx.user.id,
          input.token,
          input.platform,
          input.deviceId
        );
      }),

    getUserTokens: protectedProcedure.query(async ({ ctx }) => {
      return pushNotifications.getUserPushTokens(ctx.user.id);
    }),

    deleteToken: protectedProcedure
      .input(z.number())
      .mutation(async ({ ctx, input }) => {
        return pushNotifications.deletePushNotificationToken(ctx.user.id, input);
      }),

    sendNotification: protectedProcedure
      .input(z.object({
        userId: z.number(),
        title: z.string(),
        body: z.string(),
        data: z.record(z.string(), z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        return pushNotifications.sendPushNotification(
          input.userId,
          input.title,
          input.body,
          input.data as Record<string, string> | undefined
        );
      }),

    sendBulkNotifications: protectedProcedure
      .input(z.object({
        userIds: z.array(z.number()),
        title: z.string(),
        body: z.string(),
        data: z.record(z.string(), z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        return pushNotifications.sendBulkPushNotifications(
          input.userIds,
          input.title,
          input.body,
          input.data as Record<string, string> | undefined
        );
      }),

    deactivateToken: protectedProcedure
      .input(z.number())
      .mutation(async ({ ctx, input }) => {
        return pushNotifications.deactivatePushToken(ctx.user.id, input);
      }),

    cleanupExpiredTokens: publicProcedure.mutation(async () => {
      return pushNotifications.cleanupExpiredTokens();
    }),
  }),
  notificationPreferences: router({
    getPreferences: protectedProcedure.query(async ({ ctx }) => {
      return notificationPrefs.getUserNotificationPreferences(ctx.user.id);
    }),
    updatePreferences: protectedProcedure
      .input(z.object({
        appointmentReminders: z.boolean().optional(),
        mealApprovals: z.boolean().optional(),
        achievements: z.boolean().optional(),
        weeklyReports: z.boolean().optional(),
        messages: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return notificationPrefs.updateUserNotificationPreferences(ctx.user.id, input);
      }),
    resetPreferences: protectedProcedure.mutation(async ({ ctx }) => {
      return notificationPrefs.resetNotificationPreferences(ctx.user.id);
    }),
    disableAll: protectedProcedure.mutation(async ({ ctx }) => {
      return notificationPrefs.disableAllNotifications(ctx.user.id);
    }),
    enableAll: protectedProcedure.mutation(async ({ ctx }) => {
      return notificationPrefs.enableAllNotifications(ctx.user.id);
    }),
  }),
  webhookLogs: router({
    getLogs: publicProcedure
      .input(z.object({
        type: z.enum(["stripe", "expo"]).optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        return webhookLogsService.getWebhookLogs(input.type, input.limit, input.offset);
      }),
    getStatistics: publicProcedure.query(async () => {
      return webhookLogsService.getWebhookStatistics();
    }),
    getRecentErrors: publicProcedure
      .input(z.number().default(10))
      .query(async ({ input }) => {
        return webhookLogsService.getRecentWebhookErrors(input);
      }),
    getEventsByType: publicProcedure
      .input(z.object({
        type: z.enum(["stripe", "expo"]),
        limit: z.number().default(50),
      }))
      .query(async ({ input }) => {
        return webhookLogsService.getWebhookEventsByType(input.type, input.limit);
      }),
    clearOldLogs: publicProcedure.mutation(async () => {
      return webhookLogsService.clearOldWebhookLogs();
    }),
  }),
  exportScheduler: router({
    scheduleDaily: protectedProcedure
      .input(z.object({
        type: z.enum(["meals", "measurements", "income", "performance"]),
        format: z.enum(["csv", "json"]).default("csv"),
      }))
      .mutation(async ({ ctx, input }) => {
        return exportSchedulerService.scheduleDailyExport(
          ctx.user.id,
          input.type,
          input.format
        );
      }),
    executePending: publicProcedure.mutation(async () => {
      return exportSchedulerService.executePendingExports();
    }),
    getUserHistory: protectedProcedure
      .input(z.number().default(50))
      .query(async ({ ctx, input }) => {
        return exportSchedulerService.getUserExportHistory(ctx.user.id, input);
      }),
    cleanup: publicProcedure.mutation(async () => {
      return exportSchedulerService.cleanupExpiredExports();
    }),
    getStatistics: publicProcedure.query(async () => {
      return exportSchedulerService.getExportStatistics();
    }),
  }),
  biometric: router({
    registerDevice: protectedProcedure
      .input(z.object({
        deviceType: z.enum(["face", "fingerprint"]),
        deviceName: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        return biometricAuth.registerBiometricDevice(
          ctx.user.id,
          input.deviceType,
          input.deviceName
        );
      }),
    authenticate: protectedProcedure
      .input(z.enum(["face", "fingerprint"]))
      .mutation(async ({ ctx, input }) => {
        return biometricAuth.authenticateWithBiometric(ctx.user.id, input);
      }),
    getDevices: protectedProcedure.query(async ({ ctx }) => {
      return biometricAuth.getBiometricDevices(ctx.user.id);
    }),
    removeDevice: protectedProcedure
      .input(z.string())
      .mutation(async ({ ctx, input }) => {
        return biometricAuth.removeBiometricDevice(ctx.user.id, input);
      }),
    enable: protectedProcedure.mutation(async ({ ctx }) => {
      return biometricAuth.enableBiometric(ctx.user.id);
    }),
    disable: protectedProcedure.mutation(async ({ ctx }) => {
      return biometricAuth.disableBiometric(ctx.user.id);
    }),
  }),
  twoFactor: router({
    generateSecret: protectedProcedure.query(async () => {
      return twoFactorAuth.generateTwoFactorSecret(0);
    }),
    enable: protectedProcedure
      .input(z.string())
      .mutation(async ({ ctx, input }) => {
        return twoFactorAuth.enableTwoFactor(ctx.user.id, input);
      }),
    disable: protectedProcedure.mutation(async ({ ctx }) => {
      return twoFactorAuth.disableTwoFactor(ctx.user.id);
    }),
    verifyCode: protectedProcedure
      .input(z.string())
      .mutation(async ({ ctx, input }) => {
        return twoFactorAuth.verifyTwoFactorCode(ctx.user.id, input);
      }),
    verifyBackupCode: protectedProcedure
      .input(z.string())
      .mutation(async ({ ctx, input }) => {
        return twoFactorAuth.verifyBackupCode(ctx.user.id, input);
      }),
    sendSMS: protectedProcedure
      .input(z.string())
      .mutation(async ({ ctx, input }) => {
        return twoFactorAuth.sendTwoFactorSMS(ctx.user.id, input);
      }),
    verifySMS: protectedProcedure
      .input(z.string())
      .mutation(async ({ ctx, input }) => {
        return twoFactorAuth.verifySMSCode(ctx.user.id, input);
      }),
  }),
  analytics: router({
    getCohortAnalysis: publicProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ input }) => {
        return advancedAnalytics.getCohortAnalysis(input.startDate, input.endDate);
      }),
    getRetentionMetrics: publicProcedure.query(async () => {
      return advancedAnalytics.getRetentionMetrics();
    }),
    getUserEngagement: publicProcedure.query(async () => {
      return advancedAnalytics.getUserEngagement();
    }),
    getEngagementTrends: publicProcedure
      .input(z.number().default(30))
      .query(async ({ input }) => {
        return advancedAnalytics.getEngagementTrends(input);
      }),
    getHighValueUsers: publicProcedure.query(async () => {
      return advancedAnalytics.getHighValueUsers();
    }),
    getAtRiskUsers: publicProcedure.query(async () => {
      return advancedAnalytics.getAtRiskUsers();
    }),
  }),
  wearable: router({
    connectAppleHealth: protectedProcedure
      .input(z.string())
      .mutation(async ({ ctx, input }) => {
        return wearableIntegration.connectAppleHealth(ctx.user.id, input);
      }),
    connectGoogleFit: protectedProcedure
      .input(z.string())
      .mutation(async ({ ctx, input }) => {
        return wearableIntegration.connectGoogleFit(ctx.user.id, input);
      }),
    disconnect: protectedProcedure
      .input(z.string())
      .mutation(async ({ ctx, input }) => {
        return wearableIntegration.disconnectWearable(ctx.user.id, input);
      }),
    getDevices: protectedProcedure.query(async ({ ctx }) => {
      return wearableIntegration.getWearableDevices(ctx.user.id);
    }),
    syncAppleHealth: protectedProcedure.mutation(async ({ ctx }) => {
      return wearableIntegration.syncAppleHealthData(ctx.user.id);
    }),
    syncGoogleFit: protectedProcedure.mutation(async ({ ctx }) => {
      return wearableIntegration.syncGoogleFitData(ctx.user.id);
    }),
    getHealthData: protectedProcedure
      .input(z.number().default(30))
      .query(async ({ ctx, input }) => {
        return wearableIntegration.getSyncedHealthData(ctx.user.id, input);
      }),
    getDataSummary: protectedProcedure.query(async ({ ctx }) => {
      return wearableIntegration.getWearableDataSummary(ctx.user.id);
    }),
    enableAutoSync: protectedProcedure
      .input(z.string())
      .mutation(async ({ ctx, input }) => {
        return wearableIntegration.enableAutoSync(ctx.user.id, input);
      }),
    disableAutoSync: protectedProcedure
      .input(z.string())
      .mutation(async ({ ctx, input }) => {
        return wearableIntegration.disableAutoSync(ctx.user.id, input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
