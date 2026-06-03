/**
 * Meal Synchronization Service
 * Handles real-time synchronization of meals from clients to dietitians
 * Triggers notifications when meals are logged
 */

export interface MealRecord {
  id: string;
  clientId: string;
  clientName: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  mealName: string;
  description?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  imageUrl?: string;
  photoAnalyzed: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface DietitianMealView {
  id: string;
  clientId: string;
  clientName: string;
  mealCount: number;
  totalCalories: number;
  meals: MealRecord[];
  lastMealTime?: number;
  adherenceScore: number; // 0-100
  createdAt: number;
  updatedAt: number;
}

export interface MealNotification {
  id: string;
  dietitianId: string;
  clientId: string;
  clientName: string;
  mealType: string;
  calories: number;
  notificationType: "meal_logged" | "high_calories" | "low_adherence" | "meal_analysis";
  message: string;
  isRead: boolean;
  createdAt: number;
}

/**
 * Meal Sync Service Implementation
 */
export class MealSyncService {
  private static instance: MealSyncService;
  private mealRecords: Map<string, MealRecord> = new Map();
  private dietitianViews: Map<string, DietitianMealView> = new Map();
  private notifications: Map<string, MealNotification> = new Map();
  private mealListeners: Map<string, Function[]> = new Map();
  private notificationListeners: Map<string, Function[]> = new Map();

  private constructor() {
    this.initializeSampleData();
  }

  static getInstance(): MealSyncService {
    if (!MealSyncService.instance) {
      MealSyncService.instance = new MealSyncService();
    }
    return MealSyncService.instance;
  }

  /**
   * Initialize with sample meal data
   */
  private initializeSampleData(): void {
    // Sample meals for today
    const now = Date.now();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const meals: MealRecord[] = [
      {
        id: "meal-1",
        clientId: "client-1",
        clientName: "Ayşe Yılmaz",
        mealType: "breakfast",
        mealName: "Yumurta ve Ekmek",
        description: "2 yumurta, 1 dilim ekmek, tereyağ",
        calories: 350,
        protein: 18,
        carbs: 25,
        fat: 20,
        fiber: 2,
        photoAnalyzed: true,
        createdAt: todayStart.getTime() + 3600000,
        updatedAt: todayStart.getTime() + 3600000,
      },
      {
        id: "meal-2",
        clientId: "client-1",
        clientName: "Ayşe Yılmaz",
        mealType: "lunch",
        mealName: "Tavuk Salata",
        description: "Grilled tavuk, yeşil salata, zeytinyağı",
        calories: 450,
        protein: 45,
        carbs: 15,
        fat: 18,
        fiber: 5,
        photoAnalyzed: true,
        createdAt: todayStart.getTime() + 43200000,
        updatedAt: todayStart.getTime() + 43200000,
      },
    ];

    meals.forEach((meal) => this.mealRecords.set(meal.id, meal));

    // Initialize dietitian view
    this.updateDietitianView("client-1", "dietitian-1");
  }

  /**
   * Log a new meal
   */
  async logMeal(
    clientId: string,
    clientName: string,
    mealType: "breakfast" | "lunch" | "dinner" | "snack",
    mealName: string,
    calories: number,
    protein: number,
    carbs: number,
    fat: number,
    description?: string,
    imageUrl?: string,
    photoAnalyzed: boolean = false
  ): Promise<MealRecord> {
    const mealId = `meal-${Date.now()}`;
    const meal: MealRecord = {
      id: mealId,
      clientId,
      clientName,
      mealType,
      mealName,
      description,
      calories,
      protein,
      carbs,
      fat,
      imageUrl,
      photoAnalyzed,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.mealRecords.set(mealId, meal);

    // Create notification for all connected dietitians
    await this.createMealNotification(clientId, clientName, mealType, calories, "meal_logged");

    // Check for high calories warning
    if (calories > 800) {
      await this.createMealNotification(
        clientId,
        clientName,
        mealType,
        calories,
        "high_calories"
      );
    }

    // Notify listeners
    this.notifyMealListeners(clientId, meal);

    return meal;
  }

  /**
   * Get meals for a client (for today or specific date)
   */
  async getMealsForClient(
    clientId: string,
    dateStart?: number,
    dateEnd?: number
  ): Promise<MealRecord[]> {
    let meals = Array.from(this.mealRecords.values()).filter(
      (m) => m.clientId === clientId
    );

    if (dateStart && dateEnd) {
      meals = meals.filter((m) => m.createdAt >= dateStart && m.createdAt <= dateEnd);
    } else {
      // Default: today's meals
      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);

      meals = meals.filter(
        (m) => m.createdAt >= todayStart.getTime() && m.createdAt < todayEnd.getTime()
      );
    }

    return meals.sort((a, b) => a.createdAt - b.createdAt);
  }

  /**
   * Get dietitian's view of client meals
   */
  async getDietitianMealView(clientId: string, dietitianId: string): Promise<DietitianMealView> {
    const viewKey = `${dietitianId}-${clientId}`;
    let view = this.dietitianViews.get(viewKey);

    if (!view) {
      view = await this.updateDietitianView(clientId, dietitianId);
    }

    return view;
  }

  /**
   * Update dietitian's view of client meals
   */
  private async updateDietitianView(
    clientId: string,
    dietitianId: string
  ): Promise<DietitianMealView> {
    const meals = await this.getMealsForClient(clientId);
    const viewKey = `${dietitianId}-${clientId}`;

    const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
    const adherenceScore = this.calculateAdherence(meals);

    const view: DietitianMealView = {
      id: viewKey,
      clientId,
      clientName: meals.length > 0 ? meals[0].clientName : "Unknown",
      mealCount: meals.length,
      totalCalories,
      meals,
      lastMealTime: meals.length > 0 ? meals[meals.length - 1].createdAt : undefined,
      adherenceScore,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.dietitianViews.set(viewKey, view);
    return view;
  }

  /**
   * Calculate adherence score (0-100)
   * Based on: meal frequency, calorie consistency, meal timing
   */
  private calculateAdherence(meals: MealRecord[]): number {
    if (meals.length === 0) return 0;

    let score = 50; // Base score

    // Meal frequency (max +30)
    if (meals.length >= 3) score += 30;
    else if (meals.length === 2) score += 15;
    else if (meals.length === 1) score += 5;

    // Calorie consistency (max +20)
    const calories = meals.map((m) => m.calories);
    const avgCalories = calories.reduce((a, b) => a + b, 0) / calories.length;
    const variance = calories.reduce((sum, c) => sum + Math.pow(c - avgCalories, 2), 0) / calories.length;
    const stdDev = Math.sqrt(variance);
    const cvPercent = (stdDev / avgCalories) * 100;

    if (cvPercent < 20) score += 20;
    else if (cvPercent < 40) score += 10;

    return Math.min(100, score);
  }

  /**
   * Create meal notification
   */
  private async createMealNotification(
    clientId: string,
    clientName: string,
    mealType: string,
    calories: number,
    notificationType: "meal_logged" | "high_calories" | "low_adherence" | "meal_analysis"
  ): Promise<void> {
    // Find all dietitians connected to this client
    // For now, create notification for a sample dietitian
    const dietitianId = "dietitian-1";

    const notifId = `notif-${Date.now()}`;
    let message = "";

    switch (notificationType) {
      case "meal_logged":
        message = `${clientName} ${mealType} kaydetti (${calories} kcal)`;
        break;
      case "high_calories":
        message = `${clientName} yüksek kalorili öğün kaydetti (${calories} kcal)`;
        break;
      case "low_adherence":
        message = `${clientName} düşük uyum gösteriyor`;
        break;
      case "meal_analysis":
        message = `${clientName} yeni öğün analizi hazır`;
        break;
    }

    const notification: MealNotification = {
      id: notifId,
      dietitianId,
      clientId,
      clientName,
      mealType,
      calories,
      notificationType,
      message,
      isRead: false,
      createdAt: Date.now(),
    };

    this.notifications.set(notifId, notification);
    this.notifyNotificationListeners(dietitianId, notification);
  }

  /**
   * Get notifications for dietitian
   */
  async getNotifications(dietitianId: string, unreadOnly: boolean = false): Promise<MealNotification[]> {
    let notifs = Array.from(this.notifications.values()).filter(
      (n) => n.dietitianId === dietitianId
    );

    if (unreadOnly) {
      notifs = notifs.filter((n) => !n.isRead);
    }

    return notifs.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.isRead = true;
      this.notifications.set(notificationId, notification);
    }
  }

  /**
   * Subscribe to meal updates
   */
  subscribeToMeals(clientId: string, callback: (meal: MealRecord) => void): () => void {
    if (!this.mealListeners.has(clientId)) {
      this.mealListeners.set(clientId, []);
    }
    this.mealListeners.get(clientId)!.push(callback);

    return () => {
      const listeners = this.mealListeners.get(clientId);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Subscribe to notifications
   */
  subscribeToNotifications(
    dietitianId: string,
    callback: (notification: MealNotification) => void
  ): () => void {
    if (!this.notificationListeners.has(dietitianId)) {
      this.notificationListeners.set(dietitianId, []);
    }
    this.notificationListeners.get(dietitianId)!.push(callback);

    return () => {
      const listeners = this.notificationListeners.get(dietitianId);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Notify meal listeners
   */
  private notifyMealListeners(clientId: string, meal: MealRecord): void {
    const listeners = this.mealListeners.get(clientId);
    if (listeners) {
      listeners.forEach((callback) => callback(meal));
    }
  }

  /**
   * Notify notification listeners
   */
  private notifyNotificationListeners(dietitianId: string, notification: MealNotification): void {
    const listeners = this.notificationListeners.get(dietitianId);
    if (listeners) {
      listeners.forEach((callback) => callback(notification));
    }
  }

  /**
   * Get meal statistics
   */
  async getMealStats(clientId: string): Promise<{
    totalMeals: number;
    totalCalories: number;
    avgCaloriesPerMeal: number;
    mealsByType: Record<string, number>;
  }> {
    const meals = await this.getMealsForClient(clientId);

    const mealsByType: Record<string, number> = {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      snack: 0,
    };

    meals.forEach((meal) => {
      mealsByType[meal.mealType]++;
    });

    const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);

    return {
      totalMeals: meals.length,
      totalCalories,
      avgCaloriesPerMeal: meals.length > 0 ? totalCalories / meals.length : 0,
      mealsByType,
    };
  }

  /**
   * Delete meal
   */
  async deleteMeal(mealId: string): Promise<void> {
    this.mealRecords.delete(mealId);
  }

  /**
   * Update meal
   */
  async updateMeal(mealId: string, updates: Partial<MealRecord>): Promise<MealRecord | null> {
    const meal = this.mealRecords.get(mealId);
    if (!meal) return null;

    const updated = { ...meal, ...updates, updatedAt: Date.now() };
    this.mealRecords.set(mealId, updated);
    return updated;
  }
}

// Export singleton instance
export const mealSyncService = MealSyncService.getInstance();
