import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageBubble } from '../components/MessageBubble';
import { useChat } from '../hooks/useChatIA';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

const QUICK_QUESTIONS = [
  { icon: '🐶', text: '¿Cuáles son las mascotas más juguetonas?' },
  { icon: '🏠', text: '¿Qué raza es mejor para departamento?' },
  { icon: '🩺', text: '¿Qué cuidados necesita un perro?' },
  { icon: '😊', text: '¿Cómo saber si una mascota es feliz?' },
  { icon: '🍎', text: '¿Qué alimentos no deben comer?' },
  { icon: '📚', text: '¿Cómo educar a mi mascota?' },
];

export const ChatScreen: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const { messages, isLoading, error, sendMessage, clearChat } = useChat();

  const handleSend = async (text?: string) => {
    const msg = text ?? inputText;
    if (!msg.trim() || isLoading) return;
    setInputText('');
    await sendMessage(msg);
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.ambientContainer} pointerEvents="none">
        <View style={[styles.ambientGlow, styles.glowTop]} />
        <View style={[styles.ambientGlow, styles.glowBottom]} />
        <LottieView
          source={require("../../../../assets/lotties/pet2.json")}
          autoPlay
          loop
          style={styles.backgroundLottie}
        />
      </View>

      <View style={styles.glassHeader}>
        <View style={styles.headerTitleRow}>
          <LottieView
            source={require("../../../../assets/lotties/pet4.json")}
            autoPlay
            loop
            style={{ width: 32, height: 32 }}
          />
          <Text style={styles.headerTitle}>Chat con Gemini</Text>
        </View>
        <TouchableOpacity onPress={clearChat} style={styles.clearBtn} activeOpacity={0.7}>
          <MaterialIcons name="cleaning-services" size={22} color="#ac2a5d" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={styles.messagesList}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <LottieView
                source={require("../../../../assets/lotties/pet3.json")}
                autoPlay
                loop
                style={styles.emptyLottie}
              />
              <Text style={styles.emptyTitle}>¡Bienvenido!</Text>
              <Text style={styles.emptySub}>
                ¿Qué te interesa saber acerca de las mascotas?{'\n'}
                Pregúntame sobre cuidados, razas, alimentación y más.
              </Text>
              <View style={styles.quickGrid}>
                {QUICK_QUESTIONS.map((q, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.quickChip}
                    activeOpacity={0.7}
                    onPress={() => handleSend(q.text)}
                  >
                    <Text style={styles.quickChipIcon}>{q.icon}</Text>
                    <Text style={styles.quickChipText} numberOfLines={2}>{q.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          }
        />

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='small' color='#ac2a5d' />
            <Text style={styles.loadingText}>Gemini está pensando...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={20} color="#93000a" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Contenedor de Input (Glassmorphism) */}
        <View style={styles.glassInputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder='Escribe un mensaje...'
            placeholderTextColor="#8a7176"
            multiline
            onSubmitEditing={() => handleSend()}
          />
          <TouchableOpacity
            style={[styles.sendButtonWrapper, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={(!inputText.trim() || isLoading) ? ['#e3bdc8', '#e3bdc8'] : ['#ac2a5d', '#fc9d41']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendButton}
            >
              <MaterialIcons name="send" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f9f9ff' 
  },
  flex: { 
    flex: 1 
  },

  // --- Efectos Atmosféricos ---
  ambientContainer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  ambientGlow: { position: 'absolute', borderRadius: 999, opacity: 0.3 },
  glowTop: {
    width: width * 0.8, height: width * 0.8, backgroundColor: '#ffd9e1',
    top: -width * 0.2, left: -width * 0.2, filter: 'blur(60px)',
  },
  glowBottom: {
    width: width * 0.8, height: width * 0.8, backgroundColor: '#abedff',
    bottom: -width * 0.2, right: -width * 0.2, filter: 'blur(60px)',
  },
  backgroundLottie: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.08,
  },

  // --- Header ---
  glassHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(249, 249, 255, 0.7)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.6)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#ac2a5d',
    letterSpacing: -0.5,
  },
  clearBtn: { 
    width: 40, 
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },

  // --- Lista y Estados ---
  messagesList: { 
    padding: 16, 
    paddingBottom: 24 
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  emptyLottie: {
    width: 120,
    height: 120,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#161c28',
    marginTop: 8,
  },
  emptySub: {
    fontSize: 14,
    color: '#574146',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 20,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(172,42,93,0.15)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
  },
  quickChipIcon: {
    fontSize: 16,
  },
  quickChipText: {
    fontSize: 12,
    color: '#574146',
    fontWeight: '600',
    flex: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 16,
    borderRadius: 999,
    alignSelf: 'center',
    marginBottom: 12,
  },
  loadingText: { 
    color: '#ac2a5d', 
    fontSize: 13,
    fontWeight: '600'
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#ffdad6',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(186, 26, 26, 0.3)',
  },
  errorText: { 
    color: '#93000a', 
    fontSize: 13,
    flex: 1,
  },

  // --- Contenedor de Input ---
  glassInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingHorizontal: 16,
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.5)',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: 'rgba(227, 189, 200, 0.6)',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: 15,
    color: '#161c28',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  sendButtonWrapper: {
    shadowColor: '#ac2a5d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    borderRadius: 24,
    marginBottom: 2, // Para alinear con el centro del input
  },
  sendButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});