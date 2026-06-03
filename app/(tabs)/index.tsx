import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { AppTextInput, FieldLabel, Pill, PrimaryButton, SectionCard, SectionTitle, SecondaryButton } from "@/components/app-ui";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { startOAuthLogin } from "@/constants/oauth";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const utils = trpc.useUtils();
  const { user, isAuthenticated, loading, logout, refresh } = useAuth();

  const profileQuery = trpc.profile.me.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const dashboardQuery = trpc.dashboard.overview.useQuery(undefined, {
    enabled: isAuthenticated && !!profileQuery.data?.profile,
  });

  const [role, setRole] = useState<"dietitian" | "client">("client");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [bodyFatPercent, setBodyFatPercent] = useState("");
  const [muscleMassKg, setMuscleMassKg] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (user?.name && !displayName) {
      setDisplayName(user.name);
    }
  }, [displayName, user?.name]);

  const setupMutation = trpc.profile.setup.useMutation({
    onSuccess: async () => {
      await refresh();
      await utils.profile.me.invalidate();
      await utils.dashboard.overview.invalidate();
    },
  });

  const connectMutation = trpc.pairing.connectByCode.useMutation({
    onSuccess: async () => {
      setInviteCode("");
      await utils.profile.me.invalidate();
      await utils.dashboard.overview.invalidate();
    },
  });

  const measurementMutation = trpc.measurements.create.useMutation({
    onSuccess: async () => {
      setHeightCm("");
      setWeightKg("");
      setBodyFatPercent("");
      setMuscleMassKg("");
      setNotes("");
      await utils.dashboard.overview.invalidate();
      await utils.measurements.list.invalidate();
      await utils.profile.me.invalidate();
    },
  });

  const pairedClients = profileQuery.data?.pairedClients ?? [];

  useEffect(() => {
    if (!selectedClientId && pairedClients[0]?.profile?.userId) {
      setSelectedClientId(pairedClients[0].profile.userId);
    }
  }, [pairedClients, selectedClientId]);

  const activeClient = useMemo(
    () => pairedClients.find((item) => item.profile.userId === selectedClientId) ?? pairedClients[0] ?? null,
    [pairedClients, selectedClientId],
  );

  const createProfile = async () => {
    if (!displayName.trim()) return;
    await setupMutation.mutateAsync({
      role,
      displayName: displayName.trim(),
      bio: bio.trim() || undefined,
    });
  };

  const connectPairing = async () => {
    if (!inviteCode.trim()) return;
    await connectMutation.mutateAsync({ inviteCode: inviteCode.trim().toUpperCase() });
  };

  const submitMeasurement = async () => {
    if (!activeClient?.profile.userId || !heightCm || !weightKg) return;
    await measurementMutation.mutateAsync({
      clientUserId: activeClient.profile.userId,
      heightCm: Number(heightCm),
      weightKg: Number(weightKg),
      bodyFatPercent: bodyFatPercent ? Number(bodyFatPercent) : undefined,
      muscleMassKg: muscleMassKg ? Number(muscleMassKg) : undefined,
      notes: notes.trim() || undefined,
    });
  };

  if (loading || (isAuthenticated && profileQuery.isLoading)) {
    return (
      <ScreenContainer className="items-center justify-center px-6">
        <ActivityIndicator color={colors.primary} />
        <Text className="mt-4 text-sm text-muted">Uygulama bilgileri yükleniyor...</Text>
      </ScreenContainer>
    );
  }

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="p-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
          <View className="gap-6">
            <View className="gap-3">
              <Pill label="Diyetisyen ve danışan için" />
              <Text className="text-4xl font-bold leading-tight text-foreground">Takibi sade bir akışta birleştirin.</Text>
              <Text className="text-base leading-7 text-muted">
                Üyelik ile giriş yapın, rolünüzü seçin, danışan eşleştirmesini kurun ve günlük takip işlerini tek uygulamada yönetin.
              </Text>
            </View>
            <SectionCard className="gap-4">
              <SectionTitle title="Neler hazır?" subtitle="İlk sürüm, temel takip adımlarını hızlıca görünür kılmak için tasarlandı." />
              <View className="gap-3">
                <Pill label="Rol bazlı kullanım" tone="success" />
                <Pill label="Eşleştirme ve ölçüm takibi" tone="warning" />
                <Pill label="Öğün, randevu ve gıda yönetimi" tone="neutral" />
              </View>
            </SectionCard>
            <PrimaryButton label="Giriş yap ve başla" onPress={() => router.push("../test-login")} />
            <SecondaryButton label="OAuth ile giriş yap" onPress={() => void startOAuthLogin()} />
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  if (!profileQuery.data?.profile) {
    return (
      <ScreenContainer className="p-6">
        <ScrollView contentContainerStyle={{ gap: 18 }}>
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Kısa bir kurulum yapalım.</Text>
            <Text className="text-sm leading-6 text-muted">
              Hesabınızı açtınız. Şimdi bu hesabın diyetisyen mi yoksa danışan mı olduğunu belirleyerek uygulama deneyimini size göre uyarlayalım.
            </Text>
          </View>

          <SectionCard className="gap-4">
            <SectionTitle title="Rolünüz" subtitle="Bu seçim sekmeleri ve yapılabilecek işlemleri belirler." />
            <View className="flex-row gap-3">
              {(["dietitian", "client"] as const).map((item) => {
                const selected = item === role;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setRole(item)}
                    style={({ pressed }) => ({
                      flex: 1,
                      borderRadius: 18,
                      paddingVertical: 14,
                      paddingHorizontal: 14,
                      borderWidth: 1,
                      borderColor: selected ? colors.primary : colors.border,
                      backgroundColor: selected ? "#E8F4F5" : colors.background,
                      opacity: pressed ? 0.9 : 1,
                    })}
                  >
                    <Text style={{ color: colors.foreground, fontWeight: "600", textTransform: "capitalize" }}>
                      {item === "dietitian" ? "Diyetisyen" : "Danışan"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </SectionCard>

          <SectionCard className="gap-3">
            <FieldLabel label="Görünen ad" hint="Danışan veya diyetisyen listelerinde bu isim gösterilir." />
            <AppTextInput value={displayName} onChangeText={setDisplayName} placeholder="Ad soyad" returnKeyType="done" />
            <FieldLabel label="Kısa açıklama" hint="İsteğe bağlıdır." />
            <AppTextInput value={bio} onChangeText={setBio} placeholder="Kısa not veya uzmanlık bilgisi" multiline />
          </SectionCard>

          {setupMutation.error ? <Text style={{ color: colors.error }}>{setupMutation.error.message}</Text> : null}
          <PrimaryButton label={setupMutation.isPending ? "Kaydediliyor..." : "Kurulumu tamamla"} onPress={() => void createProfile()} disabled={setupMutation.isPending} />
        </ScrollView>
      </ScreenContainer>
    );
  }

  const profile = profileQuery.data.profile;

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
        <View className="gap-2">
          <Pill label={profile.role === "dietitian" ? "Diyetisyen paneli" : "Danışan paneli"} tone="success" />
          <Text className="text-3xl font-bold text-foreground">Merhaba, {profile.displayName}.</Text>
          <Text className="text-sm leading-6 text-muted">
            {profile.role === "dietitian"
              ? "Danışan bağlantılarını, ölçümlerini ve yaklaşan işlerini bu ekrandan yönetin."
              : "Bugünkü planınızı, bağlantı durumunuzu ve son kayıtlarınızı tek bakışta görün."}
          </Text>
        </View>

        {profile.role === "dietitian" ? (
          <>
            <SectionCard className="gap-4">
              <SectionTitle title="Eşleştirme kodunuz" subtitle="Danışanınız bu kodu girerek sizinle bağlantı kurabilir." />
              <View className="flex-row items-center justify-between">
                <Text className="text-3xl font-bold tracking-[3px] text-foreground">{profile.inviteCode ?? "-"}</Text>
                <Pill label={`${pairedClients.length} danışan`} tone="neutral" />
              </View>
            </SectionCard>

            <SectionCard className="gap-4">
              <SectionTitle title="Bağlı danışanlar" subtitle="Kartlardan birini seçerek hızlı ölçüm girişi yapabilirsiniz." />
              {pairedClients.length === 0 ? (
                <Text className="text-sm leading-6 text-muted">Henüz eşleşmiş danışan yok. Kodunuzu danışanınızla paylaşabilirsiniz.</Text>
              ) : (
                <View className="gap-3">
                  {pairedClients.map((item) => {
                    const selected = activeClient?.profile.userId === item.profile.userId;
                    return (
                      <Pressable
                        key={item.profile.userId}
                        onPress={() => setSelectedClientId(item.profile.userId)}
                        style={({ pressed }) => ({
                          borderWidth: 1,
                          borderColor: selected ? colors.primary : colors.border,
                          backgroundColor: selected ? "#E8F4F5" : colors.background,
                          borderRadius: 18,
                          padding: 14,
                          opacity: pressed ? 0.92 : 1,
                        })}
                      >
                        <Text className="text-base font-semibold text-foreground">{item.profile.displayName}</Text>
                        <Text className="mt-1 text-sm text-muted">
                          Son kilo: {item.latestMeasurement?.weightKg ? `${item.latestMeasurement.weightKg} kg` : "Henüz veri yok"}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </SectionCard>

            <SectionCard className="gap-3">
              <SectionTitle
                title="Hızlı ölçüm girişi"
                subtitle={activeClient ? `${activeClient.profile.displayName} için yeni ölçüm kaydedin.` : "Ölçüm girişi için önce bir danışan seçin."}
              />
              <View className="gap-2">
                <FieldLabel label="Boy (cm)" />
                <AppTextInput keyboardType="decimal-pad" value={heightCm} onChangeText={setHeightCm} placeholder="170" />
                <FieldLabel label="Kilo (kg)" />
                <AppTextInput keyboardType="decimal-pad" value={weightKg} onChangeText={setWeightKg} placeholder="68.5" />
                <FieldLabel label="Yağ oranı (%)" />
                <AppTextInput keyboardType="decimal-pad" value={bodyFatPercent} onChangeText={setBodyFatPercent} placeholder="23" />
                <FieldLabel label="Kas kütlesi (kg)" />
                <AppTextInput keyboardType="decimal-pad" value={muscleMassKg} onChangeText={setMuscleMassKg} placeholder="26.5" />
                <FieldLabel label="Not" />
                <AppTextInput value={notes} onChangeText={setNotes} placeholder="Gerekirse kısa not ekleyin" multiline />
              </View>
              {measurementMutation.error ? <Text style={{ color: colors.error }}>{measurementMutation.error.message}</Text> : null}
              <PrimaryButton
                label={measurementMutation.isPending ? "Kaydediliyor..." : "Ölçümü kaydet"}
                onPress={() => void submitMeasurement()}
                disabled={!activeClient || measurementMutation.isPending}
              />
            </SectionCard>
          </>
        ) : (
          <>
            <SectionCard className="gap-4">
              <SectionTitle title="Diyetisyen eşleştirmesi" subtitle="Diyetisyeninizin paylaştığı kod ile bağlantıyı kurabilirsiniz." />
              {profileQuery.data.pairedDietitian?.profile ? (
                <View className="gap-2">
                  <Pill label="Bağlantı aktif" tone="success" />
                  <Text className="text-lg font-semibold text-foreground">{profileQuery.data.pairedDietitian.profile.displayName}</Text>
                  <Text className="text-sm leading-6 text-muted">Takibiniz bu diyetisyen hesabı üzerinden yürütülüyor.</Text>
                </View>
              ) : (
                <View className="gap-3">
                  <AppTextInput value={inviteCode} onChangeText={setInviteCode} placeholder="Örn. A1B2C3" autoCapitalize="characters" returnKeyType="done" />
                  {connectMutation.error ? <Text style={{ color: colors.error }}>{connectMutation.error.message}</Text> : null}
                  <PrimaryButton label={connectMutation.isPending ? "Bağlanılıyor..." : "Kod ile eşleş"} onPress={() => void connectPairing()} disabled={connectMutation.isPending} />
                </View>
              )}
            </SectionCard>

            <SectionCard className="gap-4">
              <SectionTitle title="Son ölçümler" subtitle="Diyetisyeninizin eklediği son kayıtlar burada görünür." />
              {(dashboardQuery.data as any)?.measurements?.length ? (
                <View className="gap-3">
                  {(dashboardQuery.data as any).measurements.slice(0, 3).map((item: any) => (
                    <View key={item.id} className="rounded-2xl bg-background p-4">
                      <Text className="text-sm font-semibold text-foreground">{formatDate(item.recordedAt)}</Text>
                      <Text className="mt-1 text-sm text-muted">Boy: {item.heightCm} cm · Kilo: {item.weightKg} kg</Text>
                      <Text className="mt-1 text-sm text-muted">Yağ: {item.bodyFatPercent ?? "-"} · Kas: {item.muscleMassKg ?? "-"}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className="text-sm leading-6 text-muted">Henüz ölçüm kaydı görünmüyor.</Text>
              )}
            </SectionCard>

            <SectionCard className="gap-4">
              <SectionTitle title="Bugün için kısa özet" subtitle="En son öğün ve randevu bilgileri burada özetlenir." />
              <Text className="text-sm text-muted">
                Son öğün sayısı: {((dashboardQuery.data as any)?.meals ?? []).length} · Yaklaşan randevu: {((dashboardQuery.data as any)?.appointments ?? []).length}
              </Text>
            </SectionCard>
          </>
        )}

        <SectionCard className="gap-3">
          <SectionTitle title="Oturum" subtitle={user?.email ?? "Kimlik doğrulaması etkin"} />
          <SecondaryButton label="Çıkış yap" onPress={() => void logout()} />
        </SectionCard>
      </ScrollView>
    </ScreenContainer>
  );
}

function formatDate(value: string | number | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tarih bilgisi yok";
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
