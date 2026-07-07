import { useRouter } from 'expo-router';
import { ChevronLeft, GraduationCap, Plus, Search, SlidersHorizontal } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useExam } from '../../context/ExamContext';

const PRODI_OPTIONS = ['Semua', 'Teknik Informatika', 'Sistem Informasi', 'Manajemen Informatika'];

export default function AdminStudentsScreen() {
  const router = useRouter();
  const { students } = useExam();
  const [search, setSearch] = useState('');
  const [selectedProdi, setSelectedProdi] = useState('Semua');
  const [showFilter, setShowFilter] = useState(false);

  const filteredStudents = (students || []).filter((s: any) => {
    const query = search.trim().toLowerCase();
    const matchesQuery = !query || s.name.toLowerCase().includes(query) || s.nim.toLowerCase().includes(query);
    const matchesProdi = selectedProdi === 'Semua' || s.prodi === selectedProdi;
    return matchesQuery && matchesProdi;
  });

  return (
    <SafeAreaView style={styles.container}>
      <RNStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/admin' as any)} style={styles.backButton}>
          <ChevronLeft color="#61141A" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Students</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.content}>
        {/* Search bar + tombol filter */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Search color="#B08D8F" size={18} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by Name / Student ID"
              placeholderTextColor="#B08D8F"
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity
            style={[styles.filterButton, showFilter && styles.filterButtonActive]}
            onPress={() => setShowFilter((prev) => !prev)}
          >
            <SlidersHorizontal color={showFilter ? '#FFFFFF' : '#61141A'} size={18} />
          </TouchableOpacity>
        </View>

        {/* Filter chip Prodi — muncul saat tombol filter ditekan */}
        {showFilter && (
          <View style={styles.chipRow}>
            {PRODI_OPTIONS.map((prodi) => {
              const isActive = selectedProdi === prodi;
              return (
                <TouchableOpacity
                  key={prodi}
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => setSelectedProdi(prodi)}
                >
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{prodi}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <Text style={styles.resultCount}>{filteredStudents.length} mahasiswa ditemukan</Text>

        {/* List Card Mahasiswa */}
        <FlatList
          data={filteredStudents}
          keyExtractor={(item) => item.id}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 90 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: '/admin/student-form' as any, params: { studentId: item.id } })}
            >
              <View style={styles.cardIconWrapper}>
                <GraduationCap color="#61141A" size={22} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardNim}>NIM {item.nim}</Text>
                <View style={styles.badgeRow}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.kelas}</Text>
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.tahun}</Text>
                  </View>
                  <View style={[styles.badge, styles.badgeProdi]}>
                    <Text style={styles.badgeTextProdi} numberOfLines={1}>{item.prodi}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 40, color: '#61141A' }}>
              Tidak ada mahasiswa ditemukan.
            </Text>
          }
        />

        {/* Tombol tambah mahasiswa */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/admin/student-form' as any)}
        >
          <Plus color="#FFFFFF" size={26} />
        </TouchableOpacity>
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
  backButton: { position: 'absolute', left: 24, padding: 6 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#61141A' },
  content: { flex: 1, paddingHorizontal: 24 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8F4F4',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 46,
  },
  searchInput: { flex: 1, fontSize: 13, color: '#61141A' },
  filterButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: '#D9AEB1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: { backgroundColor: '#61141A', borderColor: '#61141A' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
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
  cardName: { fontSize: 15, fontWeight: 'bold', color: '#61141A' },
  cardNim: { fontSize: 12, color: '#9A9A9A', marginTop: 2, marginBottom: 8 },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  badge: {
    backgroundColor: '#F3EFEF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeProdi: { backgroundColor: '#61141A', flexShrink: 1 },
  badgeText: { fontSize: 10, color: '#61141A', fontWeight: '600' },
  badgeTextProdi: { fontSize: 10, color: '#FFFFFF', fontWeight: '600' },
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
});
