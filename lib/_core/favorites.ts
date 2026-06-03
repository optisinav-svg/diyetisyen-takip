import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "favorite_features";

/**
 * Favorilere özellik ekle
 */
export async function addToFavorites(featureId: string): Promise<void> {
  try {
    const favorites = await getFavorites();
    if (!favorites.includes(featureId)) {
      favorites.push(featureId);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
  } catch (error) {
    console.error("Failed to add to favorites:", error);
    throw error;
  }
}

/**
 * Favorilerden özellik kaldır
 */
export async function removeFromFavorites(featureId: string): Promise<void> {
  try {
    const favorites = await getFavorites();
    const filtered = favorites.filter((id) => id !== featureId);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to remove from favorites:", error);
    throw error;
  }
}

/**
 * Tüm favorileri al
 */
export async function getFavorites(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(FAVORITES_KEY);
    if (!data) return [];
    return JSON.parse(data) as string[];
  } catch (error) {
    console.error("Failed to get favorites:", error);
    return [];
  }
}

/**
 * Özelliğin favoride olup olmadığını kontrol et
 */
export async function isFavorite(featureId: string): Promise<boolean> {
  try {
    const favorites = await getFavorites();
    return favorites.includes(featureId);
  } catch (error) {
    console.error("Failed to check favorite:", error);
    return false;
  }
}

/**
 * Favorileri temizle
 */
export async function clearFavorites(): Promise<void> {
  try {
    await AsyncStorage.removeItem(FAVORITES_KEY);
  } catch (error) {
    console.error("Failed to clear favorites:", error);
    throw error;
  }
}
