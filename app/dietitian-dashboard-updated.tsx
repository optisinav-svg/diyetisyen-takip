import { ScrollView, Text, View, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { NavigationHeader } from "@/components/navigation-header";
import { useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { useColors } from "@/hooks/use-colors";
import { mealSyncService, type MealNotification } from "@/lib/_core/meal-sync-service";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

/**
 * Updated Dietitian Dashboard with Real-time Meal Synchronization
 * Shows client meals in real-time with notifications
 */
export default function DietitianDashboardUpdatedScreen() {
  const colors = useColors();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "meals" | "notifications">("overview");
  const [clientMeals, setClientMeals] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<MealNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const notifUnsubscribeRef = useRef<(() => void) | null>(null);

  // Load meals and subscribe to updates
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Get client meals for today
        const meals = await mealSyncService.getMealsForClient("client-1");
        setClientMeals(meals);

        // Get notifications
        const notifs = await mealSyncService.getNotifications("dietitian-1");
        setNotifications(notifs);

        // Subscribe to new meals
        const unsubscribe = mealSyncService.subscribeToMeals("client-1", (newMeal) => {
          setClientMeals((prev) => [...prev, newMeal]);
        });

        // Subscribe to notifications
        const notifUnsubscribe = mealSyncService.subscribeToNotifications(
          "dietitian-1",
          (newNotif) => {
            setNotifications((prev) => [newNotif, ...prev]);
          }
        );

        unsubscribeRef.current = unsubscribe;
        notifUnsubscribeRef.current = notifUnsubscribe;
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
      if (notifUnsubscribeRef.current) notifUnsubscribeRef.current();
    };
  }, []);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return "🌅";
      case "lunch":
        return "🍽️";
      case "dinner":
        return "🌙";
      case "snack":
        return "🍎";
      default:
        return "🍴";
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1 bg-background">
      <NavigationHeader
        title="Diyetisyen Dashboard"
        showBackButton={true}
        showHomeButton={true}
      />

      {/* Tab Navigation */}
      <View className="flex-row gap-2 px-4 py-3 bg-surface border-b" style={{ borderBottomColor: colors.border }}>
        {[
          { id: "overview", label: "Özet", icon: "dashboard" },
          { id: "meals", label: "Öğünler", icon: "restaurant" },
          { id: "notifications", label: "Bildirimler", icon: "notifications" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id as any)}
            className="flex-1 flex-row items-center justify-center gap-1 py-2 px-3 rounded-lg"
            style={{
              backgroundColor: activeTab === tab.id ? colors.primary : "transparent",
            }}
          >
            <MaterialIcons
              name={tab.icon as any}
              size={18}
              color={activeTab === tab.id ? "#fff" : colors.muted}
            />
            <Text
              className="text-sm font-semibold"
              style={{
                color: activeTab === tab.id ? "#fff" : colors.muted,
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16, gap: 16 }}>
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <View className="gap-4">
            <View className="flex-row gap-3">
              <View
                className="flex-1 p-4 rounded-lg items-center"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-2xl font-bold text-primary">{clientMeals.length}</Text>
                <Text className="text-xs text-muted mt-1">Öğün Kaydı</Text>
              </View>
              <View
                className="flex-1 p-4 rounded-lg items-center"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-2xl font-bold text-primary">
                  {clientMeals.reduce((sum, m) => sum + m.calories, 0)}
                </Text>
                <Text className="text-xs text-muted mt-1">Toplam Kalori</Text>
              </View>
              <View
                className="flex-1 p-4 rounded-lg items-center"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-2xl font-bold text-primary">85%</Text>
                <Text className="text-xs text-muted mt-1">Uyum Oranı</Text>
              </View>
            </View>

            {/* Recent Meals */}
            <View>
              <Text className="text-lg font-bold text-foreground mb-3">Son Öğünler</Text>
              {clientMeals.slice(-3).map((meal) => (
                <View
                  key={meal.id}
                  className="p-3 rounded-lg mb-2 flex-row items-center justify-between"
                  style={{ backgroundColor: colors.surface }}
                >
                  <View className="flex-row items-center gap-3 flex-1">
                    <Text className="text-2xl">{getMealIcon(meal.mealType)}</Text>
                    <View className="flex-1">
                      <Text className="font-semibold text-foreground">{meal.mealName}</Text>
                      <Text className="text-xs text-muted">{formatTime(meal.createdAt)}</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="font-bold text-primary">{meal.calories} kcal</Text>
                    <Text className="text-xs text-muted">P:{meal.protein}g</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Meals Tab */}
        {activeTab === "meals" && (
          <View className="gap-3">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-lg font-bold text-foreground">
                Bugünün Öğünleri ({clientMeals.length})
              </Text>
              <TouchableOpacity
                className="p-2 rounded-lg"
                style={{ backgroundColor: colors.surface }}
              >
                <MaterialIcons name="filter-list" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {clientMeals.length === 0 ? (
              <View className="items-center justify-center py-8">
                <MaterialIcons name="restaurant" size={48} color={colors.muted} />
                <Text className="text-muted mt-2">Henüz öğün kaydı yok</Text>
              </View>
            ) : (
              clientMeals.map((meal) => (
                <View
                  key={meal.id}
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: colors.surface }}
                >
                  <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-row items-center gap-2 flex-1">
                      <Text className="text-2xl">{getMealIcon(meal.mealType)}</Text>
                      <View className="flex-1">
                        <Text className="font-bold text-foreground">{meal.mealName}</Text>
                        <Text className="text-xs text-muted">{meal.mealType.toUpperCase()}</Text>
                      </View>
                    </View>
                    {meal.photoAnalyzed && (
                      <MaterialIcons name="check-circle" size={20} color={colors.primary} />
                    )}
                  </View>

                  {meal.description && (
                    <Text className="text-sm text-muted mb-2">{meal.description}</Text>
                  )}

                  <View className="flex-row gap-3 flex-wrap">
                    <View className="flex-row items-center gap-1">
                      <Text className="text-xs text-muted">🔥</Text>
                      <Text className="text-sm font-semibold text-foreground">
                        {meal.calories} kcal
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Text className="text-xs text-muted">P</Text>
                      <Text className="text-sm font-semibold text-foreground">
                        {meal.protein}g
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Text className="text-xs text-muted">C</Text>
                      <Text className="text-sm font-semibold text-foreground">
                        {meal.carbs}g
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Text className="text-xs text-muted">F</Text>
                      <Text className="text-sm font-semibold text-foreground">
                        {meal.fat}g
                      </Text>
                    </View>
                  </View>

                  <Text className="text-xs text-muted mt-2">
                    {formatTime(meal.createdAt)}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <View className="gap-3">
            <Text className="text-lg font-bold text-foreground">
              Bildirimler ({notifications.length})
            </Text>

            {notifications.length === 0 ? (
              <View className="items-center justify-center py-8">
                <MaterialIcons name="notifications-none" size={48} color={colors.muted} />
                <Text className="text-muted mt-2">Bildirim yok</Text>
              </View>
            ) : (
              notifications.map((notif) => (
                <TouchableOpacity
                  key={notif.id}
                  className="p-4 rounded-lg flex-row items-start gap-3"
                  style={{
                    backgroundColor: notif.isRead ? colors.surface : colors.primary + "20",
                    borderLeftWidth: 4,
                    borderLeftColor: notif.isRead ? colors.border : colors.primary,
                  }}
                  onPress={() => mealSyncService.markNotificationAsRead(notif.id)}
                >
                  <View className="mt-1">
                    <MaterialIcons
                      name={
                        notif.notificationType === "meal_logged"
                          ? "restaurant"
                          : "warning"
                      }
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-foreground">
                      {notif.clientName}
                    </Text>
                    <Text className="text-sm text-muted mt-1">{notif.message}</Text>
                    <Text className="text-xs text-muted mt-1">
                      {formatTime(notif.createdAt)}
                    </Text>
                  </View>
                  {!notif.isRead && (
                    <View
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: colors.primary }}
                    />
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
