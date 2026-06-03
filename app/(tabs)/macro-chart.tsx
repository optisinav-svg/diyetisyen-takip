import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useState, useEffect, useMemo } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { FieldLabel, SectionCard, SectionTitle, Pill } from "@/components/app-ui";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { startOAuthLogin } from "@/constants/oauth";

export default function MacroChartScreen() {
  const colors = useColors();
  const { isAuthenticated, loading } = useAuth();
  const profileQuery = trpc.profile.me.useQuery(undefined, { enabled: isAuthenticated });

  const role = profileQuery.data?.profile?.role;
  const pairedClients = profileQuery.data?.pairedClients ?? [];

  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedClientId && pairedClients[0]?.profile?.userId) {
      setSelectedClientId(pairedClients[0].profile.userId);
    }
  }, [pairedClients, selectedClientId]);

  const mealsQuery = trpc.meals.list.useQuery(
    { clientUserId: selectedClientId ?? undefined },
    { enabled: isAuthenticated && (role === "client" || !!selectedClientId) },
  );

  const macroStats = useMemo(() => {
    const meals = mealsQuery.data ?? [];
    const today = new Date().toDateString();

    const todayMeals = meals.filter(
      (meal) => new Date(meal.createdAt).toDateString() === today
    );

    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    todayMeals.forEach((meal) => {
      // Analysis data would come from mealAnalysis query
      // For now, use placeholder
    });

    const total = totalProtein + totalCarbs + totalFat;
    const proteinPercent = total > 0 ? (totalProtein / total) * 100 : 0;
    const carbsPercent = total > 0 ? (totalCarbs / total) * 100 : 0;
    const fatPercent = total > 0 ? (totalFat / total) * 100 : 0;

    return {
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      proteinPercent,
      carbsPercent,
      fatPercent,
      total,
    };
  }, [mealsQuery.data]);

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
          <Text className="text-3xl font-bold text-foreground">Makro grafiğini görmek için giriş yapın.</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="gap-6">
          <SectionTitle title="Makro Dağılımı" subtitle="Bugünün protein, karbohidrat, yağ oranı" />

          {/* Macro Pie Chart (Text-based) */}
          <SectionCard>
            <View className="gap-4">
              {/* Visual Bars */}
              <View className="gap-3">
                <View>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-sm font-semibold text-foreground">Protein</Text>
                    <Text className="text-sm font-semibold" style={{ color: "#FF6B6B" }}>
                      {macroStats.protein.toFixed(1)}g ({macroStats.proteinPercent.toFixed(0)}%)
                    </Text>
                  </View>
                  <View
                    style={{
                      height: 12,
                      backgroundColor: colors.border,
                      borderRadius: 6,
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        height: "100%",
                        width: `${macroStats.proteinPercent}%`,
                        backgroundColor: "#FF6B6B",
                      }}
                    />
                  </View>
                </View>

                <View>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-sm font-semibold text-foreground">Karbohidrat</Text>
                    <Text className="text-sm font-semibold" style={{ color: "#4ECDC4" }}>
                      {macroStats.carbs.toFixed(1)}g ({macroStats.carbsPercent.toFixed(0)}%)
                    </Text>
                  </View>
                  <View
                    style={{
                      height: 12,
                      backgroundColor: colors.border,
                      borderRadius: 6,
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        height: "100%",
                        width: `${macroStats.carbsPercent}%`,
                        backgroundColor: "#4ECDC4",
                      }}
                    />
                  </View>
                </View>

                <View>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-sm font-semibold text-foreground">Yağ</Text>
                    <Text className="text-sm font-semibold" style={{ color: "#FFE66D" }}>
                      {macroStats.fat.toFixed(1)}g ({macroStats.fatPercent.toFixed(0)}%)
                    </Text>
                  </View>
                  <View
                    style={{
                      height: 12,
                      backgroundColor: colors.border,
                      borderRadius: 6,
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        height: "100%",
                        width: `${macroStats.fatPercent}%`,
                        backgroundColor: "#FFE66D",
                      }}
                    />
                  </View>
                </View>
              </View>

              {/* Total */}
              <View className="border-t pt-3" style={{ borderColor: colors.border }}>
                <Text className="text-center text-lg font-bold text-foreground">
                  Toplam: {macroStats.total.toFixed(1)}g
                </Text>
              </View>
            </View>
          </SectionCard>

          {/* Legend */}
          <View className="gap-2">
            <FieldLabel label="Açıklama" />
            <View className="gap-2">
              <View className="flex-row items-center gap-2">
                <View style={{ width: 16, height: 16, backgroundColor: "#FF6B6B", borderRadius: 4 }} />
                <Text className="text-sm text-foreground">Protein (4 kcal/g)</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View style={{ width: 16, height: 16, backgroundColor: "#4ECDC4", borderRadius: 4 }} />
                <Text className="text-sm text-foreground">Karbohidrat (4 kcal/g)</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View style={{ width: 16, height: 16, backgroundColor: "#FFE66D", borderRadius: 4 }} />
                <Text className="text-sm text-foreground">Yağ (9 kcal/g)</Text>
              </View>
            </View>
          </View>

          {/* Status */}
          {macroStats.total === 0 && (
            <SectionCard>
              <Text className="text-center text-muted">Bugün henüz öğün kaydı yok.</Text>
            </SectionCard>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
