import { useRouter } from 'expo-router';
import { EmailAuthProvider, reauthenticateWithCredential, signOut, updatePassword } from 'firebase/auth';
import { ArrowLeft, Lock, LogOut, Mail, Shield, User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  StatusBar as RNStatusBar,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { auth } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'M')}&background=61141A&color=FFFFFF&size=200&bold=true`;

  const resetPasswordForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const closeChangePassword = () => {
    setShowChangePassword(false);
    resetPasswordForm();
  };

  const handleChangePassword = async () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Data Belum Lengkap', 'Semua kolom wajib diisi.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Password Terlalu Pendek', 'Password baru minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Tidak Cocok', 'Konfirmasi password baru tidak sama.');
      return;
    }
    if (!user?.email) {
      Alert.alert('Gagal', 'Sesi login tidak valid. Coba login ulang.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Firebase mewajibkan re-autentikasi sebelum mengizinkan ganti password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      Alert.alert('Berhasil', 'Password berhasil diubah.', [
        { text: 'OK', onPress: closeChangePassword },
      ]);
    } catch (error: any) {
      let message = 'Terjadi kesalahan. Coba lagi.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        message = 'Password lama yang kamu masukkan salah.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.';
      }
      Alert.alert('Gagal Mengubah Password', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Yakin ingin keluar dari akun ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
            router.replace('/login');
          } catch (error: any) {
            Alert.alert('Gagal Logout', error.message);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <RNStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#61141A" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: defaultAvatar }} style={styles.avatar} />
          </View>
          <Text style={styles.userName}>{profile?.name || '-'}</Text>
          <Text style={styles.userRole}>Mahasiswa {profile?.status || ''}</Text>
          <View style={styles.badgeNim}>
            <Text style={styles.badgeText}>NIM: {profile?.nim || '-'}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Account Information</Text>

        <View style={styles.infoGroup}>
          <View style={styles.infoItem}>
            <View style={styles.iconContainer}>
              <Mail color="#61141A" size={20} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Email Address</Text>
              <Text style={styles.infoValue}>{user?.email || '-'}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.iconContainer}>
              <User color="#61141A" size={20} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Kelas</Text>
              <Text style={styles.infoValue}>{profile?.kelas || '-'}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.iconContainer}>
              <User color="#61141A" size={20} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Study Program</Text>
              <Text style={styles.infoValue}>{profile?.prodi || '-'}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Security</Text>
        <TouchableOpacity style={styles.menuRow} onPress={() => setShowChangePassword(true)}>
          <View style={styles.menuRowLeft}>
            <Shield color="#61141A" size={20} />
            <Text style={styles.menuRowText}>Privacy & Change Password</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut color="#FFFFFF" size={20} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>

      <Modal animationType="slide" transparent visible={showChangePassword} onRequestClose={closeChangePassword}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ganti Password</Text>
              <TouchableOpacity onPress={closeChangePassword}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Password Lama</Text>
              <View style={styles.inputWrapper}>
                <Lock color="#B08D8F" size={18} />
                <TextInput
                  style={styles.input}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Masukkan password saat ini"
                  placeholderTextColor="#B08D8F"
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Password Baru</Text>
              <View style={styles.inputWrapper}>
                <Lock color="#B08D8F" size={18} />
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Minimal 6 karakter"
                  placeholderTextColor="#B08D8F"
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Konfirmasi Password Baru</Text>
              <View style={styles.inputWrapper}>
                <Lock color="#B08D8F" size={18} />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Ulangi password baru"
                  placeholderTextColor="#B08D8F"
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleChangePassword}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Simpan Password Baru</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#61141A' },
  scrollContainer: { paddingHorizontal: 24, paddingBottom: 40 },
  profileCard: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0EAEB',
  },
  avatarWrapper: { marginBottom: 16 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: '#61141A' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#61141A' },
  userRole: { fontSize: 14, color: '#aa7a7c', marginTop: 4 },
  badgeNim: { backgroundColor: '#61141A', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginTop: 12 },
  badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#61141A', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0EAEB',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  infoItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#FDFBFB' },
  iconContainer: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F7EBEB', justifyContent: 'center', alignItems: 'center' },
  infoTextContainer: { marginLeft: 14 },
  infoLabel: { fontSize: 12, color: '#A3A3A3' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#333333', marginTop: 2 },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0EAEB',
    padding: 16,
    marginBottom: 32,
  },
  menuRowLeft: { flexDirection: 'row', alignItems: 'center' },
  menuRowText: { fontSize: 14, fontWeight: '600', color: '#61141A', marginLeft: 12 },
  logoutButton: {
    backgroundColor: '#61141A',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 32 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#61141A' },
  modalClose: { fontSize: 18, fontWeight: 'bold', color: '#61141A' },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { fontSize: 12, color: '#9A9A9A', marginBottom: 6, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: '#E5D6D7',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  input: { flex: 1, fontSize: 14, color: '#61141A', paddingVertical: 12 },
  submitButton: {
    backgroundColor: '#61141A',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
});