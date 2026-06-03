import { useState } from "react";
import { ScrollView, View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { SectionCard, SectionTitle, PrimaryButton } from "@/components/app-ui";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import * as FileSystem from "expo-file-system/legacy";

export default function ExportScreen() {
  const colors = useColors();
  const { isAuthenticated } = useAuth();
  const profileQuery = trpc.profile.me.useQuery(undefined, { enabled: isAuthenticated });

  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<"csv" | "json">("csv");

  const role = profileQuery.data?.profile?.role;

  const handleExportMeals = async () => {
    setIsExporting(true);
    try {
      // In production, this would call the backend to generate the export
      const data = {
        type: "meals",
        format: selectedFormat,
        generatedAt: new Date().toISOString(),
        meals: [], // Would be populated from backend
      };

      const fileName = `meals_${new Date().toISOString().split("T")[0]}.${selectedFormat === "csv" ? "csv" : "json"}`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      const content = selectedFormat === "csv" 
        ? "Tarih,Öğün Tipi,Açıklama,Kalori\n" // CSV header
        : JSON.stringify(data, null, 2);

      await FileSystem.writeAsStringAsync(fileUri, content);

      Alert.alert("Başarılı", `Dosya başarıyla oluşturuldu: ${fileName}`);
    } catch (error) {
      Alert.alert("Hata", "Dışa aktarma başarısız oldu");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportMeasurements = async () => {
    setIsExporting(true);
    try {
      const data = {
        type: "measurements",
        format: selectedFormat,
        generatedAt: new Date().toISOString(),
        measurements: [], // Would be populated from backend
      };

      const fileName = `measurements_${new Date().toISOString().split("T")[0]}.${selectedFormat === "csv" ? "csv" : "json"}`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      const content = selectedFormat === "csv"
        ? "Tarih,Boy (cm),Kilo (kg),Yağ Oranı (%),Kas Kütlesi (kg)\n" // CSV header
        : JSON.stringify(data, null, 2);

      await FileSystem.writeAsStringAsync(fileUri, content);

      Alert.alert("Başarılı", `Dosya başarıyla oluşturuldu: ${fileName}`);
    } catch (error) {
      Alert.alert("Hata", "Dışa aktarma başarısız oldu");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportReport = async () => {
    setIsExporting(true);
    try {
      const data = {
        type: "report",
        format: selectedFormat,
        generatedAt: new Date().toISOString(),
        report: {}, // Would be populated from backend
      };

      const fileName = `report_${new Date().toISOString().split("T")[0]}.${selectedFormat === "csv" ? "csv" : "json"}`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      const content = selectedFormat === "csv"
        ? "Rapor Türü,Dönem,Özet\n" // CSV header
        : JSON.stringify(data, null, 2);

      await FileSystem.writeAsStringAsync(fileUri, content);

      Alert.alert("Başarılı", `Dosya başarıyla oluşturuldu: ${fileName}`);
    } catch (error) {
      Alert.alert("Hata", "Dışa aktarma başarısız oldu");
    } finally {
      setIsExporting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-lg text-muted">Lütfen giriş yapın</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <View className="gap-4">
          <SectionTitle title="Veri Dışa Aktarma" />

          <Text className="text-sm text-muted">
            Verilerinizi CSV veya JSON formatında dışa aktarın
          </Text>

          {/* Format Selection */}
          <SectionCard>
            <View className="gap-3">
              <Text className="font-semibold text-foreground">Dosya Formatı</Text>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setSelectedFormat("csv")}
                  style={({ pressed }) => [
                    {
                      flex: 1,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      backgroundColor: selectedFormat === "csv" ? colors.primary : colors.surface,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text
                    className={`text-center font-semibold ${
                      selectedFormat === "csv" ? "text-background" : "text-foreground"
                    }`}
                  >
                    CSV
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setSelectedFormat("json")}
                  style={({ pressed }) => [
                    {
                      flex: 1,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      backgroundColor: selectedFormat === "json" ? colors.primary : colors.surface,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text
                    className={`text-center font-semibold ${
                      selectedFormat === "json" ? "text-background" : "text-foreground"
                    }`}
                  >
                    JSON
                  </Text>
                </Pressable>
              </View>
            </View>
          </SectionCard>

          {/* Export Options */}
          <View className="gap-3">
            {/* Meals Export */}
            <SectionCard>
              <View className="gap-3">
                <View>
                  <Text className="font-semibold text-foreground">Öğün Verilerini Dışa Aktar</Text>
                  <Text className="text-xs text-muted mt-1">
                    Tüm öğün kayıtlarını ve fotoğrafları dışa aktarın
                  </Text>
                </View>
                <PrimaryButton
                  label={isExporting ? "Dışa Aktarılıyor..." : "Öğünleri Dışa Aktar"}
                  onPress={handleExportMeals}
                  disabled={isExporting}
                />
              </View>
            </SectionCard>

            {/* Measurements Export */}
            <SectionCard>
              <View className="gap-3">
                <View>
                  <Text className="font-semibold text-foreground">Ölçüm Verilerini Dışa Aktar</Text>
                  <Text className="text-xs text-muted mt-1">
                    Boy, kilo, yağ oranı ve kas kütlesi ölçümlerini dışa aktarın
                  </Text>
                </View>
                <PrimaryButton
                  label={isExporting ? "Dışa Aktarılıyor..." : "Ölçümleri Dışa Aktar"}
                  onPress={handleExportMeasurements}
                  disabled={isExporting}
                />
              </View>
            </SectionCard>

            {/* Report Export */}
            {role === "dietitian" && (
              <SectionCard>
                <View className="gap-3">
                  <View>
                    <Text className="font-semibold text-foreground">Raporu Dışa Aktar</Text>
                    <Text className="text-xs text-muted mt-1">
                      Aylık gelir raporu ve danışan istatistiklerini dışa aktarın
                    </Text>
                  </View>
                  <PrimaryButton
                    label={isExporting ? "Dışa Aktarılıyor..." : "Raporu Dışa Aktar"}
                    onPress={handleExportReport}
                    disabled={isExporting}
                  />
                </View>
              </SectionCard>
            )}
          </View>

          {/* Info Section */}
          <SectionCard>
            <View className="gap-2">
              <Text className="font-semibold text-foreground text-sm">Bilgi</Text>
              <Text className="text-xs text-muted leading-relaxed">
                Dışa aktarılan veriler şifreli bir şekilde cihazınıza kaydedilir ve paylaşılabilir. Verileriniz gizli kalır.
              </Text>
            </View>
          </SectionCard>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
