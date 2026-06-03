import { ScrollView, Text, View, Switch, Pressable, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useState, useEffect } from 'react';
import { useColors } from '@/hooks/use-colors';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreferences,
} from '@/lib/_core/notification-token-manager';

interface PreferenceItem {
  key: keyof NotificationPreferences;
  label: string;
  description: string;
  icon: string;
}

const PREFERENCE_ITEMS: PreferenceItem[] = [
  {
    key: 'mealReminders',
    label: 'Öğün Hatırlatmaları',
    description: 'Öğün zamanlarında bildirim alın',
    icon: '🍽️',
  },
  {
    key: 'appointmentReminders',
    label: 'Randevu Hatırlatmaları',
    description: 'Diyetisyen randevularından önce bildirim alın',
    icon: '📅',
  },
  {
    key: 'healthAlerts',
    label: 'Sağlık Uyarıları',
    description: 'Sağlık hedefleriniz hakkında uyarılar alın',
    icon: '💪',
  },
  {
    key: 'twoFactorAlerts',
    label: '2FA Uyarıları',
    description: 'İki faktörlü kimlik doğrulama uyarıları',
    icon: '🔒',
  },
  {
    key: 'dietitianMessages',
    label: 'Diyetisyen Mesajları',
    description: 'Diyetisyeninizden gelen mesajları alın',
    icon: '💬',
  },
  {
    key: 'weeklyReports',
    label: 'Haftalık Raporlar',
    description: 'Haftalık sağlık raporlarını alın',
    icon: '📊',
  },
];

export default function NotificationPreferencesScreen() {
  const colors = useColors();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const prefs = await getNotificationPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (key: keyof NotificationPreferences) => {
    if (!preferences) return;

    try {
      setIsSaving(true);
      const updatedPrefs = {
        ...preferences,
        [key]: !preferences[key],
      };

      await updateNotificationPreferences(updatedPrefs);
      setPreferences(updatedPrefs);
    } catch (error) {
      console.error('Error updating preference:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnableAll = async () => {
    if (!preferences) return;

    try {
      setIsSaving(true);
      const allEnabled: NotificationPreferences = {
        mealReminders: true,
        appointmentReminders: true,
        healthAlerts: true,
        twoFactorAlerts: true,
        dietitianMessages: true,
        weeklyReports: true,
      };

      await updateNotificationPreferences(allEnabled);
      setPreferences(allEnabled);
    } catch (error) {
      console.error('Error enabling all:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisableAll = async () => {
    if (!preferences) return;

    try {
      setIsSaving(true);
      const allDisabled: NotificationPreferences = {
        mealReminders: false,
        appointmentReminders: false,
        healthAlerts: false,
        twoFactorAlerts: false,
        dietitianMessages: false,
        weeklyReports: false,
      };

      await updateNotificationPreferences(allDisabled);
      setPreferences(allDisabled);
    } catch (error) {
      console.error('Error disabling all:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer className="p-4 justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!preferences) {
    return (
      <ScreenContainer className="p-4 justify-center items-center">
        <Text className="text-foreground">Tercihler yüklenemedi</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
        {/* Header */}
        <View className="gap-2">
          <Text className="text-3xl font-bold text-foreground">Bildirim Tercihleri</Text>
          <Text className="text-sm leading-6 text-muted">
            Hangi bildirimleri almak istediğinizi seçin
          </Text>
        </View>

        {/* Quick Actions */}
        <View className="flex-row gap-2">
          <Pressable
            disabled={isSaving}
            onPress={handleEnableAll}
            style={({ pressed }) => [
              {
                flex: 1,
                opacity: pressed || isSaving ? 0.7 : 1,
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: colors.primary,
              },
            ]}
          >
            <Text className="text-white font-semibold text-sm text-center">Tümünü Aç</Text>
          </Pressable>

          <Pressable
            disabled={isSaving}
            onPress={handleDisableAll}
            style={({ pressed }) => [
              {
                flex: 1,
                opacity: pressed || isSaving ? 0.7 : 1,
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              },
            ]}
          >
            <Text className="text-foreground font-semibold text-sm text-center">Tümünü Kapat</Text>
          </Pressable>
        </View>

        {/* Preferences List */}
        <View className="gap-3">
          {PREFERENCE_ITEMS.map((item) => (
            <View
              key={item.key}
              className="bg-surface rounded-lg p-4 flex-row items-center justify-between border border-border"
            >
              <View className="flex-1 gap-1">
                <View className="flex-row items-center gap-2">
                  <Text className="text-lg">{item.icon}</Text>
                  <Text className="text-base font-semibold text-foreground">{item.label}</Text>
                </View>
                <Text className="text-xs text-muted leading-5">{item.description}</Text>
              </View>

              <Switch
                value={preferences[item.key]}
                onValueChange={() => handleToggle(item.key)}
                disabled={isSaving}
                trackColor={{ false: colors.border, true: colors.primary + '80' }}
                thumbColor={preferences[item.key] ? colors.primary : colors.muted}
              />
            </View>
          ))}
        </View>

        {/* Info Card */}
        <View className="bg-primary/10 rounded-lg p-4 border border-primary gap-2">
          <Text className="text-xs font-semibold text-primary uppercase">ℹ️ Bilgi</Text>
          <Text className="text-xs leading-5 text-primary">
            Kritik bildirimler (2FA uyarıları) her zaman gönderilir. Diğer bildirimleri tercihlerinize göre özelleştirebilirsiniz.
          </Text>
        </View>

        {/* Privacy Notice */}
        <View className="bg-background rounded-lg p-4 border border-border gap-2">
          <Text className="text-xs font-semibold text-foreground uppercase">🔐 Gizlilik</Text>
          <Text className="text-xs leading-5 text-muted">
            Bildirim tercihleri cihazınızda yerel olarak saklanır. Sunucuya gönderilen veriler şifreli ve güvenlidir.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
