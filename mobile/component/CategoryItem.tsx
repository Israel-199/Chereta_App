import React, { useState, memo, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Animated,
  Pressable,
  ViewStyle,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCategoryItemStyles, useCategoryIconSize } from "../styles/catagoriesItemStyles";
import { typography } from "../styles/typography";
import { VideoView, useVideoPlayer } from "expo-video";

const isAmharic = (text: string) => /[\u1200-\u137F]/.test(text);

type Props = {
  iconName?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  imageSource?: any;
  label: string;
  onPress?: () => void;
  textStyle?: object;
  tint?: boolean;
  imageStyle?: object;
  size?: "small" | "medium" | "large";
  style?: ViewStyle;
  videoSource?: any;
  overlayText?: string;
  isLoading?: boolean;
};

const VideoLoader = memo(({ source, style }: { source: any, style: any }) => {
  const player = useVideoPlayer(source, (p) => {
    if (p) {
      p.loop = true;
      p.play();
    }
  });
  return <VideoView style={style} player={player} contentFit="cover" />;
});

const CategoryItem = ({
  iconName,
  imageSource,
  label,
  onPress,
  textStyle,
  tint = true,
  imageStyle,
  size = "medium",
  style,
  videoSource,
  overlayText,
  isLoading = false,
}: Props) => {
  const styles = useCategoryItemStyles(size);
  const iconSize = useCategoryIconSize();

  const labelStyle = useMemo(() => 
    isAmharic(label) ? typography.amharicRegular : typography.englishRegular,
    [label]
  );

  const [scale] = useState(new Animated.Value(1));
  const [opacity] = useState(new Animated.Value(1));

  const handlePressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0.7, duration: 150, useNativeDriver: true }),
    ]).start();
  }, [scale, opacity]);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  }, [scale, opacity]);

  const combinedItemStyle = useMemo(() => [
    styles.item,
    { transform: [{ scale }], opacity },
    style,
  ], [styles.item, scale, opacity, style]);

  const videoStyle = useMemo(() => ({ width: '60%', height: '60%' } as const), []);
  const tintStyle = useMemo(() => (tint ? { tintColor: "#8DB048" } : {}), [tint]);

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={combinedItemStyle}>
        <View style={styles.iconBox}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#8DB048" style={{ marginVertical: 4 }} />
          ) : videoSource ? (
            <VideoLoader source={videoSource} style={videoStyle} />
          ) : imageSource ? (
            <Image
              source={imageSource}
              style={[styles.image, tintStyle, imageStyle]}
              contentFit="contain"
              transition={200}
            />
          ) : (
            <MaterialCommunityIcons
              name={iconName ?? "help-circle-outline"}
              size={iconSize}
              color="#8DB048"
            />
          )}
          <Text style={[styles.label, labelStyle, textStyle]}>{label}</Text>

          {overlayText ? (
            <View style={styles.overlayContainer}>
              <Text style={[typography.amharicBold, styles.overlayText]}>
                {overlayText}
              </Text>
            </View>
          ) : null}
        </View>
      </Animated.View>
    </Pressable>
  );
};

export default memo(CategoryItem);