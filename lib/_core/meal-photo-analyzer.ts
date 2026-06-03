/**
 * Meal Photo Analyzer
 * Analyzes meal photos and extracts nutritional information
 */

export interface MealAnalysisResult {
  mealType: string;
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  confidence: number;
  suggestions: string[];
}

export interface FoodItem {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
}

/**
 * Analyze meal photo using AI
 * In production, this would call the backend LLM API
 */
export async function analyzeMealPhoto(
  photoUri: string,
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
): Promise<MealAnalysisResult> {
  try {
    // Convert image to base64 for API submission
    const base64Image = await getBase64FromUri(photoUri);

    // Call backend LLM API for meal analysis
    const result = await callMealAnalysisAPI(base64Image, mealType);

    console.log('[MealAnalyzer] Meal analysis completed');
    return result;
  } catch (error) {
    console.error('[MealAnalyzer] Error analyzing meal photo:', error);
    throw error;
  }
}

/**
 * Get base64 from image URI
 */
async function getBase64FromUri(uri: string): Promise<string> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('[MealAnalyzer] Error converting URI to base64:', error);
    throw error;
  }
}

/**
 * Call backend LLM API for meal analysis
 * This would be implemented in the backend
 */
async function callMealAnalysisAPI(
  base64Image: string,
  mealType: string
): Promise<MealAnalysisResult> {
  try {
    // In production, this would call the backend endpoint
    // POST /api/meal-analysis with the image and meal type
    // The backend would use the LLM to analyze the image

    // For now, return mock data
    const mockResults: Record<string, MealAnalysisResult> = {
      breakfast: {
        mealType: 'breakfast',
        foods: [
          {
            name: 'Yumurta (2 adet)',
            portion: '100g',
            calories: 155,
            protein: 13,
            carbs: 1.1,
            fat: 11,
            confidence: 0.95,
          },
          {
            name: 'Ekmek (2 dilim)',
            portion: '60g',
            calories: 160,
            protein: 5,
            carbs: 30,
            fat: 1,
            confidence: 0.9,
          },
          {
            name: 'Tereyağ',
            portion: '10g',
            calories: 72,
            protein: 0.1,
            carbs: 0,
            fat: 8,
            confidence: 0.85,
          },
        ],
        totalCalories: 387,
        totalProtein: 18.1,
        totalCarbs: 31.1,
        totalFat: 20,
        confidence: 0.9,
        suggestions: [
          'Kahvaltınız protein açısından iyi dengeli',
          'Daha fazla sebze ekleyebilirsiniz',
          'Tam buğday ekmek tercih etmeyi düşünün',
        ],
      },
      lunch: {
        mealType: 'lunch',
        foods: [
          {
            name: 'Tavuk göğsü',
            portion: '150g',
            calories: 165,
            protein: 31,
            carbs: 0,
            fat: 3.6,
            confidence: 0.92,
          },
          {
            name: 'Pirinç (pişmiş)',
            portion: '150g',
            calories: 195,
            protein: 4.3,
            carbs: 43,
            fat: 0.3,
            confidence: 0.88,
          },
          {
            name: 'Brokoli',
            portion: '100g',
            calories: 34,
            protein: 2.8,
            carbs: 7,
            fat: 0.4,
            confidence: 0.9,
          },
        ],
        totalCalories: 394,
        totalProtein: 38.1,
        totalCarbs: 50,
        totalFat: 4.3,
        confidence: 0.9,
        suggestions: [
          'Öğleyin yeterli protein alıyorsunuz',
          'Daha fazla sebze ekleyebilirsiniz',
          'Sağlıklı bir öğün seçimi',
        ],
      },
      dinner: {
        mealType: 'dinner',
        foods: [
          {
            name: 'Balık (Somon)',
            portion: '120g',
            calories: 206,
            protein: 22,
            carbs: 0,
            fat: 13,
            confidence: 0.88,
          },
          {
            name: 'Tatlı patates',
            portion: '150g',
            calories: 103,
            protein: 1.6,
            carbs: 24,
            fat: 0.1,
            confidence: 0.85,
          },
          {
            name: 'Yeşil salata',
            portion: '100g',
            calories: 15,
            protein: 1.2,
            carbs: 3,
            fat: 0.2,
            confidence: 0.92,
          },
        ],
        totalCalories: 324,
        totalProtein: 24.8,
        totalCarbs: 27,
        totalFat: 13.3,
        confidence: 0.88,
        suggestions: [
          'Omega-3 açısından zengin bir seçim',
          'Akşam yemeği için ideal kalori miktarı',
          'Lif açısından daha fazla sebze ekleyebilirsiniz',
        ],
      },
      snack: {
        mealType: 'snack',
        foods: [
          {
            name: 'Elma',
            portion: '150g',
            calories: 81,
            protein: 0.3,
            carbs: 21,
            fat: 0.3,
            confidence: 0.95,
          },
          {
            name: 'Badem',
            portion: '30g',
            calories: 164,
            protein: 6,
            carbs: 6,
            fat: 14,
            confidence: 0.9,
          },
        ],
        totalCalories: 245,
        totalProtein: 6.3,
        totalCarbs: 27,
        totalFat: 14.3,
        confidence: 0.92,
        suggestions: [
          'Sağlıklı bir ara öğün seçimi',
          'Protein ve lif açısından dengeli',
          'Doğal besinler tercih ettiğiniz için iyi',
        ],
      },
    };

    return mockResults[mealType] || mockResults.lunch;
  } catch (error) {
    console.error('[MealAnalyzer] Error calling meal analysis API:', error);
    throw error;
  }
}

/**
 * Get nutritional recommendations based on analysis
 */
export function getNutritionalRecommendations(analysis: MealAnalysisResult): string[] {
  const recommendations: string[] = [];

  // Calorie recommendations
  if (analysis.totalCalories > 800) {
    recommendations.push('Bu öğün yüksek kalorili. Porsiyon kontrolünü düşünün.');
  } else if (analysis.totalCalories < 200) {
    recommendations.push('Bu öğün düşük kalorili. Daha fazla besin ekleyebilirsiniz.');
  }

  // Protein recommendations
  if (analysis.totalProtein < 10) {
    recommendations.push('Protein miktarını artırmayı düşünün.');
  }

  // Carb recommendations
  if (analysis.totalCarbs > 100) {
    recommendations.push('Karbohidrat miktarını azaltmayı düşünün.');
  }

  // Fat recommendations
  if (analysis.totalFat > 50) {
    recommendations.push('Yağ miktarını azaltmayı düşünün.');
  }

  return recommendations.length > 0 ? recommendations : ['Dengeli bir öğün seçimi!'];
}

/**
 * Format nutritional info for display
 */
export function formatNutritionalInfo(analysis: MealAnalysisResult): string {
  return `
Kalori: ${Math.round(analysis.totalCalories)} kcal
Protein: ${Math.round(analysis.totalProtein)}g
Karbohidrat: ${Math.round(analysis.totalCarbs)}g
Yağ: ${Math.round(analysis.totalFat)}g
Güven: ${Math.round(analysis.confidence * 100)}%
  `.trim();
}
