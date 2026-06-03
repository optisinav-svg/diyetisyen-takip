/**
 * AI Meal Recognition Service
 * Advanced meal photo analysis using multimodal LLM
 * Supports batch processing, confidence scoring, and user corrections
 */

export interface MealRecognitionResult {
  id: string;
  imageUri: string;
  detectedFoods: DetectedFood[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  confidence: number;
  timestamp: number;
  userApproved: boolean;
  corrections?: UserCorrection[];
}

export interface DetectedFood {
  id: string;
  name: string;
  portion: string;
  portionSize: number;
  portionUnit: "g" | "ml" | "piece" | "cup" | "tbsp";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  confidence: number;
  imageRegion?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface UserCorrection {
  foodId: string;
  originalName: string;
  correctedName: string;
  originalPortion: string;
  correctedPortion: string;
  timestamp: number;
}

export interface BatchMealAnalysis {
  batchId: string;
  imageUris: string[];
  results: MealRecognitionResult[];
  processedCount: number;
  totalCount: number;
  status: "pending" | "processing" | "completed" | "failed";
  startTime: number;
  endTime?: number;
}

/**
 * AI Meal Recognition Service
 */
export class AIMealRecognitionService {
  private static instance: AIMealRecognitionService;
  private recognitionHistory: Map<string, MealRecognitionResult> = new Map();
  private batchProcessing: Map<string, BatchMealAnalysis> = new Map();

  private constructor() {}

  static getInstance(): AIMealRecognitionService {
    if (!AIMealRecognitionService.instance) {
      AIMealRecognitionService.instance = new AIMealRecognitionService();
    }
    return AIMealRecognitionService.instance;
  }

  /**
   * Analyze single meal photo using multimodal LLM
   */
  async analyzeMealPhoto(
    imageUri: string,
    mealType: "breakfast" | "lunch" | "dinner" | "snack"
  ): Promise<MealRecognitionResult> {
    try {
      const base64Image = await this.convertImageToBase64(imageUri);

      // Call backend LLM API
      const result = await this.callLLMAnalysisAPI(base64Image, mealType);

      // Store in history
      this.recognitionHistory.set(result.id, result);

      return result;
    } catch (error) {
      console.error("[AIMealRecognition] Error analyzing meal photo:", error);
      throw error;
    }
  }

  /**
   * Batch process multiple meal photos
   */
  async batchAnalyzeMeals(
    imageUris: string[],
    mealType: "breakfast" | "lunch" | "dinner" | "snack"
  ): Promise<BatchMealAnalysis> {
    const batchId = `batch-${Date.now()}`;
    const batch: BatchMealAnalysis = {
      batchId,
      imageUris,
      results: [],
      processedCount: 0,
      totalCount: imageUris.length,
      status: "processing",
      startTime: Date.now(),
    };

    this.batchProcessing.set(batchId, batch);

    try {
      for (const imageUri of imageUris) {
        try {
          const result = await this.analyzeMealPhoto(imageUri, mealType);
          batch.results.push(result);
          batch.processedCount++;
        } catch (error) {
          console.error(`[AIMealRecognition] Error processing image: ${imageUri}`, error);
        }
      }

      batch.status = "completed";
      batch.endTime = Date.now();
    } catch (error) {
      batch.status = "failed";
      batch.endTime = Date.now();
      throw error;
    }

    return batch;
  }

  /**
   * Apply user corrections to recognized meal
   */
  applyUserCorrection(
    mealId: string,
    foodId: string,
    correctedName: string,
    correctedPortion: string
  ): MealRecognitionResult | null {
    const meal = this.recognitionHistory.get(mealId);
    if (!meal) return null;

    const food = meal.detectedFoods.find((f) => f.id === foodId);
    if (!food) return null;

    // Record correction
    if (!meal.corrections) {
      meal.corrections = [];
    }

    meal.corrections.push({
      foodId,
      originalName: food.name,
      correctedName,
      originalPortion: food.portion,
      correctedPortion,
      timestamp: Date.now(),
    });

    // Update food item
    food.name = correctedName;
    food.portion = correctedPortion;

    // Recalculate totals
    this.recalculateMealTotals(meal);

    return meal;
  }

  /**
   * Mark meal as user-approved
   */
  approveMeal(mealId: string): MealRecognitionResult | null {
    const meal = this.recognitionHistory.get(mealId);
    if (!meal) return null;

    meal.userApproved = true;
    return meal;
  }

  /**
   * Get recognition history
   */
  getRecognitionHistory(limit: number = 10): MealRecognitionResult[] {
    return Array.from(this.recognitionHistory.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get batch processing status
   */
  getBatchStatus(batchId: string): BatchMealAnalysis | null {
    return this.batchProcessing.get(batchId) || null;
  }

  /**
   * Convert image to base64
   */
  private async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("[AIMealRecognition] Error converting image to base64:", error);
      throw error;
    }
  }

  /**
   * Call LLM API for meal analysis
   */
  private async callLLMAnalysisAPI(
    base64Image: string,
    mealType: string
  ): Promise<MealRecognitionResult> {
    try {
      // In production, this would call the backend endpoint
      // POST /api/ai/analyze-meal with the image and meal type
      // The backend would use the multimodal LLM to analyze the image

      // Mock implementation for demo
      const mockResult = this.generateMockMealResult(mealType);
      return mockResult;
    } catch (error) {
      console.error("[AIMealRecognition] Error calling LLM API:", error);
      throw error;
    }
  }

  /**
   * Generate mock meal recognition result
   */
  private generateMockMealResult(
    mealType: string
  ): MealRecognitionResult {
    const mockData: Record<string, MealRecognitionResult> = {
      breakfast: {
        id: `meal-${Date.now()}`,
        imageUri: "",
        detectedFoods: [
          {
            id: "food-1",
            name: "Yumurta (Haşlanmış)",
            portion: "2 adet",
            portionSize: 100,
            portionUnit: "g",
            calories: 155,
            protein: 13,
            carbs: 1.1,
            fat: 11,
            fiber: 0,
            confidence: 0.95,
          },
          {
            id: "food-2",
            name: "Ekmek (Buğday)",
            portion: "2 dilim",
            portionSize: 60,
            portionUnit: "g",
            calories: 160,
            protein: 5.4,
            carbs: 29.4,
            fat: 2,
            fiber: 4,
            confidence: 0.92,
          },
          {
            id: "food-3",
            name: "Tereyağı",
            portion: "1 tbsp",
            portionSize: 14,
            portionUnit: "g",
            calories: 102,
            protein: 0.1,
            carbs: 0,
            fat: 11.5,
            confidence: 0.88,
          },
        ],
        totalCalories: 417,
        totalProtein: 18.5,
        totalCarbs: 30.5,
        totalFat: 24.5,
        mealType: "breakfast" as const,
        confidence: 0.92,
        timestamp: Date.now(),
        userApproved: false,
      },
      lunch: {
        id: `meal-${Date.now()}`,
        imageUri: "",
        detectedFoods: [
          {
            id: "food-1",
            name: "Tavuk Göğsü (Grile)",
            portion: "150g",
            portionSize: 150,
            portionUnit: "g",
            calories: 248,
            protein: 46.5,
            carbs: 0,
            fat: 5.4,
            confidence: 0.96,
          },
          {
            id: "food-2",
            name: "Pirinç (Haşlanmış)",
            portion: "1 kase",
            portionSize: 150,
            portionUnit: "g",
            calories: 195,
            protein: 4.3,
            carbs: 43,
            fat: 0.3,
            fiber: 0.6,
            confidence: 0.94,
          },
          {
            id: "food-3",
            name: "Brokoli (Haşlanmış)",
            portion: "1 kase",
            portionSize: 100,
            portionUnit: "g",
            calories: 34,
            protein: 2.8,
            carbs: 7,
            fat: 0.4,
            fiber: 2.4,
            confidence: 0.91,
          },
        ],
        totalCalories: 477,
        totalProtein: 53.6,
        totalCarbs: 50,
        totalFat: 6.1,
        mealType: "lunch" as const,
        confidence: 0.94,
        timestamp: Date.now(),
        userApproved: false,
      },
      dinner: {
        id: `meal-${Date.now()}`,
        imageUri: "",
        detectedFoods: [
          {
            id: "food-1",
            name: "Balık (Somon)",
            portion: "150g",
            portionSize: 150,
            portionUnit: "g",
            calories: 280,
            protein: 25,
            carbs: 0,
            fat: 20,
            confidence: 0.93,
          },
          {
            id: "food-2",
            name: "Patates (Fırında)",
            portion: "1 orta",
            portionSize: 150,
            portionUnit: "g",
            calories: 117,
            protein: 2.5,
            carbs: 26,
            fat: 0.1,
            fiber: 2.1,
            confidence: 0.90,
          },
          {
            id: "food-3",
            name: "Salata (Yeşil)",
            portion: "2 kase",
            portionSize: 200,
            portionUnit: "g",
            calories: 32,
            protein: 2.2,
            carbs: 6,
            fat: 0.4,
            fiber: 1.3,
            confidence: 0.89,
          },
        ],
        totalCalories: 429,
        totalProtein: 29.7,
        totalCarbs: 32,
        totalFat: 20.5,
        mealType: "dinner" as const,
        confidence: 0.91,
        timestamp: Date.now(),
        userApproved: false,
      },
      snack: {
        id: `meal-${Date.now()}`,
        imageUri: "",
        detectedFoods: [
          {
            id: "food-1",
            name: "Elma",
            portion: "1 orta",
            portionSize: 182,
            portionUnit: "g",
            calories: 95,
            protein: 0.5,
            carbs: 25,
            fat: 0.3,
            fiber: 4.4,
            confidence: 0.94,
          },
          {
            id: "food-2",
            name: "Yer Fıstığı Ezmesi",
            portion: "2 tbsp",
            portionSize: 32,
            portionUnit: "g",
            calories: 188,
            protein: 8,
            carbs: 7,
            fat: 16,
            fiber: 1.5,
            confidence: 0.88,
          },
        ],
        totalCalories: 283,
        totalProtein: 8.5,
        totalCarbs: 32,
        totalFat: 16.3,
        mealType: "snack" as const,
        confidence: 0.91,
        timestamp: Date.now(),
        userApproved: false,
      },
    };

    return mockData[mealType] || mockData.lunch;
  }

  /**
   * Recalculate meal totals
   */
  private recalculateMealTotals(meal: MealRecognitionResult): void {
    meal.totalCalories = meal.detectedFoods.reduce((sum, food) => sum + food.calories, 0);
    meal.totalProtein = meal.detectedFoods.reduce((sum, food) => sum + food.protein, 0);
    meal.totalCarbs = meal.detectedFoods.reduce((sum, food) => sum + food.carbs, 0);
    meal.totalFat = meal.detectedFoods.reduce((sum, food) => sum + food.fat, 0);
  }

  /**
   * Clear recognition history
   */
  clearHistory(): void {
    this.recognitionHistory.clear();
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalRecognitions: number;
    approvedMeals: number;
    averageConfidence: number;
    totalCorrectionsMade: number;
  } {
    const meals = Array.from(this.recognitionHistory.values());
    const approvedMeals = meals.filter((m) => m.userApproved).length;
    const averageConfidence =
      meals.length > 0
        ? meals.reduce((sum, m) => sum + m.confidence, 0) / meals.length
        : 0;
    const totalCorrectionsMade = meals.reduce(
      (sum, m) => sum + (m.corrections?.length || 0),
      0
    );

    return {
      totalRecognitions: meals.length,
      approvedMeals,
      averageConfidence,
      totalCorrectionsMade,
    };
  }
}

export const aiMealRecognitionService = AIMealRecognitionService.getInstance();
