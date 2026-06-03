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
  { title: "Wearable Cihaz Entegrasyonu", description: "Apple Watch, Fitbit, Garmin gibi cihazlardan veri çekme", route: "/health-data-entry" },
  { title: "Günlük Adımlar", description: "Adım sayısı takibi ve günlük hedefler", route: "/health-trend-charts" },
  { title: "Kalp Atış Hızı", description: "Kalp atış hızı monitörü ve trendleri", route: "/health-trend-charts" },
  { title: "Uyku Takibi", description: "Uyku süresi ve kalitesi analizi", route: "/health-trend-charts" },
  { title: "Kalori Yakımı", description: "Günlük kalori yakımı hesaplaması", route: "/health-data-entry" },
  { title: "Su İçme Takibi", description: "Günlük su tüketimi takibi", route: "/health-data-entry" },
  { title: "Health Data Visualization", description: "SVG tabanlı interaktif grafikler", route: "/health-trend-charts" },
  { title: "Gerçek Zamanlı Senkronizasyon", description: "Wearable cihazlardan otomatik veri senkronizasyonu", route: "/health-data-entry" },
];

export default function HealthScreen() {
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
            <Text className="text-3xl font-bold text-foreground flex-1">📈 Sağlık Verileri</Text>
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
            Wearable cihazlarınızdan sağlık verilerini otomatik olarak senkronize edin ve takip edin.
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
              Toplam 8 sağlık takibi özelliği mevcuttur
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
