import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { LogBox } from 'react-native';
import { ExamProvider } from './context/ExamContext'; // Pastikan path import ini benar

// 1. LogBox tetap di sini
LogBox.ignoreLogs(['lucide-react-native', 'zoom-in']);

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) return null;

  return (
    // 2. Bungkus Stack dengan ExamProvider agar aplikasi punya akses global ke history
    <ExamProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ExamProvider>
  );
}