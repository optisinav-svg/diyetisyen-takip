// Data export service for CSV and JSON formats
import * as s3Storage from "./s3Storage";

/**
 * Convert meals data to CSV format
 */
export function mealsToCSV(meals: any[]): string {
  const headers = ["Tarih", "Öğün Tipi", "Açıklama", "Kalori", "Protein (g)", "Karbonhidrat (g)", "Yağ (g)"];
  const rows = meals.map((meal) => [
    new Date(meal.eatenAt).toLocaleDateString("tr-TR"),
    meal.mealType || "Bilinmiyor",
    meal.description || "",
    meal.calories || 0,
    meal.protein || 0,
    meal.carbs || 0,
    meal.fat || 0,
  ]);

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\\n");
  return csv;
}

/**
 * Convert meals data to JSON format
 */
export function mealsToJSON(meals: any[]): string {
  const data = {
    type: "meals",
    generatedAt: new Date().toISOString(),
    totalMeals: meals.length,
    meals: meals.map((meal) => ({
      id: meal.id,
      date: new Date(meal.eatenAt).toLocaleDateString("tr-TR"),
      mealType: meal.mealType,
      description: meal.description,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      notes: meal.notes,
    })),
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Convert measurements data to CSV format
 */
export function measurementsToCSV(measurements: any[]): string {
  const headers = ["Tarih", "Boy (cm)", "Kilo (kg)", "Yağ Oranı (%)", "Kas Kütlesi (kg)", "Bel Çevresi (cm)"];
  const rows = measurements.map((m) => [
    new Date(m.createdAt).toLocaleDateString("tr-TR"),
    m.height || 0,
    m.weight || 0,
    m.bodyFatPercentage || 0,
    m.muscleMass || 0,
    m.waistCircumference || 0,
  ]);

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\\n");
  return csv;
}

/**
 * Convert measurements data to JSON format
 */
export function measurementsToJSON(measurements: any[]): string {
  const data = {
    type: "measurements",
    generatedAt: new Date().toISOString(),
    totalMeasurements: measurements.length,
    measurements: measurements.map((m) => ({
      id: m.id,
      date: new Date(m.createdAt).toLocaleDateString("tr-TR"),
      height: m.height,
      weight: m.weight,
      bodyFatPercentage: m.bodyFatPercentage,
      muscleMass: m.muscleMass,
      waistCircumference: m.waistCircumference,
      notes: m.notes,
    })),
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Convert report data to CSV format
 */
export function reportToCSV(report: any): string {
  const headers = ["Metrik", "Değer"];
  const rows = [
    ["Rapor Türü", report.type || "Bilinmiyor"],
    ["Dönem", report.period || "Bilinmiyor"],
    ["Oluşturulma Tarihi", new Date(report.generatedAt).toLocaleDateString("tr-TR")],
    ["Toplam Öğün", report.totalMeals || 0],
    ["Toplam Ölçüm", report.totalMeasurements || 0],
    ["Ortalama Kalori", report.averageCalories || 0],
    ["Ağırlık Değişimi (kg)", report.weightChange || 0],
  ];

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\\n");
  return csv;
}

/**
 * Convert report data to JSON format
 */
export function reportToJSON(report: any): string {
  const data = {
    type: report.type,
    period: report.period,
    generatedAt: new Date().toISOString(),
    summary: {
      totalMeals: report.totalMeals || 0,
      totalMeasurements: report.totalMeasurements || 0,
      averageCalories: report.averageCalories || 0,
      averageProtein: report.averageProtein || 0,
      weightChange: report.weightChange || 0,
      achievements: report.achievements || [],
    },
    details: report.details || {},
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Generate client meal report
 */
export async function generateClientMealReport(
  clientUserId: number,
  startDate: Date,
  endDate: Date,
  format: "csv" | "json" = "csv"
): Promise<{ success: boolean; data?: string; s3Url?: string; error?: string }> {
  try {
    // In production, this would query the database for meals
    const meals = [
      {
        id: 1,
        eatenAt: startDate,
        mealType: "Kahvaltı",
        description: "Yumurta ve ekmek",
        calories: 350,
        protein: 15,
        carbs: 40,
        fat: 12,
      },
      {
        id: 2,
        eatenAt: new Date(startDate.getTime() + 24 * 60 * 60 * 1000),
        mealType: "Öğle",
        description: "Tavuk ve pirinç",
        calories: 450,
        protein: 35,
        carbs: 50,
        fat: 10,
      },
    ];

    const data = format === "csv" ? mealsToCSV(meals) : mealsToJSON(meals);

    // Upload to S3
    const s3Result = await s3Storage.uploadMealReportToS3(clientUserId, data, format);
    if (s3Result.success && s3Result.url) {
      console.log(`Meal report uploaded to S3: ${s3Result.url}`);
    }

    return { success: true, data, s3Url: s3Result.url };
  } catch (error) {
    console.error("Generate meal report error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate report",
    };
  }
}

/**
 * Generate client measurements report
 */
export async function generateClientMeasurementsReport(
  clientUserId: number,
  startDate: Date,
  endDate: Date,
  format: "csv" | "json" = "csv"
): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    // In production, this would query the database for measurements
    const measurements = [
      {
        id: 1,
        createdAt: startDate,
        height: 175,
        weight: 75,
        bodyFatPercentage: 22,
        muscleMass: 58,
        waistCircumference: 85,
      },
      {
        id: 2,
        createdAt: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        height: 175,
        weight: 74.5,
        bodyFatPercentage: 21.8,
        muscleMass: 58.2,
        waistCircumference: 84.5,
      },
    ];

    const data = format === "csv" ? measurementsToCSV(measurements) : measurementsToJSON(measurements);

    return { success: true, data };
  } catch (error) {
    console.error("Generate measurements report error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate report",
    };
  }
}

/**
 * Generate dietitian monthly income report
 */
export async function generateDietitianIncomeReport(
  dietitianUserId: number,
  month: Date,
  format: "csv" | "json" = "csv"
): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    // In production, this would query the database for payments
    const report = {
      type: "Aylık Gelir Raporu",
      period: month.toLocaleDateString("tr-TR", { month: "long", year: "numeric" }),
      generatedAt: new Date(),
      totalMeals: 45,
      totalMeasurements: 8,
      averageCalories: 2100,
      averageProtein: 120,
      weightChange: -2.5,
      achievements: ["7 gün tutarlılık", "Hedef ağırlığa ulaştı"],
    };

    const data = format === "csv" ? reportToCSV(report) : reportToJSON(report);

    return { success: true, data };
  } catch (error) {
    console.error("Generate income report error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate report",
    };
  }
}

/**
 * Generate client performance report
 */
export async function generateClientPerformanceReport(
  clientUserId: number,
  month: Date,
  format: "csv" | "json" = "csv"
): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    // In production, this would query the database for performance metrics
    const report = {
      type: "Danışan Performans Raporu",
      period: month.toLocaleDateString("tr-TR", { month: "long", year: "numeric" }),
      generatedAt: new Date(),
      totalMeals: 45,
      totalMeasurements: 8,
      averageCalories: 2100,
      averageProtein: 120,
      weightChange: -2.5,
      achievements: ["7 gün tutarlılık", "Hedef ağırlığa ulaştı"],
    };

    const data = format === "csv" ? reportToCSV(report) : reportToJSON(report);

    return { success: true, data };
  } catch (error) {
    console.error("Generate performance report error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate report",
    };
  }
}

/**
 * Export all user data (GDPR compliance)
 */
export async function exportAllUserData(
  userId: number,
  format: "csv" | "json" = "json"
): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    // In production, this would query all user data from the database
    const userData = {
      userId,
      exportedAt: new Date().toISOString(),
      profile: {
        name: "User Name",
        email: "user@example.com",
        role: "client",
      },
      meals: [],
      measurements: [],
      appointments: [],
      messages: [],
      achievements: [],
    };

    const data = JSON.stringify(userData, null, 2);

    return { success: true, data };
  } catch (error) {
    console.error("Export all user data error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to export data",
    };
  }
}
