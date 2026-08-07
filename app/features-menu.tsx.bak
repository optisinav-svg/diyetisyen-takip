import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";

interface FeatureCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  color?: string;
}

const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    id: "auth",
    title: "🔐 Kimlik Doğrulama",
    description: "Biyometrik giriş, 2FA ve güvenlik",
    icon: "🔐",
    route: "/features/authentication",
  },
  {
    id: "nutrition",
    title: "📊 Beslenme Takibi",
    description: "Öğün yönetimi ve beslenme hedefleri",
    icon: "📊",
    route: "/features/nutrition",
  },
  {
    id: "health",
    title: "📈 Sağlık Verileri",
    description: "Wearable cihaz entegrasyonu ve takibi",
    icon: "📈",
    route: "/features/health",
  },
  {
    id: "analytics",
    title: "📊 Analitik",
    description: "Grafikler, trendler ve istatistikler",
    icon: "📊",
    route: "/features/analytics",
  },
  {
    id: "messaging",
    title: "💬 Mesajlaşma",
    description: "Real-time diyetisyen-danışan iletişimi",
    icon: "💬",
    route: "/features/messaging",
  },
  {
    id: "notifications",
    title: "🔔 Bildirimler",
    description: "Push bildirimler ve hatırlatmalar",
    icon: "🔔",
    route: "/features/notifications",
  },
  {
    id: "dashboard",
    title: "👨‍⚕️ Diyetisyen Dashboard",
    description: "Müşteri yönetimi ve takibi",
    icon: "👨‍⚕️",
    route: "/features/dashboard",
  },
  {
    id: "profile",
    title: "📱 Profil ve Ayarlar",
    description: "Kullanıcı profili ve uygulama ayarları",
    icon: "📱",
    route: "/features/profile",
  },
  {
    id: "payment",
    title: "💳 Ödeme ve Abonelik",
    description: "Stripe entegrasyonu ve ödeme yönetimi",
    icon: "💳",
    route: "/features/payment",
  },
  {
    id: "nutrition-analysis",
    title: "🍽️ Beslenme Analizi",
    description: "AI-powered öğün fotoğraf analizi",
    icon: "🍽️",
    route: "/features/nutrition-analysis",
  },
  {
    id: "appointments",
    title: "📅 Randevu Sistemi",
    description: "Randevu oluşturma ve takvim",
    icon: "📅",
    route: "/features/appointments",
  },
  {
    id: "goals",
    title: "🎯 Hedef Takibi",
    description: "Sağlık hedefleri ve ilerleme",
    icon: "🎯",
    route: "/features/goals",
  },
];

export default function FeaturesMenuScreen() {
  const router = useRouter();
  const colors = useColors();

  const handleCategoryPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="mb-4">
            <Text className="text-3xl font-bold text-foreground">Özellikler</Text>
            <Text className="text-sm text-muted mt-2">
              Diyetisyen Takip uygulamasının tüm özelliklerini keşfedin
            </Text>
          </View>

          {/* Feature Categories Grid */}
          <View className="gap-3">
            {FEATURE_CATEGORIES.map((category) => {
              const categoryColors = [
                { bg: "#FFE5E5", border: "#FF6B6B", text: "#C92A2A" },
                { bg: "#E5F3FF", border: "#339AF0", text: "#1971C2" },
                { bg: "#E5FFE5", border: "#51CF66", text: "#2B8A3E" },
                { bg: "#FFF5E5", border: "#FFA94D", text: "#E67700" },
                { bg: "#F3E5FF", border: "#B197FC", text: "#7950F2" },
                { bg: "#E5F9FF", border: "#74C0FC", text: "#0C7792" },
                { bg: "#FFE5F5", border: "#F06595", text: "#C2255C" },
                { bg: "#F5E5FF", border: "#DA77F2", text: "#9C36B5" },
                { bg: "#E5FFF5", border: "#63E6BE", text: "#0B7285" },
                { bg: "#FFF9E5", border: "#FFD43B", text: "#B8860B" },
                { bg: "#E5F0FF", border: "#A5D8FF", text: "#1864AB" },
                { bg: "#FFE5F0", border: "#FF8787", text: "#D6336C" },
              ];
              const colorIndex = FEATURE_CATEGORIES.indexOf(category) % categoryColors.length;
              const categoryColor = categoryColors[colorIndex];

              return (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => handleCategoryPress(category.route)}
                  style={{
                    backgroundColor: categoryColor.bg,
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 2,
                    borderColor: categoryColor.border,
                  }}
                >
                  <View className="gap-2">
                    <Text style={{ fontSize: 24, marginBottom: 4 }}>{category.icon}</Text>
                    <Text style={{ fontSize: 16, fontWeight: "bold", color: categoryColor.text }}>
                      {category.title}
                    </Text>
                    <Text style={{ fontSize: 13, color: categoryColor.text, opacity: 0.7 }}>
                      {category.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Footer */}
          <View className="mt-6 pt-4 border-t" style={{ borderTopColor: colors.border }}>
            <Text className="text-xs text-muted text-center">
              Toplam 100+ özellik mevcuttur. Her kategoriyi tıklayarak detaylı bilgi alabilirsiniz.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
