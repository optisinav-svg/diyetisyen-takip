import { BackButton } from "@/components/back-button";
import { ScrollView, Text, View, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WEARABLE_KEY = "wearable_data";
const CONNECTED_KEY = "wearable_connected";

interface WearableData {
  steps: number;
  heartRate: number;
  sleep: number;
  caloriesBurned: number;
  lastSync: string;
}

interface DeviceInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
  available: boolean;
}

const DEVICES: DeviceInfo[] = [
  { id: "google-fit", name: "Google Fit", icon: "🏃", description: "Android cihazlar için Google Fit entegrasyonu", available: true },
  { id: "health-connect", name: "Health Connect", icon: "❤️", description: "Android Health Connect API", available: true },
  { id: "samsung-health", name: "Samsung Health", icon: "⌚", description: "Samsung akıllı saatler", available: true },
  { id: "garmin", name: "Garmin", icon: "🗺️", description: "Garmin saatler ve fitness cihazları", available: true },
  { id: "fitbit", name: "Fitbit", icon: "💪", description: "Fitbit fitness takipçileri", available: true },
  { id: "apple-health", name: "Apple Health", icon: "🍎", description: "iOS cihazlar için (iPhone/Apple Watch)", available: false },
];

// Saat verilerini simüle et (gerçekte Bluetooth/API ile gelir)
const generateWearableData = (): WearableData => ({
  steps: Math.floor(Math.random() * 5000) + 4000,
  heartRate: Math.floor(Math.random() * 20) + 65,
  sleep: Math.round((Math.random() * 3 + 6) * 10) / 10,
  caloriesBurned: Math.floor(Math.random() * 300) + 200,
  lastSync: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
});

export default function WearableSyncScreen() {
  const colors = useColors();
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null);
  const [wearableData, setWearableData] = useState<WearableData | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const connected = await AsyncStorage.getItem(CONNECTED_KEY);
    if (connected) setConnectedDevice(connected);
    const data = await AsyncStorage.getItem(WEARABLE_KEY);
    if (data) setWearableData(JSON.parse(data));
  };

  const connectDevice = async (device: DeviceInfo) => {
    if (!device.available) {
      Alert.alert("Mevcut Değil", "Bu cihaz şu an desteklenmiyor.");
      return;
    }
    setConnecting(device.id);
    // Bağlantı simülasyonu (gerçekte Bluetooth/OAuth ile yapılır)
    await new Promise(r => setTimeout(r, 2000));
    await AsyncStorage.setItem(CONNECTED_KEY, device.id);
    setConnectedDevice(device.id);
    setConnecting(null);
    Alert.alert("Bağlandı! ✅", `${device.name} başarıyla bağlandı. Şimdi senkronize edebilirsiniz.`);
  };

  const disconnectDevice = async () => {
    await AsyncStorage.removeItem(CONNECTED_KEY);
    await AsyncStorage.removeItem(WEARABLE_KEY);
    setConnectedDevice(null);
    setWearableData(null);
  };

  const syncData = async () => {
    if (!connectedDevice) return;
    setSyncing(true);
    // Senkronizasyon simülasyonu
    await new Promise(r => setTimeout(r, 2000));
    const data = generateWearableData();
    setWearableData(data);
    await AsyncStorage.setItem(WEARABLE_KEY, JSON.stringify(data));
    setSyncing(false);
    Alert.alert("Senkronize Edildi! ✅", `Veriler güncellendi:\n👟 ${data.steps} adım\n❤️ ${data.heartRate} bpm\n😴 ${data.sleep} saat uyku`);
  };

  const connectedDeviceInfo = DEVICES.find(d => d.id === connectedDevice);

  return (
    <ScreenContainer>
      <BackButton title="⌚ Akıllı Saat Bağlantısı" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}>

        {/* Bağlı cihaz */}
        {connectedDevice && connectedDeviceInfo ? (
          <View style={{ backgroundColor: "#22c55e20", borderRadius: 12, padding: 16, borderWidth: 2, borderColor: "#22c55e", gap: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Text style={{ fontSize: 28 }}>{connectedDeviceInfo.icon}</Text>
                <View>
                  <Text style={{ fontWeight: "700", color: "#22c55e", fontSize: 16 }}>✅ Bağlı</Text>
                  <Text style={{ color: colors.foreground, fontWeight: "600" }}>{connectedDeviceInfo.name}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={disconnectDevice}
                style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: "#ef444420", borderWidth: 1, borderColor: "#ef4444" }}>
                <Text style={{ color: "#ef4444", fontWeight: "600", fontSize: 13 }}>Bağlantıyı Kes</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={syncData} disabled={syncing}
              style={{
                paddingVertical: 14, borderRadius: 10, alignItems: "center",
                backgroundColor: syncing ? colors.border : "#22c55e",
                flexDirection: "row", justifyContent: "center", gap: 8,
              }}>
              {syncing && <ActivityIndicator color="#fff" size="small" />}
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
                {syncing ? "Senkronize ediliyor..." : "🔄 Verileri Senkronize Et"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.muted, textAlign: "center" }}>
              Henüz cihaz bağlanmadı. Aşağıdan bir cihaz seçin.
            </Text>
          </View>
        )}

        {/* Saat Verileri */}
        {wearableData && (
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 14 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>📊 Saat Verileri</Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>Son sync: {wearableData.lastSync}</Text>
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {[
                { icon: "👟", label: "Adım", value: wearableData.steps.toLocaleString(), unit: "adım", color: "#3b82f6" },
                { icon: "❤️", label: "Kalp Hızı", value: String(wearableData.heartRate), unit: "bpm", color: "#ef4444" },
                { icon: "😴", label: "Uyku", value: String(wearableData.sleep), unit: "saat", color: "#8b5cf6" },
                { icon: "🔥", label: "Kalori", value: String(wearableData.caloriesBurned), unit: "kcal", color: "#f97316" },
              ].map(item => (
                <View key={item.label} style={{
                  flex: 1, minWidth: "45%", backgroundColor: item.color + "15",
                  borderRadius: 10, padding: 14, borderWidth: 1, borderColor: item.color + "40",
                  alignItems: "center", gap: 4,
                }}>
                  <Text style={{ fontSize: 24 }}>{item.icon}</Text>
                  <Text style={{ fontSize: 20, fontWeight: "bold", color: item.color }}>{item.value}</Text>
                  <Text style={{ fontSize: 11, color: colors.muted }}>{item.unit}</Text>
                  <Text style={{ fontSize: 12, color: colors.foreground, fontWeight: "600" }}>{item.label}</Text>
                </View>
              ))}
            </View>

            {/* Adım hedef çubuğu */}
            <View style={{ gap: 6 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: colors.foreground, fontSize: 13 }}>👟 Günlük Adım Hedefi</Text>
                <Text style={{ color: "#3b82f6", fontWeight: "600" }}>{wearableData.steps} / 10.000</Text>
              </View>
              <View style={{ height: 10, backgroundColor: colors.border, borderRadius: 5 }}>
                <View style={{
                  height: 10, backgroundColor: "#3b82f6", borderRadius: 5,
                  width: `${Math.min((wearableData.steps / 10000) * 100, 100)}%`
                }} />
              </View>
            </View>
          </View>
        )}

        {/* Cihaz Listesi */}
        <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>📱 Cihaz Seç</Text>
        {DEVICES.map(device => {
          const isConnected = connectedDevice === device.id;
          const isConnecting = connecting === device.id;
          return (
            <TouchableOpacity key={device.id}
              onPress={() => isConnected ? null : connectDevice(device)}
              disabled={!device.available || isConnecting || isConnected}
              style={{
                backgroundColor: colors.surface, borderRadius: 12, padding: 16,
                borderWidth: 2, borderColor: isConnected ? "#22c55e" : device.available ? colors.border : colors.border,
                flexDirection: "row", alignItems: "center", gap: 12,
                opacity: !device.available ? 0.5 : 1,
              }}>
              <Text style={{ fontSize: 28 }}>{device.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 15 }}>{device.name}</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>{device.description}</Text>
                {!device.available && <Text style={{ color: "#ef4444", fontSize: 11 }}>Bu platformda mevcut değil</Text>}
              </View>
              {isConnecting ? (
                <ActivityIndicator color={colors.primary} />
              ) : isConnected ? (
                <Text style={{ color: "#22c55e", fontWeight: "700" }}>✅ Bağlı</Text>
              ) : device.available ? (
                <Text style={{ color: colors.primary, fontWeight: "600" }}>Bağlan →</Text>
              ) : null}
            </TouchableOpacity>
          );
        })}

        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>
            ℹ️ Akıllı saat bağlantısı için cihazınızın Bluetooth'unun açık olması ve ilgili uygulamanın (Google Fit, Samsung Health vb.) yüklü olması gerekir. Gerçek veri aktarımı için uygulamanın tam sürümü gerekmektedir.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
