import { useState } from 'react';
import { useAuth } from '@features/auth/presentation/hooks/useAuth';
import { useMascotas } from '@features/mascotas/presentation/hooks/useMascotas';
import { Mascotas } from '@features/mascotas/domain/entities/Mascotas';
import { useIncomingAdoptionRequests } from '@features/adopcion/presentation/hooks/useAdptionRequest';
import { useRouter } from 'expo-router';
import {
  View, Text, Image, ScrollView, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, Dimensions, Platform, TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

const MASCOTA_CARD_W = (width - 20 * 2 - 16) / 2;

function MascotaCard({ item, onPress, onMapPress }: { item: Mascotas; onPress: () => void; onMapPress: () => void }) {
  return (
    <TouchableOpacity style={styles.glassCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardImageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Text style={styles.cardEmoji}>🐾</Text>
          </View>
        )}
        <TouchableOpacity style={styles.favoriteBtn} activeOpacity={0.7}>
          <MaterialIcons name="favorite-border" size={18} color="#fff" />
        </TouchableOpacity>
        <View style={styles.floatingTags}>
          <View style={styles.floatingTag}>
            <Text style={styles.floatingTagText}>{item.tamaño}</Text>
          </View>
        </View>
        {item.adopted && (
          <View style={styles.adoptedOverlay}>
            <Text style={styles.adoptedText}>Adoptada</Text>
          </View>
        )}
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          <MaterialIcons name="pets" size={14} color="#ac2a5d" />
        </View>
        <View style={styles.cardMetaRow}>
          <Text style={styles.cardMetaText} numberOfLines={1}>{item.raza}</Text>
          <View style={styles.dotSeparator} />
          <Text style={styles.cardMetaText}>{item.edad} años</Text>
        </View>
        <TouchableOpacity style={styles.knowMoreBtn} onPress={onMapPress}>
          <Text style={styles.knowMoreText}>📍 Mapa</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function MascotaGrid({ items, onItemPress, onMapPress }: { items: Mascotas[]; onItemPress: (m: Mascotas) => void; onMapPress: (m: Mascotas) => void }) {
  const rows: Mascotas[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }
  if (rows.length === 0) return null;
  return (
    <View style={styles.gridContainer}>
      {rows.map((row, ri) => (
        <View key={ri} style={styles.gridRow}>
          {row.map((m) => (
            <MascotaCard key={m.id} item={m} onPress={() => onItemPress(m)} onMapPress={() => onMapPress(m)} />
          ))}
          {row.length === 1 && <View style={{ width: MASCOTA_CARD_W }} />}
        </View>
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const { mascotas, isLoading, error } = useMascotas();
  const { pendingCount } = useIncomingAdoptionRequests();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEspecie, setSelectedEspecie] = useState('');
  const [selectedShelter, setSelectedShelter] = useState('');

  const uniqueShelters = [...new Set(mascotas.map(m => m.sellerName).filter(Boolean))] as string[];

  const handleMascotaPress = (mascota: Mascotas) => {
    router.push({
      pathname: '/(app)/mascota/[id]',
      params: {
        id: mascota.id, name: mascota.name,
        especie: mascota.especie, edad: String(mascota.edad),
        tamaño: mascota.tamaño, descripcion: mascota.descripcion,
        raza: mascota.raza,
        imageUrl: mascota.imageUrl ?? '', sellerId: mascota.sellerId,
        sellerName: mascota.sellerName ?? '',
      },
    });
  };

  const filteredAll = mascotas
    .filter(m => user?.role === 'refugio' ? m.sellerId === user.id : true)
    .filter(m => selectedEspecie === '' || m.especie.toLowerCase().startsWith(selectedEspecie.toLowerCase()))
    .filter(m => selectedShelter === '' || m.sellerName?.toLowerCase().includes(selectedShelter.toLowerCase()))
    .filter(m => {
      if (searchQuery === '') return true;
      const q = searchQuery.toLowerCase();
      return m.name.toLowerCase().includes(q)
        || m.especie.toLowerCase().includes(q)
        || m.raza.toLowerCase().includes(q)
        || String(m.edad).includes(q);
    });

  const disponibles = filteredAll.filter(m => !m.adopted);
  const adoptadas = filteredAll.filter(m => m.adopted);

  return (
    <View style={{ flex: 1 }}>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
    <View style={styles.container}>
      <View style={styles.ambientContainer} pointerEvents="none">
        <View style={[styles.ambientGlow, styles.glowTop]} />
        <View style={[styles.ambientGlow, styles.glowBottom]} />
        <LottieView
          source={require("../../src/assets/lotties/huellas.json")}
          autoPlay
          loop
          style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.08 }}
        />
      </View>

      <View style={styles.topAppBar}>
        <View style={styles.brandContainer}>
          <MaterialIcons name="pets" size={28} color="#ac2a5d" />
          <Text style={styles.brandText}>PetAdopt</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(app)/profile' as any)} style={styles.avatarBtn}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
          ) : (
            <LottieView
              source={require('../../src/assets/lotties/user.json')}
              autoPlay
              loop
              style={{ width: 36, height: 36 }}
            />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <MaterialIcons name="search" size={20} color="#8a7176" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, raza, especie, edad..."
            placeholderTextColor="#8a7176"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={20} color="#8a7176" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRowContent}>
          <TouchableOpacity
            style={[styles.categoryChip, selectedEspecie === '' && styles.categoryChipActive]}
            onPress={() => setSelectedEspecie('')}
          >
            <MaterialIcons name="pets" size={18} color={selectedEspecie === '' ? '#ac2a5d' : '#574146'} />
            <Text style={[styles.categoryChipText, selectedEspecie === '' && styles.categoryChipTextActive]}>Todos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryChip, selectedEspecie === 'Perro' && styles.categoryChipActive]}
            onPress={() => setSelectedEspecie(selectedEspecie === 'Perro' ? '' : 'Perro')}
          >
            <MaterialIcons name="pets" size={18} color={selectedEspecie === 'Perro' ? '#ac2a5d' : '#574146'} />
            <Text style={[styles.categoryChipText, selectedEspecie === 'Perro' && styles.categoryChipTextActive]}>Perros</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryChip, selectedEspecie === 'Gato' && styles.categoryChipActive]}
            onPress={() => setSelectedEspecie(selectedEspecie === 'Gato' ? '' : 'Gato')}
          >
            <MaterialIcons name="pets" size={18} color={selectedEspecie === 'Gato' ? '#ac2a5d' : '#574146'} />
            <Text style={[styles.categoryChipText, selectedEspecie === 'Gato' && styles.categoryChipTextActive]}>Gatos</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {uniqueShelters.length > 1 && (
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRowContent}>
            <TouchableOpacity
              style={[styles.categoryChip, selectedShelter === '' && styles.categoryChipActive]}
              onPress={() => setSelectedShelter('')}
            >
              <MaterialIcons name="location-city" size={18} color={selectedShelter === '' ? '#ac2a5d' : '#574146'} />
              <Text style={[styles.categoryChipText, selectedShelter === '' && styles.categoryChipTextActive]}>Todos los refugios</Text>
            </TouchableOpacity>
            {uniqueShelters.map((shelter) => (
              <TouchableOpacity
                key={shelter}
                style={[styles.categoryChip, selectedShelter === shelter && styles.categoryChipActive]}
                onPress={() => setSelectedShelter(selectedShelter === shelter ? '' : shelter)}
              >
                <MaterialIcons name="home" size={18} color={selectedShelter === shelter ? '#ac2a5d' : '#574146'} />
                <Text style={[styles.categoryChipText, selectedShelter === shelter && styles.categoryChipTextActive]} numberOfLines={1}>
                  {shelter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>Oops: {error.message}</Text>
        </View>
      )}

      {isLoading ? (
        <ActivityIndicator size="large" color="#ac2a5d" style={{ marginTop: 80 }} />
      ) : searchQuery !== '' ? (
        <FlatList
          data={filteredAll}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.searchListContent}
          ListHeaderComponent={
            filteredAll.length > 0 ? (
              <Text style={styles.searchResultsCount}>{filteredAll.length} resultado{filteredAll.length !== 1 ? 's' : ''}</Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.searchEmpty}>
              <MaterialIcons name="search-off" size={48} color="#ddbfc5" />
              <Text style={styles.searchEmptyText}>{`Sin resultados para "${searchQuery}"`}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.searchResultRow} onPress={() => handleMascotaPress(item)} activeOpacity={0.7}>
              <View style={styles.searchResultAvatar}>
                {item.imageUrl
                  ? <Image source={{ uri: item.imageUrl }} style={styles.searchResultAvatarImg} />
                  : <MaterialIcons name="pets" size={22} color="#ac2a5d" />
                }
              </View> 
              <View style={styles.searchResultInfo}>
                <Text style={styles.searchResultName}>{item.name}</Text>
                <Text style={styles.searchResultMeta}>
                  {item.raza} · {item.especie} · {item.edad} años
                </Text>
                {item.sellerName && (
                  <Text style={styles.searchResultShelter}>{item.sellerName}</Text>
                )}
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#ddbfc5" />
            </TouchableOpacity>
          )}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroSection}>
            <LottieView
              source={selectedEspecie === 'Gato' ? require("../../src/assets/lotties/pet.json") : require("../../src/assets/lotties/pet4.json")}
              autoPlay
              loop
              style={{ width: 100, height: 100, alignSelf: 'center' }}
            />
            <Text style={styles.heroTitle}>Encuentra tu compañero</Text>
            <Text style={styles.heroSub}>Hola, {user?.username} 👋 — estos peludos te esperan</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                {user?.role === 'refugio' ? '🏡 Refugio' : '🐾 Cliente'}
              </Text>
            </View>
          </View>

          {user?.role === 'refugio' && (
            <View style={styles.refugioControls}>
              <TouchableOpacity style={styles.rainbowActionBtn} onPress={() => router.push({ pathname: '/(app)/create-mascota' })}>
                <LinearGradient colors={['#ac2a5d', '#fc9d41']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.gradientFill}>
                  <Text style={styles.rainbowBtnText}>+ Nueva mascota</Text>
                </LinearGradient>
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  style={[styles.glassActionBtn, { flex: 1, flexDirection: 'row', gap: 8 }]}
                  onPress={() => router.push('/(app)/adoption-request' as any)}
                  activeOpacity={0.85}
                >
                  <MaterialIcons name="favorite" size={18} color="#ac2a5d" />
                  <Text style={styles.glassBtnText}>Solicitudes</Text>
                  {pendingCount > 0 && (
                    <View style={{
                      backgroundColor: '#ac2a5d', borderRadius: 10, minWidth: 20,
                      height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5,
                    }}>
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>{pendingCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.glassActionBtn, { flex: 1 }]}
                  onPress={() => router.push('/(app)/location-settings' as any)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.glassBtnText}>📍 Ubicación</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {user?.role !== 'refugio' && (
            <LinearGradient colors={['#ac2a5d', '#fc9d41', '#00adca']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.promoBanner}>
              <View style={{ flex: 1 }}>
                <Text style={styles.promoTitle}>¿Quieres adoptar?</Text>
                <Text style={styles.promoSub}>Conoce a nuestros animales</Text>
                <TouchableOpacity style={styles.promoBtn} onPress={() => router.push({ pathname: '/(app)/general-chat' })}>
                  <Text style={styles.promoBtnText}>Contactar</Text>
                </TouchableOpacity>
              </View>
              <LottieView
                source={selectedEspecie === 'Gato' ? require("../../src/assets/lotties/gato.json") : require("../../src/assets/lotties/pet3.json")}
                autoPlay
                loop
                style={{ width: 80, height: 80 }}
              />
            </LinearGradient>
          )}

          {disponibles.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>
                {user?.role === 'refugio' ? 'Mascotas buscando hogar' : 'Amigos buscando hogar'}
              </Text>
              <MascotaGrid items={disponibles} onItemPress={handleMascotaPress} onMapPress={(m) => router.push({ pathname: '/(app)/map', params: { targetSellerId: m.sellerId } })} />
            </>
          )}

          {adoptadas.length > 0 && (
            <>
              <View style={styles.sectionDivider} />
              <Text style={styles.sectionTitle}>Mascotas adoptadas</Text>
              <MascotaGrid items={adoptadas} onItemPress={handleMascotaPress} onMapPress={(m) => router.push({ pathname: '/(app)/map', params: { targetSellerId: m.sellerId } })} />
            </>
          )}

          {disponibles.length === 0 && adoptadas.length === 0 && (
            <Text style={styles.empty}>
              {user?.role === 'refugio' ? 'No tienes mascotas registradas' : 'No hay mascotas disponibles'}
            </Text>
          )}

          <View style={{ height: 160 }} />
        </ScrollView>
      )}

      <TouchableOpacity
        style={[styles.fabIa, user?.role === 'refugio' ? { bottom: 168 } : { bottom: 100 }]}
        activeOpacity={0.8}
        onPress={() => router.push({ pathname: '/(app)/chat-ia' })}
      >
        <LinearGradient colors={['#ac2a5d', '#fc9d41', '#00687a']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.fab}>
          <MaterialIcons name="smart-toy" size={24} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      {user?.role === 'refugio' && (
        <TouchableOpacity
          style={[styles.fabIa, { bottom: 100 }]}
          activeOpacity={0.8}
          onPress={() => router.push({ pathname: '/(app)/create-mascota' })}
        >
          <LinearGradient colors={['#ac2a5d', '#fc9d41']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.fab}>
            <MaterialIcons name="add" size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      )}

    </View>
    </KeyboardAvoidingView>
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navItemActive}>
            <MaterialIcons name="pets" size={24} color="#6d3a00" />
          </View>
          <Text style={styles.navTextActive}>Descubrir</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push({ pathname: '/(app)/general-chat' })}>
          <MaterialIcons name="chat-bubble-outline" size={24} color="#8a7176" />
          <Text style={styles.navText}>Mensajes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(app)/adoption-request' as any)}>
          <View style={{ position: 'relative' }}>
            <MaterialIcons name="favorite" size={24} color="#8a7176" />
            {pendingCount > 0 && (
              <View style={styles.navBadge}>
                <Text style={styles.navBadgeText}>{pendingCount}</Text>
              </View>
            )}
          </View>
          <Text style={styles.navText}>Solicitudes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(app)/map' as any)}>
          <MaterialIcons name="map" size={24} color="#8a7176" />
          <Text style={styles.navText}>Mapa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => logout()}>
          <MaterialIcons name="logout" size={24} color="#8a7176" />
          <Text style={styles.navText}>Salir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9ff' },
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

  topAppBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 16,
    backgroundColor: 'rgba(249, 249, 255, 0.6)',
  },
  brandContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandText: { fontSize: 24, fontWeight: '800', color: '#ac2a5d', letterSpacing: -0.5 },
  avatarBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2, borderColor: 'rgba(172, 42, 93, 0.2)',
  },
  avatarImage: { width: 44, height: 44, borderRadius: 22, resizeMode: 'cover' },
  searchContainer: { paddingHorizontal: 20, paddingBottom: 16 },
  searchInputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 999, paddingHorizontal: 16, height: 48,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: '#161c28' },

  searchListContent: { padding: 20, paddingBottom: 160 },
  searchResultsCount: { fontSize: 13, color: '#8a7176', fontWeight: '600', marginBottom: 12 },
  searchEmpty: { alignItems: 'center', marginTop: 60 },
  searchEmptyText: { fontSize: 15, color: '#8a7176', marginTop: 12, fontWeight: '500' },
  searchResultRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#ac2a5d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  searchResultAvatar: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: '#ffd9e4',
    justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden',
  },
  searchResultAvatarImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  searchResultInfo: { flex: 1 },
  searchResultName: { fontSize: 16, fontWeight: '700', color: '#161c28' },
  searchResultMeta: { fontSize: 13, color: '#574146', marginTop: 2 },
  searchResultShelter: { fontSize: 12, color: '#ac2a5d', fontWeight: '600', marginTop: 2 },

  filterRow: { paddingHorizontal: 20, paddingBottom: 12 },
  filterRowContent: { gap: 10, alignItems: 'center' },

  scrollContent: { paddingBottom: 120 },

  categoriesScroll: { marginBottom: 20 },
  categoriesContainer: { paddingHorizontal: 20, gap: 12 },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999,
  },
  categoryChipActive: { backgroundColor: 'rgba(172, 42, 93, 0.1)', borderColor: '#ac2a5d', borderWidth: 1.5 },
  categoryChipText: { fontSize: 15, fontWeight: '600', color: '#161c28' },
  categoryChipTextActive: { color: '#161c28' },

  heroSection: { paddingHorizontal: 20, marginBottom: 24 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#161c28', letterSpacing: -0.5 },
  heroSub: { fontSize: 15, color: '#574146', marginTop: 4 },
  roleBadge: {
    alignSelf: 'flex-start', marginTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  roleBadgeText: { fontSize: 12, fontWeight: '700', color: '#ac2a5d' },

  refugioControls: { paddingHorizontal: 20, gap: 12, marginBottom: 24 },
  rainbowActionBtn: { borderRadius: 16, overflow: 'hidden', height: 52 },
  gradientFill: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  rainbowBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  glassActionBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1, borderColor: '#ac2a5d',
    borderRadius: 16, height: 52, justifyContent: 'center', alignItems: 'center',
  },
  glassBtnText: { color: '#ac2a5d', fontWeight: '700', fontSize: 15 },

  promoBanner: {
    marginHorizontal: 20, marginBottom: 24, borderRadius: 20, padding: 24,
    flexDirection: 'row', alignItems: 'center', gap: 16,
  },
  promoTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 4 },
  promoSub: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginBottom: 16 },
  promoBtn: {
    backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 999,
    paddingHorizontal: 20, paddingVertical: 8, alignSelf: 'flex-start',
  },
  promoBtnText: { color: '#ac2a5d', fontWeight: '700', fontSize: 14 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#161c28', paddingHorizontal: 20, marginBottom: 16 },
  sectionDivider: { height: 1, backgroundColor: 'rgba(172,42,93,0.12)', marginHorizontal: 20, marginBottom: 20 },

  gridContainer: { paddingHorizontal: 20, gap: 16 },
  gridRow: { flexDirection: 'row', gap: 16 },

  glassCard: {
    flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20, overflow: 'hidden', marginBottom: 0,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  cardImageContainer: { height: 140, position: 'relative' },
  cardImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardImagePlaceholder: { width: '100%', height: '100%', backgroundColor: '#ffb1c5', justifyContent: 'center', alignItems: 'center' },
  cardEmoji: { fontSize: 36 },
  favoriteBtn: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 14, width: 28, height: 28,
    justifyContent: 'center', alignItems: 'center',
  },
  floatingTags: { position: 'absolute', bottom: 8, left: 8, flexDirection: 'row', gap: 4 },
  floatingTag: { backgroundColor: 'rgba(255, 255, 255, 0.85)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  floatingTagText: { fontSize: 9, fontWeight: '700', color: '#574146', textTransform: 'capitalize' },
  adoptedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(46, 125, 50, 0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  adoptedText: {
    fontSize: 14, fontWeight: '800', color: '#fff',
    backgroundColor: 'rgba(46, 125, 50, 0.85)',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8,
    overflow: 'hidden',
  },
  cardBody: { padding: 10 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardName: { fontSize: 14, fontWeight: '800', color: '#161c28', flex: 1 },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  cardMetaText: { fontSize: 11, color: '#574146', flexShrink: 1 },
  dotSeparator: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#ddbfc5' },
  knowMoreBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)', borderWidth: 1, borderColor: 'rgba(172, 42, 93, 0.2)',
    borderRadius: 999, paddingVertical: 6, alignItems: 'center',
  },
  knowMoreText: { color: '#ac2a5d', fontSize: 11, fontWeight: '700' },

  empty: { textAlign: 'center', color: '#8a7176', marginTop: 40, fontSize: 15 },
  errorBanner: { backgroundColor: '#ffdad6', padding: 12, marginHorizontal: 20, borderRadius: 12, marginBottom: 16 },
  errorBannerText: { color: '#93000a', fontSize: 13, textAlign: 'center', fontWeight: '600' },

  fabIa: {
    position: 'absolute', bottom: 100, right: 20, zIndex: 40,
    shadowColor: '#ac2a5d', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
  fab: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },

  bottomNav: {
    backgroundColor: 'rgba(249, 249, 255, 0.85)',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 32 : 16, paddingTop: 12,
    borderTopWidth: 1, borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  navItem: { alignItems: 'center', justifyContent: 'center', flex: 1, gap: 4 },
  navItemActive: { backgroundColor: '#fc9d41', paddingHorizontal: 20, paddingVertical: 6, borderRadius: 999 },
  navTextActive: { fontSize: 11, fontWeight: '700', color: '#161c28' },
  navText: { fontSize: 11, fontWeight: '600', color: '#8a7176' },
  navBadge: {
    position: 'absolute', top: -4, right: -8,
    backgroundColor: '#ac2a5d', borderRadius: 8, minWidth: 16, height: 16,
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4,
  },
  navBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
});
