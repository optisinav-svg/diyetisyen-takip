import { ScrollView, Text, View, TouchableOpacity, TextInput, Switch, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { BackButton } from "@/components/back-button";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";

const SETTINGS_KEY = "water_reminder_settings_v2";
const WATER_KEY = "water_today_v2";

interface Settings {
  enabled: boolean;
  startHour: number;
  endHour: number;
  intervalMinutes: number;
  dailyGoal: number;
  glassSize: number;
}

const DEFAULT_SETTINGS: Settings = {
  enabled: false,
  startHour: 8,
  endHour: 22,
  intervalMinutes: 60,
  dailyGoal: 2000,
  glassSize: 250,
};

async function requestPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

async function scheduleWaterReminders(settings: Settings) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!settings.enabled) return;

  const now = new Date();
  const startHour = settings.startHour;
  const endHour = settings.endHour;
  const interval = settings.intervalMinutes;

  let scheduled = 0;
  for (let hour = startHour; hour < endHour; hour += interval / 60) {
    const intHour = Math.floor(hour);
    const intMin = Math.round((hour - intHour) * 60);
    const trigger = new Date();
    trigger.setHours(intHour, intMin, 0, 0);
    if (trigger <= now) trigger.setDate(trigger.getDate() + 1);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "💧 Su İçme Zamanı!",
        body: `${settings.glassSize}ml su içmeyi unutmayın. Günlük hedefiniz: ${settings.dailyGoal}ml`,
        sound: true,
      },
      trigger: {
        hour: intHour,
        minute: intMin,
        repeats: true,
      } as any,
    });
    scheduled++;
    if (scheduled >= 10) break;
  }
  return scheduled;
}

export default function WaterReminderScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [waterToday, setWaterToday] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const saved = await AsyncStorage.getItem(SETTINGS_KEY);
    if (saved) setSettings(JSON.parse(saved));
    const today = new Date().toISOString().split("T")[0];
    const water = await AsyncStorage.getItem(`${WATER_KEY}_${today}`);
    if (water) setWaterToday(Number(water));
    const { status } = await Notifications.getPermissionsAsync();
    setHasPermission(status === "granted");
  };

  const saveSettings = async (newSettings: Settings) => {
    setSettings(newSettings);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  };

  const toggleReminder = async (value: boolean) => {
    if (value && !hasPermission) {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert("İzin Gerekli", "Bildirim göndermek için izin vermeniz gerekiyor. Ayarlar > Bildirimler > Diyetisyen Takip");
        return;
      }
      setHasPermission(true);
    }
    const newSettings = { ...settings, enabled: value };
    await saveSettings(newSettings);
    if (value) {
      const count = await scheduleWaterReminders(newSettings);
      Alert.alert("✅ Hatırlatıcı Aktif", `${settings.startHour}:00 - ${settings.endHour}:00 arasında her ${settings.intervalMinutes} dakikada bir bildirim gelecek.`);
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
      Alert.alert("🔕 Hatırlatıcı Kapatıldı");
    }
  };

  const addWater = async (ml: number) => {
    const today = new Date().toISOString().split("T")[0];
    const newTotal = waterToday + ml;
    setWaterToday(newTotal);
    await AsyncStorage.setItem(`${WATER_KEY}_${today}`, String(newTotal));
    if (newTotal >= settings.dailyGoal && waterToday < settings.dailyGoal) {
      Alert.alert("🎉 Tebrikler!", "Günlük su hedefinizi tamamladınız!");
    }
  };

  const waterPct = Math.min((waterToday / settings.dailyGoal) * 100, 100);
  const glassCount = Math.floor(waterToday / settings.glassSize);
  const totalGlasses = Math.ceil(settings.dailyGoal / settings.glassSize);

  const INTERVALS = [
    { v: 30, l: "30 dk" },
    { v: 45, l: "45 dk" },
    { v: 60, l: "1 saat" },
    { v: 90, l: "1.5 saat" },
    { v: 120, l: "2 saat" },
  ];

  return (
    <ScreenContainer>
      <BackButton title="💧 Su Hatırlatıcı" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: Math.max(insets.bottom + 24, 32) }}>

        {/* Bugünkü durum */}
        <View style={{ backgroundColor: "#3b82f620", borderRadius: 16, padding: 20, borderWidth: 2, borderColor: "#3b82f6", alignItems: "center", gap: 12 }}>
          <Text style={{ fontSize: 48 }}>💧</Text>
          <Text style={{ fontSize: 36, fontWeight: "bold", color: "#3b82f6" }}>{waterToday} ml</Text>
          <Text style={{ color: colors.muted }}>/ {settings.dailyGoal} ml günlük hedef</Text>
          <View style={{ width: "100%", height: 12, backgroundColor: colors.border, borderRadius: 6 }}>
            <View style={{ height: 12, backgroundColor: waterPct >= 100 ? "#22c55e" : "#3b82f6", borderRadius: 6, width: `${waterPct}%` }} />
          </View>
          <Text style={{ color: waterPct >= 100 ? "#22c55e" : "#3b82f6", fontWeight: "700" }}>
            {waterPct >= 100 ? "✅ Hedef Tamamlandı!" : `${(settings.dailyGoal - waterToday)} ml kaldı`}
          </Text>
        </View>

        {/* Bardak görseli */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 10 }}>
          <Text style={{ fontWeight: "700", color: colors.foreground }}>💧 Hızlı Su Ekle</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {[150, 200, 250, 300, 350, 500].map(ml => (
              <TouchableOpacity key={ml} onPress={() => addWater(ml)}
                style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: "#3b82f620", borderWidth: 1, borderColor: "#3b82f6", flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Text style={{ fontSize: 16 }}>💧</Text>
                <Text style={{ color: "#3b82f6", fontWeight: "700" }}>+{ml}ml</Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Bardak sayısı görseli */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {Array.from({ length: totalGlasses }, (_, i) => (
              <Text key={i} style={{ fontSize: 24, opacity: i < glassCount ? 1 : 0.2 }}>🥤</Text>
            ))}
          </View>
          <Text style={{ color: colors.muted, fontSize: 12 }}>{glassCount}/{totalGlasses} bardak ({settings.glassSize}ml)</Text>
        </View>

        {/* Hatırlatıcı ayarları */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 14 }}>
          <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>🔔 Hatırlatıcı Ayarları</Text>

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={{ color: colors.foreground, fontWeight: "600" }}>Su Hatırlatıcısı</Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>{settings.enabled ? "✅ Aktif" : "❌ Pasif"}</Text>
            </View>
            <Switch value={settings.enabled} onValueChange={toggleReminder} trackColor={{ false: colors.border, true: "#3b82f6" }} />
          </View>

          {/* Aralık */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: "600", color: colors.foreground }}>⏱ Hatırlatma Aralığı</Text>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              {INTERVALS.map(i => (
                <TouchableOpacity key={i.v} onPress={() => saveSettings({ ...settings, intervalMinutes: i.v })}
                  style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: settings.intervalMinutes === i.v ? "#3b82f6" : colors.surface, borderWidth: 1, borderColor: settings.intervalMinutes === i.v ? "#3b82f6" : colors.border }}>
                  <Text style={{ color: settings.intervalMinutes === i.v ? "#fff" : colors.foreground, fontWeight: "600", fontSize: 13 }}>{i.l}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Saat aralığı */}
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ fontWeight: "600", color: colors.foreground }}>🌅 Başlangıç</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
                {[6, 7, 8, 9, 10].map(h => (
                  <TouchableOpacity key={h} onPress={() => saveSettings({ ...settings, startHour: h })}
                    style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: settings.startHour === h ? "#3b82f6" : colors.surface, borderWidth: 1, borderColor: settings.startHour === h ? "#3b82f6" : colors.border }}>
                    <Text style={{ color: settings.startHour === h ? "#fff" : colors.foreground, fontSize: 12, fontWeight: "600" }}>{h}:00</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ fontWeight: "600", color: colors.foreground }}>🌙 Bitiş</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
                {[20, 21, 22, 23].map(h => (
                  <TouchableOpacity key={h} onPress={() => saveSettings({ ...settings, endHour: h })}
                    style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: settings.endHour === h ? "#3b82f6" : colors.surface, borderWidth: 1, borderColor: settings.endHour === h ? "#3b82f6" : colors.border }}>
                    <Text style={{ color: settings.endHour === h ? "#fff" : colors.foreground, fontSize: 12, fontWeight: "600" }}>{h}:00</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Günlük hedef */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: "600", color: colors.foreground }}>🎯 Günlük Hedef (ml)</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {[1500, 2000, 2500, 3000].map(ml => (
                <TouchableOpacity key={ml} onPress={() => saveSettings({ ...settings, dailyGoal: ml })}
                  style={{ flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center", backgroundColor: settings.dailyGoal === ml ? "#3b82f6" : colors.surface, borderWidth: 1, borderColor: settings.dailyGoal === ml ? "#3b82f6" : colors.border }}>
                  <Text style={{ color: settings.dailyGoal === ml ? "#fff" : colors.foreground, fontWeight: "600", fontSize: 12 }}>{ml}ml</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {settings.enabled && (
            <View style={{ backgroundColor: "#22c55e20", borderRadius: 10, padding: 10, borderWidth: 1, borderColor: "#22c55e" }}>
              <Text style={{ color: "#22c55e", fontSize: 13 }}>
                ✅ Her gün {settings.startHour}:00 - {settings.endHour}:00 arasında {settings.intervalMinutes} dakikada bir bildirim gelecek.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
