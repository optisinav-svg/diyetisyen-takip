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
  { title: "Real-time Mesajlaşma", description: "Diyetisyen ve danışan arasında anlık iletişim", route: "/messaging" },
  { title: "Mesaj Geçmişi", description: "Tüm mesajların geçmişini görüntüleyin", route: "/messaging" },
  { title: "Yazıyor Göstergesi", description: "Karşı tarafın yazıyor olduğunu görün", route: "/messaging" },
  { title: "Okundu Makbuzu", description: "Mesajların okunup okunmadığını takip edin", route: "/messaging" },
  { title: "Ek Dosya", description: "Mesajlara dosya ve resim ekleyin", route: "/messaging" },
  { title: "Arama", description: "Mesajlar içinde arama yapın", route: "/messaging" },
  { title: "Düzenleme/Silme", description: "Gönderilen mesajları düzenleyin veya silin", route: "/messaging" },
  { title: "Sohbet Listesi", description: "Tüm sohbetlerinizi organize şekilde görüntüleyin", route: "/messaging" },
];

export default function MessagingScreen() {
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
            <Text className="text-3xl font-bold text-foreground flex-1">💬 Mesajlaşma</Text>
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
            Diyetisyen ve danışan arasında güvenli ve anlık iletişim sağlayın.
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
              Toplam 8 mesajlaşma özelliği mevcuttur
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
