import { useRouter } from 'expo-router';
import { Award, Bell, ClipboardList, History, ShieldAlert, Sparkles } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
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

export default function DashboardScreen() {
  const router = useRouter(); 
  
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [greeting, setGreeting] = useState('Good Morning');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      // 1. Format Tanggal otomatis
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      };
      const dateString = now.toLocaleDateString('en-US', options); 
      setCurrentDate(dateString);

      // 2. Format Waktu otomatis
      const currentHour = now.getHours();
      const hours = String(currentHour).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes} WIB`);

      // 3. Logika Penyesuaian Ucapan Selamat otomatis
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
      
      {/* 1. Header (Profil & Notifikasi) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/mahasiswa/profile' as any)}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60' }} 
            style={styles.profileImage}
          />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Dashboard</Text>
        
        <TouchableOpacity style={styles.notificationButton}>
          <Bell color="#61141A" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* 2. Welcome Greetings (Dinamis) */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.greetingText}>Hi, Fauzia!</Text>
          <Text style={styles.subGreetingText}>{greeting}</Text>
        </View>

        {/* 3. Info Tanggal & Waktu (Dinamis) */}
        <View style={styles.dateTimeContainer}>
          <Text style={styles.dateText}>{currentDate}</Text>
          <Text style={styles.timeText}>{currentTime}</Text>
        </View>

        {/* 4. Banner Welcome Card */}
        <View style={styles.bannerCard}>
          <Text style={styles.bannerTitle}>Welcome!</Text>
          <Text style={styles.bannerSubtitle}>It's Time to Prove Your Competence</Text>
        </View>

        {/* 5. Section "All Services" */}
        <Text style={styles.sectionTitle}>All Services</Text>

        {/* Grid Menu Senada (Menggunakan Tema Warna Marun Konsisten) */}
        <View style={styles.gridContainer}>
          {/* Menu 1: Exam (DI SINI PERUBAHANNYA) */}
          <TouchableOpacity 
            style={styles.menuBox}
            onPress={() => router.push('/mahasiswa/exam-info' as any)}
          >
            <View style={styles.menuHeaderRow}>
              <ClipboardList color="#FFFFFF" size={24} />
              <Text style={styles.menuTitle}>Exam</Text>
            </View>
            <Text style={styles.menuDesc}>Start Assessment</Text>
          </TouchableOpacity>

          {/* Menu 2: Exam History */}
          <TouchableOpacity 
              style={styles.menuBox} 
              onPress={() => router.push('/mahasiswa/exam-history')} // Tambahkan baris ini
            >
              <View style={styles.menuHeaderRow}>
                <History color="#FFFFFF" size={24} />
                <Text style={styles.menuTitle}>Exam History</Text>
              </View>
              <Text style={styles.menuDesc}>You don't have exam history</Text>
            </TouchableOpacity>

          {/* Menu 3: Score */}
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

          {/* Menu 4: Certificate */}
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
        </View>

        {/* Menu 5: Integrity Report (Gaya Outline Elegan Kontras) */}
        <TouchableOpacity
          style={styles.longMenuBox}
          onPress={() => router.push('/mahasiswa/violations' as any)}
        >
          <View style={styles.longMenuLeft}>
            <ShieldAlert color="#61141A" size={24} />
            <View style={styles.longMenuTextContainer}>
              <Text style={styles.longMenuTitle}>Integrity Report</Text>
              <Text style={styles.longMenuDesc}>See recorded exam activities</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 6. Footer */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerSlogan}>One Step Closer to Success!</Text>
          <Image 
            source={require('../../../assets/images/graduation1.png')} 
            style={styles.footerIllustration}
            resizeMode="contain"
          />
        </View>

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
  longMenuBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#61141A',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 32,
  },
  longMenuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  longMenuTextContainer: {
    marginLeft: 12,
  },
  longMenuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#61141A',
  },
  longMenuDesc: {
    fontSize: 12,
    color: '#7A2229',
    marginTop: 2,
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 10,
    height: 120,
  },
  footerSlogan: {
    fontSize: 13,
    color: '#61141A',
    fontWeight: '600',
    paddingBottom: 20,
    flex: 1,
    opacity: 0.6,
  },
  footerIllustration: {
    width: 150,
    height: 120,
    position: 'absolute',
    right: -10,
    bottom: -20,
  },
});
