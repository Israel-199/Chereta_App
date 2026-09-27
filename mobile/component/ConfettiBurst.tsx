import React, { useEffect, useMemo } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  Easing,
} from "react-native-reanimated";

const { width: W, height: H } = Dimensions.get("window");
const COLORS = ["#8DB048", "#F59E0B", "#EC4899", "#3D5D96", "#22C55E", "#A855F7", "#EF4444", "#FBBF24"];

type Piece = { id: number; x: number; color: string; delay: number; rot: number; w: number; h: number };

function makePieces(count: number): Piece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * W,
    color: COLORS[i % COLORS.length],
    delay: (i % 20) * 60,
    rot: Math.random() * 360,
    w: 6 + Math.random() * 8,
    h: 10 + Math.random() * 10,
  }));
}

function ConfettiPiece({ piece }: { piece: Piece }) {
  const y = useSharedValue(-60 - Math.random() * 80);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(piece.rot);
  const sway = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(
      piece.delay,
      withRepeat(
        withTiming(H + 40, { duration: 3200 + Math.random() * 1200, easing: Easing.linear }),
        -1,
        false,
      ),
    );
    rotate.value = withDelay(
      piece.delay,
      withRepeat(withTiming(piece.rot + 1080, { duration: 3000 }), -1, false),
    );
    sway.value = withDelay(
      piece.delay,
      withRepeat(withTiming(24, { duration: 900, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
    opacity.value = withDelay(piece.delay + 2500, withTiming(0.85, { duration: 400 }));
  }, [opacity, piece.delay, piece.rot, rotate, sway, y]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: y.value },
      { translateX: sway.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.piece,
        style,
        {
          left: piece.x,
          width: piece.w,
          height: piece.h,
          backgroundColor: piece.color,
        },
      ]}
    />
  );
}

export default function ConfettiBurst({ active }: { active: boolean }) {
  const pieces = useMemo(() => makePieces(72), []);
  if (!active) return null;
  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 100 }]} pointerEvents="none">
      {pieces.map((p) => (
        <ConfettiPiece key={p.id} piece={p} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  piece: {
    position: "absolute",
    top: 0,
    borderRadius: 2,
  },
});
