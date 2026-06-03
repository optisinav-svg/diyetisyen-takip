/**
 * Matching Algorithm Service
 * Matches clients with dietitians based on compatibility
 */

export type DietType =
  | "keto"
  | "mediterranean"
  | "vegetarian"
  | "vegan"
  | "glutenfree"
  | "highprotein"
  | "lowcarb"
  | "paleo";

export type ExpertiseArea =
  | "weight_loss"
  | "muscle_gain"
  | "diabetes"
  | "heart_health"
  | "sports_nutrition"
  | "pediatric"
  | "geriatric"
  | "pregnancy";

export interface ClientProfile {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  goals: string[];
  preferredDietTypes: DietType[];
  allergies: string[];
  restrictions: string[];
  healthConditions: string[];
  preferredLanguage: string;
  budget: "low" | "medium" | "high";
  communicationPreference: "chat" | "call" | "video" | "mixed";
  timezone: string;
  createdAt: number;
  score?: number;
}

export interface DietitianProfile {
  id: string;
  name: string;
  specialties: ExpertiseArea[];
  certifications: string[];
  yearsOfExperience: number;
  languages: string[];
  hourlyRate: number;
  availableSlots: number;
  communicationMethods: ("chat" | "call" | "video")[];
  timezone: string;
  clientsServed: number;
  rating: number;
  supportedDietTypes: DietType[];
  bio: string;
  createdAt: number;
}

export interface MatchingScore {
  clientId: string;
  dietitianId: string;
  score: number; // 0-100
  factors: MatchingFactor[];
  compatibility: "excellent" | "good" | "fair" | "poor";
}

export interface MatchingFactor {
  name: string;
  weight: number; // 0-1
  score: number; // 0-100
  contribution: number; // weight * score
}

export interface MatchingResult {
  clientId: string;
  matches: MatchingScore[];
  topMatches: MatchingScore[];
  timestamp: number;
}

/**
 * Matching Algorithm Service
 */
export class MatchingAlgorithmService {
  private static instance: MatchingAlgorithmService;
  private clients: Map<string, ClientProfile> = new Map();
  private dietitians: Map<string, DietitianProfile> = new Map();
  private matchingResults: Map<string, MatchingResult> = new Map();

  private constructor() {
    this.initializeSampleData();
  }

  static getInstance(): MatchingAlgorithmService {
    if (!MatchingAlgorithmService.instance) {
      MatchingAlgorithmService.instance = new MatchingAlgorithmService();
    }
    return MatchingAlgorithmService.instance;
  }

  /**
   * Initialize sample data
   */
  private initializeSampleData(): void {
    // Sample dietitians
    const sampleDietitians: DietitianProfile[] = [
      {
        id: "dietitian-1",
        name: "Dr. Ayşe Yılmaz",
        specialties: ["weight_loss", "diabetes"],
        certifications: ["RD", "CSSD"],
        yearsOfExperience: 8,
        languages: ["Turkish", "English"],
        hourlyRate: 150,
        availableSlots: 5,
        communicationMethods: ["chat", "call", "video"],
        timezone: "Europe/Istanbul",
        clientsServed: 250,
        rating: 4.8,
        supportedDietTypes: ["keto", "lowcarb", "mediterranean"],
        bio: "Kilo kaybı ve diyabet yönetiminde uzman",
        createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
      },
      {
        id: "dietitian-2",
        name: "Mehmet Demir",
        specialties: ["muscle_gain", "sports_nutrition"],
        certifications: ["RD", "ISSN-SNS"],
        yearsOfExperience: 6,
        languages: ["Turkish", "English"],
        hourlyRate: 120,
        availableSlots: 3,
        communicationMethods: ["chat", "video"],
        timezone: "Europe/Istanbul",
        clientsServed: 180,
        rating: 4.6,
        supportedDietTypes: ["highprotein", "paleo"],
        bio: "Spor beslenme ve kas geliştirmede uzman",
        createdAt: Date.now() - 200 * 24 * 60 * 60 * 1000,
      },
      {
        id: "dietitian-3",
        name: "Fatma Kaya",
        specialties: ["pregnancy", "pediatric", "weight_loss"],
        certifications: ["RD", "VEG"],
        yearsOfExperience: 10,
        languages: ["Turkish", "English", "Arabic"],
        hourlyRate: 140,
        availableSlots: 4,
        communicationMethods: ["chat", "call", "video"],
        timezone: "Europe/Istanbul",
        clientsServed: 320,
        rating: 4.9,
        supportedDietTypes: ["vegetarian", "vegan", "mediterranean", "glutenfree"],
        bio: "Vejetaryen/vegan beslenme ve hamilelik döneminde uzman",
        createdAt: Date.now() - 400 * 24 * 60 * 60 * 1000,
      },
    ];

    sampleDietitians.forEach((d) => this.dietitians.set(d.id, d));
  }

  /**
   * Add client profile
   */
  addClientProfile(profile: ClientProfile): ClientProfile {
    this.clients.set(profile.id, profile);
    return profile;
  }

  /**
   * Get client profile
   */
  getClientProfile(clientId: string): ClientProfile | null {
    return this.clients.get(clientId) || null;
  }

  /**
   * Get all dietitians
   */
  getAllDietitians(): DietitianProfile[] {
    return Array.from(this.dietitians.values());
  }

  /**
   * Calculate matching score
   */
  private calculateMatchingScore(
    client: ClientProfile,
    dietitian: DietitianProfile
  ): MatchingScore {
    const factors: MatchingFactor[] = [];

    // 1. Diet Type Compatibility (25%)
    const dietTypeOverlap = client.preferredDietTypes.filter((d) =>
      dietitian.supportedDietTypes.includes(d)
    ).length;
    const dietTypeScore =
      (dietTypeOverlap / Math.max(client.preferredDietTypes.length, 1)) * 100;
    factors.push({
      name: "Diet Type Compatibility",
      weight: 0.25,
      score: dietTypeScore,
      contribution: 0,
    });

    // 2. Expertise Match (25%)
    const clientGoalsToExpertise: Record<string, ExpertiseArea> = {
      "weight loss": "weight_loss",
      "muscle gain": "muscle_gain",
      "diabetes management": "diabetes",
      "heart health": "heart_health",
      "sports nutrition": "sports_nutrition",
    };

    let expertiseMatches = 0;
    Object.entries(clientGoalsToExpertise).forEach(([goal, expertise]) => {
      if (
        client.goals.some((g) => g.toLowerCase().includes(goal)) &&
        dietitian.specialties.includes(expertise)
      ) {
        expertiseMatches++;
      }
    });

    const expertiseScore = (expertiseMatches / Math.max(client.goals.length, 1)) * 100;
    factors.push({
      name: "Expertise Match",
      weight: 0.25,
      score: expertiseScore,
      contribution: 0,
    });

    // 3. Communication Preference Match (20%)
    const commMatch = dietitian.communicationMethods.includes(
      client.communicationPreference === "mixed" ? "chat" : client.communicationPreference
    );
    const commScore = commMatch ? 100 : 50;
    factors.push({
      name: "Communication Preference",
      weight: 0.2,
      score: commScore,
      contribution: 0,
    });

    // 4. Budget Compatibility (15%)
    const budgetScores: Record<string, number> = {
      low: dietitian.hourlyRate < 100 ? 100 : 50,
      medium: dietitian.hourlyRate >= 100 && dietitian.hourlyRate <= 150 ? 100 : 75,
      high: dietitian.hourlyRate > 150 ? 100 : 75,
    };
    const budgetScore = budgetScores[client.budget] || 50;
    factors.push({
      name: "Budget Compatibility",
      weight: 0.15,
      score: budgetScore,
      contribution: 0,
    });

    // 5. Availability (10%)
    const availabilityScore = dietitian.availableSlots > 0 ? 100 : 0;
    factors.push({
      name: "Availability",
      weight: 0.1,
      score: availabilityScore,
      contribution: 0,
    });

    // Calculate total score
    let totalScore = 0;
    factors.forEach((factor) => {
      factor.contribution = (factor.weight * factor.score) / 100;
      totalScore += factor.contribution * 100;
    });

    // Determine compatibility
    let compatibility: "excellent" | "good" | "fair" | "poor" = "poor";
    if (totalScore >= 85) compatibility = "excellent";
    else if (totalScore >= 70) compatibility = "good";
    else if (totalScore >= 55) compatibility = "fair";

    return {
      clientId: client.id,
      dietitianId: dietitian.id,
      score: Math.round(totalScore),
      factors,
      compatibility,
    };
  }

  /**
   * Find matches for client
   */
  findMatches(clientId: string, topN: number = 5): MatchingResult {
    const client = this.clients.get(clientId);
    if (!client) {
      throw new Error("Client not found");
    }

    const matches: MatchingScore[] = [];

    this.dietitians.forEach((dietitian) => {
      const score = this.calculateMatchingScore(client, dietitian);
      matches.push(score);
    });

    // Sort by score descending
    matches.sort((a, b) => b.score - a.score);

    const result: MatchingResult = {
      clientId,
      matches,
      topMatches: matches.slice(0, topN),
      timestamp: Date.now(),
    };

    this.matchingResults.set(clientId, result);
    return result;
  }

  /**
   * Get matching result
   */
  getMatchingResult(clientId: string): MatchingResult | null {
    return this.matchingResults.get(clientId) || null;
  }

  /**
   * Get dietitian details
   */
  getDietitianDetails(dietitianId: string): DietitianProfile | null {
    return this.dietitians.get(dietitianId) || null;
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalClients: number;
    totalDietitians: number;
    totalMatches: number;
  } {
    return {
      totalClients: this.clients.size,
      totalDietitians: this.dietitians.size,
      totalMatches: this.matchingResults.size,
    };
  }
}

export const matchingAlgorithmService = MatchingAlgorithmService.getInstance();
