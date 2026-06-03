export interface Feature {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
}

export const ALL_FEATURES: Feature[] = [
  // Kimlik Doğrulama
  { id: "auth-1", title: "Biyometrik Giriş", description: "Face ID ve Fingerprint", category: "Kimlik Doğrulama", icon: "🔐" },
  { id: "auth-2", title: "2FA", description: "İki Faktörlü Doğrulama", category: "Kimlik Doğrulama", icon: "🔐" },
  { id: "auth-3", title: "TOTP", description: "Google Authenticator", category: "Kimlik Doğrulama", icon: "🔐" },
  
  // Beslenme Takibi
  { id: "nut-1", title: "Öğün Ekleme", description: "Sabah, öğle, akşam", category: "Beslenme Takibi", icon: "🍽️" },
  { id: "nut-2", title: "Ara Öğün", description: "Dinamik ara öğün ekleme", category: "Beslenme Takibi", icon: "🍽️" },
  { id: "nut-3", title: "Beslenme Hedefleri", description: "Kalori ve makro hedefleri", category: "Beslenme Takibi", icon: "🍽️" },
  
  // Sağlık Verileri
  { id: "health-1", title: "Adımlar", description: "Günlük adım takibi", category: "Sağlık Verileri", icon: "❤️" },
  { id: "health-2", title: "Kalp Atış Hızı", description: "Kalp ritmi takibi", category: "Sağlık Verileri", icon: "❤️" },
  { id: "health-3", title: "Uyku Takibi", description: "Uyku kalitesi ve süresi", category: "Sağlık Verileri", icon: "❤️" },
  
  // Analitik
  { id: "ana-1", title: "Haftalık Trendler", description: "Hafta bazında analiz", category: "Analitik", icon: "📊" },
  { id: "ana-2", title: "Aylık Karşılaştırma", description: "Ay bazında karşılaştırma", category: "Analitik", icon: "📊" },
  { id: "ana-3", title: "Hedef İlerleme", description: "Hedef başarı oranı", category: "Analitik", icon: "📊" },
  
  // Mesajlaşma
  { id: "msg-1", title: "Real-time Mesajlaşma", description: "Canlı sohbet", category: "Mesajlaşma", icon: "💬" },
  { id: "msg-2", title: "Mesaj Geçmişi", description: "Tüm konuşmaları görüntüle", category: "Mesajlaşma", icon: "💬" },
  
  // Bildirimler
  { id: "notif-1", title: "2FA Alerts", description: "Güvenlik bildirimleri", category: "Bildirimler", icon: "🔔" },
  { id: "notif-2", title: "Meal Reminders", description: "Öğün hatırlatmaları", category: "Bildirimler", icon: "🔔" },
  
  // Dashboard
  { id: "dash-1", title: "Müşteri Listesi", description: "Tüm danışanları görüntüle", category: "Dashboard", icon: "👨‍⚕️" },
  { id: "dash-2", title: "Sağlık Kartları", description: "Müşteri sağlık durumu", category: "Dashboard", icon: "👨‍⚕️" },
  
  // Profil
  { id: "prof-1", title: "Profil Düzenleme", description: "Bilgilerinizi güncelleyin", category: "Profil", icon: "👤" },
  { id: "prof-2", title: "Tema Ayarları", description: "Açık/koyu mod", category: "Profil", icon: "👤" },
  
  // Ödeme
  { id: "pay-1", title: "Stripe Ödeme", description: "Güvenli ödeme", category: "Ödeme", icon: "💳" },
  { id: "pay-2", title: "Abonelik", description: "Abonelik yönetimi", category: "Ödeme", icon: "💳" },
  
  // Beslenme Analizi
  { id: "meal-1", title: "Fotoğraf Yükleme", description: "Öğün fotoğrafı", category: "Beslenme Analizi", icon: "📸" },
  { id: "meal-2", title: "AI Analiz", description: "Yapay zeka analizi", category: "Beslenme Analizi", icon: "📸" },
  
  // Randevu
  { id: "appt-1", title: "Randevu Oluşturma", description: "Yeni randevu", category: "Randevu", icon: "📅" },
  { id: "appt-2", title: "Takvim Görünümü", description: "Randevu takvimi", category: "Randevu", icon: "📅" },
  
  // Hedefler
  { id: "goal-1", title: "Hedef Oluşturma", description: "Yeni hedef belirle", category: "Hedefler", icon: "🎯" },
  { id: "goal-2", title: "Hedef İlerleme", description: "Hedef başarı takibi", category: "Hedefler", icon: "🎯" },

  // Geri Bildirim
  { id: "feed-1", title: "Danışan Geri Bildirimi", description: "Diyetisyene geri bildirim gönder", category: "Geri Bildirim", icon: "💭" },
  { id: "feed-2", title: "Diyetisyen Yanıtları", description: "Geri bildirim yanıtlarını görüntüle", category: "Geri Bildirim", icon: "💭" },

  // Bildirimler Ek
  { id: "notif-3", title: "Bildirim Ayarları", description: "Bildirim tercihlerini yönet", category: "Bildirimler", icon: "🔔" },
  { id: "notif-4", title: "Sağlık Uyarıları", description: "Sağlık hedefi uyarıları", category: "Bildirimler", icon: "🔔" },

  // Trend Analizi
  { id: "trend-1", title: "Sağlık Trendleri", description: "Zaman içindeki değişimler", category: "Analitik", icon: "📊" },
  { id: "trend-2", title: "Trend Tahmini", description: "Gelecek 7 gün tahmini", category: "Analitik", icon: "📊" },
];

/**
 * Özellikleri arama terimi ile filtrele
 */
export function searchFeatures(query: string): Feature[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return ALL_FEATURES;

  return ALL_FEATURES.filter(
    (feature) =>
      feature.title.toLowerCase().includes(lowerQuery) ||
      feature.description.toLowerCase().includes(lowerQuery) ||
      feature.category.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Özellikleri kategoriye göre filtrele
 */
export function filterByCategory(category: string): Feature[] {
  if (!category) return ALL_FEATURES;
  return ALL_FEATURES.filter((feature) => feature.category === category);
}

/**
 * Tüm kategorileri al
 */
export function getCategories(): string[] {
  const categories = new Set(ALL_FEATURES.map((f) => f.category));
  return Array.from(categories).sort();
}

/**
 * Arama ve kategori filtresi ile birleştirilmiş sonuç
 */
export function searchAndFilter(query: string, category: string): Feature[] {
  let results = ALL_FEATURES;

  if (query.trim()) {
    results = searchFeatures(query);
  }

  if (category) {
    results = results.filter((f) => f.category === category);
  }

  return results;
}
