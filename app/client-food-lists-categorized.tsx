import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { NavigationHeader } from "@/components/navigation-header";
import { useColors } from "@/hooks/use-colors";
import { foodCategoriesService } from "@/lib/_core/food-categories-service";

export default function ClientFoodListsCategorizedScreen() {
  const colors = useColors();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"recommended" | "prohibited" | "all">(
    "all"
  );

  const categories = foodCategoriesService.getAllCategories();
  const selectedCategoryData = selectedCategory
    ? foodCategoriesService.getCategoryById(selectedCategory)
    : null;
  const selectedSubCategoryData =
    selectedCategory && selectedSubCategory
      ? foodCategoriesService.getSubCategory(selectedCategory, selectedSubCategory)
      : null;

  // Mock verileri: Diyetisyenin önerdiği/yasakladığı gıdalar
  const recommendedFoods = [
    "Tavuk Göğsü",
    "Somon",
    "Brokoli",
    "Tam Buğday Ekmeği",
    "Yeşil Çay",
  ];
  const prohibitedFoods = [
    "Baklava",
    "Kola",
    "Beyaz Pirinç",
    "Şerbetli Pasta",
    "Kızartma",
  ];

  const searchResults = searchQuery
    ? foodCategoriesService.searchFoodItems(searchQuery)
    : [];

  const isRecommended = (food: string) => recommendedFoods.includes(food);
  const isProhibited = (food: string) => prohibitedFoods.includes(food);

  const getFilteredFoods = () => {
    let foods: string[] = [];

    if (selectedSubCategoryData) {
      foods = selectedSubCategoryData.examples;
    } else if (selectedCategoryData) {
      foods = selectedCategoryData.subCategories.flatMap((sub) => sub.examples);
    } else {
      foods = categories.flatMap((cat) =>
        cat.subCategories.flatMap((sub) => sub.examples)
      );
    }

    if (activeTab === "recommended") {
      foods = foods.filter(isRecommended);
    } else if (activeTab === "prohibited") {
      foods = foods.filter(isProhibited);
    }

    return foods;
  };

  const filteredFoods = getFilteredFoods();

  return (
    <ScreenContainer>
      <NavigationHeader title="Gıda Listeleri" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Özet Kartları */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: colors.success,
              borderRadius: 8,
              padding: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "600" }}>
              {recommendedFoods.length}
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>
              Tavsiye Edilen
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: colors.error,
              borderRadius: 8,
              padding: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "600" }}>
              {prohibitedFoods.length}
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>
              Yasaklı
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: colors.primary,
              borderRadius: 8,
              padding: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "600" }}>
              {categories.length}
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>
              Kategori
            </Text>
          </View>
        </View>

        {/* Tab Seçimi */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
          {["all", "recommended", "prohibited"].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab as any)}
              style={{
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 8,
                backgroundColor: activeTab === tab ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: activeTab === tab ? colors.primary : colors.border,
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
                {tab === "all"
                  ? "Tümü"
                  : tab === "recommended"
                    ? "✓ Tavsiye"
                    : "✕ Yasaklı"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Arama */}
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Gıda ara..."
          placeholderTextColor={colors.muted}
          style={{
            backgroundColor: colors.surface,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            color: colors.foreground,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 16,
          }}
        />

        {searchQuery ? (
          <>
            <Text
              style={{
                color: colors.foreground,
                fontSize: 14,
                fontWeight: "600",
                marginBottom: 12,
              }}
            >
              Arama Sonuçları ({searchResults.length})
            </Text>
            {searchResults.map((result, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 8,
                  borderLeftWidth: 4,
                  borderLeftColor: isRecommended(result.item)
                    ? colors.success
                    : isProhibited(result.item)
                      ? colors.error
                      : colors.border,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.foreground, fontWeight: "600" }}>
                    {isRecommended(result.item) && "✓ "}
                    {isProhibited(result.item) && "✕ "}
                    {result.item}
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>
                    {result.category.name} → {result.subCategory.name}
                  </Text>
                </View>
                <View
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 4,
                    backgroundColor: isRecommended(result.item)
                      ? colors.success
                      : isProhibited(result.item)
                        ? colors.error
                        : colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: isRecommended(result.item) || isProhibited(result.item)
                        ? "#fff"
                        : colors.foreground,
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    {isRecommended(result.item) ? "✓" : isProhibited(result.item) ? "✕" : "○"}
                  </Text>
                </View>
              </View>
            ))}
          </>
        ) : (
          <>
            {/* Kategoriler */}
            <Text
              style={{
                color: colors.foreground,
                fontSize: 16,
                fontWeight: "600",
                marginBottom: 12,
              }}
            >
              Kategoriler
            </Text>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => {
                  setSelectedCategory(category.id);
                  setSelectedSubCategory(null);
                }}
                style={{
                  backgroundColor:
                    selectedCategory === category.id ? colors.primary : colors.surface,
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor:
                    selectedCategory === category.id ? colors.primary : colors.border,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ fontSize: 20, marginRight: 8 }}>
                    {category.icon}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color:
                          selectedCategory === category.id
                            ? "#fff"
                            : colors.foreground,
                        fontWeight: "600",
                      }}
                    >
                      {category.name}
                    </Text>
                    <Text
                      style={{
                        color:
                          selectedCategory === category.id
                            ? "rgba(255,255,255,0.7)"
                            : colors.muted,
                        fontSize: 12,
                      }}
                    >
                      {category.subCategories.length} alt kategori
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {/* Alt Kategoriler */}
            {selectedCategoryData && (
              <>
                <Text
                  style={{
                    color: colors.foreground,
                    fontSize: 16,
                    fontWeight: "600",
                    marginTop: 20,
                    marginBottom: 12,
                  }}
                >
                  {selectedCategoryData.name} - Alt Kategoriler
                </Text>
                {selectedCategoryData.subCategories.map((subCategory) => (
                  <TouchableOpacity
                    key={subCategory.id}
                    onPress={() => setSelectedSubCategory(subCategory.id)}
                    style={{
                      backgroundColor:
                        selectedSubCategory === subCategory.id
                          ? colors.primary
                          : colors.surface,
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 8,
                      borderLeftWidth: 4,
                      borderLeftColor:
                        selectedSubCategory === subCategory.id
                          ? colors.primary
                          : colors.border,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          selectedSubCategory === subCategory.id
                            ? "#fff"
                            : colors.foreground,
                        fontWeight: "600",
                        marginBottom: 4,
                      }}
                    >
                      {subCategory.name}
                    </Text>
                    <Text
                      style={{
                        color:
                          selectedSubCategory === subCategory.id
                            ? "rgba(255,255,255,0.7)"
                            : colors.muted,
                        fontSize: 12,
                      }}
                    >
                      {subCategory.examples.length} gıda
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* Gıda Listesi */}
            {(selectedCategoryData || activeTab !== "all") && (
              <>
                <Text
                  style={{
                    color: colors.foreground,
                    fontSize: 16,
                    fontWeight: "600",
                    marginTop: 20,
                    marginBottom: 12,
                  }}
                >
                  Gıdalar ({filteredFoods.length})
                </Text>
                {filteredFoods.length > 0 ? (
                  filteredFoods.map((food, index) => (
                    <View
                      key={index}
                      style={{
                        backgroundColor: colors.surface,
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 8,
                        borderLeftWidth: 4,
                        borderLeftColor: isRecommended(food)
                          ? colors.success
                          : isProhibited(food)
                            ? colors.error
                            : colors.border,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: colors.foreground, fontWeight: "500" }}>
                        {isRecommended(food) && "✓ "}
                        {isProhibited(food) && "✕ "}
                        {food}
                      </Text>
                      <View
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 4,
                          backgroundColor: isRecommended(food)
                            ? colors.success
                            : isProhibited(food)
                              ? colors.error
                              : colors.border,
                        }}
                      >
                        <Text
                          style={{
                            color: isRecommended(food) || isProhibited(food)
                              ? "#fff"
                              : colors.foreground,
                            fontSize: 12,
                            fontWeight: "600",
                          }}
                        >
                          {isRecommended(food)
                            ? "✓"
                            : isProhibited(food)
                              ? "✕"
                              : "○"}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={{ color: colors.muted, textAlign: "center" }}>
                    Bu kategoride gıda bulunamadı
                  </Text>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
