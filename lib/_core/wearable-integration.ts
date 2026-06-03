import { Platform } from "react-native";

/**
 * Wearable Integration Service
 * Syncs health data from Apple Health, Google Fit, and other wearable devices
 */

export interface HealthMetric {
  type:
    | "steps"
    | "heartRate"
    | "calories"
    | "distance"
    | "sleep"
    | "weight"
    | "bloodPressure"
    | "bloodGlucose";
  value: number;
  unit: string;
  timestamp: number;
  source: string;
  accuracy?: number;
}

export interface WearableDevice {
  id: string;
  name: string;
  type: "apple-watch" | "fitbit" | "garmin" | "samsung" | "xiaomi" | "generic";
  connected: boolean;
  lastSync: number;
  batteryLevel?: number;
}

export interface SyncResult {
  success: boolean;
  deviceId: string;
  metricsCount: number;
  syncedAt: number;
  errors?: string[];
}

export interface HealthDataSummary {
  date: string;
  steps: number;
  heartRate: {
    average: number;
    min: number;
    max: number;
  };
  calories: number;
  distance: number;
  sleep: {
    total: number;
    quality: number;
  };
  weight?: number;
}

/**
 * Wearable Integration Service
 */
export class WearableIntegrationService {
  private static instance: WearableIntegrationService;
  private connectedDevices: Map<string, WearableDevice> = new Map();
  private healthMetrics: HealthMetric[] = [];
  private syncHistory: SyncResult[] = [];

  private constructor() {
    this.initializeDevices();
  }

  static getInstance(): WearableIntegrationService {
    if (!WearableIntegrationService.instance) {
      WearableIntegrationService.instance = new WearableIntegrationService();
    }
    return WearableIntegrationService.instance;
  }

  /**
   * Initialize wearable devices
   */
  private initializeDevices(): void {
    // Apple Health (iOS)
    if (Platform.OS === "ios") {
      this.connectedDevices.set("apple-health", {
        id: "apple-health",
        name: "Apple Health",
        type: "apple-watch",
        connected: false,
        lastSync: 0,
      });
    }

    // Google Fit (Android)
    if (Platform.OS === "android") {
      this.connectedDevices.set("google-fit", {
        id: "google-fit",
        name: "Google Fit",
        type: "generic",
        connected: false,
        lastSync: 0,
      });
    }
  }

  /**
   * Connect to Apple Health (iOS)
   */
  async connectToAppleHealth(): Promise<boolean> {
    if (Platform.OS !== "ios") {
      console.warn("[Wearable] Apple Health only available on iOS");
      return false;
    }

    try {
      // In production, this would use react-native-health to connect to Apple Health
      // const permissions = {
      //   permissions: {
      //     read: [
      //       HKQuantityTypeIdentifierStepCount,
      //       HKQuantityTypeIdentifierHeartRate,
      //       HKQuantityTypeIdentifierActiveEnergyBurned,
      //       HKQuantityTypeIdentifierDistanceWalkingRunning,
      //       HKCategoryTypeIdentifierSleepAnalysis,
      //       HKQuantityTypeIdentifierBodyMass,
      //     ],
      //   },
      // };
      // await AppleHealthKit.initHealthKit(permissions);

      const device = this.connectedDevices.get("apple-health");
      if (device) {
        device.connected = true;
        device.lastSync = Date.now();
      }

      console.log("[Wearable] Connected to Apple Health");
      return true;
    } catch (error) {
      console.error("[Wearable] Error connecting to Apple Health:", error);
      return false;
    }
  }

  /**
   * Connect to Google Fit (Android)
   */
  async connectToGoogleFit(): Promise<boolean> {
    if (Platform.OS !== "android") {
      console.warn("[Wearable] Google Fit only available on Android");
      return false;
    }

    try {
      // In production, this would use react-native-google-fit to connect to Google Fit
      // const options = {
      //   scopes: [
      //     'https://www.googleapis.com/auth/fitness.activity.read',
      //     'https://www.googleapis.com/auth/fitness.body.read',
      //     'https://www.googleapis.com/auth/fitness.location.read',
      //   ],
      // };
      // await GoogleFit.authorize(options);

      const device = this.connectedDevices.get("google-fit");
      if (device) {
        device.connected = true;
        device.lastSync = Date.now();
      }

      console.log("[Wearable] Connected to Google Fit");
      return true;
    } catch (error) {
      console.error("[Wearable] Error connecting to Google Fit:", error);
      return false;
    }
  }

  /**
   * Sync health data from connected devices
   */
  async syncHealthData(deviceId: string): Promise<SyncResult> {
    const device = this.connectedDevices.get(deviceId);
    if (!device || !device.connected) {
      return {
        success: false,
        deviceId,
        metricsCount: 0,
        syncedAt: Date.now(),
        errors: ["Device not connected"],
      };
    }

    try {
      const metrics = await this.fetchMetricsFromDevice(deviceId);

      // Store metrics
      this.healthMetrics.push(...metrics);

      const result: SyncResult = {
        success: true,
        deviceId,
        metricsCount: metrics.length,
        syncedAt: Date.now(),
      };

      // Update device last sync
      device.lastSync = Date.now();

      // Record sync history
      this.syncHistory.push(result);

      console.log(`[Wearable] Synced ${metrics.length} metrics from ${deviceId}`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        deviceId,
        metricsCount: 0,
        syncedAt: Date.now(),
        errors: [errorMessage],
      };
    }
  }

  /**
   * Fetch metrics from device
   */
  private async fetchMetricsFromDevice(deviceId: string): Promise<HealthMetric[]> {
    try {
      // In production, this would fetch real data from the device
      // For now, return mock data

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mockMetrics: HealthMetric[] = [
        {
          type: "steps",
          value: 8234,
          unit: "steps",
          timestamp: Date.now(),
          source: deviceId,
          accuracy: 0.98,
        },
        {
          type: "heartRate",
          value: 72,
          unit: "bpm",
          timestamp: Date.now(),
          source: deviceId,
          accuracy: 0.95,
        },
        {
          type: "calories",
          value: 2150,
          unit: "kcal",
          timestamp: Date.now(),
          source: deviceId,
          accuracy: 0.92,
        },
        {
          type: "distance",
          value: 6.2,
          unit: "km",
          timestamp: Date.now(),
          source: deviceId,
          accuracy: 0.96,
        },
        {
          type: "sleep",
          value: 7.5,
          unit: "hours",
          timestamp: today.getTime(),
          source: deviceId,
          accuracy: 0.88,
        },
      ];

      return mockMetrics;
    } catch (error) {
      console.error("[Wearable] Error fetching metrics:", error);
      throw error;
    }
  }

  /**
   * Get connected devices
   */
  getConnectedDevices(): WearableDevice[] {
    return Array.from(this.connectedDevices.values()).filter((d) => d.connected);
  }

  /**
   * Get all devices
   */
  getAllDevices(): WearableDevice[] {
    return Array.from(this.connectedDevices.values());
  }

  /**
   * Disconnect device
   */
  disconnectDevice(deviceId: string): boolean {
    const device = this.connectedDevices.get(deviceId);
    if (!device) return false;

    device.connected = false;
    return true;
  }

  /**
   * Get health data for date range
   */
  getHealthDataForDateRange(startDate: Date, endDate: Date): HealthMetric[] {
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    return this.healthMetrics.filter(
      (metric) => metric.timestamp >= startTime && metric.timestamp <= endTime
    );
  }

  /**
   * Get daily summary
   */
  getDailySummary(date: Date): HealthDataSummary {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dayMetrics = this.getHealthDataForDateRange(dayStart, dayEnd);

    const stepsMetrics = dayMetrics.filter((m) => m.type === "steps");
    const heartRateMetrics = dayMetrics.filter((m) => m.type === "heartRate");
    const caloriesMetrics = dayMetrics.filter((m) => m.type === "calories");
    const distanceMetrics = dayMetrics.filter((m) => m.type === "distance");
    const sleepMetrics = dayMetrics.filter((m) => m.type === "sleep");

    const steps = stepsMetrics.reduce((sum, m) => sum + m.value, 0);
    const heartRateValues = heartRateMetrics.map((m) => m.value);
    const calories = caloriesMetrics.reduce((sum, m) => sum + m.value, 0);
    const distance = distanceMetrics.reduce((sum, m) => sum + m.value, 0);
    const sleep = sleepMetrics.reduce((sum, m) => sum + m.value, 0);

    return {
      date: date.toISOString().split("T")[0],
      steps,
      heartRate: {
        average:
          heartRateValues.length > 0
            ? heartRateValues.reduce((a, b) => a + b, 0) / heartRateValues.length
            : 0,
        min: heartRateValues.length > 0 ? Math.min(...heartRateValues) : 0,
        max: heartRateValues.length > 0 ? Math.max(...heartRateValues) : 0,
      },
      calories,
      distance,
      sleep: {
        total: sleep,
        quality: 0.85, // Mock quality score
      },
    };
  }

  /**
   * Get sync history
   */
  getSyncHistory(limit: number = 10): SyncResult[] {
    return this.syncHistory.slice(-limit);
  }

  /**
   * Clear health data
   */
  clearHealthData(): void {
    this.healthMetrics = [];
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalMetrics: number;
    connectedDevices: number;
    lastSyncTime: number | null;
    averageSteps: number;
  } {
    const connectedCount = Array.from(this.connectedDevices.values()).filter(
      (d) => d.connected
    ).length;

    const lastSync =
      this.syncHistory.length > 0
        ? this.syncHistory[this.syncHistory.length - 1].syncedAt
        : null;

    const stepsMetrics = this.healthMetrics.filter((m) => m.type === "steps");
    const averageSteps =
      stepsMetrics.length > 0
        ? stepsMetrics.reduce((sum, m) => sum + m.value, 0) / stepsMetrics.length
        : 0;

    return {
      totalMetrics: this.healthMetrics.length,
      connectedDevices: connectedCount,
      lastSyncTime: lastSync,
      averageSteps,
    };
  }

  /**
   * Enable auto-sync
   */
  enableAutoSync(intervalMinutes: number = 15): void {
    setInterval(() => {
      this.getConnectedDevices().forEach((device) => {
        this.syncHealthData(device.id).catch((error) => {
          console.error(`[Wearable] Auto-sync error for ${device.id}:`, error);
        });
      });
    }, intervalMinutes * 60 * 1000);

    console.log(`[Wearable] Auto-sync enabled every ${intervalMinutes} minutes`);
  }
}

export const wearableIntegrationService = WearableIntegrationService.getInstance();
