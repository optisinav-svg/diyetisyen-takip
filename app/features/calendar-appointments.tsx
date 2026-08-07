import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, Modal } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { BackButton } from "@/components/back-button";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserRegistration } from "@/lib/_core/user-registration";

const APPTS_KEY = "appointments";

interface Appointment {
  id: string;
  clientName: string;
  date: string;
  time: string;
  notes: string;
  reminderDays: number;
  reminderMinutes: number;
  createdAt: string;
}

const SAMPLE_CLIENTS = ["Ayşe Yılmaz", "Mehmet Demir", "Fatma Kaya", "Ali Öztürk"];
const HOURS = Array.from({ length: 13 }, (_, i) => `${(i + 8).toString().padStart(2, "0")}:00`);
const REMINDER_DAYS = [{ label: "Yok", value: 0 }, { label: "10 dk önce", value: 0.007 }, { label: "15 dk önce", value: 0.01 }, { label: "30 dk önce", value: 0.02 }, { label: "1 saat önce", value: 0.04 }, { label: "1 gün önce", value: 1 }, { label: "2 gün önce", value: 2 }, { label: "1 hafta önce", value: 7 }];

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const DAYS = ["Pz", "Pt", "Sa", "Ça", "Pe", "Cu", "Ct"];

export default function CalendarAppointments() {
  const colors = useColors();
  const [role, setRole] = useState<"dietitian" | "client">("dietitian");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [selectedClient, setSelectedClient] = useState(SAMPLE_CLIENTS[0]);
  const [notes, setNotes] = useState("");
  const [reminder, setReminder] = useState(REMINDER_DAYS[5]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [activeView, setActiveView] = useState<"calendar" | "list">("calendar");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const user = await getUserRegistration();
    setRole(user?.role ?? "dietitian");
    const saved = await AsyncStorage.getItem(APPTS_KEY);
    if (saved) setAppointments(JSON.parse(saved));
  };

  const saveAppointments = async (list: Appointment[]) => {
    setAppointments(list);
    await AsyncStorage.setItem(APPTS_KEY, JSON.stringify(list));
  };

  const createAppointment = async () => {
    if (!selectedDate) { Alert.alert("Hata", "Tarih seçin"); return; }
    const appt: Appointment = {
      id: Date.now().toString(),
      clientName: selectedClient,
      date: selectedDate,
      time: selectedTime,
      notes,
      reminderDays: reminder.value,
      reminderMinutes: 0,
      createdAt: new Date().toISOString(),
    };
    await saveAppointments([...appointments, appt]);
    setShowForm(false);
    setSelectedDate(null);
    setNotes("");
    Alert.alert("Randevu Oluşturuldu", `${selectedClient} - ${selectedDate} ${selectedTime}`);
  };

  const deleteAppointment = (id: string) => {
    Alert.alert("Sil", "Bu randevuyu silmek istiyor musunuz?", [
      { text: "İptal", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: () => saveAppointments(appointments.filter(a => a.id !== id)) },
    ]);
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const apptDates = new Set(appointments.map(a => a.date));

  const todayStr = new Date().toISOString().split("T")[0];
  const selectedAppts = appointments.filter(a => a.date === selectedDate);

  const busyHours = selectedDate
    ? new Set(appointments.filter(a => a.date === selectedDate).map(a => a.time))
    : new Set<string>();

  return (
    <ScreenContainer>
      <BackButton title="📅 Randevu Sistemi" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>

        {/* View Toggle */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          {(["calendar", "list"] as const).map(v => (
            <TouchableOpacity key={v} onPress={() => setActiveView(v)}
              style={{
                flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center",
                backgroundColor: activeView === v ? colors.primary : colors.surface,
                borderWidth: 1, borderColor: activeView === v ? colors.primary : colors.border,
              }}>
              <Text style={{ color: activeView === v ? "#fff" : colors.foreground, fontWeight: "600" }}>
                {v === "calendar" ? "📅 Takvim" : `📋 Liste (${appointments.length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeView === "calendar" && (
          <>
            {/* Month Navigation */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border }}>
              <TouchableOpacity onPress={() => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); } else setCurrentMonth(m => m - 1); }}
                style={{ padding: 8 }}>
                <Text style={{ color: colors.primary, fontSize: 18, fontWeight: "700" }}>←</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground }}>
                {MONTHS[currentMonth]} {currentYear}
              </Text>
              <TouchableOpacity onPress={() => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); } else setCurrentMonth(m => m + 1); }}
                style={{ padding: 8 }}>
                <Text style={{ color: colors.primary, fontSize: 18, fontWeight: "700" }}>→</Text>
              </TouchableOpacity>
            </View>

            {/* Calendar Grid */}
            <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ flexDirection: "row", marginBottom: 8 }}>
                {DAYS.map(d => (
                  <Text key={d} style={{ flex: 1, textAlign: "center", color: colors.muted, fontWeight: "600", fontSize: 12 }}>{d}</Text>
                ))}
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {Array.from({ length: firstDay }).map((_, i) => (
                  <View key={`empty-${i}`} style={{ width: "14.28%", height: 40 }} />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
                  const hasAppt = apptDates.has(dateStr);
                  const isToday = dateStr === todayStr;
                  const isSelected = dateStr === selectedDate;
                  return (
                    <TouchableOpacity key={day} onPress={() => setSelectedDate(dateStr === selectedDate ? null : dateStr)}
                      style={{
                        width: "14.28%", height: 40, alignItems: "center", justifyContent: "center",
                      }}>
                      <View style={{
                        width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center",
                        backgroundColor: isSelected ? colors.primary : isToday ? colors.primary + "30" : "transparent",
                      }}>
                        <Text style={{
                          color: isSelected ? "#fff" : isToday ? colors.primary : colors.foreground,
                          fontWeight: isToday || isSelected ? "700" : "400", fontSize: 13,
                        }}>{day}</Text>
                      </View>
                      {hasAppt && (
                        <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: colors.primary, marginTop: 2 }} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Selected Day Detail */}
            {selectedDate && (
              <View style={{ gap: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>
                  📅 {selectedDate} Randevuları
                </Text>

                {selectedAppts.length === 0 ? (
                  <Text style={{ color: colors.muted }}>Bu günde randevu yok.</Text>
                ) : selectedAppts.map(appt => (
                  <View key={appt.id} style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.primary }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={{ fontWeight: "700", color: colors.foreground }}>🕐 {appt.time} — {appt.clientName}</Text>
                      {role === "dietitian" && (
                        <TouchableOpacity onPress={() => deleteAppointment(appt.id)}>
                          <Text style={{ color: "#ef4444", fontSize: 13 }}>İptal</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    {appt.notes ? <Text style={{ color: colors.muted, fontSize: 13, marginTop: 4 }}>{appt.notes}</Text> : null}
                    {appt.reminderDays > 0 && (
                      <Text style={{ color: colors.primary, fontSize: 12, marginTop: 4 }}>
                        🔔 {REMINDER_DAYS.find(r => r.value === appt.reminderDays)?.label ?? "Hatırlatma var"}
                      </Text>
                    )}
                  </View>
                ))}

                {/* Boş Saat Seçimi */}
                {role === "dietitian" && (
                  <>
                    <Text style={{ fontWeight: "600", color: colors.foreground }}>Boş Saatler:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        {HOURS.map(h => {
                          const isBusy = busyHours.has(h);
                          const isChosen = selectedTime === h;
                          return (
                            <TouchableOpacity key={h} onPress={() => { if (!isBusy) setSelectedTime(h); }}
                              disabled={isBusy}
                              style={{
                                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                                backgroundColor: isBusy ? "#ef444430" : isChosen ? colors.primary : colors.surface,
                                borderWidth: 1, borderColor: isBusy ? "#ef4444" : isChosen ? colors.primary : colors.border,
                              }}>
                              <Text style={{ color: isBusy ? "#ef4444" : isChosen ? "#fff" : colors.foreground, fontSize: 13, fontWeight: "600" }}>
                                {isBusy ? `${h} ✗` : h}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </ScrollView>

                    <TouchableOpacity onPress={() => setShowForm(true)}
                      style={{ paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: colors.primary }}>
                      <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
                        + {selectedDate} {selectedTime} Randevu Oluştur
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </>
        )}

        {activeView === "list" && (
          <>
            {appointments.length === 0 ? (
              <Text style={{ color: colors.muted, textAlign: "center", marginTop: 20 }}>Henüz randevu yok.</Text>
            ) : [...appointments].sort((a, b) => a.date.localeCompare(b.date)).map(appt => (
              <View key={appt.id} style={{
                backgroundColor: colors.surface, borderRadius: 12, padding: 14, gap: 6,
                borderWidth: 1, borderColor: colors.border,
              }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontWeight: "700", color: colors.foreground }}>📅 {appt.date} {appt.time}</Text>
                  {role === "dietitian" && (
                    <TouchableOpacity onPress={() => deleteAppointment(appt.id)}>
                      <Text style={{ color: "#ef4444", fontSize: 13 }}>İptal</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={{ color: colors.foreground }}>👤 {appt.clientName}</Text>
                {appt.notes ? <Text style={{ color: colors.muted, fontSize: 13 }}>{appt.notes}</Text> : null}
                {appt.reminderDays > 0 && (
                  <Text style={{ color: colors.primary, fontSize: 12 }}>
                    🔔 {REMINDER_DAYS.find(r => r.value === appt.reminderDays)?.label}
                  </Text>
                )}
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Randevu Oluşturma Modalı */}
      <Modal visible={showForm} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "#00000080", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, gap: 14 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground }}>Randevu Oluştur</Text>
            <Text style={{ color: colors.muted }}>📅 {selectedDate} 🕐 {selectedTime}</Text>

            {/* Danışan Seçimi */}
            <View style={{ gap: 6 }}>
              <Text style={{ fontWeight: "600", color: colors.foreground }}>Danışan</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {SAMPLE_CLIENTS.map(c => (
                    <TouchableOpacity key={c} onPress={() => setSelectedClient(c)}
                      style={{
                        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                        backgroundColor: selectedClient === c ? colors.primary : colors.surface,
                        borderWidth: 1, borderColor: selectedClient === c ? colors.primary : colors.border,
                      }}>
                      <Text style={{ color: selectedClient === c ? "#fff" : colors.foreground, fontWeight: "600" }}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Hatırlatma */}
            <View style={{ gap: 6 }}>
              <Text style={{ fontWeight: "600", color: colors.foreground }}>Hatırlatma</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {REMINDER_DAYS.map(r => (
                    <TouchableOpacity key={r.label} onPress={() => setReminder(r)}
                      style={{
                        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
                        backgroundColor: reminder.label === r.label ? colors.primary : colors.surface,
                        borderWidth: 1, borderColor: reminder.label === r.label ? colors.primary : colors.border,
                      }}>
                      <Text style={{ color: reminder.label === r.label ? "#fff" : colors.foreground, fontSize: 12, fontWeight: "600" }}>
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Notlar */}
            <TextInput
              placeholder="Not ekleyin (isteğe bağlı)"
              value={notes}
              onChangeText={setNotes}
              placeholderTextColor={colors.muted}
              multiline
              style={{
                borderWidth: 1, borderColor: colors.border, borderRadius: 10,
                padding: 12, color: colors.foreground, backgroundColor: colors.surface, minHeight: 70,
              }}
            />

            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity onPress={() => setShowForm(false)}
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.foreground, fontWeight: "600" }}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={createAppointment}
                style={{ flex: 2, paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: colors.primary }}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>Randevu Oluştur</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
