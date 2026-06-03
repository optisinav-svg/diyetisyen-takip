import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";

interface Feature {
  title: string;
  description: string;
  route?: string;
}

const FEATURES: Feature[] = [
  { title: "2FA Uyarıları", description: "İki faktörlü doğrulama uyarıları", route: "/notification-center" },
  { title: "Öğün Hatırlatmaları", description: "Öğün kaydı için hatırlatma bildirimleri", route: "/push-notifications" },
  { title: "Randevu Hatırlatmaları", description: "Yaklaşan randevular için hatırlatmalar", route: "/notification-center" },
  { title: "Hedef Uyarıları", description: "Hedef başarısı ve başarısızlığı uyarıları", route: "/notification-center" },
  { title: "Başarı Rozetleri", description: "Başarılar ve rozetler için bildirimler", route: "/notification-center" },
  { title: "Özel Bildirimler", description: "Diyetisyenden özel mesajlar ve öneriler", route: "/notification-center" },
  { title: "Tercihler", description: "Bildirim tercihlerini yönetin", route: "/push-notifications" },
  { title: "Push Token Yönetimi", description: "Push bildirim ayarlarını kontrol edin", route: "/push-notifications" },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const colors = useColors();

  const handleFeaturePress = (route?: string) => {
    if (route) {
      router.push(route as any);
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-3xl font-bold text-foreground flex-1">🔔 Bildirimler</Text>
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

          <Text className="text-sm text-muted mb-4">
            Push bildirimler ve hatırlatmalarla güncellemeler alın.
          </Text>

          <View className="gap-3">
            {FEATURES.map((feature, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleFeaturePress(feature.route)}
                activeOpacity={0.7}
              >
                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 10,
                    padding: 14,
                    borderLeftWidth: 4,
                    borderLeftColor: colors.primary,
                  }}
                >
                  <Text className="text-base font-bold text-foreground mb-1">{feature.title}</Text>
                  <Text className="text-sm text-muted">{feature.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View className="mt-6 pt-4 border-t" style={{ borderTopColor: colors.border }}>
            <Text className="text-xs text-muted text-center">
              Toplam 8 bildirim özelliği mevcuttur
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
