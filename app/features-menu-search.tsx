import { ScrollView, Text, View, TouchableOpacity, TextInput } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { searchAndFilter, getCategories, ALL_FEATURES } from "@/lib/_core/feature-search";

export default function FeaturesMenuSearchScreen() {
  const router = useRouter();
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const categories = getCategories();
  const filteredFeatures = searchAndFilter(searchQuery, selectedCategory);



  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-3xl font-bold text-foreground">🔍 Özellikler</Text>
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

          {/* Search Bar */}
          <View
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              paddingHorizontal: 12,
              backgroundColor: colors.surface,
            }}
          >
            <TextInput
              placeholder="🔍 Özellik ara..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.muted}
              style={{
                paddingVertical: 10,
                color: colors.foreground,
              }}
            />
          </View>

          {/* Category Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
            <TouchableOpacity
              onPress={() => setSelectedCategory("")}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 20,
                backgroundColor: selectedCategory === "" ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: selectedCategory === "" ? colors.primary : colors.border,
              }}
            >
              <Text
                style={{
                  color: selectedCategory === "" ? "#fff" : colors.foreground,
                  fontWeight: "600",
                  fontSize: 12,
                }}
              >
                Tümü
              </Text>
            </TouchableOpacity>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 20,
                  backgroundColor: selectedCategory === category ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: selectedCategory === category ? colors.primary : colors.border,
                }}
              >
                <Text
                  style={{
                    color: selectedCategory === category ? "#fff" : colors.foreground,
                    fontWeight: "600",
                    fontSize: 12,
                  }}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Results Count */}
          <Text style={{ fontSize: 12, color: colors.muted }}>
            {filteredFeatures.length} özellik bulundu
          </Text>

          {/* Features List */}
          <View className="gap-3">
            {filteredFeatures.length > 0 ? (
              filteredFeatures.map((feature) => (
                <TouchableOpacity
                  key={feature.id}
                  onPress={() => router.push("/features/authentication")}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <View className="gap-1">
                    <View className="flex-row items-center gap-2">
                      <Text style={{ fontSize: 20 }}>{feature.icon}</Text>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, flex: 1 }}>
                        {feature.title}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 12, color: colors.muted, marginLeft: 26 }}>
                      {feature.description}
                    </Text>
                    <View
                      style={{
                        backgroundColor: colors.primary,
                        paddingVertical: 4,
                        paddingHorizontal: 8,
                        borderRadius: 4,
                        alignSelf: "flex-start",
                        marginTop: 6,
                      }}
                    >
                      <Text style={{ fontSize: 10, color: "#fff", fontWeight: "600" }}>
                        {feature.category}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={{ alignItems: "center", paddingVertical: 40 }}>
                <Text style={{ fontSize: 16, color: colors.muted, textAlign: "center" }}>
                  Aradığınız özellik bulunamadı
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
