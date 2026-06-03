import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useColors } from "@/hooks/use-colors";
import { saveUserRegistration } from "@/lib/_core/user-registration";

export default function RegisterScreen() {
  const router = useRouter();
  const colors = useColors();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"dietitian" | "client">("client");

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurunuz");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Hata", "Lütfen geçerli bir email adresi giriniz");
      return;
    }

    try {
      await saveUserRegistration({
        name: fullName,
        email,
        password,
        role,
        registeredAt: new Date().toISOString(),
      });
      Alert.alert("Başarılı", "Kayıt tamamlandı");
      router.push("/features-menu");
    } catch (error) {
      Alert.alert("Hata", "Kayıt sırasında bir hata oluştu");
      console.error(error);
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center gap-6">
          {/* Header */}
          <View className="items-center gap-2 mb-4">
            <Text className="text-4xl font-bold text-foreground">Diyetisyen Takip</Text>
            <Text className="text-base text-muted text-center">Sağlık ve beslenme yönetimi uygulaması</Text>
          </View>

          {/* Form */}
          <View className="gap-4">
            {/* Ad Soyad */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Ad Soyad</Text>
              <TextInput
                placeholder="Adınızı ve soyadınızı girin"
                value={fullName}
                onChangeText={setFullName}
                placeholderTextColor={colors.muted}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  padding: 12,
                  color: colors.foreground,
                  backgroundColor: colors.surface,
                  fontFamily: "System",
                }}
              />
            </View>

            {/* Email */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Email</Text>
              <TextInput
                placeholder="Email adresinizi girin"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholderTextColor={colors.muted}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  padding: 12,
                  color: colors.foreground,
                  backgroundColor: colors.surface,
                  fontFamily: "System",
                }}
              />
            </View>

            {/* Şifre */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Şifre</Text>
              <TextInput
                placeholder="Şifre oluşturun"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor={colors.muted}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  padding: 12,
                  color: colors.foreground,
                  backgroundColor: colors.surface,
                  fontFamily: "System",
                }}
              />
            </View>

            {/* Rol Seçimi */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Rol Seçin</Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setRole("client")}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: role === "client" ? colors.primary : colors.border,
                    backgroundColor: role === "client" ? colors.primary : colors.surface,
                  }}
                >
                  <Text
                    style={{
                      color: role === "client" ? "#fff" : colors.foreground,
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    Danışan
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setRole("dietitian")}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: role === "dietitian" ? colors.primary : colors.border,
                    backgroundColor: role === "dietitian" ? colors.primary : colors.surface,
                  }}
                >
                  <Text
                    style={{
                      color: role === "dietitian" ? "#fff" : colors.foreground,
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    Diyetisyen
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Kayıt Butonu */}
            <TouchableOpacity
              onPress={handleRegister}
              style={{
                paddingVertical: 14,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: colors.primary,
                marginTop: 8,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  textAlign: "center",
                  fontWeight: "600",
                  fontSize: 16,
                }}
              >
                Kayıt Ol ve Devam Et
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="items-center mt-4">
            <Text className="text-xs text-muted">
              Hesabınız oluşturulduktan sonra tüm özelliklere erişebileceksiniz.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
