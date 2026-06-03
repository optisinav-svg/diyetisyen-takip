import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  Modal,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import {
  dietitianProductManagementService,
  type Product,
  type ProductCategory,
  type ProductList,
} from "@/lib/_core/dietitian-product-management";

export default function DietitianProductManagementScreen() {
  const router = useRouter();
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<"products" | "lists">("products");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>("yemek");
  const [products, setProducts] = useState<Product[]>([]);
  const [productLists, setProductLists] = useState<ProductList[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductCalories, setNewProductCalories] = useState("");
  const [newProductProtein, setNewProductProtein] = useState("");
  const [newListName, setNewListName] = useState("");
  const [newListType, setNewListType] = useState<"recommended" | "forbidden">("recommended");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const categories = dietitianProductManagementService.getCategories();
  const stats = dietitianProductManagementService.getStatistics();

  useEffect(() => {
    loadProducts();
    loadProductLists();
  }, []);

  const loadProducts = () => {
    const allProducts = dietitianProductManagementService.getAllProducts();
    setProducts(allProducts);
  };

  const loadProductLists = () => {
    const lists = dietitianProductManagementService.getProductListsByDietitian("dietitian-1");
    setProductLists(lists);
  };

  const handleAddProduct = async () => {
    if (!newProductName.trim()) {
      Alert.alert("Hata", "Ürün adı boş olamaz");
      return;
    }

    setIsLoading(true);
    try {
      dietitianProductManagementService.addProduct(
        newProductName,
        selectedCategory,
        parseInt(newProductCalories) || 0,
        parseInt(newProductProtein) || 0,
        0,
        0,
        "dietitian-1"
      );

      Alert.alert("Başarılı", "Ürün eklendi");
      setNewProductName("");
      setNewProductCalories("");
      setNewProductProtein("");
      setShowAddModal(false);
      loadProducts();
    } catch (error) {
      Alert.alert("Hata", "Ürün eklenirken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    Alert.alert(
      "Sil",
      "Bu ürünü silmek istediğinizden emin misiniz?",
      [
        { text: "İptal", onPress: () => {}, style: "cancel" },
        {
          text: "Sil",
          onPress: () => {
            dietitianProductManagementService.deleteProduct(productId);
            loadProducts();
            Alert.alert("Başarılı", "Ürün silindi");
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      Alert.alert("Hata", "Liste adı boş olamaz");
      return;
    }

    if (selectedProducts.length === 0) {
      Alert.alert("Hata", "En az bir ürün seçiniz");
      return;
    }

    setIsLoading(true);
    try {
      dietitianProductManagementService.createProductList(
        newListName,
        newListType,
        "dietitian-1",
        selectedProducts
      );

      Alert.alert("Başarılı", "Liste oluşturuldu");
      setNewListName("");
      setSelectedProducts([]);
      setShowListModal(false);
      loadProductLists();
    } catch (error) {
      Alert.alert("Hata", "Liste oluşturulurken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleProductSelection = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const filteredProducts =
    searchQuery.trim() === ""
      ? products.filter((p) => p.category === selectedCategory)
      : dietitianProductManagementService.searchProducts(searchQuery);

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-3xl font-bold text-foreground flex-1">📦 Ürün Yönetimi</Text>
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

          <Text className="text-sm text-muted mb-4">
            Ürün kategorilerini yönetin, tavsiye edilen ve yasaklı ürün listeleri oluşturun.
          </Text>

          {/* Statistics */}
          <View
            style={{
              backgroundColor: colors.primary + "15",
              borderRadius: 10,
              padding: 12,
              borderWidth: 1,
              borderColor: colors.primary + "30",
            }}
          >
            <View className="flex-row items-center justify-between gap-2">
              <View className="flex-1">
                <Text style={{ color: colors.muted, fontSize: 12 }}>Toplam Ürün</Text>
                <Text
                  style={{
                    color: colors.primary,
                    fontWeight: "700",
                    fontSize: 18,
                  }}
                >
                  {stats.totalProducts}
                </Text>
              </View>
              <View className="flex-1">
                <Text style={{ color: colors.muted, fontSize: 12 }}>Listeler</Text>
                <Text
                  style={{
                    color: colors.primary,
                    fontWeight: "700",
                    fontSize: 18,
                  }}
                >
                  {stats.totalLists}
                </Text>
              </View>
              <View className="flex-1">
                <Text style={{ color: colors.muted, fontSize: 12 }}>Gruplar</Text>
                <Text
                  style={{
                    color: colors.primary,
                    fontWeight: "700",
                    fontSize: 18,
                  }}
                >
                  {stats.totalGroups}
                </Text>
              </View>
            </View>
          </View>

          {/* Tabs */}
          <View className="flex-row gap-2 bg-surface rounded-lg p-1">
            <TouchableOpacity
              onPress={() => setActiveTab("products")}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 6,
                backgroundColor: activeTab === "products" ? colors.primary : "transparent",
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: activeTab === "products" ? "#ffffff" : colors.foreground,
                  fontWeight: "600",
                }}
              >
                Ürünler
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("lists")}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 6,
                backgroundColor: activeTab === "lists" ? colors.primary : "transparent",
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: activeTab === "lists" ? "#ffffff" : colors.foreground,
                  fontWeight: "600",
                }}
              >
                Listeler
              </Text>
            </TouchableOpacity>
          </View>

          {/* Products Tab */}
          {activeTab === "products" && (
            <View className="gap-3">
              {/* Search & Add */}
              <View className="gap-2">
                <TextInput
                  placeholder="Ürün ara..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    color: colors.foreground,
                  }}
                  placeholderTextColor={colors.muted}
                />

                <TouchableOpacity
                  onPress={() => setShowAddModal(true)}
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: 8,
                    paddingVertical: 12,
                  }}
                >
                  <Text style={{ color: "#ffffff", fontWeight: "600", textAlign: "center" }}>
                    + Yeni Ürün Ekle
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Categories */}
              {searchQuery === "" && (
                <View className="gap-2">
                  <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 14 }}>
                    Kategoriler
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category}
                        onPress={() => setSelectedCategory(category)}
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          borderRadius: 6,
                          backgroundColor:
                            selectedCategory === category ? colors.primary : colors.surface,
                          borderWidth: 1,
                          borderColor:
                            selectedCategory === category ? colors.primary : colors.border,
                        }}
                      >
                        <Text
                          style={{
                            color:
                              selectedCategory === category ? "#ffffff" : colors.foreground,
                            fontWeight: "600",
                            fontSize: 12,
                          }}
                        >
                          {dietitianProductManagementService.getCategoryLabel(category)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Products List */}
              <View className="gap-2">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <View
                      key={product.id}
                      style={{
                        backgroundColor: colors.surface,
                        borderRadius: 10,
                        padding: 12,
                        borderLeftWidth: 4,
                        borderLeftColor: colors.primary,
                      }}
                    >
                      <View className="flex-row items-center justify-between mb-2">
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: colors.foreground,
                            flex: 1,
                          }}
                        >
                          {product.name}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleDeleteProduct(product.id)}
                          style={{
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 4,
                            backgroundColor: colors.error + "20",
                          }}
                        >
                          <Text style={{ color: colors.error, fontSize: 12, fontWeight: "600" }}>
                            Sil
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <View className="flex-row items-center justify-between">
                        <Text style={{ color: colors.muted, fontSize: 12 }}>
                          🔥 {product.calories} kcal
                        </Text>
                        <Text style={{ color: colors.muted, fontSize: 12 }}>
                          🥚 {product.protein}g protein
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={{ color: colors.muted, textAlign: "center", marginVertical: 20 }}>
                    Ürün bulunamadı
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Lists Tab */}
          {activeTab === "lists" && (
            <View className="gap-3">
              <TouchableOpacity
                onPress={() => setShowListModal(true)}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                  paddingVertical: 12,
                }}
              >
                <Text style={{ color: "#ffffff", fontWeight: "600", textAlign: "center" }}>
                  + Yeni Liste Oluştur
                </Text>
              </TouchableOpacity>

              {productLists.length > 0 ? (
                productLists.map((list) => (
                  <View
                    key={list.id}
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 10,
                      padding: 12,
                      borderLeftWidth: 4,
                      borderLeftColor: list.type === "recommended" ? colors.success : colors.error,
                    }}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: colors.foreground,
                          flex: 1,
                        }}
                      >
                        {list.type === "recommended" ? "✅" : "❌"} {list.name}
                      </Text>
                      <Text
                        style={{
                          backgroundColor:
                            list.type === "recommended" ? colors.success + "20" : colors.error + "20",
                          color: list.type === "recommended" ? colors.success : colors.error,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: "600",
                        }}
                      >
                        {list.type === "recommended" ? "Tavsiye Edilen" : "Yasaklı"}
                      </Text>
                    </View>

                    <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>
                      {list.products.length} ürün • {list.sharedWith.length} danışana paylaşıldı
                    </Text>

                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          paddingVertical: 8,
                          borderRadius: 6,
                          backgroundColor: colors.primary + "20",
                        }}
                      >
                        <Text
                          style={{
                            color: colors.primary,
                            fontWeight: "600",
                            textAlign: "center",
                            fontSize: 12,
                          }}
                        >
                          Görüntüle
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{
                          flex: 1,
                          paddingVertical: 8,
                          borderRadius: 6,
                          backgroundColor: colors.warning + "20",
                        }}
                      >
                        <Text
                          style={{
                            color: colors.warning,
                            fontWeight: "600",
                            textAlign: "center",
                            fontSize: 12,
                          }}
                        >
                          Paylaş
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={{ color: colors.muted, textAlign: "center", marginVertical: 20 }}>
                  Henüz liste oluşturulmadı
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Product Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              paddingBottom: 40,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground, marginBottom: 16 }}>
              Yeni Ürün Ekle
            </Text>

            <TextInput
              placeholder="Ürün Adı"
              value={newProductName}
              onChangeText={setNewProductName}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: colors.foreground,
                marginBottom: 12,
              }}
              placeholderTextColor={colors.muted}
            />

            <TextInput
              placeholder="Kalori"
              value={newProductCalories}
              onChangeText={setNewProductCalories}
              keyboardType="numeric"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: colors.foreground,
                marginBottom: 12,
              }}
              placeholderTextColor={colors.muted}
            />

            <TextInput
              placeholder="Protein (g)"
              value={newProductProtein}
              onChangeText={setNewProductProtein}
              keyboardType="numeric"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: colors.foreground,
                marginBottom: 16,
              }}
              placeholderTextColor={colors.muted}
            />

            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ color: colors.foreground, fontWeight: "600", textAlign: "center" }}>
                  İptal
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAddProduct}
                disabled={isLoading}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: colors.primary,
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={{ color: "#ffffff", fontWeight: "600", textAlign: "center" }}>
                    Ekle
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create List Modal */}
      <Modal visible={showListModal} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              paddingBottom: 40,
              maxHeight: "80%",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground, marginBottom: 16 }}>
              Yeni Liste Oluştur
            </Text>

            <TextInput
              placeholder="Liste Adı"
              value={newListName}
              onChangeText={setNewListName}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: colors.foreground,
                marginBottom: 12,
              }}
              placeholderTextColor={colors.muted}
            />

            <View className="flex-row gap-2 mb-4">
              <TouchableOpacity
                onPress={() => setNewListType("recommended")}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor: newListType === "recommended" ? colors.success : colors.surface,
                  borderWidth: 1,
                  borderColor: newListType === "recommended" ? colors.success : colors.border,
                }}
              >
                <Text
                  style={{
                    color: newListType === "recommended" ? "#ffffff" : colors.foreground,
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                >
                  ✅ Tavsiye Edilen
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setNewListType("forbidden")}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor: newListType === "forbidden" ? colors.error : colors.surface,
                  borderWidth: 1,
                  borderColor: newListType === "forbidden" ? colors.error : colors.border,
                }}
              >
                <Text
                  style={{
                    color: newListType === "forbidden" ? "#ffffff" : colors.foreground,
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                >
                  ❌ Yasaklı
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={{ color: colors.foreground, fontWeight: "600", marginBottom: 8 }}>
              Ürün Seçin ({selectedProducts.length} seçildi)
            </Text>

            <ScrollView style={{ maxHeight: 200, marginBottom: 16 }}>
              {products.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  onPress={() => handleToggleProductSelection(product.id)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    backgroundColor: selectedProducts.includes(product.id)
                      ? colors.primary + "20"
                      : colors.surface,
                    borderRadius: 6,
                    marginBottom: 6,
                    borderWidth: 1,
                    borderColor: selectedProducts.includes(product.id)
                      ? colors.primary
                      : colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: colors.foreground,
                      fontWeight: selectedProducts.includes(product.id) ? "600" : "400",
                    }}
                  >
                    {selectedProducts.includes(product.id) ? "✓ " : ""}{product.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setShowListModal(false)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ color: colors.foreground, fontWeight: "600", textAlign: "center" }}>
                  İptal
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCreateList}
                disabled={isLoading}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: colors.primary,
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={{ color: "#ffffff", fontWeight: "600", textAlign: "center" }}>
                    Oluştur
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
