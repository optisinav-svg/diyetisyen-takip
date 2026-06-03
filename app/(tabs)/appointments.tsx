import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { AppTextInput, FieldLabel, Pill, PrimaryButton, SectionCard, SectionTitle } from "@/components/app-ui";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { startOAuthLogin } from "@/constants/oauth";

export default function AppointmentsScreen() {
  const colors = useColors();
  const utils = trpc.useUtils();
  const { isAuthenticated, loading } = useAuth();
  const profileQuery = trpc.profile.me.useQuery(undefined, { enabled: isAuthenticated });
  const appointmentsQuery = trpc.appointments.list.useQuery(undefined, { enabled: isAuthenticated && !!profileQuery.data?.profile });

  const pairedClients = profileQuery.data?.pairedClients ?? [];
  const role = profileQuery.data?.profile?.role;

  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [scheduledAt, setScheduledAt] = useState(defaultAppointmentDateTime());
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!selectedClientId && pairedClients[0]?.profile?.userId) {
      setSelectedClientId(pairedClients[0].profile.userId);
    }
  }, [pairedClients, selectedClientId]);

  const selectedClient = useMemo(
    () => pairedClients.find((item) => item.profile.userId === selectedClientId) ?? pairedClients[0] ?? null,
    [pairedClients, selectedClientId],
  );

  const createMutation = trpc.appointments.create.useMutation({
    onSuccess: async () => {
      setScheduledAt(defaultAppointmentDateTime());
      setNote("");
      await utils.appointments.list.invalidate();
      await utils.dashboard.overview.invalidate();
    },
  });

  const createReminderMutation = trpc.appointmentReminders.create.useMutation({
    onSuccess: async () => {
      await utils.appointmentReminders.list.invalidate();
    },
  });

  const submitAppointment = async () => {
    if (!selectedClient?.profile.userId) return;
    await createMutation.mutateAsync({
      clientUserId: selectedClient.profile.userId,
      scheduledAt: new Date(scheduledAt).toISOString(),
      note: note.trim() || undefined,
    });
  };

  const createReminder = async (appointmentId: number) => {
    if (!selectedClient?.profile.userId) return;
    await createReminderMutation.mutateAsync({
      appointmentId,
      clientUserId: selectedClient.profile.userId,
      minutesBefore: 15,
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
          <Text className="text-3xl font-bold text-foreground">Randevular için giriş yapın.</Text>
          <Text className="text-sm leading-6 text-muted">Takvim ve görüşme planları oturum açmış kullanıcılar için gösterilir.</Text>
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
          <Text className="text-3xl font-bold text-foreground">Randevular</Text>
          <Text className="text-sm leading-6 text-muted">
            {role === "dietitian"
              ? "Danışan görüşmelerini planlayın ve yaklaşan takvimi yönetin."
              : "Yaklaşan görüşmelerinizi ve geçmiş randevularınızı tek listede görün."}
          </Text>
        </View>

        {role === "dietitian" ? (
          <SectionCard className="gap-4">
            <SectionTitle title="Yeni randevu planla" subtitle="Danışan seçip tarih-saat belirleyin." />
            {pairedClients.length === 0 ? (
              <Text className="text-sm leading-6 text-muted">Randevu oluşturmak için önce bir danışan eşleşmesi gereklidir.</Text>
            ) : (
              <>
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
                <FieldLabel label="Tarih ve saat" hint="Örnek biçim: 2026-04-19T14:30" />
                <AppTextInput value={scheduledAt} onChangeText={setScheduledAt} placeholder="2026-04-19T14:30" autoCapitalize="none" />
                <FieldLabel label="Not" />
                <AppTextInput value={note} onChangeText={setNote} placeholder="Görüşme başlığı veya hazırlık notu" multiline />
                {createMutation.error ? <Text style={{ color: colors.error }}>{createMutation.error.message}</Text> : null}
                <PrimaryButton label={createMutation.isPending ? "Kaydediliyor..." : "Randevu oluştur"} onPress={() => void submitAppointment()} disabled={createMutation.isPending || !selectedClient} />
              </>
            )}
          </SectionCard>
        ) : null}

        <SectionCard className="gap-4">
          <SectionTitle title="Randevu listesi" subtitle="En güncel randevular üstte gösterilir." />
          {appointmentsQuery.isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : appointmentsQuery.data?.length ? (
            <View className="gap-3">
              {appointmentsQuery.data.map((item) => (
                <View key={item.id} className="rounded-3xl bg-background p-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-semibold text-foreground">{formatDate(item.scheduledAt)}</Text>
                    <Pill label={statusLabel(item.status)} tone={statusTone(item.status)} />
                  </View>
                  <Text className="mt-2 text-sm leading-6 text-muted">{item.note || "Not eklenmemiş."}</Text>
                  {role === "dietitian" && item.status === "scheduled" && (
                    <Pressable
                      onPress={() => void createReminder(item.id)}
                      style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, marginTop: 8 }]}
                    >
                      <Text className="text-primary font-semibold">Hatırlatma Gönder (15 dk)</Text>
                    </Pressable>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-sm leading-6 text-muted">Henüz randevu bulunmuyor.</Text>
          )}
        </SectionCard>
      </ScrollView>
    </ScreenContainer>
  );
}

function defaultAppointmentDateTime() {
  const nextHour = new Date();
  nextHour.setHours(nextHour.getHours() + 1);
  const pad = (input: number) => input.toString().padStart(2, "0");
  return `${nextHour.getFullYear()}-${pad(nextHour.getMonth() + 1)}-${pad(nextHour.getDate())}T${pad(nextHour.getHours())}:${pad(nextHour.getMinutes())}`;
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

function statusLabel(status: string) {
  if (status === "completed") return "Tamamlandı";
  if (status === "cancelled") return "İptal";
  return "Planlandı";
}

function statusTone(status: string) {
  if (status === "completed") return "success" as const;
  if (status === "cancelled") return "danger" as const;
  return "warning" as const;
}
