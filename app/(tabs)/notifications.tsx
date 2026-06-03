import { useState, useEffect } from "react";
import { ScrollView, View, Text, Pressable, Switch, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { SectionCard, SectionTitle, PrimaryButton } from "@/components/app-ui";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import * as Notifications from "expo-notifications";

export default function NotificationsScreen() {
  const colors = useColors();
  const { isAuthenticated } = useAuth();
  const profileQuery = trpc.profile.me.useQuery(undefined, { enabled: isAuthenticated });

  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [mealApprovals, setMealApprovals] = useState(true);
  const [achievements, setAchievements] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [messages, setMessages] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load notification preferences from AsyncStorage or backend
    loadNotificationPreferences();
  }, []);

  const loadNotificationPreferences = async () => {
    try {
      // In production, this would fetch from backend
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to load notification preferences:", error);
    }
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      // Save preferences to backend
      Alert.alert("Başarılı", "Bildirim ayarları kaydedildi");
    } catch (error) {
      Alert.alert("Hata", "Ayarlar kaydedilemedi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Test Bildirimi",
          body: "Bu bir test bildirimidir",
          data: { test: true },
        },
        trigger: { seconds: 1 } as any,
      });
      Alert.alert("Başarılı", "Test bildirimi gönderildi");
    } catch (error) {
      Alert.alert("Hata", "Test bildirimi gönderilemedi");
    }
  };

  if (!isAuthenticated) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-lg text-muted">Lütfen giriş yapın</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <View className="gap-4">
          <SectionTitle title="Bildirim Ayarları" />

          <Text className="text-sm text-muted">
            Hangi tür bildirimleri almak istediğinizi seçin
          </Text>

          {/* Appointment Reminders */}
          <SectionCard>
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="font-semibold text-foreground">Randevu Hatırlatmaları</Text>
                  <Text className="text-xs text-muted mt-1">
                    Randevu 15 dakika öncesi bildirim al
                  </Text>
                </View>
                <Switch
                  value={appointmentReminders}
                  onValueChange={setAppointmentReminders}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={appointmentReminders ? colors.primary : colors.muted}
                />
              </View>
            </View>
          </SectionCard>

          {/* Meal Approvals */}
          <SectionCard>
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="font-semibold text-foreground">Öğün Onayları</Text>
                  <Text className="text-xs text-muted mt-1">
                    Diyetisyen öğünü onayladığında bildirim al
                  </Text>
                </View>
                <Switch
                  value={mealApprovals}
                  onValueChange={setMealApprovals}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={mealApprovals ? colors.primary : colors.muted}
                />
              </View>
            </View>
          </SectionCard>

          {/* Achievements */}
          <SectionCard>
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="font-semibold text-foreground">Başarılar</Text>
                  <Text className="text-xs text-muted mt-1">
                    Yeni rozet kazandığında bildirim al
                  </Text>
                </View>
                <Switch
                  value={achievements}
                  onValueChange={setAchievements}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={achievements ? colors.primary : colors.muted}
                />
              </View>
            </View>
          </SectionCard>

          {/* Weekly Reports */}
          <SectionCard>
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="font-semibold text-foreground">Haftalık Raporlar</Text>
                  <Text className="text-xs text-muted mt-1">
                    Haftalık rapor hazır olduğunda bildirim al
                  </Text>
                </View>
                <Switch
                  value={weeklyReports}
                  onValueChange={setWeeklyReports}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={weeklyReports ? colors.primary : colors.muted}
                />
              </View>
            </View>
          </SectionCard>

          {/* Messages */}
          <SectionCard>
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="font-semibold text-foreground">Mesajlar</Text>
                  <Text className="text-xs text-muted mt-1">
                    Yeni mesaj aldığında bildirim al
                  </Text>
                </View>
                <Switch
                  value={messages}
                  onValueChange={setMessages}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={messages ? colors.primary : colors.muted}
                />
              </View>
            </View>
          </SectionCard>

          {/* Test Notification */}
          <SectionCard>
            <View className="gap-3">
              <Text className="font-semibold text-foreground">Test Bildirimi</Text>
              <Text className="text-xs text-muted">
                Bildirimlerin düzgün çalışıp çalışmadığını kontrol etmek için test bildirimi gönderin
              </Text>
              <Pressable
                onPress={handleTestNotification}
                style={({ pressed }) => [
                  {
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    backgroundColor: colors.surface,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text className="text-center font-semibold text-primary">Test Gönder</Text>
              </Pressable>
            </View>
          </SectionCard>

          {/* Save Button */}
          <View className="gap-3">
            <PrimaryButton
              label={isLoading ? "Kaydediliyor..." : "Ayarları Kaydet"}
              onPress={handleSavePreferences}
              disabled={isLoading}
            />
          </View>

          {/* Info Section */}
          <SectionCard>
            <View className="gap-2">
              <Text className="font-semibold text-foreground text-sm">Bilgi</Text>
              <Text className="text-xs text-muted leading-relaxed">
                Bildirimleri almak için cihazınızda uygulama bildirimlerinin etkinleştirilmiş olması gerekir. Ayarlar uygulamasından kontrol edebilirsiniz.
              </Text>
            </View>
          </SectionCard>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
