/**
 * Activity Stream Service
 * Centralized event management for all user activities
 */

export interface ActivityEvent {
  id: string;
  userId: string;
  userName: string;
  userRole: "client" | "dietitian";
  type: "meal" | "message" | "achievement" | "goal" | "recommendation" | "feedback" | "package";
  title: string;
  description: string;
  icon: string;
  data: Record<string, any>;
  timestamp: number;
  isRead: boolean;
  relatedUsers?: string[]; // For visibility to other users
}

export interface ActivityFeed {
  events: ActivityEvent[];
  totalCount: number;
  unreadCount: number;
}

/**
 * Activity Stream Service Implementation
 */
export class ActivityStreamService {
  private static instance: ActivityStreamService;
  private events: Map<string, ActivityEvent> = new Map();
  private userFeeds: Map<string, string[]> = new Map(); // userId -> eventIds
  private eventListeners: Map<string, Function[]> = new Map();

  private constructor() {
    this.initializeSampleData();
  }

  static getInstance(): ActivityStreamService {
    if (!ActivityStreamService.instance) {
      ActivityStreamService.instance = new ActivityStreamService();
    }
    return ActivityStreamService.instance;
  }

  /**
   * Initialize with sample events
   */
  private initializeSampleData(): void {
    const sampleEvents: ActivityEvent[] = [
      {
        id: "event-1",
        userId: "client-1",
        userName: "Ayşe Yılmaz",
        userRole: "client",
        type: "meal",
        title: "Öğün Kaydedildi",
        description: "Tavuk Salata (450 kcal) öğle yemeği olarak kaydedildi",
        icon: "🍽️",
        data: {
          mealType: "lunch",
          mealName: "Tavuk Salata",
          calories: 450,
        },
        timestamp: Date.now() - 3600000,
        isRead: true,
        relatedUsers: ["dietitian-1"],
      },
      {
        id: "event-2",
        userId: "client-1",
        userName: "Ayşe Yılmaz",
        userRole: "client",
        type: "achievement",
        title: "Rozet Kazandı",
        description: "7 Gün Tutarlılık rozetini kazandı",
        icon: "🏆",
        data: {
          badgeName: "7 Gün Tutarlılık",
          badgeLevel: 1,
        },
        timestamp: Date.now() - 7200000,
        isRead: true,
        relatedUsers: ["dietitian-1"],
      },
      {
        id: "event-3",
        userId: "dietitian-1",
        userName: "Dr. Mehmet Kaya",
        userRole: "dietitian",
        type: "recommendation",
        title: "Öneriler Gönderdi",
        description: "Ayşe Yılmaz'a 5 yeni beslenme önerisi gönderdi",
        icon: "💡",
        data: {
          clientName: "Ayşe Yılmaz",
          recommendationCount: 5,
        },
        timestamp: Date.now() - 10800000,
        isRead: false,
        relatedUsers: ["client-1"],
      },
    ];

    sampleEvents.forEach((event) => {
      this.events.set(event.id, event);
      this.addToUserFeed(event.userId, event.id);
      if (event.relatedUsers) {
        event.relatedUsers.forEach((userId) => {
          this.addToUserFeed(userId, event.id);
        });
      }
    });
  }

  /**
   * Add event to user feed
   */
  private addToUserFeed(userId: string, eventId: string): void {
    if (!this.userFeeds.has(userId)) {
      this.userFeeds.set(userId, []);
    }
    const feed = this.userFeeds.get(userId)!;
    if (!feed.includes(eventId)) {
      feed.unshift(eventId);
    }
  }

  /**
   * Create a new activity event
   */
  async createEvent(
    userId: string,
    userName: string,
    userRole: "client" | "dietitian",
    type: "meal" | "message" | "achievement" | "goal" | "recommendation" | "feedback" | "package",
    title: string,
    description: string,
    icon: string,
    data: Record<string, any>,
    relatedUsers?: string[]
  ): Promise<ActivityEvent> {
    const eventId = `event-${Date.now()}`;
    const event: ActivityEvent = {
      id: eventId,
      userId,
      userName,
      userRole,
      type,
      title,
      description,
      icon,
      data,
      timestamp: Date.now(),
      isRead: false,
      relatedUsers,
    };

    this.events.set(eventId, event);
    this.addToUserFeed(userId, eventId);

    if (relatedUsers) {
      relatedUsers.forEach((relatedUserId) => {
        this.addToUserFeed(relatedUserId, eventId);
      });
    }

    this.notifyEventListeners(userId, event);
    if (relatedUsers) {
      relatedUsers.forEach((relatedUserId) => {
        this.notifyEventListeners(relatedUserId, event);
      });
    }

    return event;
  }

  /**
   * Get activity feed for user
   */
  async getActivityFeed(userId: string, limit: number = 20, offset: number = 0): Promise<ActivityFeed> {
    const eventIds = this.userFeeds.get(userId) || [];
    const paginatedIds = eventIds.slice(offset, offset + limit);

    const events = paginatedIds
      .map((id) => this.events.get(id))
      .filter((e) => e !== undefined) as ActivityEvent[];

    const unreadCount = events.filter((e) => !e.isRead).length;

    return {
      events,
      totalCount: eventIds.length,
      unreadCount,
    };
  }

  /**
   * Get events by type
   */
  async getEventsByType(
    userId: string,
    type: "meal" | "message" | "achievement" | "goal" | "recommendation" | "feedback" | "package"
  ): Promise<ActivityEvent[]> {
    const eventIds = this.userFeeds.get(userId) || [];
    return eventIds
      .map((id) => this.events.get(id))
      .filter((e) => e !== undefined && e.type === type) as ActivityEvent[];
  }

  /**
   * Mark event as read
   */
  async markEventAsRead(eventId: string): Promise<void> {
    const event = this.events.get(eventId);
    if (event) {
      event.isRead = true;
      this.events.set(eventId, event);
    }
  }

  /**
   * Mark all events as read for user
   */
  async markAllEventsAsRead(userId: string): Promise<void> {
    const eventIds = this.userFeeds.get(userId) || [];
    eventIds.forEach((id) => {
      const event = this.events.get(id);
      if (event) {
        event.isRead = true;
        this.events.set(id, event);
      }
    });
  }

  /**
   * Get unread count for user
   */
  async getUnreadCount(userId: string): Promise<number> {
    const eventIds = this.userFeeds.get(userId) || [];
    return eventIds.filter((id) => {
      const event = this.events.get(id);
      return event && !event.isRead;
    }).length;
  }

  /**
   * Search events
   */
  async searchEvents(userId: string, query: string): Promise<ActivityEvent[]> {
    const eventIds = this.userFeeds.get(userId) || [];
    const queryLower = query.toLowerCase();

    return eventIds
      .map((id) => this.events.get(id))
      .filter((e) => {
        if (!e) return false;
        return (
          e.title.toLowerCase().includes(queryLower) ||
          e.description.toLowerCase().includes(queryLower) ||
          e.userName.toLowerCase().includes(queryLower)
        );
      }) as ActivityEvent[];
  }

  /**
   * Get events for date range
   */
  async getEventsByDateRange(userId: string, startTime: number, endTime: number): Promise<ActivityEvent[]> {
    const eventIds = this.userFeeds.get(userId) || [];
    return eventIds
      .map((id) => this.events.get(id))
      .filter((e) => e !== undefined && e.timestamp >= startTime && e.timestamp <= endTime) as ActivityEvent[];
  }

  /**
   * Subscribe to events
   */
  subscribeToEvents(userId: string, callback: (event: ActivityEvent) => void): () => void {
    if (!this.eventListeners.has(userId)) {
      this.eventListeners.set(userId, []);
    }
    this.eventListeners.get(userId)!.push(callback);

    return () => {
      const listeners = this.eventListeners.get(userId);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Notify event listeners
   */
  private notifyEventListeners(userId: string, event: ActivityEvent): void {
    const listeners = this.eventListeners.get(userId);
    if (listeners) {
      listeners.forEach((callback) => callback(event));
    }
  }

  /**
   * Delete event
   */
  async deleteEvent(eventId: string): Promise<void> {
    const event = this.events.get(eventId);
    if (event) {
      this.events.delete(eventId);
      // Remove from all user feeds
      this.userFeeds.forEach((eventIds) => {
        const index = eventIds.indexOf(eventId);
        if (index > -1) {
          eventIds.splice(index, 1);
        }
      });
    }
  }

  /**
   * Get activity statistics
   */
  async getActivityStats(userId: string): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    unreadCount: number;
    lastActivityTime: number | null;
  }> {
    const eventIds = this.userFeeds.get(userId) || [];
    const events = eventIds.map((id) => this.events.get(id)).filter((e) => e !== undefined) as ActivityEvent[];

    const eventsByType: Record<string, number> = {
      meal: 0,
      message: 0,
      achievement: 0,
      goal: 0,
      recommendation: 0,
      feedback: 0,
      package: 0,
    };

    events.forEach((e) => {
      eventsByType[e.type]++;
    });

    return {
      totalEvents: events.length,
      eventsByType,
      unreadCount: events.filter((e) => !e.isRead).length,
      lastActivityTime: events.length > 0 ? events[0].timestamp : null,
    };
  }

  /**
   * Clear old events (older than 90 days)
   */
  async clearOldEvents(daysOld: number = 90): Promise<number> {
    const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000;
    let deletedCount = 0;

    Array.from(this.events.values()).forEach((event) => {
      if (event.timestamp < cutoffTime) {
        this.deleteEvent(event.id);
        deletedCount++;
      }
    });

    return deletedCount;
  }
}

// Export singleton instance
export const activityStreamService = ActivityStreamService.getInstance();
