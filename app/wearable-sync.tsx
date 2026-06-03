import { ScrollView, Text, View, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import { wearableIntegrationService, type WearableDevice } from "@/lib/_core/wearable-integration";

export default function WearableSyncScreen() {
  const router = useRouter();
  const colors = useColors();
  const [devices, setDevices] = useState<WearableDevice[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncingDeviceId, setSyncingDeviceId] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = () => {
    const allDevices = wearableIntegrationService.getAllDevices();
    setDevices(allDevices);
  };

  const handleConnectAppleHealth = async () => {
    setIsSyncing(true);
    try {
      const success = await wearableIntegrationService.connectToAppleHealth();
      if (success) {
        Alert.alert("Başarılı", "Apple Health bağlandı");
        loadDevices();
      } else {
        Alert.alert("Hata", "Apple Health bağlanırken bir hata oluştu");
      }
    } catch (error) {
      Alert.alert("Hata", "Bağlantı sırasında bir hata oluştu");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConnectGoogleFit = async () => {
    setIsSyncing(true);
    try {
      const success = await wearableIntegrationService.connectToGoogleFit();
      if (success) {
        Alert.alert("Başarılı", "Google Fit bağlandı");
        loadDevices();
      } else {
        Alert.alert("Hata", "Google Fit bağlanırken bir hata oluştu");
      }
    } catch (error) {
      Alert.alert("Hata", "Bağlantı sırasında bir hata oluştu");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncDevice = async (deviceId: string) => {
    setSyncingDeviceId(deviceId);
    try {
      const result = await wearableIntegrationService.syncHealthData(deviceId);
      if (result.success) {
        Alert.alert(
          "Başarılı",
          `${result.metricsCount} metrik senkronize edildi`
        );
        setLastSyncTime(result.syncedAt);
        loadDevices();
      } else {
        Alert.alert("Hata", result.errors?.join(", ") || "Senkronizasyon başarısız");
      }
    } catch (error) {
      Alert.alert("Hata", "Senkronizasyon sırasında bir hata oluştu");
    } finally {
      setSyncingDeviceId(null);
    }
  };

  const handleDisconnect = (deviceId: string) => {
    Alert.alert(
      "Bağlantıyı Kes",
      "Bu cihazı bağlantıdan ayırmak istiyor musunuz?",
      [
        { text: "İptal", onPress: () => {}, style: "cancel" },
        {
          text: "Evet",
          onPress: () => {
            wearableIntegrationService.disconnectDevice(deviceId);
            loadDevices();
            Alert.alert("Başarılı", "Cihaz bağlantısı kesildi");
          },
        },
      ]
    );
  };

  const getDeviceIcon = (type: string): string => {
    switch (type) {
      case "apple-watch":
        return "⌚";
      case "fitbit":
        return "📱";
      case "garmin":
        return "📍";
      case "samsung":
        return "⌚";
      case "xiaomi":
        return "📱";
      default:
        return "📱";
    }
  };

  const formatLastSync = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffMinutes < 1) return "Şimdi";
    if (diffMinutes < 60) return `${diffMinutes} dakika önce`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} saat önce`;
    return date.toLocaleDateString("tr-TR");
  };

  const stats = wearableIntegrationService.getStatistics();

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-3xl font-bold text-foreground flex-1">⌚ Wearable Senkronizasyon</Text>
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
            Apple Health, Google Fit ve diğer wearable cihazlardan sağlık verilerini senkronize edin.
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
            <View className="flex-row items-center justify-between mb-2">
              <Text style={{ color: colors.muted, fontSize: 12 }}>Bağlı Cihazlar</Text>
              <Text
                style={{
                  color: colors.primary,
                  fontWeight: "700",
                  fontSize: 16,
                }}
              >
                {stats.connectedDevices}
              </Text>
            </View>
            <View className="flex-row items-center justify-between mb-2">
              <Text style={{ color: colors.muted, fontSize: 12 }}>Toplam Metrikler</Text>
              <Text
                style={{
                  color: colors.primary,
                  fontWeight: "700",
                  fontSize: 16,
                }}
              >
                {stats.totalMetrics}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text style={{ color: colors.muted, fontSize: 12 }}>Ortalama Adımlar</Text>
              <Text
                style={{
                  color: colors.primary,
                  fontWeight: "700",
                  fontSize: 16,
                }}
              >
                {Math.round(stats.averageSteps)}
              </Text>
            </View>
          </View>

          {/* Available Services */}
          <View className="gap-2">
            <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 16 }}>
              Mevcut Hizmetler
            </Text>

            {/* Apple Health */}
            <TouchableOpacity
              onPress={handleConnectAppleHealth}
              disabled={isSyncing}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 10,
                padding: 14,
                borderLeftWidth: 4,
                borderLeftColor: colors.primary,
                opacity: isSyncing ? 0.6 : 1,
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: colors.foreground,
                    }}
                  >
                    🍎 Apple Health
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.muted,
                      marginTop: 4,
                    }}
                  >
                    iPhone ve Apple Watch verilerini senkronize edin
                  </Text>
                </View>
                {isSyncing ? (
                  <ActivityIndicator color={colors.primary} size="small" />
                ) : (
                  <Text style={{ color: colors.primary, fontSize: 16 }}>→</Text>
                )}
              </View>
            </TouchableOpacity>

            {/* Google Fit */}
            <TouchableOpacity
              onPress={handleConnectGoogleFit}
              disabled={isSyncing}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 10,
                padding: 14,
                borderLeftWidth: 4,
                borderLeftColor: colors.primary,
                opacity: isSyncing ? 0.6 : 1,
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: colors.foreground,
                    }}
                  >
                    🔵 Google Fit
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.muted,
                      marginTop: 4,
                    }}
                  >
                    Android ve Wear OS verilerini senkronize edin
                  </Text>
                </View>
                {isSyncing ? (
                  <ActivityIndicator color={colors.primary} size="small" />
                ) : (
                  <Text style={{ color: colors.primary, fontSize: 16 }}>→</Text>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Connected Devices */}
          {devices.length > 0 && (
            <View className="gap-2">
              <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 16 }}>
                Bağlı Cihazlar
              </Text>

              {devices.map((device) => (
                <View
                  key={device.id}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 10,
                    padding: 12,
                    borderLeftWidth: 4,
                    borderLeftColor: device.connected ? colors.success : colors.muted,
                  }}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center gap-2 flex-1">
                      <Text style={{ fontSize: 20 }}>
                        {getDeviceIcon(device.type)}
                      </Text>
                      <View className="flex-1">
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: colors.foreground,
                          }}
                        >
                          {device.name}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: colors.muted,
                            marginTop: 2,
                          }}
                        >
                          {device.connected ? "Bağlı" : "Bağlı Değil"}
                        </Text>
                      </View>
                    </View>
                    {device.batteryLevel !== undefined && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.muted,
                          fontWeight: "600",
                        }}
                      >
                        🔋 {device.batteryLevel}%
                      </Text>
                    )}
                  </View>

                  {device.lastSync > 0 && (
                    <Text
                      style={{
                        fontSize: 11,
                        color: colors.muted,
                        marginBottom: 8,
                      }}
                    >
                      Son senkronizasyon: {formatLastSync(device.lastSync)}
                    </Text>
                  )}

                  <View className="flex-row gap-2">
                    {device.connected && (
                      <TouchableOpacity
                        onPress={() => handleSyncDevice(device.id)}
                        disabled={syncingDeviceId === device.id}
                        style={{
                          flex: 1,
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          borderRadius: 6,
                          backgroundColor: colors.primary,
                          opacity: syncingDeviceId === device.id ? 0.6 : 1,
                        }}
                      >
                        {syncingDeviceId === device.id ? (
                          <ActivityIndicator color="#ffffff" size="small" />
                        ) : (
                          <Text
                            style={{
                              color: "#ffffff",
                              fontWeight: "600",
                              textAlign: "center",
                              fontSize: 12,
                            }}
                          >
                            Senkronize Et
                          </Text>
                        )}
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      onPress={() => handleDisconnect(device.id)}
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 6,
                        backgroundColor: colors.error + "20",
                        borderWidth: 1,
                        borderColor: colors.error,
                      }}
                    >
                      <Text
                        style={{
                          color: colors.error,
                          fontWeight: "600",
                          textAlign: "center",
                          fontSize: 12,
                        }}
                      >
                        Bağlantıyı Kes
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
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
              Wearable cihazlarınızı bağlayarak adım sayısı, kalp atış hızı, kalori ve uyku verilerinizi otomatik olarak senkronize edebilirsiniz.
            </Text>
          </View>

          {/* Features List */}
          <View className="gap-2">
            <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 16 }}>
              Desteklenen Metrikler
            </Text>

            {[
              { icon: "👣", name: "Adım Sayısı", description: "Günlük adım takibi" },
              { icon: "❤️", name: "Kalp Atış Hızı", description: "Gerçek zamanlı kalp atış" },
              { icon: "🔥", name: "Kalori", description: "Yakılan kalori" },
              { icon: "📍", name: "Mesafe", description: "Yürüyüş/koşu mesafesi" },
              { icon: "😴", name: "Uyku", description: "Uyku süresi ve kalitesi" },
              { icon: "⚖️", name: "Kilo", description: "Vücut ağırlığı" },
            ].map((metric, index) => (
              <View
                key={index}
                className="flex-row items-center gap-3"
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  backgroundColor: colors.surface,
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontSize: 18 }}>{metric.icon}</Text>
                <View className="flex-1">
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: colors.foreground,
                    }}
                  >
                    {metric.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: colors.muted,
                      marginTop: 2,
                    }}
                  >
                    {metric.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
