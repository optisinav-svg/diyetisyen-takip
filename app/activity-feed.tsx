import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useEffect, useState } from "react";
import { getUserRegistration } from "@/lib/_core/user-registration";
import {
  createActivity,
  getRecentClientActivities,
  getTodayActivities,
  deleteActivity,
} from "@/lib/_core/activity-tracking";
import { getDietitianClients, getClientDietitians } from "@/lib/_core/client-matching";
import { createNotification } from "@/lib/_core/notification-center";
import type { Activity } from "@/lib/_core/activity-tracking";

export default function ActivityFeedScreen() {
  const router = useRouter();
  const colors = useColors();
  const [user, setUser] = useState<any>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedActivityType, setSelectedActivityType] = useState<"meal" | "drink" | "exercise">("meal");
  const [formData, setFormData] = useState({
    title: "",
    value: "",
    unit: "",
  });
  const [matchedUsers, setMatchedUsers] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    // Her 5 saniyede bir aktiviteleri güncelle (real-time simulation)
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const userData = await getUserRegistration();
      setUser(userData);

      if (userData?.email) {
        if (userData.role === "dietitian") {
          // Diyetisyen: tüm danışanlarının aktivitelerini göster
          const clients = await getDietitianClients(userData.email);
          let allActivities: Activity[] = [];
          for (const client of clients) {
            const clientActivities = await getRecentClientActivities(client.clientEmail, 20);
            allActivities = [...allActivities, ...clientActivities];
          }
          // En yeni aktiviteleri en başta göster
          allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setActivities(allActivities.slice(0, 50));

          setMatchedUsers(clients.map((c) => ({ email: c.clientEmail, name: c.clientName })));
        } else {
          // Danışan: kendi aktivitelerini göster
          const todayActivities = await getTodayActivities(userData.email);
          setActivities(todayActivities);
        }
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const handleAddActivity = async () => {
    if (!formData.title.trim() || !formData.value.trim()) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurunuz");
      return;
    }

    try {
      const activity = await createActivity({
        type: selectedActivityType,
        title: formData.title,
        value: parseInt(formData.value),
        unit: formData.unit || (selectedActivityType === "meal" ? "kcal" : selectedActivityType === "drink" ? "ml" : "min"),
        clientId: user.email,
        clientEmail: user.email,
        timestamp: new Date().toISOString(),
      });

      // Diyetisyene bildirim gönder
      const dietitians = await getClientDietitians(user.email);
      for (const dietitian of dietitians) {
        await createNotification({
          type: "activity",
          title: `${user.name} ${selectedActivityType === "meal" ? "yemek" : selectedActivityType === "drink" ? "içecek" : "spor"} ekledi`,
          message: `${formData.title} - ${formData.value} ${formData.unit}`,
          userId: dietitian.dietitianEmail,
          relatedId: activity.id,
        });
      }

      Alert.alert("Başarılı", "Aktivite eklendi");
      setFormData({ title: "", value: "", unit: "" });
      setShowAddForm(false);
      loadData();
    } catch (error) {
      Alert.alert("Hata", "Aktivite eklenirken bir hata oluştu");
      console.error(error);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    try {
      await deleteActivity(activityId);
      loadData();
    } catch (error) {
      console.error("Failed to delete activity:", error);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "meal":
        return "🍽️";
      case "drink":
        return "💧";
      case "exercise":
        return "🏃";
      default:
        return "📌";
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "meal":
        return "#F59E0B";
      case "drink":
        return "#3B82F6";
      case "exercise":
        return "#10B981";
      default:
        return colors.primary;
    }
  };

  const activityTypes = [
    { id: "meal", label: "🍽️ Yemek", unit: "kcal" },
    { id: "drink", label: "💧 İçecek", unit: "ml" },
    { id: "exercise", label: "🏃 Spor", unit: "min" },
  ];

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-3xl font-bold text-foreground">📊 Aktiviteler</Text>
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

          {/* Add Activity Button (Client only) */}
          {user?.role !== "dietitian" && !showAddForm && (
            <TouchableOpacity
              onPress={() => setShowAddForm(true)}
              style={{
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: colors.primary,
              }}
            >
              <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>
                + Aktivite Ekle
              </Text>
            </TouchableOpacity>
          )}

          {/* Add Activity Form */}
          {showAddForm && user?.role !== "dietitian" && (
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
              {/* Activity Type Selector */}
              <View>
                <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8 }}>Aktivite Türü</Text>
                <View className="flex-row gap-2">
                  {activityTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      onPress={() => {
                        setSelectedActivityType(type.id as any);
                        setFormData({ ...formData, unit: type.unit });
                      }}
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        borderRadius: 6,
                        backgroundColor: selectedActivityType === type.id ? colors.primary : colors.background,
                        borderWidth: 1,
                        borderColor: selectedActivityType === type.id ? colors.primary : colors.border,
                      }}
                    >
                      <Text
                        style={{
                          color: selectedActivityType === type.id ? "#fff" : colors.foreground,
                          textAlign: "center",
                          fontWeight: "600",
                          fontSize: 12,
                        }}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TextInput
                placeholder="Aktivite Adı (örn: Tavuk Döner)"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
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
                <TextInput
                  placeholder="Miktar"
                  value={formData.value}
                  onChangeText={(text) => setFormData({ ...formData, value: text })}
                  keyboardType="numeric"
                  placeholderTextColor={colors.muted}
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    padding: 10,
                    color: colors.foreground,
                    backgroundColor: colors.background,
                  }}
                />
                <TextInput
                  placeholder="Birim"
                  value={formData.unit}
                  onChangeText={(text) => setFormData({ ...formData, unit: text })}
                  placeholderTextColor={colors.muted}
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    padding: 10,
                    color: colors.foreground,
                    backgroundColor: colors.background,
                  }}
                />
              </View>

              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={handleAddActivity}
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
                    setFormData({ title: "", value: "", unit: "" });
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

          {/* Activities Feed */}
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                {user?.role === "dietitian" ? "Danışan Aktiviteleri" : "Günümün Aktiviteleri"}
              </Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>
                🔄 Canlı ({activities.length})
              </Text>
            </View>

            {activities.length > 0 ? (
              activities.map((activity) => (
                <View
                  key={activity.id}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderLeftWidth: 4,
                    borderLeftColor: getActivityColor(activity.type),
                  }}
                >
                  <View className="flex-row items-start justify-between gap-2">
                    <View className="flex-1 gap-1">
                      <View className="flex-row items-center gap-2">
                        <Text style={{ fontSize: 20 }}>{getActivityIcon(activity.type)}</Text>
                        <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, flex: 1 }}>
                          {activity.title}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 12, color: colors.muted, marginLeft: 26 }}>
                        {activity.value} {activity.unit}
                      </Text>
                      {user?.role === "dietitian" && (
                        <Text style={{ fontSize: 11, color: colors.muted, marginLeft: 26 }}>
                          👤 {activity.clientEmail}
                        </Text>
                      )}
                      <Text style={{ fontSize: 10, color: colors.muted, marginLeft: 26, marginTop: 4 }}>
                        {new Date(activity.timestamp).toLocaleString("tr-TR")}
                      </Text>
                    </View>
                    {user?.role !== "dietitian" && (
                      <TouchableOpacity
                        onPress={() => handleDeleteActivity(activity.id)}
                        style={{
                          paddingVertical: 4,
                          paddingHorizontal: 8,
                          borderRadius: 4,
                          backgroundColor: colors.surface,
                        }}
                      >
                        <Text style={{ fontSize: 12, color: colors.muted }}>✕</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <Text style={{ textAlign: "center", color: colors.muted, marginVertical: 20 }}>
                Henüz aktivite yok
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
