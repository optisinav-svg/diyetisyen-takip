/**
 * Real-time Messaging Service
 * Handles message sending, receiving, and synchronization between clients and dietitians
 */

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: "client" | "dietitian";
  recipientId: string;
  content: string;
  mediaUrl?: string;
  mediaType?: "image" | "document" | "audio";
  isRead: boolean;
  readAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Conversation {
  id: string;
  clientId: string;
  dietitianId: string;
  clientName: string;
  dietitianName: string;
  lastMessage?: string;
  lastMessageAt?: number;
  unreadCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface MessageNotification {
  id: string;
  conversationId: string;
  userId: string;
  senderName: string;
  messagePreview: string;
  isRead: boolean;
  createdAt: number;
}

/**
 * Messaging Service Implementation
 */
export class MessagingService {
  private static instance: MessagingService;
  private messages: Map<string, Message> = new Map();
  private conversations: Map<string, Conversation> = new Map();
  private notifications: Map<string, MessageNotification> = new Map();
  private messageListeners: Map<string, Function[]> = new Map();
  private conversationListeners: Map<string, Function[]> = new Map();

  private constructor() {
    this.initializeSampleData();
  }

  static getInstance(): MessagingService {
    if (!MessagingService.instance) {
      MessagingService.instance = new MessagingService();
    }
    return MessagingService.instance;
  }

  /**
   * Initialize with sample conversations and messages
   */
  private initializeSampleData(): void {
    // Sample conversation
    const convId = "conv-1";
    this.conversations.set(convId, {
      id: convId,
      clientId: "client-1",
      dietitianId: "dietitian-1",
      clientName: "Ayşe Yılmaz",
      dietitianName: "Dr. Mehmet Kaya",
      lastMessage: "Harika! Protein alımını artırmaya devam et.",
      lastMessageAt: Date.now() - 3600000,
      unreadCount: 0,
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 3600000,
    });

    // Sample messages
    const messages: Message[] = [
      {
        id: "msg-1",
        conversationId: convId,
        senderId: "dietitian-1",
        senderName: "Dr. Mehmet Kaya",
        senderRole: "dietitian",
        recipientId: "client-1",
        content: "Merhaba Ayşe, bu hafta nasıl gidiyor?",
        isRead: true,
        readAt: Date.now() - 3000000,
        createdAt: Date.now() - 3600000,
        updatedAt: Date.now() - 3600000,
      },
      {
        id: "msg-2",
        conversationId: convId,
        senderId: "client-1",
        senderName: "Ayşe Yılmaz",
        senderRole: "client",
        recipientId: "dietitian-1",
        content: "Merhaba Dr. Kaya! Çok iyi gidiyor, öğünleri düzenli alıyorum.",
        isRead: true,
        readAt: Date.now() - 2400000,
        createdAt: Date.now() - 2400000,
        updatedAt: Date.now() - 2400000,
      },
      {
        id: "msg-3",
        conversationId: convId,
        senderId: "dietitian-1",
        senderName: "Dr. Mehmet Kaya",
        senderRole: "dietitian",
        recipientId: "client-1",
        content: "Harika! Protein alımını artırmaya devam et. Adımlarını da takip ediyorum.",
        isRead: true,
        readAt: Date.now() - 1800000,
        createdAt: Date.now() - 1800000,
        updatedAt: Date.now() - 1800000,
      },
    ];

    messages.forEach((msg) => this.messages.set(msg.id, msg));
  }

  /**
   * Send a message
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    senderRole: "client" | "dietitian",
    recipientId: string,
    content: string,
    mediaUrl?: string,
    mediaType?: "image" | "document" | "audio"
  ): Promise<Message> {
    const messageId = `msg-${Date.now()}`;
    const message: Message = {
      id: messageId,
      conversationId,
      senderId,
      senderName,
      senderRole,
      recipientId,
      content,
      mediaUrl,
      mediaType,
      isRead: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.messages.set(messageId, message);

    // Update conversation
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.lastMessage = content;
      conversation.lastMessageAt = Date.now();
      conversation.updatedAt = Date.now();
      this.conversations.set(conversationId, conversation);
    }

    // Create notification for recipient
    await this.createMessageNotification(conversationId, recipientId, senderName, content);

    // Notify listeners
    this.notifyMessageListeners(conversationId, message);

    return message;
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: string, limit: number = 50): Promise<Message[]> {
    const msgs = Array.from(this.messages.values()).filter(
      (m) => m.conversationId === conversationId
    );
    return msgs.sort((a, b) => a.createdAt - b.createdAt).slice(-limit);
  }

  /**
   * Mark message as read
   */
  async markMessageAsRead(messageId: string): Promise<void> {
    const message = this.messages.get(messageId);
    if (message) {
      message.isRead = true;
      message.readAt = Date.now();
      this.messages.set(messageId, message);
    }
  }

  /**
   * Mark all messages in conversation as read
   */
  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    const msgs = Array.from(this.messages.values()).filter(
      (m) => m.conversationId === conversationId && m.recipientId === userId && !m.isRead
    );

    msgs.forEach((msg) => {
      msg.isRead = true;
      msg.readAt = Date.now();
      this.messages.set(msg.id, msg);
    });

    // Update conversation unread count
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.unreadCount = 0;
      this.conversations.set(conversationId, conversation);
    }
  }

  /**
   * Get conversations for a user
   */
  async getConversations(userId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(
      (c) => c.clientId === userId || c.dietitianId === userId
    );
  }

  /**
   * Get or create conversation
   */
  async getOrCreateConversation(
    clientId: string,
    dietitianId: string,
    clientName: string,
    dietitianName: string
  ): Promise<Conversation> {
    // Check if conversation exists
    let conversation = Array.from(this.conversations.values()).find(
      (c) => (c.clientId === clientId && c.dietitianId === dietitianId) ||
             (c.clientId === dietitianId && c.dietitianId === clientId)
    );

    if (!conversation) {
      const convId = `conv-${Date.now()}`;
      conversation = {
        id: convId,
        clientId,
        dietitianId,
        clientName,
        dietitianName,
        unreadCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      this.conversations.set(convId, conversation);
    }

    return conversation;
  }

  /**
   * Create message notification
   */
  private async createMessageNotification(
    conversationId: string,
    userId: string,
    senderName: string,
    messagePreview: string
  ): Promise<void> {
    const notifId = `notif-${Date.now()}`;
    const notification: MessageNotification = {
      id: notifId,
      conversationId,
      userId,
      senderName,
      messagePreview: messagePreview.substring(0, 100),
      isRead: false,
      createdAt: Date.now(),
    };

    this.notifications.set(notifId, notification);

    // Update conversation unread count
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.unreadCount += 1;
      this.conversations.set(conversationId, conversation);
    }
  }

  /**
   * Get unread notifications
   */
  async getUnreadNotifications(userId: string): Promise<MessageNotification[]> {
    return Array.from(this.notifications.values()).filter(
      (n) => n.userId === userId && !n.isRead
    );
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
   * Subscribe to message updates
   */
  subscribeToMessages(conversationId: string, callback: (message: Message) => void): () => void {
    if (!this.messageListeners.has(conversationId)) {
      this.messageListeners.set(conversationId, []);
    }
    this.messageListeners.get(conversationId)!.push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.messageListeners.get(conversationId);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Subscribe to conversation updates
   */
  subscribeToConversations(userId: string, callback: (conversation: Conversation) => void): () => void {
    if (!this.conversationListeners.has(userId)) {
      this.conversationListeners.set(userId, []);
    }
    this.conversationListeners.get(userId)!.push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.conversationListeners.get(userId);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Notify message listeners
   */
  private notifyMessageListeners(conversationId: string, message: Message): void {
    const listeners = this.messageListeners.get(conversationId);
    if (listeners) {
      listeners.forEach((callback) => callback(message));
    }
  }

  /**
   * Notify conversation listeners
   */
  private notifyConversationListeners(userId: string, conversation: Conversation): void {
    const listeners = this.conversationListeners.get(userId);
    if (listeners) {
      listeners.forEach((callback) => callback(conversation));
    }
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId: string): Promise<void> {
    this.messages.delete(messageId);
  }

  /**
   * Search messages
   */
  async searchMessages(conversationId: string, query: string): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (m) => m.conversationId === conversationId && m.content.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * Get message statistics
   */
  async getMessageStats(conversationId: string): Promise<{
    totalMessages: number;
    unreadMessages: number;
    lastMessageTime: number | undefined;
  }> {
    const msgs = Array.from(this.messages.values()).filter(
      (m) => m.conversationId === conversationId
    );

    return {
      totalMessages: msgs.length,
      unreadMessages: msgs.filter((m) => !m.isRead).length,
      lastMessageTime: msgs.length > 0 ? Math.max(...msgs.map((m) => m.createdAt)) : undefined,
    };
  }
}

// Export singleton instance
export const messagingService = MessagingService.getInstance();
