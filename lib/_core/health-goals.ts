import AsyncStorage from "@react-native-async-storage/async-storage";

export interface HealthGoal {
  id: string;
  userId: string;
  goalType: "calories" | "protein" | "water" | "steps" | "sleep" | "weight";
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "failed";
  progress: number; // 0-100
  createdAt: string;
  updatedAt: string;
}

const HEALTH_GOALS_KEY = "health_goals";

/**
 * Sağlık hedefi oluştur
 */
export async function createHealthGoal(
  goal: Omit<HealthGoal, "id" | "createdAt" | "updatedAt" | "progress">
): Promise<HealthGoal> {
  try {
    const goals = await getHealthGoals();
    const newGoal: HealthGoal = {
      ...goal,
      id: `goal_${Date.now()}`,
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    goals.push(newGoal);
    await AsyncStorage.setItem(HEALTH_GOALS_KEY, JSON.stringify(goals));
    return newGoal;
  } catch (error) {
    console.error("Failed to create health goal:", error);
    throw error;
  }
}

/**
 * Tüm sağlık hedeflerini al
 */
export async function getHealthGoals(): Promise<HealthGoal[]> {
  try {
    const data = await AsyncStorage.getItem(HEALTH_GOALS_KEY);
    if (!data) return [];
    return JSON.parse(data) as HealthGoal[];
  } catch (error) {
    console.error("Failed to get health goals:", error);
    return [];
  }
}

/**
 * Kullanıcıya ait sağlık hedeflerini al
 */
export async function getUserHealthGoals(userId: string): Promise<HealthGoal[]> {
  try {
    const goals = await getHealthGoals();
    return goals.filter((g) => g.userId === userId);
  } catch (error) {
    console.error("Failed to get user health goals:", error);
    return [];
  }
}

/**
 * Aktif hedefleri al
 */
export async function getActiveHealthGoals(userId: string): Promise<HealthGoal[]> {
  try {
    const goals = await getUserHealthGoals(userId);
    return goals.filter((g) => g.status === "active");
  } catch (error) {
    console.error("Failed to get active health goals:", error);
    return [];
  }
}

/**
 * Hedef ilerleme güncelle
 */
export async function updateGoalProgress(
  goalId: string,
  currentValue: number
): Promise<HealthGoal | null> {
  try {
    const goals = await getHealthGoals();
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return null;

    goal.currentValue = currentValue;
    goal.progress = Math.min(100, Math.round((currentValue / goal.targetValue) * 100));

    // Hedef tamamlandıysa durumunu güncelle
    if (goal.progress >= 100) {
      goal.status = "completed";
    }

    goal.updatedAt = new Date().toISOString();
    await AsyncStorage.setItem(HEALTH_GOALS_KEY, JSON.stringify(goals));
    return goal;
  } catch (error) {
    console.error("Failed to update goal progress:", error);
    throw error;
  }
}

/**
 * Hedef durumunu güncelle
 */
export async function updateGoalStatus(
  goalId: string,
  status: "active" | "completed" | "failed"
): Promise<HealthGoal | null> {
  try {
    const goals = await getHealthGoals();
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return null;

    goal.status = status;
    goal.updatedAt = new Date().toISOString();
    await AsyncStorage.setItem(HEALTH_GOALS_KEY, JSON.stringify(goals));
    return goal;
  } catch (error) {
    console.error("Failed to update goal status:", error);
    throw error;
  }
}

/**
 * Hedef sil
 */
export async function deleteHealthGoal(goalId: string): Promise<void> {
  try {
    const goals = await getHealthGoals();
    const filtered = goals.filter((g) => g.id !== goalId);
    await AsyncStorage.setItem(HEALTH_GOALS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete health goal:", error);
    throw error;
  }
}

/**
 * Hedef istatistiklerini al
 */
export async function getGoalStatistics(userId: string): Promise<{
  total: number;
  active: number;
  completed: number;
  failed: number;
  averageProgress: number;
}> {
  try {
    const goals = await getUserHealthGoals(userId);
    const total = goals.length;
    const active = goals.filter((g) => g.status === "active").length;
    const completed = goals.filter((g) => g.status === "completed").length;
    const failed = goals.filter((g) => g.status === "failed").length;
    const averageProgress = total > 0 ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / total) : 0;

    return {
      total,
      active,
      completed,
      failed,
      averageProgress,
    };
  } catch (error) {
    console.error("Failed to get goal statistics:", error);
    return {
      total: 0,
      active: 0,
      completed: 0,
      failed: 0,
      averageProgress: 0,
    };
  }
}

/**
 * Hedef türüne göre al
 */
export async function getGoalsByType(userId: string, goalType: string): Promise<HealthGoal[]> {
  try {
    const goals = await getUserHealthGoals(userId);
    return goals.filter((g) => g.goalType === goalType);
  } catch (error) {
    console.error("Failed to get goals by type:", error);
    return [];
  }
}
