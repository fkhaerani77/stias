import { useRouter } from 'expo-router';
import { Camera, ChevronLeft, Pencil, Save } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    StatusBar as RNStatusBar,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Data profil dosen — dummy, belum tersambung ke backend
const INITIAL_PROFILE = {
  name: 'Erwan Setiawan, M.Kom',
  nip: '198705122015041001',
  jabatan: 'Dosen Teknik Informatika',
  email: 'erwan.setiawan@stikompoltekcirebon.ac.id',
  phone: '0812-3456-7890',
};

export default function AdminProfileScreen() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [draft, setDraft] = useState(INITIAL_PROFILE);

  const startEditing = () => {
    setDraft(profile); // mulai edit dari data terakhir yang tersimpan
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!draft.name.trim() || !draft.nip.trim()) {
      Alert.alert('Tidak Bisa Disimpan', 'Nama dan NIP tidak boleh kosong.');
      return;
    }
    setProfile(draft);
    setIsEditing(false);
    Alert.alert('Tersimpan', 'Profil berhasil diperbarui.');
  };

  const handleCancel = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  const updateField = (field: keyof typeof draft, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
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
        {/* Foto profil */}
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&auto=format&fit=crop&q=60' }}
            style={styles.avatar}
          />
          {isEditing && (
            <TouchableOpacity style={styles.cameraButton}>
              <Camera color="#FFFFFF" size={16} />
            </TouchableOpacity>
          )}
        </View>

        {/* Form / tampilan data */}
        <View style={styles.formCard}>
          <FieldRow
            label="Nama Lengkap"
            value={isEditing ? draft.name : profile.name}
            editable={isEditing}
            onChangeText={(v) => updateField('name', v)}
          />
          <FieldRow
            label="NIP"
            value={isEditing ? draft.nip : profile.nip}
            editable={isEditing}
            onChangeText={(v) => updateField('nip', v)}
            keyboardType="number-pad"
          />
          <FieldRow
            label="Jabatan"
            value={isEditing ? draft.jabatan : profile.jabatan}
            editable={isEditing}
            onChangeText={(v) => updateField('jabatan', v)}
          />
          <FieldRow
            label="Email"
            value={isEditing ? draft.email : profile.email}
            editable={isEditing}
            onChangeText={(v) => updateField('email', v)}
            keyboardType="email-address"
          />
          <FieldRow
            label="No. HP"
            value={isEditing ? draft.phone : profile.phone}
            editable={isEditing}
            onChangeText={(v) => updateField('phone', v)}
            keyboardType="phone-pad"
            isLast
          />
        </View>

        {isEditing && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Save color="#FFFFFF" size={16} />
              <Text style={styles.saveText}>Simpan</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

// Baris field — mode lihat (Text biasa) vs mode edit (TextInput)
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
  onChangeText: (v: string) => void;
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
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: '38%',
    backgroundColor: '#61141A',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
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
});
