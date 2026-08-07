import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, Modal, FlatList } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserRegistration } from "@/lib/_core/user-registration";

const MY_CLIENTS_KEY = "my_clients";
const HEALTH_CARDS_KEY = "health_cards";
const CLIENT_NOTES_KEY = "client_notes_dashboard";

// Sistemdeki kayıtlı ama eşleşmemiş danışanlar
const UNMATCHED_CLIENTS = [
  { id: "u1", name: "Zeynep Çelik", email: "zeynep@email.com", registeredAt: "2026-06-01" },
  { id: "u2", name: "Hasan Yıldız", email: "hasan@email.com", registeredAt: "2026-06-02" },
  { id: "u3", name: "Merve Kara", email: "merve@email.com", registeredAt: "2026-06-03" },
  { id: "u4", name: "Burak Şahin", email: "burak@email.com", registeredAt: "2026-06-04" },
  { id: "u5", name: "Selin Doğan", email: "selin@email.com", registeredAt: "2026-06-05" },
];

interface Client {
  id: string;
  name: string;
  email: string;
  addedAt: string;
  adherenceRate: number;
  status: "good" | "warning" | "critical";
  lastSeen: string;
}

interface HealthCard {
  clientId: string;
  diabetes: number;
  hypertension: number;
  heartDisease: number;
  obesity: number;
  kidneyDisease: number;
  thyroid: number;
  notes: string;
  updatedAt: string;
}

interface ClientNote {
  clientId: string;
  notes: { id: string; content: string; date: string }[];
}

type DashboardView = "clients" | "client-detail";
type ClientSection = "overview" | "health-cards" | "trend" | "meal-history" | "notes" | "adherence";

const STATUS_CONFIG = {
  good: { color: "#22c55e", label: "✅ İyi", bg: "#22c55e20" },
  warning: { color: "#f97316", label: "⚠️ Dikkat", bg: "#f9731620" },
  critical: { color: "#ef4444", label: "🔴 Kritik", bg: "#ef444420" },
};

const HEALTH_LEVELS = [
  { value: 0, label: "Yok" },
  { value: 1, label: "Hafif" },
  { value: 2, label: "Orta" },
  { value: 3, label: "Ağır" },
];

const HEALTH_CONDITIONS = [
  { key: "diabetes", label: "Diyabet", icon: "🍬" },
  { key: "hypertension", label: "Hipertansiyon", icon: "🩸" },
  { key: "heartDisease", label: "Kalp Hastalığı", icon: "❤️" },
  { key: "obesity", label: "Obezite", icon: "⚖️" },
  { key: "kidneyDisease", label: "Böbrek Hastalığı", icon: "🫘" },
  { key: "thyroid", label: "Tiroid", icon: "🦋" },
];

const SAMPLE_MEAL_HISTORY = [
  { date: "Bugün", type: "Kahvaltı", foods: "Yulaf, meyve, süt", calories: 320, adherent: true },
  { date: "Bugün", type: "Öğle", foods: "Tavuk, salata, pilav", calories: 520, adherent: true },
  { date: "Dün", type: "Kahvaltı", foods: "Ekmek, peynir, zeytin", calories: 280, adherent: false },
  { date: "Dün", type: "Akşam", foods: "Balık, sebze", calories: 450, adherent: true },
];

const TREND_DATA = {
  steps: [7200, 8100, 6500, 9200, 8700, 10200, 9800],
  calories: [1800, 1950, 1700, 2100, 1850, 1900, 2050],
  sleep: [6.5, 7.0, 7.5, 6.0, 7.5, 8.0, 7.0],
  water: [1500, 1800, 1600, 2000, 1750, 1900, 2100],
};
const TREND_DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export default function DietitianDashboard() {
  const colors = useColors();
  const router = useRouter();
  const [myClients, setMyClients] = useState<Client[]>([]);
  const [healthCards, setHealthCards] = useState<Record<string, HealthCard>>({});
  const [clientNotes, setClientNotes] = useState<Record<string, { id: string; content: string; date: string }[]>>({});
  const [view, setView] = useState<DashboardView>("clients");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientSection, setClientSection] = useState<ClientSection>("overview");
  const [showAddClient, setShowAddClient] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [selectedTrend, setSelectedTrend] = useState<"steps" | "calories" | "sleep" | "water">("steps");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const saved = await AsyncStorage.getItem(MY_CLIENTS_KEY);
    if (saved) setMyClients(JSON.parse(saved));
    const savedCards = await AsyncStorage.getItem(HEALTH_CARDS_KEY);
    if (savedCards) setHealthCards(JSON.parse(savedCards));
    const savedNotes = await AsyncStorage.getItem(CLIENT_NOTES_KEY);
    if (savedNotes) setClientNotes(JSON.parse(savedNotes));
  };

  const addClient = async (unmatched: typeof UNMATCHED_CLIENTS[0]) => {
    const newClient: Client = {
      id: unmatched.id,
      name: unmatched.name,
      email: unmatched.email,
      addedAt: new Date().toISOString(),
      adherenceRate: Math.floor(Math.random() * 30) + 60,
      status: (["good", "warning", "good"] as const)[Math.floor(Math.random() * 3)],
      lastSeen: "Bugün",
    };
    const updated = [...myClients.filter(c => c.id !== unmatched.id), newClient];
    setMyClients(updated);
    await AsyncStorage.setItem(MY_CLIENTS_KEY, JSON.stringify(updated));
    setShowAddClient(false);
    Alert.alert("✅ Eklendi", `${unmatched.name} takibinize alındı.`);
  };

  const saveHealthCard = async (clientId: string, card: Omit<HealthCard, "clientId" | "updatedAt">) => {
    const updated = { ...healthCards, [clientId]: { ...card, clientId, updatedAt: new Date().toISOString() } };
    setHealthCards(updated);
    await AsyncStorage.setItem(HEALTH_CARDS_KEY, JSON.stringify(updated));
    Alert.alert("Kaydedildi", "Sağlık kartı güncellendi.");
  };

  const addNote = async (clientId: string) => {
    if (!noteText.trim()) { Alert.alert("Hata", "Not içeriği girin"); return; }
    const note = { id: Date.now().toString(), content: noteText, date: new Date().toISOString() };
    const existing = clientNotes[clientId] ?? [];
    const updated = { ...clientNotes, [clientId]: [note, ...existing] };
    setClientNotes(updated);
    await AsyncStorage.setItem(CLIENT_NOTES_KEY, JSON.stringify(updated));
    setNoteText("");
    Alert.alert("Kaydedildi", "Not eklendi.");
  };

  const availableUnmatched = UNMATCHED_CLIENTS.filter(u => !myClients.find(c => c.id === u.id));

  // ── ANA EKRAN: Danışan Listesi ──
  if (view === "clients") {
    return (
      <ScreenContainer>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: colors.foreground }}>👨‍⚕️ Danışanlarım</Text>

          {/* Danışan Ekle */}
          <TouchableOpacity onPress={() => setShowAddClient(true)}
            style={{ paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: colors.primary, flexDirection: "row", justifyContent: "center", gap: 8 }}>
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>+ Danışan Ekle</Text>
          </TouchableOpacity>

          {myClients.length === 0 ? (
            <Text style={{ color: colors.muted, textAlign: "center", marginTop: 20 }}>
              Henüz danışan eklenmedi. "Danışan Ekle" ile başlayın.
            </Text>
          ) : myClients.map(client => {
            const sc = STATUS_CONFIG[client.status];
            return (
              <TouchableOpacity key={client.id}
                onPress={() => { setSelectedClient(client); setView("client-detail"); setClientSection("overview"); }}
                style={{
                  backgroundColor: colors.surface, borderRadius: 14, padding: 16,
                  borderWidth: 2, borderColor: sc.color, gap: 8,
                }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary + "30", alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ fontSize: 20 }}>👤</Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>{client.name}</Text>
                      <Text style={{ fontSize: 12, color: colors.muted }}>{client.email}</Text>
                    </View>
                  </View>
                  <View style={{ backgroundColor: sc.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                    <Text style={{ color: sc.color, fontWeight: "700", fontSize: 12 }}>{sc.label}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>📊 Uyum: <Text style={{ color: colors.primary, fontWeight: "700" }}>{client.adherenceRate}%</Text></Text>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>🕐 {client.lastSeen}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Danışan Ekle Modal */}
        <Modal visible={showAddClient} animationType="slide" transparent>
          <View style={{ flex: 1, backgroundColor: "#00000080", justifyContent: "flex-end" }}>
            <View style={{ backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "70%" }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground }}>Danışan Ekle</Text>
                <TouchableOpacity onPress={() => setShowAddClient(false)}>
                  <Text style={{ color: "#ef4444", fontWeight: "600" }}>Kapat</Text>
                </TouchableOpacity>
              </View>
              <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 12 }}>
                Sisteme kayıtlı ve henüz bir diyetisyen ile eşleşmemiş danışanlar:
              </Text>
              {availableUnmatched.length === 0 ? (
                <Text style={{ color: colors.muted, textAlign: "center" }}>Tüm danışanlar zaten takibinizde.</Text>
              ) : (
                <FlatList
                  data={availableUnmatched}
                  keyExtractor={i => i.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => addClient(item)}
                      style={{
                        flexDirection: "row", alignItems: "center", gap: 12,
                        padding: 14, borderRadius: 12, marginBottom: 8,
                        backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
                      }}>
                      <Text style={{ fontSize: 24 }}>👤</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: "700", color: colors.foreground }}>{item.name}</Text>
                        <Text style={{ color: colors.muted, fontSize: 12 }}>{item.email}</Text>
                        <Text style={{ color: colors.muted, fontSize: 11 }}>Kayıt: {item.registeredAt}</Text>
                      </View>
                      <Text style={{ color: colors.primary, fontWeight: "700" }}>Ekle →</Text>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </View>
        </Modal>
      </ScreenContainer>
    );
  }

  // ── DANIŞAN DETAY EKRANI ──
  if (view === "client-detail" && selectedClient) {
    const healthCard = healthCards[selectedClient.id];
    const notes = clientNotes[selectedClient.id] ?? [];
    const sc = STATUS_CONFIG[selectedClient.status];
    const trendValues = TREND_DATA[selectedTrend];
    const maxTrend = Math.max(...trendValues);

    const SECTIONS: { key: ClientSection; label: string; icon: string }[] = [
      { key: "overview", label: "Özet", icon: "📊" },
      { key: "health-cards", label: "Sağlık", icon: "🩺" },
      { key: "trend", label: "Trend", icon: "📈" },
      { key: "meal-history", label: "Öğünler", icon: "🍽️" },
      { key: "notes", label: "Notlar", icon: "📝" },
      { key: "adherence", label: "Uyum", icon: "🎯" },
    ];

    return (
      <ScreenContainer>
        {/* Header */}
        <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
          <TouchableOpacity onPress={() => setView("clients")}
            style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "600" }}>← Danışanlar</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary + "30", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 22 }}>👤</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.foreground }}>{selectedClient.name}</Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>{selectedClient.email}</Text>
            </View>
            <View style={{ backgroundColor: sc.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
              <Text style={{ color: sc.color, fontWeight: "700", fontSize: 12 }}>{sc.label}</Text>
            </View>
          </View>
        </View>

        {/* Section Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 12, marginBottom: 4 }}>
          <View style={{ flexDirection: "row", gap: 6, paddingBottom: 8 }}>
            {SECTIONS.map(s => (
              <TouchableOpacity key={s.key} onPress={() => setClientSection(s.key)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                  backgroundColor: clientSection === s.key ? colors.primary : colors.surface,
                  borderWidth: 1, borderColor: clientSection === s.key ? colors.primary : colors.border,
                }}>
                <Text style={{ color: clientSection === s.key ? "#fff" : colors.foreground, fontWeight: "600", fontSize: 12 }}>
                  {s.icon} {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>

          {/* ÖZET */}
          {clientSection === "overview" && (
            <>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {[
                  { icon: "📊", label: "Uyum Oranı", value: `${selectedClient.adherenceRate}%`, color: colors.primary },
                  { icon: "👟", label: "Ort. Adım", value: "8.234", color: "#3b82f6" },
                  { icon: "😴", label: "Ort. Uyku", value: "7.2 saat", color: "#8b5cf6" },
                  { icon: "💧", label: "Ort. Su", value: "1.8 L", color: "#06b6d4" },
                  { icon: "🔥", label: "Ort. Kalori", value: "1.850 kcal", color: "#f97316" },
                  { icon: "❤️", label: "Ort. Kalp", value: "72 bpm", color: "#ef4444" },
                ].map(item => (
                  <View key={item.label} style={{
                    width: "47%", backgroundColor: colors.surface, borderRadius: 10, padding: 12,
                    borderWidth: 1, borderColor: colors.border, gap: 4,
                  }}>
                    <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                    <Text style={{ fontSize: 16, fontWeight: "bold", color: item.color }}>{item.value}</Text>
                    <Text style={{ fontSize: 11, color: colors.muted }}>{item.label}</Text>
                  </View>
                ))}
              </View>

              {/* Aktivite Artışı */}
              <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 8 }}>
                <Text style={{ fontWeight: "700", color: colors.foreground }}>📈 Aktivite Artışı (Geçen Haftaya Göre)</Text>
                {[
                  { icon: "👟", label: "Adım", change: +12, unit: "%" },
                  { icon: "💧", label: "Su", change: +8, unit: "%" },
                  { icon: "😴", label: "Uyku", change: -5, unit: "%" },
                  { icon: "🔥", label: "Kalori Yakımı", change: +15, unit: "%" },
                ].map(item => (
                  <View key={item.label} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 }}>
                    <Text style={{ color: colors.foreground }}>{item.icon} {item.label}</Text>
                    <Text style={{ fontWeight: "700", color: item.change > 0 ? "#22c55e" : "#ef4444" }}>
                      {item.change > 0 ? "↑" : "↓"} {Math.abs(item.change)}{item.unit}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* SAĞLIK KARTLARI */}
          {clientSection === "health-cards" && (
            <HealthCardSection
              clientId={selectedClient.id}
              healthCard={healthCard}
              onSave={(card) => saveHealthCard(selectedClient.id, card)}
              colors={colors}
            />
          )}

          {/* TREND */}
          {clientSection === "trend" && (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {(["steps", "calories", "sleep", "water"] as const).map(t => (
                    <TouchableOpacity key={t} onPress={() => setSelectedTrend(t)}
                      style={{
                        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                        backgroundColor: selectedTrend === t ? colors.primary : colors.surface,
                        borderWidth: 1, borderColor: selectedTrend === t ? colors.primary : colors.border,
                      }}>
                      <Text style={{ color: selectedTrend === t ? "#fff" : colors.foreground, fontWeight: "600", fontSize: 13 }}>
                        {t === "steps" ? "👟 Adım" : t === "calories" ? "🔥 Kalori" : t === "sleep" ? "😴 Uyku" : "💧 Su"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontWeight: "700", color: colors.foreground, marginBottom: 12 }}>
                  Son 7 Gün — {selectedTrend === "steps" ? "Adım" : selectedTrend === "calories" ? "Kalori" : selectedTrend === "sleep" ? "Uyku" : "Su"}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "flex-end", height: 140, gap: 8 }}>
                  {trendValues.map((val, i) => (
                    <View key={i} style={{ flex: 1, alignItems: "center", gap: 4 }}>
                      <Text style={{ fontSize: 9, color: colors.primary }}>
                        {val > 999 ? `${(val / 1000).toFixed(1)}k` : val}
                      </Text>
                      <View style={{
                        width: "100%", borderRadius: 4,
                        backgroundColor: colors.primary,
                        height: Math.max((val / maxTrend) * 120, 4),
                      }} />
                      <Text style={{ fontSize: 9, color: colors.muted }}>{TREND_DAYS[i]}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* ÖĞÜN GEÇMİŞİ */}
          {clientSection === "meal-history" && (
            <>
              <Text style={{ color: colors.muted, fontSize: 13 }}>Danışanın son öğünleri ve plana uyumu</Text>
              {SAMPLE_MEAL_HISTORY.map((meal, i) => (
                <View key={i} style={{
                  backgroundColor: colors.surface, borderRadius: 12, padding: 14, gap: 4,
                  borderWidth: 1, borderColor: meal.adherent ? "#22c55e" : "#ef4444",
                }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontWeight: "700", color: colors.foreground }}>{meal.date} — {meal.type}</Text>
                    <Text style={{ color: meal.adherent ? "#22c55e" : "#ef4444", fontWeight: "600", fontSize: 12 }}>
                      {meal.adherent ? "✅ Plana uydu" : "❌ Plan dışı"}
                    </Text>
                  </View>
                  <Text style={{ color: colors.muted, fontSize: 13 }}>{meal.foods}</Text>
                  <Text style={{ color: colors.primary, fontSize: 12 }}>🔥 {meal.calories} kcal</Text>
                </View>
              ))}
            </>
          )}

          {/* NOTLAR */}
          {clientSection === "notes" && (
            <>
              {/* Not Yaz */}
              <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border, gap: 10 }}>
                <Text style={{ fontWeight: "700", color: colors.foreground }}>📝 Yeni Not</Text>
                <TextInput
                  value={noteText}
                  onChangeText={setNoteText}
                  placeholder="Danışma notunu buraya yazın..."
                  multiline
                  placeholderTextColor={colors.muted}
                  style={{
                    borderWidth: 1, borderColor: colors.border, borderRadius: 10,
                    padding: 12, color: colors.foreground, backgroundColor: colors.background,
                    minHeight: 100, textAlignVertical: "top", fontSize: 14,
                  }}
                />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity onPress={() => addNote(selectedClient.id)}
                    style={{ flex: 2, paddingVertical: 12, borderRadius: 10, alignItems: "center", backgroundColor: colors.primary }}>
                    <Text style={{ color: "#fff", fontWeight: "700" }}>💾 Kaydet</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => router.push("/calendar-appointments")}
                    style={{ flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary }}>
                    <Text style={{ color: colors.primary, fontWeight: "700" }}>📅 Randevu</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Not Geçmişi */}
              {notes.length === 0 ? (
                <Text style={{ color: colors.muted, textAlign: "center" }}>Henüz not alınmadı.</Text>
              ) : notes.map(note => (
                <View key={note.id} style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, gap: 6, borderWidth: 1, borderColor: colors.border }}>
                  <Text style={{ fontSize: 12, color: colors.muted }}>
                    {new Date(note.date).toLocaleDateString("tr-TR")} {new Date(note.date).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                  <Text style={{ color: colors.foreground, fontSize: 14, lineHeight: 22 }}>{note.content}</Text>
                </View>
              ))}
            </>
          )}

          {/* UYUM ORANI */}
          {clientSection === "adherence" && (
            <>
              <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 12 }}>
                <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>🎯 Genel Uyum Oranı</Text>
                <View style={{ alignItems: "center", gap: 8 }}>
                  <Text style={{ fontSize: 48, fontWeight: "bold", color: colors.primary }}>{selectedClient.adherenceRate}%</Text>
                  <Text style={{ color: colors.muted }}>Diyetisyen planına uyum</Text>
                </View>
                <View style={{ height: 16, backgroundColor: colors.border, borderRadius: 8 }}>
                  <View style={{
                    height: 16, borderRadius: 8,
                    backgroundColor: selectedClient.adherenceRate >= 80 ? "#22c55e" : selectedClient.adherenceRate >= 60 ? "#f97316" : "#ef4444",
                    width: `${selectedClient.adherenceRate}%`,
                  }} />
                </View>
              </View>

              {[
                { label: "Öğün Planı", rate: 88, icon: "🍽️" },
                { label: "Su Tüketimi", rate: 75, icon: "💧" },
                { label: "Aktivite Hedefi", rate: 65, icon: "👟" },
                { label: "Uyku Düzeni", rate: 80, icon: "😴" },
                { label: "Sağlık Takibi", rate: 92, icon: "💊" },
              ].map(item => (
                <View key={item.label} style={{ backgroundColor: colors.surface, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: colors.border, gap: 6 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ color: colors.foreground }}>{item.icon} {item.label}</Text>
                    <Text style={{ color: item.rate >= 80 ? "#22c55e" : item.rate >= 60 ? "#f97316" : "#ef4444", fontWeight: "700" }}>
                      {item.rate}%
                    </Text>
                  </View>
                  <View style={{ height: 8, backgroundColor: colors.border, borderRadius: 4 }}>
                    <View style={{
                      height: 8, borderRadius: 4,
                      backgroundColor: item.rate >= 80 ? "#22c55e" : item.rate >= 60 ? "#f97316" : "#ef4444",
                      width: `${item.rate}%`,
                    }} />
                  </View>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      </ScreenContainer>
    );
  }

  return null;
}

function HealthCardSection({ clientId, healthCard, onSave, colors }: any) {
  const defaultValues = { diabetes: 0, hypertension: 0, heartDisease: 0, obesity: 0, kidneyDisease: 0, thyroid: 0, notes: "" };
  const [values, setValues] = useState(healthCard ?? defaultValues);

  const levelColor = (v: number) => v === 0 ? colors.border : v === 1 ? "#22c55e" : v === 2 ? "#f97316" : "#ef4444";

  return (
    <View style={{ gap: 12 }}>
      <Text style={{ color: colors.muted, fontSize: 13 }}>Her hastalık için derecelendirme yapın (0=Yok, 1=Hafif, 2=Orta, 3=Ağır)</Text>
      {HEALTH_CONDITIONS.map(cond => (
        <View key={cond.key} style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: levelColor(values[cond.key]), gap: 8 }}>
          <Text style={{ fontWeight: "700", color: colors.foreground }}>{cond.icon} {cond.label}</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {HEALTH_LEVELS.map(level => (
              <TouchableOpacity key={level.value} onPress={() => setValues((p: any) => ({ ...p, [cond.key]: level.value }))}
                style={{
                  flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center",
                  backgroundColor: values[cond.key] === level.value ? levelColor(level.value) : colors.background,
                  borderWidth: 1, borderColor: levelColor(level.value),
                }}>
                <Text style={{ color: values[cond.key] === level.value ? "#fff" : colors.foreground, fontSize: 11, fontWeight: "600" }}>
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
      <TextInput
        value={values.notes}
        onChangeText={v => setValues((p: any) => ({ ...p, notes: v }))}
        placeholder="Ek notlar..."
        multiline
        placeholderTextColor={colors.muted}
        style={{
          borderWidth: 1, borderColor: colors.border, borderRadius: 10,
          padding: 12, color: colors.foreground, backgroundColor: colors.surface, minHeight: 60,
        }}
      />
      <TouchableOpacity onPress={() => onSave(values)}
        style={{ paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: colors.primary }}>
        <Text style={{ color: "#fff", fontWeight: "700" }}>💾 Kaydet</Text>
      </TouchableOpacity>
    </View>
  );
}
