import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isBiometricAvailable, getBiometricType, authenticateWithBiometric } from "@/lib/_core/biometric-login";

const USERS_KEY = "registered_users";
const SESSION_KEY = "current_session";
const REMEMBER_KEY = "remember_me";

interface User {
  name: string;
  username: string;
  email: string;
  password: string;
  role: "dietitian" | "client";
  registeredAt: string;
  biometricEnabled: boolean;
}

interface Session {
  username: string;
  role: "dietitian" | "client";
  name: string;
  email: string;
  loggedInAt: string;
}

type Screen = "loading" | "login" | "register" | "biometric-setup" | "biometric-login";

export default function AuthScreen() {
  const router = useRouter();
  const colors = useColors();
  const [screen, setScreen] = useState<Screen>("loading");

  // Login state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Register state
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<"dietitian" | "client">("client");
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [biometricType, setBiometricType] = useState<"face" | "fingerprint" | "none">("none");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => { init(); }, []);

  const init = async () => {
    try {
      // Aktif oturum var mı?
      const sessionData = await AsyncStorage.getItem(SESSION_KEY);
      if (sessionData) {
        const session: Session = JSON.parse(sessionData);
        // Biyometrik var mı?
        const users: User[] = JSON.parse(await AsyncStorage.getItem(USERS_KEY) ?? "[]");
        const user = users.find(u => u.username === session.username);
        if (user?.biometricEnabled) {
          const available = await isBiometricAvailable();
          if (available) {
            setCurrentUser(user);
            const type = await getBiometricType();
            setBiometricType(type);
            setScreen("biometric-login");
            setTimeout(() => triggerBiometric(user), 600);
            return;
          }
        }
        // Oturum var, biyometrik yok — direkt giriş
        router.replace("/features-menu");
        return;
      }

      // Beni hatırla verisi var mı?
      const rememberData = await AsyncStorage.getItem(REMEMBER_KEY);
      if (rememberData) {
        const { username } = JSON.parse(rememberData);
        setLoginUsername(username);
        setRememberMe(true);
      }

      setScreen("login");
    } catch {
      setScreen("login");
    }
  };

  const getUsers = async (): Promise<User[]> => {
    const data = await AsyncStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  };

  const saveUser = async (user: User) => {
    const users = await getUsers();
    const updated = [...users.filter(u => u.username !== user.username), user];
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updated));
  };

  const createSession = async (user: User) => {
    const session: Session = {
      username: user.username,
      role: user.role,
      name: user.name,
      email: user.email,
      loggedInAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    // Beni hatırla
    if (rememberMe) {
      await AsyncStorage.setItem(REMEMBER_KEY, JSON.stringify({ username: user.username }));
    } else {
      await AsyncStorage.removeItem(REMEMBER_KEY);
    }
  };

  const handleLogin = async () => {
    if (!loginUsername.trim() || !loginPassword.trim()) {
      Alert.alert("Hata", "Kullanıcı adı ve şifre girin");
      return;
    }
    const users = await getUsers();
    const user = users.find(u => u.username === loginUsername.trim() && u.password === loginPassword);
    if (!user) {
      Alert.alert("Hata", "Kullanıcı adı veya şifre hatalı");
      return;
    }
    await createSession(user);
    router.replace("/features-menu");
  };

  const handleRegister = async () => {
    if (!regName.trim() || !regUsername.trim() || !regEmail.trim() || !regPassword.trim()) {
      Alert.alert("Hata", "Tüm alanları doldurun");
      return;
    }
    if (!regEmail.includes("@")) {
      Alert.alert("Hata", "Geçerli email girin");
      return;
    }
    if (regPassword.length < 4) {
      Alert.alert("Hata", "Şifre en az 4 karakter olmalı");
      return;
    }
    const users = await getUsers();
    if (users.find(u => u.username === regUsername.trim())) {
      Alert.alert("Hata", "Bu kullanıcı adı zaten alınmış");
      return;
    }
    const user: User = {
      name: regName,
      username: regUsername.trim(),
      email: regEmail.trim(),
      password: regPassword,
      role: regRole,
      registeredAt: new Date().toISOString(),
      biometricEnabled: false,
    };
    await saveUser(user);
    await createSession(user);
    setCurrentUser(user);

    // Biyometrik teklif et
    const available = await isBiometricAvailable();
    if (available) {
      const type = await getBiometricType();
      setBiometricType(type);
      setScreen("biometric-setup");
    } else {
      router.replace("/features-menu");
    }
  };

  const handleEnableBiometric = async () => {
    if (!currentUser) return;
    setIsAuthenticating(true);
    try {
      const result = await authenticateWithBiometric();
      if (result.success) {
        const updated = { ...currentUser, biometricEnabled: true };
        await saveUser(updated);
        router.replace("/features-menu");
      } else {
        Alert.alert("Hata", "Biyometrik doğrulama başarısız");
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const triggerBiometric = async (user?: User) => {
    setIsAuthenticating(true);
    try {
      const result = await authenticateWithBiometric();
      if (result.success) {
        if (user) await createSession(user);
        router.replace("/features-menu");
      } else if (result.error !== "user_cancel") {
        Alert.alert("Doğrulama Başarısız", "Lütfen tekrar deneyin");
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const biometricIcon = biometricType === "face" ? "😊" : "👆";
  const biometricLabel = biometricType === "face" ? "Yüz Tanıma" : "Parmak İzi";

  // LOADING
  if (screen === "loading") {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  // BİYOMETRİK GİRİŞ
  if (screen === "biometric-login") {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 24, padding: 32 }}>
          <Text style={{ fontSize: 64 }}>{biometricIcon}</Text>
          <Text style={{ fontSize: 26, fontWeight: "bold", color: colors.foreground }}>Hoş Geldiniz</Text>
          <Text style={{ color: colors.muted, textAlign: "center" }}>
            {biometricLabel} ile giriş yapın
          </Text>
          <TouchableOpacity onPress={() => triggerBiometric()} disabled={isAuthenticating}
            style={{
              width: 120, height: 120, borderRadius: 60,
              backgroundColor: colors.primary, alignItems: "center", justifyContent: "center",
              opacity: isAuthenticating ? 0.7 : 1,
            }}>
            {isAuthenticating ? <ActivityIndicator color="#fff" size="large" /> : <Text style={{ fontSize: 48 }}>{biometricIcon}</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { AsyncStorage.removeItem(SESSION_KEY); setScreen("login"); }}>
            <Text style={{ color: colors.muted, textDecorationLine: "underline" }}>Farklı hesapla giriş yap</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  // BİYOMETRİK KURULUM
  if (screen === "biometric-setup") {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 20, padding: 32 }}>
          <Text style={{ fontSize: 64 }}>{biometricIcon}</Text>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground, textAlign: "center" }}>
            Şifresiz Giriş
          </Text>
          <Text style={{ color: colors.muted, textAlign: "center", lineHeight: 22 }}>
            {biometricLabel} ile giriş yaparak bir daha şifre yazmanıza gerek kalmaz.
          </Text>
          <TouchableOpacity onPress={handleEnableBiometric} disabled={isAuthenticating}
            style={{
              width: "100%", paddingVertical: 16, borderRadius: 12,
              backgroundColor: colors.primary, alignItems: "center", opacity: isAuthenticating ? 0.7 : 1,
            }}>
            {isAuthenticating ? <ActivityIndicator color="#fff" /> : (
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                {biometricIcon} {biometricLabel} ile Aktif Et
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace("/features-menu")}>
            <Text style={{ color: colors.muted, textDecorationLine: "underline" }}>Şimdi değil, atla</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  // KAYIT EKRANI
  if (screen === "register") {
    return (
      <ScreenContainer>
        <ScrollView contentContainerStyle={{ padding: 24, gap: 16, paddingBottom: 40 }}>
          <View style={{ alignItems: "center", gap: 6, marginBottom: 8 }}>
            <Text style={{ fontSize: 32, fontWeight: "bold", color: colors.foreground }}>🥗 Kayıt Ol</Text>
            <Text style={{ color: colors.muted }}>Yeni hesap oluşturun</Text>
          </View>

          {[
            { label: "Ad Soyad", value: regName, set: setRegName, placeholder: "Adınız Soyadınız" },
            { label: "Kullanıcı Adı", value: regUsername, set: setRegUsername, placeholder: "kullanici_adi" },
            { label: "Email", value: regEmail, set: setRegEmail, placeholder: "email@ornek.com" },
          ].map(field => (
            <View key={field.label} style={{ gap: 6 }}>
              <Text style={{ fontWeight: "600", color: colors.foreground }}>{field.label}</Text>
              <TextInput
                value={field.value}
                onChangeText={field.set}
                placeholder={field.placeholder}
                autoCapitalize="none"
                placeholderTextColor={colors.muted}
                style={{
                  borderWidth: 1, borderColor: colors.border, borderRadius: 10,
                  padding: 14, color: colors.foreground, backgroundColor: colors.surface, fontSize: 15,
                }}
              />
            </View>
          ))}

          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: "600", color: colors.foreground }}>Şifre</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TextInput
                value={regPassword}
                onChangeText={setRegPassword}
                placeholder="En az 4 karakter"
                secureTextEntry={!showRegPassword}
                placeholderTextColor={colors.muted}
                style={{
                  flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10,
                  padding: 14, color: colors.foreground, backgroundColor: colors.surface, fontSize: 15,
                }}
              />
              <TouchableOpacity onPress={() => setShowRegPassword(!showRegPassword)} style={{ position: "absolute", right: 14 }}>
                <Text style={{ color: colors.muted }}>{showRegPassword ? "🙈" : "👁️"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: "600", color: colors.foreground }}>Rolünüz</Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {(["client", "dietitian"] as const).map(r => (
                <TouchableOpacity key={r} onPress={() => setRegRole(r)}
                  style={{
                    flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: "center",
                    backgroundColor: regRole === r ? colors.primary : colors.surface,
                    borderWidth: 2, borderColor: regRole === r ? colors.primary : colors.border,
                  }}>
                  <Text style={{ color: regRole === r ? "#fff" : colors.foreground, fontWeight: "700" }}>
                    {r === "client" ? "👤 Danışan" : "👨‍⚕️ Diyetisyen"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity onPress={handleRegister}
            style={{ paddingVertical: 16, borderRadius: 12, alignItems: "center", backgroundColor: colors.primary, marginTop: 8 }}>
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Kayıt Ol →</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setScreen("login")} style={{ alignItems: "center" }}>
            <Text style={{ color: colors.primary }}>Zaten hesabınız var mı? <Text style={{ fontWeight: "700" }}>Giriş yapın</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // GİRİŞ EKRANI
  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 16, paddingBottom: 40 }}>
        <View style={{ alignItems: "center", gap: 6, marginBottom: 16, marginTop: 32 }}>
          <Text style={{ fontSize: 48 }}>🥗</Text>
          <Text style={{ fontSize: 28, fontWeight: "bold", color: colors.foreground }}>Diyetisyen Takip</Text>
          <Text style={{ color: colors.muted }}>Hesabınıza giriş yapın</Text>
        </View>

        <View style={{ gap: 6 }}>
          <Text style={{ fontWeight: "600", color: colors.foreground }}>Kullanıcı Adı</Text>
          <TextInput
            value={loginUsername}
            onChangeText={setLoginUsername}
            placeholder="kullanici_adi"
            autoCapitalize="none"
            placeholderTextColor={colors.muted}
            style={{
              borderWidth: 1, borderColor: colors.border, borderRadius: 10,
              padding: 14, color: colors.foreground, backgroundColor: colors.surface, fontSize: 15,
            }}
          />
        </View>

        <View style={{ gap: 6 }}>
          <Text style={{ fontWeight: "600", color: colors.foreground }}>Şifre</Text>
          <View>
            <TextInput
              value={loginPassword}
              onChangeText={setLoginPassword}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              placeholderTextColor={colors.muted}
              style={{
                borderWidth: 1, borderColor: colors.border, borderRadius: 10,
                padding: 14, paddingRight: 48, color: colors.foreground, backgroundColor: colors.surface, fontSize: 15,
              }}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 14, top: 14 }}>
              <Text>{showPassword ? "🙈" : "👁️"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Beni Hatırla */}
        <TouchableOpacity onPress={() => setRememberMe(!rememberMe)}
          style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{
            width: 22, height: 22, borderRadius: 6, borderWidth: 2,
            borderColor: rememberMe ? colors.primary : colors.border,
            backgroundColor: rememberMe ? colors.primary : "transparent",
            alignItems: "center", justifyContent: "center",
          }}>
            {rememberMe && <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>✓</Text>}
          </View>
          <Text style={{ color: colors.foreground }}>Beni hatırla</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogin}
          style={{ paddingVertical: 16, borderRadius: 12, alignItems: "center", backgroundColor: colors.primary, marginTop: 8 }}>
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Giriş Yap →</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setScreen("register")} style={{ alignItems: "center" }}>
          <Text style={{ color: colors.primary }}>Hesabınız yok mu? <Text style={{ fontWeight: "700" }}>Kayıt olun</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
