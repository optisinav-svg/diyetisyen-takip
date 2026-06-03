import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { AppTextInput, FieldLabel, Pill, PrimaryButton, SectionCard, SectionTitle } from "@/components/app-ui";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { startOAuthLogin } from "@/constants/oauth";

export default function FoodsScreen() {
  const colors = useColors();
  const utils = trpc.useUtils();
  const { isAuthenticated, loading } = useAuth();
  const profileQuery = trpc.profile.me.useQuery(undefined, { enabled: isAuthenticated });
  const foodsQuery = trpc.foods.list.useQuery(undefined, { enabled: isAuthenticated && !!profileQuery.data?.profile });

  const pairedClients = profileQuery.data?.pairedClients ?? [];
  const role = profileQuery.data?.profile?.role;

  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [portionLabel, setPortionLabel] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (!selectedClientId && pairedClients[0]?.profile?.userId) {
      setSelectedClientId(pairedClients[0].profile.userId);
    }
  }, [pairedClients, selectedClientId]);

  const selectedClient = useMemo(
    () => pairedClients.find((item) => item.profile.userId === selectedClientId) ?? pairedClients[0] ?? null,
    [pairedClients, selectedClientId],
  );

  const rulesQuery = trpc.foods.rules.list.useQuery(
    role === "dietitian" ? { clientUserId: selectedClientId ?? undefined } : {},
    { enabled: isAuthenticated && !!role && (role === "client" || !!selectedClientId) },
  );

  const createFoodMutation = trpc.foods.create.useMutation({
    onSuccess: async () => {
      setName("");
      setCalories("");
      setPortionLabel("");
      setCategory("");
      await utils.foods.list.invalidate();
    },
  });

  const setRuleMutation = trpc.foods.rules.set.useMutation({
    onSuccess: async () => {
      await utils.foods.rules.list.invalidate();
      await utils.dashboard.overview.invalidate();
    },
  });

  const submitFood = async () => {
    await createFoodMutation.mutateAsync({
      name: name.trim(),
      calories: Number(calories),
      portionLabel: portionLabel.trim(),
      category: category.trim() || undefined,
    });
  };

  const updateRule = async (foodId: number, type: "allowed" | "forbidden") => {
    if (!selectedClient?.profile.userId) return;
    await setRuleMutation.mutateAsync({
      clientUserId: selectedClient.profile.userId,
      foodId,
      type,
    });
  };

  const groupedRules = useMemo(() => {
    const rules = rulesQuery.data ?? [];
    return {
      allowed: rules.filter((item) => item.type === "allowed"),
      forbidden: rules.filter((item) => item.type === "forbidden"),
    };
  }, [rulesQuery.data]);

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
          <Text className="text-3xl font-bold text-foreground">Gıda listesini görmek için giriş yapın.</Text>
          <Text className="text-sm leading-6 text-muted">Diyetisyenin gıda tanımları ve danışana özel kurallar oturum açmış kullanıcılar için gösterilir.</Text>
          <PrimaryButton label="Giriş yap" onPress={() => void startOAuthLogin()} />
        </View>
      </ScreenContainer>
    );
  }

  if (!profileQuery.data?.profile) {
    return (
      <ScreenContainer className="p-6 justify-center">
        <Text className="text-sm leading-6 text-muted">Önce ana sekmeden rol ve profil kurulumunuzu tamamlayın.</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
        <View className="gap-2">
          <Text className="text-3xl font-bold text-foreground">Gıdalar</Text>
          <Text className="text-sm leading-6 text-muted">
            {role === "dietitian"
              ? "Kalori kataloğu oluşturun ve danışanlara uygun/yasaklı gıdaları atayın."
              : "Diyetisyeninizin tanımladığı uygun ve yasaklı gıdaları bu ekrandan inceleyin."}
          </Text>
        </View>

        {role === "dietitian" ? (
          <SectionCard className="gap-4">
            <SectionTitle title="Yeni gıda ekle" subtitle="İsim, porsiyon ve kalori bilgisini kaydedin." />
            <FieldLabel label="Gıda adı" />
            <AppTextInput value={name} onChangeText={setName} placeholder="Yoğurt" />
            <FieldLabel label="Kalori" />
            <AppTextInput value={calories} onChangeText={setCalories} keyboardType="number-pad" placeholder="95" />
            <FieldLabel label="Porsiyon bilgisi" />
            <AppTextInput value={portionLabel} onChangeText={setPortionLabel} placeholder="100 g" />
            <FieldLabel label="Kategori" />
            <AppTextInput value={category} onChangeText={setCategory} placeholder="Süt ürünleri" />
            {createFoodMutation.error ? <Text style={{ color: colors.error }}>{createFoodMutation.error.message}</Text> : null}
            <PrimaryButton label={createFoodMutation.isPending ? "Kaydediliyor..." : "Gıdayı ekle"} onPress={() => void submitFood()} disabled={createFoodMutation.isPending} />
          </SectionCard>
        ) : null}

        {role === "dietitian" ? (
          <SectionCard className="gap-4">
            <SectionTitle title="Danışana kural ata" subtitle="Bir danışan seçin ve listedeki gıdaları uygun veya yasaklı olarak işaretleyin." />
            {pairedClients.length === 0 ? (
              <Text className="text-sm leading-6 text-muted">Kural atamak için önce bir danışan eşleşmesi gerekir.</Text>
            ) : (
              <View className="flex-row flex-wrap gap-2">
                {pairedClients.map((item) => {
                  const selected = selectedClient?.profile.userId === item.profile.userId;
                  return (
                    <Pressable
                      key={item.profile.userId}
                      onPress={() => setSelectedClientId(item.profile.userId)}
                      style={({ pressed }) => ({
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: selected ? colors.primary : colors.border,
                        backgroundColor: selected ? "#E8F4F5" : colors.background,
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        opacity: pressed ? 0.92 : 1,
                      })}
                    >
                      <Text style={{ color: colors.foreground, fontWeight: "600" }}>{item.profile.displayName}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
            {setRuleMutation.error ? <Text style={{ color: colors.error }}>{setRuleMutation.error.message}</Text> : null}
          </SectionCard>
        ) : null}

        <SectionCard className="gap-4">
          <SectionTitle title="Gıda kataloğu" subtitle="Tanımlanmış gıdaların kalori değerleri." />
          {foodsQuery.isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : foodsQuery.data?.length ? (
            <View className="gap-3">
              {foodsQuery.data.map((food) => (
                <View key={food.id} className="rounded-3xl bg-background p-4">
                  <View className="flex-row items-start justify-between gap-3">
                    <View style={{ flex: 1 }}>
                      <Text className="text-base font-semibold text-foreground">{food.name}</Text>
                      <Text className="mt-1 text-sm text-muted">
                        {food.portionLabel} · {food.calories} kcal{food.category ? ` · ${food.category}` : ""}
                      </Text>
                    </View>
                    {role === "dietitian" && selectedClient ? (
                      <View className="gap-2">
                        <PrimaryButton label="Uygun" onPress={() => void updateRule(food.id, "allowed")} />
                        <PrimaryButton label="Yasaklı" onPress={() => void updateRule(food.id, "forbidden")} />
                      </View>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-sm leading-6 text-muted">Henüz gıda tanımı eklenmedi.</Text>
          )}
        </SectionCard>

        <SectionCard className="gap-4">
          <SectionTitle title={role === "dietitian" ? "Seçili danışan kuralları" : "Bana uygun / yasaklı gıdalar"} subtitle="Kurallar iki ana başlık altında gruplanır." />
          <View className="gap-4">
            <View className="gap-3 rounded-3xl bg-background p-4">
              <Pill label="Uygun gıdalar" tone="success" />
              {groupedRules.allowed.length ? (
                groupedRules.allowed.map((item) => (
                  <Text key={item.id} className="text-sm text-foreground">• {item.food?.name ?? "Tanımsız gıda"}</Text>
                ))
              ) : (
                <Text className="text-sm text-muted">Henüz uygun gıda işaretlenmedi.</Text>
              )}
            </View>
            <View className="gap-3 rounded-3xl bg-background p-4">
              <Pill label="Yasaklı gıdalar" tone="danger" />
              {groupedRules.forbidden.length ? (
                groupedRules.forbidden.map((item) => (
                  <Text key={item.id} className="text-sm text-foreground">• {item.food?.name ?? "Tanımsız gıda"}</Text>
                ))
              ) : (
                <Text className="text-sm text-muted">Henüz yasaklı gıda işaretlenmedi.</Text>
              )}
            </View>
          </View>
        </SectionCard>
      </ScrollView>
    </ScreenContainer>
  );
}
