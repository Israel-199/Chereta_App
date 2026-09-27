import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalizedTypography } from "../utils/useLocalizedTypography";
import { LEMON_GREEN } from "../constants/theme";

type Props = {
  visible: boolean;
  language: string;
  t: Record<string, string>;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  auctionTitle?: string;
  bidAmount?: string;
};

export default function CheretaTermsModal({ visible, language, t, onClose, onConfirm, auctionTitle, bidAmount }: Props) {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { bold, regular, fontFamily } = useLocalizedTypography(language);

  const handleContinue = async () => {
    if (!accepted) return;
    setLoading(true);
    try {
      await onConfirm();
      setAccepted(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={[bold, styles.title]}>{t.confirmYourBid || "Confirm Your Bid"}</Text>
          
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.infoBox}>
              <Text style={[bold, styles.infoLabel]}>{t.auctionItemLabel || "Auction Item: The brand of the item you are bidding on"}</Text>
              <Text style={[regular, styles.infoValue]}>{auctionTitle ?? "—"}</Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={[bold, styles.infoLabel]}>{t.yourBidAmountLabel || "Your Bid Amount: The amount you entered for this bid"}</Text>
              <Text style={[bold, styles.infoValue, { color: LEMON_GREEN, fontSize: 18 }]}>{bidAmount ? `${bidAmount} ETB` : "—"}</Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={[bold, styles.infoLabel]}>{t.auctionServiceFeeLabel || "Auction Service Fee: 75.00 ETB — Non-refundable"}</Text>
            </View>

            <Text style={[regular, styles.descText]}>
              {t.serviceFeeDesc || "The auction service fee is non-refundable and is required to participate in the auction. This fee will not be deducted from your bid amount when you place your bid."}
            </Text>

            <Text style={[regular, styles.descText]}>
              {t.winnerDesc || "The winner of this auction will be determined based on the participant who submits the Lowest Unique Bid — the lowest bid amount that is submitted by only one participant."}
            </Text>

            <Text style={[regular, styles.descText]}>
              {t.onlyWinnerPaysDesc || "Only the participant who wins the auction will be required to pay the winning bid amount, in addition to the participation fee."}
            </Text>
          </ScrollView>

          <TouchableOpacity style={styles.checkRow} onPress={() => setAccepted((v) => !v)} activeOpacity={0.8}>
            <MaterialCommunityIcons
              name={accepted ? "checkbox-marked" : "checkbox-blank-outline"}
              size={26}
              color={accepted ? LEMON_GREEN : "#9CA3AF"}
            />
            <Text style={[bold, styles.checkLabel]}>{t.agreeToContinue || "I agree to continue"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primary, (!accepted || loading) && styles.primaryDisabled]}
            disabled={!accepted || loading}
            onPress={handleContinue}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[bold, styles.primaryText]}>{t.confirmAndContinue || "Confirm & Continue"}</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onClose} style={styles.cancel}>
            <Text style={[bold, { color: "#6B7280", fontFamily: fontFamily() }]}>{t.cancel || "Cancel"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    maxHeight: "90%",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  title: { fontSize: 24, color: "#111827", marginBottom: 16, textAlign: "center" },
  scroll: { maxHeight: "65%", marginBottom: 16 },
  infoBox: {
    backgroundColor: "#F9FAFB",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  infoLabel: { fontSize: 13, color: "#4B5563", marginBottom: 4 },
  infoValue: { fontSize: 16, color: "#111827" },
  descText: { fontSize: 13, color: "#6B7280", lineHeight: 20, marginBottom: 12, textAlign: "justify" },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18, marginTop: 4 },
  checkLabel: { flex: 1, color: "#111827", fontSize: 15 },
  primary: {
    backgroundColor: LEMON_GREEN,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryDisabled: { opacity: 0.5 },
  primaryText: { color: "#fff", fontSize: 16 },
  cancel: { alignItems: "center", paddingVertical: 16, marginTop: 4 },
});
