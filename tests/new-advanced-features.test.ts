import { describe, it, expect, beforeEach } from "vitest";
import { micronutrientTrackingService } from "../lib/_core/micronutrient-tracking";
import { matchingAlgorithmService } from "../lib/_core/matching-algorithm";
import { offlineModeService } from "../lib/_core/offline-mode";

describe("New Advanced Features Tests", () => {
  // Note: These tests verify the service logic without UI dependencies
  beforeEach(() => {
    // Reset services before each test
  });

  // Micronutrient Tracking Tests
  describe("Micronutrient Tracking", () => {
    it("should get all micronutrients", () => {
      const micros = micronutrientTrackingService.getAllMicronutrients();
      expect(micros.length).toBeGreaterThan(0);
      expect(micros.length).toBeGreaterThanOrEqual(11);
    });

    it("should get micronutrient by type", () => {
      const micro = micronutrientTrackingService.getMicronutrient("vitamin_c");
      expect(micro).toBeDefined();
      expect(micro?.type).toBe("vitamin_c");
      expect(micro?.name).toBe("Vitamin C");
    });

    it("should set daily target", () => {
      const target = micronutrientTrackingService.setDailyTarget(
        "user-1",
        "vitamin_c",
        100,
        "high"
      );

      expect(target).toBeDefined();
      expect(target.micronutrientType).toBe("vitamin_c");
      expect(target.dailyTarget).toBe(100);
      expect(target.priority).toBe("high");
    });

    it("should get user targets", () => {
      micronutrientTrackingService.setDailyTarget("user-2", "iron", 15, "high");
      micronutrientTrackingService.setDailyTarget("user-2", "calcium", 1000, "medium");

      const targets = micronutrientTrackingService.getUserTargets("user-2");
      expect(targets.length).toBeGreaterThanOrEqual(2);
    });

    it("should log micronutrient", () => {
      const log = micronutrientTrackingService.logMicronutrient(
        "user-3",
        "vitamin_a",
        900,
        "Havuç"
      );

      expect(log).toBeDefined();
      expect(log.userId).toBe("user-3");
      expect(log.totalIntake["vitamin_a"]).toBe(900);
    });

    it("should get daily log", () => {
      micronutrientTrackingService.logMicronutrient("user-4", "vitamin_d", 600, "Yumurta");

      const log = micronutrientTrackingService.getDailyLog("user-4");
      expect(log).toBeDefined();
      expect(log?.entries.length).toBeGreaterThan(0);
    });

    it("should analyze intake", () => {
      micronutrientTrackingService.logMicronutrient("user-5", "fiber", 25, "Meyve");
      micronutrientTrackingService.logMicronutrient("user-5", "fiber", 10, "Sebze");

      const analysis = micronutrientTrackingService.analyzeIntake("user-5", "daily");

      expect(analysis).toBeDefined();
      expect(analysis.userId).toBe("user-5");
      expect(analysis.micronutrients.length).toBeGreaterThan(0);
      expect(analysis.overallScore).toBeGreaterThanOrEqual(0);
      expect(analysis.overallScore).toBeLessThanOrEqual(100);
    });

    it("should get statistics", () => {
      const stats = micronutrientTrackingService.getStatistics();
      expect(stats.totalMicronutrients).toBeGreaterThan(0);
      expect(stats.totalTargets).toBeGreaterThanOrEqual(0);
      expect(stats.totalLogs).toBeGreaterThanOrEqual(0);
    });
  });

  // Matching Algorithm Tests
  describe("Matching Algorithm", () => {
    it("should add client profile", () => {
      const profile = matchingAlgorithmService.addClientProfile({
        id: "client-test-1",
        name: "Test User",
        age: 30,
        gender: "other",
        goals: ["weight loss", "diabetes management"],
        preferredDietTypes: ["keto", "lowcarb"],
        allergies: ["peanut"],
        restrictions: [],
        healthConditions: ["diabetes"],
        preferredLanguage: "Turkish",
        budget: "medium",
        communicationPreference: "video",
        timezone: "Europe/Istanbul",
        createdAt: Date.now(),
      });

      expect(profile).toBeDefined();
      expect(profile.name).toBe("Test User");
    });

    it("should get client profile", () => {
      const profile = matchingAlgorithmService.addClientProfile({
        id: "client-test-2",
        name: "Another User",
        age: 25,
        gender: "other",
        goals: ["muscle gain"],
        preferredDietTypes: ["highprotein"],
        allergies: [],
        restrictions: [],
        healthConditions: [],
        preferredLanguage: "Turkish",
        budget: "high",
        communicationPreference: "chat",
        timezone: "Europe/Istanbul",
        createdAt: Date.now(),
      });

      const retrieved = matchingAlgorithmService.getClientProfile("client-test-2");
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe("Another User");
    });

    it("should get all dietitians", () => {
      const dietitians = matchingAlgorithmService.getAllDietitians();
      expect(dietitians.length).toBeGreaterThan(0);
      expect(dietitians.length).toBeGreaterThanOrEqual(3);
    });

    it("should find matches for client", () => {
      const profile = matchingAlgorithmService.addClientProfile({
        id: "client-test-3",
        name: "Match Test User",
        age: 35,
        gender: "other",
        goals: ["weight loss"],
        preferredDietTypes: ["keto"],
        allergies: [],
        restrictions: [],
        healthConditions: [],
        preferredLanguage: "Turkish",
        budget: "medium",
        communicationPreference: "video",
        timezone: "Europe/Istanbul",
        createdAt: Date.now(),
      });

      const result = matchingAlgorithmService.findMatches("client-test-3", 3);

      expect(result).toBeDefined();
      expect(result.matches.length).toBeGreaterThan(0);
      expect(result.topMatches.length).toBeLessThanOrEqual(3);
      expect(result.topMatches[0].score).toBeGreaterThanOrEqual(0);
      expect(result.topMatches[0].score).toBeLessThanOrEqual(100);
    });

    it("should get matching result", () => {
      matchingAlgorithmService.addClientProfile({
        id: "client-test-4",
        name: "Result Test User",
        age: 28,
        gender: "other",
        goals: ["sports nutrition"],
        preferredDietTypes: ["highprotein"],
        allergies: [],
        restrictions: [],
        healthConditions: [],
        preferredLanguage: "Turkish",
        budget: "high",
        communicationPreference: "mixed",
        timezone: "Europe/Istanbul",
        createdAt: Date.now(),
      });

      matchingAlgorithmService.findMatches("client-test-4", 5);
      const result = matchingAlgorithmService.getMatchingResult("client-test-4");

      expect(result).toBeDefined();
      expect(result?.clientId).toBe("client-test-4");
    });

    it("should get dietitian details", () => {
      const dietitians = matchingAlgorithmService.getAllDietitians();
      if (dietitians.length > 0) {
        const details = matchingAlgorithmService.getDietitianDetails(dietitians[0].id);
        expect(details).toBeDefined();
        expect(details?.id).toBe(dietitians[0].id);
      }
    });

    it("should get statistics", () => {
      const stats = matchingAlgorithmService.getStatistics();
      expect(stats.totalClients).toBeGreaterThanOrEqual(0);
      expect(stats.totalDietitians).toBeGreaterThan(0);
      expect(stats.totalMatches).toBeGreaterThanOrEqual(0);
    });
  });

  // Offline Mode Tests
  describe("Offline Mode", () => {
    it("should save offline data", async () => {
      const data = await offlineModeService.saveOfflineData("meal", {
        name: "Breakfast",
        calories: 500,
        timestamp: Date.now(),
      });

      expect(data).toBeDefined();
      expect(data.type).toBe("meal");
      expect(data.syncStatus).toBe("pending");
    });

    it("should get pending sync items", async () => {
      await offlineModeService.saveOfflineData("measurement", {
        weight: 75,
        date: Date.now(),
      });

      const pending = offlineModeService.getPendingSyncItems();
      expect(pending.length).toBeGreaterThan(0);
    });

    it("should mark item as synced", async () => {
      const data = await offlineModeService.saveOfflineData("appointment", {
        date: Date.now(),
        time: "10:00",
      });

      await offlineModeService.markAsSynced(data.id);

      const state = offlineModeService.getOfflineState();
      const synced = state.dataCache.find((d) => d.id === data.id);
      expect(synced?.syncStatus).toBe("synced");
    });

    it("should mark item as sync error", async () => {
      const data = await offlineModeService.saveOfflineData("message", {
        text: "Test message",
      });

      await offlineModeService.markAsSyncError(data.id, "Network error");

      const state = offlineModeService.getOfflineState();
      const error = state.dataCache.find((d) => d.id === data.id);
      expect(error?.syncStatus).toBe("error");
      expect(error?.error).toBe("Network error");
    });

    it("should set online status", () => {
      offlineModeService.setOnlineStatus(false);
      expect(offlineModeService.getOnlineStatus()).toBe(false);

      offlineModeService.setOnlineStatus(true);
      expect(offlineModeService.getOnlineStatus()).toBe(true);
    });

    it("should get offline state", async () => {
      await offlineModeService.saveOfflineData("feedback", {
        rating: 5,
        comment: "Great service",
      });

      const state = offlineModeService.getOfflineState();

      expect(state).toBeDefined();
      expect(state.isOnline).toBeDefined();
      expect(state.pendingSync).toBeGreaterThanOrEqual(0);
      expect(state.lastSyncTime).toBeGreaterThan(0);
      expect(state.dataCache).toBeDefined();
    });

    it("should get data by type", async () => {
      await offlineModeService.saveOfflineData("meal", { name: "Lunch" });
      await offlineModeService.saveOfflineData("meal", { name: "Dinner" });

      const meals = offlineModeService.getDataByType("meal");
      expect(meals.length).toBeGreaterThanOrEqual(2);
      expect(meals.every((m) => m.type === "meal")).toBe(true);
    });

    it("should get statistics", async () => {
      await offlineModeService.saveOfflineData("meal", { name: "Breakfast" });

      const stats = offlineModeService.getStatistics();

      expect(stats.totalItems).toBeGreaterThanOrEqual(0);
      expect(stats.pendingItems).toBeGreaterThanOrEqual(0);
      expect(stats.syncedItems).toBeGreaterThanOrEqual(0);
      expect(stats.errorItems).toBeGreaterThanOrEqual(0);
    });
  });

  // Integration Tests
  describe("Integration Tests", () => {
    it("should work together: micronutrient + matching + offline", async () => {
      // Log micronutrient
      micronutrientTrackingService.logMicronutrient("user-6", "vitamin_c", 90, "Orange");

      // Create client profile
      const profile = matchingAlgorithmService.addClientProfile({
        id: "client-integration",
        name: "Integration Test",
        age: 30,
        gender: "other",
        goals: ["health improvement"],
        preferredDietTypes: ["mediterranean"],
        allergies: [],
        restrictions: [],
        healthConditions: [],
        preferredLanguage: "Turkish",
        budget: "medium",
        communicationPreference: "mixed",
        timezone: "Europe/Istanbul",
        createdAt: Date.now(),
      });

      // Save offline data
      const offlineData = await offlineModeService.saveOfflineData("meal", {
        name: "Integration Test Meal",
        nutrients: { vitamin_c: 90 },
      });

      expect(profile).toBeDefined();
      expect(offlineData).toBeDefined();
    });

    it("should handle multiple users and operations", async () => {
      // Multiple users with micronutrients
      for (let i = 1; i <= 3; i++) {
        micronutrientTrackingService.logMicronutrient(
          `user-multi-${i}`,
          "iron",
          8 + i,
          "Meat"
        );
      }

      // Multiple client profiles
      for (let i = 1; i <= 3; i++) {
        matchingAlgorithmService.addClientProfile({
          id: `client-multi-${i}`,
          name: `User ${i}`,
          age: 25 + i,
          gender: "other",
          goals: ["health"],
          preferredDietTypes: ["mediterranean"],
          allergies: [],
          restrictions: [],
          healthConditions: [],
          preferredLanguage: "Turkish",
          budget: "medium",
          communicationPreference: "mixed",
          timezone: "Europe/Istanbul",
          createdAt: Date.now(),
        });
      }

      // Multiple offline data
      for (let i = 1; i <= 3; i++) {
        await offlineModeService.saveOfflineData("meal", {
          name: `Meal ${i}`,
          calories: 500 + i * 100,
        });
      }

      const stats = matchingAlgorithmService.getStatistics();
      const offlineStats = offlineModeService.getStatistics();

      expect(stats.totalClients).toBeGreaterThanOrEqual(3);
      expect(offlineStats.totalItems).toBeGreaterThanOrEqual(3);
    });
  });
});
