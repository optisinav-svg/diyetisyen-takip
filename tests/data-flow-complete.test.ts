import { describe, it, expect, beforeEach } from "vitest";
import { activityStreamService } from "../lib/_core/activity-stream";
import { recommendationsService } from "../lib/_core/recommendations-service";
import { goalProgressService } from "../lib/_core/goal-progress-service";
import { feedbackResponseService } from "../lib/_core/feedback-response-service";
import { clientResultsService } from "../lib/_core/client-results-service";
import { foodPackagesSharingService } from "../lib/_core/food-packages-sharing";
import { achievementNotificationsService } from "../lib/_core/achievement-notifications";

describe("Data Flow Integration Tests", () => {
  beforeEach(() => {
    // Clear any previous state if needed
  });

  describe("Activity Stream Service", () => {
    it("should create activity event", async () => {
      const event = await activityStreamService.createEvent(
        "client-1",
        "Ayşe Yılmaz",
        "client",
        "meal",
        "Öğün Kaydedildi",
        "Tavuk Salata kaydedildi",
        "🍽️",
        { mealName: "Tavuk Salata", calories: 450 },
        ["dietitian-1"]
      );

      expect(event).toBeDefined();
      expect(event.title).toBe("Öğün Kaydedildi");
      expect(event.type).toBe("meal");
    });

    it("should get activity feed for user", async () => {
      const feed = await activityStreamService.getActivityFeed("client-1");
      expect(feed).toBeDefined();
      expect(feed.events).toBeDefined();
      expect(Array.isArray(feed.events)).toBe(true);
    });

    it("should mark event as read", async () => {
      const feed = await activityStreamService.getActivityFeed("client-1");
      if (feed.events.length > 0) {
        await activityStreamService.markEventAsRead(feed.events[0].id);
        const updatedFeed = await activityStreamService.getActivityFeed("client-1");
        expect(updatedFeed.events[0].isRead).toBe(true);
      }
    });
  });

  describe("Recommendations Service", () => {
    it("should create recommendation", async () => {
      const rec = await recommendationsService.createRecommendation(
        "dietitian-1",
        "Dr. Mehmet Kaya",
        "client-1",
        "Ayşe Yılmaz",
        "Günlük Su Tüketimi",
        "Günde 2.5 litre su tüketin",
        "lifestyle",
        "high",
        ["Her sabah 1 bardak su için", "Öğünler arasında 250ml su tüketin"]
      );

      expect(rec).toBeDefined();
      expect(rec.title).toBe("Günlük Su Tüketimi");
      expect(rec.status).toBe("pending");
    });

    it("should get recommendations for client", async () => {
      const recs = await recommendationsService.getRecommendationsForClient("client-1");
      expect(Array.isArray(recs)).toBe(true);
      expect(recs.length).toBeGreaterThan(0);
    });

    it("should update recommendation status", async () => {
      const recs = await recommendationsService.getRecommendationsForClient("client-1");
      if (recs.length > 0) {
        const updated = await recommendationsService.updateRecommendationStatus(
          recs[0].id,
          "acknowledged",
          "Anladım"
        );
        expect(updated?.status).toBe("acknowledged");
        expect(updated?.clientResponse).toBe("Anladım");
      }
    });
  });

  describe("Goal Progress Service", () => {
    it("should update goal progress", async () => {
      const progress = await goalProgressService.updateGoalProgress(
        "goal-1",
        "client-1",
        "Ayşe Yılmaz",
        "dietitian-1",
        "Dr. Mehmet Kaya",
        "weight",
        "Kilo Kaybı",
        70,
        75,
        "kg",
        Date.now() - 30 * 24 * 60 * 60 * 1000,
        Date.now() + 60 * 24 * 60 * 60 * 1000
      );

      expect(progress).toBeDefined();
      expect(progress.goalType).toBe("weight");
      expect(progress.progressPercentage).toBeGreaterThan(0);
    });

    it("should get goal progress for client", async () => {
      const goals = await goalProgressService.getGoalProgressForClient("client-1");
      expect(Array.isArray(goals)).toBe(true);
    });

    it("should get goal statistics", async () => {
      const stats = await goalProgressService.getGoalStats("client-1");
      expect(stats).toBeDefined();
      expect(stats.totalGoals).toBeGreaterThanOrEqual(0);
      expect(stats.activeGoals).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Feedback Response Service", () => {
    it("should create feedback", async () => {
      const fb = await feedbackResponseService.createFeedback(
        "client-1",
        "Ayşe Yılmaz",
        "dietitian-1",
        "Dr. Mehmet Kaya",
        "progress",
        "Kilo Kaybında Duruş",
        "Son 2 haftadır kilo kaybetmiyorum",
        2
      );

      expect(fb).toBeDefined();
      expect(fb.status).toBe("new");
      expect(fb.title).toBe("Kilo Kaybında Duruş");
    });

    it("should get feedback for dietitian", async () => {
      const feedbacks = await feedbackResponseService.getFeedbackForDietitian("dietitian-1");
      expect(Array.isArray(feedbacks)).toBe(true);
    });

    it("should respond to feedback", async () => {
      const feedbacks = await feedbackResponseService.getFeedbackForDietitian("dietitian-1");
      if (feedbacks.length > 0) {
        const responded = await feedbackResponseService.respondToFeedback(
          feedbacks[0].id,
          "Bu normal bir duruş. Kalori alımını azaltabiliriz."
        );
        expect(responded?.status).toBe("responded");
        expect(responded?.dietitianResponse).toBeDefined();
      }
    });
  });

  describe("Client Results Service", () => {
    it("should generate client results", async () => {
      const metrics = {
        clientId: "client-1",
        clientName: "Ayşe Yılmaz",
        dietitianId: "dietitian-1",
        startDate: Date.now() - 90 * 24 * 60 * 60 * 1000,
        currentDate: Date.now(),
        weight: {
          initial: 85,
          current: 78,
          target: 70,
          change: -7,
          percentageChange: -8.2,
        },
        steps: {
          avgDaily: 8500,
          weeklyTotal: 59500,
          monthlyTotal: 255000,
          target: 10000,
        },
        heartRate: {
          avgResting: 72,
          avgActive: 120,
          target: 70,
        },
        sleep: {
          avgNightly: 7.5,
          weeklyAvg: 7.4,
          target: 8,
        },
        calories: {
          avgDaily: 1800,
          weeklyAvg: 1850,
          target: 1750,
        },
        mealConsistency: 85,
        goalCompletionRate: 60,
        recommendationAdherenceRate: 75,
        lastUpdated: Date.now(),
      };

      const result = await clientResultsService.generateClientResults(
        "client-1",
        "Ayşe Yılmaz",
        "dietitian-1",
        metrics,
        {
          mealsLogged: 245,
          goalsCompleted: 3,
          recommendationsFollowed: 12,
          consistencyDays: 78,
        }
      );

      expect(result).toBeDefined();
      expect(result.metrics.weight.change).toBe(-7);
    });

    it("should get client results", async () => {
      const result = await clientResultsService.getClientResults("client-1");
      expect(result).toBeDefined();
    });
  });

  describe("Food Packages Sharing Service", () => {
    it("should get packages for client", async () => {
      const packages = await foodPackagesSharingService.getPackagesForClient("client-1");
      expect(Array.isArray(packages)).toBe(true);
    });

    it("should accept package", async () => {
      const packages = await foodPackagesSharingService.getPackagesForClient("client-1");
      if (packages.length > 0) {
        const accepted = await foodPackagesSharingService.acceptPackage(
          packages[0].id,
          "Çok beğendim"
        );
        expect(accepted?.status).toBe("accepted");
      }
    });
  });

  describe("Achievement Notifications Service", () => {
    it("should award achievement", async () => {
      const ach = await achievementNotificationsService.awardAchievement(
        "client-1",
        "Ayşe Yılmaz",
        "dietitian-1",
        "Dr. Mehmet Kaya",
        "7 Gün Tutarlılık",
        "7 gün boyunca her gün öğün kaydı yaptı",
        "🔥",
        "consistency",
        1,
        50
      );

      expect(ach).toBeDefined();
      expect(ach.badgeName).toBe("7 Gün Tutarlılık");
      expect(ach.points).toBe(50);
    });

    it("should get achievements for client", async () => {
      const achievements = await achievementNotificationsService.getAchievementsForClient("client-1");
      expect(Array.isArray(achievements)).toBe(true);
    });

    it("should get total points", async () => {
      const points = await achievementNotificationsService.getTotalPointsForClient("client-1");
      expect(typeof points).toBe("number");
      expect(points).toBeGreaterThanOrEqual(0);
    });

    it("should get leaderboard", async () => {
      const leaderboard = await achievementNotificationsService.getLeaderboard(10);
      expect(Array.isArray(leaderboard)).toBe(true);
    });
  });

  describe("Integration Tests", () => {
    it("should handle complete workflow", async () => {
      // 1. Create recommendation
      const rec = await recommendationsService.createRecommendation(
        "dietitian-1",
        "Dr. Mehmet Kaya",
        "client-1",
        "Ayşe Yılmaz",
        "Test Önerisi",
        "Test açıklaması",
        "nutrition",
        "high",
        ["Test adımı 1", "Test adımı 2"]
      );

      expect(rec).toBeDefined();

      // 2. Update recommendation status
      const updated = await recommendationsService.updateRecommendationStatus(
        rec.id,
        "acknowledged",
        "Anladım"
      );

      expect(updated?.status).toBe("acknowledged");

      // 3. Create feedback
      const fb = await feedbackResponseService.createFeedback(
        "client-1",
        "Ayşe Yılmaz",
        "dietitian-1",
        "Dr. Mehmet Kaya",
        "general",
        "Teşekkürler",
        "Öneriniz çok faydalı oldu",
        5
      );

      expect(fb).toBeDefined();

      // 4. Award achievement
      const ach = await achievementNotificationsService.awardAchievement(
        "client-1",
        "Ayşe Yılmaz",
        "dietitian-1",
        "Dr. Mehmet Kaya",
        "İlk Başarı",
        "İlk başarıyı kazandı",
        "🎉",
        "milestone",
        1,
        100
      );

      expect(ach).toBeDefined();

      // 5. Get activity feed
      const feed = await activityStreamService.getActivityFeed("client-1", 20);
      expect(feed.events.length).toBeGreaterThan(0);
    });
  });
});
