import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { NavigationHeader } from "@/components/navigation-header";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface Tab {
  id: "search" | "add";
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { id: "search", label: "Diyetisyen Bul", icon: "search" },
  { id: "add", label: "Danışan Ekle", icon: "person-add" },
];

/**
 * Connection Matching Screen
 * Two-way matching system:
 * 1. Client searches for dietitian
 * 2. Dietitian adds/invites client
 */
export default function ConnectionMatchingScreen() {
  const router = useRouter();
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<"search" | "add">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [clientIdentifier, setClientIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert("Hata", "Lütfen arama kriterini girin");
      return;
    }
    setIsLoading(true);
    // Mock: Simulate search
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert("Başarı", "Diyetisyen arama başlatıldı");
    }, 1000);
  };

  const handleAddClient = async () => {
    if (!clientIdentifier.trim()) {
      Alert.alert("Hata", "Lütfen telefon numarası veya email girin");
      return;
    }
    setIsLoading(true);
    // Mock: Simulate add
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert("Başarı", "Danışan ekleme işlemi başlatıldı");
      setClientIdentifier("");
    }, 1000);
  };

  return (
    <ScreenContainer className="flex-1 bg-background">
      {/* Navigation Header with Back and Home buttons */}
      <NavigationHeader
        title="Bağlantı Eşleştirmesi"
        showBackButton={true}
        showHomeButton={true}
      />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 p-6 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">
              Bağlantı Eşleştirmesi
            </Text>
            <Text className="text-sm text-muted">
              Diyetisyen bul veya danışan ekle
            </Text>
          </View>

          {/* Tab Navigation */}
          <View className="flex-row gap-3 bg-surface rounded-lg p-1">
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                className={`flex-1 flex-row items-center justify-center gap-2 py-3 px-4 rounded-md transition-all`}
                style={{
                  backgroundColor: activeTab === tab.id ? colors.primary : "transparent",
                }}
              >
                <MaterialIcons
                  name={tab.icon as any}
                  size={20}
                  color={activeTab === tab.id ? "#fff" : colors.muted}
                />
                <Text
                  className="font-semibold text-sm"
                  style={{
                    color: activeTab === tab.id ? "#fff" : colors.muted,
                  }}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Content */}
          {activeTab === "search" ? (
            <SearchDietitianTab
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isLoading={isLoading}
              onSearch={handleSearch}
              colors={colors}
            />
          ) : (
            <AddClientTab
              clientIdentifier={clientIdentifier}
              setClientIdentifier={setClientIdentifier}
              isLoading={isLoading}
              onAdd={handleAddClient}
              colors={colors}
            />
          )}

          {/* Info Section */}
          <View
            className="p-4 rounded-lg gap-2"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="font-semibold text-foreground">
              💡 Nasıl Çalışır?
            </Text>
            <Text className="text-sm text-muted leading-relaxed">
              {activeTab === "search"
                ? "Hedeflerinize ve tercihlerinize göre uygun diyetisyenleri bulun. Uyum puanı 0-100 arasında gösterilir."
                : "Danışan telefon numarası veya email ile ekleyin. Mevcut danışanlar davet edilir, yeni danışanlar kaydolur."}
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

/**
 * Scenario 1: Client searches for dietitian
 */
function SearchDietitianTab({
  searchQuery,
  setSearchQuery,
  isLoading,
  onSearch,
  colors,
}: any) {
  return (
    <View className="gap-4">
      {/* Search Input */}
      <View className="gap-2">
        <Text className="text-sm font-semibold text-foreground">
          Hedef Seçin
        </Text>
        <View
          className="flex-row items-center gap-3 px-4 py-3 rounded-lg border"
          style={{
            borderColor: colors.border,
            backgroundColor: colors.surface,
          }}
        >
          <MaterialIcons name="search" size={20} color={colors.muted} />
          <TextInput
            placeholder="Kilo kaybı, kas geliştirme, diyabet..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-foreground"
            editable={!isLoading}
          />
        </View>
      </View>

      {/* Filter Options */}
      <View className="gap-3">
        <Text className="text-sm font-semibold text-foreground">
          Tercihler
        </Text>
        <View className="gap-2">
          {[
            { label: "Diyet Tipi", icon: "restaurant" },
            { label: "Bütçe", icon: "attach-money" },
            { label: "İletişim Şekli", icon: "chat" },
          ].map((option) => (
            <TouchableOpacity
              key={option.label}
              className="flex-row items-center justify-between p-3 rounded-lg"
              style={{ backgroundColor: colors.surface }}
            >
              <View className="flex-row items-center gap-2">
                <MaterialIcons name={option.icon as any} size={20} color={colors.primary} />
                <Text className="text-foreground font-medium">{option.label}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Search Button */}
      <TouchableOpacity
        onPress={onSearch}
        disabled={isLoading}
        className="py-3 px-4 rounded-lg items-center justify-center"
        style={{ backgroundColor: colors.primary, opacity: isLoading ? 0.6 : 1 }}
      >
        <Text className="text-white font-semibold text-base">
          {isLoading ? "Aranıyor..." : "Diyetisyen Ara"}
        </Text>
      </TouchableOpacity>

      {/* Results Preview */}
      <View className="gap-3">
        <Text className="text-sm font-semibold text-foreground">
          Önerilen Diyetisyenler
        </Text>
        {[1, 2, 3].map((i) => (
          <DietitianCard key={i} index={i} colors={colors} />
        ))}
      </View>
    </View>
  );
}

/**
 * Scenario 2: Dietitian adds client
 */
function AddClientTab({
  clientIdentifier,
  setClientIdentifier,
  isLoading,
  onAdd,
  colors,
}: any) {
  return (
    <View className="gap-4">
      {/* Input */}
      <View className="gap-2">
        <Text className="text-sm font-semibold text-foreground">
          Danışan Bilgisi
        </Text>
        <View
          className="flex-row items-center gap-3 px-4 py-3 rounded-lg border"
          style={{
            borderColor: colors.border,
            backgroundColor: colors.surface,
          }}
        >
          <MaterialIcons name="person" size={20} color={colors.muted} />
          <TextInput
            placeholder="Telefon numarası veya email"
            placeholderTextColor={colors.muted}
            value={clientIdentifier}
            onChangeText={setClientIdentifier}
            className="flex-1 text-foreground"
            editable={!isLoading}
            keyboardType="email-address"
          />
        </View>
      </View>

      {/* Info */}
      <View
        className="p-3 rounded-lg flex-row gap-2"
        style={{ backgroundColor: colors.surface }}
      >
        <MaterialIcons name="info" size={20} color={colors.primary} />
        <Text className="flex-1 text-xs text-muted">
          Mevcut danışan bulunursa davet gönderilir. Yeni danışan ise kayıt linki oluşturulur.
        </Text>
      </View>

      {/* Add Button */}
      <TouchableOpacity
        onPress={onAdd}
        disabled={isLoading}
        className="py-3 px-4 rounded-lg items-center justify-center"
        style={{ backgroundColor: colors.primary, opacity: isLoading ? 0.6 : 1 }}
      >
        <Text className="text-white font-semibold text-base">
          {isLoading ? "İşleniyor..." : "Danışan Ekle"}
        </Text>
      </TouchableOpacity>

      {/* Recent Clients */}
      <View className="gap-3">
        <Text className="text-sm font-semibold text-foreground">
          Son Eklenen Danışanlar
        </Text>
        {[1, 2].map((i) => (
          <View
            key={i}
            className="flex-row items-center justify-between p-3 rounded-lg"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="flex-row items-center gap-3">
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.primary }}
              >
                <MaterialIcons name="person" size={20} color="#fff" />
              </View>
              <View>
                <Text className="font-semibold text-foreground">
                  Danışan {i}
                </Text>
                <Text className="text-xs text-muted">
                  Bekleme durumu
                </Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * Dietitian Card Component
 */
function DietitianCard({ index, colors }: any) {
  return (
    <View
      className="p-4 rounded-lg gap-2"
      style={{ backgroundColor: colors.surface }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.primary }}
          >
            <MaterialIcons name="person" size={24} color="#fff" />
          </View>
          <View>
            <Text className="font-semibold text-foreground">
              Dr. Diyetisyen {index}
            </Text>
            <Text className="text-xs text-muted">⭐ 4.8/5 (250 müşteri)</Text>
          </View>
        </View>
        <View className="items-center">
          <Text
            className="font-bold text-lg"
            style={{ color: colors.primary }}
          >
            {90 - index * 5}%
          </Text>
          <Text className="text-xs text-muted">Uyum</Text>
        </View>
      </View>
      <TouchableOpacity
        className="py-2 px-3 rounded-lg items-center"
        style={{ backgroundColor: colors.primary }}
      >
        <Text className="text-white font-semibold text-sm">
          İletişime Geç
        </Text>
      </TouchableOpacity>
    </View>
  );
}
