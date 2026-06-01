import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { Room } from "@features/chat/domain/entities/Message";
import { SupabaseChatRepository } from "@features/chat/infrastructure/repositories/SupabaseChatRepository";
import { supabase } from "@shared/infrastructure/supabase/client";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type SellerRoom = Room;
const chatRepo = new SupabaseChatRepository();

function LottieAvatar({ size }: { size: number }) {
  return (
    <View style={[styles.avatarWrapper, { width: size, height: size, borderRadius: size / 2 }]}>
      <LottieView
        source={require("../../src/assets/lotties/user.json")}
        autoPlay
        loop
        style={{ width: size, height: size }}
      />
    </View>
  );
}

export default function GeneralChatScreen() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [myRooms, setMyRooms] = useState<SellerRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        if (user.role === "refugio") {
          setIsLoading(true);
          const rooms = await chatRepo.getRooms();
          const sellerRooms = rooms.filter((r) => r.sellerId === user.id);
          const clientIds = [
            ...new Set(sellerRooms.map((r) => r.clientId).filter(Boolean)),
          ];
          if (clientIds.length > 0) {
            const { data: profiles } = await supabase
              .from("profiles")
              .select("id, username")
              .in("id", clientIds);
            const profileMap = new Map(
              (profiles ?? []).map((p) => [p.id, p.username]),
            );
            setMyRooms(
              sellerRooms.map((r) => ({
                ...r,
                clientUsername: profileMap.get(r.clientId),
              })),
            );
          } else {
            setMyRooms(sellerRooms);
          }
        } else {
          router.replace("/(app)/sellers");
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user]);

  if (error) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const renderRoom = ({ item }: { item: SellerRoom }) => (
    <TouchableOpacity
      style={styles.glassCard}
      activeOpacity={0.8}
      onPress={() =>
        router.push({
          pathname: "/(app)/chat/[roomId]",
          params: { roomId: item.id, productName: item.mascotaName ?? "Chat" },
        })
      }
    >
      <View style={styles.roomContent}>
        <LottieAvatar size={56} />
        <View style={styles.roomInfo}>
          <View style={styles.nameHeader}>
            <Text style={styles.clientName} numberOfLines={1}>
              {item.clientUsername || "Adoptante"}
            </Text>
            <Text style={styles.timeTag}>Ahora</Text>
          </View>
          
          {item.mascotaName ? (
            <View style={styles.badgeRow}>
              <View style={styles.glassBadge}>
                <View style={{ marginRight: 4 }}>
                  <MaterialIcons name="pets" size={12} color="#ac2a5d" />
                </View>
                <Text style={styles.glassBadgeText} numberOfLines={1}>{item.mascotaName}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.lastMessagePlaceholder}>
              Toca para abrir la conversación
            </Text>
          )}
        </View>
        
        <View style={styles.actionIcon}>
          <MaterialIcons name="chevron-right" size={24} color="#8a7176" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.ambientContainer} pointerEvents="none">
        <View style={[styles.ambientGlow, styles.glowTop]} />
        <View style={[styles.ambientGlow, styles.glowBottom]} />
      </View>

      <LottieView
        source={require("../../src/assets/lotties/pet2.json")}
        autoPlay
        loop
        style={styles.lottieBackground}
        pointerEvents="none"
      />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.topAppBar}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#ac2a5d" />
          </TouchableOpacity>
          <View style={styles.brandContainer}>
            <MaterialIcons name="forum" size={24} color="#ac2a5d" />
            <Text style={styles.brandText}>Mensajes</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Mis chats con adoptantes</Text>
        </View>

        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#ac2a5d" />
          </View>
        ) : (
          <FlatList
            data={myRooms}
            keyExtractor={(r) => r.id}
            renderItem={renderRoom}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <LottieAvatar size={100} />
                <Text style={styles.emptyText}>
                  No tienes chats activos aún
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f9f9ff' 
  },
  
  ambientContainer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  ambientGlow: { position: 'absolute', borderRadius: 999, opacity: 0.3 },
  glowTop: {
    width: width * 0.8, height: width * 0.8, backgroundColor: '#ffd9e1',
    top: -width * 0.2, left: -width * 0.2,
  },
  glowBottom: {
    width: width * 0.8, height: width * 0.8, backgroundColor: '#abedff',
    bottom: -width * 0.2, right: -width * 0.2,
  },
  
  lottieBackground: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    width: "100%", height: "100%",
    opacity: 0.05,
    zIndex: 0,
  },

  topAppBar: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'ios' ? 10 : 20, 
    paddingBottom: 16,
  },
  backButton: {
    width: 40, height: 40, 
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  brandContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandText: { fontSize: 20, fontWeight: '800', color: '#ac2a5d', letterSpacing: -0.5 },

  filterSection: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  sectionTitle: { fontSize: 22, fontWeight: "800", color: "#161c28", letterSpacing: -0.5 },
  list: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
  
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#ac2a5d',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  roomContent: { 
    flexDirection: "row", 
    alignItems: "center", 
    padding: 16 
  },
  
  avatarWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1.5,
    borderColor: '#ffd9e1',
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: '#ac2a5d',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  
  roomInfo: { flex: 1, marginLeft: 16 },
  nameHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  clientName: { fontSize: 17, fontWeight: "700", color: "#161c28", flex: 1, paddingRight: 8 },
  timeTag: { fontSize: 12, color: "#fc9d41", fontWeight: "700" },
  
  badgeRow: { flexDirection: "row", marginTop: 2 },
  glassBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(172, 42, 93, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(172, 42, 93, 0.15)',
  },
  glassBadgeText: {
    fontSize: 12,
    color: "#ac2a5d",
    fontWeight: "700",
  },
  lastMessagePlaceholder: { fontSize: 14, color: "#8a7176" },
  
  actionIcon: {
    marginLeft: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#ba1a1a", fontSize: 14, textAlign: "center", paddingHorizontal: 32, fontWeight: '600' },
  emptyContainer: { alignItems: "center", marginTop: 80, opacity: 0.7 },
  emptyText: { textAlign: "center", color: "#8a7176", fontSize: 16, fontWeight: "600", marginTop: 20 },
});