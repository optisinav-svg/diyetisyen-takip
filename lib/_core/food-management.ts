import AsyncStorage from "@react-native-async-storage/async-storage";

export interface FoodItem {
  id: string;
  name: string;
  category: string; // "protein", "carbs", "fat", "vegetable", "fruit", "dairy", "grain", "other"
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string; // "100g", "1 cup", "1 piece", etc.
}

export interface FoodRecommendation {
  id: string;
  dietitianId: string;
  clientId: string;
  foodId: string;
  foodName: string;
  type: "recommended" | "forbidden";
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FoodPackage {
  id: string;
  dietitianId: string;
  name: string;
  description?: string;
  foods: {
    foodId: string;
    foodName: string;
    type: "recommended" | "forbidden";
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface SharedPackage {
  id: string;
  packageId: string;
  dietitianId: string;
  clientId: string;
  clientName: string;
  sharedAt: string;
  status: "active" | "archived";
}

const FOOD_RECOMMENDATIONS_KEY = "food_recommendations";
const FOOD_PACKAGES_KEY = "food_packages";
const SHARED_PACKAGES_KEY = "shared_packages";

// ============ FOOD RECOMMENDATIONS ============

/**
 * Gıda önerisi oluştur
 */
export async function createFoodRecommendation(
  recommendation: Omit<FoodRecommendation, "id" | "createdAt" | "updatedAt">
): Promise<FoodRecommendation> {
  try {
    const recommendations = await getFoodRecommendations();
    const newRecommendation: FoodRecommendation = {
      ...recommendation,
      id: `rec_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    recommendations.push(newRecommendation);
    await AsyncStorage.setItem(FOOD_RECOMMENDATIONS_KEY, JSON.stringify(recommendations));
    return newRecommendation;
  } catch (error) {
    console.error("Failed to create food recommendation:", error);
    throw error;
  }
}

/**
 * Tüm gıda önerilerini al
 */
export async function getFoodRecommendations(): Promise<FoodRecommendation[]> {
  try {
    const data = await AsyncStorage.getItem(FOOD_RECOMMENDATIONS_KEY);
    if (!data) return [];
    return JSON.parse(data) as FoodRecommendation[];
  } catch (error) {
    console.error("Failed to get food recommendations:", error);
    return [];
  }
}

/**
 * Danışana ait gıda önerilerini al
 */
export async function getClientFoodRecommendations(clientId: string): Promise<FoodRecommendation[]> {
  try {
    const recommendations = await getFoodRecommendations();
    return recommendations.filter((r) => r.clientId === clientId);
  } catch (error) {
    console.error("Failed to get client food recommendations:", error);
    return [];
  }
}

/**
 * Önerilen gıdaları al
 */
export async function getRecommendedFoods(clientId: string): Promise<FoodRecommendation[]> {
  try {
    const recommendations = await getClientFoodRecommendations(clientId);
    return recommendations.filter((r) => r.type === "recommended");
  } catch (error) {
    console.error("Failed to get recommended foods:", error);
    return [];
  }
}

/**
 * Yasaklı gıdaları al
 */
export async function getForbiddenFoods(clientId: string): Promise<FoodRecommendation[]> {
  try {
    const recommendations = await getClientFoodRecommendations(clientId);
    return recommendations.filter((r) => r.type === "forbidden");
  } catch (error) {
    console.error("Failed to get forbidden foods:", error);
    return [];
  }
}

/**
 * Gıda önerisi sil
 */
export async function deleteFoodRecommendation(recommendationId: string): Promise<void> {
  try {
    const recommendations = await getFoodRecommendations();
    const filtered = recommendations.filter((r) => r.id !== recommendationId);
    await AsyncStorage.setItem(FOOD_RECOMMENDATIONS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete food recommendation:", error);
    throw error;
  }
}

// ============ FOOD PACKAGES ============

/**
 * Gıda paketi oluştur
 */
export async function createFoodPackage(
  foodPackage: Omit<FoodPackage, "id" | "createdAt" | "updatedAt">
): Promise<FoodPackage> {
  try {
    const packages = await getFoodPackages();
    const newPackage: FoodPackage = {
      ...foodPackage,
      id: `pkg_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    packages.push(newPackage);
    await AsyncStorage.setItem(FOOD_PACKAGES_KEY, JSON.stringify(packages));
    return newPackage;
  } catch (error) {
    console.error("Failed to create food package:", error);
    throw error;
  }
}

/**
 * Tüm gıda paketlerini al
 */
export async function getFoodPackages(): Promise<FoodPackage[]> {
  try {
    const data = await AsyncStorage.getItem(FOOD_PACKAGES_KEY);
    if (!data) return [];
    return JSON.parse(data) as FoodPackage[];
  } catch (error) {
    console.error("Failed to get food packages:", error);
    return [];
  }
}

/**
 * Diyetisyenin paketlerini al
 */
export async function getDietitianFoodPackages(dietitianId: string): Promise<FoodPackage[]> {
  try {
    const packages = await getFoodPackages();
    return packages.filter((p) => p.dietitianId === dietitianId);
  } catch (error) {
    console.error("Failed to get dietitian food packages:", error);
    return [];
  }
}

/**
 * Gıda paketi güncelle
 */
export async function updateFoodPackage(
  packageId: string,
  updates: Partial<FoodPackage>
): Promise<FoodPackage | null> {
  try {
    const packages = await getFoodPackages();
    const foodPackage = packages.find((p) => p.id === packageId);
    if (!foodPackage) return null;

    Object.assign(foodPackage, updates, {
      updatedAt: new Date().toISOString(),
    });
    await AsyncStorage.setItem(FOOD_PACKAGES_KEY, JSON.stringify(packages));
    return foodPackage;
  } catch (error) {
    console.error("Failed to update food package:", error);
    throw error;
  }
}

/**
 * Gıda paketi sil
 */
export async function deleteFoodPackage(packageId: string): Promise<void> {
  try {
    const packages = await getFoodPackages();
    const filtered = packages.filter((p) => p.id !== packageId);
    await AsyncStorage.setItem(FOOD_PACKAGES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete food package:", error);
    throw error;
  }
}

// ============ SHARED PACKAGES ============

/**
 * Paketi danışana paylaş
 */
export async function sharePackageWithClient(
  packageId: string,
  dietitianId: string,
  clientId: string,
  clientName: string
): Promise<SharedPackage> {
  try {
    const sharedPackages = await getSharedPackages();
    const newSharedPackage: SharedPackage = {
      id: `shared_${Date.now()}`,
      packageId,
      dietitianId,
      clientId,
      clientName,
      sharedAt: new Date().toISOString(),
      status: "active",
    };
    sharedPackages.push(newSharedPackage);
    await AsyncStorage.setItem(SHARED_PACKAGES_KEY, JSON.stringify(sharedPackages));
    return newSharedPackage;
  } catch (error) {
    console.error("Failed to share package:", error);
    throw error;
  }
}

/**
 * Tüm paylaşılan paketleri al
 */
export async function getSharedPackages(): Promise<SharedPackage[]> {
  try {
    const data = await AsyncStorage.getItem(SHARED_PACKAGES_KEY);
    if (!data) return [];
    return JSON.parse(data) as SharedPackage[];
  } catch (error) {
    console.error("Failed to get shared packages:", error);
    return [];
  }
}

/**
 * Danışanın aldığı paketleri al
 */
export async function getClientSharedPackages(clientId: string): Promise<SharedPackage[]> {
  try {
    const sharedPackages = await getSharedPackages();
    return sharedPackages.filter((sp) => sp.clientId === clientId && sp.status === "active");
  } catch (error) {
    console.error("Failed to get client shared packages:", error);
    return [];
  }
}

/**
 * Diyetisyenin paylaştığı paketleri al
 */
export async function getDietitianSharedPackages(dietitianId: string): Promise<SharedPackage[]> {
  try {
    const sharedPackages = await getSharedPackages();
    return sharedPackages.filter((sp) => sp.dietitianId === dietitianId);
  } catch (error) {
    console.error("Failed to get dietitian shared packages:", error);
    return [];
  }
}

/**
 * Paylaşılan paketi arşivle
 */
export async function archiveSharedPackage(sharedPackageId: string): Promise<SharedPackage | null> {
  try {
    const sharedPackages = await getSharedPackages();
    const sharedPackage = sharedPackages.find((sp) => sp.id === sharedPackageId);
    if (!sharedPackage) return null;

    sharedPackage.status = "archived";
    await AsyncStorage.setItem(SHARED_PACKAGES_KEY, JSON.stringify(sharedPackages));
    return sharedPackage;
  } catch (error) {
    console.error("Failed to archive shared package:", error);
    throw error;
  }
}
