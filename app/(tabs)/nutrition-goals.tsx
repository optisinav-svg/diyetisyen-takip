import { ActivityIndicator, ScrollView, Text, View, Pressable } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { FieldLabel, SectionCard, SectionTitle, PrimaryButton, AppTextInput, Pill } from "@/components/app-ui";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { startOAuthLogin } from "@/constants/oauth";

export default function NutritionGoalsScreen() {
  const colors = useColors();
  const { isAuthenticated, loading } = useAuth();
  const profileQuery = trpc.profile.me.useQuery(undefined, { enabled: isAuthenticated });

  const role = profileQuery.data?.profile?.role;
  const pairedClients = profileQuery.data?.pairedClients ?? [];

  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    dailyCalorieGoal: "",
    dailyProteinGoal: "",
    dailyCarbsGoal: "",
    dailyFatGoal: "",
    waterIntakeGoal: "",
  });

  useEffect(() => {
    if (!selectedClientId && pairedClients[0]?.profile?.userId) {
      setSelectedClientId(pairedClients[0].profile.userId);
    }
  }, [pairedClients, selectedClientId]);

  const goalsQuery = trpc.nutritionGoals.get.useQuery(
    { clientUserId: selectedClientId ?? 0 },
    { enabled: isAuthenticated && (role === "client" || !!selectedClientId) },
  );

  const createGoalMutation = trpc.nutritionGoals.create.useMutation({
    onSuccess: () => {
      goalsQuery.refetch();
      setShowForm(false);
      setFormData({
        dailyCalorieGoal: "",
        dailyProteinGoal: "",
        dailyCarbsGoal: "",
        dailyFatGoal: "",
        waterIntakeGoal: "",
      });
    },
  });

  const handleSaveGoals = () => {
    if (!selectedClientId) return;

    createGoalMutation.mutate({
      clientUserId: selectedClientId,
      dietitianUserId: profileQuery.data?.profile?.userId ?? 0,
      dailyCalorieGoal: formData.dailyCalorieGoal ? parseInt(formData.dailyCalorieGoal) : undefined,
      dailyProteinGoal: formData.dailyProteinGoal || undefined,
      dailyCarbsGoal: formData.dailyCarbsGoal || undefined,
      dailyFatGoal: formData.dailyFatGoal || undefined,
      waterIntakeGoal: formData.waterIntakeGoal ? parseInt(formData.waterIntakeGoal) : undefined,
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
          <Text className="text-3xl font-bold text-foreground">Hedefler görmek için giriş yapın.</Text>
          <PrimaryButton label="Giriş Yap" onPress={() => startOAuthLogin()} />
        </View>
      </ScreenContainer>
    );
  }

  const currentGoals = goalsQuery.data;

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="gap-6">
          <SectionTitle title="Beslenme Hedefleri" subtitle="Günlük kalori ve besin hedeflerini yönetin" />

          {/* Client Selection for Dietitian */}
          {role === "dietitian" && pairedClients.length > 0 && (
            <View className="gap-3">
              <FieldLabel label="Danışan Seç" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                {pairedClients.map((client) => (
                  <Pressable
                    key={client.profile.userId}
                    onPress={() => setSelectedClientId(client.profile.userId)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: selectedClientId === client.profile.userId ? colors.primary : colors.surface,
                      borderWidth: 1,
                      borderColor: selectedClientId === client.profile.userId ? colors.primary : colors.border,
                    }}
                  >
                    <Text
                      className={selectedClientId === client.profile.userId ? "text-white font-semibold" : "text-foreground font-semibold"}
                    >
                      {client.profile.displayName}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Current Goals Display */}
          {goalsQuery.isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : currentGoals ? (
            <View className="gap-3">
              <SectionCard>
                <View className="gap-4">
                  {currentGoals.dailyCalorieGoal && (
                    <View>
                      <Text className="text-xs text-muted mb-1">Günlük Kalori Hedefi</Text>
                      <Text className="text-2xl font-bold text-foreground">{currentGoals.dailyCalorieGoal} kcal</Text>
                    </View>
                  )}
                  {currentGoals.dailyProteinGoal && (
                    <View>
                      <Text className="text-xs text-muted mb-1">Günlük Protein Hedefi</Text>
                      <Text className="text-2xl font-bold text-foreground">{currentGoals.dailyProteinGoal} g</Text>
                    </View>
                  )}
                  {currentGoals.dailyCarbsGoal && (
                    <View>
                      <Text className="text-xs text-muted mb-1">Günlük Karbohidrat Hedefi</Text>
                      <Text className="text-2xl font-bold text-foreground">{currentGoals.dailyCarbsGoal} g</Text>
                    </View>
                  )}
                  {currentGoals.dailyFatGoal && (
                    <View>
                      <Text className="text-xs text-muted mb-1">Günlük Yağ Hedefi</Text>
                      <Text className="text-2xl font-bold text-foreground">{currentGoals.dailyFatGoal} g</Text>
                    </View>
                  )}
                  {currentGoals.waterIntakeGoal && (
                    <View>
                      <Text className="text-xs text-muted mb-1">Günlük Su Hedefi</Text>
                      <Text className="text-2xl font-bold text-foreground">{currentGoals.waterIntakeGoal} ml</Text>
                    </View>
                  )}
                </View>
              </SectionCard>
            </View>
          ) : (
            <SectionCard>
              <Text className="text-center text-muted">Henüz hedef belirlenmemiş.</Text>
            </SectionCard>
          )}

          {/* Form Toggle */}
          {role === "dietitian" && (
            <PrimaryButton
              label={showForm ? "İptal" : "Hedef Belirle"}
              onPress={() => setShowForm(!showForm)}
            />
          )}

          {/* Goal Setting Form */}
          {showForm && role === "dietitian" && (
            <SectionCard className="gap-4">
              <FieldLabel label="Günlük Kalori Hedefi" />
              <AppTextInput
                placeholder="2000"
                keyboardType="number-pad"
                value={formData.dailyCalorieGoal}
                onChangeText={(text) => setFormData({ ...formData, dailyCalorieGoal: text })}
              />

              <FieldLabel label="Günlük Protein Hedefi (g)" />
              <AppTextInput
                placeholder="150"
                keyboardType="number-pad"
                value={formData.dailyProteinGoal}
                onChangeText={(text) => setFormData({ ...formData, dailyProteinGoal: text })}
              />

              <FieldLabel label="Günlük Karbohidrat Hedefi (g)" />
              <AppTextInput
                placeholder="250"
                keyboardType="number-pad"
                value={formData.dailyCarbsGoal}
                onChangeText={(text) => setFormData({ ...formData, dailyCarbsGoal: text })}
              />

              <FieldLabel label="Günlük Yağ Hedefi (g)" />
              <AppTextInput
                placeholder="70"
                keyboardType="number-pad"
                value={formData.dailyFatGoal}
                onChangeText={(text) => setFormData({ ...formData, dailyFatGoal: text })}
              />

              <FieldLabel label="Günlük Su Hedefi (ml)" />
              <AppTextInput
                placeholder="2000"
                keyboardType="number-pad"
                value={formData.waterIntakeGoal}
                onChangeText={(text) => setFormData({ ...formData, waterIntakeGoal: text })}
              />

              <PrimaryButton
                label="Kaydet"
                onPress={handleSaveGoals}
                disabled={createGoalMutation.isPending}
              />
            </SectionCard>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
