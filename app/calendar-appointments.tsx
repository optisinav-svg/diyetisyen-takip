import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, Modal, Switch, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { BackButton } from "@/components/back-button";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserRegistration } from "@/lib/_core/user-registration";
import DateTimePicker from "@react-native-community/datetimepicker";

const APPTS_KEY = "appointments_v2";
const REMINDER_SETTINGS_KEY = "appt_reminder_settings";

interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  startTime: string;
  endTime: string;
  notes: string;
  createdAt: string;
}

interface ReminderSettings {
  clientActive: boolean;
  clientTime: string;
  dietitianActive: boolean;
  dietitianTime: string;
}

const SAMPLE_CLIENTS = [
  { id: "c1", name: "Ayşe Yılmaz" },
  { id: "c2", name: "Mehmet Demir" },
  { id: "c3", name: "Fatma Kaya" },
  { id: "c4", name: "Ali Öztürk" },
];

const MONTHS = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
const DAYS_SHORT = ["Pz","Pt","Sa","Ça","Pe","Cu","Ct"];
const HOURS = Array.from({ length: 13 }, (_, i) => `${(i + 8).toString().padStart(2, "0")}:00`);

function formatDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function displayDate(s: string) {
  const d = new Date(s);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
function getFirstDayOfMonth(y: number, m: number) { return new Date(y, m, 1).getDay(); }
function getDaysInMonth(y: number, m: number) { return new Date(y, m+1, 0).getDate(); }

// Get week days for weekly view
function getWeekDays(date: Date) {
  const day = date.getDay();
  const start = new Date(date);
  start.setDate(date.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export default function CalendarAppointments() {
  const colors = useColors();
  const [role, setRole] = useState<"dietitian" | "client">("dietitian");
  const [userName, setUserName] = useState("Diyetisyen");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    clientActive: true, clientTime: "10:00",
    dietitianActive: true, dietitianTime: "20:00",
  });
  const [activeView, setActiveView] = useState<"monthly" | "weekly" | "reminder">("monthly");

  // Monthly view state
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Weekly view state
  const [weekDate, setWeekDate] = useState(new Date());

  // Create appointment modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(SAMPLE_CLIENTS[0]);
  const [apptStartTime, setApptStartTime] = useState("09:00");
  const [apptEndTime, setApptEndTime] = useState("10:00");
  const [apptNotes, setApptNotes] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const user = await getUserRegistration();
    setRole(user?.role ?? "dietitian");
    setUserName(user?.name ?? "Diyetisyen");
    const saved = await AsyncStorage.getItem(APPTS_KEY);
    if (saved) setAppointments(JSON.parse(saved));
    const savedReminder = await AsyncStorage.getItem(REMINDER_SETTINGS_KEY);
    if (savedReminder) setReminderSettings(JSON.parse(savedReminder));
  };

  const saveAppointments = async (list: Appointment[]) => {
    setAppointments(list);
    await AsyncStorage.setItem(APPTS_KEY, JSON.stringify(list));
  };

  const saveReminderSettings = async (s: ReminderSettings) => {
    setReminderSettings(s);
    await AsyncStorage.setItem(REMINDER_SETTINGS_KEY, JSON.stringify(s));
  };

  const createAppointment = async () => {
    if (!selectedDate) { Alert.alert("Hata", "Tarih seçin"); return; }
    if (!apptStartTime || !apptEndTime) { Alert.alert("Hata", "Başlangıç ve bitiş saati girin"); return; }

    const appt: Appointment = {
      id: Date.now().toString(),
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      date: selectedDate,
      startTime: apptStartTime,
      endTime: apptEndTime,
      notes: apptNotes,
      createdAt: new Date().toISOString(),
    };

    await saveAppointments([...appointments, appt]);
    setShowCreateModal(false);
    setApptNotes("");

    // Uygulama içi mesaj simülasyonu
    Alert.alert(
      "✅ Randevu Oluşturuldu",
      `${selectedClient.name}'a şu mesaj iletildi:\n\n"${displayDate(selectedDate)} tarihinde, ${apptStartTime}-${apptEndTime} saat aralığında, ${userName} ile randevunuz oluşturulmuştur."`
    );
  };

  const deleteAppointment = (id: string) => {
    Alert.alert("İptal", "Bu randevuyu iptal etmek istiyor musunuz?", [
      { text: "Hayır", style: "cancel" },
      { text: "İptal Et", style: "destructive", onPress: () => saveAppointments(appointments.filter(a => a.id !== id)) },
    ]);
  };

  const todayStr = formatDate(new Date());
  const apptDates = new Set(appointments.map(a => a.date));
  const selectedAppts = appointments.filter(a => a.date === selectedDate);
  const busyHours = new Set(selectedDate ? appointments.filter(a => a.date === selectedDate).map(a => a.startTime) : []);

  // Weekly view data
  const weekDays = getWeekDays(weekDate);
  const weekAppts = appointments.filter(a => weekDays.some(d => formatDate(d) === a.date));

  // ── MONTHLY VIEW ──
  const MonthlyView = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    return (
      <View style={{ gap: 14 }}>
        {/* Month Nav */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border }}>
          <TouchableOpacity onPress={() => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y-1); } else setCurrentMonth(m => m-1); }} style={{ padding: 8 }}>
            <Text style={{ color: colors.primary, fontSize: 20, fontWeight: "700" }}>←</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground }}>{MONTHS[currentMonth]} {currentYear}</Text>
          <TouchableOpacity onPress={() => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y+1); } else setCurrentMonth(m => m+1); }} style={{ padding: 8 }}>
            <Text style={{ color: colors.primary, fontSize: 20, fontWeight: "700" }}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ flexDirection: "row", marginBottom: 8 }}>
            {DAYS_SHORT.map(d => (
              <Text key={d} style={{ flex: 1, textAlign: "center", color: colors.muted, fontWeight: "700", fontSize: 12 }}>{d}</Text>
            ))}
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {Array.from({ length: firstDay }).map((_, i) => (
              <View key={`e${i}`} style={{ width: "14.28%", height: 44 }} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i+1).map(day => {
              const dateStr = `${currentYear}-${String(currentMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
              const hasAppt = apptDates.has(dateStr);
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              return (
                <TouchableOpacity key={day} onPress={() => setSelectedDate(isSelected ? null : dateStr)}
                  style={{ width: "14.28%", height: 44, alignItems: "center", justifyContent: "center" }}>
                  <View style={{
                    width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center",
                    backgroundColor: isSelected ? colors.primary : isToday ? colors.primary + "30" : "transparent",
                  }}>
                    <Text style={{ color: isSelected ? "#fff" : isToday ? colors.primary : colors.foreground, fontWeight: isToday || isSelected ? "700" : "400", fontSize: 14 }}>
                      {day}
                    </Text>
                  </View>
                  {hasAppt && <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: colors.primary, marginTop: 1 }} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected Day */}
        {selectedDate && (
          <View style={{ gap: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>
              📅 {displayDate(selectedDate)}
            </Text>

            {selectedAppts.length === 0 ? (
              <Text style={{ color: colors.muted }}>Bu günde randevu yok.</Text>
            ) : selectedAppts.map(appt => (
              <View key={appt.id} style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.primary, gap: 6 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontWeight: "700", color: colors.foreground }}>
                    🕐 {appt.startTime} - {appt.endTime}
                  </Text>
                  {role === "dietitian" && (
                    <TouchableOpacity onPress={() => deleteAppointment(appt.id)}>
                      <Text style={{ color: "#ef4444", fontSize: 13 }}>İptal</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={{ color: colors.foreground }}>👤 {appt.clientName}</Text>
                {appt.notes ? <Text style={{ color: colors.muted, fontSize: 13 }}>{appt.notes}</Text> : null}
              </View>
            ))}

            {/* Saat seçimi ve randevu oluştur (sadece diyetisyen) */}
            {role === "dietitian" && (
              <>
                <Text style={{ fontWeight: "600", color: colors.foreground }}>Başlangıç Saati Seç:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {HOURS.map(h => {
                      const busy = busyHours.has(h);
                      const chosen = apptStartTime === h;
                      return (
                        <TouchableOpacity key={h} onPress={() => { if (!busy) setApptStartTime(h); }} disabled={busy}
                          style={{
                            paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                            backgroundColor: busy ? "#ef444430" : chosen ? colors.primary : colors.surface,
                            borderWidth: 1, borderColor: busy ? "#ef4444" : chosen ? colors.primary : colors.border,
                          }}>
                          <Text style={{ color: busy ? "#ef4444" : chosen ? "#fff" : colors.foreground, fontWeight: "600", fontSize: 13 }}>
                            {busy ? `${h} ✗` : h}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>

                <TouchableOpacity
                  onPress={() => {
                    // Auto set end time +1 hour
                    const startH = parseInt(apptStartTime);
                    setApptEndTime(`${String(startH+1).padStart(2,"0")}:00`);
                    setShowCreateModal(true);
                  }}
                  style={{ paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: colors.primary }}>
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
                    + {displayDate(selectedDate)} {apptStartTime} Randevu Oluştur
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  // ── WEEKLY VIEW ──
  const WeeklyView = () => (
    <View style={{ gap: 14 }}>
      {/* Week Nav */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border }}>
        <TouchableOpacity onPress={() => { const d = new Date(weekDate); d.setDate(d.getDate()-7); setWeekDate(d); }} style={{ padding: 8 }}>
          <Text style={{ color: colors.primary, fontSize: 20, fontWeight: "700" }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 15, fontWeight: "700", color: colors.foreground }}>
          {displayDate(formatDate(weekDays[0]))} - {displayDate(formatDate(weekDays[6]))}
        </Text>
        <TouchableOpacity onPress={() => { const d = new Date(weekDate); d.setDate(d.getDate()+7); setWeekDate(d); }} style={{ padding: 8 }}>
          <Text style={{ color: colors.primary, fontSize: 20, fontWeight: "700" }}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Week Grid */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {weekDays.map(day => {
            const dateStr = formatDate(day);
            const dayAppts = appointments.filter(a => a.date === dateStr);
            const isToday = dateStr === todayStr;
            return (
              <TouchableOpacity key={dateStr} onPress={() => { setSelectedDate(dateStr); setActiveView("monthly"); setCurrentMonth(day.getMonth()); setCurrentYear(day.getFullYear()); }}
                style={{
                  width: 100, backgroundColor: isToday ? colors.primary + "20" : colors.surface,
                  borderRadius: 12, padding: 10, borderWidth: isToday ? 2 : 1,
                  borderColor: isToday ? colors.primary : colors.border, gap: 6, minHeight: 120,
                }}>
                <Text style={{ fontWeight: "700", color: isToday ? colors.primary : colors.foreground, fontSize: 12 }}>
                  {DAYS_SHORT[day.getDay()]}
                </Text>
                <Text style={{ fontWeight: "700", color: isToday ? colors.primary : colors.foreground, fontSize: 18 }}>
                  {day.getDate()}
                </Text>
                {dayAppts.map(a => (
                  <View key={a.id} style={{ backgroundColor: colors.primary, borderRadius: 6, padding: 4 }}>
                    <Text style={{ color: "#fff", fontSize: 10, fontWeight: "600" }} numberOfLines={1}>
                      {a.startTime} {a.clientName.split(" ")[0]}
                    </Text>
                  </View>
                ))}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Week appointments list */}
      {weekAppts.length > 0 && (
        <View style={{ gap: 8 }}>
          <Text style={{ fontWeight: "700", color: colors.foreground }}>Bu Haftaki Randevular</Text>
          {weekAppts.sort((a,b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)).map(appt => (
            <View key={appt.id} style={{ backgroundColor: colors.surface, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontWeight: "700", color: colors.foreground }}>
                📅 {displayDate(appt.date)} · 🕐 {appt.startTime}-{appt.endTime}
              </Text>
              <Text style={{ color: colors.muted, fontSize: 13 }}>👤 {appt.clientName}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  // ── REMINDER SETTINGS ──
  const ReminderView = () => (
    <View style={{ gap: 14 }}>
      {/* Danışan Hatırlatma */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>👤 Danışan Hatırlatması</Text>
        <Text style={{ color: colors.muted, fontSize: 13 }}>Randevudan bir gün önce danışana bildirim gider.</Text>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ color: colors.foreground }}>🔔 Hatırlatma Aktif</Text>
          <Switch
            value={reminderSettings.clientActive}
            onValueChange={v => saveReminderSettings({ ...reminderSettings, clientActive: v })}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        {reminderSettings.clientActive && (
          <View style={{ gap: 6 }}>
            <Text style={{ color: colors.foreground, fontSize: 13 }}>Bildirim Saati</Text>
            <TextInput
              value={reminderSettings.clientTime}
              onChangeText={v => saveReminderSettings({ ...reminderSettings, clientTime: v })}
              placeholder="10:00"
              placeholderTextColor={colors.muted}
              style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.foreground, backgroundColor: colors.background, width: 100 }}
            />
            <View style={{ backgroundColor: "#3b82f620", borderRadius: 8, padding: 10, borderWidth: 1, borderColor: "#3b82f6" }}>
              <Text style={{ color: "#3b82f6", fontSize: 12 }}>
                📩 Örnek mesaj:{"\n"}
                "15 Haziran 2026 tarihinde, 09:00-10:00 saat aralığında, Dr. Ayşe Kaya ile randevunuz oluşturulmuştur."
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Diyetisyen Hatırlatma */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>👨‍⚕️ Diyetisyen Hatırlatması</Text>
        <Text style={{ color: colors.muted, fontSize: 13 }}>Her gün belirtilen saatte ertesi güne ait randevuların tam listesi bildirim olarak gider.</Text>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ color: colors.foreground }}>🔔 Hatırlatma Aktif</Text>
          <Switch
            value={reminderSettings.dietitianActive}
            onValueChange={v => saveReminderSettings({ ...reminderSettings, dietitianActive: v })}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        {reminderSettings.dietitianActive && (
          <View style={{ gap: 6 }}>
            <Text style={{ color: colors.foreground, fontSize: 13 }}>Bildirim Saati</Text>
            <TextInput
              value={reminderSettings.dietitianTime}
              onChangeText={v => saveReminderSettings({ ...reminderSettings, dietitianTime: v })}
              placeholder="20:00"
              placeholderTextColor={colors.muted}
              style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.foreground, backgroundColor: colors.background, width: 100 }}
            />
            <View style={{ backgroundColor: "#3b82f620", borderRadius: 8, padding: 10, borderWidth: 1, borderColor: "#3b82f6" }}>
              <Text style={{ color: "#3b82f6", fontSize: 12 }}>
                📩 Örnek bildirim:{"\n"}
                "Yarınki randevular:{"\n"}
                • Ayşe Yılmaz - 09:00{"\n"}
                • Mehmet Demir - 11:00{"\n"}
                • Fatma Kaya - 14:00"
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Yarınki randevuları önizle */}
      {(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = formatDate(tomorrow);
        const tomorrowAppts = appointments.filter(a => a.date === tomorrowStr).sort((a,b) => a.startTime.localeCompare(b.startTime));
        if (tomorrowAppts.length === 0) return null;
        return (
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 8 }}>
            <Text style={{ fontWeight: "700", color: colors.foreground }}>📋 Yarınki Randevular ({displayDate(tomorrowStr)})</Text>
            {tomorrowAppts.map(a => (
              <View key={a.id} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 }}>
                <Text style={{ color: colors.foreground }}>👤 {a.clientName}</Text>
                <Text style={{ color: colors.primary, fontWeight: "600" }}>🕐 {a.startTime} - {a.endTime}</Text>
              </View>
            ))}
          </View>
        );
      })()}
    </View>
  );

  return (
    <ScreenContainer>
      <BackButton title="📅 Randevu Sistemi" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>

        {/* View Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[
              { key: "monthly", label: "📅 Aylık" },
              { key: "weekly", label: "📆 Haftalık" },
              { key: "reminder", label: "🔔 Hatırlatma" },
            ].map(v => (
              <TouchableOpacity key={v.key} onPress={() => setActiveView(v.key as any)}
                style={{
                  paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
                  backgroundColor: activeView === v.key ? colors.primary : colors.surface,
                  borderWidth: 1, borderColor: activeView === v.key ? colors.primary : colors.border,
                }}>
                <Text style={{ color: activeView === v.key ? "#fff" : colors.foreground, fontWeight: "600" }}>
                  {v.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {activeView === "monthly" && <MonthlyView />}
        {activeView === "weekly" && <WeeklyView />}
        {activeView === "reminder" && <ReminderView />}
      </ScrollView>

      {/* Randevu Oluşturma Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "#00000080", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, gap: 14 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground }}>📅 Randevu Oluştur</Text>
            <Text style={{ color: colors.muted }}>📅 {selectedDate ? displayDate(selectedDate) : ""}</Text>

            {/* Danışan Seçimi */}
            <View style={{ gap: 6 }}>
              <Text style={{ fontWeight: "600", color: colors.foreground }}>👤 Danışan Seçin</Text>
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
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Saat */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontWeight: "600", color: colors.foreground }}>🕐 Başlangıç</Text>
                <TextInput value={apptStartTime} onChangeText={setApptStartTime} placeholder="09:00"
                  placeholderTextColor={colors.muted}
                  style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.foreground, backgroundColor: colors.surface }} />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontWeight: "600", color: colors.foreground }}>🕐 Bitiş</Text>
                <TextInput value={apptEndTime} onChangeText={setApptEndTime} placeholder="10:00"
                  placeholderTextColor={colors.muted}
                  style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.foreground, backgroundColor: colors.surface }} />
              </View>
            </View>

            {/* Not */}
            <TextInput value={apptNotes} onChangeText={setApptNotes}
              placeholder="Not ekleyin (isteğe bağlı)" multiline placeholderTextColor={colors.muted}
              style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.foreground, backgroundColor: colors.surface, minHeight: 60 }} />

            {/* Mesaj önizleme */}
            <View style={{ backgroundColor: "#22c55e20", borderRadius: 10, padding: 10, borderWidth: 1, borderColor: "#22c55e" }}>
              <Text style={{ color: "#22c55e", fontSize: 12 }}>
                📩 {selectedClient.name}'a gönderilecek mesaj:{"\n"}
                "{selectedDate ? displayDate(selectedDate) : "..."} tarihinde, {apptStartTime}-{apptEndTime} saat aralığında, {userName} ile randevunuz oluşturulmuştur."
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.foreground }}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={createAppointment}
                style={{ flex: 2, paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: colors.primary }}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>✅ Randevu Oluştur ve Mesaj Gönder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
