
import { Platform } from "react-native";

export interface BarcodeData {
  type: string;
  data: string;
  timestamp: number;
}

export interface FoodItem {
  barcode: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  brand?: string;
}

/**
 * Barcode Scanner Service
 * Gıda ürünlerinin barkodlarını tarayıp veritabanından bilgi çeker
 */
export class BarcodeScannerService {
  private static instance: BarcodeScannerService;
  private hasPermission: boolean = false;

  private constructor() {}

  static getInstance(): BarcodeScannerService {
    if (!BarcodeScannerService.instance) {
      BarcodeScannerService.instance = new BarcodeScannerService();
    }
    return BarcodeScannerService.instance;
  }

  /**
   * Kamera izni iste
   */
  async requestCameraPermission(): Promise<boolean> {
    if (Platform.OS === "web") {
      console.warn("Barcode scanner web'de desteklenmiyor");
      return false;
    }

    try {
      const { status } = { status: "granted" };
      this.hasPermission = status === "granted";
      return this.hasPermission;
    } catch (error) {
      console.error("Kamera izni hatası:", error);
      return false;
    }
  }

  /**
   * Kamera izni kontrol et
   */
  async checkCameraPermission(): Promise<boolean> {
    if (Platform.OS === "web") {
      return false;
    }

    try {
      const { status } = { status: "granted" };
      this.hasPermission = status === "granted";
      return this.hasPermission;
    } catch (error) {
      console.error("İzin kontrol hatası:", error);
      return false;
    }
  }

  /**
   * Barkod tarama işlemi
   * Gerçek uygulamada, bu veriler bir API'den gelecektir
   */
  async scanBarcode(barcodeData: string): Promise<FoodItem | null> {
    try {
      // Gerçek uygulamada, bu bir API çağrısı olacak:
      // const response = await fetch(`/api/food/barcode/${barcodeData}`);
      // const foodItem = await response.json();

      // Demo verileri - gerçek uygulamada API'den gelecek
      const foodDatabase: Record<string, FoodItem> = {
        "5901234123457": {
          barcode: "5901234123457",
          name: "Elma",
          calories: 52,
          protein: 0.3,
          carbs: 14,
          fat: 0.2,
          servingSize: "100g",
          brand: "Organik",
        },
        "5000112126834": {
          barcode: "5000112126834",
          name: "Süt (Tam Yağlı)",
          calories: 61,
          protein: 3.2,
          carbs: 4.8,
          fat: 3.3,
          servingSize: "100ml",
          brand: "Klasik",
        },
        "5010477000000": {
          barcode: "5010477000000",
          name: "Ekmek (Beyaz)",
          calories: 265,
          protein: 9,
          carbs: 49,
          fat: 3.3,
          servingSize: "100g",
          brand: "Standart",
        },
        "5000159401234": {
          barcode: "5000159401234",
          name: "Yumurta",
          calories: 155,
          protein: 13,
          carbs: 1.1,
          fat: 11,
          servingSize: "100g",
          brand: "Taze",
        },
        "5012345678905": {
          barcode: "5012345678905",
          name: "Tavuk Göğsü",
          calories: 165,
          protein: 31,
          carbs: 0,
          fat: 3.6,
          servingSize: "100g",
          brand: "Sağlıklı",
        },
      };

      const foodItem = foodDatabase[barcodeData];

      if (!foodItem) {
        console.warn(`Barkod bulunamadı: ${barcodeData}`);
        return null;
      }

      return foodItem;
    } catch (error) {
      console.error("Barcode tarama hatası:", error);
      return null;
    }
  }

  /**
   * Barkod formatını doğrula
   */
  validateBarcode(barcode: string): boolean {
    // EAN-13 veya UPC-A formatı kontrol
    const barcodeRegex = /^[0-9]{8,14}$/;
    return barcodeRegex.test(barcode);
  }

  /**
   * Barkod türünü belirle
   */
  identifyBarcodeType(barcodeType: string): string {
    const typeMap: Record<string, string> = {
      ean13: "EAN-13",
      ean8: "EAN-8",
      upca: "UPC-A",
      upce: "UPC-E",
      code128: "Code 128",
      code39: "Code 39",
      itf14: "ITF-14",
      datamatrix: "Data Matrix",
      qr: "QR Code",
      pdf417: "PDF417",
      aztec: "Aztec",
    };

    return typeMap[barcodeType.toLowerCase()] || barcodeType;
  }

  /**
   * Tarama geçmişi kaydet
   */
  async saveScanHistory(
    userId: string,
    barcodeData: BarcodeData,
    foodItem: FoodItem
  ): Promise<void> {
    try {
      // Gerçek uygulamada, bu verileri API'ye gönderecek
      const scanRecord = {
        userId,
        barcode: barcodeData.data,
        barcodeType: barcodeData.type,
        foodName: foodItem.name,
        timestamp: barcodeData.timestamp,
        nutritionData: {
          calories: foodItem.calories,
          protein: foodItem.protein,
          carbs: foodItem.carbs,
          fat: foodItem.fat,
        },
      };

      console.log("Tarama kaydedildi:", scanRecord);
      // await api.post("/api/scans", scanRecord);
    } catch (error) {
      console.error("Tarama geçmişi kaydetme hatası:", error);
    }
  }

  /**
   * Toplu tarama işlemi (birden fazla ürün)
   */
  async scanMultipleItems(barcodes: string[]): Promise<FoodItem[]> {
    const results: FoodItem[] = [];

    for (const barcode of barcodes) {
      if (this.validateBarcode(barcode)) {
        const foodItem = await this.scanBarcode(barcode);
        if (foodItem) {
          results.push(foodItem);
        }
      }
    }

    return results;
  }

  /**
   * Barkod tarama istatistikleri
   */
  async getScanStatistics(userId: string): Promise<{
    totalScans: number;
    uniqueProducts: number;
    lastScanDate: string | null;
  }> {
    try {
      // Gerçek uygulamada, bu verileri API'den çekecek
      return {
        totalScans: 0,
        uniqueProducts: 0,
        lastScanDate: null,
      };
    } catch (error) {
      console.error("İstatistik alma hatası:", error);
      return {
        totalScans: 0,
        uniqueProducts: 0,
        lastScanDate: null,
      };
    }
  }
}

export const barcodeScannerService = BarcodeScannerService.getInstance();
