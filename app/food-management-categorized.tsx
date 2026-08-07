import { useState, useMemo, useEffect } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, Modal, FlatList } from "react-native";
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
import { TURKEY_FRUITS, TURKEY_NUTS } from "@/lib/_core/fruits-nuts-data";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GROUPS_KEY = "food_groups_v2";
const CLIENT_FOODS_KEY = "client_eaten_foods";

interface FoodGroup {
  id: string;
  name: string;
  type: "recommended" | "forbidden" | "mixed";
  foods: any[];
  assignedClients: string[];
  createdAt: string;
}

const CUISINES = [
  { key: "turkish", label: "🇹🇷 Türk", foods: ALL_TURKISH_FOODS },
  { key: "italian", label: "🇮🇹 İtalyan", foods: ALL_ITALIAN_FOODS },
  { key: "french", label: "🇫🇷 Fransız", foods: ALL_FRENCH_FOODS },
  { key: "japanese", label: "🇯🇵 Japon", foods: ALL_JAPANESE_FOODS },
  { key: "korean", label: "🇰🇷 Kore", foods: ALL_KOREAN_FOODS },
  { key: "central_asian", label: "🌏 Orta Asya", foods: ALL_CENTRAL_ASIAN_FOODS },
  { key: "fruits", label: "🍎 Meyveler", foods: TURKEY_FRUITS },
  { key: "nuts", label: "🥜 Kuruyemiş", foods: TURKEY_NUTS },
];

const FOOD_CATEGORIES = [
  "Tümü", "Çorba", "Hamur İşi", "Salata", "Meyve", "Kuruyemiş",
  "Pilav", "Et", "Balık", "Sebze", "Tatlı", "Kahvaltı", "İçecek", "Sulu Yemek",
];

const SAMPLE_CLIENTS = [
  { id: "c1", name: "Ayşe Yılmaz" },
  { id: "c2", name: "Mehmet Demir" },
  { id: "c3", name: "Fatma Kaya" },
];

const GROUP_COLORS = {
  recommended: { color: "#22c55e", bg: "#22c55e20", label: "✅ Önerilen" },
  forbidden: { color: "#ef4444", bg: "#ef444420", label: "🚫 Yasaklı" },
  mixed: { color: "#3b82f6", bg: "#3b82f620", label: "📋 Karışık" },
};

export default function FoodManagementCategorized() {
  const colors = useColors();
  const [role, setRole] = useState<"dietitian" | "client">("client");
  const [selectedCuisine, setSelectedCuisine] = useState("turkish");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState<FoodGroup[]>([]);
  const [eatenFoods, setEatenFoods] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"catalog" | "groups" | "my-foods">("catalog");

  // Group creation
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupType, setGroupType] = useState<"recommended" | "forbidden" | "mixed">("recommended");
  const [selectedFoodsForGroup, setSelectedFoodsForGroup] = useState<any[]>([]);
  const [assignedClients, setAssignedClients] = useState<string[]>([]);
  const [editingGroup, setEditingGroup] = useState<FoodGroup | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const user = await getUserRegistration();
    setRole(user?.role ?? "client");
    const savedGroups = await AsyncStorage.getItem(GROUPS_KEY);
    if (savedGroups) setGroups(JSON.parse(savedGroups));
    const savedEaten = await AsyncStorage.getItem(CLIENT_FOODS_KEY);
    if (savedEaten) setEatenFoods(JSON.parse(savedEaten));
  };

  const saveGroups = async (list: FoodGroup[]) => {
    setGroups(list);
    await AsyncStorage.setItem(GROUPS_KEY, JSON.stringify(list));
  };

  const saveEatenFoods = async (list: string[]) => {
    setEatenFoods(list);
    await AsyncStorage.setItem(CLIENT_FOODS_KEY, JSON.stringify(list));
  };

  const currentCuisine = CUISINES.find(c => c.key === selectedCuisine)!;

  const filteredFoods = useMemo(() => {
    let foods = currentCuisine?.foods ?? [];
    if (search.trim()) {
      foods = foods.filter((f: any) => f.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (selectedCategory !== "Tümü") {
      foods = foods.filter((f: any) =>
        f.category && f.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }
    return foods;
  }, [currentCuisine, search, selectedCategory]);

  const toggleFoodForGroup = (food: any) => {
    const exists = selectedFoodsForGroup.find(f => f.id === food.id);
    if (exists) {
      setSelectedFoodsForGroup(prev => prev.filter(f => f.id !== food.id));
    } else {
      setSelectedFoodsForGroup(prev => [...prev, food]);
    }
  };

  const toggleEaten = async (food: any) => {
    const updated = eatenFoods.includes(food.id)
      ? eatenFoods.filter(id => id !== food.id)
      : [...eatenFoods, food.id];
    await saveEatenFoods(updated);
  };

  const createOrUpdateGroup = async () => {
    if (!groupName.trim()) { Alert.alert("Hata", "Grup adı girin"); return; }
    if (selectedFoodsForGroup.length === 0) { Alert.alert("Hata", "En az bir yemek seçin"); return; }

    if (editingGroup) {
      const updated = groups.map(g => g.id === editingGroup.id
        ? { ...g, name: groupName, type: groupType, foods: selectedFoodsForGroup, assignedClients }
        : g
      );
      await saveGroups(updated);
      Alert.alert("Güncellendi", `"${groupName}" grubu güncellendi.`);
    } else {
      const group: FoodGroup = {
        id: Date.now().toString(),
        name: groupName,
        type: groupType,
        foods: selectedFoodsForGroup,
        assignedClients,
        createdAt: new Date().toISOString(),
      };
      await saveGroups([...groups, group]);
      Alert.alert("Oluşturuldu", `"${groupName}" grubu oluşturuldu.`);
    }
    setShowCreateGroup(false);
    setGroupName(""); setGroupType("recommended");
    setSelectedFoodsForGroup([]); setAssignedClients([]);
    setEditingGroup(null);
  };

  const deleteGroup = async (id: string) => {
    Alert.alert("Sil", "Bu grubu silmek istiyor musunuz?", [
      { text: "İptal", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: () => saveGroups(groups.filter(g => g.id !== id)) },
    ]);
  };

  const startEdit = (group: FoodGroup) => {
    setEditingGroup(group);
    setGroupName(group.name);
    setGroupType(group.type);
    setSelectedFoodsForGroup(group.foods);
    setAssignedClients(group.assignedClients);
    setShowCreateGroup(true);
  };

  // Danışanın göreceği gruplar
  const myGroups = groups.filter(g =>
    g.assignedClients.length === 0 || g.assignedClients.includes("c1")
  );

  return (
    <ScreenContainer>
      <BackButton title="🍽️ Gıda Yönetimi" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>

        {/* Diyetisyen Tabs */}
        {role === "dietitian" && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {[
                { key: "catalog", label: "🌍 Katalog" },
                { key: "groups", label: `📦 Gruplar (${groups.length})` },
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
        )}

        {/* Danışan Tabs */}
        {role === "client" && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {[
                { key: "groups", label: "📋 Diyetisyen Listeleri" },
                { key: "my-foods", label: `✅ Yediklerim (${eatenFoods.length})` },
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
        )}

        {/* ── DİYETİSYEN: KATALOG ── */}
        {role === "dietitian" && activeTab === "catalog" && (
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

            {/* Kategori Butonları */}
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

            <TextInput
              placeholder="Gıda ara..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor={colors.muted}
              style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.foreground, backgroundColor: colors.surface, fontSize: 14 }}
            />

            {showCreateGroup && (
              <View style={{ backgroundColor: "#3b82f620", borderRadius: 10, padding: 10, borderWidth: 1, borderColor: "#3b82f6" }}>
                <Text style={{ color: "#3b82f6", fontWeight: "600" }}>
                  ✓ {selectedFoodsForGroup.length} yemek seçildi — Grup oluşturmak için "Gruplar" sekmesine gidin
                </Text>
              </View>
            )}

            <Text style={{ color: colors.muted, fontSize: 13 }}>{filteredFoods.length} gıda</Text>

            {filteredFoods.slice(0, 50).map((food: any) => {
              const inGroup = selectedFoodsForGroup.find(f => f.id === food.id);
              return (
                <TouchableOpacity key={food.id} onPress={() => toggleFoodForGroup(food)}
                  style={{
                    backgroundColor: inGroup ? colors.primary + "20" : colors.surface,
                    borderRadius: 12, padding: 14,
                    borderWidth: inGroup ? 2 : 1,
                    borderColor: inGroup ? colors.primary : colors.border,
                    flexDirection: "row", alignItems: "center", gap: 10,
                  }}>
                  <View style={{
                    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
                    borderColor: inGroup ? colors.primary : colors.border,
                    backgroundColor: inGroup ? colors.primary : "transparent",
                    alignItems: "center", justifyContent: "center",
                  }}>
                    {inGroup && <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>✓</Text>}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground }}>{food.name}</Text>
                    <Text style={{ fontSize: 12, color: colors.muted }}>
                      {food.category} · {food.calories} kcal/{food.servingSize}{food.servingUnit}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {filteredFoods.length > 50 && (
              <Text style={{ textAlign: "center", color: colors.muted, fontSize: 13 }}>
                Aramayı daraltın — {filteredFoods.length - 50} gıda daha var
              </Text>
            )}
          </>
        )}

        {/* ── DİYETİSYEN: GRUPLAR ── */}
        {role === "dietitian" && activeTab === "groups" && (
          <>
            <TouchableOpacity onPress={() => { setEditingGroup(null); setShowCreateGroup(!showCreateGroup); }}
              style={{ paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: colors.primary }}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
                {showCreateGroup ? "✕ İptal" : "+ Yeni Grup Oluştur"}
              </Text>
            </TouchableOpacity>

            {showCreateGroup && (
              <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, gap: 12, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>
                  {editingGroup ? "✏️ Grubu Düzenle" : "➕ Yeni Grup"}
                </Text>

                <TextInput value={groupName} onChangeText={setGroupName}
                  placeholder="Grup adı (örn: Diyabetik Öneri Listesi)"
                  placeholderTextColor={colors.muted}
                  style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.foreground, backgroundColor: colors.background }} />

                {/* Grup Tipi */}
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {(["recommended", "forbidden", "mixed"] as const).map(t => (
                    <TouchableOpacity key={t} onPress={() => setGroupType(t)}
                      style={{
                        flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center",
                        backgroundColor: groupType === t ? GROUP_COLORS[t].color : colors.surface,
                        borderWidth: 1, borderColor: GROUP_COLORS[t].color,
                      }}>
                      <Text style={{ color: groupType === t ? "#fff" : GROUP_COLORS[t].color, fontWeight: "600", fontSize: 11 }}>
                        {GROUP_COLORS[t].label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Seçili Yemekler */}
                <View style={{ gap: 6 }}>
                  <Text style={{ fontWeight: "600", color: colors.foreground }}>
                    Seçili Yemekler ({selectedFoodsForGroup.length})
                  </Text>
                  {selectedFoodsForGroup.length === 0 ? (
                    <Text style={{ color: colors.muted, fontSize: 13 }}>
                      Katalog sekmesinden yemek seçin veya aşağıdan ekleyin
                    </Text>
                  ) : (
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                      {selectedFoodsForGroup.map(f => (
                        <TouchableOpacity key={f.id} onPress={() => toggleFoodForGroup(f)}
                          style={{ backgroundColor: GROUP_COLORS[groupType].bg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: GROUP_COLORS[groupType].color, flexDirection: "row", alignItems: "center", gap: 4 }}>
                          <Text style={{ color: GROUP_COLORS[groupType].color, fontSize: 12 }}>{f.name}</Text>
                          <Text style={{ color: "#ef4444", fontSize: 12 }}>✕</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Danışan Atama */}
                <View style={{ gap: 8 }}>
                  <Text style={{ fontWeight: "600", color: colors.foreground }}>Danışanlara Ata</Text>
                  {SAMPLE_CLIENTS.map(c => (
                    <TouchableOpacity key={c.id}
                      onPress={() => setAssignedClients(prev =>
                        prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id]
                      )}
                      style={{
                        flexDirection: "row", alignItems: "center", gap: 10,
                        padding: 10, borderRadius: 10,
                        backgroundColor: assignedClients.includes(c.id) ? colors.primary + "20" : colors.background,
                        borderWidth: 1, borderColor: assignedClients.includes(c.id) ? colors.primary : colors.border,
                      }}>
                      <View style={{
                        width: 20, height: 20, borderRadius: 6, borderWidth: 2,
                        borderColor: assignedClients.includes(c.id) ? colors.primary : colors.border,
                        backgroundColor: assignedClients.includes(c.id) ? colors.primary : "transparent",
                        alignItems: "center", justifyContent: "center",
                      }}>
                        {assignedClients.includes(c.id) && <Text style={{ color: "#fff", fontSize: 11 }}>✓</Text>}
                      </View>
                      <Text style={{ color: colors.foreground }}>👤 {c.name}</Text>
                    </TouchableOpacity>
                  ))}
                  <Text style={{ color: colors.muted, fontSize: 12 }}>
                    {assignedClients.length === 0 ? "Boş bırakırsanız tüm danışanlar görür" : `${assignedClients.length} danışana atandı`}
                  </Text>
                </View>

                <TouchableOpacity onPress={createOrUpdateGroup}
                  style={{ paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: GROUP_COLORS[groupType].color }}>
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
                    {editingGroup ? "💾 Güncelle" : "✅ Grubu Oluştur"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Grup Listesi */}
            {groups.length === 0 ? (
              <Text style={{ color: colors.muted, textAlign: "center", marginTop: 20 }}>Henüz grup oluşturulmadı.</Text>
            ) : groups.map(group => {
              const gc = GROUP_COLORS[group.type];
              return (
                <View key={group.id} style={{
                  backgroundColor: colors.surface, borderRadius: 12, padding: 16, gap: 10,
                  borderWidth: 2, borderColor: gc.color,
                }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <View>
                      <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>{group.name}</Text>
                      <Text style={{ color: gc.color, fontSize: 13, fontWeight: "600" }}>
                        {gc.label} · {group.foods.length} yemek
                      </Text>
                      <Text style={{ color: colors.muted, fontSize: 12 }}>
                        {group.assignedClients.length === 0
                          ? "Tüm danışanlar"
                          : SAMPLE_CLIENTS.filter(c => group.assignedClients.includes(c.id)).map(c => c.name).join(", ")}
                      </Text>
                    </View>
                    <View style={{ gap: 6 }}>
                      <TouchableOpacity onPress={() => startEdit(group)}
                        style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: colors.primary + "20" }}>
                        <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "600" }}>✏️ Düzenle</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteGroup(group.id)}
                        style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: "#ef444420" }}>
                        <Text style={{ color: "#ef4444", fontSize: 12, fontWeight: "600" }}>🗑️ Sil</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                    {group.foods.slice(0, 8).map(f => (
                      <View key={f.id} style={{ backgroundColor: gc.bg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: gc.color }}>
                        <Text style={{ color: gc.color, fontSize: 11 }}>{f.name}</Text>
                      </View>
                    ))}
                    {group.foods.length > 8 && (
                      <Text style={{ color: colors.muted, fontSize: 11, alignSelf: "center" }}>+{group.foods.length - 8} daha</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* ── DANIŞAN: DİYETİSYEN LİSTELERİ ── */}
        {role === "client" && activeTab === "groups" && (
          <>
            <Text style={{ color: colors.muted, fontSize: 13 }}>Diyetisyeninizin sizin için hazırladığı listeler</Text>
            {myGroups.length === 0 ? (
              <Text style={{ color: colors.muted, textAlign: "center", marginTop: 20 }}>
                Diyetisyeniniz henüz liste oluşturmadı.
              </Text>
            ) : myGroups.map(group => {
              const gc = GROUP_COLORS[group.type];
              return (
                <View key={group.id} style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, gap: 10, borderWidth: 2, borderColor: gc.color }}>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>{group.name}</Text>
                  <Text style={{ color: gc.color, fontWeight: "600", fontSize: 13 }}>{gc.label}</Text>
                  {group.foods.map(food => {
                    const eaten = eatenFoods.includes(food.id);
                    return (
                      <TouchableOpacity key={food.id} onPress={() => toggleEaten(food)}
                        style={{
                          flexDirection: "row", alignItems: "center", gap: 10,
                          paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border,
                        }}>
                        <View style={{
                          width: 24, height: 24, borderRadius: 12, borderWidth: 2,
                          borderColor: eaten ? "#22c55e" : colors.border,
                          backgroundColor: eaten ? "#22c55e" : "transparent",
                          alignItems: "center", justifyContent: "center",
                        }}>
                          {eaten && <Text style={{ color: "#fff", fontSize: 14 }}>✓</Text>}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: colors.foreground, fontWeight: "600" }}>{food.name}</Text>
                          <Text style={{ color: colors.muted, fontSize: 11 }}>
                            {food.calories} kcal · {food.servingSize}{food.servingUnit}
                          </Text>
                        </View>
                        {eaten && <Text style={{ color: "#22c55e", fontSize: 12, fontWeight: "600" }}>Yedim ✓</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}
          </>
        )}

        {/* ── DANIŞAN: YEDİKLERİM ── */}
        {role === "client" && activeTab === "my-foods" && (
          <>
            <Text style={{ color: colors.muted, fontSize: 13 }}>Bugün işaretlediğiniz yemekler</Text>
            {eatenFoods.length === 0 ? (
              <Text style={{ color: colors.muted, textAlign: "center", marginTop: 20 }}>
                Henüz yemek işaretlemediniz. Diyetisyen listelerinden seçin.
              </Text>
            ) : (
              <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 8 }}>
                {myGroups.flatMap(g => g.foods).filter(f => eatenFoods.includes(f.id)).map(food => (
                  <View key={food.id} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <Text style={{ color: colors.foreground, fontWeight: "600" }}>✅ {food.name}</Text>
                    <Text style={{ color: colors.muted, fontSize: 12 }}>{food.calories} kcal</Text>
                  </View>
                ))}
                <TouchableOpacity onPress={() => saveEatenFoods([])}
                  style={{ paddingVertical: 10, borderRadius: 10, alignItems: "center", backgroundColor: "#ef444420", borderWidth: 1, borderColor: "#ef4444", marginTop: 8 }}>
                  <Text style={{ color: "#ef4444", fontWeight: "600" }}>🗑️ Listeyi Temizle</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
