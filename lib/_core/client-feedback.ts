import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ClientFeedback {
  id: string;
  clientId: string;
  clientName: string;
  dietitianId: string;
  recommendationId: string;
  recommendationTitle: string;
  feedbackType: "helpful" | "not_helpful" | "need_clarification" | "completed";
  rating: number; // 1-5
  message?: string;
  createdAt: string;
  dietitianResponse?: {
    message: string;
    respondedAt: string;
  };
}

export interface FeedbackStats {
  totalFeedback: number;
  helpfulCount: number;
  notHelpfulCount: number;
  clarificationCount: number;
  completedCount: number;
  averageRating: number;
}

// Mock feedback data
const mockFeedback: Record<string, ClientFeedback[]> = {
  "client@test.com": [
    {
      id: "feedback_1",
      clientId: "client@test.com",
      clientName: "Ahmet Yılmaz",
      dietitianId: "dietitian@test.com",
      recommendationId: "rec_1",
      recommendationTitle: "Protein Alımını Artırın",
      feedbackType: "helpful",
      rating: 5,
      message: "Çok faydalı oldu, protein alımımı artırdım ve kendimi daha iyi hissediyorum",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      dietitianResponse: {
        message: "Çok sevindim! Devam et, ilerleme harika gidiyor.",
        respondedAt: new Date(Date.now() - 43200000).toISOString(),
      },
    },
    {
      id: "feedback_2",
      clientId: "client@test.com",
      clientName: "Ahmet Yılmaz",
      dietitianId: "dietitian@test.com",
      recommendationId: "rec_2",
      recommendationTitle: "Uyku Saatlerini Düzenle",
      feedbackType: "need_clarification",
      rating: 3,
      message: "Uyku saatlerini nasıl düzenlemeliyim? Çalışma saatlerim düzensiz",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ],
};

/**
 * Danışanın geri bildirim vermesi
 */
export async function addClientFeedback(
  clientId: string,
  clientName: string,
  dietitianId: string,
  recommendationId: string,
  recommendationTitle: string,
  feedbackType: ClientFeedback["feedbackType"],
  rating: number,
  message?: string
): Promise<ClientFeedback> {
  try {
    const feedback: ClientFeedback = {
      id: `feedback_${Date.now()}`,
      clientId,
      clientName,
      dietitianId,
      recommendationId,
      recommendationTitle,
      feedbackType,
      rating,
      message,
      createdAt: new Date().toISOString(),
    };

    if (!mockFeedback[clientId]) {
      mockFeedback[clientId] = [];
    }

    mockFeedback[clientId].push(feedback);
    return feedback;
  } catch (error) {
    console.error("Failed to add feedback:", error);
    throw error;
  }
}

/**
 * Danışanın geri bildirimlerini görmesi
 */
export async function getClientFeedback(clientId: string): Promise<ClientFeedback[]> {
  try {
    return mockFeedback[clientId] || [];
  } catch (error) {
    console.error("Failed to get client feedback:", error);
    return [];
  }
}

/**
 * Diyetisyenin danışan geri bildirimlerini görmesi
 */
export async function getDietitianFeedback(
  dietitianId: string
): Promise<ClientFeedback[]> {
  try {
    const allFeedback = Object.values(mockFeedback).flat();
    return allFeedback.filter((f) => f.dietitianId === dietitianId);
  } catch (error) {
    console.error("Failed to get dietitian feedback:", error);
    return [];
  }
}

/**
 * Diyetisyenin geri bildirime yanıt vermesi
 */
export async function respondToFeedback(
  clientId: string,
  feedbackId: string,
  response: string
): Promise<ClientFeedback | null> {
  try {
    const feedbacks = mockFeedback[clientId] || [];
    const index = feedbacks.findIndex((f) => f.id === feedbackId);

    if (index >= 0) {
      feedbacks[index].dietitianResponse = {
        message: response,
        respondedAt: new Date().toISOString(),
      };
      mockFeedback[clientId] = feedbacks;
      return feedbacks[index];
    }

    return null;
  } catch (error) {
    console.error("Failed to respond to feedback:", error);
    return null;
  }
}

/**
 * Geri bildirim istatistikleri
 */
export async function getFeedbackStats(
  dietitianId: string
): Promise<FeedbackStats> {
  try {
    const feedbacks = await getDietitianFeedback(dietitianId);

    const stats: FeedbackStats = {
      totalFeedback: feedbacks.length,
      helpfulCount: feedbacks.filter((f) => f.feedbackType === "helpful").length,
      notHelpfulCount: feedbacks.filter((f) => f.feedbackType === "not_helpful").length,
      clarificationCount: feedbacks.filter((f) => f.feedbackType === "need_clarification").length,
      completedCount: feedbacks.filter((f) => f.feedbackType === "completed").length,
      averageRating:
        feedbacks.length > 0
          ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
          : 0,
    };

    return stats;
  } catch (error) {
    console.error("Failed to get feedback stats:", error);
    return {
      totalFeedback: 0,
      helpfulCount: 0,
      notHelpfulCount: 0,
      clarificationCount: 0,
      completedCount: 0,
      averageRating: 0,
    };
  }
}

/**
 * Geri bildirim silme
 */
export async function deleteFeedback(
  clientId: string,
  feedbackId: string
): Promise<void> {
  try {
    const feedbacks = mockFeedback[clientId] || [];
    mockFeedback[clientId] = feedbacks.filter((f) => f.id !== feedbackId);
  } catch (error) {
    console.error("Failed to delete feedback:", error);
  }
}
