import { useRouter } from 'expo-router';
import { Award, Bell, ClipboardList, ShieldAlert, Sparkles } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  StatusBar as RNStatusBar,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useExam } from '../../context/ExamContext';

export default function DashboardScreen() {
  const router = useRouter();
  const { getNotifications } = useExam();
  const { profile } = useAuth();

  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [greeting, setGreeting] = useState('Good Morning');
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = getNotifications();

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      };
      const dateString = now.toLocaleDateString('en-US', options);
      setCurrentDate(dateString);

      const currentHour = now.getHours();
      const hours = String(currentHour).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes} WIB`);

      if (currentHour >= 5 && currentHour < 12) {
        setGreeting('Good Morning');
      } else if (currentHour >= 12 && currentHour < 17) {
        setGreeting('Good Afternoon');
      } else {
        setGreeting('Good Evening');
      }
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <RNStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/mahasiswa/profile' as any)}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60' }}
            style={styles.profileImage}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Dashboard</Text>

        <TouchableOpacity style={styles.notificationButton} onPress={() => setShowNotifications(true)}>
          <Bell color="#61141A" size={24} />
          {notifications.length > 0 && <View style={styles.notifBadge} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

        <View style={styles.welcomeContainer}>
          <Text style={styles.greetingText}>
            Hi, {profile?.name?.split(' ')[0] || 'Mahasiswa'}!
          </Text>
          <Text style={styles.subGreetingText}>{greeting}</Text>
        </View>

        <View style={styles.dateTimeContainer}>
          <Text style={styles.dateText}>{currentDate}</Text>
          <Text style={styles.timeText}>{currentTime}</Text>
        </View>

        <View style={styles.bannerCard}>
          <Text style={styles.bannerTitle}>Welcome!</Text>
          <Text style={styles.bannerSubtitle}>It's Time to Prove Your Competence</Text>
        </View>

        <Text style={styles.sectionTitle}>All Services</Text>

        <View style={styles.gridContainer}>
          <TouchableOpacity
            style={styles.menuBox}
            onPress={() => router.push('/mahasiswa/exam-list' as any)}
          >
            <View style={styles.menuHeaderRow}>
              <ClipboardList color="#FFFFFF" size={24} />
              <Text style={styles.menuTitle}>Exam</Text>
            </View>
            <Text style={styles.menuDesc}>Start Assessment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuBox}
            onPress={() => router.push('/mahasiswa/score' as any)}
          >
            <View style={styles.menuHeaderRow}>
              <Sparkles color="#FFFFFF" size={24} />
              <Text style={styles.menuTitle}>Score</Text>
            </View>
            <Text style={styles.menuDesc}>Review your performance</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuBox}
            onPress={() => router.push('/mahasiswa/certificate' as any)}
          >
            <View style={styles.menuHeaderRow}>
              <Award color="#FFFFFF" size={24} />
              <Text style={styles.menuTitle}>Certificate</Text>
            </View>
            <Text style={styles.menuDesc}>View and download your certificates</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuBox}
            onPress={() => router.push('/mahasiswa/violations' as any)}
          >
            <View style={styles.menuHeaderRow}>
              <ShieldAlert color="#FFFFFF" size={24} />
              <Text style={styles.menuTitle}>Integrity Report</Text>
            </View>
            <Text style={styles.menuDesc}>See recorded exam activities</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerSlogan}>One Step Closer to Success!</Text>
          <Image
            source={require('../../../assets/images/graduation1.png')}
            style={styles.footerIllustration}
            resizeMode="contain"
          />
        </View>

      </ScrollView>

      <Modal animationType="slide" transparent visible={showNotifications} onRequestClose={() => setShowNotifications(false)}>
        <View style={styles.notifOverlay}>
          <View style={styles.notifSheet}>
            <View style={styles.notifHeader}>
              <Text style={styles.notifTitle}>Notifikasi</Text>
              <TouchableOpacity onPress={() => setShowNotifications(false)}>
                <Text style={styles.notifClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              {notifications.length === 0 ? (
                <Text style={styles.notifEmpty}>Belum ada notifikasi.</Text>
              ) : (
                notifications.map((n: any) => (
                  <View key={n.id} style={styles.notifItem}>
                    <View style={[styles.notifDot, { backgroundColor: n.type === 'reminder' ? '#FFD700' : '#00E676' }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.notifItemTitle}>{n.title}</Text>
                      <Text style={styles.notifItemMessage}>{n.message}</Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
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
  scrollContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  profileImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#61141A',
  },
  notificationButton: {
    padding: 4,
  },
  notifBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
  },
  welcomeContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
  greetingText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#61141A',
  },
  subGreetingText: {
    fontSize: 18,
    color: '#A3A3A3',
    marginTop: 4,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#61141A',
  },
  timeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#61141A',
  },
  bannerCard: {
    borderWidth: 2,
    borderColor: '#61141A',
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#61141A',
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#61141A',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#61141A',
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuBox: {
    width: '47%',
    backgroundColor: '#61141A',
    borderRadius: 20,
    padding: 16,
    height: 125,
    justifyContent: 'space-between',
    marginBottom: 16,
    shadowColor: '#61141A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  menuHeaderRow: {
    gap: 4,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 6,
  },
  menuDesc: {
    fontSize: 11,
    color: '#F3EFEF',
    lineHeight: 14,
    opacity: 0.85,
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 10,
    height: 110,
  },
  footerSlogan: {
    fontSize: 14,
    color: '#61141A',
    fontWeight: '600',
    opacity: 0.4,
    flex: 1,
  },
  footerIllustration: {
    width: 150,
    height: 120,
    position: 'absolute',
    right: -24,
    bottom: -40,
  },
  notifOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  notifSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '70%' },
  notifHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  notifTitle: { fontSize: 18, fontWeight: 'bold', color: '#61141A' },
  notifClose: { fontSize: 18, fontWeight: 'bold', color: '#61141A' },
  notifEmpty: { textAlign: 'center', color: '#9A9A9A', paddingVertical: 30 },
  notifItem: { flexDirection: 'row', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3EFEF' },
  notifDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  notifItemTitle: { fontSize: 14, fontWeight: 'bold', color: '#61141A', marginBottom: 2 },
  notifItemMessage: { fontSize: 12, color: '#9A9A9A' },
});