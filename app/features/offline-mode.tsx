import { BackButton } from "@/components/back-button";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import {
  offlineModeService,
  type OfflineState,
} from "@/lib/_core/offline-mode";

export default function OfflineModeScreen() {
  const router = useRouter();
  const colors = useColors();
  const [offlineState, setOfflineState] = useState<OfflineState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOfflineState();
    const interval = setInterval(loadOfflineState, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadOfflineState = () => {
    const state = offlineModeService.getOfflineState();
    setOfflineState(state);
  };

  const handleToggleOnlineStatus = () => {
    const newStatus = !offlineState?.isOnline;
    offlineModeService.setOnlineStatus(newStatus || false);
    loadOfflineState();

    Alert.alert(
      "Durum Değiştirildi",
      newStatus ? "Çevrimiçi moda geçildi" : "Çevrimdışı moda geçildi"
    );
  };

  const handleSyncNow = async () => {
    setIsLoading(true);
    try {
      await offlineModeService.syncPendingData();
      loadOfflineState();
      Alert.alert("Başarılı", "Veriler senkronize edildi");
    } catch (error) {
      Alert.alert("Hata", "Senkronizasyon sırasında bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryErrors = async () => {
    setIsLoading(true);
    try {
      await offlineModeService.retrySyncErrors();
      loadOfflineState();
      Alert.alert("Başarılı", "Hata olan öğeler yeniden senkronize edildi");
    } catch (error) {
      Alert.alert("Hata", "Yeniden deneme sırasında bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearOfflineData = () => {
    Alert.alert(
      "Onay",
      "Tüm çevrimdışı veriler silinecek. Devam etmek istediğinize emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await offlineModeService.clearOfflineData();
              loadOfflineState();
              Alert.alert("Başarılı", "Çevrimdışı veriler silindi");
            } catch (error) {
              Alert.alert("Hata", "Silme işlemi başarısız oldu");
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    loadOfflineState();
    setRefreshing(false);
  };

  if (!offlineState) {
    return (
      <ScreenContainer className="p-4">
      <BackButton />
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  const stats = offlineModeService.getStatistics();

  return (
    <ScreenContainer className="p-4">
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="gap-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-3xl font-bold text-foreground flex-1">
              📡 Çevrimdışı Mod
            </Text>
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
            İnternet bağlantısı olmadan veri kaydedin ve bağlantı kurulunca senkronize edin.
          </Text>

          {/* Online Status Card */}
          <TouchableOpacity
            onPress={handleToggleOnlineStatus}
            style={{
              backgroundColor: offlineState.isOnline
                ? colors.success + "15"
                : colors.error + "15",
              borderRadius: 10,
              padding: 16,
              borderWidth: 1,
              borderColor: offlineState.isOnline ? colors.success + "30" : colors.error + "30",
            }}
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 14 }}>
                {offlineState.isOnline ? "🟢 Çevrimiçi" : "🔴 Çevrimdışı"}
              </Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>Değiştirmek için dokunun</Text>
            </View>

            <Text
              style={{
                color: offlineState.isOnline ? colors.success : colors.error,
                fontWeight: "600",
                fontSize: 12,
              }}
            >
              {offlineState.isOnline
                ? "Veriler otomatik olarak senkronize ediliyor"
                : "Veriler cihazda kaydediliyor"}
            </Text>
          </TouchableOpacity>

          {/* Statistics */}
          <View className="gap-3">
            <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 14 }}>
              📊 İstatistikler
            </Text>

            <View className="flex-row gap-2">
              <View
                style={{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderRadius: 10,
                  padding: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.primary,
                }}
              >
                <Text style={{ color: colors.muted, fontSize: 11, marginBottom: 4 }}>
                  Toplam Öğe
                </Text>
                <Text
                  style={{
                    color: colors.foreground,
                    fontWeight: "700",
                    fontSize: 20,
                  }}
                >
                  {stats.totalItems}
                </Text>
              </View>

              <View
                style={{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderRadius: 10,
                  padding: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.warning,
                }}
              >
                <Text style={{ color: colors.muted, fontSize: 11, marginBottom: 4 }}>
                  Beklemede
                </Text>
                <Text
                  style={{
                    color: colors.warning,
                    fontWeight: "700",
                    fontSize: 20,
                  }}
                >
                  {stats.pendingItems}
                </Text>
              </View>

              <View
                style={{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderRadius: 10,
                  padding: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.success,
                }}
              >
                <Text style={{ color: colors.muted, fontSize: 11, marginBottom: 4 }}>
                  Senkronize
                </Text>
                <Text
                  style={{
                    color: colors.success,
                    fontWeight: "700",
                    fontSize: 20,
                  }}
                >
                  {stats.syncedItems}
                </Text>
              </View>

              <View
                style={{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderRadius: 10,
                  padding: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.error,
                }}
              >
                <Text style={{ color: colors.muted, fontSize: 11, marginBottom: 4 }}>
                  Hata
                </Text>
                <Text
                  style={{
                    color: colors.error,
                    fontWeight: "700",
                    fontSize: 20,
                  }}
                >
                  {stats.errorItems}
                </Text>
              </View>
            </View>
          </View>

          {/* Last Sync Time */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 10,
              padding: 12,
            }}
          >
            <Text style={{ color: colors.muted, fontSize: 11, marginBottom: 4 }}>
              Son Senkronizasyon
            </Text>
            <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 12 }}>
              {new Date(offlineState.lastSyncTime).toLocaleString("tr-TR")}
            </Text>
          </View>

          {/* Pending Items */}
          {stats.pendingItems > 0 && (
            <View
              style={{
                backgroundColor: colors.warning + "15",
                borderRadius: 10,
                padding: 12,
                borderLeftWidth: 4,
                borderLeftColor: colors.warning,
              }}
            >
              <Text style={{ color: colors.warning, fontWeight: "600", marginBottom: 8 }}>
                ⏳ {stats.pendingItems} öğe senkronizasyon beklemede
              </Text>
              <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>
                Çevrimiçi olduğunuzda bu öğeler otomatik olarak senkronize edilecek.
              </Text>
              <TouchableOpacity
                onPress={handleSyncNow}
                disabled={isLoading || !offlineState.isOnline}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 6,
                  paddingVertical: 10,
                  opacity: isLoading || !offlineState.isOnline ? 0.6 : 1,
                }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={{ color: "#ffffff", fontWeight: "600", textAlign: "center" }}>
                    Şimdi Senkronize Et
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Error Items */}
          {stats.errorItems > 0 && (
            <View
              style={{
                backgroundColor: colors.error + "15",
                borderRadius: 10,
                padding: 12,
                borderLeftWidth: 4,
                borderLeftColor: colors.error,
              }}
            >
              <Text style={{ color: colors.error, fontWeight: "600", marginBottom: 8 }}>
                ❌ {stats.errorItems} öğe senkronizasyon hatası
              </Text>
              <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>
                Bu öğeler senkronize edilirken hata oluştu. Yeniden deneyebilirsiniz.
              </Text>
              <TouchableOpacity
                onPress={handleRetryErrors}
                disabled={isLoading}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 6,
                  paddingVertical: 10,
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={{ color: "#ffffff", fontWeight: "600", textAlign: "center" }}>
                    Yeniden Dene
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Data Types */}
          <View className="gap-3">
            <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 14 }}>
              📂 Veri Türleri
            </Text>

            {["meal", "measurement", "appointment", "message", "feedback"].map((type) => {
              const typeData = offlineModeService.getDataByType(type);
              const typeLabel: Record<string, string> = {
                meal: "🍽️ Öğünler",
                measurement: "📏 Ölçümler",
                appointment: "📅 Randevular",
                message: "💬 Mesajlar",
                feedback: "💭 Geri Bildirim",
              };

              return (
                <View
                  key={type}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 10,
                    padding: 12,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 12 }}>
                    {typeLabel[type]}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Text style={{ color: colors.muted, fontWeight: "600", fontSize: 12 }}>
                      {typeData.length}
                    </Text>
                    <View
                      style={{
                        backgroundColor: colors.primary + "20",
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                      }}
                    >
                      <Text style={{ color: colors.primary, fontSize: 10, fontWeight: "600" }}>
                        {typeData.filter((d) => d.syncStatus === "synced").length}/
                        {typeData.length}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Settings */}
          <View className="gap-3">
            <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 14 }}>
              ⚙️ Ayarlar
            </Text>

            <TouchableOpacity
              onPress={handleClearOfflineData}
              style={{
                backgroundColor: colors.error + "15",
                borderRadius: 10,
                padding: 12,
                borderLeftWidth: 4,
                borderLeftColor: colors.error,
              }}
            >
              <Text style={{ color: colors.error, fontWeight: "600" }}>
                🗑️ Çevrimdışı Verileri Temizle
              </Text>
              <Text style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>
                Tüm çevrimdışı veriler silinecek
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info */}
          <View
            style={{
              backgroundColor: colors.primary + "10",
              borderRadius: 10,
              padding: 12,
              borderLeftWidth: 4,
              borderLeftColor: colors.primary,
            }}
          >
            <Text style={{ color: colors.foreground, fontWeight: "600", marginBottom: 8 }}>
              ℹ️ Çevrimdışı Mod Hakkında
            </Text>
            <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 16 }}>
              Çevrimdışı modda, öğün kayıtları, ölçümler ve mesajlar cihazınızda kaydedilir.
              Çevrimiçi olduğunuzda, bu veriler otomatik olarak sunucuya senkronize edilir.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
