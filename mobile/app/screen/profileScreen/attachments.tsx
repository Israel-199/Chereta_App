import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  Animated,
  ScrollView,
  Dimensions,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { useAuthStore } from "../../../store/auth";
import { translations } from "../../../translations";
import Navbar from "../../../component/Navbar";
import { uploadAttachment, deleteAttachment, updateAttachment } from "../../../api/attachmentService";
import Toast from "react-native-toast-message";
import { IOSLoader } from "../../../component/ButtonLoadingEffect";
import { formatAppDate } from "../../../utils/dateUtils";
import DraggableModal from "../../../component/DraggableModal";

export default function AttachmentsScreen() {
  const router = useRouter();
  const { language, attachments, preloadData } = useAuthStore();
  const [initialLoading, setInitialLoading] = useState(!attachments);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editFile, setEditFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [about, setAbout] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeAttachment, setActiveAttachment] = useState<any>(null);

  const t = useMemo(() => translations[language] || {}, [language]);

  const getFontFamily = useCallback((bold = false) =>
    language === "አማርኛ" || language === "ትግርኛ"
      ? bold ? "NotoSansEthiopic-Bold" : "NotoSansEthiopic-Regular"
      : bold ? "NotoSans-Bold" : "NotoSans-Regular", [language]);

  useEffect(() => {
    if (attachments) {
      setInitialLoading(false);
    } else {
      preloadData();
    }
  }, [attachments, preloadData]);

  const skeletonAnim = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    if (initialLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(skeletonAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
          Animated.timing(skeletonAnim, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      skeletonAnim.stopAnimation();
    }
  }, [initialLoading, skeletonAnim]);

  const SkeletonCard = () => (
    <View style={styles.attachmentCard}>
      <Animated.View style={[styles.attachmentIconContainer, { opacity: skeletonAnim, backgroundColor: "#E5E7EB" }]} />
      <View style={styles.attachmentInfo}>
        <Animated.View style={[{ height: 16, width: "60%", backgroundColor: "#E5E7EB", borderRadius: 4, marginBottom: 8, opacity: skeletonAnim }]} />
        <Animated.View style={[{ height: 12, width: "40%", backgroundColor: "#E5E7EB", borderRadius: 4, marginBottom: 12, opacity: skeletonAnim }]} />
        <View style={styles.cardBottomRow}>
          <Animated.View style={[{ height: 10, width: "30%", backgroundColor: "#E5E7EB", borderRadius: 4, opacity: skeletonAnim }]} />
          <View style={styles.actionIcons}>
            <Animated.View style={[styles.iconCircle, { backgroundColor: "#E5E7EB", opacity: skeletonAnim }]} />
            <Animated.View style={[styles.iconCircle, { backgroundColor: "#E5E7EB", marginLeft: 12, opacity: skeletonAnim }]} />
          </View>
        </View>
      </View>
    </View>
  );

  const handlePickDocument = async (isEdit = false) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/*"],
      });

      if (!result.canceled) {
        if (isEdit) {
          setEditFile(result);
        } else {
          setSelectedFile(result);
        }
      }
    } catch (err) {
      console.error("Pick document error:", err);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || selectedFile.canceled) {
      Toast.show({ type: "error", text1: t.error || "Error", text2: t.chooseFilePlaceholder });
      return;
    }

    const file = selectedFile.assets[0];

    if (!about || about.trim() === "") {
      Toast.show({
        type: "error",
        text1: t.error || "Error",
        text2: t.aboutSectionRequired,
      });
      return;
    }

    setUploading(true);
    try {
      await uploadAttachment(file.uri, about.trim(), file.name, file.mimeType || "application/octet-stream");
      Toast.show({ type: "success", text1: t.success || "Success", text2: t.attachmentUploadSuccess });
      setShowUploadModal(false);
      setSelectedFile(null);
      setAbout("");
    } catch (err: any) {
      Toast.show({ type: "error", text1: t.error || "Error", text2: err.message || "Failed to upload attachment" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!activeAttachment) return;
    setDeleting(true);
    try {
      await deleteAttachment(activeAttachment.id);
      Toast.show({ type: "success", text1: t.success || "Success", text2: t.attachmentDeleteSuccess });
      setShowDeleteModal(false);
      setActiveAttachment(null);
    } catch (err: any) {
      Toast.show({ type: "error", text1: t.error || "Error", text2: err.message || "Failed to delete attachment" });
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdate = async () => {
    if (!activeAttachment) return;

    const hasFileChanged = editFile && !editFile.canceled;
    const hasAboutChanged = about.trim() !== (activeAttachment.about || "");

    if (!hasFileChanged && !hasAboutChanged) {
      Toast.show({ type: "info", text1: t.info || "Info", text2: t.noChangesMade });
      return;
    }

    if (!about || about.trim() === "") {
      Toast.show({ type: "error", text1: t.error || "Error", text2: "About section is needed" });
      return;
    }

    setUploading(true);
    try {
      const fileToUpdate = editFile && !editFile.canceled ? editFile.assets[0] : null;
      await updateAttachment(
        activeAttachment.id, 
        about.trim(),
        fileToUpdate?.uri,
        fileToUpdate?.name,
        fileToUpdate?.mimeType || "application/octet-stream"
      );
      Toast.show({ type: "success", text1: t.success || "Success", text2: t.attachmentUpdateSuccess });
      setShowEditModal(false);
      setActiveAttachment(null);
      setAbout("");
      setEditFile(null);
    } catch (err: any) {
      Toast.show({ type: "error", text1: t.error || "Error", text2: err.message || "Failed to update attachment" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.root}>
      <Navbar
        leftIcon={<MaterialCommunityIcons name="arrow-left" size={24} color="#fff" onPress={() => router.back()} />}
        title={t.attachmentTitle}
        firstIcon={<MaterialCommunityIcons name="plus" size={26} color="#fff" onPress={() => { setSelectedFile(null); setAbout(""); setShowUploadModal(true); }} />}
      />

      <FlatList
        style={{ flex: 1 }}
        data={initialLoading ? [1, 2, 3] : attachments}
        keyExtractor={(item, index) => initialLoading ? index.toString() : item.id}
        contentContainerStyle={[styles.container, (!attachments || attachments.length === 0) && !initialLoading && { justifyContent: 'center' }]}
        renderItem={({ item }) => {
          if (initialLoading) return <SkeletonCard />;
          return (
            <View style={styles.attachmentCard}>
              <View style={styles.attachmentIconContainer}>
                <MaterialCommunityIcons name={item.fileType?.includes("image") ? "image" : "file-document"} size={32} color="#0B3C8A" />
              </View>
              <View style={styles.attachmentInfo}>
                <Text style={[styles.fileName, { fontFamily: getFontFamily(true) }]} numberOfLines={1}>{item.fileName || t.unnamedFile}</Text>
                <TouchableOpacity onPress={() => { setActiveAttachment(item); setShowDetailsModal(true); }}>
                  <Text style={[styles.detailsLink, { fontFamily: getFontFamily(false) }]}>{t.tapSeeDetails}</Text>
                </TouchableOpacity>
                <View style={styles.cardBottomRow}>
                  <Text style={styles.dateText}>{formatAppDate(item.createdAt, language, t)}</Text>
                  <View style={styles.actionIcons}>
                    <TouchableOpacity style={[styles.iconCircle, { backgroundColor: "#E6EDF9" }]} onPress={() => { setActiveAttachment(item); setAbout(item.about || ""); setShowEditModal(true); }}>
                      <MaterialCommunityIcons name="pencil-outline" size={18} color="#0B3C8A" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconCircle, { backgroundColor: "#FEE2E2", marginLeft: 12 }]} onPress={() => { setActiveAttachment(item); setShowDeleteModal(true); }}>
                      <MaterialCommunityIcons name="trash-can-outline" size={18} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={!initialLoading ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="history" size={100} color="#ccc" />
              <Text style={[styles.emptyText, { fontFamily: getFontFamily(true) }]}>{t.noAttachmentAvailable}</Text>
            </View>
          ) : null
        }
      />

      {/* Upload Modal */}
      <DraggableModal visible={showUploadModal} onClose={() => setShowUploadModal(false)}>
        <ScrollView 
          style={{ maxHeight: SCREEN_HEIGHT * 0.7 }} 
          contentContainerStyle={{ paddingBottom: 300 }}
          showsVerticalScrollIndicator={false} 
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ paddingBottom: 20 }}>
          <Text style={[styles.modalTitle, { fontFamily: getFontFamily(true), marginBottom: 20 }]}>{t.attachmentTitle}</Text>
          <TouchableOpacity style={styles.filePickerBox} onPress={() => handlePickDocument(false)}>
            {selectedFile && !selectedFile.canceled ? (
              <View style={styles.selectedFileView}>
                <MaterialCommunityIcons name="file-check" size={40} color="#16A34A" />
                <Text style={[styles.selectedFileName, { fontFamily: getFontFamily(false) }]} numberOfLines={1}>{selectedFile.assets[0].name}</Text>
              </View>
            ) : (
              <View style={styles.pickerPlaceholder}>
                <MaterialCommunityIcons name="cloud-upload" size={40} color="#0B3C8A" />
                <Text style={[styles.pickerText, { fontFamily: getFontFamily(false) }]}>{t.chooseFilePlaceholder}</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { fontFamily: getFontFamily(true) }]}>{t.aboutFile}</Text>
            <TextInput style={[styles.textInput, { fontFamily: getFontFamily(false) }]} placeholder={t.describeFilePlaceholder} value={about} onChangeText={setAbout} multiline />
          </View>
          <TouchableOpacity style={[styles.uploadButton, uploading && styles.disabledButton]} onPress={handleUpload} disabled={uploading}>
            {uploading ? <ActivityIndicator color="#fff" /> : <Text style={[styles.uploadButtonText, { fontFamily: getFontFamily(true) }]}>{t.attachButton}</Text>}
          </TouchableOpacity>
        </View>
        </ScrollView>
      </DraggableModal>

      {/* Details Modal */}
      <DraggableModal visible={showDetailsModal} onClose={() => setShowDetailsModal(false)}>
        <View style={{ paddingBottom: 10 }}>
          <Text style={[styles.modalTitle, { fontFamily: getFontFamily(true), marginBottom: 20 }]}>{t.fileDetails}</Text>
          <View style={styles.detailRow}>
            <Text style={[styles.label, { fontFamily: getFontFamily(true) }]}>{t.fileNameLabel}:</Text>
            <Text style={[styles.value, { fontFamily: getFontFamily(false) }]}>{activeAttachment?.fileName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.label, { fontFamily: getFontFamily(true) }]}>{t.fileAboutLabel}:</Text>
            <Text style={[styles.value, { fontFamily: getFontFamily(false) }]}>{activeAttachment?.about || "N/A"}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.label, { fontFamily: getFontFamily(true) }]}>{t.fileDateLabel}:</Text>
            <Text style={[styles.value, { fontFamily: getFontFamily(false) }]}>{activeAttachment && formatAppDate(activeAttachment.createdAt, language, t)}</Text>
          </View>
          <TouchableOpacity style={[styles.uploadButton, { marginTop: 20 }]} onPress={() => setShowDetailsModal(false)}>
            <Text style={[styles.uploadButtonText, { fontFamily: getFontFamily(true) }]}>{t.closeButton}</Text>
          </TouchableOpacity>
        </View>
      </DraggableModal>

      {/* Edit Modal */}
      <DraggableModal visible={showEditModal} onClose={() => setShowEditModal(false)}>
        <ScrollView 
          style={{ maxHeight: SCREEN_HEIGHT * 0.7 }} 
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false} 
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ paddingBottom: 20 }}>
          <Text style={[styles.modalTitle, { fontFamily: getFontFamily(true), marginBottom: 20 }]}>{t.editAttachment}</Text>
          <TouchableOpacity style={styles.filePickerBox} onPress={() => handlePickDocument(true)}>
            {editFile && !editFile.canceled ? (
              <View style={styles.selectedFileView}>
                <MaterialCommunityIcons name="file-check" size={40} color="#16A34A" />
                <Text style={[styles.selectedFileName, { fontFamily: getFontFamily(false) }]} numberOfLines={1}>{editFile.assets[0].name}</Text>
              </View>
            ) : (
              <View style={styles.pickerPlaceholder}>
                <MaterialCommunityIcons name="cloud-upload" size={40} color="#0B3C8A" />
                <Text style={[styles.pickerText, { fontFamily: getFontFamily(false) }]}>{activeAttachment?.fileName || t.replaceFileOptional}</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { fontFamily: getFontFamily(true) }]}>{t.aboutFile}</Text>
            <TextInput style={[styles.textInput, { fontFamily: getFontFamily(false) }]} placeholder={t.describeFilePlaceholder} value={about} onChangeText={setAbout} multiline />
          </View>
          <TouchableOpacity style={[styles.uploadButton, uploading && styles.disabledButton]} onPress={handleUpdate} disabled={uploading}>
            {uploading ? <ActivityIndicator color="#fff" /> : <Text style={[styles.uploadButtonText, { fontFamily: getFontFamily(true) }]}>{t.updateButton}</Text>}
          </TouchableOpacity>
        </View>
        </ScrollView>
      </DraggableModal>

      {/* Delete Modal */}
      <DraggableModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <View style={{ paddingBottom: 10, alignItems: 'center' }}>
          <MaterialCommunityIcons name="alert-circle-outline" size={60} color="#DC2626" />
          <Text style={[styles.modalTitle, { fontFamily: getFontFamily(true), marginTop: 10 }]}>{t.confirmDelete}</Text>
          <Text style={[styles.pickerText, { fontFamily: getFontFamily(false), textAlign: "center", marginVertical: 15 }]}>{t.deleteConfirmationMessage}</Text>
          <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
            <TouchableOpacity style={{ flex: 1, height: 52, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' }} onPress={() => setShowDeleteModal(false)}>
              <Text style={[styles.confirmButtonText, { color: "#333", fontFamily: getFontFamily(true) }]}>{t.cancel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1, height: 52, borderRadius: 12, backgroundColor: '#DC2626', justifyContent: 'center', alignItems: 'center' }} onPress={handleDelete} disabled={deleting}>
              {deleting ? <ActivityIndicator color="#fff" /> : <Text style={[styles.confirmButtonText, { color: "#fff", fontFamily: getFontFamily(true) }]}>{t.deleteButton}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </DraggableModal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F2F4F7" },
  container: { flexGrow: 1, padding: 16 },
  attachmentCard: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 12, padding: 12, marginBottom: 12, alignItems: "center" },
  attachmentIconContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#E6EDF9", justifyContent: "center", alignItems: "center", marginRight: 12 },
  attachmentInfo: { flex: 1 },
  fileName: { fontSize: 16, color: "#333" },
  actionIcons: { flexDirection: "row", alignItems: "center" },
  iconCircle: { width: 34, height: 34, borderRadius: 17, justifyContent: "center", alignItems: "center" },
  cardBottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 4 },
  detailsLink: { fontSize: 13, color: "#0B3C8A", textDecorationLine: "underline", marginVertical: 4 },
  dateText: { fontSize: 11, color: "#999" },
  emptyState: { alignItems: "center" },
  emptyText: { marginTop: 16, fontSize: 18, color: "#999", textAlign: 'center' },
  modalTitle: { fontSize: 20, color: "#333" },
  filePickerBox: { borderWidth: 2, borderColor: "#E6EDF9", borderStyle: "dashed", borderRadius: 16, height: 120, justifyContent: "center", alignItems: "center", marginBottom: 20, backgroundColor: "#FAFBFE" },
  selectedFileView: { alignItems: "center", padding: 10 },
  selectedFileName: { marginTop: 8, color: "#16A34A", fontSize: 14 },
  pickerPlaceholder: { alignItems: "center" },
  pickerText: { marginTop: 8, color: "#0B3C8A", fontSize: 14 },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 16, color: "#333", marginBottom: 8 },
  value: { fontSize: 15, color: "#555", flex: 1, marginLeft: 10 },
  detailRow: { flexDirection: "row", marginBottom: 10 },
  textInput: { backgroundColor: "#F9FAFB", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#E5E7EB", minHeight: 80, textAlignVertical: "top" },
  uploadButton: { backgroundColor: "#0B3C8A", borderRadius: 14, height: 56, justifyContent: "center", alignItems: "center" },
  disabledButton: { opacity: 0.7 },
  uploadButtonText: { color: "#fff", fontSize: 18 },
  confirmButtonText: { fontSize: 16 },
});