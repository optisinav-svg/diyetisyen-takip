import { ScrollView, Text, View, TouchableOpacity, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { BackButton } from "@/components/back-button";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getMyClients, ClientRecord } from "@/lib/_core/clients-store";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MEALS_KEY = "meals_v3";
const WEIGHT_KEY = "weight_log_v2";

export default function DataExportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [role, setRole] = useState<"dietitian" | "client">("client");
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [selClient, setSelClient] = useState<ClientRecord | null>(null);
  const [meals, setMeals] = useState<any[]>([]);
  const [weights, setWeights] = useState<any[]>([]);
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const s = await AsyncStorage.getItem("session_v3");
    if (s) setRole(JSON.parse(s).role ?? "client");
    const c = await getMyClients();
    setClients(c);
    if (c.length > 0) setSelClient(c[0]);
    const m = await AsyncStorage.getItem(MEALS_KEY);
    if (m) setMeals(JSON.parse(m));
    const w = await AsyncStorage.getItem(WEIGHT_KEY);
    if (w) setWeights(JSON.parse(w));
  };

  const exportCSV = async (type: "meals" | "weight") => {
    setExporting(type);
    try {
      let csv = "";
      let filename = "";

      if (type === "meals") {
        csv = "Tarih,Öğün Tipi,Açıklama,Kalori\n";
        const labels: Record<string, string> = { breakfast: "Kahvaltı", lunch: "Öğle", dinner: "Akşam", snack: "Ara Öğün" };
        meals.forEach(m => {
          csv += `${m.date},${labels[m.type] ?? m.type},"${m.description?.replace(/"/g, "'") ?? ""}",${m.calories ?? 0}\n`;
        });
        filename = `ogunler_${new Date().toISOString().split("T")[0]}.csv`;
      } else {
        csv = "Tarih,Kilo (kg),Not\n";
        weights.forEach(w => {
          csv += `${w.date},${w.weight},"${w.note?.replace(/"/g, "'") ?? ""}"\n`;
        });
        filename = `kilo_${new Date().toISOString().split("T")[0]}.csv`;
      }

      // CSV'yi HTML içine göm ve PDF olarak paylaş
      const html = `<html><body><pre style="font-family:monospace;font-size:12px;">${csv}</pre></body></html>`;
      const { uri } = await Print.printToFileAsync({ html });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, { mimeType: "text/csv", dialogTitle: `${filename} Dışa Aktar` });
      } else {
        Alert.alert("✅ Dışa Aktarıldı", `Dosya: ${uri}`);
      }
    } catch (e) {
      Alert.alert("Hata", "Dışa aktarma sırasında hata oluştu.");
    }
    setExporting(null);
  };

  const exportAllPDF = async () => {
    setExporting("pdf");
    try {
      const clientName = selClient?.name ?? "Danışan";
      const today = new Date().toLocaleDateString("tr-TR");
      const totalCals = meals.reduce((s, m) => s + (m.calories || 0), 0);
      const avgCals = meals.length > 0 ? Math.round(totalCals / Math.max(new Set(meals.map(m => m.date)).size, 1)) : 0;
      const lastWeight = weights.length > 0 ? weights[weights.length - 1].weight : null;
      const firstWeight = weights.length > 0 ? weights[0].weight : null;

      const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; margin: 40px; color: #333; font-size: 13px; }
  h1 { color: #2563eb; font-size: 22px; border-bottom: 2px solid #2563eb; padding-bottom: 8px; }
  h2 { color: #1e40af; font-size: 16px; margin-top: 24px; margin-bottom: 8px; }
  .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 16px 0; }
  .stat { background: #eff6ff; border-radius: 8px; padding: 10px; text-align: center; }
  .stat-v { font-size: 20px; font-weight: bold; color: #2563eb; }
  .stat-l { font-size: 11px; color: #64748b; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0; }
  th { background: #2563eb; color: #fff; padding: 7px 10px; font-size: 12px; text-align: left; }
  td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
  tr:nth-child(even) td { background: #f8faff; }
  .footer { margin-top: 30px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px; }
</style>
</head>
<body>
<h1>🥗 Diyetisyen Takip — Tam Veri Raporu</h1>
<p><strong>Danışan:</strong> ${clientName} &nbsp;&nbsp; <strong>Tarih:</strong> ${today}</p>

<h2>📊 Özet</h2>
<div class="grid">
  <div class="stat"><div class="stat-v">${meals.length}</div><div class="stat-l">Toplam Öğün</div></div>
  <div class="stat"><div class="stat-v">${avgCals}</div><div class="stat-l">Ort. Kalori/Gün</div></div>
  <div class="stat"><div class="stat-v">${lastWeight ?? "—"}</div><div class="stat-l">Son Kilo (kg)</div></div>
  <div class="stat"><div class="stat-v">${firstWeight && lastWeight ? (lastWeight - firstWeight).toFixed(1) : "—"}</div><div class="stat-l">Kilo Değişimi</div></div>
</div>

<h2>🍽️ Öğün Kayıtları (Son 50)</h2>
<table>
  <tr><th>Tarih</th><th>Öğün</th><th>İçerik</th><th>Kalori</th></tr>
  ${[...meals].reverse().slice(0, 50).map(m => {
    const labels: Record<string, string> = { breakfast: "🌅 Kahvaltı", lunch: "☀️ Öğle", dinner: "🌙 Akşam", snack: "🍎 Ara" };
    return `<tr><td>${m.date}</td><td>${labels[m.type] ?? m.type}</td><td>${(m.description ?? "").substring(0, 40)}</td><td>${m.calories ?? 0} kcal</td></tr>`;
  }).join("")}
</table>

${weights.length > 0 ? `
<h2>⚖️ Kilo Takibi</h2>
<table>
  <tr><th>Tarih</th><th>Kilo (kg)</th><th>Not</th></tr>
  ${weights.map(w => `<tr><td>${w.date}</td><td>${w.weight} kg</td><td>${w.note ?? ""}</td></tr>`).join("")}
</table>` : ""}

<div class="footer">
  Diyetisyen Takip uygulaması · ${today} · Gizli bilgi
</div>
</body>
</html>`;

      const { uri } = await Print.printToFileAsync({ html });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Tüm Verileri Paylaş", UTI: "com.adobe.pdf" });
      } else {
        Alert.alert("✅ Oluşturuldu", `Dosya: ${uri}`);
      }
    } catch (e) {
      Alert.alert("Hata", "PDF oluşturulurken hata oluştu.");
    }
    setExporting(null);
  };

  const EXPORT_OPTIONS = [
    { id: "meals", icon: "🍽️", title: "Öğün Kayıtları (CSV)", desc: `${meals.length} öğün verisi`, color: "#22c55e", action: () => exportCSV("meals") },
    { id: "weight", icon: "⚖️", title: "Kilo Takibi (CSV)", desc: `${weights.length} kilo kaydı`, color: "#3b82f6", action: () => exportCSV("weight") },
    { id: "pdf", icon: "📄", title: "Tüm Veriler (PDF)", desc: "Öğün + kilo + özet raporu", color: "#ef4444", action: exportAllPDF },
  ];

  return (
    <ScreenContainer>
      <BackButton title="📤 Veri Dışa Aktar" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: Math.max(insets.bottom + 24, 32) }}>

        {/* Danışan seçimi */}
        {role === "dietitian" && (
          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: "700", color: colors.foreground }}>👤 Danışan</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {clients.map(c => (
                  <TouchableOpacity key={c.id} onPress={() => setSelClient(c)}
                    style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: selClient?.id === c.id ? colors.primary : colors.surface, borderWidth: 1, borderColor: selClient?.id === c.id ? colors.primary : colors.border }}>
                    <Text style={{ color: selClient?.id === c.id ? "#fff" : colors.foreground, fontWeight: "600" }}>👤 {c.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Özet */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          {[
            { icon: "🍽️", value: meals.length, label: "Öğün" },
            { icon: "⚖️", value: weights.length, label: "Kilo Kaydı" },
            { icon: "📅", value: new Set(meals.map(m => m.date)).size, label: "Aktif Gün" },
          ].map(item => (
            <View key={item.label} style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border, alignItems: "center", gap: 4 }}>
              <Text style={{ fontSize: 24 }}>{item.icon}</Text>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.primary }}>{item.value}</Text>
              <Text style={{ fontSize: 11, color: colors.muted }}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Dışa aktarma seçenekleri */}
        <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>📤 Dışa Aktarma Seçenekleri</Text>
        {EXPORT_OPTIONS.map(opt => (
          <TouchableOpacity key={opt.id} onPress={opt.action} disabled={exporting !== null}
            style={{ backgroundColor: exporting === opt.id ? colors.border : opt.color + "15", borderRadius: 14, padding: 16, borderWidth: 2, borderColor: exporting === opt.id ? colors.border : opt.color, flexDirection: "row", alignItems: "center", gap: 14 }}>
            <Text style={{ fontSize: 36 }}>{opt.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 15 }}>{opt.title}</Text>
              <Text style={{ color: colors.muted, fontSize: 13 }}>{opt.desc}</Text>
            </View>
            <View style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: exporting === opt.id ? colors.border : opt.color }}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
                {exporting === opt.id ? "⏳..." : "İndir"}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ backgroundColor: colors.surface, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 20 }}>
            ℹ️ Dışa aktarılan dosyalar paylaşma ekranı üzerinden email, WhatsApp veya cihaza kaydedilebilir.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
