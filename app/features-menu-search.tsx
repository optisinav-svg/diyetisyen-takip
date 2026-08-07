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
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: colors.foreground, flex: 1 }}>🔍 Özellik Ara</Text>
          <TouchableOpacity onPress={() => router.back()}
            style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.foreground, fontWeight: "600" }}>← Geri</Text>
          </TouchableOpacity>
        </View>

        {/* Arama */}
        <TextInput
          placeholder="Özellik ara... (örn: su, randevu, beslenme)"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.muted}
          style={{
            borderWidth: 1, borderColor: colors.border, borderRadius: 10,
            padding: 14, color: colors.foreground, backgroundColor: colors.surface, fontSize: 15,
          }}
        />

        {/* Kategoriler */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity onPress={() => setSelectedCategory("")}
              style={{
                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                backgroundColor: selectedCategory === "" ? colors.primary : colors.surface,
                borderWidth: 1, borderColor: selectedCategory === "" ? colors.primary : colors.border,
              }}>
              <Text style={{ color: selectedCategory === "" ? "#fff" : colors.foreground, fontWeight: "600", fontSize: 13 }}>Tümü</Text>
            </TouchableOpacity>
            {categories.map(cat => (
              <TouchableOpacity key={cat} onPress={() => setSelectedCategory(cat === selectedCategory ? "" : cat)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                  backgroundColor: selectedCategory === cat ? colors.primary : colors.surface,
                  borderWidth: 1, borderColor: selectedCategory === cat ? colors.primary : colors.border,
                }}>
                <Text style={{ color: selectedCategory === cat ? "#fff" : colors.foreground, fontWeight: "600", fontSize: 13 }}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Text style={{ color: colors.muted, fontSize: 13 }}>{filteredFeatures.length} özellik bulundu</Text>

        {filteredFeatures.map(feature => (
          <TouchableOpacity key={feature.id}
            onPress={() => router.push(feature.route as any)}
            style={{
              backgroundColor: colors.surface, borderRadius: 12, padding: 14,
              borderWidth: 1, borderColor: colors.border,
              flexDirection: "row", alignItems: "center", gap: 12,
            }}>
            <Text style={{ fontSize: 28 }}>{feature.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: colors.foreground }}>{feature.title}</Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>{feature.description}</Text>
              <Text style={{ fontSize: 11, color: colors.primary, marginTop: 2 }}>{feature.category}</Text>
            </View>
            <Text style={{ color: colors.primary }}>→</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}
