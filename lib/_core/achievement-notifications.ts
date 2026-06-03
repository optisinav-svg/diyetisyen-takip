/**
 * Achievement Notifications Service
 * Manages achievement/badge notifications and dietitian visibility
 */

import { activityStreamService } from "./activity-stream";
import { notificationTriggersService } from "./notification-triggers";

export interface Achievement {
  id: string;
  clientId: string;
  clientName: string;
  dietitianId: string;
  dietitianName: string;
  badgeName: string;
  description: string;
  icon: string;
  category: "consistency" | "progress" | "milestone" | "social" | "special";
  level: number;
  earnedAt: number;
  points: number;
}

export interface AchievementNotification {
  id: string;
  clientId: string;
  dietitianId: string;
  achievementId: string;
  badgeName: string;
  message: string;
  isRead: boolean;
  createdAt: number;
}

/**
 * Achievement Notifications Service Implementation
 */
export class AchievementNotificationsService {
  private static instance: AchievementNotificationsService;
  private achievements: Map<string, Achievement> = new Map();
  private notifications: Map<string, AchievementNotification> = new Map();
  private achievementListeners: Map<string, Function[]> = new Map();

  private constructor() {
    this.initializeSampleData();
  }

  static getInstance(): AchievementNotificationsService {
    if (!AchievementNotificationsService.instance) {
      AchievementNotificationsService.instance = new AchievementNotificationsService();
    }
    return AchievementNotificationsService.instance;
  }

  /**
   * Initialize with sample achievements
   */
  private initializeSampleData(): void {
    const sampleAchievements: Achievement[] = [
      {
        id: "ach-1",
        clientId: "client-1",
        clientName: "Ayşe Yılmaz",
        dietitianId: "dietitian-1",
        dietitianName: "Dr. Mehmet Kaya",
        badgeName: "7 Gün Tutarlılık",
        description: "7 gün boyunca her gün öğün kaydı yaptı",
        icon: "🔥",
        category: "consistency",
        level: 1,
        earnedAt: Date.now() - 86400000,
        points: 50,
      },
      {
        id: "ach-2",
        clientId: "client-1",
        clientName: "Ayşe Yılmaz",
        dietitianId: "dietitian-1",
        dietitianName: "Dr. Mehmet Kaya",
        badgeName: "30 Gün Tutarlılık",
        description: "30 gün boyunca her gün öğün kaydı yaptı",
        icon: "🌟",
        category: "consistency",
        level: 2,
        earnedAt: Date.now() - 172800000,
        points: 150,
      },
      {
        id: "ach-3",
        clientId: "client-1",
        clientName: "Ayşe Yılmaz",
        dietitianId: "dietitian-1",
        dietitianName: "Dr. Mehmet Kaya",
        badgeName: "İlk Hedef Başarısı",
        description: "İlk hedefini başarıyla tamamladı",
        icon: "🎯",
        category: "milestone",
        level: 1,
        earnedAt: Date.now() - 259200000,
        points: 100,
      },
    ];

    sampleAchievements.forEach((ach) => {
      this.achievements.set(ach.id, ach);
    });
  }

  /**
   * Award achievement to client
   */
  async awardAchievement(
    clientId: string,
    clientName: string,
    dietitianId: string,
    dietitianName: string,
    badgeName: string,
    description: string,
    icon: string,
    category: "consistency" | "progress" | "milestone" | "social" | "special",
    level: number,
    points: number
  ): Promise<Achievement> {
    const achId = `ach-${Date.now()}`;
    const achievement: Achievement = {
      id: achId,
      clientId,
      clientName,
      dietitianId,
      dietitianName,
      badgeName,
      description,
      icon,
      category,
      level,
      earnedAt: Date.now(),
      points,
    };

    this.achievements.set(achId, achievement);

    // Create activity event
    await activityStreamService.createEvent(
      clientId,
      clientName,
      "client",
      "achievement",
      "Rozet Kazandı",
      `"${badgeName}" rozetini kazandı`,
      icon,
      {
        badgeName,
        category,
        level,
        points,
      },
      [dietitianId]
    );

    // Create notification for both client and dietitian
    await this.createNotification(clientId, dietitianId, achId, badgeName);

    // Trigger notifications
    await notificationTriggersService.triggerNotification(
      clientId,
      "goal",
      `Rozet Kazandı! ${icon}`,
      `"${badgeName}" rozetini kazandınız! ${points} puan kazandınız.`
    );

    await notificationTriggersService.triggerNotification(
      dietitianId,
      "goal",
      `Danışan Rozet Kazandı: ${clientName}`,
      `${clientName} "${badgeName}" rozetini kazandı`
    );

    this.notifyAchievementListeners(clientId, achievement);
    this.notifyAchievementListeners(dietitianId, achievement);

    return achievement;
  }

  /**
   * Get achievements for client
   */
  async getAchievementsForClient(clientId: string): Promise<Achievement[]> {
    return Array.from(this.achievements.values())
      .filter((ach) => ach.clientId === clientId)
      .sort((a, b) => b.earnedAt - a.earnedAt);
  }

  /**
   * Get achievements by category
   */
  async getAchievementsByCategory(
    clientId: string,
    category: "consistency" | "progress" | "milestone" | "social" | "special"
  ): Promise<Achievement[]> {
    return Array.from(this.achievements.values())
      .filter((ach) => ach.clientId === clientId && ach.category === category)
      .sort((a, b) => b.earnedAt - a.earnedAt);
  }

  /**
   * Get achievement by ID
   */
  async getAchievement(achId: string): Promise<Achievement | null> {
    return this.achievements.get(achId) || null;
  }

  /**
   * Get total points for client
   */
  async getTotalPointsForClient(clientId: string): Promise<number> {
    const achievements = await this.getAchievementsForClient(clientId);
    return achievements.reduce((total, ach) => total + ach.points, 0);
  }

  /**
   * Create notification
   */
  private async createNotification(
    clientId: string,
    dietitianId: string,
    achId: string,
    badgeName: string
  ): Promise<void> {
    const notifId = `notif-${Date.now()}`;
    const notification: AchievementNotification = {
      id: notifId,
      clientId,
      dietitianId,
      achievementId: achId,
      badgeName,
      message: `"${badgeName}" rozetini kazandınız!`,
      isRead: false,
      createdAt: Date.now(),
    };

    this.notifications.set(notifId, notification);
  }

  /**
   * Get notifications for user
   */
  async getNotifications(userId: string, unreadOnly: boolean = false): Promise<AchievementNotification[]> {
    let notifs = Array.from(this.notifications.values()).filter(
      (n) => n.clientId === userId || n.dietitianId === userId
    );

    if (unreadOnly) {
      notifs = notifs.filter((n) => !n.isRead);
    }

    return notifs.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notifId: string): Promise<void> {
    const notif = this.notifications.get(notifId);
    if (notif) {
      notif.isRead = true;
      this.notifications.set(notifId, notif);
    }
  }

  /**
   * Subscribe to achievements
   */
  subscribeToAchievements(userId: string, callback: (ach: Achievement) => void): () => void {
    if (!this.achievementListeners.has(userId)) {
      this.achievementListeners.set(userId, []);
    }
    this.achievementListeners.get(userId)!.push(callback);

    return () => {
      const listeners = this.achievementListeners.get(userId);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Notify achievement listeners
   */
  private notifyAchievementListeners(userId: string, ach: Achievement): void {
    const listeners = this.achievementListeners.get(userId);
    if (listeners) {
      listeners.forEach((callback) => callback(ach));
    }
  }

  /**
   * Get achievement statistics
   */
  async getAchievementStats(clientId: string): Promise<{
    totalAchievements: number;
    totalPoints: number;
    byCategory: Record<string, number>;
  }> {
    const achievements = await this.getAchievementsForClient(clientId);

    const byCategory: Record<string, number> = {
      consistency: 0,
      progress: 0,
      milestone: 0,
      social: 0,
      special: 0,
    };

    achievements.forEach((ach) => {
      byCategory[ach.category]++;
    });

    return {
      totalAchievements: achievements.length,
      totalPoints: achievements.reduce((sum, ach) => sum + ach.points, 0),
      byCategory,
    };
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(limit: number = 10): Promise<
    Array<{
      clientName: string;
      totalPoints: number;
      totalAchievements: number;
    }>
  > {
    const clientStats = new Map<
      string,
      {
        clientName: string;
        totalPoints: number;
        totalAchievements: number;
      }
    >();

    Array.from(this.achievements.values()).forEach((ach) => {
      if (!clientStats.has(ach.clientId)) {
        clientStats.set(ach.clientId, {
          clientName: ach.clientName,
          totalPoints: 0,
          totalAchievements: 0,
        });
      }

      const stats = clientStats.get(ach.clientId)!;
      stats.totalPoints += ach.points;
      stats.totalAchievements++;
    });

    return Array.from(clientStats.values())
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, limit);
  }
}

// Export singleton instance
export const achievementNotificationsService = AchievementNotificationsService.getInstance();
