import { describe, it, expect, beforeEach } from "vitest";
import { telehealthService } from "@/lib/_core/telehealth-service";
import { nutritionReportPdfService } from "@/lib/_core/nutrition-report-pdf";
import { oauthService } from "@/lib/_core/oauth-service";

describe("Premium Features Tests", () => {
  // ============ Video Konsültasyon Testleri ============

  describe("Telehealth Service", () => {
    it("Video oturumu başlatabilmeli", async () => {
      const session = await telehealthService.startVideoSession("session-1");
      expect(session).toBeDefined();
      expect(session?.status).toBe("active");
    });

    it("Video oturumunu sonlandırabilmeli", async () => {
      const session = await telehealthService.endVideoSession(
        "session-1",
        "Danışmanlık tamamlandı",
        "https://example.com/recording.mp4"
      );
      expect(session).toBeDefined();
      expect(session?.status).toBe("completed");
      expect(session?.recordingUrl).toBeDefined();
    });

    it("Sohbet mesajı gönderebilmeli", async () => {
      const chat = await telehealthService.sendChatMessage(
        "session-1",
        "client-1",
        "Ayşe Yılmaz",
        "client",
        "Merhaba"
      );
      expect(chat).toBeDefined();
      expect(chat.message).toBe("Merhaba");
      expect(chat.senderRole).toBe("client");
    });

    it("Video oturumunu alabilmeli", async () => {
      const session = await telehealthService.getVideoSession("session-1");
      expect(session).toBeDefined();
    });

    it("Video oturumunu oluşturabilmeli", async () => {
      const created = await telehealthService.createVideoSession(
        "apt-1",
        "diet-1",
        "Dr. Mehmet Kaya",
        "client-1",
        "Ayşe Yılmaz",
        "Beslenme Danışmanlığı",
        "Haftalık beslenme planı gözden geçirmesi",
        Date.now() + 3600000,
        30
      );
      expect(created).toBeDefined();
      expect(created?.status).toBe("scheduled");
    });
  });

  // ============ Beslenme Raporu PDF Testleri ============

  describe("Nutrition Report PDF Service", () => {
    it("Haftalık rapor oluşturabilmeli", async () => {
      const report = await nutritionReportPdfService.generateWeeklyReport(
        "client-1",
        "Ayşe Yılmaz",
        "diet-1",
        "Dr. Mehmet Kaya",
        {}
      );
      expect(report).toBeDefined();
      expect(report.filename).toContain("weekly");
      expect(report.mimeType).toBe("application/pdf");
      expect(report.content).toBeDefined();
    });

    it("Aylık rapor oluşturabilmeli", async () => {
      const report = await nutritionReportPdfService.generateMonthlyReport(
        "client-1",
        "Ayşe Yılmaz",
        "diet-1",
        "Dr. Mehmet Kaya",
        {}
      );
      expect(report).toBeDefined();
      expect(report.filename).toContain("monthly");
      expect(report.mimeType).toBe("application/pdf");
      expect(report.content).toBeDefined();
    });

    it("Raporu email ile gönderebilmeli", async () => {
      const report = await nutritionReportPdfService.generateWeeklyReport(
        "client-1",
        "Ayşe Yılmaz",
        "diet-1",
        "Dr. Mehmet Kaya",
        {}
      );
      const sent = await nutritionReportPdfService.sendReportByEmail(
        "user@example.com",
        report,
        "Ayşe Yılmaz"
      );
      expect(sent).toBe(true);
    });

    it("Raporu sosyal ağlarda paylaşabilmeli", async () => {
      const report = await nutritionReportPdfService.generateWeeklyReport(
        "client-1",
        "Ayşe Yılmaz",
        "diet-1",
        "Dr. Mehmet Kaya",
        {}
      );
      const shared = await nutritionReportPdfService.shareReportOnSocial(
        "facebook",
        report,
        "Ayşe Yılmaz",
        "Beslenme raporumu paylaşıyorum!"
      );
      expect(shared).toBe(true);
    });

    it("Rapor dosya boyutu uygun olmalı", async () => {
      const report = await nutritionReportPdfService.generateWeeklyReport(
        "client-1",
        "Ayşe Yılmaz",
        "diet-1",
        "Dr. Mehmet Kaya",
        {}
      );
      expect(report.size).toBeGreaterThan(0);
      expect(report.size).toBeLessThan(10000000); // 10MB max
    });
  });

  // ============ OAuth Service Testleri ============

  describe("OAuth Service", () => {
    it("Google ile giriş yapabilmeli", async () => {
      const user = await oauthService.signInWithGoogle("mock-google-token");
      expect(user).toBeDefined();
      expect(user.provider).toBe("google");
      expect(user.email).toBeDefined();
      expect(user.accessToken).toBeDefined();
    });

    it("Apple ile giriş yapabilmeli", async () => {
      const user = await oauthService.signInWithApple("mock-apple-token");
      expect(user).toBeDefined();
      expect(user.provider).toBe("apple");
      expect(user.email).toBeDefined();
      expect(user.accessToken).toBeDefined();
    });

    it("Facebook ile giriş yapabilmeli", async () => {
      const user = await oauthService.signInWithFacebook("mock-facebook-token");
      expect(user).toBeDefined();
      expect(user.provider).toBe("facebook");
      expect(user.email).toBeDefined();
      expect(user.accessToken).toBeDefined();
    });

    it("OAuth hesabı bağlayabilmeli", async () => {
      const user = await oauthService.signInWithGoogle("mock-google-token");
      const linked = await oauthService.linkOAuthAccount("user-123", user);
      expect(linked).toBe(true);
    });

    it("Bağlı hesapları listeleyebilmeli", async () => {
      const user = await oauthService.signInWithGoogle("mock-google-token");
      await oauthService.linkOAuthAccount("user-123", user);
      const accounts = await oauthService.getLinkedAccounts("user-123");
      expect(Array.isArray(accounts)).toBe(true);
      expect(accounts.length).toBeGreaterThan(0);
    });

    it("OAuth hesabının bağlantısını kaldırabilmeli", async () => {
      const user = await oauthService.signInWithGoogle("mock-google-token");
      await oauthService.linkOAuthAccount("user-123", user);
      const unlinked = await oauthService.unlinkOAuthAccount("user-123", "google");
      expect(unlinked).toBe(true);
    });

    it("Token doğrulayabilmeli", async () => {
      const valid = await oauthService.validateToken("mock-token", "google");
      expect(typeof valid).toBe("boolean");
    });

    it("OAuth akışını başlatabilmeli", async () => {
      const authUrl = await oauthService.initiateOAuthFlow("google");
      expect(authUrl).toBeDefined();
      expect(authUrl).toContain("oauth");
    });

    it("OAuth callback işleyebilmeli", async () => {
      const user = await oauthService.handleOAuthCallback("google", "mock-code", "mock-state");
      expect(user).toBeDefined();
      expect(user?.provider).toBe("google");
    });

    it("OAuth konfigürasyonunu alabilmeli", () => {
      const config = oauthService.getOAuthConfig();
      expect(config).toBeDefined();
      expect(config.google).toBeDefined();
      expect(config.apple).toBeDefined();
      expect(config.facebook).toBeDefined();
    });

    it("Token yenileyebilmeli", async () => {
      const user = await oauthService.signInWithGoogle("mock-google-token");
      await oauthService.linkOAuthAccount("user-123", user);
      const refreshed = await oauthService.refreshToken("user-123", "google");
      expect(refreshed).toBeDefined();
      expect(refreshed?.expiresAt).toBeGreaterThan(Date.now());
    });

    it("OAuth profil bilgisini alabilmeli", async () => {
      const profile = await oauthService.getOAuthProfile("google", "mock-token");
      expect(profile).toBeDefined();
      expect(profile.email).toBeDefined();
      expect(profile.name).toBeDefined();
    });
  });

  // ============ Entegrasyon Testleri ============

  describe("Integration Tests", () => {
    it("Video konsültasyon ve rapor oluşturabilmeli", async () => {
      const session = await telehealthService.startVideoSession("session-1");
      const report = await nutritionReportPdfService.generateWeeklyReport(
        "client-1",
        "Ayşe Yılmaz",
        "diet-1",
        "Dr. Mehmet Kaya",
        {}
      );
      expect(session).toBeDefined();
      expect(report).toBeDefined();
    });

    it("OAuth giriş ve rapor oluşturabilmeli", async () => {
      const user = await oauthService.signInWithGoogle("mock-google-token");
      const report = await nutritionReportPdfService.generateWeeklyReport(
        "client-1",
        user.name,
        "diet-1",
        "Dr. Mehmet Kaya",
        {}
      );
      expect(user).toBeDefined();
      expect(report).toBeDefined();
    });

    it("Tüm premium özellikleri birlikte kullanabilmeli", async () => {
      // OAuth giriş
      const user = await oauthService.signInWithGoogle("mock-google-token");
      await oauthService.linkOAuthAccount("user-123", user);

      // Video konsültasyon
      const session = await telehealthService.startVideoSession("session-1");
      await telehealthService.sendChatMessage(
        "session-1",
        "client-1",
        "Ayşe Yılmaz",
        "client",
        "Danışmanlık için teşekkür ederim"
      );
      await telehealthService.endVideoSession(
        "session-1",
        "Danışmanlık tamamlandı",
        "https://example.com/recording.mp4"
      );

      // Rapor oluştur ve paylaş
      const report = await nutritionReportPdfService.generateWeeklyReport(
        "client-1",
        user.name,
        "diet-1",
        "Dr. Mehmet Kaya",
        {}
      );
      await nutritionReportPdfService.sendReportByEmail(
        user.email,
        report,
        user.name
      );

      expect(user).toBeDefined();
      expect(session).toBeDefined();
      expect(report).toBeDefined();
    });
  });
});
