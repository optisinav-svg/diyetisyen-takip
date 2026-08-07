import { BackButton } from "@/components/back-button";
import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, Modal, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserRegistration } from "@/lib/_core/user-registration";

const MICRO_GOALS_KEY = "micronutrient_goals_v2";
const MICRO_LOG_KEY = "micronutrient_log_v2";

interface MicroGoal {
  id: string;
  clientId: string;
  clientName: string;
  nutrient: string;
  unit: string;
  dailyTarget: number;
  icon: string;
}

interface MicroLog {
  id: string;
  clientId: string;
  nutrientId: string;
  nutrient: string;
  amount: number;
  unit: string;
  foodSource: string;
  date: string;
}

const NUTRIENTS = [
  { id: "vit-c", name: "C Vitamini", unit: "mg", icon: "🍊", defaultTarget: 90, foods: ["Portakal", "Limon", "Kivi", "Çilek", "Biber", "Brokoli", "Domates"] },
  { id: "vit-d", name: "D Vitamini", unit: "mcg", icon: "☀️", defaultTarget: 20, foods: ["Somon", "Ton balığı", "Yumurta", "Mantar", "Süt"] },
  { id: "vit-b12", name: "B12 Vitamini", unit: "mcg", icon: "💊", defaultTarget: 2.4, foods: ["Et", "Tavuk", "Balık", "Yumurta", "Süt", "Peynir"] },
  { id: "iron", name: "Demir", unit: "mg", icon: "🔴", defaultTarget: 18, foods: ["Kırmızı et", "Mercimek", "Ispanak", "Fasulye", "Tofu", "Susam"] },
  { id: "calcium", name: "Kalsiyum", unit: "mg", icon: "🦴", defaultTarget: 1000, foods: ["Süt", "Peynir", "Yoğurt", "Brokoli", "Badem", "Susam"] },
  { id: "magnesium", name: "Magnezyum", unit: "mg", icon: "⚡", defaultTarget: 400, foods: ["Kabak çekirdeği", "Badem", "Ispanak", "Avokado", "Bitter çikolata"] },
  { id: "zinc", name: "Çinko", unit: "mg", icon: "🔵", defaultTarget: 11, foods: ["Kabak çekirdeği", "Kırmızı et", "Ceviz", "Nohut", "Yulaf"] },
  { id: "potassium", name: "Potasyum", unit: "mg", icon: "🍌", defaultTarget: 4700, foods: ["Muz", "Patates", "Fasulye", "Avokado", "Ispanak"] },
  { id: "omega3", name: "Omega-3", unit: "g", icon: "🐟", defaultTarget: 1.6, foods: ["Somon", "Uskumru", "Keten tohumu", "Ceviz", "Chia tohumu"] },
  { id: "fiber", name: "Lif", unit: "g", icon: "🌾", defaultTarget: 25, foods: ["Sebze", "Meyve", "Tam tahıl", "Baklagiller", "Kuruyemiş"] },
  { id: "folic", name: "Folik Asit", unit: "mcg", icon: "🌿", defaultTarget: 400, foods: ["Ispanak", "Mercimek", "Fasulye", "Avokado", "Brokoli"] },
  { id: "vit-a", name: "A Vitamini", unit: "mcg", icon: "🥕", defaultTarget: 900, foods: ["Havuç", "Tatlı patates", "Ispanak", "Kayısı", "Mango"] },
];

const SAMPLE_CLIENTS = [
  { id: "c1", name: "Ayşe Yılmaz" },
  { id: "c2", name: "Mehmet Demir" },
  { id: "c3", name: "Fatma Kaya" },
];

export default function MicronutrientTrackingScreen() {
  const colors = useColors();
  const [role, setRole] = useState<"dietitian" | "client">("client");
  const [goals, setGoals] = useState<MicroGoal[]>([]);
  const [logs, setLogs] = useState<MicroLog[]>([]);
  const [selectedClient, setSelectedClient] = useState(SAMPLE_CLIENTS[0]);
  const [activeTab, setActiveTab] = useState<"overview" | "log" | "goals">("overview");
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedNutrient, setSelectedNutrient] = useState(NUTRIENTS[0]);
  const [logAmount, setLogAmount] = useState("");
  const [searchFood, setSearchFood] = useState("");
  const [selectedFood, setSelectedFood] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const user = await getUserRegistration();
    setRole(user?.role ?? "client");
    const savedGoals = await AsyncStorage.getItem(MICRO_GOALS_KEY);
    if (savedGoals) setGoals(JSON.parse(savedGoals));
    else {
      // Varsayılan hedefleri yükle
      const defaults = NUTRIENTS.map(n => ({
        id: n.id,
        clientId: "c1",
        clientName: "Ayşe Yılmaz",
        nutrient: n.name,
        unit: n.unit,
        dailyTarget: n.defaultTarget,
        icon: n.icon,
      }));
      setGoals(defaults);
      await AsyncStorage.setItem(MICRO_GOALS_KEY, JSON.stringify(defaults));
    }
    const savedLogs = await AsyncStorage.getItem(MICRO_LOG_KEY);
    if (savedLogs) setLogs(JSON.parse(savedLogs));
  };

  const saveGoals = async (list: MicroGoal[]) => {
    setGoals(list);
    await AsyncStorage.setItem(MICRO_GOALS_KEY, JSON.stringify(list));
  };

  const addLog = async () => {
    if (!logAmount || isNaN(Number(logAmount))) { Alert.alert("Hata", "Geçerli miktar girin"); return; }
    const today = new Date().toISOString().split("T")[0];
    const log: MicroLog = {
      id: Date.now().toString(),
      clientId: role === "dietitian" ? selectedClient.id : "c1",
      nutrientId: selectedNutrient.id,
      nutrient: selectedNutrient.name,
      amount: Number(logAmount),
      unit: selectedNutrient.unit,
      foodSource: selectedFood || "Manuel giriş",
      date: today,
    };
    const updated = [...logs, log];
    setLogs(updated);
    await AsyncStorage.setItem(MICRO_LOG_KEY, JSON.stringify(updated));
    setLogAmount(""); setSelectedFood(""); setShowLogModal(false);
    Alert.alert("Kaydedildi ✅", `${selectedNutrient.name}: ${log.amount}${log.unit} eklendi.`);
  };

  const setGoalTarget = async (nutrientId: string, target: number) => {
    const clientId = selectedClient.id;
    const exists = goals.find(g => g.id === nutrientId && g.clientId === clientId);
    const nutrient = NUTRIENTS.find(n => n.id === nutrientId)!;
    let updated: MicroGoal[];
    if (exists) {
      updated = goals.map(g => g.id === nutrientId && g.clientId === clientId ? { ...g, dailyTarget: target } : g);
    } else {
      updated = [...goals, {
        id: nutrientId, clientId, clientName: selectedClient.name,
        nutrient: nutrient.name, unit: nutrient.unit, dailyTarget: target, icon: nutrient.icon,
      }];
    }
    await saveGoals(updated);
  };

  const today = new Date().toISOString().split("T")[0];
  const clientId = role === "dietitian" ? selectedClient.id : "c1";
  const clientGoals = goals.filter(g => g.clientId === clientId);
  const todayLogs = logs.filter(l => l.date === today && l.clientId === clientId);

  const getTodayTotal = (nutrientId: string) =>
    todayLogs.filter(l => l.nutrientId === nutrientId).reduce((s, l) => s + l.amount, 0);

  const getPct = (nutrientId: string) => {
    const goal = clientGoals.find(g => g.id === nutrientId);
    if (!goal || goal.dailyTarget === 0) return 0;
    return Math.min((getTodayTotal(nutrientId) / goal.dailyTarget) * 100, 100);
  };

  const filteredFoods = selectedNutrient.foods.filter(f =>
    f.toLowerCase().includes(searchFood.toLowerCase())
  );

  return (
    <ScreenContainer>
      <BackButton title="🔬 Mikro Besin Takibi" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[
              { key: "overview", label: "📊 Özet" },
              { key: "log", label: "➕ Kayıt Ekle" },
              { key: "goals", label: role === "dietitian" ? "🎯 Hedef Belirle" : "🎯 Hedeflerim" },
            ].map(tab => (
              <TouchableOpacity key={tab.key} onPress={() => setActiveTab(tab.key as any)}
                style={{
                  paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
                  backgroundColor: activeTab === tab.key ? colors.primary : colors.surface,
                  borderWidth: 1, borderColor: activeTab === tab.key ? colors.primary : colors.border,
                }}>
                <Text style={{ color: activeTab === tab.key ? "#fff" : colors.foreground, fontWeight: "600" }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

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

        {/* ÖZET */}
        {activeTab === "overview" && (
          <>
            <Text style={{ color: colors.muted, fontSize: 13 }}>Bugünkü mikro besin alımı</Text>
            {clientGoals.map(goal => {
              const total = getTodayTotal(goal.id);
              const pct = getPct(goal.id);
              return (
                <View key={goal.id} style={{
                  backgroundColor: colors.surface, borderRadius: 12, padding: 14, gap: 8,
                  borderWidth: 1, borderColor: pct >= 100 ? "#22c55e" : colors.border,
                }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontWeight: "700", color: colors.foreground }}>
                      {goal.icon} {goal.nutrient}
                    </Text>
                    <Text style={{ color: pct >= 100 ? "#22c55e" : colors.primary, fontWeight: "700" }}>
                      {total}/{goal.dailyTarget} {goal.unit}
                    </Text>
                  </View>
                  <View style={{ height: 8, backgroundColor: colors.border, borderRadius: 4 }}>
                    <View style={{
                      height: 8, borderRadius: 4, width: `${pct}%`,
                      backgroundColor: pct >= 100 ? "#22c55e" : pct >= 60 ? "#f97316" : "#ef4444",
                    }} />
                  </View>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>{pct.toFixed(0)}% tamamlandı</Text>
                </View>
              );
            })}

            {clientGoals.length === 0 && (
              <Text style={{ color: colors.muted, textAlign: "center" }}>
                {role === "dietitian" ? "Bu danışan için hedef belirlenmedi." : "Diyetisyeniniz henüz hedef belirlemedi."}
              </Text>
            )}
          </>
        )}

        {/* KAYIT EKLE */}
        {activeTab === "log" && (
          <>
            <Text style={{ color: colors.muted, fontSize: 13 }}>Yediğiniz besin kaynağını seçin ve miktarını girin</Text>

            {/* Besin seçimi */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {NUTRIENTS.map(n => (
                <TouchableOpacity key={n.id} onPress={() => { setSelectedNutrient(n); setSearchFood(""); setSelectedFood(""); setShowLogModal(true); }}
                  style={{
                    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
                    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
                    flexDirection: "row", alignItems: "center", gap: 6,
                  }}>
                  <Text style={{ fontSize: 18 }}>{n.icon}</Text>
                  <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 13 }}>{n.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Bugünkü Kayıtlar */}
            {todayLogs.length > 0 && (
              <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border, gap: 8 }}>
                <Text style={{ fontWeight: "700", color: colors.foreground }}>📋 Bugünkü Kayıtlar</Text>
                {todayLogs.map(log => (
                  <View key={log.id} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <Text style={{ color: colors.foreground }}>{log.nutrient} — {log.foodSource}</Text>
                    <Text style={{ color: colors.primary, fontWeight: "600" }}>{log.amount}{log.unit}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {/* HEDEFLER */}
        {activeTab === "goals" && (
          <>
            {role === "dietitian" && (
              <Text style={{ color: colors.muted, fontSize: 13 }}>
                {selectedClient.name} için günlük hedefleri belirleyin
              </Text>
            )}
            {NUTRIENTS.map(n => {
              const goal = clientGoals.find(g => g.id === n.id);
              const [tempVal, setTempVal] = useState(String(goal?.dailyTarget ?? n.defaultTarget));
              return (
                <View key={n.id} style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Text style={{ fontSize: 24 }}>{n.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "700", color: colors.foreground }}>{n.name}</Text>
                    <Text style={{ color: colors.muted, fontSize: 12 }}>Hedef: {goal?.dailyTarget ?? n.defaultTarget} {n.unit}/gün</Text>
                  </View>
                  {role === "dietitian" && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <TextInput
                        value={tempVal}
                        onChangeText={setTempVal}
                        keyboardType="numeric"
                        style={{
                          borderWidth: 1, borderColor: colors.border, borderRadius: 8,
                          padding: 6, color: colors.foreground, backgroundColor: colors.background,
                          width: 70, textAlign: "center",
                        }}
                      />
                      <TouchableOpacity onPress={() => setGoalTarget(n.id, Number(tempVal))}
                        style={{ paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.primary }}>
                        <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>Kaydet</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* Kayıt Modal */}
      <Modal visible={showLogModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "#00000080", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, gap: 14, maxHeight: "70%" }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground }}>
              {selectedNutrient.icon} {selectedNutrient.name} Ekle
            </Text>

            {/* Besin Kaynağı Arama */}
            <View style={{ gap: 8 }}>
              <Text style={{ fontWeight: "600", color: colors.foreground }}>🍽️ Besin Kaynağı Seç</Text>
              <TextInput value={searchFood} onChangeText={setSearchFood}
                placeholder="Yemek ara..." placeholderTextColor={colors.muted}
                style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, color: colors.foreground, backgroundColor: colors.surface }} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {filteredFoods.map(food => (
                    <TouchableOpacity key={food} onPress={() => setSelectedFood(food)}
                      style={{
                        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
                        backgroundColor: selectedFood === food ? colors.primary : colors.surface,
                        borderWidth: 1, borderColor: selectedFood === food ? colors.primary : colors.border,
                      }}>
                      <Text style={{ color: selectedFood === food ? "#fff" : colors.foreground, fontWeight: "600", fontSize: 13 }}>
                        {food}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Miktar */}
            <View style={{ gap: 6 }}>
              <Text style={{ fontWeight: "600", color: colors.foreground }}>
                Miktar ({selectedNutrient.unit})
              </Text>
              <TextInput value={logAmount} onChangeText={setLogAmount}
                placeholder={`${selectedNutrient.defaultTarget} ${selectedNutrient.unit}`}
                keyboardType="numeric" placeholderTextColor={colors.muted}
                style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.foreground, backgroundColor: colors.surface, fontSize: 16 }} />
            </View>

            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity onPress={() => setShowLogModal(false)}
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.foreground }}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addLog}
                style={{ flex: 2, paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: colors.primary }}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>✅ Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
