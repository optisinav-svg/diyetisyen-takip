import { ActivityIndicator, ScrollView, Text, View, Pressable } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { FieldLabel, SectionCard, SectionTitle, PrimaryButton } from "@/components/app-ui";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { startOAuthLogin } from "@/constants/oauth";

export default function WaterIntakeScreen() {
  const colors = useColors();
  const { isAuthenticated, loading } = useAuth();
  const profileQuery = trpc.profile.me.useQuery(undefined, { enabled: isAuthenticated });

  const role = profileQuery.data?.profile?.role;
  const waterQuery = trpc.waterIntake.getTodayTotal.useQuery(undefined, { enabled: isAuthenticated });
  const goalsQuery = trpc.nutritionGoals.get.useQuery(
    { clientUserId: profileQuery.data?.profile?.userId ?? 0 },
    { enabled: isAuthenticated && role === "client" },
  );

  const addWaterMutation = trpc.waterIntake.add.useMutation({
    onSuccess: () => {
      waterQuery.refetch();
    },
  });

  const todayTotal = waterQuery.data ?? 0;
  const waterGoal = goalsQuery.data?.waterIntakeGoal ?? 2000;
  const percentage = Math.min((todayTotal / waterGoal) * 100, 100);

  const handleAddWater = (amount: number) => {
    addWaterMutation.mutate({
      clientUserId: profileQuery.data?.profile?.userId ?? 0,
      amountMl: amount,
    });
  };

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
          <Text className="text-3xl font-bold text-foreground">Su takibi için giriş yapın.</Text>
          <PrimaryButton label="Giriş Yap" onPress={() => startOAuthLogin()} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="gap-6">
          <SectionTitle title="Su Takibi" subtitle="Günlük su tüketimini kaydedin" />

          {/* Progress Card */}
          <SectionCard>
            <View className="gap-4">
              <View className="gap-2">
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm font-semibold text-foreground">Bugün</Text>
                  <Text className="text-sm text-muted">{todayTotal} / {waterGoal} ml</Text>
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
                      width: `${percentage}%`,
                      backgroundColor: colors.primary,
                    }}
                  />
                </View>
              </View>
              <Text className="text-center text-2xl font-bold text-foreground">
                {Math.round(percentage)}%
              </Text>
            </View>
          </SectionCard>

          {/* Quick Add Buttons */}
          <View className="gap-3">
            <FieldLabel label="Su Ekle" />
            <View className="flex-row gap-2 flex-wrap">
              {[250, 500, 750, 1000].map((amount) => (
                <Pressable
                  key={amount}
                  onPress={() => handleAddWater(amount)}
                  style={{
                    flex: 1,
                    minWidth: "45%",
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    borderRadius: 12,
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    alignItems: "center",
                  }}
                >
                  <Text className="font-semibold text-foreground">{amount} ml</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Status Message */}
          <SectionCard>
            {todayTotal >= waterGoal ? (
              <Text className="text-center text-success font-semibold">✓ Günlük su hedefini tamamladınız!</Text>
            ) : (
              <Text className="text-center text-muted">
                Kalan: {waterGoal - todayTotal} ml
              </Text>
            )}
          </SectionCard>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
