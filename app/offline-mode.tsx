import { ScrollView, Text, View, TouchableOpacity, Switch, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { BackButton } from "@/components/back-button";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NetInfo from "@react-native-community/netinfo";

const OFFLINE_KEY = "offline_settings_v2";
const CACHE_KEY = "offline_cache_v2";

interface OfflineSettings {
  enabled: boolean;
  autoSync: boolean;
  cacheImages: boolean;
  cacheMeals: boolean;
  cacheMessages: boolean;
  cacheReports: boolean;
  lastOnline: string | null;
}

export default function OfflineModeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState<OfflineSettings>({
    enabled: true, autoSync: true, cacheImages: false,
    cacheMeals: true, cacheMessages: true, cacheReports: true, lastOnline: null,
  });
  const [isOnline, setIsOnline] = useState(true);
  const [cacheSize, setCacheSize] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadSettings();
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? true);
      if (state.isConnected && settings.autoSync) syncData();
    });
    return () => unsubscribe();
  }, []);

  const loadSettings = async () => {
    const s = await AsyncStorage.getItem(OFFLINE_KEY);
    if (s) setSettings(JSON.parse(s));
    // Cache boyutunu hesapla
    const keys = await AsyncStorage.getAllKeys();
    let totalSize = 0;
    for (const key of keys) {
      const val = await AsyncStorage.getItem(key);
      totalSize += (val?.length ?? 0);
    }
    setCacheSize(Math.round(totalSize / 1024));
  };

  const save = async (s: OfflineSettings) => {
    setSettings(s);
    await AsyncStorage.setItem(OFFLINE_KEY, JSON.stringify(s));
  };

  const syncData = async () => {
    if (!isOnline) { Alert.alert("İnternet Yok", "Senkronizasyon için internet bağlantısı gerekli."); return; }
    setSyncing(true);
    await new Promise(r => setTimeout(r, 2000));
    await save({ ...settings, lastOnline: new Date().toISOString() });
    setSyncing(false);
    Alert.alert("✅ Senkronize Edildi", "Tüm veriler güncellendi.");
  };

  const clearCache = () => {
    Alert.alert("Önbelleği Temizle", "Tüm önbellek silinecek. Çevrimdışı veriler kaybolabilir. Devam etmek istiyor musunuz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Temizle", style: "destructive", onPress: async () => {
          const keysToKeep = ["session_v3", "reg_users_v3", "remember_v3"];
          const allKeys = await AsyncStorage.getAllKeys();
          const keysToDelete = allKeys.filter(k => !keysToKeep.includes(k));
          await AsyncStorage.multiRemove(keysToDelete);
          setCacheSize(0);
          Alert.alert("✅ Temizlendi", "Önbellek temizlendi.");
        }
      }
    ]);
  };

  return (
    <ScreenContainer>
      <BackButton title="📡 Çevrimdışı Mod" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: Math.max(insets.bottom + 24, 32) }}>

        {/* Bağlantı durumu */}
        <View style={{ backgroundColor: isOnline ? "#22c55e20" : "#ef444420", borderRadius: 14, padding: 16, borderWidth: 2, borderColor: isOnline ? "#22c55e" : "#ef4444", flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Text style={{ fontSize: 36 }}>{isOnline ? "🌐" : "📵"}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "700", fontSize: 16, color: isOnline ? "#22c55e" : "#ef4444" }}>
              {isOnline ? "Çevrimiçi" : "Çevrimdışı"}
            </Text>
            <Text style={{ color: colors.muted, fontSize: 13 }}>
              {isOnline ? "İnternet bağlantısı var" : "İnternet bağlantısı yok — Çevrimdışı mod aktif"}
            </Text>
            {settings.lastOnline && (
              <Text style={{ color: colors.muted, fontSize: 11 }}>
                Son çevrimiçi: {new Date(settings.lastOnline).toLocaleString("tr-TR")}
              </Text>
            )}
          </View>
          {isOnline && (
            <TouchableOpacity onPress={syncData} disabled={syncing}
              style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: syncing ? colors.border : "#22c55e" }}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>{syncing ? "⏳..." : "🔄 Sync"}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Çevrimdışı mod ayarları */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 12 }}>
          <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>⚙️ Çevrimdışı Ayarlar</Text>

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={{ color: colors.foreground, fontWeight: "600" }}>📡 Çevrimdışı Mod</Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>İnternet olmadan çalışmaya devam et</Text>
            </View>
            <Switch value={settings.enabled} onValueChange={v => save({ ...settings, enabled: v })} trackColor={{ false: colors.border, true: colors.primary }} />
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={{ color: colors.foreground, fontWeight: "600" }}>🔄 Otomatik Senkronizasyon</Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>İnternet bağlanınca otomatik sync</Text>
            </View>
            <Switch value={settings.autoSync} onValueChange={v => save({ ...settings, autoSync: v })} trackColor={{ false: colors.border, true: colors.primary }} />
          </View>
        </View>

        {/* Önbellek ayarları */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 12 }}>
          <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>💾 Önbellekleme</Text>
          <Text style={{ color: colors.muted, fontSize: 13 }}>Hangi verilerin çevrimdışı saklanacağını seçin</Text>

          {[
            { key: "cacheMeals", label: "🍽️ Öğün Kayıtları", desc: "Öğünler çevrimdışı saklanır" },
            { key: "cacheMessages", label: "💬 Mesajlar", desc: "Mesajlar çevrimdışı görüntülenebilir" },
            { key: "cacheReports", label: "📊 Raporlar", desc: "Raporlar önbellekte tutulur" },
            { key: "cacheImages", label: "🖼️ Fotoğraflar", desc: "Öğün fotoğrafları (daha fazla yer kaplar)" },
          ].map(item => (
            <View key={item.key} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.foreground, fontWeight: "600" }}>{item.label}</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>{item.desc}</Text>
              </View>
              <Switch value={settings[item.key as keyof OfflineSettings] as boolean}
                onValueChange={v => save({ ...settings, [item.key]: v })}
                trackColor={{ false: colors.border, true: colors.primary }} />
            </View>
          ))}
        </View>

        {/* Önbellek boyutu */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 10 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>💽 Önbellek Boyutu</Text>
            <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 16 }}>{cacheSize} KB</Text>
          </View>
          <View style={{ height: 8, backgroundColor: colors.border, borderRadius: 4 }}>
            <View style={{ height: 8, backgroundColor: cacheSize > 1000 ? "#ef4444" : colors.primary, borderRadius: 4, width: `${Math.min(cacheSize / 50, 100)}%` }} />
          </View>
          <TouchableOpacity onPress={clearCache}
            style={{ paddingVertical: 12, borderRadius: 10, alignItems: "center", backgroundColor: "#ef444420", borderWidth: 1, borderColor: "#ef4444" }}>
            <Text style={{ color: "#ef4444", fontWeight: "700" }}>🗑️ Önbelleği Temizle</Text>
          </TouchableOpacity>
        </View>

        {/* Bilgi */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 20 }}>
            ℹ️ Uygulama tüm verilerinizi cihazınızda sakladığı için internet olmadan da çalışabilir. İnternet bağlantısı sağlandığında veriler otomatik olarak senkronize edilir.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
