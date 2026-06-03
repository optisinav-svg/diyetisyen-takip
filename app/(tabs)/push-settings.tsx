import { ScrollView, View, Text, Pressable, Switch, ActivityIndicator, Alert, FlatList } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { SectionCard, SectionTitle, PrimaryButton, SecondaryButton } from "@/components/app-ui";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

export default function PushSettingsScreen() {
  const colors = useColors();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [tokens, setTokens] = useState<any[]>([]);

  // Notification preferences
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [mealApprovals, setMealApprovals] = useState(true);
  const [achievements, setAchievements] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [messages, setMessages] = useState(true);

  // tRPC mutations
  const savePushTokenMutation = trpc.pushTokens.savePushToken.useMutation();
  const getUserTokensQuery = trpc.pushTokens.getUserTokens.useQuery(undefined, { enabled: isAuthenticated });
  const deleteTokenMutation = trpc.pushTokens.deleteToken.useMutation();
  const getPreferencesQuery = trpc.notificationPreferences.getPreferences.useQuery(undefined, { enabled: isAuthenticated });
  const updatePreferencesMutation = trpc.notificationPreferences.updatePreferences.useMutation();

  useEffect(() => {
    registerPushNotifications();
    loadUserTokens();
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const result = await getPreferencesQuery.refetch();
      if (result.data?.success && result.data.preferences) {
        const prefs = result.data.preferences;
        setAppointmentReminders(prefs.appointmentReminders ?? true);
        setMealApprovals(prefs.mealApprovals ?? true);
        setAchievements(prefs.achievements ?? true);
        setWeeklyReports(prefs.weeklyReports ?? true);
        setMessages(prefs.messages ?? true);
      }
    } catch (error) {
      console.error("Failed to load preferences:", error);
    }
  };

  const registerPushNotifications = async () => {
    try {
      if (!Device.isDevice) {
        console.log("Push notifications only work on physical devices");
        return;
      }

      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Push notification permissions not granted");
        return;
      }

      // Get push token
      const token = await Notifications.getExpoPushTokenAsync();
      console.log("Expo Push Token:", token.data);

      // Determine platform
      const platform = Device.osName === "iOS" ? "ios" : Device.osName === "Android" ? "android" : "web";

      // Save token to backend
      await savePushTokenMutation.mutateAsync({
        token: token.data,
        platform: platform as any,
        deviceId: Device.modelId || undefined,
      });

      Alert.alert("Başarılı", "Push notification kaydedildi");
    } catch (error) {
      console.error("Failed to register push notifications:", error);
      Alert.alert("Hata", "Push notification kaydedilemedi");
    }
  };

  const loadUserTokens = async () => {
    try {
      const result = await getUserTokensQuery.refetch();
      if (result.data?.success && result.data.tokens) {
        setTokens(result.data.tokens);
      }
    } catch (error) {
      console.error("Failed to load user tokens:", error);
    }
  };

  const handleDeleteToken = async (tokenId: number) => {
    Alert.alert("Sil", "Bu cihazı silinsin mi?", [
      { text: "İptal", onPress: () => {} },
      {
        text: "Sil",
        onPress: async () => {
          try {
            await deleteTokenMutation.mutateAsync(tokenId);
            Alert.alert("Başarılı", "Cihaz silindi");
            loadUserTokens();
          } catch (error) {
            Alert.alert("Hata", "Cihaz silinemedi");
          }
        },
      },
    ]);
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      await updatePreferencesMutation.mutateAsync({
        appointmentReminders,
        mealApprovals,
        achievements,
        weeklyReports,
        messages,
      });
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
          sound: "default",
          badge: 1,
        },
        trigger: { seconds: 2 } as any,
      });
      Alert.alert("Başarılı", "Test bildirimi gönderildi");
    } catch (error) {
      Alert.alert("Hata", "Test bildirimi gönderilemedi");
    }
  };

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">Push Bildirimleri</Text>
          <Text className="text-base text-muted">Bildirim tercihlerinizi yönetin</Text>
        </View>

        {/* Notification Preferences */}
        <SectionTitle title="Bildirim Tercihleri" />
        <SectionCard>
          <View className="gap-4">
            {/* Appointment Reminders */}
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">Randevu Hatırlatmaları</Text>
                <Text className="text-sm text-muted">Yaklaşan randevular için bildirim al</Text>
              </View>
              <Switch
                value={appointmentReminders}
                onValueChange={setAppointmentReminders}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            {/* Meal Approvals */}
            <View className="flex-row items-center justify-between border-t border-border pt-4">
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">Öğün Onayları</Text>
                <Text className="text-sm text-muted">Öğünleriniz onaylandığında bildir</Text>
              </View>
              <Switch
                value={mealApprovals}
                onValueChange={setMealApprovals}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            {/* Achievements */}
            <View className="flex-row items-center justify-between border-t border-border pt-4">
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">Rozetler & Başarılar</Text>
                <Text className="text-sm text-muted">Yeni rozetler kazandığında bildir</Text>
              </View>
              <Switch
                value={achievements}
                onValueChange={setAchievements}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            {/* Weekly Reports */}
            <View className="flex-row items-center justify-between border-t border-border pt-4">
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">Haftalık Raporlar</Text>
                <Text className="text-sm text-muted">Haftalık ilerleme raporları için bildir</Text>
              </View>
              <Switch
                value={weeklyReports}
                onValueChange={setWeeklyReports}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            {/* Messages */}
            <View className="flex-row items-center justify-between border-t border-border pt-4">
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">Mesajlar</Text>
                <Text className="text-sm text-muted">Yeni mesajlar için bildir</Text>
              </View>
              <Switch
                value={messages}
                onValueChange={setMessages}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
          </View>
        </SectionCard>

        {/* Registered Devices */}
        <SectionTitle title="Kayıtlı Cihazlar" />
        {getUserTokensQuery.isLoading ? (
          <SectionCard>
            <ActivityIndicator size="large" color={colors.primary} />
          </SectionCard>
        ) : tokens.length > 0 ? (
          <SectionCard>
            <FlatList
              data={tokens}
              scrollEnabled={false}
              renderItem={({ item, index }) => (
                <View
                  key={item.id}
                  className={`flex-row items-center justify-between ${index > 0 ? "border-t border-border pt-3 mt-3" : ""}`}
                >
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground capitalize">{item.platform}</Text>
                    <Text className="text-xs text-muted mt-1">{item.deviceId || "Bilinmiyor"}</Text>
                    <Text className="text-xs text-muted mt-1 font-mono">{item.token.substring(0, 20)}...</Text>
                  </View>
                  <Pressable
                    onPress={() => handleDeleteToken(item.id)}
                    className="ml-4 p-2"
                    style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                  >
                    <Text className="text-error text-sm font-semibold">Sil</Text>
                  </Pressable>
                </View>
              )}
              keyExtractor={(item) => item.id.toString()}
            />
          </SectionCard>
        ) : (
          <SectionCard>
            <Text className="text-center text-muted">Henüz kayıtlı cihaz yok</Text>
          </SectionCard>
        )}

        {/* Action Buttons */}
        <View className="gap-3 mt-6">
          <PrimaryButton
            label={isLoading ? "Kaydediliyor..." : "Ayarları Kaydet"}
            onPress={handleSavePreferences}
            disabled={isLoading}
          />
          <SecondaryButton label="Test Bildirimi Gönder" onPress={handleTestNotification} />
          <SecondaryButton label="Cihazı Yeniden Kaydet" onPress={registerPushNotifications} />
        </View>

        {/* Info Box */}
        <View className="bg-blue-50 rounded-lg p-4 mt-6 border border-blue-200">
          <Text className="text-sm text-blue-900 font-semibold mb-2">💡 Bilgi</Text>
          <Text className="text-xs text-blue-800 leading-relaxed">
            Push bildirimlerini almak için cihazınızda bildirimleri etkinleştirmeniz gerekir. Ayarlar &gt; Bildirimler &gt; Diyetisyen Takip
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
