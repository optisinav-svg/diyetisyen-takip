/**
 * Notification Triggers Service
 * Manages all notification triggers for messaging, meals, products, and feedback
 */

import { messagingService } from "./messaging-service";
import { mealSyncService } from "./meal-sync-service";
import { productSharingService } from "./product-sharing-service";

export interface NotificationTrigger {
  id: string;
  type: "message" | "meal" | "product" | "feedback" | "appointment" | "goal";
  userId: string;
  title: string;
  body: string;
  data: Record<string, any>;
  isRead: boolean;
  createdAt: number;
}

export interface TriggerConfig {
  enableMessages: boolean;
  enableMeals: boolean;
  enableProducts: boolean;
  enableFeedback: boolean;
  enableAppointments: boolean;
  enableGoals: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

/**
 * Notification Triggers Service Implementation
 */
export class NotificationTriggersService {
  private static instance: NotificationTriggersService;
  private triggers: Map<string, NotificationTrigger> = new Map();
  private configs: Map<string, TriggerConfig> = new Map();
  private triggerListeners: Map<string, Function[]> = new Map();

  private constructor() {
    this.initializeConfigs();
    this.setupTriggers();
  }

  static getInstance(): NotificationTriggersService {
    if (!NotificationTriggersService.instance) {
      NotificationTriggersService.instance = new NotificationTriggersService();
    }
    return NotificationTriggersService.instance;
  }

  /**
   * Initialize default configs
   */
  private initializeConfigs(): void {
    const defaultConfig: TriggerConfig = {
      enableMessages: true,
      enableMeals: true,
      enableProducts: true,
      enableFeedback: true,
      enableAppointments: true,
      enableGoals: true,
      soundEnabled: true,
      vibrationEnabled: true,
    };

    this.configs.set("client-1", defaultConfig);
    this.configs.set("dietitian-1", defaultConfig);
  }

  /**
   * Setup all notification triggers
   */
  private setupTriggers(): void {
    this.setupMessageTriggers();
    this.setupMealTriggers();
    this.setupProductTriggers();
    this.setupFeedbackTriggers();
  }

  /**
   * Setup message notification triggers
   */
  private setupMessageTriggers(): void {
    // Subscribe to new messages
    messagingService.subscribeToMessages("conv-1", (message) => {
      const config = this.configs.get(message.recipientId);
      if (config && config.enableMessages) {
        this.createTrigger(
          message.recipientId,
          "message",
          `Yeni mesaj: ${message.senderName}`,
          message.content.substring(0, 100),
          {
            conversationId: message.conversationId,
            senderId: message.senderId,
            senderName: message.senderName,
            messageId: message.id,
          }
        );
      }
    });
  }

  /**
   * Setup meal notification triggers
   */
  private setupMealTriggers(): void {
    // Subscribe to meal notifications
    mealSyncService.subscribeToNotifications("dietitian-1", (notification) => {
      const config = this.configs.get(notification.dietitianId);
      if (config && config.enableMeals) {
        this.createTrigger(
          notification.dietitianId,
          "meal",
          `Öğün Kaydı: ${notification.clientName}`,
          notification.message,
          {
            clientId: notification.clientId,
            clientName: notification.clientName,
            mealType: notification.mealType,
            calories: notification.calories,
            notificationType: notification.notificationType,
          }
        );
      }
    });
  }

  /**
   * Setup product notification triggers
   */
  private setupProductTriggers(): void {
    // Subscribe to product share notifications
    productSharingService.subscribeToNotifications("client-1", (notification) => {
      const config = this.configs.get(notification.clientId);
      if (config && config.enableProducts) {
        this.createTrigger(
          notification.clientId,
          "product",
          `Ürün Listesi: ${notification.dietitianName}`,
          notification.message,
          {
            dietitianName: notification.dietitianName,
            listName: notification.listName,
            listType: notification.listType,
            productCount: notification.productCount,
          }
        );
      }
    });
  }

  /**
   * Setup feedback notification triggers
   */
  private setupFeedbackTriggers(): void {
    // This would subscribe to feedback service when available
    // For now, it's a placeholder
  }

  /**
   * Create a notification trigger
   */
  private createTrigger(
    userId: string,
    type: "message" | "meal" | "product" | "feedback" | "appointment" | "goal",
    title: string,
    body: string,
    data: Record<string, any>
  ): NotificationTrigger {
    const triggerId = `trigger-${Date.now()}`;
    const trigger: NotificationTrigger = {
      id: triggerId,
      type,
      userId,
      title,
      body,
      data,
      isRead: false,
      createdAt: Date.now(),
    };

    this.triggers.set(triggerId, trigger);
    this.notifyTriggerListeners(userId, trigger);

    return trigger;
  }

  /**
   * Manually trigger a notification
   */
  async triggerNotification(
    userId: string,
    type: "message" | "meal" | "product" | "feedback" | "appointment" | "goal",
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<NotificationTrigger> {
    return this.createTrigger(userId, type, title, body, data || {});
  }

  /**
   * Get triggers for a user
   */
  async getTriggers(userId: string, unreadOnly: boolean = false): Promise<NotificationTrigger[]> {
    let triggers = Array.from(this.triggers.values()).filter((t) => t.userId === userId);

    if (unreadOnly) {
      triggers = triggers.filter((t) => !t.isRead);
    }

    return triggers.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Get triggers by type
   */
  async getTriggersByType(
    userId: string,
    type: "message" | "meal" | "product" | "feedback" | "appointment" | "goal"
  ): Promise<NotificationTrigger[]> {
    return Array.from(this.triggers.values())
      .filter((t) => t.userId === userId && t.type === type)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Mark trigger as read
   */
  async markTriggerAsRead(triggerId: string): Promise<void> {
    const trigger = this.triggers.get(triggerId);
    if (trigger) {
      trigger.isRead = true;
      this.triggers.set(triggerId, trigger);
    }
  }

  /**
   * Mark all triggers as read
   */
  async markAllTriggersAsRead(userId: string): Promise<void> {
    const triggers = Array.from(this.triggers.values()).filter(
      (t) => t.userId === userId && !t.isRead
    );
    triggers.forEach((t) => {
      t.isRead = true;
      this.triggers.set(t.id, t);
    });
  }

  /**
   * Delete trigger
   */
  async deleteTrigger(triggerId: string): Promise<void> {
    this.triggers.delete(triggerId);
  }

  /**
   * Get trigger config
   */
  async getConfig(userId: string): Promise<TriggerConfig> {
    return (
      this.configs.get(userId) || {
        enableMessages: true,
        enableMeals: true,
        enableProducts: true,
        enableFeedback: true,
        enableAppointments: true,
        enableGoals: true,
        soundEnabled: true,
        vibrationEnabled: true,
      }
    );
  }

  /**
   * Update trigger config
   */
  async updateConfig(userId: string, config: Partial<TriggerConfig>): Promise<TriggerConfig> {
    const currentConfig = await this.getConfig(userId);
    const updated = { ...currentConfig, ...config };
    this.configs.set(userId, updated);
    return updated;
  }

  /**
   * Subscribe to triggers
   */
  subscribeToTriggers(userId: string, callback: (trigger: NotificationTrigger) => void): () => void {
    if (!this.triggerListeners.has(userId)) {
      this.triggerListeners.set(userId, []);
    }
    this.triggerListeners.get(userId)!.push(callback);

    return () => {
      const listeners = this.triggerListeners.get(userId);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Notify trigger listeners
   */
  private notifyTriggerListeners(userId: string, trigger: NotificationTrigger): void {
    const listeners = this.triggerListeners.get(userId);
    if (listeners) {
      listeners.forEach((callback) => callback(trigger));
    }
  }

  /**
   * Get trigger statistics
   */
  async getTriggerStats(userId: string): Promise<{
    totalTriggers: number;
    unreadTriggers: number;
    triggersByType: Record<string, number>;
  }> {
    const triggers = await this.getTriggers(userId);
    const triggersByType: Record<string, number> = {
      message: 0,
      meal: 0,
      product: 0,
      feedback: 0,
      appointment: 0,
      goal: 0,
    };

    triggers.forEach((t) => {
      triggersByType[t.type]++;
    });

    return {
      totalTriggers: triggers.length,
      unreadTriggers: triggers.filter((t) => !t.isRead).length,
      triggersByType,
    };
  }

  /**
   * Clear old triggers (older than 30 days)
   */
  async clearOldTriggers(daysOld: number = 30): Promise<number> {
    const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000;
    let deletedCount = 0;

    Array.from(this.triggers.values()).forEach((trigger) => {
      if (trigger.createdAt < cutoffTime) {
        this.triggers.delete(trigger.id);
        deletedCount++;
      }
    });

    return deletedCount;
  }
}

// Export singleton instance
export const notificationTriggersService = NotificationTriggersService.getInstance();
