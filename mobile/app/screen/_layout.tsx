import React from "react";
import { Stack } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Platform, StatusBar as RNStatusBar, View } from "react-native";
import { useAuthStore } from "@/store/auth";
import { StatusBar } from "expo-status-bar";

import am from "../../translations/am";
import en from "../../translations/en";
import or from "../../translations/or";
import so from "../../translations/so";
import ti from "../../translations/ti";

export default function ScreenLayout() {
  const { language, setLoading } = useAuthStore();

  const getFontFamily = (bold = false) =>
    language === "አማርኛ" || language === "ትግርኛ"
      ? bold
        ? "NotoSansEthiopic-Bold"
        : "NotoSansEthiopic-Regular"
      : bold
      ? "NotoSans-Bold"
      : "NotoSans-Regular";

  let t = en;
  if (language === "አማርኛ") t = am;
  else if (language === "Afaan Oromo") t = or;
  else if (language === "Af Somali") t = so;
  else if (language === "ትግርኛ") t = ti;

  const refreshButton = () => (
    <Pressable
      onPress={() => {
        setLoading(true);
        setTimeout(() => setLoading(false), 2000);
      }}
      style={{ padding: 6 }}
    >
      <MaterialCommunityIcons
        name="refresh"
        size={22}
        color="#fff"
        style={{ marginRight: 8 }}
      />
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#F2F4F7" }}>
      <StatusBar style="light" backgroundColor="#0B3C8A" />
      {Platform.OS === "android" && (
        <RNStatusBar
          translucent
          backgroundColor="#0B3C8A"
          barStyle="light-content"
        />
      )}

      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          presentation: "card",
          contentStyle: { backgroundColor: "#F2F4F7" },

          headerStyle: {
            backgroundColor: "#0B3C8A",
          },

          headerTitleAlign: "center",

          headerTitleStyle: {
            fontFamily: getFontFamily(true),
            fontSize: 18,
            color: "#fff",
          },

          headerTintColor: "#fff",
        }}
      >

        <Stack.Screen name="otp" />
        <Stack.Screen name="registerScreen" />
        <Stack.Screen name="termsOfService" />

        <Stack.Screen
          name="notifications"
          options={{ title: "Notifications" }}
        />

        <Stack.Screen
          name="dailyEqubList"
          options={{ title: t.dailyEqub, headerRight: refreshButton }}
        />
        <Stack.Screen
          name="weeklyEqubList"
          options={{ title: t.weeklyEqub, headerRight: refreshButton }}
        />
        <Stack.Screen
          name="monthlyEqubList"
          options={{ title: t.monthlyEqub, headerRight: refreshButton }}
        />
        <Stack.Screen
          name="equbRegistration"
          options={{ title: t.registerInfo, headerRight: refreshButton }}
        />
        <Stack.Screen
          name="phoneEqubList"
          options={{ title: t.phoneEqub, headerRight: refreshButton }}
        />
        <Stack.Screen
          name="comingSoon"
          options={{ title: t.comingSoon ?? "Coming Soon" }}
        />
      </Stack>
    </View>
  );
}
