import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Supaya notifikasi tetap tampil (alert + suara) walau aplikasi lagi dibuka aktif
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // muncul sebagai banner di layar (pengganti shouldShowAlert lama)
    shouldShowList: true,   // muncul juga di notification center/list
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Minta izin notifikasi ke user. Panggil ini sekali waktu aplikasi pertama kali dibuka
 * (misalnya di root _layout.tsx), sebelum menjadwalkan notifikasi apa pun.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log('Notifikasi lokal butuh device fisik — emulator/simulator kadang tidak mendukung penuh.');
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Izin notifikasi ditolak oleh user.');
    return false;
  }

  // Wajib untuk Android: bikin notification channel dulu sebelum notifikasi bisa muncul
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('exam-reminders', {
      name: 'Pengingat Ujian',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#61141A',
    });
  }

  return true;
}

/**
 * Jadwalkan notifikasi lokal 15 menit sebelum waktu ujian dimulai.
 * categoryId disisipkan sebagai data payload, dipakai untuk deep-link saat notifikasi di-tap.
 * Mengembalikan notificationId supaya bisa dibatalkan nanti kalau perlu (misal ujian sudah dikerjakan duluan).
 */
export async function scheduleExamReminder(
  examTitle: string,
  examStartDateTime: Date,
  categoryId: string,
  minutesBefore: number = 15
): Promise<string | null> {
  const reminderTime = new Date(examStartDateTime.getTime() - minutesBefore * 60 * 1000);
  const now = new Date();

  if (reminderTime <= now) {
    console.log(`Waktu reminder untuk "${examTitle}" sudah lewat, notifikasi tidak dijadwalkan.`);
    return null;
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Ujian Akan Dimulai!',
      body: `${examTitle} akan dimulai dalam ${minutesBefore} menit. Siapkan dirimu!`,
      sound: true,
      data: { type: 'reminder', categoryId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderTime,
      channelId: 'exam-reminders',
    },
  });

  console.log(`Reminder terjadwal untuk "${examTitle}" pada ${reminderTime.toLocaleString('id-ID')}`);
  return notificationId;
}

/**
 * Batalkan satu notifikasi terjadwal berdasarkan ID-nya.
 * Dipakai kalau mahasiswa sudah mengerjakan ujian sebelum waktu reminder-nya kesampaian,
 * supaya tidak muncul notifikasi "ujian akan dimulai" padahal sudah selesai.
 */
export async function cancelReminder(notificationId: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (err) {
    console.log('Gagal membatalkan reminder (mungkin sudah terpakai/kadaluarsa):', err);
  }
}

/**
 * Kirim notifikasi HASIL UJIAN secara instan (bukan dijadwalkan — trigger: null berarti langsung tampil).
 * Panggil ini tepat setelah hasil ujian tersimpan (addHistory).
 */
export async function sendExamResultNotification(
  examTitle: string,
  status: string,
  score: number,
  categoryId?: string
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: status === 'Passed' ? 'Selamat, Kamu Lulus! 🎉' : 'Hasil Ujian Sudah Keluar',
      body: `${examTitle}: Skor kamu ${score}%`,
      sound: true,
      data: { type: 'result', categoryId },
    },
    trigger: null, // null = tampil sekarang juga, bukan dijadwalkan ke masa depan
  });
}

/**
 * Batalkan semua notifikasi lokal yang sudah dijadwalkan.
 * Berguna kalau jadwal ujian berubah/dihapus, supaya reminder lama tidak nyasar.
 */
export async function cancelAllScheduledReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Lihat semua notifikasi yang masih terjadwal (untuk debugging).
 */
export async function getAllScheduledReminders() {
  return Notifications.getAllScheduledNotificationsAsync();
}
