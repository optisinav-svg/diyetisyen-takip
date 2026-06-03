// Mock database - in real implementation, import from server
// import { db } from "@/server/_core/db";
// import { users, connections } from "@/server/_core/schema";
// import { eq, and, or } from "drizzle-orm";

export interface ClientProfile {
  userId: string;
  goals: string[]; // e.g., ["weight-loss", "muscle-gain"]
  dietPreferences: string[]; // e.g., ["keto", "mediterranean"]
  allergies: string[];
  budget: "low" | "medium" | "high";
  communicationPreference: "video" | "phone" | "chat" | "in-person";
  timezone: string;
  language: string;
}

export interface DietitianProfile {
  userId: string;
  specializations: string[]; // e.g., ["weight-loss", "sports-nutrition"]
  supportedDiets: string[]; // e.g., ["keto", "mediterranean"]
  hourlyRate: number;
  communicationPreference: "video" | "phone" | "chat" | "in-person";
  timezone: string;
  languages: string[];
  rating: number; // 0-5
  clientCount: number;
}

export interface MatchScore {
  dietitianId: string;
  score: number; // 0-100
  factors: {
    dietMatch: number;
    specializationMatch: number;
    communicationMatch: number;
    budgetMatch: number;
    timezoneMatch: number;
    ratingBonus: number;
  };
}

export interface ConnectionRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromRole: "client" | "dietitian";
  toRole: "client" | "dietitian";
  status: "pending" | "accepted" | "rejected";
  matchScore?: number;
  createdAt: Date;
  respondedAt?: Date;
}

/**
 * Matching Connection Service
 * Handles two-way matching between clients and dietitians
 * Supports both scenarios:
 * 1. Client searches for dietitian
 * 2. Dietitian adds/invites client
 */

/**
 * Scenario 1: Client searches for dietitians
 * Returns ranked list of dietitians based on match score
 */
export async function findDietitianMatches(clientProfile: ClientProfile): Promise<MatchScore[]> {
  // In a real implementation, fetch all dietitians from database
  // For now, return mock data
  const mockDietitians: DietitianProfile[] = [
    {
      userId: "diet-1",
      specializations: ["weight-loss", "diabetes-management"],
      supportedDiets: ["keto", "mediterranean", "low-carb"],
      hourlyRate: 150,
      communicationPreference: "video",
      timezone: "UTC+3",
      languages: ["Turkish", "English"],
      rating: 4.8,
      clientCount: 250,
    },
    {
      userId: "diet-2",
      specializations: ["sports-nutrition", "muscle-gain"],
      supportedDiets: ["high-protein", "mediterranean"],
      hourlyRate: 120,
      communicationPreference: "phone",
      timezone: "UTC+3",
      languages: ["Turkish"],
      rating: 4.6,
      clientCount: 180,
    },
  ];

  const matches = mockDietitians.map((dietitian) => calculateMatchScore(clientProfile, dietitian));

  // Sort by score descending
  return matches.sort((a, b) => b.score - a.score);
}

/**
 * Scenario 2: Dietitian adds/invites client
 * Search for existing client or create invitation
 */
export async function addClientByDietitian(
  dietitianId: string,
  clientIdentifier: string // phone number or email
): Promise<{ found: boolean; clientId?: string; invitationLink?: string }> {
  // Search for client by phone or email
  // In real implementation: query database
  const existingClient: any[] = []; // Mock: no existing client

  if (existingClient.length > 0) {
    // Client found - send connection request
    const clientId = existingClient[0].id as string;
    await sendConnectionRequest(dietitianId, clientId, "dietitian", "client");
    return { found: true, clientId: clientId };
  }
  // Client not found - generate invitation link
  const invitationLink = generateInvitationLink(dietitianId, clientIdentifier);
  return { found: false, invitationLink };
}

/**
 * Send connection request (bidirectional)
 * Can be initiated by either client or dietitian
 */
export async function sendConnectionRequest(
  fromUserId: string,
  toUserId: string,
  fromRole: "client" | "dietitian",
  toRole: "client" | "dietitian",
  matchScore?: number
): Promise<ConnectionRequest> {
  const request: ConnectionRequest = {
    id: `conn-${Date.now()}`,
    fromUserId,
    toUserId,
    fromRole,
    toRole,
    status: "pending",
    matchScore,
    createdAt: new Date(),
  };

  // Save to database (mock)
  // In real implementation: await db.insert(connections).values(request);

  // Send notification to recipient
  await sendNotification(toUserId, `New connection request from ${fromRole}`, request);

  return request;
}

/**
 * Accept connection request
 */
export async function acceptConnectionRequest(requestId: string): Promise<void> {
  // Update request status
  // In real implementation: await db.update(connections).set({ status: "accepted" }).where(eq(connections.id, requestId));

  // Create active connection
  // Send notification to sender
}

/**
 * Reject connection request
 */
export async function rejectConnectionRequest(requestId: string): Promise<void> {
  // Update request status
  // In real implementation: await db.update(connections).set({ status: "rejected" }).where(eq(connections.id, requestId));

  // Send notification to sender
}

/**
 * Calculate match score between client and dietitian
 * Returns score 0-100 with breakdown of factors
 */
function calculateMatchScore(clientProfile: ClientProfile, dietitianProfile: DietitianProfile): MatchScore {
  // Diet match (25%)
  const dietMatch =
    (clientProfile.dietPreferences.filter((d) => dietitianProfile.supportedDiets.includes(d)).length /
      Math.max(clientProfile.dietPreferences.length, 1)) *
    100;

  // Specialization match (25%)
  const specializationMatch =
    (clientProfile.goals.filter((g) => dietitianProfile.specializations.includes(g)).length /
      Math.max(clientProfile.goals.length, 1)) *
    100;

  // Communication preference match (20%)
  const communicationMatch =
    clientProfile.communicationPreference === dietitianProfile.communicationPreference ? 100 : 50;

  // Budget match (15%)
  const budgetMatch = calculateBudgetMatch(clientProfile.budget, dietitianProfile.hourlyRate);

  // Timezone match (10%)
  const timezoneMatch = clientProfile.timezone === dietitianProfile.timezone ? 100 : 70;

  // Rating bonus (5%)
  const ratingBonus = (dietitianProfile.rating / 5) * 100;

  const totalScore =
    (dietMatch * 0.25 + specializationMatch * 0.25 + communicationMatch * 0.2 + budgetMatch * 0.15 + timezoneMatch * 0.1 + ratingBonus * 0.05) /
    100;

  return {
    dietitianId: dietitianProfile.userId,
    score: Math.round(totalScore),
    factors: {
      dietMatch: Math.round(dietMatch),
      specializationMatch: Math.round(specializationMatch),
      communicationMatch: Math.round(communicationMatch),
      budgetMatch: Math.round(budgetMatch),
      timezoneMatch: Math.round(timezoneMatch),
      ratingBonus: Math.round(ratingBonus),
    },
  };
}

/**
 * Calculate budget compatibility
 */
function calculateBudgetMatch(clientBudget: string, hourlyRate: number): number {
  const budgetRanges = {
    low: { min: 0, max: 80 },
    medium: { min: 80, max: 200 },
    high: { min: 200, max: Infinity },
  };

  const range = budgetRanges[clientBudget as keyof typeof budgetRanges];
  if (hourlyRate >= range.min && hourlyRate <= range.max) {
    return 100;
  } else if (Math.abs(hourlyRate - range.max) < 50) {
    return 80; // Close to budget
  }
  return 40; // Outside budget
}

/**
 * Generate invitation link for new clients
 */
function generateInvitationLink(dietitianId: string, clientIdentifier: string): string {
  const encodedId = Buffer.from(dietitianId).toString("base64");
  const encodedIdentifier = Buffer.from(clientIdentifier).toString("base64");
  return `https://app.diyetisyen-takip.com/invite?dietitian=${encodedId}&client=${encodedIdentifier}`;
}

/**
 * Send notification (mock)
 */
async function sendNotification(userId: string, message: string, data: any): Promise<void> {
  console.log(`Notification to ${userId}: ${message}`, data);
  // In real implementation: call push notification service
}

/**
 * Get pending connection requests for user
 */
export async function getPendingRequests(
  userId: string,
  role: "client" | "dietitian"
): Promise<ConnectionRequest[]> {
  // In real implementation: query database
  return [];
}

/**
 * Get active connections for user
 */
export async function getActiveConnections(userId: string): Promise<ConnectionRequest[]> {
  // In real implementation: query database
  return [];
}

/**
 * Block user
 */
export async function blockUser(userId: string, blockedUserId: string): Promise<void> {
  // In real implementation: save to blocked_users table
}

/**
 * Unblock user
 */
export async function unblockUser(userId: string, blockedUserId: string): Promise<void> {
  // In real implementation: remove from blocked_users table
}

/**
 * Check if user is blocked
 */
export async function isUserBlocked(userId: string, otherUserId: string): Promise<boolean> {
  // In real implementation: query blocked_users table
  return false;
}
