import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  Animated,
} from "react-native";
import NetInfo from "@react-native-community/netinfo";

export class ErrorBoundary extends React.Component<
  any,
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    console.log("App Crash Error:", error);
    console.log("Crash Info:", info);
  }

  handleRetry = async () => {
    const netState = await NetInfo.fetch();

    if (!netState.isConnected) {
      alert("No internet connection");
      return;
    }
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return <ErrorUI retry={this.handleRetry} />;
  }
}

const ErrorUI = ({ retry }: { retry: () => void }) => {
  const { width, height } = useWindowDimensions();
  const scale = Math.min(width, height);

  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  const startPulse = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.95,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: scale * 0.05,
        backgroundColor: "#F8FAFC",
      }}
    >
      <Text
        style={{
          fontSize: scale * 0.045,
          fontWeight: "bold",
          color: "#111827",
          textAlign: "center",
        }}
      >
        Something went wrong
      </Text>

      <Text
        style={{
          marginTop: 12,
          fontSize: scale * 0.035,
          textAlign: "center",
          color: "#6B7280",
          maxWidth: width * 0.8,
        }}
      >
        We will try to recover the app. Please try again.
      </Text>

      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          onPress={() => {
            startPulse();
            retry();
          }}
          style={{
            marginTop: 30,
            backgroundColor: "#0B3C8A",
            paddingVertical: scale * 0.025,
            width: width * 0.5,
            borderRadius: scale * 0.02,
            alignItems: "center",
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: scale * 0.035,
              fontWeight: "600",
            }}
          >
            Try Again
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};