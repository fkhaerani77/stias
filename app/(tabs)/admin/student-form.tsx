import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Copy, KeyRound, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
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

const PRODI_OPTIONS = ['Teknik Informatika', 'Sistem Informasi', 'Manajemen Informatika'];

export default function AdminStudentFormScreen() {
  const router = useRouter();
  const { studentId } = useLocalSearchParams<{ studentId?: string }>();
  const { students, addStudent, updateStudent, deleteStudent, resetStudentPassword } = useExam();

  const isEditMode = !!studentId;
  const existingStudent = isEditMode ? students.find((s: any) => s.id === studentId) : null;

  const [name, setName] = useState('');
  const [nim, setNim] = useState('');
  const [kelas, setKelas] = useState('');
  const [tahun, setTahun] = useState('');
  const [prodi, setProdi] = useState(PRODI_OPTIONS[0]);

  // Kredensial yang baru saja digenerate (ditampilkan sekali setelah submit tambah baru)
  const [generatedAccount, setGeneratedAccount] = useState<{ username: string; password: string } | null>(null);

  useEffect(() => {
    if (existingStudent) {
      setName(existingStudent.name);
      setNim(existingStudent.nim);
      setKelas(existingStudent.kelas);
      setTahun(existingStudent.tahun);
      setProdi(existingStudent.prodi);
    }
  }, [existingStudent?.id]);

  const handleSubmit = () => {
    if (!name.trim() || !nim.trim() || !kelas.trim() || !tahun.trim()) {
      Alert.alert('Data Belum Lengkap', 'Semua field wajib diisi.');
      return;
    }

    if (isEditMode && existingStudent) {
      updateStudent(existingStudent.id, { name, nim, kelas, tahun, prodi });
      Alert.alert('Tersimpan', 'Data mahasiswa berhasil diperbarui.', [
        { text: 'OK', onPress: () => router.replace('/admin/students' as any) },
      ]);
    } else {
      // Cek NIM belum dipakai mahasiswa lain
      const nimExists = (students || []).some((s: any) => s.nim === nim);
      if (nimExists) {
        Alert.alert('NIM Sudah Terdaftar', 'NIM ini sudah dipakai mahasiswa lain.');
        return;
      }
      const newStudent = addStudent({ name, nim, kelas, tahun, prodi, status: 'Aktif' });
      // Tampilkan kredensial hasil generate — ini kesempatan satu-satunya admin melihat passwordnya
      setGeneratedAccount({ username: newStudent.username, password: newStudent.password });
    }
  };

  const handleDelete = () => {
    if (!existingStudent) return;
    Alert.alert('Hapus Mahasiswa', `Yakin ingin menghapus ${existingStudent.name}?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          deleteStudent(existingStudent.id);
          router.replace('/admin/students' as any);
        },
      },
    ]);
  };

  const handleResetPassword = () => {
    if (!existingStudent) return;
    Alert.alert('Reset Password', `Buat password baru untuk ${existingStudent.name}?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Reset',
        onPress: () => {
          const newPassword = resetStudentPassword(existingStudent.id);
          setGeneratedAccount({ username: existingStudent.username, password: newPassword });
        },
      },
    ]);
  };

  // Layar konfirmasi kredensial — muncul setelah akun baru berhasil dibuat / password direset
  if (generatedAccount) {
    return (
      <SafeAreaView style={styles.container}>
        <RNStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
        <View style={styles.successWrapper}>
          <View style={styles.successIconCircle}>
            <KeyRound color="#FFFFFF" size={32} />
          </View>
          <Text style={styles.successTitle}>Akun Berhasil Dibuat</Text>
          <Text style={styles.successSubtitle}>
            Catat / salin kredensial ini dan berikan ke mahasiswa. Password tidak bisa dilihat lagi setelah ini.
          </Text>

          <View style={styles.credentialCard}>
            <View style={styles.credentialRow}>
              <Text style={styles.credentialLabel}>Username</Text>
              <Text style={styles.credentialValue}>{generatedAccount.username}</Text>
            </View>
            <View style={styles.credentialDivider} />
            <View style={styles.credentialRow}>
              <Text style={styles.credentialLabel}>Password</Text>
              <Text style={styles.credentialValue}>{generatedAccount.password}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.copyButton}
            onPress={() =>
              Alert.alert('Info', `Username: ${generatedAccount.username}\nPassword: ${generatedAccount.password}`)
            }
          >
            <Copy color="#61141A" size={16} />
            <Text style={styles.copyButtonText}>Lihat / Salin Lagi</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.doneButton} onPress={() => router.replace('/admin/students' as any)}>
            <Text style={styles.doneButtonText}>Selesai</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <RNStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/admin/students' as any)} style={styles.backButton}>
          <ChevronLeft color="#61141A" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditMode ? 'Edit Mahasiswa' : 'Tambah Mahasiswa'}</Text>
        {isEditMode ? (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Trash2 color="#FF4444" size={20} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 32 }} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
        <FieldGroup label="Nama Lengkap">
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Contoh: Fauzia Khaerani" placeholderTextColor="#B08D8F" />
        </FieldGroup>

        <FieldGroup label="NIM / Student ID">
          <TextInput
            style={styles.input}
            value={nim}
            onChangeText={setNim}
            placeholder="Contoh: 145423012"
            placeholderTextColor="#B08D8F"
            keyboardType="number-pad"
          />
        </FieldGroup>

        <FieldGroup label="Kelas">
          <TextInput style={styles.input} value={kelas} onChangeText={setKelas} placeholder="Contoh: TI-3A" placeholderTextColor="#B08D8F" />
        </FieldGroup>

        <FieldGroup label="Tahun Masuk">
          <TextInput
            style={styles.input}
            value={tahun}
            onChangeText={setTahun}
            placeholder="Contoh: 2023"
            placeholderTextColor="#B08D8F"
            keyboardType="number-pad"
            maxLength={4}
          />
        </FieldGroup>

        <FieldGroup label="Program Studi">
          <View style={styles.prodiRow}>
            {PRODI_OPTIONS.map((option) => {
              const isActive = prodi === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.prodiChip, isActive && styles.prodiChipActive]}
                  onPress={() => setProdi(option)}
                >
                  <Text style={[styles.prodiChipText, isActive && styles.prodiChipTextActive]}>{option}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </FieldGroup>

        {isEditMode && (
          <TouchableOpacity style={styles.resetPasswordButton} onPress={handleResetPassword}>
            <KeyRound color="#61141A" size={16} />
            <Text style={styles.resetPasswordText}>Reset Password Akun Ini</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>
            {isEditMode ? 'Simpan Perubahan' : 'Tambah & Buatkan Akun'}
          </Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 30,
  },
  backButton: { padding: 4 },
  deleteButton: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#61141A' },
  formContainer: { paddingHorizontal: 24, paddingBottom: 60, paddingTop: 10 },
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
  prodiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  prodiChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5D6D7',
  },
  prodiChipActive: { backgroundColor: '#61141A', borderColor: '#61141A' },
  prodiChipText: { fontSize: 12, color: '#61141A', fontWeight: '600' },
  prodiChipTextActive: { color: '#FFFFFF' },
  resetPasswordButton: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#61141A',
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 16,
    marginTop: 4,
  },
  resetPasswordText: { color: '#61141A', fontWeight: 'bold', fontSize: 13 },
  submitButton: {
    backgroundColor: '#61141A',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },

  // Success screen (kredensial hasil generate)
  successWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  successIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#61141A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: { fontSize: 20, fontWeight: 'bold', color: '#61141A', marginBottom: 8, textAlign: 'center' },
  successSubtitle: { fontSize: 13, color: '#9A9A9A', textAlign: 'center', lineHeight: 19, marginBottom: 28 },
  credentialCard: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#61141A',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
  },
  credentialRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  credentialLabel: { fontSize: 13, color: '#9A9A9A', fontWeight: '600' },
  credentialValue: { fontSize: 16, color: '#61141A', fontWeight: 'bold', letterSpacing: 1 },
  credentialDivider: { height: 1, backgroundColor: '#F3EFEF', marginVertical: 14 },
  copyButton: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#61141A',
    borderRadius: 14,
    paddingVertical: 12,
    width: '100%',
    marginBottom: 14,
  },
  copyButtonText: { color: '#61141A', fontWeight: 'bold', fontSize: 13 },
  doneButton: {
    backgroundColor: '#61141A',
    borderRadius: 14,
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
  },
  doneButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
});
