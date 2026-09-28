import React, { memo } from "react";
import { View, Text, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LEMON_GREEN, LEMON_GREEN_DARK, CH_VIEW_MORE_BLUE } from "@/constants/theme";

export type ResultsTableRow = {
  phone: string;
  category: string;
  bidAmount: number;
  auctionCode: string;
  kind: "winner" | "duplicate";
};

type Col = { key: keyof ResultsTableRow | "status"; label: string; width: number };

const COLS: Col[] = [
  { key: "status", label: "", width: 44 },
  { key: "phone", label: "Phone", width: 148 },
  { key: "category", label: "Category", width: 130 },
  { key: "bidAmount", label: "Bid", width: 88 },
  { key: "auctionCode", label: "Code", width: 108 },
];

type Props = {
  rows: ResultsTableRow[];
  labels: {
    phone: string;
    category: string;
    bid: string;
    code: string;
    empty: string;
    swipeHint: string;
    winnerLegend: string;
    duplicateLegend: string;
    tableTitle: string;
  };
  bold: any;
  regular: any;
};

function CheretaResultsTable({ rows, labels, bold, regular }: Props) {
  const headerLabels: Record<string, string> = {
    phone: labels.phone,
    category: labels.category,
    bidAmount: labels.bid,
    auctionCode: labels.code,
  };

  const tableMinWidth = COLS.reduce((s, c) => s + c.width, 0);

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 22,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: "#F8FAFC",
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <MaterialCommunityIcons name="table-large" size={20} color={CH_VIEW_MORE_BLUE} />
          <Text style={[bold, { marginLeft: 8, fontSize: 16, color: "#111827" }]}>{labels.tableTitle}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialCommunityIcons name="gesture-swipe-horizontal" size={18} color="#9CA3AF" />
          <Text style={[regular, { marginLeft: 4, fontSize: 11, color: "#9CA3AF" }]}>{labels.swipeHint}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", paddingHorizontal: 16, paddingVertical: 10, gap: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: LEMON_GREEN_DARK, marginRight: 6 }} />
          <Text style={[regular, { fontSize: 12, color: "#374151" }]}>{labels.winnerLegend}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#DC2626", marginRight: 6 }} />
          <Text style={[regular, { fontSize: 12, color: "#374151" }]}>{labels.duplicateLegend}</Text>
        </View>
      </View>

      {rows.length === 0 ? (
        <Text style={[regular, { padding: 24, textAlign: "center", color: "#6B7280" }]}>{labels.empty}</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator
          bounces
          contentContainerStyle={{ paddingBottom: 4 }}
        >
          <View style={{ minWidth: tableMinWidth }}>
            <View
              style={{
                flexDirection: "row",
                backgroundColor: "#EEF2FF",
                paddingVertical: 12,
                paddingHorizontal: 8,
                borderTopWidth: 1,
                borderTopColor: "#E5E7EB",
              }}
            >
              {COLS.map((col) => (
                <Text
                  key={col.key}
                  style={[
                    bold,
                    {
                      width: col.width,
                      fontSize: 12,
                      color: "#374151",
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                    },
                  ]}
                >
                  {col.key === "status" ? " " : headerLabels[col.key as string] ?? col.label}
                </Text>
              ))}
            </View>

            {rows.map((row, idx) => {
              const isWin = row.kind === "winner";
              const accent = isWin ? LEMON_GREEN_DARK : "#DC2626";
              const bg = isWin ? "#F0FDF4" : "#FEF2F2";
              return (
                <View
                  key={`${row.phone}-${row.bidAmount}-${idx}`}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 14,
                    paddingHorizontal: 8,
                    backgroundColor: bg,
                    borderTopWidth: 1,
                    borderTopColor: "#E5E7EB",
                  }}
                >
                  <View style={{ width: COLS[0].width, alignItems: "center" }}>
                    <MaterialCommunityIcons
                      name={isWin ? "trophy" : "close-circle-outline"}
                      size={22}
                      color={accent}
                    />
                  </View>
                  <Text style={[bold, { width: COLS[1].width, fontSize: 13, color: accent }]} numberOfLines={1}>
                    {row.phone}
                  </Text>
                  <Text style={[regular, { width: COLS[2].width, fontSize: 13, color: "#374151" }]} numberOfLines={2}>
                    {row.category}
                  </Text>
                  <Text style={[bold, { width: COLS[3].width, fontSize: 13, color: accent }]}>
                    {row.bidAmount.toFixed(2)}
                  </Text>
                  <Text style={[bold, { width: COLS[4].width, fontSize: 13, color: CH_VIEW_MORE_BLUE }]}>
                    {row.auctionCode}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

export default memo(CheretaResultsTable);
