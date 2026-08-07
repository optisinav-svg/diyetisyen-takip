import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BackButton } from "@/components/back-button";

const HEALTH_RECORDS_KEY = "health_records";

interface HealthRecord {
  date: string;
  weight?: number;
  bloodSugar?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  bmi?: number;
  waterIntake?: number;
  caloriesBurned?: number;
}

export default function HealthScreen() {
  const router = useRouter();
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<"overview" | "water" | "calorie" | "vitals">("overview");
  const [records, setRecords] = useState<HealthRecord[]>([]);

  // Water tab
  const [waterAmount, setWaterAmount] = useState("");
  // Calorie tab
  const [caloriesBurned, setCaloriesBurned] = useState("");
  const [activityType, setActivityType] = useState("Yürüyüş");
  // Vitals tab
  const [weight, setWeight] = useState("");
  const [bloodSugar, setBloodSugar] = useState("");
  const [bpSys, setBpSys] = useState("");
  const [bpDia, setBpDia] = useState("");
  const [height, setHeight] = useState("");

  const ACTIVITIES = ["Yürüyüş", "Koşu", "Bisiklet", "Yüzme", "Yoga", "Pilates", "Ağırlık", "Diğer"];

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const saved = await AsyncStorage.getItem(HEALTH_RECORDS_KEY);
    if (saved) setRecords(JSON.parse(saved));
  };

  const saveRecord = async (data: Partial<HealthRecord>) => {
    const today = new Date().toISOString().split("T")[0];
    const existing = records.find(r => r.date === today);
    const updated = existing
      ? records.map(r => r.date === today ? { ...r, ...data } : r)
      : [...records, { date: today, ...data }];
    setRecords(updated);
    await AsyncStorage.setItem(HEALTH_RECORDS_KEY, JSON.stringify(updated));
  };

  const todayRecord = records.find(r => r.date === new Date().toISOString().split("T")[0]);

  // BMI hesapla
  const calcBMI = (weightKg: number, heightCm: number) => {
    const h = heightCm / 100;
    return (weightKg / (h * h)).toFixed(1);
  };

  const bmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Zayıf", color: "#3b82f6" };
    if (bmi < 25) return { label: "Normal", color: "#22c55e" };
    if (bmi < 30) return { label: "Fazla Kilolu", color: "#f97316" };
    return { label: "Obez", color: "#ef4444" };
  };

  const bmi = weight && height ? calcBMI(Number(weight), Number(height)) : null;
  const bmiInfo = bmi ? bmiCategory(Number(bmi)) : null;

  return (
    <ScreenContainer>
      <BackButton title="📈 Sağlık Verileri" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>

        {/* Tab Bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[
              { key: "overview", label: "📊 Özet" },
              { key: "water", label: "💧 Su İçme" },
              { key: "calorie", label: "🔥 Kalori Yakımı" },
              { key: "vitals", label: "🩺 Ölçümler" },
            ].map(tab => (
              <TouchableOpacity key={tab.key} onPress={() => setActiveTab(tab.key as any)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20,
                  backgroundColor: activeTab === tab.key ? colors.primary : colors.surface,
                  borderWidth: 1, borderColor: activeTab === tab.key ? colors.primary : colors.border,
                }}>
                <Text style={{ color: activeTab === tab.key ? "#fff" : colors.foreground, fontWeight: "600", fontSize: 13 }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* ÖZET */}
        {activeTab === "overview" && (
          <>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {[
                { icon: "💧", label: "Su", value: todayRecord?.waterIntake ? `${todayRecord.waterIntake} ml` : "—", color: "#3b82f6", tab: "water" },
                { icon: "🔥", label: "Kalori Yakımı", value: todayRecord?.caloriesBurned ? `${todayRecord.caloriesBurned} kcal` : "—", color: "#f97316", tab: "calorie" },
                { icon: "⚖️", label: "Kilo", value: todayRecord?.weight ? `${todayRecord.weight} kg` : "—", color: "#22c55e", tab: "vitals" },
                { icon: "🩸", label: "Kan Şekeri", value: todayRecord?.bloodSugar ? `${todayRecord.bloodSugar} mg/dL` : "—", color: "#ef4444", tab: "vitals" },
                { icon: "💓", label: "Tansiyon", value: todayRecord?.bloodPressureSystolic ? `${todayRecord.bloodPressureSystolic}/${todayRecord.bloodPressureDiastolic}` : "—", color: "#8b5cf6", tab: "vitals" },
                { icon: "📏", label: "BMI", value: todayRecord?.bmi ? `${todayRecord.bmi}` : "—", color: "#f59e0b", tab: "vitals" },
              ].map(card => (
                <TouchableOpacity key={card.label} onPress={() => setActiveTab(card.tab as any)}
                  style={{
                    width: "47%", backgroundColor: colors.surface, borderRadius: 12, padding: 14,
                    borderWidth: 1, borderColor: colors.border, gap: 4,
                  }}>
                  <Text style={{ fontSize: 24 }}>{card.icon}</Text>
                  <Text style={{ fontSize: 18, fontWeight: "bold", color: card.color }}>{card.value}</Text>
                  <Text style={{ fontSize: 12, color: colors.muted }}>{card.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={() => router.push("/wearable-sync")}
              style={{ paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary }}>
              <Text style={{ color: colors.primary, fontWeight: "700" }}>⌚ Akıllı Saat Bağla / Senkronize Et</Text>
            </TouchableOpacity>
          </>
        )}

        {/* SU İÇME */}
        {activeTab === "water" && (
          <>
            <View style={{ backgroundColor: "#3b82f620", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#3b82f6", gap: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#3b82f6" }}>💧 Su Tüketimi</Text>
              <Text style={{ color: colors.foreground }}>
                Bugün: <Text style={{ fontWeight: "700", fontSize: 18 }}>{todayRecord?.waterIntake ?? 0} ml</Text>
              </Text>
              <View style={{ height: 10, backgroundColor: colors.border, borderRadius: 5 }}>
                <View style={{ height: 10, backgroundColor: "#3b82f6", borderRadius: 5, width: `${Math.min(((todayRecord?.waterIntake ?? 0) / 2000) * 100, 100)}%` }} />
              </View>
              <Text style={{ color: colors.muted, fontSize: 12 }}>Hedef: 2000 ml</Text>
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {[150, 200, 250, 300, 500].map(ml => (
                <TouchableOpacity key={ml} onPress={async () => {
                  const current = todayRecord?.waterIntake ?? 0;
                  await saveRecord({ waterIntake: current + ml });
                  Alert.alert("Eklendi", `${ml} ml su eklendi!`);
                }}
                  style={{ paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: "#3b82f620", borderWidth: 2, borderColor: "#3b82f6" }}>
                  <Text style={{ color: "#3b82f6", fontWeight: "700" }}>{ml} ml</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ gap: 6 }}>
              <Text style={{ fontWeight: "600", color: colors.foreground }}>Manuel Giriş</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TextInput value={waterAmount} onChangeText={setWaterAmount}
                  placeholder="ml cinsinden" keyboardType="numeric" placeholderTextColor={colors.muted}
                  style={{ flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.foreground, backgroundColor: colors.surface }} />
                <TouchableOpacity onPress={async () => {
                  if (!waterAmount) return;
                  const current = todayRecord?.waterIntake ?? 0;
                  await saveRecord({ waterIntake: current + Number(waterAmount) });
                  setWaterAmount("");
                  Alert.alert("Eklendi!");
                }}
                  style={{ paddingHorizontal: 16, borderRadius: 10, backgroundColor: "#3b82f6", justifyContent: "center" }}>
                  <Text style={{ color: "#fff", fontWeight: "700" }}>Ekle</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* KALORİ YAKIMI */}
        {activeTab === "calorie" && (
          <>
            <View style={{ backgroundColor: "#f9731620", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#f97316", gap: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#f97316" }}>🔥 Kalori Yakımı</Text>
              <Text style={{ color: colors.foreground }}>
                Bugün: <Text style={{ fontWeight: "700", fontSize: 18 }}>{todayRecord?.caloriesBurned ?? 0} kcal</Text>
              </Text>
            </View>

            <View style={{ gap: 6 }}>
              <Text style={{ fontWeight: "600", color: colors.foreground }}>Aktivite Türü</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {ACTIVITIES.map(a => (
                    <TouchableOpacity key={a} onPress={() => setActivityType(a)}
                      style={{
                        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                        backgroundColor: activityType === a ? "#f97316" : colors.surface,
                        borderWidth: 1, borderColor: activityType === a ? "#f97316" : colors.border,
                      }}>
                      <Text style={{ color: activityType === a ? "#fff" : colors.foreground, fontWeight: "600", fontSize: 13 }}>{a}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={{ gap: 6 }}>
              <Text style={{ fontWeight: "600", color: colors.foreground }}>Yakılan Kalori (kcal)</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TextInput value={caloriesBurned} onChangeText={setCaloriesBurned}
                  placeholder="kcal" keyboardType="numeric" placeholderTextColor={colors.muted}
                  style={{ flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.foreground, backgroundColor: colors.surface }} />
                <TouchableOpacity onPress={async () => {
                  if (!caloriesBurned) return;
                  const current = todayRecord?.caloriesBurned ?? 0;
                  await saveRecord({ caloriesBurned: current + Number(caloriesBurned) });
                  setCaloriesBurned("");
                  Alert.alert("Kaydedildi!", `${activityType} aktivitesi kaydedildi.`);
                }}
                  style={{ paddingHorizontal: 16, borderRadius: 10, backgroundColor: "#f97316", justifyContent: "center" }}>
                  <Text style={{ color: "#fff", fontWeight: "700" }}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* ÖLÇÜMLER (Kilo, Kan, BMI, Tansiyon) */}
        {activeTab === "vitals" && (
          <>
            <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>📏 BMI Hesaplama</Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={{ fontSize: 13, color: colors.muted }}>Boy (cm)</Text>
                  <TextInput value={height} onChangeText={setHeight} placeholder="165" keyboardType="numeric"
                    placeholderTextColor={colors.muted}
                    style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, color: colors.foreground, backgroundColor: colors.background }} />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={{ fontSize: 13, color: colors.muted }}>Kilo (kg)</Text>
                  <TextInput value={weight} onChangeText={setWeight} placeholder="70" keyboardType="numeric"
                    placeholderTextColor={colors.muted}
                    style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, color: colors.foreground, backgroundColor: colors.background }} />
                </View>
              </View>
              {bmi && bmiInfo && (
                <View style={{ backgroundColor: bmiInfo.color + "20", borderRadius: 10, padding: 12, borderWidth: 1, borderColor: bmiInfo.color }}>
                  <Text style={{ fontSize: 24, fontWeight: "bold", color: bmiInfo.color }}>BMI: {bmi}</Text>
                  <Text style={{ color: bmiInfo.color, fontWeight: "600" }}>{bmiInfo.label}</Text>
                </View>
              )}
            </View>

            {[
              { label: "Kan Şekeri (mg/dL)", value: bloodSugar, set: setBpSys, icon: "🩸", color: "#ef4444", field: "bloodSugar", placeholder: "örn: 95" },
              { label: "Sistolik Tansiyon (mmHg)", value: bpSys, set: setBpSys, icon: "💓", color: "#8b5cf6", field: "bpSys", placeholder: "örn: 120" },
              { label: "Diyastolik Tansiyon (mmHg)", value: bpDia, set: setBpDia, icon: "💓", color: "#8b5cf6", field: "bpDia", placeholder: "örn: 80" },
            ].map(f => (
              <View key={f.label} style={{ gap: 6 }}>
                <Text style={{ fontWeight: "600", color: colors.foreground }}>{f.icon} {f.label}</Text>
                <TextInput value={f.field === "bloodSugar" ? bloodSugar : f.field === "bpSys" ? bpSys : bpDia}
                  onChangeText={f.field === "bloodSugar" ? setBloodSugar : f.field === "bpSys" ? setBpSys : setBpDia}
                  placeholder={f.placeholder} keyboardType="numeric" placeholderTextColor={colors.muted}
                  style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.foreground, backgroundColor: colors.surface }} />
              </View>
            ))}

            <TouchableOpacity onPress={async () => {
              const bmiVal = weight && height ? Number(calcBMI(Number(weight), Number(height))) : undefined;
              await saveRecord({
                weight: weight ? Number(weight) : undefined,
                bloodSugar: bloodSugar ? Number(bloodSugar) : undefined,
                bloodPressureSystolic: bpSys ? Number(bpSys) : undefined,
                bloodPressureDiastolic: bpDia ? Number(bpDia) : undefined,
                bmi: bmiVal,
              });
              Alert.alert("Kaydedildi", "Sağlık ölçümleri güncellendi.");
            }}
              style={{ paddingVertical: 16, borderRadius: 12, alignItems: "center", backgroundColor: colors.primary }}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>💾 Kaydet</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

function calcBMI(weightKg: number, heightCm: number): string {
  const h = heightCm / 100;
  return (weightKg / (h * h)).toFixed(1);
}
