import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, View, TouchableOpacity, TextInput, Alert, Modal, FlatList } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserRegistration } from "@/lib/_core/user-registration";
import { mealPlanTemplatesService } from "@/lib/_core/meal-plan-templates";

const MEALS_KEY = "local_meals";
const NUTRITION_GOALS_KEY = "nutrition_goals";

interface Meal {
  id: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  description: string;
  calories: number;
  photoUri?: string;
  date: string;
  items: string[];
}

interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  setByDietitian: boolean;
}

const MEAL_TYPES = [
  { key: "breakfast", label: "🌅 Kahvaltı" },
  { key: "lunch", label: "☀️ Öğle" },
  { key: "dinner", label: "🌙 Akşam" },
  { key: "snack", label: "🍎 Ara Öğün" },
] as const;

const DEFAULT_GOALS: NutritionGoals = {
  calories: 2000, protein: 150, carbs: 250, fat: 65, setByDietitian: false,
};

function analyzePhotoDescription(uri: string): Promise<string> {
  // Gerçek AI analizi için Claude API kullanılır
  // Şimdilik kullanıcıya manuel giriş yaptırıyoruz
  return Promise.resolve("");
}

export default function MealsScreen() {
  const colors = useColors();
  const [role, setRole] = useState<"dietitian" | "client">("client");
  const [meals, setMeals] = useState<Meal[]>([]);
  const [goals, setGoals] = useState<NutritionGoals>(DEFAULT_GOALS);
  const [activeTab, setActiveTab] = useState<"log" | "today" | "goals">("log");
  const [mealType, setMealType] = useState<Meal["type"]>("breakfast");
  const [description, setDescription] = useState("");
  const [calories, setCalories] = useState("");
  const [photoUri, setPhotoUri] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Goals edit (dietitian only)
  const [editGoalCal, setEditGoalCal] = useState("");
  const [editGoalProtein, setEditGoalProtein] = useState("");
  const [editGoalCarbs, setEditGoalCarbs] = useState("");
  const [editGoalFat, setEditGoalFat] = useState("");
  const [selectedClient, setSelectedClient] = useState("Ayşe Yılmaz");

  const SAMPLE_CLIENTS = ["Ayşe Yılmaz", "Mehmet Demir", "Fatma Kaya"];

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const user = await getUserRegistration();
    setRole(user?.role ?? "client");
    const savedMeals = await AsyncStorage.getItem(MEALS_KEY);
    if (savedMeals) setMeals(JSON.parse(savedMeals));
    const savedGoals = await AsyncStorage.getItem(NUTRITION_GOALS_KEY);
    if (savedGoals) setGoals(JSON.parse(savedGoals));
    setLoading(false);
  };

  const saveMeal = async () => {
    if (!description.trim() && selectedItems.length === 0) {
      Alert.alert("Hata", "Öğün açıklaması veya yemek seçin");
      return;
    }
    const meal: Meal = {
      id: Date.now().toString(),
      type: mealType,
      description: description.trim() || selectedItems.join(", "),
      calories: Number(calories) || 0,
      photoUri: photoUri || undefined,
      date: new Date().toISOString().split("T")[0],
      items: selectedItems,
    };
    const updated = [...meals, meal];
    setMeals(updated);
    await AsyncStorage.setItem(MEALS_KEY, JSON.stringify(updated));
    setDescription(""); setCalories(""); setPhotoUri(""); setSelectedItems([]);
    Alert.alert("Kaydedildi", "Öğün eklendi!");
  };

  const saveGoals = async () => {
    const newGoals: NutritionGoals = {
      calories: Number(editGoalCal) || goals.calories,
      protein: Number(editGoalProtein) || goals.protein,
      carbs: Number(editGoalCarbs) || goals.carbs,
      fat: Number(editGoalFat) || goals.fat,
      setByDietitian: true,
    };
    setGoals(newGoals);
    await AsyncStorage.setItem(NUTRITION_GOALS_KEY, JSON.stringify(newGoals));
    Alert.alert("Kaydedildi", `${selectedClient} için beslenme hedefleri güncellendi.`);
  };

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") { Alert.alert("İzin Gerekli", "Galeri izni gereklidir."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      Alert.alert(
        "Fotoğraf Eklendi",
        "Fotoğraftaki yemeği tanımlamak için açıklamayı manuel olarak yazın veya şablondan seçin.",
        [{ text: "Tamam" }]
      );
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") { Alert.alert("İzin Gerekli", "Kamera izni gereklidir."); return; }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      Alert.alert("Fotoğraf Çekildi", "Yemeği tanımlamak için açıklamayı yazın veya şablondan seçin.");
    }
  };

  // Şablonlardan tüm yemek listesini al
  const allTemplateItems = (() => {
    const templates = mealPlanTemplatesService.getAllTemplates();
    const items = new Set<string>();
    templates.forEach(t => t.meals.forEach(m => m.items.forEach(i => items.add(i))));
    return Array.from(items).sort();
  })();

  const toggleItem = (item: string) => {
    setSelectedItems(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const todayMeals = meals.filter(m => m.date === new Date().toISOString().split("T")[0]);
  const todayCalories = todayMeals.reduce((s, m) => s + m.calories, 0);
  const calPct = Math.min((todayCalories / goals.calories) * 100, 100);

  if (loading) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground }}>🥗 Beslenme Takibi</Text>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {(["log", "today", "goals"] as const).map(tab => (
              <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}
                style={{
                  paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10,
                  backgroundColor: activeTab === tab ? colors.primary : colors.surface,
                  borderWidth: 1, borderColor: activeTab === tab ? colors.primary : colors.border,
                }}>
                <Text style={{ color: activeTab === tab ? "#fff" : colors.foreground, fontWeight: "600" }}>
                  {tab === "log" ? "➕ Öğün Ekle" : tab === "today" ? "📋 Bugün" : "🎯 Hedefler"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* ÖĞÜN EKLE */}
        {activeTab === "log" && (
          <>
            {/* Öğün Tipi */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {MEAL_TYPES.map(t => (
                <TouchableOpacity key={t.key} onPress={() => setMealType(t.key)}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                    backgroundColor: mealType === t.key ? colors.primary : colors.surface,
                    borderWidth: 1, borderColor: mealType === t.key ? colors.primary : colors.border,
                  }}>
                  <Text style={{ color: mealType === t.key ? "#fff" : colors.foreground, fontWeight: "600" }}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Şablondan Seç */}
            <TouchableOpacity onPress={() => setShowTemplates(true)}
              style={{
                paddingVertical: 12, borderRadius: 10, alignItems: "center",
                backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary,
                flexDirection: "row", justifyContent: "center", gap: 8,
              }}>
              <Text style={{ color: colors.primary, fontWeight: "700" }}>📋 Öğün Şablonundan Seç</Text>
              {selectedItems.length > 0 && (
                <View style={{ backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>{selectedItems.length}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Seçili yemekler */}
            {selectedItems.length > 0 && (
              <View style={{ backgroundColor: colors.surface, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: colors.primary }}>
                <Text style={{ fontWeight: "600", color: colors.foreground, marginBottom: 6 }}>Seçilen Yemekler:</Text>
                {selectedItems.map(item => (
                  <View key={item} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 }}>
                    <Text style={{ color: colors.foreground }}>• {item}</Text>
                    <TouchableOpacity onPress={() => toggleItem(item)}>
                      <Text style={{ color: "#ef4444" }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Manuel Açıklama */}
            <TextInput
              placeholder="Yemek açıklaması ekle (isteğe bağlı)"
              value={description}
              onChangeText={setDescription}
              placeholderTextColor={colors.muted}
              multiline
              style={{
                borderWidth: 1, borderColor: colors.border, borderRadius: 10,
                padding: 12, color: colors.foreground, backgroundColor: colors.surface,
                minHeight: 70, fontSize: 14,
              }}
            />

            <TextInput
              placeholder="Kalori (kcal)"
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
              placeholderTextColor={colors.muted}
              style={{
                borderWidth: 1, borderColor: colors.border, borderRadius: 10,
                padding: 12, color: colors.foreground, backgroundColor: colors.surface, fontSize: 14,
              }}
            />

            {/* Fotoğraf */}
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity onPress={pickPhoto}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.foreground }}>🖼️ Galeriden</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={takePhoto}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.foreground }}>📷 Fotoğraf Çek</Text>
              </TouchableOpacity>
            </View>

            {photoUri ? (
              <View style={{ position: "relative" }}>
                <Image source={{ uri: photoUri }} style={{ width: "100%", height: 200, borderRadius: 10 }} />
                <TouchableOpacity onPress={() => setPhotoUri("")}
                  style={{ position: "absolute", top: 8, right: 8, backgroundColor: "#ef4444", borderRadius: 12, width: 24, height: 24, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#fff", fontWeight: "700" }}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <TouchableOpacity onPress={saveMeal}
              style={{ paddingVertical: 16, borderRadius: 12, alignItems: "center", backgroundColor: colors.primary }}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>💾 Öğün Kaydet</Text>
            </TouchableOpacity>
          </>
        )}

        {/* BUGÜN */}
        {activeTab === "today" && (
          <>
            {/* Kalori Özeti */}
            <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 10 }}>
              <Text style={{ fontWeight: "700", color: colors.foreground }}>📊 Bugünkü Kalori</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: colors.muted }}>Alınan: {todayCalories} kcal</Text>
                <Text style={{ color: colors.muted }}>Hedef: {goals.calories} kcal</Text>
              </View>
              <View style={{ height: 10, backgroundColor: colors.border, borderRadius: 5 }}>
                <View style={{ height: 10, backgroundColor: calPct >= 100 ? "#ef4444" : colors.primary, borderRadius: 5, width: `${calPct}%` }} />
              </View>
              <Text style={{ color: colors.muted, fontSize: 12 }}>{calPct.toFixed(0)}% tamamlandı</Text>
            </View>

            {todayMeals.length === 0 ? (
              <Text style={{ color: colors.muted, textAlign: "center", marginTop: 20 }}>Bugün henüz öğün eklenmedi.</Text>
            ) : MEAL_TYPES.map(type => {
              const typeMeals = todayMeals.filter(m => m.type === type.key);
              if (typeMeals.length === 0) return null;
              return (
                <View key={type.key} style={{ gap: 8 }}>
                  <Text style={{ fontWeight: "700", color: colors.foreground }}>{type.label}</Text>
                  {typeMeals.map(meal => (
                    <View key={meal.id} style={{ backgroundColor: colors.surface, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: colors.border, gap: 4 }}>
                      <Text style={{ color: colors.foreground }}>{meal.description}</Text>
                      {meal.calories > 0 && <Text style={{ color: colors.muted, fontSize: 12 }}>🔥 {meal.calories} kcal</Text>}
                      {meal.photoUri && <Image source={{ uri: meal.photoUri }} style={{ width: "100%", height: 120, borderRadius: 8, marginTop: 6 }} />}
                    </View>
                  ))}
                </View>
              );
            })}
          </>
        )}

        {/* HEDEFLER */}
        {activeTab === "goals" && (
          <>
            {/* Mevcut Hedefler */}
            <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 10 }}>
              <Text style={{ fontWeight: "700", color: colors.foreground }}>
                🎯 Beslenme Hedefleri
                {goals.setByDietitian && <Text style={{ color: colors.primary, fontSize: 12 }}> (Diyetisyen tarafından belirlendi)</Text>}
              </Text>
              {[
                { label: "Kalori", value: goals.calories, unit: "kcal", icon: "🔥" },
                { label: "Protein", value: goals.protein, unit: "gram", icon: "🥩" },
                { label: "Karbonhidrat", value: goals.carbs, unit: "gram", icon: "🍞" },
                { label: "Yağ", value: goals.fat, unit: "gram", icon: "🫒" },
              ].map(g => (
                <View key={g.label} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 }}>
                  <Text style={{ color: colors.foreground }}>{g.icon} {g.label}</Text>
                  <Text style={{ color: colors.primary, fontWeight: "700" }}>{g.value} {g.unit}</Text>
                </View>
              ))}
            </View>

            {/* Diyetisyen hedef belirleme */}
            {role === "dietitian" && (
              <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 12 }}>
                <Text style={{ fontWeight: "700", color: colors.foreground }}>👨‍⚕️ Danışan İçin Hedef Belirle</Text>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {SAMPLE_CLIENTS.map(c => (
                      <TouchableOpacity key={c} onPress={() => setSelectedClient(c)}
                        style={{
                          paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                          backgroundColor: selectedClient === c ? colors.primary : colors.surface,
                          borderWidth: 1, borderColor: selectedClient === c ? colors.primary : colors.border,
                        }}>
                        <Text style={{ color: selectedClient === c ? "#fff" : colors.foreground, fontWeight: "600", fontSize: 13 }}>
                          👤 {c}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                {[
                  { label: "Kalori (kcal)", value: editGoalCal, set: setEditGoalCal, placeholder: String(goals.calories) },
                  { label: "Protein (gram)", value: editGoalProtein, set: setEditGoalProtein, placeholder: String(goals.protein) },
                  { label: "Karbonhidrat (gram)", value: editGoalCarbs, set: setEditGoalCarbs, placeholder: String(goals.carbs) },
                  { label: "Yağ (gram)", value: editGoalFat, set: setEditGoalFat, placeholder: String(goals.fat) },
                ].map(f => (
                  <View key={f.label} style={{ gap: 4 }}>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: colors.foreground }}>{f.label}</Text>
                    <TextInput
                      value={f.value}
                      onChangeText={f.set}
                      placeholder={f.placeholder}
                      keyboardType="numeric"
                      placeholderTextColor={colors.muted}
                      style={{
                        borderWidth: 1, borderColor: colors.border, borderRadius: 10,
                        padding: 12, color: colors.foreground, backgroundColor: colors.background, fontSize: 14,
                      }}
                    />
                  </View>
                ))}

                <TouchableOpacity onPress={saveGoals}
                  style={{ paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: colors.primary }}>
                  <Text style={{ color: "#fff", fontWeight: "700" }}>💾 Hedefleri Kaydet</Text>
                </TouchableOpacity>
              </View>
            )}

            {role === "client" && !goals.setByDietitian && (
              <Text style={{ color: colors.muted, textAlign: "center", fontSize: 13 }}>
                Hedefleriniz diyetisyeniniz tarafından belirlenecek.
              </Text>
            )}
          </>
        )}
      </ScrollView>

      {/* Şablon Seçim Modalı */}
      <Modal visible={showTemplates} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "#00000080", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "80%" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground }}>📋 Yemek Seç</Text>
              <TouchableOpacity onPress={() => setShowTemplates(false)}>
                <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 16 }}>Tamam</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 10 }}>
              {selectedItems.length} yemek seçildi
            </Text>
            <FlatList
              data={allTemplateItems}
              keyExtractor={item => item}
              renderItem={({ item }) => {
                const selected = selectedItems.includes(item);
                return (
                  <TouchableOpacity onPress={() => toggleItem(item)}
                    style={{
                      flexDirection: "row", alignItems: "center", paddingVertical: 12,
                      borderBottomWidth: 1, borderBottomColor: colors.border, gap: 10,
                    }}>
                    <View style={{
                      width: 22, height: 22, borderRadius: 6, borderWidth: 2,
                      borderColor: selected ? colors.primary : colors.border,
                      backgroundColor: selected ? colors.primary : "transparent",
                      alignItems: "center", justifyContent: "center",
                    }}>
                      {selected && <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>✓</Text>}
                    </View>
                    <Text style={{ color: colors.foreground, fontSize: 14 }}>{item}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

function defaultMealDateTime() {
  return new Date().toISOString();
}
