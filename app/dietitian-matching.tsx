import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import {
  matchingAlgorithmService,
  type ClientProfile,
  type MatchingScore,
  type DietType,
} from "@/lib/_core/matching-algorithm";

export default function DietitianMatchingScreen() {
  const router = useRouter();
  const colors = useColors();
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [matches, setMatches] = useState<MatchingScore[]>([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [goals, setGoals] = useState("");
  const [selectedDietTypes, setSelectedDietTypes] = useState<DietType[]>([]);
  const [allergies, setAllergies] = useState("");
  const [budget, setBudget] = useState<"low" | "medium" | "high">("medium");

  const dietTypes: DietType[] = [
    "keto",
    "mediterranean",
    "vegetarian",
    "vegan",
    "glutenfree",
    "highprotein",
  ];

  useEffect(() => {
    loadClientProfile();
  }, []);

  const loadClientProfile = () => {
    const profile = matchingAlgorithmService.getClientProfile("client-1");
    if (profile) {
      setClientProfile(profile);
      loadMatches(profile.id);
    }
  };

  const loadMatches = (clientId: string) => {
    try {
      const result = matchingAlgorithmService.findMatches(clientId, 5);
      setMatches(result.topMatches);
    } catch (error) {
      console.error("Matching error:", error);
    }
  };

  const handleCreateProfile = async () => {
    if (!name.trim() || !age.trim() || !goals.trim()) {
      Alert.alert("Hata", "Lütfen tüm zorunlu alanları doldurunuz");
      return;
    }

    setIsLoading(true);
    try {
      const profile: ClientProfile = {
        id: "client-1",
        name,
        age: parseInt(age),
        gender: "other",
        goals: goals.split(",").map((g) => g.trim()),
        preferredDietTypes: selectedDietTypes,
        allergies: allergies.split(",").map((a) => a.trim()),
        restrictions: [],
        healthConditions: [],
        preferredLanguage: "Turkish",
        budget,
        communicationPreference: "mixed",
        timezone: "Europe/Istanbul",
        createdAt: Date.now(),
      };

      matchingAlgorithmService.addClientProfile(profile);
      setClientProfile(profile);
      setShowProfileModal(false);
      loadMatches(profile.id);

      Alert.alert("Başarılı", "Profiliniz oluşturuldu ve eşleşmeler bulundu!");
    } catch (error) {
      Alert.alert("Hata", "Profil oluşturulurken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDietType = (type: DietType) => {
    setSelectedDietTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const getCompatibilityColor = (compatibility: string): string => {
    switch (compatibility) {
      case "excellent":
        return colors.success;
      case "good":
        return colors.primary;
      case "fair":
        return colors.warning;
      case "poor":
        return colors.error;
      default:
        return colors.muted;
    }
  };

  const getCompatibilityLabel = (compatibility: string): string => {
    switch (compatibility) {
      case "excellent":
        return "Mükemmel";
      case "good":
        return "İyi";
      case "fair":
        return "Orta";
      case "poor":
        return "Düşük";
      default:
        return "Bilinmiyor";
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-3xl font-bold text-foreground flex-1">
              👥 Diyetisyen Eşleştirme
            </Text>
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
            Hedeflerinize ve tercihlerinize uygun diyetisyenleri bulun.
          </Text>

          {/* Client Profile Section */}
          {clientProfile ? (
            <View
              style={{
                backgroundColor: colors.primary + "15",
                borderRadius: 10,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.primary + "30",
              }}
            >
              <View className="flex-row items-center justify-between mb-3">
                <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 14 }}>
                  📋 Profiliniz
                </Text>
                <TouchableOpacity
                  onPress={() => setShowProfileModal(true)}
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

              <Text style={{ color: colors.foreground, fontWeight: "600", marginBottom: 8 }}>
                {clientProfile.name}, {clientProfile.age} yaşında
              </Text>

              <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 6 }}>
                <Text style={{ fontWeight: "600" }}>Hedefler:</Text> {clientProfile.goals.join(", ")}
              </Text>

              {clientProfile.preferredDietTypes.length > 0 && (
                <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 6 }}>
                  <Text style={{ fontWeight: "600" }}>Diyet Türleri:</Text>{" "}
                  {clientProfile.preferredDietTypes.join(", ")}
                </Text>
              )}

              {clientProfile.allergies.length > 0 && (
                <Text style={{ color: colors.muted, fontSize: 12 }}>
                  <Text style={{ fontWeight: "600" }}>Alerjiler:</Text>{" "}
                  {clientProfile.allergies.join(", ")}
                </Text>
              )}
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setShowProfileModal(true)}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 8,
                paddingVertical: 12,
              }}
            >
              <Text style={{ color: "#ffffff", fontWeight: "600", textAlign: "center" }}>
                + Profilinizi Oluşturun
              </Text>
            </TouchableOpacity>
          )}

          {/* Matches Section */}
          {matches.length > 0 && (
            <View>
              <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 14, marginBottom: 12 }}>
                🎯 Sizin İçin Önerilen Diyetisyenler
              </Text>

              {matches.map((match, index) => {
                const dietitian = matchingAlgorithmService.getDietitianDetails(match.dietitianId);
                if (!dietitian) return null;

                return (
                  <TouchableOpacity
                    key={match.dietitianId}
                    onPress={() => {
                      Alert.alert(
                        dietitian.name,
                        `Uzmanlık: ${dietitian.specialties.join(", ")}\nDeneyim: ${dietitian.yearsOfExperience} yıl\nRating: ${dietitian.rating}/5\nSaat Ücreti: $${dietitian.hourlyRate}`,
                        [
                          { text: "İptal", style: "cancel" },
                          {
                            text: "İletişime Geç",
                            onPress: () =>
                              Alert.alert("Başarılı", `${dietitian.name} ile iletişime geçildi`),
                          },
                        ]
                      );
                    }}
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 10,
                      padding: 12,
                      marginBottom: 10,
                      borderLeftWidth: 4,
                      borderLeftColor: getCompatibilityColor(match.compatibility),
                    }}
                  >
                    {/* Rank Badge */}
                    <View
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        backgroundColor: colors.primary,
                        borderRadius: 12,
                        width: 24,
                        height: 24,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 12 }}>
                        {index + 1}
                      </Text>
                    </View>

                    {/* Name and Rating */}
                    <View className="mb-2">
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: colors.foreground,
                          marginBottom: 4,
                        }}
                      >
                        {dietitian.name}
                      </Text>
                      <View className="flex-row items-center gap-2">
                        <Text style={{ color: colors.warning, fontSize: 12 }}>
                          ⭐ {dietitian.rating}/5
                        </Text>
                        <Text style={{ color: colors.muted, fontSize: 11 }}>
                          ({dietitian.clientsServed} müşteri)
                        </Text>
                      </View>
                    </View>

                    {/* Specialties */}
                    <Text style={{ color: colors.muted, fontSize: 11, marginBottom: 8 }}>
                      <Text style={{ fontWeight: "600" }}>Uzmanlık:</Text> {dietitian.specialties.slice(0, 2).join(", ")}
                    </Text>

                    {/* Compatibility Score */}
                    <View className="flex-row items-center justify-between mb-2">
                      <Text style={{ color: colors.muted, fontSize: 11 }}>Uyum Puanı</Text>
                      <View className="flex-row items-center gap-2">
                        <Text
                          style={{
                            color: getCompatibilityColor(match.compatibility),
                            fontWeight: "700",
                            fontSize: 12,
                          }}
                        >
                          {match.score}%
                        </Text>
                        <Text
                          style={{
                            backgroundColor: getCompatibilityColor(match.compatibility) + "20",
                            color: getCompatibilityColor(match.compatibility),
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            borderRadius: 3,
                            fontSize: 10,
                            fontWeight: "600",
                          }}
                        >
                          {getCompatibilityLabel(match.compatibility)}
                        </Text>
                      </View>
                    </View>

                    {/* Score Bar */}
                    <View
                      style={{
                        height: 6,
                        backgroundColor: colors.surface,
                        borderRadius: 3,
                        overflow: "hidden",
                        marginBottom: 8,
                      }}
                    >
                      <View
                        style={{
                          height: "100%",
                          width: `${match.score}%`,
                          backgroundColor: getCompatibilityColor(match.compatibility),
                        }}
                      />
                    </View>

                    {/* Info */}
                    <View className="flex-row items-center justify-between">
                      <Text style={{ color: colors.muted, fontSize: 10 }}>
                        💰 ${dietitian.hourlyRate}/saat
                      </Text>
                      <Text style={{ color: colors.muted, fontSize: 10 }}>
                        📍 {dietitian.yearsOfExperience} yıl deneyim
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {matches.length === 0 && clientProfile && (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 10,
                padding: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.muted, textAlign: "center" }}>
                Henüz eşleşme bulunmadı. Profilinizi güncelleyerek tekrar deneyin.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Profile Modal */}
      <Modal visible={showProfileModal} animationType="slide" transparent>
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
              maxHeight: "90%",
            }}
          >
            <ScrollView>
              <View className="gap-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: colors.foreground,
                    }}
                  >
                    Profilinizi Oluşturun
                  </Text>
                  <TouchableOpacity onPress={() => setShowProfileModal(false)}>
                    <Text style={{ fontSize: 20, color: colors.muted }}>✕</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  placeholder="Adınız"
                  value={name}
                  onChangeText={setName}
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    color: colors.foreground,
                  }}
                  placeholderTextColor={colors.muted}
                />

                <TextInput
                  placeholder="Yaşınız"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="number-pad"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    color: colors.foreground,
                  }}
                  placeholderTextColor={colors.muted}
                />

                <TextInput
                  placeholder="Hedefleriniz (virgülle ayrılmış)"
                  value={goals}
                  onChangeText={setGoals}
                  multiline
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    color: colors.foreground,
                    minHeight: 60,
                  }}
                  placeholderTextColor={colors.muted}
                />

                <View>
                  <Text style={{ color: colors.foreground, fontWeight: "600", marginBottom: 8 }}>
                    Tercih Ettiğiniz Diyet Türleri
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {dietTypes.map((type) => (
                      <TouchableOpacity
                        key={type}
                        onPress={() => toggleDietType(type)}
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 6,
                          backgroundColor: selectedDietTypes.includes(type)
                            ? colors.primary
                            : colors.surface,
                          borderWidth: 1,
                          borderColor: selectedDietTypes.includes(type)
                            ? colors.primary
                            : colors.border,
                        }}
                      >
                        <Text
                          style={{
                            color: selectedDietTypes.includes(type)
                              ? "#ffffff"
                              : colors.foreground,
                            fontWeight: "600",
                            fontSize: 11,
                            textTransform: "capitalize",
                          }}
                        >
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TextInput
                  placeholder="Alerjiler (virgülle ayrılmış)"
                  value={allergies}
                  onChangeText={setAllergies}
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    color: colors.foreground,
                  }}
                  placeholderTextColor={colors.muted}
                />

                <View>
                  <Text style={{ color: colors.foreground, fontWeight: "600", marginBottom: 8 }}>
                    Bütçe
                  </Text>
                  <View className="flex-row gap-2">
                    {(["low", "medium", "high"] as const).map((b) => (
                      <TouchableOpacity
                        key={b}
                        onPress={() => setBudget(b)}
                        style={{
                          flex: 1,
                          paddingVertical: 10,
                          borderRadius: 6,
                          backgroundColor: budget === b ? colors.primary : colors.surface,
                          borderWidth: 1,
                          borderColor: budget === b ? colors.primary : colors.border,
                        }}
                      >
                        <Text
                          style={{
                            color: budget === b ? "#ffffff" : colors.foreground,
                            fontWeight: "600",
                            textAlign: "center",
                            fontSize: 12,
                            textTransform: "capitalize",
                          }}
                        >
                          {b === "low" ? "Düşük" : b === "medium" ? "Orta" : "Yüksek"}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View className="flex-row gap-2 mt-4">
                  <TouchableOpacity
                    onPress={() => setShowProfileModal(false)}
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
                    onPress={handleCreateProfile}
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
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
