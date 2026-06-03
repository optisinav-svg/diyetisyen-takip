import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useEffect, useState } from "react";
import { getUserRegistration } from "@/lib/_core/user-registration";
import {
  createAppointment,
  getUserAppointments,
  updateAppointmentStatus,
  deleteAppointment,
  checkAppointmentConflict,
} from "@/lib/_core/calendar-appointments";
import { getDietitianClients, getClientDietitians } from "@/lib/_core/client-matching";
import { createNotification } from "@/lib/_core/notification-center";
import type { Appointment } from "@/lib/_core/calendar-appointments";

export default function CalendarAppointmentsScreen() {
  const router = useRouter();
  const colors = useColors();
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    clientEmail: "",
  });
  const [matchedUsers, setMatchedUsers] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await getUserRegistration();
      setUser(userData);

      if (userData?.email) {
        const userAppointments = await getUserAppointments(userData.email);
        setAppointments(userAppointments);

        // Eşleşen kullanıcıları yükle
        if (userData.role === "dietitian") {
          const clients = await getDietitianClients(userData.email);
          setMatchedUsers(clients.map((c) => ({ email: c.clientEmail, name: c.clientName })));
        } else {
          const dietitians = await getClientDietitians(userData.email);
          setMatchedUsers(dietitians.map((d) => ({ email: d.dietitianEmail, name: d.dietitianName })));
        }
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const handleAddAppointment = async () => {
    if (!formData.title.trim() || !formData.startTime || !formData.endTime || !formData.clientEmail) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurunuz");
      return;
    }

    try {
      const conflict = await checkAppointmentConflict(
        user.email,
        `${selectedDate}T${formData.startTime}`,
        `${selectedDate}T${formData.endTime}`
      );

      if (conflict) {
        Alert.alert("Hata", "Bu saatte başka bir randevu var");
        return;
      }

      const selectedUser = matchedUsers.find((u) => u.email === formData.clientEmail);

      const appointment = await createAppointment({
        title: formData.title,
        description: formData.description,
        startTime: `${selectedDate}T${formData.startTime}`,
        endTime: `${selectedDate}T${formData.endTime}`,
        clientId: formData.clientEmail,
        clientName: selectedUser?.name || "Danışan",
        clientEmail: formData.clientEmail,
        dietitianId: user.email,
        dietitianName: user.name,
        dietitianEmail: user.email,
        status: "scheduled",
      });

      // Bildirim gönder
      await createNotification({
        type: "appointment",
        title: "Yeni Randevu",
        message: `${formData.title} - ${formData.startTime}`,
        userId: formData.clientEmail,
        relatedId: appointment.id,
      });

      Alert.alert("Başarılı", "Randevu oluşturuldu");
      setFormData({ title: "", description: "", startTime: "", endTime: "", clientEmail: "" });
      setShowAddForm(false);
      loadData();
    } catch (error) {
      Alert.alert("Hata", "Randevu oluşturulurken bir hata oluştu");
      console.error(error);
    }
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      await updateAppointmentStatus(appointmentId, "completed");
      loadData();
    } catch (error) {
      console.error("Failed to complete appointment:", error);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await updateAppointmentStatus(appointmentId, "cancelled");
      loadData();
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
    }
  };

  const todayAppointments = appointments.filter((a) => a.startTime.startsWith(selectedDate));

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-3xl font-bold text-foreground">📅 Randevular</Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 6,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.foreground, fontWeight: "600" }}>← Geri</Text>
            </TouchableOpacity>
          </View>

          {/* Date Selector */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8 }}>Tarih Seç</Text>
            <TextInput
              placeholder="YYYY-MM-DD"
              value={selectedDate}
              onChangeText={setSelectedDate}
              placeholderTextColor={colors.muted}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                padding: 10,
                color: colors.foreground,
                backgroundColor: colors.background,
              }}
            />
          </View>

          {/* Add Appointment Button */}
          {!showAddForm && (
            <TouchableOpacity
              onPress={() => setShowAddForm(true)}
              style={{
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: colors.primary,
              }}
            >
              <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>
                + Randevu Ekle
              </Text>
            </TouchableOpacity>
          )}

          {/* Add Appointment Form */}
          {showAddForm && (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: colors.border,
                gap: 10,
              }}
            >
              <TextInput
                placeholder="Randevu Başlığı"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholderTextColor={colors.muted}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  padding: 10,
                  color: colors.foreground,
                  backgroundColor: colors.background,
                }}
              />
              <TextInput
                placeholder="Açıklama (opsiyonel)"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholderTextColor={colors.muted}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  padding: 10,
                  color: colors.foreground,
                  backgroundColor: colors.background,
                }}
              />
              <TextInput
                placeholder="Başlama Saati (HH:MM)"
                value={formData.startTime}
                onChangeText={(text) => setFormData({ ...formData, startTime: text })}
                placeholderTextColor={colors.muted}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  padding: 10,
                  color: colors.foreground,
                  backgroundColor: colors.background,
                }}
              />
              <TextInput
                placeholder="Bitiş Saati (HH:MM)"
                value={formData.endTime}
                onChangeText={(text) => setFormData({ ...formData, endTime: text })}
                placeholderTextColor={colors.muted}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  padding: 10,
                  color: colors.foreground,
                  backgroundColor: colors.background,
                }}
              />

              {/* Client/Dietitian Selector */}
              <View>
                <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8 }}>
                  {user?.role === "dietitian" ? "Danışan Seç" : "Diyetisyen Seç"}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                  {matchedUsers.map((u) => (
                    <TouchableOpacity
                      key={u.email}
                      onPress={() => setFormData({ ...formData, clientEmail: u.email })}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 20,
                        backgroundColor:
                          formData.clientEmail === u.email ? colors.primary : colors.background,
                        borderWidth: 1,
                        borderColor:
                          formData.clientEmail === u.email ? colors.primary : colors.border,
                      }}
                    >
                      <Text
                        style={{
                          color: formData.clientEmail === u.email ? "#fff" : colors.foreground,
                          fontWeight: "600",
                          fontSize: 12,
                        }}
                      >
                        {u.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={handleAddAppointment}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 6,
                    backgroundColor: colors.primary,
                  }}
                >
                  <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600", fontSize: 12 }}>
                    Oluştur
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowAddForm(false);
                    setFormData({ title: "", description: "", startTime: "", endTime: "", clientEmail: "" });
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 6,
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ color: colors.foreground, textAlign: "center", fontWeight: "600", fontSize: 12 }}>
                    İptal
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Appointments List */}
          <View className="gap-3">
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
              {selectedDate} Randevuları ({todayAppointments.length})
            </Text>
            {todayAppointments.length > 0 ? (
              todayAppointments.map((appointment) => (
                <View
                  key={appointment.id}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                    {appointment.title}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
                    ⏰ {appointment.startTime.split("T")[1]} - {appointment.endTime.split("T")[1]}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
                    👤 {user?.role === "dietitian" ? appointment.clientName : appointment.dietitianName}
                  </Text>
                  {appointment.description && (
                    <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
                      {appointment.description}
                    </Text>
                  )}

                  <View
                    style={{
                      backgroundColor:
                        appointment.status === "scheduled"
                          ? "#3B82F6"
                          : appointment.status === "completed"
                            ? "#10B981"
                            : "#EF4444",
                      paddingVertical: 4,
                      paddingHorizontal: 8,
                      borderRadius: 4,
                      alignSelf: "flex-start",
                      marginTop: 8,
                    }}
                  >
                    <Text style={{ fontSize: 10, color: "#fff", fontWeight: "600" }}>
                      {appointment.status === "scheduled"
                        ? "Planlandı"
                        : appointment.status === "completed"
                          ? "Tamamlandı"
                          : "İptal Edildi"}
                    </Text>
                  </View>

                  {appointment.status === "scheduled" && (
                    <View className="flex-row gap-2 mt-3">
                      <TouchableOpacity
                        onPress={() => handleCompleteAppointment(appointment.id)}
                        style={{
                          flex: 1,
                          paddingVertical: 6,
                          borderRadius: 6,
                          backgroundColor: "#10B981",
                        }}
                      >
                        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600", fontSize: 12 }}>
                          Tamamla
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleCancelAppointment(appointment.id)}
                        style={{
                          flex: 1,
                          paddingVertical: 6,
                          borderRadius: 6,
                          backgroundColor: "#EF4444",
                        }}
                      >
                        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600", fontSize: 12 }}>
                          İptal Et
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <Text style={{ textAlign: "center", color: colors.muted, marginVertical: 20 }}>
                Bu tarihte randevu yok
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
