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
  { title: "Hedef Oluşturma", description: "Sağlık hedefleri oluşturun ve belirleyin", route: "/health-goals" },
  { title: "İlerleme Takibi", description: "Hedeflere karşı ilerlemenizi takip edin", route: "/health-goals" },
  { title: "Hedef Türleri", description: "Kilo, adım, kalp atışı, uyku hedefleri", route: "/health-goals" },
  { title: "Başarı Metrikleri", description: "Hedef başarı oranlarını görüntüleyin", route: "/advanced-analytics" },
  { title: "Hedef Geçmişi", description: "Geçmiş hedefleri ve sonuçlarını görüntüleyin", route: "/health-goals" },
];

export default function GoalsScreen() {
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
            <Text className="text-3xl font-bold text-foreground flex-1">🎯 Hedef Takibi</Text>
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
            Sağlık hedeflerini oluşturun, ilerlemenizi takip edin ve başarılarınızı kutlayın.
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
              Toplam 5 hedef takibi özelliği mevcuttur
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
