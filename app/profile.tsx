import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useEffect, useState } from "react";
import { getUserRegistration, saveUserRegistration, clearUserRegistration } from "@/lib/_core/user-registration";
import type { UserRegistration } from "@/lib/_core/user-registration";

export default function ProfileScreen() {
  const router = useRouter();
  const colors = useColors();
  const [user, setUser] = useState<UserRegistration | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await getUserRegistration();
      setUser(userData);
      if (userData) {
        setEditedName(userData.name);
        setEditedEmail(userData.email);
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editedName.trim() || !editedEmail.trim()) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurunuz");
      return;
    }

    if (!editedEmail.includes("@")) {
      Alert.alert("Hata", "Lütfen geçerli bir email adresi giriniz");
      return;
    }

    try {
      if (user) {
        const updatedUser = {
          ...user,
          name: editedName,
          email: editedEmail,
        };
        await saveUserRegistration(updatedUser);
        setUser(updatedUser);
        setIsEditing(false);
        Alert.alert("Başarılı", "Profil güncellendi");
      }
    } catch (error) {
      Alert.alert("Hata", "Profil güncellenirken bir hata oluştu");
      console.error(error);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Çıkış Yap", "Hesaptan çıkmak istediğinizden emin misiniz?", [
      { text: "İptal", onPress: () => {} },
      {
        text: "Çıkış Yap",
        onPress: async () => {
          try {
            await clearUserRegistration();
            router.replace("/");
          } catch (error) {
            Alert.alert("Hata", "Çıkış yapılırken bir hata oluştu");
            console.error(error);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <ScreenContainer className="p-6 justify-center items-center">
        <Text className="text-foreground">Yükleniyor...</Text>
      </ScreenContainer>
    );
  }

  if (!user) {
    return (
      <ScreenContainer className="p-6 justify-center items-center">
        <Text className="text-foreground mb-4">Kullanıcı bulunamadı</Text>
        <TouchableOpacity
          onPress={() => router.replace("/")}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 8,
            backgroundColor: colors.primary,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Giriş Yap</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <Text className="text-3xl font-bold text-foreground">👤 Profil</Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 6,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.foreground, fontWeight: "600" }}>← Geri</Text>
            </TouchableOpacity>
          </View>

          {/* Profile Card */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            {/* Role Badge */}
            <View
              style={{
                backgroundColor: user.role === "dietitian" ? "#FF6B6B" : "#339AF0",
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 20,
                alignSelf: "flex-start",
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {user.role === "dietitian" ? "👨‍⚕️ Diyetisyen" : "👤 Danışan"}
              </Text>
            </View>

            {/* Profile Info */}
            {isEditing ? (
              <View className="gap-4">
                {/* Name Edit */}
                <View>
                  <Text className="text-sm font-semibold text-foreground mb-2">Ad Soyad</Text>
                  <TextInput
                    value={editedName}
                    onChangeText={setEditedName}
                    placeholder="Ad soyad"
                    placeholderTextColor={colors.muted}
                    style={{
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 8,
                      padding: 10,
                      color: colors.foreground,
                      backgroundColor: colors.background,
                    }}
                  />
                </View>

                {/* Email Edit */}
                <View>
                  <Text className="text-sm font-semibold text-foreground mb-2">Email</Text>
                  <TextInput
                    value={editedEmail}
                    onChangeText={setEditedEmail}
                    placeholder="Email"
                    keyboardType="email-address"
                    placeholderTextColor={colors.muted}
                    style={{
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 8,
                      padding: 10,
                      color: colors.foreground,
                      backgroundColor: colors.background,
                    }}
                  />
                </View>

                {/* Save Button */}
                <TouchableOpacity
                  onPress={handleSaveProfile}
                  style={{
                    paddingVertical: 10,
                    borderRadius: 8,
                    backgroundColor: colors.primary,
                  }}
                >
                  <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>
                    Kaydet
                  </Text>
                </TouchableOpacity>

                {/* Cancel Button */}
                <TouchableOpacity
                  onPress={() => setIsEditing(false)}
                  style={{
                    paddingVertical: 10,
                    borderRadius: 8,
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ color: colors.foreground, textAlign: "center", fontWeight: "600" }}>
                    İptal
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="gap-4">
                {/* Name Display */}
                <View>
                  <Text className="text-xs text-muted mb-1">Ad Soyad</Text>
                  <Text className="text-lg font-semibold text-foreground">{user.name}</Text>
                </View>

                {/* Email Display */}
                <View>
                  <Text className="text-xs text-muted mb-1">Email</Text>
                  <Text className="text-lg font-semibold text-foreground">{user.email}</Text>
                </View>

                {/* Registered Date */}
                <View>
                  <Text className="text-xs text-muted mb-1">Kayıt Tarihi</Text>
                  <Text className="text-sm text-foreground">
                    {new Date(user.registeredAt).toLocaleDateString("tr-TR")}
                  </Text>
                </View>

                {/* Edit Button */}
                <TouchableOpacity
                  onPress={() => setIsEditing(true)}
                  style={{
                    paddingVertical: 10,
                    borderRadius: 8,
                    backgroundColor: colors.primary,
                  }}
                >
                  <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>
                    Profili Düzenle
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              paddingVertical: 12,
              borderRadius: 8,
              backgroundColor: "#FF6B6B",
            }}
          >
            <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>
              Çıkış Yap
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
