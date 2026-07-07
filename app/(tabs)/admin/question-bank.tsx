import { CheckCircle2, ChevronLeft, Circle, HelpCircle, Plus, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
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
} from 'react-native';
import { useExam } from '../../context/ExamContext';

type ViewMode = 'list' | 'pick-category' | 'form';
const OPTION_KEYS = ['A', 'B', 'C', 'D'];

export default function QuestionBankScreen() {
  const {
    questionBank,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    categories,
    toggleQuestionInCategory,
  } = useExam();

  const [mode, setMode] = useState<ViewMode>('list');
  const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null);
  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(null);

  const [text, setText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('A');

  const activeQuestion = activeQuestionId ? questionBank.find((q: any) => q.id === activeQuestionId) : null;
  const isEditMode = !!activeQuestion;

  // Helper: kategori mana saja yang sudah memakai soal ini
  const getCategoriesUsingQuestion = (questionId: number) =>
    categories.filter((c: any) => c.questionIds.includes(questionId));

  const resetForm = () => {
    setText('');
    setOptions(['', '', '', '']);
    setCorrectAnswer('A');
  };

  // --- Mulai alur tambah soal: kalau belum ada kategori, tolak dan suruh bikin dulu ---
  const openAddFlow = () => {
    if (categories.length === 0) {
      Alert.alert('Belum Ada Kategori', 'Buat kategori ujian dulu di menu Questions Category sebelum menambah soal.');
      return;
    }
    setActiveQuestionId(null);
    setPendingCategoryId(null);
    resetForm();
    setMode('pick-category');
  };

  const selectCategoryAndContinue = (categoryId: string) => {
    setPendingCategoryId(categoryId);
    setMode('form');
  };

  const openEditForm = (question: any) => {
    setActiveQuestionId(question.id);
    setText(question.text);
    setOptions(OPTION_KEYS.map((key) => question.options.find((o: any) => o.key === key)?.text || ''));
    setCorrectAnswer(question.correctAnswer);
    setMode('form');
  };

  const backToList = () => {
    setMode('list');
    setActiveQuestionId(null);
    setPendingCategoryId(null);
  };

  const updateOptionText = (index: number, value: string) => {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  };

  const handleSubmit = () => {
    if (!text.trim() || options.some((o) => !o.trim())) {
      Alert.alert('Data Belum Lengkap', 'Teks soal dan keempat opsi jawaban wajib diisi.');
      return;
    }

    const optionObjects = OPTION_KEYS.map((key, i) => ({ key, text: options[i] }));

    if (isEditMode && activeQuestion) {
      updateQuestion(activeQuestion.id, { text, options: optionObjects, correctAnswer });
      Alert.alert('Tersimpan', 'Soal berhasil diperbarui.', [{ text: 'OK', onPress: backToList }]);
    } else {
      const newQuestion = addQuestion({ text, options: optionObjects, correctAnswer });
      if (pendingCategoryId) {
        toggleQuestionInCategory(pendingCategoryId, newQuestion.id);
      }
      Alert.alert('Tersimpan', 'Soal berhasil ditambahkan ke kategori.', [{ text: 'OK', onPress: backToList }]);
    }
  };

  const handleDelete = () => {
    if (!activeQuestion) return;
    Alert.alert('Hapus Soal', 'Yakin ingin menghapus soal ini? Soal juga akan dilepas dari semua kategori.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          deleteQuestion(activeQuestion.id);
          backToList();
        },
      },
    ]);
  };

  // ============================================================
  // TAMPILAN: LIST
  // ============================================================
  if (mode === 'list') {
    return (
      <SafeAreaView style={styles.container}>
        <RNStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Question Bank</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.resultCount}>{questionBank.length} soal tersimpan</Text>

          <FlatList
            data={questionBank}
            keyExtractor={(item: any) => String(item.id)}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 90 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }: any) => {
              const usedIn = getCategoriesUsingQuestion(item.id);
              return (
                <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => openEditForm(item)}>
                  <View style={styles.cardIconWrapper}>
                    <HelpCircle color="#61141A" size={22} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardText} numberOfLines={2}>{item.text}</Text>
                    <View style={styles.badgeRow}>
                      {usedIn.length > 0 ? (
                        usedIn.map((c: any) => (
                          <View key={c.id} style={styles.badge}>
                            <Text style={styles.badgeText} numberOfLines={1}>{c.title}</Text>
                          </View>
                        ))
                      ) : (
                        <View style={[styles.badge, styles.badgeEmpty]}>
                          <Text style={[styles.badgeText, styles.badgeTextEmpty]}>Belum ada kategori</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', marginTop: 40, color: '#61141A' }}>
                Belum ada soal di Question Bank.
              </Text>
            }
          />

          <TouchableOpacity style={styles.addButton} onPress={openAddFlow}>
            <Plus color="#FFFFFF" size={26} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // TAMPILAN: PILIH KATEGORI (cuma untuk tambah soal baru)
  // ============================================================
  if (mode === 'pick-category') {
    return (
      <SafeAreaView style={styles.container}>
        <RNStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
        <View style={styles.header}>
          <TouchableOpacity onPress={backToList} style={styles.backButton}>
            <ChevronLeft color="#61141A" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pilih Kategori</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionSubtitle}>Soal baru ini akan langsung dimasukkan ke kategori yang kamu pilih.</Text>

          {categories.map((c: any) => (
            <TouchableOpacity key={c.id} style={styles.categoryOption} onPress={() => selectCategoryAndContinue(c.id)}>
              <Text style={styles.categoryOptionTitle}>{c.title}</Text>
              <Text style={styles.categoryOptionMeta}>{c.schedule} • {c.duration} menit</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ============================================================
  // TAMPILAN: FORM (tambah / edit soal)
  // ============================================================
  const pendingCategory = pendingCategoryId ? categories.find((c: any) => c.id === pendingCategoryId) : null;

  return (
    <SafeAreaView style={styles.container}>
      <RNStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
      <View style={styles.header}>
        <TouchableOpacity onPress={backToList} style={styles.backButton}>
          <ChevronLeft color="#61141A" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditMode ? 'Edit Soal' : 'Tambah Soal'}</Text>
        {isEditMode ? (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Trash2 color="#FF4444" size={20} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 32 }} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
        {!isEditMode && pendingCategory && (
          <View style={styles.categoryBanner}>
            <Text style={styles.categoryBannerLabel}>Kategori</Text>
            <Text style={styles.categoryBannerTitle}>{pendingCategory.title}</Text>
          </View>
        )}

        <FieldGroup label="Teks Soal">
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={text}
            onChangeText={setText}
            placeholder="Tulis pertanyaan di sini..."
            placeholderTextColor="#B08D8F"
            multiline
          />
        </FieldGroup>

        {OPTION_KEYS.map((key, index) => (
          <FieldGroup key={key} label={`Opsi ${key}`}>
            <View style={styles.optionRow}>
              <TouchableOpacity
                style={[styles.optionRadio, correctAnswer === key && styles.optionRadioActive]}
                onPress={() => setCorrectAnswer(key)}
              >
                {correctAnswer === key ? (
                  <CheckCircle2 color="#61141A" size={22} />
                ) : (
                  <Circle color="#D9AEB1" size={22} />
                )}
              </TouchableOpacity>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={options[index]}
                onChangeText={(v) => updateOptionText(index, v)}
                placeholder={`Jawaban opsi ${key}`}
                placeholderTextColor="#B08D8F"
              />
            </View>
          </FieldGroup>
        ))}
        <Text style={styles.helperNote}>Tap ikon lingkaran di samping opsi untuk menandai jawaban yang benar.</Text>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>{isEditMode ? 'Simpan Perubahan' : 'Tambah Soal'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 30,
  },
  backButton: { position: 'absolute', left: 24, padding: 6 },
  deleteButton: { position: 'absolute', right: 24, padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#61141A' },
  content: { flex: 1, paddingHorizontal: 24 },
  resultCount: { fontSize: 12, color: '#9A9A9A', marginTop: 16, marginBottom: 10 },
  card: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F0E4E5',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#61141A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3EFEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: { fontSize: 13, color: '#61141A', fontWeight: '600', marginBottom: 8 },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  badge: { backgroundColor: '#61141A', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, maxWidth: 150 },
  badgeEmpty: { backgroundColor: '#F3EFEF' },
  badgeText: { fontSize: 10, color: '#FFFFFF', fontWeight: '600' },
  badgeTextEmpty: { color: '#9A9A9A' },
  addButton: {
    position: 'absolute',
    right: 4,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#61141A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#61141A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  formContainer: { paddingHorizontal: 24, paddingBottom: 60, paddingTop: 10 },
  sectionSubtitle: { fontSize: 12, color: '#9A9A9A', marginBottom: 16 },
  categoryOption: {
    borderWidth: 1.5,
    borderColor: '#F0E4E5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  categoryOptionTitle: { fontSize: 15, fontWeight: 'bold', color: '#61141A', marginBottom: 4 },
  categoryOptionMeta: { fontSize: 12, color: '#9A9A9A' },
  categoryBanner: {
    backgroundColor: '#FBF5F5',
    borderWidth: 1.5,
    borderColor: '#61141A',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  categoryBannerLabel: { fontSize: 11, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  categoryBannerTitle: { fontSize: 15, fontWeight: 'bold', color: '#61141A' },
  fieldGroup: { marginBottom: 18 },
  fieldLabel: { fontSize: 12, color: '#9A9A9A', marginBottom: 6, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5D6D7',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#61141A',
  },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  optionRadio: { padding: 2 },
  optionRadioActive: {},
  helperNote: { fontSize: 11, color: '#9A9A9A', marginTop: -8, marginBottom: 16 },
  submitButton: { backgroundColor: '#61141A', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  submitButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
});