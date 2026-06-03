/**
 * Micronutrient Tracking Service
 * Tracks vitamins, minerals, fiber and other micronutrients
 */

export type MicronutrientType =
  | "vitamin_a"
  | "vitamin_b12"
  | "vitamin_c"
  | "vitamin_d"
  | "vitamin_e"
  | "vitamin_k"
  | "folate"
  | "iron"
  | "calcium"
  | "magnesium"
  | "potassium"
  | "zinc"
  | "fiber"
  | "omega3"
  | "sodium";

export interface Micronutrient {
  id: string;
  type: MicronutrientType;
  name: string;
  unit: string;
  dailyRecommendation: number;
  icon: string;
  category: "vitamin" | "mineral" | "other";
  benefits: string[];
  sources: string[];
}

export interface MicronutrientTarget {
  id: string;
  userId: string;
  micronutrientType: MicronutrientType;
  dailyTarget: number;
  priority: "high" | "medium" | "low";
  startDate: number;
  endDate?: number;
  notes?: string;
}

export interface DailyMicronutrientLog {
  id: string;
  userId: string;
  date: number;
  entries: MicronutrientEntry[];
  totalIntake: Record<MicronutrientType, number>;
}

export interface MicronutrientEntry {
  id: string;
  micronutrientType: MicronutrientType;
  amount: number;
  source: string; // food name
  timestamp: number;
}

export interface MicronutrientAnalysis {
  userId: string;
  period: "daily" | "weekly" | "monthly";
  startDate: number;
  endDate: number;
  micronutrients: MicronutrientStats[];
  overallScore: number; // 0-100
  deficiencies: MicronutrientType[];
  excesses: MicronutrientType[];
  recommendations: string[];
}

export interface MicronutrientStats {
  type: MicronutrientType;
  name: string;
  averageIntake: number;
  target: number;
  percentage: number; // intake/target * 100
  trend: "improving" | "stable" | "declining";
  status: "deficient" | "adequate" | "excess";
}

/**
 * Micronutrient Tracking Service
 */
export class MicronutrientTrackingService {
  private static instance: MicronutrientTrackingService;
  private micronutrients: Map<MicronutrientType, Micronutrient> = new Map();
  private targets: Map<string, MicronutrientTarget[]> = new Map();
  private logs: Map<string, DailyMicronutrientLog[]> = new Map();

  private constructor() {
    this.initializeMicronutrients();
  }

  static getInstance(): MicronutrientTrackingService {
    if (!MicronutrientTrackingService.instance) {
      MicronutrientTrackingService.instance = new MicronutrientTrackingService();
    }
    return MicronutrientTrackingService.instance;
  }

  /**
   * Initialize micronutrients database
   */
  private initializeMicronutrients(): void {
    const micronutrients: Micronutrient[] = [
      {
        id: "micro-vitamin-a",
        type: "vitamin_a",
        name: "Vitamin A",
        unit: "μg",
        dailyRecommendation: 900,
        icon: "👁️",
        category: "vitamin",
        benefits: ["Göz sağlığı", "Bağışıklık sistemi", "Cilt sağlığı"],
        sources: ["Havuç", "Tatlı patates", "Spinat", "Kale", "Kabaklı"],
      },
      {
        id: "micro-vitamin-b12",
        type: "vitamin_b12",
        name: "Vitamin B12",
        unit: "μg",
        dailyRecommendation: 2.4,
        icon: "🧠",
        category: "vitamin",
        benefits: ["Enerji üretimi", "Sinir sistemi", "DNA sentezi"],
        sources: ["Tavuk", "Balık", "Yumurta", "Süt", "Peynir"],
      },
      {
        id: "micro-vitamin-c",
        type: "vitamin_c",
        name: "Vitamin C",
        unit: "mg",
        dailyRecommendation: 90,
        icon: "🍊",
        category: "vitamin",
        benefits: ["Bağışıklık sistemi", "Kolajen üretimi", "Antioksidan"],
        sources: ["Portakal", "Kiwi", "Çilek", "Brokoli", "Domates"],
      },
      {
        id: "micro-vitamin-d",
        type: "vitamin_d",
        name: "Vitamin D",
        unit: "IU",
        dailyRecommendation: 600,
        icon: "☀️",
        category: "vitamin",
        benefits: ["Kemik sağlığı", "Kalsiyum emilimi", "Bağışıklık"],
        sources: ["Balık yağı", "Yumurta", "Mantarlar", "Güneş ışığı"],
      },
      {
        id: "micro-iron",
        type: "iron",
        name: "Demir",
        unit: "mg",
        dailyRecommendation: 8,
        icon: "⚡",
        category: "mineral",
        benefits: ["Oksijen taşıma", "Enerji", "Bilişsel fonksiyon"],
        sources: ["Kırmızı et", "Tavuk", "Mercimek", "Nohut", "Spinat"],
      },
      {
        id: "micro-calcium",
        type: "calcium",
        name: "Kalsiyum",
        unit: "mg",
        dailyRecommendation: 1000,
        icon: "🦴",
        category: "mineral",
        benefits: ["Kemik sağlığı", "Diş sağlığı", "Kas kasılması"],
        sources: ["Süt", "Yoğurt", "Peynir", "Brokoli", "Kale"],
      },
      {
        id: "micro-magnesium",
        type: "magnesium",
        name: "Magnezyum",
        unit: "mg",
        dailyRecommendation: 400,
        icon: "💪",
        category: "mineral",
        benefits: ["Kas işlevi", "Enerji üretimi", "Stres azaltma"],
        sources: ["Badem", "Fındık", "Tohumlar", "Yeşil yapraklı sebzeler"],
      },
      {
        id: "micro-potassium",
        type: "potassium",
        name: "Potasyum",
        unit: "mg",
        dailyRecommendation: 3500,
        icon: "🍌",
        category: "mineral",
        benefits: ["Kalp sağlığı", "Kan basıncı", "Kas fonksiyonu"],
        sources: ["Muz", "Avokado", "Patates", "Spinat", "Domates"],
      },
      {
        id: "micro-zinc",
        type: "zinc",
        name: "Çinko",
        unit: "mg",
        dailyRecommendation: 11,
        icon: "🛡️",
        category: "mineral",
        benefits: ["Bağışıklık sistemi", "Yara iyileşmesi", "Protein sentezi"],
        sources: ["Ostralar", "Kırmızı et", "Tavuk", "Badem", "Tohum"],
      },
      {
        id: "micro-fiber",
        type: "fiber",
        name: "Lif",
        unit: "g",
        dailyRecommendation: 25,
        icon: "🌾",
        category: "other",
        benefits: ["Sindirim sağlığı", "Kan şekeri kontrolü", "Kolesterol"],
        sources: ["Tam tahıl", "Meyve", "Sebze", "Legüm", "Tohumlar"],
      },
      {
        id: "micro-omega3",
        type: "omega3",
        name: "Omega-3",
        unit: "mg",
        dailyRecommendation: 1600,
        icon: "🐟",
        category: "other",
        benefits: ["Kalp sağlığı", "Beyin fonksiyonu", "İltihaplanma"],
        sources: ["Balık", "Balık yağı", "Çiğ tohum", "Ceviz", "Avokado"],
      },
    ];

    micronutrients.forEach((micro) => {
      this.micronutrients.set(micro.type, micro);
    });
  }

  /**
   * Get all micronutrients
   */
  getAllMicronutrients(): Micronutrient[] {
    return Array.from(this.micronutrients.values());
  }

  /**
   * Get micronutrient by type
   */
  getMicronutrient(type: MicronutrientType): Micronutrient | null {
    return this.micronutrients.get(type) || null;
  }

  /**
   * Set daily target for micronutrient
   */
  setDailyTarget(
    userId: string,
    micronutrientType: MicronutrientType,
    dailyTarget: number,
    priority: "high" | "medium" | "low" = "medium"
  ): MicronutrientTarget {
    const target: MicronutrientTarget = {
      id: `target-${Date.now()}`,
      userId,
      micronutrientType,
      dailyTarget,
      priority,
      startDate: Date.now(),
    };

    if (!this.targets.has(userId)) {
      this.targets.set(userId, []);
    }

    this.targets.get(userId)!.push(target);
    return target;
  }

  /**
   * Get user targets
   */
  getUserTargets(userId: string): MicronutrientTarget[] {
    return this.targets.get(userId) || [];
  }

  /**
   * Log micronutrient intake
   */
  logMicronutrient(
    userId: string,
    micronutrientType: MicronutrientType,
    amount: number,
    source: string
  ): DailyMicronutrientLog {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateKey = today.getTime();

    let log = this.logs.get(userId)?.find((l) => l.date === dateKey);

    if (!log) {
      log = {
        id: `log-${Date.now()}`,
        userId,
        date: dateKey,
        entries: [],
        totalIntake: {} as Record<MicronutrientType, number>,
      };

      if (!this.logs.has(userId)) {
        this.logs.set(userId, []);
      }

      this.logs.get(userId)!.push(log);
    }

    const entry: MicronutrientEntry = {
      id: `entry-${Date.now()}`,
      micronutrientType,
      amount,
      source,
      timestamp: Date.now(),
    };

    log.entries.push(entry);

    // Update total intake
    if (!log.totalIntake[micronutrientType]) {
      log.totalIntake[micronutrientType] = 0;
    }
    log.totalIntake[micronutrientType] += amount;

    return log;
  }

  /**
   * Get daily log
   */
  getDailyLog(userId: string, date?: number): DailyMicronutrientLog | null {
    const targetDate = date || new Date().setHours(0, 0, 0, 0);
    return this.logs.get(userId)?.find((l) => l.date === targetDate) || null;
  }

  /**
   * Analyze micronutrient intake
   */
  analyzeIntake(
    userId: string,
    period: "daily" | "weekly" | "monthly" = "daily"
  ): MicronutrientAnalysis {
    const userLogs = this.logs.get(userId) || [];
    const userTargets = this.targets.get(userId) || [];

    const now = Date.now();
    let startDate = now;

    if (period === "weekly") {
      startDate = now - 7 * 24 * 60 * 60 * 1000;
    } else if (period === "monthly") {
      startDate = now - 30 * 24 * 60 * 60 * 1000;
    }

    const relevantLogs = userLogs.filter((l) => l.date >= startDate && l.date <= now);

    // Calculate averages
    const micronutrientStats: MicronutrientStats[] = [];
    const intakeTotals: Record<MicronutrientType, number> = {} as any;
    const intakeCounts: Record<MicronutrientType, number> = {} as any;

    relevantLogs.forEach((log) => {
      Object.entries(log.totalIntake).forEach(([type, amount]) => {
        const key = type as MicronutrientType;
        intakeTotals[key] = (intakeTotals[key] || 0) + amount;
        intakeCounts[key] = (intakeCounts[key] || 0) + 1;
      });
    });

    this.micronutrients.forEach((micro) => {
      const averageIntake = intakeCounts[micro.type]
        ? intakeTotals[micro.type] / intakeCounts[micro.type]
        : 0;

      const target =
        userTargets.find((t) => t.micronutrientType === micro.type)?.dailyTarget ||
        micro.dailyRecommendation;

      const percentage = (averageIntake / target) * 100;

      let status: "deficient" | "adequate" | "excess" = "adequate";
      if (percentage < 75) status = "deficient";
      if (percentage > 120) status = "excess";

      micronutrientStats.push({
        type: micro.type,
        name: micro.name,
        averageIntake,
        target,
        percentage,
        trend: "stable",
        status,
      });
    });

    const deficiencies = micronutrientStats
      .filter((s) => s.status === "deficient")
      .map((s) => s.type);

    const excesses = micronutrientStats
      .filter((s) => s.status === "excess")
      .map((s) => s.type);

    const overallScore = Math.round(
      micronutrientStats.reduce((sum, s) => sum + Math.min(s.percentage, 100), 0) /
        micronutrientStats.length
    );

    const recommendations = this.generateRecommendations(
      micronutrientStats,
      deficiencies
    );

    return {
      userId,
      period,
      startDate,
      endDate: now,
      micronutrients: micronutrientStats,
      overallScore,
      deficiencies,
      excesses,
      recommendations,
    };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    stats: MicronutrientStats[],
    deficiencies: MicronutrientType[]
  ): string[] {
    const recommendations: string[] = [];

    deficiencies.forEach((type) => {
      const micro = this.micronutrients.get(type);
      if (micro) {
        recommendations.push(
          `${micro.name} eksikliği tespit edildi. Lütfen ${micro.sources.slice(0, 2).join(", ")} tüketimini artırınız.`
        );
      }
    });

    if (recommendations.length === 0) {
      recommendations.push("Mikro besin alımınız dengeli görünüyor. Devam edin!");
    }

    return recommendations;
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalMicronutrients: number;
    totalTargets: number;
    totalLogs: number;
  } {
    const totalLogs = Array.from(this.logs.values()).reduce(
      (sum, arr) => sum + arr.length,
      0
    );

    return {
      totalMicronutrients: this.micronutrients.size,
      totalTargets: Array.from(this.targets.values()).reduce(
        (sum, arr) => sum + arr.length,
        0
      ),
      totalLogs,
    };
  }
}

export const micronutrientTrackingService = MicronutrientTrackingService.getInstance();
