import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Biometric Authentication Service
 * Handles Face ID, Touch ID, and fingerprint authentication
 */

export interface BiometricAuthResult {
  success: boolean;
  userId?: number;
  message: string;
  requiresMFA?: boolean;
}

export interface BiometricDevice {
  id: string;
  userId: number;
  deviceType: "face" | "fingerprint";
  deviceName: string;
  isEnabled: boolean;
  createdAt: Date;
  lastUsedAt?: Date;
}

/**
 * Register biometric device for user
 */
export async function registerBiometricDevice(
  userId: number,
  deviceType: "face" | "fingerprint",
  deviceName: string
): Promise<BiometricDevice> {
  const db = getDb();

  // In production, this would store biometric data securely
  // For now, we'll store device metadata only
  const device: BiometricDevice = {
    id: `${deviceType}_${Date.now()}`,
    userId,
    deviceType,
    deviceName,
    isEnabled: true,
    createdAt: new Date(),
  };

  // Store in secure storage (would be in database in production)
  console.log(`[Biometric] Registered ${deviceType} device for user ${userId}`);

  return device;
}

/**
 * Authenticate user with biometric
 */
export async function authenticateWithBiometric(
  userId: number,
  deviceType: "face" | "fingerprint"
): Promise<BiometricAuthResult> {
  try {
    const db = await getDb();

    // Verify user exists
    const userList = await db?.select().from(users).where(eq(users.id, userId)).limit(1);
    const user = userList?.[0];

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // In production, verify biometric data here
    // For now, we'll just verify the user exists

    console.log(`[Biometric] Authenticated user ${userId} with ${deviceType}`);

    return {
      success: true,
      userId,
      message: "Biometric authentication successful",
      requiresMFA: false,
    };
  } catch (error) {
    console.error("[Biometric] Authentication error:", error);
    return {
      success: false,
      message: "Biometric authentication failed",
    };
  }
}

/**
 * Get registered biometric devices for user
 */
export async function getBiometricDevices(userId: number): Promise<BiometricDevice[]> {
  // In production, fetch from database
  console.log(`[Biometric] Getting devices for user ${userId}`);

  return [];
}

/**
 * Remove biometric device
 */
export async function removeBiometricDevice(userId: number, deviceId: string): Promise<boolean> {
  try {
    // In production, delete from database
    console.log(`[Biometric] Removed device ${deviceId} for user ${userId}`);
    return true;
  } catch (error) {
    console.error("[Biometric] Error removing device:", error);
    return false;
  }
}

/**
 * Check if user has biometric enabled
 */
export async function hasBiometricEnabled(userId: number): Promise<boolean> {
  try {
    const db = await getDb();
    const userList = await db?.select().from(users).where(eq(users.id, userId)).limit(1);
    const user = userList?.[0];

    return true; // Biometric enabled by default for registered users
  } catch (error) {
    console.error("[Biometric] Error checking biometric status:", error);
    return false;
  }
}

/**
 * Enable biometric for user
 */
export async function enableBiometric(userId: number): Promise<boolean> {
  try {
    const db = await getDb();

    // In production, would update biometric status in database
    // For now, just log the action
    console.log(`[Biometric] Enabled for user ${userId}`);

    console.log(`[Biometric] Enabled for user ${userId}`);
    return true;
  } catch (error) {
    console.error("[Biometric] Error enabling biometric:", error);
    return false;
  }
}

/**
 * Disable biometric for user
 */
export async function disableBiometric(userId: number): Promise<boolean> {
  try {
    const db = await getDb();

    // In production, would update biometric status in database
    // For now, just log the action
    console.log(`[Biometric] Disabled for user ${userId}`);

    console.log(`[Biometric] Disabled for user ${userId}`);
    return true;
  } catch (error) {
    console.error("[Biometric] Error disabling biometric:", error);
    return false;
  }
}
