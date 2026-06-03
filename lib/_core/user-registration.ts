import AsyncStorage from "@react-native-async-storage/async-storage";

export interface UserRegistration {
  name: string;
  email: string;
  password: string;
  role: "dietitian" | "client";
  registeredAt: string;
}

const STORAGE_KEY = "user_registration";

/**
 * Kullanıcı kayıt bilgilerini AsyncStorage'a kaydet
 */
export async function saveUserRegistration(user: UserRegistration): Promise<void> {
  try {
    const userData = {
      ...user,
      registeredAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error("Failed to save user registration:", error);
    throw error;
  }
}

/**
 * AsyncStorage'dan kayıtlı kullanıcı bilgilerini al
 */
export async function getUserRegistration(): Promise<UserRegistration | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as UserRegistration;
  } catch (error) {
    console.error("Failed to get user registration:", error);
    return null;
  }
}

/**
 * Kullanıcı kayıt bilgilerini sil
 */
export async function clearUserRegistration(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear user registration:", error);
    throw error;
  }
}

/**
 * Kullanıcı kayıtlı mı kontrol et
 */
export async function isUserRegistered(): Promise<boolean> {
  try {
    const user = await getUserRegistration();
    return user !== null;
  } catch (error) {
    console.error("Failed to check user registration:", error);
    return false;
  }
}
