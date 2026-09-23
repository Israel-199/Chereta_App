import React, { useCallback, useState, useMemo, memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  InteractionManager,
  Modal,
} from "react-native";
import { useAuthStore } from "@/store/auth";
import { useEqubTradeStore } from "@/store/equbTradeStore";
import Navbar from "@/component/Navbar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { IOSLoader } from "@/component/ButtonLoadingEffect";
import { useJoinedEqubStyles } from "@/styles/joinedEqubStyles";
import SkeletonLoader from "@/component/SkeletonLoader";
import SkeletonJoinedEqubItem from "@/component/SkeletonJoinedEqubItem";

import am from "@/translations/am";
import en from "@/translations/en";
import or from "@/translations/or";
import so from "@/translations/so";
import ti from "@/translations/ti";
import { typography } from "@/styles/typography";

const isAmharic = (text: string) => /[\u1200-\u137F]/.test(text);

const ListingItem = memo(({ item, t, onBuy, loadingListingId, getTextStyle, styles }: any) => {
  const isDaily = item.equbName.toUpperCase().includes("DAILY");
  
  return (
    <View style={[styles.card, { marginTop: 10 }]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={[styles.cardTitle, getTextStyle(item.equbName, true), isDaily && { color: "#0B3C8A" }]}>
            {item.equbName}
          </Text>
          <View style={styles.amountRow}>
            <Ionicons name="cash-outline" size={14} color="#81CE06" />
            <Text style={[styles.amountText, getTextStyle(`${item.equbAmount} ${t.currencyBirr}`, true)]}>
              {t.sellingPrice || "Selling Price"}: {item.sellingPrice} {t.currencyBirr || "Birr"}
            </Text>
          </View>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: "#dcfce7" }]}>
          <Text style={[styles.typeBadgeText, getTextStyle(t.statusActive || "Active", true), { color: "#166534" }]}>
            {t.statusActive || "Active"}
          </Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={14} color="#81CE06" />
          <Text style={[styles.cardText, getTextStyle(`${item.equbAmount}`)]}>
            {t.totalAmount || "Equb Amount"}: {item.equbAmount} {t.currencyBirr || "Birr"}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={14} color="#000000" />
          <Text style={[styles.cardText, getTextStyle(`${item.sellerName}`)]}>
            {t.sellerName || "Seller"}: {item.sellerName}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="id-card-outline" size={14} color="#000000" />
          <Text style={[styles.cardText, getTextStyle(`${item.sellerCode}`)]}>
            {t.sellerCode || "Member Code"}: {item.sellerCode}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={14} color="#0B3C8A" />
          <Text style={[styles.cardText, getTextStyle(`${item.remainingRounds}`), { color: "#0B3C8A", fontWeight: '600' }]}>
            {t.remainingRoundsLabel || "Remaining"}: {item.remainingRounds} {t.remainingRoundsLabel ? "" : "Rounds"}
          </Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          onPress={() => onBuy(item.id, item.equbId)} 
          disabled={loadingListingId === item.id}
          style={[styles.payBtn, { flex: 1, backgroundColor: "#0B3C8A", justifyContent: "center" }, loadingListingId === item.id && { opacity: 0.7 }]}
        >
          <View style={[styles.btnContent, { justifyContent: "center" }]}>
            {loadingListingId === item.id ? (
              <IOSLoader size={16} color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="cart-arrow-down" size={16} color="#fff" />
                <Text style={[styles.btnText, getTextStyle(t.buyButton || "Buy", true), { color: "#fff", marginLeft: 8 }]}>
                  {t.buyButton || "Buy"}
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default function JoinedEqubPage() {
  const styles = useJoinedEqubStyles();
  const { language, myEqubs } = useAuthStore();
  const { listings, fetchAllListings, buyListing, fetching } = useEqubTradeStore() as any;
  const navigation = useNavigation();

  const [loadingListingId, setLoadingListingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ visible: boolean; listingId: string | null; equbId: string | null }>({ visible: false, listingId: null, equbId: null });

  const getFontFamily = useCallback((text: string, bold = false) => {
    if (isAmharic(text)) return bold ? "NotoSansEthiopic-Bold" : "NotoSansEthiopic-Regular";
    return bold ? "NotoSans-Bold" : "NotoSans-Regular";
  }, []);

  const t = useMemo(() => {
    if (language === "አማርኛ") return am;
    if (language === "Afaan Oromo") return or;
    if (language === "Af Somali") return so;
    if (language === "ትግርኛ") return ti;
    return en;
  }, [language]);

  const getTextStyle = useCallback((text: string = "", bold = false) => ({ fontFamily: getFontFamily(text, bold) }), [getFontFamily]);

  const fetchListingsData = useCallback(async () => {
    if (myEqubs && myEqubs.length > 0) {
      const equbIds = myEqubs.map((e: any) => e.id);
      if (useEqubTradeStore.getState().loadAllListings) {
        await useEqubTradeStore.getState().loadAllListings(equbIds);
      }
    }
  }, [myEqubs]);

  useFocusEffect(
    useCallback(() => {
      InteractionManager.runAfterInteractions(() => {
        fetchListingsData();
      });
    }, [fetchListingsData])
  );

  const handleBuy = useCallback(async (listingId: string, equbId: string) => {
    Toast.show({ type: "info", text1: "Coming Soon", text2: "We will start coming soon" });
    setConfirmModal({ visible: false, listingId: null, equbId: null });
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchListingsData();
    setRefreshing(false);
  }, [fetchListingsData]);

  const renderItem = useCallback(({ item }: any) => (
    <ListingItem 
      item={item} 
      t={t} 
      onBuy={(lId: string, eId: string) => setConfirmModal({ visible: true, listingId: lId, equbId: eId })} 
      loadingListingId={loadingListingId} 
      getTextStyle={getTextStyle} 
      styles={styles} 
    />
  ), [t, loadingListingId, getTextStyle, styles]);

  return (
    <View style={{ flex: 1, backgroundColor: "#EFF1F5" }}>
      <Navbar
        leftIcon={<TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}><Ionicons name="arrow-back" size={22} color="white" /></TouchableOpacity>}
        title={(t as any).equbBuy || "Equb Buy"}
        secondIcon={<TouchableOpacity onPress={handleRefresh} disabled={refreshing || fetching} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}><MaterialCommunityIcons name="refresh" size={24} color={(refreshing || fetching) ? "#ccc" : "#fff"} /></TouchableOpacity>}
      />

      <View style={{ flex: 1 }}>
      {fetching ? (
        <View style={styles.container}>{[...Array(2)].map((_, idx) => (
          <View key={idx} style={{ marginBottom: 24 }}>
            <SkeletonLoader width={100} height={18} style={{ marginBottom: 12, borderRadius: 8 }} />
            <SkeletonJoinedEqubItem />
          </View>
        ))}</View>
      ) : (
        <FlatList
          style={styles.container}
          contentContainerStyle={[styles.listContent, { paddingBottom: 80 }]}
          data={listings || []}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <MaterialCommunityIcons name="shopping-outline" size={56} color="#C4CCD4" />
              <Text style={[styles.emptyTitle, getTextStyle((t as any).noBuyListings || "No shares available", true)]}>
                {(t as any).noBuyListings || "No shares available to buy in your groups"}
              </Text>
            </View>
          }
        />
      )}
      </View>

      <Modal 
        visible={confirmModal.visible} 
        transparent 
        animationType="fade"
        onRequestClose={() => setConfirmModal({ visible: false, listingId: null, equbId: null })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={[styles.modalIconCircle, { backgroundColor: "#e2e8f0" }]}><Ionicons name="cart-outline" size={28} color="#0B3C8A" /></View>
            <Text style={[styles.modalTitle, getTextStyle((t as any).confirmBuy || "Confirm Purchase", true)]}>{(t as any).confirmBuy || "Confirm Purchase"}</Text>
            <Text style={[styles.modalSubtext, getTextStyle("")]}>Are you sure you want to buy this Equb share?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setConfirmModal({ visible: false, listingId: null, equbId: null })}>
                <Text style={[styles.cancelBtnText, getTextStyle(t.cancel || "Cancel")]}>{t.cancel || "Cancel"}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmRemoveBtn, { backgroundColor: "#0B3C8A" }]} 
                disabled={loadingListingId === confirmModal.listingId} 
                onPress={() => { if (confirmModal.listingId && confirmModal.equbId) handleBuy(confirmModal.listingId, confirmModal.equbId); }}
              >
                {loadingListingId === confirmModal.listingId ? <IOSLoader size={16} color="#fff" /> : <Text style={[styles.confirmRemoveBtnText, getTextStyle((t as any).buyButton || "Buy", true)]}>{(t as any).buyButton || "Buy"}</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
