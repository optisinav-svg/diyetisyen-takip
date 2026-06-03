export interface TrendDataPoint {
  date: string;
  value: number;
  label: string;
}

export interface TrendAnalysis {
  dataType: string;
  currentValue: number;
  previousValue: number;
  change: number;
  changePercent: number;
  trend: "up" | "down" | "stable";
  average: number;
  min: number;
  max: number;
  dataPoints: TrendDataPoint[];
}

// Mock trend data
const mockTrendData: Record<string, TrendDataPoint[]> = {
  weight: [
    { date: "2026-04-28", value: 82, label: "Pzr" },
    { date: "2026-04-29", value: 81.8, label: "Pzt" },
    { date: "2026-04-30", value: 81.5, label: "Sal" },
    { date: "2026-05-01", value: 81.3, label: "Çar" },
    { date: "2026-05-02", value: 81.2, label: "Per" },
    { date: "2026-05-03", value: 81, label: "Cum" },
    { date: "2026-05-04", value: 80.8, label: "Cmt" },
    { date: "2026-05-05", value: 80.5, label: "Pzr" },
  ],
  steps: [
    { date: "2026-04-28", value: 8500, label: "Pzr" },
    { date: "2026-04-29", value: 9200, label: "Pzt" },
    { date: "2026-04-30", value: 10100, label: "Sal" },
    { date: "2026-05-01", value: 9800, label: "Çar" },
    { date: "2026-05-02", value: 11200, label: "Per" },
    { date: "2026-05-03", value: 10500, label: "Cum" },
    { date: "2026-05-04", value: 9900, label: "Cmt" },
    { date: "2026-05-05", value: 10800, label: "Pzr" },
  ],
  heartRate: [
    { date: "2026-04-28", value: 72, label: "Pzr" },
    { date: "2026-04-29", value: 70, label: "Pzt" },
    { date: "2026-04-30", value: 68, label: "Sal" },
    { date: "2026-05-01", value: 69, label: "Çar" },
    { date: "2026-05-02", value: 67, label: "Per" },
    { date: "2026-05-03", value: 68, label: "Cum" },
    { date: "2026-05-04", value: 66, label: "Cmt" },
    { date: "2026-05-05", value: 65, label: "Pzr" },
  ],
  sleep: [
    { date: "2026-04-28", value: 6.5, label: "Pzr" },
    { date: "2026-04-29", value: 7, label: "Pzt" },
    { date: "2026-04-30", value: 7.5, label: "Sal" },
    { date: "2026-05-01", value: 7, label: "Çar" },
    { date: "2026-05-02", value: 8, label: "Per" },
    { date: "2026-05-03", value: 7.5, label: "Cum" },
    { date: "2026-05-04", value: 8.5, label: "Cmt" },
    { date: "2026-05-05", value: 8, label: "Pzr" },
  ],
  calories: [
    { date: "2026-04-28", value: 2100, label: "Pzr" },
    { date: "2026-04-29", value: 2200, label: "Pzt" },
    { date: "2026-04-30", value: 2050, label: "Sal" },
    { date: "2026-05-01", value: 2150, label: "Çar" },
    { date: "2026-05-02", value: 2000, label: "Per" },
    { date: "2026-05-03", value: 2100, label: "Cum" },
    { date: "2026-05-04", value: 2050, label: "Cmt" },
    { date: "2026-05-05", value: 2200, label: "Pzr" },
  ],
};

/**
 * Sağlık trend verilerini al
 */
export async function getHealthTrendData(
  dataType: string,
  days: number = 7
): Promise<TrendDataPoint[]> {
  try {
    const data = mockTrendData[dataType] || [];
    return data.slice(-days);
  } catch (error) {
    console.error("Failed to get trend data:", error);
    return [];
  }
}

/**
 * Trend analizi yap
 */
export async function analyzeTrend(dataType: string): Promise<TrendAnalysis> {
  try {
    const data = mockTrendData[dataType] || [];

    if (data.length === 0) {
      return {
        dataType,
        currentValue: 0,
        previousValue: 0,
        change: 0,
        changePercent: 0,
        trend: "stable",
        average: 0,
        min: 0,
        max: 0,
        dataPoints: [],
      };
    }

    const values = data.map((d) => d.value);
    const currentValue = values[values.length - 1];
    const previousValue = values.length > 1 ? values[values.length - 2] : currentValue;
    const change = currentValue - previousValue;
    const changePercent = previousValue !== 0 ? (change / previousValue) * 100 : 0;
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Trend belirleme
    let trend: "up" | "down" | "stable" = "stable";
    if (dataType === "weight" || dataType === "heartRate") {
      // Kilo ve kalp atış hızı için düşüş iyi
      trend = change < -0.5 ? "down" : change > 0.5 ? "up" : "stable";
    } else {
      // Diğer metrikler için artış iyi
      trend = change > 0.5 ? "up" : change < -0.5 ? "down" : "stable";
    }

    return {
      dataType,
      currentValue,
      previousValue,
      change,
      changePercent,
      trend,
      average,
      min,
      max,
      dataPoints: data,
    };
  } catch (error) {
    console.error("Failed to analyze trend:", error);
    return {
      dataType,
      currentValue: 0,
      previousValue: 0,
      change: 0,
      changePercent: 0,
      trend: "stable",
      average: 0,
      min: 0,
      max: 0,
      dataPoints: [],
    };
  }
}

/**
 * Haftalık karşılaştırma
 */
export async function getWeeklyComparison(
  dataType: string
): Promise<{
  currentWeek: number;
  previousWeek: number;
  change: number;
  changePercent: number;
}> {
  try {
    const data = mockTrendData[dataType] || [];

    if (data.length < 7) {
      return {
        currentWeek: 0,
        previousWeek: 0,
        change: 0,
        changePercent: 0,
      };
    }

    const currentWeek = data
      .slice(-7)
      .reduce((sum, d) => sum + d.value, 0) / 7;
    const previousWeek = data
      .slice(-14, -7)
      .reduce((sum, d) => sum + d.value, 0) / 7;
    const change = currentWeek - previousWeek;
    const changePercent = previousWeek !== 0 ? (change / previousWeek) * 100 : 0;

    return {
      currentWeek,
      previousWeek,
      change,
      changePercent,
    };
  } catch (error) {
    console.error("Failed to get weekly comparison:", error);
    return {
      currentWeek: 0,
      previousWeek: 0,
      change: 0,
      changePercent: 0,
    };
  }
}

/**
 * Trend tahmini (basit linear regression)
 */
export async function predictTrend(
  dataType: string,
  daysAhead: number = 7
): Promise<TrendDataPoint[]> {
  try {
    const data = mockTrendData[dataType] || [];

    if (data.length < 2) {
      return [];
    }

    const values = data.map((d) => d.value);
    const n = values.length;

    // Linear regression
    let sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumX2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Tahmin yap
    const predictions: TrendDataPoint[] = [];
    const lastDate = new Date(data[data.length - 1].date);

    for (let i = 1; i <= daysAhead; i++) {
      const predictedValue = intercept + slope * (n + i - 1);
      const futureDate = new Date(lastDate);
      futureDate.setDate(futureDate.getDate() + i);

      predictions.push({
        date: futureDate.toISOString().split("T")[0],
        value: Math.round(predictedValue * 10) / 10,
        label: ["Pzr", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"][futureDate.getDay()],
      });
    }

    return predictions;
  } catch (error) {
    console.error("Failed to predict trend:", error);
    return [];
  }
}

/**
 * Tüm metrikler için trend analizi
 */
export async function getAllTrendAnalysis(): Promise<Record<string, TrendAnalysis>> {
  try {
    const metrics = ["weight", "steps", "heartRate", "sleep", "calories"];
    const analysis: Record<string, TrendAnalysis> = {};

    for (const metric of metrics) {
      analysis[metric] = await analyzeTrend(metric);
    }

    return analysis;
  } catch (error) {
    console.error("Failed to get all trend analysis:", error);
    return {};
  }
}
