import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth";
import { createSupportTicket, getMySupportTickets, deleteSupportTicket } from "@/api/supportService";
import SkeletonLoader from "@/component/SkeletonLoader";
import Navbar from "@/component/Navbar";
import Toast from "react-native-toast-message";
import { formatAppDate } from "@/utils/dateUtils";

import am from "@/translations/am";
import en from "@/translations/en";
import or from "@/translations/or";
import so from "@/translations/so";
import ti from "@/translations/ti";

const { width } = Dimensions.get("window");

export default function DisputeSupportScreen() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { language } = useAuthStore();
  const router = useRouter();

  const getFontFamily = (bold = false) =>
    language === "አማርኛ" || language === "ትግርኛ"
      ? bold
        ? "NotoSansEthiopic-Bold"
        : "NotoSansEthiopic-Regular"
      : bold
      ? "NotoSans-Bold"
      : "NotoSans-Regular";

  const getT = () => {
    if (language === "አማርኛ") return am;
    if (language === "Afaan Oromo") return or;
    if (language === "Af Somali") return so;
    if (language === "ትግርኛ") return ti;
    return en;
  };

  const t = getT() as any;

  const fetchTickets = async (showSkeleton = true) => {
    if (showSkeleton) setLoading(true);
    try {
      const data = await getMySupportTickets();
      setTickets(data);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTickets();
      const interval = setInterval(() => fetchTickets(false), 10000); 
      return () => clearInterval(interval);
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets(false);
  };

  const handleSubmit = async () => {
    if (!subject.trim()) {
      Toast.show({ type: "error", text1: t.enterSubject });
      return;
    }
    if (!message.trim()) {
      Toast.show({ type: "error", text1: t.enterMessage });
      return;
    }

    setSubmitting(true);
    try {
      await createSupportTicket(subject, message);
      Toast.show({ type: "success", text1: t.ticketSubmitted });
      setSubject("");
      setMessage("");
      setShowForm(false);
      fetchTickets(false);
    } catch (error: any) {
      Toast.show({ type: "error", text1: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteSupportTicket(id);
      setTickets((prev) => prev.filter((t) => t.id !== id));
      Toast.show({ type: "success", text1: t.ticketDeleted || "Ticket deleted" });
    } catch (error: any) {
      Toast.show({ type: "error", text1: error.message });
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN": return "#F59E0B";
      case "IN_PROGRESS": return "#3B82F6";
      case "RESOLVED": return "#22C55E";
      case "CLOSED": return "#64748B";
      default: return "#64748B";
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Navbar title={t.supportDispute} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <SkeletonLoader width={width - 40} height={200} borderRadius={24} style={{ marginBottom: 20 }} />
          {[...Array(3)].map((_, i) => (
            <SkeletonLoader key={i} width={width - 40} height={100} borderRadius={20} style={{ marginBottom: 12 }} />
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Navbar
        title={t.supportDispute}
        leftIcon={
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        }
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0B3C8A" colors={["#0B3C8A"]} />
        }
      >
        {/* Toggle Form Button */}
        <TouchableOpacity 
          style={styles.newTicketButton} 
          onPress={() => setShowForm(!showForm)}
        >
          <MaterialCommunityIcons name={showForm ? "chevron-up" : "plus-circle"} size={22} color="#fff" />
          <Text style={[styles.newTicketText, { fontFamily: getFontFamily(true) }]}>
            {showForm ? t.cancel : t.submitTicket}
          </Text>
        </TouchableOpacity>

        {showForm && (
          <View style={styles.formCard}>
            <Text style={[styles.formNote, { fontFamily: getFontFamily(false) }]}>
              {t.disputeNote}
            </Text>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { fontFamily: getFontFamily(true) }]}>{t.subject}</Text>
              <TextInput
                style={[styles.input, { fontFamily: getFontFamily(false) }]}
                placeholder={t.subject}
                value={subject}
                onChangeText={setSubject}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { fontFamily: getFontFamily(true) }]}>{t.message}</Text>
              <TextInput
                style={[styles.textArea, { fontFamily: getFontFamily(false) }]}
                placeholder={t.message}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
              />
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, submitting && { opacity: 0.7 }]} 
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.submitButtonText, { fontFamily: getFontFamily(true) }]}>
                  {t.submitTicket}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.historySection}>
          <Text style={[styles.historyTitle, { fontFamily: getFontFamily(true) }]}>
            {t.equbHistory}
          </Text>

          {tickets.length === 0 ? (
            <View style={styles.emptyTickets}>
              <MaterialCommunityIcons name="message-off-outline" size={48} color="#CBD5E1" />
              <Text style={[styles.emptyText, { fontFamily: getFontFamily(false) }]}>
                {t.noTickets}
              </Text>
            </View>
          ) : (
            tickets.map((ticket) => (
              <View key={ticket.id} style={styles.ticketCard}>
                <View style={styles.ticketHeader}>
                  <Text style={[styles.ticketSubject, { fontFamily: getFontFamily(true) }]} numberOfLines={1}>
                    {ticket.subject}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(ticket.status)}15` }]}>
                    <Text style={[styles.statusText, { fontFamily: getFontFamily(true), color: getStatusColor(ticket.status) }]}>
                      {t.ticketStatusValues[ticket.status] || ticket.status}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => handleDelete(ticket.id)} 
                    disabled={deletingId === ticket.id}
                    style={{ marginLeft: 12 }}
                  >
                    {deletingId === ticket.id ? (
                      <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={[styles.ticketMessage, { fontFamily: getFontFamily(false) }]} numberOfLines={2}>
                  {ticket.message}
                </Text>
                <Text style={styles.ticketDate}>
                  {formatAppDate(ticket.createdAt, language, t)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  newTicketButton: {
    backgroundColor: "#0B3C8A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
    gap: 10,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#0B3C8A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  newTicketText: {
    color: "#fff",
    fontSize: 16,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  formNote: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: "#1E293B",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1E293B",
  },
  address: {
      flex: 1,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1E293B",
  },
  textArea: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    color: "#1E293B",
    minHeight: 120,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#0B3C8A",
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  historySection: {
    marginTop: 10,
  },
  historyTitle: {
    fontSize: 18,
    color: "#1E293B",
    marginBottom: 16,
    marginLeft: 4,
  },
  ticketCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  ticketSubject: {
    fontSize: 16,
    color: "#1E293B",
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    textTransform: "uppercase",
  },
  ticketMessage: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
  ticketDate: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 12,
    textAlign: "right",
  },
  emptyTickets: {
    paddingVertical: 40,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  emptyText: {
    marginTop: 12,
    color: "#94A3B8",
    fontSize: 14,
  },
});
