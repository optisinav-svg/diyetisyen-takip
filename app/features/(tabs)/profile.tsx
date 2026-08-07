import { ActivityIndicator, ScrollView, Text, View, TouchableOpacity, TextInput, Alert, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { getUserRegistration, saveUserRegistration } from "@/lib/_core/user-registration";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PHOTO_KEY = "profile_photo";
const RATINGS_KEY = "user_ratings";

interface Rating {
  fromId: string;
  fromName: string;
  fromRole: string;
  toId: string;
  score: number;
  comment: string;
  date: string;
}

export default function ProfileScreen() {
  const colors = useColors();
  const [user, setUser] = useState<any>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [activeTab, setActiveTab] = useState<"profile" | "ratings">("profile");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const userData = await getUserRegistration();
    setUser(userData);
    const savedPhoto = await AsyncStorage.getItem(PHOTO_KEY);
    if (savedPhoto) setPhoto(savedPhoto);
    const savedRatings = await AsyncStorage.getItem(RATINGS_KEY);
    if (savedRatings) setRatings(JSON.parse(savedRatings));
    setLoading(false);
  };

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("İzin Gerekli", "Fotoğraf seçmek için galeri izni gereklidir.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setPhoto(uri);
      await AsyncStorage.setItem(PHOTO_KEY, uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("İzin Gerekli", "Fotoğraf çekmek için kamera izni gereklidir.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setPhoto(uri);
      await AsyncStorage.setItem(PHOTO_KEY, uri);
    }
  };

  const handlePhotoPress = () => {
    Alert.alert("Profil Fotoğrafı", "Fotoğraf kaynağını seçin", [
      { text: "Galeriden Seç", onPress: pickPhoto },
      { text: "Kamera ile Çek", onPress: takePhoto },
      { text: "İptal", style: "cancel" },
    ]);
  };

  const submitRating = async () => {
    if (!user) return;
    const newRating: Rating = {
      fromId: user.email,
      fromName: user.name,
      fromRole: user.role,
      toId: "dietitian-1",
      score: ratingScore,
      comment: ratingComment,
      date: new Date().toISOString(),
    };
    const updated = [...ratings, newRating];
    setRatings(updated);
    await AsyncStorage.setItem(RATINGS_KEY, JSON.stringify(updated));
    setShowRatingForm(false);
    setRatingComment("");
    setRatingScore(5);
    Alert.alert("Teşekkürler!", "Puanınız kaydedildi.");
  };

  const avgRating = ratings.length > 0
    ? (ratings.reduce((s, r) => s + r.score, 0) / ratings.length).toFixed(1)
    : null;

  if (loading) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}>
        {/* Tab */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          {(["profile", "ratings"] as const).map(tab => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}
              style={{
                flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center",
                backgroundColor: activeTab === tab ? colors.primary : colors.surface,
                borderWidth: 1, borderColor: activeTab === tab ? colors.primary : colors.border,
              }}>
              <Text style={{ color: activeTab === tab ? "#fff" : colors.foreground, fontWeight: "600" }}>
                {tab === "profile" ? "👤 Profil" : `⭐ Puanlar (${ratings.length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === "profile" ? (
          <>
            {/* Profil Fotoğrafı */}
            <TouchableOpacity onPress={handlePhotoPress} style={{ alignItems: "center", gap: 8 }}>
              {photo ? (
                <Image source={{ uri: photo }} style={{ width: 100, height: 100, borderRadius: 50 }} />
              ) : (
                <View style={{
                  width: 100, height: 100, borderRadius: 50,
                  backgroundColor: colors.surface, borderWidth: 2,
                  borderColor: colors.primary, borderStyle: "dashed",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <Text style={{ fontSize: 36 }}>👤</Text>
                </View>
              )}
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "600" }}>
                📷 Fotoğraf Değiştir
              </Text>
            </TouchableOpacity>

            {/* Kullanıcı Bilgileri */}
            <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, gap: 8, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontSize: 20, fontWeight: "700", color: colors.foreground }}>{user?.name}</Text>
              <Text style={{ color: colors.muted }}>{user?.email}</Text>
              <View style={{
                backgroundColor: colors.primary + "20", paddingHorizontal: 10, paddingVertical: 4,
                borderRadius: 8, alignSelf: "flex-start",
              }}>
                <Text style={{ color: colors.primary, fontWeight: "600" }}>
                  {user?.role === "dietitian" ? "👨‍⚕️ Diyetisyen" : "👤 Danışan"}
                </Text>
              </View>
              {avgRating && (
                <Text style={{ color: colors.foreground }}>
                  ⭐ Ortalama Puan: {avgRating}/5
                </Text>
              )}
            </View>
          </>
        ) : (
          <>
            {/* Puan Ver */}
            <TouchableOpacity
              onPress={() => setShowRatingForm(!showRatingForm)}
              style={{
                paddingVertical: 14, borderRadius: 12, alignItems: "center",
                backgroundColor: colors.primary,
              }}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
                ⭐ {user?.role === "client" ? "Diyetisyenimi Puanla" : "Danışanımı Puanla"}
              </Text>
            </TouchableOpacity>

            {showRatingForm && (
              <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, gap: 12, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontWeight: "700", color: colors.foreground }}>Puan Ver</Text>
                <View style={{ flexDirection: "row", gap: 8, justifyContent: "center" }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <TouchableOpacity key={s} onPress={() => setRatingScore(s)}>
                      <Text style={{ fontSize: 32, opacity: s <= ratingScore ? 1 : 0.3 }}>⭐</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  placeholder="Yorum yazın (isteğe bağlı)"
                  value={ratingComment}
                  onChangeText={setRatingComment}
                  multiline
                  placeholderTextColor={colors.muted}
                  style={{
                    borderWidth: 1, borderColor: colors.border, borderRadius: 10,
                    padding: 12, color: colors.foreground, backgroundColor: colors.background,
                    minHeight: 80,
                  }}
                />
                <TouchableOpacity onPress={submitRating}
                  style={{ paddingVertical: 12, borderRadius: 10, alignItems: "center", backgroundColor: colors.primary }}>
                  <Text style={{ color: "#fff", fontWeight: "700" }}>Gönder</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Puan Listesi */}
            {ratings.length === 0 ? (
              <Text style={{ color: colors.muted, textAlign: "center" }}>Henüz puan verilmemiş.</Text>
            ) : (
              ratings.map((r, i) => (
                <View key={i} style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, gap: 4, borderWidth: 1, borderColor: colors.border }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontWeight: "700", color: colors.foreground }}>{r.fromName}</Text>
                    <Text>{"⭐".repeat(r.score)}</Text>
                  </View>
                  {r.comment ? <Text style={{ color: colors.muted }}>{r.comment}</Text> : null}
                  <Text style={{ color: colors.muted, fontSize: 11 }}>
                    {new Date(r.date).toLocaleDateString("tr-TR")}
                  </Text>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
