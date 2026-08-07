import { BackButton } from "@/components/back-button";
import { ScrollView, Text, View, TouchableOpacity, FlatList, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useEffect, useState } from "react";
import { getUserRegistration } from "@/lib/_core/user-registration";
import {
  getDietitianRecommendations,
  getActivityAlerts,
  markRecommendationAsRead,
  deleteRecommendation,
  type DietitianRecommendation,
  type ActivityAlert,
} from "@/lib/_core/dietitian-recommendations";

export default function DietitianRecommendationsScreen() {
  const router = useRouter();
  const colors = useColors();

  const [user, setUser] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<DietitianRecommendation[]>([]);
  const [activityAlerts, setActivityAlerts] = useState<ActivityAlert[]>([]);
  const [activeTab, setActiveTab] = useState<"recommendations" | "alerts">("recommendations");
  const [filterType, setFilterType] = useState<"all" | "unread" | "high">("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await getUserRegistration();
      setUser(userData);

      if (userData?.role === "dietitian") {
        const recs = await getDietitianRecommendations(userData.email);
        setRecommendations(recs);

        const alerts = await getActivityAlerts(userData.email);
        setActivityAlerts(alerts);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const handleMarkAsRead = async (recommendationId: string) => {
    try {
      await markRecommendationAsRead(user.email, recommendationId);
      loadData();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleDelete = async (recommendationId: string) => {
    Alert.alert("Sil", "Bu öneriyi silmek istediğinize emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteRecommendation(user.email, recommendationId);
            loadData();
          } catch (error) {
            console.error("Failed to delete:", error);
          }
        },
      },
    ]);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "praise":
        return "#10B981";
      case "suggestion":
        return "#3B82F6";
      case "warning":
        return "#F59E0B";
      case "alert":
        return "#EF4444";
      default:
        return colors.primary;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "praise":
        return "🎉";
      case "suggestion":
        return "💡";
      case "warning":
        return "⚠️";
      case "alert":
        return "🚨";
      default:
        return "📌";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "info":
        return "#3B82F6";
      case "warning":
        return "#F59E0B";
      case "critical":
        return "#EF4444";
      default:
        return colors.primary;
    }
  };

  const filteredRecommendations = recommendations.filter((rec) => {
    if (filterType === "unread") return !rec.read;
    if (filterType === "high") return rec.priority === "high";
    return true;
  });

  if (!user || user.role !== "dietitian") {
    return (
      <ScreenContainer className="p-6">
      <BackButton />
        <View className="flex-1 items-center justify-center">
          <Text style={{ color: colors.foreground }}>Erişim reddedildi</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-3xl font-bold text-foreground">💡 Öneriler & Uyarılar</Text>
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

          {/* Tab Navigation */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setActiveTab("recommendations")}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor:
                  activeTab === "recommendations" ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor:
                  activeTab === "recommendations" ? colors.primary : colors.border,
              }}
            >
              <Text
                style={{
                  color: activeTab === "recommendations" ? "#fff" : colors.foreground,
                  textAlign: "center",
                  fontWeight: "600",
                  fontSize: 12,
                }}
              >
                Öneriler ({recommendations.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("alerts")}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: activeTab === "alerts" ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: activeTab === "alerts" ? colors.primary : colors.border,
              }}
            >
              <Text
                style={{
                  color: activeTab === "alerts" ? "#fff" : colors.foreground,
                  textAlign: "center",
                  fontWeight: "600",
                  fontSize: 12,
                }}
              >
                Uyarılar ({activityAlerts.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Recommendations Tab */}
          {activeTab === "recommendations" && (
            <>
              {/* Filter Buttons */}
              <View className="flex-row gap-2">
                {(["all", "unread", "high"] as const).map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    onPress={() => setFilterType(filter)}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      borderRadius: 6,
                      backgroundColor:
                        filterType === filter ? colors.primary : colors.surface,
                      borderWidth: 1,
                      borderColor: filterType === filter ? colors.primary : colors.border,
                    }}
                  >
                    <Text
                      style={{
                        color: filterType === filter ? "#fff" : colors.foreground,
                        fontWeight: "600",
                        fontSize: 10,
                      }}
                    >
                      {filter === "all" ? "Tümü" : filter === "unread" ? "Okunmamış" : "Acil"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Recommendations List */}
              {filteredRecommendations.length > 0 ? (
                <View className="gap-3">
                  {filteredRecommendations.map((rec) => (
                    <View
                      key={rec.id}
                      style={{
                        backgroundColor: colors.surface,
                        borderRadius: 12,
                        padding: 12,
                        borderWidth: 1,
                        borderColor: rec.read ? colors.border : getTypeColor(rec.type),
                        opacity: rec.read ? 0.7 : 1,
                      }}
                    >
                      {/* Header */}
                      <View className="flex-row items-start justify-between mb-2">
                        <View className="flex-row items-center gap-2 flex-1">
                          <Text style={{ fontSize: 16 }}>{getTypeIcon(rec.type)}</Text>
                          <View style={{ flex: 1 }}>
                            <Text
                              style={{
                                fontSize: 12,
                                fontWeight: "600",
                                color: colors.foreground,
                              }}
                            >
                              {rec.title}
                            </Text>
                            <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>
                              👤 {rec.clientName}
                            </Text>
                          </View>
                        </View>
                        <View
                          style={{
                            paddingVertical: 4,
                            paddingHorizontal: 8,
                            borderRadius: 4,
                            backgroundColor: getTypeColor(rec.type),
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 9,
                              color: "#fff",
                              fontWeight: "600",
                              textTransform: "uppercase",
                            }}
                          >
                            {rec.priority === "high"
                              ? "Acil"
                              : rec.priority === "medium"
                                ? "Orta"
                                : "Düşük"}
                          </Text>
                        </View>
                      </View>

                      {/* Message */}
                      <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 8 }}>
                        {rec.message}
                      </Text>

                      {/* Action Items */}
                      {rec.actionItems && rec.actionItems.length > 0 && (
                        <View className="gap-1 mb-3">
                          {rec.actionItems.map((item, index) => (
                            <Text
                              key={index}
                              style={{
                                fontSize: 10,
                                color: colors.muted,
                                marginLeft: 12,
                              }}
                            >
                              • {item}
                            </Text>
                          ))}
                        </View>
                      )}

                      {/* Footer */}
                      <View className="flex-row items-center justify-between">
                        <Text style={{ fontSize: 9, color: colors.muted }}>
                          {new Date(rec.createdAt).toLocaleDateString("tr-TR")}
                        </Text>
                        <View className="flex-row gap-2">
                          {!rec.read && (
                            <TouchableOpacity
                              onPress={() => handleMarkAsRead(rec.id)}
                              style={{
                                paddingVertical: 4,
                                paddingHorizontal: 8,
                                borderRadius: 4,
                                backgroundColor: colors.primary,
                              }}
                            >
                              <Text style={{ fontSize: 9, color: "#fff", fontWeight: "600" }}>
                                ✓ Oku
                              </Text>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            onPress={() => handleDelete(rec.id)}
                            style={{
                              paddingVertical: 4,
                              paddingHorizontal: 8,
                              borderRadius: 4,
                              backgroundColor: "#EF4444",
                            }}
                          >
                            <Text style={{ fontSize: 9, color: "#fff", fontWeight: "600" }}>
                              ✕
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={{ textAlign: "center", color: colors.muted, marginVertical: 20 }}>
                  Henüz öneri yok
                </Text>
              )}
            </>
          )}

          {/* Alerts Tab */}
          {activeTab === "alerts" && (
            <>
              {activityAlerts.length > 0 ? (
                <View className="gap-3">
                  {activityAlerts.map((alert, index) => (
                    <View
                      key={index}
                      style={{
                        backgroundColor: colors.surface,
                        borderRadius: 12,
                        padding: 12,
                        borderWidth: 1,
                        borderColor: getSeverityColor(alert.severity),
                        borderLeftWidth: 4,
                      }}
                    >
                      {/* Header */}
                      <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center gap-2 flex-1">
                          <Text style={{ fontSize: 16 }}>
                            {alert.severity === "critical"
                              ? "🚨"
                              : alert.severity === "warning"
                                ? "⚠️"
                                : "ℹ️"}
                          </Text>
                          <View style={{ flex: 1 }}>
                            <Text
                              style={{
                                fontSize: 12,
                                fontWeight: "600",
                                color: colors.foreground,
                              }}
                            >
                              {alert.clientName}
                            </Text>
                            <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>
                              {alert.alertType
                                .split("_")
                                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                                .join(" ")}
                            </Text>
                          </View>
                        </View>
                        <View
                          style={{
                            paddingVertical: 4,
                            paddingHorizontal: 8,
                            borderRadius: 4,
                            backgroundColor: getSeverityColor(alert.severity),
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 9,
                              color: "#fff",
                              fontWeight: "600",
                              textTransform: "uppercase",
                            }}
                          >
                            {alert.severity === "critical"
                              ? "Acil"
                              : alert.severity === "warning"
                                ? "Uyarı"
                                : "Bilgi"}
                          </Text>
                        </View>
                      </View>

                      {/* Message */}
                      <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 8 }}>
                        {alert.message}
                      </Text>

                      {/* Suggested Actions */}
                      {alert.suggestedActions.length > 0 && (
                        <View className="gap-1">
                          <Text
                            style={{
                              fontSize: 10,
                              fontWeight: "600",
                              color: colors.foreground,
                              marginBottom: 4,
                            }}
                          >
                            Önerilen İşlemler:
                          </Text>
                          {alert.suggestedActions.map((action, idx) => (
                            <Text
                              key={idx}
                              style={{
                                fontSize: 10,
                                color: colors.muted,
                                marginLeft: 12,
                              }}
                            >
                              • {action}
                            </Text>
                          ))}
                        </View>
                      )}

                      {/* Timestamp */}
                      <Text
                        style={{
                          fontSize: 9,
                          color: colors.muted,
                          marginTop: 8,
                        }}
                      >
                        {new Date(alert.timestamp).toLocaleDateString("tr-TR")}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={{ textAlign: "center", color: colors.muted, marginVertical: 20 }}>
                  Henüz uyarı yok
                </Text>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
