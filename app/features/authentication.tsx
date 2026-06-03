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
    title: "Face ID & Fingerprint Support",
    description: "iOS ve Android'de yüz tanıma ve parmak izi ile hızlı giriş yapın",
    route: "/biometric-login",
  },
  {
    title: "Biometric Settings Screen",
    description: "Biyometrik giriş ayarlarını kolayca yönetin",
    route: "/profile",
  },
  {
    title: "Quick Login",
    description: "Kaydedilmiş biyometrik verilerle anında giriş yapın",
    route: "/biometric-login",
  },
  {
    title: "Fallback Authentication",
    description: "Biyometrik başarısız olursa şifre ile giriş yapabilirsiniz",
    route: "/test-login",
  },
  {
    title: "Two-Factor Authentication (2FA)",
    description: "Diyetisyenlerin hesaplarında 2FA zorunlu olarak ayarlanır",
    route: "/profile",
  },
  {
    title: "TOTP Support",
    description: "Google Authenticator ve Microsoft Authenticator ile uyumlu",
    route: "/profile",
  },
  {
    title: "QR Code Generation",
    description: "2FA kurulumu için kolayca QR kod oluşturun",
    route: "/profile",
  },
  {
    title: "Backup Codes",
    description: "Acil durumlarda kullanmak için yedek kodlar alın",
    route: "/profile",
  },
];

export default function AuthenticationScreen() {
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
            <Text className="text-3xl font-bold text-foreground flex-1">🔐 Kimlik Doğrulama</Text>
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
            Hesabınızı güvenli ve hızlı bir şekilde koruyun. Biyometrik giriş ve Two-Factor Authentication ile maksimum güvenlik sağlayın.
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
              Toplam 8 güvenlik özelliği mevcuttur
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
