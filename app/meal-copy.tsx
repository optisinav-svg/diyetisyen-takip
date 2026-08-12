import { ScrollView, Text, View, TouchableOpacity, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { BackButton } from "@/components/back-button";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MEALS_KEY = "meals_v3";
const MONTHS = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];

interface Meal { id:string;type:string;description:string;calories:number;photoUri?:string;date:string;items:string[]; }

const MEAL_LABELS: Record<string, string> = {
  breakfast: "🌅 Kahvaltı",
  lunch: "☀️ Öğle",
  dinner: "🌙 Akşam",
  snack: "🍎 Ara Öğün",
};

function formatDate(s: string) {
  const d = new Date(s + "T00:00:00");
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  if (s === today) return "Bugün";
  if (s === yesterday) return "Dün";
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export default function MealCopyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [groupedMeals, setGroupedMeals] = useState<Record<string, Meal[]>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
  const [targetDate, setTargetDate] = useState("today");

  useEffect(() => { loadMeals(); }, []);

  const loadMeals = async () => {
    const saved = await AsyncStorage.getItem(MEALS_KEY);
    if (saved) {
      const all: Meal[] = JSON.parse(saved);
      setMeals(all);
      // Tarihe göre grupla (son 7 gün)
      const grouped: Record<string, Meal[]> = {};
      all.forEach(m => {
        if (!grouped[m.date]) grouped[m.date] = [];
        grouped[m.date].push(m);
      });
      // Son 7 günü al, bugün hariç
      const today = new Date().toISOString().split("T")[0];
      const recentDates = Object.keys(grouped)
        .filter(d => d < today)
        .sort((a, b) => b.localeCompare(a))
        .slice(0, 7);
      const recentGrouped: Record<string, Meal[]> = {};
      recentDates.forEach(d => { recentGrouped[d] = grouped[d]; });
      setGroupedMeals(recentGrouped);
    }
  };

  const toggleMeal = (id: string) => {
    setSelectedMeals(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAllFromDate = (date: string) => {
    const dateMeals = groupedMeals[date] || [];
    const allSelected = dateMeals.every(m => selectedMeals.includes(m.id));
    if (allSelected) setSelectedMeals(prev => prev.filter(id => !dateMeals.map(m => m.id).includes(id)));
    else setSelectedMeals(prev => [...new Set([...prev, ...dateMeals.map(m => m.id)])]);
  };

  const copyMeals = async () => {
    if (selectedMeals.length === 0) { Alert.alert("Hata", "Kopyalanacak öğün seçin"); return; }
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const copyTo = targetDate === "today" ? today : tomorrow;

    const mealsToCopy = meals.filter(m => selectedMeals.includes(m.id));
    const newMeals: Meal[] = mealsToCopy.map(m => ({
      ...m,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: copyTo,
    }));

    const saved = await AsyncStorage.getItem(MEALS_KEY);
    const all = saved ? JSON.parse(saved) : [];
    await AsyncStorage.setItem(MEALS_KEY, JSON.stringify([...all, ...newMeals]));

    const totalCals = newMeals.reduce((s, m) => s + m.calories, 0);
    Alert.alert("✅ Kopyalandı!",
      `${newMeals.length} öğün ${targetDate === "today" ? "bugüne" : "yarına"} kopyalandı.\n🔥 Toplam: ${totalCals} kcal`);
    setSelectedMeals([]);
    loadMeals();
  };

  const totalSelectedCals = meals
    .filter(m => selectedMeals.includes(m.id))
    .reduce((s, m) => s + m.calories, 0);

  return (
    <ScreenContainer>
      <BackButton title="📋 Öğün Kopyala" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: Math.max(insets.bottom + 24, 32) }}>
        <Text style={{ color: colors.muted, fontSize: 13 }}>Önceki günlerden öğün seçip bugüne veya yarına kopyalayın.</Text>

        {/* Nereye kopyala */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border, gap: 10 }}>
          <Text style={{ fontWeight: "700", color: colors.foreground }}>📅 Nereye Kopyala?</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[{ k: "today", l: "📅 Bugün" }, { k: "tomorrow", l: "📅 Yarın" }].map(t => (
              <TouchableOpacity key={t.k} onPress={() => setTargetDate(t.k)}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center", backgroundColor: targetDate === t.k ? colors.primary : colors.surface, borderWidth: 1, borderColor: targetDate === t.k ? colors.primary : colors.border }}>
                <Text style={{ color: targetDate === t.k ? "#fff" : colors.foreground, fontWeight: "700" }}>{t.l}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Seçim özeti */}
        {selectedMeals.length > 0 && (
          <View style={{ backgroundColor: colors.primary + "20", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.primary, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={{ fontWeight: "700", color: colors.primary }}>{selectedMeals.length} öğün seçildi</Text>
              <Text style={{ color: colors.muted, fontSize: 13 }}>🔥 Toplam: {totalSelectedCals} kcal</Text>
            </View>
            <TouchableOpacity onPress={copyMeals}
              style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.primary }}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>Kopyala →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Öğün listesi */}
        {Object.keys(groupedMeals).length === 0 ? (
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: colors.border, alignItems: "center", gap: 8 }}>
            <Text style={{ fontSize: 40 }}>🍽️</Text>
            <Text style={{ color: colors.muted, textAlign: "center" }}>Kopyalanacak öğün bulunamadı. Önce öğün ekleyin.</Text>
          </View>
        ) : Object.entries(groupedMeals).map(([date, dateMeals]) => {
          const allSelected = dateMeals.every(m => selectedMeals.includes(m.id));
          const totalCals = dateMeals.reduce((s, m) => s + m.calories, 0);
          return (
            <View key={date} style={{ gap: 8 }}>
              {/* Tarih başlığı */}
              <TouchableOpacity onPress={() => { setSelectedDate(selectedDate === date ? null : date); }}
                style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: selectedDate === date ? colors.primary : colors.border, flexDirection: "row", alignItems: "center", gap: 10 }}>
                <TouchableOpacity onPress={() => selectAllFromDate(date)}
                  style={{ width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: allSelected ? colors.primary : colors.border, backgroundColor: allSelected ? colors.primary : "transparent", alignItems: "center", justifyContent: "center" }}>
                  {allSelected && <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>✓</Text>}
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 15 }}>{formatDate(date)}</Text>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>{dateMeals.length} öğün · 🔥 {totalCals} kcal</Text>
                </View>
                <Text style={{ color: colors.primary }}>{selectedDate === date ? "▲" : "▼"}</Text>
              </TouchableOpacity>

              {/* Öğünler */}
              {selectedDate === date && dateMeals.map(meal => {
                const isSelected = selectedMeals.includes(meal.id);
                return (
                  <TouchableOpacity key={meal.id} onPress={() => toggleMeal(meal.id)}
                    style={{ backgroundColor: isSelected ? colors.primary + "15" : colors.surface, borderRadius: 10, padding: 12, borderWidth: isSelected ? 2 : 1, borderColor: isSelected ? colors.primary : colors.border, flexDirection: "row", alignItems: "center", gap: 10, marginLeft: 16 }}>
                    <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: isSelected ? colors.primary : colors.border, backgroundColor: isSelected ? colors.primary : "transparent", alignItems: "center", justifyContent: "center" }}>
                      {isSelected && <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>✓</Text>}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: "600", color: colors.foreground, fontSize: 13 }}>{MEAL_LABELS[meal.type] || meal.type}</Text>
                      <Text style={{ color: colors.muted, fontSize: 12 }} numberOfLines={1}>{meal.description}</Text>
                    </View>
                    <Text style={{ color: colors.primary, fontWeight: "700" }}>{meal.calories} kcal</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}

        {/* Kopyala butonu (alt) */}
        {selectedMeals.length > 0 && (
          <TouchableOpacity onPress={copyMeals}
            style={{ paddingVertical: 16, borderRadius: 12, alignItems: "center", backgroundColor: colors.primary }}>
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
              📋 {selectedMeals.length} Öğünü {targetDate === "today" ? "Bugüne" : "Yarına"} Kopyala
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
