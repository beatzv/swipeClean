import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import {
  Asset,
  AssetField,
  MediaType,
  Query,
  usePermissions,
} from 'expo-media-library';

export default function App() {
  const [permission, requestPermission] = usePermissions();
  const [photos, setPhotos] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);

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
    } catch (error) {
      console.error('Error cargando fotos:', error);
    } finally {
      setLoading(false);
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

  return (
    <View style={styles.container}>
      <Image source={{ uri: photos[0].id }} style={styles.photo} contentFit="contain" />
      <Text style={styles.text}>{photos.length} fotos cargadas</Text>
    </View>
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
  photo: {
    width: '100%',
    height: '70%',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
});