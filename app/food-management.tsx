import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useEffect, useState } from "react";
import { getUserRegistration } from "@/lib/_core/user-registration";
import {
  createFoodRecommendation,
  getClientFoodRecommendations,
  getRecommendedFoods,
  getForbiddenFoods,
  deleteFoodRecommendation,
} from "@/lib/_core/food-management";
import { getDietitianClients } from "@/lib/_core/client-matching";
import type { FoodRecommendation } from "@/lib/_core/food-management";

export default function FoodManagementScreen() {
  const router = useRouter();
  const colors = useColors();
  const [user, setUser] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<FoodRecommendation[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [matchedUsers, setMatchedUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    foodName: "",
    type: "recommended" as "recommended" | "forbidden",
    reason: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await getUserRegistration();
      setUser(userData);

      if (userData?.role === "dietitian") {
        const clients = await getDietitianClients(userData.email);
        setMatchedUsers(clients.map((c) => ({ email: c.clientEmail, name: c.clientName })));

        if (clients.length > 0) {
          setSelectedClient(clients[0].clientEmail);
          const clientRecommendations = await getClientFoodRecommendations(clients[0].clientEmail);
          setRecommendations(clientRecommendations);
        }
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const handleClientChange = async (clientEmail: string) => {
    setSelectedClient(clientEmail);
    const clientRecommendations = await getClientFoodRecommendations(clientEmail);
    setRecommendations(clientRecommendations);
  };

  const handleAddRecommendation = async () => {
    if (!formData.foodName.trim() || !selectedClient) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurunuz");
      return;
    }

    try {
      await createFoodRecommendation({
        dietitianId: user.email,
        clientId: selectedClient,
        foodId: `food_${Date.now()}`,
        foodName: formData.foodName,
        type: formData.type,
        reason: formData.reason,
      });

      Alert.alert("Başarılı", `Gıda ${formData.type === "recommended" ? "önerildi" : "yasaklandı"}`);
      setFormData({ foodName: "", type: "recommended", reason: "" });
      setShowAddForm(false);
      handleClientChange(selectedClient);
    } catch (error) {
      Alert.alert("Hata", "Gıda eklenirken bir hata oluştu");
      console.error(error);
    }
  };

  const handleDeleteRecommendation = async (recommendationId: string) => {
    Alert.alert("Sil", "Bu gıdayı silmek istediğinize emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteFoodRecommendation(recommendationId);
            handleClientChange(selectedClient);
          } catch (error) {
            console.error("Failed to delete recommendation:", error);
          }
        },
      },
    ]);
  };

  const recommendedFoods = recommendations.filter((r) => r.type === "recommended");
  const forbiddenFoods = recommendations.filter((r) => r.type === "forbidden");

  if (user?.role !== "dietitian") {
    return (
      <ScreenContainer className="p-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="gap-4 items-center justify-center">
            <Text style={{ fontSize: 16, color: colors.muted, textAlign: "center" }}>
              Bu özellik sadece diyetisyenler için mevcuttur.
            </Text>
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
            <Text className="text-3xl font-bold text-foreground">🍽️ Gıda Yönetimi</Text>
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

          {/* Client Selector */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8 }}>Danışan Seç</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
              {matchedUsers.map((client) => (
                <TouchableOpacity
                  key={client.email}
                  onPress={() => handleClientChange(client.email)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 20,
                    backgroundColor: selectedClient === client.email ? colors.primary : colors.background,
                    borderWidth: 1,
                    borderColor: selectedClient === client.email ? colors.primary : colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: selectedClient === client.email ? "#fff" : colors.foreground,
                      fontWeight: "600",
                      fontSize: 12,
                    }}
                  >
                    {client.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Add Recommendation Button */}
          {!showAddForm && (
            <TouchableOpacity
              onPress={() => setShowAddForm(true)}
              style={{
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: colors.primary,
              }}
            >
              <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>
                + Gıda Ekle
              </Text>
            </TouchableOpacity>
          )}

          {/* Add Recommendation Form */}
          {showAddForm && (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: colors.border,
                gap: 10,
              }}
            >
              <TextInput
                placeholder="Gıda Adı (örn: Tavuk Göğsü)"
                value={formData.foodName}
                onChangeText={(text) => setFormData({ ...formData, foodName: text })}
                placeholderTextColor={colors.muted}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  padding: 10,
                  color: colors.foreground,
                  backgroundColor: colors.background,
                }}
              />

              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => setFormData({ ...formData, type: "recommended" })}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 6,
                    backgroundColor: formData.type === "recommended" ? "#10B981" : colors.background,
                    borderWidth: 1,
                    borderColor: formData.type === "recommended" ? "#10B981" : colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: formData.type === "recommended" ? "#fff" : colors.foreground,
                      textAlign: "center",
                      fontWeight: "600",
                      fontSize: 12,
                    }}
                  >
                    ✓ Önerilen
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setFormData({ ...formData, type: "forbidden" })}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 6,
                    backgroundColor: formData.type === "forbidden" ? "#EF4444" : colors.background,
                    borderWidth: 1,
                    borderColor: formData.type === "forbidden" ? "#EF4444" : colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: formData.type === "forbidden" ? "#fff" : colors.foreground,
                      textAlign: "center",
                      fontWeight: "600",
                      fontSize: 12,
                    }}
                  >
                    ✕ Yasaklı
                  </Text>
                </TouchableOpacity>
              </View>

              <TextInput
                placeholder="Neden? (opsiyonel)"
                value={formData.reason}
                onChangeText={(text) => setFormData({ ...formData, reason: text })}
                placeholderTextColor={colors.muted}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  padding: 10,
                  color: colors.foreground,
                  backgroundColor: colors.background,
                  minHeight: 60,
                }}
                multiline
              />

              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={handleAddRecommendation}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 6,
                    backgroundColor: colors.primary,
                  }}
                >
                  <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600", fontSize: 12 }}>
                    Ekle
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowAddForm(false);
                    setFormData({ foodName: "", type: "recommended", reason: "" });
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 6,
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ color: colors.foreground, textAlign: "center", fontWeight: "600", fontSize: 12 }}>
                    İptal
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Recommended Foods */}
          <View className="gap-3">
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
              ✓ Önerilen Gıdalar ({recommendedFoods.length})
            </Text>
            {recommendedFoods.length > 0 ? (
              recommendedFoods.map((food) => (
                <View
                  key={food.id}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderLeftWidth: 4,
                    borderLeftColor: "#10B981",
                  }}
                >
                  <View className="flex-row items-start justify-between gap-2">
                    <View className="flex-1">
                      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                        {food.foodName}
                      </Text>
                      {food.reason && (
                        <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
                          {food.reason}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteRecommendation(food.id)}
                      style={{
                        paddingVertical: 4,
                        paddingHorizontal: 8,
                        borderRadius: 4,
                        backgroundColor: colors.surface,
                      }}
                    >
                      <Text style={{ fontSize: 12, color: colors.muted }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={{ fontSize: 12, color: colors.muted, textAlign: "center", marginVertical: 10 }}>
                Henüz önerilen gıda yok
              </Text>
            )}
          </View>

          {/* Forbidden Foods */}
          <View className="gap-3">
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
              ✕ Yasaklı Gıdalar ({forbiddenFoods.length})
            </Text>
            {forbiddenFoods.length > 0 ? (
              forbiddenFoods.map((food) => (
                <View
                  key={food.id}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderLeftWidth: 4,
                    borderLeftColor: "#EF4444",
                  }}
                >
                  <View className="flex-row items-start justify-between gap-2">
                    <View className="flex-1">
                      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                        {food.foodName}
                      </Text>
                      {food.reason && (
                        <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
                          {food.reason}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteRecommendation(food.id)}
                      style={{
                        paddingVertical: 4,
                        paddingHorizontal: 8,
                        borderRadius: 4,
                        backgroundColor: colors.surface,
                      }}
                    >
                      <Text style={{ fontSize: 12, color: colors.muted }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={{ fontSize: 12, color: colors.muted, textAlign: "center", marginVertical: 10 }}>
                Henüz yasaklı gıda yok
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
