import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalizedTypography } from "../utils/useLocalizedTypography";
import { CH_SUBMIT_GREEN, CH_VIEW_MORE_BLUE } from "../constants/theme";

type Props = {
  language: string;
  label: string;
  value: string;
  disabled?: boolean;
  min: number;
  max: number;
  step: number;
  onChange: (v: string) => void;
  confirmLabel?: string;
};

export default function CheretaBidInput({
  language,
  label,
  value,
  disabled,
  min,
  max,
  step,
  onChange,
  confirmLabel = "OK",
}: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { bold, regular, fontFamily } = useLocalizedTypography(language);

  const adjust = (delta: number) => {
    const current = parseFloat(value) || min;
    let next = Math.round((current + delta) / step) * step;
    next = Math.max(min, Math.min(max, next));
    onChange(next.toFixed(2));
  };

  const display = value && parseFloat(value) > 0 ? value : "—";

  return (
    <>
      <View style={[styles.bar, disabled && styles.barDisabled]}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name="gavel" size={22} color="#4B5563" />
        </View>
        <View style={styles.textRow}>
          <Text style={[regular, styles.label, { fontFamily: fontFamily() }]}>{label}</Text>
          <TouchableOpacity
            disabled={disabled}
            onPress={() => setSheetOpen(true)}
            activeOpacity={0.7}
            style={styles.dashHit}
          >
            <Text style={[bold, styles.amount, { fontFamily: fontFamily(true) }]}>{display}</Text>
            <View style={styles.underline} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={sheetOpen} transparent animationType="slide" onRequestClose={() => setSheetOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setSheetOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />
            <Text style={[bold, styles.sheetTitle, { fontFamily: fontFamily(true) }]}>{label}</Text>
            <View style={styles.stepper}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => adjust(-step)}>
                <MaterialCommunityIcons name="minus" size={26} color="#374151" />
              </TouchableOpacity>
              <Text style={[bold, styles.sheetAmount, { fontFamily: fontFamily(true) }]}>{value}</Text>
              <TouchableOpacity style={styles.stepBtn} onPress={() => adjust(step)}>
                <MaterialCommunityIcons name="plus" size={26} color="#374151" />
              </TouchableOpacity>
            </View>
            <Text style={[regular, styles.hint, { fontFamily: fontFamily() }]}>
              {min.toFixed(2)} – {max.toFixed(2)} ETB
            </Text>
            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: CH_SUBMIT_GREEN }]}
              onPress={() => setSheetOpen(false)}
            >
              <Text style={[bold, styles.doneText, { fontFamily: fontFamily(true) }]}>{confirmLabel}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 10,
    paddingHorizontal: 12,
    minHeight: 56,
  },
  barDisabled: { opacity: 0.55 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#E8EDF3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textRow: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
    gap: 6,
  },
  label: {
    fontSize: 15,
    color: "#374151",
  },
  dashHit: {
    paddingBottom: 2,
    minWidth: 48,
  },
  amount: {
    fontSize: 16,
    color: "#111827",
  },
  underline: {
    height: 2,
    backgroundColor: "#374151",
    marginTop: 2,
    borderRadius: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  handle: {
    width: 48,
    height: 5,
    backgroundColor: "#D1D5DB",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    color: "#111827",
    textAlign: "center",
    marginBottom: 20,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    marginBottom: 12,
  },
  stepBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sheetAmount: {
    fontSize: 32,
    color: CH_VIEW_MORE_BLUE,
    minWidth: 120,
    textAlign: "center",
  },
  hint: {
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 20,
  },
  doneBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  doneText: { color: "#fff", fontSize: 16 },
});
