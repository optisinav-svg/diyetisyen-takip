import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import {
  mealPlanTemplatesService,
  type MealPlanTemplate,
  type ClientMealPlan,
} from "@/lib/_core/meal-plan-templates";

export default function MealPlanTemplatesScreen() {
  const router = useRouter();
  const colors = useColors();
  const [templates, setTemplates] = useState<MealPlanTemplate[]>([]);
  const [clientPlans, setClientPlans] = useState<ClientMealPlan[]>([]);
  const [activeTab, setActiveTab] = useState<"templates" | "plans">("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<MealPlanTemplate | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const stats = mealPlanTemplatesService.getStatistics();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allTemplates = mealPlanTemplatesService.getAllTemplates();
    setTemplates(allTemplates);

    const plans = mealPlanTemplatesService.getClientMealPlans("client-1");
    setClientPlans(plans);
  };

  const handleSelectTemplate = (template: MealPlanTemplate) => {
    setSelectedTemplate(template);
    setShowDetailModal(true);
  };

  const handleAssignTemplate = async () => {
    if (!selectedTemplate) return;

    setIsLoading(true);
    try {
      const plan = mealPlanTemplatesService.createClientMealPlan(
        "client-1",
        "dietitian-1",
        selectedTemplate.id
      );

      if (plan) {
        Alert.alert("Başarılı", `${selectedTemplate.name} danışana atandı`);
        setShowDetailModal(false);
        loadData();
      }
    } catch (error) {
      Alert.alert("Hata", "Plan atanırken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePlanStatus = (planId: string, status: "active" | "completed" | "paused") => {
    mealPlanTemplatesService.updatePlanStatus(planId, status);
    loadData();
    Alert.alert("Başarılı", "Plan durumu güncellendi");
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-3xl font-bold text-foreground flex-1">🍽️ Öğün Planları</Text>
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
            Önceden hazırlanmış öğün planı şablonlarını danışanlara atayın ve özelleştirin.
          </Text>

          {/* Statistics */}
          <View
            style={{
              backgroundColor: colors.primary + "15",
              borderRadius: 10,
              padding: 12,
              borderWidth: 1,
              borderColor: colors.primary + "30",
            }}
          >
            <View className="flex-row items-center justify-between gap-2">
              <View className="flex-1">
                <Text style={{ color: colors.muted, fontSize: 12 }}>Şablonlar</Text>
                <Text
                  style={{
                    color: colors.primary,
                    fontWeight: "700",
                    fontSize: 18,
                  }}
                >
                  {stats.totalTemplates}
                </Text>
              </View>
              <View className="flex-1">
                <Text style={{ color: colors.muted, fontSize: 12 }}>Aktif Planlar</Text>
                <Text
                  style={{
                    color: colors.primary,
                    fontWeight: "700",
                    fontSize: 18,
                  }}
                >
                  {stats.activePlans}
                </Text>
              </View>
              <View className="flex-1">
                <Text style={{ color: colors.muted, fontSize: 12 }}>Tamamlanan</Text>
                <Text
                  style={{
                    color: colors.primary,
                    fontWeight: "700",
                    fontSize: 18,
                  }}
                >
                  {stats.completedPlans}
                </Text>
              </View>
            </View>
          </View>

          {/* Tabs */}
          <View className="flex-row gap-2 bg-surface rounded-lg p-1">
            <TouchableOpacity
              onPress={() => setActiveTab("templates")}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 6,
                backgroundColor: activeTab === "templates" ? colors.primary : "transparent",
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: activeTab === "templates" ? "#ffffff" : colors.foreground,
                  fontWeight: "600",
                }}
              >
                Şablonlar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("plans")}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 6,
                backgroundColor: activeTab === "plans" ? colors.primary : "transparent",
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: activeTab === "plans" ? "#ffffff" : colors.foreground,
                  fontWeight: "600",
                }}
              >
                Danışan Planları
              </Text>
            </TouchableOpacity>
          </View>

          {/* Templates Tab */}
          {activeTab === "templates" && (
            <View className="gap-3">
              {templates.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  onPress={() => handleSelectTemplate(template)}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 10,
                    padding: 14,
                    borderLeftWidth: 4,
                    borderLeftColor: colors.primary,
                  }}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-1">
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "700",
                          color: colors.foreground,
                        }}
                      >
                        {template.icon} {template.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.muted,
                          marginTop: 4,
                        }}
                      >
                        {template.description}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between mb-2">
                    <Text style={{ color: colors.muted, fontSize: 12 }}>
                      🔥 {template.dailyCalories} kcal/gün
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 12 }}>
                      🥚 {template.macros.protein}% protein
                    </Text>
                  </View>

                  <View className="flex-row gap-2">
                    {template.benefits.slice(0, 2).map((benefit, index) => (
                      <Text
                        key={index}
                        style={{
                          backgroundColor: colors.primary + "20",
                          color: colors.primary,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: "600",
                        }}
                      >
                        {benefit}
                      </Text>
                    ))}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Plans Tab */}
          {activeTab === "plans" && (
            <View className="gap-3">
              {clientPlans.length > 0 ? (
                clientPlans.map((plan) => {
                  const template = mealPlanTemplatesService.getTemplateById(plan.templateId);
                  return (
                    <View
                      key={plan.id}
                      style={{
                        backgroundColor: colors.surface,
                        borderRadius: 10,
                        padding: 12,
                        borderLeftWidth: 4,
                        borderLeftColor:
                          plan.status === "active"
                            ? colors.success
                            : plan.status === "completed"
                              ? colors.primary
                              : colors.warning,
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
                          {template?.icon} {template?.name}
                        </Text>
                        <Text
                          style={{
                            backgroundColor:
                              plan.status === "active"
                                ? colors.success + "20"
                                : plan.status === "completed"
                                  ? colors.primary + "20"
                                  : colors.warning + "20",
                            color:
                              plan.status === "active"
                                ? colors.success
                                : plan.status === "completed"
                                  ? colors.primary
                                  : colors.warning,
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: "600",
                          }}
                        >
                          {plan.status === "active"
                            ? "Aktif"
                            : plan.status === "completed"
                              ? "Tamamlandı"
                              : "Duraklatıldı"}
                        </Text>
                      </View>

                      <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>
                        Başlangıç: {new Date(plan.startDate).toLocaleDateString("tr-TR")}
                      </Text>

                      <View className="flex-row gap-2">
                        {plan.status === "active" && (
                          <>
                            <TouchableOpacity
                              onPress={() => handleUpdatePlanStatus(plan.id, "paused")}
                              style={{
                                flex: 1,
                                paddingVertical: 8,
                                borderRadius: 6,
                                backgroundColor: colors.warning + "20",
                              }}
                            >
                              <Text
                                style={{
                                  color: colors.warning,
                                  fontWeight: "600",
                                  textAlign: "center",
                                  fontSize: 12,
                                }}
                              >
                                Duraklat
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => handleUpdatePlanStatus(plan.id, "completed")}
                              style={{
                                flex: 1,
                                paddingVertical: 8,
                                borderRadius: 6,
                                backgroundColor: colors.success + "20",
                              }}
                            >
                              <Text
                                style={{
                                  color: colors.success,
                                  fontWeight: "600",
                                  textAlign: "center",
                                  fontSize: 12,
                                }}
                              >
                                Tamamla
                              </Text>
                            </TouchableOpacity>
                          </>
                        )}

                        {plan.status !== "active" && (
                          <TouchableOpacity
                            onPress={() => handleUpdatePlanStatus(plan.id, "active")}
                            style={{
                              flex: 1,
                              paddingVertical: 8,
                              borderRadius: 6,
                              backgroundColor: colors.primary + "20",
                            }}
                          >
                            <Text
                              style={{
                                color: colors.primary,
                                fontWeight: "600",
                                textAlign: "center",
                                fontSize: 12,
                              }}
                            >
                              Devam Et
                            </Text>
                          </TouchableOpacity>
                        )}

                        <TouchableOpacity
                          style={{
                            flex: 1,
                            paddingVertical: 8,
                            borderRadius: 6,
                            backgroundColor: colors.surface,
                            borderWidth: 1,
                            borderColor: colors.border,
                          }}
                        >
                          <Text
                            style={{
                              color: colors.foreground,
                              fontWeight: "600",
                              textAlign: "center",
                              fontSize: 12,
                            }}
                          >
                            Detaylar
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text style={{ color: colors.muted, textAlign: "center", marginVertical: 20 }}>
                  Henüz plan atanmadı
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Template Detail Modal */}
      <Modal visible={showDetailModal} animationType="slide" transparent>
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
              maxHeight: "85%",
            }}
          >
            <ScrollView>
              {selectedTemplate && (
                <View className="gap-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text
                      style={{
                        fontSize: 22,
                        fontWeight: "700",
                        color: colors.foreground,
                      }}
                    >
                      {selectedTemplate.icon} {selectedTemplate.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowDetailModal(false)}
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                      }}
                    >
                      <Text style={{ fontSize: 20, color: colors.muted }}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={{ color: colors.muted, fontSize: 14 }}>
                    {selectedTemplate.description}
                  </Text>

                  {/* Macros */}
                  <View
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 10,
                      padding: 12,
                    }}
                  >
                    <Text style={{ color: colors.foreground, fontWeight: "600", marginBottom: 8 }}>
                      Makro Besinler
                    </Text>
                    <View className="flex-row items-center justify-between">
                      <Text style={{ color: colors.muted, fontSize: 12 }}>
                        🥚 Protein: {selectedTemplate.macros.protein}%
                      </Text>
                      <Text style={{ color: colors.muted, fontSize: 12 }}>
                        🍞 Karbonhidrat: {selectedTemplate.macros.carbs}%
                      </Text>
                      <Text style={{ color: colors.muted, fontSize: 12 }}>
                        🧈 Yağ: {selectedTemplate.macros.fat}%
                      </Text>
                    </View>
                  </View>

                  {/* Meals */}
                  <View>
                    <Text style={{ color: colors.foreground, fontWeight: "600", marginBottom: 8 }}>
                      Günlük Öğünler
                    </Text>
                    {selectedTemplate.meals.map((meal) => (
                      <View
                        key={meal.id}
                        style={{
                          backgroundColor: colors.surface,
                          borderRadius: 8,
                          padding: 10,
                          marginBottom: 8,
                        }}
                      >
                        <Text style={{ color: colors.foreground, fontWeight: "600", marginBottom: 4 }}>
                          {meal.name}
                        </Text>
                        <Text style={{ color: colors.muted, fontSize: 11, marginBottom: 6 }}>
                          {meal.items.join(", ")}
                        </Text>
                        <View className="flex-row items-center justify-between">
                          <Text style={{ color: colors.muted, fontSize: 11 }}>
                            🔥 {meal.calories} kcal
                          </Text>
                          <Text style={{ color: colors.muted, fontSize: 11 }}>
                            🥚 {meal.protein}g
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* Benefits & Restrictions */}
                  <View className="gap-2">
                    <View>
                      <Text style={{ color: colors.foreground, fontWeight: "600", marginBottom: 6 }}>
                        ✅ Faydaları
                      </Text>
                      {selectedTemplate.benefits.map((benefit, index) => (
                        <Text key={index} style={{ color: colors.muted, fontSize: 12, marginBottom: 3 }}>
                          • {benefit}
                        </Text>
                      ))}
                    </View>

                    <View>
                      <Text style={{ color: colors.foreground, fontWeight: "600", marginBottom: 6 }}>
                        ⚠️ Kısıtlamalar
                      </Text>
                      {selectedTemplate.restrictions.map((restriction, index) => (
                        <Text key={index} style={{ color: colors.muted, fontSize: 12, marginBottom: 3 }}>
                          • {restriction}
                        </Text>
                      ))}
                    </View>
                  </View>

                  {/* Assign Button */}
                  <TouchableOpacity
                    onPress={handleAssignTemplate}
                    disabled={isLoading}
                    style={{
                      backgroundColor: colors.primary,
                      borderRadius: 8,
                      paddingVertical: 14,
                      opacity: isLoading ? 0.6 : 1,
                    }}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <Text style={{ color: "#ffffff", fontWeight: "600", textAlign: "center" }}>
                        Danışana Ata
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
