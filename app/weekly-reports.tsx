import { BackButton } from "@/components/back-button";
import { ScrollView, Text, View, TouchableOpacity, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useEffect, useState } from "react";
import { getUserRegistration } from "@/lib/_core/user-registration";

interface WeeklyReport {
  id: string;
  weekStart: string;
  weekEnd: string;
  clientName: string;
  avgCalories: number;
  avgProtein: number;
  avgWater: number;
  avgSteps: number;
  avgSleep: number;
  adherenceRate: number;
  weightChange: number;
  summary: string;
}

const SAMPLE_REPORTS: WeeklyReport[] = [
  {
    id: "1", weekStart: "2026-06-02", weekEnd: "2026-06-08",
    clientName: "Ayşe Yılmaz", avgCalories: 1850, avgProtein: 142,
    avgWater: 1800, avgSteps: 8234, avgSleep: 7.2, adherenceRate: 88,
    weightChange: -0.5, summary: "Kalori hedefine %88 uyum sağlandı. Su tüketimi artırılmalı.",
  },
  {
    id: "2", weekStart: "2026-05-26", weekEnd: "2026-06-01",
    clientName: "Ayşe Yılmaz", avgCalories: 1920, avgProtein: 155,
    avgWater: 2000, avgSteps: 9100, avgSleep: 7.5, adherenceRate: 92,
    weightChange: -0.3, summary: "Mükemmel bir hafta! Tüm hedefler neredeyse tam olarak tutturuldu.",
  },
  {
    id: "3", weekStart: "2026-06-02", weekEnd: "2026-06-08",
    clientName: "Mehmet Demir", avgCalories: 2100, avgProtein: 168,
    avgWater: 1600, avgSteps: 11000, avgSleep: 6.8, adherenceRate: 75,
    weightChange: 0.2, summary: "Aktivite yüksek ama uyku süresi yetersiz. Su alımı artırılmalı.",
  },
];

export default function WeeklyReportsScreen() {
  const colors = useColors();
  const [role, setRole] = useState<"dietitian" | "client">("client");
  const [selectedClient, setSelectedClient] = useState("Ayşe Yılmaz");
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null);

  const CLIENTS = ["Ayşe Yılmaz", "Mehmet Demir", "Fatma Kaya"];

  useEffect(() => { loadUser(); }, []);
  const loadUser = async () => {
    const user = await getUserRegistration();
    setRole(user?.role ?? "client");
  };

  const visibleReports = role === "dietitian"
    ? SAMPLE_REPORTS.filter(r => r.clientName === selectedClient)
    : SAMPLE_REPORTS.filter(r => r.clientName === "Ayşe Yılmaz");

  if (selectedReport) {
    return (
      <ScreenContainer>
        <BackButton title="Haftalık Rapor" onBack={() => setSelectedReport(null)} />
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
          <View style={{ backgroundColor: colors.primary + "20", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.primary }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.primary }}>
              📅 {selectedReport.weekStart} — {selectedReport.weekEnd}
            </Text>
            <Text style={{ color: colors.foreground, marginTop: 4 }}>👤 {selectedReport.clientName}</Text>
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {[
              { icon: "🔥", label: "Ort. Kalori", value: `${selectedReport.avgCalories} kcal` },
              { icon: "🥩", label: "Ort. Protein", value: `${selectedReport.avgProtein}g` },
              { icon: "💧", label: "Ort. Su", value: `${selectedReport.avgWater}ml` },
              { icon: "👟", label: "Ort. Adım", value: selectedReport.avgSteps.toLocaleString() },
              { icon: "😴", label: "Ort. Uyku", value: `${selectedReport.avgSleep} saat` },
              { icon: "⚖️", label: "Kilo Değişim", value: `${selectedReport.weightChange > 0 ? "+" : ""}${selectedReport.weightChange} kg` },
            ].map(item => (
              <View key={item.label} style={{
                width: "47%", backgroundColor: colors.surface, borderRadius: 10, padding: 12,
                borderWidth: 1, borderColor: colors.border, gap: 4,
              }}>
                <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.primary }}>{item.value}</Text>
                <Text style={{ fontSize: 11, color: colors.muted }}>{item.label}</Text>
              </View>
            ))}
          </View>

          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 8 }}>
            <Text style={{ fontWeight: "700", color: colors.foreground }}>🎯 Uyum Oranı</Text>
            <Text style={{ fontSize: 32, fontWeight: "bold", color: selectedReport.adherenceRate >= 85 ? "#22c55e" : selectedReport.adherenceRate >= 70 ? "#f97316" : "#ef4444" }}>
              {selectedReport.adherenceRate}%
            </Text>
            <View style={{ height: 12, backgroundColor: colors.border, borderRadius: 6 }}>
              <View style={{
                height: 12, borderRadius: 6, width: `${selectedReport.adherenceRate}%`,
                backgroundColor: selectedReport.adherenceRate >= 85 ? "#22c55e" : selectedReport.adherenceRate >= 70 ? "#f97316" : "#ef4444",
              }} />
            </View>
          </View>

          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontWeight: "700", color: colors.foreground, marginBottom: 8 }}>💬 Haftalık Özet</Text>
            <Text style={{ color: colors.foreground, lineHeight: 22 }}>{selectedReport.summary}</Text>
          </View>

          <TouchableOpacity onPress={() => Alert.alert("Paylaşıldı", "Rapor paylaşıldı.")}
            style={{ paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: colors.primary }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>📤 Raporu Paylaş</Text>
          </TouchableOpacity>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <BackButton title="📅 Haftalık Raporlar" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>

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
                  <Text style={{ color: selectedClient === c ? "#fff" : colors.foreground, fontWeight: "600" }}>👤 {c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}

        {visibleReports.length === 0 ? (
          <Text style={{ color: colors.muted, textAlign: "center", marginTop: 20 }}>Henüz rapor yok.</Text>
        ) : visibleReports.map(report => (
          <TouchableOpacity key={report.id} onPress={() => setSelectedReport(report)}
            style={{
              backgroundColor: colors.surface, borderRadius: 12, padding: 16, gap: 8,
              borderWidth: 1, borderColor: colors.border,
            }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View>
                <Text style={{ fontWeight: "700", color: colors.foreground }}>
                  📅 {report.weekStart} — {report.weekEnd}
                </Text>
                {role === "dietitian" && (
                  <Text style={{ color: colors.muted, fontSize: 12 }}>👤 {report.clientName}</Text>
                )}
              </View>
              <View style={{
                backgroundColor: report.adherenceRate >= 85 ? "#22c55e20" : report.adherenceRate >= 70 ? "#f9731620" : "#ef444420",
                paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
              }}>
                <Text style={{
                  fontWeight: "700", fontSize: 14,
                  color: report.adherenceRate >= 85 ? "#22c55e" : report.adherenceRate >= 70 ? "#f97316" : "#ef4444",
                }}>
                  {report.adherenceRate}%
                </Text>
              </View>
            </View>
            <Text style={{ color: colors.muted, fontSize: 13 }} numberOfLines={2}>{report.summary}</Text>
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "600" }}>Detayları Gör →</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}
