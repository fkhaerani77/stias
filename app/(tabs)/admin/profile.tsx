import { useRouter } from 'expo-router';
import { EmailAuthProvider, reauthenticateWithCredential, signOut, updatePassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ChevronLeft, Lock, LogOut, Pencil, Save } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  StatusBar as RNStatusBar,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

export default function AdminProfileScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({ name: '', nidn: '', jabatan: '', phone: '' });
  const [isSaving, setIsSaving] = useState(false);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'A')}&background=61141A&color=FFFFFF&size=200&bold=true`;

  const startEditing = () => {
    setDraft({
      name: profile?.name || '',
      nidn: profile?.nidn || '',
      jabatan: profile?.jabatan || '',
      phone: profile?.phone || '',
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!draft.name.trim() || !draft.nidn.trim()) {
      Alert.alert('Tidak Bisa Disimpan', 'Nama dan NIDN tidak boleh kosong.');
      return;
    }
    if (!user) return;

    setIsSaving(true);
    try {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          name: draft.name.trim(),
          nidn: draft.nidn.trim(),
          jabatan: draft.jabatan.trim(),
          phone: draft.phone.trim(),
        },
        { merge: true }
      );
      setIsEditing(false);
      Alert.alert('Tersimpan', 'Profil berhasil diperbarui.');
    } catch (error: any) {
      Alert.alert('Gagal Menyimpan', error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const updateField = (field: keyof typeof draft, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const closeChangePassword = () => {
    setShowChangePassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
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
    if (!user?.email) return;

    setIsChangingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      Alert.alert('Berhasil', 'Password berhasil diubah.', [{ text: 'OK', onPress: closeChangePassword }]);
    } catch (error: any) {
      let message = 'Terjadi kesalahan. Coba lagi.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        message = 'Password lama yang kamu masukkan salah.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.';
      }
      Alert.alert('Gagal Mengubah Password', message);
    } finally {
      setIsChangingPassword(false);
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
          <ChevronLeft color="#61141A" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil</Text>
        {!isEditing ? (
          <TouchableOpacity onPress={startEditing} style={styles.editButton}>
            <Pencil color="#61141A" size={20} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 32 }} />
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: defaultAvatar }} style={styles.avatar} />
        </View>

        <View style={styles.formCard}>
          <FieldRow
            label="Nama Lengkap"
            value={isEditing ? draft.name : profile?.name || '-'}
            editable={isEditing}
            onChangeText={(v) => updateField('name', v)}
          />
          <FieldRow
            label="NIDN"
            value={isEditing ? draft.nidn : profile?.nidn || '-'}
            editable={isEditing}
            onChangeText={(v) => updateField('nidn', v)}
            keyboardType="number-pad"
          />
          <FieldRow
            label="Jabatan"
            value={isEditing ? draft.jabatan : profile?.jabatan || '-'}
            editable={isEditing}
            onChangeText={(v) => updateField('jabatan', v)}
          />
          <FieldRow
            label="Email"
            value={user?.email || '-'}
            editable={false}
          />
          <FieldRow
            label="No. HP"
            value={isEditing ? draft.phone : profile?.phone || '-'}
            editable={isEditing}
            onChangeText={(v) => updateField('phone', v)}
            keyboardType="phone-pad"
            isLast
          />
        </View>

        {isEditing ? (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} disabled={isSaving}>
              <Text style={styles.cancelText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Save color="#FFFFFF" size={16} />
                  <Text style={styles.saveText}>Simpan</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity style={styles.securityButton} onPress={() => setShowChangePassword(true)}>
              <Lock color="#61141A" size={18} />
              <Text style={styles.securityText}>Ganti Password</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LogOut color="#FF4444" size={18} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

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
              <Text style={styles.modalFieldLabel}>Password Lama</Text>
              <TextInput
                style={styles.modalInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Masukkan password saat ini"
                placeholderTextColor="#B08D8F"
                secureTextEntry
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.modalFieldLabel}>Password Baru</Text>
              <TextInput
                style={styles.modalInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Minimal 6 karakter"
                placeholderTextColor="#B08D8F"
                secureTextEntry
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.modalFieldLabel}>Konfirmasi Password Baru</Text>
              <TextInput
                style={styles.modalInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Ulangi password baru"
                placeholderTextColor="#B08D8F"
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleChangePassword} disabled={isChangingPassword}>
              {isChangingPassword ? (
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

function FieldRow({
  label,
  value,
  editable,
  onChangeText,
  keyboardType,
  isLast,
}: {
  label: string;
  value: string;
  editable: boolean;
  onChangeText?: (v: string) => void;
  keyboardType?: 'default' | 'number-pad' | 'email-address' | 'phone-pad';
  isLast?: boolean;
}) {
  return (
    <View style={[styles.fieldRow, !isLast && styles.fieldRowBorder]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {editable ? (
        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType || 'default'}
          placeholderTextColor="#B08D8F"
        />
      ) : (
        <Text style={styles.fieldValue}>{value}</Text>
      )}
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
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#61141A' },
  editButton: { padding: 4 },
  content: { flex: 1, paddingHorizontal: 24 },
  avatarWrapper: { alignItems: 'center', marginTop: 10, marginBottom: 28 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#61141A' },
  formCard: {
    borderWidth: 1.5,
    borderColor: '#61141A',
    borderRadius: 20,
    paddingHorizontal: 20,
  },
  fieldRow: { paddingVertical: 14 },
  fieldRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3EFEF' },
  fieldLabel: { fontSize: 11, color: '#9A9A9A', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldValue: { fontSize: 15, color: '#61141A', fontWeight: '600' },
  fieldInput: {
    fontSize: 15,
    color: '#61141A',
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#D9AEB1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#61141A',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: { color: '#61141A', fontWeight: 'bold', fontSize: 14 },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#61141A',
    borderRadius: 14,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  securityButton: {
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#61141A',
    borderRadius: 14,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  securityText: { color: '#61141A', fontWeight: 'bold', fontSize: 14 },
  logoutButton: {
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#FF4444',
    borderRadius: 14,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  logoutText: { color: '#FF4444', fontWeight: 'bold', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 32 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#61141A' },
  modalClose: { fontSize: 18, fontWeight: 'bold', color: '#61141A' },
  fieldGroup: { marginBottom: 16 },
  modalFieldLabel: { fontSize: 12, color: '#9A9A9A', marginBottom: 6, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  modalInput: {
    borderWidth: 1.5,
    borderColor: '#E5D6D7',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#61141A',
  },
  submitButton: {
    backgroundColor: '#61141A',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
});