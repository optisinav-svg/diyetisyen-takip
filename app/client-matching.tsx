import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useEffect, useState } from "react";
import { getUserRegistration } from "@/lib/_core/user-registration";
import {
  createClientRequest,
  getDietitianClients,
  getClientDietitians,
  getPendingRequests,
  acceptClientRequest,
  rejectClientRequest,
} from "@/lib/_core/client-matching";
import type { ClientMatch, ClientRequest } from "@/lib/_core/client-matching";

export default function ClientMatchingScreen() {
  const router = useRouter();
  const colors = useColors();
  const [user, setUser] = useState<any>(null);
  const [clients, setClients] = useState<ClientMatch[]>([]);
  const [dietitians, setDietitians] = useState<ClientMatch[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ClientRequest[]>([]);
  const [activeTab, setActiveTab] = useState<"clients" | "requests">("clients");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await getUserRegistration();
      setUser(userData);

      if (userData?.role === "dietitian") {
        const userClients = await getDietitianClients(userData.email);
        setClients(userClients);

        const requests = await getPendingRequests(userData.email);
        setPendingRequests(requests);
      } else {
        const userDietitians = await getClientDietitians(userData?.email || "");
        setDietitians(userDietitians);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const handleAddClient = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurunuz");
      return;
    }

    if (!formData.email.includes("@")) {
      Alert.alert("Hata", "Lütfen geçerli bir email adresi giriniz");
      return;
    }

    try {
      if (user?.role === "dietitian") {
        await createClientRequest({
          clientName: formData.name,
          clientEmail: formData.email,
          clientId: formData.email,
          dietitianId: user.email,
          dietitianName: user.name,
          dietitianEmail: user.email,
          status: "pending",
        });
        Alert.alert("Başarılı", "Danışan davetiyesi gönderildi");
        setFormData({ name: "", email: "" });
        setShowAddForm(false);
        loadData();
      }
    } catch (error) {
      Alert.alert("Hata", "Danışan eklenirken bir hata oluştu");
      console.error(error);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptClientRequest(requestId);
      Alert.alert("Başarılı", "Danışan isteği kabul edildi");
      loadData();
    } catch (error) {
      Alert.alert("Hata", "İstek kabul edilirken bir hata oluştu");
      console.error(error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectClientRequest(requestId);
      Alert.alert("Başarılı", "Danışan isteği reddedildi");
      loadData();
    } catch (error) {
      Alert.alert("Hata", "İstek reddedilirken bir hata oluştu");
      console.error(error);
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-3xl font-bold text-foreground">👥 Eşleştirmeler</Text>
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

          {/* Tabs */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setActiveTab("clients")}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: activeTab === "clients" ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: activeTab === "clients" ? colors.primary : colors.border,
              }}
            >
              <Text
                style={{
                  color: activeTab === "clients" ? "#fff" : colors.foreground,
                  textAlign: "center",
                  fontWeight: "600",
                }}
              >
                {user?.role === "dietitian" ? "Danışanlar" : "Diyetisyenler"}
              </Text>
            </TouchableOpacity>

            {user?.role === "dietitian" && (
              <TouchableOpacity
                onPress={() => setActiveTab("requests")}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor: activeTab === "requests" ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: activeTab === "requests" ? colors.primary : colors.border,
                }}
              >
                <Text
                  style={{
                    color: activeTab === "requests" ? "#fff" : colors.foreground,
                    textAlign: "center",
                    fontWeight: "600",
                  }}
                >
                  İstekler ({pendingRequests.length})
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Add Client Button (Dietitian only) */}
          {user?.role === "dietitian" && !showAddForm && (
            <TouchableOpacity
              onPress={() => setShowAddForm(true)}
              style={{
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: colors.primary,
              }}
            >
              <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>
                + Danışan Ekle
              </Text>
            </TouchableOpacity>
          )}

          {/* Add Client Form */}
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
                placeholder="Danışan Adı"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
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
              <TextInput
                placeholder="Danışan Email"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
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
                  onPress={handleAddClient}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 6,
                    backgroundColor: colors.primary,
                  }}
                >
                  <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600", fontSize: 12 }}>
                    Davet Et
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowAddForm(false);
                    setFormData({ name: "", email: "" });
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

          {/* Content */}
          {activeTab === "clients" ? (
            <View className="gap-3">
              {(user?.role === "dietitian" ? clients : dietitians).length > 0 ? (
                (user?.role === "dietitian" ? clients : dietitians).map((item) => (
                  <View
                    key={item.id}
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 12,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                      {user?.role === "dietitian" ? item.clientName : item.dietitianName}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
                      {user?.role === "dietitian" ? item.clientEmail : item.dietitianEmail}
                    </Text>
                    <View
                      style={{
                        backgroundColor: item.status === "active" ? "#51CF66" : "#FFD43B",
                        paddingVertical: 4,
                        paddingHorizontal: 8,
                        borderRadius: 4,
                        alignSelf: "flex-start",
                        marginTop: 8,
                      }}
                    >
                      <Text style={{ fontSize: 10, color: "#000", fontWeight: "600" }}>
                        {item.status === "active" ? "Aktif" : "Beklemede"}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={{ textAlign: "center", color: colors.muted, marginVertical: 20 }}>
                  Henüz {user?.role === "dietitian" ? "danışan" : "diyetisyen"} eklenmedi
                </Text>
              )}
            </View>
          ) : (
            <View className="gap-3">
              {pendingRequests.length > 0 ? (
                pendingRequests.map((request) => (
                  <View
                    key={request.id}
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 12,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                      {request.clientName}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
                      {request.clientEmail}
                    </Text>
                    <View className="flex-row gap-2 mt-3">
                      <TouchableOpacity
                        onPress={() => handleAcceptRequest(request.id)}
                        style={{
                          flex: 1,
                          paddingVertical: 6,
                          borderRadius: 6,
                          backgroundColor: "#51CF66",
                        }}
                      >
                        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600", fontSize: 12 }}>
                          Kabul Et
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleRejectRequest(request.id)}
                        style={{
                          flex: 1,
                          paddingVertical: 6,
                          borderRadius: 6,
                          backgroundColor: "#FF6B6B",
                        }}
                      >
                        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600", fontSize: 12 }}>
                          Reddet
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={{ textAlign: "center", color: colors.muted, marginVertical: 20 }}>
                  Beklemede istek yok
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
