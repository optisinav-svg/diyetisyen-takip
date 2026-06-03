import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Appointment {
  id: string;
  title: string;
  description?: string;
  startTime: string; // ISO 8601 format
  endTime: string; // ISO 8601 format
  clientId: string;
  clientName: string;
  clientEmail: string;
  dietitianId: string;
  dietitianName: string;
  dietitianEmail: string;
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const APPOINTMENTS_KEY = "appointments";

/**
 * Randevu oluştur
 */
export async function createAppointment(
  appointment: Omit<Appointment, "id" | "createdAt" | "updatedAt">
): Promise<Appointment> {
  try {
    const appointments = await getAppointments();
    const newAppointment: Appointment = {
      ...appointment,
      id: `appt_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    appointments.push(newAppointment);
    await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
    return newAppointment;
  } catch (error) {
    console.error("Failed to create appointment:", error);
    throw error;
  }
}

/**
 * Tüm randevuları al
 */
export async function getAppointments(): Promise<Appointment[]> {
  try {
    const data = await AsyncStorage.getItem(APPOINTMENTS_KEY);
    if (!data) return [];
    return JSON.parse(data) as Appointment[];
  } catch (error) {
    console.error("Failed to get appointments:", error);
    return [];
  }
}

/**
 * Kullanıcıya ait randevuları al (diyetisyen veya danışan)
 */
export async function getUserAppointments(userId: string): Promise<Appointment[]> {
  try {
    const appointments = await getAppointments();
    return appointments.filter((a) => a.clientEmail === userId || a.dietitianEmail === userId);
  } catch (error) {
    console.error("Failed to get user appointments:", error);
    return [];
  }
}

/**
 * Belirli bir tarih aralığındaki randevuları al
 */
export async function getAppointmentsByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Appointment[]> {
  try {
    const appointments = await getUserAppointments(userId);
    return appointments.filter((a) => {
      const appointmentDate = new Date(a.startTime);
      return appointmentDate >= startDate && appointmentDate <= endDate;
    });
  } catch (error) {
    console.error("Failed to get appointments by date range:", error);
    return [];
  }
}

/**
 * Randevu güncelle
 */
export async function updateAppointment(
  appointmentId: string,
  updates: Partial<Appointment>
): Promise<Appointment | null> {
  try {
    const appointments = await getAppointments();
    const appointment = appointments.find((a) => a.id === appointmentId);
    if (!appointment) return null;

    Object.assign(appointment, updates, {
      updatedAt: new Date().toISOString(),
    });
    await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
    return appointment;
  } catch (error) {
    console.error("Failed to update appointment:", error);
    throw error;
  }
}

/**
 * Randevu durumunu güncelle
 */
export async function updateAppointmentStatus(
  appointmentId: string,
  status: "scheduled" | "completed" | "cancelled"
): Promise<Appointment | null> {
  try {
    return await updateAppointment(appointmentId, { status });
  } catch (error) {
    console.error("Failed to update appointment status:", error);
    throw error;
  }
}

/**
 * Randevu sil
 */
export async function deleteAppointment(appointmentId: string): Promise<void> {
  try {
    const appointments = await getAppointments();
    const filtered = appointments.filter((a) => a.id !== appointmentId);
    await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete appointment:", error);
    throw error;
  }
}

/**
 * Bugünün randevularını al
 */
export async function getTodayAppointments(userId: string): Promise<Appointment[]> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await getAppointmentsByDateRange(userId, today, tomorrow);
  } catch (error) {
    console.error("Failed to get today appointments:", error);
    return [];
  }
}

/**
 * Yaklaşan randevuları al (sonraki 7 gün)
 */
export async function getUpcomingAppointments(userId: string): Promise<Appointment[]> {
  try {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return await getAppointmentsByDateRange(userId, today, nextWeek);
  } catch (error) {
    console.error("Failed to get upcoming appointments:", error);
    return [];
  }
}

/**
 * Randevu çakışmasını kontrol et
 */
export async function checkAppointmentConflict(
  userId: string,
  startTime: string,
  endTime: string,
  excludeId?: string
): Promise<boolean> {
  try {
    const appointments = await getUserAppointments(userId);
    const start = new Date(startTime);
    const end = new Date(endTime);

    return appointments.some((a) => {
      if (excludeId && a.id === excludeId) return false;
      if (a.status === "cancelled") return false;

      const aStart = new Date(a.startTime);
      const aEnd = new Date(a.endTime);

      return start < aEnd && end > aStart;
    });
  } catch (error) {
    console.error("Failed to check appointment conflict:", error);
    return false;
  }
}
