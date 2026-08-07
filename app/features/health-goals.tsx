import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { BackButton } from "@/components/back-button";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserRegistration } from "@/lib/_core/user-registration";

const GOALS_KEY = "health_goals";
const PROGRESS_KEY = "health_progress";

interface Goal {
  id: string;
  clientId: string;
  clientName: string;
  type: string;
  label: string;
  unit: string;
  target: number;
  icon: string;
}

interface Progress {
  goalId: string;
  date: string;
  value: number;
}

const GOAL_TYPES = [
  { type: "calories", label: "Kalori", unit: "kcal", icon: "🔥" },
  { type: "protein", label: "Protein", unit: "gram", icon: "🥩" },
  { type: "water", label: "Su", unit: "litre", icon: "💧" },
  { type: "steps", label: "Adım", unit: "adım", icon: "🚶" },
  { type: "sleep", label: "Uyku", unit: "saat", icon: "😴" },
  { type: "weight", label: "Kilo", unit: "kg", icon: "⚖️" },
];

const SAMPLE_CLIENTS = [
  { id: "1", name: "Ayşe Yılmaz" },
  { id: "2", name: "Mehmet Demir" },
  { id: "3", name: "Fatma Kaya" },
];

export default function HealthGoals() {
  const colors = useColors();
  const [role, setRole] = useState<"dietitian" | "client">("client");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [selectedClient, setSelectedClient] = useState(SAMPLE_CLIENTS[0]);
  const [selectedType, setSelectedType] = useState(GOAL_TYPES[0]);
  const [targetValue, setTargetValue] = useState("");
  const [progressValues, setProgressValues] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"goals" | "progress">("goals");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const user = await getUserRegistration();
    setRole(user?.role ?? "client");
    const savedGoals = await AsyncStorage.getItem(GOALS_KEY);
    if (savedGoals) setGoals(JSON.parse(savedGoals));
    const savedProgress = await AsyncStorage.getItem(PROGRESS_KEY);
    if (savedProgress) setProgress(JSON.parse(savedProgress));
  };

  const addGoal = async () => {
    if (!targetValue.trim() || isNaN(Number(targetValue))) {
      Alert.alert("Hata", "Geçerli bir hedef değeri girin");
      return;
    }
    const existing = goals.find(g => g.clientId === selectedClient.id && g.type === selectedType.type);
    let updated: Goal[];
    if (existing) {
      updated = goals.map(g => g.id === existing.id ? { ...g, target: Number(targetValue) } : g);
    } else {
      const goal: Goal = {
        id: Date.now().toString(),
        clientId: selectedClient.id,
        clientName: selectedClient.name,
        ...selectedType,
        target: Number(targetValue),
      };
      updated = [...goals, goal];
    }
    setGoals(updated);
    await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(updated));
    setTargetValue("");
    Alert.alert("Kaydedildi", `${selectedClient.name} için ${selectedType.label} hedefi belirlendi.`);
  };

  const logProgress = async (goalId: string) => {
    const val = progressValues[goalId];
    if (!val || isNaN(Number(val))) { Alert.alert("Hata", "Geçerli bir değer girin"); return; }
    const entry: Progress = {
      goalId,
      date: new Date().toISOString().split("T")[0],
      value: Number(val),
    };
    const updated = [...progress.filter(p => !(p.goalId === goalId && p.date === entry.date)), entry];
    setProgress(updated);
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
    setProgressValues(prev => ({ ...prev, [goalId]: "" }));
    Alert.alert("Kaydedildi", "İlerlemeniz kaydedildi.");
  };

  const clientGoals = goals.filter(g => g.clientId === selectedClient.id);
  const myGoals = role === "client" ? goals : clientGoals;

  const todayProgress = (goalId: string) => {
    const today = new Date().toISOString().split("T")[0];
    return progress.find(p => p.goalId === goalId && p.date === today)?.value ?? null;
  };

  return (
    <ScreenContainer>
      <BackButton title="🎯 Sağlık Hedefleri" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>

        <View style={{ flexDirection: "row", gap: 8 }}>
          {(["goals", "progress"] as const).map(tab => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}
              style={{
                flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center",
                backgroundColor: activeTab === tab ? colors.primary : colors.surface,
                borderWidth: 1, borderColor: activeTab === tab ? colors.primary : colors.border,
              }}>
              <Text style={{ color: activeTab === tab ? "#fff" : colors.foreground, fontWeight: "600" }}>
                {tab === "goals" ? "🎯 Hedefler" : "📊 İlerleme"}
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
                  <Text style={{ color: selectedClient.id === c.id ? "#fff" : colors.foreground, fontWeight: "600", fontSize: 13 }}>
                    👤 {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}

        {activeTab === "goals" && (
          <>
            {/* Diyetisyen hedef belirleme */}
            {role === "dietitian" && (
              <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, gap: 12, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontWeight: "700", color: colors.foreground }}>
                  {selectedClient.name} için Hedef Belirle
                </Text>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {GOAL_TYPES.map(gt => (
                      <TouchableOpacity key={gt.type} onPress={() => setSelectedType(gt)}
                        style={{
                          paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                          backgroundColor: selectedType.type === gt.type ? colors.primary : colors.surface,
                          borderWidth: 1, borderColor: selectedType.type === gt.type ? colors.primary : colors.border,
                        }}>
                        <Text style={{ color: selectedType.type === gt.type ? "#fff" : colors.foreground, fontWeight: "600", fontSize: 13 }}>
                          {gt.icon} {gt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                  <TextInput
                    placeholder={`Hedef ${selectedType.label} (${selectedType.unit})`}
                    value={targetValue}
                    onChangeText={setTargetValue}
                    keyboardType="numeric"
                    placeholderTextColor={colors.muted}
                    style={{
                      flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10,
                      padding: 12, color: colors.foreground, backgroundColor: colors.background, fontSize: 14,
                    }}
                  />
                  <Text style={{ color: colors.muted }}>{selectedType.unit}</Text>
                </View>

                <TouchableOpacity onPress={addGoal}
                  style={{ paddingVertical: 12, borderRadius: 10, alignItems: "center", backgroundColor: colors.primary }}>
                  <Text style={{ color: "#fff", fontWeight: "700" }}>Hedef Belirle</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Hedef listesi */}
            {myGoals.length === 0 ? (
              <Text style={{ color: colors.muted, textAlign: "center", marginTop: 20 }}>
                {role === "dietitian" ? `${selectedClient.name} için henüz hedef belirlenmedi.` : "Diyetisyeniniz henüz hedef belirlemedi."}
              </Text>
            ) : myGoals.map(goal => {
              const today = todayProgress(goal.id);
              const pct = today !== null ? Math.min((today / goal.target) * 100, 100) : 0;
              return (
                <View key={goal.id} style={{
                  backgroundColor: colors.surface, borderRadius: 12, padding: 16, gap: 10,
                  borderWidth: 1, borderColor: colors.border,
                }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>
                      {goal.icon} {goal.label}
                    </Text>
                    <Text style={{ color: colors.primary, fontWeight: "700" }}>
                      Hedef: {goal.target} {goal.unit}
                    </Text>
                  </View>
                  {today !== null && (
                    <>
                      <Text style={{ color: colors.muted, fontSize: 13 }}>
                        Bugün: {today} {goal.unit} ({pct.toFixed(0)}%)
                      </Text>
                      <View style={{ height: 8, backgroundColor: colors.border, borderRadius: 4 }}>
                        <View style={{ height: 8, backgroundColor: pct >= 100 ? "#22c55e" : colors.primary, borderRadius: 4, width: `${pct}%` }} />
                      </View>
                    </>
                  )}
                </View>
              );
            })}
          </>
        )}

        {activeTab === "progress" && (
          <>
            <Text style={{ color: colors.muted, fontSize: 13 }}>Bugün ne kadar yaptığınızı girin</Text>
            {myGoals.length === 0 ? (
              <Text style={{ color: colors.muted, textAlign: "center" }}>Önce hedef belirlenmesi gerekiyor.</Text>
            ) : myGoals.map(goal => {
              const today = todayProgress(goal.id);
              return (
                <View key={goal.id} style={{
                  backgroundColor: colors.surface, borderRadius: 12, padding: 14, gap: 10,
                  borderWidth: 1, borderColor: colors.border,
                }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: colors.foreground }}>
                    {goal.icon} {goal.label} — Hedef: {goal.target} {goal.unit}
                  </Text>
                  {today !== null && (
                    <Text style={{ color: "#22c55e", fontSize: 13 }}>✅ Bugün: {today} {goal.unit}</Text>
                  )}
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TextInput
                      placeholder={`${goal.label} girin (${goal.unit})`}
                      value={progressValues[goal.id] ?? ""}
                      onChangeText={v => setProgressValues(prev => ({ ...prev, [goal.id]: v }))}
                      keyboardType="numeric"
                      placeholderTextColor={colors.muted}
                      style={{
                        flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10,
                        padding: 10, color: colors.foreground, backgroundColor: colors.background, fontSize: 14,
                      }}
                    />
                    <TouchableOpacity onPress={() => logProgress(goal.id)}
                      style={{ paddingHorizontal: 16, borderRadius: 10, backgroundColor: colors.primary, justifyContent: "center" }}>
                      <Text style={{ color: "#fff", fontWeight: "700" }}>Kaydet</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
