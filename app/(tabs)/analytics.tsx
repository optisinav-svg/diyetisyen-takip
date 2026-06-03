import { ScrollView, View, Text, Pressable, ActivityIndicator, Dimensions } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { SectionCard, SectionTitle } from "@/components/app-ui";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalMeals: number;
  totalExports: number;
  webhookSuccess: number;
  webhookFailed: number;
  pushNotificationsSent: number;
  averageResponseTime: number;
}

interface ChartData {
  label: string;
  value: number;
  percentage: number;
}

export default function AnalyticsScreen() {
  const colors = useColors();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<"day" | "week" | "month">("week");

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      // Mock analytics data
      const mockData: AnalyticsData = {
        totalUsers: 245,
        activeUsers: 189,
        totalMeals: 3420,
        totalExports: 156,
        webhookSuccess: 1243,
        webhookFailed: 12,
        pushNotificationsSent: 2847,
        averageResponseTime: 145,
      };
      setAnalyticsData(mockData);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSuccessRate = (success: number, total: number) => {
    return Math.round((success / (success + total)) * 100);
  };

  const StatCard = ({ label, value, unit = "" }: { label: string; value: number | string; unit?: string }) => (
    <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
      <Text className="text-xs text-muted mb-2">{label}</Text>
      <Text className="text-2xl font-bold text-foreground">
        {value}
        {unit && <Text className="text-base text-muted ml-1">{unit}</Text>}
      </Text>
    </View>
  );

  const ProgressBar = ({ percentage, label }: { percentage: number; label: string }) => (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-sm text-foreground font-medium">{label}</Text>
        <Text className="text-sm font-semibold text-primary">{percentage}%</Text>
      </View>
      <View className="h-2 bg-border rounded-full overflow-hidden">
        <View
          className="h-full bg-primary rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </View>
    </View>
  );

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">Analytics & Reporting</Text>
          <Text className="text-base text-muted">Sistem performansı ve kullanıcı aktivitesi</Text>
        </View>

        {/* Period Selector */}
        <View className="flex-row gap-2 mb-6">
          {(["day", "week", "month"] as const).map((period) => (
            <Pressable
              key={period}
              onPress={() => setSelectedPeriod(period)}
              className={`flex-1 py-2 px-3 rounded-lg border ${
                selectedPeriod === period
                  ? "bg-primary border-primary"
                  : "bg-surface border-border"
              }`}
            >
              <Text
                className={`text-center text-sm font-semibold ${
                  selectedPeriod === period ? "text-background" : "text-foreground"
                }`}
              >
                {period === "day" ? "Bugün" : period === "week" ? "Bu Hafta" : "Bu Ay"}
              </Text>
            </Pressable>
          ))}
        </View>

        {isLoading ? (
          <View className="items-center justify-center py-8">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : analyticsData ? (
          <>
            {/* User Statistics */}
            <SectionTitle title="Kullanıcı İstatistikleri" />
            <SectionCard>
              <View className="gap-3">
                <View className="flex-row gap-3">
                  <StatCard label="Toplam Kullanıcı" value={analyticsData.totalUsers} />
                  <StatCard label="Aktif Kullanıcı" value={analyticsData.activeUsers} />
                </View>
                <View className="flex-row gap-3">
                  <StatCard label="Toplam Öğün" value={analyticsData.totalMeals} />
                  <StatCard label="Dışa Aktarma" value={analyticsData.totalExports} />
                </View>
              </View>
            </SectionCard>

            {/* Webhook Statistics */}
            <SectionTitle title="Webhook Performansı" />
            <SectionCard>
              <View className="gap-4">
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Text className="text-xs text-muted mb-1">Başarılı</Text>
                    <Text className="text-2xl font-bold text-success">{analyticsData.webhookSuccess}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-muted mb-1">Başarısız</Text>
                    <Text className="text-2xl font-bold text-error">{analyticsData.webhookFailed}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-muted mb-1">Başarı Oranı</Text>
                    <Text className="text-2xl font-bold text-primary">
                      {getSuccessRate(analyticsData.webhookSuccess, analyticsData.webhookFailed)}%
                    </Text>
                  </View>
                </View>

                <ProgressBar
                  percentage={getSuccessRate(analyticsData.webhookSuccess, analyticsData.webhookFailed)}
                  label="Webhook Başarı Oranı"
                />
              </View>
            </SectionCard>

            {/* Push Notifications */}
            <SectionTitle title="Push Notifications" />
            <SectionCard>
              <View className="gap-3">
                <View className="flex-row justify-between items-center">
                  <Text className="text-base text-muted">Gönderilen Bildirimler</Text>
                  <Text className="text-2xl font-bold text-foreground">{analyticsData.pushNotificationsSent}</Text>
                </View>
                <View className="border-t border-border pt-3 flex-row justify-between items-center">
                  <Text className="text-base text-muted">Ortalama Yanıt Süresi</Text>
                  <Text className="text-2xl font-bold text-foreground">
                    {analyticsData.averageResponseTime}
                    <Text className="text-base text-muted ml-1">ms</Text>
                  </Text>
                </View>
              </View>
            </SectionCard>

            {/* Performance Metrics */}
            <SectionTitle title="Performans Metrikleri" />
            <SectionCard>
              <View className="gap-4">
                <ProgressBar
                  percentage={Math.round((analyticsData.activeUsers / analyticsData.totalUsers) * 100)}
                  label="Aktif Kullanıcı Oranı"
                />
                <ProgressBar
                  percentage={Math.round((analyticsData.totalMeals / (analyticsData.totalUsers * 20)) * 100)}
                  label="Ortalama Öğün Kaydı"
                />
                <ProgressBar
                  percentage={Math.round((analyticsData.totalExports / (analyticsData.totalUsers * 2)) * 100)}
                  label="Dışa Aktarma Oranı"
                />
              </View>
            </SectionCard>

            {/* System Health */}
            <SectionTitle title="Sistem Sağlığı" />
            <SectionCard>
              <View className="gap-3">
                <View className="flex-row items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-green-900">API Sunucusu</Text>
                    <Text className="text-xs text-green-800">Çalışıyor</Text>
                  </View>
                  <View className="w-3 h-3 bg-green-500 rounded-full" />
                </View>

                <View className="flex-row items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-green-900">Database</Text>
                    <Text className="text-xs text-green-800">Çalışıyor</Text>
                  </View>
                  <View className="w-3 h-3 bg-green-500 rounded-full" />
                </View>

                <View className="flex-row items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-green-900">S3 Storage</Text>
                    <Text className="text-xs text-green-800">Çalışıyor</Text>
                  </View>
                  <View className="w-3 h-3 bg-green-500 rounded-full" />
                </View>
              </View>
            </SectionCard>

            {/* Recent Activity */}
            <SectionTitle title="Son Aktiviteler" />
            <SectionCard>
              <View className="gap-3">
                <View className="flex-row items-center justify-between pb-3 border-b border-border">
                  <View>
                    <Text className="text-sm font-semibold text-foreground">Webhook İşlendi</Text>
                    <Text className="text-xs text-muted">2 dakika önce</Text>
                  </View>
                  <Text className="text-xs font-semibold text-success">✓</Text>
                </View>

                <View className="flex-row items-center justify-between pb-3 border-b border-border">
                  <View>
                    <Text className="text-sm font-semibold text-foreground">Export Tamamlandı</Text>
                    <Text className="text-xs text-muted">5 dakika önce</Text>
                  </View>
                  <Text className="text-xs font-semibold text-success">✓</Text>
                </View>

                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-sm font-semibold text-foreground">Bildirim Gönderildi</Text>
                    <Text className="text-xs text-muted">10 dakika önce</Text>
                  </View>
                  <Text className="text-xs font-semibold text-success">✓</Text>
                </View>
              </View>
            </SectionCard>
          </>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}
