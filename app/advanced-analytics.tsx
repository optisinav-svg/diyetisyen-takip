import {
  ScrollView,
  Text,
  View,
  Pressable,
  FlatList,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';
import { useState, useMemo } from 'react';
import { useColors } from '@/hooks/use-colors';

interface WeeklyComparison {
  week: string;
  adherenceRate: number;
  avgSteps: number;
  avgHeartRate: number;
  avgSleep: number;
  avgCalories: number;
}

interface GoalProgress {
  goalName: string;
  target: number;
  current: number;
  progress: number;
  status: 'on-track' | 'at-risk' | 'off-track';
}

interface HealthTrend {
  metric: string;
  trend: 'improving' | 'declining' | 'stable';
  changePercent: number;
  prediction: string;
}

export default function AdvancedAnalyticsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'weekly' | 'goals' | 'trends' | 'insights'>('weekly');

  // Mock data
  const weeklyComparisons: WeeklyComparison[] = useMemo(() => [
    {
      week: '2026-04-07 to 2026-04-13',
      adherenceRate: 78,
      avgSteps: 7800,
      avgHeartRate: 73,
      avgSleep: 7.2,
      avgCalories: 2050,
    },
    {
      week: '2026-04-14 to 2026-04-20',
      adherenceRate: 82,
      avgSteps: 8200,
      avgHeartRate: 71,
      avgSleep: 7.4,
      avgCalories: 2100,
    },
    {
      week: '2026-04-21 to 2026-04-27',
      adherenceRate: 85,
      avgSteps: 8400,
      avgHeartRate: 70,
      avgSleep: 7.6,
      avgCalories: 2120,
    },
    {
      week: '2026-04-28 to 2026-05-04',
      adherenceRate: 88,
      avgSteps: 8600,
      avgHeartRate: 69,
      avgSleep: 7.8,
      avgCalories: 2150,
    },
  ], []);

  const goalProgress: GoalProgress[] = useMemo(() => [
    {
      goalName: 'Günlük Adımlar',
      target: 10000,
      current: 8600,
      progress: 86,
      status: 'on-track',
    },
    {
      goalName: 'Kilo Kaybı',
      target: 5,
      current: 2,
      progress: 40,
      status: 'on-track',
    },
    {
      goalName: 'Uyku Süresi',
      target: 8,
      current: 7.8,
      progress: 97,
      status: 'on-track',
    },
    {
      goalName: 'Protein Alımı',
      target: 120,
      current: 105,
      progress: 87,
      status: 'on-track',
    },
    {
      goalName: 'Uyum Oranı',
      target: 95,
      current: 88,
      progress: 92,
      status: 'at-risk',
    },
  ], []);

  const healthTrends: HealthTrend[] = useMemo(() => [
    {
      metric: 'Adımlar',
      trend: 'improving',
      changePercent: 12.5,
      prediction: 'Mevcut hızda devam ederseniz, 10 gün içinde günlük 10.000 adım hedefine ulaşabilirsiniz.',
    },
    {
      metric: 'Kalp Atış Hızı',
      trend: 'improving',
      changePercent: -8.2,
      prediction: 'Kalp sağlığınız iyileşiyor. Düzenli egzersiz yapın.',
    },
    {
      metric: 'Uyku Süresi',
      trend: 'stable',
      changePercent: 2.1,
      prediction: 'Uyku düzeniniz istikrarlı. Mevcut rutini devam ettirin.',
    },
    {
      metric: 'Kilo',
      trend: 'improving',
      changePercent: -2.6,
      prediction: 'Kilo kaybı hızı iyi. Beslenme planını takip etmeye devam edin.',
    },
  ], []);

  const insights = useMemo(() => [
    '5 hedefin yolunda gidiyor. Harika ilerleme!',
    '4 metrikte iyileşme görülüyor.',
    'Uyum oranınızı artırmak için beslenme planına daha sıkı uymalısınız.',
    'Adım hedefine neredeyse ulaştınız! Biraz daha çaba gösterin.',
  ], []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return '#22C55E';
      case 'at-risk':
        return '#F59E0B';
      case 'off-track':
        return '#EF4444';
      default:
        return colors.muted;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return '📈';
      case 'declining':
        return '📉';
      case 'stable':
        return '➡️';
      default:
        return '•';
    }
  };

  const renderWeeklyCard = ({ item }: { item: WeeklyComparison }) => (
    <View className="bg-surface rounded-lg p-4 mb-3 border border-border">
      <Text className="text-sm font-semibold text-foreground mb-3">{item.week}</Text>
      <View className="gap-2">
        <View className="flex-row justify-between">
          <Text className="text-xs text-muted">Uyum Oranı</Text>
          <Text className="text-xs font-bold text-primary">{item.adherenceRate}%</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xs text-muted">Günlük Adımlar</Text>
          <Text className="text-xs font-bold text-primary">{item.avgSteps}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xs text-muted">Kalp Atış Hızı</Text>
          <Text className="text-xs font-bold text-primary">{item.avgHeartRate} bpm</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xs text-muted">Uyku Süresi</Text>
          <Text className="text-xs font-bold text-primary">{item.avgSleep}h</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xs text-muted">Kalori</Text>
          <Text className="text-xs font-bold text-primary">{item.avgCalories} kcal</Text>
        </View>
      </View>
    </View>
  );

  const renderGoalCard = ({ item }: { item: GoalProgress }) => (
    <View className="bg-surface rounded-lg p-4 mb-3 border border-border">
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-sm font-semibold text-foreground">{item.goalName}</Text>
        <View
          className="px-2 py-1 rounded"
          style={{ backgroundColor: getStatusColor(item.status) + '20' }}
        >
          <Text
            className="text-xs font-bold"
            style={{ color: getStatusColor(item.status) }}
          >
            {item.status === 'on-track' ? '✓ Yolda' : item.status === 'at-risk' ? '⚠️ Risk' : '✗ Geride'}
          </Text>
        </View>
      </View>

      <View className="mb-2">
        <View className="flex-row justify-between mb-1">
          <Text className="text-xs text-muted">{item.current} / {item.target}</Text>
          <Text className="text-xs font-bold text-primary">{item.progress}%</Text>
        </View>
        <View className="h-2 bg-border rounded-full overflow-hidden">
          <View
            className="h-full bg-primary rounded-full"
            style={{ width: `${item.progress}%` }}
          />
        </View>
      </View>
    </View>
  );

  const renderTrendCard = ({ item }: { item: HealthTrend }) => (
    <View className="bg-surface rounded-lg p-4 mb-3 border border-border">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-row items-center gap-2">
          <Text className="text-lg">{getTrendIcon(item.trend)}</Text>
          <Text className="text-sm font-semibold text-foreground">{item.metric}</Text>
        </View>
        <Text
          className="text-xs font-bold"
          style={{
            color: item.changePercent > 0 ? '#22C55E' : item.changePercent < 0 ? '#EF4444' : colors.muted,
          }}
        >
          {item.changePercent > 0 ? '+' : ''}{item.changePercent}%
        </Text>
      </View>
      <Text className="text-xs leading-5 text-muted">{item.prediction}</Text>
    </View>
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
        {/* Header */}
        <View className="gap-2">
          <Pressable onPress={() => router.back()}>
            <Text className="text-primary font-semibold">← Geri</Text>
          </Pressable>
          <Text className="text-3xl font-bold text-foreground">Detaylı Analitik</Text>
          <Text className="text-sm text-muted">Sağlık ve ilerleme trendlerinizi analiz edin</Text>
        </View>

        {/* Tab Navigation */}
        <View className="flex-row gap-1 flex-wrap">
          {(['weekly', 'goals', 'trends', 'insights'] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setSelectedTab(tab)}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 6,
                backgroundColor: selectedTab === tab ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: selectedTab === tab ? colors.primary : colors.border,
              }}
            >
              <Text
                className={
                  selectedTab === tab
                    ? 'text-white font-semibold text-xs'
                    : 'text-foreground font-semibold text-xs'
                }
              >
                {tab === 'weekly' && 'Haftalık'}
                {tab === 'goals' && 'Hedefler'}
                {tab === 'trends' && 'Trendler'}
                {tab === 'insights' && 'İçgörüler'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Weekly Tab */}
        {selectedTab === 'weekly' && (
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground mb-2">Haftalık Karşılaştırma</Text>
            <FlatList
              data={weeklyComparisons}
              renderItem={renderWeeklyCard}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Goals Tab */}
        {selectedTab === 'goals' && (
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground mb-2">Hedef İlerleme</Text>
            <FlatList
              data={goalProgress}
              renderItem={renderGoalCard}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Trends Tab */}
        {selectedTab === 'trends' && (
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground mb-2">Sağlık Trendleri</Text>
            <FlatList
              data={healthTrends}
              renderItem={renderTrendCard}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Insights Tab */}
        {selectedTab === 'insights' && (
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground mb-2">Önemli İçgörüler</Text>
            {insights.map((insight, index) => (
              <View key={index} className="bg-primary/10 rounded-lg p-4 border border-primary gap-2">
                <View className="flex-row gap-2">
                  <Text className="text-lg">💡</Text>
                  <Text className="text-sm leading-5 text-primary flex-1">{insight}</Text>
                </View>
              </View>
            ))}

            {/* Recommendations */}
            <View className="bg-surface rounded-lg p-4 border border-border gap-3 mt-4">
              <Text className="text-sm font-semibold text-foreground">Öneriler</Text>
              <View className="gap-2">
                <View className="flex-row gap-2">
                  <Text className="text-lg">🎯</Text>
                  <Text className="text-xs leading-5 text-muted flex-1">
                    Günlük 10.000 adım hedefine ulaşmak için haftada 3 gün 30 dakika yürüyüş yapın.
                  </Text>
                </View>
                <View className="flex-row gap-2">
                  <Text className="text-lg">🥗</Text>
                  <Text className="text-xs leading-5 text-muted flex-1">
                    Protein alımını artırmak için her öğüne 25-30g protein ekleyin.
                  </Text>
                </View>
                <View className="flex-row gap-2">
                  <Text className="text-lg">😴</Text>
                  <Text className="text-xs leading-5 text-muted flex-1">
                    Uyku kalitesini iyileştirmek için gece 11de yatmaya çalışın.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
