# Diyetisyen Takip - Kullanıcı Verileri Depolanma Rehberi

## 📍 Veri Depolama Mimarisi

Diyetisyen Takip uygulamasında kullanıcı verileri **3 ana yerde** depolanır:

```
┌─────────────────────────────────────────────────────────────┐
│                    Kullanıcı Cihazı                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Local Storage (AsyncStorage, Secure Store)          │  │
│  │  - Oturum token'ı                                    │  │
│  │  - Biyometrik ayarları                               │  │
│  │  - Bildirim tercihleri                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↓ (API Çağrıları)
┌─────────────────────────────────────────────────────────────┐
│                  Manus Backend Server                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Veritabanı                               │  │
│  │  - Kullanıcı profili                                 │  │
│  │  - Öğün kayıtları                                    │  │
│  │  - Sağlık verileri                                   │  │
│  │  - Mesajlar                                          │  │
│  │  - Randevular                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  S3 Storage (Dosya Depolama)                         │  │
│  │  - Öğün fotoğrafları                                 │  │
│  │  - Profil resimleri                                  │  │
│  │  - Dışa aktarılan raporlar (PDF)                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ CİHAZ ÜZERİNDE DEPOLANAN VERİLER (Local Storage)

### Expo Secure Store (Güvenli Depolama)
**Nerede:** iOS Keychain, Android Keystore'da şifreli olarak depolanır

**Ne depolanır:**
- **Oturum Token** - API çağrıları için authentication token
- **Biyometrik Ayarları** - Face ID/Fingerprint etkinleştirildi mi?
- **Push Token** - Push bildirim almak için device token

**Nasıl erişilir:**
```typescript
import * as SecureStore from 'expo-secure-store';

// Token kaydetme
await SecureStore.setItemAsync('auth_token', token);

// Token okuma
const token = await SecureStore.getItemAsync('auth_token');
```

### AsyncStorage (Hızlı Erişim)
**Nerede:** Cihazın local dosya sisteminde depolanır

**Ne depolanır:**
- **Bildirim Tercihleri** - Hangi bildirimleri almak istiyorum?
- **Uygulama Ayarları** - Tema (açık/koyu), dil seçimi
- **Taslak Veriler** - Henüz gönderilmemiş öğün kayıtları

**Nasıl erişilir:**
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Veri kaydetme
await AsyncStorage.setItem('notification_prefs', JSON.stringify(prefs));

// Veri okuma
const prefs = await AsyncStorage.getItem('notification_prefs');
```

### Dosya Sistemi (Resimler)
**Nerede:** Cihazın Documents klasöründe depolanır

**Ne depolanır:**
- **Öğün Fotoğrafları (Geçici)** - Upload öncesi
- **İndirilen Raporlar** - PDF dosyaları

**Nasıl erişilir:**
```typescript
import * as FileSystem from 'expo-file-system';

const uri = FileSystem.documentDirectory + 'meal-photo.jpg';
```

---

## 2️⃣ SUNUCU VERİTABANINDA DEPOLANAN VERİLER (PostgreSQL)

### Kullanıcı Bilgileri
**Tablo:** `users` ve `profiles`

```sql
-- Temel Kullanıcı Bilgileri
users:
  ├── id (Kullanıcı ID)
  ├── openId (OAuth ID)
  ├── name (Ad Soyad)
  ├── email (E-posta)
  ├── loginMethod (Giriş Yöntemi: OAuth, Biometric)
  ├── role (Rol: user, admin)
  ├── createdAt (Kayıt Tarihi)
  └── lastSignedIn (Son Giriş Tarihi)

-- Profil Bilgileri
profiles:
  ├── userId (Kullanıcı ID)
  ├── role (Diyetisyen veya Danışan)
  ├── displayName (Görünen Ad)
  ├── inviteCode (Davet Kodu)
  ├── bio (Biyografi)
  └── createdAt (Oluşturulma Tarihi)
```

### Beslenme Verileri
**Tablolar:** `meals`, `mealAnalysis`, `nutritionGoals`

```sql
-- Öğün Kayıtları
meals:
  ├── id (Öğün ID)
  ├── clientUserId (Danışan ID)
  ├── recordedByUserId (Kaydeden Kişi ID)
  ├── mealType (Öğün Tipi: breakfast, lunch, dinner, snack)
  ├── customMealType (Özel Öğün Adı: "İkinci Kahvaltı")
  ├── eatenAt (Yenme Saati)
  ├── description (Açıklama)
  ├── photoUri (Fotoğraf URL)
  ├── status (Durum: planned, eaten, skipped)
  └── createdAt (Oluşturulma Tarihi)

-- Öğün Analizi (AI tarafından)
mealAnalysis:
  ├── mealId (Öğün ID)
  ├── estimatedCalories (Tahmini Kalori)
  ├── estimatedProtein (Tahmini Protein)
  ├── estimatedCarbs (Tahmini Karbohidrat)
  ├── estimatedFat (Tahmini Yağ)
  ├── foodItems (Tespit Edilen Yiyecekler - JSON)
  ├── confidence (Güven Oranı: 0.00-1.00)
  └── analyzedAt (Analiz Tarihi)

-- Beslenme Hedefleri
nutritionGoals:
  ├── clientUserId (Danışan ID)
  ├── dietitianUserId (Diyetisyen ID)
  ├── dailyCalorieGoal (Günlük Kalori Hedefi)
  ├── dailyProteinGoal (Günlük Protein Hedefi)
  ├── dailyCarbsGoal (Günlük Karbohidrat Hedefi)
  ├── dailyFatGoal (Günlük Yağ Hedefi)
  └── waterIntakeGoal (Günlük Su Hedefi)
```

### Sağlık Verileri
**Tablolar:** `measurements`, `wearableData`, `healthMetrics`

```sql
-- Vücut Ölçümleri
measurements:
  ├── id (Ölçüm ID)
  ├── clientUserId (Danışan ID)
  ├── dietitianUserId (Diyetisyen ID)
  ├── heightCm (Boy - cm)
  ├── weightKg (Kilo - kg)
  ├── bodyFatPercent (Vücut Yağ Yüzdesi)
  ├── muscleMassKg (Kas Kütlesi - kg)
  ├── notes (Notlar)
  └── recordedAt (Kaydedilme Tarihi)

-- Wearable Cihaz Verileri
wearableData:
  ├── id (Veri ID)
  ├── clientUserId (Danışan ID)
  ├── deviceType (Cihaz Tipi: Apple Watch, Fitbit, Garmin)
  ├── dailySteps (Günlük Adımlar)
  ├── heartRate (Kalp Atış Hızı)
  ├── sleepHours (Uyku Saati)
  ├── caloriesBurned (Yakılan Kalori)
  ├── recordedAt (Kaydedilme Tarihi)
  └── syncedAt (Senkronize Edilme Tarihi)
```

### Diyetisyen-Danışan İlişkisi
**Tablo:** `pairings`

```sql
pairings:
  ├── id (Pairing ID)
  ├── dietitianUserId (Diyetisyen ID)
  ├── clientUserId (Danışan ID)
  ├── status (Durum: pending, active, archived)
  ├── createdAt (Oluşturulma Tarihi)
  └── updatedAt (Güncelleme Tarihi)
```

### Mesajlaşma
**Tablo:** `messages`

```sql
messages:
  ├── id (Mesaj ID)
  ├── pairingId (Pairing ID)
  ├── senderUserId (Gönderen ID)
  ├── content (Mesaj İçeriği)
  ├── mealId (İlgili Öğün ID - opsiyonel)
  ├── createdAt (Gönderilme Tarihi)
  ├── readAt (Okunma Tarihi)
  └── isRead (Okundu mu?)
```

### Randevular
**Tablo:** `appointments`

```sql
appointments:
  ├── id (Randevu ID)
  ├── dietitianUserId (Diyetisyen ID)
  ├── clientUserId (Danışan ID)
  ├── scheduledAt (Randevu Saati)
  ├── note (Notlar)
  ├── status (Durum: scheduled, completed, cancelled)
  └── createdAt (Oluşturulma Tarihi)
```

### Bildirimler
**Tablo:** `pushNotifications`

```sql
pushNotifications:
  ├── id (Bildirim ID)
  ├── userId (Kullanıcı ID)
  ├── title (Başlık)
  ├── body (İçerik)
  ├── type (Tip: appointment_reminder, meal_reminder, health_alert)
  ├── relatedId (İlgili ID: randevu, öğün vb.)
  ├── sent (Gönderildi mi?)
  ├── sentAt (Gönderilme Tarihi)
  └── createdAt (Oluşturulma Tarihi)
```

### Raporlar
**Tablo:** `weeklyReports`

```sql
weeklyReports:
  ├── id (Rapor ID)
  ├── clientUserId (Danışan ID)
  ├── dietitianUserId (Diyetisyen ID)
  ├── weekStartDate (Hafta Başlangıcı)
  ├── weekEndDate (Hafta Sonu)
  ├── totalMeals (Toplam Öğün)
  ├── averageDailyCalories (Günlük Ortalama Kalori)
  ├── weightChange (Kilo Değişimi)
  ├── notes (Notlar)
  ├── pdfUrl (PDF URL - S3'te depolanır)
  └── generatedAt (Oluşturulma Tarihi)
```

---

## 3️⃣ BULUT DEPOLAMADA DEPOLANAN VERİLER (AWS S3)

### Dosya Türleri
**Nerede:** AWS S3 bucket'ında depolanır (Manus tarafından yönetilir)

**Ne depolanır:**

| Dosya Tipi | Boyut | Ömür | Erişim |
|-----------|-------|------|--------|
| **Öğün Fotoğrafları** | 2-5 MB | Kalıcı | Danışan + Diyetisyen |
| **Profil Resimleri** | 1-3 MB | Kalıcı | Herkese açık (CDN) |
| **Haftalık Raporlar (PDF)** | 1-2 MB | 90 gün | Danışan + Diyetisyen |
| **Aylık Raporlar (PDF)** | 2-5 MB | 1 yıl | Danışan + Diyetisyen |
| **Dışa Aktarılan Veriler (CSV)** | 0.5-2 MB | 30 gün | Danışan |

**Dosya Yapısı:**
```
s3://manus-storage/
├── users/
│   ├── {userId}/
│   │   ├── profile-picture.jpg
│   │   ├── meals/
│   │   │   ├── {mealId}-1.jpg
│   │   │   ├── {mealId}-2.jpg
│   │   │   └── ...
│   │   ├── reports/
│   │   │   ├── weekly-2026-04-28.pdf
│   │   │   ├── monthly-2026-04.pdf
│   │   │   └── ...
│   │   └── exports/
│   │       ├── health-data-2026-04.csv
│   │       └── ...
```

**Nasıl erişilir:**
```typescript
// Fotoğraf yükleme
const formData = new FormData();
formData.append('file', {
  uri: photoUri,
  type: 'image/jpeg',
  name: 'meal-photo.jpg',
});

const response = await fetch('https://api.manus.space/upload', {
  method: 'POST',
  body: formData,
  headers: { Authorization: `Bearer ${token}` },
});

const { url } = await response.json();
// url: https://cdn.manus.space/users/123/meals/456-1.jpg
```

---

## 🔐 Veri Güvenliği

### Şifreleme
- **Transit Sırasında:** HTTPS/TLS 1.3 (tüm API çağrıları şifreli)
- **Depolama Sırasında:**
  - Veritabanı: PostgreSQL encryption at rest
  - S3: AES-256 encryption
  - Cihazda: iOS Keychain, Android Keystore

### Erişim Kontrolleri
- **Kimlik Doğrulama:** OAuth 2.0 + 2FA (Diyetisyenler için zorunlu)
- **Yetkilendirme:** Role-based access control (RBAC)
  - Danışan: Kendi verilerine erişim
  - Diyetisyen: Bağlı danışanların verilerine erişim
  - Admin: Tüm verilere erişim

### Veri Silme
- **Kullanıcı Silme:** Tüm kişisel veriler 30 gün içinde silinir
- **Öğün Silme:** Danışan istediği zaman silebilir
- **Mesaj Silme:** Gönderen tarafından silinebilir (alıcıda kalır)

---

## 📊 Veri Akışı Örneği

### Senaryo: Danışan Öğün Fotoğrafı Yüklüyor

```
1. Danışan uygulamada "Fotoğraf Yükle" butonuna basıyor
   ↓
2. Cihazda fotoğraf seçiliyor (Dosya Sistemi)
   ↓
3. Fotoğraf S3'e yükleniyor (AWS S3)
   ↓
4. S3 URL'i veritabanına kaydediliyor (PostgreSQL)
   ├── meals table: photoUri = "https://cdn.manus.space/..."
   └── mealAnalysis table: AI analizi yapılıyor
   ↓
5. Diyetisyen dashboard'da fotoğraf görünüyor
   ↓
6. Diyetisyen mesajla feedback gönderiyor (messages table)
   ↓
7. Danışan bildirim alıyor (pushNotifications table)
```

### Senaryo: Haftalık Rapor Oluşturuluyor

```
1. Sunucu otomatik olarak haftalık rapor oluşturuyor
   ├── meals table'dan öğün verileri çekiliyor
   ├── measurements table'dan vücut ölçümleri çekiliyor
   ├── wearableData table'dan sağlık verileri çekiliyor
   └── nutritionGoals table'dan hedefler çekiliyor
   ↓
2. Rapor PDF olarak oluşturuluyor
   ↓
3. PDF S3'e yükleniyor (AWS S3)
   ↓
4. PDF URL'i weeklyReports table'a kaydediliyor
   ↓
5. Bildirim gönderiliyor (pushNotifications table)
   ↓
6. Danışan ve Diyetisyen raporu indirebiliyor
```

---

## 🌐 Veri Senkronizasyonu

### Çevrimdışı Mod
- Cihazda yapılan değişiklikler AsyncStorage'da kaydediliyor
- İnternet bağlantısı kurulunca sunucuya senkronize ediliyor

### Çakışma Çözümü
- Son yazma kazanır (Last-Write-Wins)
- Sunucu timestamp'i referans alınır

### Senkronizasyon Aralığı
- Öğün: Anında
- Sağlık Verileri: Her 15 dakika
- Mesajlar: Anında
- Raporlar: Günlük (gece 2:00)

---

## 📋 Veri Saklama Politikası

| Veri Tipi | Saklama Süresi | Silinme Yöntemi |
|-----------|----------------|-----------------|
| Kullanıcı Profili | Hesap silinene kadar | Soft delete (30 gün bekle) |
| Öğün Kayıtları | 2 yıl | Otomatik silinir |
| Mesajlar | 1 yıl | Otomatik silinir |
| Raporlar | 3 yıl | Otomatik silinir |
| Öğün Fotoğrafları | 2 yıl | Otomatik silinir |
| Profil Resimleri | Hesap silinene kadar | Otomatik silinir |
| Bildirim Geçmişi | 90 gün | Otomatik silinir |

---

## 🔄 Veri Dışa Aktarma

Danışan istediği zaman kendi verilerini dışa aktarabilir:

```
Dışa Aktarılan Veriler:
├── profile.json (Profil bilgileri)
├── meals.csv (Tüm öğün kayıtları)
├── health-metrics.csv (Sağlık verileri)
├── messages.json (Tüm mesajlar)
├── appointments.json (Randevu geçmişi)
├── reports/ (Tüm PDF raporlar)
└── photos/ (Tüm öğün fotoğrafları)
```

---

## ✅ Özet

| Veri Tipi | Depolama Yeri | Erişim | Güvenlik |
|-----------|---------------|--------|----------|
| **Oturum Token** | Cihaz (Secure Store) | Sadece uygulama | Şifreli |
| **Profil Bilgileri** | PostgreSQL | API (tRPC) | HTTPS + Auth |
| **Öğün Verileri** | PostgreSQL | API (tRPC) | HTTPS + Auth |
| **Öğün Fotoğrafları** | S3 | CDN | HTTPS + Auth |
| **Mesajlar** | PostgreSQL | API (tRPC) | HTTPS + Auth |
| **Raporlar** | S3 + PostgreSQL | CDN | HTTPS + Auth |
| **Sağlık Verileri** | PostgreSQL | API (tRPC) | HTTPS + Auth |
| **Bildirimler** | PostgreSQL | Push Service | HTTPS + Auth |

---

**Son Güncelleme:** 2 Mayıs 2026
