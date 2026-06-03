import { ScreenContainer } from '@/components/screen-container';
import { testLogin, getTestUsers } from '@/lib/_core/test-auth';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function TestLoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen email ve şifre girin');
      return;
    }

    setLoading(true);
    try {
      await testLogin(email, password);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Giriş Başarısız', error instanceof Error ? error.message : 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  };

  const testUsers = getTestUsers();

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-6">
        <View className="flex-1 justify-center gap-6">
          {/* Header */}
          <View className="items-center gap-2 mb-8">
            <Text className="text-4xl font-bold text-foreground">Diyetisyen Takip</Text>
            <Text className="text-base text-muted">Test Giriş Sistemi</Text>
          </View>

          {/* Email Input */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">E-posta</Text>
            <TextInput
              className="border border-border rounded-lg px-4 py-3 bg-surface text-foreground"
              placeholder="E-posta adresinizi girin"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Input */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Şifre</Text>
            <View className="flex-row items-center border border-border rounded-lg bg-surface px-4 py-3">
              <TextInput
                className="flex-1 text-foreground"
                placeholder="Şifrenizi girin"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                editable={!loading}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                <Text className="text-primary font-semibold">
                  {showPassword ? 'Gizle' : 'Göster'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            className="bg-primary rounded-lg py-4 items-center"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">Giriş Yap</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center gap-3 my-4">
            <View className="flex-1 h-px bg-border" />
            <Text className="text-muted text-sm">Test Hesapları</Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          {/* Test Users */}
          <View className="gap-3">
            {testUsers.map((user) => (
              <TouchableOpacity
                key={user.id}
                className="border border-border rounded-lg p-4 bg-surface"
                onPress={() => {
                  setEmail(user.email);
                  setPassword(user.password || 'password123');
                }}
              >
                <View className="gap-1">
                  <Text className="font-semibold text-foreground">{user.name}</Text>
                  <Text className="text-sm text-muted">{user.email}</Text>
                  <View className="flex-row gap-2 mt-2">
                    <View className="bg-primary/20 rounded px-2 py-1">
                      <Text className="text-xs text-primary font-semibold">
                        {user.role === 'dietitian' ? 'Diyetisyen' : 'Danışan'}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Info Box */}
          <View className="bg-warning/10 border border-warning rounded-lg p-4 mt-4">
            <Text className="text-sm text-foreground font-semibold mb-2">ℹ️ Test Bilgisi</Text>
            <Text className="text-xs text-foreground leading-5">
              Bu, geliştirme amaçlı test giriş ekranıdır. Yukarıdaki test hesaplarından birini
              seçerek veya manuel olarak giriş yapabilirsiniz.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
