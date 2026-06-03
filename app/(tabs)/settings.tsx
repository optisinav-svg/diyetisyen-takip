import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useState, useEffect, useMemo } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { AppTextInput, FieldLabel, Pill, PrimaryButton, SectionCard, SectionTitle, SecondaryButton } from "@/components/app-ui";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { startOAuthLogin } from "@/constants/oauth";

export default function SettingsScreen() {
  const colors = useColors();
  const utils = trpc.useUtils();
  const { isAuthenticated, loading } = useAuth();
  const profileQuery = trpc.profile.me.useQuery(undefined, { enabled: isAuthenticated });

  const pairedClients = profileQuery.data?.pairedClients ?? [];
  const role = profileQuery.data?.profile?.role;

  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"health" | "groups">("health");
  const [condition, setCondition] = useState("");
  const [conditionNotes, setConditionNotes] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");

  useEffect(() => {
    if (!selectedClientId && pairedClients[0]?.profile?.userId) {
      setSelectedClientId(pairedClients[0].profile.userId);
    }
  }, [pairedClients, selectedClientId]);

  const selectedClient = useMemo(
    () => pairedClients.find((item) => item.profile.userId === selectedClientId) ?? pairedClients[0] ?? null,
    [pairedClients, selectedClientId],
  );

  const healthQuery = trpc.health.list.useQuery(
    role === "dietitian" ? { clientUserId: selectedClientId ?? undefined } : {},
    { enabled: isAuthenticated && !!role && (role === "client" || !!selectedClientId) },
  );

  const foodGroupsQuery = trpc.foodGroups.list.useQuery(undefined, {
    enabled: isAuthenticated && role === "dietitian",
  });

  const addHealthMutation = trpc.health.add.useMutation({
    onSuccess: async () => {
      setCondition("");
      setConditionNotes("");
      await utils.health.list.invalidate();
    },
  });

  const deleteHealthMutation = trpc.health.delete.useMutation({
    onSuccess: async () => {
      await utils.health.list.invalidate();
    },
  });

  const createGroupMutation = trpc.foodGroups.create.useMutation({
    onSuccess: async () => {
      setGroupName("");
      setGroupDescription("");
      await utils.foodGroups.list.invalidate();
    },
  });

  const deleteGroupMutation = trpc.foodGroups.delete.useMutation({
    onSuccess: async () => {
      await utils.foodGroups.list.invalidate();
    },
  });

  const submitHealth = async () => {
    if (!selectedClient?.profile.userId) return;
    await addHealthMutation.mutateAsync({
      clientUserId: selectedClient.profile.userId,
      condition: condition.trim(),
      notes: conditionNotes.trim() || undefined,
    });
  };

  const submitGroup = async () => {
    await createGroupMutation.mutateAsync({
      name: groupName.trim(),
      description: groupDescription.trim() || undefined,
    });
  };

  if (loading || (isAuthenticated && profileQuery.isLoading)) {
    return (
      <ScreenContainer className="items-center justify-center px-6">
        <ActivityIndicator color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="p-6 justify-center">
        <View className="gap-4">
          <Text className="text-3xl font-bold text-foreground">Ayarlar için giriş yapın.</Text>
          <PrimaryButton label="Giriş yap" onPress={() => void startOAuthLogin()} />
        </View>
      </ScreenContainer>
    );
  }

  if (role !== "dietitian") {
    return (
      <ScreenContainer className="p-6 justify-center">
        <Text className="text-lg text-muted">Ayarlar sadece diyetisyenler için kullanılabilir.</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="gap-6">
          <SectionTitle title="Diyetisyen Ayarları" />

          {/* Client Selection */}
          <View className="gap-3">
            <FieldLabel label="Danışan Seç" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
              {pairedClients.map((client) => (
                <Pressable
                  key={client.profile.userId}
                  onPress={() => setSelectedClientId(client.profile.userId)}
                  style={({ pressed }) => [
                    {
                      opacity: pressed ? 0.7 : 1,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: selectedClientId === client.profile.userId ? colors.primary : colors.surface,
                      borderWidth: 1,
                      borderColor: selectedClientId === client.profile.userId ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    className={selectedClientId === client.profile.userId ? "text-white font-semibold" : "text-foreground font-semibold"}
                  >
                    {client.profile.displayName}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Tab Selection */}
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setActiveTab("health")}
              style={({ pressed }) => [
                {
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor: activeTab === "health" ? colors.primary : colors.surface,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text className={activeTab === "health" ? "text-white text-center font-semibold" : "text-foreground text-center font-semibold"}>
                Hastalıklar
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab("groups")}
              style={({ pressed }) => [
                {
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor: activeTab === "groups" ? colors.primary : colors.surface,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text className={activeTab === "groups" ? "text-white text-center font-semibold" : "text-foreground text-center font-semibold"}>
                Gıda Grupları
              </Text>
            </Pressable>
          </View>

          {/* Health Conditions Tab */}
          {activeTab === "health" && (
            <View className="gap-4">
              <SectionCard>
                <View className="gap-3">
                  <FieldLabel label="Hastalık Adı" />
                  <AppTextInput
                    placeholder="Örn: Şeker, Tansiyon, Kalp..."
                    value={condition}
                    onChangeText={setCondition}
                  />

                  <FieldLabel label="Notlar (İsteğe Bağlı)" />
                  <AppTextInput
                    placeholder="Hastalık hakkında notlar..."
                    value={conditionNotes}
                    onChangeText={setConditionNotes}
                    multiline
                    numberOfLines={3}
                  />

                  <PrimaryButton
                    label="Hastalık Ekle"
                    onPress={() => void submitHealth()}
                    disabled={!condition.trim() || addHealthMutation.isPending}
                  />
                </View>
              </SectionCard>

              {/* Health List */}
              {healthQuery.isLoading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <View className="gap-2">
                  {(healthQuery.data ?? []).map((item) => (
                    <View
                      key={item.id}
                      className="flex-row items-center justify-between p-3 rounded-lg"
                      style={{ backgroundColor: colors.surface }}
                    >
                      <View className="flex-1">
                        <Text className="font-semibold text-foreground">{item.condition}</Text>
                        {item.notes && <Text className="text-xs text-muted mt-1">{item.notes}</Text>}
                      </View>
                      <Pressable
                        onPress={() => void deleteHealthMutation.mutateAsync({ id: item.id })}
                        style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                      >
                        <Text className="text-error font-semibold">Sil</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Food Groups Tab */}
          {activeTab === "groups" && (
            <View className="gap-4">
              <SectionCard>
                <View className="gap-3">
                  <FieldLabel label="Grup Adı" />
                  <AppTextInput
                    placeholder="Örn: Yemekler, Meyveler, Tatlılar..."
                    value={groupName}
                    onChangeText={setGroupName}
                  />

                  <FieldLabel label="Açıklama (İsteğe Bağlı)" />
                  <AppTextInput
                    placeholder="Grup açıklaması..."
                    value={groupDescription}
                    onChangeText={setGroupDescription}
                    multiline
                    numberOfLines={2}
                  />

                  <PrimaryButton
                    label="Grup Oluştur"
                    onPress={() => void submitGroup()}
                    disabled={!groupName.trim() || createGroupMutation.isPending}
                  />
                </View>
              </SectionCard>

              {/* Groups List */}
              {foodGroupsQuery.isLoading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <View className="gap-2">
                  {(foodGroupsQuery.data ?? []).map((group) => (
                    <Pressable
                      key={group.id}
                      style={({ pressed }) => [
                        {
                          padding: 12,
                          borderRadius: 8,
                          backgroundColor: colors.surface,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className="font-semibold text-foreground">{group.name}</Text>
                          {group.description && <Text className="text-xs text-muted mt-1">{group.description}</Text>}
                        </View>
                        <Pressable
                          onPress={() => void deleteGroupMutation.mutateAsync({ id: group.id })}
                          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                        >
                          <Text className="text-error font-semibold">Sil</Text>
                        </Pressable>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
