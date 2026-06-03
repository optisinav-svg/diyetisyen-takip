import { ScrollView, Text, View, Pressable, Dimensions } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useState } from 'react';
import { useColors } from '@/hooks/use-colors';
import Svg, { Line, Circle, Text as SvgText, Rect, Path } from 'react-native-svg';

interface HealthData {
  date: string;
  steps: number;
  heartRate: number;
  calories: number;
  sleep: number;
}

// Sample health data for the last 7 days
const SAMPLE_DATA: HealthData[] = [
  { date: 'Pzt', steps: 8234, heartRate: 72, calories: 450, sleep: 7.5 },
  { date: 'Sal', steps: 10521, heartRate: 68, calories: 580, sleep: 8.0 },
  { date: 'Çar', steps: 6234, heartRate: 75, calories: 320, sleep: 6.5 },
  { date: 'Per', steps: 12043, heartRate: 70, calories: 720, sleep: 7.8 },
  { date: 'Cum', steps: 9876, heartRate: 73, calories: 510, sleep: 7.2 },
  { date: 'Cmt', steps: 15234, heartRate: 65, calories: 890, sleep: 8.5 },
  { date: 'Paz', steps: 11234, heartRate: 69, calories: 650, sleep: 8.0 },
];

// Simple bar chart component
function BarChart({ data, metric, maxValue, color }: { 
  data: HealthData[]; 
  metric: keyof HealthData; 
  maxValue: number;
  color: string;
}) {
  const width = Dimensions.get('window').width - 32;
  const height = 200;
  const barWidth = width / (data.length * 1.5);
  const padding = 20;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* Y-axis */}
      <Line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#ccc" strokeWidth="1" />
      
      {/* X-axis */}
      <Line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#ccc" strokeWidth="1" />

      {/* Bars */}
      {data.map((item, index) => {
        const value = typeof item[metric] === 'number' ? item[metric] : 0;
        const barHeight = ((value / maxValue) * (height - 2 * padding));
        const x = padding + (index * (width - 2 * padding) / data.length) + barWidth / 4;
        const y = height - padding - barHeight;

        return (
          <View key={index}>
            <Rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={color}
              rx={4}
            />
            <SvgText
              x={x + barWidth / 2}
              y={height - padding + 15}
              fontSize="10"
              fill="#666"
              textAnchor="middle"
            >
              {item.date}
            </SvgText>
          </View>
        );
      })}
    </Svg>
  );
}

// Simple line chart component
function LineChart({ data, metric, maxValue, color }: {
  data: HealthData[];
  metric: keyof HealthData;
  maxValue: number;
  color: string;
}) {
  const width = Dimensions.get('window').width - 32;
  const height = 200;
  const padding = 20;
  const pointSpacing = (width - 2 * padding) / (data.length - 1);

  // Calculate points
  const points = data.map((item, index) => {
    const value = typeof item[metric] === 'number' ? item[metric] : 0;
    const x = padding + index * pointSpacing;
    const y = height - padding - ((value / maxValue) * (height - 2 * padding));
    return { x, y, value };
  });

  // Create path string
  const pathString = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* Y-axis */}
      <Line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#ccc" strokeWidth="1" />
      
      {/* X-axis */}
      <Line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#ccc" strokeWidth="1" />

      {/* Line */}
      <Path d={pathString} stroke={color} strokeWidth="2" fill="none" />

      {/* Points */}
      {points.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
      ))}

      {/* Date labels */}
      {data.map((item, i) => (
        <SvgText
          key={i}
          x={points[i].x}
          y={height - padding + 15}
          fontSize="10"
          fill="#666"
          textAnchor="middle"
        >
          {item.date}
        </SvgText>
      ))}
    </Svg>
  );
}

export default function HealthAnalyticsScreen() {
  const colors = useColors();
  const [selectedMetric, setSelectedMetric] = useState<'steps' | 'heartRate' | 'calories' | 'sleep'>('steps');

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'steps':
        return 'Adımlar';
      case 'heartRate':
        return 'Kalp Hızı';
      case 'calories':
        return 'Kalori';
      case 'sleep':
        return 'Uyku';
    }
  };

  const getMetricUnit = () => {
    switch (selectedMetric) {
      case 'steps':
        return 'adım';
      case 'heartRate':
        return 'bpm';
      case 'calories':
        return 'kcal';
      case 'sleep':
        return 'saat';
    }
  };

  const getMaxValue = () => {
    switch (selectedMetric) {
      case 'steps':
        return 16000;
      case 'heartRate':
        return 100;
      case 'calories':
        return 1000;
      case 'sleep':
        return 10;
    }
  };

  const getChartColor = () => {
    switch (selectedMetric) {
      case 'steps':
        return colors.primary;
      case 'heartRate':
        return '#ef4444';
      case 'calories':
        return '#f59e0b';
      case 'sleep':
        return '#8b5cf6';
    }
  };

  const getAverageValue = () => {
    const values = SAMPLE_DATA.map(d => typeof d[selectedMetric] === 'number' ? d[selectedMetric] : 0);
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  };

  const getMaxValueInData = () => {
    const values = SAMPLE_DATA.map(d => typeof d[selectedMetric] === 'number' ? d[selectedMetric] : 0);
    return Math.max(...values);
  };

  const getMinValueInData = () => {
    const values = SAMPLE_DATA.map(d => typeof d[selectedMetric] === 'number' ? d[selectedMetric] : 0);
    return Math.min(...values);
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
        {/* Header */}
        <View className="gap-2">
          <Text className="text-3xl font-bold text-foreground">Sağlık Analitikleri</Text>
          <Text className="text-sm leading-6 text-muted">Wearable cihazlarından gelen verileriniz</Text>
        </View>

        {/* Metric Selector */}
        <View className="gap-3">
          <Text className="text-sm font-semibold text-foreground">Metrik Seçin</Text>
          <View className="flex-row gap-2 flex-wrap">
            {(['steps', 'heartRate', 'calories', 'sleep'] as const).map((metric) => (
              <Pressable
                key={metric}
                onPress={() => setSelectedMetric(metric)}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.7 : 1,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: selectedMetric === metric ? colors.primary : colors.surface,
                  },
                ]}
              >
                <Text
                  className={selectedMetric === metric ? 'text-white font-semibold text-sm' : 'text-foreground font-semibold text-sm'}
                >
                  {metric === 'steps' && '👣 Adımlar'}
                  {metric === 'heartRate' && '❤️ Kalp'}
                  {metric === 'calories' && '🔥 Kalori'}
                  {metric === 'sleep' && '😴 Uyku'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Chart Card */}
        <View className="bg-surface rounded-lg p-4">
          <View className="gap-4">
            <View>
              <Text className="text-lg font-semibold text-foreground">{getMetricLabel()}</Text>
              <Text className="text-xs text-muted mt-1">Son 7 günün verileri</Text>
            </View>

            {/* Chart */}
            <View className="items-center">
              {selectedMetric === 'heartRate' || selectedMetric === 'sleep' ? (
                <LineChart
                  data={SAMPLE_DATA}
                  metric={selectedMetric}
                  maxValue={getMaxValue()}
                  color={getChartColor()}
                />
              ) : (
                <BarChart
                  data={SAMPLE_DATA}
                  metric={selectedMetric}
                  maxValue={getMaxValue()}
                  color={getChartColor()}
                />
              )}
            </View>
          </View>
        </View>

        {/* Statistics */}
        <View className="gap-3">
          <Text className="text-sm font-semibold text-foreground">İstatistikler</Text>
          <View className="flex-row gap-3">
            {/* Average */}
            <View className="flex-1 bg-surface rounded-lg p-4">
              <Text className="text-xs text-muted mb-1">Ortalama</Text>
              <Text className="text-2xl font-bold text-foreground">
                {getAverageValue()}
              </Text>
              <Text className="text-xs text-muted mt-1">{getMetricUnit()}</Text>
            </View>

            {/* Max */}
            <View className="flex-1 bg-surface rounded-lg p-4">
              <Text className="text-xs text-muted mb-1">Maksimum</Text>
              <Text className="text-2xl font-bold text-foreground">
                {getMaxValueInData()}
              </Text>
              <Text className="text-xs text-muted mt-1">{getMetricUnit()}</Text>
            </View>

            {/* Min */}
            <View className="flex-1 bg-surface rounded-lg p-4">
              <Text className="text-xs text-muted mb-1">Minimum</Text>
              <Text className="text-2xl font-bold text-foreground">
                {getMinValueInData()}
              </Text>
              <Text className="text-xs text-muted mt-1">{getMetricUnit()}</Text>
            </View>
          </View>
        </View>

        {/* Weekly Summary */}
        <View className="bg-surface rounded-lg p-4 gap-3">
          <Text className="text-sm font-semibold text-foreground">Haftalık Özet</Text>
          {SAMPLE_DATA.map((item, index) => (
            <View key={index} className="flex-row items-center justify-between pb-3 border-b border-border last:border-b-0">
              <Text className="text-sm font-medium text-foreground">{item.date}</Text>
              <View className="flex-row items-center gap-4">
                <View className="flex-row items-center gap-1">
                  <Text className="text-xs text-muted">👣</Text>
                  <Text className="text-sm text-foreground font-semibold">{item.steps}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Text className="text-xs text-muted">❤️</Text>
                  <Text className="text-sm text-foreground font-semibold">{item.heartRate}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Text className="text-xs text-muted">😴</Text>
                  <Text className="text-sm text-foreground font-semibold">{item.sleep}h</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Info Card */}
        <View className="bg-primary/10 rounded-lg p-4 border border-primary gap-2">
          <Text className="text-xs font-semibold text-primary uppercase">💡 İpucu</Text>
          <Text className="text-xs leading-5 text-primary">
            Sağlık verileriniz Apple Health veya Google Fit ile senkronize edilir. Daha doğru veriler için wearable cihazınızı bağlayın.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
