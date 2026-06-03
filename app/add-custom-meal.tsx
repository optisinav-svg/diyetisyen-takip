import { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { PrimaryButton, SecondaryButton } from '@/components/app-ui';
import { useAuth } from '@/hooks/use-auth';
import { trpc } from '@/lib/trpc';
import DateTimePicker from '@react-native-community/datetimepicker';

const PRESET_MEAL_TYPES = [
  { id: 'breakfast', label: '🌅 Kahvaltı', emoji: '🌅' },
  { id: 'lunch', label: '🍽️ Öğle Yemeği', emoji: '🍽️' },
  { id: 'dinner', label: '🌙 Akşam Yemeği', emoji: '🌙' },
  { id: 'snack', label: '🍎 Ara Öğün', emoji: '🍎' },
];

const COMMON_CUSTOM_MEALS = [
  'İkinci Kahvaltı',
  'Sabah Çayı',
  'Öğle Arası',
  'Öğleden Sonra Çayı',
  'Akşam Çayı',
  'Gece Atıştırması',
];

export default function AddCustomMealScreen() {
  const router = useRouter();
  const colors = useColors();
  const params = useLocalSearchParams<{ clientUserId?: string }>();
  const { user } = useAuth();
  const [selectedMealType, setSelectedMealType] = useState<string>('snack');
  const [customMealName, setCustomMealName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clientUserId = params.clientUserId ? parseInt(params.clientUserId) : user?.id || 0;

  // Create meal mutation
  const createMealMutation = trpc.meals.create.useMutation({
    onSuccess: () => {
      Alert.alert('Başarılı', 'Öğün başarıyla eklendi');
      router.back();
    },
    onError: (error) => {
      Alert.alert('Hata', 'Öğün eklenirken hata oluştu');
    },
  });

  const handleDateChange = (event: any, date?: Date) => {
    if (date) {
      setSelectedDate(date);
    }
    setShowDatePicker(false);
  };

  const handleTimeChange = (event: any, date?: Date) => {
    if (date) {
      setSelectedDate(date);
    }
    setShowTimePicker(false);
  };

  const handleAddMeal = async () => {
    if (!customMealName.trim() && selectedMealType === 'snack') {
      Alert.alert('Hata', 'Lütfen ara öğün adını girin');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Hata', 'Lütfen öğün açıklamasını girin');
      return;
    }

    setIsSubmitting(true);

    createMealMutation.mutate({
      mealType: selectedMealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
      customMealType: customMealName || undefined,
      eatenAt: selectedDate.toISOString(),
      description,
      status: 'planned',
    });
  };

  const handleSelectCustomMeal = (mealName: string) => {
    setCustomMealName(mealName);
    setSelectedMealType('snack');
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
        {/* Header */}
        <View className="gap-2">
          <Text className="text-2xl font-bold text-foreground">Öğün Ekle</Text>
          <Text className="text-sm leading-6 text-muted">Yeni bir öğün veya ara öğün ekleyin</Text>
        </View>

        {/* Meal Type Selection */}
        <View className="gap-3">
          <Text className="text-sm font-semibold text-foreground">Öğün Türü</Text>
          <View className="flex-row gap-2 flex-wrap">
            {PRESET_MEAL_TYPES.map((type) => (
              <Pressable
                key={type.id}
                onPress={() => {
                  setSelectedMealType(type.id);
                  setCustomMealName('');
                }}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.7 : 1,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 12,
                    backgroundColor: selectedMealType === type.id ? colors.primary : colors.surface,
                    borderWidth: 1,
                    borderColor: selectedMealType === type.id ? colors.primary : '#ccc',
                  },
                ]}
              >
                <Text
                  className={selectedMealType === type.id ? 'text-white font-semibold text-sm' : 'text-foreground font-semibold text-sm'}
                >
                  {type.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Custom Meal Name (if snack selected) */}
        {selectedMealType === 'snack' && (
          <View className="gap-3">
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Ara Öğün Adı</Text>
              <TextInput
                placeholder="Örn: İkinci Kahvaltı, Sabah Çayı"
                value={customMealName}
                onChangeText={setCustomMealName}
                className="border border-border rounded-lg p-3 text-foreground"
              />
            </View>

            {/* Common Custom Meals */}
            <View className="gap-2">
              <Text className="text-xs font-semibold text-muted uppercase">Sık Kullanılanlar</Text>
              <View className="flex-row gap-2 flex-wrap">
                {COMMON_CUSTOM_MEALS.map((meal) => (
                  <Pressable
                    key={meal}
                    onPress={() => handleSelectCustomMeal(meal)}
                    style={({ pressed }) => [
                      {
                        opacity: pressed ? 0.7 : 1,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 8,
                        backgroundColor: colors.surface,
                        borderWidth: 1,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text className="text-xs text-foreground font-medium">{meal}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Date and Time Selection */}
        <View className="gap-3">
          <Text className="text-sm font-semibold text-foreground">Tarih ve Saat</Text>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={({ pressed }) => [
                {
                  flex: 1,
                  opacity: pressed ? 0.7 : 1,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text className="text-sm text-foreground font-semibold">
                📅 {selectedDate.toLocaleDateString('tr-TR')}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setShowTimePicker(true)}
              style={({ pressed }) => [
                {
                  flex: 1,
                  opacity: pressed ? 0.7 : 1,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text className="text-sm text-foreground font-semibold">
                🕐 {selectedDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </Pressable>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </View>

        {/* Description */}
        <View className="gap-2">
          <Text className="text-sm font-semibold text-foreground">Açıklama</Text>
          <TextInput
            placeholder="Öğün içeriğini açıklayın (Örn: Elma, yoğurt, granola)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            className="border border-border rounded-lg p-3 text-foreground"
            textAlignVertical="top"
          />
        </View>

        {/* Info Card */}
        <View className="bg-primary/10 rounded-lg p-4 border border-primary gap-2">
          <Text className="text-xs font-semibold text-primary uppercase">💡 İpucu</Text>
          <Text className="text-xs leading-5 text-primary">
            Ara öğünler, diyetisyeninizin önerileri doğrultusunda ekleyebilirsiniz. Tüm öğünler otomatik olarak analiz edilir.
          </Text>
        </View>

        {/* Buttons */}
        <View className="gap-3">
          <PrimaryButton
            label={isSubmitting ? 'Ekleniyor...' : 'Öğün Ekle'}
            onPress={handleAddMeal}
            disabled={isSubmitting}
          />
          <SecondaryButton
            label="İptal"
            onPress={() => router.back()}
            disabled={isSubmitting}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
