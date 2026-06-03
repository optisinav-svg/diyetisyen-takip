/**
 * Cuisine Categories Service
 * Türk, İtalyan, Fransız, Japon, Kore mutfakları ve gıdaları
 */

export interface CuisineFood {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
  ingredients: string[];
  healthBenefits: string[];
  isRecommended?: boolean;
  isProhibited?: boolean;
}

export interface CuisineCategory {
  id: string;
  name: string;
  description: string;
  flag: string;
  foods: CuisineFood[];
  subcategories: string[];
  characteristics: string[];
}

// Türk Mutfağı
const TURKISH_CUISINE: CuisineCategory = {
  id: "cuisine_turkish",
  name: "Türk Mutfağı",
  description: "Zengin lezzetler ve geleneksel tarifler",
  flag: "🇹🇷",
  subcategories: ["Çorbalar", "Kebaplar", "Mezeler", "Tatlılar", "Ekmekler", "Sebze Yemekleri"],
  characteristics: ["Zeytin yağı kullanımı", "Baharat zenginliği", "Geleneksel pişirme yöntemleri"],
  foods: [
    {
      id: "tr_001",
      name: "Lentil Çorbası",
      category: "Çorbalar",
      subcategory: "Çorba",
      description: "Kırmızı mercimekten yapılan besleyici çorba",
      calories: 120,
      protein: 8,
      carbs: 20,
      fat: 2,
      servingSize: 250,
      servingUnit: "ml",
      ingredients: ["Kırmızı Mercimek", "Soğan", "Sarımsak", "Zeytin Yağı"],
      healthBenefits: ["Yüksek protein", "Lif kaynağı", "Antioksidan"],
      isRecommended: true,
    },
    {
      id: "tr_002",
      name: "Adana Kebap",
      category: "Kebaplar",
      subcategory: "Kebap",
      description: "Baharat ve ince kıyıma sarılmış kebap",
      calories: 380,
      protein: 35,
      carbs: 2,
      fat: 28,
      servingSize: 150,
      servingUnit: "g",
      ingredients: ["Kıyma", "Baharat", "Soğan", "Maydanoz"],
      healthBenefits: ["Yüksek protein", "Demir kaynağı"],
    },
    {
      id: "tr_003",
      name: "Hummus",
      category: "Mezeler",
      subcategory: "Meze",
      description: "Nohuttan yapılan kremsi meze",
      calories: 150,
      protein: 5,
      carbs: 13,
      fat: 9,
      servingSize: 100,
      servingUnit: "g",
      ingredients: ["Nohut", "Tahini", "Limon", "Sarımsak"],
      healthBenefits: ["Lif kaynağı", "Protein kaynağı", "Sağlıklı yağlar"],
      isRecommended: true,
    },
    {
      id: "tr_004",
      name: "Baklava",
      category: "Tatlılar",
      subcategory: "Tatlı",
      description: "Fındık ve şerbetli tatlı",
      calories: 350,
      protein: 5,
      carbs: 45,
      fat: 18,
      servingSize: 50,
      servingUnit: "g",
      ingredients: ["Filo Hamuru", "Fındık", "Şeker", "Tereyağı"],
      healthBenefits: ["Enerji kaynağı"],
      isProhibited: true,
    },
    {
      id: "tr_005",
      name: "Pide",
      category: "Ekmekler",
      subcategory: "Ekmek",
      description: "Peynir ve et dolgulu pide",
      calories: 280,
      protein: 12,
      carbs: 35,
      fat: 12,
      servingSize: 100,
      servingUnit: "g",
      ingredients: ["Un", "Peynir", "Kıyma", "Yumurta"],
      healthBenefits: ["Enerji kaynağı"],
    },
    {
      id: "tr_006",
      name: "Zeytinyağlı Yaprak Sarması",
      category: "Sebze Yemekleri",
      subcategory: "Sebze",
      description: "Pirinç ve otlarla sarılmış yaprak",
      calories: 180,
      protein: 4,
      carbs: 22,
      fat: 9,
      servingSize: 100,
      servingUnit: "g",
      ingredients: ["Asma Yaprağı", "Pirinç", "Zeytin Yağı", "Otlar"],
      healthBenefits: ["Lif kaynağı", "Sağlıklı yağlar"],
      isRecommended: true,
    },
  ],
};

// İtalyan Mutfağı
const ITALIAN_CUISINE: CuisineCategory = {
  id: "cuisine_italian",
  name: "İtalyan Mutfağı",
  description: "Klasik İtalyan lezzetleri ve gelenekleri",
  flag: "🇮🇹",
  subcategories: ["Pasta", "Pizzalar", "Risottolar", "Seafood", "Tatlılar", "Soslar"],
  characteristics: ["Domates kullanımı", "Mozzarella peyniri", "Zeytinyağı"],
  foods: [
    {
      id: "it_001",
      name: "Spaghetti Carbonara",
      category: "Pasta",
      subcategory: "Pasta",
      description: "Yumurta, peynir ve pancettayla yapılan pasta",
      calories: 420,
      protein: 18,
      carbs: 45,
      fat: 18,
      servingSize: 200,
      servingUnit: "g",
      ingredients: ["Spaghetti", "Yumurta", "Pecorino Peyniri", "Pancetta"],
      healthBenefits: ["Protein kaynağı"],
    },
    {
      id: "it_002",
      name: "Margherita Pizza",
      category: "Pizzalar",
      subcategory: "Pizza",
      description: "Domates, mozzarella ve fesleğenli pizza",
      calories: 250,
      protein: 12,
      carbs: 30,
      fat: 10,
      servingSize: 100,
      servingUnit: "g",
      ingredients: ["Hamur", "Domates", "Mozzarella", "Fesleğen"],
      healthBenefits: ["Kalsiyum kaynağı"],
    },
    {
      id: "it_003",
      name: "Risotto ai Funghi",
      category: "Risottolar",
      subcategory: "Risotto",
      description: "Mantarla yapılan İtalyan pirinç yemeği",
      calories: 280,
      protein: 10,
      carbs: 40,
      fat: 8,
      servingSize: 200,
      servingUnit: "g",
      ingredients: ["Arborio Pirinci", "Mantar", "Şarap", "Parmesan"],
      healthBenefits: ["Enerji kaynağı"],
    },
    {
      id: "it_004",
      name: "Panna Cotta",
      category: "Tatlılar",
      subcategory: "Tatlı",
      description: "Krem ve jlatinli İtalyan tatlısı",
      calories: 220,
      protein: 4,
      carbs: 20,
      fat: 15,
      servingSize: 100,
      servingUnit: "g",
      ingredients: ["Krema", "Şeker", "Jelatin", "Vanilin"],
      healthBenefits: ["Kalsiyum kaynağı"],
    },
    {
      id: "it_005",
      name: "Osso Buco",
      category: "Seafood",
      subcategory: "Et",
      description: "Domates sosunda pişmiş dana şanı",
      calories: 320,
      protein: 40,
      carbs: 8,
      fat: 14,
      servingSize: 200,
      servingUnit: "g",
      ingredients: ["Dana Şanı", "Domates", "Şarap", "Sebzeler"],
      healthBenefits: ["Yüksek protein", "Demir kaynağı"],
      isRecommended: true,
    },
    {
      id: "it_006",
      name: "Marinara Sosu",
      category: "Soslar",
      subcategory: "Sos",
      description: "Domates ve sarımsaktan yapılan sos",
      calories: 80,
      protein: 2,
      carbs: 10,
      fat: 4,
      servingSize: 100,
      servingUnit: "g",
      ingredients: ["Domates", "Sarımsak", "Zeytin Yağı", "Otlar"],
      healthBenefits: ["Antioksidan", "Lif kaynağı"],
      isRecommended: true,
    },
  ],
};

// Fransız Mutfağı
const FRENCH_CUISINE: CuisineCategory = {
  id: "cuisine_french",
  name: "Fransız Mutfağı",
  description: "Sofistike ve zarif Fransız yemekleri",
  flag: "🇫🇷",
  subcategories: ["Soslar", "Etler", "Sebzeler", "Peynirler", "Tatlılar", "Çorbalar"],
  characteristics: ["Sofistike pişirme", "Kaliteli malzemeler", "Ince soslar"],
  foods: [
    {
      id: "fr_001",
      name: "Coq au Vin",
      category: "Etler",
      subcategory: "Et",
      description: "Kırmızı şarapla pişmiş tavuk",
      calories: 350,
      protein: 38,
      carbs: 5,
      fat: 18,
      servingSize: 200,
      servingUnit: "g",
      ingredients: ["Tavuk", "Kırmızı Şarap", "Mantar", "Soğan"],
      healthBenefits: ["Yüksek protein", "Antioksidan"],
      isRecommended: true,
    },
    {
      id: "fr_002",
      name: "Ratatouille",
      category: "Sebzeler",
      subcategory: "Sebze",
      description: "Sebzelerden yapılan Provençal yemeği",
      calories: 120,
      protein: 3,
      carbs: 18,
      fat: 5,
      servingSize: 200,
      servingUnit: "g",
      ingredients: ["Patlıcan", "Domates", "Kabak", "Soğan"],
      healthBenefits: ["Lif kaynağı", "Vitaminler"],
      isRecommended: true,
    },
    {
      id: "fr_003",
      name: "Crème Brûlée",
      category: "Tatlılar",
      subcategory: "Tatlı",
      description: "Karamelize şekerli krem tatlısı",
      calories: 280,
      protein: 5,
      carbs: 25,
      fat: 18,
      servingSize: 100,
      servingUnit: "g",
      ingredients: ["Krema", "Yumurta Sarısı", "Şeker", "Vanilin"],
      healthBenefits: ["Kalsiyum kaynağı"],
    },
    {
      id: "fr_004",
      name: "Beurre Blanc",
      category: "Soslar",
      subcategory: "Sos",
      description: "Beyaz şarap ve tereyağından yapılan sos",
      calories: 200,
      protein: 0,
      carbs: 2,
      fat: 22,
      servingSize: 50,
      servingUnit: "g",
      ingredients: ["Tereyağı", "Beyaz Şarap", "Şallot", "Limon"],
      healthBenefits: ["Sağlıklı yağlar"],
    },
    {
      id: "fr_005",
      name: "Bouillabaisse",
      category: "Çorbalar",
      subcategory: "Çorba",
      description: "Balık ve deniz ürünleriyle yapılan çorba",
      calories: 180,
      protein: 25,
      carbs: 8,
      fat: 6,
      servingSize: 300,
      servingUnit: "ml",
      ingredients: ["Balık", "Midye", "Karides", "Domates"],
      healthBenefits: ["Omega-3", "Protein kaynağı"],
      isRecommended: true,
    },
    {
      id: "fr_006",
      name: "Camembert Peyniri",
      category: "Peynirler",
      subcategory: "Peynir",
      description: "Yumuşak ve kremsi Fransız peyniri",
      calories: 300,
      protein: 20,
      carbs: 0.5,
      fat: 25,
      servingSize: 50,
      servingUnit: "g",
      ingredients: ["Inek Sütü"],
      healthBenefits: ["Kalsiyum kaynağı", "Protein"],
    },
  ],
};

// Japon Mutfağı
const JAPANESE_CUISINE: CuisineCategory = {
  id: "cuisine_japanese",
  name: "Japon Mutfağı",
  description: "Sağlıklı ve dengeli Japon yemekleri",
  flag: "🇯🇵",
  subcategories: ["Sushi", "Ramen", "Donburi", "Tempura", "Miso", "Tatlılar"],
  characteristics: ["Balık kullanımı", "Pirinç", "Soya sosu", "Minimalist sunum"],
  foods: [
    {
      id: "jp_001",
      name: "Nigiri Sushi",
      category: "Sushi",
      subcategory: "Sushi",
      description: "Balık ve pirinçten yapılan sushi",
      calories: 140,
      protein: 14,
      carbs: 18,
      fat: 2,
      servingSize: 100,
      servingUnit: "g",
      ingredients: ["Sushi Pirinci", "Balık", "Nori", "Wasabi"],
      healthBenefits: ["Omega-3", "Protein kaynağı"],
      isRecommended: true,
    },
    {
      id: "jp_002",
      name: "Miso Soup",
      category: "Miso",
      subcategory: "Çorba",
      description: "Miso pastasından yapılan geleneksel çorba",
      calories: 50,
      protein: 4,
      carbs: 4,
      fat: 2,
      servingSize: 200,
      servingUnit: "ml",
      ingredients: ["Miso Pastası", "Tofu", "Deniz Yosunu", "Su"],
      healthBenefits: ["Probiyotik", "Protein kaynağı"],
      isRecommended: true,
    },
    {
      id: "jp_003",
      name: "Tonkatsu",
      category: "Donburi",
      subcategory: "Et",
      description: "Kızartılmış domuz eti",
      calories: 380,
      protein: 35,
      carbs: 15,
      fat: 18,
      servingSize: 150,
      servingUnit: "g",
      ingredients: ["Domuz Eti", "Panko", "Yumurta", "Un"],
      healthBenefits: ["Protein kaynağı", "B vitamini"],
    },
    {
      id: "jp_004",
      name: "Tempura",
      category: "Tempura",
      subcategory: "Sebze",
      description: "Hafif hamurda kızartılmış sebze ve balık",
      calories: 200,
      protein: 12,
      carbs: 20,
      fat: 8,
      servingSize: 100,
      servingUnit: "g",
      ingredients: ["Sebze", "Balık", "Tempura Unu", "Yağ"],
      healthBenefits: ["Vitamin kaynağı"],
    },
    {
      id: "jp_005",
      name: "Ramen",
      category: "Ramen",
      subcategory: "Makarna",
      description: "Balık veya tavuk sosunda pişmiş makarna",
      calories: 320,
      protein: 14,
      carbs: 45,
      fat: 8,
      servingSize: 300,
      servingUnit: "g",
      ingredients: ["Ramen Noodles", "Balık Suyu", "Yumurta", "Sebzeler"],
      healthBenefits: ["Enerji kaynağı"],
    },
    {
      id: "jp_006",
      name: "Dorayaki",
      category: "Tatlılar",
      subcategory: "Tatlı",
      description: "Kızıl fasulye dolgulu Japon tatlısı",
      calories: 180,
      protein: 4,
      carbs: 35,
      fat: 3,
      servingSize: 50,
      servingUnit: "g",
      ingredients: ["Un", "Yumurta", "Şeker", "Kızıl Fasulye"],
      healthBenefits: ["Enerji kaynağı"],
    },
  ],
};

// Kore Mutfağı
const KOREAN_CUISINE: CuisineCategory = {
  id: "cuisine_korean",
  name: "Kore Mutfağı",
  description: "Baharatlı ve canlı Kore yemekleri",
  flag: "🇰🇷",
  subcategories: ["Kimchi", "Bibimbap", "Bulgogi", "Çorbalar", "Tatlılar", "Soslar"],
  characteristics: ["Kırmızı biber", "Fermente gıdalar", "Baharatlar", "Sağlıklı malzemeler"],
  foods: [
    {
      id: "kr_001",
      name: "Bibimbap",
      category: "Bibimbap",
      subcategory: "Pirinç",
      description: "Sebze ve etli karışık pirinç yemeği",
      calories: 380,
      protein: 16,
      carbs: 45,
      fat: 12,
      servingSize: 250,
      servingUnit: "g",
      ingredients: ["Pirinç", "Sebzeler", "Yumurta", "Gochujang"],
      healthBenefits: ["Dengeli beslenme", "Vitamin kaynağı"],
      isRecommended: true,
    },
    {
      id: "kr_002",
      name: "Kimchi",
      category: "Kimchi",
      subcategory: "Fermente",
      description: "Lahana ve kırmızı biberden yapılan fermente gıda",
      calories: 23,
      protein: 2,
      carbs: 4,
      fat: 0.5,
      servingSize: 100,
      servingUnit: "g",
      ingredients: ["Lahana", "Kırmızı Biber", "Sarımsak", "Tuz"],
      healthBenefits: ["Probiyotik", "Lif kaynağı", "Antioksidan"],
      isRecommended: true,
    },
    {
      id: "kr_003",
      name: "Bulgogi",
      category: "Bulgogi",
      subcategory: "Et",
      description: "Tatlı soya sosunda marineli ince dilim et",
      calories: 320,
      protein: 32,
      carbs: 12,
      fat: 14,
      servingSize: 150,
      servingUnit: "g",
      ingredients: ["Sığır Eti", "Soya Sosu", "Şeker", "Sesam"],
      healthBenefits: ["Protein kaynağı", "Demir"],
      isRecommended: true,
    },
    {
      id: "kr_004",
      name: "Tteokbokki",
      category: "Çorbalar",
      subcategory: "Çorba",
      description: "Kırmızı biber sosunda pirinç keki",
      calories: 200,
      protein: 6,
      carbs: 35,
      fat: 4,
      servingSize: 200,
      servingUnit: "g",
      ingredients: ["Pirinç Keki", "Gochujang", "Balık Suyu", "Sebzeler"],
      healthBenefits: ["Enerji kaynağı"],
    },
    {
      id: "kr_005",
      name: "Gochujang Sos",
      category: "Soslar",
      subcategory: "Sos",
      description: "Kırmızı biber ve soya sosundan yapılan sos",
      calories: 80,
      protein: 4,
      carbs: 12,
      fat: 2,
      servingSize: 30,
      servingUnit: "g",
      ingredients: ["Kırmızı Biber", "Soya Sosu", "Şeker", "Sarımsak"],
      healthBenefits: ["Antioksidan", "Metabolizm hızlandırıcı"],
      isRecommended: true,
    },
    {
      id: "kr_006",
      name: "Bingsu",
      category: "Tatlılar",
      subcategory: "Tatlı",
      description: "Buz ve tatlı malzemeleriyle yapılan tatlı",
      calories: 250,
      protein: 5,
      carbs: 50,
      fat: 3,
      servingSize: 200,
      servingUnit: "g",
      ingredients: ["Buz", "Evaporated Milk", "Şeker", "Meyve"],
      healthBenefits: ["Serinletici", "Enerji kaynağı"],
    },
  ],
};

export const cuisineCategoriesService = {
  /**
   * Tüm mutfakları getir
   */
  getAllCuisines(): CuisineCategory[] {
    return [TURKISH_CUISINE, ITALIAN_CUISINE, FRENCH_CUISINE, JAPANESE_CUISINE, KOREAN_CUISINE];
  },

  /**
   * Mutfak ID ile getir
   */
  getCuisineById(id: string): CuisineCategory | undefined {
    return this.getAllCuisines().find((c) => c.id === id);
  },

  /**
   * Mutfak adı ile getir
   */
  getCuisineByName(name: string): CuisineCategory | undefined {
    return this.getAllCuisines().find((c) => c.name.toLowerCase() === name.toLowerCase());
  },

  /**
   * Mutfakta gıda ara
   */
  searchFoodInCuisine(cuisineId: string, query: string): CuisineFood[] {
    const cuisine = this.getCuisineById(cuisineId);
    if (!cuisine) return [];

    return cuisine.foods.filter(
      (food) =>
        food.name.toLowerCase().includes(query.toLowerCase()) ||
        food.category.toLowerCase().includes(query.toLowerCase()) ||
        food.subcategory.toLowerCase().includes(query.toLowerCase())
    );
  },

  /**
   * Kategoriye göre gıdaları getir
   */
  getFoodsByCategory(cuisineId: string, category: string): CuisineFood[] {
    const cuisine = this.getCuisineById(cuisineId);
    if (!cuisine) return [];

    return cuisine.foods.filter((food) => food.category === category);
  },

  /**
   * Alt kategoriye göre gıdaları getir
   */
  getFoodsBySubcategory(cuisineId: string, subcategory: string): CuisineFood[] {
    const cuisine = this.getCuisineById(cuisineId);
    if (!cuisine) return [];

    return cuisine.foods.filter((food) => food.subcategory === subcategory);
  },

  /**
   * Önerilen gıdaları getir
   */
  getRecommendedFoods(cuisineId: string): CuisineFood[] {
    const cuisine = this.getCuisineById(cuisineId);
    if (!cuisine) return [];

    return cuisine.foods.filter((food) => food.isRecommended === true);
  },

  /**
   * Yasaklı gıdaları getir
   */
  getProhibitedFoods(cuisineId: string): CuisineFood[] {
    const cuisine = this.getCuisineById(cuisineId);
    if (!cuisine) return [];

    return cuisine.foods.filter((food) => food.isProhibited === true);
  },

  /**
   * Tüm alt kategorileri getir
   */
  getAllSubcategories(cuisineId: string): string[] {
    const cuisine = this.getCuisineById(cuisineId);
    if (!cuisine) return [];

    const subcategories = new Set(cuisine.foods.map((food) => food.subcategory));
    return Array.from(subcategories).sort();
  },

  /**
   * Gıda ID ile getir
   */
  getFoodById(cuisineId: string, foodId: string): CuisineFood | undefined {
    const cuisine = this.getCuisineById(cuisineId);
    if (!cuisine) return undefined;

    return cuisine.foods.find((food) => food.id === foodId);
  },

  /**
   * Tüm mutfaklarda gıda ara
   */
  searchFoodGlobally(query: string): Array<{ cuisine: CuisineCategory; food: CuisineFood }> {
    const results: Array<{ cuisine: CuisineCategory; food: CuisineFood }> = [];

    this.getAllCuisines().forEach((cuisine) => {
      cuisine.foods.forEach((food) => {
        if (
          food.name.toLowerCase().includes(query.toLowerCase()) ||
          food.description.toLowerCase().includes(query.toLowerCase())
        ) {
          results.push({ cuisine, food });
        }
      });
    });

    return results;
  },

  /**
   * Mutfak özellikleri
   */
  getCuisineCharacteristics(cuisineId: string): string[] {
    const cuisine = this.getCuisineById(cuisineId);
    return cuisine?.characteristics || [];
  },

  /**
   * Kalori aralığında gıda ara
   */
  searchFoodByCalories(
    cuisineId: string,
    minCalories: number,
    maxCalories: number
  ): CuisineFood[] {
    const cuisine = this.getCuisineById(cuisineId);
    if (!cuisine) return [];

    return cuisine.foods.filter((food) => food.calories >= minCalories && food.calories <= maxCalories);
  },

  /**
   * Protein yüksek gıdaları getir
   */
  getHighProteinFoods(cuisineId: string, minProtein: number = 20): CuisineFood[] {
    const cuisine = this.getCuisineById(cuisineId);
    if (!cuisine) return [];

    return cuisine.foods.filter((food) => food.protein >= minProtein).sort((a, b) => b.protein - a.protein);
  },

  /**
   * Düşük kalori gıdaları getir
   */
  getLowCalorieFoods(cuisineId: string, maxCalories: number = 150): CuisineFood[] {
    const cuisine = this.getCuisineById(cuisineId);
    if (!cuisine) return [];

    return cuisine.foods.filter((food) => food.calories <= maxCalories).sort((a, b) => a.calories - b.calories);
  },
};
