import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useEffect, useState } from "react";
import { getUserRegistration } from "@/lib/_core/user-registration";
import {
  createHealthGoal,
  getUserHealthGoals,
  updateGoalProgress,
  updateGoalStatus,
  deleteHealthGoal,
  getGoalStatistics,
} from "@/lib/_core/health-goals";
import type { HealthGoal } from "@/lib/_core/health-goals";

export default function HealthGoalsScreen() {
  const router = useRouter();
  const colors = useColors();
  const [user, setUser] = useState<any>(null);
  const [goals, setGoals] = useState<HealthGoal[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    goalType: "calories" as const,
    targetValue: "",
    endDate: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await getUserRegistration();
      setUser(userData);

      if (userData?.email) {
        const userGoals = await getUserHealthGoals(userData.email);
        setGoals(userGoals);

        const stats = await getGoalStatistics(userData.email);
        setStatistics(stats);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const handleAddGoal = async () => {
    if (!formData.targetValue.trim() || !formData.endDate.trim()) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurunuz");
      return;
    }

    try {
      const goalTypeLabels: Record<string, string> = {
        calories: "Kalori",
        protein: "Protein",
        water: "Su",
        steps: "Adım",
        sleep: "Uyku",
        weight: "Kilo",
      };

      const units: Record<string, string> = {
        calories: "kcal",
        protein: "g",
        water: "ml",
        steps: "adım",
        sleep: "saat",
        weight: "kg",
      };

      await createHealthGoal({
        userId: user.email,
        goalType: formData.goalType,
        targetValue: parseInt(formData.targetValue),
        currentValue: 0,
        unit: units[formData.goalType],
        startDate: new Date().toISOString().split("T")[0],
        endDate: formData.endDate,
        status: "active",
      });

      Alert.alert("Başarılı", "Hedef oluşturuldu");
      setFormData({ goalType: "calories", targetValue: "", endDate: "" });
      setShowAddForm(false);
      loadData();
    } catch (error) {
      Alert.alert("Hata", "Hedef oluşturulurken bir hata oluştu");
      console.error(error);
    }
  };

  const handleUpdateProgress = async (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    Alert.prompt(
      "İlerleme Güncelle",
      `${goal.goalType} için mevcut değeri girin (Hedef: ${goal.targetValue} ${goal.unit})`,
      [
        { text: "İptal", onPress: () => {}, style: "cancel" },
        {
          text: "Güncelle",
          onPress: async (value: string | undefined) => {
            if (value && !isNaN(Number(value))) {
              try {
                await updateGoalProgress(goalId, parseInt(value));
                loadData();
              } catch (error) {
                Alert.alert("Hata", "İlerleme güncellenirken bir hata oluştu");
              }
            }
          },
        },
      ],
      "plain-text",
      goal.currentValue.toString()
    );
  };

  const handleCompleteGoal = async (goalId: string) => {
    try {
      await updateGoalStatus(goalId, "completed");
      loadData();
    } catch (error) {
      console.error("Failed to complete goal:", error);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    Alert.alert("Sil", "Bu hedefi silmek istediğinize emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteHealthGoal(goalId);
            loadData();
          } catch (error) {
            console.error("Failed to delete goal:", error);
          }
        },
      },
    ]);
  };

  const goalTypeLabels: Record<string, string> = {
    calories: "🔥 Kalori",
    protein: "💪 Protein",
    water: "💧 Su",
    steps: "👟 Adımlar",
    sleep: "😴 Uyku",
    weight: "⚖️ Kilo",
  };

  const goalTypes = [
    { id: "calories", label: "🔥 Kalori" },
    { id: "protein", label: "💪 Protein" },
    { id: "water", label: "💧 Su" },
    { id: "steps", label: "👟 Adımlar" },
    { id: "sleep", label: "😴 Uyku" },
    { id: "weight", label: "⚖️ Kilo" },
  ];

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-3xl font-bold text-foreground">🎯 Hedefler</Text>
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

          {/* Statistics */}
          {statistics && (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8, fontWeight: "600" }}>
                İstatistikler
              </Text>
              <View className="flex-row gap-2">
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.primary }}>
                    {statistics.total}
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.muted }}>Toplam</Text>
                </View>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Text style={{ fontSize: 18, fontWeight: "bold", color: "#3B82F6" }}>
                    {statistics.active}
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.muted }}>Aktif</Text>
                </View>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Text style={{ fontSize: 18, fontWeight: "bold", color: "#10B981" }}>
                    {statistics.completed}
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.muted }}>Tamamlanan</Text>
                </View>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Text style={{ fontSize: 18, fontWeight: "bold", color: "#EC4899" }}>
                    {statistics.averageProgress}%
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.muted }}>Ortalama</Text>
                </View>
              </View>
            </View>
          )}

          {/* Add Goal Button */}
          {!showAddForm && (
            <TouchableOpacity
              onPress={() => setShowAddForm(true)}
              style={{
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: colors.primary,
              }}
            >
              <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>
                + Hedef Ekle
              </Text>
            </TouchableOpacity>
          )}

          {/* Add Goal Form */}
          {showAddForm && (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: colors.border,
                gap: 10,
              }}
            >
              <View>
                <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8 }}>Hedef Türü</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                  {goalTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      onPress={() => setFormData({ ...formData, goalType: type.id as any })}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 20,
                        backgroundColor:
                          formData.goalType === type.id ? colors.primary : colors.background,
                        borderWidth: 1,
                        borderColor: formData.goalType === type.id ? colors.primary : colors.border,
                      }}
                    >
                      <Text
                        style={{
                          color: formData.goalType === type.id ? "#fff" : colors.foreground,
                          fontWeight: "600",
                          fontSize: 12,
                        }}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <TextInput
                placeholder="Hedef Değeri"
                value={formData.targetValue}
                onChangeText={(text) => setFormData({ ...formData, targetValue: text })}
                keyboardType="numeric"
                placeholderTextColor={colors.muted}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  padding: 10,
                  color: colors.foreground,
                  backgroundColor: colors.background,
                }}
              />

              <TextInput
                placeholder="Bitiş Tarihi (YYYY-MM-DD)"
                value={formData.endDate}
                onChangeText={(text) => setFormData({ ...formData, endDate: text })}
                placeholderTextColor={colors.muted}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  padding: 10,
                  color: colors.foreground,
                  backgroundColor: colors.background,
                }}
              />

              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={handleAddGoal}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 6,
                    backgroundColor: colors.primary,
                  }}
                >
                  <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600", fontSize: 12 }}>
                    Oluştur
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowAddForm(false);
                    setFormData({ goalType: "calories", targetValue: "", endDate: "" });
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 6,
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ color: colors.foreground, textAlign: "center", fontWeight: "600", fontSize: 12 }}>
                    İptal
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Goals List */}
          <View className="gap-3">
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
              Aktif Hedefler ({goals.filter((g) => g.status === "active").length})
            </Text>
            {goals.length > 0 ? (
              goals.map((goal) => (
                <View
                  key={goal.id}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <View className="flex-row items-start justify-between gap-2 mb-2">
                    <View className="flex-1">
                      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                        {goalTypeLabels[goal.goalType]}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor:
                          goal.status === "completed"
                            ? "#10B981"
                            : goal.status === "failed"
                              ? "#EF4444"
                              : "#3B82F6",
                        paddingVertical: 4,
                        paddingHorizontal: 8,
                        borderRadius: 4,
                      }}
                    >
                      <Text style={{ fontSize: 10, color: "#fff", fontWeight: "600" }}>
                        {goal.progress}%
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View
                    style={{
                      height: 6,
                      backgroundColor: colors.border,
                      borderRadius: 3,
                      marginBottom: 8,
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        height: "100%",
                        width: `${Math.min(goal.progress, 100)}%`,
                        backgroundColor: goal.progress >= 100 ? "#10B981" : colors.primary,
                      }}
                    />
                  </View>

                  <Text style={{ fontSize: 10, color: colors.muted, marginBottom: 8 }}>
                    Bitiş: {goal.endDate}
                  </Text>

                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => handleUpdateProgress(goal.id)}
                      style={{
                        flex: 1,
                        paddingVertical: 6,
                        borderRadius: 6,
                        backgroundColor: colors.primary,
                      }}
                    >
                      <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600", fontSize: 12 }}>
                        Güncelle
                      </Text>
                    </TouchableOpacity>
                    {goal.status === "active" && (
                      <TouchableOpacity
                        onPress={() => handleCompleteGoal(goal.id)}
                        style={{
                          flex: 1,
                          paddingVertical: 6,
                          borderRadius: 6,
                          backgroundColor: "#10B981",
                        }}
                      >
                        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600", fontSize: 12 }}>
                          Tamamla
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => handleDeleteGoal(goal.id)}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 8,
                        borderRadius: 6,
                        backgroundColor: "#EF4444",
                      }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "600", fontSize: 12 }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={{ textAlign: "center", color: colors.muted, marginVertical: 20 }}>
                Henüz hedef yok
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
