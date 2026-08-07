import { BackButton } from "@/components/back-button";
import { ScrollView, Text, View, TouchableOpacity, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useEffect, useState } from "react";
import { getUserRegistration } from "@/lib/_core/user-registration";
import {
  getUserNotifications,
  markAsRead,
  deleteNotification,
  markAllAsRead,
} from "@/lib/_core/notification-center";
import type { Notification } from "@/lib/_core/notification-center";

export default function NotificationCenterScreen() {
  const router = useRouter();
  const colors = useColors();
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const userData = await getUserRegistration();
      setUser(userData);

      if (userData?.email) {
        const userNotifs = await getUserNotifications(userData.email);
        setNotifications(userNotifs);
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      loadNotifications();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      loadNotifications();
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      if (user?.email) {
        await markAllAsRead(user.email);
        loadNotifications();
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const filteredNotifications =
    selectedType === "all" ? notifications : notifications.filter((n) => n.type === selectedType);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return "📅";
      case "message":
        return "💬";
      case "goal":
        return "🎯";
      case "meal":
        return "🍽️";
      case "activity":
        return "🏃";
      case "2fa":
        return "🔐";
      default:
        return "🔔";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "appointment":
        return "#3B82F6";
      case "message":
        return "#8B5CF6";
      case "goal":
        return "#EC4899";
      case "meal":
        return "#F59E0B";
      case "activity":
        return "#10B981";
      case "2fa":
        return "#EF4444";
      default:
        return colors.primary;
    }
  };

  const notificationTypes = [
    { id: "all", label: "Tümü", count: notifications.length },
    { id: "appointment", label: "Randevu", count: notifications.filter((n) => n.type === "appointment").length },
    { id: "message", label: "Mesaj", count: notifications.filter((n) => n.type === "message").length },
    { id: "activity", label: "Aktivite", count: notifications.filter((n) => n.type === "activity").length },
    { id: "goal", label: "Hedef", count: notifications.filter((n) => n.type === "goal").length },
  ];

  return (
    <ScreenContainer className="p-6">
      <BackButton />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-3xl font-bold text-foreground">🔔 Bildirimler</Text>
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

          {/* Filter Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
            {notificationTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                onPress={() => setSelectedType(type.id)}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 20,
                  backgroundColor: selectedType === type.id ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: selectedType === type.id ? colors.primary : colors.border,
                }}
              >
                <Text
                  style={{
                    color: selectedType === type.id ? "#fff" : colors.foreground,
                    fontWeight: "600",
                    fontSize: 12,
                  }}
                >
                  {type.label} ({type.count})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Mark All As Read Button */}
          {notifications.filter((n) => !n.read).length > 0 && (
            <TouchableOpacity
              onPress={handleMarkAllAsRead}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 6,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.foreground, textAlign: "center", fontWeight: "600", fontSize: 12 }}>
                Tümünü Okundu Olarak İşaretle
              </Text>
            </TouchableOpacity>
          )}

          {/* Notifications List */}
          <View className="gap-3">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  onPress={() => handleMarkAsRead(notification.id)}
                  style={{
                    backgroundColor: notification.read ? colors.surface : colors.background,
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: notification.read ? colors.border : getNotificationColor(notification.type),
                    borderLeftWidth: 4,
                  }}
                >
                  <View className="gap-2">
                    <View className="flex-row items-start justify-between gap-2">
                      <View className="flex-1 gap-1">
                        <View className="flex-row items-center gap-2">
                          <Text style={{ fontSize: 20 }}>{getNotificationIcon(notification.type)}</Text>
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "600",
                              color: colors.foreground,
                              flex: 1,
                            }}
                          >
                            {notification.title}
                          </Text>
                          {!notification.read && (
                            <View
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: colors.primary,
                              }}
                            />
                          )}
                        </View>
                        <Text
                          style={{
                            fontSize: 12,
                            color: colors.muted,
                            marginLeft: 26,
                          }}
                        >
                          {notification.message}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDelete(notification.id)}
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

                    <Text style={{ fontSize: 10, color: colors.muted, marginLeft: 26 }}>
                      {new Date(notification.createdAt).toLocaleString("tr-TR")}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={{ alignItems: "center", paddingVertical: 40 }}>
                <Text style={{ fontSize: 16, color: colors.muted, textAlign: "center" }}>
                  Bildirim yok
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
