import { useRouter } from 'expo-router';
import { CheckCircle2, ChevronLeft, X, XCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// 1. Pastikan path import ini sesuai dengan struktur folder Anda
import { useExam } from '../../context/ExamContext';

export default function ExamHistoryScreen() {
  const router = useRouter();
  const { history } = useExam(); // Ambil data dari Context

  // State untuk menyimpan item history yang dipilih (untuk preview)
  const [selectedItem, setSelectedItem] = useState<any>(null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
           <ChevronLeft color="#61141A" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exam History</Text>
      </View>

      {/* 2. Gunakan 'history' dari context, bukan variable dummy */}
      <FlatList
        style={{ flex: 1 }}
        data={history}
        contentContainerStyle={styles.listContainer}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => setSelectedItem(item)} activeOpacity={0.8}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.status === 'Passed' ? <CheckCircle2 color="#00E676" size={20} /> : <XCircle color="#FF4444" size={20} />}
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}><Text style={styles.label}>Exam Date</Text><Text style={styles.value}>{item.date}</Text></View>
              <View style={styles.infoItem}><Text style={styles.label}>Duration</Text><Text style={styles.value}>{item.duration}</Text></View>
            </View>

            <Text style={styles.tapHint}>Tap to view answers ›</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 50, color: '#61141A' }}>No history yet.</Text>}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>One Step Closer to Success!</Text>
        <Image source={require('../../../assets/images/graduation1.png')} style={styles.footerIllustration} />
      </View>

      {/* Modal Preview Jawaban */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!selectedItem}
        onRequestClose={() => setSelectedItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedItem?.title}</Text>
              <TouchableOpacity onPress={() => setSelectedItem(null)}>
                <X color="#FFFFFF" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ marginTop: 10 }} showsVerticalScrollIndicator={false}>
              {selectedItem?.questions?.map((q: any, idx: number) => {
                const userAnswerKey = selectedItem.userAnswers?.[q.id];
                return (
                  <View key={q.id} style={styles.reviewQuestionBlock}>
                    <Text style={styles.reviewQuestionText}>{idx + 1}. {q.text}</Text>
                    {q.options.map((opt: any) => {
                      const isSelected = opt.key === userAnswerKey;
                      return (
                        <View
                          key={opt.key}
                          style={[styles.reviewOption, isSelected && styles.reviewOptionSelected]}
                        >
                          <Text style={[styles.reviewOptionText, isSelected && styles.reviewOptionTextSelected]}>
                            {opt.key}. {opt.text}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, marginTop: 40, justifyContent: 'center' },
  backButton: { position: 'absolute', left: 24, padding: 6 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#61141A' },
  listContainer: { paddingHorizontal: 24 },
  card: { backgroundColor: '#61141A', borderRadius: 20, padding: 20, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  cardTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  infoItem: { width: '47%', marginBottom: 10 },
  label: { color: '#D1D1D1', fontSize: 11, marginBottom: 2 },
  value: { color: '#FFFFFF', fontSize: 13, fontWeight: '500' },
  tapHint: { color: '#FFD700', fontSize: 12, fontWeight: '600', marginTop: 4, textAlign: 'right' },
  footer: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 24, marginBottom: 20 },
  footerText: { color: '#61141A', fontWeight: '600', flex: 1, opacity: 0.6 },
  footerIllustration: { width: 150, height: 120 },

  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#61141A', width: '100%', height: '80%', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', flex: 1, marginRight: 10 },
  reviewQuestionBlock: { marginBottom: 22 },
  reviewQuestionText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginBottom: 10, lineHeight: 20 },
  reviewOption: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 8 },
  reviewOptionSelected: { backgroundColor: '#FFD700' },
  reviewOptionText: { color: '#F3EFEF', fontSize: 13 },
  reviewOptionTextSelected: { color: '#61141A', fontWeight: 'bold' },
});
