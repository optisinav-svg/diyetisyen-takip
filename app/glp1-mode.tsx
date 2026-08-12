import { ScrollView, Text, View, TouchableOpacity, TextInput, Switch, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { BackButton } from "@/components/back-button";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const GLP1_KEY = "glp1_settings_v2";

interface GLP1Settings {
  enabled: boolean;
  medication: string;
  dose: string;
  injectionDay: string;
  startDate: string;
  calorieGoal: number;
  proteinGoal: number;
  mealFrequency: number;
  nauseaAlert: boolean;
  hydrationAlert: boolean;
  notes: string;
}

const MEDICATIONS = ["Ozempic (Semaglutide)", "Wegovy (Semaglutide)", "Mounjaro (Tirzepatide)", "Saxenda (Liraglutide)", "Victoza (Liraglutide)", "Trulicity (Dulaglutide)", "Diğer"];
const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
const DOSES = ["0.25mg", "0.5mg", "1mg", "1.7mg", "2.4mg", "2.5mg", "5mg", "7.5mg", "10mg", "15mg"];

export default function GLP1ModeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState<GLP1Settings>({
    enabled: false, medication: "", dose: "", injectionDay: "Pazartesi",
    startDate: "", calorieGoal: 1200, proteinGoal: 100, mealFrequency: 4,
    nauseaAlert: true, hydrationAlert: true, notes: ""
  });

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    const saved = await AsyncStorage.getItem(GLP1_KEY);
    if (saved) setSettings(JSON.parse(saved));
  };

  const save = async (newSettings: GLP1Settings) => {
    setSettings(newSettings);
    await AsyncStorage.setItem(GLP1_KEY, JSON.stringify(newSettings));
  };

  const toggleMode = (value: boolean) => {
    if (value) {
      Alert.alert("⚠️ GLP-1 Modu", "Bu mod GLP-1 ilaçları kullanan hastalar için optimize edilmiş beslenme hedefleri sunar. Diyetisyeninizin gözetiminde kullanın.", [
        { text: "İptal", style: "cancel" },
        { text: "Aktif Et", onPress: () => save({ ...settings, enabled: true }) }
      ]);
    } else {
      save({ ...settings, enabled: false });
    }
  };

  return (
    <ScreenContainer>
      <BackButton title="💉 GLP-1 / Ozempic Modu" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: Math.max(insets.bottom + 24, 32) }}>

        {/* Bilgilendirme */}
        <View style={{ backgroundColor: "#8b5cf620", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#8b5cf6" }}>
          <Text style={{ color: "#8b5cf6", fontWeight: "700", fontSize: 15, marginBottom: 4 }}>💉 GLP-1 Receptor Agonist Modu</Text>
          <Text style={{ color: colors.foreground, fontSize: 13, lineHeight: 20 }}>
            Ozempic, Wegovy, Mounjaro gibi GLP-1 ilaçları kullananlar için özel olarak optimize edilmiş beslenme takibi. Protein öncelikli düşük kalorili diyet planı.
          </Text>
        </View>

        {/* Ana anahtar */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: settings.enabled ? "#8b5cf6" : colors.border }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>GLP-1 Modu</Text>
              <Text style={{ color: colors.muted, fontSize: 13 }}>{settings.enabled ? "✅ Aktif" : "❌ Pasif"}</Text>
            </View>
            <Switch value={settings.enabled} onValueChange={toggleMode} trackColor={{ false: colors.border, true: "#8b5cf6" }} />
          </View>
        </View>

        {settings.enabled && (<>
          {/* İlaç bilgileri */}
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 12 }}>
            <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>💊 İlaç Bilgileri</Text>

            <View style={{ gap: 6 }}>
              <Text style={{ fontWeight: "600", color: colors.foreground }}>İlaç Adı</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {MEDICATIONS.map(m => (
                    <TouchableOpacity key={m} onPress={() => save({ ...settings, medication: m })}
                      style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: settings.medication === m ? "#8b5cf6" : colors.surface, borderWidth: 1, borderColor: settings.medication === m ? "#8b5cf6" : colors.border }}>
                      <Text style={{ color: settings.medication === m ? "#fff" : colors.foreground, fontWeight: "600", fontSize: 12 }}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontWeight: "600", color: colors.foreground }}>Doz</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    {DOSES.map(d => (
                      <TouchableOpacity key={d} onPress={() => save({ ...settings, dose: d })}
                        style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: settings.dose === d ? "#8b5cf6" : colors.surface, borderWidth: 1, borderColor: settings.dose === d ? "#8b5cf6" : colors.border }}>
                        <Text style={{ color: settings.dose === d ? "#fff" : colors.foreground, fontSize: 12, fontWeight: "600" }}>{d}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>

            <View style={{ gap: 6 }}>
              <Text style={{ fontWeight: "600", color: colors.foreground }}>💉 Enjeksiyon Günü</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {DAYS.map(d => (
                    <TouchableOpacity key={d} onPress={() => save({ ...settings, injectionDay: d })}
                      style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: settings.injectionDay === d ? "#8b5cf6" : colors.surface, borderWidth: 1, borderColor: settings.injectionDay === d ? "#8b5cf6" : colors.border }}>
                      <Text style={{ color: settings.injectionDay === d ? "#fff" : colors.foreground, fontWeight: "600", fontSize: 12 }}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={{ gap: 4 }}>
              <Text style={{ fontWeight: "600", color: colors.foreground }}>📅 Başlangıç Tarihi</Text>
              <TextInput value={settings.startDate} onChangeText={v => save({ ...settings, startDate: v })}
                placeholder="2026-01-01" placeholderTextColor={colors.muted}
                style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.foreground, backgroundColor: colors.background }} />
            </View>
          </View>

          {/* Beslenme hedefleri */}
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 12 }}>
            <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>🥗 Optimize Beslenme Hedefleri</Text>
            <View style={{ backgroundColor: "#8b5cf620", borderRadius: 8, padding: 10 }}>
              <Text style={{ color: "#8b5cf6", fontSize: 12, lineHeight: 18 }}>
                GLP-1 kullanımında önerilen: Düşük kalori (1000-1500 kcal), yüksek protein (vücut ağırlığı × 1.2-1.5g), küçük ve sık öğünler, bol su.
              </Text>
            </View>

            {[
              { label: "🔥 Günlük Kalori (kcal)", key: "calorieGoal", options: [800, 1000, 1200, 1400, 1600] },
              { label: "🥩 Protein Hedefi (gram)", key: "proteinGoal", options: [80, 100, 120, 140, 160] },
              { label: "🍽️ Öğün Sayısı", key: "mealFrequency", options: [3, 4, 5, 6] },
            ].map(item => (
              <View key={item.key} style={{ gap: 6 }}>
                <Text style={{ fontWeight: "600", color: colors.foreground }}>{item.label}</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {item.options.map(opt => (
                    <TouchableOpacity key={opt} onPress={() => save({ ...settings, [item.key]: opt })}
                      style={{ flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center", backgroundColor: settings[item.key as keyof GLP1Settings] === opt ? "#8b5cf6" : colors.surface, borderWidth: 1, borderColor: settings[item.key as keyof GLP1Settings] === opt ? "#8b5cf6" : colors.border }}>
                      <Text style={{ color: settings[item.key as keyof GLP1Settings] === opt ? "#fff" : colors.foreground, fontWeight: "600", fontSize: 12 }}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>

          {/* Uyarılar */}
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 10 }}>
            <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>🔔 Uyarılar</Text>
            {[
              { key: "nauseaAlert", label: "🤢 Bulantı Takibi", desc: "Enjeksiyon sonrası bulantı hatırlatması" },
              { key: "hydrationAlert", label: "💧 Hidrasyon Uyarısı", desc: "GLP-1 kullanımında dehidrasyon riskini azalt" },
            ].map(item => (
              <View key={item.key} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.foreground, fontWeight: "600" }}>{item.label}</Text>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>{item.desc}</Text>
                </View>
                <Switch value={settings[item.key as keyof GLP1Settings] as boolean}
                  onValueChange={v => save({ ...settings, [item.key]: v })}
                  trackColor={{ false: colors.border, true: "#8b5cf6" }} />
              </View>
            ))}
          </View>

          {/* Notlar */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: "600", color: colors.foreground }}>📝 Diyetisyen Notu</Text>
            <TextInput value={settings.notes} onChangeText={v => save({ ...settings, notes: v })}
              placeholder="Ek notlar, yan etkiler, gözlemler..." multiline placeholderTextColor={colors.muted}
              style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.foreground, backgroundColor: colors.surface, minHeight: 80, textAlignVertical: "top" }} />
          </View>

          {/* Enjeksiyon takvimi */}
          {settings.injectionDay && settings.startDate && (
            <View style={{ backgroundColor: "#8b5cf620", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#8b5cf6", gap: 6 }}>
              <Text style={{ fontWeight: "700", color: "#8b5cf6" }}>📅 Enjeksiyon Takvimi</Text>
              <Text style={{ color: colors.foreground, fontSize: 13 }}>Her <Text style={{ fontWeight: "700" }}>{settings.injectionDay}</Text> günü enjeksiyon</Text>
              {settings.medication && <Text style={{ color: colors.foreground, fontSize: 13 }}>💊 {settings.medication} {settings.dose}</Text>}
              <Text style={{ color: colors.muted, fontSize: 12 }}>Başlangıç: {settings.startDate}</Text>
            </View>
          )}
        </>)}

        {!settings.enabled && (
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 8 }}>
            <Text style={{ fontWeight: "700", color: colors.foreground }}>Bu mod ne işe yarar?</Text>
            {["✅ Protein öncelikli beslenme hedefleri", "✅ Düşük kalori, yüksek doygunluk stratejisi", "✅ Enjeksiyon günü takibi", "✅ Bulantı ve hidrasyon uyarıları", "✅ GLP-1 yan etki yönetimi için öğün önerileri"].map(item => (
              <Text key={item} style={{ color: colors.foreground, fontSize: 13 }}>{item}</Text>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
