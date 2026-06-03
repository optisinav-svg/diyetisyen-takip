import { describe, it, expect, beforeEach } from "vitest";
import { barcodeScannerService } from "../lib/_core/barcode-scanner";
import { aiMealRecognitionService } from "../lib/_core/ai-meal-recognition";
import { wearableIntegrationService } from "../lib/_core/wearable-integration";

/**
 * Barcode Scanner Tests
 */
describe("Barcode Scanner Service", () => {
  it("should validate correct barcode format", () => {
    expect(barcodeScannerService.validateBarcode("5901234123457")).toBe(true);
    expect(barcodeScannerService.validateBarcode("5000112126834")).toBe(true);
  });

  it("should reject invalid barcode format", () => {
    expect(barcodeScannerService.validateBarcode("invalid")).toBe(false);
    expect(barcodeScannerService.validateBarcode("123")).toBe(false);
    expect(barcodeScannerService.validateBarcode("")).toBe(false);
  });

  it("should identify barcode types correctly", () => {
    expect(barcodeScannerService.identifyBarcodeType("ean13")).toBe("EAN-13");
    expect(barcodeScannerService.identifyBarcodeType("qr")).toBe("QR Code");
    expect(barcodeScannerService.identifyBarcodeType("code128")).toBe("Code 128");
  });

  it("should scan barcode and return food item", async () => {
    const foodItem = await barcodeScannerService.scanBarcode("5901234123457");
    expect(foodItem).not.toBeNull();
    if (foodItem) {
      expect(foodItem.name).toBe("Elma");
      expect(foodItem.calories).toBe(52);
      expect(foodItem.protein).toBeGreaterThan(0);
    }
  });

  it("should return null for unknown barcode", async () => {
    const foodItem = await barcodeScannerService.scanBarcode("9999999999999");
    expect(foodItem).toBeNull();
  });

  it("should scan multiple items", async () => {
    const items = await barcodeScannerService.scanMultipleItems([
      "5901234123457",
      "5000112126834",
      "5010477000000",
    ]);
    expect(items.length).toBe(3);
    expect(items[0].name).toBe("Elma");
    expect(items[1].name).toBe("Süt (Tam Yağlı)");
    expect(items[2].name).toBe("Ekmek (Beyaz)");
  });
});

/**
 * AI Meal Recognition Tests
 */
describe("AI Meal Recognition Service", () => {
  beforeEach(() => {
    aiMealRecognitionService.clearHistory();
  });

  it("should analyze meal photo for breakfast", async () => {
    const result = await aiMealRecognitionService.analyzeMealPhoto(
      "mock://image.jpg",
      "breakfast"
    );

    expect(result).toBeDefined();
    expect(result.mealType).toBe("breakfast");
    expect(result.detectedFoods.length).toBeGreaterThan(0);
    expect(result.totalCalories).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it("should analyze meal photo for lunch", async () => {
    const result = await aiMealRecognitionService.analyzeMealPhoto(
      "mock://image.jpg",
      "lunch"
    );

    expect(result.mealType).toBe("lunch");
    expect(result.totalProtein).toBeGreaterThan(0);
  });

  it("should batch process multiple meals", async () => {
    const batch = await aiMealRecognitionService.batchAnalyzeMeals(
      ["mock://image1.jpg", "mock://image2.jpg", "mock://image3.jpg"],
      "lunch"
    );

    expect(batch.status).toBe("completed");
    expect(batch.processedCount).toBe(3);
    expect(batch.results.length).toBe(3);
  });

  it("should apply user corrections", async () => {
    const result = await aiMealRecognitionService.analyzeMealPhoto(
      "mock://image.jpg",
      "breakfast"
    );

    const corrected = aiMealRecognitionService.applyUserCorrection(
      result.id,
      result.detectedFoods[0].id,
      "Kızarmış Yumurta",
      "2 adet"
    );

    expect(corrected).not.toBeNull();
    if (corrected) {
      expect(corrected.detectedFoods[0].name).toBe("Kızarmış Yumurta");
      expect(corrected.corrections?.length).toBe(1);
    }
  });

  it("should approve meal", async () => {
    const result = await aiMealRecognitionService.analyzeMealPhoto(
      "mock://image.jpg",
      "breakfast"
    );

    const approved = aiMealRecognitionService.approveMeal(result.id);

    expect(approved).not.toBeNull();
    if (approved) {
      expect(approved.userApproved).toBe(true);
    }
  });

  it("should get recognition history", async () => {
    await aiMealRecognitionService.analyzeMealPhoto("mock://image1.jpg", "breakfast");
    await aiMealRecognitionService.analyzeMealPhoto("mock://image2.jpg", "lunch");

    const history = aiMealRecognitionService.getRecognitionHistory(10);

    expect(history.length).toBe(2);
    expect(history[0].mealType).toBe("lunch");
  });

  it("should get statistics", async () => {
    await aiMealRecognitionService.analyzeMealPhoto("mock://image1.jpg", "breakfast");
    await aiMealRecognitionService.analyzeMealPhoto("mock://image2.jpg", "lunch");

    const stats = aiMealRecognitionService.getStatistics();

    expect(stats.totalRecognitions).toBe(2);
    expect(stats.averageConfidence).toBeGreaterThan(0.8);
  });
});

/**
 * Wearable Integration Tests
 */
describe("Wearable Integration Service", () => {
  it("should get all devices", () => {
    const devices = wearableIntegrationService.getAllDevices();
    expect(devices.length).toBeGreaterThan(0);
  });

  it("should get connected devices", () => {
    const devices = wearableIntegrationService.getConnectedDevices();
    expect(Array.isArray(devices)).toBe(true);
  });

  it("should disconnect device", () => {
    const allDevices = wearableIntegrationService.getAllDevices();
    if (allDevices.length > 0) {
      const success = wearableIntegrationService.disconnectDevice(allDevices[0].id);
      expect(success).toBe(true);
    }
  });

  it("should get daily summary", () => {
    const today = new Date();
    const summary = wearableIntegrationService.getDailySummary(today);

    expect(summary).toBeDefined();
    expect(summary.date).toBeDefined();
    expect(summary.steps).toBeGreaterThanOrEqual(0);
    expect(summary.heartRate).toBeDefined();
    expect(summary.calories).toBeGreaterThanOrEqual(0);
  });

  it("should get health data for date range", () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const endDate = new Date();

    const metrics = wearableIntegrationService.getHealthDataForDateRange(
      startDate,
      endDate
    );

    expect(Array.isArray(metrics)).toBe(true);
  });

  it("should get sync history", () => {
    const history = wearableIntegrationService.getSyncHistory(5);
    expect(Array.isArray(history)).toBe(true);
  });

  it("should get statistics", () => {
    const stats = wearableIntegrationService.getStatistics();

    expect(stats).toBeDefined();
    expect(stats.totalMetrics).toBeGreaterThanOrEqual(0);
    expect(stats.connectedDevices).toBeGreaterThanOrEqual(0);
    expect(stats.averageSteps).toBeGreaterThanOrEqual(0);
  });
});

/**
 * Integration Tests
 */
describe("Feature Integration", () => {
  it("should work together: barcode scan -> meal record -> wearable sync", async () => {
    // Barcode scan
    const foodItem = await barcodeScannerService.scanBarcode("5901234123457");
    expect(foodItem).not.toBeNull();

    // Meal recognition
    const mealResult = await aiMealRecognitionService.analyzeMealPhoto(
      "mock://image.jpg",
      "breakfast"
    );
    expect(mealResult.totalCalories).toBeGreaterThan(0);

    // Wearable data
    const today = new Date();
    const summary = wearableIntegrationService.getDailySummary(today);
    expect(summary.steps).toBeGreaterThanOrEqual(0);

    // All should work together
    expect(foodItem?.calories).toBeLessThan(mealResult.totalCalories);
  });

  it("should handle multiple features simultaneously", async () => {
    const promises = [
      barcodeScannerService.scanBarcode("5901234123457"),
      aiMealRecognitionService.analyzeMealPhoto("mock://image.jpg", "lunch"),
      Promise.resolve(wearableIntegrationService.getStatistics()),
    ];

    const results = await Promise.all(promises);

    expect(results[0]).not.toBeNull();
    expect(results[1]).toBeDefined();
    expect(results[2]).toBeDefined();
  });
});
