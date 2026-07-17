import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { LogBox, Platform } from "react-native";
import { AuthProvider } from "./context/AuthContext";
import { ExamProvider } from "./context/ExamContext";
import { requestNotificationPermission } from "./utils/notifications";

LogBox.ignoreLogs([
  "lucide-react-native",
  "zoom-in",
  "was removed from Expo Go", // sembunyikan warning push notification yang tidak kita pakai
]);

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsReady(true);
  }, []);

  // Setup notifikasi: minta izin + pasang deep-link handler
  // CATATAN: expo-notifications belum didukung penuh di platform web (getLastNotificationResponseAsync,
  // listener, dsb bisa throw). Jadi seluruh blok ini di-skip kalau dijalankan di web.
  useEffect(() => {
    if (Platform.OS === "web") return;

    requestNotificationPermission();

    // Kasus 1: user tap notifikasi SAAT app lagi aktif/di-background (bukan di-kill)
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as {
          categoryId?: string;
        };
        if (data?.categoryId) {
          router.push({
            pathname: "/mahasiswa/exam-info",
            params: { categoryId: data.categoryId },
          } as any);
        }
      });

    // Kasus 2: app tadinya ke-KILL total, lalu dibuka lagi dengan cara nge-tap notifikasi
    Notifications.getLastNotificationResponseAsync().then((response) => {
      const data = response?.notification.request.content.data as
        | { categoryId?: string }
        | undefined;
      if (data?.categoryId) {
        router.push({
          pathname: "/mahasiswa/exam-info",
          params: { categoryId: data.categoryId },
        } as any);
      }
    });

    return () => {
      responseSubscription.remove();
    };
  }, []);

  if (!isReady) return null;

  return (
    <AuthProvider>
      <ExamProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </ExamProvider>
    </AuthProvider>
  );
}
