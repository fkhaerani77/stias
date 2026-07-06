import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
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

export default function ExamInfoScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <RNStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

      {/* 1. Header Navigation */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#61141A" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exam</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Menggunakan ScrollView dengan flexGrow agar otomatis fleksibel */}
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
      >
        {/* Bagian Atas: Kartu Informasi & Aturan */}
        <View>
          {/* 2. Candidate Information Card (Outline Maroon) */}
          <View style={styles.candidateCard}>
            <Text style={styles.cardSectionTitle}>Candidate Information</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoColon}>:</Text>
              <Text style={styles.infoValue}>Fauzia Khaerani</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>NIM</Text>
              <Text style={styles.infoColon}>:</Text>
              <Text style={styles.infoValue}>14523012</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Program Studi</Text>
              <Text style={styles.infoColon}>:</Text>
              <Text style={styles.infoValue}>Teknik Informatika</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={styles.infoColon}>:</Text>
              <Text style={styles.infoValue}>Aktif</Text>
            </View>
          </View>

          {/* 3. Exam Information Card (Full Maroon Block) */}
          <View style={styles.examCard}>
            <View style={styles.examCardHeader}>
              <Text style={styles.examCardTitle}>Exam Information</Text>
              <View style={styles.greenDot} />
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.examLabel}>Category</Text>
              <Text style={styles.examColon}>:</Text>
              <Text style={styles.examValue}>National Competency Test</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.examLabel}>Schedule</Text>
              <Text style={styles.examColon}>:</Text>
              <Text style={styles.examValue}>12 Jun 2026 • 09:00 WIB</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.examLabel}>Duration</Text>
              <Text style={styles.examColon}>:</Text>
              <Text style={styles.examValue}>90 Minutes</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.examLabel}>Questions</Text>
              <Text style={styles.examColon}>:</Text>
              <Text style={styles.examValue}>100</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.examLabel}>Status</Text>
              <Text style={styles.examColon}>:</Text>
              <Text style={styles.examValue}>Ready</Text>
            </View>

            <TouchableOpacity 
              style={styles.startExamButton}
                onPress={() => router.push('/mahasiswa/exam' as any)}            >
              <Text style={styles.startExamText}>Start Exam {'>'}</Text>
            </TouchableOpacity>
          </View>

          {/* 4. Before You Begin Rules */}
          <View style={styles.rulesContainer}>
            <Text style={styles.rulesTitle}>Before You Begin</Text>
            <Text style={styles.ruleItem}>✓  Stable internet connection</Text>
            <Text style={styles.ruleItem}>✓  Read each question carefully</Text>
            <Text style={styles.ruleItem}>✓  Don't leave the exam screen</Text>
          </View>
        </View>

        {/* Bagian Bawah: Footer */}
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#61141A',
  },
  scrollContainer: {
    flexGrow: 1, // KUNCI UTAMA: Agar konten bisa mengisi sisa ruang layar gawai
    paddingHorizontal: 24,
    justifyContent: 'space-between', // Tetap mendorong footer ke bawah selama muat satu layar
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
  cardSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#61141A',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  infoLabel: {
    width: 110,
    fontSize: 14,
    color: '#61141A',
    fontWeight: '600',
  },
  infoColon: {
    width: 15,
    fontSize: 14,
    color: '#61141A',
    fontWeight: '600',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#61141A',
    fontWeight: '500',
  },
  examCard: {
    backgroundColor: '#61141A',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  examCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  examCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  greenDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00E676',
  },
  examLabel: {
    width: 100,
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  examColon: {
    width: 15,
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  examValue: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  startExamButton: {
    alignSelf: 'flex-end',
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  startExamText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  rulesContainer: {
    paddingHorizontal: 4,
    marginBottom: 20, // Tambah margin bawah sedikit untuk jaga-jaga saat di-scroll
  },
  rulesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#61141A',
    marginBottom: 10,
  },
  ruleItem: {
    fontSize: 14,
    color: '#61141A',
    marginBottom: 6,
    fontWeight: '500',
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 110,
    position: 'relative',
    marginTop: 10,
  },
  footerSlogan: {
    fontSize: 14,
    color: '#61141A',
    fontWeight: '600',
    paddingBottom: 15,
    flex: 1,
    opacity: 0.4,
  },
  footerIllustration: {
    width: 150,
    height: 120,
    position: 'absolute',
    right: -24,
    bottom: -20,
  },
});