export interface Feature {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  route: string;
}

export const ALL_FEATURES: Feature[] = [
  // Beslenme Takibi
  { id: "nut-1", title: "Öğün Ekle", description: "Yemek ve kalori kaydı", category: "Beslenme Takibi", icon: "🍽️", route: "/(tabs)/meals" },
  { id: "nut-2", title: "Beslenme Hedefleri", description: "Kalori ve makro hedefleri", category: "Beslenme Takibi", icon: "🎯", route: "/(tabs)/meals" },
  { id: "nut-3", title: "Öğün Fotoğrafı", description: "Fotoğraf ile öğün kaydı", category: "Beslenme Takibi", icon: "📷", route: "/meal-photo-upload" },
  { id: "nut-4", title: "Haftalık Rapor", description: "Haftalık beslenme özeti", category: "Beslenme Takibi", icon: "📊", route: "/weekly-reports" },

  // Sağlık Verileri
  { id: "health-1", title: "Su Takibi", description: "Günlük su tüketimi", category: "Sağlık Verileri", icon: "💧", route: "/features/health" },
  { id: "health-2", title: "Kalori Yakımı", description: "Aktivite ve egzersiz", category: "Sağlık Verileri", icon: "🔥", route: "/features/health" },
  { id: "health-3", title: "BMI Hesaplama", description: "Vücut kitle indeksi", category: "Sağlık Verileri", icon: "📏", route: "/features/health" },
  { id: "health-4", title: "Kan Şekeri", description: "Kan şekeri takibi", category: "Sağlık Verileri", icon: "🩸", route: "/features/health" },
  { id: "health-5", title: "Tansiyon", description: "Tansiyon ölçüm kaydı", category: "Sağlık Verileri", icon: "💓", route: "/features/health" },
  { id: "health-6", title: "Akıllı Saat", description: "Wearable cihaz bağlantısı", category: "Sağlık Verileri", icon: "⌚", route: "/wearable-sync" },

  // Analitik
  { id: "ana-1", title: "Sağlık Analizi", description: "Adım, kalp, uyku grafikleri", category: "Analitik", icon: "📊", route: "/(tabs)/health-analytics" },
  { id: "ana-2", title: "Hedef İlerleme", description: "Hedef takip ve tamamlama", category: "Analitik", icon: "🎯", route: "/advanced-analytics" },
  { id: "ana-3", title: "Trend Grafikleri", description: "Sağlık trend analizi", category: "Analitik", icon: "📈", route: "/health-trend-charts" },

  // Mutfak ve Gıda
  { id: "food-1", title: "Türk Mutfağı", description: "137+ Türk yemeği", category: "Gıda", icon: "🇹🇷", route: "/food-management-categorized" },
  { id: "food-2", title: "İtalyan Mutfağı", description: "65 İtalyan yemeği", category: "Gıda", icon: "🇮🇹", route: "/food-management-categorized" },
  { id: "food-3", title: "Diyetisyen Öneri/Yasak", description: "Önerilen ve yasaklı gıdalar", category: "Gıda", icon: "✅", route: "/food-management-categorized" },
  { id: "food-4", title: "Gıda Grupları", description: "Diyetisyen gıda grupları", category: "Gıda", icon: "📦", route: "/food-management-categorized" },

  // Mesajlaşma
  { id: "msg-1", title: "Mesajlaşma", description: "Diyetisyen ile iletişim", category: "Mesajlaşma", icon: "💬", route: "/messaging" },
  { id: "msg-2", title: "Diyetisyen Önerileri", description: "Diyetisyenden gelen öneriler", category: "Mesajlaşma", icon: "💡", route: "/dietitian-recommendations" },
  { id: "msg-3", title: "Video Danışma", description: "Görüntülü görüşme", category: "Mesajlaşma", icon: "📹", route: "/video-consultation" },

  // Randevu
  { id: "appt-1", title: "Randevu Oluştur", description: "Yeni randevu al", category: "Randevu", icon: "📅", route: "/calendar-appointments" },
  { id: "appt-2", title: "Takvim Görünümü", description: "Tüm randevular", category: "Randevu", icon: "🗓️", route: "/calendar-appointments" },

  // Hedefler
  { id: "goal-1", title: "Sağlık Hedefleri", description: "Kalori, protein, su, adım, uyku, kilo", category: "Hedefler", icon: "🎯", route: "/health-goals" },
  { id: "goal-2", title: "Hedef Analitik", description: "Hedef ilerleme ve tamamlama", category: "Hedefler", icon: "📈", route: "/advanced-analytics" },

  // Mikro Besin
  { id: "micro-1", title: "Mikro Besin Takibi", description: "Vitamin ve mineral", category: "Beslenme Takibi", icon: "🔬", route: "/micronutrient-tracking" },

  // Bildirimler
  { id: "notif-1", title: "Hatırlatıcılar", description: "Öğün, randevu, hedef", category: "Bildirimler", icon: "⏰", route: "/(tabs)/notifications" },
  { id: "notif-2", title: "Rozetler", description: "Başarı rozetleri", category: "Bildirimler", icon: "🏆", route: "/(tabs)/notifications" },
  { id: "notif-3", title: "2FA Güvenlik", description: "İki aşamalı doğrulama", category: "Bildirimler", icon: "🔐", route: "/(tabs)/notifications" },

  // Profil
  { id: "prof-1", title: "Profil Düzenle", description: "Ad, email, rol güncelle", category: "Profil", icon: "👤", route: "/(tabs)/profile" },
  { id: "prof-2", title: "Tema Ayarı", description: "Açık/Koyu mod", category: "Profil", icon: "🎨", route: "/(tabs)/profile" },
  { id: "prof-3", title: "Dil Seçimi", description: "Türkçe / İngilizce", category: "Profil", icon: "🌍", route: "/(tabs)/profile" },
  { id: "prof-4", title: "Diyetisyen Bul", description: "Kayıtsız mesaj gönder", category: "Profil", icon: "🔍", route: "/(tabs)/profile" },

  // Diyetisyen
  { id: "diet-1", title: "Danışan Ekle", description: "Yeni danışan takibi", category: "Diyetisyen", icon: "👥", route: "/(tabs)/dietitian-dashboard" },
  { id: "diet-2", title: "Danışan Sağlık Kartı", description: "Hastalık derecelendirme", category: "Diyetisyen", icon: "🩺", route: "/client-health-data" },
  { id: "diet-3", title: "Danışma Notları", description: "Not al ve danışana gönder", category: "Diyetisyen", icon: "📝", route: "/dietitian-notes" },
  { id: "diet-4", title: "Öğün Plan Şablonları", description: "Hazır öğün planları", category: "Diyetisyen", icon: "📋", route: "/meal-plan-templates" },

  // Ödeme
  { id: "pay-1", title: "Ödeme & Abonelik", description: "Paket ve ücret yönetimi", category: "Ödeme", icon: "💳", route: "/payment-subscription" },
];

export function searchFeatures(query: string): Feature[] {
  const q = query.toLowerCase().trim();
  if (!q) return ALL_FEATURES;
  return ALL_FEATURES.filter(f =>
    f.title.toLowerCase().includes(q) ||
    f.description.toLowerCase().includes(q) ||
    f.category.toLowerCase().includes(q)
  );
}

export function searchAndFilter(query: string, category: string): Feature[] {
  let results = searchFeatures(query);
  if (category) results = results.filter(f => f.category === category);
  return results;
}

export function getCategories(): string[] {
  return Array.from(new Set(ALL_FEATURES.map(f => f.category)));
}
