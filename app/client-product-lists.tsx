import {
  ScrollView,
  Text,
  View,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { NavigationHeader } from "@/components/navigation-header";
import { useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { useColors } from "@/hooks/use-colors";
import { productSharingService, type SharedProductList, type SharedProduct } from "@/lib/_core/product-sharing-service";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

/**
 * Client Product Lists Screen
 * Shows recommended and forbidden products shared by dietitian
 */
export default function ClientProductListsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"recommended" | "forbidden">("recommended");
  const [sharedLists, setSharedLists] = useState<SharedProductList[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<SharedProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const notifUnsubscribeRef = useRef<(() => void) | null>(null);

  const categories = [
    "Tümü",
    "et-balık",
    "salata",
    "meyve",
    "kuruyemiş",
    "tatlı",
    "içecek",
    "tahıllar",
  ];

  // Load shared lists and subscribe
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Get shared lists
        const lists = await productSharingService.getSharedListsForClient("client-1");
        setSharedLists(lists);

        // Get notifications
        const notifs = await productSharingService.getNotifications("client-1");
        setNotifications(notifs);

        // Subscribe to new lists
        const unsubscribe = productSharingService.subscribeToSharedLists(
          "client-1",
          (newList) => {
            setSharedLists((prev) => [newList, ...prev]);
          }
        );

        // Subscribe to notifications
        const notifUnsubscribe = productSharingService.subscribeToNotifications(
          "client-1",
          (newNotif) => {
            setNotifications((prev) => [newNotif, ...prev]);
          }
        );

        unsubscribeRef.current = unsubscribe;
        notifUnsubscribeRef.current = notifUnsubscribe;
      } catch (error) {
        console.error("Error loading data:", error);
        Alert.alert("Hata", "Ürün listeleri yüklenirken bir hata oluştu");
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

  // Filter products based on tab, search, and category
  useEffect(() => {
    const filterProducts = async () => {
      let products: SharedProduct[] = [];

      if (activeTab === "recommended") {
        products = await productSharingService.getRecommendedProducts("client-1");
      } else {
        products = await productSharingService.getForbiddenProducts("client-1");
      }

      // Filter by search query
      if (searchQuery) {
        products = products.filter((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Filter by category
      if (selectedCategory && selectedCategory !== "Tümü") {
        products = products.filter((p) => p.category === selectedCategory);
      }

      setFilteredProducts(products);
    };

    filterProducts();
  }, [activeTab, searchQuery, selectedCategory]);

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
        title="Ürün Listeleri"
        showBackButton={true}
        showHomeButton={true}
      />

      {/* Tab Navigation */}
      <View
        className="flex-row gap-2 px-4 py-3 bg-surface border-b"
        style={{ borderBottomColor: colors.border }}
      >
        {[
          { id: "recommended", label: "✓ Önerilen", icon: "check-circle" },
          { id: "forbidden", label: "✗ Kaçınılması Gereken", icon: "cancel" },
        ].map((tab) => (
          <Pressable
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
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16, gap: 12 }}>
        {/* Search Bar */}
        <View
          className="flex-row items-center gap-2 px-3 py-2 rounded-lg"
          style={{ backgroundColor: colors.surface }}
        >
          <MaterialIcons name="search" size={20} color={colors.muted} />
          <TextInput
            placeholder="Ürün ara..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-foreground"
            style={{ color: colors.foreground }}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery("")}>
              <MaterialIcons name="close" size={20} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>

        {/* Category Filter */}
        <View className="gap-2">
          <Text className="text-sm font-semibold text-muted">Kategori</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {categories.map((cat) => (
              <Pressable
                key={cat}
                onPress={() =>
                  setSelectedCategory(cat === "Tümü" ? null : cat)
                }
                className="px-3 py-2 rounded-lg"
                style={{
                  backgroundColor:
                    (cat === "Tümü" && !selectedCategory) ||
                    selectedCategory === cat
                      ? colors.primary
                      : colors.surface,
                }}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{
                    color:
                      (cat === "Tümü" && !selectedCategory) ||
                      selectedCategory === cat
                        ? "#fff"
                        : colors.muted,
                  }}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Products List */}
        {filteredProducts.length === 0 ? (
          <View className="items-center justify-center py-8">
            <MaterialIcons name="restaurant" size={48} color={colors.muted} />
            <Text className="text-muted mt-2">Ürün bulunamadı</Text>
          </View>
        ) : (
          <View className="gap-3">
            <Text className="text-sm font-semibold text-muted">
              {filteredProducts.length} ürün bulundu
            </Text>
            {filteredProducts.map((product) => (
              <View
                key={product.id}
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
              >
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1">
                    <Text className="text-base font-bold text-foreground">
                      {product.name}
                    </Text>
                    <Text className="text-xs text-muted mt-1">
                      {product.category}
                    </Text>
                  </View>
                  {activeTab === "recommended" ? (
                    <MaterialIcons name="check-circle" size={24} color={colors.primary} />
                  ) : (
                    <MaterialIcons name="cancel" size={24} color="#ef4444" />
                  )}
                </View>

                {product.reason && (
                  <Text className="text-sm text-muted mb-2 italic">
                    "{product.reason}"
                  </Text>
                )}

                {/* Nutritional Info */}
                {(product.calories ||
                  product.protein ||
                  product.carbs ||
                  product.fat) && (
                  <View className="flex-row gap-3 flex-wrap mt-2 pt-2 border-t" style={{ borderTopColor: colors.border }}>
                    {product.calories && (
                      <View className="flex-row items-center gap-1">
                        <Text className="text-xs text-muted">🔥</Text>
                        <Text className="text-xs font-semibold text-foreground">
                          {product.calories} kcal
                        </Text>
                      </View>
                    )}
                    {product.protein && (
                      <View className="flex-row items-center gap-1">
                        <Text className="text-xs text-muted">P</Text>
                        <Text className="text-xs font-semibold text-foreground">
                          {product.protein}g
                        </Text>
                      </View>
                    )}
                    {product.carbs && (
                      <View className="flex-row items-center gap-1">
                        <Text className="text-xs text-muted">C</Text>
                        <Text className="text-xs font-semibold text-foreground">
                          {product.carbs}g
                        </Text>
                      </View>
                    )}
                    {product.fat && (
                      <View className="flex-row items-center gap-1">
                        <Text className="text-xs text-muted">F</Text>
                        <Text className="text-xs font-semibold text-foreground">
                          {product.fat}g
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {product.description && (
                  <Text className="text-xs text-muted mt-2">
                    {product.description}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Recent Notifications */}
        {notifications.length > 0 && (
          <View className="mt-4 pt-4 border-t" style={{ borderTopColor: colors.border }}>
            <Text className="text-lg font-bold text-foreground mb-3">
              Son Paylaşımlar
            </Text>
            {notifications.slice(0, 3).map((notif) => (
              <Pressable
                key={notif.id}
                className="p-3 rounded-lg mb-2 flex-row items-start gap-2"
                style={{
                  backgroundColor: notif.isRead ? colors.surface : colors.primary + "20",
                }}
                onPress={() => productSharingService.markNotificationAsRead(notif.id)}
              >
                <MaterialIcons
                  name={notif.listType === "recommended" ? "check-circle" : "cancel"}
                  size={20}
                  color={notif.listType === "recommended" ? colors.primary : "#ef4444"}
                />
                <View className="flex-1">
                  <Text className="font-semibold text-foreground text-sm">
                    {notif.message}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
