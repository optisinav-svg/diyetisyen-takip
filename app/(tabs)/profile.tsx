import { ActivityIndicator, ScrollView, Text, View, Pressable } from "react-native";
import React, { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { Pill, PrimaryButton, SectionCard, SectionTitle, SecondaryButton } from "@/components/app-ui";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { startOAuthLogin } from "@/constants/oauth";
import { useRouter } from "expo-router";
import * as BiometricLogin from "@/lib/_core/biometric-login";

export default function ProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const profileQuery = trpc.profile.me.useQuery(undefined, { enabled: isAuthenticated });
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const reportsQuery = trpc.weeklyReports.list.useQuery(
    { clientUserId: selectedClientId ?? 0 },
    { enabled: isAuthenticated && !!selectedClientId },
  );

  // Check biometric login status when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      BiometricLogin.isBiometricLoginEnabled().then(setBiometricEnabled);
    }
  }, [isAuthenticated]);

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
          <Text className="text-3xl font-bold text-foreground">Profil bilgileri için giriş yapın.</Text>
          <Text className="text-sm leading-6 text-muted">Hesap bilgileri ve oturum işlemleri bu bölümde yer alır.</Text>
          <PrimaryButton label="Giriş yap" onPress={() => void startOAuthLogin()} />
          <SecondaryButton label="Biyometrikle Giriş" onPress={() => router.push('/biometric-login')} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
        <View className="gap-2">
          <Text className="text-3xl font-bold text-foreground">Profil</Text>
          <Text className="text-sm leading-6 text-muted">Hesap rolü, eşleşme durumu ve oturum işlemleri.</Text>
        </View>

        <SectionCard className="gap-4">
          <SectionTitle title={profileQuery.data?.profile?.displayName ?? user?.name ?? "Kullanıcı"} subtitle={user?.email ?? "E-posta bilgisi bulunamadı"} />
          <View className="gap-3">
            <Pill label={profileQuery.data?.profile?.role === "dietitian" ? "Diyetisyen" : profileQuery.data?.profile?.role === "client" ? "Danışan" : "Rol seçilmedi"} tone="success" />
            {profileQuery.data?.profile?.bio ? <Text className="text-sm leading-6 text-muted">{profileQuery.data.profile.bio}</Text> : null}
            {profileQuery.data?.profile?.inviteCode ? <Text className="text-sm text-muted">Eşleştirme kodu: {profileQuery.data.profile.inviteCode}</Text> : null}
          </View>
        </SectionCard>

        <SectionCard className="gap-4">
          <SectionTitle title="Bağlantı durumu" subtitle="Profil rolünüze göre aktif ilişki özeti gösterilir." />
          {profileQuery.data?.profile?.role === "dietitian" ? (
            <Text className="text-sm leading-6 text-muted">Aktif danışan sayısı: {profileQuery.data?.pairedClients?.length ?? 0}</Text>
          ) : profileQuery.data?.pairedDietitian?.profile ? (
            <Text className="text-sm leading-6 text-muted">Takibiniz {profileQuery.data.pairedDietitian.profile.displayName} ile eşleşmiş durumda.</Text>
          ) : (
            <Text className="text-sm leading-6 text-muted">Henüz aktif bir eşleşme görünmüyor.</Text>
          )}
        </SectionCard>

        {profileQuery.data?.profile?.role === "dietitian" && profileQuery.data?.pairedClients?.length ? (
          <SectionCard className="gap-4">
            <SectionTitle title="Haftalık Raporlar" subtitle="Danışanlarınızın haftalık ilerleme raporlarını indirin." />
            <View className="gap-2">
              {profileQuery.data.pairedClients.map((client) => (
                <Pressable
                  key={client.profile.userId}
                  onPress={() => setSelectedClientId(client.profile.userId)}
                  style={({ pressed }) => ({
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: selectedClientId === client.profile.userId ? colors.primary : colors.border,
                    backgroundColor: selectedClientId === client.profile.userId ? "#E8F4F5" : colors.background,
                    padding: 12,
                    opacity: pressed ? 0.92 : 1,
                  })}
                >
                  <Text style={{ color: colors.foreground, fontWeight: "600" }}>{client.profile.displayName}</Text>
                </Pressable>
              ))}
            </View>
            {selectedClientId && reportsQuery.data?.length ? (
              <View className="gap-2 mt-2">
                {reportsQuery.data.slice(0, 3).map((report) => (
                  <View key={report.id} className="rounded-xl bg-surface p-3">
                    <Text className="text-xs font-semibold text-foreground">
                      {new Date(report.weekStartDate).toLocaleDateString("tr-TR")} - {new Date(report.weekEndDate).toLocaleDateString("tr-TR")}
                    </Text>
                    <Text className="mt-1 text-xs text-muted">
                      Öğün: {report.totalMeals} | Ort. Kalori: {report.averageDailyCalories || "?"} | Kilo değişimi: {report.weightChange || "?"} kg
                    </Text>
                    {report.pdfUrl && (
                      <Pressable
                        onPress={() => {
                          // PDF indirme işlemi
                        }}
                        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, marginTop: 8 })}
                      >
                        <Text className="text-primary text-xs font-semibold">PDF İndir</Text>
                      </Pressable>
                    )}
                  </View>
                ))}
              </View>
            ) : selectedClientId ? (
              <Text className="text-sm text-muted">Henüz rapor bulunmuyor.</Text>
            ) : null}
          </SectionCard>
        ) : null}

        <SectionCard className="gap-3">
          <SectionTitle title="Oturum işlemleri" subtitle="Mevcut oturumu güvenli biçimde sonlandırabilirsiniz." />
          <SecondaryButton label="Çıkış yap" onPress={() => void logout()} />
        </SectionCard>
      </ScrollView>
    </ScreenContainer>
  );
}
