import { BackButton } from "@/components/back-button";
import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, Modal } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useEffect, useState } from "react";
import { getUserRegistration } from "@/lib/_core/user-registration";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RECS_KEY = "dietitian_recommendations";

interface Recommendation {
  id: string;
  clientName: string;
  type: "warning" | "suggestion" | "praise" | "alert";
  title: string;
  message: string;
  priority: "low" | "medium" | "high";
  createdAt: string;
  read: boolean;
}

const SAMPLE_RECS: Recommendation[] = [
  { id: "1", clientName: "Ayşe Yılmaz", type: "praise", title: "Harika İlerleme!", message: "Ayşe bu hafta su tüketimini %30 artırdı. Mükemmel gidişat!", priority: "low", createdAt: new Date().toISOString(), read: false },
  { id: "2", clientName: "Mehmet Demir", type: "warning", title: "Düşük Aktivite", message: "Mehmet'in günlük adım sayısı hedefin altında. Spor aktivitesini artırması gerekiyor.", priority: "medium", createdAt: new Date(Date.now() - 3600000).toISOString(), read: false },
  { id: "3", clientName: "Fatma Kaya", type: "suggestion", title: "Protein Artırımı", message: "Fatma'nın protein alımı hedefin altında. Günlük diyetine protein kaynakları eklenmeli.", priority: "high", createdAt: new Date(Date.now() - 7200000).toISOString(), read: true },
];

const TYPE_CONFIG = {
  praise: { color: "#22c55e", bg: "#22c55e20", icon: "🏆", label: "Övgü" },
  suggestion: { color: "#3b82f6", bg: "#3b82f620", icon: "💡", label: "Öneri" },
  warning: { color: "#f97316", bg: "#f9731620", icon: "⚠️", label: "Uyarı" },
  alert: { color: "#ef4444", bg: "#ef444420", icon: "🚨", label: "Alarm" },
};

const PRIORITY_CONFIG = {
  low: { color: "#22c55e", label: "Düşük" },
  medium: { color: "#f97316", label: "Orta" },
  high: { color: "#ef4444", label: "Yüksek" },
};

const CLIENTS = ["Ayşe Yılmaz", "Mehmet Demir", "Fatma Kaya"];

export default function DietitianRecommendationsScreen() {
  const colors = useColors();
  const [role, setRole] = useState<"dietitian" | "client">("client");
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newType, setNewType] = useState<Recommendation["type"]>("suggestion");
  const [newPriority, setNewPriority] = useState<Recommendation["priority"]>("medium");
  const [newClient, setNewClient] = useState(CLIENTS[0]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const user = await getUserRegistration();
    setRole(user?.role ?? "client");
    const saved = await AsyncStorage.getItem(RECS_KEY);
    if (saved) {
      setRecs(JSON.parse(saved));
    } else {
      // İlk açılışta örnek veri yükle
      setRecs(SAMPLE_RECS);
      await AsyncStorage.setItem(RECS_KEY, JSON.stringify(SAMPLE_RECS));
    }
  };

  const saveRecs = async (list: Recommendation[]) => {
    setRecs(list);
    await AsyncStorage.setItem(RECS_KEY, JSON.stringify(list));
  };

  const addRec = async () => {
    if (!newTitle.trim() || !newMessage.trim()) { Alert.alert("Hata", "Başlık ve mesaj girin"); return; }
    const rec: Recommendation = {
      id: Date.now().toString(),
      clientName: newClient,
      type: newType, title: newTitle, message: newMessage,
      priority: newPriority,
      createdAt: new Date().toISOString(),
      read: false,
    };
    await saveRecs([rec, ...recs]);
    setShowForm(false); setNewTitle(""); setNewMessage("");
    Alert.alert("Gönderildi", `${newClient}'a öneri gönderildi.`);
  };

  const markRead = async (id: string) => {
    await saveRecs(recs.map(r => r.id === id ? { ...r, read: true } : r));
  };

  const deleteRec = async (id: string) => {
    Alert.alert("Sil", "Bu öneriyi silmek istiyor musunuz?", [
      { text: "İptal", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: () => saveRecs(recs.filter(r => r.id !== id)) },
    ]);
  };

  const unreadCount = recs.filter(r => !r.read).length;

  return (
    <ScreenContainer>
      <BackButton title="💡 Diyetisyen Önerileri" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>

        {/* Özet */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
            <Text style={{ fontSize: 22, fontWeight: "bold", color: colors.primary }}>{recs.length}</Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>Toplam</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: "#ef4444", alignItems: "center" }}>
            <Text style={{ fontSize: 22, fontWeight: "bold", color: "#ef4444" }}>{unreadCount}</Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>Okunmamış</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: "#22c55e", alignItems: "center" }}>
            <Text style={{ fontSize: 22, fontWeight: "bold", color: "#22c55e" }}>{recs.length - unreadCount}</Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>Okundu</Text>
          </View>
        </View>

        {/* Diyetisyen: yeni öneri ekle */}
        {role === "dietitian" && (
          <TouchableOpacity onPress={() => setShowForm(!showForm)}
            style={{ paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: colors.primary }}>
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>+ Yeni Öneri Gönder</Text>
          </TouchableOpacity>
        )}

        {showForm && role === "dietitian" && (
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, gap: 12, borderWidth: 1, borderColor: colors.border }}>
            {/* Danışan Seçimi */}
            <Text style={{ fontWeight: "700", color: colors.foreground }}>Danışan</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {CLIENTS.map(c => (
                  <TouchableOpacity key={c} onPress={() => setNewClient(c)}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                      backgroundColor: newClient === c ? colors.primary : colors.surface,
                      borderWidth: 1, borderColor: newClient === c ? colors.primary : colors.border,
                    }}>
                    <Text style={{ color: newClient === c ? "#fff" : colors.foreground, fontWeight: "600" }}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Tür */}
            <Text style={{ fontWeight: "700", color: colors.foreground }}>Tür</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {(Object.entries(TYPE_CONFIG) as any[]).map(([key, val]) => (
                <TouchableOpacity key={key} onPress={() => setNewType(key as any)}
                  style={{
                    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
                    backgroundColor: newType === key ? val.color : colors.surface,
                    borderWidth: 1, borderColor: val.color,
                  }}>
                  <Text style={{ color: newType === key ? "#fff" : val.color, fontWeight: "600", fontSize: 12 }}>
                    {val.icon} {val.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Öncelik */}
            <Text style={{ fontWeight: "700", color: colors.foreground }}>Öncelik</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {(Object.entries(PRIORITY_CONFIG) as any[]).map(([key, val]) => (
                <TouchableOpacity key={key} onPress={() => setNewPriority(key as any)}
                  style={{
                    flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center",
                    backgroundColor: newPriority === key ? val.color : colors.surface,
                    borderWidth: 1, borderColor: val.color,
                  }}>
                  <Text style={{ color: newPriority === key ? "#fff" : val.color, fontWeight: "600", fontSize: 12 }}>
                    {val.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput placeholder="Başlık" value={newTitle} onChangeText={setNewTitle}
              placeholderTextColor={colors.muted}
              style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.foreground, backgroundColor: colors.background }} />
            <TextInput placeholder="Mesaj içeriği" value={newMessage} onChangeText={setNewMessage}
              multiline placeholderTextColor={colors.muted}
              style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.foreground, backgroundColor: colors.background, minHeight: 80 }} />

            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity onPress={() => setShowForm(false)}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.foreground }}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addRec}
                style={{ flex: 2, paddingVertical: 12, borderRadius: 10, alignItems: "center", backgroundColor: colors.primary }}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>Gönder</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Öneri Listesi */}
        {recs.length === 0 ? (
          <Text style={{ color: colors.muted, textAlign: "center", marginTop: 20 }}>Henüz öneri yok.</Text>
        ) : recs.map(rec => {
          const config = TYPE_CONFIG[rec.type];
          const pConfig = PRIORITY_CONFIG[rec.priority];
          return (
            <View key={rec.id} style={{
              backgroundColor: rec.read ? colors.surface : config.bg,
              borderRadius: 12, padding: 16, gap: 8,
              borderWidth: 2, borderColor: rec.read ? colors.border : config.color,
            }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                    <Text style={{ fontSize: 16 }}>{config.icon}</Text>
                    <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 15 }}>{rec.title}</Text>
                    {!rec.read && <View style={{ backgroundColor: config.color, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                      <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>YENİ</Text>
                    </View>}
                  </View>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>
                    👤 {rec.clientName} · <Text style={{ color: pConfig.color }}>{pConfig.label} öncelik</Text>
                  </Text>
                </View>
                {role === "dietitian" && (
                  <TouchableOpacity onPress={() => deleteRec(rec.id)}>
                    <Text style={{ color: "#ef4444", fontSize: 13 }}>Sil</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={{ color: colors.foreground, fontSize: 14, lineHeight: 20 }}>{rec.message}</Text>

              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ color: colors.muted, fontSize: 11 }}>
                  {new Date(rec.createdAt).toLocaleDateString("tr-TR")} {new Date(rec.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                </Text>
                {!rec.read && (
                  <TouchableOpacity onPress={() => markRead(rec.id)}
                    style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: config.color + "30" }}>
                    <Text style={{ color: config.color, fontSize: 12, fontWeight: "600" }}>Okundu İşaretle</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </ScreenContainer>
  );
}
