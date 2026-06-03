/**
 * Dietitian Product Management System
 * Allows dietitians to manage product categories, create recommended/forbidden lists
 * and share them with clients
 */

export type ProductCategory = 
  | "yemek" 
  | "tatlı" 
  | "çorba" 
  | "salata" 
  | "meyve" 
  | "kuruyemiş"
  | "içecek"
  | "süt-ürünleri"
  | "et-balık"
  | "tahıllar";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  description?: string;
  imageUrl?: string;
  createdBy: string; // Dietitian ID
  createdAt: number;
  updatedAt: number;
}

export interface ProductList {
  id: string;
  name: string;
  description?: string;
  dietitianId: string;
  type: "recommended" | "forbidden";
  products: Product[];
  categories: ProductCategory[];
  createdAt: number;
  updatedAt: number;
  sharedWith: string[]; // Client IDs
}

export interface ProductGroup {
  id: string;
  name: string;
  category: ProductCategory;
  products: Product[];
  dietitianId: string;
  createdAt: number;
}

export interface ProductListShare {
  id: string;
  listId: string;
  clientId: string;
  dietitianId: string;
  type: "recommended" | "forbidden";
  sharedAt: number;
  viewedAt?: number;
}

/**
 * Dietitian Product Management Service
 */
export class DietitianProductManagementService {
  private static instance: DietitianProductManagementService;
  private products: Map<string, Product> = new Map();
  private productLists: Map<string, ProductList> = new Map();
  private productGroups: Map<string, ProductGroup> = new Map();
  private shares: Map<string, ProductListShare> = new Map();

  private constructor() {
    this.initializeSampleProducts();
  }

  static getInstance(): DietitianProductManagementService {
    if (!DietitianProductManagementService.instance) {
      DietitianProductManagementService.instance = new DietitianProductManagementService();
    }
    return DietitianProductManagementService.instance;
  }

  /**
   * Initialize sample products for demo
   */
  private initializeSampleProducts(): void {
    const sampleProducts: Product[] = [
      // Yemekler
      {
        id: "prod-1",
        name: "Tavuk Göğsü (Grile)",
        category: "yemek",
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
        createdBy: "dietitian-1",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "prod-2",
        name: "Kırmızı Et (Sığır)",
        category: "yemek",
        calories: 250,
        protein: 26,
        carbs: 0,
        fat: 15,
        createdBy: "dietitian-1",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "prod-3",
        name: "Balık (Somon)",
        category: "et-balık",
        calories: 280,
        protein: 25,
        carbs: 0,
        fat: 20,
        createdBy: "dietitian-1",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      // Tatlılar
      {
        id: "prod-4",
        name: "Çikolata (Koyu %70)",
        category: "tatlı",
        calories: 600,
        protein: 8,
        carbs: 46,
        fat: 43,
        createdBy: "dietitian-1",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "prod-5",
        name: "Dondurma (Vanilya)",
        category: "tatlı",
        calories: 207,
        protein: 3.5,
        carbs: 24,
        fat: 11,
        createdBy: "dietitian-1",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      // Çorbalar
      {
        id: "prod-6",
        name: "Mercimek Çorbası",
        category: "çorba",
        calories: 130,
        protein: 9,
        carbs: 20,
        fat: 1.5,
        createdBy: "dietitian-1",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "prod-7",
        name: "Tavuk Çorbası",
        category: "çorba",
        calories: 100,
        protein: 12,
        carbs: 5,
        fat: 3,
        createdBy: "dietitian-1",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      // Salatalar
      {
        id: "prod-8",
        name: "Yeşil Salata",
        category: "salata",
        calories: 15,
        protein: 1.2,
        carbs: 2.9,
        fat: 0.2,
        fiber: 1.3,
        createdBy: "dietitian-1",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "prod-9",
        name: "Çoban Salatası",
        category: "salata",
        calories: 45,
        protein: 1.5,
        carbs: 8,
        fat: 1,
        fiber: 1.5,
        createdBy: "dietitian-1",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      // Meyveler
      {
        id: "prod-10",
        name: "Elma",
        category: "meyve",
        calories: 52,
        protein: 0.3,
        carbs: 14,
        fat: 0.2,
        fiber: 2.4,
        createdBy: "dietitian-1",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "prod-11",
        name: "Muz",
        category: "meyve",
        calories: 89,
        protein: 1.1,
        carbs: 23,
        fat: 0.3,
        fiber: 2.6,
        createdBy: "dietitian-1",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "prod-12",
        name: "Çilek",
        category: "meyve",
        calories: 32,
        protein: 0.8,
        carbs: 7.7,
        fat: 0.3,
        fiber: 2,
        createdBy: "dietitian-1",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      // Kuruyemişler
      {
        id: "prod-13",
        name: "Yer Fıstığı",
        category: "kuruyemiş",
        calories: 567,
        protein: 25.8,
        carbs: 16.1,
        fat: 49.2,
        fiber: 6.0,
        createdBy: "dietitian-1",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "prod-14",
        name: "Badem",
        category: "kuruyemiş",
        calories: 579,
        protein: 21.2,
        carbs: 21.6,
        fat: 50.6,
        fiber: 12.5,
        createdBy: "dietitian-1",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      // Süt Ürünleri
      {
        id: "prod-15",
        name: "Yoğurt (Tam Yağlı)",
        category: "süt-ürünleri",
        calories: 100,
        protein: 3.5,
        carbs: 4.7,
        fat: 7,
        createdBy: "dietitian-1",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "prod-16",
        name: "Peynir (Beyaz)",
        category: "süt-ürünleri",
        calories: 264,
        protein: 17.7,
        carbs: 4.3,
        fat: 21,
        createdBy: "dietitian-1",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    sampleProducts.forEach((product) => {
      this.products.set(product.id, product);
    });
  }

  /**
   * Add new product
   */
  addProduct(
    name: string,
    category: ProductCategory,
    calories: number,
    protein: number,
    carbs: number,
    fat: number,
    dietitianId: string,
    fiber?: number,
    description?: string,
    imageUrl?: string
  ): Product {
    const product: Product = {
      id: `prod-${Date.now()}`,
      name,
      category,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      description,
      imageUrl,
      createdBy: dietitianId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.products.set(product.id, product);
    return product;
  }

  /**
   * Update product
   */
  updateProduct(productId: string, updates: Partial<Product>): Product | null {
    const product = this.products.get(productId);
    if (!product) return null;

    const updated = {
      ...product,
      ...updates,
      updatedAt: Date.now(),
    };

    this.products.set(productId, updated);
    return updated;
  }

  /**
   * Delete product
   */
  deleteProduct(productId: string): boolean {
    return this.products.delete(productId);
  }

  /**
   * Get products by category
   */
  getProductsByCategory(category: ProductCategory): Product[] {
    return Array.from(this.products.values()).filter((p) => p.category === category);
  }

  /**
   * Get all products
   */
  getAllProducts(): Product[] {
    return Array.from(this.products.values());
  }

  /**
   * Search products
   */
  searchProducts(query: string): Product[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter((p) =>
      p.name.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Create product list (recommended or forbidden)
   */
  createProductList(
    name: string,
    type: "recommended" | "forbidden",
    dietitianId: string,
    productIds: string[],
    description?: string
  ): ProductList {
    const products = productIds
      .map((id) => this.products.get(id))
      .filter((p) => p !== undefined) as Product[];

    const categories = Array.from(new Set(products.map((p) => p.category)));

    const list: ProductList = {
      id: `list-${Date.now()}`,
      name,
      description,
      dietitianId,
      type,
      products,
      categories: categories as ProductCategory[],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      sharedWith: [],
    };

    this.productLists.set(list.id, list);
    return list;
  }

  /**
   * Update product list
   */
  updateProductList(
    listId: string,
    updates: Partial<ProductList>
  ): ProductList | null {
    const list = this.productLists.get(listId);
    if (!list) return null;

    const updated = {
      ...list,
      ...updates,
      updatedAt: Date.now(),
    };

    this.productLists.set(listId, updated);
    return updated;
  }

  /**
   * Delete product list
   */
  deleteProductList(listId: string): boolean {
    return this.productLists.delete(listId);
  }

  /**
   * Add product to list
   */
  addProductToList(listId: string, productId: string): ProductList | null {
    const list = this.productLists.get(listId);
    const product = this.products.get(productId);

    if (!list || !product) return null;

    if (!list.products.find((p) => p.id === productId)) {
      list.products.push(product);

      if (!list.categories.includes(product.category)) {
        list.categories.push(product.category);
      }

      list.updatedAt = Date.now();
      this.productLists.set(listId, list);
    }

    return list;
  }

  /**
   * Remove product from list
   */
  removeProductFromList(listId: string, productId: string): ProductList | null {
    const list = this.productLists.get(listId);
    if (!list) return null;

    list.products = list.products.filter((p) => p.id !== productId);
    list.categories = Array.from(
      new Set(list.products.map((p) => p.category))
    ) as ProductCategory[];
    list.updatedAt = Date.now();

    this.productLists.set(listId, list);
    return list;
  }

  /**
   * Get product lists by dietitian
   */
  getProductListsByDietitian(dietitianId: string): ProductList[] {
    return Array.from(this.productLists.values()).filter(
      (l) => l.dietitianId === dietitianId
    );
  }

  /**
   * Get product lists shared with client
   */
  getProductListsForClient(clientId: string): ProductList[] {
    return Array.from(this.productLists.values()).filter((l) =>
      l.sharedWith.includes(clientId)
    );
  }

  /**
   * Share product list with client
   */
  shareProductList(listId: string, clientId: string): ProductListShare | null {
    const list = this.productLists.get(listId);
    if (!list) return null;

    if (!list.sharedWith.includes(clientId)) {
      list.sharedWith.push(clientId);
      list.updatedAt = Date.now();
      this.productLists.set(listId, list);
    }

    const share: ProductListShare = {
      id: `share-${Date.now()}`,
      listId,
      clientId,
      dietitianId: list.dietitianId,
      type: list.type,
      sharedAt: Date.now(),
    };

    this.shares.set(share.id, share);
    return share;
  }

  /**
   * Unshare product list
   */
  unshareProductList(listId: string, clientId: string): boolean {
    const list = this.productLists.get(listId);
    if (!list) return false;

    list.sharedWith = list.sharedWith.filter((id) => id !== clientId);
    list.updatedAt = Date.now();
    this.productLists.set(listId, list);

    return true;
  }

  /**
   * Create product group
   */
  createProductGroup(
    name: string,
    category: ProductCategory,
    productIds: string[],
    dietitianId: string
  ): ProductGroup {
    const products = productIds
      .map((id) => this.products.get(id))
      .filter((p) => p !== undefined && p.category === category) as Product[];

    const group: ProductGroup = {
      id: `group-${Date.now()}`,
      name,
      category,
      products,
      dietitianId,
      createdAt: Date.now(),
    };

    this.productGroups.set(group.id, group);
    return group;
  }

  /**
   * Get product groups by dietitian
   */
  getProductGroupsByDietitian(dietitianId: string): ProductGroup[] {
    return Array.from(this.productGroups.values()).filter(
      (g) => g.dietitianId === dietitianId
    );
  }

  /**
   * Get categories
   */
  getCategories(): ProductCategory[] {
    return [
      "yemek",
      "tatlı",
      "çorba",
      "salata",
      "meyve",
      "kuruyemiş",
      "içecek",
      "süt-ürünleri",
      "et-balık",
      "tahıllar",
    ];
  }

  /**
   * Get category label
   */
  getCategoryLabel(category: ProductCategory): string {
    const labels: Record<ProductCategory, string> = {
      yemek: "🍽️ Yemekler",
      tatlı: "🍰 Tatlılar",
      çorba: "🍲 Çorbalar",
      salata: "🥗 Salatalar",
      meyve: "🍎 Meyveler",
      kuruyemiş: "🥜 Kuruyemişler",
      içecek: "🥤 İçecekler",
      "süt-ürünleri": "🥛 Süt Ürünleri",
      "et-balık": "🍖 Et & Balık",
      tahıllar: "🌾 Tahıllar",
    };
    return labels[category];
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalProducts: number;
    totalLists: number;
    totalGroups: number;
    totalShares: number;
    productsByCategory: Record<ProductCategory, number>;
  } {
    const productsByCategory: Record<ProductCategory, number> = {
      yemek: 0,
      tatlı: 0,
      çorba: 0,
      salata: 0,
      meyve: 0,
      kuruyemiş: 0,
      içecek: 0,
      "süt-ürünleri": 0,
      "et-balık": 0,
      tahıllar: 0,
    };

    this.products.forEach((product) => {
      productsByCategory[product.category]++;
    });

    return {
      totalProducts: this.products.size,
      totalLists: this.productLists.size,
      totalGroups: this.productGroups.size,
      totalShares: this.shares.size,
      productsByCategory,
    };
  }
}

export const dietitianProductManagementService =
  DietitianProductManagementService.getInstance();
