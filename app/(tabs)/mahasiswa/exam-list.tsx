import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Clock, ListChecks } from 'lucide-react-native';
import React from 'react';
import {
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useExam } from '../../context/ExamContext';

export default function ExamListScreen() {
  const router = useRouter();
  const { categories } = useExam();

  return (
    <SafeAreaView style={styles.container}>
      <RNStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#61141A" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pilih Ujian</Text>
        <View style={{ width: 32 }} />
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }: any) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => router.push({ pathname: '/mahasiswa/exam-info' as any, params: { categoryId: item.id } })}
          >
            <View style={styles.cardIconWrapper}>
              <ListChecks color="#61141A" size={22} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={styles.metaRow}>
                <Calendar color="#9A9A9A" size={13} />
                <Text style={styles.metaText}>{item.schedule}</Text>
              </View>
              <View style={styles.metaRow}>
                <Clock color="#9A9A9A" size={13} />
                <Text style={styles.metaText}>{item.duration} menit • {item.questionIds.length} soal</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 40, color: '#61141A' }}>
            Belum ada ujian yang tersedia.
          </Text>
        }
      />
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
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#61141A' },
  listContainer: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 40 },
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
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#61141A', marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  metaText: { fontSize: 12, color: '#9A9A9A' },
});