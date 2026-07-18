import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { Search, ShieldAlert } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
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
import { db } from '../../config/firebase';

export default function AdminViolationsScreen() {
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedExam, setSelectedExam] = useState('Semua');

  const fetchViolations = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'violations'), orderBy('timestampMs', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setViolations(data);
    } catch (err) {
      console.error('Gagal mengambil data pelanggaran:', err);
      Alert.alert('Gagal', 'Tidak dapat memuat data Integrity Report. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();
  }, []);

  const examOptions = useMemo(() => {
    const titles = new Set(violations.map((v) => v.examTitle).filter(Boolean));
    return ['Semua', ...Array.from(titles)];
  }, [violations]);

  const filteredViolations = violations.filter((item) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q || item.studentName?.toLowerCase().includes(q) || item.nim?.toLowerCase().includes(q);
    const matchesExam = selectedExam === 'Semua' || item.examTitle === selectedExam;
    return matchesSearch && matchesExam;
  });

  return (
    <SafeAreaView style={styles.container}>
      <RNStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Integrity Report</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.searchBar}>
          <Search color="#B08D8F" size={18} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama / NIM mahasiswa"
            placeholderTextColor="#B08D8F"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={{ gap: 8 }}>
          {examOptions.map((exam) => {
            const isActive = selectedExam === exam;
            return (
              <TouchableOpacity
                key={exam}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setSelectedExam(exam)}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]} numberOfLines={1}>
                  {exam}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.resultCount}>{filteredViolations.length} pelanggaran tercatat</Text>

        {loading ? (
          <ActivityIndicator color="#61141A" size="large" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filteredViolations}
            keyExtractor={(item) => item.id}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardTopRow}>
                  <ShieldAlert color="#FF4444" size={20} />
                  <Text style={styles.cardType}>{item.type}</Text>
                </View>
                <Text style={styles.cardStudent}>{item.studentName} • NIM {item.nim}</Text>
                <Text style={styles.cardExam}>{item.examTitle}</Text>
                <Text style={styles.cardTimestamp}>{item.timestamp}</Text>
              </View>
            )}
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', marginTop: 40, color: '#61141A' }}>
                Tidak ada pelanggaran yang cocok.
              </Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
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
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#61141A' },
  content: { flex: 1, paddingHorizontal: 24 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8F4F4',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 46,
    marginTop: 16,
  },
  searchInput: { flex: 1, fontSize: 13, color: '#61141A' },
  chipScroll: { marginTop: 12, maxHeight: 40 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D9AEB1',
  },
  chipActive: { backgroundColor: '#61141A', borderColor: '#61141A' },
  chipText: { fontSize: 12, color: '#61141A', fontWeight: '600' },
  chipTextActive: { color: '#FFFFFF' },
  resultCount: { fontSize: 12, color: '#9A9A9A', marginTop: 14, marginBottom: 10 },
  card: { backgroundColor: '#61141A', borderRadius: 18, padding: 16, marginBottom: 14 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cardType: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  cardStudent: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', marginBottom: 2 },
  cardExam: { color: '#F3EFEF', fontSize: 12, opacity: 0.85, marginBottom: 4 },
  cardTimestamp: { color: '#D1D1D1', fontSize: 11 },
});