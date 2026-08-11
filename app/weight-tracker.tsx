import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, Dimensions } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { BackButton } from "@/components/back-button";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const WEIGHT_KEY = "weight_log_v2";
const { width } = Dimensions.get("window");
const CHART_WIDTH = width - 64;
const CHART_HEIGHT = 160;

interface WeightLog { id: string; weight: number; date: string; note: string; }

const MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

function formatDate(s: string) {
  const d = new Date(s + "T00:00:00");
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export default function WeightTrackerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [newWeight, setNewWeight] = useState("");
  const [newNote, setNewNote] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [period, setPeriod] = useState<"week" | "month" | "all">("month");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const saved = await AsyncStorage.getItem(WEIGHT_KEY);
    if (saved) setLogs(JSON.parse(saved));
    else {
      // Demo veri
      const demo: WeightLog[] = [
        { id: "1", weight: 82.5, date: "2026-07-01", note: "" },
        { id: "2", weight: 82.0, date: "2026-07-08", note: "İyi gidiyor" },
        { id: "3", weight: 81.3, date: "2026-07-15", note: "" },
        { id: "4", weight: 80.8, date: "2026-07-22", note: "Spor başladı" },
        { id: "5", weight: 80.2, date: "2026-07-29", note: "" },
        { id: "6", weight: 79.8, date: "2026-08-05", note: "Hedefte ilerliyorum" },
      ];
      setLogs(demo);
      await AsyncStorage.setItem(WEIGHT_KEY, JSON.stringify(demo));
    }
  };

  const saveLogs = async (list: WeightLog[]) => {
    setLogs(list);
    await AsyncStorage.setItem(WEIGHT_KEY, JSON.stringify(list));
  };

  const addWeight = async () => {
    if (!newWeight || isNaN(Number(newWeight))) { Alert.alert("Hata", "Geçerli kilo girin"); return; }
    const today = new Date().toISOString().split("T")[0];
    const existing = logs.find(l => l.date === today);
    if (existing) {
      Alert.alert("Güncelle", "Bugün zaten kilo girdiniz. Güncellemek istiyor musunuz?", [
        { text: "İptal", style: "cancel" },
        { text: "Güncelle", onPress: () => saveLogs(logs.map(l => l.date === today ? { ...l, weight: Number(newWeight), note: newNote } : l)) }
      ]);
    } else {
      const log: WeightLog = { id: Date.now().toString(), weight: Number(newWeight), date: today, note: newNote };
      await saveLogs([...logs, log].sort((a, b) => a.date.localeCompare(b.date)));
    }
    setNewWeight(""); setNewNote("");
    Alert.alert("✅ Kaydedildi");
  };

  const getFilteredLogs = () => {
    const now = new Date();
    const cutoff = new Date(now);
    if (period === "week") cutoff.setDate(now.getDate() - 7);
    else if (period === "month") cutoff.setDate(now.getDate() - 30);
    else return logs;
    const cutoffStr = cutoff.toISOString().split("T")[0];
    return logs.filter(l => l.date >= cutoffStr);
  };

  const filtered = getFilteredLogs();
  const current = filtered.length > 0 ? filtered[filtered.length - 1].weight : null;
  const first = filtered.length > 0 ? filtered[0].weight : null;
  const change = current && first ? (current - first).toFixed(1) : null;
  const minW = filtered.length > 0 ? Math.min(...filtered.map(l => l.weight)) - 1 : 0;
  const maxW = filtered.length > 0 ? Math.max(...filtered.map(l => l.weight)) + 1 : 100;
  const range = maxW - minW;

  const getY = (w: number) => CHART_HEIGHT - ((w - minW) / range) * CHART_HEIGHT;

  return (
    <ScreenContainer>
      <BackButton title="⚖️ Kilo Takibi" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: Math.max(insets.bottom + 24, 32) }}>

        {/* Özet Kartlar */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          {[
            { label: "Mevcut", value: current ? `${current} kg` : "—", color: colors.primary, icon: "⚖️" },
            { label: "Değişim", value: change ? `${Number(change) > 0 ? "+" : ""}${change} kg` : "—", color: Number(change) < 0 ? "#22c55e" : "#f97316", icon: Number(change) < 0 ? "📉" : "📈" },
            { label: "Hedef", value: targetWeight ? `${targetWeight} kg` : "—", color: "#8b5cf6", icon: "🎯" },
          ].map(item => (
            <View key={item.label} style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: item.color + "40", gap: 4 }}>
              <Text style={{ fontSize: 20 }}>{item.icon}</Text>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: item.color }}>{item.value}</Text>
              <Text style={{ fontSize: 11, color: colors.muted }}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Hedef Kilo */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={{ color: colors.foreground, fontWeight: "600" }}>🎯 Hedef Kilo (kg)</Text>
          <TextInput value={targetWeight} onChangeText={setTargetWeight} placeholder="örn: 75" keyboardType="numeric" placeholderTextColor={colors.muted}
            style={{ flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10, color: colors.foreground, backgroundColor: colors.background, textAlign: "center", fontWeight: "700" }} />
        </View>

        {/* Grafik */}
        {filtered.length > 1 && (
          <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontWeight: "700", color: colors.foreground }}>📊 Kilo Grafiği</Text>
              <View style={{ flexDirection: "row", gap: 6 }}>
                {[{ k: "week", l: "7G" }, { k: "month", l: "30G" }, { k: "all", l: "Tümü" }].map(p => (
                  <TouchableOpacity key={p.k} onPress={() => setPeriod(p.k as any)}
                    style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: period === p.k ? colors.primary : colors.background, borderWidth: 1, borderColor: period === p.k ? colors.primary : colors.border }}>
                    <Text style={{ color: period === p.k ? "#fff" : colors.foreground, fontSize: 11, fontWeight: "600" }}>{p.l}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* SVG benzeri çizgi grafik */}
            <View style={{ height: CHART_HEIGHT + 30, position: "relative" }}>
              {/* Y eksen çizgileri */}
              {[0, 0.25, 0.5, 0.75, 1].map(pct => (
                <View key={pct} style={{ position: "absolute", top: pct * CHART_HEIGHT, left: 0, right: 0, flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ fontSize: 9, color: colors.muted, width: 32 }}>{(maxW - pct * range).toFixed(1)}</Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: colors.border + "60" }} />
                </View>
              ))}

              {/* Noktalar ve çizgiler */}
              <View style={{ position: "absolute", left: 36, right: 0, top: 0, height: CHART_HEIGHT }}>
                {filtered.map((log, i) => {
                  const x = filtered.length > 1 ? (i / (filtered.length - 1)) * (CHART_WIDTH - 36) : (CHART_WIDTH - 36) / 2;
                  const y = getY(log.weight);
                  return (
                    <View key={log.id}>
                      {/* Nokta */}
                      <View style={{ position: "absolute", left: x - 6, top: y - 6, width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary, borderWidth: 2, borderColor: "#fff" }} />
                      {/* Etiket */}
                      <Text style={{ position: "absolute", left: x - 16, top: y + 8, fontSize: 9, color: colors.primary, fontWeight: "700", width: 32, textAlign: "center" }}>{log.weight}</Text>
                    </View>
                  );
                })}
              </View>

              {/* X eksen tarihleri */}
              <View style={{ position: "absolute", bottom: 0, left: 36, right: 0, flexDirection: "row", justifyContent: "space-between" }}>
                {filtered.filter((_, i) => i === 0 || i === filtered.length - 1 || (filtered.length <= 6)).map((log, i) => (
                  <Text key={log.id} style={{ fontSize: 9, color: colors.muted }}>{formatDate(log.date)}</Text>
                ))}
              </View>
            </View>

            {/* Hedef çizgisi notu */}
            {targetWeight && <Text style={{ color: "#8b5cf6", fontSize: 12 }}>🎯 Hedefiniz: {targetWeight} kg · Kalan: {(Number(current) - Number(targetWeight)).toFixed(1)} kg</Text>}
          </View>
        )}

        {/* Yeni Kilo Ekle */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 12 }}>
          <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>+ Kilo Ekle</Text>
          <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            <TextInput value={newWeight} onChangeText={setNewWeight} placeholder="örn: 80.5" keyboardType="numeric" placeholderTextColor={colors.muted}
              style={{ flex: 1, borderWidth: 2, borderColor: colors.primary, borderRadius: 10, padding: 14, color: colors.foreground, backgroundColor: colors.background, fontSize: 20, textAlign: "center", fontWeight: "700" }} />
            <Text style={{ color: colors.muted, fontSize: 16 }}>kg</Text>
          </View>
          <TextInput value={newNote} onChangeText={setNewNote} placeholder="Not ekleyin (isteğe bağlı)" placeholderTextColor={colors.muted}
            style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.foreground, backgroundColor: colors.background }} />
          <TouchableOpacity onPress={addWeight} style={{ paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: colors.primary }}>
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>💾 Kaydet</Text>
          </TouchableOpacity>
        </View>

        {/* Geçmiş */}
        {logs.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>📋 Kilo Geçmişi</Text>
            {[...logs].reverse().slice(0, 10).map((log, i) => {
              const prev = [...logs].reverse()[i + 1];
              const diff = prev ? (log.weight - prev.weight).toFixed(1) : null;
              return (
                <View key={log.id} style={{ backgroundColor: colors.surface, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "700", color: colors.foreground }}>{log.weight} kg</Text>
                    <Text style={{ color: colors.muted, fontSize: 12 }}>📅 {formatDate(log.date)}</Text>
                    {log.note ? <Text style={{ color: colors.muted, fontSize: 12 }}>{log.note}</Text> : null}
                  </View>
                  {diff && (
                    <Text style={{ fontWeight: "700", color: Number(diff) < 0 ? "#22c55e" : "#f97316", fontSize: 13 }}>
                      {Number(diff) > 0 ? "+" : ""}{diff} kg
                    </Text>
                  )}
                  <TouchableOpacity onPress={() => Alert.alert("Sil", "", [{ text: "İptal", style: "cancel" }, { text: "Sil", style: "destructive", onPress: () => saveLogs(logs.filter(l => l.id !== log.id)) }])}>
                    <Text style={{ color: "#ef4444", fontSize: 12 }}>Sil</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
