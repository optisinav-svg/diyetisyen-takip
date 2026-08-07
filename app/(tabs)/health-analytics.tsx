import { ScrollView, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useState, useEffect } from 'react';
import { useColors } from '@/hooks/use-colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const WEARABLE_KEY = "wearable_data";

interface HealthData {
  date: string;
  steps: number;
  heartRate: number;
  calories: number;
  sleep: number;
}

const SAMPLE_DATA: HealthData[] = [
  { date: 'Pzt', steps: 8234, heartRate: 72, calories: 450, sleep: 7.5 },
  { date: 'Sal', steps: 10521, heartRate: 68, calories: 580, sleep: 8.0 },
  { date: 'Çar', steps: 6234, heartRate: 75, calories: 320, sleep: 6.5 },
  { date: 'Per', steps: 12043, heartRate: 70, calories: 720, sleep: 7.8 },
  { date: 'Cum', steps: 9876, heartRate: 73, calories: 510, sleep: 7.2 },
  { date: 'Cmt', steps: 15234, heartRate: 65, calories: 890, sleep: 8.5 },
  { date: 'Paz', steps: 11234, heartRate: 69, calories: 650, sleep: 8.0 },
];

type Metric = 'steps' | 'heartRate' | 'calories' | 'sleep';

const METRICS = [
  { key: 'steps' as Metric, label: '👟 Adım', color: '#3b82f6', unit: 'adım', max: 20000 },
  { key: 'heartRate' as Metric, label: '❤️ Kalp', color: '#ef4444', unit: 'bpm', max: 120 },
  { key: 'calories' as Metric, label: '🔥 Kalori', color: '#f97316', unit: 'kcal', max: 1200 },
  { key: 'sleep' as Metric, label: '😴 Uyku', color: '#8b5cf6', unit: 'saat', max: 12 },
];

export default function HealthAnalyticsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [selectedMetric, setSelectedMetric] = useState<Metric>('steps');
  const [wearableData, setWearableData] = useState<any>(null);
  const [chartData, setChartData] = useState(SAMPLE_DATA);
  const { width } = Dimensions.get('window');

  useEffect(() => { loadWearableData(); }, []);

  const loadWearableData = async () => {
    const data = await AsyncStorage.getItem(WEARABLE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      setWearableData(parsed);
      // Bugünün verisini güncelle
      const today = { ...SAMPLE_DATA[6], steps: parsed.steps, heartRate: parsed.heartRate, calories: parsed.caloriesBurned, sleep: parsed.sleep };
      setChartData([...SAMPLE_DATA.slice(0, 6), today]);
    }
  };

  const metric = METRICS.find(m => m.key === selectedMetric)!;
  const barWidth = (width - 48) / chartData.length - 8;
  const chartHeight = 160;

  const todayValue = chartData[chartData.length - 1][selectedMetric];
  const avgValue = (chartData.reduce((s, d) => s + d[selectedMetric], 0) / chartData.length).toFixed(1);
  const maxValue = Math.max(...chartData.map(d => d[selectedMetric]));

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: colors.foreground }}>📊 Sağlık Analizi</Text>
          <TouchableOpacity onPress={() => router.push("/wearable-sync")}
            style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: wearableData ? "#22c55e" : colors.primary, fontSize: 12, fontWeight: "600" }}>
              {wearableData ? "⌚ Saat Bağlı" : "⌚ Saat Bağla"}
            </Text>
          </TouchableOpacity>
        </View>

        {wearableData && (
          <View style={{ backgroundColor: "#22c55e20", borderRadius: 10, padding: 12, borderWidth: 1, borderColor: "#22c55e" }}>
            <Text style={{ color: "#22c55e", fontWeight: "600", fontSize: 13 }}>
              ✅ Akıllı saat verileri senkronize edildi — son sync: {wearableData.lastSync}
            </Text>
          </View>
        )}

        {/* Metrik Seçimi */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {METRICS.map(m => (
              <TouchableOpacity key={m.key} onPress={() => setSelectedMetric(m.key)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20,
                  backgroundColor: selectedMetric === m.key ? m.color : colors.surface,
                  borderWidth: 2, borderColor: selectedMetric === m.key ? m.color : colors.border,
                }}>
                <Text style={{ color: selectedMetric === m.key ? "#fff" : colors.foreground, fontWeight: "600" }}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Özet Kartlar */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          {[
            { label: "Bugün", value: todayValue, color: metric.color },
            { label: "Ortalama", value: avgValue, color: colors.primary },
            { label: "En Yüksek", value: maxValue, color: "#22c55e" },
          ].map(card => (
            <View key={card.label} style={{
              flex: 1, backgroundColor: colors.surface, borderRadius: 10, padding: 12,
              borderWidth: 1, borderColor: colors.border, alignItems: "center", gap: 4,
            }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: card.color }}>{card.value}</Text>
              <Text style={{ fontSize: 11, color: colors.muted }}>{metric.unit}</Text>
              <Text style={{ fontSize: 12, color: colors.foreground }}>{card.label}</Text>
            </View>
          ))}
        </View>

        {/* Bar Chart */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontWeight: "700", color: colors.foreground, marginBottom: 12 }}>
            {metric.label} — Son 7 Gün
          </Text>
          <View style={{ flexDirection: "row", alignItems: "flex-end", height: chartHeight, gap: 8 }}>
            {chartData.map((d, i) => {
              const value = d[selectedMetric];
              const barH = (value / metric.max) * chartHeight;
              const isToday = i === chartData.length - 1;
              return (
                <View key={d.date} style={{ flex: 1, alignItems: "center", gap: 4 }}>
                  <Text style={{ fontSize: 10, color: metric.color, fontWeight: "600" }}>
                    {typeof value === 'number' && value > 999 ? `${(value/1000).toFixed(1)}k` : value}
                  </Text>
                  <View style={{
                    width: "100%", height: Math.max(barH, 4), borderRadius: 4,
                    backgroundColor: isToday ? metric.color : metric.color + "60",
                  }} />
                  <Text style={{ fontSize: 10, color: isToday ? metric.color : colors.muted, fontWeight: isToday ? "700" : "400" }}>
                    {d.date}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Bugünkü Saat Verileri */}
        {wearableData && (
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 10 }}>
            <Text style={{ fontWeight: "700", color: colors.foreground }}>⌚ Bugünkü Saat Verileri</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {[
                { icon: "👟", label: "Adım", value: wearableData.steps.toLocaleString(), unit: "adım", color: "#3b82f6", goal: 10000 },
                { icon: "❤️", label: "Kalp", value: wearableData.heartRate, unit: "bpm", color: "#ef4444", goal: null },
                { icon: "😴", label: "Uyku", value: wearableData.sleep, unit: "saat", color: "#8b5cf6", goal: 8 },
                { icon: "🔥", label: "Kalori", value: wearableData.caloriesBurned, unit: "kcal", color: "#f97316", goal: 500 },
              ].map(item => (
                <View key={item.label} style={{
                  flex: 1, minWidth: "45%", backgroundColor: item.color + "15",
                  borderRadius: 10, padding: 12, borderWidth: 1, borderColor: item.color + "40", gap: 2,
                }}>
                  <Text>{item.icon} {item.label}</Text>
                  <Text style={{ fontSize: 18, fontWeight: "bold", color: item.color }}>{item.value}</Text>
                  <Text style={{ fontSize: 11, color: colors.muted }}>{item.unit}</Text>
                  {item.goal && (
                    <View style={{ height: 4, backgroundColor: colors.border, borderRadius: 2, marginTop: 4 }}>
                      <View style={{
                        height: 4, backgroundColor: item.color, borderRadius: 2,
                        width: `${Math.min((Number(item.value.toString().replace(',','')) / item.goal) * 100, 100)}%`
                      }} />
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
