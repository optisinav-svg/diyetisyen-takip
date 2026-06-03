/**
 * Recommendations Service
 * Manages dietitian recommendations and client responses
 */

import { activityStreamService } from "./activity-stream";
import { notificationTriggersService } from "./notification-triggers";

export interface Recommendation {
  id: string;
  dietitianId: string;
  dietitianName: string;
  clientId: string;
  clientName: string;
  title: string;
  description: string;
  category: "nutrition" | "exercise" | "lifestyle" | "meal-plan" | "supplement";
  priority: "low" | "medium" | "high";
  actionItems: string[];
  dueDate?: number;
  createdAt: number;
  status: "pending" | "acknowledged" | "in-progress" | "completed" | "declined";
  clientResponse?: string;
  clientFeedback?: string;
  respondedAt?: number;
}

export interface RecommendationNotification {
  id: string;
  clientId: string;
  recommendationId: string;
  dietitianName: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: number;
}

/**
 * Recommendations Service Implementation
 */
export class RecommendationsService {
  private static instance: RecommendationsService;
  private recommendations: Map<string, Recommendation> = new Map();
  private notifications: Map<string, RecommendationNotification> = new Map();
  private recommendationListeners: Map<string, Function[]> = new Map();
  private notificationListeners: Map<string, Function[]> = new Map();

  private constructor() {
    this.initializeSampleData();
  }

  static getInstance(): RecommendationsService {
    if (!RecommendationsService.instance) {
      RecommendationsService.instance = new RecommendationsService();
    }
    return RecommendationsService.instance;
  }

  /**
   * Initialize with sample recommendations
   */
  private initializeSampleData(): void {
    const sampleRecommendations: Recommendation[] = [
      {
        id: "rec-1",
        dietitianId: "dietitian-1",
        dietitianName: "Dr. Mehmet Kaya",
        clientId: "client-1",
        clientName: "Ayşe Yılmaz",
        title: "Günlük Su Tüketimi Artırın",
        description: "Günde en az 2.5 litre su tüketmeniz önerilmektedir. Bu, metabolizmanızı hızlandıracak ve cilt sağlığını iyileştirecektir.",
        category: "lifestyle",
        priority: "high",
        actionItems: [
          "Her sabah uyanınca 1 bardak su için",
          "Öğünler arasında 250ml su tüketin",
          "Egzersiz sırasında su içmeyi unutmayın",
        ],
        dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        createdAt: Date.now() - 86400000,
        status: "acknowledged",
        clientResponse: "Anladım, başlayacağım",
        respondedAt: Date.now() - 82800000,
      },
      {
        id: "rec-2",
        dietitianId: "dietitian-1",
        dietitianName: "Dr. Mehmet Kaya",
        clientId: "client-1",
        clientName: "Ayşe Yılmaz",
        title: "Akşam Yemeğinde Protein Artırın",
        description: "Akşam yemeğinizde protein miktarını 30-35g'ye çıkarmanız önerilmektedir.",
        category: "nutrition",
        priority: "medium",
        actionItems: [
          "Tavuk göğsü veya balık seçin",
          "Yumurta eklemeyi düşünün",
          "Kuru fasulye veya mercimek kullanın",
        ],
        createdAt: Date.now() - 172800000,
        status: "pending",
      },
      {
        id: "rec-3",
        dietitianId: "dietitian-1",
        dietitianName: "Dr. Mehmet Kaya",
        clientId: "client-1",
        clientName: "Ayşe Yılmaz",
        title: "Haftada 3 Gün Egzersiz Yapın",
        description: "Haftada en az 3 gün, günde 30 dakika egzersiz yapmanız hedeflenmektedir.",
        category: "exercise",
        priority: "high",
        actionItems: [
          "Pazartesi, Çarşamba, Cuma günleri egzersiz yapın",
          "Yürüyüş veya koşu yapabilirsiniz",
          "Ev egzersizleri de uygun olabilir",
        ],
        dueDate: Date.now() + 60 * 24 * 60 * 60 * 1000,
        createdAt: Date.now() - 259200000,
        status: "in-progress",
        clientFeedback: "2 gün yaptım, devam edeceğim",
        respondedAt: Date.now() - 172800000,
      },
    ];

    sampleRecommendations.forEach((rec) => {
      this.recommendations.set(rec.id, rec);
    });
  }

  /**
   * Create a new recommendation
   */
  async createRecommendation(
    dietitianId: string,
    dietitianName: string,
    clientId: string,
    clientName: string,
    title: string,
    description: string,
    category: "nutrition" | "exercise" | "lifestyle" | "meal-plan" | "supplement",
    priority: "low" | "medium" | "high",
    actionItems: string[],
    dueDate?: number
  ): Promise<Recommendation> {
    const recId = `rec-${Date.now()}`;
    const recommendation: Recommendation = {
      id: recId,
      dietitianId,
      dietitianName,
      clientId,
      clientName,
      title,
      description,
      category,
      priority,
      actionItems,
      dueDate,
      createdAt: Date.now(),
      status: "pending",
    };

    this.recommendations.set(recId, recommendation);

    // Create activity event
    await activityStreamService.createEvent(
      dietitianId,
      dietitianName,
      "dietitian",
      "recommendation",
      `${clientName}'a öneriler gönderdi`,
      `"${title}" başlıklı yeni öneriler gönderildi`,
      "💡",
      {
        clientName,
        recommendationTitle: title,
        recommendationId: recId,
      },
      [clientId]
    );

    // Create notification
    await this.createNotification(clientId, recId, dietitianName, title);

    // Notify listeners
    this.notifyRecommendationListeners(clientId, recommendation);

    return recommendation;
  }

  /**
   * Get recommendations for client
   */
  async getRecommendationsForClient(clientId: string): Promise<Recommendation[]> {
    return Array.from(this.recommendations.values())
      .filter((rec) => rec.clientId === clientId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Get recommendations by status
   */
  async getRecommendationsByStatus(
    clientId: string,
    status: "pending" | "acknowledged" | "in-progress" | "completed" | "declined"
  ): Promise<Recommendation[]> {
    return Array.from(this.recommendations.values())
      .filter((rec) => rec.clientId === clientId && rec.status === status)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Update recommendation status
   */
  async updateRecommendationStatus(
    recId: string,
    status: "pending" | "acknowledged" | "in-progress" | "completed" | "declined",
    clientResponse?: string,
    clientFeedback?: string
  ): Promise<Recommendation | null> {
    const rec = this.recommendations.get(recId);
    if (!rec) return null;

    rec.status = status;
    rec.clientResponse = clientResponse;
    rec.clientFeedback = clientFeedback;
    rec.respondedAt = Date.now();

    this.recommendations.set(recId, rec);

    // Create activity event for status change
    const statusText = {
      pending: "Beklemede",
      acknowledged: "Kabul Etti",
      "in-progress": "Uygulamaya Başladı",
      completed: "Tamamladı",
      declined: "Reddetti",
    }[status];

    await activityStreamService.createEvent(
      rec.clientId,
      rec.clientName,
      "client",
      "recommendation",
      `Öneriye Yanıt Verdi: ${statusText}`,
      `"${rec.title}" önerisine ${statusText} olarak yanıt verdi`,
      "💬",
      {
        recommendationTitle: rec.title,
        status,
        response: clientResponse,
      },
      [rec.dietitianId]
    );

    // Notify dietitian
    await notificationTriggersService.triggerNotification(
      rec.dietitianId,
      "feedback",
      `Öneriye Yanıt: ${rec.clientName}`,
      `"${rec.title}" önerisine ${statusText} olarak yanıt verdi`
    );

    this.notifyRecommendationListeners(rec.clientId, rec);

    return rec;
  }

  /**
   * Get recommendation by ID
   */
  async getRecommendation(recId: string): Promise<Recommendation | null> {
    return this.recommendations.get(recId) || null;
  }

  /**
   * Get pending recommendations for client
   */
  async getPendingRecommendations(clientId: string): Promise<Recommendation[]> {
    return Array.from(this.recommendations.values())
      .filter((rec) => rec.clientId === clientId && rec.status === "pending")
      .sort((a, b) => {
        // Sort by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }

  /**
   * Create notification
   */
  private async createNotification(
    clientId: string,
    recId: string,
    dietitianName: string,
    title: string
  ): Promise<void> {
    const notifId = `notif-${Date.now()}`;
    const notification: RecommendationNotification = {
      id: notifId,
      clientId,
      recommendationId: recId,
      dietitianName,
      title,
      message: `${dietitianName} size "${title}" başlıklı yeni bir önerisi gönderdi`,
      isRead: false,
      createdAt: Date.now(),
    };

    this.notifications.set(notifId, notification);
    this.notifyNotificationListeners(clientId, notification);

    // Trigger notification
    await notificationTriggersService.triggerNotification(
      clientId,
      "feedback",
      `Yeni Öneriler: ${dietitianName}`,
      notification.message
    );
  }

  /**
   * Get notifications for client
   */
  async getNotifications(clientId: string, unreadOnly: boolean = false): Promise<RecommendationNotification[]> {
    let notifs = Array.from(this.notifications.values()).filter((n) => n.clientId === clientId);

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
   * Subscribe to recommendations
   */
  subscribeToRecommendations(
    clientId: string,
    callback: (rec: Recommendation) => void
  ): () => void {
    if (!this.recommendationListeners.has(clientId)) {
      this.recommendationListeners.set(clientId, []);
    }
    this.recommendationListeners.get(clientId)!.push(callback);

    return () => {
      const listeners = this.recommendationListeners.get(clientId);
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
    clientId: string,
    callback: (notif: RecommendationNotification) => void
  ): () => void {
    if (!this.notificationListeners.has(clientId)) {
      this.notificationListeners.set(clientId, []);
    }
    this.notificationListeners.get(clientId)!.push(callback);

    return () => {
      const listeners = this.notificationListeners.get(clientId);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Notify recommendation listeners
   */
  private notifyRecommendationListeners(clientId: string, rec: Recommendation): void {
    const listeners = this.recommendationListeners.get(clientId);
    if (listeners) {
      listeners.forEach((callback) => callback(rec));
    }
  }

  /**
   * Notify notification listeners
   */
  private notifyNotificationListeners(clientId: string, notif: RecommendationNotification): void {
    const listeners = this.notificationListeners.get(clientId);
    if (listeners) {
      listeners.forEach((callback) => callback(notif));
    }
  }

  /**
   * Get recommendation statistics
   */
  async getRecommendationStats(clientId: string): Promise<{
    totalRecommendations: number;
    pendingCount: number;
    acknowledgedCount: number;
    inProgressCount: number;
    completedCount: number;
    declinedCount: number;
  }> {
    const recs = await this.getRecommendationsForClient(clientId);

    return {
      totalRecommendations: recs.length,
      pendingCount: recs.filter((r) => r.status === "pending").length,
      acknowledgedCount: recs.filter((r) => r.status === "acknowledged").length,
      inProgressCount: recs.filter((r) => r.status === "in-progress").length,
      completedCount: recs.filter((r) => r.status === "completed").length,
      declinedCount: recs.filter((r) => r.status === "declined").length,
    };
  }
}

// Export singleton instance
export const recommendationsService = RecommendationsService.getInstance();
