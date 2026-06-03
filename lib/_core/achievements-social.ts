/**
 * Achievements & Social Sharing Service
 * Manages user achievements, badges, and social sharing features
 */

export type BadgeType =
  | "first_meal"
  | "week_consistency"
  | "month_consistency"
  | "weight_loss"
  | "calorie_tracker"
  | "water_intake"
  | "exercise_streak"
  | "social_sharer"
  | "goal_achiever"
  | "community_helper";

export interface Badge {
  id: string;
  type: BadgeType;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirement: string;
  unlockedAt?: number;
}

export interface Achievement {
  id: string;
  userId: string;
  badge: Badge;
  unlockedAt: number;
  progress: number; // 0-100
  shared: boolean;
  sharedAt?: number;
}

export interface SocialShare {
  id: string;
  userId: string;
  type: "achievement" | "goal" | "progress" | "milestone";
  content: string;
  badge?: Badge;
  image?: string;
  platform: "facebook" | "instagram" | "twitter" | "whatsapp";
  sharedAt: number;
  likes?: number;
  comments?: number;
}

export interface UserStats {
  userId: string;
  totalAchievements: number;
  totalBadges: number;
  consecutiveDays: number;
  totalMealsLogged: number;
  totalWeightLoss: number;
  totalCaloriesBurned: number;
  lastActivityDate: number;
}

/**
 * Achievements & Social Sharing Service
 */
export class AchievementsSocialService {
  private static instance: AchievementsSocialService;
  private badges: Map<BadgeType, Badge> = new Map();
  private achievements: Map<string, Achievement[]> = new Map();
  private socialShares: Map<string, SocialShare[]> = new Map();
  private userStats: Map<string, UserStats> = new Map();

  private constructor() {
    this.initializeBadges();
  }

  static getInstance(): AchievementsSocialService {
    if (!AchievementsSocialService.instance) {
      AchievementsSocialService.instance = new AchievementsSocialService();
    }
    return AchievementsSocialService.instance;
  }

  /**
   * Initialize badges
   */
  private initializeBadges(): void {
    const badges: Badge[] = [
      {
        id: "badge-first-meal",
        type: "first_meal",
        name: "İlk Adım",
        description: "İlk öğünü kaydettiniz",
        icon: "🍽️",
        color: "#FF6B6B",
        requirement: "1 öğün kaydetme",
      },
      {
        id: "badge-week-consistency",
        name: "Haftalık Tutarlılık",
        description: "7 gün ard arda öğün kaydettiniz",
        icon: "📅",
        color: "#4ECDC4",
        requirement: "7 gün tutarlılık",
        type: "week_consistency",
      },
      {
        id: "badge-month-consistency",
        name: "Aylık Tutarlılık",
        description: "30 gün ard arda öğün kaydettiniz",
        icon: "🏆",
        color: "#FFD93D",
        requirement: "30 gün tutarlılık",
        type: "month_consistency",
      },
      {
        id: "badge-weight-loss",
        name: "Kilo Kaybı Başarısı",
        description: "Hedef kilonuza ulaştınız",
        icon: "⚖️",
        color: "#6BCB77",
        requirement: "5 kg kilo kaybı",
        type: "weight_loss",
      },
      {
        id: "badge-calorie-tracker",
        name: "Kalori Takipçi",
        description: "100 öğün kaydettiniz",
        icon: "🔥",
        color: "#FF8C42",
        requirement: "100 öğün kaydetme",
        type: "calorie_tracker",
      },
      {
        id: "badge-water-intake",
        name: "Su Tüketim Ustası",
        description: "Günlük su hedefini 30 gün tutturmak",
        icon: "💧",
        color: "#4D96FF",
        requirement: "30 gün su hedefi",
        type: "water_intake",
      },
      {
        id: "badge-exercise-streak",
        name: "Egzersiz Serisi",
        description: "14 gün ard arda egzersiz yaptınız",
        icon: "💪",
        color: "#A78BFA",
        requirement: "14 gün egzersiz",
        type: "exercise_streak",
      },
      {
        id: "badge-social-sharer",
        name: "Sosyal Paylaşımcı",
        description: "5 başarınızı sosyal ağlarda paylaştınız",
        icon: "📢",
        color: "#FB5607",
        requirement: "5 sosyal paylaşım",
        type: "social_sharer",
      },
      {
        id: "badge-goal-achiever",
        name: "Hedef Başaracı",
        description: "Tüm aylık hedeflerinizi başardınız",
        icon: "🎯",
        color: "#00D9FF",
        requirement: "Tüm hedefleri başarma",
        type: "goal_achiever",
      },
      {
        id: "badge-community-helper",
        name: "Topluluk Yardımcısı",
        description: "Diğer kullanıcılara 10 kez yardım ettiniz",
        icon: "🤝",
        color: "#FF006E",
        requirement: "10 topluluk yardımı",
        type: "community_helper",
      },
    ];

    badges.forEach((badge) => {
      this.badges.set(badge.type, badge);
    });
  }

  /**
   * Get all badges
   */
  getAllBadges(): Badge[] {
    return Array.from(this.badges.values());
  }

  /**
   * Get badge by type
   */
  getBadgeByType(type: BadgeType): Badge | null {
    return this.badges.get(type) || null;
  }

  /**
   * Unlock achievement
   */
  unlockAchievement(userId: string, badgeType: BadgeType): Achievement | null {
    const badge = this.badges.get(badgeType);
    if (!badge) return null;

    const achievement: Achievement = {
      id: `achievement-${Date.now()}`,
      userId,
      badge,
      unlockedAt: Date.now(),
      progress: 100,
      shared: false,
    };

    if (!this.achievements.has(userId)) {
      this.achievements.set(userId, []);
    }

    this.achievements.get(userId)!.push(achievement);

    // Update user stats
    this.updateUserStats(userId);

    return achievement;
  }

  /**
   * Get user achievements
   */
  getUserAchievements(userId: string): Achievement[] {
    return this.achievements.get(userId) || [];
  }

  /**
   * Check if user has badge
   */
  hasBadge(userId: string, badgeType: BadgeType): boolean {
    const achievements = this.achievements.get(userId) || [];
    return achievements.some((a) => a.badge.type === badgeType);
  }

  /**
   * Share achievement on social media
   */
  shareAchievement(
    userId: string,
    achievementId: string,
    platform: "facebook" | "instagram" | "twitter" | "whatsapp"
  ): SocialShare | null {
    const achievements = this.achievements.get(userId) || [];
    const achievement = achievements.find((a) => a.id === achievementId);

    if (!achievement) return null;

    const share: SocialShare = {
      id: `share-${Date.now()}`,
      userId,
      type: "achievement",
      content: `🎉 Yeni rozet kazandım: ${achievement.badge.name}! ${achievement.badge.description} #DiyetisyenTakip`,
      badge: achievement.badge,
      platform,
      sharedAt: Date.now(),
      likes: 0,
      comments: 0,
    };

    if (!this.socialShares.has(userId)) {
      this.socialShares.set(userId, []);
    }

    this.socialShares.get(userId)!.push(share);

    // Mark achievement as shared
    achievement.shared = true;
    achievement.sharedAt = Date.now();

    // Unlock social sharer badge if applicable
    const socialShares = this.socialShares.get(userId) || [];
    if (socialShares.length === 5) {
      this.unlockAchievement(userId, "social_sharer");
    }

    return share;
  }

  /**
   * Get user social shares
   */
  getUserSocialShares(userId: string): SocialShare[] {
    return this.socialShares.get(userId) || [];
  }

  /**
   * Share progress
   */
  shareProgress(
    userId: string,
    content: string,
    platform: "facebook" | "instagram" | "twitter" | "whatsapp"
  ): SocialShare {
    const share: SocialShare = {
      id: `share-${Date.now()}`,
      userId,
      type: "progress",
      content,
      platform,
      sharedAt: Date.now(),
      likes: 0,
      comments: 0,
    };

    if (!this.socialShares.has(userId)) {
      this.socialShares.set(userId, []);
    }

    this.socialShares.get(userId)!.push(share);
    return share;
  }

  /**
   * Update user stats
   */
  private updateUserStats(userId: string): void {
    const achievements = this.achievements.get(userId) || [];
    const shares = this.socialShares.get(userId) || [];

    const stats: UserStats = {
      userId,
      totalAchievements: achievements.length,
      totalBadges: achievements.length,
      consecutiveDays: this.calculateConsecutiveDays(userId),
      totalMealsLogged: Math.floor(Math.random() * 500) + 50,
      totalWeightLoss: Math.random() * 20,
      totalCaloriesBurned: Math.floor(Math.random() * 50000) + 10000,
      lastActivityDate: Date.now(),
    };

    this.userStats.set(userId, stats);
  }

  /**
   * Calculate consecutive days
   */
  private calculateConsecutiveDays(userId: string): number {
    const achievements = this.achievements.get(userId) || [];
    if (achievements.length === 0) return 0;

    // Simulate consecutive days based on achievements
    const weekConsistency = achievements.find((a) => a.badge.type === "week_consistency");
    const monthConsistency = achievements.find((a) => a.badge.type === "month_consistency");

    if (monthConsistency) return 30;
    if (weekConsistency) return 7;
    return Math.min(achievements.length, 6);
  }

  /**
   * Get user stats
   */
  getUserStats(userId: string): UserStats | null {
    return this.userStats.get(userId) || null;
  }

  /**
   * Get leaderboard
   */
  getLeaderboard(limit: number = 10): UserStats[] {
    return Array.from(this.userStats.values())
      .sort((a, b) => b.totalAchievements - a.totalAchievements)
      .slice(0, limit);
  }

  /**
   * Get trending achievements
   */
  getTrendingAchievements(limit: number = 5): Achievement[] {
    const allAchievements: Achievement[] = [];
    this.achievements.forEach((achievements) => {
      allAchievements.push(...achievements);
    });

    return allAchievements
      .filter((a) => a.shared)
      .sort((a, b) => (b.sharedAt || 0) - (a.sharedAt || 0))
      .slice(0, limit);
  }

  /**
   * Get achievement progress
   */
  getAchievementProgress(userId: string, badgeType: BadgeType): number {
    const achievements = this.achievements.get(userId) || [];
    const achievement = achievements.find((a) => a.badge.type === badgeType);
    return achievement ? achievement.progress : 0;
  }

  /**
   * Update achievement progress
   */
  updateAchievementProgress(userId: string, badgeType: BadgeType, progress: number): void {
    const achievements = this.achievements.get(userId) || [];
    const achievement = achievements.find((a) => a.badge.type === badgeType);

    if (achievement) {
      achievement.progress = Math.min(progress, 100);

      // Auto-unlock if progress reaches 100
      if (achievement.progress === 100 && !achievement.unlockedAt) {
        achievement.unlockedAt = Date.now();
      }
    }
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalUsers: number;
    totalAchievements: number;
    totalShares: number;
    mostPopularBadge: Badge | null;
  } {
    const totalAchievements = Array.from(this.achievements.values()).reduce(
      (sum, arr) => sum + arr.length,
      0
    );
    const totalShares = Array.from(this.socialShares.values()).reduce(
      (sum, arr) => sum + arr.length,
      0
    );

    // Find most popular badge
    const badgeCounts: Record<BadgeType, number> = {} as any;
    Array.from(this.achievements.values()).forEach((achievements) => {
      achievements.forEach((a) => {
        badgeCounts[a.badge.type] = (badgeCounts[a.badge.type] || 0) + 1;
      });
    });

    const mostPopularType = Object.entries(badgeCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const mostPopularBadge = mostPopularType
      ? this.badges.get(mostPopularType as BadgeType) || null
      : null;

    return {
      totalUsers: this.achievements.size,
      totalAchievements,
      totalShares,
      mostPopularBadge,
    };
  }
}

export const achievementsSocialService = AchievementsSocialService.getInstance();
