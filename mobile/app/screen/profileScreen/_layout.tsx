import { Stack } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { useAuthStore } from "@/store/auth";

import am from "../../../translations/am";
import en from "../../../translations/en";
import or from "../../../translations/or";
import so from "../../../translations/so";
import ti from "../../../translations/ti";

export default function ProfileLayout() {
  const { language, setLoading } = useAuthStore();

  const getFontFamily = (bold = false) =>
    language === "አማርኛ" || language === "ትግርኛ"
      ? bold
        ? "NotoSansEthiopic-Bold"
        : "NotoSansEthiopic-Regular"
      : bold
      ? "NotoSans-Bold"
      : "NotoSans-Regular";

  let t: Record<string, any> = en;
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
    >
      <MaterialCommunityIcons
        name="refresh"
        size={22}
        color="#fff"
        style={{ marginRight: 5 }}
      />
    </Pressable>
  );

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        presentation: "card",
        contentStyle: { backgroundColor: "#ffffff" },

        headerStyle: {
          backgroundColor: "#0D47A1",
        },

        headerTintColor: "#fff",

        headerTitleStyle: {
          fontFamily: getFontFamily(true),
          fontSize: 18,
          color: "#fff",
        },
      }}
    >
      <Stack.Screen name="myBidsScreen" />
      <Stack.Screen name="myWinningsScreen" />
      <Stack.Screen name="myHistoryScreen" />

      <Stack.Screen
        options={{
          title: t.updateAccount,
          headerRight: refreshButton,
        }}
      />

      <Stack.Screen
        name="attachments"
        options={{
          title: t.attachmentFile,
          headerRight: refreshButton,
        }}
      />

      <Stack.Screen
        name="securitySettings"
        options={{
          title: t.privateSecurity,
          headerRight: refreshButton,
        }}
      />

      <Stack.Screen
        name="fayidaVerification"
        options={{
          title: t.fayida,
          headerRight: refreshButton,
        }}
      />

      <Stack.Screen
        name="referral"
        options={{
          title: t.referral,
          headerRight: refreshButton,
        }}
      />

      <Stack.Screen
        name="shareApp"
        options={{
          title: t.share,
          headerRight: refreshButton,
        }}
      />

      <Stack.Screen
        name="rateApp"
        options={{
          title: t.rateApp,
          headerRight: refreshButton,
        }}
      />

      <Stack.Screen
        name="aboutUs"
        options={{
          title: t.aboutUs,
          headerRight: refreshButton,
        }}
      />

      <Stack.Screen
        name="equbHistory"
        options={{
          title: t.equbHistory,
          headerRight: refreshButton,
        }}
      />

      <Stack.Screen
        name="successStory"
        options={{
          title: t.successStory,
          headerRight: refreshButton,
        }}
      />

      <Stack.Screen
        name="settingsScreen"
        options={{
          title: t.profileAccount,
          headerRight: refreshButton,
        }}
      />
    </Stack>
  );
}