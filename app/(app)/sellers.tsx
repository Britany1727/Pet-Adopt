import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { GetOrCreateSellerRoomUseCase } from '@features/chat/application/usecases/GetOrCreateSellerRoomUseCase';
import { SupabaseChatRepository } from '@features/chat/infrastructure/repositories/SupabaseChatRepository';
import { supabase } from '@shared/infrastructure/supabase/client';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, SafeAreaView,
} from 'react-native';
import LottieView from 'lottie-react-native';

const C = {
  primary: '#b3006a',
  onPrimary: '#ffffff',
  primaryFixed: '#ffd9e4',
  onTertiaryFixed: '#3e0023',
  tertiaryFixed: '#ffd9e4',
  background: '#f9f9ff',
  surface: '#ffffff',
  onSurface: '#151c27',
  onSurfaceVariant: '#5b3f49',
  outlineVariant: '#e3bdc8',
  outline: '#e3bdc8',
};

const chatRepo = new SupabaseChatRepository();
const getOrCreateSellerRoom = new GetOrCreateSellerRoomUseCase(chatRepo);

interface Seller {
  id: string; username: string; avatar_url?: string;
}

function LottieAvatar({ size }: { size: number }) {
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: C.primaryFixed, borderWidth: 1, borderColor: C.outlineVariant,
      overflow: 'hidden', justifyContent: 'center', alignItems: 'center',
    }}>
      <LottieView
        source={require('../../src/assets/lotties/user.json')}
        autoPlay
        loop
        style={{ width: size * 0.7, height: size * 0.7 }}
      />
    </View>
  );
}

export default function SellersScreen() {
  const user = useAuthStore((s) => s.user);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('role', 'refugio');
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setSellers(data ?? []);
      }
      setLoading(false);
    })();
  }, []);

  const handleSellerPress = async (sellerId: string) => {
    if (!user) return;
    setJoining(sellerId);
    try {
      const room = await getOrCreateSellerRoom.execute(sellerId, user.id);
      router.replace({
        pathname: '/(app)/chat/[roomId]',
        params: { roomId: room.id },
      });
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setJoining(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <LottieView
          source={require('../../src/assets/lotties/flower.json')}
          autoPlay
          loop
          style={styles.lottieBackground}
        />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Refugios</Text>
        </View>
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Selecciona un refugio</Text>
        </View>
        <FlatList
          data={sellers}
          keyExtractor={(s) => s.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleSellerPress(item.id)}
              disabled={joining === item.id}
              activeOpacity={0.85}
            >
              <View style={styles.cardIndicator} />
              <View style={styles.roomContent}>
                <LottieAvatar size={52} />
                <View style={styles.info}>
                  <Text style={styles.name}>{item.username}</Text>
                  <Text style={styles.sub}>Refugio</Text>
                </View>
                {joining === item.id
                  ? <ActivityIndicator size="small" color={C.primary} />
                  : <Text style={styles.arrow}>›</Text>}
              </View>
              <View style={styles.stitchBorder} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <LottieAvatar size={100} />
              <Text style={styles.emptyText}>No hay refugios disponibles</Text>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: C.background },
  center:           { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.background },
  lottieBackground: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%', height: '100%',
    opacity: 0.07, zIndex: 0,
  },
  header: {
    height: 60, backgroundColor: C.surface,
    justifyContent: 'center', paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: C.outlineVariant,
    zIndex: 1,
  },
  headerTitle:      { fontSize: 24, fontWeight: '700', color: C.primary, letterSpacing: -0.5 },
  filterSection:    { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, zIndex: 1 },
  sectionTitle:     { fontSize: 18, fontWeight: '600', color: C.onSurface, marginBottom: 12 },
  list:             { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  card: {
    backgroundColor: C.surface, borderRadius: 12, marginBottom: 16,
    position: 'relative', overflow: 'hidden',
    shadowColor: C.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
    borderWidth: 1, borderColor: C.outlineVariant,
    zIndex: 1,
  },
  cardIndicator: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: 4, backgroundColor: C.primary,
  },
  roomContent:      { flexDirection: 'row', alignItems: 'center', padding: 16 },
  info:             { flex: 1, marginLeft: 14 },
  name:             { fontSize: 16, fontWeight: '600', color: C.onSurface },
  sub:              { fontSize: 13, color: C.onSurfaceVariant, marginTop: 2 },
  arrow:            { fontSize: 24, color: C.primary },
  stitchBorder: {
    position: 'absolute', bottom: 0, left: 16, right: 16,
    borderBottomWidth: 1, borderColor: C.outlineVariant,
  },
  emptyContainer:   { alignItems: 'center', marginTop: 60 },
  emptyText: {
    textAlign: 'center', color: C.onSurfaceVariant,
    marginTop: 16, fontSize: 15, fontWeight: '500',
  },
});
