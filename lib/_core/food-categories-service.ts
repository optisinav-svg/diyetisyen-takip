/**
 * Food Categories Service
 * Gıdaları kategoriler ve alt kategoriler halinde yönetir
 */

export interface FoodSubCategory {
  id: string;
  name: string;
  description?: string;
  examples: string[];
}

export interface FoodCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  subCategories: FoodSubCategory[];
}

export interface FoodItem {
  id: string;
  categoryId: string;
  subCategoryId: string;
  name: string;
  description?: string;
  nutritionInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
  };
  servingSize: string;
  recommended?: boolean; // Diyetisyen tarafından tavsiye edilen
  prohibited?: boolean; // Diyetisyen tarafından yasaklı
}

// Gıda kategorileri ve alt kategorileri
const FOOD_CATEGORIES: FoodCategory[] = [
  {
    id: "soups",
    name: "🍲 Çorba",
    icon: "🍲",
    description: "Sıcak ve besleyici çorbalar",
    subCategories: [
      {
        id: "creamy-soups",
        name: "Kremali Çorbalar",
        description: "Krema veya süt içeren çorbalar",
        examples: ["Patates Çorbası", "Brokoli Çorbası", "Mantar Çorbası"],
      },
      {
        id: "clear-soups",
        name: "Açık Çorbalar",
        description: "Sade ve hafif çorbalar",
        examples: ["Tavuk Çorbası", "Sebze Çorbası", "Kemik Suyu"],
      },
      {
        id: "lentil-soups",
        name: "Mercimek Çorbası",
        description: "Mercimek ve baklagiller",
        examples: ["Kırmızı Mercimek", "Yeşil Mercimek", "Nohut Çorbası"],
      },
      {
        id: "tomato-soups",
        name: "Domates Çorbası",
        description: "Domates tabanlı çorbalar",
        examples: ["Klasik Domates", "Domates Krema", "Gazpacho"],
      },
    ],
  },
  {
    id: "desserts",
    name: "🍰 Tatlı",
    icon: "🍰",
    description: "Tatlı ve şeker içeren gıdalar",
    subCategories: [
      {
        id: "dairy-desserts",
        name: "Sütlü Tatlılar",
        description: "Süt ve krema içeren tatlılar",
        examples: ["Flan", "Pudding", "Muhallebi", "Yoğurt Tatlısı"],
      },
      {
        id: "syrup-desserts",
        name: "Şerbetli Tatlılar",
        description: "Şerbet veya şeker şurubu içeren tatlılar",
        examples: ["Baklava", "Şerbetli Pasta", "Lokum", "Halva"],
      },
      {
        id: "fruit-desserts",
        name: "Meyveli Tatlılar",
        description: "Meyve içeren tatlılar",
        examples: ["Pasta", "Kek", "Meyve Salatası", "Komposto"],
      },
      {
        id: "chocolate-desserts",
        name: "Çikolatalı Tatlılar",
        description: "Çikolata içeren tatlılar",
        examples: ["Çikolata Keki", "Brownie", "Trüf", "Çikolata Mousse"],
      },
    ],
  },
  {
    id: "salads",
    name: "🥗 Salata",
    icon: "🥗",
    description: "Taze ve besleyici salatalar",
    subCategories: [
      {
        id: "green-salads",
        name: "Yeşil Salatalar",
        description: "Yapraklı sebzelerden yapılan salatalar",
        examples: ["Marul Salatası", "Roka Salatası", "Ispanak Salatası"],
      },
      {
        id: "vegetable-salads",
        name: "Sebze Salatası",
        description: "Çeşitli sebzelerden yapılan salatalar",
        examples: ["Çoban Salatası", "Patlıcan Salatası", "Domates Salatası"],
      },
      {
        id: "protein-salads",
        name: "Proteinli Salatalar",
        description: "Et, tavuk veya balık içeren salatalar",
        examples: ["Tavuk Salatası", "Ton Balığı Salatası", "Sığır Eti Salatası"],
      },
      {
        id: "grain-salads",
        name: "Tahıllı Salatalar",
        description: "Tahıl ve baklagiller içeren salatalar",
        examples: ["Kuskus Salatası", "Bulgur Salatası", "Nohut Salatası"],
      },
    ],
  },
  {
    id: "fruits",
    name: "🍎 Meyve",
    icon: "🍎",
    description: "Taze ve kuru meyveler",
    subCategories: [
      {
        id: "fresh-fruits",
        name: "Taze Meyveler",
        description: "Mevsimsel taze meyveler",
        examples: ["Elma", "Portakal", "Muz", "Çilek"],
      },
      {
        id: "citrus-fruits",
        name: "Turunçgiller",
        description: "Limon, portakal, greyfurt gibi",
        examples: ["Portakal", "Limon", "Greyfurt", "Mandalina"],
      },
      {
        id: "berries",
        name: "Meyveler",
        description: "Böğürtlen, frambuaz, mirtil",
        examples: ["Böğürtlen", "Frambuaz", "Mirtil", "Çilek"],
      },
      {
        id: "dried-fruits",
        name: "Kuru Meyveler",
        description: "Kurutulmuş meyveler",
        examples: ["Kuru Üzüm", "Kuru İncir", "Tarih", "Kuru Kayısı"],
      },
    ],
  },
  {
    id: "nuts-seeds",
    name: "🥜 Kuruyemiş",
    icon: "🥜",
    description: "Yağlı tohumlar ve kuruyemiş",
    subCategories: [
      {
        id: "nuts",
        name: "Fındık ve Ceviz",
        description: "Çeşitli fındık ve cevizler",
        examples: ["Badem", "Fındık", "Ceviz", "Antep Fıstığı"],
      },
      {
        id: "seeds",
        name: "Tohumlar",
        description: "Çeşitli tohumlar",
        examples: ["Ayçiçeği Tohumu", "Kabak Tohumu", "Keten Tohumu"],
      },
      {
        id: "nut-butters",
        name: "Fındık Yağları",
        description: "Fındık ve ceviz yağları",
        examples: ["Yer Fıstığı Yağı", "Badem Yağı", "Ceviz Yağı"],
      },
      {
        id: "legumes",
        name: "Baklagiller",
        description: "Fasulye, nohut, mercimek",
        examples: ["Kuru Fasulye", "Nohut", "Mercimek", "Lentil"],
      },
    ],
  },
  {
    id: "proteins",
    name: "🍗 Protein",
    icon: "🍗",
    description: "Et, balık ve protein kaynakları",
    subCategories: [
      {
        id: "poultry",
        name: "Tavuk ve Hindi",
        description: "Tavuk ve hindi eti",
        examples: ["Tavuk Göğsü", "Tavuk Budunu", "Hindi Eti"],
      },
      {
        id: "red-meat",
        name: "Kırmızı Et",
        description: "Sığır ve kuzu eti",
        examples: ["Sığır Eti", "Kuzu Eti", "Biftek"],
      },
      {
        id: "fish",
        name: "Balık ve Deniz Ürünleri",
        description: "Balık ve deniz ürünleri",
        examples: ["Somon", "Ton Balığı", "Levrek", "Karides"],
      },
      {
        id: "eggs-dairy",
        name: "Yumurta ve Süt Ürünleri",
        description: "Yumurta, peynir, yoğurt",
        examples: ["Yumurta", "Beyaz Peynir", "Yoğurt", "Süt"],
      },
    ],
  },
  {
    id: "vegetables",
    name: "🥕 Sebze",
    icon: "🥕",
    description: "Taze ve besleyici sebzeler",
    subCategories: [
      {
        id: "leafy-vegetables",
        name: "Yapraklı Sebzeler",
        description: "Ispanak, marul, ıspanak",
        examples: ["Ispanak", "Marul", "Roka", "Lahana"],
      },
      {
        id: "root-vegetables",
        name: "Kök Sebzeleri",
        description: "Patates, havuç, pancar",
        examples: ["Patates", "Havuç", "Pancar", "Şalgam"],
      },
      {
        id: "cruciferous",
        name: "Çiçek Sebzeleri",
        description: "Brokoli, karnabahar, lahana",
        examples: ["Brokoli", "Karnabahar", "Lahana", "Brüksel Lahanası"],
      },
      {
        id: "nightshade",
        name: "Solanaceae Ailesi",
        description: "Domates, biber, patlıcan",
        examples: ["Domates", "Biber", "Patlıcan", "Tatlı Biber"],
      },
    ],
  },
  {
    id: "grains",
    name: "🌾 Tahıl",
    icon: "🌾",
    description: "Tahıl ve ekmek ürünleri",
    subCategories: [
      {
        id: "whole-grains",
        name: "Tam Tahıl",
        description: "Tam buğday ve tahıl ürünleri",
        examples: ["Tam Buğday Ekmeği", "Kahverengi Pirinç", "Yulaf"],
      },
      {
        id: "refined-grains",
        name: "İşlenmiş Tahıl",
        description: "Beyaz ekmek ve pirinç",
        examples: ["Beyaz Ekmek", "Beyaz Pirinç", "Makarna"],
      },
      {
        id: "cereals",
        name: "Tahıl Ürünleri",
        description: "Mısır, arpa, çavdar",
        examples: ["Mısır", "Arpa", "Çavdar", "Kinoa"],
      },
      {
        id: "pasta",
        name: "Makarna ve Noodle",
        description: "Makarna ve noodle ürünleri",
        examples: ["Spagetti", "Penne", "Ramen", "Udon"],
      },
    ],
  },
  {
    id: "beverages",
    name: "🥤 İçecek",
    icon: "🥤",
    description: "Sıvı ve içecekler",
    subCategories: [
      {
        id: "water-drinks",
        name: "Su ve Suyu İçecekler",
        description: "Su ve suyu içecekler",
        examples: ["Su", "Limonlu Su", "Maden Suyu", "Kokosuz Su"],
      },
      {
        id: "tea-coffee",
        name: "Çay ve Kahve",
        description: "Çay ve kahve içecekleri",
        examples: ["Siyah Çay", "Yeşil Çay", "Kahve", "Espresso"],
      },
      {
        id: "juices",
        name: "Meyve Suyu",
        description: "Taze ve paketli meyve suları",
        examples: ["Portakal Suyu", "Elma Suyu", "Nar Suyu", "Mango Suyu"],
      },
      {
        id: "smoothies",
        name: "Smoothie",
        description: "Meyve ve sebze smoothieleri",
        examples: ["Meyve Smoothie", "Yeşil Smoothie", "Protein Smoothie"],
      },
    ],
  },
];

export const foodCategoriesService = {
  /**
   * Tüm kategorileri al
   */
  getAllCategories(): FoodCategory[] {
    return FOOD_CATEGORIES;
  },

  /**
   * Kategori ID'sine göre kategoriyi al
   */
  getCategoryById(categoryId: string): FoodCategory | undefined {
    return FOOD_CATEGORIES.find((cat) => cat.id === categoryId);
  },

  /**
   * Alt kategoriyi al
   */
  getSubCategory(categoryId: string, subCategoryId: string): FoodSubCategory | undefined {
    const category = this.getCategoryById(categoryId);
    return category?.subCategories.find((sub) => sub.id === subCategoryId);
  },

  /**
   * Kategori adına göre ara
   */
  searchCategories(query: string): FoodCategory[] {
    const lowerQuery = query.toLowerCase();
    return FOOD_CATEGORIES.filter(
      (cat) =>
        cat.name.toLowerCase().includes(lowerQuery) ||
        cat.description.toLowerCase().includes(lowerQuery) ||
        cat.subCategories.some(
          (sub) =>
            sub.name.toLowerCase().includes(lowerQuery) ||
            sub.examples.some((ex) => ex.toLowerCase().includes(lowerQuery))
        )
    );
  },

  /**
   * Alt kategori adına göre ara
   */
  searchSubCategories(query: string): Array<{
    category: FoodCategory;
    subCategory: FoodSubCategory;
  }> {
    const lowerQuery = query.toLowerCase();
    const results: Array<{ category: FoodCategory; subCategory: FoodSubCategory }> = [];

    FOOD_CATEGORIES.forEach((category) => {
      category.subCategories.forEach((subCategory) => {
        if (
          subCategory.name.toLowerCase().includes(lowerQuery) ||
          subCategory.examples.some((ex) => ex.toLowerCase().includes(lowerQuery))
        ) {
          results.push({ category, subCategory });
        }
      });
    });

    return results;
  },

  /**
   * Gıda örneğine göre ara
   */
  searchFoodItems(query: string): Array<{
    category: FoodCategory;
    subCategory: FoodSubCategory;
    item: string;
  }> {
    const lowerQuery = query.toLowerCase();
    const results: Array<{
      category: FoodCategory;
      subCategory: FoodSubCategory;
      item: string;
    }> = [];

    FOOD_CATEGORIES.forEach((category) => {
      category.subCategories.forEach((subCategory) => {
        subCategory.examples.forEach((example) => {
          if (example.toLowerCase().includes(lowerQuery)) {
            results.push({ category, subCategory, item: example });
          }
        });
      });
    });

    return results;
  },

  /**
   * Kategori sayısı
   */
  getCategoryCount(): number {
    return FOOD_CATEGORIES.length;
  },

  /**
   * Toplam alt kategori sayısı
   */
  getTotalSubCategoryCount(): number {
    return FOOD_CATEGORIES.reduce((sum, cat) => sum + cat.subCategories.length, 0);
  },

  /**
   * Toplam gıda örneği sayısı
   */
  getTotalFoodItemCount(): number {
    return FOOD_CATEGORIES.reduce(
      (sum, cat) =>
        sum +
        cat.subCategories.reduce((subSum, subCat) => subSum + subCat.examples.length, 0),
      0
    );
  },

  /**
   * Kategori ve alt kategorileri JSON formatında al
   */
  getStructuredData() {
    return FOOD_CATEGORIES.map((category) => ({
      id: category.id,
      name: category.name,
      icon: category.icon,
      description: category.description,
      subCategories: category.subCategories.map((sub) => ({
        id: sub.id,
        name: sub.name,
        description: sub.description,
        itemCount: sub.examples.length,
        examples: sub.examples,
      })),
    }));
  },
};
