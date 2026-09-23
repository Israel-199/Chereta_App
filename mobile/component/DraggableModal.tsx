import React, { useRef, useEffect, useCallback, useState } from "react";
import {
  View,
  Modal,
  Animated,
  PanResponder,
  Dimensions,
  TouchableWithoutFeedback,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface DraggableModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  header?: React.ReactNode;
}

export default function DraggableModal({
  visible,
  onClose,
  children,
  header,
}: DraggableModalProps) {
  const insets = useSafeAreaInsets();
  const panY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [contentHeight, setContentHeight] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(panY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [onClose, panY, opacity]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (visible) {
      panY.setValue(SCREEN_HEIGHT);
      opacity.setValue(0);
      Animated.parallel([
        Animated.spring(panY, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, panY, opacity]);

  useEffect(() => {
    if (visible) {
      const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
        handleClose();
        return true; 
      });
      return () => backHandler.remove();
    }
  }, [visible, handleClose]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy <= 0) {
          panY.setValue(0);
        } else {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || (gestureState.dy > 50 && gestureState.vy > 0.5)) {
          handleClose();
        } else {
          Animated.spring(panY, {
            toValue: 0,
            tension: 65,
            friction: 11,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const clampedPanY = panY.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { zIndex: 9999, elevation: 99 },
        !visible ? { transform: [{ translateX: SCREEN_HEIGHT * 2 }] } : {}
      ]}
      pointerEvents={visible ? "auto" : "none"}
    >
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View style={[styles.backdrop, { opacity }]} />
        </TouchableWithoutFeedback>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ width: '100%', justifyContent: 'flex-end' }}
          pointerEvents="box-none"
          keyboardVerticalOffset={100}
        >
          <Animated.View
            {...panResponder.panHandlers}
            onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
            style={[
              styles.content,
              {
                transform: [{ translateY: clampedPanY }],
                paddingBottom: keyboardVisible ? (Platform.OS === "ios" ? 60 : 40) : (Platform.OS === "ios" ? 40 : 24),
                maxHeight: keyboardVisible ? SCREEN_HEIGHT * 0.95 : SCREEN_HEIGHT * 0.75,
              },
            ]}
          >
            <View style={styles.handle} />
            {header}
            <View style={{ flexShrink: 1 }}>
              {children}
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  content: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#E2E8F0",
    marginBottom: 20,
  },
});
