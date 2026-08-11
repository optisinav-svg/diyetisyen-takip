import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, Modal, Share } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { BackButton } from "@/components/back-button";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getMyClients, addClient, ClientRecord } from "@/lib/_core/clients-store";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const INVITE_CODE_KEY = "dietitian_invite_code_v2";
const PENDING_REQUESTS_KEY = "pending_match_requests_v2";
const MY_DIETITIAN_KEY = "my_dietitian_v2";

interface MatchRequest {
  id: string;
  clientUsername: string;
  clientName: string;
  clientEmail: string;
  code: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
}

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "DYT-";
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function MatchingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [role, setRole] = useState<"dietitian" | "client">("client");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [requests, setRequests] = useState<MatchRequest[]>([]);
  const [myDietitian, setMyDietitian] = useState<any>(null);
  const [enterCode, setEnterCode] = useState("");
  const [tab, setTab] = useState<"code" | "qr" | "email">("code");
  const [emailInvite, setEmailInvite] = useState("");
  const [showCodeModal, setShowCodeModal] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const s = await AsyncStorage.getItem("session_v3");
    if (s) {
      const parsed = JSON.parse(s);
      setRole(parsed.role ?? "client");
      setUserName(parsed.name ?? "");
      setUserEmail(parsed.email ?? "");
    }
    const code = await AsyncStorage.getItem(INVITE_CODE_KEY);
    if (code) setInviteCode(code);
    const reqs = await AsyncStorage.getItem(PENDING_REQUESTS_KEY);
    if (reqs) setRequests(JSON.parse(reqs));
    const dietitian = await AsyncStorage.getItem(MY_DIETITIAN_KEY);
    if (dietitian) setMyDietitian(JSON.parse(dietitian));
  };

  const createNewCode = async () => {
    Alert.alert("Yeni Kod Oluştur", "Eski kod devre dışı kalacak ve eski kodla gelen bekleyen başvurular iptal edilecek. Devam etmek istiyor musunuz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Oluştur", onPress: async () => {
          const newCode = generateCode();
          setInviteCode(newCode);
          await AsyncStorage.setItem(INVITE_CODE_KEY, newCode);
          // Bekleyen başvuruları temizle
          const clearedReqs = requests.map(r => r.status === "pending" ? { ...r, status: "rejected" as const } : r);
          setRequests(clearedReqs);
          await AsyncStorage.setItem(PENDING_REQUESTS_KEY, JSON.stringify(clearedReqs));
          Alert.alert("✅ Yeni Kod Oluşturuldu", `Yeni kodunuz: ${newCode}`);
        }
      }
    ]);
  };

  const shareCode = async () => {
    if (!inviteCode) return;
    await Share.share({
      message: `Diyetisyen Takip uygulamasında benimle çalışmak için:\n\n📱 Uygulamayı indirin\n🔑 Davet kodunuzu girin: ${inviteCode}\n\nKodun geçerlilik süresi sınırsız.`,
      title: "Diyetisyen Davet Kodu"
    });
  };

  const sendMatchRequest = async () => {
    if (!enterCode.trim()) { Alert.alert("Hata", "Kod girin"); return; }
    const code = enterCode.trim().toUpperCase();
    // Simulate checking code against dietitian
    const mockDietitian = { id: "d1", name: "Diyetisyeniniz", code };
    const req: MatchRequest = {
      id: Date.now().toString(),
      clientUsername: userName,
      clientName: userName,
      clientEmail: userEmail,
      code,
      requestedAt: new Date().toISOString(),
      status: "pending"
    };
    const updated = [...requests, req];
    setRequests(updated);
    await AsyncStorage.setItem(PENDING_REQUESTS_KEY, JSON.stringify(updated));
    setEnterCode("");
    Alert.alert("✅ İstek Gönderildi", `Diyetisyeninize eşleşme isteği gönderildi.\n\nDiyetisyeniniz onayladıktan sonra eşleşme tamamlanacak.`);
  };

  const sendEmailInvite = async () => {
    if (!emailInvite.trim() || !emailInvite.includes("@")) { Alert.alert("Hata", "Geçerli email girin"); return; }
    if (!inviteCode) { Alert.alert("Hata", "Önce davet kodu oluşturun"); return; }
    Alert.alert("📧 Davet Gönderildi", `${emailInvite} adresine davet emaili gönderildi.\n\nDavet kodunuz: ${inviteCode}\n\n⚠️ Test modu — gerçek email gönderilmedi.`);
    setEmailInvite("");
  };

  const approveRequest = async (reqId: string) => {
    const req = requests.find(r => r.id === reqId);
    if (!req) return;
    const updated = requests.map(r => r.id === reqId ? { ...r, status: "approved" as const } : r);
    setRequests(updated);
    await AsyncStorage.setItem(PENDING_REQUESTS_KEY, JSON.stringify(updated));
    // Danışanı listeye ekle
    const newClient: ClientRecord = {
      id: `client_${Date.now()}`,
      name: req.clientName,
      email: req.clientEmail,
      addedAt: new Date().toISOString(),
      adherenceRate: 0,
      status: "good",
      lastSeen: "Şimdi"
    };
    await addClient(newClient);
    Alert.alert("✅ Eşleşme Tamamlandı", `${req.clientName} danışanlarınıza eklendi!`);
  };

  const rejectRequest = async (reqId: string) => {
    const updated = requests.map(r => r.id === reqId ? { ...r, status: "rejected" as const } : r);
    setRequests(updated);
    await AsyncStorage.setItem(PENDING_REQUESTS_KEY, JSON.stringify(updated));
  };

  const pendingReqs = requests.filter(r => r.status === "pending");
  const approvedReqs = requests.filter(r => r.status === "approved");

  return (
    <ScreenContainer>
      <BackButton title="🔗 Eşleştirme" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: Math.max(insets.bottom + 24, 32) }}>

        {/* DİYETİSYEN EKRANI */}
        {role === "dietitian" && (<>
          <Text style={{ color: colors.muted, fontSize: 13 }}>Danışanlarınızı üç farklı yöntemle davet edebilirsiniz.</Text>

          {/* Yöntem seçimi */}
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[{ k: "code", l: "🔑 Kod", }, { k: "qr", l: "📱 QR" }, { k: "email", l: "📧 Email" }].map(t => (
              <TouchableOpacity key={t.k} onPress={() => setTab(t.k as any)}
                style={{ flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center", backgroundColor: tab === t.k ? colors.primary : colors.surface, borderWidth: 1, borderColor: tab === t.k ? colors.primary : colors.border }}>
                <Text style={{ color: tab === t.k ? "#fff" : colors.foreground, fontWeight: "600" }}>{t.l}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Kod ile davet */}
          {tab === "code" && (
            <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 20, borderWidth: 1, borderColor: colors.border, gap: 14, alignItems: "center" }}>
              <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>🔑 Davet Kodunuz</Text>
              {inviteCode ? (<>
                <View style={{ backgroundColor: colors.primary + "20", borderRadius: 12, paddingVertical: 16, paddingHorizontal: 32, borderWidth: 2, borderColor: colors.primary }}>
                  <Text style={{ fontSize: 32, fontWeight: "bold", color: colors.primary, letterSpacing: 4 }}>{inviteCode}</Text>
                </View>
                <Text style={{ color: colors.muted, fontSize: 13, textAlign: "center" }}>Bu kodu danışanınıza verin. Danışan bu kodu uygulamaya girince size eşleşme isteği gelir.</Text>
                <View style={{ flexDirection: "row", gap: 10, width: "100%" }}>
                  <TouchableOpacity onPress={shareCode}
                    style={{ flex: 2, paddingVertical: 12, borderRadius: 10, alignItems: "center", backgroundColor: colors.primary }}>
                    <Text style={{ color: "#fff", fontWeight: "700" }}>📤 Paylaş</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={createNewCode}
                    style={{ flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center", backgroundColor: "#ef444420", borderWidth: 1, borderColor: "#ef4444" }}>
                    <Text style={{ color: "#ef4444", fontWeight: "600", fontSize: 13 }}>🔄 Yenile</Text>
                  </TouchableOpacity>
                </View>
              </>) : (
                <TouchableOpacity onPress={async () => {
                  const code = generateCode();
                  setInviteCode(code);
                  await AsyncStorage.setItem(INVITE_CODE_KEY, code);
                }} style={{ paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12, backgroundColor: colors.primary }}>
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>+ Davet Kodu Oluştur</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* QR ile davet */}
          {tab === "qr" && (
            <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 20, borderWidth: 1, borderColor: colors.border, gap: 14, alignItems: "center" }}>
              <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>📱 QR Kod</Text>
              <View style={{ width: 200, height: 200, backgroundColor: colors.border, borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 80 }}>📱</Text>
                <Text style={{ color: colors.muted, fontSize: 12, textAlign: "center", marginTop: 8, paddingHorizontal: 16 }}>QR kod burada görünür{"\n"}(Store sürümünde aktif)</Text>
              </View>
              <Text style={{ color: colors.muted, fontSize: 13, textAlign: "center" }}>Danışanınız bu QR kodu telefonu ile tarayarak eşleşme isteği gönderebilir.</Text>
              {inviteCode && <Text style={{ color: colors.primary, fontWeight: "700" }}>Kod: {inviteCode}</Text>}
            </View>
          )}

          {/* Email ile davet */}
          {tab === "email" && (
            <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 12 }}>
              <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>📧 Email ile Davet</Text>
              <Text style={{ color: colors.muted, fontSize: 13 }}>Danışanınızın email adresini girin. Davet emaili otomatik gönderilir.</Text>
              <TextInput value={emailInvite} onChangeText={setEmailInvite} placeholder="danisan@email.com"
                keyboardType="email-address" autoCapitalize="none" placeholderTextColor={colors.muted}
                style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, color: colors.foreground, backgroundColor: colors.background }} />
              <TouchableOpacity onPress={sendEmailInvite}
                style={{ paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: colors.primary }}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>📧 Davet Gönder</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Bekleyen İstekler */}
          {pendingReqs.length > 0 && (
            <View style={{ gap: 10 }}>
              <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>⏳ Bekleyen İstekler ({pendingReqs.length})</Text>
              {pendingReqs.map(req => (
                <View key={req.id} style={{ backgroundColor: "#f97316" + "15", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#f97316", gap: 10 }}>
                  <View>
                    <Text style={{ fontWeight: "700", color: colors.foreground }}>👤 {req.clientName}</Text>
                    <Text style={{ color: colors.muted, fontSize: 12 }}>{req.clientEmail}</Text>
                    <Text style={{ color: colors.muted, fontSize: 12 }}>🕐 {new Date(req.requestedAt).toLocaleDateString("tr-TR")}</Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity onPress={() => rejectRequest(req.id)}
                      style={{ flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center", backgroundColor: "#ef444420", borderWidth: 1, borderColor: "#ef4444" }}>
                      <Text style={{ color: "#ef4444", fontWeight: "600" }}>❌ Reddet</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => approveRequest(req.id)}
                      style={{ flex: 2, paddingVertical: 10, borderRadius: 10, alignItems: "center", backgroundColor: "#22c55e" }}>
                      <Text style={{ color: "#fff", fontWeight: "700" }}>✅ Onayla</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Onaylanan Eşleşmeler */}
          {approvedReqs.length > 0 && (
            <View style={{ gap: 8 }}>
              <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>✅ Eşleşmiş Danışanlar</Text>
              {approvedReqs.map(req => (
                <View key={req.id} style={{ backgroundColor: "#22c55e20", borderRadius: 10, padding: 12, borderWidth: 1, borderColor: "#22c55e", flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Text style={{ fontSize: 24 }}>👤</Text>
                  <View>
                    <Text style={{ fontWeight: "700", color: colors.foreground }}>{req.clientName}</Text>
                    <Text style={{ color: colors.muted, fontSize: 12 }}>{req.clientEmail}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </>)}

        {/* DANIŞAN EKRANI */}
        {role === "client" && (<>
          {myDietitian ? (
            <View style={{ backgroundColor: "#22c55e20", borderRadius: 14, padding: 20, borderWidth: 2, borderColor: "#22c55e", alignItems: "center", gap: 10 }}>
              <Text style={{ fontSize: 48 }}>👨‍⚕️</Text>
              <Text style={{ fontWeight: "700", color: "#22c55e", fontSize: 18 }}>Eşleşme Tamamlandı!</Text>
              <Text style={{ color: colors.foreground }}>Diyetisyeniniz: {myDietitian.name}</Text>
              <TouchableOpacity onPress={async () => {
                Alert.alert("Eşleşmeyi Kaldır", "Diyetisyeninizle bağlantınızı kesmek istiyor musunuz?", [
                  { text: "İptal", style: "cancel" },
                  { text: "Kaldır", style: "destructive", onPress: async () => { setMyDietitian(null); await AsyncStorage.removeItem(MY_DIETITIAN_KEY); } }
                ]);
              }} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: "#ef444420", borderWidth: 1, borderColor: "#ef4444" }}>
                <Text style={{ color: "#ef4444", fontSize: 13 }}>Eşleşmeyi Kaldır</Text>
              </TouchableOpacity>
            </View>
          ) : (<>
            <Text style={{ color: colors.muted, fontSize: 13 }}>Diyetisyeninizden aldığınız kodu girerek eşleşme isteği gönderin.</Text>

            <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 20, borderWidth: 1, borderColor: colors.border, gap: 14 }}>
              <Text style={{ fontWeight: "700", color: colors.foreground, fontSize: 16 }}>🔑 Davet Kodu Girin</Text>
              <TextInput value={enterCode} onChangeText={setEnterCode}
                placeholder="DYT-XXXX" autoCapitalize="characters" placeholderTextColor={colors.muted}
                style={{ borderWidth: 2, borderColor: colors.primary, borderRadius: 12, padding: 14, color: colors.foreground, backgroundColor: colors.background, fontSize: 22, textAlign: "center", letterSpacing: 4, fontWeight: "700" }} />
              <TouchableOpacity onPress={sendMatchRequest}
                style={{ paddingVertical: 14, borderRadius: 12, alignItems: "center", backgroundColor: colors.primary }}>
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>🔗 Eşleşme İsteği Gönder</Text>
              </TouchableOpacity>
            </View>

            <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border, gap: 8 }}>
              <Text style={{ fontWeight: "700", color: colors.foreground }}>📱 QR Kod ile Eşleş</Text>
              <Text style={{ color: colors.muted, fontSize: 13 }}>Diyetisyeninizin QR kodunu kameranızla tarayın.</Text>
              <TouchableOpacity onPress={() => Alert.alert("QR Tarayıcı", "Store sürümünde kamera ile QR tarama aktif olacak.")}
                style={{ paddingVertical: 12, borderRadius: 10, alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary }}>
                <Text style={{ color: colors.primary, fontWeight: "700" }}>📷 QR Kodu Tara</Text>
              </TouchableOpacity>
            </View>

            {/* Bekleyen istekler */}
            {requests.filter(r => r.clientEmail === userEmail).length > 0 && (
              <View style={{ backgroundColor: "#f97316" + "15", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#f97316" }}>
                <Text style={{ fontWeight: "700", color: "#f97316" }}>⏳ İsteğiniz Onay Bekliyor</Text>
                <Text style={{ color: colors.muted, fontSize: 13, marginTop: 4 }}>Diyetisyeniniz isteğinizi onayladığında eşleşme tamamlanacak.</Text>
              </View>
            )}
          </>)}
        </>)}
      </ScrollView>
    </ScreenContainer>
  );
}
