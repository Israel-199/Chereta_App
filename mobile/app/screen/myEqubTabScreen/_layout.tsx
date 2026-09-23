import { Stack } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { useAuthStore } from "@/store/auth";

import am from "../../../translations/am";
import en from "../../../translations/en";
import or from "../../../translations/or";
import so from "../../../translations/so";
import ti from "../../../translations/ti";
import { StatusBar } from "expo-status-bar";

export default function MyEqubLayout() {
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
    <>
      <StatusBar style="light" backgroundColor="#0B3C8A" />
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
      <Stack.Screen
        name="info"
        options={{
          title: t.equbInfo || "Equb Info",
          headerRight: refreshButton,
        }}
      />

      <Stack.Screen
        name="equbMembers"
        options={{
          title: t.members || "Members",
          headerRight: refreshButton,
        }}
      />

      <Stack.Screen
        name="equbBuy"
        options={{
          title: (t as any).equbBuy || "Equb Buy",
          headerRight: refreshButton,
        }}
      />

      <Stack.Screen
        name="lottery"
        options={{
          title: t.lottery || "Lottery",
          headerRight: refreshButton,
        }}
      />

      <Stack.Screen
        name="equbSells"
        options={{
          title: (t as any).equbSells || "Equb Sells",
          headerRight: refreshButton,
        }}
      />

      <Stack.Screen
        name="help"
        options={{
          title: t.help || "Help",
          headerRight: refreshButton,
        }}
      />
    </Stack>
    </>
  );
}