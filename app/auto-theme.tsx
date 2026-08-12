import { ScrollView, Text, View, TouchableOpacity, Switch, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { BackButton } from "@/components/back-button";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const THEME_KEY = "app_theme";
const AUTO_THEME_KEY = "auto_theme_enabled";

export default function AutoThemeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const systemScheme = useColorScheme();
  const [autoEnabled, setAutoEnabled] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    const auto = await AsyncStorage.getItem(AUTO_THEME_KEY);
    const theme = await AsyncStorage.getItem(THEME_KEY);
    setAutoEnabled(auto === "true");
    if (auto === "true") {
      setCurrentTheme(systemScheme === "dark" ? "dark" : "light");
    } else {
      setCurrentTheme(theme === "dark" ? "dark" : "light");
    }
  };

  const toggleAuto = async (value: boolean) => {
    setAutoEnabled(value);
    await AsyncStorage.setItem(AUTO_THEME_KEY, String(value));
    if (value) {
      const sysTheme = systemScheme === "dark" ? "dark" : "light";
      setCurrentTheme(sysTheme);
      await AsyncStorage.setItem(THEME_KEY, sysTheme);
      Alert.alert("✅ Otomatik Tema Aktif", `Sistem temanız "${sysTheme === "dark" ? "Koyu" : "Açık"}" olarak algılandı.`);
    }
  };

  const setManualTheme = async (theme: "light" | "dark") => {
    setCurrentTheme(theme);
    await AsyncStorage.setItem(THEME_KEY, theme);
    if (autoEnabled) {
      setAutoEnabled(false);
      await AsyncStorage.setItem(AUTO_THEME_KEY, "false");
    }
    Alert.alert("✅ Tema Değiştirildi", `${theme === "dark" ? "🌙 Koyu" : "☀️ Açık"} mod aktif edildi.`);
  };

  return (
    <ScreenContainer>
      <BackButton title="🎨 Tema Ayarları" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: Math.max(insets.bottom + 24, 32) }}>

        {/* Mevcut durum */}
        <View style={{ backgroundColor: currentTheme === "dark" ? "#1a1a2e" : "#f0f4ff", borderRadius: 16, padding: 20, borderWidth: 2, borderColor: colors.primary, alignItems: "center", gap: 8 }}>
          <Text style={{ fontSize: 48 }}>{currentTheme === "dark" ? "🌙" : "☀️"}</Text>
          <Text style={{ fontSize: 18, fontWeight: "700", color: currentTheme === "dark" ? "#fff" : "#1a1a1a" }}>
            {currentTheme === "dark" ? "Koyu Mod Aktif" : "Açık Mod Aktif"}
          </Text>
          <Text style={{ color: currentTheme === "dark" ? "#aaa" : "#666", fontSize: 13 }}>
            {autoEnabled ? "Sistem temasına göre otomatik" : "Manuel seçim"}
          </Text>
        </View>

        {/* Otomatik tema */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 10 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>🔄 Otomatik Tema</Text>
              <Text style={{ color: colors.muted, fontSize: 13 }}>Telefon temanıza göre otomatik değişsin</Text>
              <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
                Sistem teması: {systemScheme === "dark" ? "🌙 Koyu" : "☀️ Açık"}
              </Text>
            </View>
            <Switch value={autoEnabled} onValueChange={toggleAuto} trackColor={{ false: colors.border, true: colors.primary }} />
          </View>
        </View>

        {/* Manuel seçim */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 12 }}>
          <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>Manuel Tema Seçimi</Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity onPress={() => setManualTheme("light")}
              style={{ flex: 1, backgroundColor: "#FFF9E5", borderRadius: 14, padding: 20, borderWidth: currentTheme === "light" && !autoEnabled ? 3 : 1, borderColor: currentTheme === "light" && !autoEnabled ? "#f59e0b" : colors.border, alignItems: "center", gap: 8 }}>
              <Text style={{ fontSize: 36 }}>☀️</Text>
              <Text style={{ fontWeight: "700", color: "#B8860B", fontSize: 15 }}>Açık Mod</Text>
              <Text style={{ color: "#B8860B", fontSize: 12, textAlign: "center" }}>Beyaz arka plan, koyu yazı</Text>
              {currentTheme === "light" && !autoEnabled && (
                <View style={{ backgroundColor: "#f59e0b", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 }}>
                  <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>✅ Aktif</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setManualTheme("dark")}
              style={{ flex: 1, backgroundColor: "#1a1a2e", borderRadius: 14, padding: 20, borderWidth: currentTheme === "dark" && !autoEnabled ? 3 : 1, borderColor: currentTheme === "dark" && !autoEnabled ? "#818cf8" : colors.border, alignItems: "center", gap: 8 }}>
              <Text style={{ fontSize: 36 }}>🌙</Text>
              <Text style={{ fontWeight: "700", color: "#818cf8", fontSize: 15 }}>Koyu Mod</Text>
              <Text style={{ color: "#818cf8", fontSize: 12, textAlign: "center" }}>Koyu arka plan, açık yazı</Text>
              {currentTheme === "dark" && !autoEnabled && (
                <View style={{ backgroundColor: "#818cf8", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 }}>
                  <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>✅ Aktif</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 20 }}>
            ℹ️ Tema değişikliği uygulamayı yeniden başlattığınızda tam olarak uygulanır. Otomatik mod açıkken telefon temanızı değiştirdiğinizde uygulama da güncellenir.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
