/**
 * Telehealth Video Consultation Service
 * Diyetisyen-danışan arasında canlı video konsültasyon yönetimi
 */

// ID oluşturma fonksiyonu
const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

export interface VideoSession {
  id: string;
  appointmentId: string;
  dietitianId: string;
  dietitianName: string;
  clientId: string;
  clientName: string;
  title: string;
  description: string;
  scheduledTime: number;
  startTime?: number;
  endTime?: number;
  duration: number; // dakika
  status: "scheduled" | "active" | "completed" | "cancelled";
  videoToken?: string;
  channelName?: string;
  recordingUrl?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ConsultationChat {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  senderRole: "dietitian" | "client";
  message: string;
  timestamp: number;
  isRead: boolean;
}

export interface ConsultationHistory {
  sessionId: string;
  dietitianId: string;
  clientId: string;
  date: number;
  duration: number;
  notes: string;
  recordingUrl?: string;
  followUpDate?: number;
}

// Mock veri depolama
const videoSessions: Map<string, VideoSession> = new Map();
const consultationChats: Map<string, ConsultationChat[]> = new Map();
const consultationHistories: Map<string, ConsultationHistory[]> = new Map();

export const telehealthService = {
  /**
   * Randevu için video session oluştur
   */
  async createVideoSession(
    appointmentId: string,
    dietitianId: string,
    dietitianName: string,
    clientId: string,
    clientName: string,
    title: string,
    description: string,
    scheduledTime: number,
    duration: number
  ): Promise<VideoSession> {
    const sessionId = generateId();
    const channelName = `consultation-${sessionId}`;

    const session: VideoSession = {
      id: sessionId,
      appointmentId,
      dietitianId,
      dietitianName,
      clientId,
      clientName,
      title,
      description,
      scheduledTime,
      duration,
      status: "scheduled",
      channelName,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    videoSessions.set(sessionId, session);

    // Bildirim tetikle
    console.log(`Video session created: ${sessionId}`);

    return session;
  },

  /**
   * Video session başlat
   */
  async startVideoSession(sessionId: string): Promise<VideoSession | null> {
    const session = videoSessions.get(sessionId);
    if (!session) return null;

    session.status = "active";
    session.startTime = Date.now();
    session.updatedAt = Date.now();

    videoSessions.set(sessionId, session);
    return session;
  },

  /**
   * Video session bitir
   */
  async endVideoSession(
    sessionId: string,
    notes?: string,
    recordingUrl?: string
  ): Promise<VideoSession | null> {
    const session = videoSessions.get(sessionId);
    if (!session) return null;

    session.status = "completed";
    session.endTime = Date.now();
    session.notes = notes;
    session.recordingUrl = recordingUrl;
    session.updatedAt = Date.now();

    videoSessions.set(sessionId, session);

    // Geçmişe ekle
    const historyKey = `${session.dietitianId}-${session.clientId}`;
    const histories = consultationHistories.get(historyKey) || [];

    const history: ConsultationHistory = {
      sessionId,
      dietitianId: session.dietitianId,
      clientId: session.clientId,
      date: session.startTime || Date.now(),
      duration: session.endTime
        ? Math.floor((session.endTime - (session.startTime || 0)) / 60000)
        : session.duration,
      notes: notes || "",
      recordingUrl,
    };

    histories.push(history);
    consultationHistories.set(historyKey, histories);

    return session;
  },

  /**
   * Video session iptal et
   */
  async cancelVideoSession(sessionId: string): Promise<VideoSession | null> {
    const session = videoSessions.get(sessionId);
    if (!session) return null;

    session.status = "cancelled";
    session.updatedAt = Date.now();

    videoSessions.set(sessionId, session);
    return session;
  },

  /**
   * Video session al
   */
  async getVideoSession(sessionId: string): Promise<VideoSession | null> {
    return videoSessions.get(sessionId) || null;
  },

  /**
   * Danışan için video session'ları al
   */
  async getVideoSessionsForClient(clientId: string): Promise<VideoSession[]> {
    return Array.from(videoSessions.values()).filter(
      (s) => s.clientId === clientId
    );
  },

  /**
   * Diyetisyen için video session'ları al
   */
  async getVideoSessionsForDietitian(
    dietitianId: string
  ): Promise<VideoSession[]> {
    return Array.from(videoSessions.values()).filter(
      (s) => s.dietitianId === dietitianId
    );
  },

  /**
   * Chat mesajı gönder
   */
  async sendChatMessage(
    sessionId: string,
    senderId: string,
    senderName: string,
    senderRole: "dietitian" | "client",
    message: string
  ): Promise<ConsultationChat> {
    const chatId = generateId();
    const chat: ConsultationChat = {
      id: chatId,
      sessionId,
      senderId,
      senderName,
      senderRole,
      message,
      timestamp: Date.now(),
      isRead: false,
    };

    const chats = consultationChats.get(sessionId) || [];
    chats.push(chat);
    consultationChats.set(sessionId, chats);

    return chat;
  },

  /**
   * Session chat'ini al
   */
  async getSessionChat(sessionId: string): Promise<ConsultationChat[]> {
    return consultationChats.get(sessionId) || [];
  },

  /**
   * Chat mesajını oku olarak işaretle
   */
  async markChatAsRead(sessionId: string, chatId: string): Promise<boolean> {
    const chats = consultationChats.get(sessionId);
    if (!chats) return false;

    const chat = chats.find((c) => c.id === chatId);
    if (!chat) return false;

    chat.isRead = true;
    consultationChats.set(sessionId, chats);
    return true;
  },

  /**
   * Konsültasyon geçmişini al
   */
  async getConsultationHistory(
    dietitianId: string,
    clientId: string
  ): Promise<ConsultationHistory[]> {
    const key = `${dietitianId}-${clientId}`;
    return consultationHistories.get(key) || [];
  },

  /**
   * Diyetisyen için tüm konsültasyon geçmişini al
   */
  async getDietitianConsultationHistory(
    dietitianId: string
  ): Promise<ConsultationHistory[]> {
    const histories: ConsultationHistory[] = [];
    consultationHistories.forEach((value) => {
      const filtered = value.filter((h) => h.dietitianId === dietitianId);
      histories.push(...filtered);
    });
    return histories.sort((a, b) => b.date - a.date);
  },

  /**
   * Danışan için tüm konsültasyon geçmişini al
   */
  async getClientConsultationHistory(
    clientId: string
  ): Promise<ConsultationHistory[]> {
    const histories: ConsultationHistory[] = [];
    consultationHistories.forEach((value) => {
      const filtered = value.filter((h) => h.clientId === clientId);
      histories.push(...filtered);
    });
    return histories.sort((a, b) => b.date - a.date);
  },

  /**
   * Follow-up randevu tarihi belirle
   */
  async setFollowUpDate(
    historySessionId: string,
    followUpDate: number
  ): Promise<boolean> {
    let found = false;
    consultationHistories.forEach((histories) => {
      const history = histories.find((h) => h.sessionId === historySessionId);
      if (history) {
        history.followUpDate = followUpDate;
        found = true;
      }
    });
    return found;
  },

  /**
   * Video session istatistikleri
   */
  async getVideoSessionStats(
    dietitianId: string,
    clientId?: string
  ): Promise<{
    totalSessions: number;
    completedSessions: number;
    cancelledSessions: number;
    totalDuration: number;
    averageDuration: number;
  }> {
    let sessions = Array.from(videoSessions.values()).filter(
      (s) => s.dietitianId === dietitianId
    );

    if (clientId) {
      sessions = sessions.filter((s) => s.clientId === clientId);
    }

    const completedSessions = sessions.filter((s) => s.status === "completed");
    const totalDuration = completedSessions.reduce(
      (sum, s) =>
        sum +
        (s.endTime && s.startTime
          ? Math.floor((s.endTime - s.startTime) / 60000)
          : 0),
      0
    );

    return {
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      cancelledSessions: sessions.filter((s) => s.status === "cancelled").length,
      totalDuration,
      averageDuration:
        completedSessions.length > 0
          ? Math.round(totalDuration / completedSessions.length)
          : 0,
    };
  },
};
