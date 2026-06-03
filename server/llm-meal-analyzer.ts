import axios from 'axios';

/**
 * LLM-based Meal Analyzer
 * Uses backend LLM to analyze meal photos and extract nutritional information
 */

export interface MealAnalysisRequest {
  base64Image: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  userId: number;
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

export interface MealAnalysisResponse {
  mealType: string;
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  confidence: number;
  suggestions: string[];
  timestamp: string;
}

/**
 * Analyze meal photo using backend LLM
 */
export async function analyzeMealPhotoWithLLM(
  request: MealAnalysisRequest
): Promise<MealAnalysisResponse> {
  try {
    // Call backend LLM API for meal analysis
    // The LLM will analyze the image and extract nutritional information
    const response = await callBackendLLMAPI(request);

    console.log('[LLMAnalyzer] Meal analysis completed');
    return response;
  } catch (error) {
    console.error('[LLMAnalyzer] Error analyzing meal photo:', error);
    throw error;
  }
}

/**
 * Call backend LLM API
 * This would be implemented in the backend to use the multimodal LLM
 */
async function callBackendLLMAPI(request: MealAnalysisRequest): Promise<MealAnalysisResponse> {
  try {
    // In production, this would call the backend endpoint that uses the LLM
    // POST /api/llm/analyze-meal with the base64 image

    const prompt = `
Analyze this meal photo and extract nutritional information.
Meal Type: ${request.mealType}

Please provide:
1. List of identified foods with portions
2. Estimated nutritional values (calories, protein, carbs, fat)
3. Confidence level for each item (0-1)
4. Healthy eating suggestions

Return as JSON with this structure:
{
  "foods": [
    {
      "name": "food name",
      "portion": "portion size",
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "confidence": number
    }
  ],
  "suggestions": ["suggestion1", "suggestion2"]
}
    `;

    // For now, return mock data
    // In production, this would call the actual LLM API
    const mockResponse: MealAnalysisResponse = getMockAnalysisResponse(request.mealType);

    return mockResponse;
  } catch (error) {
    console.error('[LLMAnalyzer] Error calling LLM API:', error);
    throw error;
  }
}

/**
 * Get mock analysis response based on meal type
 */
function getMockAnalysisResponse(mealType: string): MealAnalysisResponse {
  const responses: Record<string, MealAnalysisResponse> = {
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
      timestamp: new Date().toISOString(),
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
      timestamp: new Date().toISOString(),
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
      timestamp: new Date().toISOString(),
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
      timestamp: new Date().toISOString(),
    },
  };

  return responses[mealType] || responses.lunch;
}

/**
 * Validate meal analysis response
 */
export function validateMealAnalysis(analysis: MealAnalysisResponse): boolean {
  if (!analysis.foods || analysis.foods.length === 0) {
    return false;
  }

  if (analysis.totalCalories < 0 || analysis.totalProtein < 0 || analysis.totalCarbs < 0 || analysis.totalFat < 0) {
    return false;
  }

  if (analysis.confidence < 0 || analysis.confidence > 1) {
    return false;
  }

  return true;
}

/**
 * Get nutritional recommendations based on analysis
 */
export function getNutritionalRecommendations(analysis: MealAnalysisResponse): string[] {
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
