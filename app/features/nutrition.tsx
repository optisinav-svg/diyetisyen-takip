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
  {
    title: "Öğün Ekleme",
    description: "Sabah, öğle, akşam ve ara öğünleri kolayca kaydedin",
    route: "/add-custom-meal",
  },
  {
    title: "Dinamik Ara Öğün Ekleme",
    description: "İstediğiniz kadar ara öğün ekleyebilirsiniz",
    route: "/add-custom-meal",
  },
  {
    title: "Öğün Şablonları",
    description: "Sık kullanılan öğünleri şablon olarak kaydedin",
    route: "/food-management",
  },
  {
    title: "Tarih/Saat Seçici",
    description: "Öğün eklerken tarih ve saat seçebilirsiniz",
    route: "/add-custom-meal",
  },
  {
    title: "Öğün Fotoğrafı",
    description: "Öğün fotoğrafı yükleyin ve otomatik analiz yapın",
    route: "/meal-photo-upload",
  },
  {
    title: "Beslenme Bilgileri",
    description: "Kalori, protein, karbohidrat ve yağ bilgilerini takip edin",
    route: "/add-custom-meal",
  },
  {
    title: "Öğün Geçmişi",
    description: "Tüm öğünlerinizin geçmişini görüntüleyin",
    route: "/food-management",
  },
  {
    title: "Beslenme Hedefleri",
    description: "Kişisel kalori ve makro hedeflerini belirleyin",
    route: "/health-goals",
  },
  {
    title: "Hedef Takibi",
    description: "Günlük hedef ilerleme göstergesini takip edin",
    route: "/advanced-analytics",
  },
  {
    title: "Makro Dağılımı Grafiği",
    description: "Protein, karbohidrat ve yağ dağılımını görselleştirin",
    route: "/advanced-analytics",
  },
];

export default function NutritionScreen() {
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
          {/* Header with Back Button */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-3xl font-bold text-foreground flex-1">📊 Beslenme Takibi</Text>
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

          {/* Description */}
          <Text className="text-sm text-muted mb-4">
            Günlük öğünlerinizi kaydedin, beslenme hedeflerini belirleyin ve ilerlemenizi takip edin.
          </Text>

          {/* Features List */}
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

          {/* Footer */}
          <View className="mt-6 pt-4 border-t" style={{ borderTopColor: colors.border }}>
            <Text className="text-xs text-muted text-center">
              Toplam 10 beslenme takibi özelliği mevcuttur - Tıklayarak erişin
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
