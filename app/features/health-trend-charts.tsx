import { BackButton } from "@/components/back-button";
import { ScrollView, Text, View, TouchableOpacity, Dimensions } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useEffect, useState } from "react";
import { getUserRegistration } from "@/lib/_core/user-registration";
import {
  getHealthTrendData,
  analyzeTrend,
  getWeeklyComparison,
  predictTrend,
  getAllTrendAnalysis,
  type TrendAnalysis,
  type TrendDataPoint,
} from "@/lib/_core/health-trend-charts";

export default function HealthTrendChartsScreen() {
  const router = useRouter();
  const colors = useColors();
  const screenWidth = Dimensions.get("window").width;

  const [user, setUser] = useState<any>(null);
  const [selectedMetric, setSelectedMetric] = useState("weight");
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [analysis, setAnalysis] = useState<TrendAnalysis | null>(null);
  const [weeklyComparison, setWeeklyComparison] = useState<any>(null);
  const [predictions, setPredictions] = useState<TrendDataPoint[]>([]);

  const metrics = [
    { id: "weight", label: "Kilo", unit: "kg", icon: "⚖️" },
    { id: "steps", label: "Adımlar", unit: "adım", icon: "👟" },
    { id: "heartRate", label: "Kalp Atış", unit: "bpm", icon: "❤️" },
    { id: "sleep", label: "Uyku", unit: "saat", icon: "😴" },
    { id: "calories", label: "Kalori", unit: "kcal", icon: "🔥" },
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadMetricData();
  }, [selectedMetric]);

  const loadData = async () => {
    try {
      const userData = await getUserRegistration();
      setUser(userData);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const loadMetricData = async () => {
    try {
      const data = await getHealthTrendData(selectedMetric);
      setTrendData(data);

      const trendAnalysis = await analyzeTrend(selectedMetric);
      setAnalysis(trendAnalysis);

      const weekly = await getWeeklyComparison(selectedMetric);
      setWeeklyComparison(weekly);

      const preds = await predictTrend(selectedMetric, 7);
      setPredictions(preds);
    } catch (error) {
      console.error("Failed to load metric data:", error);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return "📈";
      case "down":
        return "📉";
      default:
        return "➡️";
    }
  };

  const getTrendColor = (trend: string, metric: string) => {
    if (metric === "weight" || metric === "heartRate") {
      // Düşüş iyi
      return trend === "down" ? "#10B981" : trend === "up" ? "#EF4444" : "#F59E0B";
    } else {
      // Artış iyi
      return trend === "up" ? "#10B981" : trend === "down" ? "#EF4444" : "#F59E0B";
    }
  };

  const getMetricLabel = (id: string) => {
    const found = metrics.find((m) => m.id === id);
    return found?.label || id;
  };

  const getMetricIcon = (id: string) => {
    const found = metrics.find((m) => m.id === id);
    return found?.icon || "📊";
  };

  const getMetricUnit = (id: string) => {
    const found = metrics.find((m) => m.id === id);
    return found?.unit || "";
  };

  // Simple chart rendering
  const renderChart = () => {
    if (trendData.length === 0) return null;

    const values = trendData.map((d) => d.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue || 1;
    const chartHeight = 150;

    return (
      <View
        style={{
          height: chartHeight + 40,
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 12,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        {/* Y-axis labels */}
        <View style={{ flexDirection: "row", height: chartHeight }}>
          <View style={{ width: 40, justifyContent: "space-between", paddingRight: 8 }}>
            <Text style={{ fontSize: 8, color: colors.muted, textAlign: "right" }}>
              {Math.round(maxValue)}
            </Text>
            <Text style={{ fontSize: 8, color: colors.muted, textAlign: "right" }}>
              {Math.round((maxValue + minValue) / 2)}
            </Text>
            <Text style={{ fontSize: 8, color: colors.muted, textAlign: "right" }}>
              {Math.round(minValue)}
            </Text>
          </View>

          {/* Chart bars */}
          <View style={{ flex: 1, flexDirection: "row", alignItems: "flex-end", gap: 4 }}>
            {trendData.map((point, idx) => {
              const normalizedValue = (point.value - minValue) / range;
              const barHeight = normalizedValue * chartHeight;

              return (
                <View
                  key={idx}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  <View
                    style={{
                      width: "100%",
                      height: Math.max(barHeight, 5),
                      backgroundColor: colors.primary,
                      borderRadius: 4,
                      opacity: 0.7,
                    }}
                  />
                  <Text style={{ fontSize: 7, color: colors.muted, marginTop: 4 }}>
                    {point.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer className="p-6">
      <BackButton />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-3xl font-bold text-foreground">📊 Sağlık Trendleri</Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 6,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.foreground, fontWeight: "600" }}>← Geri</Text>
            </TouchableOpacity>
          </View>

          {/* Metric Selection */}
          <View className="gap-2">
            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
              📈 Metrik Seçin
            </Text>
            <View className="gap-2">
              {metrics.map((metric) => (
                <TouchableOpacity
                  key={metric.id}
                  onPress={() => setSelectedMetric(metric.id)}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    backgroundColor:
                      selectedMetric === metric.id ? colors.primary : colors.surface,
                    borderWidth: 1,
                    borderColor:
                      selectedMetric === metric.id ? colors.primary : colors.border,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{metric.icon}</Text>
                  <Text
                    style={{
                      color: selectedMetric === metric.id ? "#fff" : colors.foreground,
                      fontWeight: "600",
                      flex: 1,
                    }}
                  >
                    {metric.label}
                  </Text>
                  <Text
                    style={{
                      color: selectedMetric === metric.id ? "#fff" : colors.muted,
                      fontSize: 10,
                    }}
                  >
                    ({metric.unit})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Chart */}
          {renderChart()}

          {/* Analysis */}
          {analysis && (
            <View className="gap-3">
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                📉 Analiz
              </Text>

              {/* Current Value */}
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 10, color: colors.muted, marginBottom: 4 }}>
                  Güncel Değer
                </Text>
                <View className="flex-row items-baseline gap-2">
                  <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.primary }}>
                    {analysis.currentValue.toFixed(1)}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.muted }}>
                    {getMetricUnit(selectedMetric)}
                  </Text>
                  <View style={{ flex: 1 }} />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: getTrendColor(analysis.trend, selectedMetric),
                    }}
                  >
                    {getTrendIcon(analysis.trend)} {analysis.changePercent > 0 ? "+" : ""}
                    {analysis.changePercent.toFixed(1)}%
                  </Text>
                </View>
              </View>

              {/* Stats Grid */}
              <View className="gap-2">
                <View className="flex-row gap-2">
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: colors.surface,
                      borderRadius: 12,
                      padding: 10,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 9, color: colors.muted, marginBottom: 4 }}>
                      Ortalama
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: "bold", color: colors.primary }}>
                      {analysis.average.toFixed(1)}
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: colors.surface,
                      borderRadius: 12,
                      padding: 10,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 9, color: colors.muted, marginBottom: 4 }}>
                      En Düşük
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: "bold", color: colors.primary }}>
                      {analysis.min.toFixed(1)}
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: colors.surface,
                      borderRadius: 12,
                      padding: 10,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 9, color: colors.muted, marginBottom: 4 }}>
                      En Yüksek
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: "bold", color: colors.primary }}>
                      {analysis.max.toFixed(1)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Weekly Comparison */}
              {weeklyComparison && (
                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ fontSize: 10, color: colors.muted, marginBottom: 8 }}>
                    📊 Haftalık Karşılaştırma
                  </Text>
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text style={{ fontSize: 9, color: colors.muted }}>Bu Hafta</Text>
                      <Text style={{ fontSize: 14, fontWeight: "bold", color: colors.primary }}>
                        {weeklyComparison.currentWeek.toFixed(1)}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 12, color: colors.muted }}>vs</Text>
                    <View>
                      <Text style={{ fontSize: 9, color: colors.muted }}>Geçen Hafta</Text>
                      <Text style={{ fontSize: 14, fontWeight: "bold", color: colors.muted }}>
                        {weeklyComparison.previousWeek.toFixed(1)}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }} />
                    <View
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        borderRadius: 6,
                        backgroundColor: getTrendColor(
                          weeklyComparison.change > 0 ? "up" : "down",
                          selectedMetric
                        ),
                      }}
                    >
                      <Text style={{ fontSize: 10, color: "#fff", fontWeight: "600" }}>
                        {weeklyComparison.change > 0 ? "+" : ""}
                        {weeklyComparison.changePercent.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Predictions */}
              {predictions.length > 0 && (
                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ fontSize: 10, color: colors.muted, marginBottom: 8 }}>
                    🔮 7 Gün Tahmini
                  </Text>
                  <View className="gap-2">
                    {predictions.slice(0, 3).map((pred, idx) => (
                      <View
                        key={idx}
                        className="flex-row items-center justify-between"
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 8,
                          backgroundColor: colors.background,
                          borderRadius: 6,
                        }}
                      >
                        <Text style={{ fontSize: 9, color: colors.muted }}>
                          {new Date(pred.date).toLocaleDateString("tr-TR", {
                            month: "short",
                            day: "numeric",
                          })}
                        </Text>
                        <Text style={{ fontSize: 11, fontWeight: "600", color: colors.primary }}>
                          {pred.value.toFixed(1)} {getMetricUnit(selectedMetric)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
