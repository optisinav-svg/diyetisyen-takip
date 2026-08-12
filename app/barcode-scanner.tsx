import { Text, View, TouchableOpacity, Alert, ScrollView, TextInput } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { BackButton } from "@/components/back-button";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MEALS_KEY = "meals_v3";

interface FoodResult {
  name: string;
  brand: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
  barcode: string;
}

// Open Food Facts API'den ürün çek
async function fetchProductByBarcode(barcode: string): Promise<FoodResult | null> {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await response.json();
    if (data.status !== 1 || !data.product) return null;
    const p = data.product;
    const n = p.nutriments || {};
    return {
      name: p.product_name || p.product_name_tr || "Bilinmeyen Ürün",
      brand: p.brands || "",
      calories: Math.round(n["energy-kcal_100g"] || n["energy-kcal"] || 0),
      protein: Math.round((n.proteins_100g || 0) * 10) / 10,
      carbs: Math.round((n.carbohydrates_100g || 0) * 10) / 10,
      fat: Math.round((n.fat_100g || 0) * 10) / 10,
      serving: p.serving_size || "100g",
      barcode,
    };
  } catch {
    return null;
  }
}

// Demo ürünler (barkod yokken test için)
const DEMO_PRODUCTS: Record<string, FoodResult> = {
  "8690637094100": { name: "Ülker Çikolatalı Gofret", brand: "Ülker", calories: 498, protein: 6.2, carbs: 61.4, fat: 25.3, serving: "36g", barcode: "8690637094100" },
  "8690526430605": { name: "Pınar Süt", brand: "Pınar", calories: 64, protein: 3.2, carbs: 4.8, fat: 3.5, serving: "200ml", barcode: "8690526430605" },
  "8690504011064": { name: "Eti Tutku Bisküvi", brand: "Eti", calories: 467, protein: 7.8, carbs: 67.2, fat: 18.5, serving: "75g", barcode: "8690504011064" },
  "8690632011019": { name: "Torku Yoğurt", brand: "Torku", calories: 66, protein: 3.8, carbs: 5.2, fat: 3.2, serving: "200g", barcode: "8690632011019" },
};

export default function BarcodeScannerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [manualBarcode, setManualBarcode] = useState("");
  const [result, setResult] = useState<FoodResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState("100");
  const [mealType, setMealType] = useState("lunch");

  const searchBarcode = async (barcode: string) => {
    if (!barcode.trim()) { Alert.alert("Hata", "Barkod girin"); return; }
    setLoading(true); setResult(null);
    // Önce demo ürünlere bak
    if (DEMO_PRODUCTS[barcode.trim()]) {
      setResult(DEMO_PRODUCTS[barcode.trim()]);
      setLoading(false); return;
    }
    // Open Food Facts API
    const product = await fetchProductByBarcode(barcode.trim());
    if (product) setResult(product);
    else Alert.alert("Ürün Bulunamadı", "Bu barkod veritabanında yok. Manuel olarak ekleyebilirsiniz.");
    setLoading(false);
  };

  const addToMeals = async () => {
    if (!result) return;
    const ratio = Number(quantity) / 100;
    const meal = {
      id: Date.now().toString(),
      type: mealType,
      description: `${result.name}${result.brand ? ` (${result.brand})` : ""} - ${quantity}g/${quantity}ml`,
      calories: Math.round(result.calories * ratio),
      date: new Date().toISOString().split("T")[0],
      items: [result.name],
      macros: {
        protein: Math.round(result.protein * ratio * 10) / 10,
        carbs: Math.round(result.carbs * ratio * 10) / 10,
        fat: Math.round(result.fat * ratio * 10) / 10,
      }
    };
    const saved = await AsyncStorage.getItem(MEALS_KEY);
    const all = saved ? JSON.parse(saved) : [];
    await AsyncStorage.setItem(MEALS_KEY, JSON.stringify([...all, meal]));
    Alert.alert("✅ Eklendi!", `${result.name} öğünlerinize eklendi.\n🔥 ${meal.calories} kcal`);
    setResult(null); setManualBarcode(""); setQuantity("100");
  };

  const MEAL_TYPES = [
    { k: "breakfast", l: "🌅 Kahvaltı" },
    { k: "lunch", l: "☀️ Öğle" },
    { k: "dinner", l: "🌙 Akşam" },
    { k: "snack", l: "🍎 Ara" },
  ];

  const ratio = Number(quantity) / 100;

  return (
    <ScreenContainer>
      <BackButton title="🔍 Barkod Tarayıcı" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: Math.max(insets.bottom + 24, 32) }}>

        {/* Kamera tarayıcı (Store sürümü) */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 20, borderWidth: 1, borderColor: colors.border, alignItems: "center", gap: 12 }}>
          <View style={{ width: 200, height: 140, backgroundColor: colors.border + "40", borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: colors.primary, borderStyle: "dashed" }}>
            <Text style={{ fontSize: 48 }}>📷</Text>
            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 8, textAlign: "center" }}>Kamera ile tarama{"\n"}Store sürümünde aktif</Text>
          </View>
          <TouchableOpacity onPress={() => Alert.alert("Kamera", "Store sürümünde gerçek barkod taraması aktif olacak. Şimdilik manuel giriş kullanın.")}
            style={{ paddingVertical: 12, paddingHorizontal: 24, borderRadius: 20, backgroundColor: colors.primary }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>📷 Kamera ile Tara</Text>
          </TouchableOpacity>
        </View>

        {/* Manuel barkod girişi */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 12 }}>
          <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>⌨️ Manuel Barkod Gir</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TextInput value={manualBarcode} onChangeText={setManualBarcode}
              placeholder="8690637094100" keyboardType="numeric" placeholderTextColor={colors.muted}
              style={{ flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.foreground, backgroundColor: colors.background, fontSize: 15 }} />
            <TouchableOpacity onPress={() => searchBarcode(manualBarcode)} disabled={loading}
              style={{ paddingHorizontal: 16, borderRadius: 10, backgroundColor: loading ? colors.border : colors.primary, justifyContent: "center" }}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>{loading ? "..." : "Ara"}</Text>
            </TouchableOpacity>
          </View>

          {/* Demo barkodlar */}
          <Text style={{ color: colors.muted, fontSize: 12 }}>Test için demo barkodlar:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {Object.entries(DEMO_PRODUCTS).map(([code, p]) => (
                <TouchableOpacity key={code} onPress={() => { setManualBarcode(code); searchBarcode(code); }}
                  style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                  <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "600" }}>{p.name.split(" ").slice(0, 2).join(" ")}</Text>
                  <Text style={{ color: colors.muted, fontSize: 10 }}>{code}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Sonuç */}
        {result && (
          <View style={{ backgroundColor: "#22c55e20", borderRadius: 14, padding: 16, borderWidth: 2, borderColor: "#22c55e", gap: 14 }}>
            <View>
              <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground }}>{result.name}</Text>
              {result.brand ? <Text style={{ color: colors.muted, fontSize: 13 }}>{result.brand}</Text> : null}
              <Text style={{ color: colors.muted, fontSize: 11 }}>Barkod: {result.barcode}</Text>
            </View>

            {/* Besin değerleri (100g için) */}
            <View style={{ backgroundColor: colors.surface, borderRadius: 10, padding: 12, gap: 8 }}>
              <Text style={{ fontWeight: "600", color: colors.foreground, fontSize: 13 }}>📊 100g için besin değerleri:</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {[
                  { icon: "🔥", label: "Kalori", value: `${result.calories} kcal`, color: "#f97316" },
                  { icon: "🥩", label: "Protein", value: `${result.protein}g`, color: "#ef4444" },
                  { icon: "🍞", label: "Karb.", value: `${result.carbs}g`, color: "#f59e0b" },
                  { icon: "🫒", label: "Yağ", value: `${result.fat}g`, color: "#8b5cf6" },
                ].map(item => (
                  <View key={item.label} style={{ flex: 1, minWidth: "45%", backgroundColor: item.color + "15", borderRadius: 8, padding: 8, borderWidth: 1, borderColor: item.color + "30" }}>
                    <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                    <Text style={{ fontWeight: "700", color: item.color, fontSize: 14 }}>{item.value}</Text>
                    <Text style={{ fontSize: 10, color: colors.muted }}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Miktar */}
            <View style={{ gap: 6 }}>
              <Text style={{ fontWeight: "600", color: colors.foreground }}>Miktar (g/ml)</Text>
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

            {/* Hesaplanan değer */}
            <View style={{ backgroundColor: colors.primary + "20", borderRadius: 10, padding: 10, borderWidth: 1, borderColor: colors.primary }}>
              <Text style={{ color: colors.primary, fontWeight: "700", textAlign: "center", fontSize: 15 }}>
                {quantity}g için: 🔥 {Math.round(result.calories * ratio)} kcal · 🥩 {(result.protein * ratio).toFixed(1)}g · 🍞 {(result.carbs * ratio).toFixed(1)}g · 🫒 {(result.fat * ratio).toFixed(1)}g
              </Text>
            </View>

            {/* Öğün tipi */}
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
