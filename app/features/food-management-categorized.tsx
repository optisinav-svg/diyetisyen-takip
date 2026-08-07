import { useState, useMemo, useEffect } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { BackButton } from "@/components/back-button";
import { useColors } from "@/hooks/use-colors";
import { getUserRegistration } from "@/lib/_core/user-registration";
import { ALL_TURKISH_FOODS } from "@/lib/_core/turkish-cuisine-comprehensive";
import { ALL_ITALIAN_FOODS } from "@/lib/_core/italian-cuisine-comprehensive";
import { ALL_FRENCH_FOODS } from "@/lib/_core/french-cuisine-comprehensive";
import { ALL_JAPANESE_FOODS } from "@/lib/_core/japanese-cuisine-comprehensive";
import { ALL_KOREAN_FOODS } from "@/lib/_core/korean-cuisine-comprehensive";
import { ALL_CENTRAL_ASIAN_FOODS } from "@/lib/_core/central-asian-cuisine-comprehensive";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RULES_KEY = "dietitian_food_rules";
const GROUPS_KEY = "dietitian_food_groups";

interface FoodRule {
  foodId: string;
  foodName: string;
  type: "recommended" | "forbidden";
  cuisine: string;
  category: string;
}

interface FoodGroup {
  id: string;
  name: string;
  type: "recommended" | "forbidden" | "mixed";
  foods: FoodRule[];
  createdAt: string;
}

const CUISINES = [
  { key: "turkish", label: "🇹🇷 Türk", foods: ALL_TURKISH_FOODS },
  { key: "italian", label: "🇮🇹 İtalyan", foods: ALL_ITALIAN_FOODS },
  { key: "french", label: "🇫🇷 Fransız", foods: ALL_FRENCH_FOODS },
  { key: "japanese", label: "🇯🇵 Japon", foods: ALL_JAPANESE_FOODS },
  { key: "korean", label: "🇰🇷 Kore", foods: ALL_KOREAN_FOODS },
  { key: "central_asian", label: "🌏 Orta Asya", foods: ALL_CENTRAL_ASIAN_FOODS },
];

const FOOD_CATEGORIES = ["Tümü", "Çorba", "Tatlı", "Salata", "Kuruyemiş", "Meyve", "Pilav", "Hamur İşi", "Sulu Yemek", "Et", "Sebze", "İçecek", "Kahvaltı"];

export default function FoodManagementCategorized() {
  const colors = useColors();
  const [role, setRole] = useState<"dietitian" | "client">("client");
  const [selectedCuisine, setSelectedCuisine] = useState("turkish");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [search, setSearch] = useState("");
  const [rules, setRules] = useState<FoodRule[]>([]);
  const [groups, setGroups] = useState<FoodGroup[]>([]);
  const [activeTab, setActiveTab] = useState<"catalog" | "rules" | "groups">("catalog");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupType, setNewGroupType] = useState<"recommended" | "forbidden" | "mixed">("recommended");
  const [showNewGroup, setShowNewGroup] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const user = await getUserRegistration();
    setRole(user?.role ?? "client");
    const savedRules = await AsyncStorage.getItem(RULES_KEY);
    if (savedRules) setRules(JSON.parse(savedRules));
    const savedGroups = await AsyncStorage.getItem(GROUPS_KEY);
    if (savedGroups) setGroups(JSON.parse(savedGroups));
  };

  const saveRules = async (newRules: FoodRule[]) => {
    setRules(newRules);
    await AsyncStorage.setItem(RULES_KEY, JSON.stringify(newRules));
  };

  const setRule = async (food: any, type: "recommended" | "forbidden") => {
    const existing = rules.find(r => r.foodId === food.id);
    let newRules: FoodRule[];
    if (existing?.type === type) {
      newRules = rules.filter(r => r.foodId !== food.id);
    } else {
      newRules = rules.filter(r => r.foodId !== food.id);
      newRules.push({ foodId: food.id, foodName: food.name, type, cuisine: selectedCuisine, category: food.category ?? "" });
    }
    await saveRules(newRules);
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) { Alert.alert("Hata", "Grup adı girin"); return; }
    const group: FoodGroup = {
      id: Date.now().toString(),
      name: newGroupName,
      type: newGroupType,
      foods: rules.filter(r => newGroupType === "mixed" ? true : r.type === newGroupType),
      createdAt: new Date().toISOString(),
    };
    const updated = [...groups, group];
    setGroups(updated);
    await AsyncStorage.setItem(GROUPS_KEY, JSON.stringify(updated));
    setNewGroupName("");
    setShowNewGroup(false);
    Alert.alert("Oluşturuldu", `"${group.name}" grubu oluşturuldu.`);
  };

  const deleteGroup = async (id: string) => {
    const updated = groups.filter(g => g.id !== id);
    setGroups(updated);
    await AsyncStorage.setItem(GROUPS_KEY, JSON.stringify(updated));
  };

  const currentCuisine = CUISINES.find(c => c.key === selectedCuisine)!;

  const filteredFoods = useMemo(() => {
    let foods = currentCuisine?.foods ?? [];
    if (search.trim()) {
      foods = foods.filter((f: any) =>
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        (f.category && f.category.toLowerCase().includes(search.toLowerCase()))
      );
    }
    if (selectedCategory !== "Tümü") {
      foods = foods.filter((f: any) =>
        f.category && f.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }
    return foods;
  }, [currentCuisine, search, selectedCategory]);

  const recommended = rules.filter(r => r.type === "recommended");
  const forbidden = rules.filter(r => r.type === "forbidden");

  const groupTypeColor = (type: string) => type === "recommended" ? "#22c55e" : type === "forbidden" ? "#ef4444" : colors.primary;
  const groupTypeLabel = (type: string) => type === "recommended" ? "✅ Önerilenler" : type === "forbidden" ? "🚫 Yasaklılar" : "📋 Karışık";

  return (
    <ScreenContainer>
      <BackButton title="🍽️ Mutfak Gıdaları" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {(["catalog", "rules", "groups"] as const).map(tab => (
              <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}
                style={{
                  paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10,
                  backgroundColor: activeTab === tab ? colors.primary : colors.surface,
                  borderWidth: 1, borderColor: activeTab === tab ? colors.primary : colors.border,
                }}>
                <Text style={{ color: activeTab === tab ? "#fff" : colors.foreground, fontWeight: "600", fontSize: 13 }}>
                  {tab === "catalog" ? "🌍 Katalog" : tab === "rules" ? `📋 Kurallar (${rules.length})` : `📦 Gruplar (${groups.length})`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {activeTab === "catalog" && (
          <>
            {/* Mutfak Seçimi */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {CUISINES.map(c => (
                  <TouchableOpacity key={c.key} onPress={() => { setSelectedCuisine(c.key); setSearch(""); setSelectedCategory("Tümü"); }}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                      backgroundColor: selectedCuisine === c.key ? colors.primary : colors.surface,
                      borderWidth: 1, borderColor: selectedCuisine === c.key ? colors.primary : colors.border,
                    }}>
                    <Text style={{ color: selectedCuisine === c.key ? "#fff" : colors.foreground, fontWeight: "600", fontSize: 13 }}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Kategori Seçimi */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {FOOD_CATEGORIES.map(cat => (
                  <TouchableOpacity key={cat} onPress={() => setSelectedCategory(cat)}
                    style={{
                      paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
                      backgroundColor: selectedCategory === cat ? colors.primary + "30" : colors.surface,
                      borderWidth: 1, borderColor: selectedCategory === cat ? colors.primary : colors.border,
                    }}>
                    <Text style={{ color: selectedCategory === cat ? colors.primary : colors.foreground, fontSize: 12, fontWeight: "600" }}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Arama */}
            <TextInput
              placeholder="Gıda ara..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor={colors.muted}
              style={{
                borderWidth: 1, borderColor: colors.border, borderRadius: 10,
                padding: 12, color: colors.foreground, backgroundColor: colors.surface, fontSize: 14,
              }}
            />

            <Text style={{ fontSize: 13, color: colors.muted }}>{filteredFoods.length} gıda</Text>

            {filteredFoods.slice(0, 40).map((food: any) => {
              const rule = rules.find(r => r.foodId === food.id);
              const isRec = rule?.type === "recommended";
              const isFob = rule?.type === "forbidden";
              return (
                <View key={food.id} style={{
                  backgroundColor: colors.surface, borderRadius: 12, padding: 14,
                  borderWidth: 2,
                  borderColor: isRec ? "#22c55e" : isFob ? "#ef4444" : colors.border,
                }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={{ fontSize: 15, fontWeight: "700", color: colors.foreground }}>
                        {isRec ? "✅ " : isFob ? "🚫 " : ""}{food.name}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.muted }}>
                        {food.category}{food.subcategory ? ` › ${food.subcategory}` : ""}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.muted }}>
                        {food.calories} kcal · {food.servingSize}{food.servingUnit}
                        {food.protein ? ` · P: ${food.protein}g` : ""}
                        {food.carbs ? ` · K: ${food.carbs}g` : ""}
                        {food.fat ? ` · Y: ${food.fat}g` : ""}
                      </Text>
                    </View>
                    {role === "dietitian" && (
                      <View style={{ gap: 6, marginLeft: 8 }}>
                        <TouchableOpacity onPress={() => setRule(food, "recommended")}
                          style={{
                            paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
                            backgroundColor: isRec ? "#22c55e" : colors.surface,
                            borderWidth: 1, borderColor: isRec ? "#22c55e" : colors.border,
                          }}>
                          <Text style={{ fontSize: 12, color: isRec ? "#fff" : colors.foreground, fontWeight: "600" }}>✅ Öner</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setRule(food, "forbidden")}
                          style={{
                            paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
                            backgroundColor: isFob ? "#ef4444" : colors.surface,
                            borderWidth: 1, borderColor: isFob ? "#ef4444" : colors.border,
                          }}>
                          <Text style={{ fontSize: 12, color: isFob ? "#fff" : colors.foreground, fontWeight: "600" }}>🚫 Yasakla</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                  {food.healthBenefits?.length > 0 && (
                    <Text style={{ fontSize: 11, color: "#22c55e", marginTop: 6 }}>
                      💚 {food.healthBenefits.slice(0, 2).join(", ")}
                    </Text>
                  )}
                </View>
              );
            })}
            {filteredFoods.length > 40 && (
              <Text style={{ textAlign: "center", color: colors.muted, fontSize: 13 }}>
                Arama yaparak daraltın — {filteredFoods.length - 40} gıda daha var.
              </Text>
            )}
          </>
        )}

        {activeTab === "rules" && (
          <>
            <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#22c55e" }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#22c55e", marginBottom: 12 }}>✅ Önerilen ({recommended.length})</Text>
              {recommended.length === 0 ? (
                <Text style={{ color: colors.muted }}>{role === "dietitian" ? "Henüz öneri eklenmedi." : "Diyetisyeniniz henüz öneri eklemedi."}</Text>
              ) : recommended.map(r => (
                <View key={r.foodId} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 }}>
                  <Text style={{ color: colors.foreground }}>• {r.foodName}</Text>
                  {role === "dietitian" && (
                    <TouchableOpacity onPress={() => saveRules(rules.filter(x => x.foodId !== r.foodId))}>
                      <Text style={{ color: "#ef4444", fontSize: 12 }}>Kaldır</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#ef4444" }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#ef4444", marginBottom: 12 }}>🚫 Yasaklı ({forbidden.length})</Text>
              {forbidden.length === 0 ? (
                <Text style={{ color: colors.muted }}>{role === "dietitian" ? "Henüz yasak eklenmedi." : "Diyetisyeniniz henüz yasak eklemedi."}</Text>
              ) : forbidden.map(r => (
                <View key={r.foodId} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 }}>
                  <Text style={{ color: colors.foreground }}>• {r.foodName}</Text>
                  {role === "dietitian" && (
                    <TouchableOpacity onPress={() => saveRules(rules.filter(x => x.foodId !== r.foodId))}>
                      <Text style={{ color: "#ef4444", fontSize: 12 }}>Kaldır</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </>
        )}

        {activeTab === "groups" && (
          <>
            {role === "dietitian" && (
              <>
                <TouchableOpacity onPress={() => setShowNewGroup(!showNewGroup)}
                  style={{ paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: colors.primary }}>
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>+ Yeni Grup Oluştur</Text>
                </TouchableOpacity>

                {showNewGroup && (
                  <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, gap: 12, borderWidth: 1, borderColor: colors.border }}>
                    <TextInput
                      placeholder="Grup adı (örn: Diyabetik Liste)"
                      value={newGroupName}
                      onChangeText={setNewGroupName}
                      placeholderTextColor={colors.muted}
                      style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.foreground, backgroundColor: colors.background }}
                    />
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      {(["recommended", "forbidden", "mixed"] as const).map(t => (
                        <TouchableOpacity key={t} onPress={() => setNewGroupType(t)}
                          style={{
                            flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center",
                            backgroundColor: newGroupType === t ? groupTypeColor(t) : colors.surface,
                            borderWidth: 1, borderColor: groupTypeColor(t),
                          }}>
                          <Text style={{ color: newGroupType === t ? "#fff" : groupTypeColor(t), fontSize: 11, fontWeight: "600" }}>
                            {groupTypeLabel(t)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <TouchableOpacity onPress={createGroup}
                      style={{ paddingVertical: 12, borderRadius: 10, alignItems: "center", backgroundColor: colors.primary }}>
                      <Text style={{ color: "#fff", fontWeight: "700" }}>Oluştur</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}

            {groups.length === 0 ? (
              <Text style={{ color: colors.muted, textAlign: "center", marginTop: 20 }}>
                {role === "dietitian" ? "Henüz grup oluşturulmadı." : "Diyetisyeniniz henüz grup oluşturmadı."}
              </Text>
            ) : groups.map(group => (
              <View key={group.id} style={{
                backgroundColor: colors.surface, borderRadius: 12, padding: 16, gap: 8,
                borderWidth: 2, borderColor: groupTypeColor(group.type),
              }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>{group.name}</Text>
                    <Text style={{ fontSize: 12, color: groupTypeColor(group.type), fontWeight: "600" }}>
                      {groupTypeLabel(group.type)} · {group.foods.length} gıda
                    </Text>
                  </View>
                  {role === "dietitian" && (
                    <TouchableOpacity onPress={() => deleteGroup(group.id)}>
                      <Text style={{ color: "#ef4444", fontSize: 13 }}>Sil</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {group.foods.slice(0, 5).map(f => (
                  <Text key={f.foodId} style={{ color: colors.muted, fontSize: 13 }}>• {f.foodName}</Text>
                ))}
                {group.foods.length > 5 && (
                  <Text style={{ color: colors.muted, fontSize: 12 }}>... ve {group.foods.length - 5} gıda daha</Text>
                )}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
