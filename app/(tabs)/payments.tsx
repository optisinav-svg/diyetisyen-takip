import { useState, useEffect } from "react";
import { ScrollView, View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { AppTextInput, FieldLabel, PrimaryButton, SectionCard, SectionTitle, SecondaryButton } from "@/components/app-ui";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import * as WebBrowser from "expo-web-browser";

export default function PaymentsScreen() {
  const colors = useColors();
  const utils = trpc.useUtils();
  const { isAuthenticated } = useAuth();
  const profileQuery = trpc.profile.me.useQuery(undefined, { enabled: isAuthenticated });

  const role = profileQuery.data?.profile?.role;
  const [activeTab, setActiveTab] = useState<"subscription" | "history">("subscription");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  // Subscription Plans
  const subscriptionPlans = [
    { id: "basic", name: "Temel", price: 99, features: ["5 danışan", "Temel raporlar"] },
    { id: "pro", name: "Profesyonel", price: 199, features: ["20 danışan", "Gelişmiş raporlar", "API erişimi"] },
    { id: "enterprise", name: "Kurumsal", price: 499, features: ["Sınırsız danışan", "Özel destek", "Kişisel danışman"] },
  ];

  const paymentHistoryQuery = trpc.payments.history.useQuery(undefined, {
    enabled: isAuthenticated && role === "dietitian",
  });

  const subscribeMutation = trpc.payments.subscribe.useMutation({
    onSuccess: async () => {
      Alert.alert("Başarılı", "Abonelik başarıyla güncellendi");
      setCardNumber("");
      setExpiryDate("");
      setCvv("");
      await utils.profile.me.invalidate();
    },
    onError: (error: any) => {
      Alert.alert("Hata", error?.message || "Abonelik güncellenemedi");
    },
  });

  const handleSubscribe = async (planId: string) => {
    if (!cardNumber || !expiryDate || !cvv) {
      Alert.alert("Hata", "Lütfen tüm kart bilgilerini girin");
      return;
    }

    await subscribeMutation.mutateAsync({
      planId,
      cardNumber,
      expiryDate,
      cvv,
    });
  };

  const handleDownloadInvoice = async (paymentId: number) => {
    try {
      // This would call the backend to generate and download invoice
      const response = await fetch(`/api/payments/${paymentId}/invoice`);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        await WebBrowser.openBrowserAsync(url);
      }
    } catch (error) {
      Alert.alert("Hata", "Fatura indirilemedi");
    }
  };

  if (!isAuthenticated || role !== "dietitian") {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-lg text-muted">Bu ekran yalnızca diyetisyenler için kullanılabilir</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <View className="gap-4">
          <SectionTitle title="Ödeme ve Abonelik" />

          {/* Tab Navigation */}
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setActiveTab("subscription")}
              style={({ pressed }) => [
                {
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  backgroundColor: activeTab === "subscription" ? colors.primary : colors.surface,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === "subscription" ? "text-background" : "text-foreground"
                }`}
              >
                Abonelik
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab("history")}
              style={({ pressed }) => [
                {
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  backgroundColor: activeTab === "history" ? colors.primary : colors.surface,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === "history" ? "text-background" : "text-foreground"
                }`}
              >
                Geçmiş
              </Text>
            </Pressable>
          </View>

          {/* Subscription Tab */}
          {activeTab === "subscription" && (
            <View className="gap-4">
              <Text className="text-sm text-muted">Uygun plan seçin ve hemen başlayın</Text>

              {/* Subscription Plans */}
              {subscriptionPlans.map((plan) => (
                <SectionCard key={plan.id}>
                  <View className="gap-3">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-lg font-bold text-foreground">{plan.name}</Text>
                      <Text className="text-2xl font-bold text-primary">₺{plan.price}</Text>
                    </View>

                    <Text className="text-xs text-muted">/ay</Text>

                    {/* Features */}
                    <View className="gap-2">
                      {plan.features.map((feature, idx) => (
                        <View key={idx} className="flex-row items-center gap-2">
                          <Text className="text-primary">✓</Text>
                          <Text className="text-sm text-foreground">{feature}</Text>
                        </View>
                      ))}
                    </View>

                    <PrimaryButton
                      label={`${plan.name} Planını Seç`}
                      onPress={() => handleSubscribe(plan.id)}
                      disabled={subscribeMutation.isPending}
                    />
                  </View>
                </SectionCard>
              ))}

              {/* Card Information */}
              <SectionCard>
                <View className="gap-3">
                  <Text className="font-semibold text-foreground">Kart Bilgileri</Text>

                  <View>
                    <FieldLabel label="Kart Numarası" />
                    <AppTextInput
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChangeText={setCardNumber}
                      keyboardType="numeric"
                      maxLength={19}
                    />
                  </View>

                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <FieldLabel label="Son Kullanma Tarihi" />
                      <AppTextInput
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChangeText={setExpiryDate}
                        keyboardType="numeric"
                        maxLength={5}
                      />
                    </View>

                    <View className="flex-1">
                      <FieldLabel label="CVV" />
                      <AppTextInput
                        placeholder="123"
                        value={cvv}
                        onChangeText={setCvv}
                        keyboardType="numeric"
                        maxLength={4}
                        secureTextEntry
                      />
                    </View>
                  </View>

                  <Text className="text-xs text-muted">
                    Kart bilgileriniz güvenli bir şekilde işlenir. Hiçbir bilgi sunucuda saklanmaz.
                  </Text>
                </View>
              </SectionCard>
            </View>
          )}

          {/* Payment History Tab */}
          {activeTab === "history" && (
            <View className="gap-4">
              {paymentHistoryQuery.isLoading ? (
                <ActivityIndicator color={colors.primary} />
              ) : paymentHistoryQuery.data && paymentHistoryQuery.data.length > 0 ? (
                paymentHistoryQuery.data.map((payment: any) => (
                  <SectionCard key={payment.id}>
                    <View className="gap-3">
                      <View className="flex-row items-center justify-between">
                        <View>
                          <Text className="font-semibold text-foreground">
                            {payment.planId === "basic"
                              ? "Temel Plan"
                              : payment.planId === "pro"
                                ? "Profesyonel Plan"
                                : "Kurumsal Plan"}
                          </Text>
                          <Text className="text-xs text-muted mt-1">
                            {new Date(payment.paymentDate).toLocaleDateString("tr-TR")}
                          </Text>
                        </View>
                        <Text className="text-lg font-bold text-primary">₺{payment.amount}</Text>
                      </View>

                      <View className="flex-row items-center gap-2">
                        <View
                          className="px-3 py-1 rounded-full"
                          style={{
                            backgroundColor:
                              payment.status === "completed"
                                ? colors.success
                                : payment.status === "pending"
                                  ? colors.warning
                                  : colors.error,
                          }}
                        >
                          <Text className="text-xs font-semibold text-background">
                            {payment.status === "completed"
                              ? "Tamamlandı"
                              : payment.status === "pending"
                                ? "Beklemede"
                                : "İptal Edildi"}
                          </Text>
                        </View>
                      </View>

                      {payment.status === "completed" && (
                        <SecondaryButton
                          label="Faturayı İndir"
                          onPress={() => void handleDownloadInvoice(payment.id)}
                        />
                      )}
                    </View>
                  </SectionCard>
                ))
              ) : (
                <View className="items-center justify-center p-8">
                  <Text className="text-muted">Henüz ödeme geçmişi yok</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
