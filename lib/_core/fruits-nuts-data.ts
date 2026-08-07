export interface FoodItem {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
  healthBenefits: string[];
}

export const TURKEY_FRUITS: FoodItem[] = [
  { id: "f1", name: "Elma", category: "Meyve", calories: 52, protein: 0.3, carbs: 14, fat: 0.2, servingSize: 100, servingUnit: "g", healthBenefits: ["Lif kaynağı", "C vitamini"] },
  { id: "f2", name: "Armut", category: "Meyve", calories: 57, protein: 0.4, carbs: 15, fat: 0.1, servingSize: 100, servingUnit: "g", healthBenefits: ["Lif kaynağı", "Antioksidan"] },
  { id: "f3", name: "Üzüm (Siyah)", category: "Meyve", calories: 69, protein: 0.7, carbs: 18, fat: 0.2, servingSize: 100, servingUnit: "g", healthBenefits: ["Antioksidan", "Resveratrol"] },
  { id: "f4", name: "Üzüm (Yeşil)", category: "Meyve", calories: 67, protein: 0.6, carbs: 17, fat: 0.4, servingSize: 100, servingUnit: "g", healthBenefits: ["C vitamini", "K vitamini"] },
  { id: "f5", name: "Kayısı", category: "Meyve", calories: 48, protein: 1.4, carbs: 11, fat: 0.4, servingSize: 100, servingUnit: "g", healthBenefits: ["A vitamini", "Beta karoten"] },
  { id: "f6", name: "Şeftali", category: "Meyve", calories: 39, protein: 0.9, carbs: 10, fat: 0.3, servingSize: 100, servingUnit: "g", healthBenefits: ["C vitamini", "A vitamini"] },
  { id: "f7", name: "Kiraz", category: "Meyve", calories: 63, protein: 1.1, carbs: 16, fat: 0.2, servingSize: 100, servingUnit: "g", healthBenefits: ["Antioksidan", "Melatonin"] },
  { id: "f8", name: "Vişne", category: "Meyve", calories: 50, protein: 1.0, carbs: 12, fat: 0.3, servingSize: 100, servingUnit: "g", healthBenefits: ["Antioksidan", "C vitamini"] },
  { id: "f9", name: "Erik", category: "Meyve", calories: 46, protein: 0.7, carbs: 11, fat: 0.3, servingSize: 100, servingUnit: "g", healthBenefits: ["Lif kaynağı", "K vitamini"] },
  { id: "f10", name: "Çilek", category: "Meyve", calories: 32, protein: 0.7, carbs: 8, fat: 0.3, servingSize: 100, servingUnit: "g", healthBenefits: ["C vitamini", "Antioksidan"] },
  { id: "f11", name: "Karpuz", category: "Meyve", calories: 30, protein: 0.6, carbs: 8, fat: 0.2, servingSize: 100, servingUnit: "g", healthBenefits: ["Likopen", "Hidrasyon"] },
  { id: "f12", name: "Kavun", category: "Meyve", calories: 34, protein: 0.8, carbs: 8, fat: 0.2, servingSize: 100, servingUnit: "g", healthBenefits: ["A vitamini", "C vitamini"] },
  { id: "f13", name: "İncir (Taze)", category: "Meyve", calories: 74, protein: 0.8, carbs: 19, fat: 0.3, servingSize: 100, servingUnit: "g", healthBenefits: ["Lif kaynağı", "Kalsiyum"] },
  { id: "f14", name: "İncir (Kuru)", category: "Meyve", calories: 249, protein: 3.3, carbs: 64, fat: 0.9, servingSize: 100, servingUnit: "g", healthBenefits: ["Lif kaynağı", "Demir"] },
  { id: "f15", name: "Nar", category: "Meyve", calories: 83, protein: 1.7, carbs: 19, fat: 1.2, servingSize: 100, servingUnit: "g", healthBenefits: ["Antioksidan", "C vitamini"] },
  { id: "f16", name: "Ayva", category: "Meyve", calories: 57, protein: 0.4, carbs: 15, fat: 0.1, servingSize: 100, servingUnit: "g", healthBenefits: ["C vitamini", "Lif kaynağı"] },
  { id: "f17", name: "Muşmula", category: "Meyve", calories: 47, protein: 0.4, carbs: 12, fat: 0.2, servingSize: 100, servingUnit: "g", healthBenefits: ["A vitamini", "Lif kaynağı"] },
  { id: "f18", name: "Dut (Siyah)", category: "Meyve", calories: 43, protein: 1.4, carbs: 10, fat: 0.4, servingSize: 100, servingUnit: "g", healthBenefits: ["C vitamini", "Demir"] },
  { id: "f19", name: "Dut (Beyaz)", category: "Meyve", calories: 43, protein: 1.4, carbs: 10, fat: 0.4, servingSize: 100, servingUnit: "g", healthBenefits: ["C vitamini", "Kalsiyum"] },
  { id: "f20", name: "Böğürtlen", category: "Meyve", calories: 43, protein: 1.4, carbs: 10, fat: 0.5, servingSize: 100, servingUnit: "g", healthBenefits: ["Antioksidan", "Lif kaynağı"] },
  { id: "f21", name: "Ahududu", category: "Meyve", calories: 52, protein: 1.2, carbs: 12, fat: 0.7, servingSize: 100, servingUnit: "g", healthBenefits: ["Antioksidan", "C vitamini"] },
  { id: "f22", name: "Portakal", category: "Meyve", calories: 47, protein: 0.9, carbs: 12, fat: 0.1, servingSize: 100, servingUnit: "g", healthBenefits: ["C vitamini", "Lif kaynağı"] },
  { id: "f23", name: "Mandalina", category: "Meyve", calories: 53, protein: 0.8, carbs: 13, fat: 0.3, servingSize: 100, servingUnit: "g", healthBenefits: ["C vitamini", "A vitamini"] },
  { id: "f24", name: "Limon", category: "Meyve", calories: 29, protein: 1.1, carbs: 9, fat: 0.3, servingSize: 100, servingUnit: "g", healthBenefits: ["C vitamini", "Antioksidan"] },
  { id: "f25", name: "Greyfurt", category: "Meyve", calories: 42, protein: 0.8, carbs: 11, fat: 0.1, servingSize: 100, servingUnit: "g", healthBenefits: ["C vitamini", "Lif kaynağı"] },
  { id: "f26", name: "Muz", category: "Meyve", calories: 89, protein: 1.1, carbs: 23, fat: 0.3, servingSize: 100, servingUnit: "g", healthBenefits: ["Potasyum", "B6 vitamini"] },
  { id: "f27", name: "Ananas", category: "Meyve", calories: 50, protein: 0.5, carbs: 13, fat: 0.1, servingSize: 100, servingUnit: "g", healthBenefits: ["C vitamini", "Bromelain"] },
  { id: "f28", name: "Mango", category: "Meyve", calories: 60, protein: 0.8, carbs: 15, fat: 0.4, servingSize: 100, servingUnit: "g", healthBenefits: ["A vitamini", "C vitamini"] },
  { id: "f29", name: "Avokado", category: "Meyve", calories: 160, protein: 2.0, carbs: 9, fat: 15, servingSize: 100, servingUnit: "g", healthBenefits: ["Sağlıklı yağ", "Potasyum"] },
  { id: "f30", name: "Kivi", category: "Meyve", calories: 61, protein: 1.1, carbs: 15, fat: 0.5, servingSize: 100, servingUnit: "g", healthBenefits: ["C vitamini", "K vitamini"] },
  { id: "f31", name: "Hurma", category: "Meyve", calories: 282, protein: 2.5, carbs: 75, fat: 0.4, servingSize: 100, servingUnit: "g", healthBenefits: ["Demir", "Potasyum"] },
  { id: "f32", name: "Kuru Kayısı", category: "Meyve", calories: 241, protein: 3.4, carbs: 63, fat: 0.5, servingSize: 100, servingUnit: "g", healthBenefits: ["A vitamini", "Demir"] },
  { id: "f33", name: "Kuru Üzüm", category: "Meyve", calories: 299, protein: 3.1, carbs: 79, fat: 0.5, servingSize: 100, servingUnit: "g", healthBenefits: ["Demir", "Potasyum"] },
  { id: "f34", name: "Kuru Erik", category: "Meyve", calories: 240, protein: 2.2, carbs: 64, fat: 0.4, servingSize: 100, servingUnit: "g", healthBenefits: ["Lif kaynağı", "K vitamini"] },
  { id: "f35", name: "Trabzon Hurması", category: "Meyve", calories: 70, protein: 0.6, carbs: 19, fat: 0.2, servingSize: 100, servingUnit: "g", healthBenefits: ["A vitamini", "C vitamini"] },
  { id: "f36", name: "Nar Ekşisi", category: "Meyve", calories: 40, protein: 0.2, carbs: 10, fat: 0.1, servingSize: 100, servingUnit: "g", healthBenefits: ["Antioksidan", "C vitamini"] },
];

export const TURKEY_NUTS: FoodItem[] = [
  { id: "n1", name: "Fındık", category: "Kuruyemiş", calories: 628, protein: 15, carbs: 17, fat: 61, servingSize: 30, servingUnit: "g", healthBenefits: ["E vitamini", "Sağlıklı yağ"] },
  { id: "n2", name: "Ceviz", category: "Kuruyemiş", calories: 654, protein: 15, carbs: 14, fat: 65, servingSize: 30, servingUnit: "g", healthBenefits: ["Omega-3", "Antioksidan"] },
  { id: "n3", name: "Badem", category: "Kuruyemiş", calories: 579, protein: 21, carbs: 22, fat: 50, servingSize: 30, servingUnit: "g", healthBenefits: ["E vitamini", "Magnezyum"] },
  { id: "n4", name: "Fıstık (Antep)", category: "Kuruyemiş", calories: 562, protein: 20, carbs: 28, fat: 45, servingSize: 30, servingUnit: "g", healthBenefits: ["Protein", "B6 vitamini"] },
  { id: "n5", name: "Kaju", category: "Kuruyemiş", calories: 553, protein: 18, carbs: 30, fat: 44, servingSize: 30, servingUnit: "g", healthBenefits: ["Demir", "Magnezyum"] },
  { id: "n6", name: "Yer Fıstığı", category: "Kuruyemiş", calories: 567, protein: 26, carbs: 16, fat: 49, servingSize: 30, servingUnit: "g", healthBenefits: ["Protein", "Niasin"] },
  { id: "n7", name: "Çam Fıstığı", category: "Kuruyemiş", calories: 673, protein: 14, carbs: 13, fat: 68, servingSize: 30, servingUnit: "g", healthBenefits: ["E vitamini", "Demir"] },
  { id: "n8", name: "Kestane", category: "Kuruyemiş", calories: 245, protein: 3.2, carbs: 53, fat: 2.2, servingSize: 100, servingUnit: "g", healthBenefits: ["Lif kaynağı", "C vitamini"] },
  { id: "n9", name: "Susam", category: "Kuruyemiş", calories: 573, protein: 18, carbs: 23, fat: 50, servingSize: 30, servingUnit: "g", healthBenefits: ["Kalsiyum", "Demir"] },
  { id: "n10", name: "Ayçiçeği Çekirdeği", category: "Kuruyemiş", calories: 584, protein: 21, carbs: 20, fat: 51, servingSize: 30, servingUnit: "g", healthBenefits: ["E vitamini", "Selenyum"] },
  { id: "n11", name: "Kabak Çekirdeği", category: "Kuruyemiş", calories: 559, protein: 30, carbs: 11, fat: 49, servingSize: 30, servingUnit: "g", healthBenefits: ["Çinko", "Magnezyum"] },
  { id: "n12", name: "Keten Tohumu", category: "Kuruyemiş", calories: 534, protein: 18, carbs: 29, fat: 42, servingSize: 30, servingUnit: "g", healthBenefits: ["Omega-3", "Lif kaynağı"] },
  { id: "n13", name: "Chia Tohumu", category: "Kuruyemiş", calories: 486, protein: 17, carbs: 42, fat: 31, servingSize: 30, servingUnit: "g", healthBenefits: ["Omega-3", "Kalsiyum"] },
  { id: "n14", name: "Hindistan Cevizi (Kuru)", category: "Kuruyemiş", calories: 660, protein: 7, carbs: 24, fat: 65, servingSize: 30, servingUnit: "g", healthBenefits: ["MCT yağ", "Lif kaynağı"] },
  { id: "n15", name: "Macadamia", category: "Kuruyemiş", calories: 718, protein: 8, carbs: 14, fat: 76, servingSize: 30, servingUnit: "g", healthBenefits: ["Sağlıklı yağ", "Tiamin"] },
  { id: "n16", name: "Pekan Cevizi", category: "Kuruyemiş", calories: 691, protein: 9, carbs: 14, fat: 72, servingSize: 30, servingUnit: "g", healthBenefits: ["Antioksidan", "Çinko"] },
  { id: "n17", name: "Brezilya Cevizi", category: "Kuruyemiş", calories: 656, protein: 14, carbs: 12, fat: 66, servingSize: 30, servingUnit: "g", healthBenefits: ["Selenyum", "Magnezyum"] },
  { id: "n18", name: "Leblebi (Sarı)", category: "Kuruyemiş", calories: 364, protein: 19, carbs: 61, fat: 5, servingSize: 30, servingUnit: "g", healthBenefits: ["Protein", "Lif kaynağı"] },
  { id: "n19", name: "Leblebi (Beyaz)", category: "Kuruyemiş", calories: 360, protein: 18, carbs: 60, fat: 5, servingSize: 30, servingUnit: "g", healthBenefits: ["Protein", "Demir"] },
  { id: "n20", name: "Çekirdeksiz Kuru Üzüm", category: "Kuruyemiş", calories: 299, protein: 3, carbs: 79, fat: 0.5, servingSize: 30, servingUnit: "g", healthBenefits: ["Demir", "Antioksidan"] },
  { id: "n21", name: "Yer Fıstığı Ezmesi", category: "Kuruyemiş", calories: 588, protein: 25, carbs: 20, fat: 50, servingSize: 30, servingUnit: "g", healthBenefits: ["Protein", "Niasin"] },
  { id: "n22", name: "Tahin", category: "Kuruyemiş", calories: 595, protein: 17, carbs: 21, fat: 54, servingSize: 30, servingUnit: "g", healthBenefits: ["Kalsiyum", "Demir"] },
  { id: "n23", name: "Çiğdem (Safran)", category: "Kuruyemiş", calories: 310, protein: 11, carbs: 65, fat: 1, servingSize: 30, servingUnit: "g", healthBenefits: ["Antioksidan", "B vitamini"] },
  { id: "n24", name: "Mısır (Kavrulmuş)", category: "Kuruyemiş", calories: 408, protein: 13, carbs: 74, fat: 10, servingSize: 30, servingUnit: "g", healthBenefits: ["Lif kaynağı", "B vitamini"] },
];
