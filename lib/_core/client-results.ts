import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ClientGoalProgress {
  goalId: string;
  goalName: string;
  goalType: "calorie" | "steps" | "sleep" | "water" | "weight" | "custom";
  targetValue: number;
  currentValue: number;
  unit: string;
  progress: number; // 0-100
  status: "on_track" | "at_risk" | "behind";
  lastUpdated: string;
}

export interface ClientActivitySummary {
  clientId: string;
  clientName: string;
  date: string;
  mealsLogged: number;
  activitiesLogged: number;
  waterIntake: number;
  stepsCount: number;
  sleepHours: number;
  caloriesBurned: number;
  caloriesConsumed: number;
  adherenceRate: number; // 0-100
  lastUpdated?: string;
}

export interface ClientHealthMetrics {
  clientId: string;
  clientName: string;
  weeklyAverages: {
    calories: number;
    steps: number;
    sleep: number;
    water: number;
  };
  trends: {
    caloriesTrend: "up" | "down" | "stable";
    stepsTrend: "up" | "down" | "stable";
    sleepTrend: "up" | "down" | "stable";
  };
  lastWeekAdherence: number;
  thisWeekAdherence: number;
  recommendations: string[];
}

// Mock data for testing
const mockClientResults: Record<string, ClientActivitySummary[]> = {
  "dietitian@test.com": [
    {
      clientId: "client@test.com",
      clientName: "Ahmet Yılmaz",
      date: new Date().toISOString(),
      mealsLogged: 4,
      activitiesLogged: 2,
      waterIntake: 2500,
      stepsCount: 8500,
      sleepHours: 7.5,
      caloriesBurned: 2200,
      caloriesConsumed: 1800,
      adherenceRate: 85,
    },
    {
      clientId: "demo@test.com",
      clientName: "Fatma Demir",
      date: new Date().toISOString(),
      mealsLogged: 3,
      activitiesLogged: 1,
      waterIntake: 1800,
      stepsCount: 6200,
      sleepHours: 6.5,
      caloriesBurned: 1800,
      caloriesConsumed: 1600,
      adherenceRate: 72,
    },
  ],
};

const mockClientGoals: Record<string, ClientGoalProgress[]> = {
  "client@test.com": [
    {
      goalId: "goal_1",
      goalName: "Günlük Kalori Hedefi",
      goalType: "calorie",
      targetValue: 1800,
      currentValue: 1650,
      unit: "kcal",
      progress: 92,
      status: "on_track",
      lastUpdated: new Date().toISOString(),
    },
    {
      goalId: "goal_2",
      goalName: "Günlük Adım Hedefi",
      goalType: "steps",
      targetValue: 10000,
      currentValue: 8500,
      unit: "adım",
      progress: 85,
      status: "on_track",
      lastUpdated: new Date().toISOString(),
    },
    {
      goalId: "goal_3",
      goalName: "Uyku Hedefi",
      goalType: "sleep",
      targetValue: 8,
      currentValue: 7.5,
      unit: "saat",
      progress: 94,
      status: "on_track",
      lastUpdated: new Date().toISOString(),
    },
  ],
  "demo@test.com": [
    {
      goalId: "goal_4",
      goalName: "Günlük Kalori Hedefi",
      goalType: "calorie",
      targetValue: 1600,
      currentValue: 1400,
      unit: "kcal",
      progress: 88,
      status: "on_track",
      lastUpdated: new Date().toISOString(),
    },
  ],
};

const mockClientMetrics: Record<string, ClientHealthMetrics> = {
  "client@test.com": {
    clientId: "client@test.com",
    clientName: "Ahmet Yılmaz",
    weeklyAverages: {
      calories: 1750,
      steps: 8200,
      sleep: 7.3,
      water: 2300,
    },
    trends: {
      caloriesTrend: "stable",
      stepsTrend: "up",
      sleepTrend: "down",
    },
    lastWeekAdherence: 80,
    thisWeekAdherence: 85,
    recommendations: [
      "Uyku saatlerini artırmaya çalışın",
      "Protein alımını 25g artırın",
      "Adım hedefine yaklaşıyorsunuz, devam edin!",
    ],
  },
  "demo@test.com": {
    clientId: "demo@test.com",
    clientName: "Fatma Demir",
    weeklyAverages: {
      calories: 1550,
      steps: 6500,
      sleep: 6.8,
      water: 2000,
    },
    trends: {
      caloriesTrend: "down",
      stepsTrend: "stable",
      sleepTrend: "stable",
    },
    lastWeekAdherence: 68,
    thisWeekAdherence: 72,
    recommendations: [
      "Adım sayısını 1000 artırmaya çalışın",
      "Su tüketimini 500ml artırın",
      "Uyum oranında iyileşme görülüyor, harika!",
    ],
  },
};

/**
 * Diyetisyenin belirli bir danışanın sonuçlarını görmesi
 */
export async function getClientResults(
  dietitianId: string,
  clientId: string
): Promise<ClientActivitySummary | null> {
  try {
    const results = mockClientResults[dietitianId] || [];
    return results.find((r) => r.clientId === clientId) || null;
  } catch (error) {
    console.error("Failed to get client results:", error);
    return null;
  }
}

/**
 * Diyetisyenin tüm danışanlarının sonuçlarını görmesi
 */
export async function getAllClientsResults(
  dietitianId: string
): Promise<ClientActivitySummary[]> {
  try {
    return mockClientResults[dietitianId] || [];
  } catch (error) {
    console.error("Failed to get all clients results:", error);
    return [];
  }
}

/**
 * Danışanın hedeflerini ve ilerleme durumunu görmesi
 */
export async function getClientGoals(clientId: string): Promise<ClientGoalProgress[]> {
  try {
    return mockClientGoals[clientId] || [];
  } catch (error) {
    console.error("Failed to get client goals:", error);
    return [];
  }
}

/**
 * Danışanın sağlık metriklerini ve trendlerini görmesi
 */
export async function getClientHealthMetrics(
  clientId: string
): Promise<ClientHealthMetrics | null> {
  try {
    return mockClientMetrics[clientId] || null;
  } catch (error) {
    console.error("Failed to get client health metrics:", error);
    return null;
  }
}

/**
 * Danışanın haftalık uyum oranını hesaplama
 */
export function calculateAdherenceRate(
  mealsLogged: number,
  activitiesLogged: number,
  waterIntake: number,
  targetWater: number = 2500
): number {
  const mealScore = Math.min((mealsLogged / 4) * 100, 100); // 4 öğün hedefi
  const activityScore = Math.min((activitiesLogged / 2) * 100, 100); // 2 aktivite hedefi
  const waterScore = Math.min((waterIntake / targetWater) * 100, 100);

  return Math.round((mealScore + activityScore + waterScore) / 3);
}

/**
 * Danışanın hedef durumunu belirleme
 */
export function determineGoalStatus(
  currentValue: number,
  targetValue: number
): "on_track" | "at_risk" | "behind" {
  const progress = (currentValue / targetValue) * 100;

  if (progress >= 90) return "on_track";
  if (progress >= 70) return "at_risk";
  return "behind";
}

/**
 * Danışan aktivitesini güncellemek (real-time)
 */
export async function updateClientActivity(
  dietitianId: string,
  clientId: string,
  activity: Partial<ClientActivitySummary>
): Promise<void> {
  try {
    const results = mockClientResults[dietitianId] || [];
    const index = results.findIndex((r) => r.clientId === clientId);

    if (index >= 0) {
      results[index] = {
        ...results[index],
        ...activity,
      };
      mockClientResults[dietitianId] = results;
    }
  } catch (error) {
    console.error("Failed to update client activity:", error);
  }
}
