import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useEffect, useState } from "react";
import { getUserRegistration } from "@/lib/_core/user-registration";
import {
  getClientFeedback,
  getDietitianFeedback,
  addClientFeedback,
  respondToFeedback,
  getFeedbackStats,
  type ClientFeedback,
  type FeedbackStats,
} from "@/lib/_core/client-feedback";

export default function ClientFeedbackScreen() {
  const router = useRouter();
  const colors = useColors();

  const [user, setUser] = useState<any>(null);
  const [feedbacks, setFeedbacks] = useState<ClientFeedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [mode, setMode] = useState<"view" | "add" | "respond">("view");
  const [selectedFeedback, setSelectedFeedback] = useState<ClientFeedback | null>(null);
  const [responseMessage, setResponseMessage] = useState("");

  // Form state
  const [feedbackType, setFeedbackType] = useState<ClientFeedback["feedbackType"]>("helpful");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");

  const feedbackTypes = [
    { id: "helpful", label: "Yardımcı Oldu", icon: "👍" },
    { id: "not_helpful", label: "Yardımcı Olmadı", icon: "👎" },
    { id: "need_clarification", label: "Açıklama Gerekli", icon: "❓" },
    { id: "completed", label: "Tamamlandı", icon: "✓" },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await getUserRegistration();
      setUser(userData);

      if (userData?.role === "dietitian") {
        const diets = await getDietitianFeedback(userData.email);
        setFeedbacks(diets);
        const s = await getFeedbackStats(userData.email);
        setStats(s);
      } else if (userData) {
        const clients = await getClientFeedback(userData.email);
        setFeedbacks(clients);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const handleAddFeedback = async () => {
    if (!message) {
      Alert.alert("Hata", "Lütfen bir yorum yazın");
      return;
    }

    try {
      await addClientFeedback(
        user.email,
        user.name,
        "dietitian@test.com",
        `rec_${Date.now()}`,
        "Diyetisyen Önerisi",
        feedbackType as ClientFeedback["feedbackType"],
        rating,
        message
      );

      Alert.alert("Başarılı", "Geri bildiriminiz gönderildi");
      setMessage("");
      setRating(5);
      setMode("view");
      loadData();
    } catch (error) {
      Alert.alert("Hata", "Geri bildirim gönderilemedi");
    }
  };

  const handleRespondToFeedback = async () => {
    if (!responseMessage || !selectedFeedback) {
      Alert.alert("Hata", "Lütfen bir yanıt yazın");
      return;
    }

    try {
      await respondToFeedback(selectedFeedback.clientId, selectedFeedback.id, responseMessage);
      Alert.alert("Başarılı", "Yanıtınız gönderildi");
      setResponseMessage("");
      setMode("view");
      setSelectedFeedback(null);
      loadData();
    } catch (error) {
      Alert.alert("Hata", "Yanıt gönderilemedi");
    }
  };

  const getFeedbackTypeIcon = (type: string) => {
    const found = feedbackTypes.find((ft) => ft.id === type);
    return found?.icon || "📝";
  };

  const getFeedbackTypeLabel = (type: string) => {
    const found = feedbackTypes.find((ft) => ft.id === type);
    return found?.label || type;
  };

  if (!user) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <Text style={{ color: colors.foreground }}>Yükleniyor...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (mode === "add") {
    return (
      <ScreenContainer className="p-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="gap-4">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-2xl font-bold text-foreground">➕ Geri Bildirim Ekle</Text>
              <TouchableOpacity
                onPress={() => setMode("view")}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 6,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ color: colors.foreground, fontWeight: "600" }}>← Geri</Text>
              </TouchableOpacity>
            </View>

            {/* Feedback Type Selection */}
            <View className="gap-2">
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                Geri Bildirim Türü
              </Text>
              <View className="gap-2">
                {feedbackTypes.map((ft) => (
                  <TouchableOpacity
                    key={ft.id}
                    onPress={() => setFeedbackType(ft.id as ClientFeedback["feedbackType"])}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      backgroundColor:
                        feedbackType === ft.id ? colors.primary : colors.surface,
                      borderWidth: 1,
                      borderColor: feedbackType === ft.id ? colors.primary : colors.border,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>{ft.icon}</Text>
                    <Text
                      style={{
                        color: feedbackType === ft.id ? "#fff" : colors.foreground,
                        fontWeight: "600",
                        flex: 1,
                      }}
                    >
                      {ft.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Rating */}
            <View className="gap-2">
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                Puan: {rating}/5
              </Text>
              <View className="flex-row gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((r) => (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setRating(r)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 6,
                      backgroundColor: rating === r ? colors.primary : colors.surface,
                      borderWidth: 1,
                      borderColor: rating === r ? colors.primary : colors.border,
                    }}
                  >
                    <Text
                      style={{
                        color: rating === r ? "#fff" : colors.foreground,
                        fontWeight: "600",
                      }}
                    >
                      {r}⭐
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Message Input */}
            <View className="gap-2">
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                Yorum
              </Text>
              <TextInput
                placeholder="Detaylı yorum yazın..."
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  color: colors.foreground,
                  fontSize: 14,
                  textAlignVertical: "top",
                }}
                placeholderTextColor={colors.muted}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleAddFeedback}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: colors.primary,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600", textAlign: "center" }}>
                ✓ Gönder
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  if (mode === "respond" && selectedFeedback) {
    return (
      <ScreenContainer className="p-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="gap-4">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-2xl font-bold text-foreground">💬 Yanıt Ver</Text>
              <TouchableOpacity
                onPress={() => {
                  setMode("view");
                  setSelectedFeedback(null);
                }}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 6,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ color: colors.foreground, fontWeight: "600" }}>← Geri</Text>
              </TouchableOpacity>
            </View>

            {/* Feedback Info */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View className="flex-row items-center gap-2 mb-2">
                <Text style={{ fontSize: 16 }}>
                  {getFeedbackTypeIcon(selectedFeedback.feedbackType)}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                    {selectedFeedback.clientName}
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>
                    {getFeedbackTypeLabel(selectedFeedback.feedbackType)}
                  </Text>
                </View>
                <View
                  style={{
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                    borderRadius: 4,
                    backgroundColor: colors.primary,
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: "bold", color: "#fff" }}>
                    {selectedFeedback.rating}⭐
                  </Text>
                </View>
              </View>

              <Text style={{ fontSize: 11, color: colors.muted }}>
                {selectedFeedback.message}
              </Text>
            </View>

            {/* Response Input */}
            <View className="gap-2">
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                Yanıtınız
              </Text>
              <TextInput
                placeholder="Danışana yanıt yazın..."
                value={responseMessage}
                onChangeText={setResponseMessage}
                multiline
                numberOfLines={4}
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  color: colors.foreground,
                  fontSize: 14,
                  textAlignVertical: "top",
                }}
                placeholderTextColor={colors.muted}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleRespondToFeedback}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: colors.primary,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600", textAlign: "center" }}>
                ✓ Yanıtı Gönder
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-3xl font-bold text-foreground">💬 Geri Bildirimler</Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 6,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.foreground, fontWeight: "600" }}>← Geri</Text>
            </TouchableOpacity>
          </View>

          {/* Stats (for dietitian) */}
          {user.role === "dietitian" && stats && (
            <View className="gap-2">
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                📊 İstatistikler
              </Text>
              <View className="grid grid-cols-3 gap-2">
                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 8,
                    padding: 10,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ fontSize: 9, color: colors.muted }}>Toplam</Text>
                  <Text style={{ fontSize: 14, fontWeight: "bold", color: colors.primary }}>
                    {stats.totalFeedback}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 8,
                    padding: 10,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ fontSize: 9, color: colors.muted }}>Ortalama Puan</Text>
                  <Text style={{ fontSize: 14, fontWeight: "bold", color: colors.primary }}>
                    {stats.averageRating.toFixed(1)}⭐
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 8,
                    padding: 10,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ fontSize: 9, color: colors.muted }}>Yardımcı</Text>
                  <Text style={{ fontSize: 14, fontWeight: "bold", color: "#10B981" }}>
                    {stats.helpfulCount}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Add Feedback Button (for clients) */}
          {user.role === "danişan" && (
            <TouchableOpacity
              onPress={() => setMode("add")}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: colors.primary,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600", textAlign: "center" }}>
                ➕ Geri Bildirim Ekle
              </Text>
            </TouchableOpacity>
          )}

          {/* Feedback List */}
          {feedbacks.length > 0 ? (
            <View className="gap-3">
              {feedbacks.map((feedback) => (
                <View
                  key={feedback.id}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  {/* Header */}
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center gap-2 flex-1">
                      <Text style={{ fontSize: 16 }}>
                        {getFeedbackTypeIcon(feedback.feedbackType)}
                      </Text>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "600",
                            color: colors.foreground,
                          }}
                        >
                          {user.role === "dietitian"
                            ? feedback.clientName
                            : "Diyetisyen"}
                        </Text>
                        <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>
                          {getFeedbackTypeLabel(feedback.feedbackType)}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        paddingVertical: 4,
                        paddingHorizontal: 8,
                        borderRadius: 4,
                        backgroundColor: colors.primary,
                      }}
                    >
                      <Text style={{ fontSize: 10, fontWeight: "bold", color: "#fff" }}>
                        {feedback.rating}⭐
                      </Text>
                    </View>
                  </View>

                  {/* Message */}
                  <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 8 }}>
                    {feedback.message}
                  </Text>

                  {/* Response */}
                  {feedback.dietitianResponse && (
                    <View
                      style={{
                        backgroundColor: colors.background,
                        borderRadius: 8,
                        padding: 10,
                        marginBottom: 8,
                        borderLeftWidth: 3,
                        borderLeftColor: colors.primary,
                      }}
                    >
                      <Text style={{ fontSize: 9, fontWeight: "600", color: colors.foreground }}>
                        💬 Diyetisyen Yanıtı
                      </Text>
                      <Text style={{ fontSize: 10, color: colors.muted, marginTop: 4 }}>
                        {feedback.dietitianResponse.message}
                      </Text>
                    </View>
                  )}

                  {/* Footer */}
                  <View className="flex-row items-center justify-between">
                    <Text style={{ fontSize: 9, color: colors.muted }}>
                      {new Date(feedback.createdAt).toLocaleDateString("tr-TR")}
                    </Text>
                    {user.role === "dietitian" && !feedback.dietitianResponse && (
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedFeedback(feedback);
                          setMode("respond");
                        }}
                        style={{
                          paddingVertical: 4,
                          paddingHorizontal: 8,
                          borderRadius: 4,
                          backgroundColor: colors.primary,
                        }}
                      >
                        <Text style={{ fontSize: 9, color: "#fff", fontWeight: "600" }}>
                          💬 Yanıt Ver
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={{ textAlign: "center", color: colors.muted, marginVertical: 20 }}>
              Henüz geri bildirim yok
            </Text>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
