import { useRouter } from 'expo-router';
import { ChevronLeft, ShieldAlert } from 'lucide-react-native';
import React from 'react';
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useExam } from '../../context/ExamContext';

export default function ViolationsScreen() {
  const router = useRouter();
  const { violations } = useExam();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color="#61141A" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Integrity Report</Text>
      </View>

      <FlatList
        style={{ flex: 1 }}
        data={violations}
        contentContainerStyle={styles.listContainer}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTopRow}>
              <ShieldAlert color="#FF4444" size={20} />
              <Text style={styles.cardType}>{item.type}</Text>
            </View>
            <Text style={styles.cardExam}>{item.examTitle}</Text>
            <Text style={styles.cardTimestamp}>{item.timestamp}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 50, color: '#61141A' }}>
            No violations recorded. Keep it clean!
          </Text>
        }
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>One Step Closer to Success!</Text>
        <Image source={require('../../../assets/images/graduation1.png')} style={styles.footerIllustration} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, marginTop: 40, justifyContent: 'center' },
  backButton: { position: 'absolute', left: 24, padding: 6, zIndex: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#61141A' },
  listContainer: { paddingHorizontal: 24 },
  card: { backgroundColor: '#61141A', borderRadius: 18, padding: 16, marginBottom: 14 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cardType: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  cardExam: { color: '#F3EFEF', fontSize: 12, opacity: 0.85, marginBottom: 4 },
  cardTimestamp: { color: '#D1D1D1', fontSize: 11 },
  footer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginHorizontal: 24, marginBottom: 20, height: 110 },
  footerText: { fontSize: 14, color: '#61141A', fontWeight: '600', opacity: 0.4, flex: 1 },
  footerIllustration: { width: 150, height: 120, position: 'absolute', right: -10, bottom: -20 },
});
