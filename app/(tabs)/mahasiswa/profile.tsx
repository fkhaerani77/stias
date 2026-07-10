import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { ArrowLeft, LogOut, Mail, Shield, User } from 'lucide-react-native';
import React from 'react';
import {
  Alert,
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
import { auth } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();

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
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=60' }}
            style={styles.avatar}
          />
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
        <TouchableOpacity style={styles.menuRow}>
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
  avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: 16, borderWidth: 3, borderColor: '#61141A' },
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
});