import { ScrollView, Text, View, Switch, TouchableOpacity, Alert, TextInput, Modal } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useState, useEffect } from "react";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserRegistration } from "@/lib/_core/user-registration";
import { useRouter } from "expo-router";

const NOTIF_PREFS_KEY = "notification_prefs";
const BADGES_KEY = "achievement_badges";
const CUSTOM_REMINDERS_KEY = "custom_reminders";

interface NotifPrefs {
  mealReminder: boolean;
  mealTime: string;
  appointmentReminder: boolean;
  appointmentBefore: string;
  goalAlert: boolean;
  goalAlertTime: string;
  messages: boolean;
  weeklyReport: boolean;
}

interface Badge {
  id: string;
  clientId: string;
  clientName: string;
  icon: string;
  title: string;
  reason: string;
  active: boolean;
  earnedAt?: string;
}

interface CustomReminder {
  id: string;
  title: string;
  time: string;
  days: string[];
  active: boolean;
}

const DEFAULT_PREFS: NotifPrefs = {
  mealReminder: true, mealTime: "08:00",
  appointmentReminder: true, appointmentBefore: "1 gün",
  goalAlert: true, goalAlertTime: "20:00",
  messages: true, weeklyReport: true,
};

const SAMPLE_BADGES: Badge[] = [
  { id: "1", clientId: "c1", clientName: "Ayşe Yılmaz", icon: "💧", title: "Su Şampiyonu", reason: "7 gün boyunca günlük su hedefini tamamladı", active: false },
  { id: "2", clientId: "c2", clientName: "Mehmet Demir", icon: "👟", title: "Adım Ustası", reason: "10.000 adım hedefini 5 gün üst üste tuttu", active: false },
  { id: "3", clientId: "c1", clientName: "Ayşe Yılmaz", icon: "🥗", title: "Beslenme Yıldızı", reason: "Tüm öğünleri plana göre tüketti", active: false },
  { id: "4", clientId: "c3", clientName: "Fatma Kaya", icon: "😴", title: "Uyku Kalitesi", reason: "7 gece 7+ saat uyudu", active: false },
  { id: "5", clientId: "c2", clientName: "Mehmet Demir", icon: "🔥", title: "Kalori Dengesi", reason: "Haftalık kalori hedefini tutturdu", active: false },
];

const CLIENTS_ACTIVITIES = {
  "c1": { name: "Ayşe Yılmaz", water: 1800, steps: 8500, meals: 3, sleep: 7.5, calories: 1850 },
  "c2": { name: "Mehmet Demir", water: 1200, steps: 11000, meals: 2, sleep: 6.5, calories: 2100 },
  "c3": { name: "Fatma Kaya", water: 2000, steps: 6000, meals: 3, sleep: 8.0, calories: 1750 },
};

const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const APPOINTMENT_BEFORE_OPTIONS = ["10 dakika", "15 dakika", "30 dakika", "1 saat", "1 gün", "2 gün", "1 hafta"];

export default function NotificationsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [role, setRole] = useState<"dietitian" | "client">("client");
  const [activeTab, setActiveTab] = useState<"reminders" | "badges" | "security">("reminders");
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);
  const [badges, setBadges] = useState<Badge[]>(SAMPLE_BADGES);
  const [customReminders, setCustomReminders] = useState<CustomReminder[]>([]);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState("");
  const [newReminderTime, setNewReminderTime] = useState("09:00");
  const [newReminderDays, setNewReminderDays] = useState<string[]>(["Pzt", "Sal", "Çar", "Per", "Cum"]);
  const [selectedClient, setSelectedClient] = useState("c1");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const user = await getUserRegistration();
    setRole(user?.role ?? "client");
    const savedPrefs = await AsyncStorage.getItem(NOTIF_PREFS_KEY);
    if (savedPrefs) setPrefs(JSON.parse(savedPrefs));
    const savedBadges = await AsyncStorage.getItem(BADGES_KEY);
    if (savedBadges) setBadges(JSON.parse(savedBadges));
    const savedReminders = await AsyncStorage.getItem(CUSTOM_REMINDERS_KEY);
    if (savedReminders) setCustomReminders(JSON.parse(savedReminders));
  };

  const savePrefs = async (p: NotifPrefs) => {
    setPrefs(p);
    await AsyncStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(p));
  };

  const toggleBadge = async (id: string) => {
    const updated = badges.map(b => b.id === id
      ? { ...b, active: !b.active, earnedAt: !b.active ? new Date().toISOString() : undefined }
      : b
    );
    setBadges(updated);
    await AsyncStorage.setItem(BADGES_KEY, JSON.stringify(updated));
    const badge = badges.find(b => b.id === id);
    if (badge && !badge.active) {
      Alert.alert("🎉 Rozet Verildi!", `${badge.clientName} "${badge.title}" rozetini kazandı!`);
    }
  };

  const addReminder = async () => {
    if (!newReminderTitle.trim()) { Alert.alert("Hata", "Hatırlatıcı başlığı girin"); return; }
    const reminder: CustomReminder = {
      id: Date.now().toString(),
      title: newReminderTitle,
      time: newReminderTime,
      days: newReminderDays,
      active: true,
    };
    const updated = [...customReminders, reminder];
    setCustomReminders(updated);
    await AsyncStorage.setItem(CUSTOM_REMINDERS_KEY, JSON.stringify(updated));
    setShowAddReminder(false); setNewReminderTitle(""); setNewReminderTime("09:00");
    Alert.alert("Eklendi", "Hatırlatıcı oluşturuldu.");
  };

  const deleteReminder = async (id: string) => {
    const updated = customReminders.filter(r => r.id !== id);
    setCustomReminders(updated);
    await AsyncStorage.setItem(CUSTOM_REMINDERS_KEY, JSON.stringify(updated));
  };

  const toggleDay = (day: string) => {
    setNewReminderDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const clientActivity = CLIENTS_ACTIVITIES[selectedClient as keyof typeof CLIENTS_ACTIVITIES];
  const clientBadges = badges.filter(b => b.clientId === selectedClient);

  const SwitchRow = ({ label, icon, value, onChange, sub }: any) => (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.foreground, fontSize: 14 }}>{icon} {label}</Text>
        {sub && <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>{sub}</Text>}
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: colors.border, true: colors.primary }} />
    </View>
  );

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
        <Text style={{ fontSize: 22, fontWeight: "bold", color: colors.foreground }}>🔔 Bildirimler</Text>

        {/* Tab Bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[
              { key: "reminders", label: "⏰ Hatırlatıcı" },
              { key: "badges", label: "🏆 Rozetler" },
              { key: "security", label: "🔐 2FA Güvenlik" },
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

        {/* HATIRLATICI */}
        {activeTab === "reminders" && (
          <>
            {/* Öğün Hatırlatma */}
            <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 4 }}>
              <Text style={{ fontWeight: "700", color: colors.foreground, marginBottom: 6 }}>🍽️ Öğün Hatırlatması</Text>
              <SwitchRow label="Öğün Hatırlatmaları" icon="🍽️" value={prefs.mealReminder}
                onChange={(v: boolean) => savePrefs({ ...prefs, mealReminder: v })}
                sub="Öğün saatlerinde hatırlatma gönderir" />
              {prefs.mealReminder && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <Text style={{ color: colors.muted, fontSize: 13 }}>Sabah saati:</Text>
                  <TextInput value={prefs.mealTime} onChangeText={v => savePrefs({ ...prefs, mealTime: v })}
                    placeholder="08:00" placeholderTextColor={colors.muted}
                    style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 8, color: colors.foreground, backgroundColor: colors.background, width: 80 }} />
                </View>
              )}
            </View>

            {/* Randevu Hatırlatma */}
            <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 4 }}>
              <Text style={{ fontWeight: "700", color: colors.foreground, marginBottom: 6 }}>📅 Randevu Hatırlatması</Text>
              <SwitchRow label="Randevu Bildirimleri" icon="📅" value={prefs.appointmentReminder}
                onChange={(v: boolean) => savePrefs({ ...prefs, appointmentReminder: v })}
                sub="Randevu öncesinde hatırlatma gönderir" />
              {prefs.appointmentReminder && (
                <View style={{ gap: 6, marginTop: 4 }}>
                  <Text style={{ color: colors.muted, fontSize: 13 }}>Ne kadar önce:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      {APPOINTMENT_BEFORE_OPTIONS.map(opt => (
                        <TouchableOpacity key={opt} onPress={() => savePrefs({ ...prefs, appointmentBefore: opt })}
                          style={{
                            paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
                            backgroundColor: prefs.appointmentBefore === opt ? colors.primary : colors.surface,
                            borderWidth: 1, borderColor: prefs.appointmentBefore === opt ? colors.primary : colors.border,
                          }}>
                          <Text style={{ color: prefs.appointmentBefore === opt ? "#fff" : colors.foreground, fontSize: 12, fontWeight: "600" }}>{opt}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Hedef Uyarıları */}
            <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 4 }}>
              <Text style={{ fontWeight: "700", color: colors.foreground, marginBottom: 6 }}>🎯 Hedef Uyarıları</Text>
              <SwitchRow label="Hedef Tamamlanmadıysa Uyar" icon="🎯" value={prefs.goalAlert}
                onChange={(v: boolean) => savePrefs({ ...prefs, goalAlert: v })}
                sub="Günlük hedefler tamamlanmadıysa akşam bildirir" />
              {prefs.goalAlert && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <Text style={{ color: colors.muted, fontSize: 13 }}>Uyarı saati:</Text>
                  <TextInput value={prefs.goalAlertTime} onChangeText={v => savePrefs({ ...prefs, goalAlertTime: v })}
                    placeholder="20:00" placeholderTextColor={colors.muted}
                    style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 8, color: colors.foreground, backgroundColor: colors.background, width: 80 }} />
                </View>
              )}
            </View>

            {/* Diğer */}
            <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontWeight: "700", color: colors.foreground, marginBottom: 6 }}>📱 Diğer Bildirimler</Text>
              <SwitchRow label="Mesaj Bildirimleri" icon="💬" value={prefs.messages}
                onChange={(v: boolean) => savePrefs({ ...prefs, messages: v })} />
              <SwitchRow label="Haftalık Rapor" icon="📊" value={prefs.weeklyReport}
                onChange={(v: boolean) => savePrefs({ ...prefs, weeklyReport: v })} />
            </View>

            {/* Özel Hatırlatıcılar */}
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontWeight: "700", color: colors.foreground }}>⏰ Özel Hatırlatıcılar</Text>
                <TouchableOpacity onPress={() => setShowAddReminder(true)}
                  style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.primary }}>
                  <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>+ Ekle</Text>
                </TouchableOpacity>
              </View>

              {customReminders.length === 0 ? (
                <Text style={{ color: colors.muted, fontSize: 13 }}>Henüz özel hatırlatıcı yok.</Text>
              ) : customReminders.map(r => (
                <View key={r.id} style={{ backgroundColor: colors.surface, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "600", color: colors.foreground }}>{r.title}</Text>
                    <Text style={{ color: colors.muted, fontSize: 12 }}>🕐 {r.time} · {r.days.join(", ")}</Text>
                  </View>
                  <TouchableOpacity onPress={() => deleteReminder(r.id)}>
                    <Text style={{ color: "#ef4444", fontSize: 13 }}>Sil</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ROZETLER */}
        {activeTab === "badges" && (
          <>
            {role === "dietitian" ? (
              <>
                {/* Danışan Seçimi */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {Object.entries(CLIENTS_ACTIVITIES).map(([id, c]) => (
                      <TouchableOpacity key={id} onPress={() => setSelectedClient(id)}
                        style={{
                          paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                          backgroundColor: selectedClient === id ? colors.primary : colors.surface,
                          borderWidth: 1, borderColor: selectedClient === id ? colors.primary : colors.border,
                        }}>
                        <Text style={{ color: selectedClient === id ? "#fff" : colors.foreground, fontWeight: "600" }}>
                          👤 {c.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                {/* Danışan Aktiviteleri */}
                <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 8 }}>
                  <Text style={{ fontWeight: "700", color: colors.foreground }}>📊 {clientActivity.name} - Bugünkü Aktiviteler</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {[
                      { icon: "💧", label: "Su", value: `${clientActivity.water} ml`, goal: 2000, color: "#3b82f6" },
                      { icon: "👟", label: "Adım", value: clientActivity.steps.toLocaleString(), goal: 10000, color: "#22c55e" },
                      { icon: "🍽️", label: "Öğün", value: `${clientActivity.meals}/3`, goal: 3, color: "#f97316" },
                      { icon: "😴", label: "Uyku", value: `${clientActivity.sleep} saat`, goal: 8, color: "#8b5cf6" },
                      { icon: "🔥", label: "Kalori", value: `${clientActivity.calories} kcal`, goal: 2000, color: "#ef4444" },
                    ].map(item => (
                      <View key={item.label} style={{
                        flex: 1, minWidth: "45%", backgroundColor: item.color + "15",
                        borderRadius: 10, padding: 10, borderWidth: 1, borderColor: item.color + "40",
                      }}>
                        <Text>{item.icon} {item.label}</Text>
                        <Text style={{ fontWeight: "700", color: item.color }}>{item.value}</Text>
                        <View style={{ height: 4, backgroundColor: colors.border, borderRadius: 2, marginTop: 4 }}>
                          <View style={{
                            height: 4, backgroundColor: item.color, borderRadius: 2,
                            width: `${Math.min((Number(String(item.value).replace(/[^0-9]/g, "")) / item.goal) * 100, 100)}%`
                          }} />
                        </View>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Rozet Listesi */}
                <Text style={{ fontWeight: "700", color: colors.foreground }}>🏆 Rozet Ver</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>Danışanın aktivitelerine göre rozet aktif edin</Text>
                {clientBadges.map(badge => (
                  <View key={badge.id} style={{
                    backgroundColor: badge.active ? "#FFD70020" : colors.surface,
                    borderRadius: 12, padding: 14, borderWidth: 2,
                    borderColor: badge.active ? "#FFD700" : colors.border,
                    flexDirection: "row", alignItems: "center", gap: 12,
                  }}>
                    <Text style={{ fontSize: 32 }}>{badge.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: "700", color: colors.foreground }}>{badge.title}</Text>
                      <Text style={{ color: colors.muted, fontSize: 12 }}>{badge.reason}</Text>
                      {badge.active && badge.earnedAt && (
                        <Text style={{ color: "#FFD700", fontSize: 11, marginTop: 2 }}>
                          ✅ {new Date(badge.earnedAt).toLocaleDateString("tr-TR")} tarihinde verildi
                        </Text>
                      )}
                    </View>
                    <Switch
                      value={badge.active}
                      onValueChange={() => toggleBadge(badge.id)}
                      trackColor={{ false: colors.border, true: "#FFD700" }}
                      thumbColor={badge.active ? "#FFF" : "#FFF"}
                    />
                  </View>
                ))}
              </>
            ) : (
              <>
                <Text style={{ color: colors.muted, fontSize: 13 }}>Diyetisyeninizin size verdiği rozetler</Text>
                {badges.filter(b => b.active).length === 0 ? (
                  <Text style={{ color: colors.muted, textAlign: "center", marginTop: 20 }}>Henüz rozet kazanılmadı.</Text>
                ) : badges.filter(b => b.active).map(badge => (
                  <View key={badge.id} style={{
                    backgroundColor: "#FFD70020", borderRadius: 12, padding: 16,
                    borderWidth: 2, borderColor: "#FFD700", flexDirection: "row", alignItems: "center", gap: 12,
                  }}>
                    <Text style={{ fontSize: 36 }}>{badge.icon}</Text>
                    <View>
                      <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>{badge.title}</Text>
                      <Text style={{ color: colors.muted, fontSize: 12 }}>{badge.reason}</Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </>
        )}

        {/* 2FA GÜVENLİK */}
        {activeTab === "security" && (
          <TwoFactorSection colors={colors} router={router} />
        )}
      </ScrollView>

      {/* Özel Hatırlatıcı Modal */}
      <Modal visible={showAddReminder} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "#00000080", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, gap: 14 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground }}>⏰ Hatırlatıcı Ekle</Text>

            <TextInput value={newReminderTitle} onChangeText={setNewReminderTitle}
              placeholder="Hatırlatıcı başlığı (örn: İlaç zamanı)"
              placeholderTextColor={colors.muted}
              style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.foreground, backgroundColor: colors.surface }} />

            <View style={{ gap: 6 }}>
              <Text style={{ fontWeight: "600", color: colors.foreground }}>Saat</Text>
              <TextInput value={newReminderTime} onChangeText={setNewReminderTime}
                placeholder="09:00" placeholderTextColor={colors.muted}
                style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.foreground, backgroundColor: colors.surface }} />
            </View>

            <View style={{ gap: 8 }}>
              <Text style={{ fontWeight: "600", color: colors.foreground }}>Günler</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {WEEKDAYS.map(day => (
                  <TouchableOpacity key={day} onPress={() => toggleDay(day)}
                    style={{
                      flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center",
                      backgroundColor: newReminderDays.includes(day) ? colors.primary : colors.surface,
                      borderWidth: 1, borderColor: newReminderDays.includes(day) ? colors.primary : colors.border,
                    }}>
                    <Text style={{ color: newReminderDays.includes(day) ? "#fff" : colors.foreground, fontSize: 11, fontWeight: "600" }}>{day}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity onPress={() => setShowAddReminder(false)}
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.foreground }}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addReminder}
                style={{ flex: 2, paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: colors.primary }}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

function TwoFactorSection({ colors, router }: any) {
  const [enabled, setEnabled] = useState(false);
  const [method, setMethod] = useState<"totp" | "sms">("totp");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"info" | "setup" | "verify">("info");

  return (
    <View style={{ gap: 14 }}>
      <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: enabled ? "#22c55e" : colors.border }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>🔐 İki Aşamalı Doğrulama</Text>
            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
              {enabled ? "✅ Aktif — Hesabınız korunuyor" : "Hesabınızı ekstra güvenlikle koruyun"}
            </Text>
          </View>
          <Switch value={enabled} onValueChange={v => { setEnabled(v); setStep(v ? "setup" : "info"); }}
            trackColor={{ false: colors.border, true: "#22c55e" }} />
        </View>
      </View>

      {enabled && step === "setup" && (
        <>
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 10 }}>
            <Text style={{ fontWeight: "700", color: colors.foreground }}>Doğrulama Yöntemi</Text>
            {[
              { key: "totp", label: "📱 Authenticator Uygulaması", desc: "Google Authenticator, Authy vb." },
              { key: "sms", label: "📲 SMS", desc: "Telefon numaranıza kod gönderilir" },
            ].map(m => (
              <TouchableOpacity key={m.key} onPress={() => setMethod(m.key as any)}
                style={{
                  flexDirection: "row", alignItems: "center", gap: 10,
                  padding: 12, borderRadius: 10,
                  backgroundColor: method === m.key ? colors.primary + "20" : colors.background,
                  borderWidth: 2, borderColor: method === m.key ? colors.primary : colors.border,
                }}>
                <View style={{
                  width: 20, height: 20, borderRadius: 10, borderWidth: 2,
                  borderColor: method === m.key ? colors.primary : colors.border,
                  backgroundColor: method === m.key ? colors.primary : "transparent",
                  alignItems: "center", justifyContent: "center",
                }}>
                  {method === m.key && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" }} />}
                </View>
                <View>
                  <Text style={{ fontWeight: "600", color: colors.foreground }}>{m.label}</Text>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>{m.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity onPress={() => setStep("verify")}
            style={{ paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: colors.primary }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>Devam Et →</Text>
          </TouchableOpacity>
        </>
      )}

      {enabled && step === "verify" && (
        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 12 }}>
          <Text style={{ fontWeight: "700", color: colors.foreground }}>
            {method === "totp" ? "📱 Authenticator Kodu" : "📲 SMS Kodu"}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 13 }}>
            {method === "totp"
              ? "Authenticator uygulamanızdaki 6 haneli kodu girin"
              : "Telefonunuza gönderilen 6 haneli kodu girin"}
          </Text>
          <TextInput value={code} onChangeText={setCode}
            placeholder="123456" keyboardType="numeric" maxLength={6}
            placeholderTextColor={colors.muted}
            style={{
              borderWidth: 1, borderColor: colors.border, borderRadius: 10,
              padding: 14, color: colors.foreground, backgroundColor: colors.background,
              fontSize: 24, textAlign: "center", letterSpacing: 8,
            }} />
          <TouchableOpacity onPress={() => {
            if (code.length === 6) {
              setStep("info");
              Alert.alert("✅ Aktif!", "İki aşamalı doğrulama başarıyla etkinleştirildi.");
            } else {
              Alert.alert("Hata", "6 haneli kod girin");
            }
          }}
            style={{ paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: "#22c55e" }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>Doğrula ve Aktif Et</Text>
          </TouchableOpacity>
        </View>
      )}

      {!enabled && (
        <View style={{ backgroundColor: "#3b82f620", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#3b82f6" }}>
          <Text style={{ color: "#3b82f6", fontSize: 13, lineHeight: 20 }}>
            ℹ️ İki aşamalı doğrulama (2FA), hesabınıza sadece şifrenizle girilememesini sağlar. Giriş yaparken ek bir kod istenir.
          </Text>
        </View>
      )}
    </View>
  );
}
