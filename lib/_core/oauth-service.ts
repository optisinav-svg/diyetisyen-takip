/**
 * Sosyal Giriş (OAuth) Service
 * Google, Apple, Facebook ile giriş entegrasyonu
 */

export interface OAuthProvider {
  name: "google" | "apple" | "facebook";
  clientId: string;
  clientSecret?: string;
  redirectUrl: string;
}

export interface OAuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: "google" | "apple" | "facebook";
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export interface OAuthConfig {
  google: OAuthProvider;
  apple: OAuthProvider;
  facebook: OAuthProvider;
}

// Mock OAuth konfigürasyonu
const oauthConfig: OAuthConfig = {
  google: {
    name: "google",
    clientId: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
    redirectUrl: "https://diyetapp.example.com/auth/google/callback",
  },
  apple: {
    name: "apple",
    clientId: "com.diyetapp.signin",
    redirectUrl: "https://diyetapp.example.com/auth/apple/callback",
  },
  facebook: {
    name: "facebook",
    clientId: "YOUR_FACEBOOK_APP_ID",
    redirectUrl: "https://diyetapp.example.com/auth/facebook/callback",
  },
};

// Mock token depolama
const oauthTokens: Map<string, OAuthUser> = new Map();
const linkedAccounts: Map<string, string[]> = new Map(); // userId -> [provider1, provider2, ...]

export const oauthService = {
  /**
   * Google ile giriş yap
   */
  async signInWithGoogle(idToken: string): Promise<OAuthUser> {
    try {
      // Gerçek uygulamada Google API ile token doğrulanır
      const user: OAuthUser = {
        id: `google-${Math.random().toString(36).substring(7)}`,
        email: "user@gmail.com",
        name: "Google User",
        picture: "https://example.com/picture.jpg",
        provider: "google",
        accessToken: idToken,
        expiresAt: Date.now() + 3600000,
      };

      oauthTokens.set(user.id, user);
      return user;
    } catch (error) {
      console.error("Google giriş hatası:", error);
      throw error;
    }
  },

  /**
   * Apple ile giriş yap
   */
  async signInWithApple(identityToken: string): Promise<OAuthUser> {
    try {
      // Gerçek uygulamada Apple API ile token doğrulanır
      const user: OAuthUser = {
        id: `apple-${Math.random().toString(36).substring(7)}`,
        email: "user@icloud.com",
        name: "Apple User",
        provider: "apple",
        accessToken: identityToken,
        expiresAt: Date.now() + 3600000,
      };

      oauthTokens.set(user.id, user);
      return user;
    } catch (error) {
      console.error("Apple giriş hatası:", error);
      throw error;
    }
  },

  /**
   * Facebook ile giriş yap
   */
  async signInWithFacebook(accessToken: string): Promise<OAuthUser> {
    try {
      // Gerçek uygulamada Facebook API ile token doğrulanır
      const user: OAuthUser = {
        id: `facebook-${Math.random().toString(36).substring(7)}`,
        email: "user@facebook.com",
        name: "Facebook User",
        picture: "https://example.com/facebook-picture.jpg",
        provider: "facebook",
        accessToken,
        expiresAt: Date.now() + 5184000000, // 60 gün
      };

      oauthTokens.set(user.id, user);
      return user;
    } catch (error) {
      console.error("Facebook giriş hatası:", error);
      throw error;
    }
  },

  /**
   * OAuth token doğrula
   */
  async validateToken(token: string, provider: "google" | "apple" | "facebook"): Promise<boolean> {
    try {
      // Gerçek uygulamada provider API'si ile doğrulama yapılır
      console.log(`Token doğrulanıyor: ${provider}`);
      return true;
    } catch (error) {
      console.error("Token doğrulama hatası:", error);
      return false;
    }
  },

  /**
   * OAuth hesabını mevcut hesapla bağla
   */
  async linkOAuthAccount(
    userId: string,
    oauthUser: OAuthUser
  ): Promise<boolean> {
    try {
      const linkedProviders = linkedAccounts.get(userId) || [];

      // Aynı provider'ı tekrar bağlamayı engelle
      if (linkedProviders.includes(oauthUser.provider)) {
        throw new Error(`${oauthUser.provider} zaten bağlı`);
      }

      linkedProviders.push(oauthUser.provider);
      linkedAccounts.set(userId, linkedProviders);

      // Token'ı sakla
      oauthTokens.set(`${userId}-${oauthUser.provider}`, oauthUser);

      console.log(`${oauthUser.provider} hesabı bağlandı`);
      return true;
    } catch (error) {
      console.error("Hesap bağlama hatası:", error);
      return false;
    }
  },

  /**
   * OAuth hesabının bağlantısını kaldır
   */
  async unlinkOAuthAccount(
    userId: string,
    provider: "google" | "apple" | "facebook"
  ): Promise<boolean> {
    try {
      const linkedProviders = linkedAccounts.get(userId) || [];
      const index = linkedProviders.indexOf(provider);

      if (index > -1) {
        linkedProviders.splice(index, 1);
        linkedAccounts.set(userId, linkedProviders);
        oauthTokens.delete(`${userId}-${provider}`);

        console.log(`${provider} hesabının bağlantısı kaldırıldı`);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Bağlantı kaldırma hatası:", error);
      return false;
    }
  },

  /**
   * Bağlı OAuth hesaplarını al
   */
  async getLinkedAccounts(userId: string): Promise<string[]> {
    return linkedAccounts.get(userId) || [];
  },

  /**
   * OAuth token'ı yenile
   */
  async refreshToken(userId: string, provider: "google" | "apple" | "facebook"): Promise<OAuthUser | null> {
    try {
      const tokenKey = `${userId}-${provider}`;
      const user = oauthTokens.get(tokenKey);

      if (!user) return null;

      // Gerçek uygulamada refresh token API'si kullanılır
      user.expiresAt = Date.now() + 3600000;
      oauthTokens.set(tokenKey, user);

      return user;
    } catch (error) {
      console.error("Token yenileme hatası:", error);
      return null;
    }
  },

  /**
   * OAuth profil bilgisini al
   */
  async getOAuthProfile(
    provider: "google" | "apple" | "facebook",
    accessToken: string
  ): Promise<any> {
    try {
      // Gerçek uygulamada provider API'si ile profil bilgisi alınır
      const profiles: { [key: string]: any } = {
        google: {
          id: "google-123",
          email: "user@gmail.com",
          name: "Google User",
          picture: "https://example.com/google-picture.jpg",
        },
        apple: {
          id: "apple-123",
          email: "user@icloud.com",
          name: "Apple User",
        },
        facebook: {
          id: "facebook-123",
          email: "user@facebook.com",
          name: "Facebook User",
          picture: "https://example.com/facebook-picture.jpg",
        },
      };

      return profiles[provider];
    } catch (error) {
      console.error("Profil bilgisi alınamadı:", error);
      return null;
    }
  },

  /**
   * OAuth giriş akışını başlat
   */
  async initiateOAuthFlow(provider: "google" | "apple" | "facebook"): Promise<string> {
    try {
      const config = oauthConfig[provider];
      const state = Math.random().toString(36).substring(7);
      const scope = provider === "google" 
        ? "openid email profile" 
        : provider === "apple"
          ? "email name"
          : "email public_profile";

      const authUrl = new URL(`https://${provider}.com/oauth/authorize`);
      authUrl.searchParams.append("client_id", config.clientId);
      authUrl.searchParams.append("redirect_uri", config.redirectUrl);
      authUrl.searchParams.append("response_type", "code");
      authUrl.searchParams.append("scope", scope);
      authUrl.searchParams.append("state", state);

      return authUrl.toString();
    } catch (error) {
      console.error("OAuth akışı başlatılamadı:", error);
      throw error;
    }
  },

  /**
   * OAuth callback işle
   */
  async handleOAuthCallback(
    provider: "google" | "apple" | "facebook",
    code: string,
    state: string
  ): Promise<OAuthUser | null> {
    try {
      // Gerçek uygulamada authorization code token ile değiştirilir
      console.log(`OAuth callback işleniyor: ${provider}`);

      if (provider === "google") {
        return this.signInWithGoogle(code);
      } else if (provider === "apple") {
        return this.signInWithApple(code);
      } else if (provider === "facebook") {
        return this.signInWithFacebook(code);
      }

      return null;
    } catch (error) {
      console.error("OAuth callback hatası:", error);
      return null;
    }
  },

  /**
   * OAuth konfigürasyonunu al
   */
  getOAuthConfig(): OAuthConfig {
    return oauthConfig;
  },

  /**
   * OAuth konfigürasyonunu güncelle
   */
  updateOAuthConfig(newConfig: Partial<OAuthConfig>): void {
    Object.assign(oauthConfig, newConfig);
  },
};
