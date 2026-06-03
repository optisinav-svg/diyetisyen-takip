import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ScreenContainer } from "@/components/screen-container";
import { AppTextInput, FieldLabel, Pill, PrimaryButton, SectionCard, SectionTitle } from "@/components/app-ui";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { startOAuthLogin } from "@/constants/oauth";

const mealTypes = [
  { key: "breakfast", label: "Kahvaltı" },
  { key: "lunch", label: "Öğle" },
  { key: "dinner", label: "Akşam" },
  { key: "snack", label: "Ara öğün" },
] as const;

export default function MealsScreen() {
  const colors = useColors();
  const utils = trpc.useUtils();
  const { isAuthenticated, loading } = useAuth();
  const profileQuery = trpc.profile.me.useQuery(undefined, { enabled: isAuthenticated });

  const pairedClients = profileQuery.data?.pairedClients ?? [];
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [mealType, setMealType] = useState<(typeof mealTypes)[number]["key"]>("breakfast");
  const [eatenAt, setEatenAt] = useState(() => defaultMealDateTime());
  const [description, setDescription] = useState("");
  const [photoUri, setPhotoUri] = useState("");

  useEffect(() => {
    if (!selectedClientId && pairedClients[0]?.profile?.userId) {
      setSelectedClientId(pairedClients[0].profile.userId);
    }
  }, [pairedClients, selectedClientId]);

  const role = profileQuery.data?.profile?.role;
  const mealsQuery = trpc.meals.list.useQuery(
    role === "dietitian" ? { clientUserId: selectedClientId ?? undefined } : {},
    { enabled: isAuthenticated && !!role && (role === "client" || !!selectedClientId) },
  );

  const createMealMutation = trpc.meals.create.useMutation({
    onSuccess: async () => {
      setDescription("");
      setPhotoUri("");
      setEatenAt(defaultMealDateTime());
      await utils.meals.list.invalidate();
      await utils.dashboard.overview.invalidate();
    },
  });

  const pickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0]?.uri ?? "");
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== "granted") {
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0]?.uri ?? "");
    }
  };

  const submitMeal = async () => {
    await createMealMutation.mutateAsync({
      mealType,
      eatenAt: new Date(eatenAt).toISOString(),
      description: description.trim() || undefined,
      photoUri,
      status: "eaten",
    });
  };

  const selectedClient = useMemo(
    () => pairedClients.find((item) => item.profile.userId === selectedClientId) ?? pairedClients[0] ?? null,
    [pairedClients, selectedClientId],
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
          <Text className="text-3xl font-bold text-foreground">Öğün takibi için giriş yapın.</Text>
          <Text className="text-sm leading-6 text-muted">Danışan olarak öğün eklemek, diyetisyen olarak öğünleri izlemek için hesabınızla devam etmeniz gerekir.</Text>
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
          <Text className="text-3xl font-bold text-foreground">Öğünler</Text>
          <Text className="text-sm leading-6 text-muted">
            {role === "client"
              ? "Saat belirterek öğün kaydedin, isterseniz fotoğraf ekleyin."
              : "Danışanlarınızın son öğün bildirimlerini bu ekrandan takip edin."}
          </Text>
        </View>

        {role === "client" ? (
          <SectionCard className="gap-4">
            <SectionTitle title="Yeni öğün ekle" subtitle="Yazı veya fotoğraf ile günlük kaydınızı oluşturabilirsiniz." />
            <View className="gap-2">
              <FieldLabel label="Öğün tipi" />
              <View className="flex-row flex-wrap gap-2">
                {mealTypes.map((item) => {
                  const selected = item.key === mealType;
                  return (
                    <Pressable
                      key={item.key}
                      onPress={() => setMealType(item.key)}
                      style={({ pressed }) => ({
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: selected ? colors.primary : colors.border,
                        backgroundColor: selected ? "#E8F4F5" : colors.background,
                        opacity: pressed ? 0.9 : 1,
                      })}
                    >
                      <Text style={{ color: colors.foreground, fontWeight: "600" }}>{item.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <FieldLabel label="Yenilen saat" hint="Tarayıcı ve mobilde uyumlu olması için tarih-saat biçimi kullanılmaktadır." />
              <AppTextInput value={eatenAt} onChangeText={setEatenAt} placeholder="2026-04-18T08:30" autoCapitalize="none" />
              <FieldLabel label="Açıklama" />
              <AppTextInput value={description} onChangeText={setDescription} placeholder="Yediklerinizi veya porsiyon bilgisini yazın" multiline />
              <FieldLabel label="Fotoğraf" hint="İsteğe bağlıdır." />
              <View className="flex-row gap-3">
                <View style={{ flex: 1 }}>
                  <PrimaryButton label="Fotoğraf çek" onPress={() => void takePhoto()} />
                </View>
                <View style={{ flex: 1 }}>
                  <PrimaryButton label="Galeriden seç" onPress={() => void pickFromLibrary()} />
                </View>
              </View>
              {photoUri ? (
                <View className="gap-3 rounded-3xl bg-background p-3">
                  <Image source={{ uri: photoUri }} style={{ width: "100%", height: 220, borderRadius: 18 }} resizeMode="cover" />
                  <Pill label="Fotoğraf eklendi" tone="success" />
                </View>
              ) : null}
            </View>
            {createMealMutation.error ? <Text style={{ color: colors.error }}>{createMealMutation.error.message}</Text> : null}
            <PrimaryButton label={createMealMutation.isPending ? "Kaydediliyor..." : "Öğünü kaydet"} onPress={() => void submitMeal()} disabled={createMealMutation.isPending} />
          </SectionCard>
        ) : (
          <SectionCard className="gap-4">
            <SectionTitle title="Danışan seçimi" subtitle="Öğünlerini incelemek istediğiniz danışanı seçin." />
            {pairedClients.length === 0 ? (
              <Text className="text-sm leading-6 text-muted">Henüz eşleşmiş danışan bulunmuyor.</Text>
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
          </SectionCard>
        )}

        <SectionCard className="gap-4">
          <SectionTitle title={role === "client" ? "Son öğünlerim" : "Danışanın öğün geçmişi"} subtitle="En güncel kayıtlar üstte gösterilir." />
          {mealsQuery.isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : mealsQuery.data?.length ? (
            <View className="gap-3">
              {mealsQuery.data.map((item) => (
                <MealCard key={item.id} meal={item} />
              ))}
            </View>
          ) : (
            <Text className="text-sm leading-6 text-muted">Henüz öğün kaydı görünmüyor.</Text>
          )}
        </SectionCard>
      </ScrollView>
    </ScreenContainer>
  );
}

function labelForMealType(type: string) {
  return mealTypes.find((item) => item.key === type)?.label ?? type;
}

function formatDate(value: string | number | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tarih yok";
  return date.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MealCard({ meal }: { meal: any }) {
  const colors = useColors();
  const analysisQuery = trpc.mealAnalysis.get.useQuery({ mealId: meal.id });

  return (
    <View className="rounded-3xl bg-background p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-foreground">{labelForMealType(meal.mealType)}</Text>
        <Pill label={formatDate(meal.eatenAt)} tone="neutral" />
      </View>
      <Text className="mt-2 text-sm leading-6 text-muted">{meal.description || "Açıklama eklenmemiş."}</Text>
      {meal.photoUri ? <Text className="mt-2 text-xs text-muted">Fotoğraf eklendi: {meal.photoUri}</Text> : null}
      {analysisQuery.data && (
        <View className="mt-3 border-t border-border pt-3">
          <Text className="text-xs font-semibold text-primary">AI Analiz Sonuçları</Text>
          <Text className="mt-1 text-xs text-muted">
            Kalori: {analysisQuery.data.estimatedCalories || "?"} | Protein: {analysisQuery.data.estimatedProtein || "?"}g | Karbohidrat: {analysisQuery.data.estimatedCarbs || "?"}g | Yağ: {analysisQuery.data.estimatedFat || "?"}g
          </Text>
          {analysisQuery.data.confidence && (
            <Text className="mt-1 text-xs text-muted">Güven: {(parseFloat(analysisQuery.data.confidence) * 100).toFixed(0)}%</Text>
          )}
        </View>
      )}
    </View>
  );
}

function defaultMealDateTime() {
  const now = new Date();
  const pad = (input: number) => input.toString().padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}
