/**
 * Goal Progress Service
 * Tracks goal progress and triggers notifications
 */

import { activityStreamService } from "./activity-stream";
import { notificationTriggersService } from "./notification-triggers";

export interface GoalProgress {
  id: string;
  goalId: string;
  clientId: string;
  clientName: string;
  dietitianId: string;
  dietitianName: string;
  goalType: "weight" | "steps" | "heartRate" | "sleep" | "calories";
  goalName: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: number;
  targetDate: number;
  status: "in-progress" | "completed" | "failed" | "paused";
  progressPercentage: number;
  lastUpdated: number;
  completedAt?: number;
  failedAt?: number;
  notes?: string;
}

export interface GoalMilestone {
  id: string;
  goalProgressId: string;
  milestone: number;
  reachedAt: number;
  notification: string;
}

/**
 * Goal Progress Service Implementation
 */
export class GoalProgressService {
  private static instance: GoalProgressService;
  private goalProgress: Map<string, GoalProgress> = new Map();
  private milestones: Map<string, GoalMilestone[]> = new Map();
  private progressListeners: Map<string, Function[]> = new Map();

  private constructor() {
    this.initializeSampleData();
  }

  static getInstance(): GoalProgressService {
    if (!GoalProgressService.instance) {
      GoalProgressService.instance = new GoalProgressService();
    }
    return GoalProgressService.instance;
  }

  /**
   * Initialize with sample goal progress
   */
  private initializeSampleData(): void {
    const sampleGoals: GoalProgress[] = [
      {
        id: "progress-1",
        goalId: "goal-1",
        clientId: "client-1",
        clientName: "Ayşe Yılmaz",
        dietitianId: "dietitian-1",
        dietitianName: "Dr. Mehmet Kaya",
        goalType: "weight",
        goalName: "Kilo Kaybı",
        targetValue: 70,
        currentValue: 78,
        unit: "kg",
        startDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
        targetDate: Date.now() + 60 * 24 * 60 * 60 * 1000,
        status: "in-progress",
        progressPercentage: 50,
        lastUpdated: Date.now() - 3600000,
      },
      {
        id: "progress-2",
        goalId: "goal-2",
        clientId: "client-1",
        clientName: "Ayşe Yılmaz",
        dietitianId: "dietitian-1",
        dietitianName: "Dr. Mehmet Kaya",
        goalType: "steps",
        goalName: "Günlük Adımlar",
        targetValue: 10000,
        currentValue: 8500,
        unit: "adım",
        startDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
        targetDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        status: "in-progress",
        progressPercentage: 85,
        lastUpdated: Date.now(),
      },
      {
        id: "progress-3",
        goalId: "goal-3",
        clientId: "client-1",
        clientName: "Ayşe Yılmaz",
        dietitianId: "dietitian-1",
        dietitianName: "Dr. Mehmet Kaya",
        goalType: "sleep",
        goalName: "Uyku Süresi",
        targetValue: 8,
        currentValue: 7.5,
        unit: "saat",
        startDate: Date.now() - 14 * 24 * 60 * 60 * 1000,
        targetDate: Date.now() + 45 * 24 * 60 * 60 * 1000,
        status: "in-progress",
        progressPercentage: 94,
        lastUpdated: Date.now() - 7200000,
      },
    ];

    sampleGoals.forEach((goal) => {
      this.goalProgress.set(goal.id, goal);
      this.milestones.set(goal.id, []);
    });
  }

  /**
   * Create or update goal progress
   */
  async updateGoalProgress(
    goalId: string,
    clientId: string,
    clientName: string,
    dietitianId: string,
    dietitianName: string,
    goalType: "weight" | "steps" | "heartRate" | "sleep" | "calories",
    goalName: string,
    targetValue: number,
    currentValue: number,
    unit: string,
    startDate: number,
    targetDate: number,
    notes?: string
  ): Promise<GoalProgress> {
    const progressId = `progress-${Date.now()}`;
    const progressPercentage = Math.min(100, Math.round((currentValue / targetValue) * 100));

    let status: "in-progress" | "completed" | "failed" | "paused" = "in-progress";
    let completedAt: number | undefined;
    let failedAt: number | undefined;

    if (progressPercentage >= 100) {
      status = "completed";
      completedAt = Date.now();
    } else if (Date.now() > targetDate && progressPercentage < 100) {
      status = "failed";
      failedAt = Date.now();
    }

    const progress: GoalProgress = {
      id: progressId,
      goalId,
      clientId,
      clientName,
      dietitianId,
      dietitianName,
      goalType,
      goalName,
      targetValue,
      currentValue,
      unit,
      startDate,
      targetDate,
      status,
      progressPercentage,
      lastUpdated: Date.now(),
      completedAt,
      failedAt,
      notes,
    };

    this.goalProgress.set(progressId, progress);

    // Check for milestones
    await this.checkMilestones(progress);

    // Create activity event
    const eventType = status === "completed" ? "Hedef Başarıldı" : "Hedef Güncellendi";
    await activityStreamService.createEvent(
      clientId,
      clientName,
      "client",
      "goal",
      eventType,
      `"${goalName}" hedefi ${progressPercentage}% tamamlandı`,
      "🎯",
      {
        goalName,
        progressPercentage,
        currentValue,
        targetValue,
        status,
      },
      [dietitianId]
    );

    // Trigger notifications
    if (status === "completed") {
      await notificationTriggersService.triggerNotification(
        clientId,
        "goal",
        `Hedef Başarıldı! 🎉`,
        `"${goalName}" hedefini başarıyla tamamladınız!`
      );

      await notificationTriggersService.triggerNotification(
        dietitianId,
        "goal",
        `Danışan Hedef Başardı: ${clientName}`,
        `${clientName} "${goalName}" hedefini tamamladı`
      );
    } else if (status === "failed") {
      await notificationTriggersService.triggerNotification(
        clientId,
        "goal",
        `Hedef Tarihi Geçti`,
        `"${goalName}" hedefinin tarihi geçmiştir. Yeni bir hedef belirleyebilirsiniz.`
      );

      await notificationTriggersService.triggerNotification(
        dietitianId,
        "goal",
        `Danışan Hedef Başaramadı: ${clientName}`,
        `${clientName} "${goalName}" hedefini tamamlayamadı`
      );
    } else if (progressPercentage >= 50 && progressPercentage < 100) {
      // Motivational notification at 50% and 75%
      if (progressPercentage === 50 || progressPercentage === 75) {
        await notificationTriggersService.triggerNotification(
          clientId,
          "goal",
          `Harika İlerleme! 💪`,
          `"${goalName}" hedefinde ${progressPercentage}% ilerleme kaydettiniz!`
        );
      }
    }

    this.notifyProgressListeners(clientId, progress);

    return progress;
  }

  /**
   * Check for milestones
   */
  private async checkMilestones(progress: GoalProgress): Promise<void> {
    const milestones = [25, 50, 75, 100];
    const existingMilestones = this.milestones.get(progress.id) || [];
    const reachedMilestones = existingMilestones.map((m) => m.milestone);

    for (const milestone of milestones) {
      if (progress.progressPercentage >= milestone && !reachedMilestones.includes(milestone)) {
        const milestoneRecord: GoalMilestone = {
          id: `milestone-${Date.now()}`,
          goalProgressId: progress.id,
          milestone,
          reachedAt: Date.now(),
          notification: `${milestone}% tamamlandı!`,
        };

        if (!this.milestones.has(progress.id)) {
          this.milestones.set(progress.id, []);
        }
        this.milestones.get(progress.id)!.push(milestoneRecord);

        // Trigger milestone notification
        await notificationTriggersService.triggerNotification(
          progress.clientId,
          "goal",
          `Kilometre Taşı: ${milestone}%`,
          `"${progress.goalName}" hedefinde ${milestone}% ilerleme kaydettiniz!`
        );
      }
    }
  }

  /**
   * Get goal progress for client
   */
  async getGoalProgressForClient(clientId: string): Promise<GoalProgress[]> {
    return Array.from(this.goalProgress.values())
      .filter((gp) => gp.clientId === clientId)
      .sort((a, b) => b.lastUpdated - a.lastUpdated);
  }

  /**
   * Get active goals for client
   */
  async getActiveGoalsForClient(clientId: string): Promise<GoalProgress[]> {
    return Array.from(this.goalProgress.values())
      .filter((gp) => gp.clientId === clientId && gp.status === "in-progress")
      .sort((a, b) => b.progressPercentage - a.progressPercentage);
  }

  /**
   * Get completed goals for client
   */
  async getCompletedGoalsForClient(clientId: string): Promise<GoalProgress[]> {
    return Array.from(this.goalProgress.values())
      .filter((gp) => gp.clientId === clientId && gp.status === "completed")
      .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
  }

  /**
   * Get goal progress by ID
   */
  async getGoalProgress(progressId: string): Promise<GoalProgress | null> {
    return this.goalProgress.get(progressId) || null;
  }

  /**
   * Get goal statistics for client
   */
  async getGoalStats(clientId: string): Promise<{
    totalGoals: number;
    activeGoals: number;
    completedGoals: number;
    failedGoals: number;
    avgProgressPercentage: number;
  }> {
    const goals = await this.getGoalProgressForClient(clientId);

    const activeGoals = goals.filter((g) => g.status === "in-progress").length;
    const completedGoals = goals.filter((g) => g.status === "completed").length;
    const failedGoals = goals.filter((g) => g.status === "failed").length;
    const avgProgressPercentage =
      goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + g.progressPercentage, 0) / goals.length) : 0;

    return {
      totalGoals: goals.length,
      activeGoals,
      completedGoals,
      failedGoals,
      avgProgressPercentage,
    };
  }

  /**
   * Subscribe to goal progress
   */
  subscribeToGoalProgress(clientId: string, callback: (progress: GoalProgress) => void): () => void {
    if (!this.progressListeners.has(clientId)) {
      this.progressListeners.set(clientId, []);
    }
    this.progressListeners.get(clientId)!.push(callback);

    return () => {
      const listeners = this.progressListeners.get(clientId);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Notify progress listeners
   */
  private notifyProgressListeners(clientId: string, progress: GoalProgress): void {
    const listeners = this.progressListeners.get(clientId);
    if (listeners) {
      listeners.forEach((callback) => callback(progress));
    }
  }

  /**
   * Get milestones for goal
   */
  async getMilestonesForGoal(progressId: string): Promise<GoalMilestone[]> {
    return this.milestones.get(progressId) || [];
  }
}

// Export singleton instance
export const goalProgressService = GoalProgressService.getInstance();
