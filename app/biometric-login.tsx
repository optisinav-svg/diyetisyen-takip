import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { PrimaryButton, SecondaryButton } from '@/components/app-ui';
import * as BiometricLogin from '@/lib/_core/biometric-login';
import * as Auth from '@/lib/_core/auth';

export default function BiometricLoginScreen() {
  const router = useRouter();
  const colors = useColors();
  const [biometricType, setBiometricType] = useState<BiometricLogin.BiometricType>('none');
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const available = await BiometricLogin.isBiometricAvailable();
      setIsAvailable(available);

      if (available) {
        const type = await BiometricLogin.getBiometricType();
        setBiometricType(type);
      }
    } catch (err) {
      console.error('Error checking biometric availability:', err);
      setError('Biyometrik doğrulama kontrol edilemedi');
    }
  };

  const handleBiometricLogin = async () => {
    try {
      setIsAuthenticating(true);
      setError(null);

      const result = await BiometricLogin.quickBiometricLogin();

      if (result.success) {
        // Biometric auth successful, navigate to home
        router.replace('/(tabs)');
      } else if (result.error === 'user_cancel') {
        // User cancelled, do nothing
        setIsAuthenticating(false);
      } else {
        setError(result.error || 'Biyometrik doğrulama başarısız oldu');
        setIsAuthenticating(false);
      }
    } catch (err) {
      console.error('Biometric login error:', err);
      setError('Biyometrik doğrulama sırasında hata oluştu');
      setIsAuthenticating(false);
    }
  };

  const handleSkip = () => {
    // Go back to profile screen or home
    router.back();
  };

  const getButtonLabel = () => {
    if (biometricType === 'face') {
      return 'Yüzle Giriş Yap';
    }
    if (biometricType === 'fingerprint') {
      return 'Parmakla Giriş Yap';
    }
    return 'Biyometrik Giriş';
  };

  const getIcon = () => {
    if (biometricType === 'face') {
      return '👤';
    }
    if (biometricType === 'fingerprint') {
      return '👆';
    }
    return '🔐';
  };

  if (!isAvailable) {
    return (
      <ScreenContainer className="p-6 justify-center">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <View className="gap-6 items-center">
            <Text className="text-4xl">🔐</Text>
            <View className="gap-2">
              <Text className="text-2xl font-bold text-foreground text-center">
                Biyometrik Giriş Kullanılamıyor
              </Text>
              <Text className="text-sm leading-6 text-muted text-center">
                Bu cihazda yüz tanıma veya parmak izi kaydı bulunamadı.
              </Text>
            </View>
            <SecondaryButton label="Geri Dön" onPress={handleSkip} />
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6 justify-center">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View className="gap-8 items-center">
          {/* Icon */}
          <View className="gap-4 items-center">
            <Text className="text-6xl">{getIcon()}</Text>
            <View className="gap-2">
              <Text className="text-2xl font-bold text-foreground text-center">
                Biyometrik Doğrulama
              </Text>
              <Text className="text-sm leading-6 text-muted text-center">
                Hesabınıza erişmek için {biometricType === 'face' ? 'yüzünüzü' : 'parmağınızı'} tarayın.
              </Text>
            </View>
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-error/10 border border-error rounded-lg p-4 w-full">
              <Text className="text-sm text-error">{error}</Text>
            </View>
          )}

          {/* Loading State */}
          {isAuthenticating && (
            <View className="gap-4 items-center">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="text-sm text-muted">Doğrulanıyor...</Text>
            </View>
          )}

          {/* Buttons */}
          {!isAuthenticating && (
            <View className="w-full gap-3">
              <PrimaryButton
                label={getButtonLabel()}
                onPress={handleBiometricLogin}
                disabled={isAuthenticating}
              />
              <SecondaryButton
                label="Geri Dön"
                onPress={handleSkip}
                disabled={isAuthenticating}
              />
            </View>
          )}

          {/* Info Card */}
          <View className="bg-surface rounded-lg p-4 w-full gap-2">
            <Text className="text-xs font-semibold text-foreground uppercase">Güvenlik Bilgisi</Text>
            <Text className="text-xs leading-5 text-muted">
              Biyometrik doğrulama, cihazınızda güvenli bir şekilde depolanır ve hiçbir zaman sunucuya gönderilmez.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
