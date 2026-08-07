import { BackButton } from "@/components/back-button";
import { ScrollView, Text, View, TouchableOpacity, Switch } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useEffect, useState } from "react";
import { getUserRegistration } from "@/lib/_core/user-registration";
import {
  setupPushNotifications,
  sendRecommendationNotification,
  sendFeedbackResponseNotification,
  sendAppointmentReminderNotification,
  sendHealthAlertNotification,
  sendMessageNotification,
} from "@/lib/_core/push-notification-integration";

export default function PushNotificationsScreen() {
  const router = useRouter();
  const colors = useColors();

  const [user, setUser] = useState<any>(null);
  const [notificationSettings, setNotificationSettings] = useState({
    recommendations: true,
    feedbackResponses: true,
    appointments: true,
    healthAlerts: true,
    messages: true,
    soundEnabled: true,
    badgeEnabled: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await getUserRegistration();
      setUser(userData);
      await setupPushNotifications();
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const handleToggleSetting = (key: keyof typeof notificationSettings) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleTestNotification = async (type: string) => {
    try {
      switch (type) {
        case "recommendation":
          if (notificationSettings.recommendations) {
            await sendRecommendationNotification(
              user.name,
              "Protein Alımını Artırın",
              "Günlük protein alımınızı 100g'ye çıkarmayı deneyin"
            );
          }
          break;
        case "feedback":
          if (notificationSettings.feedbackResponses) {
            await sendFeedbackResponseNotification(
              user.name,
              "Çok güzel gidiyor! Devam et, ilerleme harika!"
            );
          }
          break;
        case "appointment":
          if (notificationSettings.appointments) {
            await sendAppointmentReminderNotification(
              user.name,
              "Yarın 14:00",
              "Diyetisyen Randevusu"
            );
          }
          break;
        case "health":
          if (notificationSettings.healthAlerts) {
            await sendHealthAlertNotification(
              user.name,
              "Kilo Uyarısı",
              "Kilonuz hedefin üzerine çıktı"
            );
          }
          break;
        case "message":
          if (notificationSettings.messages) {
            await sendMessageNotification(user.name, "Yeni mesajınız var");
          }
          break;
      }
    } catch (error) {
      console.error("Failed to send test notification:", error);
    }
  };

  return (
    <ScreenContainer className="p-6">
      <BackButton />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-3xl font-bold text-foreground">🔔 Bildirimler</Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 6,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.foreground, fontWeight: "600" }}>← Geri</Text>
            </TouchableOpacity>
          </View>

          {/* Global Settings */}
          <View className="gap-3">
            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
              ⚙️ Genel Ayarlar
            </Text>

            {/* Sound */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: colors.border,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View>
                <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                  🔊 Ses
                </Text>
                <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>
                  Bildirim sesi aç/kapat
                </Text>
              </View>
              <Switch
                value={notificationSettings.soundEnabled}
                onValueChange={() => handleToggleSetting("soundEnabled")}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            {/* Badge */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: colors.border,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View>
                <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                  🔴 Uygulama Rozeti
                </Text>
                <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>
                  Okunmamış bildirim sayısı göster
                </Text>
              </View>
              <Switch
                value={notificationSettings.badgeEnabled}
                onValueChange={() => handleToggleSetting("badgeEnabled")}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
          </View>

          {/* Notification Types */}
          <View className="gap-3">
            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
              📬 Bildirim Türleri
            </Text>

            {/* Recommendations */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                    💡 Diyetisyen Önerileri
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>
                    Yeni öneriler ve uyarılar
                  </Text>
                </View>
                <Switch
                  value={notificationSettings.recommendations}
                  onValueChange={() => handleToggleSetting("recommendations")}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
              <TouchableOpacity
                onPress={() => handleTestNotification("recommendation")}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 6,
                  backgroundColor: colors.primary,
                  opacity: notificationSettings.recommendations ? 1 : 0.5,
                }}
                disabled={!notificationSettings.recommendations}
              >
                <Text style={{ fontSize: 10, color: "#fff", fontWeight: "600" }}>
                  🧪 Test Gönder
                </Text>
              </TouchableOpacity>
            </View>

            {/* Feedback Responses */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                    💬 Geri Bildirim Yanıtları
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>
                    Diyetisyen yanıtladığında bildir
                  </Text>
                </View>
                <Switch
                  value={notificationSettings.feedbackResponses}
                  onValueChange={() => handleToggleSetting("feedbackResponses")}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
              <TouchableOpacity
                onPress={() => handleTestNotification("feedback")}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 6,
                  backgroundColor: colors.primary,
                  opacity: notificationSettings.feedbackResponses ? 1 : 0.5,
                }}
                disabled={!notificationSettings.feedbackResponses}
              >
                <Text style={{ fontSize: 10, color: "#fff", fontWeight: "600" }}>
                  🧪 Test Gönder
                </Text>
              </TouchableOpacity>
            </View>

            {/* Appointments */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                    📅 Randevu Hatırlatmaları
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>
                    Randevu öncesi hatırlatma
                  </Text>
                </View>
                <Switch
                  value={notificationSettings.appointments}
                  onValueChange={() => handleToggleSetting("appointments")}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
              <TouchableOpacity
                onPress={() => handleTestNotification("appointment")}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 6,
                  backgroundColor: colors.primary,
                  opacity: notificationSettings.appointments ? 1 : 0.5,
                }}
                disabled={!notificationSettings.appointments}
              >
                <Text style={{ fontSize: 10, color: "#fff", fontWeight: "600" }}>
                  🧪 Test Gönder
                </Text>
              </TouchableOpacity>
            </View>

            {/* Health Alerts */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                    ⚠️ Sağlık Uyarıları
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>
                    Sağlık hedefi uyarıları
                  </Text>
                </View>
                <Switch
                  value={notificationSettings.healthAlerts}
                  onValueChange={() => handleToggleSetting("healthAlerts")}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
              <TouchableOpacity
                onPress={() => handleTestNotification("health")}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 6,
                  backgroundColor: colors.primary,
                  opacity: notificationSettings.healthAlerts ? 1 : 0.5,
                }}
                disabled={!notificationSettings.healthAlerts}
              >
                <Text style={{ fontSize: 10, color: "#fff", fontWeight: "600" }}>
                  🧪 Test Gönder
                </Text>
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                    💬 Mesajlar
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>
                    Yeni mesaj bildirimleri
                  </Text>
                </View>
                <Switch
                  value={notificationSettings.messages}
                  onValueChange={() => handleToggleSetting("messages")}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
              <TouchableOpacity
                onPress={() => handleTestNotification("message")}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 6,
                  backgroundColor: colors.primary,
                  opacity: notificationSettings.messages ? 1 : 0.5,
                }}
                disabled={!notificationSettings.messages}
              >
                <Text style={{ fontSize: 10, color: "#fff", fontWeight: "600" }}>
                  🧪 Test Gönder
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Info */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 10, color: colors.muted }}>
              ℹ️ Bildirim ayarlarınızı istediğiniz zaman değiştirebilirsiniz. Bildirimler gerçek
              zamanlı olarak gönderilir.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
