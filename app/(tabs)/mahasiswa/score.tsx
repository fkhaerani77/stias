import { useRouter } from 'expo-router';
import { ChevronLeft, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useExam } from '../../context/ExamContext';

// Warna berdasarkan skor: hijau (lulus), merah (tidak lulus)
const getScoreColor = (score: number) => (score >= 60 ? '#00E676' : '#FF4444');

export default function ScoreScreen() {
  const router = useRouter();
  const { history } = useExam();

  const [selectedItem, setSelectedItem] = useState<any>(null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color="#61141A" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Score</Text>
      </View>

      <FlatList
        style={{ flex: 1 }}
        data={history}
        contentContainerStyle={styles.listContainer}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => setSelectedItem(item)} activeOpacity={0.8}>
            <View style={styles.cardTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDate}>{item.date}</Text>
              </View>
              <View style={[styles.scoreCircle, { borderColor: getScoreColor(item.score ?? 0) }]}>
                <Text style={[styles.scoreCircleText, { color: getScoreColor(item.score ?? 0) }]}>
                  {item.score ?? '-'}
                </Text>
              </View>
            </View>

            <View style={styles.cardBottomRow}>
              <Text style={styles.correctText}>
                {item.correctCount ?? '-'} / {item.totalQuestions ?? '-'} correct
              </Text>
              <Text style={[styles.statusText, { color: getScoreColor(item.score ?? 0) }]}>
                {item.status ?? '-'}
              </Text>
            </View>

            <Text style={styles.tapHint}>Tap to view details ›</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 50, color: '#61141A' }}>No scores yet.</Text>}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>One Step Closer to Success!</Text>
        <Image source={require('../../../assets/images/graduation1.png')} style={styles.footerIllustration} />
      </View>

      {/* Modal detail jawaban benar/salah */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!selectedItem}
        onRequestClose={() => setSelectedItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>{selectedItem?.title}</Text>
                <Text style={styles.modalSubtitle}>
                  Score: {selectedItem?.score}% ({selectedItem?.correctCount}/{selectedItem?.totalQuestions} correct)
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedItem(null)}>
                <X color="#FFFFFF" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ marginTop: 10 }} showsVerticalScrollIndicator={false}>
              {selectedItem?.questions?.map((q: any, idx: number) => {
                const userAnswerKey = selectedItem.userAnswers?.[q.id];
                const isCorrect = userAnswerKey === q.correctAnswer;
                return (
                  <View key={q.id} style={styles.reviewQuestionBlock}>
                    <Text style={styles.reviewQuestionText}>{idx + 1}. {q.text}</Text>
                    {q.options.map((opt: any) => {
                      const isUserChoice = opt.key === userAnswerKey;
                      const isCorrectChoice = opt.key === q.correctAnswer;
                      let optionStyle = styles.reviewOption;
                      if (isCorrectChoice) optionStyle = { ...styles.reviewOption, ...styles.reviewOptionCorrect };
                      if (isUserChoice && !isCorrect) optionStyle = { ...styles.reviewOption, ...styles.reviewOptionWrong };

                      return (
                        <View key={opt.key} style={optionStyle}>
                          <Text style={styles.reviewOptionText}>
                            {opt.key}. {opt.text}
                            {isUserChoice ? '  (Your answer)' : ''}
                            {isCorrectChoice ? '  ✓' : ''}
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
  cardTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  cardDate: { color: '#D1D1D1', fontSize: 12, marginTop: 4 },
  scoreCircle: { width: 54, height: 54, borderRadius: 27, borderWidth: 3, justifyContent: 'center', alignItems: 'center', backgroundColor: '#4A0F14' },
  scoreCircleText: { fontSize: 16, fontWeight: 'bold' },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  correctText: { color: '#F3EFEF', fontSize: 12 },
  statusText: { fontSize: 13, fontWeight: 'bold' },
  tapHint: { color: '#FFD700', fontSize: 12, fontWeight: '600', marginTop: 8, textAlign: 'right' },
  footer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginHorizontal: 24, marginBottom: 20, height: 110 },
  footerText: { fontSize: 14, color: '#61141A', fontWeight: '600', opacity: 0.4, flex: 1 },
  footerIllustration: { width: 150, height: 120, position: 'absolute', right: -10, bottom: -20 },

  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#61141A', width: '100%', height: '80%', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  modalSubtitle: { fontSize: 13, color: '#FFD700', marginTop: 4, fontWeight: '600' },
  reviewQuestionBlock: { marginBottom: 22 },
  reviewQuestionText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginBottom: 10, lineHeight: 20 },
  reviewOption: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 8 },
  reviewOptionCorrect: { backgroundColor: '#00E676' },
  reviewOptionWrong: { backgroundColor: '#FF4444' },
  reviewOptionText: { color: '#FFFFFF', fontSize: 13, fontWeight: '500' },
});
