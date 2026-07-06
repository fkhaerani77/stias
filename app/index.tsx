import { useRouter } from 'expo-router'; // Impor router dari expo-router
import React, { useEffect } from 'react';
import { Image, StatusBar, StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // Beri jeda 3 detik (3000ms) lalu pindah ke halaman berikutnya
    const timer = setTimeout(() => {
      // Ganti 'login' dengan nama file halaman tujuanmu nanti (misal: app/login.tsx)
      // Untuk tes awal, biarkan dulu atau arahkan ke route yang sudah ada.
      router.replace('/login'); 
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5a1216" />

      <View style={styles.centerContent}>
        <Text style={styles.welcomeText}>WELCOME TO</Text>
        
        <Image 
          source={require('../assets/images/logo-stikom.png')} 
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.titleText}>STIAS</Text>
        <Text style={styles.subtitleText}>STIKOM ASSESSMENT SYSTEM</Text>
      </View>

      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>© 2026 STIKOM POLTEK CIREBON</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#61141A',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 40,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 40,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1,
    textAlign: 'center',
  },
  footerContainer: {
    width: '100%',
    alignItems: 'center',
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '400',
    opacity: 0.8,
  },
});