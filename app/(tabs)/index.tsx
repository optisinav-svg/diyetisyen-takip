import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { getUserRegistration } from "@/lib/_core/user-registration";
import AsyncStorage from "@react-native-async-storage/async-storage";

const APPTS_KEY = "appointments_v2";

interface Appointment {
  id: string;
  clientName: string;
  date: string;
  startTime: string;
  endTime: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const [user, setUser] = useState<any>(null);
  const [todayAppts, setTodayAppts] = useState<Appointment[]>([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const userData = await getUserRegistration();
    setUser(userData);
    const saved = await AsyncStorage.getItem(APPTS_KEY);
    if (saved) {
      const all: Appointment[] = JSON.parse(saved);
      const today = new Date().toISOString().split("T")[0];
      setTodayAppts(all.filter(a => a.date === today));
    }
  };

  const isDietitian = user?.role === "dietitian";

  const QUICK_ACTIONS_DIETITIAN = [
    { icon: "👥", label: "Danışanlarım", route: "/(tabs)/dietitian-dashboard", color: "#3b82f6" },
    { icon: "📅", label: "Randevular", route: "/calendar-appointments", color: "#22c55e" },
    { icon: "💬", label: "Mesajlar", route: "/messaging", color: "#f97316" },
    { icon: "📝", label: "Not Al", route: "/dietitian-notes", color: "#8b5cf6" },
    { icon: "🍽️", label: "Öğün Planları", route: "/meal-plan-templates", color: "#ef4444" },
    { icon: "💡", label: "Öneriler", route: "/dietitian-recommendations", color: "#f59e0b" },
  ];

  const QUICK_ACTIONS_CLIENT = [
    { icon: "🥗", label: "Öğün Ekle", route: "/(tabs)/meals", color: "#22c55e" },
    { icon: "💧", label: "Su Takibi", route: "/(tabs)/water-intake", color: "#3b82f6" },
    { icon: "📊", label: "Analizler", route: "/(tabs)/health-analytics", color: "#8b5cf6" },
    { icon: "💬", label: "Mesajlar", route: "/messaging", color: "#f97316" },
    { icon: "🎯", label: "Hedefler", route: "/advanced-analytics", color: "#ef4444" },
    { icon: "📋", label: "Diyet Planım", route: "/meal-plan-templates", color: "#f59e0b" },
  ];

  const quickActions = isDietitian ? QUICK_ACTIONS_DIETITIAN : QUICK_ACTIONS_CLIENT;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}>
        {/* Karşılama */}
        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground }}>
            {isDietitian ? "👨‍⚕️" : "👤"} Merhaba, {user?.name?.split(" ")[0] ?? "Hoş geldiniz"}!
          </Text>
          <Text style={{ color: colors.muted, fontSize: 14 }}>
            {new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })}
          </Text>
        </View>

        {/* Diyetisyen: Danışan Listesi Butonu */}
        {isDietitian && (
          <TouchableOpacity onPress={() => router.push("/(tabs)/dietitian-dashboard")}
            style={{
              backgroundColor: colors.primary, borderRadius: 14, padding: 16,
              flexDirection: "row", alignItems: "center", gap: 12,
            }}>
            <Text style={{ fontSize: 32 }}>👥</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Danışanlarım</Text>
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>
                Danışan listesi, sağlık verileri ve notlar
              </Text>
            </View>
            <Text style={{ color: "#fff", fontSize: 20 }}>→</Text>
          </TouchableOpacity>
        )}

        {/* Bugünkü Randevular */}
        {isDietitian && todayAppts.length > 0 && (
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 10 }}>
            <Text style={{ fontWeight: "700", color: colors.foreground }}>📅 Bugünkü Randevular ({todayAppts.length})</Text>
            {todayAppts.map(appt => (
              <View key={appt.id} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <Text style={{ color: colors.foreground }}>👤 {appt.clientName}</Text>
                <Text style={{ color: colors.primary, fontWeight: "600" }}>🕐 {appt.startTime}-{appt.endTime}</Text>
              </View>
            ))}
            <TouchableOpacity onPress={() => router.push("/calendar-appointments")}
              style={{ paddingVertical: 8, borderRadius: 8, alignItems: "center", backgroundColor: colors.primary + "20" }}>
              <Text style={{ color: colors.primary, fontWeight: "600" }}>Tüm Randevuları Gör →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Hızlı Erişim */}
        <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>⚡ Hızlı Erişim</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {quickActions.map(action => (
            <TouchableOpacity key={action.route} onPress={() => router.push(action.route as any)}
              style={{
                width: "47%", backgroundColor: action.color + "15",
                borderRadius: 12, padding: 14, borderWidth: 1, borderColor: action.color + "40",
                gap: 6,
              }}>
              <Text style={{ fontSize: 28 }}>{action.icon}</Text>
              <Text style={{ fontWeight: "700", color: action.color, fontSize: 13 }}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tüm Özellikler */}
        <TouchableOpacity onPress={() => router.push("/features-menu")}
          style={{
            paddingVertical: 14, borderRadius: 12, alignItems: "center",
            backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
            flexDirection: "row", justifyContent: "center", gap: 8,
          }}>
          <Text style={{ fontSize: 18 }}>🔲</Text>
          <Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 15 }}>Tüm Özellikler</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
