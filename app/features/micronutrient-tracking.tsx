import { BackButton } from "@/components/back-button";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import {
  micronutrientTrackingService,
  type Micronutrient,
  type MicronutrientAnalysis,
} from "@/lib/_core/micronutrient-tracking";

export default function MicronutrientTrackingScreen() {
  const router = useRouter();
  const colors = useColors();
  const [micronutrients, setMicronutrients] = useState<Micronutrient[]>([]);
  const [analysis, setAnalysis] = useState<MicronutrientAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "log" | "targets">(
    "overview"
  );
  const [selectedMicro, setSelectedMicro] = useState<Micronutrient | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [logAmount, setLogAmount] = useState("");
  const [logSource, setLogSource] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const userId = "user-1";
  const stats = micronutrientTrackingService.getStatistics();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allMicros = micronutrientTrackingService.getAllMicronutrients();
    setMicronutrients(allMicros);

    const userAnalysis = micronutrientTrackingService.analyzeIntake(userId, "daily");
    setAnalysis(userAnalysis);
  };

  const handleLogMicronutrient = async () => {
    if (!selectedMicro || !logAmount.trim() || !logSource.trim()) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurunuz");
      return;
    }

    setIsLoading(true);
    try {
      micronutrientTrackingService.logMicronutrient(
        userId,
        selectedMicro.type,
        parseFloat(logAmount),
        logSource
      );

      Alert.alert("Başarılı", `${selectedMicro.name} kaydedildi`);
      setLogAmount("");
      setLogSource("");
      setShowLogModal(false);
      loadData();
    } catch (error) {
      Alert.alert("Hata", "Kayıt sırasında bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetTarget = async () => {
    if (!selectedMicro || !targetAmount.trim()) {
      Alert.alert("Hata", "Lütfen hedef miktarı giriniz");
      return;
    }

    setIsLoading(true);
    try {
      micronutrientTrackingService.setDailyTarget(
        userId,
        selectedMicro.type,
        parseFloat(targetAmount),
        "high"
      );

      Alert.alert("Başarılı", `${selectedMicro.name} hedefi belirlendi`);
      setTargetAmount("");
      setShowTargetModal(false);
      loadData();
    } catch (error) {
      Alert.alert("Hata", "Hedef belirlenirken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "deficient":
        return colors.error;
      case "adequate":
        return colors.success;
      case "excess":
        return colors.warning;
      default:
        return colors.muted;
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "deficient":
        return "Eksik";
      case "adequate":
        return "Yeterli";
      case "excess":
        return "Fazla";
      default:
        return "Bilinmiyor";
    }
  };

  return (
    <ScreenContainer className="p-4">
      <BackButton />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-3xl font-bold text-foreground flex-1">💊 Mikro Besinler</Text>
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

          <Text className="text-sm text-muted mb-4">
            Vitamin, mineral ve lif alımınızı takip edin ve hedefler belirleyin.
          </Text>

          {/* Overall Score */}
          {analysis && (
            <View
              style={{
                backgroundColor: colors.primary + "15",
                borderRadius: 10,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.primary + "30",
              }}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 14 }}>
                  Günlük Puan
                </Text>
                <Text
                  style={{
                    color: colors.primary,
                    fontWeight: "700",
                    fontSize: 32,
                  }}
                >
                  {analysis.overallScore}
                </Text>
              </View>

              <View
                style={{
                  height: 8,
                  backgroundColor: colors.surface,
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: "100%",
                    width: `${analysis.overallScore}%`,
                    backgroundColor: colors.primary,
                  }}
                />
              </View>

              <View className="flex-row items-center justify-between gap-2 mt-3">
                <View className="flex-1">
                  <Text style={{ color: colors.muted, fontSize: 11 }}>Eksik</Text>
                  <Text
                    style={{
                      color: colors.error,
                      fontWeight: "700",
                      fontSize: 16,
                    }}
                  >
                    {analysis.deficiencies.length}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text style={{ color: colors.muted, fontSize: 11 }}>Yeterli</Text>
                  <Text
                    style={{
                      color: colors.success,
                      fontWeight: "700",
                      fontSize: 16,
                    }}
                  >
                    {analysis.micronutrients.filter((m) => m.status === "adequate").length}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text style={{ color: colors.muted, fontSize: 11 }}>Fazla</Text>
                  <Text
                    style={{
                      color: colors.warning,
                      fontWeight: "700",
                      fontSize: 16,
                    }}
                  >
                    {analysis.excesses.length}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Tabs */}
          <View className="flex-row gap-2 bg-surface rounded-lg p-1">
            {["overview", "log", "targets"].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() =>
                  setActiveTab(tab as "overview" | "log" | "targets")
                }
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 6,
                  backgroundColor: activeTab === tab ? colors.primary : "transparent",
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: activeTab === tab ? "#ffffff" : colors.foreground,
                    fontWeight: "600",
                    fontSize: 12,
                  }}
                >
                  {tab === "overview"
                    ? "Genel"
                    : tab === "log"
                      ? "Kayıt"
                      : "Hedefler"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Overview Tab */}
          {activeTab === "overview" && analysis && (
            <View className="gap-3">
              {analysis.micronutrients.map((stat) => (
                <TouchableOpacity
                  key={stat.type}
                  onPress={() => {
                    setSelectedMicro(micronutrientTrackingService.getMicronutrient(stat.type));
                    setShowLogModal(true);
                  }}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 10,
                    padding: 12,
                    borderLeftWidth: 4,
                    borderLeftColor: getStatusColor(stat.status),
                  }}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: colors.foreground,
                        flex: 1,
                      }}
                    >
                      {stat.name}
                    </Text>
                    <Text
                      style={{
                        backgroundColor: getStatusColor(stat.status) + "20",
                        color: getStatusColor(stat.status),
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: "600",
                      }}
                    >
                      {getStatusLabel(stat.status)}
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-between mb-2">
                    <Text style={{ color: colors.muted, fontSize: 12 }}>
                      {stat.averageIntake.toFixed(1)} / {stat.target.toFixed(1)}
                    </Text>
                    <Text
                      style={{
                        color: getStatusColor(stat.status),
                        fontWeight: "700",
                        fontSize: 12,
                      }}
                    >
                      {stat.percentage.toFixed(0)}%
                    </Text>
                  </View>

                  <View
                    style={{
                      height: 6,
                      backgroundColor: colors.surface,
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        height: "100%",
                        width: `${Math.min(stat.percentage, 100)}%`,
                        backgroundColor: getStatusColor(stat.status),
                      }}
                    />
                  </View>
                </TouchableOpacity>
              ))}

              {/* Recommendations */}
              <View
                style={{
                  backgroundColor: colors.primary + "10",
                  borderRadius: 10,
                  padding: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.primary,
                }}
              >
                <Text style={{ color: colors.foreground, fontWeight: "600", marginBottom: 8 }}>
                  💡 Öneriler
                </Text>
                {analysis.recommendations.map((rec, index) => (
                  <Text
                    key={index}
                    style={{
                      color: colors.muted,
                      fontSize: 12,
                      marginBottom: 6,
                      lineHeight: 18,
                    }}
                  >
                    • {rec}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* Log Tab */}
          {activeTab === "log" && (
            <View className="gap-3">
              <TouchableOpacity
                onPress={() => setShowLogModal(true)}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                  paddingVertical: 12,
                }}
              >
                <Text style={{ color: "#ffffff", fontWeight: "600", textAlign: "center" }}>
                  + Mikro Besin Kaydet
                </Text>
              </TouchableOpacity>

              <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 14 }}>
                Kategoriler
              </Text>

              {["vitamin", "mineral", "other"].map((category) => {
                const categoryMicros = micronutrients.filter((m) => m.category === category);
                return (
                  <View key={category}>
                    <Text
                      style={{
                        color: colors.muted,
                        fontSize: 12,
                        marginBottom: 6,
                        textTransform: "capitalize",
                      }}
                    >
                      {category === "vitamin"
                        ? "Vitaminler"
                        : category === "mineral"
                          ? "Mineraller"
                          : "Diğer"}
                    </Text>
                    {categoryMicros.map((micro) => (
                      <TouchableOpacity
                        key={micro.type}
                        onPress={() => {
                          setSelectedMicro(micro);
                          setShowLogModal(true);
                        }}
                        style={{
                          backgroundColor: colors.surface,
                          borderRadius: 8,
                          padding: 10,
                          marginBottom: 6,
                          borderLeftWidth: 3,
                          borderLeftColor: colors.primary,
                        }}
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center gap-2 flex-1">
                            <Text style={{ fontSize: 18 }}>{micro.icon}</Text>
                            <Text
                              style={{
                                color: colors.foreground,
                                fontWeight: "600",
                                fontSize: 12,
                              }}
                            >
                              {micro.name}
                            </Text>
                          </View>
                          <Text style={{ color: colors.muted, fontSize: 11 }}>
                            {micro.unit}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                );
              })}
            </View>
          )}

          {/* Targets Tab */}
          {activeTab === "targets" && (
            <View className="gap-3">
              <TouchableOpacity
                onPress={() => setShowTargetModal(true)}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                  paddingVertical: 12,
                }}
              >
                <Text style={{ color: "#ffffff", fontWeight: "600", textAlign: "center" }}>
                  + Hedef Belirle
                </Text>
              </TouchableOpacity>

              <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 14 }}>
                Önerilen Günlük Hedefler
              </Text>

              {micronutrients.map((micro) => (
                <View
                  key={micro.type}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 8,
                    padding: 10,
                    marginBottom: 6,
                  }}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center gap-2 flex-1">
                      <Text style={{ fontSize: 18 }}>{micro.icon}</Text>
                      <View className="flex-1">
                        <Text
                          style={{
                            color: colors.foreground,
                            fontWeight: "600",
                            fontSize: 12,
                          }}
                        >
                          {micro.name}
                        </Text>
                        <Text style={{ color: colors.muted, fontSize: 10, marginTop: 2 }}>
                          {micro.benefits[0]}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between">
                    <Text style={{ color: colors.muted, fontSize: 11 }}>
                      Hedef: {micro.dailyRecommendation} {micro.unit}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedMicro(micro);
                        setTargetAmount(micro.dailyRecommendation.toString());
                        setShowTargetModal(true);
                      }}
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 4,
                        backgroundColor: colors.primary + "20",
                      }}
                    >
                      <Text
                        style={{
                          color: colors.primary,
                          fontWeight: "600",
                          fontSize: 10,
                        }}
                      >
                        Düzenle
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Log Modal */}
      <Modal visible={showLogModal} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              paddingBottom: 40,
            }}
          >
            {selectedMicro && (
              <View className="gap-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: colors.foreground,
                    }}
                  >
                    {selectedMicro.icon} {selectedMicro.name} Kaydet
                  </Text>
                  <TouchableOpacity onPress={() => setShowLogModal(false)}>
                    <Text style={{ fontSize: 20, color: colors.muted }}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>
                  {selectedMicro.benefits[0]}
                </Text>

                <TextInput
                  placeholder={`Miktar (${selectedMicro.unit})`}
                  value={logAmount}
                  onChangeText={setLogAmount}
                  keyboardType="decimal-pad"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    color: colors.foreground,
                    marginBottom: 12,
                  }}
                  placeholderTextColor={colors.muted}
                />

                <TextInput
                  placeholder="Kaynak (gıda adı)"
                  value={logSource}
                  onChangeText={setLogSource}
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    color: colors.foreground,
                    marginBottom: 16,
                  }}
                  placeholderTextColor={colors.muted}
                />

                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => setShowLogModal(false)}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 8,
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={{ color: colors.foreground, fontWeight: "600", textAlign: "center" }}>
                      İptal
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleLogMicronutrient}
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 8,
                      backgroundColor: colors.primary,
                      opacity: isLoading ? 0.6 : 1,
                    }}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <Text style={{ color: "#ffffff", fontWeight: "600", textAlign: "center" }}>
                        Kaydet
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Target Modal */}
      <Modal visible={showTargetModal} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              paddingBottom: 40,
            }}
          >
            {selectedMicro && (
              <View className="gap-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: colors.foreground,
                    }}
                  >
                    {selectedMicro.icon} Hedef Belirle
                  </Text>
                  <TouchableOpacity onPress={() => setShowTargetModal(false)}>
                    <Text style={{ fontSize: 20, color: colors.muted }}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>
                  {selectedMicro.name} için günlük hedef miktarını belirleyin
                </Text>

                <TextInput
                  placeholder={`Hedef (${selectedMicro.unit})`}
                  value={targetAmount}
                  onChangeText={setTargetAmount}
                  keyboardType="decimal-pad"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    color: colors.foreground,
                    marginBottom: 16,
                  }}
                  placeholderTextColor={colors.muted}
                />

                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => setShowTargetModal(false)}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 8,
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={{ color: colors.foreground, fontWeight: "600", textAlign: "center" }}>
                      İptal
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSetTarget}
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 8,
                      backgroundColor: colors.primary,
                      opacity: isLoading ? 0.6 : 1,
                    }}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <Text style={{ color: "#ffffff", fontWeight: "600", textAlign: "center" }}>
                        Belirle
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
