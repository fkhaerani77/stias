import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, Clock, Lock } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Platform,
  StatusBar as RNStatusBar,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useExam } from '../../context/ExamContext';
import { useAuth } from '../../context/AuthContext';

export default function ExamInfoScreen() {
  const router = useRouter();
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const { history, categories, getQuestionsForCategory, getExamAccessStatus } = useExam();

  const category = categories.find((c: any) => c.id === categoryId);
  const questionCount = category ? getQuestionsForCategory(category.id).length : 0;

  // Cek apakah kategori ujian ini sudah pernah dikerjakan sebelumnya
  const completedExam = (history || []).find((item: any) => item.categoryId === categoryId);
  const isCompleted = !!completedExam;
  const { profile } = useAuth();

  // --- Validasi jadwal ujian: akses hanya diizinkan sesuai rentang waktu yang diatur admin ---
  const [access, setAccess] = useState<any>(null);
  useEffect(() => {
    if (!category) return;
    const update = () => setAccess(getExamAccessStatus(category));
    update();
    const timer = setInterval(update, 15000); // recheck tiap 15 detik (untuk auto unlock/lock)
    return () => clearInterval(timer);
  }, [category?.id, category?.scheduleTimestamp, category?.duration]);

  if (!category) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color="#61141A" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Exam</Text>
          <View style={{ width: 32 }} />
        </View>
        <Text style={{ textAlign: 'center', marginTop: 40, color: '#61141A' }}>
          Ujian tidak ditemukan.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <RNStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#61141A" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exam</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View>
          {/* Candidate Information — CATATAN: masih hardcoded, akan disambungkan ke data login asli di tahap berikutnya */}
          <View style={styles.candidateCard}>
          <Text style={styles.cardSectionTitle}>Candidate Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoColon}>:</Text>
            <Text style={styles.infoValue}>{profile?.name || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>NIM</Text>
            <Text style={styles.infoColon}>:</Text>
            <Text style={styles.infoValue}>{profile?.nim || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Program Studi</Text>
            <Text style={styles.infoColon}>:</Text>
            <Text style={styles.infoValue}>{profile?.prodi || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={styles.infoColon}>:</Text>
            <Text style={styles.infoValue}>{profile?.status || '-'}</Text>
          </View>
        </View>

          {/* Exam Information — sekarang dinamis dari kategori yang dipilih */}
          <View style={styles.examCard}>
            <View style={styles.examCardHeader}>
              <Text style={styles.examCardTitle}>Exam Information</Text>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: isCompleted
                      ? '#9CA3AF'
                      : access && !access.canStart
                      ? '#FFD700'
                      : '#00E676',
                  },
                ]}
              />
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.examLabel}>Category</Text>
              <Text style={styles.examColon}>:</Text>
              <Text style={styles.examValue}>{category.title}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.examLabel}>Schedule</Text>
              <Text style={styles.examColon}>:</Text>
              <Text style={styles.examValue}>{category.schedule}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.examLabel}>Duration</Text>
              <Text style={styles.examColon}>:</Text>
              <Text style={styles.examValue}>{category.duration} Minutes</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.examLabel}>Questions</Text>
              <Text style={styles.examColon}>:</Text>
              <Text style={styles.examValue}>{questionCount}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.examLabel}>Status</Text>
              <Text style={styles.examColon}>:</Text>
              <Text style={styles.examValue}>{isCompleted ? 'Selesai' : 'Ready'}</Text>
            </View>

            {isCompleted ? (
              <View style={styles.completedRow}>
                <CheckCircle2 color="#00E676" size={18} />
                <Text style={styles.completedText}>
                  Anda sudah menyelesaikan ujian ini (Score: {completedExam.score}%)
                </Text>
              </View>
            ) : questionCount === 0 ? (
              <Text style={{ color: '#FFD700', fontSize: 12, marginTop: 8 }}>
                Belum ada soal di kategori ini. Hubungi admin.
              </Text>
            ) : access && !access.canStart ? (
              <View style={styles.lockedRow}>
                {access.status === 'upcoming' ? (
                  <Clock color="#FFD700" size={18} />
                ) : (
                  <Lock color="#FFD700" size={18} />
                )}
                <Text style={styles.completedText}>{access.message}</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.startExamButton}
                onPress={() => router.push({ pathname: '/mahasiswa/exam' as any, params: { categoryId: category.id } })}
              >
                <Text style={styles.startExamText}>Start Exam {'>'}</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.rulesContainer}>
            <Text style={styles.rulesTitle}>Before You Begin</Text>
            <Text style={styles.ruleItem}>✓  Stable internet connection</Text>
            <Text style={styles.ruleItem}>✓  Read each question carefully</Text>
            <Text style={styles.ruleItem}>✓  Don't leave the exam screen</Text>
          </View>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerSlogan}>One Step Closer to Success!</Text>
          <Image
            source={require('../../../assets/images/graduation1.png')}
            style={styles.footerIllustration}
            resizeMode="contain"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight ? RNStatusBar.currentHeight + 10 : 30) : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#61141A' },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: Platform.OS === 'ios' ? 10 : 20,
  },
  candidateCard: {
    borderWidth: 2,
    borderColor: '#61141A',
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    marginBottom: 16,
  },
  cardSectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#61141A', marginBottom: 12 },
  infoRow: { flexDirection: 'row', marginBottom: 6, alignItems: 'flex-start' },
  infoLabel: { width: 110, fontSize: 14, color: '#61141A', fontWeight: '600' },
  infoColon: { width: 15, fontSize: 14, color: '#61141A', fontWeight: '600' },
  infoValue: { flex: 1, fontSize: 14, color: '#61141A', fontWeight: '500' },
  examCard: { backgroundColor: '#61141A', borderRadius: 24, padding: 20, marginBottom: 20 },
  examCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  examCardTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  examLabel: { width: 100, fontSize: 14, color: '#FFFFFF', opacity: 0.9 },
  examColon: { width: 15, fontSize: 14, color: '#FFFFFF', opacity: 0.9 },
  examValue: { flex: 1, fontSize: 14, color: '#FFFFFF', fontWeight: '500' },
  startExamButton: { alignSelf: 'flex-end', marginTop: 6, paddingVertical: 4, paddingHorizontal: 4 },
  startExamText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 10,
  },
  completedText: { color: '#FFFFFF', fontSize: 12, fontWeight: '500', flex: 1, lineHeight: 16 },
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 10,
  },
  rulesContainer: { paddingHorizontal: 4, marginBottom: 20 },
  rulesTitle: { fontSize: 18, fontWeight: 'bold', color: '#61141A', marginBottom: 10 },
  ruleItem: { fontSize: 14, color: '#61141A', marginBottom: 6, fontWeight: '500' },
  footerContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 110, marginTop: 10 },
  footerSlogan: { fontSize: 14, color: '#61141A', fontWeight: '600', opacity: 0.4, flex: 1 },
  footerIllustration: { width: 150, height: 120, position: 'absolute', right: -24, bottom: -20 },
});