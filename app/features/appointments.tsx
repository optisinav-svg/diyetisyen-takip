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
  { title: "Randevu Oluşturma", description: "Yeni randevu oluşturun ve planlayın", route: "/calendar-appointments" },
  { title: "Takvim Görünümü", description: "Takvim formatında randevuları görüntüleyin", route: "/calendar-appointments" },
  { title: "Hatırlatmalar", description: "Randevudan önce otomatik hatırlatma alın", route: "/calendar-appointments" },
  { title: "Randevu Geçmişi", description: "Geçmiş randevuları görüntüleyin", route: "/calendar-appointments" },
  { title: "Notlar", description: "Randevu hakkında notlar ekleyin", route: "/calendar-appointments" },
];

export default function AppointmentsScreen() {
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
            <Text className="text-3xl font-bold text-foreground flex-1">📅 Randevu Sistemi</Text>
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
            Randevuları planlayın, takvimde takip edin ve hatırlatmalar alın.
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
              Toplam 5 randevu özelliği mevcuttur
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
