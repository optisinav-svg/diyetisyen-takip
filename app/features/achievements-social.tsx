import { BackButton } from "@/components/back-button";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Modal,
  Share,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import {
  achievementsSocialService,
  type Achievement,
  type UserStats,
} from "@/lib/_core/achievements-social";

export default function AchievementsSocialScreen() {
  const router = useRouter();
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<"achievements" | "stats" | "leaderboard">(
    "achievements"
  );
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<UserStats[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const stats = achievementsSocialService.getStatistics();
  const userId = "user-1";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const userAchievements = achievementsSocialService.getUserAchievements(userId);
    setAchievements(userAchievements);

    const stats = achievementsSocialService.getUserStats(userId);
    setUserStats(stats);

    const leaderboardData = achievementsSocialService.getLeaderboard(5);
    setLeaderboard(leaderboardData);
  };

  const handleUnlockBadge = async () => {
    const badges = achievementsSocialService.getAllBadges();
    const randomBadge = badges[Math.floor(Math.random() * badges.length)];

    const achievement = achievementsSocialService.unlockAchievement(userId, randomBadge.type);

    if (achievement) {
      Alert.alert("🎉 Başarı!", `${achievement.badge.name} rozetini kazandınız!`);
      loadData();
    }
  };

  const handleShareAchievement = (achievement: Achievement, platform: string) => {
    setIsSharing(true);
    setTimeout(() => {
      achievementsSocialService.shareAchievement(
        userId,
        achievement.id,
        platform as "facebook" | "instagram" | "twitter" | "whatsapp"
      );
      Alert.alert("Başarılı", `${platform}'da paylaşıldı`);
      setShowShareModal(false);
      setIsSharing(false);
      loadData();
    }, 500);
  };

  return (
    <ScreenContainer className="p-4">
      <BackButton />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-3xl font-bold text-foreground flex-1">🏆 Başarılar</Text>
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
            Hedeflerinize ulaşarak rozetler kazanın ve başarılarınızı sosyal ağlarda paylaşın.
          </Text>

          {/* Statistics */}
          {userStats && (
            <View
              style={{
                backgroundColor: colors.primary + "15",
                borderRadius: 10,
                padding: 12,
                borderWidth: 1,
                borderColor: colors.primary + "30",
              }}
            >
              <View className="flex-row items-center justify-between gap-2 mb-2">
                <View className="flex-1">
                  <Text style={{ color: colors.muted, fontSize: 12 }}>Rozetler</Text>
                  <Text
                    style={{
                      color: colors.primary,
                      fontWeight: "700",
                      fontSize: 18,
                    }}
                  >
                    {userStats.totalBadges}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text style={{ color: colors.muted, fontSize: 12 }}>Tutarlılık</Text>
                  <Text
                    style={{
                      color: colors.primary,
                      fontWeight: "700",
                      fontSize: 18,
                    }}
                  >
                    {userStats.consecutiveDays} gün
                  </Text>
                </View>
                <View className="flex-1">
                  <Text style={{ color: colors.muted, fontSize: 12 }}>Öğün Kaydı</Text>
                  <Text
                    style={{
                      color: colors.primary,
                      fontWeight: "700",
                      fontSize: 18,
                    }}
                  >
                    {userStats.totalMealsLogged}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text style={{ color: colors.muted, fontSize: 12 }}>Kilo Kaybı</Text>
                  <Text
                    style={{
                      color: colors.primary,
                      fontWeight: "700",
                      fontSize: 16,
                    }}
                  >
                    {userStats.totalWeightLoss.toFixed(1)} kg
                  </Text>
                </View>
                <View className="flex-1">
                  <Text style={{ color: colors.muted, fontSize: 12 }}>Paylaşım</Text>
                  <Text
                    style={{
                      color: colors.primary,
                      fontWeight: "700",
                      fontSize: 16,
                    }}
                  >
                    {achievements.filter((a) => a.shared).length}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Tabs */}
          <View className="flex-row gap-2 bg-surface rounded-lg p-1">
            {["achievements", "stats", "leaderboard"].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() =>
                  setActiveTab(
                    tab as "achievements" | "stats" | "leaderboard"
                  )
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
                  {tab === "achievements"
                    ? "Rozetler"
                    : tab === "stats"
                      ? "İstatistikler"
                      : "Sıralama"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Achievements Tab */}
          {activeTab === "achievements" && (
            <View className="gap-3">
              <TouchableOpacity
                onPress={handleUnlockBadge}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                  paddingVertical: 12,
                }}
              >
                <Text style={{ color: "#ffffff", fontWeight: "600", textAlign: "center" }}>
                  🎯 Test Rozeti Kazanın
                </Text>
              </TouchableOpacity>

              {achievements.length > 0 ? (
                achievements.map((achievement) => (
                  <TouchableOpacity
                    key={achievement.id}
                    onPress={() => {
                      setSelectedAchievement(achievement);
                      setShowShareModal(true);
                    }}
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 10,
                      padding: 14,
                      borderLeftWidth: 4,
                      borderLeftColor: achievement.badge.color,
                    }}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center gap-3 flex-1">
                        <Text style={{ fontSize: 32 }}>{achievement.badge.icon}</Text>
                        <View className="flex-1">
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "700",
                              color: colors.foreground,
                            }}
                          >
                            {achievement.badge.name}
                          </Text>
                          <Text
                            style={{
                              fontSize: 11,
                              color: colors.muted,
                              marginTop: 2,
                            }}
                          >
                            {achievement.badge.description}
                          </Text>
                        </View>
                      </View>
                      {achievement.shared && (
                        <Text style={{ fontSize: 16 }}>📤</Text>
                      )}
                    </View>

                    <Text style={{ color: colors.muted, fontSize: 11 }}>
                      Kazanıldı: {new Date(achievement.unlockedAt).toLocaleDateString("tr-TR")}
                    </Text>

                    <View className="flex-row gap-2 mt-2">
                      {!achievement.shared && (
                        <TouchableOpacity
                          style={{
                            flex: 1,
                            paddingVertical: 6,
                            borderRadius: 6,
                            backgroundColor: colors.primary + "20",
                          }}
                        >
                          <Text
                            style={{
                              color: colors.primary,
                              fontWeight: "600",
                              textAlign: "center",
                              fontSize: 11,
                            }}
                          >
                            📤 Paylaş
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={{ color: colors.muted, textAlign: "center", marginVertical: 20 }}>
                  Henüz rozet kazanmadınız
                </Text>
              )}
            </View>
          )}

          {/* Stats Tab */}
          {activeTab === "stats" && userStats && (
            <View className="gap-3">
              {[
                { label: "Toplam Rozetler", value: userStats.totalBadges, icon: "🏆" },
                { label: "Tutarlılık Günleri", value: userStats.consecutiveDays, icon: "📅" },
                { label: "Kaydedilen Öğünler", value: userStats.totalMealsLogged, icon: "🍽️" },
                { label: "Kilo Kaybı (kg)", value: userStats.totalWeightLoss.toFixed(1), icon: "⚖️" },
                { label: "Yakılan Kalori", value: userStats.totalCaloriesBurned, icon: "🔥" },
              ].map((stat, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 10,
                    padding: 14,
                    borderLeftWidth: 4,
                    borderLeftColor: colors.primary,
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3 flex-1">
                      <Text style={{ fontSize: 24 }}>{stat.icon}</Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: colors.foreground,
                          fontWeight: "600",
                        }}
                      >
                        {stat.label}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "700",
                        color: colors.primary,
                      }}
                    >
                      {stat.value}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Leaderboard Tab */}
          {activeTab === "leaderboard" && (
            <View className="gap-3">
              <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 14, marginBottom: 4 }}>
                🏅 En İyi Performans
              </Text>

              {leaderboard.map((user, index) => (
                <View
                  key={user.userId}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 10,
                    padding: 12,
                    borderLeftWidth: 4,
                    borderLeftColor:
                      index === 0
                        ? "#FFD700"
                        : index === 1
                          ? "#C0C0C0"
                          : index === 2
                            ? "#CD7F32"
                            : colors.border,
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3 flex-1">
                      <Text style={{ fontSize: 20 }}>
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                      </Text>
                      <View className="flex-1">
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "700",
                            color: colors.foreground,
                          }}
                        >
                          Kullanıcı {index + 1}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: colors.muted,
                            marginTop: 2,
                          }}
                        >
                          {user.totalBadges} rozet • {user.consecutiveDays} gün tutarlılık
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: colors.primary,
                      }}
                    >
                      {user.totalBadges}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Share Modal */}
      <Modal visible={showShareModal} animationType="slide" transparent>
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
            {selectedAchievement && (
              <View className="gap-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: colors.foreground,
                    }}
                  >
                    Başarını Paylaş
                  </Text>
                  <TouchableOpacity onPress={() => setShowShareModal(false)}>
                    <Text style={{ fontSize: 20, color: colors.muted }}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 10,
                    padding: 16,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 48, marginBottom: 8 }}>
                    {selectedAchievement.badge.icon}
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: colors.foreground,
                      textAlign: "center",
                    }}
                  >
                    {selectedAchievement.badge.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.muted,
                      textAlign: "center",
                      marginTop: 8,
                    }}
                  >
                    {selectedAchievement.badge.description}
                  </Text>
                </View>

                <Text style={{ color: colors.foreground, fontWeight: "600" }}>
                  Nerede paylaşmak istersin?
                </Text>

                {["facebook", "instagram", "twitter", "whatsapp"].map((platform) => (
                  <TouchableOpacity
                    key={platform}
                    onPress={() => handleShareAchievement(selectedAchievement, platform)}
                    disabled={isSharing}
                    style={{
                      paddingVertical: 12,
                      borderRadius: 8,
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                      opacity: isSharing ? 0.6 : 1,
                    }}
                  >
                    {isSharing ? (
                      <ActivityIndicator color={colors.primary} size="small" />
                    ) : (
                      <Text
                        style={{
                          color: colors.foreground,
                          fontWeight: "600",
                          textAlign: "center",
                          textTransform: "capitalize",
                        }}
                      >
                        {platform === "facebook"
                          ? "📘 Facebook"
                          : platform === "instagram"
                            ? "📷 Instagram"
                            : platform === "twitter"
                              ? "𝕏 Twitter"
                              : "💬 WhatsApp"}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  onPress={() => setShowShareModal(false)}
                  style={{
                    paddingVertical: 12,
                    borderRadius: 8,
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
                    }}
                  >
                    İptal
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
