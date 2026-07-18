import {
  Calendar,
  ChevronLeft,
  ListChecks,
  Plus,
  Trash2,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  StatusBar as RNStatusBar,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import PlatformDateTimePicker from "../../../components/platform-date-time-picker";
import { useExam } from "../../context/ExamContext";

type ViewMode = "list" | "form";

export default function QuestionsCategoryScreen() {
  const { categories, addCategory, updateCategory, deleteCategory } = useExam();

  const [mode, setMode] = useState<ViewMode>("list");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [schedule, setSchedule] = useState("");
  const [scheduleDate, setScheduleDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [duration, setDuration] = useState("");

  const activeCategory = activeCategoryId
    ? categories.find((c: any) => c.id === activeCategoryId)
    : null;
  const isEditMode = !!activeCategory;

  const formatSchedule = (date: Date) => {
    const dateStr = date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${dateStr} • ${hours}:${minutes} WIB`;
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (event.type === "dismissed" || !selectedDate) return;

    const updated = new Date(scheduleDate);
    updated.setFullYear(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
    );
    setScheduleDate(updated);
    setSchedule(formatSchedule(updated));
    setShowTimePicker(true);
  };

  const onChangeTime = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (event.type === "dismissed" || !selectedTime) return;

    const updated = new Date(scheduleDate);
    updated.setHours(selectedTime.getHours(), selectedTime.getMinutes());
    setScheduleDate(updated);
    setSchedule(formatSchedule(updated));
  };

  const openAddForm = () => {
    setActiveCategoryId(null);
    setTitle("");
    setSchedule("");
    setScheduleDate(new Date());
    setDuration("");
    setMode("form");
  };

  const openEditForm = (category: any) => {
    setActiveCategoryId(category.id);
    setTitle(category.title);
    setSchedule(category.schedule);
    setScheduleDate(
      category.scheduleTimestamp
        ? new Date(category.scheduleTimestamp)
        : new Date(),
    );
    setDuration(String(category.duration));
    setMode("form");
  };

  const backToList = () => {
    setMode("list");
    setActiveCategoryId(null);
  };

  const handleSubmit = () => {
    if (!title.trim() || !schedule.trim() || !duration.trim()) {
      Alert.alert("Data Belum Lengkap", "Semua field wajib diisi.");
      return;
    }
    const durationNumber = parseInt(duration, 10);
    if (isNaN(durationNumber) || durationNumber <= 0) {
      Alert.alert(
        "Durasi Tidak Valid",
        "Durasi harus berupa angka menit yang valid.",
      );
      return;
    }

    const scheduleTimestamp = scheduleDate.getTime();

    if (isEditMode && activeCategory) {
      updateCategory(activeCategory.id, {
        title,
        schedule,
        scheduleTimestamp,
        duration: durationNumber,
      });
      Alert.alert("Tersimpan", "Info kategori berhasil diperbarui.", [
        { text: "OK", onPress: backToList },
      ]);
    } else {
      addCategory({
        title,
        schedule,
        scheduleTimestamp,
        duration: durationNumber,
      });
      Alert.alert("Tersimpan", "Kategori berhasil ditambahkan.", [
        { text: "OK", onPress: backToList },
      ]);
    }
  };

  const handleDelete = () => {
    if (!activeCategory) return;
    Alert.alert(
      "Hapus Kategori",
      `Yakin ingin menghapus "${activeCategory.title}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => {
            deleteCategory(activeCategory.id);
            backToList();
          },
        },
      ],
    );
  };

  // ============================================================
  // TAMPILAN: LIST
  // ============================================================
  if (mode === "list") {
    return (
      <SafeAreaView style={styles.container}>
        <RNStatusBar
          barStyle="dark-content"
          backgroundColor="#FFFFFF"
          translucent={false}
        />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Questions Category</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.resultCount}>
            {categories.length} kategori ujian
          </Text>

          <FlatList
            data={categories}
            keyExtractor={(item: any) => item.id}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 90 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }: any) => (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => openEditForm(item)}
              >
                <View style={styles.cardIconWrapper}>
                  <ListChecks color="#61141A" size={22} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.metaText}>{item.schedule}</Text>
                  <Text style={styles.metaText}>{item.duration} menit</Text>
                  <View style={styles.badgeRow}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {item.questionIds.length} soal
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text
                style={{ textAlign: "center", marginTop: 40, color: "#61141A" }}
              >
                Belum ada kategori ujian.
              </Text>
            }
          />

          <TouchableOpacity style={styles.addButton} onPress={openAddForm}>
            <Plus color="#FFFFFF" size={26} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // TAMPILAN: FORM (tambah / edit info kategori saja)
  // ============================================================
  return (
    <SafeAreaView style={styles.container}>
      <RNStatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={false}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={backToList} style={styles.backButton}>
          <ChevronLeft color="#61141A" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditMode ? "Edit Kategori" : "Tambah Kategori"}
        </Text>
        {isEditMode ? (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Trash2 color="#FF4444" size={20} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 32 }} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.formContainer}
        showsVerticalScrollIndicator={false}
      >
        <FieldGroup label="Judul Kategori">
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Contoh: National Competency Test"
            placeholderTextColor="#B08D8F"
          />
        </FieldGroup>

        <FieldGroup label="Jadwal">
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text
              style={
                schedule ? styles.dateInputText : styles.dateInputPlaceholder
              }
            >
              {schedule || "Pilih tanggal & waktu"}
            </Text>
            <Calendar color="#61141A" size={18} />
          </TouchableOpacity>

          {showDatePicker && (
            <PlatformDateTimePicker
              value={scheduleDate}
              mode="date"
              onChange={onChangeDate}
            />
          )}
          {showTimePicker && (
            <PlatformDateTimePicker
              value={scheduleDate}
              mode="time"
              is24Hour
              onChange={onChangeTime}
            />
          )}
        </FieldGroup>

        <FieldGroup label="Durasi (menit)">
          <TextInput
            style={styles.input}
            value={duration}
            onChangeText={setDuration}
            placeholder="Contoh: 90"
            placeholderTextColor="#B08D8F"
            keyboardType="number-pad"
          />
        </FieldGroup>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>
            {isEditMode ? "Simpan Perubahan" : "Tambah Kategori"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 30,
  },
  backButton: { position: "absolute", left: 24, padding: 6 },
  deleteButton: { position: "absolute", right: 24, padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#61141A" },
  content: { flex: 1, paddingHorizontal: 24 },
  resultCount: {
    fontSize: 12,
    color: "#9A9A9A",
    marginTop: 16,
    marginBottom: 10,
  },
  card: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#F0E4E5",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#61141A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3EFEF",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#61141A",
    marginBottom: 6,
  },
  metaText: { fontSize: 12, color: "#9A9A9A", marginBottom: 2 },
  badgeRow: { flexDirection: "row", gap: 6, marginTop: 6 },
  badge: {
    backgroundColor: "#61141A",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 10, color: "#FFFFFF", fontWeight: "600" },
  addButton: {
    position: "absolute",
    right: 4,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#61141A",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#61141A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  formContainer: { paddingHorizontal: 24, paddingBottom: 60, paddingTop: 10 },
  fieldGroup: { marginBottom: 18 },
  fieldLabel: {
    fontSize: 12,
    color: "#9A9A9A",
    marginBottom: 6,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#E5D6D7",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#61141A",
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderColor: "#E5D6D7",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateInputText: { fontSize: 14, color: "#61141A", fontWeight: "600" },
  dateInputPlaceholder: { fontSize: 14, color: "#B08D8F" },
  submitButton: {
    backgroundColor: "#61141A",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 15 },
});
