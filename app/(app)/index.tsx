import { useState } from 'react';
import { useAuth } from '@features/auth/presentation/hooks/useAuth';
import { useMascotas } from '@features/mascotas/presentation/hooks/useMascotas';
import { Mascotas } from '@features/mascotas/domain/entities/Mascotas';
import { useRouter } from 'expo-router';
import {
  View, Text, Image, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Dimensions, Platform, ScrollView, TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  // --- TU LÓGICA INTACTA ❤️ ---
  const { user, logout } = useAuth();
  const { mascotas, isLoading, error } = useMascotas();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEspecie, setSelectedEspecie] = useState('');

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

  const filteredMascotas = mascotas
    .filter(m => user?.role === 'refugio' ? m.sellerId === user.id : true)
    .filter(m => selectedEspecie === '' || m.especie.toLowerCase().startsWith(selectedEspecie.toLowerCase()))
    .filter(m => searchQuery === '' || m.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // --- COMPONENTES VISUALES ---
  const renderMascota = ({ item }: { item: Mascotas }) => (
    <TouchableOpacity 
      style={styles.glassCard} 
      onPress={() => handleMascotaPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.cardImageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Text style={styles.cardEmoji}>🐾</Text>
          </View>
        )}
        {/* Botón Favorito Flotante */}
        <TouchableOpacity style={styles.favoriteBtn} activeOpacity={0.7}>
          <MaterialIcons name="favorite-border" size={18} color="#fff" />
        </TouchableOpacity>
        {/* Etiquetas flotantes en la imagen */}
        <View style={styles.floatingTags}>
          <View style={styles.floatingTag}>
            <Text style={styles.floatingTagText}>{item.tamaño}</Text>
          </View>
        </View>
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

        {/* Botón Conocer (Glassmorphism) */}
        <TouchableOpacity style={styles.knowMoreBtn} onPress={() => router.push({
          pathname: '/(app)/map',
          params: { targetSellerId: item.sellerId }
        })}>
          <Text style={styles.knowMoreText}>📍 Mapa</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Fondo Atmosférico de tu diseño */}
      <View style={styles.ambientContainer} pointerEvents="none">
        <View style={[styles.ambientGlow, styles.glowTop]} />
        <View style={[styles.ambientGlow, styles.glowBottom]} />
      </View>

      {/* TopAppBar (Glassmorphism) */}
      <View style={styles.topAppBar}>
        <View style={styles.brandContainer}>
          <MaterialIcons name="pets" size={28} color="#ac2a5d" />
          <Text style={styles.brandText}>PetAdopt</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => router.push('/(app)/map' as any)} style={styles.iconBtn}>
            <MaterialIcons name="location-on" size={24} color="#574146" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push({ pathname: '/(app)/chat-ia' })} style={styles.iconBtn}>
            <MaterialIcons name="smart-toy" size={24} color="#574146" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Buscador */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <MaterialIcons name="search" size={20} color="#8a7176" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Buscar amigos cerca de ti..."
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

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>Oops: {error.message}</Text>
        </View>
      )}

      {isLoading ? (
        <ActivityIndicator size="large" color="#ac2a5d" style={{ marginTop: 80 }} />
      ) : (
        <FlatList<Mascotas>
          data={filteredMascotas}
          keyExtractor={(m) => m.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={renderMascota}
          ListHeaderComponent={() => (
            <View>
              {/* Categorías Horizontales */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll} contentContainerStyle={styles.categoriesContainer}>
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

              {/* Hero Section adaptada de tu código original */}
              <View style={styles.heroSection}>
                <Text style={styles.heroTitle}>Encuentra tu compañero</Text>
                <Text style={styles.heroSub}>Hola, {user?.username} 👋 — estos peludos te esperan</Text>
                
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>
                    {user?.role === 'refugio' ? '🏡 Refugio' : '🐾 Cliente'}
                  </Text>
                </View>
              </View>

              {/* Controles de Refugio */}
              {user?.role === 'refugio' && (
                <View style={styles.refugioControls}>
                  <TouchableOpacity style={styles.rainbowActionBtn} onPress={() => router.push({ pathname: '/(app)/create-mascota' })}>
                    <LinearGradient colors={['#ac2a5d', '#fc9d41']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.gradientFill}>
                      <Text style={styles.rainbowBtnText}>+ Nueva mascota</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.glassActionBtn} onPress={() => router.push('/(app)/location-settings' as any)}>
                    <Text style={styles.glassBtnText}>📍 Configurar ubicación</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Promo Banner para clientes */}
              {user?.role !== 'refugio' && (
                <LinearGradient colors={['#ac2a5d', '#fc9d41', '#00adca']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.promoBanner}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.promoTitle}>¿Quieres adoptar?</Text>
                    <Text style={styles.promoSub}>Conoce a nuestros animales</Text>
                    <TouchableOpacity style={styles.promoBtn} onPress={() => router.push({ pathname: '/(app)/general-chat' })}>
                      <Text style={styles.promoBtnText}>Contactar</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={{ fontSize: 42 }}>🐶</Text>
                </LinearGradient>
              )}

              <Text style={styles.sectionTitle}>
                {user?.role === 'refugio' ? 'Mis mascotas publicadas' : 'Amigos buscando hogar'}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {user?.role === 'refugio' ? 'No tienes mascotas registradas' : 'No hay mascotas disponibles'}
            </Text>
          }
        />
      )}

      {/* FAB Original Integrado con estilo Rainbow */}
      <TouchableOpacity 
        style={styles.fabWrapper} 
        activeOpacity={0.8}
        onPress={() => router.push({ pathname: '/(app)/general-chat' })}
      >
        <LinearGradient colors={['#ac2a5d', '#fc9d41', '#00687a']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.fab}>
          <MaterialIcons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Bottom Nav (Glassmorphism) */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navItemActive}>
            <MaterialIcons name="pets" size={24} color="#6d3a00" />
          </View>
          <Text style={styles.navTextActive}>Descubrir</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push({ pathname: '/(app)/chat-ia' })}>
          <MaterialIcons name="chat-bubble-outline" size={24} color="#8a7176" />
          <Text style={styles.navText}>Mensajes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={logout}>
          <MaterialIcons name="logout" size={24} color="#8a7176" />
          <Text style={styles.navText}>Salir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9ff',
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
  
  // --- App Bar & Search ---
  topAppBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 16,
    backgroundColor: 'rgba(249, 249, 255, 0.6)',
  },
  brandContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandText: { fontSize: 24, fontWeight: '800', color: '#ac2a5d', letterSpacing: -0.5 },
  headerActions: { flexDirection: 'row', gap: 12 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  searchContainer: { paddingHorizontal: 20, paddingBottom: 16 },
  searchInputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 999, paddingHorizontal: 16, height: 48,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: '#161c28' },

  // --- List & Layout ---
  listContent: { paddingBottom: 120 },
  columnWrapper: { paddingHorizontal: 20, gap: 16 },
  
  // --- Categorías ---
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

  // --- Hero & Roles ---
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

  // --- Refugio Controles ---
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

  // --- Promo Banner ---
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

  // --- Tarjetas de Mascotas ---
  glassCard: {
    flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20, overflow: 'hidden', marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  cardImageContainer: { height: 160, position: 'relative' },
  cardImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardImagePlaceholder: { width: '100%', height: '100%', backgroundColor: '#ffb1c5', justifyContent: 'center', alignItems: 'center' },
  cardEmoji: { fontSize: 40 },
  favoriteBtn: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 16, width: 32, height: 32,
    justifyContent: 'center', alignItems: 'center',
  },
  floatingTags: { position: 'absolute', bottom: 12, left: 12, flexDirection: 'row', gap: 6 },
  floatingTag: { backgroundColor: 'rgba(255, 255, 255, 0.8)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  floatingTagText: { fontSize: 10, fontWeight: '700', color: '#574146', textTransform: 'capitalize' },
  cardBody: { padding: 12 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardName: { fontSize: 16, fontWeight: '800', color: '#161c28', flex: 1 },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  cardMetaText: { fontSize: 12, color: '#574146', flexShrink: 1 },
  dotSeparator: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#ddbfc5' },
  knowMoreBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)', borderWidth: 1, borderColor: 'rgba(172, 42, 93, 0.2)',
    borderRadius: 999, paddingVertical: 8, alignItems: 'center',
  },
  knowMoreText: { color: '#ac2a5d', fontSize: 12, fontWeight: '700' },

  // --- Utilidades ---
  empty: { textAlign: 'center', color: '#8a7176', marginTop: 40, fontSize: 15 },
  errorBanner: { backgroundColor: '#ffdad6', padding: 12, marginHorizontal: 20, borderRadius: 12, marginBottom: 16 },
  errorBannerText: { color: '#93000a', fontSize: 13, textAlign: 'center', fontWeight: '600' },

  // --- Bottom Nav & FAB ---
  fabWrapper: {
    position: 'absolute', bottom: 100, right: 20, zIndex: 40,
    shadowColor: '#ac2a5d', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
  fab: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  bottomNav: {
    position: 'absolute', bottom: 0, width: '100%',
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
});