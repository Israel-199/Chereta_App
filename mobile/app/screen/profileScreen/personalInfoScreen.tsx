import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import { usePersonalInfoStyles } from "@/styles/personalInfoStyles";
import axiosClient from "../../../api/axiosClient";
import Toast from "react-native-toast-message";
import Navbar from "../../../component/Navbar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { translations } from "../../../translations";
import { useAuthStore } from "../../../store/auth";
import { useRouter } from "expo-router";
import { IOSLoader } from "../../../component/ButtonLoadingEffect";
import DraggableModal from "../../../component/DraggableModal";
import { KNOWN_PLACES } from "@/data/places";

export default function PersonalInfoScreen() {
  const { language, loading, setLoading, token, profile } = useAuthStore();
  const router = useRouter();
  const styles = usePersonalInfoStyles();
  const initialData = useMemo(() => ({
    address: profile?.address || "",
    jobType: profile?.jobType || "",
    gender: profile?.gender || "",
    lastName: profile?.lastName || "",
    firstName: profile?.firstName || "",
  }), [profile]);

  const [form, setForm] = useState(initialData);
  const [originalForm, setOriginalForm] = useState(initialData);

  useEffect(() => {
    setForm(initialData);
    setOriginalForm(initialData);
  }, [initialData]);

  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showAddressList, setShowAddressList] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const t = useMemo(() => translations[language] || translations["en"], [language]);

  const filteredPlaces = useMemo(() => 
    KNOWN_PLACES.filter((place) => place.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery]
  );

  const getFontFamily = useCallback((bold = false) =>
    language === "አማርኛ" || language === "ትግርኛ"
      ? bold ? "NotoSansEthiopic-Bold" : "NotoSansEthiopic-Regular"
      : bold ? "NotoSans-Bold" : "NotoSans-Regular",
    [language]
  );

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosClient.get("/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const serverData = {
          address: res.data.address || "",
          jobType: res.data.jobType || "",
          gender: res.data.gender || "",
          lastName: res.data.lastName || "",
          firstName: res.data.firstName || "",
        };
        setForm(serverData);
        setOriginalForm(serverData);
        useAuthStore.getState().setProfile(res.data);
      } catch (err: any) {
        if (!profile) {
          const key = err.response?.data?.errorKey || err.message;
          Toast.show({
            type: "error",
            text1: t.profileError || "Profile Error",
            text2: t[key] || key,
          });
        }
      }
    };
    if (token && !profile) fetchProfile();
  }, [token, t, language, profile]);

  const handleRegister = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.gender || !form.address) {
      Toast.show({
        type: "error",
        text1: t.validationError || "Validation Error",
        text2: t.allFieldsRequired || "All fields are required",
      });
      return;
    }

    if (JSON.stringify(form) === JSON.stringify(originalForm)) {
      Toast.show({
        type: "info",
        text1: t.info || "Info",
        text2: t.nothingChanged || "Nothing is changed",
      });
      return;
    }

    const nameRegex = /^[a-zA-Z\u1200-\u137F\s]{2,}$/;
    if (!nameRegex.test(form.firstName.trim()) || !nameRegex.test(form.lastName.trim())) {
      Toast.show({
        type: "error",
        text1: t.validationError || "Validation Error",
        text2: t.nameInvalid || "Names must be at least 2 characters and contain no numbers",
      });
      return;
    }

    if (form.address && !isNaN(Number(form.address.trim()))) {
      Toast.show({
        type: "error",
        text1: t.validationError || "Validation Error",
        text2: t.addressInvalid || "Address cannot be just numbers",
      });
      return;
    }

    setLoading(true);
    try {
      const meRes = await axiosClient.get("/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userId = meRes.data.id;

      const res = await axiosClient.post(
        "/user/complete-profile",
        { userId, ...form },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      Toast.show({
        type: "success",
        text1: t.profileUpdated || "Profile Updated",
        text2: res.data?.messageKey ? t[res.data.messageKey] : (t.profileSaved || "Your personal info has been saved"),
      });

      useAuthStore.getState().setProfile(res.data.user);
      setTimeout(() => {
        router.replace("/(tabs)/account");
      }, 1500);
    } catch (err: any) {
      const responseData = err.response?.data;
      const key = responseData?.errorKey;
      const errorMessage = responseData?.error || responseData?.message || err.message;
      Toast.show({
        type: "error",
        text1: t.updateFailed || "Update Failed",
        text2: (key && t[key]) ? t[key] : errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Navbar
        leftIcon={<MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />}
        onLeftPress={() => router.back()}
        title={t.updateAccount}
        firstIcon={<MaterialCommunityIcons name="refresh" size={22} color="#fff" />}
        onFirstPress={() => {
          setLoading(true);
          setTimeout(() => setLoading(false), 1000);
        }}
      />
      <ScrollView style={styles.container}>
        <Text style={[styles.header, { fontFamily: getFontFamily(true) }]}>{t.updateAccount}</Text>
        <TextInput
          style={[styles.input, { fontFamily: getFontFamily(false) }]}
          placeholder={t.firstName}
          placeholderTextColor="#9CA3AF"
          value={form.firstName}
          onChangeText={(v) => handleChange("firstName", v)}
        />
        <TextInput
          style={[styles.input, { fontFamily: getFontFamily(false) }]}
          placeholder={t.lastName}
          placeholderTextColor="#9CA3AF"
          value={form.lastName}
          onChangeText={(v) => handleChange("lastName", v)}
        />

        <TouchableOpacity
          style={[styles.input, { flexDirection: "row", alignItems: "center" }]}
          onPress={() => setShowGenderDropdown(true)}
        >
          <Text style={{ fontFamily: getFontFamily(false), flex: 1, color: form.gender ? "#111" : "#9CA3AF" }}>
            {form.gender || t.gender}
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={22} color="#555" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.input, { flexDirection: "row", alignItems: "center" }]}
          onPress={() => setShowAddressList(true)}
        >
          <Text style={{ fontFamily: getFontFamily(false), flex: 1, color: form.address ? "#111" : "#9CA3AF" }}>
            {form.address || t.address}
          </Text>
          <MaterialCommunityIcons name="magnify" size={22} color="#555" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
              <IOSLoader size={20} color="#ccc" />
              <Text style={[styles.buttonText, { fontFamily: getFontFamily(true), marginLeft: 8, color: "#ccc" }]}>
                {t.update || "Updating..."}
              </Text>
            </View>
          ) : (
            <Text style={[styles.buttonText, { fontFamily: getFontFamily(true) }]}>
              {t.update || "Update"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <DraggableModal visible={showGenderDropdown} onClose={() => setShowGenderDropdown(false)}>
        <View style={{ paddingBottom: 10 }}>
          {["Male", "Female"].map((g) => (
            <TouchableOpacity key={g} style={{ paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }} onPress={() => { handleChange("gender", g); setShowGenderDropdown(false); }}>
              <Text style={{ fontFamily: getFontFamily(false), fontSize: 16, textAlign: 'center', color: '#1E293B' }}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </DraggableModal>

      <DraggableModal 
        visible={showAddressList} 
        onClose={() => setShowAddressList(false)}
        header={
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontFamily: getFontFamily(true), fontSize: 18, marginBottom: 12, color: '#0F172A' }}>Select City</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 12 }}>
              <MaterialCommunityIcons name="magnify" size={20} color="#64748B" />
              <TextInput 
                style={{ flex: 1, height: 48, fontFamily: getFontFamily(false), marginLeft: 8 }} 
                placeholder="Search city..." 
                value={searchQuery} 
                onChangeText={setSearchQuery} 
              />
            </View>
          </View>
        }
      >
        <FlatList
          data={filteredPlaces}
          keyExtractor={(item) => item}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }} onPress={() => { handleChange("address", item); setShowAddressList(false); }}>
              <Text style={{ fontFamily: getFontFamily(false), fontSize: 15, color: '#334155' }}>{item}</Text>
            </TouchableOpacity>
          )}
          style={{ maxHeight: 400 }}
        />
      </DraggableModal>
    </View>
  );
}
