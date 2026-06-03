# Mobile App Testing Guide - v7 Sürümü

## Test Ortamı Kurulumu

### Gerekli Araçlar
- Expo Go (iOS/Android)
- Node.js 22.13.0+
- pnpm 9.12.0+
- Gerçek iOS/Android cihaz veya emülatör

### Başlangıç
```bash
cd /home/ubuntu/diyetisyen-takip
pnpm install
pnpm dev
```

QR kodunu Expo Go ile tarayarak uygulamayı başlatın.

---

## Test Senaryoları

### 1. Push Notifications Testing

#### 1.1 Push Settings Ekranı
- **Test**: Settings → Push Notifications sekmesine gidin
- **Beklenen Sonuç**: Notification preferences gösterilmeli
  - [ ] Appointment reminders toggle
  - [ ] Meal approvals toggle
  - [ ] Achievements toggle
  - [ ] Weekly reports toggle
  - [ ] Messages toggle
  - [ ] Test notification butonu

#### 1.2 Test Notification Gönderme
- **Test**: "Send Test Notification" butonuna basın
- **Beklenen Sonuç**: 
  - [ ] Cihazda bildirim alınmalı
  - [ ] Bildirim başlığı "Test Notification" olmalı
  - [ ] Bildirim mesajı gösterilmeli
  - [ ] Bildirime tıklandığında uygulama açılmalı

#### 1.3 Notification Preferences Kaydetme
- **Test**: Notification toggles'ı değiştirin ve kaydedin
- **Beklenen Sonuç**:
  - [ ] Preferences backend'e kaydedilmeli
  - [ ] Sayfayı kapatıp tekrar açtığında ayarlar korunmalı
  - [ ] Başarı mesajı gösterilmeli

#### 1.4 Device Registration
- **Test**: Registered Devices listesini kontrol edin
- **Beklenen Sonuç**:
  - [ ] Cihaz ID gösterilmeli
  - [ ] Cihaz tipi (iOS/Android) gösterilmeli
  - [ ] Son kayıt tarihi gösterilmeli
  - [ ] Delete butonu ile cihaz silinebilmeli

---

### 2. Export Functionality Testing

#### 2.1 Export Ekranı
- **Test**: Export sekmesine gidin
- **Beklenen Sonuç**: Export options gösterilmeli
  - [ ] Meal Report (CSV/JSON)
  - [ ] Measurement Report (CSV/JSON)
  - [ ] Performance Report (CSV/JSON)
  - [ ] Income Report (CSV/JSON) - Diyetisyen için
  - [ ] GDPR Data Export

#### 2.2 CSV Export
- **Test**: "Export as CSV" butonuna basın
- **Beklenen Sonuç**:
  - [ ] Loading indicator gösterilmeli
  - [ ] Export başarılı mesajı gösterilmeli
  - [ ] Download link sağlanmalı
  - [ ] CSV dosyası indirilebilmeli

#### 2.3 JSON Export
- **Test**: "Export as JSON" butonuna basın
- **Beklenen Sonuç**:
  - [ ] JSON formatında dosya oluşturulmalı
  - [ ] Dosya indirilebilmeli
  - [ ] Dosya açıldığında geçerli JSON olmalı

#### 2.4 Export History
- **Test**: Export History sekmesine gidin
- **Beklenen Sonuç**:
  - [ ] Önceki export'lar listelenmeli
  - [ ] Export tipi, format, tarih gösterilmeli
  - [ ] File size gösterilmeli
  - [ ] Download link'i tıklanabilir olmalı
  - [ ] Expired export'lar işaretlenebilmeli

---

### 3. Webhook Testing Dashboard

#### 3.1 Dashboard Açılış
- **Test**: Analytics sekmesine gidin
- **Beklenen Sonuç**: Analytics dashboard gösterilmeli
  - [ ] User statistics (total, active)
  - [ ] Webhook performance (success, failed)
  - [ ] Push notifications sent
  - [ ] System health status

#### 3.2 Webhook Logs
- **Test**: Webhook Testing Dashboard'da logs gösterilmeli
- **Beklenen Sonuç**:
  - [ ] Stripe webhook logs
  - [ ] Expo webhook logs
  - [ ] Webhook status (success/failed)
  - [ ] Webhook payload gösterilmeli
  - [ ] Response time gösterilmeli

#### 3.3 Performance Metrics
- **Test**: Performance metrics kontrol edin
- **Beklenen Sonuç**:
  - [ ] Active user percentage
  - [ ] Average meal records
  - [ ] Export rate
  - [ ] System health indicators

---

### 4. Payments Integration Testing

#### 4.1 Payments Ekranı
- **Test**: Payments sekmesine gidin
- **Beklenen Sonuç**: Payment options gösterilmeli
  - [ ] Subscription plans
  - [ ] Payment history
  - [ ] Current plan status
  - [ ] Upgrade/Downgrade options

#### 4.2 Subscription Management
- **Test**: Subscription plan seçin
- **Beklenen Sonuç**:
  - [ ] Plan detayları gösterilmeli
  - [ ] Price gösterilmeli
  - [ ] Features listelenebilmeli
  - [ ] Subscribe butonu aktif olmalı

#### 4.3 Payment History
- **Test**: Payment history listesini kontrol edin
- **Beklenen Sonuç**:
  - [ ] Geçmiş ödeme işlemleri listelenebilmeli
  - [ ] Ödeme tarihi gösterilmeli
  - [ ] Ödeme miktarı gösterilmeli
  - [ ] Ödeme durumu (başarılı/başarısız) gösterilmeli
  - [ ] Invoice indirilebilmeli

---

### 5. Performance Testing

#### 5.1 App Launch Time
- **Test**: Uygulamayı başlatın
- **Beklenen Sonuç**:
  - [ ] Uygulama 3 saniye içinde yüklenebilmeli
  - [ ] Splash screen gösterilmeli
  - [ ] Home screen hızlı yüklenebilmeli

#### 5.2 Navigation Performance
- **Test**: Sekmeler arasında hızlı gezinin
- **Beklenen Sonuç**:
  - [ ] Sekme geçişleri smooth olmalı
  - [ ] Jank veya lag olmamalı
  - [ ] Animasyonlar 60fps'de çalışmalı

#### 5.3 Data Loading Performance
- **Test**: Export veya report yükleme
- **Beklenen Sonuç**:
  - [ ] Loading indicator gösterilmeli
  - [ ] İşlem 5 saniye içinde tamamlanmalı
  - [ ] Error handling çalışmalı

---

### 6. Error Handling Testing

#### 6.1 Network Error
- **Test**: İnternet bağlantısını kesin ve export deneyin
- **Beklenen Sonuç**:
  - [ ] Error message gösterilmeli
  - [ ] Retry butonu sağlanmalı
  - [ ] Uygulama crash olmamalı

#### 6.2 Invalid Data
- **Test**: Geçersiz veri ile export deneyin
- **Beklenen Sonuç**:
  - [ ] Validation error gösterilmeli
  - [ ] Kullanıcı rehberlik alabilmeli
  - [ ] Uygulama stable kalmalı

#### 6.3 Timeout Handling
- **Test**: Yavaş ağda export deneyin
- **Beklenen Sonuç**:
  - [ ] Timeout mesajı gösterilmeli
  - [ ] Retry mekanizması çalışmalı
  - [ ] User experience degraded olmamalı

---

## Test Checklist

### Push Notifications
- [ ] Test notification gönderme çalışıyor
- [ ] Notification preferences kaydediliyor
- [ ] Device registration çalışıyor
- [ ] Bildirimler cihazda alınıyor

### Export
- [ ] CSV export çalışıyor
- [ ] JSON export çalışıyor
- [ ] Export history gösteriliyyor
- [ ] Download links çalışıyor

### Webhooks
- [ ] Dashboard açılıyor
- [ ] Webhook logs gösteriliyyor
- [ ] Performance metrics doğru
- [ ] System health status güncel

### Payments
- [ ] Payment ekranı açılıyor
- [ ] Subscription plans gösteriliyyor
- [ ] Payment history listeleniyor
- [ ] Invoice indirilebiliyor

### Performance
- [ ] App launch time < 3s
- [ ] Navigation smooth
- [ ] Data loading < 5s
- [ ] No crashes

### Error Handling
- [ ] Network errors handled
- [ ] Invalid data handled
- [ ] Timeouts handled
- [ ] User guidance provided

---

## Bug Report Template

```
**Title**: [Feature] - [Issue Description]

**Environment**:
- Device: iOS/Android
- OS Version: 
- App Version: v7
- Expo Go Version: 

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Result**:

**Actual Result**:

**Screenshots/Videos**:

**Logs**:
```

---

## Performance Benchmarks

| Metric | Target | Acceptable |
|--------|--------|------------|
| App Launch | < 2s | < 3s |
| Tab Navigation | < 200ms | < 500ms |
| Export Generation | < 3s | < 5s |
| Notification Delivery | < 1s | < 2s |
| API Response | < 500ms | < 1s |

---

## Notes

- Test hem iOS hem Android'de yapılmalı
- Gerçek cihazlarda test etmek emülatörden daha güvenilir
- Push notifications test etmek için Expo Push Notifications API key gerekli
- Export testleri için yeterli test datası gerekli
