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
  { title: "Health Analytics Screen", description: "Sağlık verilerinin görselleştirilmesi", route: "/advanced-analytics" },
  { title: "Bar Chart", description: "Haftalık karşılaştırma grafikleri", route: "/advanced-analytics" },
  { title: "Line Chart", description: "Trend grafikleri ve ilerleme göstergeleri", route: "/health-trend-charts" },
  { title: "Metrik Seçici", description: "Farklı metrikleri görüntüleme (adımlar, kalp, kalori, uyku)", route: "/health-trend-charts" },
  { title: "İstatistik Kartları", description: "Günlük, haftalık, aylık özet istatistikler", route: "/advanced-analytics" },
  { title: "Haftalık Karşılaştırma", description: "Hafta bazında metrik karşılaştası", route: "/advanced-analytics" },
  { title: "Aylık Trendler", description: "Aylık ilerleme trendleri", route: "/health-trend-charts" },
  { title: "Hedef İlerleme", description: "Hedeflere karşı mevcut ilerleme", route: "/health-goals" },
  { title: "Sağlık Trendleri", description: "Metrik trendleri (İyleşiyor, kötüleşiyor, sabit)", route: "/health-trend-charts" },
  { title: "Tahminler", description: "Mevcut hızda devam ederse 30 gün sonrası tahmini", route: "/health-trend-charts" },
  { title: "İçgörüler", description: "AI-powered öneriler ve içgörüler", route: "/advanced-analytics" },
  { title: "Öneriler", description: "Kişiselleştirilmiş sağlık önerileri", route: "/dietitian-recommendations" },
];

export default function AnalyticsScreen() {
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
            <Text className="text-3xl font-bold text-foreground flex-1">📊 Analitik</Text>
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
            Detaylı grafikler, trendler ve istatistikler ile sağlık verilerinizi analiz edin.
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
              Toplam 12 analitik özelliği mevcuttur
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
