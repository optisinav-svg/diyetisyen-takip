import { BackButton } from "@/components/back-button";
import { ScrollView, Text, View, TouchableOpacity, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useEffect, useState } from "react";
import { getUserRegistration } from "@/lib/_core/user-registration";
import {
  getDietitianReports,
  getClientReports,
  generateReportPDF,
  sendReportToClient,
  type WeeklyReport,
} from "@/lib/_core/weekly-reports";

export default function WeeklyReportsScreen() {
  const router = useRouter();
  const colors = useColors();

  const [user, setUser] = useState<any>(null);
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await getUserRegistration();
      setUser(userData);

      if (userData?.role === "dietitian") {
        const reps = await getDietitianReports(userData.email);
        setReports(reps);
      } else if (userData) {
        const reps = await getClientReports(userData.email);
        setReports(reps);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const handleViewReport = (report: WeeklyReport) => {
    setSelectedReport(report);
  };

  const handleDownloadPDF = async (report: WeeklyReport) => {
    try {
      const pdfContent = await generateReportPDF(report);
      Alert.alert("Başarılı", "Rapor PDF olarak indirildi");
    } catch (error) {
      Alert.alert("Hata", "Rapor indirilemedi");
    }
  };

  const handleSendReport = async (report: WeeklyReport) => {
    try {
      await sendReportToClient(report, "client@example.com");
      Alert.alert("Başarılı", "Rapor danışana gönderildi");
      loadData();
    } catch (error) {
      Alert.alert("Hata", "Rapor gönderilemedi");
    }
  };

  if (!user) {
    return (
      <ScreenContainer className="p-6">
      <BackButton />
        <View className="flex-1 items-center justify-center">
          <Text style={{ color: colors.foreground }}>Yükleniyor...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (selectedReport) {
    return (
      <ScreenContainer className="p-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="gap-4">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-2xl font-bold text-foreground">📊 Rapor Detayı</Text>
              <TouchableOpacity
                onPress={() => setSelectedReport(null)}
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

            {/* Report Info */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.foreground }}>
                {selectedReport.clientName}
              </Text>
              <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
                Hafta: {new Date(selectedReport.weekStartDate).toLocaleDateString("tr-TR")} -{" "}
                {new Date(selectedReport.weekEndDate).toLocaleDateString("tr-TR")}
              </Text>
            </View>

            {/* Summary */}
            <View className="gap-2">
              <Text style={{ fontSize: 14, fontWeight: "bold", color: colors.foreground }}>
                📈 Özet
              </Text>
              <View className="grid grid-cols-2 gap-2">
                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 8,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ fontSize: 10, color: colors.muted }}>Toplam Öğün</Text>
                  <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.primary }}>
                    {selectedReport.summary.totalMeals}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 8,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ fontSize: 10, color: colors.muted }}>Uyum Oranı</Text>
                  <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.primary }}>
                    {selectedReport.summary.averageAdherence}%
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 8,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ fontSize: 10, color: colors.muted }}>Ortalama Adımlar</Text>
                  <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.primary }}>
                    {selectedReport.summary.averageSteps}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 8,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ fontSize: 10, color: colors.muted }}>Ortalama Uyku</Text>
                  <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.primary }}>
                    {selectedReport.summary.averageSleep}h
                  </Text>
                </View>
              </View>
            </View>

            {/* Highlights */}
            <View className="gap-2">
              <Text style={{ fontSize: 14, fontWeight: "bold", color: colors.foreground }}>
                ⭐ Başarılar
              </Text>
              {selectedReport.highlights.map((highlight, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 8,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderLeftWidth: 4,
                    borderLeftColor: "#10B981",
                  }}
                >
                  <Text style={{ fontSize: 12, color: colors.foreground }}>✓ {highlight}</Text>
                </View>
              ))}
            </View>

            {/* Recommendations */}
            <View className="gap-2">
              <Text style={{ fontSize: 14, fontWeight: "bold", color: colors.foreground }}>
                💡 Öneriler
              </Text>
              {selectedReport.recommendations.map((rec, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 8,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderLeftWidth: 4,
                    borderLeftColor: colors.primary,
                  }}
                >
                  <Text style={{ fontSize: 12, color: colors.foreground }}>• {rec}</Text>
                </View>
              ))}
            </View>

            {/* Actions */}
            {user.role === "dietitian" && (
              <View className="gap-2">
                <TouchableOpacity
                  onPress={() => handleDownloadPDF(selectedReport)}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    backgroundColor: colors.primary,
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "600", textAlign: "center" }}>
                    📥 PDF İndir
                  </Text>
                </TouchableOpacity>
                {!selectedReport.sentAt && (
                  <TouchableOpacity
                    onPress={() => handleSendReport(selectedReport)}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      backgroundColor: "#10B981",
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "600", textAlign: "center" }}>
                      📧 Danışana Gönder
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-3xl font-bold text-foreground">📊 Haftalık Raporlar</Text>
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

          {/* Reports List */}
          {reports.length > 0 ? (
            <View className="gap-3">
              {reports.map((report) => (
                <TouchableOpacity
                  key={report.id}
                  onPress={() => handleViewReport(report)}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: "bold", color: colors.foreground }}>
                        {report.clientName}
                      </Text>
                      <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                        {new Date(report.weekStartDate).toLocaleDateString("tr-TR")} -{" "}
                        {new Date(report.weekEndDate).toLocaleDateString("tr-TR")}
                      </Text>
                    </View>
                    <View
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        borderRadius: 6,
                        backgroundColor: colors.primary,
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: "bold", color: "#fff" }}>
                        {report.summary.averageAdherence}%
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row gap-2">
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 9, color: colors.muted }}>Öğün</Text>
                      <Text style={{ fontSize: 12, fontWeight: "bold", color: colors.foreground }}>
                        {report.summary.totalMeals}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 9, color: colors.muted }}>Adımlar</Text>
                      <Text style={{ fontSize: 12, fontWeight: "bold", color: colors.foreground }}>
                        {report.summary.averageSteps}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 9, color: colors.muted }}>Uyku</Text>
                      <Text style={{ fontSize: 12, fontWeight: "bold", color: colors.foreground }}>
                        {report.summary.averageSleep}h
                      </Text>
                    </View>
                  </View>

                  {report.sentAt && (
                    <Text style={{ fontSize: 9, color: "#10B981", marginTop: 8 }}>
                      ✓ Gönderildi: {new Date(report.sentAt).toLocaleDateString("tr-TR")}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={{ textAlign: "center", color: colors.muted, marginVertical: 20 }}>
              Henüz rapor yok
            </Text>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
