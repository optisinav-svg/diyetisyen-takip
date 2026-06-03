import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useEffect, useState } from "react";
import { getUserRegistration } from "@/lib/_core/user-registration";
import {
  addHealthDataEntry,
  getClientHealthData,
  getHealthDataByType,
  calculateHealthTrend,
  type HealthDataEntry,
} from "@/lib/_core/health-data-entry";

export default function HealthDataEntryScreen() {
  const router = useRouter();
  const colors = useColors();

  const [user, setUser] = useState<any>(null);
  const [mode, setMode] = useState<"view" | "add">("view");
  const [selectedClient, setSelectedClient] = useState<string>("client@test.com");
  const [healthData, setHealthData] = useState<HealthDataEntry[]>([]);

  // Form state
  const [dataType, setDataType] = useState<HealthDataEntry["dataType"]>("weight");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("kg");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const dataTypes = [
    { id: "weight", label: "Kilo", unit: "kg" },
    { id: "bloodPressure", label: "Kan Basıncı", unit: "mmHg" },
    { id: "bloodSugar", label: "Kan Şekeri", unit: "mg/dL" },
    { id: "cholesterol", label: "Kolesterol", unit: "mg/dL" },
    { id: "bmi", label: "BMI", unit: "kg/m²" },
  ];

  const clients = [
    { id: "client@test.com", name: "Ahmet Yılmaz" },
    { id: "demo@test.com", name: "Fatma Demir" },
  ];

  useEffect(() => {
    loadData();
  }, [selectedClient]);

  const loadData = async () => {
    try {
      const userData = await getUserRegistration();
      setUser(userData);

      if (userData?.role === "dietitian") {
        const data = await getClientHealthData(selectedClient);
        setHealthData(data);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const handleAddHealthData = async () => {
    if (!value) {
      Alert.alert("Hata", "Lütfen bir değer girin");
      return;
    }

    try {
      await addHealthDataEntry(
        selectedClient,
        user.email,
        user.name,
        dataType as HealthDataEntry["dataType"],
        value,
        unit,
        date,
        notes
      );

      Alert.alert("Başarılı", "Sağlık verisi eklendi");
      setValue("");
      setNotes("");
      setMode("view");
      loadData();
    } catch (error) {
      Alert.alert("Hata", "Sağlık verisi eklenemedi");
    }
  };

  const getDataTypeLabel = (type: string) => {
    const found = dataTypes.find((dt) => dt.id === type);
    return found?.label || type;
  };

  const getDataTypeIcon = (type: string) => {
    switch (type) {
      case "weight":
        return "⚖️";
      case "bloodPressure":
        return "❤️";
      case "bloodSugar":
        return "🩸";
      case "cholesterol":
        return "🧪";
      case "bmi":
        return "📏";
      default:
        return "📊";
    }
  };

  if (!user || user.role !== "dietitian") {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <Text style={{ color: colors.foreground }}>Erişim reddedildi</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (mode === "add") {
    return (
      <ScreenContainer className="p-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="gap-4">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-2xl font-bold text-foreground">➕ Sağlık Verisi Ekle</Text>
              <TouchableOpacity
                onPress={() => setMode("view")}
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

            {/* Client Selection */}
            <View className="gap-2">
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                Danışan Seçin
              </Text>
              <View className="gap-2">
                {clients.map((client) => (
                  <TouchableOpacity
                    key={client.id}
                    onPress={() => setSelectedClient(client.id)}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      backgroundColor:
                        selectedClient === client.id ? colors.primary : colors.surface,
                      borderWidth: 1,
                      borderColor:
                        selectedClient === client.id ? colors.primary : colors.border,
                    }}
                  >
                    <Text
                      style={{
                        color: selectedClient === client.id ? "#fff" : colors.foreground,
                        fontWeight: "600",
                      }}
                    >
                      {client.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Data Type Selection */}
            <View className="gap-2">
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                Veri Türü
              </Text>
              <View className="gap-2">
                {dataTypes.map((dt) => (
                  <TouchableOpacity
                    key={dt.id}
                    onPress={() => {
                      setDataType(dt.id as HealthDataEntry["dataType"]);
                      setUnit(dt.unit);
                    }}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      backgroundColor:
                        dataType === dt.id ? colors.primary : colors.surface,
                      borderWidth: 1,
                      borderColor: dataType === dt.id ? colors.primary : colors.border,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>{getDataTypeIcon(dt.id)}</Text>
                    <Text
                      style={{
                        color: dataType === dt.id ? "#fff" : colors.foreground,
                        fontWeight: "600",
                        flex: 1,
                      }}
                    >
                      {dt.label}
                    </Text>
                    <Text
                      style={{
                        color: dataType === dt.id ? "#fff" : colors.muted,
                        fontSize: 10,
                      }}
                    >
                      ({dt.unit})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Value Input */}
            <View className="gap-2">
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                Değer ({unit})
              </Text>
              <TextInput
                placeholder="Değeri girin"
                value={value}
                onChangeText={setValue}
                keyboardType="decimal-pad"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  color: colors.foreground,
                  fontSize: 14,
                }}
                placeholderTextColor={colors.muted}
              />
            </View>

            {/* Date Input */}
            <View className="gap-2">
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                Tarih
              </Text>
              <TextInput
                placeholder="YYYY-MM-DD"
                value={date}
                onChangeText={setDate}
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  color: colors.foreground,
                  fontSize: 14,
                }}
                placeholderTextColor={colors.muted}
              />
            </View>

            {/* Notes Input */}
            <View className="gap-2">
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                Notlar (Opsiyonel)
              </Text>
              <TextInput
                placeholder="Notları girin"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  color: colors.foreground,
                  fontSize: 14,
                  textAlignVertical: "top",
                }}
                placeholderTextColor={colors.muted}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleAddHealthData}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: colors.primary,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600", textAlign: "center" }}>
                ✓ Kaydet
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-3xl font-bold text-foreground">💊 Sağlık Verileri</Text>
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

          {/* Client Selection */}
          <View className="gap-2">
            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
              Danışan Seçin
            </Text>
            <View className="gap-2">
              {clients.map((client) => (
                <TouchableOpacity
                  key={client.id}
                  onPress={() => setSelectedClient(client.id)}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    backgroundColor:
                      selectedClient === client.id ? colors.primary : colors.surface,
                    borderWidth: 1,
                    borderColor:
                      selectedClient === client.id ? colors.primary : colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: selectedClient === client.id ? "#fff" : colors.foreground,
                      fontWeight: "600",
                    }}
                  >
                    {client.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Add Button */}
          <TouchableOpacity
            onPress={() => setMode("add")}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              backgroundColor: colors.primary,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600", textAlign: "center" }}>
              ➕ Yeni Veri Ekle
            </Text>
          </TouchableOpacity>

          {/* Health Data List */}
          {healthData.length > 0 ? (
            <View className="gap-3">
              {healthData.map((entry) => (
                <View
                  key={entry.id}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center gap-2 flex-1">
                      <Text style={{ fontSize: 16 }}>
                        {getDataTypeIcon(entry.dataType)}
                      </Text>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "600",
                            color: colors.foreground,
                          }}
                        >
                          {getDataTypeLabel(entry.dataType)}
                        </Text>
                        <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>
                          {new Date(entry.date).toLocaleDateString("tr-TR")}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                        borderRadius: 6,
                        backgroundColor: colors.primary,
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: "bold", color: "#fff" }}>
                        {entry.value} {entry.unit}
                      </Text>
                    </View>
                  </View>

                  {entry.notes && (
                    <Text style={{ fontSize: 10, color: colors.muted, marginTop: 8 }}>
                      📝 {entry.notes}
                    </Text>
                  )}

                  <Text style={{ fontSize: 9, color: colors.muted, marginTop: 8 }}>
                    Giren: {entry.enteredByName}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={{ textAlign: "center", color: colors.muted, marginVertical: 20 }}>
              Henüz sağlık verisi yok
            </Text>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
