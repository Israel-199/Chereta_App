import React, { useEffect, useRef } from "react";
import { Animated, ViewStyle } from "react-native";

type Props = {
  width: number | `${number}%` | "auto";
  height: number | `${number}%` | "auto";
  style?: ViewStyle;
  borderRadius?: number;
};

export default function SkeletonLoader({ width, height, style, borderRadius = 8 }: Props) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[
        { width, height, backgroundColor: "#D1D5DB", borderRadius, opacity },
        style,
      ]}
    />
  );
}
