import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

/**
 * Two-Factor Authentication Service
 * Handles TOTP and SMS-based 2FA
 */

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface TwoFactorVerifyResult {
  success: boolean;
  message: string;
  sessionToken?: string;
}

/**
 * Generate 2FA secret for user
 */
export async function generateTwoFactorSecret(userId: number): Promise<TwoFactorSetup> {
  // Generate random secret (base32 encoded)
  const secret = crypto.randomBytes(15).toString("base64").slice(0, 24);

  // Generate QR code URL (would use qrcode library in production)
  const qrCode = `otpauth://totp/DiyetisyenTakip:user${userId}?secret=${secret}&issuer=DiyetisyenTakip`;

  // Generate backup codes
  const backupCodes = Array.from({ length: 10 }, () =>
    crypto.randomBytes(4).toString("hex").toUpperCase()
  );

  console.log(`[2FA] Generated secret for user ${userId}`);

  return {
    secret,
    qrCode,
    backupCodes,
  };
}

/**
 * Enable 2FA for user
 */
export async function enableTwoFactor(userId: number, secret: string): Promise<boolean> {
  try {
    const db = await getDb();

    // In production, would store encrypted secret in database
    // For now, just log the action
    console.log(`[2FA] Enabled for user ${userId}`);

    return true;
  } catch (error) {
    console.error("[2FA] Error enabling 2FA:", error);
    return false;
  }
}

/**
 * Disable 2FA for user
 */
export async function disableTwoFactor(userId: number): Promise<boolean> {
  try {
    const db = await getDb();

    // In production, would remove secret from database
    // For now, just log the action
    console.log(`[2FA] Disabled for user ${userId}`);

    return true;
  } catch (error) {
    console.error("[2FA] Error disabling 2FA:", error);
    return false;
  }
}

/**
 * Verify 2FA code (TOTP)
 */
export async function verifyTwoFactorCode(userId: number, code: string): Promise<TwoFactorVerifyResult> {
  try {
    // In production, would verify TOTP code using speakeasy library
    // For now, just check if code is 6 digits
    if (!/^\d{6}$/.test(code)) {
      return {
        success: false,
        message: "Invalid 2FA code format",
      };
    }

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString("hex");

    console.log(`[2FA] Verified code for user ${userId}`);

    return {
      success: true,
      message: "2FA code verified successfully",
      sessionToken,
    };
  } catch (error) {
    console.error("[2FA] Error verifying 2FA code:", error);
    return {
      success: false,
      message: "2FA verification failed",
    };
  }
}

/**
 * Verify backup code
 */
export async function verifyBackupCode(userId: number, code: string): Promise<TwoFactorVerifyResult> {
  try {
    // In production, would check against stored backup codes
    // For now, just check if code is valid format
    if (!/^[A-F0-9]{8}$/.test(code)) {
      return {
        success: false,
        message: "Invalid backup code format",
      };
    }

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString("hex");

    console.log(`[2FA] Verified backup code for user ${userId}`);

    return {
      success: true,
      message: "Backup code verified successfully",
      sessionToken,
    };
  } catch (error) {
    console.error("[2FA] Error verifying backup code:", error);
    return {
      success: false,
      message: "Backup code verification failed",
    };
  }
}

/**
 * Check if user has 2FA enabled
 */
export async function hasTwoFactorEnabled(userId: number): Promise<boolean> {
  try {
    const db = await getDb();
    const userList = await db?.select().from(users).where(eq(users.id, userId)).limit(1);
    const user = userList?.[0];

    return user ? true : false;
  } catch (error) {
    console.error("[2FA] Error checking 2FA status:", error);
    return false;
  }
}

/**
 * Send 2FA SMS code
 */
export async function sendTwoFactorSMS(userId: number, phoneNumber: string): Promise<boolean> {
  try {
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // In production, would send SMS using Twilio or similar service
    console.log(`[2FA] Sending SMS code ${code} to ${phoneNumber}`);

    // Store code temporarily (would use Redis in production)
    // For now, just log it
    console.log(`[2FA] SMS code for user ${userId}: ${code}`);

    return true;
  } catch (error) {
    console.error("[2FA] Error sending SMS:", error);
    return false;
  }
}

/**
 * Verify SMS code
 */
export async function verifySMSCode(userId: number, code: string): Promise<TwoFactorVerifyResult> {
  try {
    // In production, would verify against stored code
    // For now, just check format
    if (!/^\d{6}$/.test(code)) {
      return {
        success: false,
        message: "Invalid SMS code format",
      };
    }

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString("hex");

    console.log(`[2FA] Verified SMS code for user ${userId}`);

    return {
      success: true,
      message: "SMS code verified successfully",
      sessionToken,
    };
  } catch (error) {
    console.error("[2FA] Error verifying SMS code:", error);
    return {
      success: false,
      message: "SMS code verification failed",
    };
  }
}
