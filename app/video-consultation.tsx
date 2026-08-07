import { BackButton } from "@/components/back-button";
import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, Modal, Switch } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserRegistration } from "@/lib/_core/user-registration";

const SESSIONS_KEY = "video_sessions";
const SEMINARS_KEY = "video_seminars";

interface VideoSession {
  id: string;
  clientId: string;
  clientName: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  status: "scheduled" | "completed" | "cancelled";
  notes: string;
  type: "individual" | "seminar";
  title: string;
}

const SAMPLE_CLIENTS = [
  { id: "c1", name: "Ayşe Yılmaz" },
  { id: "c2", name: "Mehmet Demir" },
  { id: "c3", name: "Fatma Kaya" },
  { id: "c4", name: "Ali Öztürk" },
];

const SEMINAR_TOPICS = [
  "Sağlıklı Beslenme Temelleri",
  "Diyabet ve Beslenme",
  "Sporcular İçin Beslenme",
  "Kilo Yönetimi Stratejileri",
  "Çocuk Beslenmesi",
  "Menopoz ve Beslenme",
  "Bağışıklık Sistemi ve Beslenme",
];

const MONTHS = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];

function displayDate(s: string) {
  const d = new Date(s);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function VideoConsultationScreen() {
  const colors = useColors();
  const [role, setRole] = useState<"dietitian" | "client">("client");
  const [userName, setUserName] = useState("");
  const [sessions, setSessions] = useState<VideoSession[]>([]);
  const [activeTab, setActiveTab] = useState<"sessions" | "seminar">("sessions");
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [showCreateSeminar, setShowCreateSeminar] = useState(false);

  // Session form
  const [selectedClient, setSelectedClient] = useState(SAMPLE_CLIENTS[0]);
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("10:00");
  const [sessionDuration, setSessionDuration] = useState("30");
  const [sessionNotes, setSessionNotes] = useState("");

  // Seminar form
  const [seminarTitle, setSeminarTitle] = useState("");
  const [seminarDate, setSeminarDate] = useState("");
  const [seminarTime, setSeminarTime] = useState("19:00");
  const [seminarParticipants, setSeminarParticipants] = useState<string[]>([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const user = await getUserRegistration();
    setRole(user?.role ?? "client");
    setUserName(user?.name ?? "");
    const saved = await AsyncStorage.getItem(SESSIONS_KEY);
    if (saved) setSessions(JSON.parse(saved));
  };

  const saveSessions = async (list: VideoSession[]) => {
    setSessions(list);
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(list));
  };

  const createSession = async () => {
    if (!sessionDate || !sessionTime) { Alert.alert("Hata", "Tarih ve saat girin"); return; }
    const session: VideoSession = {
      id: Date.now().toString(),
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      scheduledDate: sessionDate,
      scheduledTime: sessionTime,
      duration: Number(sessionDuration),
      status: "scheduled",
      notes: sessionNotes,
      type: "individual",
      title: `${selectedClient.name} ile Görüşme`,
    };
    await saveSessions([...sessions, session]);
    setShowCreateSession(false);
    setSessionNotes(""); setSessionDate("");
    Alert.alert("✅ Oluşturuldu", `${selectedClient.name} ile video görüşme planlandı.\n${displayDate(sessionDate)} ${sessionTime}`);
  };

  const createSeminar = async () => {
    if (!seminarTitle.trim() || !seminarDate) { Alert.alert("Hata", "Başlık ve tarih girin"); return; }
    const allClients = seminarParticipants.length === 0
      ? SAMPLE_CLIENTS.map(c => c.id)
      : seminarParticipants;

    const seminar: VideoSession = {
      id: Date.now().toString(),
      clientId: "all",
      clientName: allClients.map(id => SAMPLE_CLIENTS.find(c => c.id === id)?.name ?? "").join(", "),
      scheduledDate: seminarDate,
      scheduledTime: seminarTime,
      duration: 60,
      status: "scheduled",
      notes: "",
      type: "seminar",
      title: seminarTitle,
    };
    await saveSessions([...sessions, seminar]);
    setShowCreateSeminar(false);
    setSeminarTitle(""); setSeminarDate(""); setSeminarParticipants([]);
    Alert.alert("✅ Seminer Oluşturuldu", `"${seminarTitle}" semineri planlandı.\n${displayDate(seminarDate)} ${seminarTime}\n${allClients.length} katılımcıya bildirim gönderildi.`);
  };

  const cancelSession = (id: string) => {
    Alert.alert("İptal", "Bu oturumu iptal etmek istiyor musunuz?", [
      { text: "Hayır", style: "cancel" },
      { text: "İptal Et", style: "destructive", onPress: () =>
        saveSessions(sessions.map(s => s.id === id ? { ...s, status: "cancelled" as const } : s))
      },
    ]);
  };

  const startSession = (session: VideoSession) => {
    Alert.alert(
      "📹 Video Görüşme",
      `${session.title} başlatılıyor...\n\nNot: Gerçek video görüşme için Zoom, Google Meet veya benzeri bir uygulama entegrasyonu gereklidir.`,
      [
        { text: "İptal", style: "cancel" },
        { text: "Başlat", onPress: () => Alert.alert("Bağlanılıyor...", "Video görüşme başlatılıyor.") },
      ]
    );
  };

  const mySessionsForClient = sessions.filter(s => s.type === "individual" && s.clientName.includes("Ayşe"));
  const mySeminars = sessions.filter(s => s.type === "seminar");
  const individualSessions = sessions.filter(s => s.type === "individual");

  const statusColor = (s: string) => s === "scheduled" ? colors.primary : s === "completed" ? "#22c55e" : "#ef4444";
  const statusLabel = (s: string) => s === "scheduled" ? "📅 Planlandı" : s === "completed" ? "✅ Tamamlandı" : "❌ İptal";

  return (
    <ScreenContainer>
      <BackButton title="📹 Video Danışma" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>

        {/* Tabs */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity onPress={() => setActiveTab("sessions")}
            style={{
              flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center",
              backgroundColor: activeTab === "sessions" ? colors.primary : colors.surface,
              borderWidth: 1, borderColor: activeTab === "sessions" ? colors.primary : colors.border,
            }}>
            <Text style={{ color: activeTab === "sessions" ? "#fff" : colors.foreground, fontWeight: "600" }}>
              📹 Bireysel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab("seminar")}
            style={{
              flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center",
              backgroundColor: activeTab === "seminar" ? colors.primary : colors.surface,
              borderWidth: 1, borderColor: activeTab === "seminar" ? colors.primary : colors.border,
            }}>
            <Text style={{ color: activeTab === "seminar" ? "#fff" : colors.foreground, fontWeight: "600" }}>
              🎤 Seminer
            </Text>
          </TouchableOpacity>
        </View>

        {/* BİREYSEL GÖRÜŞMELER */}
        {activeTab === "sessions" && (
          <>
            {role === "dietitian" && (
              <>
                <TouchableOpacity onPress={() => setShowCreateSession(!showCreateSession)}
                  style={{ paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: colors.primary }}>
                  <Text style={{ color: "#fff", fontWeight: "700" }}>
                    {showCreateSession ? "✕ İptal" : "+ Görüşme Planla"}
                  </Text>
                </TouchableOpacity>

                {showCreateSession && (
                  <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, gap: 12, borderWidth: 1, borderColor: colors.border }}>
                    <Text style={{ fontWeight: "700", color: colors.foreground }}>📹 Görüşme Oluştur</Text>

                    {/* Danışan Seçimi */}
                    <Text style={{ fontWeight: "600", color: colors.foreground }}>Danışan</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        {SAMPLE_CLIENTS.map(c => (
                          <TouchableOpacity key={c.id} onPress={() => setSelectedClient(c)}
                            style={{
                              paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                              backgroundColor: selectedClient.id === c.id ? colors.primary : colors.surface,
                              borderWidth: 1, borderColor: selectedClient.id === c.id ? colors.primary : colors.border,
                            }}>
                            <Text style={{ color: selectedClient.id === c.id ? "#fff" : colors.foreground, fontWeight: "600" }}>
                              {c.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>

                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <View style={{ flex: 2, gap: 4 }}>
                        <Text style={{ fontWeight: "600", color: colors.foreground }}>Tarih</Text>
                        <TextInput value={sessionDate} onChangeText={setSessionDate}
                          placeholder="2026-06-20" placeholderTextColor={colors.muted}
                          style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, color: colors.foreground, backgroundColor: colors.background }} />
                      </View>
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={{ fontWeight: "600", color: colors.foreground }}>Saat</Text>
                        <TextInput value={sessionTime} onChangeText={setSessionTime}
                          placeholder="10:00" placeholderTextColor={colors.muted}
                          style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, color: colors.foreground, backgroundColor: colors.background }} />
                      </View>
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={{ fontWeight: "600", color: colors.foreground }}>Süre (dk)</Text>
                        <TextInput value={sessionDuration} onChangeText={setSessionDuration}
                          keyboardType="numeric" placeholderTextColor={colors.muted}
                          style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, color: colors.foreground, backgroundColor: colors.background }} />
                      </View>
                    </View>

                    <TextInput value={sessionNotes} onChangeText={setSessionNotes}
                      placeholder="Görüşme notu (isteğe bağlı)" multiline placeholderTextColor={colors.muted}
                      style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, color: colors.foreground, backgroundColor: colors.background, minHeight: 60 }} />

                    <TouchableOpacity onPress={createSession}
                      style={{ paddingVertical: 12, borderRadius: 10, alignItems: "center", backgroundColor: colors.primary }}>
                      <Text style={{ color: "#fff", fontWeight: "700" }}>✅ Görüşme Oluştur</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Danışan Listesi */}
                <Text style={{ fontWeight: "700", color: colors.foreground }}>👥 Kayıtlı Danışanlar</Text>
                {SAMPLE_CLIENTS.map(c => {
                  const clientSessions = sessions.filter(s => s.clientId === c.id && s.type === "individual");
                  return (
                    <View key={c.id} style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <Text style={{ fontSize: 24 }}>👤</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: "700", color: colors.foreground }}>{c.name}</Text>
                        <Text style={{ color: colors.muted, fontSize: 12 }}>
                          {clientSessions.length} görüşme planlandı
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => { setSelectedClient(c); setShowCreateSession(true); }}
                        style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.primary + "20" }}>
                        <Text style={{ color: colors.primary, fontWeight: "600", fontSize: 12 }}>+ Planla</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </>
            )}

            {/* Oturum Listesi */}
            <Text style={{ fontWeight: "700", color: colors.foreground }}>
              {role === "dietitian" ? "📋 Tüm Görüşmeler" : "📋 Görüşmelerim"}
            </Text>
            {(role === "dietitian" ? individualSessions : mySessionsForClient).length === 0 ? (
              <Text style={{ color: colors.muted, textAlign: "center" }}>Henüz görüşme planlanmadı.</Text>
            ) : (role === "dietitian" ? individualSessions : mySessionsForClient)
              .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
              .map(session => (
              <View key={session.id} style={{
                backgroundColor: colors.surface, borderRadius: 12, padding: 14, gap: 8,
                borderWidth: 1, borderColor: colors.border,
              }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontWeight: "700", color: colors.foreground }}>{session.title}</Text>
                  <Text style={{ color: statusColor(session.status), fontSize: 12, fontWeight: "600" }}>
                    {statusLabel(session.status)}
                  </Text>
                </View>
                <Text style={{ color: colors.muted, fontSize: 13 }}>
                  📅 {displayDate(session.scheduledDate)} 🕐 {session.scheduledTime} · {session.duration} dk
                </Text>
                {session.notes ? <Text style={{ color: colors.muted, fontSize: 12 }}>{session.notes}</Text> : null}
                {session.status === "scheduled" && (
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity onPress={() => startSession(session)}
                      style={{ flex: 2, paddingVertical: 10, borderRadius: 10, alignItems: "center", backgroundColor: colors.primary }}>
                      <Text style={{ color: "#fff", fontWeight: "700" }}>📹 Başlat</Text>
                    </TouchableOpacity>
                    {role === "dietitian" && (
                      <TouchableOpacity onPress={() => cancelSession(session.id)}
                        style={{ flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center", backgroundColor: "#ef444420", borderWidth: 1, borderColor: "#ef4444" }}>
                        <Text style={{ color: "#ef4444", fontWeight: "600" }}>İptal</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {/* SEMİNER */}
        {activeTab === "seminar" && (
          <>
            {role === "dietitian" && (
              <>
                <TouchableOpacity onPress={() => setShowCreateSeminar(!showCreateSeminar)}
                  style={{ paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: "#8b5cf6" }}>
                  <Text style={{ color: "#fff", fontWeight: "700" }}>
                    {showCreateSeminar ? "✕ İptal" : "🎤 Yeni Seminer / Bilgilendirme"}
                  </Text>
                </TouchableOpacity>

                {showCreateSeminar && (
                  <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, gap: 12, borderWidth: 1, borderColor: colors.border }}>
                    <Text style={{ fontWeight: "700", color: colors.foreground }}>🎤 Seminer Oluştur</Text>

                    {/* Konu Seçimi */}
                    <Text style={{ fontWeight: "600", color: colors.foreground }}>Konu</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        {SEMINAR_TOPICS.map(topic => (
                          <TouchableOpacity key={topic} onPress={() => setSeminarTitle(topic)}
                            style={{
                              paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
                              backgroundColor: seminarTitle === topic ? "#8b5cf6" : colors.surface,
                              borderWidth: 1, borderColor: seminarTitle === topic ? "#8b5cf6" : colors.border,
                            }}>
                            <Text style={{ color: seminarTitle === topic ? "#fff" : colors.foreground, fontSize: 12, fontWeight: "600" }}>{topic}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>

                    <TextInput value={seminarTitle} onChangeText={setSeminarTitle}
                      placeholder="veya konu başlığı yazın..." placeholderTextColor={colors.muted}
                      style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, color: colors.foreground, backgroundColor: colors.background }} />

                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <View style={{ flex: 2, gap: 4 }}>
                        <Text style={{ fontWeight: "600", color: colors.foreground }}>Tarih</Text>
                        <TextInput value={seminarDate} onChangeText={setSeminarDate}
                          placeholder="2026-06-25" placeholderTextColor={colors.muted}
                          style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, color: colors.foreground, backgroundColor: colors.background }} />
                      </View>
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={{ fontWeight: "600", color: colors.foreground }}>Saat</Text>
                        <TextInput value={seminarTime} onChangeText={setSeminarTime}
                          placeholder="19:00" placeholderTextColor={colors.muted}
                          style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, color: colors.foreground, backgroundColor: colors.background }} />
                      </View>
                    </View>

                    {/* Katılımcı Seçimi */}
                    <Text style={{ fontWeight: "600", color: colors.foreground }}>
                      Katılımcılar ({seminarParticipants.length === 0 ? "Tüm danışanlar" : seminarParticipants.length + " kişi"})
                    </Text>
                    {SAMPLE_CLIENTS.map(c => (
                      <TouchableOpacity key={c.id}
                        onPress={() => setSeminarParticipants(prev =>
                          prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id]
                        )}
                        style={{
                          flexDirection: "row", alignItems: "center", gap: 10,
                          padding: 10, borderRadius: 10,
                          backgroundColor: seminarParticipants.includes(c.id) ? "#8b5cf620" : colors.background,
                          borderWidth: 1, borderColor: seminarParticipants.includes(c.id) ? "#8b5cf6" : colors.border,
                        }}>
                        <View style={{
                          width: 20, height: 20, borderRadius: 10, borderWidth: 2,
                          borderColor: seminarParticipants.includes(c.id) ? "#8b5cf6" : colors.border,
                          backgroundColor: seminarParticipants.includes(c.id) ? "#8b5cf6" : "transparent",
                          alignItems: "center", justifyContent: "center",
                        }}>
                          {seminarParticipants.includes(c.id) && <Text style={{ color: "#fff", fontSize: 11 }}>✓</Text>}
                        </View>
                        <Text style={{ color: colors.foreground }}>👤 {c.name}</Text>
                      </TouchableOpacity>
                    ))}

                    <TouchableOpacity onPress={createSeminar}
                      style={{ paddingVertical: 12, borderRadius: 10, alignItems: "center", backgroundColor: "#8b5cf6" }}>
                      <Text style={{ color: "#fff", fontWeight: "700" }}>🎤 Seminer Oluştur ve Davet Gönder</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}

            {/* Seminer Listesi */}
            <Text style={{ fontWeight: "700", color: colors.foreground }}>📋 Seminerler</Text>
            {mySeminars.length === 0 ? (
              <Text style={{ color: colors.muted, textAlign: "center" }}>Henüz seminer planlanmadı.</Text>
            ) : mySeminars.map(seminar => (
              <View key={seminar.id} style={{
                backgroundColor: colors.surface, borderRadius: 12, padding: 14, gap: 8,
                borderWidth: 1, borderColor: "#8b5cf6",
              }}>
                <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 15 }}>🎤 {seminar.title}</Text>
                <Text style={{ color: colors.muted, fontSize: 13 }}>
                  📅 {displayDate(seminar.scheduledDate)} 🕐 {seminar.scheduledTime} · 60 dk
                </Text>
                <Text style={{ color: "#8b5cf6", fontSize: 12 }}>👥 {seminar.clientName}</Text>
                {seminar.status === "scheduled" && (
                  <TouchableOpacity onPress={() => startSession(seminar)}
                    style={{ paddingVertical: 10, borderRadius: 10, alignItems: "center", backgroundColor: "#8b5cf6" }}>
                    <Text style={{ color: "#fff", fontWeight: "700" }}>📹 Semineri Başlat</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
