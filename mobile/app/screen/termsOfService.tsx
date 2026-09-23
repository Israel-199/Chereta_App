import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Navbar from "@/component/Navbar";
import { useAuthStore } from "@/store/auth";
import { joinEqub } from "@/api/equbSevice";
import { IOSLoader } from "@/component/ButtonLoadingEffect";
import Toast from "react-native-toast-message";
import { useNotificationStore } from "@/store/notificationStore";
import { useJoinedEqubStore } from "@/store/joinedEqubStore";


import am from "@/translations/am";
import en from "@/translations/en";
import or from "@/translations/or";
import so from "@/translations/so";
import ti from "@/translations/ti";

export default function TermsOfService() {
  const { equbId, type } = useLocalSearchParams<{ equbId: string; type: string }>();
  const router = useRouter();
  const { language, preloadData } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const t = useMemo(() => {
    if (language === "አማርኛ") return am;
    if (language === "Afaan Oromo") return or;
    if (language === "Af Somali") return so;
    if (language === "ትግርኛ") return ti;
    return en;
  }, [language]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1200);
  }, []);

  const getFontFamily = useCallback(
    (bold = false) => {
      if (language === "አማርኛ" || language === "ትግርኛ") {
        return bold ? "NotoSansEthiopic-Bold" : "NotoSansEthiopic-Regular";
      }
      return bold ? "NotoSans-Bold" : "NotoSans-Regular";
    },
    [language]
  );

  const handleJoin = async () => {
    if (!accepted) {
      Alert.alert(t.tosAgreementRequired, t.tosAgreementMessage);
      return;
    }

    if (!equbId || !type) return;

    try {
      setLoading(true);
      const myEqubs = useAuthStore.getState().myEqubs;

      if (myEqubs.some((e: any) => e.id === equbId)) {
        Toast.show({ type: "info", text1: t.alreadyJoined });
        router.back();
        return;
      }

      // Only await the join API call itself
      await joinEqub(equbId);

      // Show success toast and navigate back IMMEDIATELY
      Toast.show({
        type: "success",
        text1: t.toastJoinSuccess,
      });

      const username = useAuthStore.getState().profile?.firstName || "User";
      let equbName = "";
      switch (type) {
        case "daily": equbName = t.dailyEqub; break;
        case "weekly": equbName = t.weeklyEqub; break;
        case "monthly": equbName = t.monthlyEqub; break;
        case "house": equbName = t.houseEqub; break;
        case "vehicle": equbName = t.vehicleEqub; break;
        case "phone": equbName = t.phoneEqub; break;
        case "tv": equbName = (t as any).tvEqub || "TV Equb"; break;
        case "refrigerator": equbName = (t as any).refrigeratorEqub || "Refrigerator Equb"; break;
        case "sofa": equbName = (t as any).sofaEqub || "Sofa Equb"; break;
        default: equbName = "Equb"; break;
      }
      const notificationMsg = (t as any).notificationJoin
        ? (t as any).notificationJoin.replace("{username}", username).replace("{equbname}", equbName)
        : `Dear ${username}, thank you for joining ${equbName}. Please start your Equb by pressing pay and completing your payment.`;
      useNotificationStore.getState().addNotification({
        title: (t as any).notifications || "Notifications",
        message: notificationMsg,
        trackInfo: equbId,
        type: "join"
      });

      // Navigate back immediately — no waiting for data refresh
      router.back();

      // Refresh stores in the background (fire-and-forget, no await)
      Promise.all([
        useJoinedEqubStore.getState().loadJoinedEqubs(),
        preloadData(),
      ]).catch(() => {});

    } catch (err: any) {
      const errorMessage = (t as any)[err.message] || err.message || t.toastJoinError;
      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const tosText = `ሀበሻ እቁብ የዲጂታል አገልግሎት አጠቃቀምና የአባልነት ውል ስምምነት 

ይህ የአባልነት ውል (ከዚህ በኋላ “ውል” እየተባለ የሚጠራው) በአገልግሎት ሰጪው ሀበሻ ፋይናንሺያል ቴክኖሎጂስ ኃ.የተ.የግ.ማህበር (ከዚህ በኋላ “እርስዎ” እየተባሉ በሚጠሩት) እና በአፕሊኬሽኑ አማካኝነት የአባልነት ምዝገባ በሚያካሂድ ግለሰብ (ከዚህ በኋላ “እቁብተኛ” እየተባለ የሚጠራው) መካከል የተደረገ ህጋዊ ስምምነት ነው።

አንቀጽ 1፡ የውሉ መሠረት
1.1. "ሀበሻ እቁብ" በኢትዮጵያ የንግድ ሕግ መሠረት የተቋቋሙና የዲጂታል እቁብ አስተዳደር ቴክኖሎጂ አገልግሎት የሚሰጡ ሕጋዊ ድርጅት ነው።
1.2. እቁብተኛው የአፑን መመሪያዎች አንብቦና ተስማምቶ በራሱ ፍላጎት የዚህ ዲጂታል እቁብ አባል ሆኗል።

አንቀጽ 2፡ የእለታዊ እቁብ ዝርዝር (Category)
2.1. የመዋጮ መጠን፡ እቁብተኛው በቀን 300 (ሶስት መቶ) የኢትዮጵያ ብር የመክፈል ግዴታ አለበት።
2.2. የአባላት ብዛት፡ በአንድ ዙር (Group) ውስጥ የሚሳተፉ አባላት ብዛት 105 ናቸው።
2.3. የአገልግሎት ክፍያ፡ ሀበሻ እቁብ ለቴክኖሎጂውና ለአስተዳደራዊ ስራዎች ከእያንዳንዱ እጣ ላይ 1,500 ብር የአገልግሎት ክፍያ ቀንሰው ያስቀራሉ።
2.4. የተጣራ ደራሽ፡ ዕጣው ለደረሰው እቁብተኛ የሚከፈለው የተጣራ ገንዘብ 30,000 (ሰላሳ ሺህ) ብር ብቻ ይሆናል።

አንቀጽ 3፡ የዕጣ አወጣጥ ስነ-ስርዓት
3.1. የእቁብ ዕጣ በየሳምንቱ እሁድ ከቀኑ 10:00 ሰዓት ላይ በአፕሊኬሽኑ በቀጥታ ስርጭት ሁሉም ባለበት በግልጽነት ይወጣል።
3.2. እቁብተኛው ዕጣው ውስጥ ለመካተት እስከ እሁድ 9:30 ድረስ የሳምንቱን ክፍያ አጠናቆ የመክፈል ኃላፊነት አለበት።

አንቀጽ 4፡ አባልነትን ስለማቋረጥ (Withdrawal Policy)
4.1. ማንኛውም እቁብተኛ እቁብ ሳይደርሰው በፊት አባልነቱን ማቋረጥ ከፈለገ፣ በጽሁፍ ወይም በአፑ በኩል ጥያቄ ማቅረብ ይችላል።
4.2. አባልነቱን የሚያቋርጥ ሰው እስከዛሬ የቆጠበው ገንዘብ ተመላሽ የሚደረግለት፣ እሱን የሚተካ ሌላ አባል ሲገኝ ወይም የእቁቡ ዙር ሲጠናቀቅ ይሆናል።
4.3. አባልነቱን በማቋረጡ ምክንያት ለሚከናወኑ አስተዳደራዊ ስራዎች ሀበሻ እቁብ የአገልግሎት ቅጣት የመቀነስ መብት ይኖረዋል።
4.4. እቁብ የደረሰው አባል ግን ክፍያውን ሳይጨርስ አባልነቱን ማቋረጥ በፍጹም አይችልም።

አንቀጽ 5፡ የእቁብተኛው ግዴታዎችና ዋስትና
5.1. እቁብተኛው ክፍያውን በወቅቱ የመፈጸም ሕጋዊ ግዴታ ያለበት ሲሆን፣ በክፍያ መዘግየት ምክንያት ለሚጠር ማንኛውም ችግር ኃላፊነቱን ይወስዳል።
5.2. ዕጣ የደረሰው እቁብተኛ ቀሪ ክፍያዎችን በአግባቡ ለመክፈሉ ሀበሻ እቁብ በሚጠይቁት መሰረት ሕጋዊ የውል ግዴታ ወይም የዋስትና ሰነድ የመስጠት ግዴታ ይኖርበታል።

አንቀጽ 6፡ የሕግ ተጠያቂነትና ክርክር አፈታት
6.1. እቁብተኛው ክፍያውን ቢያዘገይ ወይም ሳይከፍል ቢቀር ጉዳዩን ወደ ሕግ የመውሰድና የአባሉን መረጃ ለሚመለከተው የሕግ አካል የመስጠት ሙሉ መብት አለው።
6.2. በዚህ ውል ላይ የሚነሱ ማንኛቸውም ክርክሮች በአዲስ አበባ ከተማ ፍርድ ቤቶች በኢትዮጵያ የፍትሐብሔር ሕግ መሠረት የሚታዩ ይሆናል።

አንቀጽ 7፡ ስምምነትና ማረጋገጫ
እቁብተኛው በአፕሊኬሽኑ ላይ የሚገኘውን "ተስማምቻለሁ" (I Agree) የሚለውን ምልክት ሲጫን፣ በዚህ ውል ውስጥ የተጠቀሱትን ሰባት አንቀጾች በሙሉ አንብቦ፣ ተረድቶና አምኖ እንደተቀበለ ተቆጥሮ በ ሀበሻ ፋይናንሺያል ቴክኖሎጂስ ኃ.የተ.የግ.ማህበር እና በእቁብተኛው መካከል እንደተደረገ ሕጋዊ የጽሁፍ ውል ይቆጠራል።`;

  return (
    <View style={styles.screen}>
      <Navbar
        leftIcon={
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        }
        title={t.termsOfService}
        language={language}
        secondIcon={
          <TouchableOpacity onPress={onRefresh} disabled={isRefreshing}>
            <MaterialCommunityIcons 
              name="refresh" 
              size={24} 
              color={isRefreshing ? "#ccc" : "#fff"} 
            />
          </TouchableOpacity>
        }
      />

      {isRefreshing ? (
        <View style={styles.loaderContainer}>
          <IOSLoader size={40} color="#0B3C8A" />
        </View>
      ) : (
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 220 + (Platform.OS === 'ios' ? insets.bottom : 0) }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.tosText, { fontFamily: getFontFamily() }]}>
            {tosText}
          </Text>
        </ScrollView>
      )}

      <View style={[styles.footerContainer, { bottom: Platform.OS === 'ios' ? insets.bottom : 0, backgroundColor: "transparent" }]}>
        <View style={[styles.actionCard, { paddingBottom: (Platform.OS === 'ios' ? insets.bottom : 0) + 10, backgroundColor: "#fff" }]}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setAccepted(!accepted)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, accepted && styles.checkboxActive]}>
              {accepted && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={[styles.checkboxLabel, { fontFamily: getFontFamily() }]}>
              {t.tosAcceptLabel}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, !accepted && styles.submitButtonDisabled]}
            onPress={handleJoin}
            disabled={loading || !accepted}
          >
            {loading ? (
              <IOSLoader color="#fff" size={20} />
            ) : (
              <>
                <Text style={[styles.submitText, { fontFamily: getFontFamily(true) }]}>
                  {t.submit}
                </Text>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={24}
                  color="#fff"
                  style={{ marginLeft: 8 }}
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F2F4F7",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 220,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 220,
  },
  tosText: {
    fontSize: 14,
    lineHeight: 24,
    color: "#4B5563",
    textAlign: "left",
  },
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
  },
  actionCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 16,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "#E5E7EB",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#0B3C8A",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: {
    backgroundColor: "#0B3C8A",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  submitButton: {
    backgroundColor: "#0B3C8A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: 16,
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
  },
});
