import {
  ScrollView,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useMemo } from 'react';
import { useColors } from '@/hooks/use-colors';

interface ClientDetail {
  id: number;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  adherenceRate: number;
  healthStatus: 'good' | 'warning' | 'critical';
  avgSteps: number;
  avgHeartRate: number;
  avgSleep: number;
  avgCalories: number;
}

interface HealthTrend {
  date: string;
  steps: number;
  heartRate: number;
  sleep: number;
  calories: number;
}

interface Meal {
  id: number;
  date: string;
  type: string;
  foods: string;
  calories: number;
  adherence: boolean;
}

interface Note {
  id: number;
  date: string;
  author: string;
  content: string;
}

interface Appointment {
  id: number;
  date: string;
  time: string;
  status: 'completed' | 'upcoming' | 'cancelled';
}

export default function ClientDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { clientId } = useLocalSearchParams();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'trends' | 'meals' | 'notes' | 'appointments'>('overview');
  const [isLoading, setIsLoading] = useState(false);

  // Sample client data
  const clientDetail: ClientDetail = useMemo(() => ({
    id: parseInt(clientId as string) || 1,
    name: 'Ayşe Yılmaz',
    email: 'ayse@example.com',
    phone: '+90 555 123 4567',
    joinDate: '2024-01-15',
    adherenceRate: 85,
    healthStatus: 'good',
    avgSteps: 8234,
    avgHeartRate: 72,
    avgSleep: 7.5,
    avgCalories: 2100,
  }), [clientId]);

  // Sample health trends
  const healthTrends: HealthTrend[] = useMemo(() => [
    { date: '2026-04-26', steps: 7800, heartRate: 71, sleep: 7.2, calories: 2050 },
    { date: '2026-04-27', steps: 8500, heartRate: 73, sleep: 7.8, calories: 2150 },
    { date: '2026-04-28', steps: 8100, heartRate: 72, sleep: 7.4, calories: 2100 },
    { date: '2026-04-29', steps: 8900, heartRate: 70, sleep: 7.6, calories: 2200 },
    { date: '2026-04-30', steps: 7900, heartRate: 74, sleep: 7.3, calories: 2050 },
    { date: '2026-05-01', steps: 8400, heartRate: 71, sleep: 7.7, calories: 2120 },
    { date: '2026-05-02', steps: 8234, heartRate: 72, sleep: 7.5, calories: 2100 },
  ], []);

  // Sample meals
  const meals: Meal[] = useMemo(() => [
    {
      id: 1,
      date: '2026-05-02',
      type: 'Kahvaltı',
      foods: 'Yumurta, Ekmek, Tereyağ',
      calories: 387,
      adherence: true,
    },
    {
      id: 2,
      date: '2026-05-02',
      type: 'Öğle Yemeği',
      foods: 'Tavuk Göğsü, Pirinç, Brokoli',
      calories: 394,
      adherence: true,
    },
    {
      id: 3,
      date: '2026-05-01',
      type: 'Akşam Yemeği',
      foods: 'Balık, Tatlı Patates, Salata',
      calories: 324,
      adherence: true,
    },
    {
      id: 4,
      date: '2026-05-01',
      type: 'Kahvaltı',
      foods: 'Muesli, Süt, Meyve',
      calories: 350,
      adherence: true,
    },
  ], []);

  // Sample notes
  const notes: Note[] = useMemo(() => [
    {
      id: 1,
      date: '2026-05-01',
      author: 'Dr. Mehmet Kaya',
      content: 'Ayşe, bu hafta harika ilerleyiş gösterdin. Protein alımını artırmaya devam et.',
    },
    {
      id: 2,
      date: '2026-04-28',
      author: 'Dr. Mehmet Kaya',
      content: 'Uyku saatlerini düzenli tutman çok iyi. Gece 11de yatmaya devam et.',
    },
  ], []);

  // Sample appointments
  const appointments: Appointment[] = useMemo(() => [
    {
      id: 1,
      date: '2026-05-10',
      time: '14:00',
      status: 'upcoming',
    },
    {
      id: 2,
      date: '2026-05-03',
      time: '10:00',
      status: 'upcoming',
    },
    {
      id: 3,
      date: '2026-04-26',
      time: '15:00',
      status: 'completed',
    },
  ], []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return '#22C55E';
      case 'warning':
        return '#F59E0B';
      case 'critical':
        return '#EF4444';
      default:
        return colors.muted;
    }
  };

  const renderMealCard = ({ item }: { item: Meal }) => (
    <View className="bg-surface rounded-lg p-3 mb-2 border border-border">
      <View className="flex-row justify-between items-start mb-2">
        <View>
          <Text className="text-sm font-semibold text-foreground">{item.type}</Text>
          <Text className="text-xs text-muted">{item.date}</Text>
        </View>
        <View className="bg-primary/10 px-2 py-1 rounded">
          <Text className="text-xs font-bold text-primary">{item.calories} kcal</Text>
        </View>
      </View>
      <Text className="text-xs text-muted">{item.foods}</Text>
      {item.adherence && (
        <View className="mt-2 flex-row items-center gap-1">
          <Text className="text-xs text-success">✓ Uyum sağlandı</Text>
        </View>
      )}
    </View>
  );

  const renderNoteCard = ({ item }: { item: Note }) => (
    <View className="bg-surface rounded-lg p-3 mb-2 border border-border">
      <View className="flex-row justify-between items-start mb-2">
        <View>
          <Text className="text-xs font-semibold text-primary">{item.author}</Text>
          <Text className="text-xs text-muted">{item.date}</Text>
        </View>
      </View>
      <Text className="text-sm text-foreground leading-5">{item.content}</Text>
    </View>
  );

  const renderAppointmentCard = ({ item }: { item: Appointment }) => (
    <View className="bg-surface rounded-lg p-3 mb-2 border border-border">
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-sm font-semibold text-foreground">{item.date}</Text>
          <Text className="text-xs text-muted">{item.time}</Text>
        </View>
        <View
          className="px-3 py-1 rounded-full"
          style={{
            backgroundColor:
              item.status === 'completed'
                ? '#22C55E20'
                : item.status === 'upcoming'
                  ? '#3B82F620'
                  : '#EF444420',
          }}
        >
          <Text
            className="text-xs font-semibold"
            style={{
              color:
                item.status === 'completed'
                  ? '#22C55E'
                  : item.status === 'upcoming'
                    ? '#3B82F6'
                    : '#EF4444',
            }}
          >
            {item.status === 'completed' ? '✓ Tamamlandı' : item.status === 'upcoming' ? 'Yaklaşan' : 'İptal'}
          </Text>
        </View>
      </View>
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
          <Text className="text-3xl font-bold text-foreground">{clientDetail.name}</Text>
          <Text className="text-sm text-muted">{clientDetail.email}</Text>
        </View>

        {/* Quick Stats */}
        <View className="flex-row gap-2">
          <View className="flex-1 bg-surface rounded-lg p-3 border border-border">
            <Text className="text-xs text-muted mb-1">Uyum Oranı</Text>
            <Text className="text-2xl font-bold text-primary">{clientDetail.adherenceRate}%</Text>
          </View>

          <View className="flex-1 bg-surface rounded-lg p-3 border border-border">
            <Text className="text-xs text-muted mb-1">Durum</Text>
            <View
              className="px-2 py-1 rounded"
              style={{ backgroundColor: getStatusColor(clientDetail.healthStatus) + '20' }}
            >
              <Text
                className="text-xs font-bold"
                style={{ color: getStatusColor(clientDetail.healthStatus) }}
              >
                {clientDetail.healthStatus === 'good'
                  ? '✓ İyi'
                  : clientDetail.healthStatus === 'warning'
                    ? '⚠️ Uyarı'
                    : '🔴 Kritik'}
              </Text>
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View className="flex-row gap-1 flex-wrap">
          {(
            [
              'overview',
              'trends',
              'meals',
              'notes',
              'appointments',
            ] as const
          ).map((tab) => (
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
                {tab === 'overview' && 'Özet'}
                {tab === 'trends' && 'Trendler'}
                {tab === 'meals' && 'Öğünler'}
                {tab === 'notes' && 'Notlar'}
                {tab === 'appointments' && 'Randevular'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <View className="gap-3">
            <View className="bg-surface rounded-lg p-4 border border-border">
              <Text className="text-sm font-semibold text-foreground mb-3">Kişisel Bilgiler</Text>
              <View className="gap-2">
                <View className="flex-row justify-between">
                  <Text className="text-xs text-muted">Telefon</Text>
                  <Text className="text-xs font-semibold text-foreground">{clientDetail.phone}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-muted">Katılım Tarihi</Text>
                  <Text className="text-xs font-semibold text-foreground">{clientDetail.joinDate}</Text>
                </View>
              </View>
            </View>

            <View className="bg-surface rounded-lg p-4 border border-border">
              <Text className="text-sm font-semibold text-foreground mb-3">Ortalama Metrikler</Text>
              <View className="gap-2">
                <View className="flex-row justify-between">
                  <Text className="text-xs text-muted">👣 Günlük Adımlar</Text>
                  <Text className="text-xs font-semibold text-foreground">{clientDetail.avgSteps}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-muted">❤️ Kalp Atış Hızı</Text>
                  <Text className="text-xs font-semibold text-foreground">{clientDetail.avgHeartRate} bpm</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-muted">😴 Uyku Süresi</Text>
                  <Text className="text-xs font-semibold text-foreground">{clientDetail.avgSleep}h</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-muted">🍽️ Günlük Kalori</Text>
                  <Text className="text-xs font-semibold text-foreground">{clientDetail.avgCalories} kcal</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Trends Tab */}
        {selectedTab === 'trends' && (
          <View className="gap-3">
            <View className="bg-surface rounded-lg p-4 border border-border">
              <Text className="text-sm font-semibold text-foreground mb-3">Haftalık Trendler</Text>
              {healthTrends.map((trend, index) => (
                <View key={index} className="pb-2 mb-2 border-b border-border last:border-b-0">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-xs font-semibold text-foreground">{trend.date}</Text>
                  </View>
                  <View className="flex-row gap-2 text-xs">
                    <Text className="text-muted">👣 {trend.steps}</Text>
                    <Text className="text-muted">❤️ {trend.heartRate}</Text>
                    <Text className="text-muted">😴 {trend.sleep}h</Text>
                    <Text className="text-muted">🍽️ {trend.calories}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Meals Tab */}
        {selectedTab === 'meals' && (
          <View className="gap-2">
            <FlatList
              data={meals}
              renderItem={renderMealCard}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Notes Tab */}
        {selectedTab === 'notes' && (
          <View className="gap-2">
            <FlatList
              data={notes}
              renderItem={renderNoteCard}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
            <Pressable
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                },
              ]}
            >
              <Text className="text-white font-semibold">+ Not Ekle</Text>
            </Pressable>
          </View>
        )}

        {/* Appointments Tab */}
        {selectedTab === 'appointments' && (
          <View className="gap-2">
            <FlatList
              data={appointments}
              renderItem={renderAppointmentCard}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
            <Pressable
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                },
              ]}
            >
              <Text className="text-white font-semibold">+ Randevu Oluştur</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
