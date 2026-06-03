import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useEffect, useState } from "react";
import { getUserRegistration } from "@/lib/_core/user-registration";
import {
  createFoodPackage,
  getDietitianFoodPackages,
  updateFoodPackage,
  deleteFoodPackage,
  sharePackageWithClient,
  getDietitianSharedPackages,
  getClientSharedPackages,
} from "@/lib/_core/food-management";
import { getDietitianClients, getClientDietitians } from "@/lib/_core/client-matching";
import type { FoodPackage, SharedPackage } from "@/lib/_core/food-management";

export default function FoodPackagesScreen() {
  const router = useRouter();
  const colors = useColors();
  const [user, setUser] = useState<any>(null);
  const [packages, setPackages] = useState<FoodPackage[]>([]);
  const [sharedPackages, setSharedPackages] = useState<SharedPackage[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [matchedUsers, setMatchedUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    foods: [] as { foodId: string; foodName: string; type: "recommended" | "forbidden" }[],
  });
  const [newFood, setNewFood] = useState({ name: "", type: "recommended" as "recommended" | "forbidden" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await getUserRegistration();
      setUser(userData);

      if (userData && userData.role === "dietitian") {
        const userPackages = await getDietitianFoodPackages(userData.email);
        setPackages(userPackages);

        const clients = await getDietitianClients(userData.email);
        setMatchedUsers(clients.map((c) => ({ email: c.clientEmail, name: c.clientName })));

        const shared = await getDietitianSharedPackages(userData.email);
        setSharedPackages(shared);
      } else if (userData) {
        const shared = await getClientSharedPackages(userData.email);
        setSharedPackages(shared);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const handleAddFood = () => {
    if (!newFood.name.trim()) {
      Alert.alert("Hata", "Gıda adı boş olamaz");
      return;
    }

    setFormData({
      ...formData,
      foods: [
        ...formData.foods,
        {
          foodId: `food_${Date.now()}`,
          foodName: newFood.name,
          type: newFood.type,
        },
      ],
    });
    setNewFood({ name: "", type: "recommended" });
  };

  const handleRemoveFood = (index: number) => {
    setFormData({
      ...formData,
      foods: formData.foods.filter((_, i) => i !== index),
    });
  };

  const handleCreatePackage = async () => {
    if (!formData.name.trim() || formData.foods.length === 0) {
      Alert.alert("Hata", "Paket adı ve en az bir gıda gereklidir");
      return;
    }

    try {
      await createFoodPackage({
        dietitianId: user.email,
        name: formData.name,
        description: formData.description,
        foods: formData.foods,
      });

      Alert.alert("Başarılı", "Paket oluşturuldu");
      setFormData({ name: "", description: "", foods: [] });
      setShowAddForm(false);
      loadData();
    } catch (error) {
      Alert.alert("Hata", "Paket oluşturulurken bir hata oluştu");
      console.error(error);
    }
  };

  const handleSharePackage = async (packageId: string) => {
    if (matchedUsers.length === 0) {
      Alert.alert("Hata", "Paylaşılacak danışan yok");
      return;
    }

    Alert.alert("Danışan Seç", "Paketi hangi danışana paylaşmak istersiniz?", [
      ...matchedUsers.map((client) => ({
        text: client.name,
        onPress: async () => {
          try {
            await sharePackageWithClient(packageId, user.email, client.email, client.name);
            Alert.alert("Başarılı", "Paket paylaşıldı");
            loadData();
          } catch (error) {
            console.error("Failed to share package:", error);
          }
        },
      })),
      { text: "İptal", style: "cancel" as const },
    ]);
  };

  const handleDeletePackage = async (packageId: string) => {
    Alert.alert("Sil", "Bu paketi silmek istediğinize emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteFoodPackage(packageId);
            loadData();
          } catch (error) {
            console.error("Failed to delete package:", error);
          }
        },
      },
    ]);
  };

  if (user?.role === "dietitian") {
    return (
      <ScreenContainer className="p-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="gap-4">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-3xl font-bold text-foreground">📦 Gıda Paketleri</Text>
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

            {/* Add Package Button */}
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
                  + Paket Oluştur
                </Text>
              </TouchableOpacity>
            )}

            {/* Create Package Form */}
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
                  placeholder="Paket Adı"
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
                  placeholder="Açıklama (opsiyonel)"
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
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

                {/* Add Food to Package */}
                <View className="gap-2">
                  <Text style={{ fontSize: 12, color: colors.muted, fontWeight: "600" }}>
                    Gıdalar ({formData.foods.length})
                  </Text>

                  {formData.foods.map((food, index) => (
                    <View
                      key={index}
                      style={{
                        backgroundColor: colors.background,
                        borderRadius: 8,
                        padding: 8,
                        borderWidth: 1,
                        borderColor: colors.border,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 12, color: colors.foreground, fontWeight: "600" }}>
                          {food.foodName}
                        </Text>
                        <Text style={{ fontSize: 10, color: colors.muted }}>
                          {food.type === "recommended" ? "✓ Önerilen" : "✕ Yasaklı"}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleRemoveFood(index)}
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
                  ))}

                  <View className="gap-2">
                    <View className="flex-row gap-2">
                      <TextInput
                        placeholder="Gıda adı"
                        value={newFood.name}
                        onChangeText={(text) => setNewFood({ ...newFood, name: text })}
                        placeholderTextColor={colors.muted}
                        style={{
                          flex: 1,
                          borderWidth: 1,
                          borderColor: colors.border,
                          borderRadius: 8,
                          padding: 8,
                          color: colors.foreground,
                          backgroundColor: colors.background,
                          fontSize: 12,
                        }}
                      />
                      <TouchableOpacity
                        onPress={() => setNewFood({ ...newFood, type: "recommended" })}
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 10,
                          borderRadius: 6,
                          backgroundColor:
                            newFood.type === "recommended" ? "#10B981" : colors.background,
                          borderWidth: 1,
                          borderColor: newFood.type === "recommended" ? "#10B981" : colors.border,
                        }}
                      >
                        <Text
                          style={{
                            color: newFood.type === "recommended" ? "#fff" : colors.foreground,
                            fontWeight: "600",
                            fontSize: 10,
                          }}
                        >
                          ✓
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setNewFood({ ...newFood, type: "forbidden" })}
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 10,
                          borderRadius: 6,
                          backgroundColor: newFood.type === "forbidden" ? "#EF4444" : colors.background,
                          borderWidth: 1,
                          borderColor: newFood.type === "forbidden" ? "#EF4444" : colors.border,
                        }}
                      >
                        <Text
                          style={{
                            color: newFood.type === "forbidden" ? "#fff" : colors.foreground,
                            fontWeight: "600",
                            fontSize: 10,
                          }}
                        >
                          ✕
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      onPress={handleAddFood}
                      style={{
                        paddingVertical: 6,
                        borderRadius: 6,
                        backgroundColor: colors.primary,
                      }}
                    >
                      <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600", fontSize: 12 }}>
                        Gıda Ekle
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={handleCreatePackage}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: 6,
                      backgroundColor: colors.primary,
                    }}
                  >
                    <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600", fontSize: 12 }}>
                      Oluştur
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setShowAddForm(false);
                      setFormData({ name: "", description: "", foods: [] });
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

            {/* Packages List */}
            <View className="gap-3">
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                Paketlerim ({packages.length})
              </Text>
              {packages.length > 0 ? (
                packages.map((pkg) => (
                  <View
                    key={pkg.id}
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 12,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                      {pkg.name}
                    </Text>
                    {pkg.description && (
                      <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
                        {pkg.description}
                      </Text>
                    )}
                    <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
                      📋 {pkg.foods.length} gıda
                    </Text>

                    <View className="flex-row gap-2 mt-3">
                      <TouchableOpacity
                        onPress={() => handleSharePackage(pkg.id)}
                        style={{
                          flex: 1,
                          paddingVertical: 6,
                          borderRadius: 6,
                          backgroundColor: colors.primary,
                        }}
                      >
                        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600", fontSize: 12 }}>
                          Paylaş
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeletePackage(pkg.id)}
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 8,
                          borderRadius: 6,
                          backgroundColor: "#EF4444",
                        }}
                      >
                        <Text style={{ color: "#fff", fontWeight: "600", fontSize: 12 }}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={{ textAlign: "center", color: colors.muted, marginVertical: 20 }}>
                  Henüz paket yok
                </Text>
              )}
            </View>

            {/* Shared Packages */}
            {sharedPackages.length > 0 && (
              <View className="gap-3">
                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                  Paylaşılan Paketler ({sharedPackages.length})
                </Text>
                {sharedPackages.map((shared) => (
                  <View
                    key={shared.id}
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 12,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: colors.muted }}>
                      👤 {shared.clientName}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
                      📅 {new Date(shared.sharedAt).toLocaleDateString("tr-TR")}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // Danışan görünümü
  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-3xl font-bold text-foreground">📦 Gıda Paketleri</Text>
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

          {/* Shared Packages */}
          <View className="gap-3">
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
              Diyetisyenin Paketleri ({sharedPackages.length})
            </Text>
            {sharedPackages.length > 0 ? (
              sharedPackages.map((shared) => (
                <View
                  key={shared.id}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                    Paket
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
                    👨‍⚕️ {shared.dietitianId}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
                    📅 {new Date(shared.sharedAt).toLocaleDateString("tr-TR")}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={{ textAlign: "center", color: colors.muted, marginVertical: 20 }}>
                Henüz paket paylaşılmadı
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
