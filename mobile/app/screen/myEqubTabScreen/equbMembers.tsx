import React, { useCallback } from "react";
import { View, Text, SectionList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEqubMemberStore } from "@/store/equbMemberStore";
import { useAuthStore } from "@/store/auth";
import SkeletonLoader from "@/component/SkeletonLoader";
import Navbar from "@/component/Navbar";

import am from "@/translations/am";
import en from "@/translations/en";
import or from "@/translations/or";
import so from "@/translations/so";
import ti from "@/translations/ti";

export default function EqubMemberPage() {
  const { equbId } = useLocalSearchParams<{ equbId: string }>();
  const { equb, joinedEqubs, fetching, loadEqub, loadAllJoinedMembers } = useEqubMemberStore();
  const { profile, language } = useAuthStore();
  const router = useRouter();

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

  useFocusEffect(
    useCallback(() => {
      if (equbId) {
        loadEqub(equbId);
      } else {
        loadAllJoinedMembers();
      }
    }, [equbId, loadEqub, loadAllJoinedMembers])
  );

  const handleRefresh = useCallback(() => {
    if (equbId) {
      loadEqub(equbId);
    } else {
      loadAllJoinedMembers();
    }
  }, [equbId, loadEqub, loadAllJoinedMembers]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = ["#0B3C8A", "#0284C7", "#7C3AED", "#DB2777", "#059669"];
    const index = name.length % colors.length;
    return colors[index];
  };

  const MemberSkeleton = () => (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <SkeletonLoader width={44} height={44} borderRadius={22} />
        <View style={{ marginLeft: 12 }}>
          <SkeletonLoader width={120} height={16} />
          <SkeletonLoader width={80} height={12} style={{ marginTop: 6 }} />
        </View>
      </View>
      <SkeletonLoader width={60} height={24} borderRadius={12} />
    </View>
  );

  const renderMember = ({ item }: any) => {
    const isMe = item.userId === profile?.id;
    const initials = getInitials(item.name);
    const avatarColor = getAvatarColor(item.name);

    return (
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderWidth: isMe ? 2 : 0,
          borderColor: isMe ? "#0B3C8A" : "transparent",
          shadowColor: "#000",
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: isMe ? "#0B3C8A" : avatarColor,
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden", 
            }}
          >
            {item.profileImage ? (
              <Image source={{ uri: item.profileImage }} style={{ width: 44, height: 44 }} />
            ) : (
              <Text style={{ color: "#fff", fontFamily: getFontFamily(true), fontSize: 16 }}>
                {initials}
              </Text>
            )}
          </View>
          <View style={{ marginLeft: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 16, fontFamily: getFontFamily(true), color: "#1F2937" }}>
                {item.name}
              </Text>
              {isMe && (
                <View
                  style={{
                    marginLeft: 8,
                    backgroundColor: "#0B3C8A",
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 4,
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 9, fontFamily: getFontFamily(true) }}>
                    {t.you}
                  </Text>
                </View>
              )}
            </View>
            <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 2, fontFamily: getFontFamily(false) }}>
              {t.participant}
            </Text>
          </View>
        </View>

        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
            backgroundColor: item.paid ? "#E6F6EE" : "#FEECEB",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <MaterialCommunityIcons
            name={item.paid ? "check-circle" : "clock-outline"}
            size={14}
            color={item.paid ? "#00A651" : "#D32F2F"}
            style={{ marginRight: 4 }}
          />
          <Text
            style={{
              fontSize: 12,
              fontFamily: getFontFamily(true),
              color: item.paid ? "#00A651" : "#D32F2F",
            }}
          >
            {item.paid ? t.paid : t.pending}
          </Text>
        </View>
      </View>
    );
  };

  const sections = React.useMemo(() => {
    if (equbId) {
      if (!equb || (!equb.members && !equb.messageKey && !equb.message)) return [];
      const typeLabel = (t as any)[`${equb.type?.toLowerCase()}Equb`] || equb.type;
      return [{
        title: `${typeLabel} - ${equb.name}`,
        data: equb.members || [],
        equb: equb
      }];
    }

    return joinedEqubs
      .filter(e => e.members || e.messageKey || e.message)
      .map(e => ({
        title: `${(t as any)[`${e.type?.toLowerCase()}Equb`] || e.type} - ${e.name}`,
        data: e.members || [],
        equb: e
      }));
  }, [equb, joinedEqubs, equbId, t]);

  return (
    <View style={{ flex: 1, backgroundColor: "#F2F4F7" }}>
      <Navbar
        leftIcon={
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        }
        title={t.equbMembers}
        secondIcon={
          <TouchableOpacity onPress={handleRefresh} disabled={fetching}>
            <MaterialCommunityIcons
              name="refresh"
              size={22}
              color="#fff"
              style={fetching ? { opacity: 0.5 } : undefined}
            />
          </TouchableOpacity>
        }
      />

      {fetching ? (
        <View style={{ flex: 1, padding: 16 }}>
          {[...Array(6)].map((_, i) => (
            <MemberSkeleton key={i} />
          ))}
        </View>
      ) : sections.length === 0 ? (
         <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="people-outline" size={40} color="#8E99A4" />
            </View>
            <Text style={[styles.emptyTitle, { fontFamily: getFontFamily(true) }]}>{t.noEqubs || "No Members Found"}</Text>
            <Text style={[styles.emptySubtitle, { fontFamily: getFontFamily(false) }]}>
              {t.notJoined || "You haven't joined any active equbs yet."}
            </Text>
          </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => item.userId + index}
          renderItem={renderMember}
          renderSectionHeader={({ section: { title, equb: sectionEqub } }) => (
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLine} />
              <View style={styles.sectionTitleContainer}>
                <Ionicons 
                  name={
                    sectionEqub.type === "DAILY" ? "calendar" : 
                    sectionEqub.type === "WEEKLY" ? "calendar-outline" : 
                    "business"
                  } 
                  size={16} 
                  color="#0B3C8A" 
                />
                <Text style={[styles.sectionTitle, { fontFamily: getFontFamily(true) }]}>
                  {title}
                </Text>
              </View>    
              {(sectionEqub.message || sectionEqub.messageKey) && (
                <View style={styles.messageBanner}>
                   <MaterialCommunityIcons 
                    name={sectionEqub.messageKey === "noPayment" ? "cash-remove" : "account-off-outline"} 
                    size={16} 
                    color="#D32F2F" 
                  />
                  <Text style={[styles.messageText, { fontFamily: getFontFamily(false) }]}>
                    {sectionEqub.message || (sectionEqub.messageKey && (t as any)[sectionEqub.messageKey]) || sectionEqub.messageKey}
                  </Text>
                </View>
              )}
            </View>
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          stickySectionHeadersEnabled={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    backgroundColor: "#F2F4F7",
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionHeaderLine: {
    height: 1,
    backgroundColor: "#E5E7EB",
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F4F7",
    alignSelf: "flex-start",
    paddingRight: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    color: "#0B3C8A",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  messageBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF1F0",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#FFA39E",
  },
  messageText: {
    fontSize: 13,
    color: "#D32F2F",
    flex: 1,
  },
  actionButton: {
    marginTop: 24,
    backgroundColor: "#0B3C8A",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
