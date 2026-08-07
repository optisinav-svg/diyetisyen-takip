import {
  ScrollView, Text, View, TextInput,
  FlatList, KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { BackButton } from '@/components/back-button';
import { useState, useRef, useEffect } from 'react';
import { useColors } from '@/hooks/use-colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserRegistration } from '@/lib/_core/user-registration';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MESSAGES_KEY = "chat_messages";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

interface Contact {
  id: string;
  name: string;
  role: 'dietitian' | 'client';
  lastMessage?: string;
  unread?: number;
}

// Danışan → tek diyetisyen görür
// Diyetisyen → kendi danışanlarını görür
const DIETITIAN_CONTACTS: Contact[] = [
  { id: 'c1', name: 'Ayşe Yılmaz', role: 'client', lastMessage: 'Teşekkür ederim!', unread: 1 },
  { id: 'c2', name: 'Mehmet Demir', role: 'client', lastMessage: 'Öğün planı için teşekkürler', unread: 0 },
  { id: 'c3', name: 'Fatma Kaya', role: 'client', lastMessage: 'Yarın randevum var', unread: 2 },
];

const CLIENT_CONTACTS: Contact[] = [
  { id: 'd1', name: 'Diyetisyeniniz', role: 'dietitian', lastMessage: 'Protein alımını artır', unread: 1 },
];

const INITIAL_MESSAGES: Record<string, Message[]> = {
  'c1': [
    { id: '1', senderId: 'd1', senderName: 'Diyetisyen', content: 'Merhaba Ayşe! Nasılsınız?', createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: '2', senderId: 'me', senderName: 'Ben', content: 'Teşekkür ederim!', createdAt: new Date(Date.now() - 3600000).toISOString() },
  ],
  'c2': [
    { id: '1', senderId: 'me', senderName: 'Ben', content: 'Öğün planınızı gönderdim.', createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: '2', senderId: 'c2', senderName: 'Mehmet', content: 'Öğün planı için teşekkürler', createdAt: new Date(Date.now() - 1800000).toISOString() },
  ],
  'c3': [
    { id: '1', senderId: 'c3', senderName: 'Fatma', content: 'Yarın randevum var', createdAt: new Date(Date.now() - 900000).toISOString() },
  ],
  'd1': [
    { id: '1', senderId: 'd1', senderName: 'Diyetisyeniniz', content: 'Merhaba! Bu hafta nasıl gidiyor?', createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: '2', senderId: 'me', senderName: 'Ben', content: 'Çok iyi, öğünleri düzenli alıyorum.', createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: '3', senderId: 'd1', senderName: 'Diyetisyeniniz', content: 'Protein alımını artırmaya devam et.', createdAt: new Date(Date.now() - 1800000).toISOString() },
  ],
};

export default function MessagingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [role, setRole] = useState<'dietitian' | 'client'>('client');
  const [userName, setUserName] = useState('Ben');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [allMessages, setAllMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => { loadUser(); }, []);

  useEffect(() => {
    if (selectedContact) {
      setMessages(allMessages[selectedContact.id] ?? []);
    }
  }, [selectedContact, allMessages]);

  const loadUser = async () => {
    const user = await getUserRegistration();
    setRole(user?.role ?? 'client');
    setUserName(user?.name ?? 'Ben');

    // Kayıtlı mesajları yükle
    const saved = await AsyncStorage.getItem(MESSAGES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setAllMessages({ ...INITIAL_MESSAGES, ...parsed });
    }
  };

  const contacts = role === 'dietitian' ? DIETITIAN_CONTACTS : CLIENT_CONTACTS;

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedContact) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      senderName: userName,
      content: messageText.trim(),
      createdAt: new Date().toISOString(),
    };
    const updated = { ...allMessages, [selectedContact.id]: [...(allMessages[selectedContact.id] ?? []), newMsg] };
    setAllMessages(updated);
    setMessageText('');
    await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(updated));
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  // Kişi listesi
  if (!selectedContact) {
    return (
      <ScreenContainer>
        <BackButton title="💬 Mesajlar" />
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          <Text style={{ fontSize: 13, color: colors.muted }}>
            {role === 'client'
              ? 'Diyetisyeninizle mesajlaşın'
              : 'Danışanlarınızla mesajlaşın'}
          </Text>
          {contacts.map(contact => {
            const contactMessages = allMessages[contact.id] ?? [];
            const unread = contactMessages.filter(m => m.senderId !== 'me').length > 0 ? 1 : 0;
            const last = contactMessages[contactMessages.length - 1];
            return (
              <TouchableOpacity key={contact.id} onPress={() => setSelectedContact(contact)}
                style={{
                  backgroundColor: colors.surface, borderRadius: 14, padding: 16,
                  borderWidth: 1, borderColor: colors.border,
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                }}>
                <View style={{
                  width: 50, height: 50, borderRadius: 25,
                  backgroundColor: contact.role === 'dietitian' ? colors.primary : colors.primary + '40',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: 22 }}>
                    {contact.role === 'dietitian' ? '👨‍⚕️' : '👤'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground }}>
                    {contact.name}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.muted }} numberOfLines={1}>
                    {last?.content ?? 'Henüz mesaj yok'}
                  </Text>
                </View>
                {unread > 0 && (
                  <View style={{
                    backgroundColor: colors.primary, borderRadius: 10,
                    minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
                  }}>
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{unread}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </ScreenContainer>
    );
  }

  // Mesajlaşma ekranı
  const bottomOffset = insets.bottom + 60; // tab bar yüksekliği

  return (
    <ScreenContainer>
      <BackButton title={selectedContact.name} onBack={() => setSelectedContact(null)} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={m => m.id}
          contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: 16 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 40 }}>
              Henüz mesaj yok. İlk mesajı gönderin!
            </Text>
          }
          renderItem={({ item }) => {
            const isMe = item.senderId === 'me';
            return (
              <View style={{ alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                {!isMe && (
                  <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 2, marginLeft: 4 }}>
                    {item.senderName}
                  </Text>
                )}
                <View style={{
                  maxWidth: '80%', padding: 12, borderRadius: 16,
                  backgroundColor: isMe ? colors.primary : colors.surface,
                  borderWidth: isMe ? 0 : 1, borderColor: colors.border,
                  borderBottomRightRadius: isMe ? 4 : 16,
                  borderBottomLeftRadius: isMe ? 16 : 4,
                }}>
                  <Text style={{ color: isMe ? '#fff' : colors.foreground, fontSize: 15, lineHeight: 20 }}>
                    {item.content}
                  </Text>
                  <Text style={{ color: isMe ? 'rgba(255,255,255,0.7)' : colors.muted, fontSize: 10, marginTop: 4, textAlign: 'right' }}>
                    {formatTime(item.createdAt)}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        {/* Mesaj giriş alanı - tab bar'ın üzerinde */}
        <View style={{
          flexDirection: 'row', alignItems: 'flex-end', gap: 8,
          paddingHorizontal: 12, paddingTop: 10,
          paddingBottom: Math.max(insets.bottom, 12) + 4,
          borderTopWidth: 1, borderTopColor: colors.border,
          backgroundColor: colors.background,
        }}>
          <TextInput
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Mesaj yazın..."
            placeholderTextColor={colors.muted}
            multiline
            maxLength={500}
            style={{
              flex: 1,
              minHeight: 44,
              maxHeight: 120,
              backgroundColor: colors.surface,
              borderRadius: 22,
              paddingHorizontal: 16,
              paddingVertical: 10,
              color: colors.foreground,
              fontSize: 15,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!messageText.trim()}
            style={{
              width: 44, height: 44, borderRadius: 22,
              backgroundColor: messageText.trim() ? colors.primary : colors.surface,
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: messageText.trim() ? colors.primary : colors.border,
            }}>
            <Text style={{ fontSize: 18, color: messageText.trim() ? '#fff' : colors.muted }}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
