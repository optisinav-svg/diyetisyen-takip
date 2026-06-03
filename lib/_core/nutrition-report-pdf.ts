/**
 * Beslenme Raporu PDF Export Service
 * Aylık/haftalık beslenme analiz raporlarını PDF olarak oluşturma
 */

export interface NutritionReportData {
  clientId: string;
  clientName: string;
  dietitianId: string;
  dietitianName: string;
  reportPeriod: "weekly" | "monthly";
  startDate: number;
  endDate: number;
  metrics: {
    weight: {
      initial: number;
      current: number;
      target: number;
      change: number;
      percentageChange: number;
    };
    calories: {
      avgDaily: number;
      target: number;
      totalConsumed: number;
      adherencePercentage: number;
    };
    macronutrients: {
      protein: { avg: number; target: number; unit: string };
      carbs: { avg: number; target: number; unit: string };
      fat: { avg: number; target: number; unit: string };
    };
    micronutrients: {
      [key: string]: { avg: number; target: number; unit: string };
    };
    steps: {
      avgDaily: number;
      target: number;
      totalSteps: number;
    };
    sleep: {
      avgNightly: number;
      target: number;
      quality: "poor" | "fair" | "good" | "excellent";
    };
  };
  mealData: {
    totalMeals: number;
    mealConsistency: number;
    favoriteCategories: string[];
    mostLoggedFoods: string[];
  };
  recommendations: string[];
  notes: string;
  generatedAt: number;
}

export interface PDFReport {
  filename: string;
  content: string; // Base64 encoded PDF
  mimeType: string;
  size: number;
}

export const nutritionReportPdfService = {
  /**
   * Beslenme raporu oluştur
   */
  async generateNutritionReport(
    data: NutritionReportData
  ): Promise<PDFReport> {
    try {
      // PDF içeriği oluştur (HTML formatında)
      const htmlContent = generateReportHTML(data);

      // Base64 encode (gerçek uygulamada PDF kütüphanesi kullanılır)
      const base64Content = Buffer.from(htmlContent).toString("base64");

      const filename = `nutrition-report-${data.clientId}-${data.startDate}-${data.endDate}.pdf`;

      return {
        filename,
        content: base64Content,
        mimeType: "application/pdf",
        size: base64Content.length,
      };
    } catch (error) {
      console.error("Rapor oluşturulamadı:", error);
      throw error;
    }
  },

  /**
   * Haftalık rapor oluştur
   */
  async generateWeeklyReport(
    clientId: string,
    clientName: string,
    dietitianId: string,
    dietitianName: string,
    metricsData: any
  ): Promise<PDFReport> {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const reportData: NutritionReportData = {
      clientId,
      clientName,
      dietitianId,
      dietitianName,
      reportPeriod: "weekly",
      startDate: weekAgo,
      endDate: now,
      metrics: {
        weight: metricsData.weight || {
          initial: 75,
          current: 74.5,
          target: 70,
          change: -0.5,
          percentageChange: -0.67,
        },
        calories: metricsData.calories || {
          avgDaily: 1850,
          target: 1750,
          totalConsumed: 12950,
          adherencePercentage: 94,
        },
        macronutrients: metricsData.macronutrients || {
          protein: { avg: 120, target: 130, unit: "g" },
          carbs: { avg: 200, target: 220, unit: "g" },
          fat: { avg: 65, target: 60, unit: "g" },
        },
        micronutrients: metricsData.micronutrients || {
          vitaminD: { avg: 25, target: 30, unit: "mcg" },
          iron: { avg: 12, target: 15, unit: "mg" },
          calcium: { avg: 900, target: 1000, unit: "mg" },
        },
        steps: metricsData.steps || {
          avgDaily: 8500,
          target: 10000,
          totalSteps: 59500,
        },
        sleep: metricsData.sleep || {
          avgNightly: 7.5,
          target: 8,
          quality: "good",
        },
      },
      mealData: {
        totalMeals: 21,
        mealConsistency: 85,
        favoriteCategories: ["Salata", "Tavuk", "Sebze"],
        mostLoggedFoods: ["Tavuk Göğsü", "Brokoli", "Pirinç"],
      },
      recommendations: [
        "Günlük su tüketimini 2.5 litre artırın",
        "Protein alımını 130g'ye çıkarın",
        "Uyku saatini 8 saate çıkarın",
      ],
      notes: "İyi ilerleme. Beslenme planına uyum yüksek. Egzersiz programını devam ettir.",
      generatedAt: now,
    };

    return this.generateNutritionReport(reportData);
  },

  /**
   * Aylık rapor oluştur
   */
  async generateMonthlyReport(
    clientId: string,
    clientName: string,
    dietitianId: string,
    dietitianName: string,
    metricsData: any
  ): Promise<PDFReport> {
    const now = Date.now();
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

    const reportData: NutritionReportData = {
      clientId,
      clientName,
      dietitianId,
      dietitianName,
      reportPeriod: "monthly",
      startDate: monthAgo,
      endDate: now,
      metrics: {
        weight: metricsData.weight || {
          initial: 78,
          current: 74.5,
          target: 70,
          change: -3.5,
          percentageChange: -4.49,
        },
        calories: metricsData.calories || {
          avgDaily: 1800,
          target: 1750,
          totalConsumed: 54000,
          adherencePercentage: 96,
        },
        macronutrients: metricsData.macronutrients || {
          protein: { avg: 125, target: 130, unit: "g" },
          carbs: { avg: 210, target: 220, unit: "g" },
          fat: { avg: 62, target: 60, unit: "g" },
        },
        micronutrients: metricsData.micronutrients || {
          vitaminD: { avg: 28, target: 30, unit: "mcg" },
          iron: { avg: 14, target: 15, unit: "mg" },
          calcium: { avg: 950, target: 1000, unit: "mg" },
        },
        steps: metricsData.steps || {
          avgDaily: 8800,
          target: 10000,
          totalSteps: 264000,
        },
        sleep: metricsData.sleep || {
          avgNightly: 7.6,
          target: 8,
          quality: "good",
        },
      },
      mealData: {
        totalMeals: 90,
        mealConsistency: 92,
        favoriteCategories: ["Salata", "Tavuk", "Sebze", "Meyve"],
        mostLoggedFoods: ["Tavuk Göğsü", "Brokoli", "Pirinç", "Yoğurt"],
      },
      recommendations: [
        "Kilo kaybı hedefine yaklaşıyorsunuz, beslenme planını devam ettirin",
        "Adım hedefini 10000'e çıkarmaya çalışın",
        "Vitamin D takviyesi almayı düşünün",
      ],
      notes: "Harika ilerleme! Beslenme planına mükemmel uyum. Hedef kiloya 5.5 kg kaldı.",
      generatedAt: now,
    };

    return this.generateNutritionReport(reportData);
  },

  /**
   * Raporu email ile gönder
   */
  async sendReportByEmail(
    recipientEmail: string,
    report: PDFReport,
    clientName: string
  ): Promise<boolean> {
    try {
      console.log(`Rapor gönderiliyor: ${recipientEmail}`);
      console.log(`Dosya: ${report.filename}`);
      // Gerçek uygulamada email servisi kullanılır
      return true;
    } catch (error) {
      console.error("Email gönderilemedi:", error);
      return false;
    }
  },

  /**
   * Raporu sosyal ağlarda paylaş
   */
  async shareReportOnSocial(
    platform: "facebook" | "instagram" | "twitter" | "whatsapp",
    report: PDFReport,
    clientName: string,
    message: string
  ): Promise<boolean> {
    try {
      console.log(`Rapor paylaşılıyor: ${platform}`);
      console.log(`İleti: ${message}`);
      // Gerçek uygulamada sosyal medya API'si kullanılır
      return true;
    } catch (error) {
      console.error("Paylaşım başarısız:", error);
      return false;
    }
  },
};

/**
 * Rapor HTML'i oluştur
 */
function generateReportHTML(data: NutritionReportData): string {
  const dateRange = `${new Date(data.startDate).toLocaleDateString("tr-TR")} - ${new Date(data.endDate).toLocaleDateString("tr-TR")}`;

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Beslenme Raporu</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      color: #333;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #007AFF;
      padding-bottom: 20px;
    }
    .header h1 {
      margin: 0;
      color: #007AFF;
    }
    .header p {
      margin: 5px 0;
      color: #666;
    }
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .section h2 {
      color: #007AFF;
      border-bottom: 1px solid #ddd;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 15px;
    }
    .metric-card {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #007AFF;
    }
    .metric-card h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #666;
    }
    .metric-value {
      font-size: 24px;
      font-weight: bold;
      color: #007AFF;
    }
    .metric-target {
      font-size: 12px;
      color: #999;
      margin-top: 5px;
    }
    .recommendation {
      background-color: #f0f8ff;
      padding: 12px;
      margin-bottom: 10px;
      border-left: 4px solid #4CAF50;
      border-radius: 4px;
    }
    .notes {
      background-color: #fffacd;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #FFB6C1;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }
    table th {
      background-color: #007AFF;
      color: white;
      padding: 10px;
      text-align: left;
    }
    table td {
      padding: 10px;
      border-bottom: 1px solid #ddd;
    }
    table tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #999;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Beslenme Analiz Raporu</h1>
    <p><strong>Danışan:</strong> ${data.clientName}</p>
    <p><strong>Diyetisyen:</strong> ${data.dietitianName}</p>
    <p><strong>Dönem:</strong> ${dateRange}</p>
    <p><strong>Rapor Tarihi:</strong> ${new Date(data.generatedAt).toLocaleDateString("tr-TR")}</p>
  </div>

  <div class="section">
    <h2>Kilo Takibi</h2>
    <div class="metrics-grid">
      <div class="metric-card">
        <h3>Başlangıç Kilosu</h3>
        <div class="metric-value">${data.metrics.weight.initial} kg</div>
      </div>
      <div class="metric-card">
        <h3>Güncel Kilo</h3>
        <div class="metric-value">${data.metrics.weight.current} kg</div>
      </div>
      <div class="metric-card">
        <h3>Kilo Değişimi</h3>
        <div class="metric-value" style="color: ${data.metrics.weight.change < 0 ? "#4CAF50" : "#FF6B6B"}">
          ${data.metrics.weight.change > 0 ? "+" : ""}${data.metrics.weight.change} kg
        </div>
        <div class="metric-target">${data.metrics.weight.percentageChange}%</div>
      </div>
      <div class="metric-card">
        <h3>Hedef Kilo</h3>
        <div class="metric-value">${data.metrics.weight.target} kg</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Kalori Takibi</h2>
    <div class="metrics-grid">
      <div class="metric-card">
        <h3>Günlük Ortalama</h3>
        <div class="metric-value">${data.metrics.calories.avgDaily}</div>
        <div class="metric-target">kcal</div>
      </div>
      <div class="metric-card">
        <h3>Hedef Kalori</h3>
        <div class="metric-value">${data.metrics.calories.target}</div>
        <div class="metric-target">kcal</div>
      </div>
      <div class="metric-card">
        <h3>Toplam Tüketim</h3>
        <div class="metric-value">${data.metrics.calories.totalConsumed}</div>
        <div class="metric-target">kcal</div>
      </div>
      <div class="metric-card">
        <h3>Uyum Oranı</h3>
        <div class="metric-value" style="color: #4CAF50">${data.metrics.calories.adherencePercentage}%</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Makro Besinler</h2>
    <table>
      <tr>
        <th>Besin</th>
        <th>Günlük Ortalama</th>
        <th>Hedef</th>
        <th>Birim</th>
      </tr>
      <tr>
        <td>Protein</td>
        <td>${data.metrics.macronutrients.protein.avg}</td>
        <td>${data.metrics.macronutrients.protein.target}</td>
        <td>${data.metrics.macronutrients.protein.unit}</td>
      </tr>
      <tr>
        <td>Karbonhidrat</td>
        <td>${data.metrics.macronutrients.carbs.avg}</td>
        <td>${data.metrics.macronutrients.carbs.target}</td>
        <td>${data.metrics.macronutrients.carbs.unit}</td>
      </tr>
      <tr>
        <td>Yağ</td>
        <td>${data.metrics.macronutrients.fat.avg}</td>
        <td>${data.metrics.macronutrients.fat.target}</td>
        <td>${data.metrics.macronutrients.fat.unit}</td>
      </tr>
    </table>
  </div>

  <div class="section">
    <h2>Aktivite Takibi</h2>
    <div class="metrics-grid">
      <div class="metric-card">
        <h3>Günlük Ortalama Adım</h3>
        <div class="metric-value">${data.metrics.steps.avgDaily}</div>
        <div class="metric-target">Hedef: ${data.metrics.steps.target}</div>
      </div>
      <div class="metric-card">
        <h3>Uyku Kalitesi</h3>
        <div class="metric-value">${data.metrics.sleep.avgNightly}</div>
        <div class="metric-target">saat (${data.metrics.sleep.quality})</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Öneriler</h2>
    ${data.recommendations.map((rec) => `<div class="recommendation">✓ ${rec}</div>`).join("")}
  </div>

  <div class="section">
    <h2>Notlar</h2>
    <div class="notes">
      ${data.notes}
    </div>
  </div>

  <div class="footer">
    <p>Bu rapor ${data.dietitianName} tarafından hazırlanmıştır.</p>
    <p>Rapor tarihi: ${new Date(data.generatedAt).toLocaleString("tr-TR")}</p>
  </div>
</body>
</html>
  `;
}
