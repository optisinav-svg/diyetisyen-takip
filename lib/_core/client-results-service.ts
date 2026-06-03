/**
 * Client Results Service
 * Provides comprehensive client performance and results data for dietitians
 */

export interface ClientMetrics {
  clientId: string;
  clientName: string;
  dietitianId: string;
  startDate: number;
  currentDate: number;
  weight: {
    initial: number;
    current: number;
    target: number;
    change: number;
    percentageChange: number;
  };
  steps: {
    avgDaily: number;
    weeklyTotal: number;
    monthlyTotal: number;
    target: number;
  };
  heartRate: {
    avgResting: number;
    avgActive: number;
    target: number;
  };
  sleep: {
    avgNightly: number;
    weeklyAvg: number;
    target: number;
  };
  calories: {
    avgDaily: number;
    weeklyAvg: number;
    target: number;
  };
  mealConsistency: number; // percentage
  goalCompletionRate: number; // percentage
  recommendationAdherenceRate: number; // percentage
  lastUpdated: number;
}

export interface ClientResult {
  clientId: string;
  clientName: string;
  dietitianId: string;
  metrics: ClientMetrics;
  successIndicators: {
    mealsLogged: number;
    goalsCompleted: number;
    recommendationsFollowed: number;
    consistencyDays: number;
  };
  areas: {
    strength: string[];
    needsImprovement: string[];
  };
  nextSteps: string[];
  generatedAt: number;
}

/**
 * Client Results Service Implementation
 */
export class ClientResultsService {
  private static instance: ClientResultsService;
  private clientResults: Map<string, ClientResult> = new Map();
  private resultListeners: Map<string, Function[]> = new Map();

  private constructor() {
    this.initializeSampleData();
  }

  static getInstance(): ClientResultsService {
    if (!ClientResultsService.instance) {
      ClientResultsService.instance = new ClientResultsService();
    }
    return ClientResultsService.instance;
  }

  /**
   * Initialize with sample results
   */
  private initializeSampleData(): void {
    const sampleResults: ClientResult[] = [
      {
        clientId: "client-1",
        clientName: "Ayşe Yılmaz",
        dietitianId: "dietitian-1",
        metrics: {
          clientId: "client-1",
          clientName: "Ayşe Yılmaz",
          dietitianId: "dietitian-1",
          startDate: Date.now() - 90 * 24 * 60 * 60 * 1000,
          currentDate: Date.now(),
          weight: {
            initial: 85,
            current: 78,
            target: 70,
            change: -7,
            percentageChange: -8.2,
          },
          steps: {
            avgDaily: 8500,
            weeklyTotal: 59500,
            monthlyTotal: 255000,
            target: 10000,
          },
          heartRate: {
            avgResting: 72,
            avgActive: 120,
            target: 70,
          },
          sleep: {
            avgNightly: 7.5,
            weeklyAvg: 7.4,
            target: 8,
          },
          calories: {
            avgDaily: 1800,
            weeklyAvg: 1850,
            target: 1750,
          },
          mealConsistency: 85,
          goalCompletionRate: 60,
          recommendationAdherenceRate: 75,
          lastUpdated: Date.now(),
        },
        successIndicators: {
          mealsLogged: 245,
          goalsCompleted: 3,
          recommendationsFollowed: 12,
          consistencyDays: 78,
        },
        areas: {
          strength: ["Tutarlı öğün kaydı", "Günlük adım hedefine yaklaşma", "Önerilere uyum"],
          needsImprovement: ["Uyku süresi", "Kalori hedefi", "Su tüketimi"],
        },
        nextSteps: [
          "Uyku süresi 8 saate çıkarma",
          "Günlük su tüketimini 2.5 litreye çıkarma",
          "Kilo kaybı hızını artırma",
        ],
        generatedAt: Date.now(),
      },
    ];

    sampleResults.forEach((result) => {
      this.clientResults.set(result.clientId, result);
    });
  }

  /**
   * Generate or update client results
   */
  async generateClientResults(
    clientId: string,
    clientName: string,
    dietitianId: string,
    metrics: ClientMetrics,
    successIndicators: {
      mealsLogged: number;
      goalsCompleted: number;
      recommendationsFollowed: number;
      consistencyDays: number;
    }
  ): Promise<ClientResult> {
    // Determine strengths and areas for improvement
    const areas = {
      strength: [] as string[],
      needsImprovement: [] as string[],
    };

    if (metrics.mealConsistency >= 80) {
      areas.strength.push("Tutarlı öğün kaydı");
    } else {
      areas.needsImprovement.push("Öğün kaydı tutarlılığı");
    }

    if (metrics.steps.avgDaily >= metrics.steps.target * 0.8) {
      areas.strength.push("Günlük adım hedefine yaklaşma");
    } else {
      areas.needsImprovement.push("Günlük adım hedefi");
    }

    if (metrics.sleep.avgNightly >= metrics.sleep.target * 0.9) {
      areas.strength.push("Yeterli uyku");
    } else {
      areas.needsImprovement.push("Uyku süresi");
    }

    if (metrics.calories.avgDaily <= metrics.calories.target * 1.05) {
      areas.strength.push("Kalori kontrolü");
    } else {
      areas.needsImprovement.push("Kalori hedefi");
    }

    if (metrics.recommendationAdherenceRate >= 70) {
      areas.strength.push("Önerilere uyum");
    } else {
      areas.needsImprovement.push("Önerilere uyum");
    }

    // Generate next steps
    const nextSteps: string[] = [];

    if (metrics.sleep.avgNightly < metrics.sleep.target) {
      nextSteps.push(`Uyku süresi ${metrics.sleep.target} saate çıkarma`);
    }

    if (metrics.calories.avgDaily > metrics.calories.target) {
      nextSteps.push("Günlük kalori alımını azaltma");
    }

    if (metrics.steps.avgDaily < metrics.steps.target) {
      nextSteps.push("Günlük adım sayısını artırma");
    }

    if (metrics.weight.change < 0 && metrics.weight.current > metrics.weight.target) {
      nextSteps.push("Kilo kaybı hızını artırma");
    }

    const result: ClientResult = {
      clientId,
      clientName,
      dietitianId,
      metrics,
      successIndicators,
      areas,
      nextSteps,
      generatedAt: Date.now(),
    };

    this.clientResults.set(clientId, result);
    this.notifyResultListeners(dietitianId, result);

    return result;
  }

  /**
   * Get client results
   */
  async getClientResults(clientId: string): Promise<ClientResult | null> {
    return this.clientResults.get(clientId) || null;
  }

  /**
   * Get all client results for dietitian
   */
  async getClientResultsForDietitian(dietitianId: string): Promise<ClientResult[]> {
    return Array.from(this.clientResults.values())
      .filter((result) => result.dietitianId === dietitianId)
      .sort((a, b) => b.generatedAt - a.generatedAt);
  }

  /**
   * Get client performance comparison
   */
  async getClientPerformanceComparison(clientId: string): Promise<{
    metricsComparison: Record<string, { current: number; target: number; percentageOfTarget: number }>;
    performanceScore: number;
    trend: "improving" | "stable" | "declining";
  }> {
    const result = await this.getClientResults(clientId);
    if (!result) {
      return {
        metricsComparison: {},
        performanceScore: 0,
        trend: "stable",
      };
    }

    const metricsComparison = {
      weight: {
        current: result.metrics.weight.current,
        target: result.metrics.weight.target,
        percentageOfTarget: ((result.metrics.weight.target - result.metrics.weight.current) / result.metrics.weight.target) * 100,
      },
      steps: {
        current: result.metrics.steps.avgDaily,
        target: result.metrics.steps.target,
        percentageOfTarget: (result.metrics.steps.avgDaily / result.metrics.steps.target) * 100,
      },
      sleep: {
        current: result.metrics.sleep.avgNightly,
        target: result.metrics.sleep.target,
        percentageOfTarget: (result.metrics.sleep.avgNightly / result.metrics.sleep.target) * 100,
      },
      calories: {
        current: result.metrics.calories.avgDaily,
        target: result.metrics.calories.target,
        percentageOfTarget: (result.metrics.calories.target / result.metrics.calories.avgDaily) * 100,
      },
    };

    const performanceScore = Math.round(
      (result.metrics.mealConsistency +
        result.metrics.goalCompletionRate +
        result.metrics.recommendationAdherenceRate) /
        3
    );

    let trend: "improving" | "stable" | "declining" = "stable";
    if (result.metrics.weight.change < 0 && result.metrics.goalCompletionRate > 50) {
      trend = "improving";
    } else if (result.metrics.weight.change > 0 || result.metrics.goalCompletionRate < 30) {
      trend = "declining";
    }

    return {
      metricsComparison,
      performanceScore,
      trend,
    };
  }

  /**
   * Get client progress over time
   */
  async getClientProgressTimeline(
    clientId: string
  ): Promise<
    Array<{
      date: number;
      weight: number;
      steps: number;
      calories: number;
      mealsLogged: number;
    }>
  > {
    const result = await this.getClientResults(clientId);
    if (!result) return [];

    // Generate sample timeline data
    const timeline = [];
    const startDate = result.metrics.startDate;
    const currentDate = result.metrics.currentDate;
    const daysDiff = Math.floor((currentDate - startDate) / (24 * 60 * 60 * 1000));

    for (let i = 0; i <= daysDiff; i += 7) {
      const date = startDate + i * 24 * 60 * 60 * 1000;
      const progressPercentage = i / daysDiff;

      timeline.push({
        date,
        weight: result.metrics.weight.initial - (result.metrics.weight.initial - result.metrics.weight.current) * progressPercentage,
        steps: Math.round(result.metrics.steps.avgDaily * (0.7 + 0.3 * Math.random())),
        calories: Math.round(result.metrics.calories.avgDaily * (0.95 + 0.1 * Math.random())),
        mealsLogged: Math.round(result.successIndicators.mealsLogged * progressPercentage),
      });
    }

    return timeline;
  }

  /**
   * Subscribe to results
   */
  subscribeToResults(dietitianId: string, callback: (result: ClientResult) => void): () => void {
    if (!this.resultListeners.has(dietitianId)) {
      this.resultListeners.set(dietitianId, []);
    }
    this.resultListeners.get(dietitianId)!.push(callback);

    return () => {
      const listeners = this.resultListeners.get(dietitianId);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Notify result listeners
   */
  private notifyResultListeners(dietitianId: string, result: ClientResult): void {
    const listeners = this.resultListeners.get(dietitianId);
    if (listeners) {
      listeners.forEach((callback) => callback(result));
    }
  }
}

// Export singleton instance
export const clientResultsService = ClientResultsService.getInstance();
