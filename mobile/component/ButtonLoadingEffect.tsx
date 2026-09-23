import React, { useRef, useEffect } from "react";
import { Animated, Easing, StyleSheet } from "react-native";

export function IOSLoader({ size = 20, color = "#fff" }) {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={[
        styles.loader,
        {
          width: size,
          height: size,
          borderColor: color,
          transform: [{ rotate: spin }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  loader: {
    borderWidth: 2,
    borderRadius: 50,
    borderTopColor: "transparent", 
  },
});
