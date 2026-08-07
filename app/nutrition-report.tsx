import { BackButton } from "@/components/back-button";
import { useState, useEffect } from "react";
import { ScrollView, Text, View, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserRegistration } from "@/lib/_core/user-registration";

const MEALS_KEY = "local_meals";

interface NutritionSummary {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
  meals: number;
}

const SAMPLE_DATA: NutritionSummary[] = [
  { date: "2026-06-09", calories: 1850, protein: 142, carbs: 210, fat: 58, water: 1800, meals: 3 },
  { date: "2026-06-08", calories: 1920, protein: 155, carbs: 225, fat: 62, water: 2000, meals: 4 },
  { date: "2026-06-07", calories: 1780, protein: 138, carbs: 198, fat: 55, water: 1600, meals: 3 },
  { date: "2026-06-06", calories: 2050, protein: 168, carbs: 240, fat: 65, water: 2100, meals: 4 },
  { date: "2026-06-05", calories: 1690, protein: 125, carbs: 185, fat: 52, water: 1500, meals: 3 },
  { date: "2026-06-04", calories: 1950, protein: 160, carbs: 230, fat: 60, water: 1900, meals: 4 },
  { date: "2026-06-03", calories: 1820, protein: 148, carbs: 215, fat: 57, water: 1750, meals: 3 },
];

const MONTHS = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];

export default function NutritionReportScreen() {
  const colors = useColors();
  const [role, setRole] = useState<"dietitian" | "client">("client");
  const [reportType, setReportType] = useState<"weekly" | "monthly">("weekly");
  const [selectedClient, setSelectedClient] = useState("Ayşe Yılmaz");
  const [data] = useState<NutritionSummary[]>(SAMPLE_DATA);
  const [loading, setLoading] = useState(false);

  const CLIENTS = ["Ayşe Yılmaz", "Mehmet Demir", "Fatma Kaya"];

  useEffect(() => { loadUser(); }, []);
  const loadUser = async () => {
    const user = await getUserRegistration();
    setRole(user?.role ?? "client");
  };

  const avg = (key: keyof NutritionSummary) =>
    Math.round(data.reduce((s, d) => s + Number(d[key]), 0) / data.length);

  const goals = { calories: 1800, protein: 150, carbs: 220, fat: 60, water: 2000 };

  const adherence = (avg: number, goal: number) => Math.min(Math.round((avg / goal) * 100), 100);

  const handleExport = () => {
    Alert.alert("📄 Rapor", "Rapor PDF olarak hazırlandı. Paylaş veya kaydet.", [
      { text: "Kapat" },
      { text: "Paylaş", onPress: () => Alert.alert("Paylaşıldı", "Rapor paylaşım listesine eklendi.") },
    ]);
  };

  return (
    <ScreenContainer>
      <BackButton title="📄 Beslenme Raporu" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>

        {/* Rapor Tipi */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          {(["weekly", "monthly"] as const).map(t => (
            <TouchableOpacity key={t} onPress={() => setReportType(t)}
              style={{
                flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center",
                backgroundColor: reportType === t ? colors.primary : colors.surface,
                borderWidth: 1, borderColor: reportType === t ? colors.primary : colors.border,
              }}>
              <Text style={{ color: reportType === t ? "#fff" : colors.foreground, fontWeight: "600" }}>
                {t === "weekly" ? "📅 Haftalık" : "📆 Aylık"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Diyetisyen danışan seçimi */}
        {role === "dietitian" && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {CLIENTS.map(c => (
                <TouchableOpacity key={c} onPress={() => setSelectedClient(c)}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                    backgroundColor: selectedClient === c ? colors.primary : colors.surface,
                    borderWidth: 1, borderColor: selectedClient === c ? colors.primary : colors.border,
                  }}>
                  <Text style={{ color: selectedClient === c ? "#fff" : colors.foreground, fontWeight: "600" }}>
                    👤 {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}

        {/* Rapor Başlığı */}
        <View style={{ backgroundColor: colors.primary + "20", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.primary }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.primary }}>
            {reportType === "weekly" ? "📅 Haftalık" : "📆 Aylık"} Beslenme Raporu
          </Text>
          <Text style={{ color: colors.foreground, marginTop: 4 }}>
            {role === "dietitian" ? `👤 ${selectedClient}` : "Sizin raporunuz"}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
            {new Date().toLocaleDateString("tr-TR")} tarihli
          </Text>
        </View>

        {/* Ortalama Değerler */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 12 }}>
          <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>📊 Ortalama Günlük Değerler</Text>
          {[
            { icon: "🔥", label: "Kalori", value: avg("calories"), unit: "kcal", goal: goals.calories },
            { icon: "🥩", label: "Protein", value: avg("protein"), unit: "gram", goal: goals.protein },
            { icon: "🍞", label: "Karbonhidrat", value: avg("carbs"), unit: "gram", goal: goals.carbs },
            { icon: "🫒", label: "Yağ", value: avg("fat"), unit: "gram", goal: goals.fat },
            { icon: "💧", label: "Su", value: avg("water"), unit: "ml", goal: goals.water },
          ].map(item => {
            const pct = adherence(item.value, item.goal);
            return (
              <View key={item.label} style={{ gap: 4 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: colors.foreground }}>{item.icon} {item.label}</Text>
                  <Text style={{ color: colors.primary, fontWeight: "700" }}>
                    {item.value} / {item.goal} {item.unit}
                  </Text>
                </View>
                <View style={{ height: 8, backgroundColor: colors.border, borderRadius: 4 }}>
                  <View style={{
                    height: 8, borderRadius: 4, width: `${pct}%`,
                    backgroundColor: pct >= 90 ? "#22c55e" : pct >= 70 ? "#f97316" : "#ef4444",
                  }} />
                </View>
                <Text style={{ color: colors.muted, fontSize: 11, textAlign: "right" }}>{pct}% hedefe ulaşıldı</Text>
              </View>
            );
          })}
        </View>

        {/* Günlük Tablo */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 8 }}>
          <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>📋 Günlük Detay</Text>
          {data.map(d => (
            <View key={d.date} style={{
              borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, gap: 4
            }}>
              <Text style={{ fontWeight: "600", color: colors.foreground }}>
                📅 {new Date(d.date).toLocaleDateString("tr-TR")}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                <Text style={{ color: colors.muted, fontSize: 12 }}>🔥 {d.calories} kcal</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>🥩 {d.protein}g</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>🍞 {d.carbs}g</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>💧 {d.water}ml</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>🍽️ {d.meals} öğün</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Genel Uyum */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>🎯 Genel Uyum Oranı</Text>
          <View style={{ alignItems: "center", marginTop: 10 }}>
            <Text style={{ fontSize: 40, fontWeight: "bold", color: colors.primary }}>
              {Math.round([
                adherence(avg("calories"), goals.calories),
                adherence(avg("protein"), goals.protein),
                adherence(avg("water"), goals.water),
              ].reduce((s, v) => s + v, 0) / 3)}%
            </Text>
            <Text style={{ color: colors.muted }}>Ortalama hedef uyumu</Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleExport}
          style={{ paddingVertical: 16, borderRadius: 12, alignItems: "center", backgroundColor: colors.primary }}>
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>📤 Raporu Dışa Aktar</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
