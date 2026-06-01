import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { Message } from '@features/chat/domain/entities/Message';
import { useChat } from '@features/chat/presentation/hooks/useChat';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, Image,
  KeyboardAvoidingView, Platform, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

// Nueva paleta de colores adaptada fielmente al HTML del diseño de adopción
const C = {
  primary: '#99462a', // Terracota / Orange-ish premium
  onPrimary: '#ffffff',
  primaryContainer: '#d97757',
  background: '#fdf9f3', // Fondo crema cálido e invitador
  surface: '#ffffff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f7f3ed',
  surfaceContainerHigh: '#ebe8e2',
  onSurface: '#1c1c18', // Texto oscuro suave, no negro puro
  onSurfaceVariant: '#55433d',
  secondary: '#56642b', // Verde oliva complementario para roles/subtítulos
  outlineVariant: '#dbc1b9',
  outline: '#88726c',
};

function LottieAvatar({ size }: { size: number }) {
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: C.surfaceContainerLow, borderWidth: 1, borderColor: C.outlineVariant,
      overflow: 'hidden', justifyContent: 'center', alignItems: 'center',
    }}>
      <LottieView
        source={require('../../../src/assets/lotties/user.json')}
        autoPlay
        loop
        style={{ width: size * 0.7, height: size * 0.7 }}
      />
    </View>
  );
}

export default function ChatScreen() {
  const { roomId, productName } = useLocalSearchParams<{ roomId: string; productName: string }>();
  const { messages, sendMessage, sendImage, isLoading, isUploadingImg, unreadCount, clearUnread, sendError } = useChat(roomId);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) listRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  const handleSendMsg = useCallback(() => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  }, [input, sendMessage]);

  const handlePickImage = useCallback(async () => {
    Alert.alert("Enviar imagen", "Elige una opción", [
      {
        text: "Cámara",
        onPress: async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) {
            Alert.alert("Permiso denegado", "Se necesita acceso a la cámara.");
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
          });
          if (!result.canceled) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            sendImage(result.assets[0].uri);
          }
        },
      },
      {
        text: "Galería",
        onPress: async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) {
            Alert.alert("Permiso denegado", "Se necesita acceso a la galería.");
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
          });
          if (!result.canceled) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            sendImage(result.assets[0].uri);
          }
        },
      },
      { text: "Cancelar", style: "cancel" },
    ]);
  }, [sendImage]);

  const renderMsg = ({ item }: { item: Message }) => {
    const isOwn = item.userId === user?.id;
    return (
      <View style={[styles.row, isOwn && styles.rowOwn]}>
        {!isOwn && <LottieAvatar size={32} />}
        <View style={[styles.bubble, isOwn ? styles.own : styles.other, !isOwn && styles.messageShadow]}>
          {!isOwn && <Text style={styles.author}>{item.authorUsername}</Text>}
          {item.imageUrl
            ? <Image source={{ uri: item.imageUrl }} style={styles.chatImage} resizeMode="cover" />
            : <Text style={[styles.text, isOwn && styles.textOwn]}>{item.content}</Text>
          }
          <Text style={[styles.time, isOwn && styles.timeOwn]}>
            {item.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <LottieView
        source={require('../../../src/assets/lotties/pet.json')}
        autoPlay
        loop
        style={styles.lottieBg}
      />

      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back-circle" size={30} color="pink" />
        </TouchableOpacity>
        <LottieAvatar size={40} />
        <View style={styles.chatHeaderInfo}>
          <Text style={styles.chatHeaderTitle} numberOfLines={1}>
            {productName ?? 'Chat'}
          </Text>
          <Text style={styles.chatHeaderSub}>
            {user?.role === 'cliente' ? 'Happy Tails Shelter • Adoptante' : 'Happy Tails Shelter • Refugio'}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loaderCenter}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderMsg}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyChat}>
              {user?.role === 'cliente'
                ? '¡Hola! Pregunta lo que quieras sobre la mascota 👇'
                : 'Esperando preguntas del adoptante...'}
            </Text>
          }
        />
      )}

      {unreadCount > 0 && (
        <TouchableOpacity
          style={styles.unreadBadge}
          onPress={() => { listRef.current?.scrollToEnd({ animated: true }); clearUnread(); }}
        >
          <Text style={styles.unreadText}>
            {unreadCount} mensaje{unreadCount > 1 ? 's' : ''} nuevo{unreadCount > 1 ? 's' : ''} ↓
          </Text>
        </TouchableOpacity>
      )}

      {sendError && (
        <View style={styles.errorBar}>
          <Text style={styles.errorText}>{sendError}</Text>
        </View>
      )}

      {isUploadingImg && (
        <View style={styles.uploadingBar}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.uploadingText}>Subiendo imagen...</Text>
        </View>
      )}
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.attachBtn} onPress={handlePickImage} disabled={isUploadingImg}>
            <LottieView
              source={require('../../../src/assets/lotties/camera.json')}
              autoPlay
              loop
              style={{ width: 26, height: 26 }}
            />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={user?.role === 'cliente' ? 'Escribe un mensaje...' : 'Responde al adoptante...'}
            placeholderTextColor="rgba(136, 114, 108, 0.6)"
            multiline
            maxLength={500}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSendMsg}>
            <LottieView
              source={require('../../../src/assets/lotties/send.json')}
              autoPlay
              loop
              style={{ width: 22, height: 22 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  lottieBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%', height: '100%',
    opacity: 0.04, zIndex: 0,
  },
  loaderCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  // Header con fondo claro y sombra sutil idéntica a la del HTML original
  chatHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.surface,
    paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20,
    borderBottomWidth: 1, borderColor: 'rgba(217, 119, 87, 0.08)',
    shadowColor: '#d97757',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    zIndex: 1,
  },
  backBtn: { marginRight: 4, justifyContent: 'center' },
  backText: { fontSize: 28, color: C.onSurfaceVariant, fontWeight: '400' },
  chatHeaderInfo: { flex: 1 },
  chatHeaderTitle: { fontSize: 18, fontWeight: '700', color: C.onSurface, fontFamily: 'Plus Jakarta Sans' },
  chatHeaderSub: { fontSize: 13, color: C.secondary, marginTop: 2, fontWeight: '500' },
  row: { flexDirection: 'row', marginVertical: 6, alignItems: 'flex-end', gap: 8 },
  rowOwn: { justifyContent: 'flex-end' },
  // Burbujas estilizadas con el border radius asimétrico del diseño original
  bubble: { maxWidth: '78%', paddingHorizontal: 16, paddingVertical: 12 },
  own: { 
    backgroundColor: C.primary, 
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  other: {
    backgroundColor: C.surfaceContainerLowest,
    borderWidth: 1, 
    borderColor: 'rgba(230, 226, 220, 0.6)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 4,
  },
  messageShadow: {
    shadowColor: '#d97757',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 2,
  },
  author: { fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 4 },
  text: { fontSize: 16, color: C.onSurface, lineHeight: 22 },
  textOwn: { color: C.onPrimary },
  chatImage: { width: 220, height: 220, borderRadius: 12, borderWidth: 1, borderColor: C.outlineVariant },
  time: { fontSize: 11, color: C.outline, marginTop: 6, alignSelf: 'flex-end' },
  timeOwn: { color: 'rgba(255,255,255,0.7)' },
  listContent: { padding: 20, paddingBottom: 40 },
  emptyChat: {
    textAlign: 'center', color: C.onSurfaceVariant,
    marginTop: 80, fontSize: 15, paddingHorizontal: 40,
    lineHeight: 22,
  },
  unreadBadge: {
    position: 'absolute', bottom: 100, alignSelf: 'center',
    backgroundColor: C.primary, borderRadius: 9999,
    paddingHorizontal: 18, paddingVertical: 10, elevation: 4, zIndex: 2,
  },
  unreadText: { color: C.onPrimary, fontWeight: '600', fontSize: 13 },
  uploadingBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.onSurface, paddingVertical: 8, gap: 8,
  },
  uploadingText: { color: '#fff', fontSize: 13 },
  errorBar: {
    backgroundColor: '#ba1a1a', paddingVertical: 10, paddingHorizontal: 20,
  },
  errorText: { color: '#fff', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  // Contenedor inferior estilo píldora flotante limpia del HTML
  inputContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingTop: 10,
  },
  inputRow: {
    flexDirection: 'row', 
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: C.surface, 
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(230, 226, 220, 0.8)',
    alignItems: 'center',
    shadowColor: '#d97757',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 3,
  },
  attachBtn: { width: 38, height: 38, justifyContent: 'center', alignItems: 'center' },
  input: {
    flex: 1, 
    borderWidth: 0,
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    maxHeight: 90,
    color: C.onSurface, 
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  sendBtn: {
    backgroundColor: C.primary, 
    borderRadius: 9999,
    width: 38, height: 38, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
});