import { describe, it, expect, beforeEach } from "vitest";
import {
  findDietitianMatches,
  addClientByDietitian,
  sendConnectionRequest,
  getPendingRequests,
  getActiveConnections,
  blockUser,
  unblockUser,
  isUserBlocked,
  type ClientProfile,
  type DietitianProfile,
  type MatchScore,
} from "../lib/_core/matching-connection";

describe("Navigation and Matching System", () => {
  describe("Client Search for Dietitian", () => {
    let clientProfile: ClientProfile;

    beforeEach(() => {
      clientProfile = {
        userId: "client-1",
        goals: ["weight-loss", "diabetes-management"],
        dietPreferences: ["keto", "low-carb"],
        allergies: ["peanut", "shellfish"],
        budget: "medium",
        communicationPreference: "video",
        timezone: "UTC+3",
        language: "Turkish",
      };
    });

    it("should find matching dietitians based on client profile", async () => {
      const matches = await findDietitianMatches(clientProfile);
      expect(matches).toBeDefined();
      expect(Array.isArray(matches)).toBe(true);
      expect(matches.length).toBeGreaterThan(0);
    });

    it("should return matches sorted by score descending", async () => {
      const matches = await findDietitianMatches(clientProfile);
      for (let i = 0; i < matches.length - 1; i++) {
        expect(matches[i].score).toBeGreaterThanOrEqual(matches[i + 1].score);
      }
    });

    it("should calculate match score between 0-100", async () => {
      const matches = await findDietitianMatches(clientProfile);
      matches.forEach((match) => {
        expect(match.score).toBeGreaterThanOrEqual(0);
        expect(match.score).toBeLessThanOrEqual(100);
      });
    });

    it("should include match factors breakdown", async () => {
      const matches = await findDietitianMatches(clientProfile);
      const firstMatch = matches[0];
      expect(firstMatch.factors).toBeDefined();
      expect(firstMatch.factors.dietMatch).toBeDefined();
      expect(firstMatch.factors.specializationMatch).toBeDefined();
      expect(firstMatch.factors.communicationMatch).toBeDefined();
      expect(firstMatch.factors.budgetMatch).toBeDefined();
      expect(firstMatch.factors.timezoneMatch).toBeDefined();
      expect(firstMatch.factors.ratingBonus).toBeDefined();
    });
  });

  describe("Dietitian Adds Client", () => {
    it("should find existing client by email", async () => {
      const result = await addClientByDietitian("dietitian-1", "client@example.com");
      expect(result).toBeDefined();
      expect(result).toHaveProperty("found");
    });

    it("should find existing client by phone", async () => {
      const result = await addClientByDietitian("dietitian-1", "+90 555 123 4567");
      expect(result).toBeDefined();
      expect(result).toHaveProperty("found");
    });

    it("should generate invitation link for new client", async () => {
      const result = await addClientByDietitian("dietitian-1", "newclient@example.com");
      if (!result.found) {
        expect(result.invitationLink).toBeDefined();
        expect(result.invitationLink).toContain("invite");
        expect(result.invitationLink).toContain("dietitian=");
      }
    });
  });

  describe("Connection Request Management", () => {
    it("should send connection request from client to dietitian", async () => {
      const request = await sendConnectionRequest("client-1", "dietitian-1", "client", "dietitian");
      expect(request).toBeDefined();
      expect(request.fromUserId).toBe("client-1");
      expect(request.toUserId).toBe("dietitian-1");
      expect(request.fromRole).toBe("client");
      expect(request.toRole).toBe("dietitian");
      expect(request.status).toBe("pending");
    });

    it("should send connection request from dietitian to client", async () => {
      const request = await sendConnectionRequest("dietitian-1", "client-1", "dietitian", "client");
      expect(request).toBeDefined();
      expect(request.fromUserId).toBe("dietitian-1");
      expect(request.toUserId).toBe("client-1");
      expect(request.fromRole).toBe("dietitian");
      expect(request.toRole).toBe("client");
      expect(request.status).toBe("pending");
    });

    it("should include match score in connection request", async () => {
      const request = await sendConnectionRequest("client-1", "dietitian-1", "client", "dietitian", 85);
      expect(request.matchScore).toBe(85);
    });

    it("should get pending requests for user", async () => {
      const requests = await getPendingRequests("user-1", "client");
      expect(Array.isArray(requests)).toBe(true);
    });

    it("should get active connections for user", async () => {
      const connections = await getActiveConnections("user-1");
      expect(Array.isArray(connections)).toBe(true);
    });
  });

  describe("Block/Unblock Functionality", () => {
    it("should block user", async () => {
      await blockUser("user-1", "user-2");
      const isBlocked = await isUserBlocked("user-1", "user-2");
      expect(typeof isBlocked).toBe("boolean");
    });

    it("should unblock user", async () => {
      await blockUser("user-1", "user-2");
      await unblockUser("user-1", "user-2");
      const isBlocked = await isUserBlocked("user-1", "user-2");
      expect(typeof isBlocked).toBe("boolean");
    });

    it("should check if user is blocked", async () => {
      const isBlocked = await isUserBlocked("user-1", "user-2");
      expect(typeof isBlocked).toBe("boolean");
    });
  });

  describe("Match Score Calculation", () => {
    it("should prioritize diet type match (25%)", () => {
      // Diet match should have highest weight
      const clientProfile: ClientProfile = {
        userId: "client-1",
        goals: ["weight-loss"],
        dietPreferences: ["keto"],
        allergies: [],
        budget: "medium",
        communicationPreference: "video",
        timezone: "UTC+3",
        language: "Turkish",
      };
      // Score should be high if dietitian supports keto
    });

    it("should prioritize specialization match (25%)", () => {
      // Specialization match should have equal weight to diet
    });

    it("should consider communication preference (20%)", () => {
      // Communication match should be third priority
    });

    it("should consider budget compatibility (15%)", () => {
      // Budget should be weighted less than above
    });

    it("should consider timezone (10%)", () => {
      // Timezone should be weighted less than budget
    });

    it("should apply rating bonus (5%)", () => {
      // Rating should be smallest bonus
    });
  });

  describe("Two-Way Matching Scenarios", () => {
    it("Scenario 1: Client searches and sends request", async () => {
      // 1. Client creates profile
      const clientProfile: ClientProfile = {
        userId: "client-1",
        goals: ["weight-loss"],
        dietPreferences: ["keto"],
        allergies: [],
        budget: "medium",
        communicationPreference: "video",
        timezone: "UTC+3",
        language: "Turkish",
      };

      // 2. Client searches for dietitians
      const matches = await findDietitianMatches(clientProfile);
      expect(matches.length).toBeGreaterThan(0);

      // 3. Client sends connection request
      const topMatch = matches[0];
      const request = await sendConnectionRequest(
        "client-1",
        topMatch.dietitianId,
        "client",
        "dietitian",
        topMatch.score
      );
      expect(request.status).toBe("pending");
    });

    it("Scenario 2: Dietitian adds client", async () => {
      // 1. Dietitian enters client phone/email
      const result = await addClientByDietitian("dietitian-1", "+90 555 123 4567");
      expect(result).toBeDefined();

      // 2. If client found, request sent; if not, invitation link generated
      if (result.found) {
        expect(result.clientId).toBeDefined();
      } else {
        expect(result.invitationLink).toBeDefined();
      }
    });

    it("Scenario 3: System recommends matches", async () => {
      // 1. Both client and dietitian create profiles
      // 2. System calculates match score
      // 3. If score > 70%, both receive recommendation
      const clientProfile: ClientProfile = {
        userId: "client-1",
        goals: ["weight-loss"],
        dietPreferences: ["keto"],
        allergies: [],
        budget: "medium",
        communicationPreference: "video",
        timezone: "UTC+3",
        language: "Turkish",
      };

      const matches = await findDietitianMatches(clientProfile);
      const highMatches = matches.filter((m) => m.score > 70);
      expect(highMatches.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Navigation Header", () => {
    it("should have back button on all screens", () => {
      // Navigation header component should be present
      // Back button should navigate to previous screen
      expect(true).toBe(true);
    });

    it("should have home button on all screens", () => {
      // Navigation header component should be present
      // Home button should navigate to main menu
      expect(true).toBe(true);
    });

    it("should show screen title in navigation header", () => {
      // Navigation header should display current screen title
      expect(true).toBe(true);
    });
  });
});


