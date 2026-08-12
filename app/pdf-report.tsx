import { ScrollView, Text, View, TouchableOpacity, Alert, Share } from "react-native";
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

export default function PDFReportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [role, setRole] = useState<"dietitian" | "client">("client");
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [selClient, setSelClient] = useState<ClientRecord | null>(null);
  const [period, setPeriod] = useState<30 | 60 | 90>(30);
  const [generating, setGenerating] = useState(false);
  const [meals, setMeals] = useState<any[]>([]);
  const [weights, setWeights] = useState<any[]>([]);

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

  const generateHTML = (client: ClientRecord | null, periodDays: number) => {
    const clientName = client?.name ?? "Danışan";
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - periodDays);
    const startStr = startDate.toISOString().split("T")[0];

    const periodMeals = meals.filter(m => m.date >= startStr);
    const totalCals = periodMeals.reduce((s: number, m: any) => s + (m.calories || 0), 0);
    const avgCals = periodMeals.length > 0 ? Math.round(totalCals / periodDays) : 0;
    const mealCount = periodMeals.length;

    const recentWeights = weights.filter(w => w.date >= startStr);
    const firstWeight = recentWeights.length > 0 ? recentWeights[0].weight : null;
    const lastWeight = recentWeights.length > 0 ? recentWeights[recentWeights.length - 1].weight : null;
    const weightChange = firstWeight && lastWeight ? (lastWeight - firstWeight).toFixed(1) : null;

    return `
<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
  h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
  h2 { color: #1e40af; margin-top: 30px; }
  .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
  .card { background: #f8faff; border: 1px solid #dbeafe; border-radius: 10px; padding: 16px; margin: 10px 0; }
  .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
  .stat { background: #eff6ff; border-radius: 8px; padding: 12px; text-align: center; }
  .stat-value { font-size: 24px; font-weight: bold; color: #2563eb; }
  .stat-label { font-size: 12px; color: #64748b; margin-top: 4px; }
  .green { color: #16a34a; } .red { color: #dc2626; } .orange { color: #ea580c; }
  table { width: 100%; border-collapse: collapse; margin: 15px 0; }
  th { background: #2563eb; color: white; padding: 8px 12px; text-align: left; }
  td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
  tr:nth-child(even) { background: #f8faff; }
  .footer { margin-top: 40px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
</style>
</head>
<body>
<h1>🥗 Diyetisyen Takip — Beslenme Raporu</h1>
<div class="header">
  <div>
    <strong>Danışan:</strong> ${clientName}<br>
    <strong>Dönem:</strong> ${periodDays} Günlük Rapor<br>
    <strong>Tarih Aralığı:</strong> ${startDate.toLocaleDateString("tr-TR")} — ${today.toLocaleDateString("tr-TR")}
  </div>
  <div style="text-align:right">
    <strong>Rapor Tarihi:</strong> ${today.toLocaleDateString("tr-TR")}<br>
    <strong>Saat:</strong> ${today.toLocaleTimeString("tr-TR")}
  </div>
</div>

<h2>📊 Genel Özet</h2>
<div class="stats">
  <div class="stat">
    <div class="stat-value">${mealCount}</div>
    <div class="stat-label">Toplam Öğün</div>
  </div>
  <div class="stat">
    <div class="stat-value">${avgCals}</div>
    <div class="stat-label">Ort. Günlük Kalori (kcal)</div>
  </div>
  <div class="stat">
    <div class="stat-value">${weightChange ? (Number(weightChange) > 0 ? "+" : "") + weightChange + " kg" : "—"}</div>
    <div class="stat-label">Kilo Değişimi</div>
  </div>
</div>

<h2>🍽️ Beslenme Analizi</h2>
<div class="card">
  <table>
    <tr><th>Öğün Tipi</th><th>Sayısı</th><th>Ort. Kalori</th></tr>
    <tr><td>🌅 Kahvaltı</td><td>${periodMeals.filter((m: any) => m.type === "breakfast").length}</td><td>${Math.round(periodMeals.filter((m: any) => m.type === "breakfast").reduce((s: number, m: any) => s + m.calories, 0) / Math.max(periodMeals.filter((m: any) => m.type === "breakfast").length, 1))} kcal</td></tr>
    <tr><td>☀️ Öğle</td><td>${periodMeals.filter((m: any) => m.type === "lunch").length}</td><td>${Math.round(periodMeals.filter((m: any) => m.type === "lunch").reduce((s: number, m: any) => s + m.calories, 0) / Math.max(periodMeals.filter((m: any) => m.type === "lunch").length, 1))} kcal</td></tr>
    <tr><td>🌙 Akşam</td><td>${periodMeals.filter((m: any) => m.type === "dinner").length}</td><td>${Math.round(periodMeals.filter((m: any) => m.type === "dinner").reduce((s: number, m: any) => s + m.calories, 0) / Math.max(periodMeals.filter((m: any) => m.type === "dinner").length, 1))} kcal</td></tr>
    <tr><td>🍎 Ara Öğün</td><td>${periodMeals.filter((m: any) => m.type === "snack").length}</td><td>${Math.round(periodMeals.filter((m: any) => m.type === "snack").reduce((s: number, m: any) => s + m.calories, 0) / Math.max(periodMeals.filter((m: any) => m.type === "snack").length, 1))} kcal</td></tr>
  </table>
</div>

${recentWeights.length > 0 ? `
<h2>⚖️ Kilo Takibi</h2>
<div class="card">
  <table>
    <tr><th>Tarih</th><th>Kilo (kg)</th><th>Değişim</th></tr>
    ${recentWeights.slice(-10).map((w: any, i: number) => {
      const prev = i > 0 ? recentWeights[i-1].weight : null;
      const diff = prev ? (w.weight - prev).toFixed(1) : null;
      return `<tr><td>${w.date}</td><td>${w.weight} kg</td><td>${diff ? `<span class="${Number(diff) < 0 ? "green" : "red"}">${Number(diff) > 0 ? "+" : ""}${diff} kg</span>` : "—"}</td></tr>`;
    }).join("")}
  </table>
</div>` : ""}

<h2>📋 Son Öğünler</h2>
<div class="card">
  <table>
    <tr><th>Tarih</th><th>Öğün</th><th>İçerik</th><th>Kalori</th></tr>
    ${periodMeals.slice(-15).reverse().map((m: any) => `
    <tr>
      <td>${m.date}</td>
      <td>${m.type === "breakfast" ? "🌅 Kahvaltı" : m.type === "lunch" ? "☀️ Öğle" : m.type === "dinner" ? "🌙 Akşam" : "🍎 Ara"}</td>
      <td>${m.description?.substring(0, 50) ?? "—"}</td>
      <td>${m.calories > 0 ? m.calories + " kcal" : "—"}</td>
    </tr>`).join("")}
  </table>
</div>

<div class="footer">
  Bu rapor Diyetisyen Takip uygulaması tarafından otomatik oluşturulmuştur.<br>
  Rapor tarihi: ${today.toLocaleDateString("tr-TR")} ${today.toLocaleTimeString("tr-TR")} · Gizli bilgi
</div>
</body>
</html>`;
  };

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const html = generateHTML(selClient, period);
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      setGenerating(false);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Raporu Paylaş",
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert("✅ PDF Oluşturuldu", `Dosya: ${uri}`);
      }
    } catch (e) {
      setGenerating(false);
      Alert.alert("Hata", "PDF oluşturulurken hata oluştu.");
    }
  };

  const previewReport = () => {
    const clientName = selClient?.name ?? "Danışan";
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - period);
    const startStr = startDate.toISOString().split("T")[0];
    const periodMeals = meals.filter(m => m.date >= startStr);
    const totalCals = periodMeals.reduce((s: number, m: any) => s + (m.calories || 0), 0);
    const avgCals = periodMeals.length > 0 ? Math.round(totalCals / period) : 0;

    Alert.alert(`📊 ${period} Günlük Rapor Önizleme`,
      `👤 Danışan: ${clientName}\n📅 Dönem: ${period} gün\n\n` +
      `🍽️ Toplam öğün: ${periodMeals.length}\n` +
      `🔥 Ort. günlük kalori: ${avgCals} kcal\n` +
      `📊 Toplam kalori: ${totalCals} kcal\n\n` +
      `PDF oluşturmak için "PDF Oluştur" butonuna basın.`
    );
  };

  return (
    <ScreenContainer>
      <BackButton title="📄 PDF Rapor" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: Math.max(insets.bottom + 24, 32) }}>

        {/* Danışan seçimi */}
        {role === "dietitian" && (
          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: "700", color: colors.foreground }}>👤 Danışan Seçin</Text>
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

        {/* Dönem seçimi */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 12 }}>
          <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>📅 Rapor Dönemi</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {[30, 60, 90].map(p => (
              <TouchableOpacity key={p} onPress={() => setPeriod(p as 30 | 60 | 90)}
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: period === p ? colors.primary : colors.surface, borderWidth: 2, borderColor: period === p ? colors.primary : colors.border }}>
                <Text style={{ fontSize: 24, fontWeight: "bold", color: period === p ? "#fff" : colors.foreground }}>{p}</Text>
                <Text style={{ color: period === p ? "rgba(255,255,255,0.8)" : colors.muted, fontSize: 12 }}>Günlük</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rapor içeriği */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 8 }}>
          <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>📋 Rapor İçeriği</Text>
          {[
            { icon: "🍽️", text: "Öğün detayları ve kalori analizi" },
            { icon: "📊", text: "Makro besin dağılımı" },
            { icon: "⚖️", text: "Kilo değişim grafiği" },
            { icon: "🎯", text: "Hedef uyum oranları" },
            { icon: "📅", text: "Günlük özet tablosu" },
          ].map(item => (
            <View key={item.icon} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Text style={{ fontSize: 18 }}>{item.icon}</Text>
              <Text style={{ color: colors.foreground, fontSize: 14 }}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* Önizleme ve Oluştur */}
        <TouchableOpacity onPress={previewReport}
          style={{ paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary }}>
          <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 15 }}>👁️ Raporu Önizle</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={generatePDF} disabled={generating}
          style={{ paddingVertical: 16, borderRadius: 12, alignItems: "center", backgroundColor: generating ? colors.border : "#ef4444" }}>
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
            {generating ? "⏳ PDF Oluşturuluyor..." : "📄 PDF Oluştur ve Paylaş"}
          </Text>
        </TouchableOpacity>

        <View style={{ backgroundColor: colors.surface, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 20 }}>
            ℹ️ PDF rapor oluştuktan sonra paylaşma ekranı açılır. Email, WhatsApp veya kaydet seçeneklerini kullanabilirsiniz.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
