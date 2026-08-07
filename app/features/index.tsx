import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useColors } from "@/hooks/use-colors";
import { saveUserRegistration, getUserRegistration, setBiometricEnabled } from "@/lib/_core/user-registration";
import { isBiometricAvailable, getBiometricType, authenticateWithBiometric } from "@/lib/_core/biometric-login";

type Screen = "loading" | "register" | "biometric-setup" | "biometric-login";

export default function AuthScreen() {
  const router = useRouter();
  const colors = useColors();
  const [screen, setScreen] = useState<Screen>("loading");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"dietitian" | "client">("client");
  const [biometricType, setBiometricType] = useState<"face" | "fingerprint" | "none">("none");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    checkExistingUser();
  }, []);

  const checkExistingUser = async () => {
    try {
      const user = await getUserRegistration();
      if (!user) {
        setScreen("register");
        return;
      }
      // Kullanıcı kayıtlı — biyometrik kontrol et
      const available = await isBiometricAvailable();
      if (available && user.biometricEnabled) {
        const type = await getBiometricType();
        setBiometricType(type);
        setScreen("biometric-login");
        // Otomatik biyometrik başlat
        setTimeout(() => triggerBiometric(), 500);
      } else {
        // Biyometrik yoksa direkt ana ekrana
        router.replace("/features-menu");
      }
    } catch {
      setScreen("register");
    }
  };

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurunuz");
      return;
    }
    if (!email.includes("@")) {
      Alert.alert("Hata", "Lütfen geçerli bir email adresi giriniz");
      return;
    }
    try {
      await saveUserRegistration({ name: fullName, email, role });
      // Biyometrik mevcut mu?
      const available = await isBiometricAvailable();
      if (available) {
        const type = await getBiometricType();
        setBiometricType(type);
        setScreen("biometric-setup");
      } else {
        router.replace("/features-menu");
      }
    } catch {
      Alert.alert("Hata", "Kayıt sırasında bir hata oluştu");
    }
  };

  const handleEnableBiometric = async () => {
    setIsAuthenticating(true);
    try {
      const result = await authenticateWithBiometric();
      if (result.success) {
        await setBiometricEnabled(true);
        Alert.alert("Harika!", "Biyometrik giriş aktif edildi. Bundan sonra şifresiz giriş yapabilirsiniz.", [
          { text: "Devam Et", onPress: () => router.replace("/features-menu") }
        ]);
      } else {
        Alert.alert("Hata", "Biyometrik doğrulama başarısız oldu");
      }
    } catch {
      Alert.alert("Hata", "Bir sorun oluştu");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSkipBiometric = () => {
    router.replace("/features-menu");
  };

  const triggerBiometric = async () => {
    setIsAuthenticating(true);
    try {
      const result = await authenticateWithBiometric();
      if (result.success) {
        router.replace("/features-menu");
      } else if (result.error !== "user_cancel") {
        Alert.alert("Doğrulama Başarısız", "Lütfen tekrar deneyin");
      }
    } catch {
      Alert.alert("Hata", "Biyometrik doğrulama sırasında hata oluştu");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const biometricLabel = biometricType === "face" ? "Yüz Tanıma" : biometricType === "fingerprint" ? "Parmak İzi" : "Biyometrik";
  const biometricIcon = biometricType === "face" ? "😊" : "👆";

  // LOADING
  if (screen === "loading") {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.muted, marginTop: 12 }}>Yükleniyor...</Text>
      </ScreenContainer>
    );
  }

  // BİYOMETRİK GİRİŞ
  if (screen === "biometric-login") {
    return (
      <ScreenContainer className="p-6">
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 24 }}>
          <Text style={{ fontSize: 64 }}>{biometricIcon}</Text>
          <Text style={{ fontSize: 28, fontWeight: "bold", color: colors.foreground, textAlign: "center" }}>
            Diyetisyen Takip
          </Text>
          <Text style={{ fontSize: 16, color: colors.muted, textAlign: "center" }}>
            Giriş yapmak için {biometricLabel.toLowerCase()} kullanın
          </Text>

          <TouchableOpacity
            onPress={triggerBiometric}
            disabled={isAuthenticating}
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
              marginTop: 16,
              opacity: isAuthenticating ? 0.7 : 1,
            }}
          >
            {isAuthenticating ? (
              <ActivityIndicator color="#fff" size="large" />
            ) : (
              <Text style={{ fontSize: 48 }}>{biometricIcon}</Text>
            )}
          </TouchableOpacity>

          <Text style={{ color: colors.muted, fontSize: 14 }}>
            {isAuthenticating ? "Doğrulanıyor..." : "Butona basarak giriş yapın"}
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  // BİYOMETRİK KURULUM
  if (screen === "biometric-setup") {
    return (
      <ScreenContainer className="p-6">
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 20 }}>
          <Text style={{ fontSize: 64 }}>{biometricIcon}</Text>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground, textAlign: "center" }}>
            Şifresiz Giriş
          </Text>
          <Text style={{ fontSize: 15, color: colors.muted, textAlign: "center", lineHeight: 22 }}>
            {biometricLabel} ile giriş yaparak bir daha şifre girmenize gerek kalmaz.
          </Text>

          <TouchableOpacity
            onPress={handleEnableBiometric}
            disabled={isAuthenticating}
            style={{
              width: "100%",
              paddingVertical: 16,
              borderRadius: 12,
              backgroundColor: colors.primary,
              alignItems: "center",
              marginTop: 16,
              opacity: isAuthenticating ? 0.7 : 1,
            }}
          >
            {isAuthenticating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                {biometricIcon} {biometricLabel} ile Aktif Et
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSkipBiometric}>
            <Text style={{ color: colors.muted, fontSize: 14, textDecorationLine: "underline" }}>
              Şimdi değil, atla
            </Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  // KAYIT EKRANI
  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, justifyContent: "center", gap: 24 }}>
          {/* Header */}
          <View style={{ alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Text style={{ fontSize: 36, fontWeight: "bold", color: colors.foreground }}>🥗 Diyetisyen Takip</Text>
            <Text style={{ fontSize: 15, color: colors.muted, textAlign: "center" }}>
              Sağlık ve beslenme yönetimi uygulaması
            </Text>
          </View>

          {/* Form */}
          <View style={{ gap: 16 }}>
            <View>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>Ad Soyad</Text>
              <TextInput
                placeholder="Adınızı ve soyadınızı girin"
                value={fullName}
                onChangeText={setFullName}
                placeholderTextColor={colors.muted}
                style={{
                  borderWidth: 1, borderColor: colors.border, borderRadius: 10,
                  padding: 14, color: colors.foreground, backgroundColor: colors.surface, fontSize: 15,
                }}
              />
            </View>

            <View>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>Email</Text>
              <TextInput
                placeholder="Email adresinizi girin"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.muted}
                style={{
                  borderWidth: 1, borderColor: colors.border, borderRadius: 10,
                  padding: 14, color: colors.foreground, backgroundColor: colors.surface, fontSize: 15,
                }}
              />
            </View>

            {/* Rol Seçimi */}
            <View>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>Rolünüz</Text>
              <View style={{ flexDirection: "row", gap: 12 }}>
                {(["client", "dietitian"] as const).map((r) => (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setRole(r)}
                    style={{
                      flex: 1, paddingVertical: 14, borderRadius: 10, borderWidth: 2,
                      borderColor: role === r ? colors.primary : colors.border,
                      backgroundColor: role === r ? colors.primary : colors.surface,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: role === r ? "#fff" : colors.foreground, fontWeight: "700", fontSize: 15 }}>
                      {r === "client" ? "👤 Danışan" : "👨‍⚕️ Diyetisyen"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              onPress={handleRegister}
              style={{
                paddingVertical: 16, borderRadius: 12,
                backgroundColor: colors.primary, alignItems: "center", marginTop: 8,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Kayıt Ol ve Devam Et →</Text>
            </TouchableOpacity>
          </View>

          <Text style={{ textAlign: "center", fontSize: 12, color: colors.muted }}>
            Kayıt olduktan sonra şifresiz giriş ayarlayabilirsiniz.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
