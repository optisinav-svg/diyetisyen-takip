import { BackButton } from "@/components/back-button";
import { ScrollView, Text, View, TouchableOpacity, Alert, TextInput, Modal, Switch } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserRegistration } from "@/lib/_core/user-registration";

const PLANS_KEY = "custom_plans";
const PAYMENTS_KEY = "payment_history";
const INVOICES_KEY = "invoices";

interface Plan {
  id: string;
  name: string;
  price: number;
  period: "Aylık" | "Yıllık" | "Tek Seferlik";
  features: string[];
  createdAt: string;
  active: boolean;
}

interface Payment {
  id: string;
  clientName: string;
  clientId: string;
  planName: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "failed";
}

interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  planName: string;
  amount: number;
  date: string;
  paid: boolean;
  paidAt?: string;
}

const DEFAULT_PLANS: Plan[] = [
  { id: "free", name: "Ücretsiz", price: 0, period: "Aylık", features: ["Temel profil", "5 öğün/gün", "Temel takip"], createdAt: new Date().toISOString(), active: true },
  { id: "basic", name: "Başlangıç", price: 149, period: "Aylık", features: ["Sınırsız öğün", "Sağlık analitikleri", "Mesajlaşma", "Haftalık rapor"], createdAt: new Date().toISOString(), active: true },
  { id: "pro", name: "Profesyonel", price: 299, period: "Aylık", features: ["Tüm Başlangıç özellikleri", "AI beslenme analizi", "Video danışma", "Öncelikli destek"], createdAt: new Date().toISOString(), active: true },
];

const SAMPLE_PAYMENTS: Payment[] = [
  { id: "p1", clientName: "Ayşe Yılmaz", clientId: "c1", planName: "Başlangıç", amount: 149, date: "2026-06-01", status: "completed" },
  { id: "p2", clientName: "Mehmet Demir", clientId: "c2", planName: "Profesyonel", amount: 299, date: "2026-05-28", status: "completed" },
  { id: "p3", clientName: "Fatma Kaya", clientId: "c3", planName: "Başlangıç", amount: 149, date: "2026-05-15", status: "pending" },
  { id: "p4", clientName: "Ayşe Yılmaz", clientId: "c1", planName: "Başlangıç", amount: 149, date: "2026-05-01", status: "completed" },
];

const SAMPLE_INVOICES: Invoice[] = [
  { id: "i1", clientId: "me", clientName: "Ben", planName: "Başlangıç", amount: 149, date: "2026-06-01", paid: true, paidAt: "2026-06-01" },
  { id: "i2", clientId: "me", clientName: "Ben", planName: "Başlangıç", amount: 149, date: "2026-05-01", paid: true, paidAt: "2026-05-02" },
  { id: "i3", clientId: "me", clientName: "Ben", planName: "Başlangıç", amount: 149, date: "2026-07-01", paid: false },
];

const PERIODS = ["Aylık", "Yıllık", "Tek Seferlik"] as const;

export default function PaymentSubscriptionScreen() {
  const colors = useColors();
  const [role, setRole] = useState<"dietitian" | "client">("client");
  const [activeTab, setActiveTab] = useState<"plans" | "history" | "invoices">("plans");
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);
  const [payments, setPayments] = useState<Payment[]>(SAMPLE_PAYMENTS);
  const [invoices, setInvoices] = useState<Invoice[]>(SAMPLE_INVOICES);
  const [showNewPlan, setShowNewPlan] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "client">("date");

  // Yeni plan form
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [planPeriod, setPlanPeriod] = useState<typeof PERIODS[number]>("Aylık");
  const [planFeatures, setPlanFeatures] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const user = await getUserRegistration();
    setRole(user?.role ?? "client");
    const savedPlans = await AsyncStorage.getItem(PLANS_KEY);
    if (savedPlans) setPlans(JSON.parse(savedPlans));
    const savedPayments = await AsyncStorage.getItem(PAYMENTS_KEY);
    if (savedPayments) setPayments(JSON.parse(savedPayments));
    const savedInvoices = await AsyncStorage.getItem(INVOICES_KEY);
    if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
  };

  const savePlans = async (list: Plan[]) => {
    setPlans(list);
    await AsyncStorage.setItem(PLANS_KEY, JSON.stringify(list));
  };

  const saveInvoices = async (list: Invoice[]) => {
    setInvoices(list);
    await AsyncStorage.setItem(INVOICES_KEY, JSON.stringify(list));
  };

  const addOrUpdatePlan = async () => {
    if (!planName.trim() || !planPrice.trim()) { Alert.alert("Hata", "Ad ve ücret girin"); return; }
    const features = planFeatures.split("\n").filter(f => f.trim());
    if (editPlan) {
      const updated = plans.map(p => p.id === editPlan.id
        ? { ...p, name: planName, price: Number(planPrice), period: planPeriod, features }
        : p
      );
      await savePlans(updated);
      Alert.alert("Güncellendi", `"${planName}" paketi güncellendi.`);
    } else {
      const newPlan: Plan = {
        id: Date.now().toString(), name: planName, price: Number(planPrice),
        period: planPeriod, features, createdAt: new Date().toISOString(), active: true,
      };
      await savePlans([...plans, newPlan]);
      Alert.alert("Oluşturuldu", `"${planName}" paketi oluşturuldu.`);
    }
    setShowNewPlan(false); setEditPlan(null);
    setPlanName(""); setPlanPrice(""); setPlanFeatures(""); setPlanPeriod("Aylık");
  };

  const deletePlan = async (id: string) => {
    Alert.alert("Sil", "Bu paketi silmek istiyor musunuz?", [
      { text: "İptal", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: async () => {
        await savePlans(plans.filter(p => p.id !== id));
      }},
    ]);
  };

  const togglePlanActive = async (id: string) => {
    await savePlans(plans.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  const markInvoicePaid = async (id: string) => {
    const updated = invoices.map(i => i.id === id ? { ...i, paid: true, paidAt: new Date().toISOString().split("T")[0] } : i);
    await saveInvoices(updated);
    Alert.alert("✅ İşaretlendi", "Fatura ödendi olarak işaretlendi.");
  };

  const sortedPayments = [...payments].sort((a, b) => {
    if (sortBy === "date") return b.date.localeCompare(a.date);
    return a.clientName.localeCompare(b.clientName);
  });

  const statusColor = (s: string) => s === "completed" ? "#22c55e" : s === "pending" ? "#f97316" : "#ef4444";
  const statusLabel = (s: string) => s === "completed" ? "✅ Tamamlandı" : s === "pending" ? "⏳ Bekliyor" : "❌ Başarısız";

  const totalRevenue = payments.filter(p => p.status === "completed").reduce((s, p) => s + p.amount, 0);
  const myInvoices = invoices.filter(i => i.clientId === "me");

  return (
    <ScreenContainer>
      <BackButton title="💳 Ödeme & Abonelik" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[
              { key: "plans", label: "📦 Paketler" },
              { key: "history", label: role === "dietitian" ? "💰 Ödeme Geçmişi" : "📄 Paket Bilgim" },
              { key: "invoices", label: "🧾 Fatura" },
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

        {/* PAKETLER */}
        {activeTab === "plans" && (
          <>
            {role === "dietitian" && (
              <>
                {/* Gelir özeti */}
                <View style={{ backgroundColor: "#22c55e20", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#22c55e", flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: "#22c55e", fontWeight: "700" }}>💰 Toplam Gelir</Text>
                  <Text style={{ color: "#22c55e", fontWeight: "700", fontSize: 18 }}>{totalRevenue} ₺</Text>
                </View>

                <TouchableOpacity onPress={() => { setEditPlan(null); setPlanName(""); setPlanPrice(""); setPlanFeatures(""); setShowNewPlan(true); }}
                  style={{ paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: colors.primary }}>
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>+ Yeni Paket Oluştur</Text>
                </TouchableOpacity>
              </>
            )}

            {role === "client" && (
              <Text style={{ color: colors.muted, fontSize: 13 }}>Diyetisyeninizin sunduğu paketler</Text>
            )}

            {plans.filter(p => role === "dietitian" || p.active).map(plan => (
              <View key={plan.id} style={{
                backgroundColor: colors.surface, borderRadius: 14, padding: 16, gap: 10,
                borderWidth: 2, borderColor: plan.id === "pro" ? colors.primary : colors.border,
              }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground }}>{plan.name}</Text>
                      {plan.id === "pro" && (
                        <View style={{ backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                          <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>POPÜLER</Text>
                        </View>
                      )}
                    </View>
                    <Text style={{ fontSize: 22, fontWeight: "bold", color: colors.primary, marginTop: 4 }}>
                      {plan.price === 0 ? "Ücretsiz" : `${plan.price} ₺`}
                      {plan.price > 0 && <Text style={{ fontSize: 14, color: colors.muted }}>/{plan.period}</Text>}
                    </Text>
                  </View>
                  {role === "dietitian" && (
                    <View style={{ gap: 6, alignItems: "flex-end" }}>
                      <Switch value={plan.active} onValueChange={() => togglePlanActive(plan.id)}
                        trackColor={{ false: colors.border, true: "#22c55e" }} />
                      <Text style={{ color: plan.active ? "#22c55e" : colors.muted, fontSize: 11 }}>
                        {plan.active ? "Aktif" : "Pasif"}
                      </Text>
                    </View>
                  )}
                </View>

                {plan.features.map((f, i) => (
                  <Text key={i} style={{ color: colors.foreground, fontSize: 13 }}>✓ {f}</Text>
                ))}

                {role === "dietitian" && !["free", "basic", "pro", "enterprise"].includes(plan.id) && (
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
                    <TouchableOpacity onPress={() => {
                      setEditPlan(plan); setPlanName(plan.name); setPlanPrice(String(plan.price));
                      setPlanPeriod(plan.period); setPlanFeatures(plan.features.join("\n")); setShowNewPlan(true);
                    }}
                      style={{ flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center", backgroundColor: colors.primary + "20", borderWidth: 1, borderColor: colors.primary }}>
                      <Text style={{ color: colors.primary, fontWeight: "600" }}>✏️ Düzenle</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deletePlan(plan.id)}
                      style={{ flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center", backgroundColor: "#ef444420", borderWidth: 1, borderColor: "#ef4444" }}>
                      <Text style={{ color: "#ef4444", fontWeight: "600" }}>🗑️ Sil</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {role === "client" && (
                  <TouchableOpacity onPress={() => Alert.alert("Paket Seçildi", `${plan.name} paketini seçtiniz. Ödeme için diyetisyeninizle iletişime geçin.`)}
                    style={{ paddingVertical: 12, borderRadius: 10, alignItems: "center", backgroundColor: colors.primary }}>
                    <Text style={{ color: "#fff", fontWeight: "700" }}>Seç →</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </>
        )}

        {/* ÖDEME GEÇMİŞİ (Diyetisyen) */}
        {activeTab === "history" && role === "dietitian" && (
          <>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {[
                { key: "date", label: "📅 Tarihe Göre" },
                { key: "client", label: "👤 Danışana Göre" },
              ].map(s => (
                <TouchableOpacity key={s.key} onPress={() => setSortBy(s.key as any)}
                  style={{
                    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center",
                    backgroundColor: sortBy === s.key ? colors.primary : colors.surface,
                    borderWidth: 1, borderColor: sortBy === s.key ? colors.primary : colors.border,
                  }}>
                  <Text style={{ color: sortBy === s.key ? "#fff" : colors.foreground, fontWeight: "600", fontSize: 13 }}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border, flexDirection: "row", justifyContent: "space-around" }}>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 22, fontWeight: "bold", color: "#22c55e" }}>{totalRevenue} ₺</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>Toplam Gelir</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 22, fontWeight: "bold", color: colors.primary }}>
                  {payments.filter(p => p.status === "completed").length}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>Başarılı Ödeme</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 22, fontWeight: "bold", color: "#f97316" }}>
                  {payments.filter(p => p.status === "pending").length}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>Bekleyen</Text>
              </View>
            </View>

            {sortedPayments.map(p => (
              <View key={p.id} style={{
                backgroundColor: colors.surface, borderRadius: 12, padding: 14, gap: 6,
                borderWidth: 1, borderColor: colors.border,
              }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontWeight: "700", color: colors.foreground }}>👤 {p.clientName}</Text>
                  <Text style={{ fontWeight: "700", color: colors.primary }}>{p.amount} ₺</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>📦 {p.planName}</Text>
                  <Text style={{ color: statusColor(p.status), fontSize: 12, fontWeight: "600" }}>{statusLabel(p.status)}</Text>
                </View>
                <Text style={{ color: colors.muted, fontSize: 11 }}>📅 {p.date}</Text>
              </View>
            ))}
          </>
        )}

        {/* PAKET BİLGİM (Danışan) */}
        {activeTab === "history" && role === "client" && (
          <>
            <Text style={{ color: colors.muted, fontSize: 13 }}>Mevcut abonelik bilginiz</Text>
            <View style={{ backgroundColor: "#22c55e20", borderRadius: 12, padding: 16, borderWidth: 2, borderColor: "#22c55e", gap: 8 }}>
              <Text style={{ fontWeight: "700", color: "#22c55e", fontSize: 16 }}>✅ Aktif Paket: Başlangıç</Text>
              <Text style={{ color: colors.foreground }}>💰 149 ₺/Aylık</Text>
              <Text style={{ color: colors.muted, fontSize: 13 }}>Yenileme: 1 Temmuz 2026</Text>
            </View>
          </>
        )}

        {/* FATURA */}
        {activeTab === "invoices" && (
          <>
            {role === "dietitian" ? (
              <>
                <Text style={{ color: colors.muted, fontSize: 13 }}>
                  Danışanların ödemelerini işaretleyin. Ödeme aldığınızda "Ödendi" olarak işaretleyin.
                </Text>
                {invoices.map(inv => (
                  <View key={inv.id} style={{
                    backgroundColor: colors.surface, borderRadius: 12, padding: 14, gap: 8,
                    borderWidth: 1, borderColor: inv.paid ? "#22c55e" : "#f97316",
                  }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <View>
                        <Text style={{ fontWeight: "700", color: colors.foreground }}>👤 {inv.clientName}</Text>
                        <Text style={{ color: colors.muted, fontSize: 12 }}>📦 {inv.planName} · {inv.amount} ₺</Text>
                        <Text style={{ color: colors.muted, fontSize: 12 }}>📅 {inv.date}</Text>
                      </View>
                      <View style={{ alignItems: "flex-end", gap: 4 }}>
                        <Text style={{ color: inv.paid ? "#22c55e" : "#f97316", fontWeight: "700" }}>
                          {inv.paid ? "✅ Ödendi" : "⏳ Bekliyor"}
                        </Text>
                        {inv.paid && inv.paidAt && (
                          <Text style={{ color: colors.muted, fontSize: 11 }}>{inv.paidAt}</Text>
                        )}
                      </View>
                    </View>
                    {!inv.paid && (
                      <TouchableOpacity onPress={() => markInvoicePaid(inv.id)}
                        style={{ paddingVertical: 10, borderRadius: 10, alignItems: "center", backgroundColor: "#22c55e20", borderWidth: 1, borderColor: "#22c55e" }}>
                        <Text style={{ color: "#22c55e", fontWeight: "700" }}>✅ Ödendi Olarak İşaretle</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </>
            ) : (
              <>
                <Text style={{ color: colors.muted, fontSize: 13 }}>Kendi ödeme geçmişiniz</Text>
                {myInvoices.length === 0 ? (
                  <Text style={{ color: colors.muted, textAlign: "center" }}>Henüz fatura yok.</Text>
                ) : myInvoices.map(inv => (
                  <View key={inv.id} style={{
                    backgroundColor: colors.surface, borderRadius: 12, padding: 14, gap: 6,
                    borderWidth: 1, borderColor: inv.paid ? "#22c55e" : "#f97316",
                  }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <View>
                        <Text style={{ fontWeight: "700", color: colors.foreground }}>📦 {inv.planName}</Text>
                        <Text style={{ color: colors.muted, fontSize: 12 }}>💰 {inv.amount} ₺ · 📅 {inv.date}</Text>
                      </View>
                      <Text style={{ color: inv.paid ? "#22c55e" : "#f97316", fontWeight: "700" }}>
                        {inv.paid ? "✅ Ödendi" : "⏳ Bekliyor"}
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* Paket Oluştur/Düzenle Modal */}
      <Modal visible={showNewPlan} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "#00000080", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, gap: 14 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground }}>
              {editPlan ? "✏️ Paket Düzenle" : "➕ Yeni Paket"}
            </Text>

            <TextInput value={planName} onChangeText={setPlanName}
              placeholder="Paket adı (örn: Premium)" placeholderTextColor={colors.muted}
              style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.foreground, backgroundColor: colors.surface }} />

            <TextInput value={planPrice} onChangeText={setPlanPrice}
              placeholder="Ücret (₺)" keyboardType="numeric" placeholderTextColor={colors.muted}
              style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.foreground, backgroundColor: colors.surface }} />

            <View style={{ flexDirection: "row", gap: 8 }}>
              {PERIODS.map(p => (
                <TouchableOpacity key={p} onPress={() => setPlanPeriod(p)}
                  style={{
                    flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center",
                    backgroundColor: planPeriod === p ? colors.primary : colors.surface,
                    borderWidth: 1, borderColor: planPeriod === p ? colors.primary : colors.border,
                  }}>
                  <Text style={{ color: planPeriod === p ? "#fff" : colors.foreground, fontSize: 12, fontWeight: "600" }}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput value={planFeatures} onChangeText={setPlanFeatures}
              placeholder={"İçerikler (her satıra bir özellik):\nSınırsız öğün\nVideo danışma\nHaftalık rapor"}
              multiline placeholderTextColor={colors.muted}
              style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.foreground, backgroundColor: colors.surface, minHeight: 100 }} />

            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity onPress={() => { setShowNewPlan(false); setEditPlan(null); }}
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.foreground }}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addOrUpdatePlan}
                style={{ flex: 2, paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: colors.primary }}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  {editPlan ? "💾 Güncelle" : "✅ Oluştur"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
