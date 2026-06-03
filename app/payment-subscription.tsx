import { ScrollView, Text, View, TouchableOpacity, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  isPopular?: boolean;
}

interface PaymentHistory {
  id: string;
  date: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  plan: string;
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Ücretsiz",
    price: 0,
    period: "Süresiz",
    features: [
      "Temel profil yönetimi",
      "Sınırlı öğün kaydı (5/gün)",
      "Temel sağlık takibi",
      "Mesajlaşma (sınırlı)",
    ],
  },
  {
    id: "basic",
    name: "Başlangıç",
    price: 49,
    period: "Aylık",
    features: [
      "Sınırsız öğün kaydı",
      "Detaylı sağlık analitikleri",
      "Mesajlaşma (sınırsız)",
      "Hedef takibi",
      "Haftalık raporlar",
    ],
    isPopular: true,
  },
  {
    id: "pro",
    name: "Profesyonel",
    price: 99,
    period: "Aylık",
    features: [
      "Tüm Başlangıç özellikleri",
      "AI-powered beslenme analizi",
      "Diyetisyen danışmanlığı",
      "Özel raporlar",
      "Öncelikli destek",
      "Wearable entegrasyonu",
    ],
  },
  {
    id: "enterprise",
    name: "Kurumsal",
    price: 299,
    period: "Aylık",
    features: [
      "Tüm Pro özellikleri",
      "Sınırsız danışan yönetimi",
      "Özel API erişimi",
      "Dedike destek",
      "Özel entegrasyonlar",
      "Veri analitikleri",
    ],
  },
];

const PAYMENT_HISTORY: PaymentHistory[] = [
  {
    id: "1",
    date: "2026-05-06",
    amount: 49,
    status: "completed",
    plan: "Başlangıç",
  },
  {
    id: "2",
    date: "2026-04-06",
    amount: 49,
    status: "completed",
    plan: "Başlangıç",
  },
  {
    id: "3",
    date: "2026-03-06",
    amount: 49,
    status: "completed",
    plan: "Başlangıç",
  },
];

export default function PaymentSubscriptionScreen() {
  const router = useRouter();
  const colors = useColors();
  const [selectedPlan, setSelectedPlan] = useState("basic");
  const [activeTab, setActiveTab] = useState<"plans" | "history">("plans");

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    Alert.alert(
      "Abonelik Değişikliği",
      `${SUBSCRIPTION_PLANS.find((p) => p.id === planId)?.name} planına geçmek istiyor musunuz?`,
      [
        { text: "İptal", onPress: () => {}, style: "cancel" },
        {
          text: "Onayla",
          onPress: () => {
            Alert.alert("Başarılı", "Abonelik başarıyla güncellendi!");
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return colors.success;
      case "pending":
        return colors.warning;
      case "failed":
        return colors.error;
      default:
        return colors.muted;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Tamamlandı";
      case "pending":
        return "Beklemede";
      case "failed":
        return "Başarısız";
      default:
        return status;
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-3xl font-bold text-foreground flex-1">💳 Ödeme ve Abonelik</Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 6,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.foreground, fontWeight: "600" }}>← Geri</Text>
            </TouchableOpacity>
          </View>

          {/* Tab Buttons */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setActiveTab("plans")}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor:
                  activeTab === "plans" ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  color:
                    activeTab === "plans"
                      ? "#ffffff"
                      : colors.foreground,
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                Planlar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("history")}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor:
                  activeTab === "history" ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  color:
                    activeTab === "history"
                      ? "#ffffff"
                      : colors.foreground,
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                Geçmiş
              </Text>
            </TouchableOpacity>
          </View>

          {/* Plans Tab */}
          {activeTab === "plans" && (
            <View className="gap-4">
              <Text className="text-sm text-muted mb-2">
                Sizin için uygun olan abonelik planını seçin.
              </Text>

              {SUBSCRIPTION_PLANS.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  onPress={() => handleSelectPlan(plan.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 12,
                      padding: 16,
                      borderWidth: 2,
                      borderColor:
                        selectedPlan === plan.id
                          ? colors.primary
                          : colors.border,
                      opacity:
                        selectedPlan === plan.id ? 1 : 0.8,
                    }}
                  >
                    {plan.isPopular && (
                      <View
                        style={{
                          position: "absolute",
                          top: -12,
                          right: 16,
                          backgroundColor: colors.primary,
                          paddingHorizontal: 12,
                          paddingVertical: 4,
                          borderRadius: 12,
                        }}
                      >
                        <Text
                          style={{
                            color: "#ffffff",
                            fontSize: 12,
                            fontWeight: "600",
                          }}
                        >
                          Popüler
                        </Text>
                      </View>
                    )}

                    <View className="flex-row items-baseline justify-between mb-3">
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "700",
                          color: colors.foreground,
                        }}
                      >
                        {plan.name}
                      </Text>
                      <View className="flex-row items-baseline gap-1">
                        <Text
                          style={{
                            fontSize: 24,
                            fontWeight: "700",
                            color: colors.primary,
                          }}
                        >
                          ₺{plan.price}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: colors.muted,
                          }}
                        >
                          {plan.period}
                        </Text>
                      </View>
                    </View>

                    <View className="gap-2">
                      {plan.features.map((feature, index) => (
                        <View
                          key={index}
                          className="flex-row items-center gap-2"
                        >
                          <Text
                            style={{
                              color: colors.success,
                              fontSize: 16,
                            }}
                          >
                            ✓
                          </Text>
                          <Text
                            style={{
                              color: colors.foreground,
                              fontSize: 13,
                            }}
                          >
                            {feature}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {selectedPlan === plan.id && (
                      <TouchableOpacity
                        style={{
                          marginTop: 12,
                          paddingVertical: 10,
                          paddingHorizontal: 16,
                          borderRadius: 8,
                          backgroundColor: colors.primary,
                        }}
                      >
                        <Text
                          style={{
                            color: "#ffffff",
                            fontWeight: "600",
                            textAlign: "center",
                          }}
                        >
                          Seçili Plan
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <View className="gap-4">
              <Text className="text-sm text-muted mb-2">
                Ödeme geçmişiniz
              </Text>

              {PAYMENT_HISTORY.map((payment) => (
                <View
                  key={payment.id}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 10,
                    padding: 14,
                    borderLeftWidth: 4,
                    borderLeftColor: getStatusColor(payment.status),
                  }}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: colors.foreground,
                      }}
                    >
                      {payment.plan}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: colors.primary,
                      }}
                    >
                      ₺{payment.amount}
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-between">
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.muted,
                      }}
                    >
                      {payment.date}
                    </Text>
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 6,
                        backgroundColor:
                          getStatusColor(payment.status) + "20",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "600",
                          color: getStatusColor(payment.status),
                        }}
                      >
                        {getStatusText(payment.status)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={{
                  marginTop: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.primary,
                }}
              >
                <Text
                  style={{
                    color: colors.primary,
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                >
                  Tüm Faturalarını İndir
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
