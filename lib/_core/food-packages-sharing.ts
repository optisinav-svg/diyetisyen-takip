/**
 * Food Packages Sharing Service
 * Manages sharing of food packages from dietitian to client
 */

import { activityStreamService } from "./activity-stream";
import { notificationTriggersService } from "./notification-triggers";

export interface FoodPackage {
  id: string;
  dietitianId: string;
  dietitianName: string;
  clientId: string;
  clientName: string;
  packageName: string;
  description: string;
  meals: Array<{
    mealType: "breakfast" | "lunch" | "dinner" | "snack";
    mealName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    ingredients: string[];
  }>;
  totalCalories: number;
  duration: number;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  createdAt: number;
  sharedAt?: number;
  status: "draft" | "shared" | "accepted" | "rejected" | "completed";
  clientResponse?: string;
  respondedAt?: number;
  startDate?: number;
  endDate?: number;
}

export interface PackageNotification {
  id: string;
  clientId: string;
  packageId: string;
  dietitianName: string;
  packageName: string;
  message: string;
  isRead: boolean;
  createdAt: number;
}

/**
 * Food Packages Sharing Service Implementation
 */
export class FoodPackagesSharingService {
  private static instance: FoodPackagesSharingService;
  private packages: Map<string, FoodPackage> = new Map();
  private notifications: Map<string, PackageNotification> = new Map();
  private packageListeners: Map<string, Function[]> = new Map();

  private constructor() {
    this.initializeSampleData();
  }

  static getInstance(): FoodPackagesSharingService {
    if (!FoodPackagesSharingService.instance) {
      FoodPackagesSharingService.instance = new FoodPackagesSharingService();
    }
    return FoodPackagesSharingService.instance;
  }

  /**
   * Initialize with sample packages
   */
  private initializeSampleData(): void {
    const samplePackages: FoodPackage[] = [
      {
        id: "pkg-1",
        dietitianId: "dietitian-1",
        dietitianName: "Dr. Mehmet Kaya",
        clientId: "client-1",
        clientName: "Ayşe Yılmaz",
        packageName: "Haftalık Keto Paketi",
        description: "Keto diyeti için hazırlanmış 7 günlük öğün paketi",
        meals: [
          {
            mealType: "breakfast",
            mealName: "Yumurta ve Peynir Omeleti",
            calories: 350,
            protein: 25,
            carbs: 5,
            fat: 28,
            ingredients: ["Yumurta", "Cheddar Peyniri", "Tereyağı", "Tuz", "Biber"],
          },
        ],
        totalCalories: 1200,
        duration: 7,
        difficulty: "easy",
        tags: ["keto", "düşük-karbonhidrat", "yüksek-protein"],
        createdAt: Date.now() - 86400000,
        sharedAt: Date.now() - 43200000,
        status: "shared",
      },
    ];

    samplePackages.forEach((pkg) => {
      this.packages.set(pkg.id, pkg);
    });
  }

  /**
   * Share food package with client
   */
  async sharePackageWithClient(
    packageId: string,
    dietitianId: string,
    dietitianName: string,
    clientId: string,
    clientName: string
  ): Promise<FoodPackage | null> {
    const pkg = this.packages.get(packageId);
    if (!pkg) return null;

    pkg.clientId = clientId;
    pkg.clientName = clientName;
    pkg.status = "shared";
    pkg.sharedAt = Date.now();

    this.packages.set(packageId, pkg);

    // Create activity event
    await activityStreamService.createEvent(
      dietitianId,
      dietitianName,
      "dietitian",
      "package",
      "Öğün Paketi Gönderdi",
      `"${pkg.packageName}" adlı öğün paketini gönderdi`,
      "📦",
      {
        packageName: pkg.packageName,
        duration: pkg.duration,
        totalCalories: pkg.totalCalories,
      },
      [clientId]
    );

    // Trigger notification
    await notificationTriggersService.triggerNotification(
      clientId,
      "feedback",
      `Yeni Öğün Paketi: ${dietitianName}`,
      `${dietitianName} size "${pkg.packageName}" adlı yeni bir öğün paketi gönderdi`
    );

    this.notifyPackageListeners(clientId, pkg);

    return pkg;
  }

  /**
   * Accept package
   */
  async acceptPackage(packageId: string, clientResponse?: string): Promise<FoodPackage | null> {
    const pkg = this.packages.get(packageId);
    if (!pkg) return null;

    pkg.status = "accepted";
    pkg.clientResponse = clientResponse;
    pkg.respondedAt = Date.now();
    pkg.startDate = Date.now();
    pkg.endDate = Date.now() + pkg.duration * 24 * 60 * 60 * 1000;

    this.packages.set(packageId, pkg);

    // Create activity event
    await activityStreamService.createEvent(
      pkg.clientId,
      pkg.clientName,
      "client",
      "package",
      "Öğün Paketini Kabul Etti",
      `"${pkg.packageName}" adlı öğün paketini kabul etti`,
      "✅",
      {
        packageName: pkg.packageName,
        response: clientResponse,
      },
      [pkg.dietitianId]
    );

    // Notify dietitian
    await notificationTriggersService.triggerNotification(
      pkg.dietitianId,
      "feedback",
      `Paket Kabul Edildi: ${pkg.clientName}`,
      `${pkg.clientName} "${pkg.packageName}" paketini kabul etti`
    );

    this.notifyPackageListeners(pkg.clientId, pkg);

    return pkg;
  }

  /**
   * Get packages for client
   */
  async getPackagesForClient(clientId: string): Promise<FoodPackage[]> {
    return Array.from(this.packages.values())
      .filter((pkg) => pkg.clientId === clientId)
      .sort((a, b) => (b.sharedAt || 0) - (a.sharedAt || 0));
  }

  /**
   * Subscribe to packages
   */
  subscribeToPackages(clientId: string, callback: (pkg: FoodPackage) => void): () => void {
    if (!this.packageListeners.has(clientId)) {
      this.packageListeners.set(clientId, []);
    }
    this.packageListeners.get(clientId)!.push(callback);

    return () => {
      const listeners = this.packageListeners.get(clientId);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Notify package listeners
   */
  private notifyPackageListeners(clientId: string, pkg: FoodPackage): void {
    const listeners = this.packageListeners.get(clientId);
    if (listeners) {
      listeners.forEach((callback) => callback(pkg));
    }
  }
}

// Export singleton instance
export const foodPackagesSharingService = FoodPackagesSharingService.getInstance();
