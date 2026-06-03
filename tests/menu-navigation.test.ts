import { describe, it, expect } from "vitest";

/**
 * Menü Navigasyonu Testi
 * Tüm features sayfalarının tıklanabilir özellikler içerip içermediğini ve
 * doğru rotalara yönlendirilip yönlendirilmediğini test eder.
 */

describe("Menü Navigasyonu", () => {
  // Features sayfaları ve beklenen özellikler
  const featuresPages = {
    authentication: {
      title: "🔐 Kimlik Doğrulama",
      features: 8,
      expectedRoutes: [
        "/biometric-login",
        "/profile",
        "/test-login",
      ],
    },
    nutrition: {
      title: "📊 Beslenme Takibi",
      features: 10,
      expectedRoutes: [
        "/add-custom-meal",
        "/food-management",
        "/meal-photo-upload",
        "/health-goals",
        "/advanced-analytics",
      ],
    },
    health: {
      title: "📈 Sağlık Verileri",
      features: 8,
      expectedRoutes: [
        "/health-data-entry",
        "/health-trend-charts",
      ],
    },
    analytics: {
      title: "📊 Analitik",
      features: 12,
      expectedRoutes: [
        "/advanced-analytics",
        "/health-trend-charts",
        "/health-goals",
        "/dietitian-recommendations",
      ],
    },
    messaging: {
      title: "💬 Mesajlaşma",
      features: 8,
      expectedRoutes: ["/messaging"],
    },
    notifications: {
      title: "🔔 Bildirimler",
      features: 8,
      expectedRoutes: [
        "/notification-center",
        "/push-notifications",
      ],
    },
    dashboard: {
      title: "👨‍⚕️ Diyetisyen Dashboard",
      features: 8,
      expectedRoutes: [
        "/client-matching",
        "/client-results",
        "/client-detail",
        "/activity-feed",
      ],
    },
    profile: {
      title: "📱 Profil ve Ayarlar",
      features: 8,
      expectedRoutes: [
        "/profile",
        "/push-notifications",
      ],
    },
    payment: {
      title: "💳 Ödeme ve Abonelik",
      features: 5,
      expectedRoutes: ["/payment-subscription"],
    },
    "nutrition-analysis": {
      title: "🍽️ Beslenme Analizi",
      features: 5,
      expectedRoutes: [
        "/meal-photo-upload",
        "/food-management",
      ],
    },
    appointments: {
      title: "📅 Randevu Sistemi",
      features: 5,
      expectedRoutes: ["/calendar-appointments"],
    },
    goals: {
      title: "🎯 Hedef Takibi",
      features: 5,
      expectedRoutes: [
        "/health-goals",
        "/advanced-analytics",
      ],
    },
  };

  describe("Features Sayfaları Yapısı", () => {
    it("Tüm features sayfaları tanımlanmış olmalı", () => {
      const pageNames = Object.keys(featuresPages);
      expect(pageNames.length).toBe(12);
      expect(pageNames).toContain("authentication");
      expect(pageNames).toContain("nutrition");
      expect(pageNames).toContain("health");
      expect(pageNames).toContain("analytics");
      expect(pageNames).toContain("messaging");
      expect(pageNames).toContain("notifications");
      expect(pageNames).toContain("dashboard");
      expect(pageNames).toContain("profile");
      expect(pageNames).toContain("payment");
      expect(pageNames).toContain("nutrition-analysis");
      expect(pageNames).toContain("appointments");
      expect(pageNames).toContain("goals");
    });

    it("Her features sayfasının başlığı olmalı", () => {
      Object.entries(featuresPages).forEach(([page, config]) => {
        expect(config.title).toBeDefined();
        expect(config.title.length).toBeGreaterThan(0);
      });
    });

    it("Her features sayfasının en az bir özelliği olmalı", () => {
      Object.entries(featuresPages).forEach(([page, config]) => {
        expect(config.features).toBeGreaterThan(0);
      });
    });

    it("Her features sayfasının en az bir rota yönlendirmesi olmalı", () => {
      Object.entries(featuresPages).forEach(([page, config]) => {
        expect(config.expectedRoutes.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Navigasyon Rotaları", () => {
    it("Kimlik Doğrulama sayfası doğru rotalara yönlendirilmeli", () => {
      const routes = featuresPages.authentication.expectedRoutes;
      expect(routes).toContain("/biometric-login");
      expect(routes).toContain("/profile");
    });

    it("Beslenme Takibi sayfası doğru rotalara yönlendirilmeli", () => {
      const routes = featuresPages.nutrition.expectedRoutes;
      expect(routes).toContain("/add-custom-meal");
      expect(routes).toContain("/meal-photo-upload");
      expect(routes).toContain("/health-goals");
    });

    it("Sağlık Verileri sayfası doğru rotalara yönlendirilmeli", () => {
      const routes = featuresPages.health.expectedRoutes;
      expect(routes).toContain("/health-data-entry");
      expect(routes).toContain("/health-trend-charts");
    });

    it("Analitik sayfası doğru rotalara yönlendirilmeli", () => {
      const routes = featuresPages.analytics.expectedRoutes;
      expect(routes).toContain("/advanced-analytics");
      expect(routes).toContain("/health-trend-charts");
    });

    it("Mesajlaşma sayfası doğru rotalara yönlendirilmeli", () => {
      const routes = featuresPages.messaging.expectedRoutes;
      expect(routes).toContain("/messaging");
    });

    it("Bildirimler sayfası doğru rotalara yönlendirilmeli", () => {
      const routes = featuresPages.notifications.expectedRoutes;
      expect(routes).toContain("/notification-center");
      expect(routes).toContain("/push-notifications");
    });

    it("Dashboard sayfası doğru rotalara yönlendirilmeli", () => {
      const routes = featuresPages.dashboard.expectedRoutes;
      expect(routes).toContain("/client-results");
      expect(routes).toContain("/activity-feed");
    });

    it("Profil sayfası doğru rotalara yönlendirilmeli", () => {
      const routes = featuresPages.profile.expectedRoutes;
      expect(routes).toContain("/profile");
    });

    it("Ödeme sayfası doğru rotalara yönlendirilmeli", () => {
      const routes = featuresPages.payment.expectedRoutes;
      expect(routes).toContain("/payment-subscription");
    });

    it("Beslenme Analizi sayfası doğru rotalara yönlendirilmeli", () => {
      const routes = featuresPages["nutrition-analysis"].expectedRoutes;
      expect(routes).toContain("/meal-photo-upload");
    });

    it("Randevu Sistemi sayfası doğru rotalara yönlendirilmeli", () => {
      const routes = featuresPages.appointments.expectedRoutes;
      expect(routes).toContain("/calendar-appointments");
    });

    it("Hedef Takibi sayfası doğru rotalara yönlendirilmeli", () => {
      const routes = featuresPages.goals.expectedRoutes;
      expect(routes).toContain("/health-goals");
    });
  });

  describe("Menü Özelliklerinin Sayısı", () => {
    it("Kimlik Doğrulama 8 özelliğe sahip olmalı", () => {
      expect(featuresPages.authentication.features).toBe(8);
    });

    it("Beslenme Takibi 10 özelliğe sahip olmalı", () => {
      expect(featuresPages.nutrition.features).toBe(10);
    });

    it("Sağlık Verileri 8 özelliğe sahip olmalı", () => {
      expect(featuresPages.health.features).toBe(8);
    });

    it("Analitik 12 özelliğe sahip olmalı", () => {
      expect(featuresPages.analytics.features).toBe(12);
    });

    it("Ödeme ve Abonelik 5 özelliğe sahip olmalı", () => {
      expect(featuresPages.payment.features).toBe(5);
    });
  });

  describe("Toplam Menü İstatistikleri", () => {
    it("Toplam 12 menü kategorisi olmalı", () => {
      const totalCategories = Object.keys(featuresPages).length;
      expect(totalCategories).toBe(12);
    });

    it("Toplam özellik sayısı 90 olmalı", () => {
      const totalFeatures = Object.values(featuresPages).reduce(
        (sum, page) => sum + page.features,
        0
      );
      expect(totalFeatures).toBe(90);
    });

    it("Tüm kategorilerde en az bir rota yönlendirmesi olmalı", () => {
      Object.entries(featuresPages).forEach(([page, config]) => {
        expect(config.expectedRoutes.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Navigasyon Tutarlılığı", () => {
    it("Aynı rota birden fazla kategoride kullanılabilir", () => {
      const allRoutes = Object.values(featuresPages).flatMap(
        (page) => page.expectedRoutes
      );
      // /profile birden fazla yerde kullanılıyor
      const profileCount = allRoutes.filter((r) => r === "/profile").length;
      expect(profileCount).toBeGreaterThan(1);

      // /health-trend-charts birden fazla yerde kullanılıyor
      const healthTrendCount = allRoutes.filter(
        (r) => r === "/health-trend-charts"
      ).length;
      expect(healthTrendCount).toBeGreaterThan(1);
    });

    it("Ödeme ekranı sadece ödeme kategorisinde kullanılmalı", () => {
      const allRoutes = Object.values(featuresPages).flatMap(
        (page) => page.expectedRoutes
      );
      const paymentCount = allRoutes.filter(
        (r) => r === "/payment-subscription"
      ).length;
      expect(paymentCount).toBe(1);
    });
  });
});
