import { useAuthStore } from '@features/auth/presentation/store/authStore';
import {
  useIncomingAdoptionRequests,
  useMyAdoptionRequests,
} from '@features/adopcion/presentation/hooks/useAdptionRequest';
import { AdoptionRequest, RequestStatus } from '@features/adopcion/domain/entities/Adoptionrequest';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RequestStatusBadge } from '../components/AdoptionRequestModal';

const { width } = Dimensions.get('window');

const STATUS_FILTER_TABS = [
  { key: 'all',      label: 'Todas'     },
  { key: 'pending',  label: 'Pendientes' },
  { key: 'accepted', label: 'Aceptadas' },
  { key: 'rejected', label: 'Rechazadas' },
] as const;

type FilterKey = 'all' | RequestStatus;

// ── Modal de detalle de solicitud ───────────────────────────────────
function RequestDetailModal({
  visible,
  item,
  isShelter,
  onClose,
  onAccept,
  onReject,
  isUpdating,
  onCancel,
  isCanceling,
}: {
  visible: boolean;
  item: AdoptionRequest | null;
  isShelter: boolean;
  onClose: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  isUpdating?: boolean;
  onCancel?: () => void;
  isCanceling?: boolean;
}) {
  if (!item) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          <View style={modalStyles.handle} />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={modalStyles.scrollContent}>
            <TouchableOpacity style={modalStyles.closeBtn} onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#8a7176" />
            </TouchableOpacity>

            {/* ── Mascota ── */}
            <View style={modalStyles.section}>
              <View style={modalStyles.sectionHeader}>
                <MaterialIcons name="pets" size={18} color="#ac2a5d" />
                <Text style={modalStyles.sectionTitle}>Mascota solicitada</Text>
              </View>
              <View style={modalStyles.petCard}>
                {item.mascotaImageUrl ? (
                  <Image source={{ uri: item.mascotaImageUrl }} style={modalStyles.petImage} />
                ) : (
                  <View style={[modalStyles.petImage, modalStyles.petImagePlaceholder]}>
                    <Text style={{ fontSize: 36 }}>🐾</Text>
                  </View>
                )}
                <View style={modalStyles.petInfo}>
                  <Text style={modalStyles.petName}>{item.mascotaName ?? '—'}</Text>
                  <Text style={modalStyles.petMeta}>
                    {item.mascotaRaza && `${item.mascotaRaza} · `}
                    {item.mascotaEspecie && `${item.mascotaEspecie} · `}
                    {item.mascotaEdad != null && `${item.mascotaEdad} años`}
                  </Text>
                  {item.mascotaTamaño && (
                    <View style={modalStyles.tagRow}>
                      <View style={modalStyles.tag}>
                        <Text style={modalStyles.tagText}>{item.mascotaTamaño}</Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
              {item.mascotaDescripcion && (
                <Text style={modalStyles.petDesc}>{item.mascotaDescripcion}</Text>
              )}
            </View>

            {/* ── Solicitante ── */}
            <View style={modalStyles.section}>
              <View style={modalStyles.sectionHeader}>
                <MaterialIcons name="person" size={18} color="#ac2a5d" />
                <Text style={modalStyles.sectionTitle}>
                  {isShelter ? 'Datos del adoptante' : 'Tu solicitud'}
                </Text>
              </View>
              <View style={modalStyles.clientCard}>
                <View style={modalStyles.clientAvatar}>
                  {item.clientAvatarUrl ? (
                    <Image source={{ uri: item.clientAvatarUrl }} style={modalStyles.clientAvatarImg} />
                  ) : (
                    <Text style={modalStyles.clientAvatarInitial}>
                      {(item.clientUsername ?? '?').charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>
                <View style={modalStyles.clientInfo}>
                  <Text style={modalStyles.clientName}>
                    {item.clientFullName ?? item.clientUsername ?? 'Adoptante'}
                  </Text>
                  {item.clientFullName && item.clientUsername && (
                    <Text style={modalStyles.clientUsernameText}>@{item.clientUsername}</Text>
                  )}
                  {item.clientTelefono && (
                    <View style={modalStyles.clientContactRow}>
                      <MaterialIcons name="phone" size={14} color="#8a7176" />
                      <Text style={modalStyles.clientContactText}>{item.clientTelefono}</Text>
                    </View>
                  )}
                </View>
                <RequestStatusBadge status={item.status} />
              </View>
            </View>

            {/* ── Mensaje ── */}
            {item.message && (
              <View style={modalStyles.section}>
                <View style={modalStyles.sectionHeader}>
                  <MaterialIcons name="message" size={18} color="#ac2a5d" />
                  <Text style={modalStyles.sectionTitle}>Mensaje</Text>
                </View>
                <View style={modalStyles.messageCard}>
                  <Text style={modalStyles.messageText}>{item.message}</Text>
                </View>
              </View>
            )}

            {/* ── Acciones ── */}
            {item.status === 'pending' && isShelter && (
              <View style={modalStyles.actionsRow}>
                <TouchableOpacity style={modalStyles.rejectBtn} onPress={onReject} disabled={isUpdating} activeOpacity={0.8}>
                  <MaterialIcons name="close" size={20} color="#ba1a1a" />
                  <Text style={modalStyles.rejectBtnText}>Rechazar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={modalStyles.acceptBtn} onPress={onAccept} disabled={isUpdating} activeOpacity={0.8}>
                  {isUpdating ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <MaterialIcons name="check" size={20} color="#fff" />
                      <Text style={modalStyles.acceptBtnText}>Aceptar</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {item.status === 'pending' && !isShelter && (
              <TouchableOpacity style={modalStyles.cancelBtn} onPress={onCancel} disabled={isCanceling} activeOpacity={0.8}>
                {isCanceling ? (
                  <ActivityIndicator color="#ba1a1a" size="small" />
                ) : (
                  <>
                    <MaterialIcons name="close" size={20} color="#ba1a1a" />
                    <Text style={modalStyles.cancelBtnText}>Cancelar solicitud</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ── Card para refugio (solicitudes entrantes) ────────────────────────
function ShelterRequestCard({
  item,
  onAccept,
  onReject,
  isUpdating,
  onPress,
}: {
  item: AdoptionRequest;
  onAccept: () => void;
  onReject: () => void;
  isUpdating: boolean;
  onPress: () => void;
}) {
  const dateStr = item.createdAt.toLocaleDateString('es-EC', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <TouchableOpacity style={cardStyles.container} onPress={onPress} activeOpacity={0.85}>
      <View style={[cardStyles.statusStripe,
        item.status === 'pending'  && { backgroundColor: '#f9a825' },
        item.status === 'accepted' && { backgroundColor: '#2e7d32' },
        item.status === 'rejected' && { backgroundColor: '#c62828' },
      ]} />
      <View style={cardStyles.body}>
        <View style={cardStyles.topRow}>
          <View style={cardStyles.avatarCircle}>
            <Text style={cardStyles.avatarInitial}>
              {(item.clientUsername ?? '?').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={cardStyles.clientName}>{item.clientUsername ?? 'Adoptante'}</Text>
            <Text style={cardStyles.dateText}>{dateStr}</Text>
          </View>
          <RequestStatusBadge status={item.status} />
        </View>
        <View style={cardStyles.mascotaRow}>
          {item.mascotaImageUrl ? (
            <Image source={{ uri: item.mascotaImageUrl }} style={cardStyles.mascotaThumb} />
          ) : (
            <View style={[cardStyles.mascotaThumb, cardStyles.mascotaThumbPlaceholder]}>
              <Text style={{ fontSize: 18 }}>🐾</Text>
            </View>
          )}
          <View style={{ marginLeft: 10 }}>
            <Text style={cardStyles.mascotaLabel}>Mascota solicitada</Text>
            <Text style={cardStyles.mascotaName}>{item.mascotaName ?? '—'}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color="#ddbfc5" />
        </View>
        {item.message ? (
          <View style={cardStyles.messageBox}>
            <MaterialIcons name="format-quote" size={16} color="#8a7176" style={{ marginBottom: 4 }} />
            <Text style={cardStyles.messageText} numberOfLines={2}>{item.message}</Text>
          </View>
        ) : null}
        {item.status === 'pending' && (
          <View style={cardStyles.actionsRow}>
            <TouchableOpacity style={[cardStyles.actionBtn, cardStyles.rejectBtn]} onPress={onReject} disabled={isUpdating} activeOpacity={0.8}>
              <MaterialIcons name="close" size={18} color="#ba1a1a" />
              <Text style={cardStyles.rejectBtnText}>Rechazar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[cardStyles.actionBtn, cardStyles.acceptBtn]} onPress={onAccept} disabled={isUpdating} activeOpacity={0.8}>
              {isUpdating ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <MaterialIcons name="check" size={18} color="#fff" />
                  <Text style={cardStyles.acceptBtnText}>Aceptar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ── Card para cliente (mis solicitudes) estilo chat ──────────────────
function ClientRequestCard({
  item,
  onCancel,
  isCanceling,
  onPress,
}: {
  item: AdoptionRequest;
  onCancel: () => void;
  isCanceling: boolean;
  onPress: () => void;
}) {
  const statusColor =
    item.status === 'pending'  ? '#f9a825' :
    item.status === 'accepted' ? '#2e7d32' : '#c62828';

  return (
    <TouchableOpacity style={clientStyles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={clientStyles.row}>
        {/* Avatar de la mascota */}
        <View style={clientStyles.avatar}>
          {item.mascotaImageUrl ? (
            <Image source={{ uri: item.mascotaImageUrl }} style={clientStyles.avatarImg} />
          ) : (
            <Text style={clientStyles.avatarEmoji}>🐾</Text>
          )}
        </View>

        <View style={clientStyles.info}>
          <View style={clientStyles.nameRow}>
            <Text style={clientStyles.mascotaName} numberOfLines={1}>
              {item.mascotaName ?? 'Mascota'}
            </Text>
            <View style={[clientStyles.statusDot, { backgroundColor: statusColor }]} />
          </View>
          <Text style={clientStyles.shelterText} numberOfLines={1}>
            {item.sellerUsername ?? 'Refugio'}
          </Text>
          <Text style={clientStyles.statusText}>
            {item.status === 'pending'  ? 'Pendiente' :
             item.status === 'accepted' ? 'Aceptada'  : 'Rechazada'}
          </Text>
        </View>

        {item.status === 'pending' && (
          <TouchableOpacity
            style={clientStyles.cancelBtn}
            onPress={onCancel}
            disabled={isCanceling}
            activeOpacity={0.7}
          >
            {isCanceling ? (
              <ActivityIndicator size="small" color="#ba1a1a" />
            ) : (
              <MaterialIcons name="close" size={20} color="#ba1a1a" />
            )}
          </TouchableOpacity>
        )}

        {item.status !== 'pending' && (
          <View style={clientStyles.chevron}>
            <MaterialIcons name="check-circle" size={22} color={statusColor} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export function AdoptionRequestsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isShelter = user?.role === 'refugio';

  const {
    incomingRequests,
    isLoading: incomingLoading,
    pendingCount,
    updateStatus,
    isUpdating,
  } = useIncomingAdoptionRequests();

  const {
    myRequests,
    isLoading: myLoading,
    cancelRequest,
    isCanceling,
  } = useMyAdoptionRequests();

  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<AdoptionRequest | null>(null);

  const data = isShelter ? incomingRequests : myRequests;
  const loading = isShelter ? incomingLoading : myLoading;
  const count = isShelter ? pendingCount : data.filter((r) => r.status === 'pending').length;

  const filtered =
    activeFilter === 'all'
      ? data
      : data.filter((r) => r.status === activeFilter);

  // ── Handlers ──────────────────────────────────────────────────────
  const handleStatusChange = (item: AdoptionRequest, newStatus: RequestStatus) => {
    const actionText = newStatus === 'accepted' ? 'aceptar' : 'rechazar';
    Alert.alert(
      `¿${newStatus === 'accepted' ? 'Aceptar' : 'Rechazar'} solicitud?`,
      `Vas a ${actionText} la solicitud de ${item.clientUsername ?? 'este adoptante'} para ${item.mascotaName ?? 'la mascota'}.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: newStatus === 'accepted' ? 'Aceptar' : 'Rechazar',
          style: newStatus === 'accepted' ? 'default' : 'destructive',
          onPress: async () => {
            setUpdatingId(item.id);
            try { await updateStatus({ id: item.id, status: newStatus }); }
            finally { setUpdatingId(null); }
          },
        },
      ],
    );
  };

  const handleCancel = (item: AdoptionRequest) => {
    Alert.alert(
      'Cancelar solicitud',
      `¿Cancelar la solicitud de ${item.mascotaName ?? 'esta mascota'}?`,
      [
        { text: 'No', style: 'cancel' },
        { text: 'Cancelar solicitud', style: 'destructive', onPress: () => cancelRequest(item.id) },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.ambientContainer} pointerEvents="none">
        <View style={[styles.ambientGlow, styles.glowTop]} />
        <View style={[styles.ambientGlow, styles.glowBottom]} />
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#ac2a5d" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerTitle}>Solicitudes</Text>
            {count > 0 && (
              <Text style={styles.headerSubtitle}>
                {count} pendiente{count !== 1 ? 's' : ''}
              </Text>
            )}
          </View>
          {count > 0 && (
            <View style={styles.badgeCount}>
              <Text style={styles.badgeCountText}>{count}</Text>
            </View>
          )}
        </View>

        <View style={styles.tabsRow}>
          {STATUS_FILTER_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeFilter === tab.key && styles.tabActive]}
              onPress={() => setActiveFilter(tab.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeFilter === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={styles.loaderCenter}>
            <ActivityIndicator size="large" color="#ac2a5d" />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(r) => r.id}
            renderItem={({ item }) =>
              isShelter ? (
                <ShelterRequestCard
                  item={item}
                  isUpdating={updatingId === item.id && isUpdating}
                  onAccept={() => handleStatusChange(item, 'accepted')}
                  onReject={() => handleStatusChange(item, 'rejected')}
                  onPress={() => setSelectedRequest(item)}
                />
              ) : (
                <ClientRequestCard
                  item={item}
                  onCancel={() => handleCancel(item)}
                  isCanceling={isCanceling}
                  onPress={() => setSelectedRequest(item)}
                />
              )
            }
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <LottieView
                  source={require('../../../../assets/lotties/No Search result (1).json')}
                  autoPlay
                  loop
                  style={{ width: 160, height: 160 }}
                />
                <Text style={styles.emptyTitle}>Sin solicitudes</Text>
                <Text style={styles.emptySubtitle}>
                  {activeFilter === 'all'
                    ? isShelter
                      ? 'Aún no has recibido solicitudes de adopción'
                      : 'No has enviado solicitudes de adopción'
                    : `No hay solicitudes ${
                        activeFilter === 'pending'
                          ? 'pendientes'
                          : activeFilter === 'accepted'
                          ? 'aceptadas'
                          : 'rechazadas'
                      }`}
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>

      <RequestDetailModal
        visible={!!selectedRequest}
        item={selectedRequest}
        isShelter={isShelter}
        onClose={() => setSelectedRequest(null)}
        onAccept={selectedRequest ? () => handleStatusChange(selectedRequest, 'accepted') : undefined}
        onReject={selectedRequest ? () => handleStatusChange(selectedRequest, 'rejected') : undefined}
        isUpdating={updatingId === selectedRequest?.id && isUpdating}
        onCancel={selectedRequest ? () => handleCancel(selectedRequest) : undefined}
        isCanceling={isCanceling}
      />
    </View>
  );
}

const cardStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.85)',
    shadowColor: '#ac2a5d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
  },
  statusStripe: {
    width: 5,
    backgroundColor: '#e3bdc8',
  },
  body: { flex: 1, padding: 16 },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#ffd9e1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarInitial: { fontSize: 20, fontWeight: '800', color: '#ac2a5d' },
  clientName: { fontSize: 16, fontWeight: '800', color: '#161c28' },
  dateText: { fontSize: 12, color: '#8a7176', marginTop: 2 },
  mascotaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(172,42,93,0.06)',
    borderRadius: 10,
    padding: 10,
  },
  mascotaThumb: { width: 44, height: 44, borderRadius: 8, resizeMode: 'cover' },
  mascotaThumbPlaceholder: {
    backgroundColor: '#ffb1c5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascotaLabel: { fontSize: 10, color: '#8a7176', fontWeight: '700', letterSpacing: 0.5 },
  mascotaName: { fontSize: 15, fontWeight: '700', color: '#ac2a5d', marginTop: 2 },
  messageBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#ac2a5d',
    marginBottom: 14,
  },
  messageText: { fontSize: 14, color: '#574146', lineHeight: 20 },
  noMessage: { fontSize: 13, color: '#8a7176', fontStyle: 'italic', marginBottom: 14 },
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  rejectBtn: { borderWidth: 1.5, borderColor: '#ba1a1a' },
  rejectBtnText: { color: '#ba1a1a', fontWeight: '700', fontSize: 14 },
  acceptBtn: { backgroundColor: '#2e7d32' },
  acceptBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});

const clientStyles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.85)',
    shadowColor: '#ac2a5d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ffd9e1',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mascotaName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#161c28',
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  shelterText: {
    fontSize: 13,
    color: '#8a7176',
    marginTop: 2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#574146',
    marginTop: 1,
    textTransform: 'capitalize',
  },
  cancelBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(186,26,26,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  chevron: {
    marginLeft: 8,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9ff' },
  ambientContainer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  ambientGlow: { position: 'absolute', borderRadius: 999, opacity: 0.25 },
  glowTop: {
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: '#ffd9e1',
    top: -width * 0.2,
    right: -width * 0.1,
  },
  glowBottom: {
    width: width * 0.7,
    height: width * 0.7,
    backgroundColor: '#abedff',
    bottom: -width * 0.2,
    left: -width * 0.1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 12 : 24,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#161c28', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, color: '#574146', marginTop: 1 },
  badgeCount: {
    backgroundColor: '#ac2a5d',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeCountText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  tabActive: {
    backgroundColor: 'rgba(172,42,93,0.12)',
    borderColor: '#ac2a5d',
  },
  tabText: { fontSize: 13, fontWeight: '600', color: '#574146' },
  tabTextActive: { color: '#ac2a5d' },
  list: { paddingTop: 4, paddingBottom: 40 },
  loaderCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#161c28', marginTop: 12 },
  emptySubtitle: {
    fontSize: 14,
    color: '#574146',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#f9f9ff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#ddbfc5', alignSelf: 'center', marginTop: 10, marginBottom: 4,
  },
  scrollContent: { padding: 20 },
  closeBtn: {
    alignSelf: 'flex-end', width: 36, height: 36,
    borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
  },
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#ac2a5d', letterSpacing: 0.5 },
  petCard: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
  },
  petImage: { width: 80, height: 80, borderRadius: 12, resizeMode: 'cover' },
  petImagePlaceholder: {
    backgroundColor: '#ffb1c5', justifyContent: 'center', alignItems: 'center',
  },
  petInfo: { flex: 1, marginLeft: 14, justifyContent: 'center' },
  petName: { fontSize: 18, fontWeight: '800', color: '#161c28' },
  petMeta: { fontSize: 13, color: '#574146', marginTop: 4 },
  tagRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  tag: {
    backgroundColor: 'rgba(172,42,93,0.1)', paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 999,
  },
  tagText: { fontSize: 11, fontWeight: '700', color: '#ac2a5d' },
  petDesc: {
    fontSize: 14, color: '#574146', lineHeight: 20, marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 12, padding: 12,
  },
  clientCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
  },
  clientAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#ffd9e1', justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden',
  },
  clientAvatarImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  clientAvatarInitial: { fontSize: 20, fontWeight: '800', color: '#ac2a5d' },
  clientInfo: { flex: 1, marginLeft: 14 },
  clientName: { fontSize: 16, fontWeight: '800', color: '#161c28' },
  clientUsernameText: { fontSize: 13, color: '#8a7176', marginTop: 1 },
  clientContactRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  clientContactText: { fontSize: 13, color: '#574146' },
  messageCard: {
    backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 16, padding: 16,
    borderLeftWidth: 3, borderLeftColor: '#ac2a5d',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
  },
  messageText: { fontSize: 15, color: '#574146', lineHeight: 22 },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  rejectBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: '#ba1a1a',
  },
  rejectBtnText: { color: '#ba1a1a', fontWeight: '700', fontSize: 15 },
  acceptBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 14, borderRadius: 14,
    backgroundColor: '#2e7d32',
  },
  acceptBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cancelBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: '#ba1a1a',
    marginTop: 8,
  },
  cancelBtnText: { color: '#ba1a1a', fontWeight: '700', fontSize: 15 },
});