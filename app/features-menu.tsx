import { ScrollView, Text, View, TouchableOpacity, Dimensions } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

interface FeatureCategory {
  id: string;
  title: string;
  icon: string;
  route: string;
  color: string;
  border: string;
  textColor: string;
}

const FEATURE_CATEGORIES: FeatureCategory[] = [
  { id: "nutrition", title: "Beslenme Takibi", icon: "🥗", route: "/features/nutrition", color: "#E5F3FF", border: "#339AF0", textColor: "#1971C2" },
  { id: "health", title: "Sağlık Verileri", icon: "📈", route: "/features/health", color: "#E5FFE5", border: "#51CF66", textColor: "#2B8A3E" },
  { id: "food-management", title: "Mutfak Gıdaları", icon: "🍽️", route: "/food-management-categorized", color: "#FFF5E5", border: "#FFA94D", textColor: "#E67700" },
  { id: "calendar-appointments", title: "Randevu Sistemi", icon: "📅", route: "/calendar-appointments", color: "#E5F9FF", border: "#74C0FC", textColor: "#0C7792" },
  { id: "messaging", title: "Mesajlaşma", icon: "💬", route: "/messaging", color: "#FFE5F5", border: "#F06595", textColor: "#C2255C" },
  { id: "client-health-data", title: "Danışan Sağlık", icon: "🩺", route: "/client-health-data", color: "#E5FFF5", border: "#63E6BE", textColor: "#0B7285" },
  { id: "dietitian-notes", title: "Danışma Notları", icon: "📝", route: "/dietitian-notes", color: "#FFF9E5", border: "#FFD43B", textColor: "#B8860B" },
  { id: "meal-plan-templates", title: "Öğün Planları", icon: "📋", route: "/meal-plan-templates", color: "#E5F0FF", border: "#A5D8FF", textColor: "#1864AB" },
  { id: "micronutrient-tracking", title: "Mikro Besin", icon: "🔬", route: "/micronutrient-tracking", color: "#FFE5F0", border: "#FF8787", textColor: "#D6336C" },
  { id: "weekly-reports", title: "Haftalık Rapor", icon: "📊", route: "/weekly-reports", color: "#F5E5FF", border: "#DA77F2", textColor: "#9C36B5" },
  { id: "nutrition-report", title: "Beslenme Raporu", icon: "📄", route: "/nutrition-report", color: "#FFE5E5", border: "#FF6B6B", textColor: "#C92A2A" },
  { id: "activity-feed", title: "Aktivite Akışı", icon: "📢", route: "/activity-feed", color: "#E5FFE5", border: "#51CF66", textColor: "#2B8A3E" },
  { id: "video-consultation", title: "Video Danışma", icon: "📹", route: "/video-consultation", color: "#E5F3FF", border: "#339AF0", textColor: "#1971C2" },
  { id: "dietitian-recommendations", title: "Diyetisyen Önerileri", icon: "💡", route: "/dietitian-recommendations", color: "#FFF9E5", border: "#FFD43B", textColor: "#B8860B" },
  { id: "achievements-social", title: "Başarı Rozetleri", icon: "🏆", route: "/achievements-social", color: "#FFF5E5", border: "#FFA94D", textColor: "#E67700" },
  { id: "advanced-analytics", title: "Gelişmiş Analitik", icon: "📊", route: "/advanced-analytics", color: "#F3E5FF", border: "#B197FC", textColor: "#7950F2" },
  { id: "notification-center", title: "Bildirim Merkezi", icon: "🔔", route: "/notification-center", color: "#E5F9FF", border: "#74C0FC", textColor: "#0C7792" },
  { id: "wearable-sync", title: "Akıllı Saat", icon: "⌚", route: "/wearable-sync", color: "#E5FFF5", border: "#63E6BE", textColor: "#0B7285" },
  { id: "payment-subscription", title: "Ödeme & Abonelik", icon: "💳", route: "/payment-subscription", color: "#FFE5F0", border: "#FF8787", textColor: "#D6336C" },
  { id: "offline-mode", title: "Çevrimdışı Mod", icon: "📶", route: "/offline-mode", color: "#F5E5FF", border: "#DA77F2", textColor: "#9C36B5" },
  { id: "health-trend-charts", title: "Trend Grafikleri", icon: "📉", route: "/health-trend-charts", color: "#E5F0FF", border: "#A5D8FF", textColor: "#1864AB" },
];

export default function FeaturesMenuScreen() {
  const router = useRouter();
  const colors = useColors();

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Text style={{ fontSize: 26, fontWeight: "bold", color: colors.foreground, marginBottom: 4 }}>
          🥗 Diyetisyen Takip
        </Text>
        <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 16 }}>
          Tüm özelliklere buradan ulaşabilirsiniz
        </Text>

        {/* 2 kolonlu grid */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {FEATURE_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => router.push(cat.route as any)}
              style={{
                width: CARD_WIDTH,
                backgroundColor: cat.color,
                borderRadius: 14,
                padding: 16,
                borderWidth: 2,
                borderColor: cat.border,
                gap: 8,
              }}
            >
              <Text style={{ fontSize: 28 }}>{cat.icon}</Text>
              <Text style={{ fontSize: 14, fontWeight: "700", color: cat.textColor, lineHeight: 18 }}>
                {cat.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
