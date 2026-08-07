import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, Image, Switch, Modal } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { getUserRegistration, saveUserRegistration, clearUserRegistration } from "@/lib/_core/user-registration";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const PHOTO_KEY = "profile_photo";
const RATINGS_KEY = "user_ratings";
const THEME_KEY = "app_theme";
const LANG_KEY = "app_language";
const NOTIF_PREFS_KEY = "notification_prefs";
const MSG_LIMIT_KEY = "dietitian_msg_limits";

interface Rating {
  id: string;
  fromName: string;
  fromRole: string;
  toId: string;
  score: number;
  comment: string;
  date: string;
}

interface Dietitian {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  ratingCount: number;
  bio: string;
  icon: string;
}

const SAMPLE_DIETITIANS: Dietitian[] = [
  { id: "d1", name: "Dr. Ayşe Kaya", specialty: "Klinik Beslenme", rating: 4.8, ratingCount: 124, bio: "15 yıl deneyimli diyetisyen. Diyabet ve obezite uzmanlığı.", icon: "👩‍⚕️" },
  { id: "d2", name: "Dr. Mehmet Demir", specialty: "Sporcu Beslenmesi", rating: 4.6, ratingCount: 89, bio: "Sporcu beslenmesi ve performans artırımı konusunda uzman.", icon: "👨‍⚕️" },
  { id: "d3", name: "Dr. Fatma Yıldız", specialty: "Çocuk Beslenmesi", rating: 4.9, ratingCount: 201, bio: "Çocuk ve ergen beslenmesi ile okul çağı çocukları konusunda deneyimli.", icon: "👩‍⚕️" },
];

const TR = {
  profile: "Profil", settings: "Ayarlar", findDietitian: "Diyetisyen Bul",
  ratings: "Puanlar", editProfile: "Profil Düzenle", theme: "Tema",
  language: "Dil", notifications: "Bildirimler", deleteAccount: "Hesabı Sil",
  save: "Kaydet", cancel: "İptal", darkMode: "Koyu Mod", lightMode: "Açık Mod",
  name: "Ad Soyad", email: "Email", role: "Rol", client: "Danışan", dietitian: "Diyetisyen",
  contact: "İletişime Geç", sendMessage: "Mesaj Gönder", messageSent: "Mesaj gönderildi",
  dailyLimit: "Günlük mesaj limitinize ulaştınız",
  totalLimit: "Toplam mesaj limitinize ulaştınız (3 mesaj)",
  rateThis: "Puan Ver", submitRating: "Gönder",
};

const EN = {
  profile: "Profile", settings: "Settings", findDietitian: "Find Dietitian",
  ratings: "Ratings", editProfile: "Edit Profile", theme: "Theme",
  language: "Language", notifications: "Notifications", deleteAccount: "Delete Account",
  save: "Save", cancel: "Cancel", darkMode: "Dark Mode", lightMode: "Light Mode",
  name: "Full Name", email: "Email", role: "Role", client: "Client", dietitian: "Dietitian",
  contact: "Contact", sendMessage: "Send Message", messageSent: "Message sent",
  dailyLimit: "You have reached your daily message limit",
  totalLimit: "You have reached your total message limit (3 messages)",
  rateThis: "Rate", submitRating: "Submit",
};

type Tab = "profile" | "find-dietitian";

export default function ProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [showSettings, setShowSettings] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState<"tr" | "en">("tr");
  const [notifPrefs, setNotifPrefs] = useState({ meals: true, appointments: true, goals: true, messages: true });
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"dietitian" | "client">("client");
  const [msgLimits, setMsgLimits] = useState<Record<string, { daily: number; total: number; lastDate: string }>>({});
  const [msgText, setMsgText] = useState("");
  const [selectedDietitian, setSelectedDietitian] = useState<Dietitian | null>(null);
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState("");

  const t = language === "tr" ? TR : EN;

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const userData = await getUserRegistration();
    setUser(userData);
    setEditName(userData?.name ?? "");
    setEditEmail(userData?.email ?? "");
    setEditRole(userData?.role ?? "client");
    const savedPhoto = await AsyncStorage.getItem(PHOTO_KEY);
    if (savedPhoto) setPhoto(savedPhoto);
    const savedRatings = await AsyncStorage.getItem(RATINGS_KEY);
    if (savedRatings) setRatings(JSON.parse(savedRatings));
    const savedTheme = await AsyncStorage.getItem(THEME_KEY);
    if (savedTheme) setIsDark(savedTheme === "dark");
    const savedLang = await AsyncStorage.getItem(LANG_KEY);
    if (savedLang) setLanguage(savedLang as "tr" | "en");
    const savedNotif = await AsyncStorage.getItem(NOTIF_PREFS_KEY);
    if (savedNotif) setNotifPrefs(JSON.parse(savedNotif));
    const savedLimits = await AsyncStorage.getItem(MSG_LIMIT_KEY);
    if (savedLimits) setMsgLimits(JSON.parse(savedLimits));
  };

  const saveTheme = async (dark: boolean) => {
    setIsDark(dark);
    await AsyncStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  };

  const saveLang = async (lang: "tr" | "en") => {
    setLanguage(lang);
    await AsyncStorage.setItem(LANG_KEY, lang);
  };

  const saveNotifPrefs = async (prefs: typeof notifPrefs) => {
    setNotifPrefs(prefs);
    await AsyncStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(prefs));
  };

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") { Alert.alert("İzin Gerekli", "Galeri izni gereklidir."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setPhoto(uri);
      await AsyncStorage.setItem(PHOTO_KEY, uri);
    }
  };

  const saveProfile = async () => {
    await saveUserRegistration({ name: editName, email: editEmail, role: editRole });
    setUser({ ...user, name: editName, email: editEmail, role: editRole });
    setEditMode(false);
    Alert.alert("Kaydedildi", "Profil güncellendi.");
  };

  const deleteAccount = () => {
    Alert.alert("Hesabı Sil", "Bu işlem geri alınamaz. Emin misiniz?", [
      { text: "İptal", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: async () => {
        await clearUserRegistration();
        await AsyncStorage.clear();
        router.replace("/");
      }},
    ]);
  };

  const canSendMessage = (dietitianId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const limits = msgLimits[dietitianId];
    if (!limits) return { can: true, reason: "" };
    if (limits.total >= 3) return { can: false, reason: t.totalLimit };
    if (limits.lastDate === today && limits.daily >= 1) return { can: false, reason: t.dailyLimit };
    return { can: true, reason: "" };
  };

  const sendMessage = async () => {
    if (!selectedDietitian || !msgText.trim()) return;
    const check = canSendMessage(selectedDietitian.id);
    if (!check.can) { Alert.alert("Limit", check.reason); return; }
    const today = new Date().toISOString().split("T")[0];
    const existing = msgLimits[selectedDietitian.id] ?? { daily: 0, total: 0, lastDate: "" };
    const newLimits = {
      ...msgLimits,
      [selectedDietitian.id]: {
        daily: existing.lastDate === today ? existing.daily + 1 : 1,
        total: existing.total + 1,
        lastDate: today,
      },
    };
    setMsgLimits(newLimits);
    await AsyncStorage.setItem(MSG_LIMIT_KEY, JSON.stringify(newLimits));
    setMsgText("");
    setShowMsgModal(false);
    Alert.alert("✅", `${t.messageSent}! ${selectedDietitian.name} en kısa sürede yanıtlayacak.`);
  };

  const submitRating = async () => {
    if (!selectedDietitian) return;
    const rating: Rating = {
      id: Date.now().toString(),
      fromName: user?.name ?? "Anonim",
      fromRole: user?.role ?? "client",
      toId: selectedDietitian.id,
      score: ratingScore,
      comment: ratingComment,
      date: new Date().toISOString(),
    };
    const updated = [...ratings, rating];
    setRatings(updated);
    await AsyncStorage.setItem(RATINGS_KEY, JSON.stringify(updated));
    setShowRatingModal(false);
    setRatingComment("");
    Alert.alert("Teşekkürler!", "Puanınız kaydedildi.");
  };

  const getDietitianRating = (id: string) => {
    const dRatings = ratings.filter(r => r.toId === id);
    if (dRatings.length === 0) return null;
    return (dRatings.reduce((s, r) => s + r.score, 0) / dRatings.length).toFixed(1);
  };

  const avgRating = ratings.filter(r => r.toId !== user?.email).length > 0
    ? (ratings.reduce((s, r) => s + r.score, 0) / ratings.length).toFixed(1)
    : null;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: colors.foreground }}>
            {activeTab === "profile" ? `👤 ${t.profile}` : `🔍 ${t.findDietitian}`}
          </Text>
          <TouchableOpacity onPress={() => setShowSettings(true)}
            style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={{ fontSize: 16 }}>⚙️</Text>
            <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 13 }}>{t.settings}</Text>
          </TouchableOpacity>
        </View>

        {/* Tab - Danışan için diyetisyen bul göster */}
        {user?.role === "client" && (
          <View style={{ flexDirection: "row", gap: 8 }}>
            {(["profile", "find-dietitian"] as const).map(tab => (
              <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}
                style={{
                  flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center",
                  backgroundColor: activeTab === tab ? colors.primary : colors.surface,
                  borderWidth: 1, borderColor: activeTab === tab ? colors.primary : colors.border,
                }}>
                <Text style={{ color: activeTab === tab ? "#fff" : colors.foreground, fontWeight: "600" }}>
                  {tab === "profile" ? `👤 ${t.profile}` : `🔍 ${t.findDietitian}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* PROFİL TAB */}
        {activeTab === "profile" && (
          <>
            {/* Fotoğraf */}
            <TouchableOpacity onPress={pickPhoto} style={{ alignItems: "center", gap: 8 }}>
              {photo ? (
                <Image source={{ uri: photo }} style={{ width: 100, height: 100, borderRadius: 50 }} />
              ) : (
                <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.primary, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 40 }}>👤</Text>
                </View>
              )}
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "600" }}>📷 Fotoğraf Değiştir</Text>
            </TouchableOpacity>

            {/* Profil Bilgileri / Düzenle */}
            <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, gap: 12, borderWidth: 1, borderColor: colors.border }}>
              {!editMode ? (
                <>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <View style={{ gap: 4 }}>
                      <Text style={{ fontSize: 20, fontWeight: "700", color: colors.foreground }}>{user?.name}</Text>
                      <Text style={{ color: colors.muted }}>{user?.email}</Text>
                      <View style={{ backgroundColor: colors.primary + "20", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: "flex-start", marginTop: 4 }}>
                        <Text style={{ color: colors.primary, fontWeight: "600" }}>
                          {user?.role === "dietitian" ? "👨‍⚕️ Diyetisyen" : "👤 Danışan"}
                        </Text>
                      </View>
                    </View>
                    {avgRating && <Text style={{ color: colors.foreground }}>⭐ {avgRating}</Text>}
                  </View>
                  <TouchableOpacity onPress={() => setEditMode(true)}
                    style={{ paddingVertical: 10, borderRadius: 10, alignItems: "center", backgroundColor: colors.primary + "20", borderWidth: 1, borderColor: colors.primary }}>
                    <Text style={{ color: colors.primary, fontWeight: "700" }}>✏️ {t.editProfile}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={{ fontWeight: "700", color: colors.foreground }}>✏️ {t.editProfile}</Text>
                  {[
                    { label: t.name, value: editName, set: setEditName },
                    { label: t.email, value: editEmail, set: setEditEmail },
                  ].map(f => (
                    <View key={f.label} style={{ gap: 4 }}>
                      <Text style={{ fontSize: 13, fontWeight: "600", color: colors.foreground }}>{f.label}</Text>
                      <TextInput value={f.value} onChangeText={f.set} placeholderTextColor={colors.muted}
                        style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.foreground, backgroundColor: colors.background }} />
                    </View>
                  ))}
                  <View style={{ gap: 4 }}>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: colors.foreground }}>{t.role}</Text>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      {(["client", "dietitian"] as const).map(r => (
                        <TouchableOpacity key={r} onPress={() => setEditRole(r)}
                          style={{ flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center", backgroundColor: editRole === r ? colors.primary : colors.surface, borderWidth: 2, borderColor: editRole === r ? colors.primary : colors.border }}>
                          <Text style={{ color: editRole === r ? "#fff" : colors.foreground, fontWeight: "700" }}>
                            {r === "client" ? `👤 ${t.client}` : `👨‍⚕️ ${t.dietitian}`}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity onPress={() => setEditMode(false)}
                      style={{ flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                      <Text style={{ color: colors.foreground }}>{t.cancel}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={saveProfile}
                      style={{ flex: 2, paddingVertical: 12, borderRadius: 10, alignItems: "center", backgroundColor: colors.primary }}>
                      <Text style={{ color: "#fff", fontWeight: "700" }}>💾 {t.save}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>

            {/* Puanlar */}
            <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 10 }}>
              <Text style={{ fontWeight: "700", color: colors.foreground }}>⭐ {t.ratings}</Text>
              {ratings.filter(r => r.toId === user?.email || r.fromName === user?.name).length === 0 ? (
                <Text style={{ color: colors.muted }}>Henüz puan yok.</Text>
              ) : ratings.filter(r => r.toId === user?.email || r.fromName === user?.name).map(r => (
                <View key={r.id} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, gap: 4 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontWeight: "600", color: colors.foreground }}>{r.fromName}</Text>
                    <Text>{"⭐".repeat(r.score)}</Text>
                  </View>
                  {r.comment ? <Text style={{ color: colors.muted, fontSize: 13 }}>{r.comment}</Text> : null}
                </View>
              ))}
            </View>

            {/* Hesap Sil */}
            <TouchableOpacity onPress={deleteAccount}
              style={{ paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: "#ef444420", borderWidth: 1, borderColor: "#ef4444" }}>
              <Text style={{ color: "#ef4444", fontWeight: "700" }}>🗑️ {t.deleteAccount}</Text>
            </TouchableOpacity>
          </>
        )}

        {/* DİYETİSYEN BUL TAB */}
        {activeTab === "find-dietitian" && (
          <>
            <Text style={{ color: colors.muted, fontSize: 13 }}>Diyetisyenleri inceleyin ve iletişime geçin. Kayıtlı olmadan da mesaj gönderebilirsiniz.</Text>
            {SAMPLE_DIETITIANS.map(d => {
              const userRating = getDietitianRating(d.id);
              const displayRating = userRating ? Number(userRating) : d.rating;
              const msgCheck = canSendMessage(d.id);
              const limits = msgLimits[d.id];
              return (
                <View key={d.id} style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 10 }}>
                  <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                    <Text style={{ fontSize: 36 }}>{d.icon}</Text>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>{d.name}</Text>
                      <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "600" }}>{d.specialty}</Text>
                      <Text style={{ color: colors.muted, fontSize: 12 }}>{d.bio}</Text>
                    </View>
                  </View>

                  {/* Puan */}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={{ fontSize: 20 }}>{"⭐".repeat(Math.round(displayRating))}</Text>
                    <Text style={{ fontWeight: "700", color: colors.foreground }}>{displayRating}</Text>
                    <Text style={{ color: colors.muted, fontSize: 12 }}>({d.ratingCount} değerlendirme)</Text>
                  </View>

                  {limits && (
                    <Text style={{ color: colors.muted, fontSize: 11 }}>
                      Gönderilen: {limits.total}/3 toplam, {limits.daily}/1 bugün
                    </Text>
                  )}

                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => {
                        if (!msgCheck.can) { Alert.alert("Limit", msgCheck.reason); return; }
                        setSelectedDietitian(d);
                        setShowMsgModal(true);
                      }}
                      style={{
                        flex: 2, paddingVertical: 10, borderRadius: 10, alignItems: "center",
                        backgroundColor: msgCheck.can ? colors.primary : colors.border,
                      }}>
                      <Text style={{ color: "#fff", fontWeight: "700" }}>
                        💬 {t.contact}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => { setSelectedDietitian(d); setShowRatingModal(true); }}
                      style={{ flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                      <Text style={{ color: colors.foreground, fontWeight: "600" }}>⭐ {t.rateThis}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* AYARLAR MODAL */}
      <Modal visible={showSettings} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "#00000080", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, gap: 14, maxHeight: "80%" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground }}>⚙️ {t.settings}</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <Text style={{ color: "#ef4444", fontWeight: "600" }}>Kapat</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ gap: 14 }}>
                {/* Tema */}
                <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border, gap: 10 }}>
                  <Text style={{ fontWeight: "700", color: colors.foreground }}>🎨 {t.theme}</Text>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {[
                      { key: false, label: "☀️ " + t.lightMode },
                      { key: true, label: "🌙 " + t.darkMode },
                    ].map(opt => (
                      <TouchableOpacity key={String(opt.key)} onPress={() => saveTheme(opt.key)}
                        style={{
                          flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center",
                          backgroundColor: isDark === opt.key ? colors.primary : colors.background,
                          borderWidth: 2, borderColor: isDark === opt.key ? colors.primary : colors.border,
                        }}>
                        <Text style={{ color: isDark === opt.key ? "#fff" : colors.foreground, fontWeight: "600", fontSize: 13 }}>{opt.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Dil */}
                <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border, gap: 10 }}>
                  <Text style={{ fontWeight: "700", color: colors.foreground }}>🌍 {t.language}</Text>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {[
                      { key: "tr", label: "🇹🇷 Türkçe" },
                      { key: "en", label: "🇬🇧 English" },
                    ].map(opt => (
                      <TouchableOpacity key={opt.key} onPress={() => saveLang(opt.key as "tr" | "en")}
                        style={{
                          flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center",
                          backgroundColor: language === opt.key ? colors.primary : colors.background,
                          borderWidth: 2, borderColor: language === opt.key ? colors.primary : colors.border,
                        }}>
                        <Text style={{ color: language === opt.key ? "#fff" : colors.foreground, fontWeight: "600" }}>{opt.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Bildirimler */}
                <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border, gap: 8 }}>
                  <Text style={{ fontWeight: "700", color: colors.foreground }}>🔔 {t.notifications}</Text>
                  {[
                    { key: "meals", label: "🍽️ Öğün hatırlatmaları" },
                    { key: "appointments", label: "📅 Randevu bildirimleri" },
                    { key: "goals", label: "🎯 Hedef uyarıları" },
                    { key: "messages", label: "💬 Mesaj bildirimleri" },
                  ].map(item => (
                    <View key={item.key} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 }}>
                      <Text style={{ color: colors.foreground }}>{item.label}</Text>
                      <Switch
                        value={notifPrefs[item.key as keyof typeof notifPrefs]}
                        onValueChange={v => saveNotifPrefs({ ...notifPrefs, [item.key]: v })}
                        trackColor={{ false: colors.border, true: colors.primary }}
                      />
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MESAJ MODAL */}
      <Modal visible={showMsgModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "#00000080", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, gap: 14 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>
              💬 {selectedDietitian?.name}
            </Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>
              Günde 1 mesaj, toplamda en fazla 3 mesaj gönderebilirsiniz.
            </Text>
            <TextInput value={msgText} onChangeText={setMsgText}
              placeholder="Mesajınızı yazın..." multiline placeholderTextColor={colors.muted}
              style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.foreground, backgroundColor: colors.surface, minHeight: 80 }} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity onPress={() => setShowMsgModal(false)}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.foreground }}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={sendMessage}
                style={{ flex: 2, paddingVertical: 12, borderRadius: 10, alignItems: "center", backgroundColor: colors.primary }}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>📤 {t.sendMessage}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* PUAN MODAL */}
      <Modal visible={showRatingModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "#00000080", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, gap: 14 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>⭐ {selectedDietitian?.name}</Text>
            <View style={{ flexDirection: "row", gap: 8, justifyContent: "center" }}>
              {[1, 2, 3, 4, 5].map(s => (
                <TouchableOpacity key={s} onPress={() => setRatingScore(s)}>
                  <Text style={{ fontSize: 36, opacity: s <= ratingScore ? 1 : 0.3 }}>⭐</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput value={ratingComment} onChangeText={setRatingComment}
              placeholder="Yorum (isteğe bağlı)" multiline placeholderTextColor={colors.muted}
              style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.foreground, backgroundColor: colors.surface, minHeight: 60 }} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity onPress={() => setShowRatingModal(false)}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.foreground }}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={submitRating}
                style={{ flex: 2, paddingVertical: 12, borderRadius: 10, alignItems: "center", backgroundColor: colors.primary }}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>{t.submitRating}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
