import React, { useCallback, useState, useMemo, memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  InteractionManager,
  Modal,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
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
import { Picker } from '@react-native-picker/picker';

import am from "@/translations/am";
import en from "@/translations/en";
import or from "@/translations/or";
import so from "@/translations/so";
import ti from "@/translations/ti";

const isAmharic = (text: string) => /[\u1200-\u137F]/.test(text);

const MyListingItem = memo(({ item, t, onCancel, loadingListingId, getTextStyle, styles }: any) => {
  const isDaily = item.equbName?.toUpperCase().includes("DAILY") || false;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return { bg: '#dcfce7', text: '#166534', label: t.statusActive || 'Active' };
      case 'SOLD': return { bg: '#dbeafe', text: '#1e40af', label: t.statusSold || 'Sold' };
      case 'CANCELLED': return { bg: '#fee2e2', text: '#991b1b', label: t.statusCancelled || 'Cancelled' };
      default: return { bg: '#f3f4f6', text: '#374151', label: status };
    }
  };

  const statusStyle = getStatusColor(item.status);

  return (
    <View style={[styles.card, { marginTop: 10 }]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={[styles.cardTitle, getTextStyle(item.equbName || "", true), isDaily && { color: "#0B3C8A" }]}>
            {item.equbName}
          </Text>
          <View style={styles.amountRow}>
            <Ionicons name="cash-outline" size={14} color="#81CE06" />
            <Text style={[styles.amountText, getTextStyle(`${item.sellingPrice} ${t.currencyBirr}`, true)]}>
              {t.sellingPrice || "Selling Price"}: {item.sellingPrice} {t.currencyBirr || "Birr"}
            </Text>
          </View>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.typeBadgeText, getTextStyle(statusStyle.label, true), { color: statusStyle.text }]}>
            {statusStyle.label}
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

      {item.status === 'ACTIVE' && (
        <View style={styles.cardActions}>
          <TouchableOpacity 
            onPress={() => onCancel(item.id, item.equbId)} 
            disabled={loadingListingId === item.id}
            style={[styles.removeBtn, { flex: 1, justifyContent: "center" }, loadingListingId === item.id && { opacity: 0.7 }]}
          >
            <View style={[styles.btnContent, { justifyContent: "center" }]}>
              {loadingListingId === item.id ? (
                <IOSLoader size={16} color="#DC2626" />
              ) : (
                <>
                  <Ionicons name="close-circle-outline" size={16} color="#DC2626" />
                  <Text style={[styles.btnText, getTextStyle(t.cancelListing || "Cancel", true), { color: "#DC2626", marginLeft: 8 }]}>
                    {t.cancelListing || "Cancel"}
                  </Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
});

export default function EqubSellsPage() {
  const styles = useJoinedEqubStyles();
  const { language, myEqubs } = useAuthStore();
  const { myListings, loadMyListings, cancelListing, createListing, fetchingMyListings } = useEqubTradeStore() as any;
  const navigation = useNavigation();

  const [loadingListingId, setLoadingListingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelModal, setCancelModal] = useState<{ visible: boolean; listingId: string | null; equbId: string | null }>({ visible: false, listingId: null, equbId: null });
  
  // Create Listing State
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedEqubId, setSelectedEqubId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);

  const selectedEqubPrice = useMemo(() => {
    if (!selectedEqubId || !myEqubs) return null;
    const equb = myEqubs.find((e: any) => e.id === selectedEqubId);
    return equb?.sellingPrice || null;
  }, [selectedEqubId, myEqubs]);

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

  useFocusEffect(
    useCallback(() => {
      InteractionManager.runAfterInteractions(() => {
        loadMyListings && loadMyListings();
      });
    }, [loadMyListings])
  );

  const handleCancelListing = useCallback(async (listingId: string, equbId: string) => {
    setLoadingListingId(listingId);
    try {
      await cancelListing(equbId, listingId);
      Toast.show({ type: "success", text1: t.success || "Success", text2: (t as any).toastDeleteSuccess || "Successfully cancelled listing" });
      await loadMyListings(); // Refresh list
    } catch (err: any) {
      Toast.show({ type: "error", text1: t.failed || "Failed", text2: err.message || "Could not cancel listing" });
    } finally {
      setLoadingListingId(null);
      setCancelModal({ visible: false, listingId: null, equbId: null });
    }
  }, [t, loadMyListings, cancelListing]);

  const handleCreateListing = useCallback(async () => {
    if (!selectedEqubId) {
      Toast.show({ type: "error", text1: "Error", text2: (t as any).selectEqubToList || "Select an Equb to list a share" });
      return;
    }
    const price = selectedEqubPrice ? parseFloat(selectedEqubPrice) : NaN;
    if (isNaN(price) || price <= 0) {
      Toast.show({ type: "error", text1: "Error", text2: (t as any).invalidPrice || "Selling price is not available. Cannot list share." });
      return;
    }

    setIsCreating(true);
    try {
      await createListing(selectedEqubId, price);
      Toast.show({ type: "success", text1: t.success || "Success", text2: (t as any).sellSuccess || "Successfully listed share" });
      setCreateModalVisible(false);
      setSelectedEqubId("");
      await loadMyListings();
    } catch (err: any) {
      Toast.show({ type: "error", text1: t.failed || "Failed", text2: err.message || "Could not list share" });
    } finally {
      setIsCreating(false);
    }
  }, [selectedEqubId, selectedEqubPrice, t, createListing, loadMyListings]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMyListings();
    setRefreshing(false);
  }, [loadMyListings]);

  const renderItem = useCallback(({ item }: any) => (
    <MyListingItem 
      item={item} 
      t={t} 
      onCancel={(lId: string, eId: string) => setCancelModal({ visible: true, listingId: lId, equbId: eId })} 
      loadingListingId={loadingListingId} 
      getTextStyle={getTextStyle} 
      styles={styles} 
    />
  ), [t, loadingListingId, getTextStyle, styles]);

  return (
    <View style={{ flex: 1, backgroundColor: "#EFF1F5" }}>
      <Navbar
        leftIcon={<TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}><Ionicons name="arrow-back" size={22} color="white" /></TouchableOpacity>}
        title={(t as any).equbSells || "Equb Sells"}
        secondIcon={<TouchableOpacity onPress={handleRefresh} disabled={refreshing || fetchingMyListings} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}><MaterialCommunityIcons name="refresh" size={24} color={(refreshing || fetchingMyListings) ? "#ccc" : "#fff"} /></TouchableOpacity>}
      />

      <View style={{ flex: 1 }}>
      {fetchingMyListings ? (
        <View style={styles.container}>{[...Array(2)].map((_, idx) => (
          <View key={idx} style={{ marginBottom: 24 }}>
            <SkeletonLoader width={100} height={18} style={{ marginBottom: 12, borderRadius: 8 }} />
            <SkeletonJoinedEqubItem />
          </View>
        ))}</View>
      ) : (
        <FlatList
          style={styles.container}
          contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]}
          data={myListings || []}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <MaterialCommunityIcons name="tag-outline" size={56} color="#C4CCD4" />
              <Text style={[styles.emptyTitle, getTextStyle((t as any).noSellListings || "No shares listed", true)]}>
                {(t as any).noSellListings || "You have not listed any shares yet"}
              </Text>
            </View>
          }
        />
      )}
      </View>

      <TouchableOpacity 
        style={customStyles.fab} 
        onPress={() => setCreateModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="white" />
        <Text style={[customStyles.fabText, getTextStyle((t as any).listForSale || "List for Sale", true)]}>
          {(t as any).listForSale || "List for Sale"}
        </Text>
      </TouchableOpacity>

      {/* Cancel Confirmation Modal */}
      <Modal 
        visible={cancelModal.visible} 
        transparent 
        animationType="fade"
        onRequestClose={() => setCancelModal({ visible: false, listingId: null, equbId: null })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={[styles.modalIconCircle, { backgroundColor: "#fee2e2" }]}><Ionicons name="warning-outline" size={28} color="#dc2626" /></View>
            <Text style={[styles.modalTitle, getTextStyle((t as any).confirmCancelListing || "Confirm Cancel", true)]}>
              {(t as any).cancelListing || "Cancel Listing"}
            </Text>
            <Text style={[styles.modalSubtext, getTextStyle("")]}>
              {(t as any).confirmCancelListing || "Are you sure you want to cancel this listing?"}
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setCancelModal({ visible: false, listingId: null, equbId: null })}>
                <Text style={[styles.cancelBtnText, getTextStyle(t.cancel || "Cancel")]}>{t.cancel || "Close"}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmRemoveBtn, { backgroundColor: "#dc2626" }]} 
                disabled={loadingListingId === cancelModal.listingId} 
                onPress={() => { if (cancelModal.listingId && cancelModal.equbId) handleCancelListing(cancelModal.listingId, cancelModal.equbId); }}
              >
                {loadingListingId === cancelModal.listingId ? <IOSLoader size={16} color="#fff" /> : <Text style={[styles.confirmRemoveBtnText, getTextStyle((t as any).cancelListing || "Cancel", true)]}>{(t as any).cancelListing || "Cancel"}</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Listing Modal */}
      <Modal
        visible={createModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={customStyles.modalOuter}
        >
          <View style={customStyles.modalInner}>
            <View style={customStyles.modalHeader}>
              <Text style={[customStyles.modalTitle, getTextStyle((t as any).listForSale || "List For Sale", true)]}>
                {(t as any).listForSale || "List For Sale"}
              </Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <View style={customStyles.modalBody}>
              <Text style={[customStyles.label, getTextStyle((t as any).selectEqubToList || "Select Equb")]}>
                {(t as any).selectEqubToList || "Select Equb"}
              </Text>
              <View style={customStyles.pickerContainer}>
                <Picker
                  selectedValue={selectedEqubId}
                  onValueChange={(itemValue: string) => setSelectedEqubId(itemValue)}
                  style={[customStyles.picker, getTextStyle("")]}
                  itemStyle={getTextStyle("")}
                >
                  <Picker.Item label={(t as any).selectEqubToList || "Select an Equb..."} value="" style={getTextStyle("")} />
                  {myEqubs?.map((equb: any) => (
                    <Picker.Item key={equb.id} label={equb.name} value={equb.id} style={getTextStyle("")} />
                  ))}
                </Picker>
              </View>

              <Text style={[customStyles.label, getTextStyle((t as any).sellingPrice || "Selling Price"), { marginTop: 16 }]}>
                {(t as any).sellingPrice || "Selling Price"}
              </Text>
              
              <View style={[customStyles.input, { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0', justifyContent: 'center' }]}>
                {!selectedEqubId ? (
                  <Text style={[getTextStyle(""), { color: '#94a3b8' }]}>Select an Equb first</Text>
                ) : selectedEqubPrice ? (
                  <Text style={[getTextStyle(""), { color: '#0f172a', fontWeight: 'bold' }]}>
                    {selectedEqubPrice} {t.currencyBirr || "Birr"}
                  </Text>
                ) : (
                  <Text style={[getTextStyle(""), { color: '#ef4444' }]}>
                    Selling price not available.
                  </Text>
                )}
              </View>
            </View>

            <TouchableOpacity 
              style={[customStyles.submitBtn, (isCreating || !selectedEqubPrice) && { opacity: 0.7, backgroundColor: !selectedEqubPrice ? '#94a3b8' : '#0B3C8A' }]}
              onPress={handleCreateListing}
              disabled={isCreating || !selectedEqubPrice}
            >
              {isCreating ? (
                <IOSLoader size={20} color="#fff" />
              ) : (
                <Text style={[customStyles.submitBtnText, getTextStyle((t as any).confirmSell || "Confirm", true)]}>
                  {(t as any).confirmSell || "Confirm"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const customStyles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#0B3C8A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
  },
  modalOuter: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalInner: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    color: '#0f172a',
  },
  modalBody: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  picker: {
    height: 56,
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8fafc',
    color: '#0f172a',
  },
  submitBtn: {
    backgroundColor: '#0B3C8A',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  submitBtnText: {
    color: 'white',
    fontSize: 16,
  },
});
