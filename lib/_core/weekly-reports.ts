import AsyncStorage from "@react-native-async-storage/async-storage";

export interface WeeklyReport {
  id: string;
  clientId: string;
  clientName: string;
  dietitianId: string;
  weekStartDate: string;
  weekEndDate: string;
  summary: {
    totalMeals: number;
    totalActivities: number;
    averageAdherence: number;
    caloriesConsumed: number;
    caloriesBurned: number;
    averageSteps: number;
    averageSleep: number;
    waterIntake: number;
  };
  highlights: string[];
  recommendations: string[];
  createdAt: string;
  sentAt?: string;
}

export interface ClientFeedback {
  id: string;
  clientId: string;
  clientName: string;
  dietitianId: string;
  recommendationId: string;
  feedbackType: "helpful" | "not_helpful" | "need_clarification" | "completed";
  message?: string;
  createdAt: string;
}

// Mock weekly reports
const mockWeeklyReports: Record<string, WeeklyReport[]> = {
  "dietitian@test.com": [
    {
      id: "report_1",
      clientId: "client@test.com",
      clientName: "Ahmet Yılmaz",
      dietitianId: "dietitian@test.com",
      weekStartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      weekEndDate: new Date().toISOString(),
      summary: {
        totalMeals: 28,
        totalActivities: 12,
        averageAdherence: 85,
        caloriesConsumed: 12600,
        caloriesBurned: 15400,
        averageSteps: 8200,
        averageSleep: 7.3,
        waterIntake: 16100,
      },
      highlights: [
        "Uyum oranında %5 artış",
        "Günlük adım hedefini 6 gün tutturdu",
        "Su tüketiminde iyileşme",
      ],
      recommendations: [
        "Uyku saatlerini düzenli tutmaya devam edin",
        "Protein alımını %10 artırın",
        "Hafta sonları spor aktivitesini artırın",
      ],
      createdAt: new Date().toISOString(),
    },
  ],
};

// Mock feedback
const mockFeedback: Record<string, ClientFeedback[]> = {
  "client@test.com": [],
};

/**
 * Haftalık rapor oluşturma
 */
export async function generateWeeklyReport(
  clientId: string,
  clientName: string,
  dietitianId: string,
  summary: WeeklyReport["summary"],
  highlights: string[],
  recommendations: string[]
): Promise<WeeklyReport> {
  try {
    const weekStartDate = new Date();
    weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay());

    const report: WeeklyReport = {
      id: `report_${Date.now()}`,
      clientId,
      clientName,
      dietitianId,
      weekStartDate: weekStartDate.toISOString(),
      weekEndDate: new Date().toISOString(),
      summary,
      highlights,
      recommendations,
      createdAt: new Date().toISOString(),
    };

    if (!mockWeeklyReports[dietitianId]) {
      mockWeeklyReports[dietitianId] = [];
    }

    mockWeeklyReports[dietitianId].push(report);
    return report;
  } catch (error) {
    console.error("Failed to generate weekly report:", error);
    throw error;
  }
}

/**
 * Diyetisyenin raporlarını görmesi
 */
export async function getDietitianReports(dietitianId: string): Promise<WeeklyReport[]> {
  try {
    return mockWeeklyReports[dietitianId] || [];
  } catch (error) {
    console.error("Failed to get reports:", error);
    return [];
  }
}

/**
 * Danışanın raporlarını görmesi
 */
export async function getClientReports(clientId: string): Promise<WeeklyReport[]> {
  try {
    const allReports = Object.values(mockWeeklyReports).flat();
    return allReports.filter((r) => r.clientId === clientId);
  } catch (error) {
    console.error("Failed to get client reports:", error);
    return [];
  }
}

/**
 * Raporu PDF olarak oluşturma (mock)
 */
export async function generateReportPDF(report: WeeklyReport): Promise<string> {
  try {
    // Mock PDF content
    const pdfContent = `
HAFTALIK SAĞLIK RAPORU
${report.clientName}

Rapor Tarihi: ${new Date(report.createdAt).toLocaleDateString("tr-TR")}
Hafta: ${new Date(report.weekStartDate).toLocaleDateString("tr-TR")} - ${new Date(report.weekEndDate).toLocaleDateString("tr-TR")}

---

ÖZET
Toplam Öğün: ${report.summary.totalMeals}
Spor Aktiviteleri: ${report.summary.totalActivities}
Uyum Oranı: ${report.summary.averageAdherence}%

Kalori Tüketimi: ${report.summary.caloriesConsumed} kcal
Kalori Yakımı: ${report.summary.caloriesBurned} kcal
Denge: ${report.summary.caloriesBurned - report.summary.caloriesConsumed} kcal

Ortalama Adımlar: ${report.summary.averageSteps}
Ortalama Uyku: ${report.summary.averageSleep} saat
Su Tüketimi: ${report.summary.waterIntake} ml

---

BAŞARILAR
${report.highlights.map((h) => `• ${h}`).join("\n")}

---

ÖNERİLER
${report.recommendations.map((r) => `• ${r}`).join("\n")}

---

Diyetisyen: ${report.dietitianId}
    `;

    return pdfContent;
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    throw error;
  }
}

/**
 * Raporu danışana gönderme (mock)
 */
export async function sendReportToClient(
  report: WeeklyReport,
  clientEmail: string
): Promise<void> {
  try {
    // Mock email sending
    const updatedReport = {
      ...report,
      sentAt: new Date().toISOString(),
    };

    if (!mockWeeklyReports[report.dietitianId]) {
      mockWeeklyReports[report.dietitianId] = [];
    }

    const index = mockWeeklyReports[report.dietitianId].findIndex((r) => r.id === report.id);
    if (index >= 0) {
      mockWeeklyReports[report.dietitianId][index] = updatedReport;
    }

    console.log(`Report sent to ${clientEmail}`);
  } catch (error) {
    console.error("Failed to send report:", error);
    throw error;
  }
}

/**
 * Danışan geri bildirimi ekleme
 */
export async function addClientFeedback(
  clientId: string,
  clientName: string,
  dietitianId: string,
  recommendationId: string,
  feedbackType: ClientFeedback["feedbackType"],
  message?: string
): Promise<ClientFeedback> {
  try {
    const feedback: ClientFeedback = {
      id: `feedback_${Date.now()}`,
      clientId,
      clientName,
      dietitianId,
      recommendationId,
      feedbackType,
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
 * Diyetisyenin danışan geri bildirimlerini görmesi
 */
export async function getDietitianFeedback(
  dietitianId: string
): Promise<ClientFeedback[]> {
  try {
    const allFeedback = Object.values(mockFeedback).flat();
    return allFeedback.filter((f) => f.dietitianId === dietitianId);
  } catch (error) {
    console.error("Failed to get feedback:", error);
    return [];
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
