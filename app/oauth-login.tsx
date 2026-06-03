import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { NavigationHeader } from "@/components/navigation-header";
import { useColors } from "@/hooks/use-colors";
import { oauthService } from "@/lib/_core/oauth-service";

export default function OAuthLoginScreen() {
  const colors = useColors();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [linkedAccounts, setLinkedAccounts] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"login" | "link">("login");

  const handleSignInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const user = await oauthService.signInWithGoogle("mock-google-token");
      Alert.alert("Başarılı", `Google ile giriş yapıldı: ${user.email}`);
    } catch (error) {
      Alert.alert("Hata", "Google giriş başarısız");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInWithApple = async () => {
    setIsLoading(true);
    try {
      const user = await oauthService.signInWithApple("mock-apple-token");
      Alert.alert("Başarılı", `Apple ile giriş yapıldı: ${user.email}`);
    } catch (error) {
      Alert.alert("Hata", "Apple giriş başarısız");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInWithFacebook = async () => {
    setIsLoading(true);
    try {
      const user = await oauthService.signInWithFacebook("mock-facebook-token");
      Alert.alert("Başarılı", `Facebook ile giriş yapıldı: ${user.email}`);
    } catch (error) {
      Alert.alert("Hata", "Facebook giriş başarısız");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkGoogleAccount = async () => {
    try {
      const success = await oauthService.linkOAuthAccount("user-123", {
        id: "google-123",
        email: "user@gmail.com",
        name: "Google User",
        provider: "google",
        accessToken: "mock-token",
        expiresAt: Date.now() + 3600000,
      });

      if (success) {
        setLinkedAccounts([...linkedAccounts, "google"]);
        Alert.alert("Başarılı", "Google hesabı bağlandı");
      }
    } catch (error) {
      Alert.alert("Hata", "Google hesabı bağlanamadı");
    }
  };

  const handleLinkAppleAccount = async () => {
    try {
      const success = await oauthService.linkOAuthAccount("user-123", {
        id: "apple-123",
        email: "user@icloud.com",
        name: "Apple User",
        provider: "apple",
        accessToken: "mock-token",
        expiresAt: Date.now() + 3600000,
      });

      if (success) {
        setLinkedAccounts([...linkedAccounts, "apple"]);
        Alert.alert("Başarılı", "Apple hesabı bağlandı");
      }
    } catch (error) {
      Alert.alert("Hata", "Apple hesabı bağlanamadı");
    }
  };

  const handleLinkFacebookAccount = async () => {
    try {
      const success = await oauthService.linkOAuthAccount("user-123", {
        id: "facebook-123",
        email: "user@facebook.com",
        name: "Facebook User",
        provider: "facebook",
        accessToken: "mock-token",
        expiresAt: Date.now() + 5184000000,
      });

      if (success) {
        setLinkedAccounts([...linkedAccounts, "facebook"]);
        Alert.alert("Başarılı", "Facebook hesabı bağlandı");
      }
    } catch (error) {
      Alert.alert("Hata", "Facebook hesabı bağlanamadı");
    }
  };

  const handleUnlinkAccount = async (provider: string) => {
    try {
      const success = await oauthService.unlinkOAuthAccount(
        "user-123",
        provider as any
      );

      if (success) {
        setLinkedAccounts(linkedAccounts.filter((p) => p !== provider));
        Alert.alert("Başarılı", `${provider} hesabının bağlantısı kaldırıldı`);
      }
    } catch (error) {
      Alert.alert("Hata", "Bağlantı kaldırılamadı");
    }
  };

  return (
    <ScreenContainer>
      <NavigationHeader title="Sosyal Giriş" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Tab Seçimi */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 24 }}>
          {["login", "link"].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab as typeof activeTab)}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                backgroundColor:
                  activeTab === tab ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor:
                  activeTab === tab ? colors.primary : colors.border,
              }}
            >
              <Text
                style={{
                  color: activeTab === tab ? "#fff" : colors.foreground,
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                {tab === "login" ? "Giriş Yap" : "Hesap Bağla"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === "login" ? (
          <>
            {/* Giriş Formu */}
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  color: colors.foreground,
                  fontSize: 14,
                  fontWeight: "600",
                  marginBottom: 12,
                }}
              >
                Email Adresi
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="example@example.com"
                placeholderTextColor={colors.muted}
                keyboardType="email-address"
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  color: colors.foreground,
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginBottom: 12,
                }}
              />

              <Text
                style={{
                  color: colors.foreground,
                  fontSize: 14,
                  fontWeight: "600",
                  marginBottom: 12,
                }}
              >
                Şifre
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.muted}
                secureTextEntry
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  color: colors.foreground,
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginBottom: 12,
                }}
              />

              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
                  Giriş Yap
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sosyal Giriş Seçenekleri */}
            <View style={{ marginBottom: 24 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: colors.border,
                  }}
                />
                <Text
                  style={{
                    color: colors.muted,
                    marginHorizontal: 12,
                    fontSize: 12,
                  }}
                >
                  VEYA
                </Text>
                <View
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: colors.border,
                  }}
                />
              </View>

              <Text
                style={{
                  color: colors.foreground,
                  fontSize: 14,
                  fontWeight: "600",
                  marginBottom: 12,
                  textAlign: "center",
                }}
              >
                Sosyal Ağlarla Giriş Yap
              </Text>

              {/* Google Giriş */}
              <TouchableOpacity
                onPress={handleSignInWithGoogle}
                disabled={isLoading}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                <Text style={{ fontSize: 20, marginRight: 8 }}>🔵</Text>
                <Text style={{ color: colors.foreground, fontWeight: "600" }}>
                  Google ile Giriş Yap
                </Text>
              </TouchableOpacity>

              {/* Apple Giriş */}
              <TouchableOpacity
                onPress={handleSignInWithApple}
                disabled={isLoading}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                <Text style={{ fontSize: 20, marginRight: 8 }}>🍎</Text>
                <Text style={{ color: colors.foreground, fontWeight: "600" }}>
                  Apple ile Giriş Yap
                </Text>
              </TouchableOpacity>

              {/* Facebook Giriş */}
              <TouchableOpacity
                onPress={handleSignInWithFacebook}
                disabled={isLoading}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: colors.border,
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                <Text style={{ fontSize: 20, marginRight: 8 }}>f</Text>
                <Text style={{ color: colors.foreground, fontWeight: "600" }}>
                  Facebook ile Giriş Yap
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* Bağlı Hesaplar */}
            <Text
              style={{
                color: colors.foreground,
                fontSize: 16,
                fontWeight: "600",
                marginBottom: 16,
              }}
            >
              Bağlı Hesaplar
            </Text>

            {linkedAccounts.length > 0 ? (
              <View style={{ marginBottom: 24 }}>
                {linkedAccounts.map((provider) => (
                  <View
                    key={provider}
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 12,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text style={{ fontSize: 20, marginRight: 12 }}>
                        {provider === "google"
                          ? "🔵"
                          : provider === "apple"
                            ? "🍎"
                            : "f"}
                      </Text>
                      <View>
                        <Text
                          style={{
                            color: colors.foreground,
                            fontWeight: "600",
                            textTransform: "capitalize",
                          }}
                        >
                          {provider}
                        </Text>
                        <Text style={{ color: colors.muted, fontSize: 12 }}>
                          Bağlı
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleUnlinkAccount(provider)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                        backgroundColor: colors.error,
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 12,
                          fontWeight: "600",
                        }}
                      >
                        Bağlantıyı Kaldır
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 24,
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <Text style={{ color: colors.muted, textAlign: "center" }}>
                  Henüz bağlı hesap yok
                </Text>
              </View>
            )}

            {/* Bağlanabilir Hesaplar */}
            <Text
              style={{
                color: colors.foreground,
                fontSize: 16,
                fontWeight: "600",
                marginBottom: 16,
              }}
            >
              Hesap Bağla
            </Text>

            {!linkedAccounts.includes("google") && (
              <TouchableOpacity
                onPress={handleLinkGoogleAccount}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 20, marginRight: 8 }}>🔵</Text>
                <Text style={{ color: colors.foreground, fontWeight: "600" }}>
                  Google Hesabını Bağla
                </Text>
              </TouchableOpacity>
            )}

            {!linkedAccounts.includes("apple") && (
              <TouchableOpacity
                onPress={handleLinkAppleAccount}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 20, marginRight: 8 }}>🍎</Text>
                <Text style={{ color: colors.foreground, fontWeight: "600" }}>
                  Apple Hesabını Bağla
                </Text>
              </TouchableOpacity>
            )}

            {!linkedAccounts.includes("facebook") && (
              <TouchableOpacity
                onPress={handleLinkFacebookAccount}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 20, marginRight: 8 }}>f</Text>
                <Text style={{ color: colors.foreground, fontWeight: "600" }}>
                  Facebook Hesabını Bağla
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
