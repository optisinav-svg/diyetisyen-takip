import { ScrollView, Text, View, TouchableOpacity, Dimensions } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const CW = (width - 48) / 2;

const ALL_FEATURES = [
  // Danışan
  { id: "client-dashboard", title: "Danışan Ana Ekranı", icon: "🏠", route: "/(tabs)/client-dashboard", color: "#E5F3FF", border: "#339AF0", text: "#1971C2", role: "client" },
  // Beslenme
  { id: "meals", title: "Beslenme Takibi", icon: "🥗", route: "/(tabs)/meals", color: "#E5F3FF", border: "#339AF0", text: "#1971C2", role: "both" },
  { id: "food", title: "Mutfak Gıdaları", icon: "🍽️", route: "/food-management-categorized", color: "#FFF5E5", border: "#FFA94D", text: "#E67700", role: "both" },
  { id: "food-database", title: "Gıda Veritabanı", icon: "🔎", route: "/food-database", color: "#E5FFE5", border: "#51CF66", text: "#2B8A3E", role: "both" },
  { id: "barcode-scanner", title: "Barkod Tarayıcı", icon: "📷", route: "/barcode-scanner", color: "#FFF9E5", border: "#FFD43B", text: "#B8860B", role: "both" },
  { id: "meal-copy", title: "Öğün Kopyala", icon: "📋", route: "/meal-copy", color: "#F3E5FF", border: "#B197FC", text: "#7950F2", role: "both" },
  { id: "meal-plans", title: "Öğün Planları", icon: "📝", route: "/meal-plan-templates", color: "#E5F0FF", border: "#A5D8FF", text: "#1864AB", role: "dietitian" },
  { id: "micro", title: "Mikro Besin", icon: "🔬", route: "/micronutrient-tracking", color: "#FFE5F0", border: "#FF8787", text: "#D6336C", role: "dietitian" },
  // Sağlık & Takip
  { id: "health", title: "Sağlık Verileri", icon: "📈", route: "/features/health", color: "#E5FFE5", border: "#51CF66", text: "#2B8A3E", role: "both" },
  { id: "weight-tracker", title: "Kilo Takibi", icon: "⚖️", route: "/weight-tracker", color: "#E5F3FF", border: "#339AF0", text: "#1971C2", role: "both" },
  { id: "water-reminder", title: "Su Hatırlatıcı", icon: "💧", route: "/water-reminder", color: "#E5F9FF", border: "#74C0FC", text: "#0C7792", role: "both" },
  { id: "health-sync", title: "Sağlık Sync", icon: "🏃", route: "/health-sync", color: "#E5FFE5", border: "#51CF66", text: "#2B8A3E", role: "both" },
  { id: "glp1-mode", title: "GLP-1 / Ozempic", icon: "💉", route: "/glp1-mode", color: "#F3E5FF", border: "#B197FC", text: "#7950F2", role: "both" },
  { id: "wearable", title: "Akıllı Saat", icon: "⌚", route: "/wearable-sync", color: "#E5FFF5", border: "#63E6BE", text: "#0B7285", role: "both" },
  // İletişim
  { id: "messaging", title: "Mesajlaşma", icon: "💬", route: "/messaging", color: "#FFE5F5", border: "#F06595", text: "#C2255C", role: "both" },
  { id: "bulk-message", title: "Toplu Mesaj", icon: "📢", route: "/bulk-message", color: "#FFF5E5", border: "#FFA94D", text: "#E67700", role: "dietitian" },
  { id: "recommendations", title: "Öneriler", icon: "💡", route: "/dietitian-recommendations", color: "#FFF9E5", border: "#FFD43B", text: "#B8860B", role: "dietitian" },
  // Danışan Yönetimi
  { id: "dashboard", title: "Danışanlarım", icon: "👥", route: "/(tabs)/dietitian-dashboard", color: "#E5FFE5", border: "#51CF66", text: "#2B8A3E", role: "dietitian" },
  { id: "matching", title: "Eşleştirme", icon: "🔗", route: "/matching", color: "#E5F3FF", border: "#339AF0", text: "#1971C2", role: "both" },
  { id: "client-health", title: "Danışan Sağlık", icon: "🩺", route: "/client-health-data", color: "#FFE5F0", border: "#FF8787", text: "#D6336C", role: "dietitian" },
  // Randevu & Ödeme
  { id: "calendar", title: "Randevu Sistemi", icon: "📅", route: "/calendar-appointments", color: "#E5F9FF", border: "#74C0FC", text: "#0C7792", role: "both" },
  { id: "payment", title: "Ödeme & Abonelik", icon: "💳", route: "/payment-subscription", color: "#FFE5F0", border: "#FF8787", text: "#D6336C", role: "both" },
  { id: "video", title: "Video Danışma", icon: "📹", route: "/video-consultation", color: "#E5F3FF", border: "#339AF0", text: "#1971C2", role: "both" },
  // Analitik & Rapor
  { id: "analytics", title: "Analitik", icon: "📊", route: "/advanced-analytics", color: "#F3E5FF", border: "#B197FC", text: "#7950F2", role: "both" },
  { id: "rapor", title: "Raporlar", icon: "📄", route: "/rapor", color: "#F5E5FF", border: "#DA77F2", text: "#9C36B5", role: "both" },
  { id: "pdf-report", title: "PDF Rapor", icon: "📑", route: "/pdf-report", color: "#FFE5E5", border: "#FF8787", text: "#D6336C", role: "both" },
  { id: "data-export", title: "Veri Dışa Aktar", icon: "📤", route: "/data-export", color: "#E5FFF5", border: "#63E6BE", text: "#0B7285", role: "both" },
  { id: "activity", title: "Aktivite Akışı", icon: "📢", route: "/activity-feed", color: "#E5FFE5", border: "#51CF66", text: "#2B8A3E", role: "both" },
  // Diğer
  { id: "notes", title: "Danışma Notları", icon: "📝", route: "/dietitian-notes", color: "#FFF9E5", border: "#FFD43B", text: "#B8860B", role: "dietitian" },
  { id: "achievements", title: "Rozetler", icon: "🏆", route: "/achievements-social", color: "#FFF9E0", border: "#FFD700", text: "#B8860B", role: "both" },
  { id: "auto-theme", title: "Tema Ayarları", icon: "🎨", route: "/auto-theme", color: "#F3E5FF", border: "#B197FC", text: "#7950F2", role: "both" },
  { id: "offline-mode", title: "Çevrimdışı Mod", icon: "📡", route: "/offline-mode", color: "#E5F9FF", border: "#74C0FC", text: "#0C7792", role: "both" },
];

export default function FeaturesMenuScreen() {
  const router = useRouter();
  const colors = useColors();
  const [role, setRole] = useState<"dietitian" | "client">("client");
  const [filter, setFilter] = useState<"all" | "dietitian" | "client">("all");

  useEffect(() => { load(); }, []);

  const load = async () => {
    const s = await AsyncStorage.getItem("session_v3");
    if (s) setRole(JSON.parse(s).role ?? "client");
  };

  const filtered = ALL_FEATURES.filter(f => {
    if (filter === "all") return f.role === "both" || f.role === role;
    if (filter === "dietitian") return f.role === "dietitian" || f.role === "both";
    if (filter === "client") return f.role === "client" || f.role === "both";
    return true;
  });

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground, marginBottom: 12 }}>
          🥗 Diyetisyen Takip
        </Text>

        {/* Filtre */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
          {[
            { k: "all", l: "🔲 Tümü" },
            { k: "dietitian", l: "👨‍⚕️ Diyetisyen" },
            { k: "client", l: "👤 Danışan" },
          ].map(f => (
            <TouchableOpacity key={f.k} onPress={() => setFilter(f.k as any)}
              style={{ flex: 1, paddingVertical: 8, borderRadius: 20, alignItems: "center", backgroundColor: filter === f.k ? colors.primary : colors.surface, borderWidth: 1, borderColor: filter === f.k ? colors.primary : colors.border }}>
              <Text style={{ color: filter === f.k ? "#fff" : colors.foreground, fontWeight: "600", fontSize: 12 }}>{f.l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 12 }}>{filtered.length} özellik</Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {filtered.map(f => (
            <TouchableOpacity key={f.id} onPress={() => router.push(f.route as any)}
              style={{ width: CW, backgroundColor: f.color, borderRadius: 14, padding: 16, borderWidth: 2, borderColor: f.border, gap: 8 }}>
              <Text style={{ fontSize: 28 }}>{f.icon}</Text>
              <Text style={{ fontSize: 13, fontWeight: "700", color: f.text, lineHeight: 18 }}>{f.title}</Text>
              {f.role !== "both" && (
                <View style={{ backgroundColor: f.border + "30", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, alignSelf: "flex-start" }}>
                  <Text style={{ fontSize: 9, fontWeight: "700", color: f.text }}>{f.role === "dietitian" ? "Diyetisyen" : "Danışan"}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
