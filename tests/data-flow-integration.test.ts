import { describe, it, expect, beforeEach } from "vitest";
import type { Message } from "../lib/_core/messaging-service";
import type { MealRecord } from "../lib/_core/meal-sync-service";
import type { SharedProductList } from "../lib/_core/product-sharing-service";
import type { NotificationTrigger } from "../lib/_core/notification-triggers";
import { messagingService } from "../lib/_core/messaging-service";
import { mealSyncService } from "../lib/_core/meal-sync-service";
import { productSharingService } from "../lib/_core/product-sharing-service";
import { notificationTriggersService } from "../lib/_core/notification-triggers";

describe("Danışan-Diyetisyen Bilgi Akışı Testleri", () => {
  beforeEach(() => {
    // Reset services before each test
  });

  describe("Mesajlaşma Sistemi", () => {
    it("Mesaj gönderme ve alma", async () => {
      const message = await messagingService.sendMessage(
        "conv-1",
        "client-1",
        "Ayşe Yılmaz",
        "client",
        "dietitian-1",
        "Merhaba Dr. Kaya"
      );

      expect(message).toBeDefined();
      expect(message.content).toBe("Merhaba Dr. Kaya");
      expect(message.senderRole).toBe("client");
      expect(message.isRead).toBe(false);
    });

    it("Konuşma oluşturma", async () => {
      const conversation = await messagingService.getOrCreateConversation(
        "client-1",
        "dietitian-1",
        "Ayşe Yılmaz",
        "Dr. Mehmet Kaya"
      );

      expect(conversation).toBeDefined();
      expect(conversation.clientId).toBe("client-1");
      expect(conversation.dietitianId).toBe("dietitian-1");
    });

    it("Mesajları okundu olarak işaretleme", async () => {
      const messages = await messagingService.getMessages("conv-1");
      const firstMessage = messages[0];

      await messagingService.markMessageAsRead(firstMessage.id);
      const updatedMessages = await messagingService.getMessages("conv-1");
      const updatedMessage = updatedMessages.find((m) => m.id === firstMessage.id);

      expect(updatedMessage?.isRead).toBe(true);
    });

    it("Mesaj arama", async () => {
      const results = await messagingService.searchMessages("conv-1", "Dr");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].content).toContain("Dr");
    });

    it("Mesaj istatistikleri", async () => {
      const stats = await messagingService.getMessageStats("conv-1");
      expect(stats.totalMessages).toBeGreaterThan(0);
      expect(stats.lastMessageTime).toBeDefined();
    });
  });

  describe("Öğün Senkronizasyonu", () => {
    it("Öğün kaydı", async () => {
      const meal = await mealSyncService.logMeal(
        "client-1",
        "Ayşe Yılmaz",
        "lunch",
        "Tavuk Salata",
        450,
        45,
        15,
        18,
        "Grilled tavuk, yeşil salata",
        undefined,
        true
      );

      expect(meal).toBeDefined();
      expect(meal.calories).toBe(450);
      expect(meal.mealType).toBe("lunch");
      expect(meal.photoAnalyzed).toBe(true);
    });

    it("Danışan öğünlerini getirme", async () => {
      const meals = await mealSyncService.getMealsForClient("client-1");
      expect(meals).toBeDefined();
      expect(meals.length).toBeGreaterThan(0);
    });

    it("Diyetisyen öğün görünümü", async () => {
      const view = await mealSyncService.getDietitianMealView("client-1", "dietitian-1");
      expect(view).toBeDefined();
      expect(view.clientId).toBe("client-1");
      expect(view.mealCount).toBeGreaterThan(0);
      expect(view.adherenceScore).toBeGreaterThanOrEqual(0);
      expect(view.adherenceScore).toBeLessThanOrEqual(100);
    });

    it("Öğün istatistikleri", async () => {
      const stats = await mealSyncService.getMealStats("client-1");
      expect(stats.totalMeals).toBeGreaterThan(0);
      expect(stats.totalCalories).toBeGreaterThan(0);
      expect(stats.avgCaloriesPerMeal).toBeGreaterThan(0);
    });

    it("Öğün bildirimleri", async () => {
      const notifications = await mealSyncService.getNotifications("dietitian-1");
      expect(notifications).toBeDefined();
      expect(Array.isArray(notifications)).toBe(true);
    });
  });

  describe("Ürün Listesi Paylaşımı", () => {
    it("Ürün listesi paylaşma", async () => {
      const sharedList = await productSharingService.shareProductList(
        "list-1",
        "Önerilen Ürünler",
        "dietitian-1",
        "Dr. Mehmet Kaya",
        "client-1",
        "Ayşe Yılmaz",
        "recommended",
        [
          {
            id: "prod-1",
            name: "Tavuk Göğsü",
            category: "et-balık",
            calories: 165,
            protein: 31,
            reason: "Yüksek protein",
          },
        ],
        ["et-balık"],
        "Bu ürünleri tüketmenizi öneriyorum"
      );

      expect(sharedList).toBeDefined();
      expect(sharedList.type).toBe("recommended");
      expect(sharedList.products.length).toBe(1);
    });

    it("Danışan paylaşılan listeleri getirme", async () => {
      const lists = await productSharingService.getSharedListsForClient("client-1");
      expect(lists).toBeDefined();
      expect(Array.isArray(lists)).toBe(true);
    });

    it("Önerilen ürünleri getirme", async () => {
      const products = await productSharingService.getRecommendedProducts("client-1");
      expect(products).toBeDefined();
      expect(Array.isArray(products)).toBe(true);
    });

    it("Yasaklı ürünleri getirme", async () => {
      const products = await productSharingService.getForbiddenProducts("client-1");
      expect(products).toBeDefined();
      expect(Array.isArray(products)).toBe(true);
    });

    it("Ürün arama", async () => {
      const results = await productSharingService.searchProducts("client-1", "tavuk");
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it("Kategori bazında ürün getirme", async () => {
      const products = await productSharingService.getProductsByCategory("client-1", "et-balık");
      expect(products).toBeDefined();
      expect(Array.isArray(products)).toBe(true);
    });
  });

  describe("Bildirim Tetikleyicileri", () => {
    it("Bildirim tetikleme", async () => {
      const trigger = await notificationTriggersService.triggerNotification(
        "client-1",
        "message",
        "Yeni Mesaj",
        "Dr. Kaya size mesaj gönderdi"
      );

      expect(trigger).toBeDefined();
      expect(trigger.type).toBe("message");
      expect(trigger.userId).toBe("client-1");
    });

    it("Kullanıcı tetikleyicilerini getirme", async () => {
      const triggers = await notificationTriggersService.getTriggers("client-1");
      expect(triggers).toBeDefined();
      expect(Array.isArray(triggers)).toBe(true);
    });

    it("Tetikleyici konfigürasyonu", async () => {
      const config = await notificationTriggersService.getConfig("client-1");
      expect(config).toBeDefined();
      expect(config.enableMessages).toBe(true);
      expect(config.enableMeals).toBe(true);
    });

    it("Tetikleyici konfigürasyonunu güncelleme", async () => {
      const updated = await notificationTriggersService.updateConfig("client-1", {
        enableMessages: false,
      });

      expect(updated.enableMessages).toBe(false);
      expect(updated.enableMeals).toBe(true);
    });

    it("Tetikleyici istatistikleri", async () => {
      const stats = await notificationTriggersService.getTriggerStats("client-1");
      expect(stats).toBeDefined();
      expect(stats.totalTriggers).toBeGreaterThanOrEqual(0);
      expect(stats.unreadTriggers).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Entegrasyon Testleri", () => {
    it("Mesaj → Bildirim akışı", async () => {
      const message = await messagingService.sendMessage(
        "conv-1",
        "dietitian-1",
        "Dr. Mehmet Kaya",
        "dietitian",
        "client-1",
        "Nasılsın?"
      );

      expect(message).toBeDefined();
      expect(message.isRead).toBe(false);
    });

    it("Öğün → Bildirim akışı", async () => {
      const meal = await mealSyncService.logMeal(
        "client-1",
        "Ayşe Yılmaz",
        "breakfast",
        "Yumurta",
        350,
        18,
        25,
        20
      );

      expect(meal).toBeDefined();
      const notifications = await mealSyncService.getNotifications("dietitian-1");
      expect(notifications.length).toBeGreaterThan(0);
    });

    it("Ürün Listesi → Bildirim akışı", async () => {
      const sharedList = await productSharingService.shareProductList(
        "list-test",
        "Test Listesi",
        "dietitian-1",
        "Dr. Mehmet Kaya",
        "client-1",
        "Ayşe Yılmaz",
        "recommended",
        [
          {
            id: "prod-test",
            name: "Test Ürünü",
            category: "test",
          },
        ],
        ["test"]
      );

      expect(sharedList).toBeDefined();
      const notifications = await productSharingService.getNotifications("client-1");
      expect(notifications.length).toBeGreaterThan(0);
    });

    it("Tam akış: Mesaj → Öğün → Ürün → Bildirim", async () => {
      // 1. Mesaj gönder
      const message = await messagingService.sendMessage(
        "conv-1",
        "dietitian-1",
        "Dr. Mehmet Kaya",
        "dietitian",
        "client-1",
        "Bugün ne yedin?"
      );
      expect(message).toBeDefined();

      // 2. Öğün kaydet
      const meal = await mealSyncService.logMeal(
        "client-1",
        "Ayşe Yılmaz",
        "lunch",
        "Tavuk",
        450,
        45,
        15,
        18
      );
      expect(meal).toBeDefined();

      // 3. Ürün listesi paylaş
      const sharedList = await productSharingService.shareProductList(
        "list-1",
        "Önerilen",
        "dietitian-1",
        "Dr. Mehmet Kaya",
        "client-1",
        "Ayşe Yılmaz",
        "recommended",
        [
          {
            id: "prod-1",
            name: "Tavuk",
            category: "et-balık",
            calories: 165,
            protein: 31,
          },
        ],
        ["et-balık"]
      );
      expect(sharedList).toBeDefined();

      // 4. Tüm bildirimler kontrol et
      const mealNotifs = await mealSyncService.getNotifications("dietitian-1");
      const productNotifs = await productSharingService.getNotifications("client-1");

      expect(mealNotifs.length).toBeGreaterThan(0);
      expect(productNotifs.length).toBeGreaterThan(0);
    });
  });
});
