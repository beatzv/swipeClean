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

export default function App() {
  const [permission, requestPermission] = usePermissions();
  const [photos, setPhotos] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [toDelete, setToDelete] = useState<Asset[]>([]);

  useEffect(() => {
    if (permission?.granted) {
      loadPhotos();
    }
  }, [permission?.granted]);

  async function loadPhotos() {
    setLoading(true);
    try {
      const assets = await new Query()
        .eq(AssetField.MEDIA_TYPE, MediaType.IMAGE)
        .orderBy({ key: AssetField.CREATION_TIME, ascending: false })
        .limit(50)
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
      await loadPhotos();
    } catch (error) {
      console.error('Error borrando fotos:', error);
    }
  }

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
        <Text style={styles.text}>No hay fotos en tu carrete.</Text>
      </View>
    );
  }

  if (currentIndex >= photos.length) {
    return (
      <View style={styles.container}>
        {toDelete.length === 0 ? (
          <Text style={styles.text}>No has marcado ninguna foto para borrar.</Text>
        ) : (
          <>
            <Text style={styles.text}>Has marcado {toDelete.length} fotos para borrar.</Text>
            <Button title={`Borrar ${toDelete.length} fotos`} color="#d11a2a" onPress={confirmDelete} />
          </>
        )}
        <Button title="Empezar de nuevo" onPress={loadPhotos} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
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