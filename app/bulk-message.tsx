import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, Switch } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { BackButton } from "@/components/back-button";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getMyClients, ClientRecord } from "@/lib/_core/clients-store";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MSGS_KEY = "chat_v3";

const TEMPLATES = [
  { title: "Haftalık Hatırlatma", content: "Merhaba! Bu haftaki beslenme programınızı düzenli takip etmeyi unutmayın. Su içmeyi ve öğünlerinizi zamanında tüketmeyi ihmal etmeyin. 💪" },
  { title: "Tebrik Mesajı", content: "Harika gidiyorsunuz! Bu haftaki uyum oranınız çok iyi. Böyle devam edin, hedefinize yaklaşıyorsunuz! 🌟" },
  { title: "Randevu Hatırlatma", content: "Yaklaşan randevunuzu hatırlatmak istedim. Sormak istediğiniz soruları not almayı unutmayın. 📅" },
  { title: "Motivasyon", content: "Unutmayın, sağlıklı beslenme bir maraton, sprint değil. Küçük adımlar büyük farklar yaratır. Kendinize iyi bakın! 🥗" },
  { title: "Su Uyarısı", content: "Bu hafta su tüketiminizin hedefin altında kaldığını fark ettim. Günde en az 2 litre su içmeyi hedefleyin. 💧" },
  { title: "Program Güncelleme", content: "Beslenme programınızda güncelleme yaptım. Lütfen uygulamadan yeni planınızı inceleyin ve sorularınız için bana yazın. 📋" },
];

export default function BulkMessageScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "good" | "warning" | "critical">("all");

  useEffect(() => { load(); }, []);

  const load = async () => {
    const c = await getMyClients();
    setClients(c);
    setSelectedClients(c.map(x => x.id)); // Başta hepsi seçili
  };

  const toggleClient = (id: string) => {
    setSelectedClients(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedClients(filteredClients.map(c => c.id));
  const deselectAll = () => setSelectedClients([]);

  const sendMessages = async () => {
    if (!message.trim()) { Alert.alert("Hata", "Mesaj yazın"); return; }
    if (selectedClients.length === 0) { Alert.alert("Hata", "En az bir danışan seçin"); return; }

    Alert.alert(
      "Toplu Mesaj Gönder",
      `${selectedClients.length} danışana mesaj gönderilecek. Devam etmek istiyor musunuz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Gönder", onPress: async () => {
            setSending(true);
            const saved = await AsyncStorage.getItem(MSGS_KEY);
            const allMsgs = saved ? JSON.parse(saved) : {};
            const now = new Date().toISOString();

            for (const clientId of selectedClients) {
              const newMsg = {
                id: `bulk_${Date.now()}_${clientId}`,
                senderId: "me",
                senderName: "Diyetisyeniniz",
                content: message,
                createdAt: now,
                status: "delivered",
              };
              allMsgs[clientId] = [...(allMsgs[clientId] ?? []), newMsg];
            }

            await AsyncStorage.setItem(MSGS_KEY, JSON.stringify(allMsgs));
            setSending(false);
            setSent(true);
            setMessage("");

            setTimeout(() => setSent(false), 3000);
            Alert.alert("✅ Gönderildi!", `${selectedClients.length} danışana mesaj iletildi.`);
          }
        }
      ]
    );
  };

  const filteredClients = clients.filter(c =>
    filterStatus === "all" || c.status === filterStatus
  );

  const STATUS_COLORS = { good: "#22c55e", warning: "#f97316", critical: "#ef4444" };
  const STATUS_LABELS = { good: "✅ İyi", warning: "⚠️ Dikkat", critical: "🔴 Kritik" };

  return (
    <ScreenContainer>
      <BackButton title="📢 Toplu Mesaj" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: Math.max(insets.bottom + 24, 32) }}>

        {/* Mesaj yazma */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 12 }}>
          <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>✍️ Mesaj Yaz</Text>

          {/* Şablonlar */}
          <Text style={{ fontWeight: "600", color: colors.foreground, fontSize: 13 }}>📋 Hazır Şablonlar</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {TEMPLATES.map((t, i) => (
                <TouchableOpacity key={i} onPress={() => setMessage(t.content)}
                  style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary, maxWidth: 160 }}>
                  <Text style={{ color: colors.primary, fontWeight: "600", fontSize: 12 }} numberOfLines={1}>{t.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <TextInput
            value={message} onChangeText={setMessage}
            placeholder="Tüm seçili danışanlara gönderilecek mesajı yazın..."
            multiline placeholderTextColor={colors.muted}
            style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.foreground, backgroundColor: colors.background, minHeight: 120, textAlignVertical: "top", fontSize: 14 }}
          />
          <Text style={{ color: colors.muted, fontSize: 12, textAlign: "right" }}>{message.length} karakter</Text>
        </View>

        {/* Danışan seçimi */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 12 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>👥 Alıcılar ({selectedClients.length}/{filteredClients.length})</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity onPress={selectAll}
                style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: colors.primary + "20", borderWidth: 1, borderColor: colors.primary }}>
                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "600" }}>Tümü</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={deselectAll}
                style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: "#ef444420", borderWidth: 1, borderColor: "#ef4444" }}>
                <Text style={{ color: "#ef4444", fontSize: 12, fontWeight: "600" }}>Temizle</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Filtre */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {[{ k: "all", l: "👥 Tümü" }, { k: "good", l: "✅ İyi" }, { k: "warning", l: "⚠️ Dikkat" }, { k: "critical", l: "🔴 Kritik" }].map(f => (
                <TouchableOpacity key={f.k} onPress={() => setFilterStatus(f.k as any)}
                  style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: filterStatus === f.k ? colors.primary : colors.surface, borderWidth: 1, borderColor: filterStatus === f.k ? colors.primary : colors.border }}>
                  <Text style={{ color: filterStatus === f.k ? "#fff" : colors.foreground, fontWeight: "600", fontSize: 12 }}>{f.l}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {filteredClients.map(client => {
            const isSelected = selectedClients.includes(client.id);
            return (
              <TouchableOpacity key={client.id} onPress={() => toggleClient(client.id)}
                style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 10, backgroundColor: isSelected ? colors.primary + "10" : colors.background, borderWidth: isSelected ? 2 : 1, borderColor: isSelected ? colors.primary : colors.border }}>
                <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: isSelected ? colors.primary : colors.border, backgroundColor: isSelected ? colors.primary : "transparent", alignItems: "center", justifyContent: "center" }}>
                  {isSelected && <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>✓</Text>}
                </View>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary + "30", alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 18 }}>👤</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "700", color: colors.foreground }}>{client.name}</Text>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>Uyum: {client.adherenceRate}% · {client.lastSeen}</Text>
                </View>
                <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: STATUS_COLORS[client.status] + "20" }}>
                  <Text style={{ fontSize: 11, fontWeight: "600", color: STATUS_COLORS[client.status] }}>{STATUS_LABELS[client.status]}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Önizleme */}
        {message.length > 0 && selectedClients.length > 0 && (
          <View style={{ backgroundColor: colors.primary + "10", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.primary, gap: 8 }}>
            <Text style={{ fontWeight: "700", color: colors.primary }}>👁️ Önizleme</Text>
            <Text style={{ color: colors.foreground, fontSize: 13, lineHeight: 20 }}>{message}</Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>→ {selectedClients.length} danışana gönderilecek</Text>
          </View>
        )}

        {/* Gönder butonu */}
        <TouchableOpacity onPress={sendMessages} disabled={sending || sent}
          style={{ paddingVertical: 16, borderRadius: 12, alignItems: "center", backgroundColor: sent ? "#22c55e" : sending ? colors.border : colors.primary }}>
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
            {sent ? "✅ Gönderildi!" : sending ? "⏳ Gönderiliyor..." : `📢 ${selectedClients.length} Danışana Gönder`}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
