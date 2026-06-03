# Diyetisyen Takip - Uygulama Özellikleri

## 🔐 Kimlik Doğrulama ve Güvenlik

### Biometric Login (Biyometrik Giriş)
- **Face ID & Fingerprint Support** - iOS ve Android'de yüz tanıma ve parmak izi ile giriş
- **Biometric Settings Screen** - Biyometrik giriş ayarlarını yönetme
- **Quick Login** - Kaydedilmiş biyometrik verilerle hızlı giriş
- **Fallback Authentication** - Biyometrik başarısız olursa şifre ile giriş

### Two-Factor Authentication (2FA)
- **Diyetisyenler için Zorunlu 2FA** - Diyetisyenlerin hesaplarında 2FA zorunlu
- **TOTP (Time-based One-Time Password)** - Google Authenticator, Microsoft Authenticator uyumlu
- **QR Code Generation** - 2FA kurulumu için QR kod oluşturma
- **Backup Codes** - Acil durum için yedek kodlar
- **2FA Settings Screen** - 2FA ayarlarını yönetme
- **2FA Verification Screen** - Giriş sırasında 2FA doğrulaması

## 📊 Beslenme ve Sağlık Takibi

### Öğün Yönetimi
- **Öğün Ekleme** - Sabah, öğle, akşam ve ara öğünler
- **Dinamik Ara Öğün Ekleme** - İstediği kadar ara öğün ekleyebilme
- **Öğün Şablonları** - Sık kullanılan öğünlerin şablonları
- **Tarih/Saat Seçici** - Öğün eklerken tarih ve saat seçme
- **Öğün Fotoğrafı** - Öğün fotoğrafı yükleme ve analizi
- **Beslenme Bilgileri** - Kalori, protein, karbohidrat, yağ bilgileri
- **Öğün Geçmişi** - Tüm öğünlerin geçmişini görüntüleme

### Beslenme Hedefleri
- **Kişisel Hedefler** - Kalori, protein, karbohidrat, yağ hedefleri
- **Hedef Takibi** - Günlük hedef ilerleme göstergesi
- **Makro Dağılımı** - Protein, karbohidrat, yağ dağılımı grafiği
- **Hedef Uyarıları** - Hedefleri aştığında veya eksik kaldığında uyarı

### Sağlık Verileri
- **Wearable Cihaz Entegrasyonu** - Apple Watch, Fitbit, Garmin gibi cihazlardan veri çekme
- **Günlük Adımlar** - Adım sayısı takibi
- **Kalp Atış Hızı** - Kalp atış hızı monitörü
- **Uyku Takibi** - Uyku süresi ve kalitesi
- **Kalori Yakımı** - Günlük kalori yakımı
- **Su İçme Takibi** - Günlük su tüketimi takibi
- **Health Data Visualization** - SVG tabanlı interaktif grafikler

## 📈 Analitik ve İstatistikler

### Temel Analitik
- **Health Analytics Screen** - Sağlık verilerinin görselleştirilmesi
- **Bar Chart** - Haftalık karşılaştırma grafikleri
- **Line Chart** - Trend grafikleri
- **Metrik Seçici** - Farklı metrikleri görüntüleme (adımlar, kalp, kalori, uyku)
- **İstatistik Kartları** - Günlük, haftalık, aylık özet istatistikler

### Gelişmiş Analitik
- **Haftalık Karşılaştırma** - Hafta bazında metrik karşılaştırması
- **Aylık Trendler** - Aylık ilerleme trendleri
- **Hedef İlerleme** - Hedeflere karşı mevcut ilerleme
- **Sağlık Trendleri** - Metrik trendleri (iyileşiyor, kötüleşiyor, sabit)
- **Tahminler** - Mevcut hızda devam ederse 30 gün sonrası tahmini
- **İçgörüler** - AI-powered öneriler ve içgörüler
- **Öneriler** - Kişiselleştirilmiş sağlık önerileri
- **Advanced Analytics Screen** - 4 tab: Haftalık, Hedefler, Trendler, İçgörüler

## 💬 İletişim ve Mesajlaşma

### Messaging System (Mesajlaşma Sistemi)
- **Real-time Messaging** - Diyetisyen ve danışan arasında gerçek zamanlı mesajlaşma
- **Message History** - Tüm mesajların geçmişi
- **Typing Indicators** - Yazma göstergesi
- **Read Receipts** - Mesaj okundu göstergesi
- **Message Attachment** - Dosya ekleme desteği
- **Message Search** - Mesajlarda arama
- **Message Edit/Delete** - Mesajları düzenleme ve silme
- **Conversation List** - Tüm konuşmaların listesi

## 🔔 Bildirimler

### Push Notifications
- **2FA Alerts** - 2FA başarısız deneme uyarıları
- **Meal Reminders** - Öğün hatırlatmaları
- **Appointment Reminders** - Randevu hatırlatmaları
- **Health Goal Alerts** - Sağlık hedefi uyarıları
- **Achievement Notifications** - Başarı bildirimleri
- **Custom Notifications** - Diyetisyen tarafından gönderilen özel bildirimler

### Notification Management
- **Notification Preferences** - Bildirim tercihlerini ayarlama
- **Notification History** - Bildirim geçmişi
- **Push Token Management** - Push token kaydı ve yönetimi
- **Token Refresh** - Token otomatik yenileme
- **Notification Settings Screen** - Bildirim ayarları

## 👨‍⚕️ Diyetisyen Dashboard

### Müşteri Yönetimi
- **Müşteri Listesi** - Bağlı müşterilerin listesi
- **Müşteri Sağlık Kartları** - Müşteri sağlık durumu özeti
- **Müşteri Detay Screen** - Müşteri profili ve detaylı bilgiler
- **Sağlık Durumu Göstergesi** - Müşteri sağlık durumunun renk kodlu göstergesi

### Müşteri Takibi
- **Haftalık Sağlık Trendleri** - Müşteri sağlık trendleri
- **Öğün Geçmişi** - Müşteri öğün geçmişi
- **Diyetisyen Notları** - Müşteri hakkında notlar
- **Randevu Geçmişi** - Geçmiş randevular
- **Uyum Oranı** - Beslenme planına uyum yüzdesi

### Karşılaştırmalı Analiz
- **Müşteri Karşılaştırması** - Birden fazla müşteri metrik karşılaştırması
- **Metrik Seçimi** - Uyum, adımlar, kalp, uyku metriklerini seçme
- **Trend Analizi** - Müşteri trendlerini analiz etme
- **Uyarı Listesi** - Dikkat gerektiren müşteriler

## 📱 Profil ve Ayarlar

### Profil Yönetimi
- **Profil Ekranı** - Kullanıcı profili ve bilgileri
- **Profil Düzenleme** - Ad, email, fotoğraf güncelleme
- **Rol Seçimi** - Diyetisyen veya danışan rolü seçme
- **Hesap Silme** - Hesap silme seçeneği

### Ayarlar
- **Settings Screen** - Genel ayarlar
- **Tema Ayarları** - Açık/koyu mod seçimi
- **Dil Seçimi** - Uygulama dili seçimi
- **Bildirim Ayarları** - Bildirim tercihlerini yönetme
- **Gizlilik Ayarları** - Gizlilik ve veri paylaşım ayarları
- **Hesap Ayarları** - Şifre değiştirme, 2FA ayarları

## 💳 Ödeme ve Abonelik

### Stripe Entegrasyonu
- **Ödeme İşlemleri** - Stripe ile güvenli ödeme
- **Abonelik Yönetimi** - Abonelik planlarını yönetme
- **Ödeme Geçmişi** - Geçmiş ödemeleri görüntüleme
- **Fatura** - Fatura oluşturma ve indirme
- **Webhook Handling** - Stripe webhook'larını işleme

## 🔄 Veri Senkronizasyonu

### Wearable Entegrasyonu
- **Apple HealthKit** - iOS cihazlardan sağlık verisi çekme
- **Google Fit** - Android cihazlardan sağlık verisi çekme
- **Otomatik Senkronizasyon** - Periyodik veri senkronizasyonu
- **Real-time Sync** - Gerçek zamanlı veri güncelleme

### Veri Dışa Aktarma
- **PDF Export** - Sağlık verilerini PDF olarak dışa aktarma
- **CSV Export** - Veriler CSV formatında dışa aktarma
- **Email Export** - Raporları email ile gönderme
- **Scheduled Export** - Otomatik planlı dışa aktarma
- **Export History** - Dışa aktarma geçmişi

## 🍽️ Beslenme Analizi

### Meal Photo Recognition
- **Fotoğraf Yükleme** - Öğün fotoğrafı yükleme
- **AI-Powered Analysis** - LLM tabanlı öğün analizi
- **Beslenme Tahmini** - Kalori, protein, karbohidrat tahmini
- **Beslenme Bilgileri Ayrıştırma** - Otomatik beslenme bilgisi çıkarma
- **Meal History with Photos** - Fotoğraflı öğün geçmişi

## 📅 Randevu Sistemi

### Appointment Management
- **Randevu Oluşturma** - Diyetisyen-danışan randevusu oluşturma
- **Randevu Takvimi** - Takvim görünümü
- **Randevu Hatırlatmaları** - Otomatik randevu hatırlatmaları
- **Randevu Geçmişi** - Geçmiş randevular
- **Randevu Notları** - Randevu sonrası notlar

## 🎯 Hedef Takibi

### Goal Progress Tracking
- **Hedef Oluşturma** - Kişisel sağlık hedefleri oluşturma
- **Hedef İlerleme** - Hedeflere karşı ilerleme göstergesi
- **Hedef Durumu** - Yolda, risk altında, geride durumları
- **Hedef Tahminleri** - Hedeflere ulaşma tahmini
- **Hedef Başarıları** - Tamamlanan hedefler

## 🔧 Teknik Özellikler

### Backend
- **tRPC API** - Type-safe API
- **PostgreSQL Database** - Drizzle ORM ile veri yönetimi
- **Authentication** - OAuth ve session yönetimi
- **Error Handling** - Kapsamlı hata yönetimi
- **Logging** - Detaylı logging sistemi

### Frontend
- **React Native** - Cross-platform mobile app
- **Expo** - Expo SDK 54 ile native features
- **NativeWind** - Tailwind CSS for React Native
- **TypeScript** - Type-safe development
- **React Router** - Expo Router ile navigasyon

### Database
- **Drizzle ORM** - Type-safe ORM
- **PostgreSQL** - Güvenilir veri tabanı
- **Migrations** - Drizzle migrations
- **Relationships** - Kompleks veri ilişkileri

## 📊 Rapor ve İstatistikler

### Analytics Reports
- **Haftalık Rapor** - Haftalık sağlık raporu
- **Aylık Rapor** - Aylık ilerleme raporu
- **Yıllık Rapor** - Yıllık sağlık özeti
- **Karşılaştırmalı Rapor** - Dönem karşılaştırması
- **Trend Raporu** - Sağlık trendleri raporu

## 🌐 Entegrasyonlar

### Third-party Services
- **Stripe** - Ödeme işlemleri
- **OAuth** - Sosyal giriş (Google, Apple, Facebook)
- **S3 Storage** - Dosya depolama
- **Email Service** - Email gönderme
- **Push Notification Service** - Push bildirim servisi

## ✅ Kalite Kontrol

### Testing
- **Unit Tests** - 45+ birim test
- **Integration Tests** - Entegrasyon testleri
- **E2E Tests** - End-to-end testler
- **Type Checking** - TypeScript type checking

### Performance
- **Optimized Queries** - Veritabanı sorgusu optimizasyonu
- **Caching** - Veri caching sistemi
- **Lazy Loading** - Tembel yükleme
- **Image Optimization** - Resim optimizasyonu

---

**Toplam Özellik Sayısı:** 100+

**Son Güncelleme:** 2 Mayıs 2026

**Versiyon:** 1.0.0
