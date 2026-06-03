import AsyncStorage from "@react-native-async-storage/async-storage";

export interface DietitianRecommendation {
  id: string;
  dietitianId: string;
  clientId: string;
  clientName: string;
  type: "warning" | "suggestion" | "praise" | "alert";
  title: string;
  message: string;
  actionItems?: string[];
  priority: "low" | "medium" | "high";
  createdAt: string;
  read: boolean;
}

export interface ActivityAlert {
  clientId: string;
  clientName: string;
  alertType: "low_adherence" | "missed_meals" | "low_activity" | "poor_sleep" | "dehydration";
  severity: "info" | "warning" | "critical";
  message: string;
  suggestedActions: string[];
  timestamp: string;
}

// Mock recommendations data
const mockRecommendations: Record<string, DietitianRecommendation[]> = {
  "dietitian@test.com": [
    {
      id: "rec_1",
      dietitianId: "dietitian@test.com",
      clientId: "client@test.com",
      clientName: "Ahmet Yılmaz",
      type: "praise",
      title: "Harika İlerleme!",
      message: "Ahmet bu hafta uyum oranında %5 artış gösterdi. Mükemmel gidişat!",
      actionItems: ["Devam etmesini teşvik edin", "Başarılarını kutlayın"],
      priority: "low",
      createdAt: new Date().toISOString(),
      read: false,
    },
    {
      id: "rec_2",
      dietitianId: "dietitian@test.com",
      clientId: "demo@test.com",
      clientName: "Fatma Demir",
      type: "warning",
      title: "Düşük Aktivite Seviyesi",
      message: "Fatma'nın günlük adım sayısı hedefin altında. Spor aktivitesini artırması gerekiyor.",
      actionItems: [
        "Günde 2000 adım daha artırmayı öneriniz",
        "Hafif yürüyüş veya yoga öneriniz",
      ],
      priority: "medium",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      read: false,
    },
    {
      id: "rec_3",
      dietitianId: "dietitian@test.com",
      clientId: "client@test.com",
      clientName: "Ahmet Yılmaz",
      type: "suggestion",
      title: "Protein Alımını Artırın",
      message: "Ahmet'in günlük protein alımı hedeften %15 düşük. Protein kaynaklarını artırması önerilir.",
      actionItems: [
        "Tavuk, balık, yumurta tüketimini artırın",
        "Ara öğünlerde protein barı ekleyin",
      ],
      priority: "medium",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      read: true,
    },
  ],
};

// Mock activity alerts
const mockActivityAlerts: Record<string, ActivityAlert[]> = {
  "dietitian@test.com": [
    {
      clientId: "client@test.com",
      clientName: "Ahmet Yılmaz",
      alertType: "low_adherence",
      severity: "warning",
      message: "Ahmet'in bu hafta uyum oranı %85'e düştü",
      suggestedActions: [
        "Danışmanla iletişime geçin",
        "Hedefleri gözden geçirin",
        "Motivasyon artırıcı mesaj gönderin",
      ],
      timestamp: new Date().toISOString(),
    },
    {
      clientId: "demo@test.com",
      clientName: "Fatma Demir",
      alertType: "dehydration",
      severity: "info",
      message: "Fatma'nın su tüketimi günlük hedefin altında",
      suggestedActions: [
        "Su tüketimini artırmasını öneriniz",
        "Su içme hatırlatıcısı kurunuz",
      ],
      timestamp: new Date().toISOString(),
    },
  ],
};

/**
 * Diyetisyenin danışanlarına yönelik önerilerini alması
 */
export async function getDietitianRecommendations(
  dietitianId: string
): Promise<DietitianRecommendation[]> {
  try {
    return mockRecommendations[dietitianId] || [];
  } catch (error) {
    console.error("Failed to get recommendations:", error);
    return [];
  }
}

/**
 * Belirli bir danışan için öneriler
 */
export async function getClientRecommendations(
  dietitianId: string,
  clientId: string
): Promise<DietitianRecommendation[]> {
  try {
    const recommendations = mockRecommendations[dietitianId] || [];
    return recommendations.filter((r) => r.clientId === clientId);
  } catch (error) {
    console.error("Failed to get client recommendations:", error);
    return [];
  }
}

/**
 * Aktivite uyarılarını alma
 */
export async function getActivityAlerts(
  dietitianId: string
): Promise<ActivityAlert[]> {
  try {
    return mockActivityAlerts[dietitianId] || [];
  } catch (error) {
    console.error("Failed to get activity alerts:", error);
    return [];
  }
}

/**
 * Önerileri okundu olarak işaretleme
 */
export async function markRecommendationAsRead(
  dietitianId: string,
  recommendationId: string
): Promise<void> {
  try {
    const recommendations = mockRecommendations[dietitianId] || [];
    const index = recommendations.findIndex((r) => r.id === recommendationId);

    if (index >= 0) {
      recommendations[index].read = true;
      mockRecommendations[dietitianId] = recommendations;
    }
  } catch (error) {
    console.error("Failed to mark recommendation as read:", error);
  }
}

/**
 * Yeni öneriler oluşturma (diyetisyen tarafından)
 */
export async function createRecommendation(
  dietitianId: string,
  clientId: string,
  clientName: string,
  recommendation: Omit<DietitianRecommendation, "id" | "dietitianId" | "clientId" | "clientName" | "createdAt">
): Promise<DietitianRecommendation> {
  try {
    const newRec: DietitianRecommendation = {
      ...recommendation,
      id: `rec_${Date.now()}`,
      dietitianId,
      clientId,
      clientName,
      createdAt: new Date().toISOString(),
    };

    if (!mockRecommendations[dietitianId]) {
      mockRecommendations[dietitianId] = [];
    }

    mockRecommendations[dietitianId].push(newRec);
    return newRec;
  } catch (error) {
    console.error("Failed to create recommendation:", error);
    throw error;
  }
}

/**
 * Aktivite tabanlı otomatik öneriler oluşturma
 */
export async function generateActivityBasedRecommendations(
  dietitianId: string,
  clientId: string,
  clientName: string,
  activityData: {
    adherenceRate: number;
    mealsLogged: number;
    stepsCount: number;
    sleepHours: number;
    waterIntake: number;
  }
): Promise<DietitianRecommendation[]> {
  const recommendations: DietitianRecommendation[] = [];

  try {
    // Düşük uyum oranı kontrolü
    if (activityData.adherenceRate < 70) {
      recommendations.push(
        await createRecommendation(
          dietitianId,
          clientId,
          clientName,
          {
            type: "alert",
            title: "Düşük Uyum Oranı",
            message: `${clientName}'nin uyum oranı ${activityData.adherenceRate}%. Motivasyonunu artırması gerekiyor.`,
            actionItems: [
              "Danışmanla iletişime geçin",
              "Hedefleri gözden geçirin",
              "Ödül sistemi kurun",
            ],
            priority: "high",
            read: false,
          }
        )
      );
    }

    // Düşük aktivite kontrolü
    if (activityData.stepsCount < 5000) {
      recommendations.push(
        await createRecommendation(
          dietitianId,
          clientId,
          clientName,
          {
            type: "warning",
            title: "Düşük Aktivite Seviyesi",
            message: `${clientName}'nin günlük adım sayısı ${activityData.stepsCount}. Spor aktivitesini artırması önerilir.`,
            actionItems: [
              "Günde 2000 adım daha artırmayı öneriniz",
              "Hafif yürüyüş veya yoga öneriniz",
            ],
            priority: "medium",
            read: false,
          }
        )
      );
    }

    // Düşük uyku kontrolü
    if (activityData.sleepHours < 6) {
      recommendations.push(
        await createRecommendation(
          dietitianId,
          clientId,
          clientName,
          {
            type: "warning",
            title: "Yetersiz Uyku",
            message: `${clientName} sadece ${activityData.sleepHours} saat uyuyor. Uyku kalitesini iyileştirmesi gerekiyor.`,
            actionItems: [
              "Uyku saatini düzenli tutmasını öneriniz",
              "Uyku hijyeni önerileri verin",
            ],
            priority: "medium",
            read: false,
          }
        )
      );
    }

    // Düşük su tüketimi kontrolü
    if (activityData.waterIntake < 1500) {
      recommendations.push(
        await createRecommendation(
          dietitianId,
          clientId,
          clientName,
          {
            type: "suggestion",
            title: "Su Tüketimini Artırın",
            message: `${clientName}'nin su tüketimi ${activityData.waterIntake}ml. Günde 2500ml su içmesi önerilir.`,
            actionItems: [
              "Su tüketimini artırmasını öneriniz",
              "Su içme hatırlatıcısı kurunuz",
            ],
            priority: "low",
            read: false,
          }
        )
      );
    }

    // Düşük öğün sayısı kontrolü
    if (activityData.mealsLogged < 3) {
      recommendations.push(
        await createRecommendation(
          dietitianId,
          clientId,
          clientName,
          {
            type: "warning",
            title: "Öğün Sayısını Artırın",
            message: `${clientName} sadece ${activityData.mealsLogged} öğün kaydetti. Ara öğünleri de kaydetmesi önerilir.`,
            actionItems: [
              "Ara öğünleri kaydetmesini hatırlatın",
              "Beslenme planını gözden geçirin",
            ],
            priority: "medium",
            read: false,
          }
        )
      );
    }

    return recommendations;
  } catch (error) {
    console.error("Failed to generate activity-based recommendations:", error);
    return recommendations;
  }
}

/**
 * Önerileri silme
 */
export async function deleteRecommendation(
  dietitianId: string,
  recommendationId: string
): Promise<void> {
  try {
    const recommendations = mockRecommendations[dietitianId] || [];
    mockRecommendations[dietitianId] = recommendations.filter((r) => r.id !== recommendationId);
  } catch (error) {
    console.error("Failed to delete recommendation:", error);
  }
}
