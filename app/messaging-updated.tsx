import {
  ScrollView,
  Text,
  View,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { NavigationHeader } from "@/components/navigation-header";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { useColors } from "@/hooks/use-colors";
import { messagingService, type Message } from "@/lib/_core/messaging-service";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

/**
 * Updated Messaging Screen with Real-time Integration
 * Connects to messaging-service.ts for actual message synchronization
 */
export default function MessagingUpdatedScreen() {
  const colors = useColors();
  const router = useRouter();
  const { conversationId, clientId, dietitianId, clientName, dietitianName } =
    useLocalSearchParams();

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Initialize conversation and load messages
  useEffect(() => {
    const initConversation = async () => {
      try {
        setIsLoading(true);

        // Get or create conversation
        const convId = conversationId as string || `conv-${clientId}-${dietitianId}`;
        
        // Load existing messages
        const msgs = await messagingService.getMessages(convId);
        setMessages(msgs);

        // Mark all messages as read
        await messagingService.markConversationAsRead(convId, clientId as string);

        // Subscribe to new messages
        const unsubscribe = messagingService.subscribeToMessages(convId, (newMessage) => {
          setMessages((prev) => [...prev, newMessage]);
          scrollViewRef.current?.scrollToEnd({ animated: true });
        });

        unsubscribeRef.current = unsubscribe;
      } catch (error) {
        console.error("Error initializing conversation:", error);
        Alert.alert("Hata", "Konuşma yüklenirken bir hata oluştu");
      } finally {
        setIsLoading(false);
      }
    };

    initConversation();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [conversationId, clientId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    try {
      setIsSending(true);
      const convId = conversationId as string;
      const senderId = clientId as string;
      const senderName = clientName as string;
      const recipientId = dietitianId as string;

      await messagingService.sendMessage(
        convId,
        senderId,
        senderName,
        "client",
        recipientId,
        messageText
      );

      setMessageText("");
      setIsTyping(false);
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Hata", "Mesaj gönderilemedi");
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "şimdi";
    if (diffMins < 60) return `${diffMins}d`;
    if (diffHours < 24) return `${diffHours}s`;
    if (diffDays < 7) return `${diffDays}g`;
    return date.toLocaleDateString("tr-TR");
  };

  if (isLoading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <ScreenContainer className="flex-1 bg-background">
        <NavigationHeader
          title={`${dietitianName || "Diyetisyen"}`}
          showBackButton={true}
          showHomeButton={true}
        />

        {/* Messages List */}
        <FlatList
          ref={scrollViewRef as any}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <View
              className={`max-w-xs rounded-lg px-4 py-2 ${
                item.senderRole === "client"
                  ? "self-end"
                  : "self-start"
              }`}
              style={{
                backgroundColor:
                  item.senderRole === "client"
                    ? colors.primary
                    : colors.surface,
              }}
            >
              <Text
                className="text-sm font-semibold mb-1"
                style={{
                  color:
                    item.senderRole === "client"
                      ? "#fff"
                      : colors.foreground,
                }}
              >
                {item.senderName}
              </Text>
              <Text
                className="text-base"
                style={{
                  color:
                    item.senderRole === "client"
                      ? "#fff"
                      : colors.foreground,
                }}
              >
                {item.content}
              </Text>
              <View className="flex-row items-center gap-1 mt-1">
                <Text
                  className="text-xs"
                  style={{
                    color:
                      item.senderRole === "client"
                        ? "rgba(255,255,255,0.7)"
                        : colors.muted,
                  }}
                >
                  {formatTime(item.createdAt)}
                </Text>
                {item.senderRole === "client" && item.isRead && (
                  <MaterialIcons name="done-all" size={14} color="rgba(255,255,255,0.7)" />
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-8">
              <MaterialIcons name="message" size={48} color={colors.muted} />
              <Text className="text-muted mt-2">Henüz mesaj yok</Text>
            </View>
          }
        />

        {/* Message Input */}
        <View
          className="px-4 py-3 flex-row items-center gap-2"
          style={{
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
          }}
        >
          <TextInput
            placeholder="Mesaj yazın..."
            placeholderTextColor={colors.muted}
            value={messageText}
            onChangeText={(text) => {
              setMessageText(text);
              setIsTyping(text.length > 0);
            }}
            className="flex-1 px-3 py-2 rounded-lg text-foreground"
            style={{
              backgroundColor: colors.background,
              color: colors.foreground,
            }}
            editable={!isSending}
            multiline
            maxLength={500}
          />
          <Pressable
            onPress={handleSendMessage}
            disabled={!messageText.trim() || isSending}
            className="p-2 rounded-lg items-center justify-center"
            style={{
              backgroundColor: messageText.trim() ? colors.primary : colors.border,
              opacity: isSending ? 0.6 : 1,
            }}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MaterialIcons name="send" size={20} color="#fff" />
            )}
          </Pressable>
        </View>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}
