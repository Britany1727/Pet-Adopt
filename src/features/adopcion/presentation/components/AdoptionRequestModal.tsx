import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AdoptionRequest, RequestStatus } from '../../domain/entities/Adoptionrequest';

// ── Badge de estado ──────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  RequestStatus,
  { label: string; bg: string; text: string; icon: string }
> = {
  pending:  { label: 'Solicitud enviada',   bg: '#fff3cd', text: '#856404', icon: 'hourglass-empty' },
  accepted: { label: 'Solicitud aceptada',  bg: '#d1e7dd', text: '#0a3622', icon: 'check-circle'    },
  rejected: { label: 'Solicitud rechazada', bg: '#f8d7da', text: '#58151c', icon: 'cancel'          },
};

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <View style={[badgeStyles.container, { backgroundColor: cfg.bg }]}>
      <MaterialIcons
        name={cfg.icon as any}
        size={16}
        color={cfg.text}
        style={{ marginRight: 6 }}
      />
      <Text style={[badgeStyles.text, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 13, fontWeight: '700' },
});

// ── Modal de envío de solicitud ───────────────────────────────────────────────
interface AdoptionRequestModalProps {
  visible: boolean;
  mascotaName: string;
  isSending: boolean;
  existingRequest: AdoptionRequest | null;
  onClose: () => void;
  onSend: (message?: string) => Promise<void>;
  onCancel?: (requestId: string) => void;
}

export function AdoptionRequestModal({
  visible,
  mascotaName,
  isSending,
  existingRequest,
  onClose,
  onSend,
  onCancel,
}: AdoptionRequestModalProps) {
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    await onSend(message.trim() || undefined);
    setMessage('');
    onClose();
  };

  const handleCancel = () => {
    if (existingRequest) {
      onCancel?.(existingRequest.id);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheet}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.pawIcon}>
              <MaterialIcons name="pets" size={28} color="#ac2a5d" />
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={22} color="#8a7176" />
            </TouchableOpacity>
          </View>

          {existingRequest ? (
            // ── Estado: ya existe solicitud ──────────────────────────────────
            <>
              <Text style={styles.title}>Tu solicitud para {mascotaName}</Text>
              <Text style={styles.subtitle}>
                Enviada el{' '}
                {existingRequest.createdAt.toLocaleDateString('es-EC', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>

              <View style={styles.statusSection}>
                <RequestStatusBadge status={existingRequest.status} />
              </View>

              {existingRequest.message && (
                <View style={styles.messageBox}>
                  <Text style={styles.messageLabel}>Tu mensaje:</Text>
                  <Text style={styles.messageText}>{existingRequest.message}</Text>
                </View>
              )}

              {existingRequest.status === 'pending' && (
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={handleCancel}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelBtnText}>Cancelar solicitud</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.closeFullBtn} onPress={onClose}>
                <Text style={styles.closeBtnText}>Cerrar</Text>
              </TouchableOpacity>
            </>
          ) : (
            // ── Formulario: nueva solicitud ──────────────────────────────────
            <>
              <Text style={styles.title}>Solicitar adoptar a {mascotaName}</Text>
              <Text style={styles.subtitle}>
                Cuéntale al refugio por qué serías el hogar ideal
              </Text>

              <TextInput
                style={styles.textarea}
                placeholder={`Hola, me gustaría adoptar a ${mascotaName}. Tengo experiencia con mascotas y un hogar seguro...`}
                placeholderTextColor="rgba(91,63,73,0.45)"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={5}
                maxLength={500}
                textAlignVertical="top"
              />

              <Text style={styles.charCount}>{message.length}/500</Text>

              <TouchableOpacity
                style={[styles.sendBtn, isSending && { opacity: 0.6 }]}
                onPress={handleSend}
                disabled={isSending}
                activeOpacity={0.85}
              >
                {isSending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <MaterialIcons name="send" size={18} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.sendBtnText}>Enviar solicitud</Text>
                  </>
                )}
              </TouchableOpacity>

              <Text style={styles.disclaimer}>
                El refugio recibirá tu nombre de usuario y mensaje. Puedes cancelar tu solicitud en
                cualquier momento mientras esté pendiente.
              </Text>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#f9f9ff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddbfc5',
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pawIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffd9e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#161c28',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#574146',
    marginBottom: 20,
    lineHeight: 20,
  },
  textarea: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e3bdc8',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: '#161c28',
    minHeight: 130,
    lineHeight: 22,
    marginBottom: 6,
  },
  charCount: {
    fontSize: 12,
    color: '#8a7176',
    textAlign: 'right',
    marginBottom: 20,
  },
  sendBtn: {
    flexDirection: 'row',
    backgroundColor: '#ac2a5d',
    borderRadius: 16,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#ac2a5d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  sendBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  disclaimer: {
    fontSize: 12,
    color: '#8a7176',
    textAlign: 'center',
    lineHeight: 18,
  },
  // Estado existente
  statusSection: { marginBottom: 20 },
  messageBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e3bdc8',
    marginBottom: 20,
  },
  messageLabel: { fontSize: 11, fontWeight: '700', color: '#8a7176', marginBottom: 6 },
  messageText: { fontSize: 14, color: '#161c28', lineHeight: 20 },
  cancelBtn: {
    borderWidth: 1.5,
    borderColor: '#ba1a1a',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  cancelBtnText: { color: '#ba1a1a', fontWeight: '700', fontSize: 15 },
  closeFullBtn: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeBtnText: { color: '#574146', fontWeight: '600', fontSize: 15 },
});