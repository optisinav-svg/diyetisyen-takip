import { ScrollView, Text, View, TouchableOpacity, Alert } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WATER_KEY = "water_intake_today";
const WATER_GOAL_KEY = "water_goal_ml";

const AMOUNTS = [150, 200, 250, 300, 500];

export default function WaterIntakeScreen() {
  const colors = useColors();
  const [totalMl, setTotalMl] = useState(0);
  const [goalMl, setGoalMl] = useState(2000);
  const [logs, setLogs] = useState<{ amount: number; time: string }[]>([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const today = new Date().toISOString().split("T")[0];
    const saved = await AsyncStorage.getItem(`${WATER_KEY}_${today}`);
    if (saved) {
      const data = JSON.parse(saved);
      setLogs(data);
      setTotalMl(data.reduce((s: number, l: any) => s + l.amount, 0));
    }
    const goal = await AsyncStorage.getItem(WATER_GOAL_KEY);
    if (goal) setGoalMl(Number(goal));
  };

  const addWater = async (amount: number) => {
    const today = new Date().toISOString().split("T")[0];
    const entry = { amount, time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) };
    const updated = [...logs, entry];
    setLogs(updated);
    const newTotal = totalMl + amount;
    setTotalMl(newTotal);
    await AsyncStorage.setItem(`${WATER_KEY}_${today}`, JSON.stringify(updated));
    if (newTotal >= goalMl) Alert.alert("🎉 Tebrikler!", "Günlük su hedefinize ulaştınız!");
  };

  const pct = Math.min((totalMl / goalMl) * 100, 100);
  const remaining = Math.max(goalMl - totalMl, 0);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground }}>💧 Su Takibi</Text>

        {/* Dairesel ilerleme */}
        <View style={{ alignItems: "center", gap: 8 }}>
          <View style={{
            width: 160, height: 160, borderRadius: 80,
            borderWidth: 12, borderColor: colors.border,
            alignItems: "center", justifyContent: "center",
            backgroundColor: colors.surface,
          }}>
            <View style={{
              position: "absolute", width: 160, height: 160, borderRadius: 80,
              borderWidth: 12, borderColor: "#3b82f6",
              opacity: pct / 100,
            }} />
            <Text style={{ fontSize: 28, fontWeight: "bold", color: "#3b82f6" }}>{totalMl} ml</Text>
            <Text style={{ fontSize: 12, color: colors.muted }}>/ {goalMl} ml</Text>
          </View>
          <Text style={{ color: colors.muted }}>
            {remaining > 0 ? `${remaining} ml daha için` : "✅ Hedef tamamlandı!"}
          </Text>
        </View>

        {/* İlerleme çubuğu */}
        <View style={{ height: 16, backgroundColor: colors.border, borderRadius: 8 }}>
          <View style={{ height: 16, backgroundColor: "#3b82f6", borderRadius: 8, width: `${pct}%` }} />
        </View>

        {/* Hızlı ekle */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontWeight: "700", color: colors.foreground }}>💧 Su Ekle</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {AMOUNTS.map(a => (
              <TouchableOpacity key={a} onPress={() => addWater(a)}
                style={{
                  paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12,
                  backgroundColor: "#3b82f620", borderWidth: 2, borderColor: "#3b82f6",
                }}>
                <Text style={{ color: "#3b82f6", fontWeight: "700", fontSize: 15 }}>{a} ml</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Günlük log */}
        {logs.length > 0 && (
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, gap: 6, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontWeight: "700", color: colors.foreground }}>📋 Bugünkü İçimler</Text>
            {[...logs].reverse().map((log, i) => (
              <View key={i} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: colors.foreground }}>💧 {log.amount} ml</Text>
                <Text style={{ color: colors.muted }}>{log.time}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
