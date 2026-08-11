import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, Dimensions } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SESSION_KEY = "session_v3";
const MEALS_KEY = "meals_v3";
const GOALS_KEY = "nutrition_goals_v3_me";
const WATER_KEY = "water_today_v2";
const WEIGHT_KEY = "weight_log_v2";
const APPTS_KEY = "appointments_v2";
const MSGS_KEY = "chat_v3";

const { width } = Dimensions.get("window");
const RING_SIZE = 160;

export default function ClientDashboardScreen() {
  const colors = useColors();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [todayCalories, setTodayCalories] = useState(0);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [waterMl, setWaterMl] = useState(0);
  const [waterGoal] = useState(2000);
  const [todayMeals, setTodayMeals] = useState<any[]>([]);
  const [upcomingAppt, setUpcomingAppt] = useState<any>(null);
  const [lastMsg, setLastMsg] = useState<string>("");
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [addWater, setAddWater] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const s = await AsyncStorage.getItem(SESSION_KEY);
    if (s) setUser(JSON.parse(s));

    const today = new Date().toISOString().split("T")[0];

    // Öğünler
    const m = await AsyncStorage.getItem(MEALS_KEY);
    if (m) {
      const all = JSON.parse(m);
      const td = all.filter((x: any) => x.date === today);
      setTodayMeals(td);
      setTodayCalories(td.reduce((s: number, x: any) => s + (x.calories || 0), 0));
    }

    // Hedef
    const g = await AsyncStorage.getItem(`nutrition_goals_v3_me`);
    if (g) { const parsed = JSON.parse(g); setCalorieGoal(parsed.calories || 2000); }

    // Su
    const w = await AsyncStorage.getItem(`${WATER_KEY}_${today}`);
    if (w) setWaterMl(Number(w));

    // Kilo
    const wlog = await AsyncStorage.getItem(WEIGHT_KEY);
    if (wlog) {
      const logs = JSON.parse(wlog);
      if (logs.length > 0) setCurrentWeight(logs[logs.length - 1].weight);
    }

    // Randevu
    const a = await AsyncStorage.getItem(APPTS_KEY);
    if (a) {
      const all = JSON.parse(a);
      const upcoming = all.filter((x: any) => x.date >= today && x.status !== "cancelled")
        .sort((a: any, b: any) => a.date.localeCompare(b.date));
      if (upcoming.length > 0) setUpcomingAppt(upcoming[0]);
    }

    // Son mesaj
    const msgs = await AsyncStorage.getItem(MSGS_KEY);
    if (msgs) {
      const all = JSON.parse(msgs);
      const d1msgs = all["d1"] || [];
      const dietitianMsgs = d1msgs.filter((m: any) => m.senderId !== "me");
      if (dietitianMsgs.length > 0) setLastMsg(dietitianMsgs[dietitianMsgs.length - 1].content);
    }
  };

  const addWaterAmount = async (ml: number) => {
    const today = new Date().toISOString().split("T")[0];
    const newTotal = waterMl + ml;
    setWaterMl(newTotal);
    await AsyncStorage.setItem(`${WATER_KEY}_${today}`, String(newTotal));
    if (newTotal >= waterGoal) Alert.alert("🎉 Tebrikler!", "Günlük su hedefinizi tamamladınız!");
  };

  const caloriePct = Math.min((todayCalories / calorieGoal) * 100, 100);
  const waterPct = Math.min((waterMl / waterGoal) * 100, 100);

  const MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
  const today = new Date();
  const dateStr = `${today.getDate()} ${MONTHS[today.getMonth()]} ${today.getFullYear()}`;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}>
        {/* Başlık */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text style={{ fontSize: 22, fontWeight: "bold", color: colors.foreground }}>
              👋 Merhaba{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
            </Text>
            <Text style={{ color: colors.muted, fontSize: 13 }}>📅 {dateStr}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary + "20", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: colors.primary }}>
            <Text style={{ fontSize: 20 }}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Diyetisyenden mesaj */}
        {lastMsg ? (
          <TouchableOpacity onPress={() => router.push("/messaging")}
            style={{ backgroundColor: colors.primary + "15", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.primary + "40", flexDirection: "row", gap: 10, alignItems: "center" }}>
            <Text style={{ fontSize: 24 }}>👨‍⚕️</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "700", color: colors.primary, fontSize: 12, marginBottom: 2 }}>Diyetisyeninizden</Text>
              <Text style={{ color: colors.foreground, fontSize: 13 }} numberOfLines={2}>{lastMsg}</Text>
            </View>
            <Text style={{ color: colors.primary }}>→</Text>
          </TouchableOpacity>
        ) : null}

        {/* Kalori Halkası */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border, alignItems: "center", gap: 12 }}>
          <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>🔥 Günlük Kalori</Text>
          <View style={{ width: RING_SIZE, height: RING_SIZE, alignItems: "center", justifyContent: "center" }}>
            {/* Basit progress ring */}
            <View style={{ width: RING_SIZE, height: RING_SIZE, borderRadius: RING_SIZE / 2, borderWidth: 14, borderColor: colors.border, alignItems: "center", justifyContent: "center", position: "absolute" }} />
            <View style={{ width: RING_SIZE, height: RING_SIZE, borderRadius: RING_SIZE / 2, borderWidth: 14, borderColor: colors.primary, borderBottomColor: caloriePct > 25 ? colors.primary : colors.border, borderLeftColor: caloriePct > 50 ? colors.primary : colors.border, borderTopColor: caloriePct > 75 ? colors.primary : colors.border, position: "absolute", transform: [{ rotate: "-90deg" }] }} />
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 28, fontWeight: "bold", color: colors.primary }}>{todayCalories}</Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>/ {calorieGoal} kcal</Text>
              <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>{calorieGoal - todayCalories > 0 ? `${calorieGoal - todayCalories} kcal kaldı` : "✅ Hedef tamam!"}</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 20 }}>
            {[
              { label: "Kahvaltı", count: todayMeals.filter(m => m.type === "breakfast").length, icon: "🌅" },
              { label: "Öğle", count: todayMeals.filter(m => m.type === "lunch").length, icon: "☀️" },
              { label: "Akşam", count: todayMeals.filter(m => m.type === "dinner").length, icon: "🌙" },
              { label: "Ara", count: todayMeals.filter(m => m.type === "snack").length, icon: "🍎" },
            ].map(item => (
              <View key={item.label} style={{ alignItems: "center", gap: 2 }}>
                <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.count > 0 ? "#22c55e" : colors.border }} />
                <Text style={{ fontSize: 10, color: colors.muted }}>{item.label}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity onPress={() => router.push("/(tabs)/meals")}
            style={{ paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20, backgroundColor: colors.primary }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>+ Öğün Ekle</Text>
          </TouchableOpacity>
        </View>

        {/* Su Takibi */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 12 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>💧 Su Takibi</Text>
            <Text style={{ color: waterPct >= 100 ? "#22c55e" : colors.primary, fontWeight: "700" }}>{waterMl} / {waterGoal} ml</Text>
          </View>
          <View style={{ height: 12, backgroundColor: colors.border, borderRadius: 6 }}>
            <View style={{ height: 12, backgroundColor: waterPct >= 100 ? "#22c55e" : "#3b82f6", borderRadius: 6, width: `${waterPct}%` }} />
          </View>
          {/* Bardak görsel */}
          <View style={{ flexDirection: "row", gap: 6 }}>
            {Array.from({ length: 8 }, (_, i) => (
              <TouchableOpacity key={i} onPress={() => addWaterAmount(250)}
                style={{ flex: 1, height: 36, borderRadius: 8, backgroundColor: (i + 1) * 250 <= waterMl ? "#3b82f6" : colors.border, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 16 }}>💧</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[150, 200, 250, 350, 500].map(ml => (
              <TouchableOpacity key={ml} onPress={() => addWaterAmount(ml)}
                style={{ flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: "#3b82f6" + "20", borderWidth: 1, borderColor: "#3b82f6" + "40", alignItems: "center" }}>
                <Text style={{ color: "#3b82f6", fontWeight: "700", fontSize: 12 }}>+{ml}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Yaklaşan Randevu */}
        {upcomingAppt && (
          <TouchableOpacity onPress={() => router.push("/calendar-appointments")}
            style={{ backgroundColor: "#22c55e20", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#22c55e", flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Text style={{ fontSize: 28 }}>📅</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "700", color: "#22c55e" }}>Yaklaşan Randevu</Text>
              <Text style={{ color: colors.foreground, fontSize: 13 }}>📅 {upcomingAppt.date} 🕐 {upcomingAppt.startTime}</Text>
            </View>
            <Text style={{ color: "#22c55e" }}>→</Text>
          </TouchableOpacity>
        )}

        {/* Kilo */}
        {currentWeight && (
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Text style={{ fontSize: 28 }}>⚖️</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "700", color: colors.foreground }}>Son Kilo</Text>
              <Text style={{ color: colors.primary, fontSize: 20, fontWeight: "bold" }}>{currentWeight} kg</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/weight-tracker")}
              style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.primary }}>
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 12 }}>Güncelle</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Hızlı Erişim */}
        <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>⚡ Hızlı Erişim</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {[
            { icon: "💬", label: "Mesajlar", route: "/messaging", color: "#f97316" },
            { icon: "🎯", label: "Hedeflerim", route: "/(tabs)/meals", color: "#8b5cf6" },
            { icon: "📊", label: "Raporlar", route: "/rapor", color: "#3b82f6" },
            { icon: "🏆", label: "Rozetler", route: "/achievements-social", color: "#f59e0b" },
            { icon: "📋", label: "Öğün Planım", route: "/meal-plan-templates", color: "#22c55e" },
            { icon: "💡", label: "Öneriler", route: "/dietitian-recommendations", color: "#ef4444" },
          ].map(q => (
            <TouchableOpacity key={q.route} onPress={() => router.push(q.route as any)}
              style={{ width: "47%", backgroundColor: q.color + "15", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: q.color + "40", flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Text style={{ fontSize: 24 }}>{q.icon}</Text>
              <Text style={{ fontWeight: "700", color: q.color, fontSize: 13 }}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
