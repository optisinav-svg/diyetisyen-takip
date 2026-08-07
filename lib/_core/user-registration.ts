import AsyncStorage from "@react-native-async-storage/async-storage";

export interface UserRegistration {
  name: string;
  email: string;
  role: "dietitian" | "client";
  registeredAt: string;
  biometricEnabled: boolean;
}

const STORAGE_KEY = "user_registration";

export async function saveUserRegistration(user: Omit<UserRegistration, "registeredAt" | "biometricEnabled">): Promise<void> {
  try {
    const existing = await getUserRegistration();
    const userData: UserRegistration = {
      ...user,
      registeredAt: existing?.registeredAt ?? new Date().toISOString(),
      biometricEnabled: existing?.biometricEnabled ?? false,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error("Failed to save user registration:", error);
    throw error;
  }
}

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

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  try {
    const user = await getUserRegistration();
    if (!user) return;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...user, biometricEnabled: enabled }));
  } catch (error) {
    console.error("Failed to set biometric enabled:", error);
  }
}

export async function clearUserRegistration(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear user registration:", error);
    throw error;
  }
}

export async function isUserRegistered(): Promise<boolean> {
  try {
    const user = await getUserRegistration();
    return user !== null;
  } catch (error) {
    return false;
  }
}
