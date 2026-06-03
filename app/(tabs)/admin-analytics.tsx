import { ScrollView, View, Text, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

interface AdminAnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalMeals: number;
  totalExports: number;
  totalWebhooks: number;
  webhookSuccess: number;
  webhookFailed: number;
  pushNotificationsSent: number;
  averageResponseTime: number;
  systemUptime: number;
  databaseSize: number;
  s3StorageUsed: number;
}

interface CronJobStatus {
  name: string;
  lastRun: string;
  nextRun: string;
  status: "completed" | "running" | "failed";
  duration: number;
}

export default function AdminAnalyticsScreen() {
  const colors = useColors();
  const [analyticsData, setAnalyticsData] = useState<AdminAnalyticsData | null>(null);
  const [cronJobs, setCronJobs] = useState<CronJobStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      // Mock admin analytics data
      const mockData: AdminAnalyticsData = {
        totalUsers: 245,
        activeUsers: 189,
        totalMeals: 3420,
        totalExports: 156,
        totalWebhooks: 1255,
        webhookSuccess: 1243,
        webhookFailed: 12,
        pushNotificationsSent: 2847,
        averageResponseTime: 145,
        systemUptime: 99.8,
        databaseSize: 2.5,
        s3StorageUsed: 15.3,
      };

      const mockCronJobs: CronJobStatus[] = [
        {
          name: "Daily Exports",
          lastRun: "2026-04-22T02:00:00Z",
          nextRun: "2026-04-23T02:00:00Z",
          status: "completed",
          duration: 245,
        },
        {
          name: "Weekly Reports",
          lastRun: "2026-04-21T09:00:00Z",
          nextRun: "2026-04-28T09:00:00Z",
          status: "completed",
          duration: 312,
        },
        {
          name: "Monthly Income",
          lastRun: "2026-04-01T08:00:00Z",
          nextRun: "2026-05-01T08:00:00Z",
          status: "completed",
          duration: 189,
        },
        {
          name: "Export Cleanup",
          lastRun: "2026-04-22T03:00:00Z",
          nextRun: "2026-04-23T03:00:00Z",
          status: "completed",
          duration: 45,
        },
      ];

      setAnalyticsData(mockData);
      setCronJobs(mockCronJobs);
    } catch (error) {
      console.error("Failed to load admin analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const StatCard = ({
    label,
    value,
    unit = "",
    color = "primary",
  }: {
    label: string;
    value: number | string;
    unit?: string;
    color?: "primary" | "success" | "warning" | "error";
  }) => {
    const colorMap = {
      primary: colors.primary,
      success: colors.success,
      warning: colors.warning,
      error: colors.error,
    };

    return (
      <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
        <Text className="text-xs text-muted mb-2">{label}</Text>
        <Text className="text-2xl font-bold" style={{ color: colorMap[color] }}>
          {value}
          {unit && <Text className="text-base text-muted ml-1">{unit}</Text>}
        </Text>
      </View>
    );
  };

  const CronJobCard = ({ job }: { job: CronJobStatus }) => {
    const statusColor =
      job.status === "completed"
        ? colors.success
        : job.status === "running"
          ? colors.warning
          : colors.error;

    return (
      <View className="bg-surface rounded-lg p-4 border border-border mb-3">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-base font-semibold text-foreground flex-1">{job.name}</Text>
          <View
            className="px-2 py-1 rounded"
            style={{ backgroundColor: statusColor + "20" }}
          >
            <Text className="text-xs font-semibold" style={{ color: statusColor }}>
              {job.status === "completed"
                ? "✓ Tamamlandı"
                : job.status === "running"
                  ? "⏳ Çalışıyor"
                  : "✗ Başarısız"}
            </Text>
          </View>
        </View>

        <View className="gap-1">
          <View className="flex-row justify-between">
            <Text className="text-xs text-muted">Son Çalışma:</Text>
            <Text className="text-xs text-foreground">
              {new Date(job.lastRun).toLocaleString("tr-TR")}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-xs text-muted">Sonraki Çalışma:</Text>
            <Text className="text-xs text-foreground">
              {new Date(job.nextRun).toLocaleString("tr-TR")}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-xs text-muted">Süre:</Text>
            <Text className="text-xs text-foreground">{job.duration}ms</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="p-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">Admin Analytics</Text>
          <Text className="text-base text-muted">Sistem performansı ve cron job'ları</Text>
        </View>

        {isLoading ? (
          <View className="items-center justify-center py-8">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : analyticsData ? (
          <>
            {/* System Overview */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-foreground mb-3">Sistem Özeti</Text>
              <View className="gap-3">
                <View className="flex-row gap-3">
                  <StatCard label="Toplam Kullanıcı" value={analyticsData.totalUsers} />
                  <StatCard label="Aktif Kullanıcı" value={analyticsData.activeUsers} />
                </View>
                <View className="flex-row gap-3">
                  <StatCard label="Sistem Uptime" value={analyticsData.systemUptime} unit="%" />
                  <StatCard
                    label="Ortalama Yanıt"
                    value={analyticsData.averageResponseTime}
                    unit="ms"
                  />
                </View>
              </View>
            </View>

            {/* Data Statistics */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-foreground mb-3">Veri İstatistikleri</Text>
              <View className="gap-3">
                <View className="flex-row gap-3">
                  <StatCard label="Toplam Öğün" value={analyticsData.totalMeals} />
                  <StatCard label="Toplam Export" value={analyticsData.totalExports} />
                </View>
                <View className="flex-row gap-3">
                  <StatCard
                    label="Database Boyutu"
                    value={analyticsData.databaseSize}
                    unit="GB"
                    color="warning"
                  />
                  <StatCard
                    label="S3 Kullanımı"
                    value={analyticsData.s3StorageUsed}
                    unit="GB"
                    color="warning"
                  />
                </View>
              </View>
            </View>

            {/* Webhook Statistics */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-foreground mb-3">Webhook İstatistikleri</Text>
              <View className="bg-surface rounded-lg p-4 border border-border gap-3">
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Text className="text-xs text-muted mb-1">Toplam</Text>
                    <Text className="text-2xl font-bold text-foreground">
                      {analyticsData.totalWebhooks}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-muted mb-1">Başarılı</Text>
                    <Text className="text-2xl font-bold text-success">
                      {analyticsData.webhookSuccess}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-muted mb-1">Başarısız</Text>
                    <Text className="text-2xl font-bold text-error">
                      {analyticsData.webhookFailed}
                    </Text>
                  </View>
                </View>

                <View className="border-t border-border pt-3">
                  <Text className="text-sm text-foreground font-semibold mb-2">Başarı Oranı</Text>
                  <View className="h-2 bg-border rounded-full overflow-hidden">
                    <View
                      className="h-full bg-success rounded-full"
                      style={{
                        width: `${Math.round(
                          (analyticsData.webhookSuccess /
                            (analyticsData.webhookSuccess + analyticsData.webhookFailed)) *
                            100
                        )}%`,
                      }}
                    />
                  </View>
                  <Text className="text-xs text-muted mt-2">
                    {Math.round(
                      (analyticsData.webhookSuccess /
                        (analyticsData.webhookSuccess + analyticsData.webhookFailed)) *
                        100
                    )}
                    % başarılı
                  </Text>
                </View>
              </View>
            </View>

            {/* Push Notifications */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-foreground mb-3">Push Notifications</Text>
              <View className="bg-surface rounded-lg p-4 border border-border">
                <View className="flex-row justify-between items-center">
                  <Text className="text-base text-muted">Gönderilen Bildirimler</Text>
                  <Text className="text-2xl font-bold text-foreground">
                    {analyticsData.pushNotificationsSent}
                  </Text>
                </View>
              </View>
            </View>

            {/* Cron Jobs */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-foreground mb-3">Cron Job'ları</Text>
              {cronJobs.map((job, index) => (
                <CronJobCard key={index} job={job} />
              ))}
            </View>

            {/* System Health */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-foreground mb-3">Sistem Sağlığı</Text>
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

                <View className="flex-row items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-green-900">Cron Jobs</Text>
                    <Text className="text-xs text-green-800">Çalışıyor</Text>
                  </View>
                  <View className="w-3 h-3 bg-green-500 rounded-full" />
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="gap-3 mb-6">
              <Pressable className="bg-primary rounded-lg p-4 items-center">
                <Text className="text-background font-semibold">Logs Görüntüle</Text>
              </Pressable>
              <Pressable className="bg-surface border border-border rounded-lg p-4 items-center">
                <Text className="text-foreground font-semibold">Export Rapor</Text>
              </Pressable>
            </View>
          </>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}
