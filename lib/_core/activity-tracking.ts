import AsyncStorage from "@react-native-async-storage/async-storage";

export type ActivityType = "meal" | "drink" | "exercise" | "weight" | "sleep";

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  value?: number; // Kalori, ml, dakika, kg, saat
  unit?: string; // kcal, ml, min, kg, h
  clientId: string;
  clientEmail: string;
  timestamp: string; // ISO 8601 format
  createdAt: string;
  updatedAt: string;
}

const ACTIVITIES_KEY = "activities";

/**
 * Aktivite oluştur (danışan tarafından)
 */
export async function createActivity(
  activity: Omit<Activity, "id" | "createdAt" | "updatedAt">
): Promise<Activity> {
  try {
    const activities = await getActivities();
    const newActivity: Activity = {
      ...activity,
      id: `act_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    activities.unshift(newActivity); // En yeni aktivite en başta
    await AsyncStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
    return newActivity;
  } catch (error) {
    console.error("Failed to create activity:", error);
    throw error;
  }
}

/**
 * Tüm aktiviteleri al
 */
export async function getActivities(): Promise<Activity[]> {
  try {
    const data = await AsyncStorage.getItem(ACTIVITIES_KEY);
    if (!data) return [];
    return JSON.parse(data) as Activity[];
  } catch (error) {
    console.error("Failed to get activities:", error);
    return [];
  }
}

/**
 * Belirli bir danışanın aktivitelerini al
 */
export async function getClientActivities(clientEmail: string): Promise<Activity[]> {
  try {
    const activities = await getActivities();
    return activities.filter((a) => a.clientEmail === clientEmail);
  } catch (error) {
    console.error("Failed to get client activities:", error);
    return [];
  }
}

/**
 * Belirli bir danışanın son aktivitelerini al (son N aktivite)
 */
export async function getRecentClientActivities(clientEmail: string, limit: number = 10): Promise<Activity[]> {
  try {
    const activities = await getClientActivities(clientEmail);
    return activities.slice(0, limit);
  } catch (error) {
    console.error("Failed to get recent client activities:", error);
    return [];
  }
}

/**
 * Belirli bir tarih aralığındaki aktiviteleri al
 */
export async function getActivitiesByDateRange(
  clientEmail: string,
  startDate: Date,
  endDate: Date
): Promise<Activity[]> {
  try {
    const activities = await getClientActivities(clientEmail);
    return activities.filter((a) => {
      const activityDate = new Date(a.timestamp);
      return activityDate >= startDate && activityDate <= endDate;
    });
  } catch (error) {
    console.error("Failed to get activities by date range:", error);
    return [];
  }
}

/**
 * Aktiviteleri türe göre filtrele
 */
export async function getActivitiesByType(clientEmail: string, type: ActivityType): Promise<Activity[]> {
  try {
    const activities = await getClientActivities(clientEmail);
    return activities.filter((a) => a.type === type);
  } catch (error) {
    console.error("Failed to get activities by type:", error);
    return [];
  }
}

/**
 * Bugünün aktivitelerini al
 */
export async function getTodayActivities(clientEmail: string): Promise<Activity[]> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await getActivitiesByDateRange(clientEmail, today, tomorrow);
  } catch (error) {
    console.error("Failed to get today activities:", error);
    return [];
  }
}

/**
 * Aktivite güncelle
 */
export async function updateActivity(
  activityId: string,
  updates: Partial<Activity>
): Promise<Activity | null> {
  try {
    const activities = await getActivities();
    const activity = activities.find((a) => a.id === activityId);
    if (!activity) return null;

    Object.assign(activity, updates, {
      updatedAt: new Date().toISOString(),
    });
    await AsyncStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
    return activity;
  } catch (error) {
    console.error("Failed to update activity:", error);
    throw error;
  }
}

/**
 * Aktivite sil
 */
export async function deleteActivity(activityId: string): Promise<void> {
  try {
    const activities = await getActivities();
    const filtered = activities.filter((a) => a.id !== activityId);
    await AsyncStorage.setItem(ACTIVITIES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete activity:", error);
    throw error;
  }
}

/**
 * Günlük aktivite özeti al
 */
export async function getDailyActivitySummary(clientEmail: string, date: Date): Promise<{
  meals: Activity[];
  drinks: Activity[];
  exercises: Activity[];
  totalCalories: number;
  totalWater: number;
  totalExerciseMinutes: number;
}> {
  try {
    const activities = await getActivitiesByDateRange(
      clientEmail,
      new Date(date.setHours(0, 0, 0, 0)),
      new Date(date.setHours(23, 59, 59, 999))
    );

    const meals = activities.filter((a) => a.type === "meal");
    const drinks = activities.filter((a) => a.type === "drink");
    const exercises = activities.filter((a) => a.type === "exercise");

    const totalCalories = meals.reduce((sum, a) => sum + (a.value || 0), 0);
    const totalWater = drinks.reduce((sum, a) => sum + (a.value || 0), 0);
    const totalExerciseMinutes = exercises.reduce((sum, a) => sum + (a.value || 0), 0);

    return {
      meals,
      drinks,
      exercises,
      totalCalories,
      totalWater,
      totalExerciseMinutes,
    };
  } catch (error) {
    console.error("Failed to get daily activity summary:", error);
    return {
      meals: [],
      drinks: [],
      exercises: [],
      totalCalories: 0,
      totalWater: 0,
      totalExerciseMinutes: 0,
    };
  }
}

/**
 * Haftalık aktivite özeti al
 */
export async function getWeeklyActivitySummary(clientEmail: string): Promise<{
  [key: string]: {
    calories: number;
    water: number;
    exercise: number;
  };
}> {
  try {
    const summary: any = {};
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dailySummary = await getDailyActivitySummary(clientEmail, date);
      summary[dateStr] = {
        calories: dailySummary.totalCalories,
        water: dailySummary.totalWater,
        exercise: dailySummary.totalExerciseMinutes,
      };
    }

    return summary;
  } catch (error) {
    console.error("Failed to get weekly activity summary:", error);
    return {};
  }
}
