/**
 * Product Sharing Service
 * Handles sharing of recommended/forbidden product lists from dietitians to clients
 */

export interface SharedProductList {
  id: string;
  listId: string;
  listName: string;
  dietitianId: string;
  dietitianName: string;
  clientId: string;
  clientName: string;
  type: "recommended" | "forbidden";
  products: SharedProduct[];
  categories: string[];
  message?: string;
  isRead: boolean;
  readAt?: number;
  sharedAt: number;
  updatedAt: number;
}

export interface SharedProduct {
  id: string;
  name: string;
  category: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  description?: string;
  reason?: string; // Why it's recommended/forbidden
}

export interface ProductShareNotification {
  id: string;
  clientId: string;
  dietitianName: string;
  listName: string;
  listType: "recommended" | "forbidden";
  productCount: number;
  message: string;
  isRead: boolean;
  createdAt: number;
}

/**
 * Product Sharing Service Implementation
 */
export class ProductSharingService {
  private static instance: ProductSharingService;
  private sharedLists: Map<string, SharedProductList> = new Map();
  private notifications: Map<string, ProductShareNotification> = new Map();
  private listListeners: Map<string, Function[]> = new Map();
  private notificationListeners: Map<string, Function[]> = new Map();

  private constructor() {
    this.initializeSampleData();
  }

  static getInstance(): ProductSharingService {
    if (!ProductSharingService.instance) {
      ProductSharingService.instance = new ProductSharingService();
    }
    return ProductSharingService.instance;
  }

  /**
   * Initialize with sample shared lists
   */
  private initializeSampleData(): void {
    // Sample recommended products list
    const recommendedList: SharedProductList = {
      id: "share-1",
      listId: "list-1",
      listName: "Önerilen Ürünler",
      dietitianId: "dietitian-1",
      dietitianName: "Dr. Mehmet Kaya",
      clientId: "client-1",
      clientName: "Ayşe Yılmaz",
      type: "recommended",
      products: [
        {
          id: "prod-1",
          name: "Tavuk Göğsü",
          category: "et-balık",
          calories: 165,
          protein: 31,
          carbs: 0,
          fat: 3.6,
          reason: "Yüksek protein, düşük yağ",
        },
        {
          id: "prod-2",
          name: "Yeşil Salata",
          category: "salata",
          calories: 15,
          protein: 1.2,
          carbs: 3,
          fat: 0.2,
          reason: "Düşük kalori, yüksek lif",
        },
        {
          id: "prod-3",
          name: "Yumurta",
          category: "et-balık",
          calories: 155,
          protein: 13,
          carbs: 1.1,
          fat: 11,
          reason: "Tam protein kaynağı",
        },
        {
          id: "prod-4",
          name: "Elma",
          category: "meyve",
          calories: 52,
          protein: 0.3,
          carbs: 14,
          fat: 0.2,
          reason: "Lif kaynağı, doğal şeker",
        },
        {
          id: "prod-5",
          name: "Badem",
          category: "kuruyemiş",
          calories: 579,
          protein: 21,
          carbs: 22,
          fat: 50,
          reason: "Sağlıklı yağ, protein",
        },
      ],
      categories: ["et-balık", "salata", "meyve", "kuruyemiş"],
      message: "Bu ürünleri düzenli tüketmenizi öneriyorum.",
      isRead: true,
      readAt: Date.now() - 3600000,
      sharedAt: Date.now() - 86400000,
      updatedAt: Date.now() - 86400000,
    };

    // Sample forbidden products list
    const forbiddenList: SharedProductList = {
      id: "share-2",
      listId: "list-2",
      listName: "Kaçınılması Gereken Ürünler",
      dietitianId: "dietitian-1",
      dietitianName: "Dr. Mehmet Kaya",
      clientId: "client-1",
      clientName: "Ayşe Yılmaz",
      type: "forbidden",
      products: [
        {
          id: "prod-6",
          name: "Kola",
          category: "içecek",
          calories: 42,
          carbs: 11,
          reason: "Yüksek şeker, yapay tatlandırıcı",
        },
        {
          id: "prod-7",
          name: "Donuts",
          category: "tatlı",
          calories: 452,
          carbs: 51,
          fat: 25,
          reason: "Yüksek kalori, trans yağ",
        },
        {
          id: "prod-8",
          name: "Beyaz Ekmek",
          category: "tahıllar",
          calories: 265,
          carbs: 49,
          reason: "Düşük lif, yüksek GI",
        },
      ],
      categories: ["içecek", "tatlı", "tahıllar"],
      message: "Lütfen bu ürünleri mümkün olduğunca azaltın.",
      isRead: true,
      readAt: Date.now() - 3600000,
      sharedAt: Date.now() - 172800000,
      updatedAt: Date.now() - 172800000,
    };

    this.sharedLists.set(recommendedList.id, recommendedList);
    this.sharedLists.set(forbiddenList.id, forbiddenList);
  }

  /**
   * Share a product list with a client
   */
  async shareProductList(
    listId: string,
    listName: string,
    dietitianId: string,
    dietitianName: string,
    clientId: string,
    clientName: string,
    type: "recommended" | "forbidden",
    products: SharedProduct[],
    categories: string[],
    message?: string
  ): Promise<SharedProductList> {
    const shareId = `share-${Date.now()}`;
    const sharedList: SharedProductList = {
      id: shareId,
      listId,
      listName,
      dietitianId,
      dietitianName,
      clientId,
      clientName,
      type,
      products,
      categories,
      message,
      isRead: false,
      sharedAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.sharedLists.set(shareId, sharedList);

    // Create notification
    await this.createShareNotification(clientId, dietitianName, listName, type, products.length);

    // Notify listeners
    this.notifyListListeners(clientId, sharedList);

    return sharedList;
  }

  /**
   * Get shared lists for a client
   */
  async getSharedListsForClient(clientId: string): Promise<SharedProductList[]> {
    return Array.from(this.sharedLists.values())
      .filter((list) => list.clientId === clientId)
      .sort((a, b) => b.sharedAt - a.sharedAt);
  }

  /**
   * Get shared lists by type
   */
  async getSharedListsByType(
    clientId: string,
    type: "recommended" | "forbidden"
  ): Promise<SharedProductList[]> {
    return Array.from(this.sharedLists.values())
      .filter((list) => list.clientId === clientId && list.type === type)
      .sort((a, b) => b.sharedAt - a.sharedAt);
  }

  /**
   * Get recommended products for a client
   */
  async getRecommendedProducts(clientId: string): Promise<SharedProduct[]> {
    const lists = await this.getSharedListsByType(clientId, "recommended");
    const products: SharedProduct[] = [];
    lists.forEach((list) => {
      products.push(...list.products);
    });
    return products;
  }

  /**
   * Get forbidden products for a client
   */
  async getForbiddenProducts(clientId: string): Promise<SharedProduct[]> {
    const lists = await this.getSharedListsByType(clientId, "forbidden");
    const products: SharedProduct[] = [];
    lists.forEach((list) => {
      products.push(...list.products);
    });
    return products;
  }

  /**
   * Mark shared list as read
   */
  async markListAsRead(shareId: string): Promise<void> {
    const list = this.sharedLists.get(shareId);
    if (list) {
      list.isRead = true;
      list.readAt = Date.now();
      this.sharedLists.set(shareId, list);
    }
  }

  /**
   * Create share notification
   */
  private async createShareNotification(
    clientId: string,
    dietitianName: string,
    listName: string,
    listType: "recommended" | "forbidden",
    productCount: number
  ): Promise<void> {
    const notifId = `notif-${Date.now()}`;
    const message =
      listType === "recommended"
        ? `${dietitianName} "${listName}" adında ${productCount} önerilen ürün paylaştı`
        : `${dietitianName} "${listName}" adında ${productCount} kaçınılması gereken ürün paylaştı`;

    const notification: ProductShareNotification = {
      id: notifId,
      clientId,
      dietitianName,
      listName,
      listType,
      productCount,
      message,
      isRead: false,
      createdAt: Date.now(),
    };

    this.notifications.set(notifId, notification);
    this.notifyNotificationListeners(clientId, notification);
  }

  /**
   * Get notifications for client
   */
  async getNotifications(clientId: string, unreadOnly: boolean = false): Promise<ProductShareNotification[]> {
    let notifs = Array.from(this.notifications.values()).filter(
      (n) => n.clientId === clientId
    );

    if (unreadOnly) {
      notifs = notifs.filter((n) => !n.isRead);
    }

    return notifs.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.isRead = true;
      this.notifications.set(notificationId, notification);
    }
  }

  /**
   * Subscribe to shared lists
   */
  subscribeToSharedLists(
    clientId: string,
    callback: (list: SharedProductList) => void
  ): () => void {
    if (!this.listListeners.has(clientId)) {
      this.listListeners.set(clientId, []);
    }
    this.listListeners.get(clientId)!.push(callback);

    return () => {
      const listeners = this.listListeners.get(clientId);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Subscribe to notifications
   */
  subscribeToNotifications(
    clientId: string,
    callback: (notification: ProductShareNotification) => void
  ): () => void {
    if (!this.notificationListeners.has(clientId)) {
      this.notificationListeners.set(clientId, []);
    }
    this.notificationListeners.get(clientId)!.push(callback);

    return () => {
      const listeners = this.notificationListeners.get(clientId);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Notify list listeners
   */
  private notifyListListeners(clientId: string, list: SharedProductList): void {
    const listeners = this.listListeners.get(clientId);
    if (listeners) {
      listeners.forEach((callback) => callback(list));
    }
  }

  /**
   * Notify notification listeners
   */
  private notifyNotificationListeners(
    clientId: string,
    notification: ProductShareNotification
  ): void {
    const listeners = this.notificationListeners.get(clientId);
    if (listeners) {
      listeners.forEach((callback) => callback(notification));
    }
  }

  /**
   * Delete shared list
   */
  async deleteSharedList(shareId: string): Promise<void> {
    this.sharedLists.delete(shareId);
  }

  /**
   * Update shared list
   */
  async updateSharedList(
    shareId: string,
    updates: Partial<SharedProductList>
  ): Promise<SharedProductList | null> {
    const list = this.sharedLists.get(shareId);
    if (!list) return null;

    const updated = { ...list, ...updates, updatedAt: Date.now() };
    this.sharedLists.set(shareId, updated);
    return updated;
  }

  /**
   * Search products in shared lists
   */
  async searchProducts(clientId: string, query: string): Promise<SharedProduct[]> {
    const lists = await this.getSharedListsForClient(clientId);
    const results: SharedProduct[] = [];

    lists.forEach((list) => {
      list.products.forEach((product) => {
        if (
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase())
        ) {
          results.push(product);
        }
      });
    });

    return results;
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(clientId: string, category: string): Promise<SharedProduct[]> {
    const lists = await this.getSharedListsForClient(clientId);
    const products: SharedProduct[] = [];

    lists.forEach((list) => {
      list.products.forEach((product) => {
        if (product.category === category) {
          products.push(product);
        }
      });
    });

    return products;
  }
}

// Export singleton instance
export const productSharingService = ProductSharingService.getInstance();
