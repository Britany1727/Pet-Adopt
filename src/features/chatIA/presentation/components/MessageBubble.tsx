// src/features/chat/presentation/components/MessageBuble.tsx

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Markdown from 'react-native-markdown-display';
import * as Speech from 'expo-speech';
import { MessageIA } from '@features/chatIA/domain/entities/MessageIA';
import React, { useState, useRef, useEffect } from 'react';

interface Props { message: MessageIA; }

const cleanMarkdown = (text: string): string => {
  return text
    .replace(/```[\s\S]*?```/g, 'bloque de código.')
    .replace(/`[^`]*`/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*{3}(.+?)\*{3}/g, '$1')
    .replace(/\*{2}(.+?)\*{2}/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\*/g, '')
    .replace(/_{3}(.+?)_{3}/g, '$1')
    .replace(/_{2}(.+?)_{2}/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/!\[.*?\]\(.+?\)/g, '')
    .replace(/^>\s+/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^[-*_]{3,}$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

export const MessageBubble: React.FC<Props> = ({ message }) => {
  const isUser = message.role === 'user';
  const [isSpeaking, setIsSpeaking] = useState(false);
  const cleanTextRef = useRef<string>(cleanMarkdown(message.content)); // ← declarado aquí

  useEffect(() => {
    cleanTextRef.current = cleanMarkdown(message.content);
    console.log('TEXTO LIMPIO:', cleanTextRef.current); // verifica en Metro
  }, [message.content]);

  const handleSpeak = async () => {
  if (isSpeaking) {
    await Speech.stop();
    setIsSpeaking(false);
  } else {
    const plainText = cleanTextRef.current;
    
    // Forzar detener cualquier lectura anterior antes de empezar
    await Speech.stop();
    
    // Pequeño delay para que el TTS engine se limpie
    setTimeout(() => {
      setIsSpeaking(true);
      Speech.speak(plainText, {
        language: 'es-ES',
        pitch: 1.0,
        rate: 1.0,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }, 100);
  }
};

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        {isUser ? (
          <Text style={[styles.text, styles.userText]}>{message.content}</Text>
        ) : (
          <>
            <Markdown style={markdownStyles}>{message.content}</Markdown>
            <TouchableOpacity onPress={handleSpeak} style={styles.speakBtn}>
              <Text style={styles.speakIcon}>{isSpeaking ? '⏹ Detener' : '🔊 Leer'}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      <Text style={styles.timestamp}>
        {message.timestamp.toLocaleTimeString('es-EC', {
          hour: '2-digit', minute: '2-digit',
        })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container:     { marginVertical: 4, marginHorizontal: 12, maxWidth: '80%' },
  userContainer: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  aiContainer:   { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble:        { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  userBubble:    { backgroundColor: '#2563EB', borderBottomRightRadius: 4 },
  aiBubble:      { backgroundColor: '#F1F5F9', borderBottomLeftRadius: 4 },
  text:          { fontSize: 15, lineHeight: 21 },
  userText:      { color: '#FFFFFF' },
  timestamp:     { fontSize: 10, color: '#94A3B8', marginTop: 2 },
  speakBtn:      {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
  },
  speakIcon:     { fontSize: 12, color: '#475569', fontWeight: '600' },
});

const markdownStyles = {
  body:          { color: '#1E293B', fontSize: 15, lineHeight: 21 },
  paragraph:     { marginTop: 0, marginBottom: 4 },
  heading1:      { fontSize: 20, fontWeight: '700' as const, color: '#0F172A', marginBottom: 6 },
  heading2:      { fontSize: 17, fontWeight: '700' as const, color: '#0F172A', marginBottom: 4 },
  heading3:      { fontSize: 15, fontWeight: '600' as const, color: '#0F172A', marginBottom: 4 },
  strong:        { fontWeight: '700' as const, color: '#0F172A' },
  em:            { fontStyle: 'italic' as const },
  code_inline:   {
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    paddingHorizontal: 4,
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#7C3AED',
  },
  fence:         {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
  },
  code_block:    {
    color: '#E2E8F0',
    fontFamily: 'monospace',
    fontSize: 13,
  },
  bullet_list:   { marginVertical: 4 },
  ordered_list:  { marginVertical: 4 },
  list_item:     { marginVertical: 2 },
  blockquote:    {
    backgroundColor: '#E0F2FE',
    borderLeftWidth: 3,
    borderLeftColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  link:          { color: '#2563EB', textDecorationLine: 'underline' as const },
  hr:            { backgroundColor: '#CBD5E1', height: 1, marginVertical: 8 },
};