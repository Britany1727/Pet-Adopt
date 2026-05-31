import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { DeleteMascotasUseCase } from '@features/mascotas/aplication/usecases/DeleteMascotasUseCase';
import { SupabaseMascotasRepository } from '@features/mascotas/infrastructure/repositories/SupabaseMacotasRepository';
import { GetOrCreateSellerRoomUseCase } from '@features/chat/application/usecases/GetOrCreateSellerRoomUseCase';
import { SupabaseChatRepository } from '@features/chat/infrastructure/repositories/SupabaseChatRepository';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView, Platform, Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const chatRepo = new SupabaseChatRepository();
const getOrCreateSellerRoom = new GetOrCreateSellerRoomUseCase(chatRepo);
const mascotasRepo = new SupabaseMascotasRepository();
const deleteMascota = new DeleteMascotasUseCase(mascotasRepo);

export default function MascotaDetailScreen() {
  // --- TU LÓGICA INTACTA ❤️ ---
  const { id, name, especie, edad, tamaño, descripcion, raza, imageUrl, sellerId, sellerName } =
    useLocalSearchParams<{
      id: string; name: string; especie: string; edad: string; tamaño: string;
      descripcion: string; raza: string;
      imageUrl?: string; sellerId: string; sellerName?: string;
    }>();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = () => {
    Alert.alert('Eliminar mascota', `¿Estás seguro de eliminar a "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await deleteMascota.execute(id);
            router.back();
          } catch (e: any) {
            Alert.alert('Error', e.message);
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  const handleChat = async () => {
    if (!user || !sellerId) return;
    setLoading(true);
    try {
      const room = await getOrCreateSellerRoom.execute(sellerId);
      router.push({
        pathname: '/(app)/chat/[roomId]',
        params: { roomId: room.id, productName: name },
      });
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  // --- UI Y DISEÑO ---
  return (
    <View style={styles.container}>
      {/* Fondo de Imagen Absoluto */}
      <View style={styles.bgContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.bgImage} resizeMode="cover" />
        ) : (
          <View style={[styles.bgImage, styles.placeholderBg]}>
            <Text style={styles.placeholderEmoji}>🐾</Text>
          </View>
        )}
      </View>

      {/* Controles Superiores Flotantes */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.glassButton} onPress={() => router.back()} activeOpacity={0.8}>
          <MaterialIcons name="arrow-back" size={24} color="#ac2a5d" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.glassButton} activeOpacity={0.8}>
          <MaterialIcons name="favorite-border" size={24} color="#ac2a5d" />
        </TouchableOpacity>
      </View>

      {/* Contenido Desplazable (Glassmorphism) */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sheet}>
          {/* Header del Sheet */}
          <View style={styles.sheetHeader}>
            <View style={styles.titleArea}>
              <Text style={styles.nameTitle}>{name}</Text>
              <View style={styles.locationRow}>
                <MaterialIcons name="pets" size={16} color="#8a7176" />
                <Text style={styles.locationText}>{especie} • {raza}</Text>
              </View>
            </View>
            <View style={styles.badgeAdoption}>
              <Text style={styles.badgeText}>Adopción</Text>
            </View>
          </View>

          {/* Grid de Atributos */}
          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(252, 157, 65, 0.2)' }]}>
                <MaterialIcons name="calendar-today" size={20} color="#fc9d41" />
              </View>
              <Text style={styles.infoLabel}>EDAD</Text>
              <Text style={styles.infoValue}>{edad} Años</Text>
            </View>
            <View style={styles.infoBox}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(0, 173, 202, 0.2)' }]}>
                <MaterialIcons name="category" size={20} color="#00adca" />
              </View>
              <Text style={styles.infoLabel}>RAZA</Text>
              <Text style={styles.infoValue} numberOfLines={1}>{raza}</Text>
            </View>
            <View style={styles.infoBox}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(172, 42, 93, 0.2)' }]}>
                <MaterialIcons name="straighten" size={20} color="#ac2a5d" />
              </View>
              <Text style={styles.infoLabel}>TAMAÑO</Text>
              <Text style={styles.infoValue}>{tamaño}</Text>
            </View>
          </View>

          {/* Acerca De */}
          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>Sobre {name}</Text>
            <Text style={styles.aboutDesc}>{descripcion}</Text>
          </View>

          {/* Tarjeta de Propietario / Refugio */}
          {sellerName && (
            <View style={styles.shelterCard}>
              <View style={styles.shelterAvatar}>
                <Text style={styles.avatarText}>{sellerName.substring(0, 2).toUpperCase()}</Text>
              </View>
              <View style={styles.shelterInfo}>
                <Text style={styles.shelterName}>{sellerName}</Text>
                <Text style={styles.shelterRole}>Propietario / Refugio</Text>
              </View>
              {user?.role === 'cliente' && (
                <View style={styles.chatIconBadge}>
                  <MaterialIcons name="chat" size={18} color="#ac2a5d" />
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Barra Inferior Fija (Adoptar o Eliminar) */}
      <View style={styles.bottomBar}>
        {user?.id === sellerId ? (
          <TouchableOpacity 
            style={[styles.mainActionBtnWrapper, { shadowColor: '#ba1a1a' }]} 
            onPress={handleDelete} 
            disabled={deleting}
            activeOpacity={0.8}
          >
            <View style={[styles.mainActionBtn, { backgroundColor: '#ffdad6', borderWidth: 1, borderColor: '#ba1a1a' }]}>
              {deleting ? (
                <ActivityIndicator color="#ba1a1a" />
              ) : (
                <>
                  <MaterialIcons name="delete-outline" size={20} color="#ba1a1a" style={{ marginRight: 8 }} />
                  <Text style={[styles.mainActionText, { color: '#ba1a1a' }]}>Eliminar Publicación</Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        ) : (
          user?.role === 'cliente' && (
            <>
              <TouchableOpacity 
                style={styles.mainActionBtnWrapper} 
                onPress={handleChat} 
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient 
                  colors={['#ac2a5d', '#fc9d41']} 
                  start={{x:0,y:0}} end={{x:1,y:1}} 
                  style={styles.mainActionBtn}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.mainActionText}>Preguntar por {name}</Text>
                      <MaterialIcons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.mapBtn}
                onPress={() => router.push({ pathname: '/(app)/map', params: { targetSellerId: sellerId } })}
                activeOpacity={0.8}
              >
                <MaterialIcons name="location-on" size={20} color="#ac2a5d" style={{ marginRight: 6 }} />
                <Text style={styles.mapBtnText}>Ver ubicación del refugio</Text>
              </TouchableOpacity>
            </>
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9ff',
  },
  bgContainer: {
    ...StyleSheet.absoluteFillObject,
    height: height * 0.55,
    zIndex: 0,
  },
  bgImage: {
    width: '100%',
    height: '100%',
  },
  placeholderBg: {
    backgroundColor: '#ffd9e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 80,
  },
  
  // --- Controles Superiores ---
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 50,
  },
  glassButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#ac2a5d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  // --- Scroll y Contenido ---
  scrollContent: {
    flexGrow: 1,
    paddingTop: height * 0.45, // Empuja el contenido hacia abajo
    paddingBottom: 100, // Espacio para la barra fija
  },
  sheet: {
    flex: 1,
    backgroundColor: 'rgba(249, 249, 255, 0.95)', // Casi sólido para lectura
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 10,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  titleArea: {
    flex: 1,
  },
  nameTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#161c28',
    letterSpacing: -0.5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  locationText: {
    fontSize: 14,
    color: '#8a7176',
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  badgeAdoption: {
    backgroundColor: 'rgba(172, 42, 93, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ac2a5d',
  },
  badgeText: {
    color: '#ac2a5d',
    fontWeight: '800',
    fontSize: 14,
  },

  // --- Grid de Atributos ---
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  infoBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#ac2a5d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 10,
    color: '#8a7176',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#161c28',
    marginTop: 2,
    textTransform: 'capitalize',
    textAlign: 'center',
  },

  // --- Acerca De ---
  aboutSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#161c28',
    marginBottom: 12,
  },
  aboutDesc: {
    fontSize: 15,
    color: '#574146',
    lineHeight: 24,
  },

  // --- Tarjeta de Refugio ---
  shelterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#ac2a5d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  shelterAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffd9e1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarText: {
    color: '#ac2a5d',
    fontWeight: '800',
    fontSize: 16,
  },
  shelterInfo: {
    flex: 1,
  },
  shelterName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#161c28',
  },
  shelterRole: {
    fontSize: 13,
    color: '#8a7176',
    marginTop: 2,
    fontWeight: '500',
  },
  chatIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(172, 42, 93, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // --- Barra Inferior ---
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
    backgroundColor: 'rgba(249, 249, 255, 0.9)',
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  mainActionBtnWrapper: {
    shadowColor: '#ac2a5d',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
    borderRadius: 999,
  },
  mainActionBtn: {
    flexDirection: 'row',
    borderRadius: 999,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 12,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#ac2a5d',
  },
  mapBtnText: {
    color: '#ac2a5d',
    fontWeight: '700',
    fontSize: 15,
  },
  mainActionText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
});