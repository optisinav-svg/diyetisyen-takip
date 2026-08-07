import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { BackButton } from "@/components/back-button";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserRegistration } from "@/lib/_core/user-registration";

const NOTES_KEY = "dietitian_notes";

interface Note {
  id: string;
  clientId: string;
  clientName: string;
  content: string;
  createdAt: string;
  sentToClient: boolean;
}

const SAMPLE_CLIENTS = [
  { id: "1", name: "Ayşe Yılmaz" },
  { id: "2", name: "Mehmet Demir" },
  { id: "3", name: "Fatma Kaya" },
];

export default function DietitianNotes() {
  const colors = useColors();
  const [role, setRole] = useState<"dietitian" | "client">("dietitian");
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedClient, setSelectedClient] = useState(SAMPLE_CLIENTS[0]);
  const [noteText, setNoteText] = useState("");
  const [sendToClient, setSendToClient] = useState(true);
  const [activeTab, setActiveTab] = useState<"write" | "history">("write");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const user = await getUserRegistration();
    setRole(user?.role ?? "dietitian");
    const saved = await AsyncStorage.getItem(NOTES_KEY);
    if (saved) setNotes(JSON.parse(saved));
  };

  const saveNote = async () => {
    if (!noteText.trim()) { Alert.alert("Hata", "Not içeriği girin"); return; }
    const note: Note = {
      id: Date.now().toString(),
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      content: noteText,
      createdAt: new Date().toISOString(),
      sentToClient: sendToClient,
    };
    const updated = [...notes, note];
    setNotes(updated);
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updated));
    setNoteText("");
    Alert.alert("Kaydedildi", sendToClient ? `Not kaydedildi ve ${selectedClient.name}'a gönderildi.` : "Not kaydedildi.");
  };

  const deleteNote = async (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updated));
  };

  const myNotes = role === "dietitian"
    ? notes.filter(n => n.clientId === selectedClient.id)
    : notes.filter(n => n.sentToClient);

  return (
    <ScreenContainer>
      <BackButton title="📝 Danışma Notları" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>

        {role === "dietitian" && (
          <>
            {/* Tab */}
            <View style={{ flexDirection: "row", gap: 8 }}>
              {(["write", "history"] as const).map(tab => (
                <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}
                  style={{
                    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center",
                    backgroundColor: activeTab === tab ? colors.primary : colors.surface,
                    borderWidth: 1, borderColor: activeTab === tab ? colors.primary : colors.border,
                  }}>
                  <Text style={{ color: activeTab === tab ? "#fff" : colors.foreground, fontWeight: "600" }}>
                    {tab === "write" ? "✏️ Not Yaz" : `📚 Geçmiş (${notes.length})`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {activeTab === "write" && (
              <>
                {/* Danışan Seçimi */}
                <View style={{ gap: 8 }}>
                  <Text style={{ fontWeight: "600", color: colors.foreground }}>Danışan Seçin</Text>
                  {SAMPLE_CLIENTS.map(c => (
                    <TouchableOpacity key={c.id} onPress={() => setSelectedClient(c)}
                      style={{
                        paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10,
                        backgroundColor: selectedClient.id === c.id ? colors.primary + "20" : colors.surface,
                        borderWidth: 2, borderColor: selectedClient.id === c.id ? colors.primary : colors.border,
                        flexDirection: "row", alignItems: "center", gap: 10,
                      }}>
                      <Text style={{ fontSize: 20 }}>👤</Text>
                      <Text style={{ fontWeight: "600", color: selectedClient.id === c.id ? colors.primary : colors.foreground }}>
                        {c.name}
                      </Text>
                      {selectedClient.id === c.id && <Text style={{ marginLeft: "auto", color: colors.primary }}>✓</Text>}
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Not Alanı */}
                <View style={{ gap: 8 }}>
                  <Text style={{ fontWeight: "600", color: colors.foreground }}>Not İçeriği</Text>
                  <TextInput
                    placeholder={`${selectedClient.name} için not yazın...`}
                    value={noteText}
                    onChangeText={setNoteText}
                    multiline
                    placeholderTextColor={colors.muted}
                    style={{
                      borderWidth: 1, borderColor: colors.border, borderRadius: 12,
                      padding: 14, color: colors.foreground, backgroundColor: colors.surface,
                      minHeight: 150, fontSize: 15, textAlignVertical: "top",
                    }}
                  />
                </View>

                {/* Danışana Gönder Toggle */}
                <TouchableOpacity onPress={() => setSendToClient(!sendToClient)}
                  style={{
                    flexDirection: "row", alignItems: "center", gap: 10,
                    backgroundColor: colors.surface, borderRadius: 12, padding: 14,
                    borderWidth: 1, borderColor: sendToClient ? colors.primary : colors.border,
                  }}>
                  <View style={{
                    width: 24, height: 24, borderRadius: 12,
                    backgroundColor: sendToClient ? colors.primary : colors.surface,
                    borderWidth: 2, borderColor: sendToClient ? colors.primary : colors.border,
                    alignItems: "center", justifyContent: "center",
                  }}>
                    {sendToClient && <Text style={{ color: "#fff", fontSize: 14 }}>✓</Text>}
                  </View>
                  <View>
                    <Text style={{ fontWeight: "600", color: colors.foreground }}>Danışana Gönder</Text>
                    <Text style={{ fontSize: 12, color: colors.muted }}>
                      {sendToClient ? "Not danışanın ekranında görünecek" : "Sadece sizde kalacak"}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={saveNote}
                  style={{ paddingVertical: 16, borderRadius: 12, alignItems: "center", backgroundColor: colors.primary }}>
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                    {sendToClient ? "💾 Kaydet ve Gönder" : "💾 Kaydet"}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {activeTab === "history" && (
              <>
                {/* Danışan Filtresi */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {SAMPLE_CLIENTS.map(c => (
                      <TouchableOpacity key={c.id} onPress={() => setSelectedClient(c)}
                        style={{
                          paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                          backgroundColor: selectedClient.id === c.id ? colors.primary : colors.surface,
                          borderWidth: 1, borderColor: selectedClient.id === c.id ? colors.primary : colors.border,
                        }}>
                        <Text style={{ color: selectedClient.id === c.id ? "#fff" : colors.foreground, fontWeight: "600", fontSize: 13 }}>
                          {c.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                {myNotes.length === 0 ? (
                  <Text style={{ color: colors.muted, textAlign: "center", marginTop: 20 }}>
                    {selectedClient.name} için henüz not yok.
                  </Text>
                ) : [...myNotes].reverse().map(note => (
                  <View key={note.id} style={{
                    backgroundColor: colors.surface, borderRadius: 12, padding: 14, gap: 8,
                    borderWidth: 1, borderColor: note.sentToClient ? colors.primary : colors.border,
                  }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={{ fontSize: 12, color: colors.muted }}>
                        {new Date(note.createdAt).toLocaleDateString("tr-TR")} {new Date(note.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                      </Text>
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        {note.sentToClient && <Text style={{ fontSize: 12, color: colors.primary }}>✉️ Gönderildi</Text>}
                        <TouchableOpacity onPress={() => deleteNote(note.id)}>
                          <Text style={{ fontSize: 12, color: "#ef4444" }}>Sil</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={{ color: colors.foreground, fontSize: 14, lineHeight: 22 }}>{note.content}</Text>
                  </View>
                ))}
              </>
            )}
          </>
        )}

        {/* Danışan görünümü */}
        {role === "client" && (
          <>
            <Text style={{ fontSize: 14, color: colors.muted }}>Diyetisyeninizin size gönderdiği notlar</Text>
            {myNotes.length === 0 ? (
              <Text style={{ color: colors.muted, textAlign: "center", marginTop: 20 }}>
                Henüz not gönderilmedi.
              </Text>
            ) : [...myNotes].reverse().map(note => (
              <View key={note.id} style={{
                backgroundColor: colors.surface, borderRadius: 12, padding: 14, gap: 8,
                borderWidth: 1, borderColor: colors.primary,
              }}>
                <Text style={{ fontSize: 12, color: colors.primary, fontWeight: "600" }}>
                  👨‍⚕️ Diyetisyeninizden · {new Date(note.createdAt).toLocaleDateString("tr-TR")}
                </Text>
                <Text style={{ color: colors.foreground, fontSize: 15, lineHeight: 24 }}>{note.content}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
