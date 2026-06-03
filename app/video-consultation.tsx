import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Platform,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { NavigationHeader } from "@/components/navigation-header";
import { useColors } from "@/hooks/use-colors";
import { telehealthService, VideoSession, ConsultationChat } from "@/lib/_core/telehealth-service";

export default function VideoConsultationScreen() {
  const colors = useColors();
  const [sessions, setSessions] = useState<VideoSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<VideoSession | null>(null);
  const [chats, setChats] = useState<ConsultationChat[]>([]);
  const [chatMessage, setChatMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"sessions" | "active" | "history">("sessions");

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      loadChats();
    }
  }, [selectedSession]);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      // Mock veri - gerçek uygulamada kullanıcı ID'si kullanılır
      const mockSessions: VideoSession[] = [
        {
          id: "session-1",
          appointmentId: "apt-1",
          dietitianId: "diet-1",
          dietitianName: "Dr. Mehmet Kaya",
          clientId: "client-1",
          clientName: "Ayşe Yılmaz",
          title: "Beslenme Danışmanlığı",
          description: "Haftalık beslenme planı gözden geçirmesi",
          scheduledTime: Date.now() + 3600000,
          duration: 30,
          status: "scheduled",
          channelName: "consultation-session-1",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: "session-2",
          appointmentId: "apt-2",
          dietitianId: "diet-1",
          dietitianName: "Dr. Mehmet Kaya",
          clientId: "client-1",
          clientName: "Ayşe Yılmaz",
          title: "Kilo Kaybı Danışmanlığı",
          description: "Aylık ilerleme değerlendirmesi",
          scheduledTime: Date.now() - 86400000,
          startTime: Date.now() - 86400000,
          endTime: Date.now() - 84600000,
          duration: 30,
          status: "completed",
          channelName: "consultation-session-2",
          recordingUrl: "https://example.com/recording-session-2.mp4",
          notes: "İyi ilerleme. Egzersiz programını devam ettir.",
          createdAt: Date.now() - 86400000,
          updatedAt: Date.now() - 84600000,
        },
      ];
      setSessions(mockSessions);
    } catch (error) {
      console.error("Oturumlar yüklenemedi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChats = async () => {
    if (!selectedSession) return;
    try {
      const mockChats: ConsultationChat[] = [
        {
          id: "chat-1",
          sessionId: selectedSession.id,
          senderId: "diet-1",
          senderName: "Dr. Mehmet Kaya",
          senderRole: "dietitian",
          message: "Merhaba Ayşe, bugünkü danışmanlık oturumuna hoş geldiniz.",
          timestamp: Date.now() - 600000,
          isRead: true,
        },
        {
          id: "chat-2",
          sessionId: selectedSession.id,
          senderId: "client-1",
          senderName: "Ayşe Yılmaz",
          senderRole: "client",
          message: "Merhaba Doktor. Teşekkür ederim. Hazırım.",
          timestamp: Date.now() - 500000,
          isRead: true,
        },
      ];
      setChats(mockChats);
    } catch (error) {
      console.error("Sohbet yüklenemedi:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !selectedSession) return;

    try {
      const newChat = await telehealthService.sendChatMessage(
        selectedSession.id,
        "client-1",
        "Ayşe Yılmaz",
        "client",
        chatMessage
      );

      setChats([...chats, newChat]);
      setChatMessage("");
    } catch (error) {
      console.error("Mesaj gönderilemedi:", error);
    }
  };

  const handleStartSession = async (session: VideoSession) => {
    try {
      const updated = await telehealthService.startVideoSession(session.id);
      if (updated) {
        setSelectedSession(updated);
        setSessions(sessions.map((s) => (s.id === session.id ? updated : s)));
      }
    } catch (error) {
      console.error("Oturum başlatılamadı:", error);
    }
  };

  const handleEndSession = async () => {
    if (!selectedSession) return;
    try {
      const updated = await telehealthService.endVideoSession(
        selectedSession.id,
        "Danışmanlık tamamlandı.",
        "https://example.com/recording.mp4"
      );
      if (updated) {
        setSelectedSession(updated);
        setSessions(sessions.map((s) => (s.id === selectedSession.id ? updated : s)));
      }
    } catch (error) {
      console.error("Oturum sonlandırılamadı:", error);
    }
  };

  const renderSessionCard = (session: VideoSession) => (
    <TouchableOpacity
      key={session.id}
      onPress={() => setSelectedSession(session)}
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor:
          session.status === "active"
            ? colors.success
            : session.status === "completed"
              ? colors.primary
              : colors.border,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600" }}>
            {session.title}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 14, marginTop: 4 }}>
            {session.dietitianName}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>
            {new Date(session.scheduledTime).toLocaleString("tr-TR")}
          </Text>
        </View>
        <View
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            backgroundColor:
              session.status === "active"
                ? colors.success
                : session.status === "completed"
                  ? colors.primary
                  : colors.border,
          }}
        >
          <Text
            style={{
              color: session.status === "scheduled" ? colors.foreground : "#fff",
              fontSize: 12,
              fontWeight: "600",
            }}
          >
            {session.status === "active"
              ? "Aktif"
              : session.status === "completed"
                ? "Tamamlandı"
                : "Planlandı"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderChatMessage = (chat: ConsultationChat) => (
    <View
      key={chat.id}
      style={{
        marginBottom: 12,
        flexDirection: chat.senderRole === "client" ? "row-reverse" : "row",
      }}
    >
      <View
        style={{
          backgroundColor:
            chat.senderRole === "client" ? colors.primary : colors.surface,
          borderRadius: 12,
          padding: 12,
          maxWidth: "80%",
        }}
      >
        <Text
          style={{
            color:
              chat.senderRole === "client"
                ? "#fff"
                : colors.foreground,
            fontSize: 14,
          }}
        >
          {chat.message}
        </Text>
        <Text
          style={{
            color:
              chat.senderRole === "client"
                ? "rgba(255,255,255,0.7)"
                : colors.muted,
            fontSize: 12,
            marginTop: 4,
          }}
        >
          {new Date(chat.timestamp).toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <ScreenContainer>
        <NavigationHeader title="Video Konsültasyon" />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: colors.muted }}>Yükleniyor...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (selectedSession) {
    return (
      <ScreenContainer>
        <NavigationHeader title={selectedSession.title} onBack={() => setSelectedSession(null)} />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          {/* Video Alanı */}
          <View
            style={{
              backgroundColor: colors.border,
              borderRadius: 12,
              height: 300,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text style={{ color: colors.muted, fontSize: 16 }}>
              {selectedSession.status === "active"
                ? "📹 Video Akışı Burada Görüntülenecek"
                : "Video konsültasyon başlamadı"}
            </Text>
          </View>

          {/* Konsültasyon Bilgileri */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600" }}>
              Danışman: {selectedSession.dietitianName}
            </Text>
            <Text style={{ color: colors.muted, fontSize: 14, marginTop: 8 }}>
              Süre: {selectedSession.duration} dakika
            </Text>
            {selectedSession.notes && (
              <Text style={{ color: colors.muted, fontSize: 14, marginTop: 8 }}>
                Notlar: {selectedSession.notes}
              </Text>
            )}
          </View>

          {/* Sohbet */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600", marginBottom: 12 }}>
              Sohbet
            </Text>
            <FlatList
              data={chats}
              renderItem={({ item }) => renderChatMessage(item)}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 12,
                minHeight: 200,
              }}
            />
          </View>

          {/* Mesaj Gönderme */}
          {selectedSession.status === "active" && (
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <TextInput
                value={chatMessage}
                onChangeText={setChatMessage}
                placeholder="Mesaj yazın..."
                placeholderTextColor={colors.muted}
                style={{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  color: colors.foreground,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              />
              <TouchableOpacity
                onPress={handleSendMessage}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Gönder</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Kontrol Butonları */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            {selectedSession.status === "scheduled" && (
              <TouchableOpacity
                onPress={() => handleStartSession(selectedSession)}
                style={{
                  flex: 1,
                  backgroundColor: colors.success,
                  borderRadius: 12,
                  paddingVertical: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Başlat</Text>
              </TouchableOpacity>
            )}
            {selectedSession.status === "active" && (
              <TouchableOpacity
                onPress={handleEndSession}
                style={{
                  flex: 1,
                  backgroundColor: colors.error,
                  borderRadius: 12,
                  paddingVertical: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Bitir</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <NavigationHeader title="Video Konsültasyon" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Tab Seçimi */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
          {["sessions", "active", "history"].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab as typeof activeTab)}
              style={{
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 8,
                backgroundColor:
                  activeTab === tab ? colors.primary : colors.surface,
              }}
            >
              <Text
                style={{
                  color: activeTab === tab ? "#fff" : colors.foreground,
                  fontWeight: "600",
                  textAlign: "center",
                  fontSize: 12,
                }}
              >
                {tab === "sessions"
                  ? "Planlandı"
                  : tab === "active"
                    ? "Aktif"
                    : "Geçmiş"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Oturumlar Listesi */}
        {activeTab === "sessions" &&
          sessions
            .filter((s) => s.status === "scheduled")
            .map((session) => renderSessionCard(session))}

        {activeTab === "active" &&
          sessions
            .filter((s) => s.status === "active")
            .map((session) => renderSessionCard(session))}

        {activeTab === "history" &&
          sessions
            .filter((s) => s.status === "completed")
            .map((session) => renderSessionCard(session))}

        {sessions.filter((s) => {
          if (activeTab === "sessions") return s.status === "scheduled";
          if (activeTab === "active") return s.status === "active";
          return s.status === "completed";
        }).length === 0 && (
          <View style={{ alignItems: "center", paddingVertical: 32 }}>
            <Text style={{ color: colors.muted, fontSize: 14 }}>
              {activeTab === "sessions"
                ? "Planlanmış konsültasyon yok"
                : activeTab === "active"
                  ? "Aktif konsültasyon yok"
                  : "Geçmiş konsültasyon yok"}
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
