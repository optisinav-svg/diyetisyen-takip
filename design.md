# Diyetisyen Takip Uygulaması Tasarım Planı

Bu uygulama, **diyetisyen** ve **danışan** rollerinin aynı ürün içinde çalıştığı, sade ve klinik güven veren bir mobil deneyim olarak tasarlanacaktır. Tasarım yaklaşımı, **tek elle kullanım**, **9:16 portre düzeni**, **az dikkat dağıtan ekran hiyerarşisi** ve **iOS benzeri net boşluk sistemi** üzerine kuruludur. Birincil amaç, günlük takip akışını hızlandırmak; ikincil amaç ise diyetisyenin danışan yönetimini mümkün olduğunca az adımla tamamlamasını sağlamaktır.

## Ekran Listesi

| Ekran | Hedef Kullanıcı | Ana Amaç | Düzen Özeti |
|---|---|---|---|
| Açılış / Karşılama | Her ikisi | Uygulamanın rol tabanlı girişine yönlendirmek | Üstte marka alanı, ortada kısa açıklama, altta giriş ve kayıt düğmeleri |
| Giriş Yap | Her ikisi | E-posta/şifre ile oturum açmak | Tek kolon form, büyük giriş düğmesi, alt bölümde kayıt bağlantısı |
| Kayıt Ol | Her ikisi | Rol seçerek hesap oluşturmak | Rol seçici kartlar, temel form alanları, devam düğmesi |
| Rol Seçimi / İlk Kurulum | Her ikisi | Kullanıcıyı diyetisyen veya danışan moduna yerleştirmek | Kısa açıklama, seçilebilir kartlar, ilerleme CTA’sı |
| Diyetisyen Ana Paneli | Diyetisyen | Danışan listesi, bugünkü randevular ve hızlı işlemler | Özet kartları, yatay aksiyonlar, dikey danışan listesi |
| Danışan Ana Paneli | Danışan | Günlük öğün, yasak/uygun gıda, randevu ve ilerleme takibi | Gün özeti kartı, öğün zaman çizelgesi, bilgi kartları |
| Eşleştirme | Her ikisi | Diyetisyen-danışan bağlantısını kurmak | Kod girme veya kod paylaşma alanı, eşleşme durumu kartı |
| Danışan Detayı | Diyetisyen | Tek danışanın tüm takibini görmek | Profil başlığı, ölçüm kartları, öğün geçmişi, randevu bölümü |
| Vücut Ölçü Girişi | Diyetisyen | Boy, kilo, yağ ve kas kütlesi verilerini kaydetmek | Dört alanlı form, tarih etiketi, kaydet düğmesi |
| Öğün Listesi / Günlük Öğünler | Danışan | Gün içindeki yenen öğünleri saat ile işaretlemek | Saat bazlı kartlar, durum etiketleri, yeni giriş düğmesi |
| Öğün Ekle | Danışan | Metin veya fotoğraf ile öğün kaydı oluşturmak | Saat seçici, not alanı, fotoğraf ekleme alanı, gönder düğmesi |
| Fotoğraf Önizleme | Danışan | Çekilen veya seçilen görseli onaylamak | Büyük görsel, sil/değiştir/onayla aksiyonları |
| Randevu Listesi | Her ikisi | Yaklaşan ve geçmiş randevuları görmek | Segment kontrol, tarih-saat kartları |
| Randevu Oluştur | Diyetisyen | Danışan için randevu planlamak | Tarih, saat, not alanı ve danışan seçici |
| Gıda Kataloğu | Diyetisyen | Gıda listesi ve kalori değerlerini yönetmek | Arama, kategori filtresi, liste hücreleri |
| Gıda Ekle / Düzenle | Diyetisyen | Yeni gıda ve kalori bilgisi eklemek | İsim, porsiyon, kalori alanları, kaydet düğmesi |
| Uygun / Yasaklı Gıdalar | Diyetisyen | Danışana özel gıda kuralları atamak | İki sekmeli liste, seçim çipleri, gönder düğmesi |
| Danışan Gıda Kuralları | Danışan | Uygun ve yasaklı gıdaları görmek | İki bölüm, renkli etiketler, açıklama notu |
| Profil / Hesap | Her ikisi | Hesap bilgileri ve çıkış işlemleri | Avatar alanı, temel bilgiler, rol etiketi, çıkış düğmesi |

## Ekranların İçeriği ve İşlevleri

| Ekran | Birincil İçerik | Gerekli İşlevler |
|---|---|---|
| Diyetisyen Ana Paneli | Danışan kartları, bekleyen işlem sayısı, yaklaşan randevu özeti | Danışan detayına gitme, yeni randevu oluşturma, ölçüm girişi başlatma |
| Danışan Ana Paneli | Bugünkü öğün durumları, son randevu bilgisi, uygun/yasaklı özetleri | Öğün ekleme, öğün geçmişine gitme, randevu detayını görme |
| Danışan Detayı | Son ölçümler, zaman içindeki ilerleme, son öğün kayıtları | Yeni ölçüm ekleme, gıda kuralı güncelleme, randevu oluşturma |
| Öğün Ekle | Saat seçici, açıklama metni, fotoğraf alanı, tüketilen gıdalar | Metin girme, fotoğraf çekme veya galeriden seçme, öğünü kaydetme |
| Gıda Kataloğu | Gıda adı, porsiyon bilgisi, kalori değeri | Gıda ekleme, düzenleme, arama ve filtreleme |
| Uygun / Yasaklı Gıdalar | Seçili danışan, aranabilir gıda listesi, seçili kurallar | Uygun işaretleme, yasaklı işaretleme, danışana gönderme |

Tasarım dili gereği, her ekranda en fazla **bir ana vurgu rengi** kullanılacaktır. İkincil bilgiler, açık gri yüzeyler üzerinde gösterilecek; kritik eylemler tam genişlikte, alt bölümde erişilebilir konumda yer alacaktır. Uzun veri listelerinde kart yapısı yerine daha kompakt, satır bazlı hücre düzeni tercih edilerek tek elle kaydırma sırasında bilişsel yük azaltılacaktır.

## Temel Kullanıcı Akışları

| Akış | Adımlar |
|---|---|
| Kayıt ve rol seçimi | Karşılama → Kayıt Ol → Rol seçimi → Hesap oluşturma → İlgili ana panele yönlenme |
| Eşleştirme | Danışan veya diyetisyen hesabı → Eşleştirme ekranı → Kod oluşturma veya kod girme → Eşleşme onayı → Profil bağlantısının aktif olması |
| Ölçü girişi | Diyetisyen ana paneli → Danışan detayı → Vücut ölçü girişi → Boy/kilo/yağ/kas verilerinin kaydı → Danışan profilinde güncel durumun görünmesi |
| Öğün kaydı | Danışan ana paneli → Öğün ekle → Saat seçimi → Metin girişi veya fotoğraf ekleme → Kaydet → Günlük öğünler listesine düşme |
| Randevu planlama | Diyetisyen ana paneli → Randevu oluştur → Tarih ve saat seç → Not ekle → Kaydet → Her iki tarafta randevu listesinde görünme |
| Gıda yönetimi | Diyetisyen ana paneli → Gıda kataloğu → Gıda ekle/düzenle → Kalori bilgisi kaydet → Uygun/Yasaklı ekranında danışana ata |
| Gıda kuralı görüntüleme | Danışan ana paneli → Gıda kuralları → Uygun ve yasaklı listeleri inceleme |

## Bilgi Mimarisi ve Gezinme Yaklaşımı

Uygulama, rol tabanlı bir alt sekme düzeni ile çalışacaktır. **Danışan** tarafında ana sekmeler sırasıyla **Ana Sayfa**, **Öğünler**, **Randevular** ve **Profil** olacaktır. **Diyetisyen** tarafında ise **Panel**, **Danışanlar**, **Gıdalar**, **Randevular** ve **Profil** sekmeleri kullanılacaktır. Her rolün sekme sayısı sınırlı tutulacak, daha az kullanılan işlemler detay ekranları içinde ikincil aksiyon olarak yerleştirilecektir.

Danışan deneyiminde birincil odak günlük aksiyonlardır. Bu nedenle ana sayfada bugünkü öğünler ve yaklaşan randevu üst sıralarda bulunacaktır. Diyetisyen deneyiminde ise danışan takibi öne çıkarılacağından, ilk ekran danışan kartları ve uyarı durumları ile açılacaktır. Böylece her rol, kendi en sık kullandığı işe doğrudan ulaşacaktır.

## Renk Seçimleri

| Amaç | Renk | Hex |
|---|---|---|
| Ana marka rengi | Yumuşak turkuaz | `#2F8F9D` |
| Açık arka plan | Kırık beyaz | `#F7F9FA` |
| Kart yüzeyi | Beyaz | `#FFFFFF` |
| Ana metin | Koyu arduvaz | `#1F2937` |
| İkincil metin | Soğuk gri | `#6B7280` |
| Kenarlık | Açık gri | `#DCE3E8` |
| Başarılı durum | Yumuşak yeşil | `#2E9E5B` |
| Uyarı / dikkat | Sıcak amber | `#D99A2B` |
| Yasaklı / hata | Dengeli kırmızı | `#D65A5A` |

Bu renk sistemi, klinik ciddiyet ile günlük kullanım rahatlığı arasında denge kurar. Turkuaz ton, uygulamaya sağlık ve güven çağrışımı katarken; beyaz ve kırık beyaz zeminler içerik okunabilirliğini korur. Yasaklı gıda işaretlerinde kırmızı yalnızca vurgu için kullanılacak, sürekli geniş yüzeylerde kullanılmayacaktır. Böylece ekranın sade görünümü korunacaktır.

## Bileşen Dili

Kartlar 16-20 px iç boşluklu, 14-18 px köşe yarıçaplı ve düşük kontrastlı kenarlıklı olacaktır. Form alanları tek kolon, yüksek dokunma alanlı ve açık etiket yapısında ilerleyecektir. Birincil düğmeler tam genişlikte, ikincil düğmeler ise satır içi veya kenarlıklı düzende sunulacaktır. Saat seçimi, tarih seçimi ve rol ayrımı gibi kritik alanlarda görsel karmaşıklığı azaltmak için segmentli kontrol ve çip bileşenleri kullanılacaktır.

## İlk Sürüm Kapsamı

İlk sürümde odak, çekirdek akışların çalışır hale gelmesidir: kullanıcı kaydı ve girişi, rol ayrımı, diyetisyen-danışan eşleşmesi, ölçüm girişi, öğün ekleme, öğün fotoğrafı ekleme, randevu oluşturma, gıda kataloğu yönetimi ve danışana özel uygun/yasaklı gıda atama. İleri analiz, otomatik öneri motoru ve gelişmiş grafikler daha sonraki sürümlere bırakılabilir.
