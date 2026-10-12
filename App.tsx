import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  Asset,
  AssetField,
  MediaType,
  Query,
  usePermissions,
} from 'expo-media-library';
import SwipeCard from './components/SwipeCard';
import DateRangeModal from './components/DateRangeModal';

type DateRange = { start: Date; end: Date };

const LATEST_LIMIT = 50;
const RANGE_LIMIT = 300;

export default function App() {
  const [permission, requestPermission] = usePermissions();
  const [photos, setPhotos] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [toDelete, setToDelete] = useState<Asset[]>([]);
  const [range, setRange] = useState<DateRange | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (permission?.granted) {
      loadPhotos(null);
    }
  }, [permission?.granted]);

  async function loadPhotos(selectedRange: DateRange | null) {
    setLoading(true);
    try {
      let query = new Query().eq(AssetField.MEDIA_TYPE, MediaType.IMAGE);
      if (selectedRange) {
        query = query
          .gte(AssetField.CREATION_TIME, selectedRange.start.getTime())
          .lte(AssetField.CREATION_TIME, selectedRange.end.getTime());
      }
      const assets = await query
        .orderBy({ key: AssetField.CREATION_TIME, ascending: false })
        .limit(selectedRange ? RANGE_LIMIT : LATEST_LIMIT)
        .exe();
      setPhotos(assets);
      setCurrentIndex(0);
      setToDelete([]);
    } catch (error) {
      console.error('Error cargando fotos:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleRangeConfirm(start: Date, end: Date) {
    const newRange = { start, end };
    setRange(newRange);
    setShowPicker(false);
    loadPhotos(newRange);
  }

  function clearRange() {
    setRange(null);
    loadPhotos(null);
  }

  function keepPhoto() {
    setCurrentIndex((i) => i + 1);
  }

  function markForDeletion() {
    setToDelete((list) => [...list, photos[currentIndex]]);
    setCurrentIndex((i) => i + 1);
  }

  async function confirmDelete() {
    try {
      await Asset.delete(toDelete);
      await loadPhotos(range);
    } catch (error) {
      console.error('Error borrando fotos:', error);
    }
  }

  const filterBar = (
    <View style={styles.filterBar}>
      <Text style={styles.filterText}>
        {range
          ? `${range.start.toLocaleDateString('es-ES')} – ${range.end.toLocaleDateString('es-ES')}`
          : `Últimas ${LATEST_LIMIT} fotos`}
      </Text>
      <Button title="📅 Fechas" onPress={() => setShowPicker(true)} />
      {range && <Button title="Quitar" onPress={clearRange} />}
    </View>
  );

  const modal = (
    <DateRangeModal
      visible={showPicker}
      onClose={() => setShowPicker(false)}
      onConfirm={handleRangeConfirm}
    />
  );

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Necesito acceso a tus fotos para ayudarte a limpiarlas.</Text>
        <Button title="Dar permiso" onPress={requestPermission} />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (photos.length === 0) {
    return (
      <View style={styles.container}>
        {filterBar}
        <Text style={styles.text}>
          {range ? 'No hay fotos en ese rango de fechas.' : 'No hay fotos en tu carrete.'}
        </Text>
        {modal}
      </View>
    );
  }

  if (currentIndex >= photos.length) {
    return (
      <View style={styles.container}>
        {filterBar}
        {toDelete.length === 0 ? (
          <Text style={styles.text}>No has marcado ninguna foto para borrar.</Text>
        ) : (
          <>
            <Text style={styles.text}>Has marcado {toDelete.length} fotos para borrar.</Text>
            <Button title={`Borrar ${toDelete.length} fotos`} color="#d11a2a" onPress={confirmDelete} />
          </>
        )}
        <Button title="Empezar de nuevo" onPress={() => loadPhotos(range)} />
        {modal}
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      {filterBar}
      <Text style={styles.counter}>
        {currentIndex + 1} / {photos.length}
      </Text>
      <SwipeCard
        key={photos[currentIndex].id}
        uri={photos[currentIndex].id}
        onSwipeLeft={keepPhoto}
        onSwipeRight={markForDeletion}
      />
      <View style={styles.buttons}>
        <Button title="⬅️ Guardar" onPress={keepPhoto} />
        <Button title="Borrar ➡️" color="#d11a2a" onPress={markForDeletion} />
      </View>
      {modal}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
  counter: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
  },
});