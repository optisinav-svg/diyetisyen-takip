import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, Modal, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { BackButton } from "@/components/back-button";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserRegistration } from "@/lib/_core/user-registration";
import DateTimePicker from "@react-native-community/datetimepicker";

const ANALYTICS_GOALS_KEY = "analytics_goals";
const ANALYTICS_PROGRESS_KEY = "analytics_progress";

interface Goal {
  id: string;
  clientId: string;
  clientName: string;
  type: string;
  label: string;
  unit: string;
  target: number;
  icon: string;
  startDate: string;
  endDate: string;
  repeatsDaily: boolean;
}

interface ProgressEntry {
  goalId: string;
  date: string;
  value: number;
  completed: boolean;
}

const GOAL_TYPES = [
  { type: "protein", label: "Protein", unit: "gram", icon: "🥩", repeatsDaily: false },
  { type: "water", label: "Su", unit: "ml", icon: "💧", repeatsDaily: true },
  { type: "steps", label: "Adım", unit: "adım", icon: "👟", repeatsDaily: true },
  { type: "sleep", label: "Uyku", unit: "saat", icon: "😴", repeatsDaily: false },
  { type: "weight", label: "Kilo", unit: "kg", icon: "⚖️", repeatsDaily: false },
  { type: "calories", label: "Kalori", unit: "kcal", icon: "🔥", repeatsDaily: false },
];

const SAMPLE_CLIENTS = [
  { id: "1", name: "Ayşe Yılmaz" },
  { id: "2", name: "Mehmet Demir" },
  { id: "3", name: "Fatma Kaya" },
];

const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function displayDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function AdvancedAnalytics() {
  const colors = useColors();
  const [role, setRole] = useState<"dietitian" | "client">("client");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [selectedClient, setSelectedClient] = useState(SAMPLE_CLIENTS[0]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"goals" | "progress">("goals");

  // Form state
  const [selectedType, setSelectedType] = useState(GOAL_TYPES[0]);
  const [targetValue, setTargetValue] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 86400000));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Progress state
  const [progressValues, setProgressValues] = useState<Record<string, string>>({});

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const user = await getUserRegistration();
    setRole(user?.role ?? "client");
    const savedGoals = await AsyncStorage.getItem(ANALYTICS_GOALS_KEY);
    if (savedGoals) setGoals(JSON.parse(savedGoals));
    const savedProgress = await AsyncStorage.getItem(ANALYTICS_PROGRESS_KEY);
    if (savedProgress) setProgress(JSON.parse(savedProgress));
  };

  const saveGoals = async (list: Goal[]) => {
    setGoals(list);
    await AsyncStorage.setItem(ANALYTICS_GOALS_KEY, JSON.stringify(list));
  };

  const saveProgress = async (list: ProgressEntry[]) => {
    setProgress(list);
    await AsyncStorage.setItem(ANALYTICS_PROGRESS_KEY, JSON.stringify(list));
  };

  const addGoal = async () => {
    if (!targetValue || isNaN(Number(targetValue))) {
      Alert.alert("Hata", "Geçerli hedef değeri girin");
      return;
    }
    const goal: Goal = {
      id: Date.now().toString(),
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      ...selectedType,
      target: Number(targetValue),
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      repeatsDaily: selectedType.repeatsDaily,
    };
    await saveGoals([...goals, goal]);
    setTargetValue(""); setShowForm(false);
    Alert.alert("Hedef Eklendi", `${selectedClient.name} için ${selectedType.label} hedefi oluşturuldu.`);
  };

  const logProgress = async (goalId: string, completed = false) => {
    const val = progressValues[goalId];
    const today = formatDate(new Date());
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const entry: ProgressEntry = {
      goalId,
      date: today,
      value: Number(val) || goal.target,
      completed: completed || Number(val) >= goal.target,
    };
    const updated = [...progress.filter(p => !(p.goalId === goalId && p.date === today)), entry];
    await saveProgress(updated);
    setProgressValues(prev => ({ ...prev, [goalId]: "" }));
    Alert.alert(entry.completed ? "✅ Tamamlandı!" : "Kaydedildi", `${goal.label} kaydedildi.`);
  };

  const deleteGoal = async (id: string) => {
    Alert.alert("Sil", "Bu hedefi silmek istiyor musunuz?", [
      { text: "İptal", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: () => saveGoals(goals.filter(g => g.id !== id)) },
    ]);
  };

  const todayProgress = (goalId: string) => {
    const today = formatDate(new Date());
    return progress.find(p => p.goalId === goalId && p.date === today);
  };

  const clientGoals = goals.filter(g => g.clientId === selectedClient.id);

  return (
    <ScreenContainer>
      <BackButton title="📊 Hedef & İlerleme" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>

        {/* Tabs */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          {(["goals", "progress"] as const).map(tab => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}
              style={{
                flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center",
                backgroundColor: activeTab === tab ? colors.primary : colors.surface,
                borderWidth: 1, borderColor: activeTab === tab ? colors.primary : colors.border,
              }}>
              <Text style={{ color: activeTab === tab ? "#fff" : colors.foreground, fontWeight: "600" }}>
                {tab === "goals" ? "🎯 Hedefler" : "📈 İlerleme"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Diyetisyen: danışan seçimi */}
        {role === "dietitian" && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {SAMPLE_CLIENTS.map(c => (
                <TouchableOpacity key={c.id} onPress={() => setSelectedClient(c)}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                    backgroundColor: selectedClient.id === c.id ? colors.primary : colors.surface,
                    borderWidth: 1, borderColor: selectedClient.id === c.id ? colors.primary : colors.border,
                  }}>
                  <Text style={{ color: selectedClient.id === c.id ? "#fff" : colors.foreground, fontWeight: "600" }}>
                    👤 {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}

        {/* HEDEFLER */}
        {activeTab === "goals" && (
          <>
            {role === "dietitian" && (
              <TouchableOpacity onPress={() => setShowForm(!showForm)}
                style={{ paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: colors.primary }}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>+ Hedef Ekle</Text>
              </TouchableOpacity>
            )}

            {showForm && role === "dietitian" && (
              <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, gap: 14, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>
                  {selectedClient.name} için Hedef
                </Text>

                {/* Hedef Tipi */}
                <View style={{ gap: 8 }}>
                  <Text style={{ fontWeight: "600", color: colors.foreground }}>Hedef Türü</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {GOAL_TYPES.map(gt => (
                      <TouchableOpacity key={gt.type} onPress={() => setSelectedType(gt)}
                        style={{
                          paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16,
                          backgroundColor: selectedType.type === gt.type ? colors.primary : colors.surface,
                          borderWidth: 1, borderColor: selectedType.type === gt.type ? colors.primary : colors.border,
                        }}>
                        <Text style={{ color: selectedType.type === gt.type ? "#fff" : colors.foreground, fontWeight: "600" }}>
                          {gt.icon} {gt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {selectedType.repeatsDaily && (
                    <View style={{ backgroundColor: "#22c55e20", borderRadius: 8, padding: 8, borderWidth: 1, borderColor: "#22c55e" }}>
                      <Text style={{ color: "#22c55e", fontSize: 12 }}>🔄 Bu hedef her gün tekrarlanır</Text>
                    </View>
                  )}
                </View>

                {/* Hedef Değeri - birim otomatik gelir */}
                <View style={{ gap: 6 }}>
                  <Text style={{ fontWeight: "600", color: colors.foreground }}>
                    Hedef: {selectedType.icon} {selectedType.label} ({selectedType.unit})
                  </Text>
                  <TextInput
                    value={targetValue}
                    onChangeText={setTargetValue}
                    placeholder={`${selectedType.label} hedefi (${selectedType.unit})`}
                    keyboardType="numeric"
                    placeholderTextColor={colors.muted}
                    style={{
                      borderWidth: 1, borderColor: colors.border, borderRadius: 10,
                      padding: 12, color: colors.foreground, backgroundColor: colors.background, fontSize: 14,
                    }}
                  />
                  {targetValue && (
                    <Text style={{ color: colors.primary, fontSize: 13 }}>
                      → {targetValue} {selectedType.unit} {selectedType.label} hedefi
                    </Text>
                  )}
                </View>

                {/* Takvim - Başlangıç */}
                <View style={{ gap: 6 }}>
                  <Text style={{ fontWeight: "600", color: colors.foreground }}>📅 Başlangıç Tarihi</Text>
                  <TouchableOpacity onPress={() => setShowStartPicker(true)}
                    style={{
                      borderWidth: 1, borderColor: colors.primary, borderRadius: 10,
                      padding: 12, backgroundColor: colors.surface, flexDirection: "row", alignItems: "center", gap: 8,
                    }}>
                    <Text style={{ fontSize: 18 }}>📅</Text>
                    <Text style={{ color: colors.foreground, fontWeight: "600" }}>{displayDate(formatDate(startDate))}</Text>
                  </TouchableOpacity>
                  {showStartPicker && (
                    <DateTimePicker
                      value={startDate}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={(_, date) => { setShowStartPicker(false); if (date) setStartDate(date); }}
                    />
                  )}
                </View>

                {/* Takvim - Bitiş */}
                <View style={{ gap: 6 }}>
                  <Text style={{ fontWeight: "600", color: colors.foreground }}>📅 Bitiş Tarihi</Text>
                  <TouchableOpacity onPress={() => setShowEndPicker(true)}
                    style={{
                      borderWidth: 1, borderColor: colors.primary, borderRadius: 10,
                      padding: 12, backgroundColor: colors.surface, flexDirection: "row", alignItems: "center", gap: 8,
                    }}>
                    <Text style={{ fontSize: 18 }}>📅</Text>
                    <Text style={{ color: colors.foreground, fontWeight: "600" }}>{displayDate(formatDate(endDate))}</Text>
                  </TouchableOpacity>
                  {showEndPicker && (
                    <DateTimePicker
                      value={endDate}
                      mode="date"
                      minimumDate={startDate}
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={(_, date) => { setShowEndPicker(false); if (date) setEndDate(date); }}
                    />
                  )}
                </View>

                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity onPress={() => setShowForm(false)}
                    style={{ flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                    <Text style={{ color: colors.foreground }}>İptal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={addGoal}
                    style={{ flex: 2, paddingVertical: 12, borderRadius: 10, alignItems: "center", backgroundColor: colors.primary }}>
                    <Text style={{ color: "#fff", fontWeight: "700" }}>Hedef Oluştur</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Hedef Listesi */}
            {clientGoals.length === 0 ? (
              <Text style={{ color: colors.muted, textAlign: "center", marginTop: 20 }}>
                {role === "dietitian" ? `${selectedClient.name} için henüz hedef yok.` : "Diyetisyeniniz henüz hedef eklemedi."}
              </Text>
            ) : clientGoals.map(goal => {
              const tp = todayProgress(goal.id);
              const pct = tp ? Math.min((tp.value / goal.target) * 100, 100) : 0;
              return (
                <View key={goal.id} style={{
                  backgroundColor: colors.surface, borderRadius: 12, padding: 16, gap: 8,
                  borderWidth: 2, borderColor: tp?.completed ? "#22c55e" : colors.border,
                }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <View>
                      <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>
                        {goal.icon} {goal.label}
                      </Text>
                      <Text style={{ color: colors.primary, fontWeight: "700" }}>
                        Hedef: {goal.target} {goal.unit}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end", gap: 4 }}>
                      {goal.repeatsDaily && <Text style={{ color: "#22c55e", fontSize: 11 }}>🔄 Günlük</Text>}
                      <Text style={{ color: colors.muted, fontSize: 11 }}>
                        {displayDate(goal.startDate)} — {displayDate(goal.endDate)}
                      </Text>
                      {role === "dietitian" && (
                        <TouchableOpacity onPress={() => deleteGoal(goal.id)}>
                          <Text style={{ color: "#ef4444", fontSize: 12 }}>Sil</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {tp ? (
                    <>
                      <View style={{ height: 8, backgroundColor: colors.border, borderRadius: 4 }}>
                        <View style={{ height: 8, backgroundColor: tp.completed ? "#22c55e" : colors.primary, borderRadius: 4, width: `${pct}%` }} />
                      </View>
                      <Text style={{ color: tp.completed ? "#22c55e" : colors.muted, fontSize: 13 }}>
                        {tp.completed ? "✅ Tamamlandı!" : `${tp.value} / ${goal.target} ${goal.unit} (${pct.toFixed(0)}%)`}
                      </Text>
                    </>
                  ) : (
                    <Text style={{ color: colors.muted, fontSize: 13 }}>Bugün henüz giriş yapılmadı</Text>
                  )}
                </View>
              );
            })}
          </>
        )}

        {/* İLERLEME - Danışan tamamladı işaretler */}
        {activeTab === "progress" && (
          <>
            <Text style={{ color: colors.muted, fontSize: 13 }}>
              {role === "client" ? "Bugün tamamladıklarınızı işaretleyin" : `${selectedClient.name}'in bugünkü ilerlemesi`}
            </Text>

            {clientGoals.length === 0 ? (
              <Text style={{ color: colors.muted, textAlign: "center" }}>Henüz hedef belirlenmedi.</Text>
            ) : clientGoals.map(goal => {
              const tp = todayProgress(goal.id);
              return (
                <View key={goal.id} style={{
                  backgroundColor: colors.surface, borderRadius: 12, padding: 14, gap: 10,
                  borderWidth: 2, borderColor: tp?.completed ? "#22c55e" : colors.border,
                }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: colors.foreground }}>
                      {goal.icon} {goal.label}
                    </Text>
                    <Text style={{ color: colors.primary, fontWeight: "700" }}>
                      {goal.target} {goal.unit}
                    </Text>
                  </View>

                  {tp?.completed ? (
                    <View style={{ backgroundColor: "#22c55e20", borderRadius: 8, padding: 10, borderWidth: 1, borderColor: "#22c55e" }}>
                      <Text style={{ color: "#22c55e", fontWeight: "700", textAlign: "center" }}>
                        ✅ Tamamlandı! ({tp.value} {goal.unit})
                      </Text>
                    </View>
                  ) : (
                    <>
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        <TextInput
                          value={progressValues[goal.id] ?? ""}
                          onChangeText={v => setProgressValues(prev => ({ ...prev, [goal.id]: v }))}
                          placeholder={`${goal.label} değeri (${goal.unit})`}
                          keyboardType="numeric"
                          placeholderTextColor={colors.muted}
                          style={{
                            flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10,
                            padding: 10, color: colors.foreground, backgroundColor: colors.background, fontSize: 14,
                          }}
                        />
                        <TouchableOpacity onPress={() => logProgress(goal.id)}
                          style={{ paddingHorizontal: 14, borderRadius: 10, backgroundColor: colors.primary, justifyContent: "center" }}>
                          <Text style={{ color: "#fff", fontWeight: "700" }}>Kaydet</Text>
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity onPress={() => logProgress(goal.id, true)}
                        style={{ paddingVertical: 10, borderRadius: 10, alignItems: "center", backgroundColor: "#22c55e20", borderWidth: 1, borderColor: "#22c55e" }}>
                        <Text style={{ color: "#22c55e", fontWeight: "700" }}>✅ Tamamlandı İşaretle</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
