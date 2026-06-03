import { ActivityIndicator, ScrollView, Text, View, Pressable, FlatList } from "react-native";
import { useState, useMemo } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { FieldLabel, SectionCard, SectionTitle, Pill } from "@/components/app-ui";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";

interface ClientHealthData {
  id: number;
  name: string;
  email: string;
  lastCheckIn: string;
  adherenceRate: number;
  healthStatus: "good" | "warning" | "critical";
  avgSteps: number;
  avgHeartRate: number;
  avgSleep: number;
  avgCalories: number;
}

export default function DietitianDashboardScreen() {
  const colors = useColors();
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const profileQuery = trpc.profile.me.useQuery(undefined, { enabled: isAuthenticated });

  const role = profileQuery.data?.profile?.role;
  const pairedClients = profileQuery.data?.pairedClients ?? [];

  const [selectedTab, setSelectedTab] = useState<"overview" | "clients" | "analytics">("overview");
  const [selectedMetric, setSelectedMetric] = useState<"adherence" | "steps" | "heartRate" | "sleep">("adherence");

  // Sample health data for clients
  const clientHealthData: ClientHealthData[] = useMemo(() => {
    return pairedClients.slice(0, 3).map((client, index) => ({
      id: client.profile.userId,
      name: client.profile.displayName,
      email: "email@example.com",
      lastCheckIn: index === 0 ? "2 saat önce" : index === 1 ? "1 gün önce" : "3 gün önce",
      adherenceRate: [85, 65, 45][index] || 70,
      healthStatus: (["good", "warning", "critical"] as const)[index] || "good",
      avgSteps: [8234, 6234, 5000][index] || 7000,
      avgHeartRate: [72, 75, 82][index] || 75,
      avgSleep: [7.5, 6.5, 5.5][index] || 7,
      avgCalories: [450, 320, 280][index] || 400,
    }));
  }, [pairedClients]);

  const clientStats = useMemo(() => {
    return pairedClients.map((client) => ({
      id: client.profile.userId,
      name: client.profile.displayName,
    }));
  }, [pairedClients]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "#22C55E";
      case "warning":
        return "#F59E0B";
      case "critical":
        return "#EF4444";
      default:
        return colors.muted;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "good":
        return "✓ İyi";
      case "warning":
        return "⚠️ Uyarı";
      case "critical":
        return "🔴 Kritik";
      default:
        return "Bilinmiyor";
    }
  };

  const getMetricValue = (client: ClientHealthData, metric: string) => {
    switch (metric) {
      case "adherence":
        return `${client.adherenceRate}%`;
      case "steps":
        return `${client.avgSteps}`;
      case "heartRate":
        return `${client.avgHeartRate} bpm`;
      case "sleep":
        return `${client.avgSleep}h`;
      default:
        return "-";
    }
  };

  const handleClientPress = (clientId: number) => {
    // Navigate to client detail screen
    console.log('View client details:', clientId);
  };

  const renderClientCard = ({ item }: { item: ClientHealthData }) => (
    <Pressable
      onPress={() => handleClientPress(item.id)}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.7 : 1,
          marginBottom: 12,
        },
      ]}
    >
      <View className="bg-surface rounded-lg p-4 border border-border">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1">
            <Text className="text-base font-bold text-foreground">{item.name}</Text>
            <Text className="text-xs text-muted mt-1">{item.email}</Text>
          </View>
          <View
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: getStatusColor(item.healthStatus) + "20" }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: getStatusColor(item.healthStatus) }}
            >
              {getStatusLabel(item.healthStatus)}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row gap-3 mb-3 pb-3 border-b border-border">
          <View className="flex-1">
            <Text className="text-xs text-muted mb-1">Uyum Oranı</Text>
            <View className="bg-background rounded h-2 overflow-hidden">
              <View
                className="h-full"
                style={{
                  width: `${item.adherenceRate}%`,
                  backgroundColor: getStatusColor(item.healthStatus),
                }}
              />
            </View>
            <Text className="text-sm font-bold text-foreground mt-1">{item.adherenceRate}%</Text>
          </View>

          <View className="flex-1">
            <Text className="text-xs text-muted mb-1">Son Kontrol</Text>
            <Text className="text-sm font-semibold text-foreground">{item.lastCheckIn}</Text>
          </View>
        </View>

        {/* Health Metrics */}
        <View className="flex-row gap-2 mb-3">
          <View className="flex-1 bg-background rounded p-2">
            <Text className="text-xs text-muted">👣 Adımlar</Text>
            <Text className="text-sm font-bold text-foreground">{item.avgSteps}</Text>
          </View>
          <View className="flex-1 bg-background rounded p-2">
            <Text className="text-xs text-muted">❤️ Kalp</Text>
            <Text className="text-sm font-bold text-foreground">{item.avgHeartRate}</Text>
          </View>
          <View className="flex-1 bg-background rounded p-2">
            <Text className="text-xs text-muted">😴 Uyku</Text>
            <Text className="text-sm font-bold text-foreground">{item.avgSleep}h</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-2">
          <Pressable
            style={({ pressed }) => [
              {
                flex: 1,
                opacity: pressed ? 0.7 : 1,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 6,
                backgroundColor: colors.primary,
              },
            ]}
          >
            <Text className="text-white font-semibold text-xs text-center">Detaylar</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              {
                flex: 1,
                opacity: pressed ? 0.7 : 1,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 6,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              },
            ]}
          >
            <Text className="text-foreground font-semibold text-xs text-center">Mesaj</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );

  if (loading || (isAuthenticated && profileQuery.isLoading)) {
    return (
      <ScreenContainer className="items-center justify-center px-6">
        <ActivityIndicator color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="p-6 justify-center">
        <View className="gap-4">
          <Text className="text-3xl font-bold text-foreground">Dashboard'u görmek için giriş yapın.</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (role !== "dietitian") {
    return (
      <ScreenContainer className="p-6 justify-center">
        <View className="gap-4">
          <Text className="text-3xl font-bold text-foreground">Bu ekran sadece diyetisyenler için.</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="gap-6">
          <SectionTitle title="Diyetisyen Dashboard" subtitle="Danışanlarınız ve sağlık takibi" />

          {/* Tab Navigation */}
          <View className="flex-row gap-2">
            {(["overview", "clients", "analytics"] as const).map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setSelectedTab(tab)}
                style={{
                  flex: 1,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: selectedTab === tab ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: selectedTab === tab ? colors.primary : colors.border,
                  alignItems: "center",
                }}
              >
                <Text
                  className={selectedTab === tab ? "text-white font-semibold text-xs" : "text-foreground font-semibold text-xs"}
                >
                  {tab === "overview" ? "Özet" : tab === "clients" ? "Danışanlar" : "Analizler"}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Overview Tab */}
          {selectedTab === "overview" && (
            <View className="gap-3">
              <SectionCard>
                <View className="gap-4">
                  <View>
                    <Text className="text-xs text-muted mb-1">Toplam Danışan</Text>
                    <Text className="text-3xl font-bold text-foreground">{clientStats.length}</Text>
                  </View>
                  <View className="border-t pt-3" style={{ borderColor: colors.border }}>
                    <Text className="text-xs text-muted mb-1">Ortalama Uyum Oranı</Text>
                    <Text className="text-2xl font-bold text-primary">
                      {clientHealthData.length > 0
                        ? Math.round(clientHealthData.reduce((sum, c) => sum + c.adherenceRate, 0) / clientHealthData.length)
                        : 0}
                      %
                    </Text>
                  </View>
                </View>
              </SectionCard>

              <SectionCard>
                <View className="gap-2">
                  <Text className="font-semibold text-foreground mb-2">Uyarı Gerektiren Danışanlar</Text>
                  {clientHealthData.filter((c) => c.healthStatus !== "good").length > 0 ? (
                    clientHealthData
                      .filter((c) => c.healthStatus !== "good")
                      .map((client) => (
                        <View key={client.id} className="flex-row justify-between items-center pb-2 border-b border-border last:border-b-0">
                          <Text className="text-sm text-foreground font-semibold">{client.name}</Text>
                          <Pill label={getStatusLabel(client.healthStatus)} tone={client.healthStatus === "warning" ? "warning" : "danger"} />
                        </View>
                      ))
                  ) : (
                    <Text className="text-sm text-muted">Tüm danışanlar iyi durumda</Text>
                  )}
                </View>
              </SectionCard>
            </View>
          )}

          {/* Clients Tab */}
          {selectedTab === "clients" && (
            <View className="gap-3">
              {clientHealthData.length === 0 ? (
                <SectionCard>
                  <Text className="text-center text-muted">Henüz danışan eklenmemiş.</Text>
                </SectionCard>
              ) : (
                <FlatList
                  data={clientHealthData}
                  renderItem={renderClientCard}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                />
              )}
            </View>
          )}

          {/* Analytics Tab */}
          {selectedTab === "analytics" && (
            <View className="gap-3">
              <SectionCard>
                <View className="gap-3">
                  <Text className="font-semibold text-foreground">Karşılaştırmalı Metrik</Text>

                  {/* Metric Selector */}
                  <View className="flex-row gap-2 flex-wrap">
                    {(["adherence", "steps", "heartRate", "sleep"] as const).map((metric) => (
                      <Pressable
                        key={metric}
                        onPress={() => setSelectedMetric(metric)}
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 8,
                          backgroundColor: selectedMetric === metric ? colors.primary : colors.background,
                          borderWidth: 1,
                          borderColor: selectedMetric === metric ? colors.primary : colors.border,
                        }}
                      >
                        <Text
                          className={selectedMetric === metric ? "text-white font-semibold text-xs" : "text-foreground font-semibold text-xs"}
                        >
                          {metric === "adherence" && "Uyum"}
                          {metric === "steps" && "👣 Adımlar"}
                          {metric === "heartRate" && "❤️ Kalp"}
                          {metric === "sleep" && "😴 Uyku"}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  {/* Comparison Chart */}
                  <View className="mt-4 gap-2">
                    {clientHealthData.map((client) => (
                      <View key={client.id} className="gap-1">
                        <View className="flex-row justify-between items-center">
                          <Text className="text-sm font-semibold text-foreground flex-1">{client.name}</Text>
                          <Text className="text-sm font-bold text-primary">{getMetricValue(client, selectedMetric)}</Text>
                        </View>
                        <View className="bg-background rounded h-2 overflow-hidden">
                          <View
                            className="h-full"
                            style={{
                              width: `${Math.min(100, (parseInt(getMetricValue(client, selectedMetric)) / 100) * 100)}%`,
                              backgroundColor: getStatusColor(client.healthStatus),
                            }}
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </SectionCard>

              <SectionCard>
                <View className="gap-2">
                  <Text className="font-semibold text-foreground mb-2">Trend Analizi</Text>
                  <Text className="text-sm text-muted">
                    Danışanlarınızın sağlık metrikleri zaman içinde nasıl değiştiğini görmek için detaylı raporları kontrol edin.
                  </Text>
                </View>
              </SectionCard>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
