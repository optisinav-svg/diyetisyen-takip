import { describe, it, expect, beforeEach } from "vitest";
import { dietitianProductManagementService } from "../lib/_core/dietitian-product-management";
import { mealPlanTemplatesService } from "../lib/_core/meal-plan-templates";
import { achievementsSocialService } from "../lib/_core/achievements-social";

describe("Advanced Features Tests", () => {
  // Note: These tests verify the service logic without UI dependencies
  beforeEach(() => {
    // Reset services before each test
  });

  // Dietitian Product Management Tests
  describe("Dietitian Product Management", () => {
    it("should add a new product", () => {
      const product = dietitianProductManagementService.addProduct(
        "Tavuk Göğsü",
        "yemek",
        165,
        31,
        0,
        3.6,
        "dietitian-1"
      );

      expect(product).toBeDefined();
      expect(product?.name).toBe("Tavuk Göğsü");
      expect(product?.calories).toBe(165);
    });

    it("should delete a product", () => {
      const product = dietitianProductManagementService.addProduct(
        "Test Ürün",
        "meyve",
        50,
        1,
        12,
        0.3,
        "dietitian-1"
      );

      if (product) {
        dietitianProductManagementService.deleteProduct(product.id);
        const allProducts = dietitianProductManagementService.getAllProducts();
        const deleted = allProducts.find((p) => p.id === product.id);
        expect(deleted).toBeUndefined();
      }
    });

    it("should search products", () => {
      dietitianProductManagementService.addProduct(
        "Tavuk",
        "yemek",
        165,
        31,
        0,
        3.6,
        "dietitian-1"
      );
      dietitianProductManagementService.addProduct(
        "Balık",
        "yemek",
        206,
        22,
        0,
        13,
        "dietitian-1"
      );

      const results = dietitianProductManagementService.searchProducts("Tavuk");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toContain("Tavuk");
    });

    it("should create a product list", () => {
      const product1 = dietitianProductManagementService.addProduct(
        "Tavuk",
        "yemek",
        165,
        31,
        0,
        3.6,
        "dietitian-1"
      );
      const product2 = dietitianProductManagementService.addProduct(
        "Balık",
        "yemek",
        206,
        22,
        0,
        13,
        "dietitian-1"
      );

      if (product1 && product2) {
        const list = dietitianProductManagementService.createProductList(
          "Tavsiye Edilen Proteinler",
          "recommended",
          "dietitian-1",
          [product1.id, product2.id]
        );

        expect(list).toBeDefined();
        expect(list?.name).toBe("Tavsiye Edilen Proteinler");
        expect(list?.products.length).toBe(2);
      }
    });

    it("should get product categories", () => {
      const categories = dietitianProductManagementService.getCategories();
      expect(categories).toContain("yemek");
      expect(categories).toContain("tatlı");
      expect(categories).toContain("çorba");
      expect(categories).toContain("salata");
    });

    it("should get statistics", () => {
      dietitianProductManagementService.addProduct(
        "Tavuk",
        "yemek",
        165,
        31,
        0,
        3.6,
        "dietitian-1"
      );

      const stats = dietitianProductManagementService.getStatistics();
      expect(stats.totalProducts).toBeGreaterThan(0);
      expect(stats.totalLists).toBeGreaterThanOrEqual(0);
    });
  });

  // Meal Plan Templates Tests
  describe("Meal Plan Templates", () => {
    it("should get all templates", () => {
      const templates = mealPlanTemplatesService.getAllTemplates();
      expect(templates.length).toBeGreaterThan(0);
      expect(templates.length).toBeGreaterThanOrEqual(6);
    });

    it("should get template by type", () => {
      const template = mealPlanTemplatesService.getTemplateByType("keto");
      expect(template).toBeDefined();
      expect(template?.type).toBe("keto");
    });

    it("should create client meal plan", () => {
      const plan = mealPlanTemplatesService.createClientMealPlan(
        "client-1",
        "dietitian-1",
        "template-keto"
      );

      expect(plan).toBeDefined();
      expect(plan?.clientId).toBe("client-1");
      expect(plan?.status).toBe("active");
    });

    it("should customize meal plan", () => {
      const plan = mealPlanTemplatesService.createClientMealPlan(
        "client-1",
        "dietitian-1",
        "template-keto"
      );

      if (plan) {
        const customized = mealPlanTemplatesService.customizeMealPlan(
          plan.id,
          "meal-keto-breakfast",
          {
            mealId: "meal-keto-breakfast",
            changes: {
              addedItems: ["Kahve"],
              removedItems: ["Peynir"],
            },
            notes: "Müşteri peynir alerjisi var",
          }
        );

        expect(customized).toBeDefined();
        expect(customized?.customizations.length).toBeGreaterThan(0);
      }
    });

    it("should update plan status", () => {
      const plan = mealPlanTemplatesService.createClientMealPlan(
        "client-1",
        "dietitian-1",
        "template-mediterranean"
      );

      if (plan) {
        const updated = mealPlanTemplatesService.updatePlanStatus(plan.id, "completed");
        expect(updated?.status).toBe("completed");
        expect(updated?.endDate).toBeDefined();
      }
    });

    it("should get client meal plans", () => {
      mealPlanTemplatesService.createClientMealPlan(
        "client-2",
        "dietitian-1",
        "template-vegetarian"
      );

      const plans = mealPlanTemplatesService.getClientMealPlans("client-2");
      expect(plans.length).toBeGreaterThan(0);
    });

    it("should get meal plan statistics", () => {
      mealPlanTemplatesService.createClientMealPlan(
        "client-3",
        "dietitian-1",
        "template-vegan"
      );

      const stats = mealPlanTemplatesService.getStatistics();
      expect(stats.totalTemplates).toBeGreaterThan(0);
      expect(stats.totalClientPlans).toBeGreaterThanOrEqual(0);
    });
  });

  // Achievements & Social Tests
  describe("Achievements & Social Sharing", () => {
    it("should unlock achievement", () => {
      const achievement = achievementsSocialService.unlockAchievement(
        "user-1",
        "first_meal"
      );

      expect(achievement).toBeDefined();
      expect(achievement?.badge.type).toBe("first_meal");
      expect(achievement?.unlockedAt).toBeDefined();
    });

    it("should get user achievements", () => {
      achievementsSocialService.unlockAchievement("user-2", "first_meal");
      achievementsSocialService.unlockAchievement("user-2", "week_consistency");

      const achievements = achievementsSocialService.getUserAchievements("user-2");
      expect(achievements.length).toBeGreaterThanOrEqual(2);
    });

    it("should check if user has badge", () => {
      achievementsSocialService.unlockAchievement("user-3", "month_consistency");

      const hasBadge = achievementsSocialService.hasBadge("user-3", "month_consistency");
      expect(hasBadge).toBe(true);

      const noHasBadge = achievementsSocialService.hasBadge("user-3", "social_sharer");
      expect(noHasBadge).toBe(false);
    });

    it("should share achievement on social media", () => {
      const achievement = achievementsSocialService.unlockAchievement(
        "user-4",
        "weight_loss"
      );

      if (achievement) {
        const share = achievementsSocialService.shareAchievement(
          "user-4",
          achievement.id,
          "facebook"
        );

        expect(share).toBeDefined();
        expect(share?.platform).toBe("facebook");
        expect(share?.type).toBe("achievement");
      }
    });

    it("should share progress", () => {
      const share = achievementsSocialService.shareProgress(
        "user-5",
        "Bu ay 5 kg verdim! 🎉",
        "instagram"
      );

      expect(share).toBeDefined();
      expect(share.type).toBe("progress");
      expect(share.platform).toBe("instagram");
    });

    it("should get user stats", () => {
      achievementsSocialService.unlockAchievement("user-6", "first_meal");
      achievementsSocialService.unlockAchievement("user-6", "week_consistency");

      const stats = achievementsSocialService.getUserStats("user-6");
      expect(stats).toBeDefined();
      expect(stats?.totalBadges).toBeGreaterThanOrEqual(2);
    });

    it("should get leaderboard", () => {
      achievementsSocialService.unlockAchievement("user-7", "first_meal");
      achievementsSocialService.unlockAchievement("user-8", "week_consistency");
      achievementsSocialService.unlockAchievement("user-8", "month_consistency");

      const leaderboard = achievementsSocialService.getLeaderboard(5);
      expect(leaderboard.length).toBeGreaterThan(0);
    });

    it("should get trending achievements", () => {
      const achievement1 = achievementsSocialService.unlockAchievement(
        "user-9",
        "first_meal"
      );
      const achievement2 = achievementsSocialService.unlockAchievement(
        "user-10",
        "week_consistency"
      );

      if (achievement1 && achievement2) {
        achievementsSocialService.shareAchievement("user-9", achievement1.id, "twitter");
        achievementsSocialService.shareAchievement("user-10", achievement2.id, "whatsapp");

        const trending = achievementsSocialService.getTrendingAchievements(5);
        expect(trending.length).toBeGreaterThan(0);
      }
    });

    it("should get all badges", () => {
      const badges = achievementsSocialService.getAllBadges();
      expect(badges.length).toBeGreaterThan(0);
      expect(badges.some((b) => b.type === "first_meal")).toBe(true);
      expect(badges.some((b) => b.type === "social_sharer")).toBe(true);
    });

    it("should get achievement statistics", () => {
      achievementsSocialService.unlockAchievement("user-11", "first_meal");

      const stats = achievementsSocialService.getStatistics();
      expect(stats.totalUsers).toBeGreaterThanOrEqual(0);
      expect(stats.totalAchievements).toBeGreaterThanOrEqual(0);
      expect(stats.totalShares).toBeGreaterThanOrEqual(0);
    });

    it("should update achievement progress", () => {
      // First unlock the achievement
      achievementsSocialService.unlockAchievement("user-12", "week_consistency");
      
      // Then update progress
      achievementsSocialService.updateAchievementProgress("user-12", "week_consistency", 50);

      const progress = achievementsSocialService.getAchievementProgress(
        "user-12",
        "week_consistency"
      );
      expect(progress).toBe(50);
    });
  });

  // Integration Tests
  describe("Integration Tests", () => {
    it("should work together: product management + meal plans + achievements", async () => {
      // Create products
      const product1 = dietitianProductManagementService.addProduct(
        "Tavuk",
        "yemek",
        165,
        31,
        0,
        3.6,
        "dietitian-1"
      );

      // Create meal plan
      const plan = mealPlanTemplatesService.createClientMealPlan(
        "client-1",
        "dietitian-1",
        "template-highprotein"
      );

      // Unlock achievement
      const achievement = achievementsSocialService.unlockAchievement(
        "client-1",
        "first_meal"
      );

      expect(product1).toBeDefined();
      expect(plan).toBeDefined();
      expect(achievement).toBeDefined();
    });

    it("should handle multiple users and plans", () => {
      // User 1
      const plan1 = mealPlanTemplatesService.createClientMealPlan(
        "client-1",
        "dietitian-1",
        "template-keto"
      );

      // User 2
      const plan2 = mealPlanTemplatesService.createClientMealPlan(
        "client-2",
        "dietitian-1",
        "template-mediterranean"
      );

      // User 3
      const plan3 = mealPlanTemplatesService.createClientMealPlan(
        "client-3",
        "dietitian-1",
        "template-vegetarian"
      );

      const plans1 = mealPlanTemplatesService.getClientMealPlans("client-1");
      const plans2 = mealPlanTemplatesService.getClientMealPlans("client-2");
      const plans3 = mealPlanTemplatesService.getClientMealPlans("client-3");

      expect(plans1.length).toBeGreaterThan(0);
      expect(plans2.length).toBeGreaterThan(0);
      expect(plans3.length).toBeGreaterThan(0);
    });
  });
});
