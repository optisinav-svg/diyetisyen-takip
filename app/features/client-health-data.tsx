import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, Switch } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { BackButton } from "@/components/back-button";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CLIENTS_KEY = "dietitian_clients";
const HEALTH_DATA_KEY = "client_health_data";

interface Client {
  id: string;
  name: string;
  email: string;
}

interface HealthData {
  clientId: string;
  height: string;
  weight: string;
  age: string;
  gender: string;
  diabetes: boolean;
  hypertension: boolean;
  glutenSensitivity: boolean;
  lactoseIntolerance: boolean;
  heartDisease: boolean;
  kidneyDisease: boolean;
  thyroid: boolean;
  otherConditions: string;
  bloodSugar: string;
  cholesterol: string;
  bloodPressure: string;
  updatedAt: string;
}

const SAMPLE_CLIENTS: Client[] = [
  { id: "1", name: "Ayşe Yılmaz", email: "ayse@email.com" },
  { id: "2", name: "Mehmet Demir", email: "mehmet@email.com" },
  { id: "3", name: "Fatma Kaya", email: "fatma@email.com" },
];

const DEFAULT_HEALTH: Omit<HealthData, "clientId" | "updatedAt"> = {
  height: "", weight: "", age: "", gender: "Kadın",
  diabetes: false, hypertension: false, glutenSensitivity: false,
  lactoseIntolerance: false, heartDisease: false, kidneyDisease: false,
  thyroid: false, otherConditions: "",
  bloodSugar: "", cholesterol: "", bloodPressure: "",
};

export default function ClientHealthData() {
  const colors = useColors();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [healthData, setHealthData] = useState<typeof DEFAULT_HEALTH>(DEFAULT_HEALTH);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedClient) loadHealthData(selectedClient.id);
  }, [selectedClient]);

  const loadHealthData = async (clientId: string) => {
    const saved = await AsyncStorage.getItem(`${HEALTH_DATA_KEY}_${clientId}`);
    if (saved) {
      const data = JSON.parse(saved);
      setHealthData(data);
    } else {
      setHealthData(DEFAULT_HEALTH);
    }
  };

  const saveHealthData = async () => {
    if (!selectedClient) return;
    setSaving(true);
    try {
      const data = { ...healthData, clientId: selectedClient.id, updatedAt: new Date().toISOString() };
      await AsyncStorage.setItem(`${HEALTH_DATA_KEY}_${selectedClient.id}`, JSON.stringify(data));
      Alert.alert("Kaydedildi", `${selectedClient.name} sağlık verileri güncellendi.`);
    } catch {
      Alert.alert("Hata", "Kaydetme başarısız.");
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof typeof DEFAULT_HEALTH, value: any) => {
    setHealthData(prev => ({ ...prev, [key]: value }));
  };

  const InputField = ({ label, field, keyboardType = "default", placeholder = "" }: any) => (
    <View style={{ gap: 4 }}>
      <Text style={{ fontSize: 13, fontWeight: "600", color: colors.foreground }}>{label}</Text>
      <TextInput
        value={healthData[field as keyof typeof DEFAULT_HEALTH] as string}
        onChangeText={v => update(field, v)}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={{
          borderWidth: 1, borderColor: colors.border, borderRadius: 10,
          padding: 12, color: colors.foreground, backgroundColor: colors.surface, fontSize: 14,
        }}
      />
    </View>
  );

  const ToggleField = ({ label, field, icon }: any) => (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 }}>
      <Text style={{ color: colors.foreground, fontSize: 14 }}>{icon} {label}</Text>
      <Switch
        value={healthData[field as keyof typeof DEFAULT_HEALTH] as boolean}
        onValueChange={v => update(field, v)}
        trackColor={{ false: colors.border, true: colors.primary }}
      />
    </View>
  );

  if (!selectedClient) {
    return (
      <ScreenContainer>
        <BackButton title="🩺 Danışan Sağlık Verileri" />
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          <Text style={{ color: colors.muted, fontSize: 13 }}>Sağlık bilgisi girilecek danışanı seçin</Text>
          {SAMPLE_CLIENTS.map(client => (
            <TouchableOpacity key={client.id} onPress={() => setSelectedClient(client)}
              style={{
                backgroundColor: colors.surface, borderRadius: 12, padding: 16,
                borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", gap: 12,
              }}>
              <Text style={{ fontSize: 28 }}>👤</Text>
              <View>
                <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>{client.name}</Text>
                <Text style={{ fontSize: 13, color: colors.muted }}>{client.email}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <BackButton title={`🩺 ${selectedClient.name}`} onBack={() => setSelectedClient(null)} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}>

        {/* Vücut Ölçüleri */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, gap: 12, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>📏 Vücut Ölçüleri</Text>
          <InputField label="Boy (cm)" field="height" keyboardType="numeric" placeholder="örn: 165" />
          <InputField label="Kilo (kg)" field="weight" keyboardType="numeric" placeholder="örn: 70" />
          <InputField label="Yaş" field="age" keyboardType="numeric" placeholder="örn: 35" />
          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.foreground }}>Cinsiyet</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {["Kadın", "Erkek"].map(g => (
                <TouchableOpacity key={g} onPress={() => update("gender", g)}
                  style={{
                    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center",
                    backgroundColor: healthData.gender === g ? colors.primary : colors.surface,
                    borderWidth: 1, borderColor: healthData.gender === g ? colors.primary : colors.border,
                  }}>
                  <Text style={{ color: healthData.gender === g ? "#fff" : colors.foreground, fontWeight: "600" }}>
                    {g === "Kadın" ? "♀️ Kadın" : "♂️ Erkek"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Hastalıklar */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, gap: 4, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground, marginBottom: 8 }}>🏥 Hastalıklar ve Hassasiyetler</Text>
          <ToggleField label="Diyabet (Şeker)" field="diabetes" icon="🍬" />
          <ToggleField label="Hipertansiyon (Tansiyon)" field="hypertension" icon="🩸" />
          <ToggleField label="Gluten Hassasiyeti" field="glutenSensitivity" icon="🌾" />
          <ToggleField label="Laktoz İntoleransı" field="lactoseIntolerance" icon="🥛" />
          <ToggleField label="Kalp Hastalığı" field="heartDisease" icon="❤️" />
          <ToggleField label="Böbrek Hastalığı" field="kidneyDisease" icon="🫘" />
          <ToggleField label="Tiroid Bozukluğu" field="thyroid" icon="🦋" />
          <View style={{ gap: 4, marginTop: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.foreground }}>Diğer Hastalıklar</Text>
            <TextInput
              value={healthData.otherConditions}
              onChangeText={v => update("otherConditions", v)}
              placeholder="Varsa diğer hastalıkları yazın..."
              placeholderTextColor={colors.muted}
              multiline
              style={{
                borderWidth: 1, borderColor: colors.border, borderRadius: 10,
                padding: 12, color: colors.foreground, backgroundColor: colors.background,
                minHeight: 70, fontSize: 14,
              }}
            />
          </View>
        </View>

        {/* Sağlık Kartları */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, gap: 12, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>💉 Sağlık Değerleri</Text>
          <InputField label="Kan Şekeri (mg/dL)" field="bloodSugar" keyboardType="numeric" placeholder="örn: 95" />
          <InputField label="Kolesterol (mg/dL)" field="cholesterol" keyboardType="numeric" placeholder="örn: 180" />
          <InputField label="Tansiyon (mmHg)" field="bloodPressure" placeholder="örn: 120/80" />
        </View>

        {/* Kaydet */}
        <TouchableOpacity onPress={saveHealthData} disabled={saving}
          style={{
            paddingVertical: 16, borderRadius: 12, alignItems: "center",
            backgroundColor: colors.primary, opacity: saving ? 0.7 : 1,
          }}>
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
            {saving ? "Kaydediliyor..." : "💾 Kaydet"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
