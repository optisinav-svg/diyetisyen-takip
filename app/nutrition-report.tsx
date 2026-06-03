import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { NavigationHeader } from "@/components/navigation-header";
import { useColors } from "@/hooks/use-colors";
import { nutritionReportPdfService } from "@/lib/_core/nutrition-report-pdf";

export default function NutritionReportScreen() {
  const colors = useColors();
  const [reportType, setReportType] = useState<"weekly" | "monthly">("weekly");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      let report;
      if (reportType === "weekly") {
        report = await nutritionReportPdfService.generateWeeklyReport(
          "client-1",
          "Ayşe Yılmaz",
          "diet-1",
          "Dr. Mehmet Kaya",
          {
            weight: {
              initial: 75,
              current: 74.5,
              target: 70,
              change: -0.5,
              percentageChange: -0.67,
            },
            calories: {
              avgDaily: 1850,
              target: 1750,
              totalConsumed: 12950,
              adherencePercentage: 94,
            },
          }
        );
      } else {
        report = await nutritionReportPdfService.generateMonthlyReport(
          "client-1",
          "Ayşe Yılmaz",
          "diet-1",
          "Dr. Mehmet Kaya",
          {
            weight: {
              initial: 78,
              current: 74.5,
              target: 70,
              change: -3.5,
              percentageChange: -4.49,
            },
            calories: {
              avgDaily: 1800,
              target: 1750,
              totalConsumed: 54000,
              adherencePercentage: 96,
            },
          }
        );
      }
      setGeneratedReport(report);
      Alert.alert("Başarılı", "Rapor oluşturuldu");
    } catch (error) {
      Alert.alert("Hata", "Rapor oluşturulamadı");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!generatedReport) return;
    try {
      Alert.alert("Başarılı", `Rapor indirildi: ${generatedReport.filename}`);
    } catch (error) {
      Alert.alert("Hata", "Rapor indirilemedi");
    }
  };

  const handleShareReport = async (platform: string) => {
    if (!generatedReport) return;
    try {
      await nutritionReportPdfService.shareReportOnSocial(
        platform as any,
        generatedReport,
        "Ayşe Yılmaz",
        "Beslenme raporumu paylaşıyorum!"
      );
      Alert.alert("Başarılı", `Rapor ${platform} üzerinde paylaşıldı`);
    } catch (error) {
      Alert.alert("Hata", "Paylaşım başarısız");
    }
  };

  const handleEmailReport = async () => {
    if (!generatedReport) return;
    try {
      await nutritionReportPdfService.sendReportByEmail(
        "example@example.com",
        generatedReport,
        "Ayşe Yılmaz"
      );
      Alert.alert("Başarılı", "Rapor email ile gönderildi");
    } catch (error) {
      Alert.alert("Hata", "Email gönderilemedi");
    }
  };

  return (
    <ScreenContainer>
      <NavigationHeader title="Beslenme Raporu" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Rapor Türü Seçimi */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
            Rapor Türü
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            {["weekly", "monthly"].map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setReportType(type as "weekly" | "monthly")}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  backgroundColor:
                    reportType === type ? colors.primary : colors.surface,
                  borderWidth: 2,
                  borderColor:
                    reportType === type ? colors.primary : colors.border,
                }}
              >
                <Text
                  style={{
                    color: reportType === type ? "#fff" : colors.foreground,
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                >
                  {type === "weekly" ? "Haftalık" : "Aylık"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rapor Oluştur Butonu */}
        <TouchableOpacity
          onPress={handleGenerateReport}
          disabled={isGenerating}
          style={{
            backgroundColor: colors.primary,
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: "center",
            marginBottom: 24,
            opacity: isGenerating ? 0.6 : 1,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
            {isGenerating ? "Oluşturuluyor..." : "Rapor Oluştur"}
          </Text>
        </TouchableOpacity>

        {/* Oluşturulan Rapor */}
        {generatedReport && (
          <>
            {/* Rapor Bilgileri */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                marginBottom: 24,
              }}
            >
              <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
                Rapor Bilgileri
              </Text>
              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: colors.muted }}>Dosya Adı:</Text>
                  <Text style={{ color: colors.foreground, fontWeight: "500" }}>
                    {generatedReport.filename}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: colors.muted }}>Dosya Boyutu:</Text>
                  <Text style={{ color: colors.foreground, fontWeight: "500" }}>
                    {(generatedReport.size / 1024).toFixed(2)} KB
                  </Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: colors.muted }}>Türü:</Text>
                  <Text style={{ color: colors.foreground, fontWeight: "500" }}>
                    {generatedReport.mimeType}
                  </Text>
                </View>
              </View>
            </View>

            {/* İndirme Butonu */}
            <TouchableOpacity
              onPress={handleDownloadReport}
              style={{
                backgroundColor: colors.success,
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
                📥 Raporu İndir
              </Text>
            </TouchableOpacity>

            {/* Email Gönder */}
            <TouchableOpacity
              onPress={handleEmailReport}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
                📧 Email ile Gönder
              </Text>
            </TouchableOpacity>

            {/* Sosyal Paylaşım */}
            <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600", marginBottom: 12 }}>
              Sosyal Ağlarda Paylaş
            </Text>
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
              {[
                { name: "facebook", emoji: "f", label: "Facebook" },
                { name: "instagram", emoji: "📷", label: "Instagram" },
                { name: "twitter", emoji: "𝕏", label: "Twitter" },
                { name: "whatsapp", emoji: "💬", label: "WhatsApp" },
              ].map((social) => (
                <TouchableOpacity
                  key={social.name}
                  onPress={() => handleShareReport(social.name)}
                  style={{
                    flex: 1,
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ fontSize: 20, marginBottom: 4 }}>{social.emoji}</Text>
                  <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "500" }}>
                    {social.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Rapor Önizlemesi */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                marginBottom: 24,
              }}
            >
              <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600", marginBottom: 12 }}>
                Rapor Önizlemesi
              </Text>
              <View
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 8,
                  padding: 12,
                  minHeight: 300,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>
                  📄 Beslenme Analiz Raporu{"\n"}
                  {"\n"}
                  Danışan: Ayşe Yılmaz{"\n"}
                  Diyetisyen: Dr. Mehmet Kaya{"\n"}
                  {"\n"}
                  ✓ Kilo Takibi: -3.5 kg{"\n"}
                  ✓ Kalori Uyumu: 96%{"\n"}
                  ✓ Aktivite: 8800 adım/gün{"\n"}
                  {"\n"}
                  Öneriler:{"\n"}
                  • Kilo kaybı hedefine yaklaşıyorsunuz{"\n"}
                  • Adım hedefini 10000'e çıkarın{"\n"}
                  • Vitamin D takviyesi almayı düşünün{"\n"}
                  {"\n"}
                  Harika ilerleme! Beslenme planına mükemmel uyum.
                </Text>
              </View>
            </View>

            {/* Yeni Rapor Oluştur */}
            <TouchableOpacity
              onPress={() => setGeneratedReport(null)}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.primary, fontWeight: "600", fontSize: 16 }}>
                Yeni Rapor Oluştur
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Rapor Oluşturulmadıysa Bilgi */}
        {!generatedReport && (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 24,
              alignItems: "center",
            }}
          >
            <Text style={{ color: colors.muted, fontSize: 14, textAlign: "center" }}>
              Beslenme raporunuzu oluşturmak için yukarıdaki "Rapor Oluştur" butonuna tıklayın.
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
