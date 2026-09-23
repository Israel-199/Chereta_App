import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { useAuthStore } from "@/store/auth";
import Navbar from "@/component/Navbar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { verticalScale, moderateScale } from "react-native-size-matters";

import am from "@/translations/am";
import en from "@/translations/en";
import or from "@/translations/or";
import so from "@/translations/so";
import ti from "@/translations/ti";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ETHIOPIC_LANGUAGES = new Set(["አማርኛ", "ትግርኛ"]);

export default function HelpScreen() {
  const { language } = useAuthStore();
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const getFontFamily = useCallback(
    (bold = false) => {
      if (ETHIOPIC_LANGUAGES.has(language)) {
        return bold ? "NotoSansEthiopic-Bold" : "NotoSansEthiopic-Regular";
      }
      return bold ? "NotoSans-Bold" : "NotoSans-Regular";
    },
    [language]
  );

  const nameFontStyle = useMemo(() => ({ fontFamily: getFontFamily(true) }), [getFontFamily]);
  const regularFontStyle = useMemo(() => ({ fontFamily: getFontFamily(false) }), [getFontFamily]);

  let t = en;
  if (language === "አማርኛ") t = am;
  else if (language === "Afaan Oromo") t = or;
  else if (language === "Af Somali") t = so;
  else if (language === "ትግርኛ") t = ti;

  const faqData = useMemo(() => {
    return Object.keys(t.faq || {})
      .filter((key) => key.startsWith("q"))
      .sort((a, b) => parseInt(a.replace("q", "")) - parseInt(b.replace("q", "")))
      .map((key) => {
        const index = key.substring(1);
        return {
          id: index,
          question: (t.faq as any)[`q${index}`],
          answer: (t.faq as any)[`a${index}`],
        };
      });
  }, [t.faq]);

  const toggleExpand = (index: number) => {
    LayoutAnimation.configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 0.8,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const renderFAQItem = ({ item, index }: { item: any; index: number }) => {
    const isExpanded = expandedIndex === index;
    return (
      <View style={styles.faqCard}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => toggleExpand(index)}
          style={styles.questionButton}
        >
          <Text style={[styles.questionText, nameFontStyle]}>{item.question}</Text>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#0B3C8A"
          />
        </TouchableOpacity>
        {isExpanded && item.answer ? (
          <View style={styles.answerContainer}>
            <Text style={[styles.answerText, regularFontStyle]}>{item.answer}</Text>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Navbar
        leftIcon={
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        }
        title={t.helpCenter || "Help Center"}
      />
      <FlatList
        data={faqData}
        keyExtractor={(item) => item.id}
        renderItem={renderFAQItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F4F7",
  },
  listContent: {
    padding: moderateScale(16),
  },
  faqCard: {
    backgroundColor: "#fff",
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(12),
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  questionButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: moderateScale(16),
    backgroundColor: "#fff",
  },
  questionText: {
    fontSize: moderateScale(14),
    color: "#0B3C8A",
    flex: 1,
    marginRight: moderateScale(10),
    lineHeight: moderateScale(20),
  },
  answerContainer: {
    paddingHorizontal: moderateScale(16),
    paddingBottom: moderateScale(16),
    borderTopWidth: 1,
    borderTopColor: "#F2F4F7",
    paddingTop: moderateScale(12),
  },
  answerText: {
    fontSize: moderateScale(13),
    color: "#0B3C8A",
    lineHeight: moderateScale(19),
  },
});