import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { NavigationHeader } from "@/components/navigation-header";
import { useColors } from "@/hooks/use-colors";
import { foodCategoriesService } from "@/lib/_core/food-categories-service";

export default function FoodManagementCategorizedScreen() {
  const colors = useColors();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"browse" | "add" | "manage">("browse");
  const [newFoodName, setNewFoodName] = useState("");
  const [recommendedFoods, setRecommendedFoods] = useState<string[]>([]);
  const [prohibitedFoods, setProhibitedFoods] = useState<string[]>([]);

  const categories = foodCategoriesService.getAllCategories();
  const selectedCategoryData = selectedCategory
    ? foodCategoriesService.getCategoryById(selectedCategory)
    : null;
  const selectedSubCategoryData =
    selectedCategory && selectedSubCategory
      ? foodCategoriesService.getSubCategory(selectedCategory, selectedSubCategory)
      : null;

  const handleAddFood = () => {
    if (!newFoodName.trim() || !selectedCategory || !selectedSubCategory) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun");
      return;
    }

    Alert.alert("Başarılı", `${newFoodName} eklendi`);
    setNewFoodName("");
  };

  const handleMarkRecommended = (food: string) => {
    if (recommendedFoods.includes(food)) {
      setRecommendedFoods(recommendedFoods.filter((f) => f !== food));
    } else {
      setRecommendedFoods([...recommendedFoods, food]);
      setProhibitedFoods(prohibitedFoods.filter((f) => f !== food));
    }
  };

  const handleMarkProhibited = (food: string) => {
    if (prohibitedFoods.includes(food)) {
      setProhibitedFoods(prohibitedFoods.filter((f) => f !== food));
    } else {
      setProhibitedFoods([...prohibitedFoods, food]);
      setRecommendedFoods(recommendedFoods.filter((f) => f !== food));
    }
  };

  const searchResults = searchQuery
    ? foodCategoriesService.searchFoodItems(searchQuery)
    : [];

  return (
    <ScreenContainer>
      <NavigationHeader title="Gıda Yönetimi" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Tab Seçimi */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
          {["browse", "add", "manage"].map((tab) => (
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
                {tab === "browse"
                  ? "Gözat"
                  : tab === "add"
                    ? "Ekle"
                    : "Yönet"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === "browse" && (
          <>
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
                      borderLeftColor: colors.primary,
                    }}
                  >
                    <Text style={{ color: colors.foreground, fontWeight: "600" }}>
                      {result.item}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 12 }}>
                      {result.category.name} → {result.subCategory.name}
                    </Text>
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
                  Kategoriler ({categories.length})
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
                            marginBottom: 8,
                          }}
                        >
                          {subCategory.description}
                        </Text>
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
                          {subCategory.examples.map((example, idx) => (
                            <View
                              key={idx}
                              style={{
                                backgroundColor:
                                  selectedSubCategory === subCategory.id
                                    ? "rgba(255,255,255,0.2)"
                                    : colors.border,
                                borderRadius: 4,
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                              }}
                            >
                              <Text
                                style={{
                                  color:
                                    selectedSubCategory === subCategory.id
                                      ? "#fff"
                                      : colors.foreground,
                                  fontSize: 11,
                                }}
                              >
                                {example}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </>
                )}

                {/* Gıda Örnekleri */}
                {selectedSubCategoryData && (
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
                      {selectedSubCategoryData.name} - Örnekler
                    </Text>
                    {selectedSubCategoryData.examples.map((example, index) => (
                      <View
                        key={index}
                        style={{
                          backgroundColor: colors.surface,
                          borderRadius: 8,
                          padding: 12,
                          marginBottom: 8,
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: colors.foreground, fontWeight: "500" }}>
                          {example}
                        </Text>
                        <View style={{ flexDirection: "row", gap: 8 }}>
                          <TouchableOpacity
                            onPress={() => handleMarkRecommended(example)}
                            style={{
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              borderRadius: 4,
                              backgroundColor: recommendedFoods.includes(example)
                                ? colors.success
                                : colors.border,
                            }}
                          >
                            <Text
                              style={{
                                color: recommendedFoods.includes(example)
                                  ? "#fff"
                                  : colors.foreground,
                                fontSize: 11,
                                fontWeight: "600",
                              }}
                            >
                              ✓
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleMarkProhibited(example)}
                            style={{
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              borderRadius: 4,
                              backgroundColor: prohibitedFoods.includes(example)
                                ? colors.error
                                : colors.border,
                            }}
                          >
                            <Text
                              style={{
                                color: prohibitedFoods.includes(example)
                                  ? "#fff"
                                  : colors.foreground,
                                fontSize: 11,
                                fontWeight: "600",
                              }}
                            >
                              ✕
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </>
                )}
              </>
            )}
          </>
        )}

        {activeTab === "add" && (
          <>
            <Text
              style={{
                color: colors.foreground,
                fontSize: 16,
                fontWeight: "600",
                marginBottom: 16,
              }}
            >
              Yeni Gıda Ekle
            </Text>

            <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600", marginBottom: 8 }}>
              Kategori Seçin
            </Text>
            <ScrollView horizontal style={{ marginBottom: 16 }}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => {
                    setSelectedCategory(cat.id);
                    setSelectedSubCategory(null);
                  }}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor:
                      selectedCategory === cat.id ? colors.primary : colors.surface,
                    borderWidth: 1,
                    borderColor:
                      selectedCategory === cat.id ? colors.primary : colors.border,
                    marginRight: 8,
                  }}
                >
                  <Text
                    style={{
                      color: selectedCategory === cat.id ? "#fff" : colors.foreground,
                      fontWeight: "600",
                      fontSize: 12,
                    }}
                  >
                    {cat.icon} {cat.name.split(" ")[1]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {selectedCategoryData && (
              <>
                <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600", marginBottom: 8 }}>
                  Alt Kategori Seçin
                </Text>
                {selectedCategoryData.subCategories.map((subCat) => (
                  <TouchableOpacity
                    key={subCat.id}
                    onPress={() => setSelectedSubCategory(subCat.id)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderRadius: 8,
                      backgroundColor:
                        selectedSubCategory === subCat.id ? colors.primary : colors.surface,
                      borderWidth: 1,
                      borderColor:
                        selectedSubCategory === subCat.id ? colors.primary : colors.border,
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          selectedSubCategory === subCat.id ? "#fff" : colors.foreground,
                        fontWeight: "600",
                      }}
                    >
                      {subCat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            )}

            <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600", marginBottom: 8, marginTop: 16 }}>
              Gıda Adı
            </Text>
            <TextInput
              value={newFoodName}
              onChangeText={setNewFoodName}
              placeholder="Gıda adını girin"
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

            <TouchableOpacity
              onPress={handleAddFood}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 8,
                paddingVertical: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
                Gıda Ekle
              </Text>
            </TouchableOpacity>
          </>
        )}

        {activeTab === "manage" && (
          <>
            <Text
              style={{
                color: colors.foreground,
                fontSize: 16,
                fontWeight: "600",
                marginBottom: 16,
              }}
            >
              Tavsiye Edilen Gıdalar ({recommendedFoods.length})
            </Text>
            {recommendedFoods.length > 0 ? (
              recommendedFoods.map((food, idx) => (
                <View
                  key={idx}
                  style={{
                    backgroundColor: colors.success,
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 8,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "600" }}>✓ {food}</Text>
                  <TouchableOpacity onPress={() => handleMarkRecommended(food)}>
                    <Text style={{ color: "#fff", fontSize: 16 }}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={{ color: colors.muted, textAlign: "center", marginBottom: 20 }}>
                Henüz tavsiye edilen gıda yok
              </Text>
            )}

            <Text
              style={{
                color: colors.foreground,
                fontSize: 16,
                fontWeight: "600",
                marginBottom: 16,
                marginTop: 20,
              }}
            >
              Yasaklı Gıdalar ({prohibitedFoods.length})
            </Text>
            {prohibitedFoods.length > 0 ? (
              prohibitedFoods.map((food, idx) => (
                <View
                  key={idx}
                  style={{
                    backgroundColor: colors.error,
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 8,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "600" }}>✕ {food}</Text>
                  <TouchableOpacity onPress={() => handleMarkProhibited(food)}>
                    <Text style={{ color: "#fff", fontSize: 16 }}>✓</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={{ color: colors.muted, textAlign: "center" }}>
                Henüz yasaklı gıda yok
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
