import { ScrollView, Text, View, Switch, Pressable, Alert, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useState, useCallback, useEffect } from "react";
import { useColors } from "@/hooks/use-colors";
import * as BiometricLogin from "@/lib/_core/biometric-login";

export default function BiometricSettingsScreen() {
  const colors = useColors();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricLogin.BiometricType>("none");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Check biometric availability on mount
  useEffect(() => {
    checkBiometricStatus();
  }, []);

  const checkBiometricStatus = async () => {
    try {
      setIsLoading(true);
      const available = await BiometricLogin.isBiometricAvailable();
      setIsAvailable(available);

      if (available) {
        const type = await BiometricLogin.getBiometricType();
        setBiometricType(type);

        const enabled = await BiometricLogin.isBiometricLoginEnabled();
        setIsEnabled(enabled);
      }
    } catch (error) {
      console.error("Error checking biometric status:", error);
      Alert.alert("Error", "Failed to check biometric status");
    } finally {
      setIsLoading(false);
    }
  };

  // Enable biometric
  const handleEnable = useCallback(async () => {
    try {
      setIsSaving(true);
      const success = await BiometricLogin.enableBiometricLogin();
      if (success) {
        setIsEnabled(true);
        Alert.alert("Başarılı", "Biyometrik giriş etkinleştirildi");
      } else {
        Alert.alert("Hata", "Biyometrik giriş etkinleştirilemedi");
      }
    } catch (error) {
      console.error("Error enabling biometric:", error);
      Alert.alert("Hata", "Biyometrik giriş etkinleştirilirken hata oluştu");
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Disable biometric
  const handleDisable = useCallback(async () => {
    try {
      setIsSaving(true);
      const success = await BiometricLogin.disableBiometricLogin();
      if (success) {
        setIsEnabled(false);
        Alert.alert("Başarılı", "Biyometrik giriş devre dışı bırakıldı");
      } else {
        Alert.alert("Hata", "Biyometrik giriş devre dışı bırakılamadı");
      }
    } catch (error) {
      console.error("Error disabling biometric:", error);
      Alert.alert("Hata", "Biyometrik giriş devre dışı bırakılırken hata oluştu");
    } finally {
      setIsSaving(false);
    }
  }, []);

  const handleToggle = (value: boolean) => {
    if (value) {
      handleEnable();
    } else {
      handleDisable();
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!isAvailable) {
    return (
      <ScreenContainer className="p-4">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="gap-6">
            {/* Header */}
            <View>
              <Text className="text-2xl font-bold text-foreground mb-2">Biyometrik Doğrulama</Text>
              <Text className="text-sm text-muted">Face ID veya parmak izi ile hesabınızı güvenli hale getirin</Text>
            </View>

            {/* Not Available Message */}
            <View className="bg-warning/10 border border-warning rounded-lg p-4">
              <Text className="text-sm font-semibold text-warning mb-2">Kullanılamıyor</Text>
              <Text className="text-sm text-warning">
                Bu cihazda biyometrik doğrulama kullanılamıyor. Lütfen cihazınızda yüz tanıma veya parmak izi kaydı olduğundan emin olun.
              </Text>
            </View>

            {/* Info */}
            <View className="bg-surface rounded-lg p-4">
              <Text className="text-sm font-medium text-foreground mb-2">Biyometrik Doğrulama Nedir?</Text>
              <Text className="text-xs text-muted leading-relaxed">
                • Biyometrik verileriniz cihazınızda güvenli bir şekilde depolanır{"\n"}
                • Hiçbir zaman sunucumuza gönderilmez{"\n"}
                • Face ID veya parmak izi ile hızlı giriş yapabilirsiniz{"\n"}
                • Hesabınızı korumak için ek bir güvenlik katmanı sağlar
              </Text>
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View>
            <Text className="text-2xl font-bold text-foreground mb-2">Biyometrik Doğrulama</Text>
            <Text className="text-sm text-muted">
              {biometricType === "face" ? "Face ID" : "Parmak izi"} ile hesabınızı güvenli hale getirin
            </Text>
          </View>

          {/* Enable/Disable Toggle */}
          <View className="bg-surface rounded-lg p-4 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground">
                {biometricType === "face" ? "Face ID" : "Parmak İzi"} ile Giriş
              </Text>
              <Text className="text-sm text-muted mt-1">
                {biometricType === "face" 
                  ? "Yüzünüzle giriş yapın" 
                  : "Parmağınızla giriş yapın"}
              </Text>
            </View>
            <Switch
              value={isEnabled}
              onValueChange={handleToggle}
              disabled={isSaving}
            />
          </View>

          {/* Status Card */}
          {isEnabled && (
            <View className="bg-success/10 border border-success rounded-lg p-4">
              <Text className="text-sm font-semibold text-success mb-1">✓ Etkinleştirildi</Text>
              <Text className="text-sm text-success">
                Biyometrik giriş etkinleştirildi. Bir sonraki girişte kullanabilirsiniz.
              </Text>
            </View>
          )}

          {!isEnabled && (
            <View className="bg-muted/10 border border-muted rounded-lg p-4">
              <Text className="text-sm font-semibold text-muted mb-1">Devre Dışı</Text>
              <Text className="text-sm text-muted">
                Biyometrik giriş şu anda devre dışı. Etkinleştirmek için yukarıdaki anahtarı açın.
              </Text>
            </View>
          )}

          {/* Info */}
          <View className="bg-surface rounded-lg p-4">
            <Text className="text-sm font-medium text-foreground mb-2">Nasıl Çalışır?</Text>
            <Text className="text-xs text-muted leading-relaxed">
              • Biyometrik verileriniz cihazınızda güvenli bir şekilde depolanır{"\n"}
              • Hiçbir zaman sunucumuza gönderilmez{"\n"}
              • {biometricType === "face" ? "Face ID" : "Parmak izi"} ile hızlı giriş yapabilirsiniz{"\n"}
              • Hesabınızı korumak için ek bir güvenlik katmanı sağlar{"\n"}
              • İstediğiniz zaman devre dışı bırakabilirsiniz
            </Text>
          </View>

          {/* Security Info */}
          <View className="bg-primary/10 rounded-lg p-4 border border-primary">
            <Text className="text-xs font-semibold text-primary mb-2">🔒 Güvenlik Bilgisi</Text>
            <Text className="text-xs text-primary leading-relaxed">
              Biyometrik doğrulama, endüstri standardı şifreleme kullanarak korunur. Cihazınızın biyometrik donanımı tarafından işlenir ve asla ağ üzerinden iletilmez.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
