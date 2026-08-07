import { BackButton } from "@/components/back-button";
import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useEffect, useState } from "react";
import { getUserRegistration } from "@/lib/_core/user-registration";

interface Activity {
  id: string;
  type: "meal" | "goal" | "badge" | "appointment" | "message" | "weight";
  icon: string;
  title: string;
  description: string;
  time: string;
  color: string;
}

const SAMPLE_ACTIVITIES: Activity[] = [
  { id: "1", type: "goal", icon: "✅", title: "Hedef Tamamlandı", description: "Günlük su hedefi (2000ml) tamamlandı", time: "14:32", color: "#22c55e" },
  { id: "2", type: "meal", icon: "🍽️", title: "Öğün Eklendi", description: "Öğle yemeği: Tavuk, pirinç, salata (520 kcal)", time: "12:45", color: "#3b82f6" },
  { id: "3", type: "badge", icon: "🏆", title: "Rozet Kazanıldı", description: "Su Şampiyonu rozeti diyetisyeniniz tarafından verildi!", time: "11:20", color: "#f59e0b" },
  { id: "4", type: "appointment", icon: "📅", title: "Randevu Hatırlatması", description: "Yarın 10:00'da Dr. Ayşe Kaya ile randevunuz var", time: "09:00", color: "#8b5cf6" },
  { id: "5", type: "message", icon: "💬", title: "Yeni Mesaj", description: "Diyetisyeniniz: Protein alımını artırmaya devam et", time: "Dün 18:30", color: "#f97316" },
  { id: "6", type: "meal", icon: "🌅", title: "Kahvaltı Eklendi", description: "Kahvaltı: Yulaf, meyve, süt (320 kcal)", time: "Dün 08:15", color: "#3b82f6" },
  { id: "7", type: "weight", icon: "⚖️", title: "Kilo Kaydedildi", description: "Yeni kilo: 73.5 kg (-0.5 kg geçen haftadan)", time: "Dün 07:30", color: "#22c55e" },
  { id: "8", type: "goal", icon: "🎯", title: "Hedef Güncellendi", description: "Diyetisyeniniz günlük kalori hedefinizi güncelledi", time: "2 gün önce", color: "#22c55e" },
];

export default function ActivityFeedScreen() {
  const colors = useColors();
  const [activities] = useState<Activity[]>(SAMPLE_ACTIVITIES);
  const [filter, setFilter] = useState<string>("all");

  const FILTERS = [
    { key: "all", label: "Tümü" },
    { key: "meal", label: "🍽️ Öğün" },
    { key: "goal", label: "🎯 Hedef" },
    { key: "badge", label: "🏆 Rozet" },
    { key: "appointment", label: "📅 Randevu" },
    { key: "message", label: "💬 Mesaj" },
  ];

  const filtered = filter === "all" ? activities : activities.filter(a => a.type === filter);

  return (
    <ScreenContainer>
      <BackButton title="📢 Aktivite Akışı" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 4 }}>
            {FILTERS.map(f => (
              <TouchableOpacity key={f.key} onPress={() => setFilter(f.key)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                  backgroundColor: filter === f.key ? colors.primary : colors.surface,
                  borderWidth: 1, borderColor: filter === f.key ? colors.primary : colors.border,
                }}>
                <Text style={{ color: filter === f.key ? "#fff" : colors.foreground, fontWeight: "600", fontSize: 13 }}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {filtered.map(activity => (
          <View key={activity.id} style={{
            backgroundColor: colors.surface, borderRadius: 12, padding: 14,
            borderWidth: 1, borderColor: colors.border,
            flexDirection: "row", gap: 12, alignItems: "flex-start",
          }}>
            <View style={{
              width: 44, height: 44, borderRadius: 22,
              backgroundColor: activity.color + "20",
              alignItems: "center", justifyContent: "center",
            }}>
              <Text style={{ fontSize: 22 }}>{activity.icon}</Text>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontWeight: "700", color: colors.foreground }}>{activity.title}</Text>
              <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 18 }}>{activity.description}</Text>
              <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>🕐 {activity.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}
