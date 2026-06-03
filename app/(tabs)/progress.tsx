import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useState, useEffect, useMemo } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { FieldLabel, SectionCard, SectionTitle } from "@/components/app-ui";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { startOAuthLogin } from "@/constants/oauth";

export default function ProgressScreen() {
  const colors = useColors();
  const { isAuthenticated, loading } = useAuth();
  const profileQuery = trpc.profile.me.useQuery(undefined, { enabled: isAuthenticated });

  const role = profileQuery.data?.profile?.role;
  const pairedClients = profileQuery.data?.pairedClients ?? [];

  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedClientId && pairedClients[0]?.profile?.userId) {
      setSelectedClientId(pairedClients[0].profile.userId);
    }
  }, [pairedClients, selectedClientId]);

  const measurementsQuery = trpc.measurements.list.useQuery(
    { clientUserId: selectedClientId ?? undefined },
    { enabled: isAuthenticated && (role === "client" || !!selectedClientId) },
  );

  const measurements = useMemo(() => {
    return (measurementsQuery.data ?? []).sort((a, b) => {
      const dateA = new Date(a.recordedAt).getTime();
      const dateB = new Date(b.recordedAt).getTime();
      return dateA - dateB;
    });
  }, [measurementsQuery.data]);

  const stats = useMemo(() => {
    if (measurements.length === 0) return null;

    const first = measurements[0];
    const last = measurements[measurements.length - 1];

    return {
      weightChange: Number(last.weightKg) - Number(first.weightKg),
      bodyFatChange: last.bodyFatPercent && first.bodyFatPercent 
        ? Number(last.bodyFatPercent) - Number(first.bodyFatPercent)
        : null,
      muscleMassChange: last.muscleMassKg && first.muscleMassKg
        ? Number(last.muscleMassKg) - Number(first.muscleMassKg)
        : null,
      firstDate: new Date(first.recordedAt).toLocaleDateString("tr-TR"),
      lastDate: new Date(last.recordedAt).toLocaleDateString("tr-TR"),
    };
  }, [measurements]);

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
          <Text className="text-3xl font-bold text-foreground">İlerleme görmek için giriş yapın.</Text>
          <Text className="text-sm text-muted">Ölçüm verileriniz burada görüntülenecektir.</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="gap-6">
          <SectionTitle title="İlerleme Takibi" />

          {/* Client Selection for Dietitian */}
          {role === "dietitian" && pairedClients.length > 0 && (
            <View className="gap-3">
              <FieldLabel label="Danışan Seç" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                {pairedClients.map((client) => (
                  <View
                    key={client.profile.userId}
                    onTouchEnd={() => setSelectedClientId(client.profile.userId)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: selectedClientId === client.profile.userId ? colors.primary : colors.surface,
                      borderWidth: 1,
                      borderColor: selectedClientId === client.profile.userId ? colors.primary : colors.border,
                    }}
                  >
                    <Text
                      className={selectedClientId === client.profile.userId ? "text-white font-semibold" : "text-foreground font-semibold"}
                    >
                      {client.profile.displayName}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Stats Summary */}
          {measurementsQuery.isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : measurements.length === 0 ? (
            <SectionCard>
              <Text className="text-center text-muted">Henüz ölçüm kaydı yok.</Text>
            </SectionCard>
          ) : stats ? (
            <View className="gap-3">
              <SectionCard>
                <View className="gap-4">
                  <View>
                    <Text className="text-xs text-muted mb-1">Kilo Değişimi</Text>
                    <Text className={`text-2xl font-bold ${stats.weightChange > 0 ? "text-error" : "text-success"}`}>
                      {stats.weightChange > 0 ? "+" : ""}{stats.weightChange.toFixed(1)} kg
                    </Text>
                  </View>

                  {stats.bodyFatChange !== null && (
                    <View>
                      <Text className="text-xs text-muted mb-1">Vücut Yağı Değişimi</Text>
                      <Text className={`text-2xl font-bold ${stats.bodyFatChange > 0 ? "text-error" : "text-success"}`}>
                        {stats.bodyFatChange > 0 ? "+" : ""}{stats.bodyFatChange.toFixed(1)} %
                      </Text>
                    </View>
                  )}

                  {stats.muscleMassChange !== null && (
                    <View>
                      <Text className="text-xs text-muted mb-1">Kas Kütlesi Değişimi</Text>
                      <Text className={`text-2xl font-bold ${stats.muscleMassChange > 0 ? "text-success" : "text-error"}`}>
                        {stats.muscleMassChange > 0 ? "+" : ""}{stats.muscleMassChange.toFixed(1)} kg
                      </Text>
                    </View>
                  )}

                  <View className="border-t" style={{ borderColor: colors.border, paddingTop: 12 }}>
                    <Text className="text-xs text-muted">
                      {stats.firstDate} - {stats.lastDate}
                    </Text>
                  </View>
                </View>
              </SectionCard>

              {/* Measurements Timeline */}
              <View className="gap-2">
                <FieldLabel label="Ölçüm Geçmişi" />
                {measurements.map((measurement, idx) => (
                  <SectionCard key={measurement.id}>
                    <View className="gap-2">
                      <View className="flex-row justify-between items-center">
                        <Text className="font-semibold text-foreground">
                          {new Date(measurement.recordedAt).toLocaleDateString("tr-TR")}
                        </Text>
                        <Text className="text-xs text-muted">
                          #{measurements.length - idx}
                        </Text>
                      </View>

                      <View className="gap-1 mt-2">
                        <View className="flex-row justify-between">
                          <Text className="text-sm text-muted">Boy:</Text>
                          <Text className="text-sm font-semibold text-foreground">{measurement.heightCm} cm</Text>
                        </View>
                        <View className="flex-row justify-between">
                          <Text className="text-sm text-muted">Kilo:</Text>
                          <Text className="text-sm font-semibold text-foreground">{measurement.weightKg} kg</Text>
                        </View>
                        {measurement.bodyFatPercent && (
                          <View className="flex-row justify-between">
                            <Text className="text-sm text-muted">Vücut Yağı:</Text>
                            <Text className="text-sm font-semibold text-foreground">{measurement.bodyFatPercent} %</Text>
                          </View>
                        )}
                        {measurement.muscleMassKg && (
                          <View className="flex-row justify-between">
                            <Text className="text-sm text-muted">Kas Kütlesi:</Text>
                            <Text className="text-sm font-semibold text-foreground">{measurement.muscleMassKg} kg</Text>
                          </View>
                        )}
                      </View>

                      {measurement.notes && (
                        <View className="mt-2 pt-2" style={{ borderTopColor: colors.border, borderTopWidth: 1 }}>
                          <Text className="text-xs text-muted italic">{measurement.notes}</Text>
                        </View>
                      )}
                    </View>
                  </SectionCard>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
