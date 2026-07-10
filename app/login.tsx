import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Eye, EyeOff, Lock, User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { auth, db } from './config/firebase';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState(''); // Sekarang ini akan menampung full email
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);

  const handleLogin = async () => {
    // Trim untuk membersihkan spasi tidak sengaja
    const emailInput = username.trim();
    const passwordInput = password.trim();

    if (!emailInput || !passwordInput) {
      Alert.alert('Gagal', 'Email dan Password tidak boleh kosong!');
      return;
    }

    try {
      // 1. Langsung gunakan emailInput yang sudah diketik user
      const userCredential = await signInWithEmailAndPassword(auth, emailInput, passwordInput);
      const uid = userCredential.user.uid;

      // 2. Ambil data role dari Firestore
      const userDoc = await getDoc(doc(db, 'users', uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
         console.log('UID login:', uid);
         console.log('Data user dari Firestore:', userData);
         console.log('Role terbaca:', JSON.stringify(userData.role));
        
        // 3. Arahkan berdasarkan role
        if (userData.role === 'admin') {
          router.replace('/admin');
        } else {
          router.replace('/mahasiswa');
        }
      } else {
        Alert.alert('Gagal Login', 'Data profil user tidak ditemukan.');
      }
    } catch (error: any) {
      Alert.alert('Gagal Login', error.message);
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.contentContainer}>
        <View style={styles.imageContainer}>
          <Image 
            source={require('../assets/images/graduation1.png')} 
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        <View style={styles.headerTextContainer}>
          <Text style={styles.titleText}>Login</Text>
          <Text style={styles.subtitleText}>Please Login to continue</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <User color="#A3A3A3" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Masukkan email (cth: mhs@gmail.com)"
              placeholderTextColor="#A3A3A3"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              keyboardType="email-address" // Membantu user mengetik email
            />
          </View>

          <View style={styles.inputWrapper}>
            <Lock color="#A3A3A3" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Masukkan Password"
              placeholderTextColor="#A3A3A3"
              secureTextEntry={secureText}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              onPress={() => setSecureText(!secureText)}
              style={styles.eyeIcon}
            >
              {secureText ? (
                <EyeOff color="#A3A3A3" size={20} />
              ) : (
                <Eye color="#A3A3A3" size={20} />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... (style tidak perlu diubah, tetap sama seperti sebelumnya)
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  contentContainer: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  imageContainer: { alignItems: 'flex-end', marginBottom: 40 },
  illustration: { width: 240, height: 200 },
  headerTextContainer: { marginBottom: 32 },
  titleText: { fontSize: 32, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 6 },
  subtitleText: { fontSize: 16, color: '#737373' },
  formContainer: { width: '100%' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F7', borderRadius: 25, paddingHorizontal: 16, height: 54, marginBottom: 16 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 15, color: '#1A1A1A' },
  eyeIcon: { padding: 4 },
  loginButton: { backgroundColor: '#61141A', borderRadius: 25, height: 54, justifyContent: 'center', alignItems: 'center', marginTop: 24, shadowColor: '#61141A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 3 },
  loginButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});