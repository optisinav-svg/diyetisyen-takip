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
  { title: "Profil Yönetimi", description: "Kullanıcı profili ve bilgilerini yönetin", route: "/profile" },
  { title: "Profil Düzenleme", description: "Ad, email, fotoğraf güncelleme", route: "/profile" },
  { title: "Rol Seçimi", description: "Diyetisyen veya danışan rolü seçme", route: "/profile" },
  { title: "Hesap Silme", description: "Hesabı kalıcı olarak silme seçeneği", route: "/profile" },
  { title: "Tema Ayarları", description: "Açık/koyu mod seçimi", route: "/profile" },
  { title: "Dil Seçimi", description: "Uygulama dili seçimi", route: "/profile" },
  { title: "Bildirim Ayarları", description: "Bildirim tercihlerini yönetme", route: "/push-notifications" },
  { title: "Gizlilik Ayarları", description: "Gizlilik ve veri paylaşım ayarları", route: "/profile" },
  { title: "👥 Diyetisyen Bul", description: "Uygun diyetisyen bulun veya danışan ekleyin", route: "/connection-matching" },
  { title: "📡 Çevrimdışı Mod", description: "İnternet olmadan veri kaydedin ve senkronize edin", route: "/offline-mode" },
  { title: "🏆 Başarı Rozetleri", description: "Kazandığınız rozetleri ve başarıları görün", route: "/achievements-social" },
  { title: "📰 Aktivite Akışı", description: "Aktiviteleriniz ve diğer kullanıcıları takip edin", route: "/activity-feed" },
  { title: "🔍 Özellik Arama", description: "Uygulamadaki tüm özellikleri arayın", route: "/features-menu-search" },
];

export default function ProfileScreen() {
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
            <Text className="text-3xl font-bold text-foreground flex-1">📱 Profil ve Ayarlar</Text>
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
            Profil bilgilerinizi yönetin ve uygulama ayarlarını özelleştirin.
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
              Toplam 13 profil ve ayar özelliği mevcuttur
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
