/**
 * Meal Plan Templates Service
 * Provides pre-built meal plan templates (Keto, Mediterranean, Vegetarian, etc.)
 * Allows dietitians to customize and assign to clients
 */

export type MealPlanType = 
  | "keto"
  | "mediterranean"
  | "vegetarian"
  | "vegan"
  | "glutenfree"
  | "lowcarb"
  | "highprotein"
  | "balanced";

export interface MealPlanTemplate {
  id: string;
  name: string;
  type: MealPlanType;
  description: string;
  icon: string;
  dailyCalories: number;
  macros: {
    protein: number; // percentage
    carbs: number; // percentage
    fat: number; // percentage
  };
  meals: MealTemplate[];
  benefits: string[];
  restrictions: string[];
  createdAt: number;
}

export interface MealTemplate {
  id: string;
  name: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  items: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface ClientMealPlan {
  id: string;
  clientId: string;
  dietitianId: string;
  templateId: string;
  templateType: MealPlanType;
  customizations: MealPlanCustomization[];
  startDate: number;
  endDate?: number;
  status: "active" | "completed" | "paused";
  createdAt: number;
  updatedAt: number;
}

export interface MealPlanCustomization {
  mealId: string;
  changes: {
    addedItems?: string[];
    removedItems?: string[];
    substitutions?: Record<string, string>;
  };
  notes?: string;
}

/**
 * Meal Plan Templates Service
 */
export class MealPlanTemplatesService {
  private static instance: MealPlanTemplatesService;
  private templates: Map<string, MealPlanTemplate> = new Map();
  private clientPlans: Map<string, ClientMealPlan> = new Map();

  private constructor() {
    this.initializeTemplates();
  }

  static getInstance(): MealPlanTemplatesService {
    if (!MealPlanTemplatesService.instance) {
      MealPlanTemplatesService.instance = new MealPlanTemplatesService();
    }
    return MealPlanTemplatesService.instance;
  }

  /**
   * Initialize meal plan templates
   */
  private initializeTemplates(): void {
    const templates: MealPlanTemplate[] = [
      {
        id: "template-keto",
        name: "Ketojenik Diyet",
        type: "keto",
        description: "Düşük karbonhidrat, yüksek yağ diyeti. Hızlı kilo kaybı için ideal.",
        icon: "🥑",
        dailyCalories: 1800,
        macros: { protein: 25, carbs: 5, fat: 70 },
        meals: [
          {
            id: "meal-keto-breakfast",
            name: "Sabah Kahvaltısı",
            type: "breakfast",
            items: ["Yumurta (3 adet)", "Tereyağı (1 tbsp)", "Peynir (30g)"],
            calories: 450,
            protein: 20,
            carbs: 3,
            fat: 35,
          },
          {
            id: "meal-keto-lunch",
            name: "Öğle Yemeği",
            type: "lunch",
            items: ["Tavuk Göğsü (150g)", "Zeytin Yağı (1 tbsp)", "Yeşil Salata"],
            calories: 550,
            protein: 45,
            carbs: 5,
            fat: 38,
          },
          {
            id: "meal-keto-dinner",
            name: "Akşam Yemeği",
            type: "dinner",
            items: ["Balık (150g)", "Tereyağ (1 tbsp)", "Brokoli"],
            calories: 600,
            protein: 50,
            carbs: 8,
            fat: 40,
          },
          {
            id: "meal-keto-snack",
            name: "Ara Öğün",
            type: "snack",
            items: ["Peynir (50g)", "Badem (20g)"],
            calories: 200,
            protein: 12,
            carbs: 4,
            fat: 15,
          },
        ],
        benefits: ["Hızlı kilo kaybı", "Kan şekeri kontrolü", "Enerji artışı"],
        restrictions: ["Tahıllar", "Şeker", "Çoğu meyve"],
        createdAt: Date.now(),
      },
      {
        id: "template-mediterranean",
        name: "Akdeniz Diyeti",
        type: "mediterranean",
        description: "Sağlıklı yağlar, sebzeler ve balık ağırlıklı. Kalp sağlığı için ideal.",
        icon: "🫒",
        dailyCalories: 2000,
        macros: { protein: 20, carbs: 50, fat: 30 },
        meals: [
          {
            id: "meal-med-breakfast",
            name: "Sabah Kahvaltısı",
            type: "breakfast",
            items: ["Ekmek (2 dilim)", "Zeytinyağı (1 tbsp)", "Domates", "Peynir"],
            calories: 400,
            protein: 12,
            carbs: 45,
            fat: 18,
          },
          {
            id: "meal-med-lunch",
            name: "Öğle Yemeği",
            type: "lunch",
            items: ["Balık (150g)", "Zeytinyağı (1 tbsp)", "Çoban Salatası", "Ekmek"],
            calories: 550,
            protein: 35,
            carbs: 50,
            fat: 20,
          },
          {
            id: "meal-med-dinner",
            name: "Akşam Yemeği",
            type: "dinner",
            items: ["Tavuk (120g)", "Zeytinyağı (1 tbsp)", "Sebze Yemeği", "Pirinç"],
            calories: 650,
            protein: 35,
            carbs: 60,
            fat: 22,
          },
          {
            id: "meal-med-snack",
            name: "Ara Öğün",
            type: "snack",
            items: ["Meyve (Elma)", "Badem (20g)"],
            calories: 200,
            protein: 5,
            carbs: 25,
            fat: 8,
          },
        ],
        benefits: ["Kalp sağlığı", "Uzun ömürlülük", "Dengeli beslenme"],
        restrictions: ["Kırmızı et (sınırlı)", "Işlenmiş gıdalar"],
        createdAt: Date.now(),
      },
      {
        id: "template-vegetarian",
        name: "Vejetaryen Diyet",
        type: "vegetarian",
        description: "Hayvansal et olmayan, protein açısından zengin vejetaryen diyet.",
        icon: "🥬",
        dailyCalories: 1900,
        macros: { protein: 18, carbs: 55, fat: 27 },
        meals: [
          {
            id: "meal-veg-breakfast",
            name: "Sabah Kahvaltısı",
            type: "breakfast",
            items: ["Yumurta (2 adet)", "Ekmek (2 dilim)", "Tereyağı", "Reçel"],
            calories: 420,
            protein: 14,
            carbs: 48,
            fat: 16,
          },
          {
            id: "meal-veg-lunch",
            name: "Öğle Yemeği",
            type: "lunch",
            items: ["Mercimek Çorbası", "Ekmek", "Salata", "Yoğurt"],
            calories: 520,
            protein: 18,
            carbs: 65,
            fat: 14,
          },
          {
            id: "meal-veg-dinner",
            name: "Akşam Yemeği",
            type: "dinner",
            items: ["Tofu (150g)", "Sebze Yemeği", "Pirinç", "Zeytinyağı"],
            calories: 580,
            protein: 20,
            carbs: 62,
            fat: 20,
          },
          {
            id: "meal-veg-snack",
            name: "Ara Öğün",
            type: "snack",
            items: ["Meyve (Muz)", "Fındık (20g)"],
            calories: 220,
            protein: 6,
            carbs: 30,
            fat: 10,
          },
        ],
        benefits: ["Çevre dostu", "Kolesterol düşüşü", "Enerji artışı"],
        restrictions: ["Hayvansal et", "Balık"],
        createdAt: Date.now(),
      },
      {
        id: "template-vegan",
        name: "Vegan Diyet",
        type: "vegan",
        description: "Hiçbir hayvansal ürün içermeyen, tamamen bitkisel diyet.",
        icon: "🌱",
        dailyCalories: 1850,
        macros: { protein: 16, carbs: 60, fat: 24 },
        meals: [
          {
            id: "meal-vegan-breakfast",
            name: "Sabah Kahvaltısı",
            type: "breakfast",
            items: ["Tahıl", "Bitki Sütü", "Muz", "Fındık Ezmesi"],
            calories: 400,
            protein: 12,
            carbs: 55,
            fat: 12,
          },
          {
            id: "meal-vegan-lunch",
            name: "Öğle Yemeği",
            type: "lunch",
            items: ["Nohut Salatası", "Ekmek", "Sebze", "Zeytinyağı"],
            calories: 520,
            protein: 16,
            carbs: 68,
            fat: 16,
          },
          {
            id: "meal-vegan-dinner",
            name: "Akşam Yemeği",
            type: "dinner",
            items: ["Mercimek Yemeği", "Pirinç", "Sebze", "Zeytinyağı"],
            calories: 580,
            protein: 18,
            carbs: 72,
            fat: 16,
          },
          {
            id: "meal-vegan-snack",
            name: "Ara Öğün",
            type: "snack",
            items: ["Meyve (Elma)", "Yer Fıstığı (20g)"],
            calories: 220,
            protein: 8,
            carbs: 28,
            fat: 10,
          },
        ],
        benefits: ["Etik yaşam", "Çevre koruma", "Sağlık"],
        restrictions: ["Tüm hayvansal ürünler"],
        createdAt: Date.now(),
      },
      {
        id: "template-glutenfree",
        name: "Glutensiz Diyet",
        type: "glutenfree",
        description: "Gluten içermeyen, çölyak hastalığı için uygun diyet.",
        icon: "🌾",
        dailyCalories: 2000,
        macros: { protein: 22, carbs: 48, fat: 30 },
        meals: [
          {
            id: "meal-gf-breakfast",
            name: "Sabah Kahvaltısı",
            type: "breakfast",
            items: ["Yumurta (2 adet)", "Glutensiz Ekmek", "Tereyağı", "Meyve"],
            calories: 420,
            protein: 16,
            carbs: 40,
            fat: 18,
          },
          {
            id: "meal-gf-lunch",
            name: "Öğle Yemeği",
            type: "lunch",
            items: ["Tavuk (150g)", "Pirinç", "Salata", "Zeytinyağı"],
            calories: 550,
            protein: 40,
            carbs: 48,
            fat: 20,
          },
          {
            id: "meal-gf-dinner",
            name: "Akşam Yemeği",
            type: "dinner",
            items: ["Balık (150g)", "Patates", "Sebze", "Zeytinyağı"],
            calories: 600,
            protein: 38,
            carbs: 50,
            fat: 24,
          },
          {
            id: "meal-gf-snack",
            name: "Ara Öğün",
            type: "snack",
            items: ["Meyve", "Badem"],
            calories: 200,
            protein: 6,
            carbs: 24,
            fat: 10,
          },
        ],
        benefits: ["Çölyak uyumlu", "Sindirim rahatlığı", "Enerji"],
        restrictions: ["Gluten içeren ürünler"],
        createdAt: Date.now(),
      },
      {
        id: "template-highprotein",
        name: "Yüksek Protein Diyeti",
        type: "highprotein",
        description: "Kas gelişimi ve kilo kaybı için yüksek protein diyeti.",
        icon: "💪",
        dailyCalories: 2200,
        macros: { protein: 35, carbs: 40, fat: 25 },
        meals: [
          {
            id: "meal-hp-breakfast",
            name: "Sabah Kahvaltısı",
            type: "breakfast",
            items: ["Yumurta (3 adet)", "Ekmek", "Tereyağı"],
            calories: 500,
            protein: 25,
            carbs: 40,
            fat: 20,
          },
          {
            id: "meal-hp-lunch",
            name: "Öğle Yemeği",
            type: "lunch",
            items: ["Tavuk Göğsü (200g)", "Pirinç", "Salata"],
            calories: 600,
            protein: 50,
            carbs: 50,
            fat: 12,
          },
          {
            id: "meal-hp-dinner",
            name: "Akşam Yemeği",
            type: "dinner",
            items: ["Balık (200g)", "Patates", "Sebze"],
            calories: 650,
            protein: 55,
            carbs: 45,
            fat: 15,
          },
          {
            id: "meal-hp-snack",
            name: "Ara Öğün",
            type: "snack",
            items: ["Protein Shake", "Muz"],
            calories: 250,
            protein: 30,
            carbs: 25,
            fat: 5,
          },
        ],
        benefits: ["Kas gelişimi", "Hızlı kilo kaybı", "Gücü artırma"],
        restrictions: ["Yağlı gıdalar"],
        createdAt: Date.now(),
      },
    ];

    templates.forEach((template) => {
      this.templates.set(template.id, template);
    });
  }

  /**
   * Get all templates
   */
  getAllTemplates(): MealPlanTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get template by type
   */
  getTemplateByType(type: MealPlanType): MealPlanTemplate | null {
    return (
      Array.from(this.templates.values()).find((t) => t.type === type) || null
    );
  }

  /**
   * Get template by ID
   */
  getTemplateById(id: string): MealPlanTemplate | null {
    return this.templates.get(id) || null;
  }

  /**
   * Create client meal plan from template
   */
  createClientMealPlan(
    clientId: string,
    dietitianId: string,
    templateId: string
  ): ClientMealPlan | null {
    const template = this.templates.get(templateId);
    if (!template) return null;

    const plan: ClientMealPlan = {
      id: `plan-${Date.now()}`,
      clientId,
      dietitianId,
      templateId,
      templateType: template.type,
      customizations: [],
      startDate: Date.now(),
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.clientPlans.set(plan.id, plan);
    return plan;
  }

  /**
   * Get client meal plans
   */
  getClientMealPlans(clientId: string): ClientMealPlan[] {
    return Array.from(this.clientPlans.values()).filter(
      (p) => p.clientId === clientId
    );
  }

  /**
   * Customize meal plan
   */
  customizeMealPlan(
    planId: string,
    mealId: string,
    customization: MealPlanCustomization
  ): ClientMealPlan | null {
    const plan = this.clientPlans.get(planId);
    if (!plan) return null;

    const existing = plan.customizations.find((c) => c.mealId === mealId);
    if (existing) {
      existing.changes = customization.changes;
      existing.notes = customization.notes;
    } else {
      plan.customizations.push(customization);
    }

    plan.updatedAt = Date.now();
    this.clientPlans.set(planId, plan);

    return plan;
  }

  /**
   * Update plan status
   */
  updatePlanStatus(
    planId: string,
    status: "active" | "completed" | "paused"
  ): ClientMealPlan | null {
    const plan = this.clientPlans.get(planId);
    if (!plan) return null;

    plan.status = status;
    plan.updatedAt = Date.now();

    if (status === "completed") {
      plan.endDate = Date.now();
    }

    this.clientPlans.set(planId, plan);
    return plan;
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalTemplates: number;
    totalClientPlans: number;
    activePlans: number;
    completedPlans: number;
  } {
    const activePlans = Array.from(this.clientPlans.values()).filter(
      (p) => p.status === "active"
    ).length;
    const completedPlans = Array.from(this.clientPlans.values()).filter(
      (p) => p.status === "completed"
    ).length;

    return {
      totalTemplates: this.templates.size,
      totalClientPlans: this.clientPlans.size,
      activePlans,
      completedPlans,
    };
  }
}

export const mealPlanTemplatesService = MealPlanTemplatesService.getInstance();
