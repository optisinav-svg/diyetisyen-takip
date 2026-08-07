import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, Modal } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { BackButton } from "@/components/back-button";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserRegistration } from "@/lib/_core/user-registration";

const TEMPLATES_KEY = "meal_plan_templates_v2";
const ASSIGNED_KEY = "assigned_templates";

interface MealItem {
  name: string;
  portion: string;
  calories: number;
}

interface DayMeal {
  type: "Kahvaltı" | "Öğle" | "Akşam" | "Ara Öğün";
  items: MealItem[];
}

interface MealTemplate {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  days: DayMeal[][];
  createdBy: "system" | "dietitian";
  createdAt: string;
}

interface AssignedTemplate {
  clientId: string;
  templateId: string;
  assignedAt: string;
}

const SAMPLE_CLIENTS = [
  { id: "c1", name: "Ayşe Yılmaz" },
  { id: "c2", name: "Mehmet Demir" },
  { id: "c3", name: "Fatma Kaya" },
];

const DEFAULT_TEMPLATES: MealTemplate[] = [
  {
    id: "hamile",
    name: "Hamile (Gebe) Diyeti",
    category: "Özel Durum",
    icon: "🤰",
    description: "Gebelik döneminde anne ve bebek sağlığını destekleyen, folik asit ve demir açısından zengin beslenme planı.",
    createdBy: "system",
    createdAt: new Date().toISOString(),
    days: [[
      { type: "Kahvaltı", items: [
        { name: "Tam tahıllı ekmek", portion: "2 dilim", calories: 160 },
        { name: "Haşlanmış yumurta", portion: "2 adet", calories: 155 },
        { name: "Peynir (az tuzlu)", portion: "60g", calories: 140 },
        { name: "Domates, salatalık", portion: "1 porsiyon", calories: 30 },
        { name: "Çay (ıhlamur)", portion: "1 bardak", calories: 5 },
      ]},
      { type: "Ara Öğün", items: [
        { name: "Ceviz", portion: "3 adet", calories: 78 },
        { name: "Elma", portion: "1 adet", calories: 72 },
      ]},
      { type: "Öğle", items: [
        { name: "Mercimek çorbası", portion: "1 kase", calories: 180 },
        { name: "Tavuk ızgara", portion: "150g", calories: 165 },
        { name: "Bulgur pilavı", portion: "4 yemek kaşığı", calories: 150 },
        { name: "Mevsim salatası", portion: "1 porsiyon", calories: 45 },
      ]},
      { type: "Akşam", items: [
        { name: "Ispanak yemeği", portion: "1 porsiyon", calories: 120 },
        { name: "Yoğurt", portion: "200g", calories: 100 },
        { name: "Tam buğday ekmeği", portion: "1 dilim", calories: 80 },
      ]},
    ]],
  },
  {
    id: "emzikli",
    name: "Emzikli Kadın Diyeti",
    category: "Özel Durum",
    icon: "🤱",
    description: "Emzirme döneminde süt üretimini destekleyen, yüksek kalori ve protein içeren beslenme planı.",
    createdBy: "system",
    createdAt: new Date().toISOString(),
    days: [[
      { type: "Kahvaltı", items: [
        { name: "Yulaf ezmesi (sütlü)", portion: "1 kase", calories: 280 },
        { name: "Muz", portion: "1 adet", calories: 89 },
        { name: "Badem", portion: "15 adet", calories: 104 },
      ]},
      { type: "Ara Öğün", items: [
        { name: "Yoğurt", portion: "200g", calories: 100 },
        { name: "Ceviz", portion: "4 adet", calories: 104 },
      ]},
      { type: "Öğle", items: [
        { name: "Somon ızgara", portion: "200g", calories: 280 },
        { name: "Bulgur pilavı", portion: "6 yemek kaşığı", calories: 225 },
        { name: "Brokoli (haşlama)", portion: "150g", calories: 51 },
      ]},
      { type: "Akşam", items: [
        { name: "Mercimek köftesi", portion: "8 adet", calories: 240 },
        { name: "Ayran", portion: "200ml", calories: 56 },
        { name: "Tam tahıllı ekmek", portion: "2 dilim", calories: 160 },
      ]},
    ]],
  },
  {
    id: "sporcu",
    name: "Sporcu Diyeti",
    category: "Performans",
    icon: "🏋️",
    description: "Yüksek performans ve kas gelişimi için optimize edilmiş, yüksek protein ve karbonhidrat içeren beslenme planı.",
    createdBy: "system",
    createdAt: new Date().toISOString(),
    days: [[
      { type: "Kahvaltı", items: [
        { name: "Yumurta akı omleti", portion: "4 adet", calories: 68 },
        { name: "Tam tahıllı ekmek", portion: "2 dilim", calories: 160 },
        { name: "Muz", portion: "1 adet", calories: 89 },
        { name: "Süt", portion: "250ml", calories: 122 },
      ]},
      { type: "Ara Öğün", items: [
        { name: "Protein bar/şeyh", portion: "1 adet", calories: 180 },
        { name: "Elma", portion: "1 adet", calories: 72 },
      ]},
      { type: "Öğle", items: [
        { name: "Tavuk göğsü ızgara", portion: "200g", calories: 220 },
        { name: "Pirinç pilavı", portion: "6 yemek kaşığı", calories: 210 },
        { name: "Brokoli, havuç", portion: "150g", calories: 65 },
      ]},
      { type: "Akşam", items: [
        { name: "Ton balığı", portion: "150g", calories: 158 },
        { name: "Tatlı patates", portion: "200g", calories: 172 },
        { name: "Yeşil salata", portion: "1 porsiyon", calories: 30 },
      ]},
    ]],
  },
  {
    id: "ogrenci",
    name: "Sınav Dönemi (Öğrenci)",
    category: "Performans",
    icon: "📚",
    description: "Beyin fonksiyonlarını destekleyen, konsantrasyonu artıran omega-3 ve antioksidan açısından zengin beslenme planı.",
    createdBy: "system",
    createdAt: new Date().toISOString(),
    days: [[
      { type: "Kahvaltı", items: [
        { name: "Yumurta (haşlama)", portion: "2 adet", calories: 155 },
        { name: "Ceviz", portion: "5 adet", calories: 130 },
        { name: "Yaban mersini", portion: "100g", calories: 57 },
        { name: "Tam tahıllı ekmek", portion: "1 dilim", calories: 80 },
      ]},
      { type: "Ara Öğün", items: [
        { name: "Badem", portion: "20 adet", calories: 139 },
        { name: "Yeşil çay", portion: "1 bardak", calories: 2 },
      ]},
      { type: "Öğle", items: [
        { name: "Somon sandviç", portion: "1 adet", calories: 350 },
        { name: "Domates çorbası", portion: "1 kase", calories: 120 },
      ]},
      { type: "Akşam", items: [
        { name: "Mercimek çorbası", portion: "1 kase", calories: 180 },
        { name: "Peynirli omlet", portion: "1 porsiyon", calories: 200 },
        { name: "Zeytinyağlı salata", portion: "1 porsiyon", calories: 90 },
      ]},
    ]],
  },
  {
    id: "koruma",
    name: "Koruma Diyeti",
    category: "Sağlık",
    icon: "🛡️",
    description: "Kilo koruma ve sağlıklı yaşam için dengeli, sürdürülebilir beslenme planı.",
    createdBy: "system",
    createdAt: new Date().toISOString(),
    days: [[
      { type: "Kahvaltı", items: [
        { name: "Yoğurt (yağsız)", portion: "200g", calories: 68 },
        { name: "Meyve karışımı", portion: "150g", calories: 90 },
        { name: "Granola", portion: "30g", calories: 120 },
      ]},
      { type: "Ara Öğün", items: [
        { name: "Meyve (mevsim)", portion: "1 adet", calories: 70 },
      ]},
      { type: "Öğle", items: [
        { name: "Izgara tavuk", portion: "120g", calories: 132 },
        { name: "Bulgur pilavı", portion: "4 kaşık", calories: 150 },
        { name: "Büyük yeşil salata", portion: "1 porsiyon", calories: 60 },
      ]},
      { type: "Akşam", items: [
        { name: "Sebze çorbası", portion: "1 kase", calories: 90 },
        { name: "Ton balıklı salata", portion: "1 porsiyon", calories: 180 },
        { name: "Tam tahıllı ekmek", portion: "1 dilim", calories: 80 },
      ]},
    ]],
  },
  {
    id: "diyabet",
    name: "Diyabet (Şeker Hastası) Diyeti",
    category: "Hastalık",
    icon: "🩺",
    description: "Kan şekerini dengede tutan, düşük glisemik indeksli gıdalardan oluşan beslenme planı.",
    createdBy: "system",
    createdAt: new Date().toISOString(),
    days: [[
      { type: "Kahvaltı", items: [
        { name: "Yulaf ezmesi (şekersiz)", portion: "50g", calories: 185 },
        { name: "Haşlanmış yumurta", portion: "2 adet", calories: 155 },
        { name: "Domates, salatalık", portion: "150g", calories: 25 },
        { name: "Zeytinyağı", portion: "1 tatlı kaşığı", calories: 40 },
      ]},
      { type: "Ara Öğün", items: [
        { name: "Ceviz", portion: "3 adet", calories: 78 },
        { name: "Elma (küçük)", portion: "1 adet", calories: 55 },
      ]},
      { type: "Öğle", items: [
        { name: "Bulgur pilavı (az)", portion: "3 kaşık", calories: 112 },
        { name: "Kuru fasulye", portion: "1 porsiyon", calories: 220 },
        { name: "Ayran", portion: "200ml", calories: 56 },
      ]},
      { type: "Akşam", items: [
        { name: "Izgara balık", portion: "150g", calories: 165 },
        { name: "Buharda sebze", portion: "200g", calories: 80 },
        { name: "Yoğurt (az yağlı)", portion: "150g", calories: 75 },
      ]},
    ]],
  },
];

export default function MealPlanTemplatesScreen() {
  const colors = useColors();
  const [role, setRole] = useState<"dietitian" | "client">("client");
  const [templates, setTemplates] = useState<MealTemplate[]>(DEFAULT_TEMPLATES);
  const [assignedTemplates, setAssignedTemplates] = useState<AssignedTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<MealTemplate | null>(null);
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningTemplate, setAssigningTemplate] = useState<MealTemplate | null>(null);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);

  // Create template form
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Özel Durum");
  const [newIcon, setNewIcon] = useState("🍽️");
  const [newDescription, setNewDescription] = useState("");
  const [newMeals, setNewMeals] = useState<{type: string; items: string}[]>([
    { type: "Kahvaltı", items: "" },
    { type: "Öğle", items: "" },
    { type: "Akşam", items: "" },
    { type: "Ara Öğün", items: "" },
  ]);

  const CATEGORIES = ["Tümü", "Özel Durum", "Performans", "Sağlık", "Hastalık", "Özel"];
  const MEAL_TYPES = ["Kahvaltı", "Öğle", "Akşam", "Ara Öğün"];
  const ICONS = ["🍽️", "🤰", "🤱", "🏋️", "📚", "🛡️", "🩺", "💪", "🧘", "🌱", "❤️", "⚡"];

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const user = await getUserRegistration();
    setRole(user?.role ?? "client");
    const saved = await AsyncStorage.getItem(TEMPLATES_KEY);
    if (saved) {
      const custom = JSON.parse(saved);
      setTemplates([...DEFAULT_TEMPLATES, ...custom.filter((t: MealTemplate) => t.createdBy === "dietitian")]);
    }
    const savedAssigned = await AsyncStorage.getItem(ASSIGNED_KEY);
    if (savedAssigned) setAssignedTemplates(JSON.parse(savedAssigned));
  };

  const saveCustomTemplates = async (all: MealTemplate[]) => {
    const custom = all.filter(t => t.createdBy === "dietitian");
    await AsyncStorage.setItem(TEMPLATES_KEY, JSON.stringify(custom));
  };

  const createTemplate = async () => {
    if (!newName.trim()) { Alert.alert("Hata", "Şablon adı girin"); return; }
    const days: DayMeal[][] = [[
      ...newMeals.filter(m => m.items.trim()).map(m => ({
        type: m.type as DayMeal["type"],
        items: m.items.split("\n").filter(i => i.trim()).map(line => ({
          name: line.trim(),
          portion: "1 porsiyon",
          calories: 0,
        })),
      }))
    ]];

    const newTemplate: MealTemplate = {
      id: Date.now().toString(),
      name: newName,
      category: newCategory,
      icon: newIcon,
      description: newDescription,
      days,
      createdBy: "dietitian",
      createdAt: new Date().toISOString(),
    };

    const updated = [...templates, newTemplate];
    setTemplates(updated);
    await saveCustomTemplates(updated);
    setActiveTab("list");
    setNewName(""); setNewDescription(""); setNewCategory("Özel Durum"); setNewIcon("🍽️");
    setNewMeals([{ type: "Kahvaltı", items: "" }, { type: "Öğle", items: "" }, { type: "Akşam", items: "" }, { type: "Ara Öğün", items: "" }]);
    Alert.alert("Oluşturuldu", `"${newTemplate.name}" şablonu oluşturuldu.`);
  };

  const deleteTemplate = async (id: string) => {
    Alert.alert("Sil", "Bu şablonu silmek istiyor musunuz?", [
      { text: "İptal", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: async () => {
        const updated = templates.filter(t => t.id !== id);
        setTemplates(updated);
        await saveCustomTemplates(updated);
      }},
    ]);
  };

  const openAssignModal = (template: MealTemplate) => {
    setAssigningTemplate(template);
    const already = assignedTemplates.filter(a => a.templateId === template.id).map(a => a.clientId);
    setSelectedClients(already);
    setShowAssignModal(true);
  };

  const assignTemplate = async () => {
    if (!assigningTemplate) return;
    const others = assignedTemplates.filter(a => a.templateId !== assigningTemplate.id);
    const newAssignments = selectedClients.map(cId => ({
      clientId: cId,
      templateId: assigningTemplate.id,
      assignedAt: new Date().toISOString(),
    }));
    const updated = [...others, ...newAssignments];
    setAssignedTemplates(updated);
    await AsyncStorage.setItem(ASSIGNED_KEY, JSON.stringify(updated));
    setShowAssignModal(false);
    const names = SAMPLE_CLIENTS.filter(c => selectedClients.includes(c.id)).map(c => c.name).join(", ");
    Alert.alert("Atandı ✅", `"${assigningTemplate.name}" → ${names}`);
  };

  const filteredTemplates = selectedCategory === "Tümü"
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  // Danışan: kendine atanan şablonları göster
  const myTemplateIds = assignedTemplates.filter(a => a.clientId === "c1").map(a => a.templateId);
  const myTemplates = templates.filter(t => myTemplateIds.includes(t.id));

  // Şablon detay sayfası
  if (selectedTemplate) {
    const totalCals = selectedTemplate.days[0]?.reduce((s, meal) =>
      s + meal.items.reduce((ms, item) => ms + item.calories, 0), 0) ?? 0;

    return (
      <ScreenContainer>
        <BackButton title={selectedTemplate.name} onBack={() => setSelectedTemplate(null)} />
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 8 }}>
            <Text style={{ fontSize: 32, textAlign: "center" }}>{selectedTemplate.icon}</Text>
            <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground, textAlign: "center" }}>{selectedTemplate.name}</Text>
            <Text style={{ color: colors.muted, textAlign: "center", lineHeight: 20 }}>{selectedTemplate.description}</Text>
            {totalCals > 0 && (
              <Text style={{ color: colors.primary, fontWeight: "700", textAlign: "center" }}>
                🔥 Günlük toplam: ~{totalCals} kcal
              </Text>
            )}
          </View>

          {selectedTemplate.days[0]?.map((meal, i) => (
            <View key={i} style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border, gap: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>
                {meal.type === "Kahvaltı" ? "🌅" : meal.type === "Öğle" ? "☀️" : meal.type === "Akşam" ? "🌙" : "🍎"} {meal.type}
              </Text>
              {meal.items.map((item, j) => (
                <View key={j} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottomWidth: j < meal.items.length - 1 ? 1 : 0, borderBottomColor: colors.border }}>
                  <Text style={{ color: colors.foreground, flex: 1 }}>• {item.name}</Text>
                  <Text style={{ color: colors.muted, fontSize: 13 }}>{item.portion}</Text>
                  {item.calories > 0 && (
                    <Text style={{ color: colors.primary, fontSize: 12, marginLeft: 8 }}>{item.calories} kcal</Text>
                  )}
                </View>
              ))}
            </View>
          ))}

          {role === "dietitian" && (
            <TouchableOpacity onPress={() => openAssignModal(selectedTemplate)}
              style={{ paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: colors.primary }}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>👤 Danışana Ata</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <BackButton title="📋 Öğün Plan Şablonları" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>

        {/* Diyetisyen Tabs */}
        {role === "dietitian" && (
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[
              { key: "list", label: "📋 Şablonlar" },
              { key: "create", label: "➕ Yeni Oluştur" },
            ].map(tab => (
              <TouchableOpacity key={tab.key} onPress={() => setActiveTab(tab.key as any)}
                style={{
                  flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center",
                  backgroundColor: activeTab === tab.key ? colors.primary : colors.surface,
                  borderWidth: 1, borderColor: activeTab === tab.key ? colors.primary : colors.border,
                }}>
                <Text style={{ color: activeTab === tab.key ? "#fff" : colors.foreground, fontWeight: "600" }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── ŞABLON LİSTESİ ── */}
        {(role === "client" || activeTab === "list") && (
          <>
            {role === "dietitian" && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity key={cat} onPress={() => setSelectedCategory(cat)}
                      style={{
                        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                        backgroundColor: selectedCategory === cat ? colors.primary : colors.surface,
                        borderWidth: 1, borderColor: selectedCategory === cat ? colors.primary : colors.border,
                      }}>
                      <Text style={{ color: selectedCategory === cat ? "#fff" : colors.foreground, fontWeight: "600", fontSize: 13 }}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}

            {role === "client" && (
              <Text style={{ color: colors.muted, fontSize: 13 }}>
                Diyetisyeninizin size atadığı beslenme planları
              </Text>
            )}

            {role === "client" && myTemplates.length === 0 && (
              <Text style={{ color: colors.muted, textAlign: "center", marginTop: 20 }}>
                Diyetisyeniniz henüz bir plan atamadı.
              </Text>
            )}

            {(role === "dietitian" ? filteredTemplates : myTemplates).map(template => {
              const assignedCount = assignedTemplates.filter(a => a.templateId === template.id).length;
              return (
                <TouchableOpacity key={template.id} onPress={() => setSelectedTemplate(template)}
                  style={{
                    backgroundColor: colors.surface, borderRadius: 14, padding: 16, gap: 8,
                    borderWidth: 1, borderColor: colors.border,
                    flexDirection: "row", alignItems: "center", gap: 12,
                  }}>
                  <Text style={{ fontSize: 36 }}>{template.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: colors.foreground }}>{template.name}</Text>
                    <Text style={{ color: colors.muted, fontSize: 12 }}>{template.category}</Text>
                    <Text style={{ color: colors.muted, fontSize: 12 }} numberOfLines={2}>{template.description}</Text>
                    {role === "dietitian" && assignedCount > 0 && (
                      <Text style={{ color: colors.primary, fontSize: 11, marginTop: 2 }}>
                        ✅ {assignedCount} danışana atandı
                      </Text>
                    )}
                    {template.createdBy === "dietitian" && (
                      <Text style={{ color: "#f97316", fontSize: 11 }}>✏️ Sizin oluşturduğunuz</Text>
                    )}
                  </View>
                  <View style={{ gap: 6, alignItems: "flex-end" }}>
                    <Text style={{ color: colors.primary, fontWeight: "600" }}>Detay →</Text>
                    {role === "dietitian" && template.createdBy === "dietitian" && (
                      <TouchableOpacity onPress={() => deleteTemplate(template.id)}>
                        <Text style={{ color: "#ef4444", fontSize: 12 }}>Sil</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* ── YENİ ŞABLON OLUŞTUR ── */}
        {role === "dietitian" && activeTab === "create" && (
          <View style={{ gap: 14 }}>
            {/* İkon Seçimi */}
            <View style={{ gap: 8 }}>
              <Text style={{ fontWeight: "600", color: colors.foreground }}>İkon</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {ICONS.map(icon => (
                    <TouchableOpacity key={icon} onPress={() => setNewIcon(icon)}
                      style={{
                        width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center",
                        backgroundColor: newIcon === icon ? colors.primary + "30" : colors.surface,
                        borderWidth: 2, borderColor: newIcon === icon ? colors.primary : colors.border,
                      }}>
                      <Text style={{ fontSize: 22 }}>{icon}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <TextInput value={newName} onChangeText={setNewName}
              placeholder="Şablon adı (örn: Hipertansiyon Diyeti)"
              placeholderTextColor={colors.muted}
              style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.foreground, backgroundColor: colors.surface }} />

            {/* Kategori */}
            <View style={{ gap: 6 }}>
              <Text style={{ fontWeight: "600", color: colors.foreground }}>Kategori</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {CATEGORIES.filter(c => c !== "Tümü").map(cat => (
                    <TouchableOpacity key={cat} onPress={() => setNewCategory(cat)}
                      style={{
                        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                        backgroundColor: newCategory === cat ? colors.primary : colors.surface,
                        borderWidth: 1, borderColor: newCategory === cat ? colors.primary : colors.border,
                      }}>
                      <Text style={{ color: newCategory === cat ? "#fff" : colors.foreground, fontWeight: "600", fontSize: 13 }}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <TextInput value={newDescription} onChangeText={setNewDescription}
              placeholder="Açıklama (bu diyetin amacı ve faydaları)"
              multiline placeholderTextColor={colors.muted}
              style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.foreground, backgroundColor: colors.surface, minHeight: 60 }} />

            {/* Öğün İçerikleri */}
            {newMeals.map((meal, i) => (
              <View key={meal.type} style={{ gap: 6 }}>
                <Text style={{ fontWeight: "600", color: colors.foreground }}>
                  {meal.type === "Kahvaltı" ? "🌅" : meal.type === "Öğle" ? "☀️" : meal.type === "Akşam" ? "🌙" : "🍎"} {meal.type} İçeriği
                </Text>
                <TextInput
                  value={meal.items}
                  onChangeText={v => setNewMeals(prev => prev.map((m, j) => j === i ? { ...m, items: v } : m))}
                  placeholder="Her satıra bir yemek yazın:&#10;Yulaf ezmesi&#10;Haşlanmış yumurta&#10;Portakal suyu"
                  multiline
                  placeholderTextColor={colors.muted}
                  style={{
                    borderWidth: 1, borderColor: colors.border, borderRadius: 10,
                    padding: 12, color: colors.foreground, backgroundColor: colors.surface,
                    minHeight: 80, textAlignVertical: "top",
                  }}
                />
              </View>
            ))}

            <TouchableOpacity onPress={createTemplate}
              style={{ paddingVertical: 16, borderRadius: 12, alignItems: "center", backgroundColor: colors.primary }}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>✅ Şablon Oluştur</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Danışana Ata Modal */}
      <Modal visible={showAssignModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "#00000080", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, gap: 14 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground }}>
              👤 Danışana Ata: {assigningTemplate?.name}
            </Text>
            {SAMPLE_CLIENTS.map(c => (
              <TouchableOpacity key={c.id}
                onPress={() => setSelectedClients(prev =>
                  prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id]
                )}
                style={{
                  flexDirection: "row", alignItems: "center", gap: 12,
                  padding: 14, borderRadius: 12,
                  backgroundColor: selectedClients.includes(c.id) ? colors.primary + "20" : colors.surface,
                  borderWidth: 2, borderColor: selectedClients.includes(c.id) ? colors.primary : colors.border,
                }}>
                <View style={{
                  width: 24, height: 24, borderRadius: 12, borderWidth: 2,
                  borderColor: selectedClients.includes(c.id) ? colors.primary : colors.border,
                  backgroundColor: selectedClients.includes(c.id) ? colors.primary : "transparent",
                  alignItems: "center", justifyContent: "center",
                }}>
                  {selectedClients.includes(c.id) && <Text style={{ color: "#fff", fontWeight: "700" }}>✓</Text>}
                </View>
                <Text style={{ fontSize: 15, fontWeight: "600", color: colors.foreground }}>👤 {c.name}</Text>
              </TouchableOpacity>
            ))}
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity onPress={() => setShowAssignModal(false)}
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.foreground }}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={assignTemplate}
                style={{ flex: 2, paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: colors.primary }}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>✅ Ata</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
