import { useRouter } from 'expo-router';
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
import { useExam } from './context/ExamContext';

// Kredensial dummy khusus admin — mahasiswa dicek dari data akun yang di-generate admin
const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' };

export default function LoginScreen() {
  const router = useRouter();
  const { students } = useExam();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);

  const handleLogin = () => {
    // Validasi apakah input kosong
    if (!username || !password) {
      Alert.alert('Gagal Login', 'Username dan Password tidak boleh kosong!');
      return;
    }

    // 1. Cek dulu apakah ini akun admin
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      router.replace('/admin' as any);
      return;
    }

    // 2. Kalau bukan admin, cek ke daftar akun mahasiswa yang di-generate admin
    const matchedStudent = (students || []).find(
      (s: any) => s.username === username && s.password === password
    );

    if (matchedStudent) {
      router.replace('/mahasiswa' as any);
    } else {
      Alert.alert('Gagal Login', 'Username atau Password salah. Coba lagi!');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.contentContainer}>
        {/* Gambar Ilustrasi Wisuda */}
        <View style={styles.imageContainer}>
          <Image 
            source={require('../assets/images/graduation1.png')} 
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        {/* Header Teks */}
        <View style={styles.headerTextContainer}>
          <Text style={styles.titleText}>Login</Text>
          <Text style={styles.subtitleText}>Please Login to continue</Text>
        </View>

        {/* Form Input */}
        <View style={styles.formContainer}>
          
          {/* Input Username */}
          <View style={styles.inputWrapper}>
            <User color="#A3A3A3" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Masukkan username"
              placeholderTextColor="#A3A3A3"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          {/* Input Password */}
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
            {/* Tombol Toggle Sembunyikan/Lihat Password */}
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

          {/* Tombol Log In */}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>

        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  imageContainer: {
    alignItems: 'flex-end',
    marginBottom: 40,
  },
  illustration: {
    width: 240,
    height: 200,
  },
  headerTextContainer: {
    marginBottom: 32,
  },
  titleText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  subtitleText: {
    fontSize: 16,
    color: '#737373',
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 54,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
  },
  eyeIcon: {
    padding: 4,
  },
  loginButton: {
    backgroundColor: '#61141A',
    borderRadius: 25,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#61141A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
