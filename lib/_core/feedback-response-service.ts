/**
 * Feedback Response Service
 * Manages client feedback and dietitian responses
 */

import { activityStreamService } from "./activity-stream";
import { notificationTriggersService } from "./notification-triggers";

export interface ClientFeedback {
  id: string;
  clientId: string;
  clientName: string;
  dietitianId: string;
  dietitianName: string;
  category: "general" | "meal-plan" | "progress" | "support" | "other";
  title: string;
  message: string;
  rating?: number;
  attachments?: string[];
  createdAt: number;
  status: "new" | "read" | "responded" | "resolved";
  dietitianResponse?: string;
  respondedAt?: number;
}

export interface FeedbackNotification {
  id: string;
  feedbackId: string;
  recipientId: string;
  senderName: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: number;
}

/**
 * Feedback Response Service Implementation
 */
export class FeedbackResponseService {
  private static instance: FeedbackResponseService;
  private feedbacks: Map<string, ClientFeedback> = new Map();
  private notifications: Map<string, FeedbackNotification> = new Map();
  private feedbackListeners: Map<string, Function[]> = new Map();

  private constructor() {
    this.initializeSampleData();
  }

  static getInstance(): FeedbackResponseService {
    if (!FeedbackResponseService.instance) {
      FeedbackResponseService.instance = new FeedbackResponseService();
    }
    return FeedbackResponseService.instance;
  }

  /**
   * Initialize with sample feedback
   */
  private initializeSampleData(): void {
    const sampleFeedbacks: ClientFeedback[] = [
      {
        id: "fb-1",
        clientId: "client-1",
        clientName: "Ayşe Yılmaz",
        dietitianId: "dietitian-1",
        dietitianName: "Dr. Mehmet Kaya",
        category: "meal-plan",
        title: "Öğün Planı Çok Katı",
        message: "Verilen öğün planı çok katı ve takip etmesi zor. Daha esnek bir plan olabilir mi?",
        rating: 3,
        createdAt: Date.now() - 86400000,
        status: "responded",
        dietitianResponse:
          "Anladım. Pazartesi günü yeni bir plan hazırlayacağım. Daha esnek ve uygulanabilir olacak.",
        respondedAt: Date.now() - 43200000,
      },
      {
        id: "fb-2",
        clientId: "client-1",
        clientName: "Ayşe Yılmaz",
        dietitianId: "dietitian-1",
        dietitianName: "Dr. Mehmet Kaya",
        category: "progress",
        title: "Kilo Kaybında Duruş Yaşıyorum",
        message: "Son 2 haftadır kilo kaybetmiyorum. Ne yapmalıyım?",
        rating: 2,
        createdAt: Date.now() - 172800000,
        status: "responded",
        dietitianResponse:
          "Bu normal bir duruş. Kalori alımını biraz azaltabiliriz ve egzersiz sıklığını artırabiliriz. Detaylı bir plan göndereceğim.",
        respondedAt: Date.now() - 86400000,
      },
      {
        id: "fb-3",
        clientId: "client-1",
        clientName: "Ayşe Yılmaz",
        dietitianId: "dietitian-1",
        dietitianName: "Dr. Mehmet Kaya",
        category: "support",
        title: "Motivasyon Kaybettim",
        message: "Başlangıçta çok istekliydim ama şimdi motivasyonum düştü. Nasıl devam etmeliyim?",
        rating: 2,
        createdAt: Date.now() - 259200000,
        status: "new",
      },
    ];

    sampleFeedbacks.forEach((fb) => {
      this.feedbacks.set(fb.id, fb);
    });
  }

  /**
   * Create new feedback
   */
  async createFeedback(
    clientId: string,
    clientName: string,
    dietitianId: string,
    dietitianName: string,
    category: "general" | "meal-plan" | "progress" | "support" | "other",
    title: string,
    message: string,
    rating?: number,
    attachments?: string[]
  ): Promise<ClientFeedback> {
    const fbId = `fb-${Date.now()}`;
    const feedback: ClientFeedback = {
      id: fbId,
      clientId,
      clientName,
      dietitianId,
      dietitianName,
      category,
      title,
      message,
      rating,
      attachments,
      createdAt: Date.now(),
      status: "new",
    };

    this.feedbacks.set(fbId, feedback);

    // Create activity event
    await activityStreamService.createEvent(
      clientId,
      clientName,
      "client",
      "feedback",
      `Geri Bildirim Gönderdi`,
      `"${title}" başlıklı geri bildirim gönderildi`,
      "💬",
      {
        feedbackTitle: title,
        category,
        rating,
      },
      [dietitianId]
    );

    // Create notification for dietitian
    await this.createNotification(dietitianId, fbId, clientName, title);

    // Trigger notification
    await notificationTriggersService.triggerNotification(
      dietitianId,
      "feedback",
      `Yeni Geri Bildirim: ${clientName}`,
      `${clientName} size "${title}" başlıklı geri bildirim gönderdi`
    );

    this.notifyFeedbackListeners(dietitianId, feedback);

    return feedback;
  }

  /**
   * Respond to feedback
   */
  async respondToFeedback(fbId: string, response: string): Promise<ClientFeedback | null> {
    const feedback = this.feedbacks.get(fbId);
    if (!feedback) return null;

    feedback.status = "responded";
    feedback.dietitianResponse = response;
    feedback.respondedAt = Date.now();

    this.feedbacks.set(fbId, feedback);

    // Create activity event
    await activityStreamService.createEvent(
      feedback.dietitianId,
      feedback.dietitianName,
      "dietitian",
      "feedback",
      `Geri Bildirime Yanıt Verdi`,
      `"${feedback.title}" başlıklı geri bildirime yanıt verdi`,
      "✅",
      {
        feedbackTitle: feedback.title,
        response,
      },
      [feedback.clientId]
    );

    // Create notification for client
    await this.createNotification(feedback.clientId, fbId, feedback.dietitianName, "Geri Bildirim Yanıtı");

    // Trigger notification
    await notificationTriggersService.triggerNotification(
      feedback.clientId,
      "feedback",
      `Geri Bildirim Yanıtı: ${feedback.dietitianName}`,
      `${feedback.dietitianName} size "${feedback.title}" başlıklı geri bildiriminize yanıt verdi`
    );

    this.notifyFeedbackListeners(feedback.clientId, feedback);

    return feedback;
  }

  /**
   * Mark feedback as resolved
   */
  async resolveFeedback(fbId: string): Promise<ClientFeedback | null> {
    const feedback = this.feedbacks.get(fbId);
    if (!feedback) return null;

    feedback.status = "resolved";
    this.feedbacks.set(fbId, feedback);

    return feedback;
  }

  /**
   * Get feedback for dietitian
   */
  async getFeedbackForDietitian(dietitianId: string, status?: string): Promise<ClientFeedback[]> {
    let feedbacks = Array.from(this.feedbacks.values()).filter((fb) => fb.dietitianId === dietitianId);

    if (status) {
      feedbacks = feedbacks.filter((fb) => fb.status === status);
    }

    return feedbacks.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Get feedback from client
   */
  async getFeedbackFromClient(clientId: string): Promise<ClientFeedback[]> {
    return Array.from(this.feedbacks.values())
      .filter((fb) => fb.clientId === clientId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Get unread feedback count
   */
  async getUnreadFeedbackCount(dietitianId: string): Promise<number> {
    return Array.from(this.feedbacks.values()).filter((fb) => fb.dietitianId === dietitianId && fb.status === "new")
      .length;
  }

  /**
   * Get feedback by ID
   */
  async getFeedback(fbId: string): Promise<ClientFeedback | null> {
    return this.feedbacks.get(fbId) || null;
  }

  /**
   * Create notification
   */
  private async createNotification(
    recipientId: string,
    fbId: string,
    senderName: string,
    title: string
  ): Promise<void> {
    const notifId = `notif-${Date.now()}`;
    const notification: FeedbackNotification = {
      id: notifId,
      feedbackId: fbId,
      recipientId,
      senderName,
      title,
      message: `${senderName} size "${title}" başlıklı bir mesaj gönderdi`,
      isRead: false,
      createdAt: Date.now(),
    };

    this.notifications.set(notifId, notification);
  }

  /**
   * Get notifications for user
   */
  async getNotifications(userId: string, unreadOnly: boolean = false): Promise<FeedbackNotification[]> {
    let notifs = Array.from(this.notifications.values()).filter((n) => n.recipientId === userId);

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
   * Subscribe to feedback
   */
  subscribeToFeedback(userId: string, callback: (fb: ClientFeedback) => void): () => void {
    if (!this.feedbackListeners.has(userId)) {
      this.feedbackListeners.set(userId, []);
    }
    this.feedbackListeners.get(userId)!.push(callback);

    return () => {
      const listeners = this.feedbackListeners.get(userId);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Notify feedback listeners
   */
  private notifyFeedbackListeners(userId: string, fb: ClientFeedback): void {
    const listeners = this.feedbackListeners.get(userId);
    if (listeners) {
      listeners.forEach((callback) => callback(fb));
    }
  }

  /**
   * Get feedback statistics
   */
  async getFeedbackStats(dietitianId: string): Promise<{
    totalFeedback: number;
    newFeedback: number;
    respondedFeedback: number;
    resolvedFeedback: number;
    avgRating: number;
  }> {
    const feedbacks = await this.getFeedbackForDietitian(dietitianId);

    const newCount = feedbacks.filter((f) => f.status === "new").length;
    const respondedCount = feedbacks.filter((f) => f.status === "responded").length;
    const resolvedCount = feedbacks.filter((f) => f.status === "resolved").length;

    const ratingsCount = feedbacks.filter((f) => f.rating !== undefined).length;
    const totalRating = feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0);
    const avgRating = ratingsCount > 0 ? totalRating / ratingsCount : 0;

    return {
      totalFeedback: feedbacks.length,
      newFeedback: newCount,
      respondedFeedback: respondedCount,
      resolvedFeedback: resolvedCount,
      avgRating: Math.round(avgRating * 10) / 10,
    };
  }
}

// Export singleton instance
export const feedbackResponseService = FeedbackResponseService.getInstance();
