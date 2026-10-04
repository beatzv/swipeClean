import { StyleSheet, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

type Props = {
  uri: string;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
};

export default function SwipeCard({ uri, onSwipeLeft, onSwipeRight }: Props) {
  const { width } = useWindowDimensions();
  const threshold = width * 0.3;
  const translateX = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (event.translationX > threshold) {
        translateX.value = withTiming(width * 1.5, { duration: 200 }, (finished) => {
          if (finished) scheduleOnRN(onSwipeRight);
        });
      } else if (event.translationX < -threshold) {
        translateX.value = withTiming(-width * 1.5, { duration: 200 }, (finished) => {
          if (finished) scheduleOnRN(onSwipeLeft);
        });
      } else {
        translateX.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${interpolate(translateX.value, [-width, width], [-15, 15])}deg` },
    ],
  }));

  const deleteLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, threshold], [0, 1], Extrapolation.CLAMP),
  }));

  const keepLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-threshold, 0], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, cardStyle]}>
        <Image source={{ uri }} style={styles.photo} contentFit="contain" />
        <Animated.Text style={[styles.label, styles.deleteLabel, deleteLabelStyle]}>
          BORRAR
        </Animated.Text>
        <Animated.Text style={[styles.label, styles.keepLabel, keepLabelStyle]}>
          GUARDAR
        </Animated.Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: '70%',
  },
  photo: {
    flex: 1,
    width: '100%',
  },
  label: {
    position: 'absolute',
    top: 24,
    fontSize: 28,
    fontWeight: 'bold',
    borderWidth: 3,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  deleteLabel: {
    left: 20,
    color: '#d11a2a',
    borderColor: '#d11a2a',
    transform: [{ rotate: '-15deg' }],
  },
  keepLabel: {
    right: 20,
    color: '#1a8f3c',
    borderColor: '#1a8f3c',
    transform: [{ rotate: '15deg' }],
  },
});