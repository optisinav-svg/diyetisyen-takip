import {
  ScrollView,
  Text,
  View,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useState } from 'react';
import { useColors } from '@/hooks/use-colors';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import {
  analyzeMealPhoto,
  getNutritionalRecommendations,
  formatNutritionalInfo,
  type MealAnalysisResult,
} from '@/lib/_core/meal-photo-analyzer';

export default function MealPhotoUploadScreen() {
  const colors = useColors();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MealAnalysisResult | null>(null);

  const mealTypes: Array<'breakfast' | 'lunch' | 'dinner' | 'snack'> = [
    'breakfast',
    'lunch',
    'dinner',
    'snack',
  ];

  const mealLabels: Record<string, string> = {
    breakfast: '🌅 Kahvaltı',
    lunch: '🍽️ Öğle Yemeği',
    dinner: '🌙 Akşam Yemeği',
    snack: '🍎 Ara Öğün',
  };

  const pickImage = async (source: 'camera' | 'library') => {
    try {
      let result;

      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      }

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        setAnalysisResult(null);
      }
    } catch (error) {
      Alert.alert('Hata', 'Fotoğraf seçilirken bir hata oluştu');
      console.error('Error picking image:', error);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      Alert.alert('Hata', 'Lütfen önce bir fotoğraf seçin');
      return;
    }

    try {
      setIsAnalyzing(true);
      const result = await analyzeMealPhoto(selectedImage, mealType);
      setAnalysisResult(result);
    } catch (error) {
      Alert.alert('Hata', 'Fotoğraf analiz edilirken bir hata oluştu');
      console.error('Error analyzing meal:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveMeal = () => {
    if (!analysisResult) {
      Alert.alert('Hata', 'Lütfen önce fotoğrafı analiz edin');
      return;
    }

    // Save meal with analysis result
    Alert.alert('Başarılı', 'Öğün kaydedildi', [
      {
        text: 'Tamam',
        onPress: () => router.back(),
      },
    ]);
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
        {/* Header */}
        <View className="gap-2">
          <Text className="text-3xl font-bold text-foreground">Öğün Fotoğrafı</Text>
          <Text className="text-sm leading-6 text-muted">
            Öğün fotoğrafını çekerek veya yükleyerek beslenme bilgisi alın
          </Text>
        </View>

        {/* Meal Type Selector */}
        <View className="gap-2">
          <Text className="text-sm font-semibold text-foreground">Öğün Türü</Text>
          <View className="flex-row gap-2 flex-wrap">
            {mealTypes.map((type) => (
              <Pressable
                key={type}
                onPress={() => setMealType(type)}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.7 : 1,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: mealType === type ? colors.primary : colors.surface,
                    borderWidth: 1,
                    borderColor: mealType === type ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  className={
                    mealType === type
                      ? 'text-white font-semibold text-sm'
                      : 'text-foreground font-semibold text-sm'
                  }
                >
                  {mealLabels[type]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Image Preview */}
        {selectedImage ? (
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Seçilen Fotoğraf</Text>
            <View className="bg-surface rounded-lg overflow-hidden border border-border">
              <Image
                source={{ uri: selectedImage }}
                style={{ width: '100%', height: 300 }}
                resizeMode="cover"
              />
            </View>
          </View>
        ) : (
          <View className="bg-surface rounded-lg p-8 border-2 border-dashed border-border items-center justify-center">
            <Text className="text-4xl mb-2">📸</Text>
            <Text className="text-foreground font-semibold text-center">Fotoğraf Seçilmedi</Text>
            <Text className="text-muted text-center text-xs mt-1">
              Aşağıdaki butonlardan birini kullanarak fotoğraf seçin
            </Text>
          </View>
        )}

        {/* Image Picker Buttons */}
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => pickImage('camera')}
            style={({ pressed }) => [
              {
                flex: 1,
                opacity: pressed ? 0.7 : 1,
                paddingHorizontal: 12,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: colors.primary,
              },
            ]}
          >
            <Text className="text-white font-semibold text-center">📷 Çek</Text>
          </Pressable>

          <Pressable
            onPress={() => pickImage('library')}
            style={({ pressed }) => [
              {
                flex: 1,
                opacity: pressed ? 0.7 : 1,
                paddingHorizontal: 12,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              },
            ]}
          >
            <Text className="text-foreground font-semibold text-center">🖼️ Seç</Text>
          </Pressable>
        </View>

        {/* Analyze Button */}
        <Pressable
          onPress={handleAnalyze}
          disabled={!selectedImage || isAnalyzing}
          style={({ pressed }) => [
            {
              opacity: pressed || !selectedImage || isAnalyzing ? 0.7 : 1,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 8,
              backgroundColor: colors.primary,
              alignItems: 'center',
            },
          ]}
        >
          {isAnalyzing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold">🤖 Analiz Et</Text>
          )}
        </Pressable>

        {/* Analysis Result */}
        {analysisResult && (
          <View className="gap-3">
            {/* Nutritional Summary */}
            <View className="bg-surface rounded-lg p-4 border border-border">
              <Text className="text-sm font-semibold text-foreground mb-3">Beslenme Bilgisi</Text>

              {/* Macros Grid */}
              <View className="flex-row gap-2 mb-3">
                <View className="flex-1 bg-background rounded p-3">
                  <Text className="text-xs text-muted">Kalori</Text>
                  <Text className="text-lg font-bold text-primary">
                    {Math.round(analysisResult.totalCalories)}
                  </Text>
                  <Text className="text-xs text-muted">kcal</Text>
                </View>

                <View className="flex-1 bg-background rounded p-3">
                  <Text className="text-xs text-muted">Protein</Text>
                  <Text className="text-lg font-bold text-primary">
                    {Math.round(analysisResult.totalProtein)}
                  </Text>
                  <Text className="text-xs text-muted">g</Text>
                </View>

                <View className="flex-1 bg-background rounded p-3">
                  <Text className="text-xs text-muted">Karbohidrat</Text>
                  <Text className="text-lg font-bold text-primary">
                    {Math.round(analysisResult.totalCarbs)}
                  </Text>
                  <Text className="text-xs text-muted">g</Text>
                </View>

                <View className="flex-1 bg-background rounded p-3">
                  <Text className="text-xs text-muted">Yağ</Text>
                  <Text className="text-lg font-bold text-primary">
                    {Math.round(analysisResult.totalFat)}
                  </Text>
                  <Text className="text-xs text-muted">g</Text>
                </View>
              </View>

              {/* Confidence */}
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-muted">Analiz Güveni</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {Math.round(analysisResult.confidence * 100)}%
                </Text>
              </View>
            </View>

            {/* Food Items */}
            <View className="bg-surface rounded-lg p-4 border border-border">
              <Text className="text-sm font-semibold text-foreground mb-3">Tanımlanan Yiyecekler</Text>

              {analysisResult.foods.map((food, index) => (
                <View
                  key={index}
                  className="pb-3 mb-3 border-b border-border last:border-b-0 last:pb-0 last:mb-0"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-foreground">{food.name}</Text>
                      <Text className="text-xs text-muted">{food.portion}</Text>
                    </View>
                    <Text className="text-xs font-semibold text-primary">
                      {Math.round(food.calories)} kcal
                    </Text>
                  </View>

                  <View className="flex-row gap-2 text-xs">
                    <Text className="text-muted">P: {Math.round(food.protein)}g</Text>
                    <Text className="text-muted">C: {Math.round(food.carbs)}g</Text>
                    <Text className="text-muted">Y: {Math.round(food.fat)}g</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Recommendations */}
            {analysisResult.suggestions.length > 0 && (
              <View className="bg-primary/10 rounded-lg p-4 border border-primary gap-2">
                <Text className="text-xs font-semibold text-primary uppercase">💡 Öneriler</Text>
                {analysisResult.suggestions.map((suggestion, index) => (
                  <Text key={index} className="text-xs leading-5 text-primary">
                    • {suggestion}
                  </Text>
                ))}
              </View>
            )}

            {/* Save Button */}
            <Pressable
              onPress={handleSaveMeal}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                },
              ]}
            >
              <Text className="text-white font-semibold">✓ Öğünü Kaydet</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
