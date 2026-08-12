import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { BackButton } from "@/components/back-button";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MEALS_KEY = "meals_v3";

interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  source: "usda" | "openfoodfacts" | "local";
}

// Türk yemekleri ve yaygın gıdalar (yerel veritabanı)
const LOCAL_FOODS: FoodItem[] = [
  // Türk Yemekleri
  { id: "l1", name: "Mercimek Çorbası", calories: 180, protein: 9, carbs: 28, fat: 4, fiber: 8, source: "local" },
  { id: "l2", name: "Kuru Fasulye", calories: 280, protein: 15, carbs: 42, fat: 5, fiber: 12, source: "local" },
  { id: "l3", name: "Tavuk Göğsü Izgara", calories: 165, protein: 31, carbs: 0, fat: 3.6, source: "local" },
  { id: "l4", name: "Pirinç Pilavı (1 porsiyon)", calories: 206, protein: 4.3, carbs: 44.5, fat: 0.4, source: "local" },
  { id: "l5", name: "Bulgur Pilavı (1 porsiyon)", calories: 185, protein: 5.6, carbs: 38, fat: 1.4, fiber: 5, source: "local" },
  { id: "l6", name: "Yoğurt (200g)", calories: 120, protein: 7, carbs: 10, fat: 4, source: "local" },
  { id: "l7", name: "Ayran (200ml)", calories: 56, protein: 3.4, carbs: 4.2, fat: 1.8, source: "local" },
  { id: "l8", name: "Ekmek (1 dilim)", calories: 80, protein: 2.8, carbs: 15.7, fat: 0.9, source: "local" },
  { id: "l9", name: "Yumurta (1 adet)", calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3, source: "local" },
  { id: "l10", name: "Peynir (30g)", calories: 100, protein: 6.5, carbs: 0.5, fat: 8, source: "local" },
  { id: "l11", name: "Zeytin (10 adet)", calories: 72, protein: 0.5, carbs: 2, fat: 6.8, source: "local" },
  { id: "l12", name: "Domates (1 adet)", calories: 22, protein: 1.1, carbs: 4.8, fat: 0.2, fiber: 1.5, source: "local" },
  { id: "l13", name: "Salatalık (1 adet)", calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5, source: "local" },
  { id: "l14", name: "Muz (1 orta boy)", calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, source: "local" },
  { id: "l15", name: "Elma (1 orta boy)", calories: 72, protein: 0.4, carbs: 19.1, fat: 0.2, fiber: 3.3, source: "local" },
  { id: "l16", name: "Portakal (1 orta boy)", calories: 62, protein: 1.2, carbs: 15.4, fat: 0.2, fiber: 3.1, source: "local" },
  { id: "l17", name: "Ceviz (30g)", calories: 196, protein: 4.6, carbs: 4.1, fat: 19.6, fiber: 2, source: "local" },
  { id: "l18", name: "Badem (30g)", calories: 173, protein: 6.3, carbs: 6.1, fat: 15, fiber: 3.5, source: "local" },
  { id: "l19", name: "Süt (200ml)", calories: 122, protein: 6.4, carbs: 9.6, fat: 6, source: "local" },
  { id: "l20", name: "Tavuk Çorbası", calories: 95, protein: 8, carbs: 8, fat: 2.5, source: "local" },
  { id: "l21", name: "Somon Izgara (100g)", calories: 208, protein: 20, carbs: 0, fat: 13, source: "local" },
  { id: "l22", name: "Nohut (1 porsiyon)", calories: 265, protein: 14, carbs: 45, fat: 4, fiber: 12, source: "local" },
  { id: "l23", name: "Ispanak (100g)", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, source: "local" },
  { id: "l24", name: "Havuç (1 orta boy)", calories: 25, protein: 0.6, carbs: 5.8, fat: 0.1, fiber: 1.7, source: "local" },
  // Restoran / Fast Food
  { id: "r1", name: "Köfte (2 adet)", calories: 280, protein: 22, carbs: 8, fat: 18, source: "local" },
  { id: "r2", name: "Döner (porsiyon)", calories: 420, protein: 28, carbs: 35, fat: 18, source: "local" },
  { id: "r3", name: "Lahmacun (1 adet)", calories: 380, protein: 16, carbs: 48, fat: 14, source: "local" },
  { id: "r4", name: "Pide Kaşarlı (1 dilim)", calories: 310, protein: 14, carbs: 42, fat: 10, source: "local" },
  { id: "r5", name: "Hamburger (orta boy)", calories: 540, protein: 28, carbs: 48, fat: 25, source: "local" },
  { id: "r6", name: "Pizza (1 dilim)", calories: 285, protein: 12, carbs: 36, fat: 10, source: "local" },
  { id: "r7", name: "Şiş Tavuk (1 porsiyon)", calories: 320, protein: 35, carbs: 5, fat: 16, source: "local" },
];

async function searchOpenFoodFacts(query: string): Promise<FoodItem[]> {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10&lc=tr`);
    const data = await res.json();
    return (data.products || []).slice(0, 8).map((p: any, i: number) => ({
      id: `off_${i}`,
      name: p.product_name || p.product_name_tr || "Bilinmeyen",
      brand: p.brands || "",
      calories: Math.round(p.nutriments?.["energy-kcal_100g"] || 0),
      protein: Math.round((p.nutriments?.proteins_100g || 0) * 10) / 10,
      carbs: Math.round((p.nutriments?.carbohydrates_100g || 0) * 10) / 10,
      fat: Math.round((p.nutriments?.fat_100g || 0) * 10) / 10,
      source: "openfoodfacts" as const,
    })).filter((f: FoodItem) => f.name !== "Bilinmeyen" && f.calories > 0);
  } catch { return []; }
}

export default function FoodDatabaseScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState("100");
  const [mealType, setMealType] = useState("lunch");
  const [filter, setFilter] = useState<"all" | "local" | "online">("all");

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const localResults = LOCAL_FOODS.filter(f =>
      f.name.toLowerCase().includes(query.toLowerCase())
    );
    const onlineResults = filter !== "local" ? await searchOpenFoodFacts(query) : [];
    const combined = [...localResults, ...onlineResults];
    setResults(combined);
    setLoading(false);
    if (combined.length === 0) Alert.alert("Bulunamadı", "Farklı bir arama yapmayı deneyin.");
  };

  const addToMeals = async () => {
    if (!selectedFood) return;
    const ratio = Number(quantity) / 100;
    const meal = {
      id: Date.now().toString(),
      type: mealType,
      description: `${selectedFood.name}${selectedFood.brand ? ` (${selectedFood.brand})` : ""} - ${quantity}g`,
      calories: Math.round(selectedFood.calories * ratio),
      date: new Date().toISOString().split("T")[0],
      items: [selectedFood.name],
    };
    const saved = await AsyncStorage.getItem(MEALS_KEY);
    const all = saved ? JSON.parse(saved) : [];
    await AsyncStorage.setItem(MEALS_KEY, JSON.stringify([...all, meal]));
    Alert.alert("✅ Eklendi!", `${selectedFood.name}\n🔥 ${meal.calories} kcal`);
    setSelectedFood(null); setQuantity("100");
  };

  const MEAL_TYPES = [
    { k: "breakfast", l: "🌅 Kahvaltı" },
    { k: "lunch", l: "☀️ Öğle" },
    { k: "dinner", l: "🌙 Akşam" },
    { k: "snack", l: "🍎 Ara" },
  ];

  return (
    <ScreenContainer>
      <BackButton title="🥗 Gıda Veritabanı" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: Math.max(insets.bottom + 24, 32) }}>

        {/* Arama */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TextInput value={query} onChangeText={setQuery} placeholder="Yemek ara... (örn: tavuk, elma, mercimek)"
            placeholderTextColor={colors.muted} onSubmitEditing={search}
            style={{ flex: 1, borderWidth: 1, borderColor: colors.primary, borderRadius: 10, padding: 12, color: colors.foreground, backgroundColor: colors.surface, fontSize: 15 }} />
          <TouchableOpacity onPress={search} disabled={loading}
            style={{ paddingHorizontal: 16, borderRadius: 10, backgroundColor: loading ? colors.border : colors.primary, justifyContent: "center" }}>
            {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>🔍</Text>}
          </TouchableOpacity>
        </View>

        {/* Filtre */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          {[{ k: "all", l: "🌍 Tümü" }, { k: "local", l: "🇹🇷 Türk" }, { k: "online", l: "📡 Online" }].map(f => (
            <TouchableOpacity key={f.k} onPress={() => setFilter(f.k as any)}
              style={{ flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center", backgroundColor: filter === f.k ? colors.primary : colors.surface, borderWidth: 1, borderColor: filter === f.k ? colors.primary : colors.border }}>
              <Text style={{ color: filter === f.k ? "#fff" : colors.foreground, fontWeight: "600", fontSize: 13 }}>{f.l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Hızlı kategoriler */}
        {results.length === 0 && (
          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: "600", color: colors.foreground }}>🔥 Sık Kullanılanlar</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {["Yumurta", "Tavuk", "Pilav", "Ekmek", "Yoğurt", "Muz", "Elma", "Mercimek"].map(q => (
                <TouchableOpacity key={q} onPress={() => { setQuery(q); setTimeout(search, 100); }}
                  style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                  <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 13 }}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Sonuçlar */}
        {results.map(food => (
          <TouchableOpacity key={food.id} onPress={() => setSelectedFood(food)}
            style={{ backgroundColor: selectedFood?.id === food.id ? colors.primary + "15" : colors.surface, borderRadius: 12, padding: 14, borderWidth: selectedFood?.id === food.id ? 2 : 1, borderColor: selectedFood?.id === food.id ? colors.primary : colors.border, gap: 6 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 15 }}>{food.name}</Text>
                {food.brand ? <Text style={{ color: colors.muted, fontSize: 12 }}>{food.brand}</Text> : null}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: food.source === "local" ? "#22c55e20" : "#3b82f620" }}>
                    <Text style={{ fontSize: 10, fontWeight: "600", color: food.source === "local" ? "#22c55e" : "#3b82f6" }}>
                      {food.source === "local" ? "🇹🇷 Yerel" : "📡 Online"}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 11, color: colors.muted }}>100g için</Text>
                </View>
              </View>
              <Text style={{ fontWeight: "bold", color: colors.primary, fontSize: 16 }}>{food.calories} kcal</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Text style={{ color: "#ef4444", fontSize: 12 }}>🥩 {food.protein}g</Text>
              <Text style={{ color: "#f59e0b", fontSize: 12 }}>🍞 {food.carbs}g</Text>
              <Text style={{ color: "#8b5cf6", fontSize: 12 }}>🫒 {food.fat}g</Text>
              {food.fiber ? <Text style={{ color: "#22c55e", fontSize: 12 }}>🌾 {food.fiber}g lif</Text> : null}
            </View>
          </TouchableOpacity>
        ))}

        {/* Seçili yemek - ekle */}
        {selectedFood && (
          <View style={{ backgroundColor: "#22c55e20", borderRadius: 14, padding: 16, borderWidth: 2, borderColor: "#22c55e", gap: 12 }}>
            <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>✅ {selectedFood.name}</Text>

            <View style={{ gap: 6 }}>
              <Text style={{ fontWeight: "600", color: colors.foreground }}>Miktar (gram)</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {["50", "100", "150", "200"].map(q => (
                  <TouchableOpacity key={q} onPress={() => setQuantity(q)}
                    style={{ flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center", backgroundColor: quantity === q ? colors.primary : colors.surface, borderWidth: 1, borderColor: quantity === q ? colors.primary : colors.border }}>
                    <Text style={{ color: quantity === q ? "#fff" : colors.foreground, fontWeight: "600" }}>{q}g</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput value={quantity} onChangeText={setQuantity} keyboardType="numeric" placeholderTextColor={colors.muted}
                style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, color: colors.foreground, backgroundColor: colors.background, textAlign: "center", fontSize: 16, fontWeight: "700" }} />
            </View>

            <View style={{ backgroundColor: colors.primary + "20", borderRadius: 10, padding: 10, borderWidth: 1, borderColor: colors.primary }}>
              <Text style={{ color: colors.primary, fontWeight: "700", textAlign: "center" }}>
                {quantity}g için: 🔥 {Math.round(selectedFood.calories * Number(quantity) / 100)} kcal
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 8 }}>
              {MEAL_TYPES.map(t => (
                <TouchableOpacity key={t.k} onPress={() => setMealType(t.k)}
                  style={{ flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center", backgroundColor: mealType === t.k ? colors.primary : colors.surface, borderWidth: 1, borderColor: mealType === t.k ? colors.primary : colors.border }}>
                  <Text style={{ color: mealType === t.k ? "#fff" : colors.foreground, fontSize: 11, fontWeight: "600" }}>{t.l}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={addToMeals}
              style={{ paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: "#22c55e" }}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>✅ Öğünlere Ekle</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
