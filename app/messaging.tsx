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
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { useColors } from '@/hooks/use-colors';

interface Message {
  id: number;
  senderUserId: number;
  senderName: string;
  senderRole: 'dietitian' | 'client';
  content: string;
  createdAt: string;
  isRead: boolean;
}

export default function MessagingScreen() {
  const colors = useColors();
  const router = useRouter();
  const { pairingId, dietitianName, clientName } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      senderUserId: 1,
      senderName: 'Dr. Mehmet Kaya',
      senderRole: 'dietitian',
      content: 'Merhaba Ayşe, bu hafta nasıl gidiyor?',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      isRead: true,
    },
    {
      id: 2,
      senderUserId: 2,
      senderName: 'Ayşe Yılmaz',
      senderRole: 'client',
      content: 'Merhaba Dr. Kaya! Çok iyi gidiyor, öğünleri düzenli alıyorum.',
      createdAt: new Date(Date.now() - 3000000).toISOString(),
      isRead: true,
    },
    {
      id: 3,
      senderUserId: 1,
      senderName: 'Dr. Mehmet Kaya',
      senderRole: 'dietitian',
      content: 'Harika! Protein alımını artırmaya devam et. Adımlarını da takip ediyorum.',
      createdAt: new Date(Date.now() - 2400000).toISOString(),
      isRead: true,
    },
  ]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    try {
      setIsLoading(true);

      // Add message to list
      const newMessage: Message = {
        id: messages.length + 1,
        senderUserId: 2,
        senderName: 'Ayşe Yılmaz',
        senderRole: 'client',
        content: messageText,
        createdAt: new Date().toISOString(),
        isRead: false,
      };

      setMessages([...messages, newMessage]);
      setMessageText('');
      setIsTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    return date.toLocaleDateString('tr-TR');
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.senderRole === 'client';

    return (
      <View
        className={`flex-row gap-2 mb-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
      >
        {!isOwnMessage && (
          <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center">
            <Text className="text-xs font-bold text-primary">D</Text>
          </View>
        )}

        <View
          className={`max-w-xs rounded-lg p-3 ${
            isOwnMessage
              ? 'bg-primary'
              : 'bg-surface border border-border'
          }`}
        >
          <Text
            className={`text-sm ${
              isOwnMessage ? 'text-white' : 'text-foreground'
            }`}
          >
            {item.content}
          </Text>
          <Text
            className={`text-xs mt-1 ${
              isOwnMessage ? 'text-white/70' : 'text-muted'
            }`}
          >
            {formatTime(item.createdAt)}
          </Text>
        </View>

        {isOwnMessage && (
          <View className="w-8 h-8 rounded-full bg-primary items-center justify-center">
            <Text className="text-xs font-bold text-white">A</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScreenContainer className="p-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-border">
          <View className="flex-row items-center gap-2">
            <Pressable onPress={() => router.back()}>
              <Text className="text-primary font-semibold">←</Text>
            </Pressable>
            <View>
              <Text className="text-lg font-bold text-foreground">
                {dietitianName || 'Dr. Mehmet Kaya'}
              </Text>
              <Text className="text-xs text-muted">Çevrimiçi</Text>
            </View>
          </View>

          <Pressable>
            <Text className="text-xl">⋯</Text>
          </Pressable>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 mb-4"
          contentContainerStyle={{ gap: 8 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg, index) => (
            <View key={msg.id}>
              {renderMessage({ item: msg })}
            </View>
          ))}

          {isTyping && (
            <View className="flex-row gap-2 mb-3">
              <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center">
                <Text className="text-xs font-bold text-primary">D</Text>
              </View>
              <View className="bg-surface border border-border rounded-lg p-3 flex-row gap-1 items-center">
                <View className="w-2 h-2 rounded-full bg-muted animate-bounce" />
                <View className="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: '0.1s' }} />
                <View className="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: '0.2s' }} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View className="flex-row gap-2 items-end">
          <Pressable
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.7 : 1,
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              },
            ]}
          >
            <Text className="text-lg">📎</Text>
          </Pressable>

          <TextInput
            placeholder="Mesaj yazın..."
            placeholderTextColor={colors.muted}
            value={messageText}
            onChangeText={(text) => {
              setMessageText(text);
              setIsTyping(text.length > 0);
            }}
            multiline
            className="flex-1 bg-surface border border-border rounded-lg p-3 text-foreground"
            style={{
              minHeight: 40,
              maxHeight: 100,
              paddingVertical: 10,
            }}
          />

          <Pressable
            onPress={handleSendMessage}
            disabled={!messageText.trim() || isLoading}
            style={({ pressed }) => [
              {
                opacity: pressed || !messageText.trim() || isLoading ? 0.7 : 1,
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-lg">📤</Text>
            )}
          </Pressable>
        </View>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}
