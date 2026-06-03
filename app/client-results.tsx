import { ScrollView, Text, View, TouchableOpacity, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useEffect, useState } from "react";
import { getUserRegistration } from "@/lib/_core/user-registration";
import {
  getClientResults,
  getAllClientsResults,
  getClientGoals,
  getClientHealthMetrics,
  type ClientActivitySummary,
  type ClientGoalProgress,
  type ClientHealthMetrics,
} from "@/lib/_core/client-results";

export default function ClientResultsScreen() {
  const router = useRouter();
  const colors = useColors();
  const params = useLocalSearchParams();
  const clientId = params.clientId as string;

  const [user, setUser] = useState<any>(null);
  const [clientResult, setClientResult] = useState<ClientActivitySummary | null>(null);
  const [clientGoals, setClientGoals] = useState<ClientGoalProgress[]>([]);
  const [clientMetrics, setClientMetrics] = useState<ClientHealthMetrics | null>(null);
  const [allClientsResults, setAllClientsResults] = useState<ClientActivitySummary[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(clientId || null);
  const [activeTab, setActiveTab] = useState<"overview" | "goals" | "metrics">("overview");

  useEffect(() => {
    loadData();
  }, [selectedClient]);

  const loadData = async () => {
    try {
      const userData = await getUserRegistration();
      setUser(userData);

      if (userData?.role === "dietitian") {
        // Diyetisyen tüm danışanlarını görebilir
        const results = await getAllClientsResults(userData.email);
        setAllClientsResults(results);

        if (selectedClient) {
          const result = await getClientResults(userData.email, selectedClient);
          setClientResult(result);

          const goals = await getClientGoals(selectedClient);
          setClientGoals(goals);

          const metrics = await getClientHealthMetrics(selectedClient);
          setClientMetrics(metrics);
        }
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on_track":
        return "#10B981";
      case "at_risk":
        return "#F59E0B";
      case "behind":
        return "#EF4444";
      default:
        return colors.muted;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "on_track":
        return "Yolda";
      case "at_risk":
        return "Risk Altında";
      case "behind":
        return "Geride";
      default:
        return "Bilinmiyor";
    }
  };

  if (!user || user.role !== "dietitian") {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <Text style={{ color: colors.foreground }}>Erişim reddedildi</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-3xl font-bold text-foreground">📊 Danışan Sonuçları</Text>
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

          {/* Client Selector */}
          {allClientsResults.length > 0 && (
            <View className="gap-2">
              <Text style={{ fontSize: 12, color: colors.muted, fontWeight: "600" }}>
                Danışan Seç
              </Text>
              <FlatList
                data={allClientsResults}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.clientId}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => setSelectedClient(item.clientId)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      marginRight: 8,
                      backgroundColor:
                        selectedClient === item.clientId ? colors.primary : colors.surface,
                      borderWidth: 1,
                      borderColor:
                        selectedClient === item.clientId ? colors.primary : colors.border,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          selectedClient === item.clientId ? "#fff" : colors.foreground,
                        fontWeight: "600",
                        fontSize: 12,
                      }}
                    >
                      {item.clientName}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          {selectedClient && clientResult && (
            <>
              {/* Tab Navigation */}
              <View className="flex-row gap-2 border-b" style={{ borderBottomColor: colors.border }}>
                {(["overview", "goals", "metrics"] as const).map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => setActiveTab(tab)}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderBottomWidth: activeTab === tab ? 2 : 0,
                      borderBottomColor: activeTab === tab ? colors.primary : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        color: activeTab === tab ? colors.primary : colors.muted,
                        fontWeight: activeTab === tab ? "600" : "400",
                        fontSize: 12,
                      }}
                    >
                      {tab === "overview" ? "Özet" : tab === "goals" ? "Hedefler" : "Metrikler"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Overview Tab */}
              {activeTab === "overview" && (
                <View className="gap-3">
                  {/* Adherence Card */}
                  <View
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 12,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                        📈 Uyum Oranı
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "700",
                          color: colors.primary,
                        }}
                      >
                        {clientResult.adherenceRate}%
                      </Text>
                    </View>
                    <View
                      style={{
                        height: 8,
                        backgroundColor: colors.background,
                        borderRadius: 4,
                        overflow: "hidden",
                      }}
                    >
                      <View
                        style={{
                          height: "100%",
                          width: `${clientResult.adherenceRate}%`,
                          backgroundColor: colors.primary,
                        }}
                      />
                    </View>
                  </View>

                  {/* Activity Stats */}
                  <View className="gap-2">
                    <Text style={{ fontSize: 12, color: colors.muted, fontWeight: "600" }}>
                      Bugünkü Aktiviteler
                    </Text>

                    <View className="flex-row gap-2">
                      <View
                        style={{
                          flex: 1,
                          backgroundColor: colors.surface,
                          borderRadius: 8,
                          padding: 10,
                          borderWidth: 1,
                          borderColor: colors.border,
                        }}
                      >
                        <Text style={{ fontSize: 10, color: colors.muted }}>Öğün</Text>
                        <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>
                          {clientResult.mealsLogged}
                        </Text>
                      </View>

                      <View
                        style={{
                          flex: 1,
                          backgroundColor: colors.surface,
                          borderRadius: 8,
                          padding: 10,
                          borderWidth: 1,
                          borderColor: colors.border,
                        }}
                      >
                        <Text style={{ fontSize: 10, color: colors.muted }}>Aktivite</Text>
                        <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>
                          {clientResult.activitiesLogged}
                        </Text>
                      </View>

                      <View
                        style={{
                          flex: 1,
                          backgroundColor: colors.surface,
                          borderRadius: 8,
                          padding: 10,
                          borderWidth: 1,
                          borderColor: colors.border,
                        }}
                      >
                        <Text style={{ fontSize: 10, color: colors.muted }}>Su (ml)</Text>
                        <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>
                          {clientResult.waterIntake}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Health Stats */}
                  <View className="gap-2">
                    <View className="flex-row gap-2">
                      <View
                        style={{
                          flex: 1,
                          backgroundColor: colors.surface,
                          borderRadius: 8,
                          padding: 10,
                          borderWidth: 1,
                          borderColor: colors.border,
                        }}
                      >
                        <Text style={{ fontSize: 10, color: colors.muted }}>Adımlar</Text>
                        <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground }}>
                          {clientResult.stepsCount}
                        </Text>
                      </View>

                      <View
                        style={{
                          flex: 1,
                          backgroundColor: colors.surface,
                          borderRadius: 8,
                          padding: 10,
                          borderWidth: 1,
                          borderColor: colors.border,
                        }}
                      >
                        <Text style={{ fontSize: 10, color: colors.muted }}>Uyku (s)</Text>
                        <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground }}>
                          {clientResult.sleepHours}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Calorie Balance */}
                  <View
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 12,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
                      🔥 Kalori Dengesi
                    </Text>
                    <View className="flex-row gap-2">
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 10, color: colors.muted }}>Tüketilen</Text>
                        <Text style={{ fontSize: 14, fontWeight: "700", color: "#EF4444" }}>
                          {clientResult.caloriesConsumed} kcal
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 10, color: colors.muted }}>Yakılan</Text>
                        <Text style={{ fontSize: 14, fontWeight: "700", color: "#10B981" }}>
                          {clientResult.caloriesBurned} kcal
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 10, color: colors.muted }}>Denge</Text>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "700",
                            color:
                              clientResult.caloriesBurned > clientResult.caloriesConsumed
                                ? "#10B981"
                                : "#EF4444",
                          }}
                        >
                          {clientResult.caloriesBurned - clientResult.caloriesConsumed} kcal
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {/* Goals Tab */}
              {activeTab === "goals" && (
                <View className="gap-3">
                  {clientGoals.length > 0 ? (
                    clientGoals.map((goal) => (
                      <View
                        key={goal.goalId}
                        style={{
                          backgroundColor: colors.surface,
                          borderRadius: 12,
                          padding: 12,
                          borderWidth: 1,
                          borderColor: colors.border,
                        }}
                      >
                        <View className="flex-row items-center justify-between mb-2">
                          <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                            {goal.goalName}
                          </Text>
                          <View
                            style={{
                              paddingVertical: 4,
                              paddingHorizontal: 8,
                              borderRadius: 4,
                              backgroundColor: getStatusColor(goal.status),
                            }}
                          >
                            <Text style={{ fontSize: 10, color: "#fff", fontWeight: "600" }}>
                              {getStatusLabel(goal.status)}
                            </Text>
                          </View>
                        </View>

                        <Text style={{ fontSize: 10, color: colors.muted, marginBottom: 6 }}>
                          {goal.currentValue} / {goal.targetValue} {goal.unit}
                        </Text>

                        <View
                          style={{
                            height: 8,
                            backgroundColor: colors.background,
                            borderRadius: 4,
                            overflow: "hidden",
                          }}
                        >
                          <View
                            style={{
                              height: "100%",
                              width: `${Math.min(goal.progress, 100)}%`,
                              backgroundColor: getStatusColor(goal.status),
                            }}
                          />
                        </View>

                        <Text style={{ fontSize: 10, color: colors.muted, marginTop: 6 }}>
                          {goal.progress}% tamamlandı
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={{ textAlign: "center", color: colors.muted }}>
                      Henüz hedef yok
                    </Text>
                  )}
                </View>
              )}

              {/* Metrics Tab */}
              {activeTab === "metrics" && clientMetrics && (
                <View className="gap-3">
                  {/* Weekly Averages */}
                  <View
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 12,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
                      📊 Haftalık Ortalamalar
                    </Text>
                    <View className="gap-2">
                      <View className="flex-row justify-between">
                        <Text style={{ fontSize: 10, color: colors.muted }}>Kalori</Text>
                        <Text style={{ fontSize: 10, fontWeight: "600", color: colors.foreground }}>
                          {clientMetrics.weeklyAverages.calories} kcal
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text style={{ fontSize: 10, color: colors.muted }}>Adımlar</Text>
                        <Text style={{ fontSize: 10, fontWeight: "600", color: colors.foreground }}>
                          {clientMetrics.weeklyAverages.steps}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text style={{ fontSize: 10, color: colors.muted }}>Uyku</Text>
                        <Text style={{ fontSize: 10, fontWeight: "600", color: colors.foreground }}>
                          {clientMetrics.weeklyAverages.sleep}s
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text style={{ fontSize: 10, color: colors.muted }}>Su</Text>
                        <Text style={{ fontSize: 10, fontWeight: "600", color: colors.foreground }}>
                          {clientMetrics.weeklyAverages.water}ml
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Trends */}
                  <View
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 12,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
                      📈 Trendler
                    </Text>
                    <View className="gap-2">
                      <View className="flex-row justify-between">
                        <Text style={{ fontSize: 10, color: colors.muted }}>Kalori</Text>
                        <Text style={{ fontSize: 10, fontWeight: "600", color: colors.foreground }}>
                          {clientMetrics.trends.caloriesTrend === "up" ? "📈" : clientMetrics.trends.caloriesTrend === "down" ? "📉" : "➡️"}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text style={{ fontSize: 10, color: colors.muted }}>Adımlar</Text>
                        <Text style={{ fontSize: 10, fontWeight: "600", color: colors.foreground }}>
                          {clientMetrics.trends.stepsTrend === "up" ? "📈" : clientMetrics.trends.stepsTrend === "down" ? "📉" : "➡️"}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text style={{ fontSize: 10, color: colors.muted }}>Uyku</Text>
                        <Text style={{ fontSize: 10, fontWeight: "600", color: colors.foreground }}>
                          {clientMetrics.trends.sleepTrend === "up" ? "📈" : clientMetrics.trends.sleepTrend === "down" ? "📉" : "➡️"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Adherence Comparison */}
                  <View
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 12,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
                      📊 Uyum Karşılaştırması
                    </Text>
                    <View className="gap-2">
                      <View>
                        <View className="flex-row justify-between mb-1">
                          <Text style={{ fontSize: 10, color: colors.muted }}>Geçen Hafta</Text>
                          <Text style={{ fontSize: 10, fontWeight: "600", color: colors.foreground }}>
                            {clientMetrics.lastWeekAdherence}%
                          </Text>
                        </View>
                        <View
                          style={{
                            height: 6,
                            backgroundColor: colors.background,
                            borderRadius: 3,
                            overflow: "hidden",
                          }}
                        >
                          <View
                            style={{
                              height: "100%",
                              width: `${clientMetrics.lastWeekAdherence}%`,
                              backgroundColor: colors.primary,
                            }}
                          />
                        </View>
                      </View>

                      <View>
                        <View className="flex-row justify-between mb-1">
                          <Text style={{ fontSize: 10, color: colors.muted }}>Bu Hafta</Text>
                          <Text style={{ fontSize: 10, fontWeight: "600", color: colors.foreground }}>
                            {clientMetrics.thisWeekAdherence}%
                          </Text>
                        </View>
                        <View
                          style={{
                            height: 6,
                            backgroundColor: colors.background,
                            borderRadius: 3,
                            overflow: "hidden",
                          }}
                        >
                          <View
                            style={{
                              height: "100%",
                              width: `${clientMetrics.thisWeekAdherence}%`,
                              backgroundColor:
                                clientMetrics.thisWeekAdherence > clientMetrics.lastWeekAdherence
                                  ? "#10B981"
                                  : "#EF4444",
                            }}
                          />
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Recommendations */}
                  {clientMetrics.recommendations.length > 0 && (
                    <View
                      style={{
                        backgroundColor: colors.surface,
                        borderRadius: 12,
                        padding: 12,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
                        💡 Öneriler
                      </Text>
                      {clientMetrics.recommendations.map((rec, index) => (
                        <Text
                          key={index}
                          style={{
                            fontSize: 10,
                            color: colors.muted,
                            marginBottom: index < clientMetrics.recommendations.length - 1 ? 6 : 0,
                          }}
                        >
                          • {rec}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
