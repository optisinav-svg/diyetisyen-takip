import { ScrollView, View, Text, Pressable, ActivityIndicator, Alert, FlatList } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { SectionCard, SectionTitle, PrimaryButton, SecondaryButton } from "@/components/app-ui";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

interface WebhookLog {
  id: string;
  type: "stripe" | "expo";
  event: string;
  status: "success" | "failed" | "pending";
  timestamp: Date;
  payload?: string;
  response?: string;
}

export default function WebhookDashboardScreen() {
  const colors = useColors();
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);

  // tRPC queries
  const getLogsQuery = trpc.webhookLogs.getLogs.useQuery({ limit: 50 });
  const clearLogsQuery = trpc.webhookLogs.clearOldLogs.useMutation();

  useEffect(() => {
    loadWebhookLogs();
  }, []);

  const loadWebhookLogs = async () => {
    try {
      const result = await getLogsQuery.refetch();
      if (result.data?.success && result.data.logs) {
        const logs = result.data.logs.map((log: any) => ({
          id: log.id.toString(),
          type: log.webhookType,
          event: log.eventType,
          status: log.status,
          timestamp: new Date(log.createdAt),
          payload: log.payload,
          response: log.response,
        }));
        setWebhookLogs(logs);
      }
    } catch (error) {
      console.error("Failed to load webhook logs:", error);
      Alert.alert("Hata", "Webhook logları yüklenemedi");
    }
  };

  const handleTestStripeWebhook = async () => {
    setIsLoading(true);
    try {
      // Send test webhook to backend
      const response = await fetch("/api/webhooks/stripe/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "payment_intent.succeeded",
          data: { amount: 9999, currency: "usd" },
        }),
      });

      if (response.ok) {
        Alert.alert("Başarılı", "Test Stripe webhook gönderildi");
        loadWebhookLogs();
      } else {
        Alert.alert("Hata", "Webhook gönderilemedi");
      }
    } catch (error) {
      Alert.alert("Hata", "Test webhook gönderilemedi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestExpoWebhook = async () => {
    setIsLoading(true);
    try {
      // Send test webhook to backend
      const response = await fetch("/api/webhooks/expo/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "push_notification_sent",
          data: { title: "Test", body: "Test notification" },
        }),
      });

      if (response.ok) {
        Alert.alert("Başarılı", "Test Expo webhook gönderildi");
        loadWebhookLogs();
      } else {
        Alert.alert("Hata", "Webhook gönderilemedi");
      }
    } catch (error) {
      Alert.alert("Hata", "Test webhook gönderilemedi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearLogs = () => {
    Alert.alert("Sil", "Tüm loglar silinsin mi?", [
      { text: "İptal", onPress: () => {} },
      {
        text: "Sil",
        onPress: async () => {
          try {
            await clearLogsQuery.mutateAsync();
            setWebhookLogs([]);
            Alert.alert("Başarılı", "Loglar silindi");
          } catch (error) {
            Alert.alert("Hata", "Loglar silinemedi");
          }
        },
      },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return colors.success;
      case "failed":
        return colors.error;
      case "pending":
        return colors.warning;
      default:
        return colors.muted;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "success":
        return "✓ Başarılı";
      case "failed":
        return "✗ Başarısız";
      case "pending":
        return "⏳ Beklemede";
      default:
        return status;
    }
  };

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">Webhook Dashboard</Text>
          <Text className="text-base text-muted">Webhook olaylarını test edin ve izleyin</Text>
        </View>

        {/* Test Buttons */}
        <SectionTitle title="Webhook Test" />
        <SectionCard>
          <View className="gap-3">
            <PrimaryButton
              label={isLoading ? "Gönderiliyor..." : "Stripe Webhook Test"}
              onPress={handleTestStripeWebhook}
              disabled={isLoading}
            />
            <SecondaryButton
              label={isLoading ? "Gönderiliyor..." : "Expo Webhook Test"}
              onPress={handleTestExpoWebhook}
              disabled={isLoading}
            />
          </View>
        </SectionCard>

        {/* Webhook Logs */}
        <SectionTitle title="Webhook Logları" />
        {getLogsQuery.isLoading ? (
          <View className="items-center justify-center py-8">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : webhookLogs.length > 0 ? (
          <>
            <SectionCard>
              <FlatList
                data={webhookLogs}
                scrollEnabled={false}
                renderItem={({ item, index }) => (
                  <Pressable
                    key={item.id}
                    onPress={() => setSelectedLog(selectedLog?.id === item.id ? null : item)}
                    className={`${index > 0 ? "border-t border-border pt-3 mt-3" : ""}`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2 mb-1">
                          <Text className="text-base font-semibold text-foreground capitalize">{item.type}</Text>
                          <Text
                            className="text-xs font-semibold px-2 py-1 rounded"
                            style={{ color: getStatusColor(item.status), backgroundColor: `${getStatusColor(item.status)}20` }}
                          >
                            {getStatusLabel(item.status)}
                          </Text>
                        </View>
                        <Text className="text-sm text-muted mb-1">{item.event}</Text>
                        <Text className="text-xs text-muted">{item.timestamp.toLocaleTimeString("tr-TR")}</Text>
                      </View>
                      <Text className="text-lg text-primary ml-2">{selectedLog?.id === item.id ? "▼" : "▶"}</Text>
                    </View>

                    {/* Expanded Details */}
                    {selectedLog?.id === item.id && (
                      <View className="mt-3 bg-surface rounded p-3 border border-border">
                        {item.payload && (
                          <View className="mb-3">
                            <Text className="text-xs font-semibold text-foreground mb-1">Payload:</Text>
                            <Text className="text-xs text-muted font-mono">{item.payload}</Text>
                          </View>
                        )}
                        {item.response && (
                          <View>
                            <Text className="text-xs font-semibold text-foreground mb-1">Response:</Text>
                            <Text className="text-xs text-muted font-mono">{item.response}</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </Pressable>
                )}
                keyExtractor={(item) => item.id}
              />
            </SectionCard>

            <SecondaryButton label="Logları Temizle" onPress={handleClearLogs} />
          </>
        ) : (
          <SectionCard>
            <Text className="text-center text-muted">Henüz webhook logu yok</Text>
          </SectionCard>
        )}

        {/* Info Box */}
        <View className="bg-blue-50 rounded-lg p-4 mt-6 border border-blue-200">
          <Text className="text-sm text-blue-900 font-semibold mb-2">💡 Webhook Endpoints</Text>
          <Text className="text-xs text-blue-800 leading-relaxed mb-2 font-mono">
            POST /api/webhooks/stripe
          </Text>
          <Text className="text-xs text-blue-800 leading-relaxed font-mono">
            POST /api/webhooks/expo
          </Text>
        </View>

        {/* Statistics */}
        <SectionTitle title="İstatistikler" />
        <SectionCard>
          <View className="flex-row gap-4">
            <View className="flex-1 items-center">
              <Text className="text-2xl font-bold text-success">{webhookLogs.filter((l) => l.status === "success").length}</Text>
              <Text className="text-xs text-muted mt-1">Başarılı</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-2xl font-bold text-error">{webhookLogs.filter((l) => l.status === "failed").length}</Text>
              <Text className="text-xs text-muted mt-1">Başarısız</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-2xl font-bold text-warning">{webhookLogs.filter((l) => l.status === "pending").length}</Text>
              <Text className="text-xs text-muted mt-1">Beklemede</Text>
            </View>
          </View>
        </SectionCard>
      </ScrollView>
    </ScreenContainer>
  );
}
