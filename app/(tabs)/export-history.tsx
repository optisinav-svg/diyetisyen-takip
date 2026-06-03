import { ScrollView, View, Text, Pressable, ActivityIndicator, Alert, FlatList, Linking } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { SectionCard, SectionTitle, PrimaryButton, SecondaryButton } from "@/components/app-ui";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";

interface ExportRecord {
  id: string;
  type: "meals" | "measurements" | "income" | "performance" | "user-data";
  format: "csv" | "json";
  status: "completed" | "failed" | "pending";
  fileSize?: number;
  downloadUrl?: string;
  createdAt: Date;
  expiresAt: Date;
}

export default function ExportHistoryScreen() {
  const colors = useColors();
  const { isAuthenticated } = useAuth();
  const [exports, setExports] = useState<ExportRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedExport, setSelectedExport] = useState<ExportRecord | null>(null);

  // tRPC queries
  const getHistoryQuery = trpc.exportScheduler.getUserHistory.useQuery(50, { enabled: isAuthenticated });
  const deleteExportMutation = trpc.exportScheduler.cleanup.useMutation();

  useEffect(() => {
    loadExportHistory();
  }, []);

  const loadExportHistory = async () => {
    try {
      const result = await getHistoryQuery.refetch();
      if (result.data?.success && result.data.exports) {
        const records = result.data.exports.map((record: any) => ({
          id: record.id.toString(),
          type: record.type,
          format: record.format,
          status: record.status,
          fileSize: record.fileSize,
          downloadUrl: record.downloadUrl,
          createdAt: new Date(record.createdAt),
          expiresAt: new Date(record.expiresAt),
        }));
        setExports(records);
      }
    } catch (error) {
      console.error("Failed to load export history:", error);
      Alert.alert("Hata", "Dışa aktarma geçmişi yüklenemedi");
    }
  };

  const handleDownload = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Hata", "Dosya indirilemedi");
      }
    } catch (error) {
      Alert.alert("Hata", "Dosya indirilemedi");
    }
  };

  const handleDelete = (exportId: string) => {
    Alert.alert("Sil", "Bu dışa aktarma silinsin mi?", [
      { text: "İptal", onPress: () => {} },
      {
        text: "Sil",
        onPress: async () => {
          try {
            await deleteExportMutation.mutateAsync();
            setExports(exports.filter((e) => e.id !== exportId));
            Alert.alert("Başarılı", "Dışa aktarma silindi");
          } catch (error) {
            Alert.alert("Hata", "Dışa aktarma silinemedi");
          }
        },
      },
    ]);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      meals: "Öğünler",
      measurements: "Ölçümler",
      income: "Gelir",
      performance: "Performans",
      "user-data": "Kullanıcı Verileri",
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
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
      case "completed":
        return "✓ Tamamlandı";
      case "failed":
        return "✗ Başarısız";
      case "pending":
        return "⏳ Beklemede";
      default:
        return status;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const isExpired = (expiresAt: Date) => {
    return new Date() > expiresAt;
  };

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">Dışa Aktarma Geçmişi</Text>
          <Text className="text-base text-muted">Önceki dışa aktarmaları görüntüleyin ve indirin</Text>
        </View>

        {/* Export History List */}
        {getHistoryQuery.isLoading ? (
          <View className="items-center justify-center py-8">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : exports.length > 0 ? (
          <>
            <SectionCard>
              <FlatList
                data={exports}
                scrollEnabled={false}
                renderItem={({ item, index }) => (
                  <Pressable
                    key={item.id}
                    onPress={() => setSelectedExport(selectedExport?.id === item.id ? null : item)}
                    className={`${index > 0 ? "border-t border-border pt-3 mt-3" : ""}`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2 mb-1">
                          <Text className="text-base font-semibold text-foreground">{getTypeLabel(item.type)}</Text>
                          <Text className="text-xs font-semibold px-2 py-1 rounded uppercase">{item.format}</Text>
                          <Text
                            className="text-xs font-semibold px-2 py-1 rounded"
                            style={{ color: getStatusColor(item.status), backgroundColor: `${getStatusColor(item.status)}20` }}
                          >
                            {getStatusLabel(item.status)}
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                          <Text className="text-xs text-muted">{item.createdAt.toLocaleDateString("tr-TR")}</Text>
                          {item.fileSize && <Text className="text-xs text-muted">•</Text>}
                          {item.fileSize && <Text className="text-xs text-muted">{formatFileSize(item.fileSize)}</Text>}
                        </View>
                        {isExpired(item.expiresAt) && (
                          <Text className="text-xs text-error mt-1">Süresi doldu</Text>
                        )}
                      </View>
                      <Text className="text-lg text-primary ml-2">{selectedExport?.id === item.id ? "▼" : "▶"}</Text>
                    </View>

                    {/* Expanded Details */}
                    {selectedExport?.id === item.id && (
                      <View className="mt-3 bg-surface rounded p-3 border border-border gap-2">
                        <View>
                          <Text className="text-xs text-muted mb-1">Oluşturma Tarihi:</Text>
                          <Text className="text-sm text-foreground">{item.createdAt.toLocaleString("tr-TR")}</Text>
                        </View>
                        <View>
                          <Text className="text-xs text-muted mb-1">Sona Erme Tarihi:</Text>
                          <Text className="text-sm text-foreground">{item.expiresAt.toLocaleString("tr-TR")}</Text>
                        </View>
                        {item.fileSize && (
                          <View>
                            <Text className="text-xs text-muted mb-1">Dosya Boyutu:</Text>
                            <Text className="text-sm text-foreground">{formatFileSize(item.fileSize)}</Text>
                          </View>
                        )}
                        <View className="flex-row gap-2 mt-2">
                          {!isExpired(item.expiresAt) && item.downloadUrl && (
                            <Pressable
                              onPress={() => handleDownload(item.downloadUrl!)}
                              className="flex-1 bg-primary rounded py-2 items-center"
                            >
                              <Text className="text-white font-semibold text-sm">İndir</Text>
                            </Pressable>
                          )}
                          <Pressable
                            onPress={() => handleDelete(item.id)}
                            className="flex-1 bg-error rounded py-2 items-center"
                          >
                            <Text className="text-white font-semibold text-sm">Sil</Text>
                          </Pressable>
                        </View>
                      </View>
                    )}
                  </Pressable>
                )}
                keyExtractor={(item) => item.id}
              />
            </SectionCard>

            <SecondaryButton label="Geçmişi Yenile" onPress={loadExportHistory} />
          </>
        ) : (
          <SectionCard>
            <Text className="text-center text-muted">Henüz dışa aktarma yok</Text>
          </SectionCard>
        )}

        {/* Statistics */}
        <SectionTitle title="İstatistikler" />
        <SectionCard>
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-base text-muted">Toplam Dışa Aktarma:</Text>
              <Text className="text-2xl font-bold text-foreground">{exports.length}</Text>
            </View>
            <View className="flex-row items-center justify-between border-t border-border pt-3">
              <Text className="text-base text-muted">Tamamlanan:</Text>
              <Text className="text-2xl font-bold text-success">{exports.filter((e) => e.status === "completed").length}</Text>
            </View>
            <View className="flex-row items-center justify-between border-t border-border pt-3">
              <Text className="text-base text-muted">Süresi Dolan:</Text>
              <Text className="text-2xl font-bold text-warning">{exports.filter((e) => isExpired(e.expiresAt)).length}</Text>
            </View>
            <View className="flex-row items-center justify-between border-t border-border pt-3">
              <Text className="text-base text-muted">Toplam Boyut:</Text>
              <Text className="text-2xl font-bold text-foreground">
                {formatFileSize(exports.reduce((sum, e) => sum + (e.fileSize || 0), 0))}
              </Text>
            </View>
          </View>
        </SectionCard>

        {/* Info Box */}
        <View className="bg-blue-50 rounded-lg p-4 mt-6 border border-blue-200">
          <Text className="text-sm text-blue-900 font-semibold mb-2">💡 Bilgi</Text>
          <Text className="text-xs text-blue-800 leading-relaxed">
            Dışa aktarılan dosyalar 7 gün boyunca saklanır. Süresi dolan dosyaları indirmeniz mümkün olmayacaktır. Önemli veriler için lütfen zamanında indirin.
          </Text>
        </View>

        {/* GDPR Info */}
        <View className="bg-green-50 rounded-lg p-4 mt-4 border border-green-200">
          <Text className="text-sm text-green-900 font-semibold mb-2">🔒 GDPR Uyumlu</Text>
          <Text className="text-xs text-green-800 leading-relaxed">
            Tüm dışa aktarmalar GDPR standartlarına uygun olarak şifrelenmiş ve güvenli sunucularda saklanır.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
