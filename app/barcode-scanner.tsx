import { useState, useEffect, useRef } from "react";
import { ScrollView, Text, View, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";

import { barcodeScannerService, type FoodItem } from "@/lib/_core/barcode-scanner";

interface ScannedItem {
  id: string;
  foodItem: FoodItem;
  quantity: number;
  timestamp: number;
}

export default function BarcodeScannerScreen() {
  const router = useRouter();
  const colors = useColors();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [manualBarcode, setManualBarcode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const barcodeInputRef = useRef<any>(null);

  useEffect(() => {
    const getPermission = async () => {
      const hasPermission = await barcodeScannerService.checkCameraPermission();
      if (!hasPermission) {
        const permission = await barcodeScannerService.requestCameraPermission();
        setHasPermission(permission);
      } else {
        setHasPermission(true);
      }
    };

    getPermission();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: any) => {
    setScanned(true);
    setIsProcessing(true);

    try {
      if (!barcodeScannerService.validateBarcode(data)) {
        Alert.alert("Hata", "Geçersiz barkod formatı");
        setIsProcessing(false);
        return;
      }

      const foodItem = await barcodeScannerService.scanBarcode(data);

      if (foodItem) {
        const newItem: ScannedItem = {
          id: `${Date.now()}-${Math.random()}`,
          foodItem,
          quantity: 1,
          timestamp: Date.now(),
        };

        setScannedItems([...scannedItems, newItem]);
        Alert.alert("Başarılı", `${foodItem.name} eklendi`);
      } else {
        Alert.alert("Uyarı", "Ürün veritabanında bulunamadı. Manuel olarak ekleyebilirsiniz.");
      }
    } catch (error) {
      Alert.alert("Hata", "Barkod tarama sırasında bir hata oluştu");
      console.error(error);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setScanned(false), 500);
    }
  };

  const handleManualBarcode = async () => {
    if (!manualBarcode.trim()) {
      Alert.alert("Uyarı", "Lütfen barkod girin");
      return;
    }

    setIsProcessing(true);

    try {
      if (!barcodeScannerService.validateBarcode(manualBarcode)) {
        Alert.alert("Hata", "Geçersiz barkod formatı (8-14 rakam)");
        setIsProcessing(false);
        return;
      }

      const foodItem = await barcodeScannerService.scanBarcode(manualBarcode);

      if (foodItem) {
        const newItem: ScannedItem = {
          id: `${Date.now()}-${Math.random()}`,
          foodItem,
          quantity: 1,
          timestamp: Date.now(),
        };

        setScannedItems([...scannedItems, newItem]);
        setManualBarcode("");
        Alert.alert("Başarılı", `${foodItem.name} eklendi`);
      } else {
        Alert.alert("Uyarı", "Ürün veritabanında bulunamadı");
      }
    } catch (error) {
      Alert.alert("Hata", "Barkod işleme sırasında bir hata oluştu");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveItem = (id: string) => {
    setScannedItems(scannedItems.filter((item) => item.id !== id));
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(id);
      return;
    }

    setScannedItems(
      scannedItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const handleAddToMeal = async () => {
    if (scannedItems.length === 0) {
      Alert.alert("Uyarı", "Lütfen en az bir ürün ekleyin");
      return;
    }

    try {
      // Gerçek uygulamada, bu verileri meal'a ekleyecek
      const mealData = {
        items: scannedItems.map((item) => ({
          foodName: item.foodItem.name,
          quantity: item.foodItem.servingSize,
          multiplier: item.quantity,
          calories: item.foodItem.calories * item.quantity,
          protein: item.foodItem.protein * item.quantity,
          carbs: item.foodItem.carbs * item.quantity,
          fat: item.foodItem.fat * item.quantity,
          barcode: item.foodItem.barcode,
        })),
        timestamp: Date.now(),
      };

      console.log("Öğüne eklenen ürünler:", mealData);

      Alert.alert("Başarılı", "Ürünler öğüne eklendi", [
        {
          text: "Tamam",
          onPress: () => {
            setScannedItems([]);
            router.push("/food-management");
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Hata", "Ürünler eklenirken bir hata oluştu");
    }
  };

  const totalCalories = scannedItems.reduce(
    (sum, item) => sum + item.foodItem.calories * item.quantity,
    0
  );

  const totalProtein = scannedItems.reduce(
    (sum, item) => sum + item.foodItem.protein * item.quantity,
    0
  );

  if (hasPermission === null) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-4 text-foreground">İzin kontrol ediliyor...</Text>
      </ScreenContainer>
    );
  }

  if (hasPermission === false) {
    return (
      <ScreenContainer className="p-6 items-center justify-center">
        <Text className="text-xl font-bold text-foreground mb-4">
          Kamera İzni Gerekli
        </Text>
        <Text className="text-center text-muted mb-6">
          Barkod taraması için kamera izni gereklidir. Lütfen ayarlardan izin verin.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
            backgroundColor: colors.primary,
          }}
        >
          <Text style={{ color: "#ffffff", fontWeight: "600" }}>Geri Dön</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-3xl font-bold text-foreground flex-1">📱 Barkod Tarayıcı</Text>
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
            Gıda ürünlerinin barkodlarını tarayın veya manuel olarak girin.
          </Text>

          {/* Scanner Camera Placeholder */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 40,
              alignItems: "center",
              justifyContent: "center",
              height: 200,
              borderWidth: 2,
              borderStyle: "dashed",
              borderColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 48, marginBottom: 8 }}>📷</Text>
            <Text
              style={{
                color: colors.foreground,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              Kamera Bölgesi
            </Text>
            <Text
              style={{
                color: colors.muted,
                fontSize: 12,
                textAlign: "center",
                marginTop: 8,
              }}
            >
              Gerçek uygulamada burada kamera akışı görünecektir
            </Text>
          </View>

          {/* Manual Barcode Input */}
          <View className="gap-2">
            <Text style={{ color: colors.foreground, fontWeight: "600" }}>
              Manuel Barkod Girişi
            </Text>
            <View className="flex-row gap-2">
              <View
                style={{
                  flex: 1,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  backgroundColor: colors.surface,
                }}
              >
                <Text
                  style={{
                    color: colors.foreground,
                    fontSize: 14,
                  }}
                >
                  {manualBarcode || "Barkod girin..."}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleManualBarcode}
                disabled={isProcessing}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  backgroundColor: colors.primary,
                  opacity: isProcessing ? 0.6 : 1,
                }}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={{ color: "#ffffff", fontWeight: "600" }}>Ekle</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Scanned Items */}
          {scannedItems.length > 0 && (
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 16 }}>
                  Taranmış Ürünler ({scannedItems.length})
                </Text>
                <TouchableOpacity
                  onPress={() => setScannedItems([])}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 6,
                    backgroundColor: colors.error + "20",
                  }}
                >
                  <Text style={{ color: colors.error, fontSize: 12, fontWeight: "600" }}>
                    Temizle
                  </Text>
                </TouchableOpacity>
              </View>

              {scannedItems.map((item) => (
                <View
                  key={item.id}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 10,
                    padding: 12,
                    borderLeftWidth: 4,
                    borderLeftColor: colors.primary,
                  }}
                >
                  <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-1">
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: colors.foreground,
                        }}
                      >
                        {item.foodItem.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.muted,
                          marginTop: 2,
                        }}
                      >
                        {item.foodItem.servingSize} • {item.foodItem.brand}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveItem(item.id)}
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                      }}
                    >
                      <Text style={{ color: colors.error, fontSize: 16 }}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <TouchableOpacity
                        onPress={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          backgroundColor: colors.border,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ color: colors.foreground, fontWeight: "600" }}>−</Text>
                      </TouchableOpacity>

                      <Text
                        style={{
                          minWidth: 30,
                          textAlign: "center",
                          color: colors.foreground,
                          fontWeight: "600",
                        }}
                      >
                        {item.quantity}
                      </Text>

                      <TouchableOpacity
                        onPress={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          backgroundColor: colors.border,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ color: colors.foreground, fontWeight: "600" }}>+</Text>
                      </TouchableOpacity>
                    </View>

                    <Text
                      style={{
                        color: colors.primary,
                        fontWeight: "600",
                        fontSize: 14,
                      }}
                    >
                      {(item.foodItem.calories * item.quantity).toFixed(0)} kcal
                    </Text>
                  </View>
                </View>
              ))}

              {/* Summary */}
              <View
                style={{
                  backgroundColor: colors.primary + "15",
                  borderRadius: 10,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: colors.primary + "30",
                }}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text style={{ color: colors.muted, fontSize: 12 }}>Toplam Kalori</Text>
                  <Text
                    style={{
                      color: colors.primary,
                      fontWeight: "700",
                      fontSize: 16,
                    }}
                  >
                    {totalCalories.toFixed(0)} kcal
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text style={{ color: colors.muted, fontSize: 12 }}>Toplam Protein</Text>
                  <Text
                    style={{
                      color: colors.primary,
                      fontWeight: "700",
                      fontSize: 16,
                    }}
                  >
                    {totalProtein.toFixed(1)}g
                  </Text>
                </View>
              </View>

              {/* Add to Meal Button */}
              <TouchableOpacity
                onPress={handleAddToMeal}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  backgroundColor: colors.primary,
                }}
              >
                <Text
                  style={{
                    color: "#ffffff",
                    fontWeight: "600",
                    textAlign: "center",
                    fontSize: 16,
                  }}
                >
                  Öğüne Ekle
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Info */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 10,
              padding: 12,
              borderLeftWidth: 4,
              borderLeftColor: colors.warning,
            }}
          >
            <Text style={{ color: colors.foreground, fontWeight: "600", marginBottom: 4 }}>
              💡 İpucu
            </Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>
              Gıda ürünlerinin barkodlarını tarayarak hızlı bir şekilde öğün kaydedebilirsiniz. Veritabanında olmayan ürünleri manuel olarak ekleyebilirsiniz.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
