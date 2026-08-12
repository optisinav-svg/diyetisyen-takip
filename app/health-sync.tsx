import { ScrollView, Text, View, TouchableOpacity, Switch, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { BackButton } from "@/components/back-button";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SYNC_KEY = "health_sync_settings_v2";
const WEARABLE_KEY = "wearable_data";

interface SyncSettings {
  googleFitEnabled: boolean;
  appleHealthEnabled: boolean;
  syncSteps: boolean;
  syncCalories: boolean;
  syncSleep: boolean;
  syncHeartRate: boolean;
  syncWeight: boolean;
  syncWater: boolean;
  autoSync: boolean;
  lastSync: string | null;
}

const DEFAULT: SyncSettings = {
  googleFitEnabled: false, appleHealthEnabled: false,
  syncSteps: true, syncCalories: true, syncSleep: true,
  syncHeartRate: true, syncWeight: true, syncWater: true,
  autoSync: true, lastSync: null,
};

export default function HealthSyncScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState<SyncSettings>(DEFAULT);
  const [syncing, setSyncing] = useState(false);
  const [syncedData, setSyncedData] = useState<any>(null);
  const [platform, setPlatform] = useState<"android" | "ios">("android");

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    const saved = await AsyncStorage.getItem(SYNC_KEY);
    if (saved) setSettings(JSON.parse(saved));
    const wearable = await AsyncStorage.getItem(WEARABLE_KEY);
    if (wearable) setSyncedData(JSON.parse(wearable));
  };

  const save = async (s: SyncSettings) => {
    setSettings(s);
    await AsyncStorage.setItem(SYNC_KEY, JSON.stringify(s));
  };

  const connectGoogleFit = async () => {
    Alert.alert("Google Fit", "Google Fit bağlantısı için uygulamanın Google Play Store'dan indirilmesi ve Google hesabı izni gereklidir.\n\n⚠️ Bu özellik store sürümünde aktif olacak.", [
      { text: "Tamam" },
      {
        text: "Simüle Et (Test)", onPress: async () => {
          const mockData = {
            steps: 8432, heartRate: 72, caloriesBurned: 1840,
            sleep: 7.5, water: 1600, activeMinutes: 45,
            weight: 80.2, lastSync: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
            connected: true, deviceName: "Google Fit",
          };
          await AsyncStorage.setItem(WEARABLE_KEY, JSON.stringify(mockData));
          setSyncedData(mockData);
          await save({ ...settings, googleFitEnabled: true, lastSync: new Date().toISOString() });
          Alert.alert("✅ Bağlandı!", "Google Fit verileri senkronize edildi.");
        }
      }
    ]);
  };

  const connectAppleHealth = async () => {
    Alert.alert("Apple Health", "Apple Health bağlantısı iOS cihazlarda HealthKit izni gerektirir.\n\n⚠️ Bu özellik iOS store sürümünde aktif olacak.", [
      { text: "Tamam" },
      {
        text: "Simüle Et (Test)", onPress: async () => {
          const mockData = {
            steps: 9150, heartRate: 68, caloriesBurned: 1920,
            sleep: 8.0, water: 1800, activeMinutes: 52,
            weight: 79.5, lastSync: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
            connected: true, deviceName: "Apple Health",
          };
          await AsyncStorage.setItem(WEARABLE_KEY, JSON.stringify(mockData));
          setSyncedData(mockData);
          await save({ ...settings, appleHealthEnabled: true, lastSync: new Date().toISOString() });
          Alert.alert("✅ Bağlandı!", "Apple Health verileri senkronize edildi.");
        }
      }
    ]);
  };

  const syncNow = async () => {
    if (!settings.googleFitEnabled && !settings.appleHealthEnabled) {
      Alert.alert("Hata", "Önce Google Fit veya Apple Health bağlayın");
      return;
    }
    setSyncing(true);
    await new Promise(r => setTimeout(r, 1500));
    const updated = {
      ...syncedData,
      steps: (syncedData?.steps || 0) + Math.floor(Math.random() * 200),
      lastSync: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
    };
    await AsyncStorage.setItem(WEARABLE_KEY, JSON.stringify(updated));
    setSyncedData(updated);
    await save({ ...settings, lastSync: new Date().toISOString() });
    setSyncing(false);
    Alert.alert("✅ Senkronize Edildi", "Veriler güncellendi.");
  };

  const disconnect = async (type: "google" | "apple") => {
    Alert.alert("Bağlantıyı Kes", "Senkronizasyonu kesmek istiyor musunuz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Kes", style: "destructive", onPress: async () => {
          if (type === "google") await save({ ...settings, googleFitEnabled: false });
          else await save({ ...settings, appleHealthEnabled: false });
          if (!settings.googleFitEnabled && !settings.appleHealthEnabled) {
            setSyncedData(null);
            await AsyncStorage.removeItem(WEARABLE_KEY);
          }
        }
      }
    ]);
  };

  const isConnected = settings.googleFitEnabled || settings.appleHealthEnabled;

  return (
    <ScreenContainer>
      <BackButton title="🏃 Sağlık Senkronizasyonu" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: Math.max(insets.bottom + 24, 32) }}>

        {/* Bağlantı durumu */}
        {isConnected && syncedData && (
          <View style={{ backgroundColor: "#22c55e20", borderRadius: 14, padding: 16, borderWidth: 2, borderColor: "#22c55e", gap: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View>
                <Text style={{ fontWeight: "700", color: "#22c55e", fontSize: 16 }}>✅ {syncedData.deviceName} Bağlı</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>Son sync: {syncedData.lastSync}</Text>
              </View>
              <TouchableOpacity onPress={syncNow} disabled={syncing}
                style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: syncing ? colors.border : colors.primary }}>
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>{syncing ? "⏳..." : "🔄 Sync"}</Text>
              </TouchableOpacity>
            </View>

            {/* Senkronize veriler */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {[
                { icon: "👟", label: "Adım", value: syncedData.steps?.toLocaleString("tr-TR"), show: settings.syncSteps },
                { icon: "🔥", label: "Kalori", value: `${syncedData.caloriesBurned} kcal`, show: settings.syncCalories },
                { icon: "😴", label: "Uyku", value: `${syncedData.sleep} saat`, show: settings.syncSleep },
                { icon: "❤️", label: "Nabız", value: `${syncedData.heartRate} bpm`, show: settings.syncHeartRate },
                { icon: "⚖️", label: "Kilo", value: `${syncedData.weight} kg`, show: settings.syncWeight },
                { icon: "💧", label: "Su", value: `${syncedData.water} ml`, show: settings.syncWater },
              ].filter(i => i.show).map(item => (
                <View key={item.label} style={{ width: "47%", backgroundColor: colors.surface, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: "#22c55e40", gap: 2 }}>
                  <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                  <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 15 }}>{item.value}</Text>
                  <Text style={{ fontSize: 11, color: colors.muted }}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Platform seçimi */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          {[{ k: "android", l: "🤖 Android" }, { k: "ios", l: "🍎 iOS" }].map(p => (
            <TouchableOpacity key={p.k} onPress={() => setPlatform(p.k as any)}
              style={{ flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center", backgroundColor: platform === p.k ? colors.primary : colors.surface, borderWidth: 1, borderColor: platform === p.k ? colors.primary : colors.border }}>
              <Text style={{ color: platform === p.k ? "#fff" : colors.foreground, fontWeight: "700" }}>{p.l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Google Fit */}
        {platform === "android" && (
          <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: settings.googleFitEnabled ? "#22c55e" : colors.border, gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Text style={{ fontSize: 36 }}>🏃</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>Google Fit</Text>
                <Text style={{ color: colors.muted, fontSize: 13 }}>Adım, kalori, uyku, nabız senkronizasyonu</Text>
              </View>
              {settings.googleFitEnabled
                ? <TouchableOpacity onPress={() => disconnect("google")} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: "#ef444420", borderWidth: 1, borderColor: "#ef4444" }}>
                    <Text style={{ color: "#ef4444", fontWeight: "600", fontSize: 12 }}>Kes</Text>
                  </TouchableOpacity>
                : <TouchableOpacity onPress={connectGoogleFit} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: "#4285F4" }}>
                    <Text style={{ color: "#fff", fontWeight: "700" }}>Bağla</Text>
                  </TouchableOpacity>
              }
            </View>
            {settings.googleFitEnabled && (
              <View style={{ backgroundColor: "#22c55e20", borderRadius: 8, padding: 8 }}>
                <Text style={{ color: "#22c55e", fontSize: 12 }}>✅ Bağlı — Veriler otomatik senkronize ediliyor</Text>
              </View>
            )}
          </View>
        )}

        {/* Apple Health */}
        {platform === "ios" && (
          <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: settings.appleHealthEnabled ? "#22c55e" : colors.border, gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Text style={{ fontSize: 36 }}>❤️</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>Apple Health</Text>
                <Text style={{ color: colors.muted, fontSize: 13 }}>HealthKit ile tam entegrasyon</Text>
              </View>
              {settings.appleHealthEnabled
                ? <TouchableOpacity onPress={() => disconnect("apple")} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: "#ef444420", borderWidth: 1, borderColor: "#ef4444" }}>
                    <Text style={{ color: "#ef4444", fontWeight: "600", fontSize: 12 }}>Kes</Text>
                  </TouchableOpacity>
                : <TouchableOpacity onPress={connectAppleHealth} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: "#ff2d55" }}>
                    <Text style={{ color: "#fff", fontWeight: "700" }}>Bağla</Text>
                  </TouchableOpacity>
              }
            </View>
            {settings.appleHealthEnabled && (
              <View style={{ backgroundColor: "#22c55e20", borderRadius: 8, padding: 8 }}>
                <Text style={{ color: "#22c55e", fontSize: 12 }}>✅ Bağlı — HealthKit verileri senkronize ediliyor</Text>
              </View>
            )}
          </View>
        )}

        {/* Senkronize edilecek veriler */}
        {isConnected && (
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 10 }}>
            <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>📊 Senkronize Edilecek Veriler</Text>
            {[
              { key: "syncSteps", label: "👟 Adım sayısı" },
              { key: "syncCalories", label: "🔥 Yakılan kalori" },
              { key: "syncSleep", label: "😴 Uyku süresi" },
              { key: "syncHeartRate", label: "❤️ Nabız" },
              { key: "syncWeight", label: "⚖️ Kilo" },
              { key: "syncWater", label: "💧 Su tüketimi" },
            ].map(item => (
              <View key={item.key} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 }}>
                <Text style={{ color: colors.foreground }}>{item.label}</Text>
                <Switch value={settings[item.key as keyof SyncSettings] as boolean}
                  onValueChange={v => save({ ...settings, [item.key]: v })}
                  trackColor={{ false: colors.border, true: colors.primary }} />
              </View>
            ))}
          </View>
        )}

        {!isConnected && (
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 8 }}>
            <Text style={{ fontWeight: "700", color: colors.foreground }}>Bu entegrasyon ne sağlar?</Text>
            {["✅ Adım sayısı otomatik takibi", "✅ Kalori yakımı senkronizasyonu", "✅ Uyku kalitesi analizi", "✅ Nabız ve kalp sağlığı", "✅ Kilo değişimi takibi", "✅ Manuel giriş gerekmiyor"].map(i => (
              <Text key={i} style={{ color: colors.foreground, fontSize: 13 }}>{i}</Text>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
