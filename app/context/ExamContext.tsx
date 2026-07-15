import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { db, secondaryAuth } from '../config/firebase';
import { scheduleExamReminder, cancelReminder, sendExamResultNotification } from './../utils/notifications';

// ============================================================
// TIPE DATA
// ============================================================

export interface ExamQuestion {
  id: number;
  text: string;
  options: { key: string; text: string }[];
  correctAnswer: string;
}

export interface ExamCategory {
  id: string;
  title: string;
  schedule: string;
  scheduleTimestamp?: number; // epoch ms, dipakai untuk hitung reminder & validasi akses ujian
  duration: number;
  questionIds: number[];
}

export interface StudentAccount {
  id: string;
  name: string;
  nim: string;
  kelas: string;
  prodi: string;
  tahun: string;
  username: string;
  password: string;
  status: 'Aktif' | 'Nonaktif';
}

// ============================================================
// CONTEXT
// ============================================================

const ExamContext = createContext<any>(null);

export const ExamProvider = ({ children }: { children: React.ReactNode }) => {
  const [history, setHistory] = useState<any[]>([]);
  const addHistory = (examData: any) => {
    setHistory((prev) => [examData, ...prev]);
    // Kirim notifikasi OS instan begitu hasil ujian keluar
    sendExamResultNotification(examData.title, examData.status, examData.score, examData.categoryId);
  };

  const [violations, setViolations] = useState<any[]>([]);
  const addViolation = (violationData: any) => {
    setViolations((prev) => [violationData, ...prev]);
  };

  // ------------------------------------------------------------
  // QUESTION BANK — terintegrasi Firestore (collection: "questions")
  // ------------------------------------------------------------
  const [questionBank, setQuestionBank] = useState<ExamQuestion[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'questions'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: ExamQuestion[] = snapshot.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: data.id ?? Number(d.id),
            text: data.text,
            options: data.options,
            correctAnswer: data.correctAnswer,
          };
        });
        setQuestionBank(items);
      },
      (error) => console.error('Gagal memuat questions dari Firestore:', error)
    );
    return unsubscribe;
  }, []);

  const addQuestion = (question: Omit<ExamQuestion, 'id'>) => {
    const newQuestion: ExamQuestion = { ...question, id: Date.now() };
    // Doc ID Firestore = id numerik (sebagai string) supaya gampang dirujuk dari questionIds kategori
    setDoc(doc(db, 'questions', String(newQuestion.id)), {
      ...newQuestion,
      createdAt: serverTimestamp(),
    }).catch((error) => console.error('Gagal menambah soal:', error));
    return newQuestion;
  };

  const updateQuestion = (questionId: number, updates: Partial<ExamQuestion>) => {
    updateDoc(doc(db, 'questions', String(questionId)), updates as any).catch((error) =>
      console.error('Gagal memperbarui soal:', error)
    );
  };

  const deleteQuestion = (questionId: number) => {
    deleteDoc(doc(db, 'questions', String(questionId))).catch((error) =>
      console.error('Gagal menghapus soal:', error)
    );
    // Lepas soal ini dari semua kategori yang memakainya
    categories
      .filter((c) => c.questionIds.includes(questionId))
      .forEach((c) => {
        updateDoc(doc(db, 'categories', c.id), {
          questionIds: arrayRemove(questionId),
        }).catch((error) => console.error('Gagal melepas soal dari kategori:', error));
      });
  };

  // ------------------------------------------------------------
  // KATEGORI UJIAN — terintegrasi Firestore (collection: "categories")
  // ------------------------------------------------------------
  const [categories, setCategories] = useState<ExamCategory[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'categories'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: ExamCategory[] = snapshot.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            title: data.title,
            schedule: data.schedule,
            scheduleTimestamp: data.scheduleTimestamp,
            duration: data.duration,
            questionIds: data.questionIds || [],
          };
        });
        setCategories(items);
      },
      (error) => console.error('Gagal memuat categories dari Firestore:', error)
    );
    return unsubscribe;
  }, []);

  const addCategory = (category: Omit<ExamCategory, 'id' | 'questionIds'>) => {
    const newId = `cat-${Date.now()}`;
    const newCategory: ExamCategory = { ...category, id: newId, questionIds: [] };
    setDoc(doc(db, 'categories', newId), {
      title: category.title,
      schedule: category.schedule,
      scheduleTimestamp: category.scheduleTimestamp ?? null,
      duration: category.duration,
      questionIds: [],
      createdAt: serverTimestamp(),
    }).catch((error) => console.error('Gagal menambah kategori:', error));
    return newCategory;
  };

  const updateCategory = (categoryId: string, updates: Partial<ExamCategory>) => {
    updateDoc(doc(db, 'categories', categoryId), updates as any).catch((error) =>
      console.error('Gagal memperbarui kategori:', error)
    );
  };

  const deleteCategory = (categoryId: string) => {
    deleteDoc(doc(db, 'categories', categoryId)).catch((error) =>
      console.error('Gagal menghapus kategori:', error)
    );
  };

  const toggleQuestionInCategory = (categoryId: string, questionId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return;
    const alreadyIn = category.questionIds.includes(questionId);
    updateDoc(doc(db, 'categories', categoryId), {
      questionIds: alreadyIn ? arrayRemove(questionId) : arrayUnion(questionId),
    }).catch((error) => console.error('Gagal mengubah daftar soal kategori:', error));
  };

  const getQuestionsForCategory = (categoryId: string): ExamQuestion[] => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return [];
    return category.questionIds
      .map((id) => questionBank.find((q) => q.id === id))
      .filter(Boolean) as ExamQuestion[];
  };

  // ------------------------------------------------------------
  // VALIDASI JADWAL UJIAN — akses ujian hanya diizinkan sesuai jadwal
  // ------------------------------------------------------------
  // status: 'unscheduled' | 'upcoming' | 'open' | 'closed'
  const getExamAccessStatus = (category: ExamCategory) => {
    if (!category.scheduleTimestamp) {
      return {
        status: 'unscheduled' as const,
        canStart: false,
        message: 'Jadwal ujian belum diatur oleh admin.',
      };
    }

    const now = Date.now();
    const opensAt = category.scheduleTimestamp;
    const closesAt = opensAt + category.duration * 60 * 1000;

    if (now < opensAt) {
      return {
        status: 'upcoming' as const,
        canStart: false,
        message: `Ujian belum dibuka. Mulai pada ${category.schedule}.`,
        opensAt,
        closesAt,
      };
    }

    if (now > closesAt) {
      return {
        status: 'closed' as const,
        canStart: false,
        message: 'Waktu pengerjaan ujian ini sudah berakhir.',
        opensAt,
        closesAt,
      };
    }

    return {
      status: 'open' as const,
      canStart: true,
      message: 'Ujian dapat dikerjakan sekarang.',
      opensAt,
      closesAt,
    };
  };

  // --- Jadwalkan notifikasi OS asli (expo-notifications) tiap kali daftar kategori/history berubah ---
  // Set ini nyimpen kombinasi "id kategori + jadwalnya" yang SUDAH pernah dijadwalkan,
  // supaya tidak menjadwalkan ulang notifikasi yang sama berkali-kali tiap re-render.
  const scheduledRemindersRef = useRef<Set<string>>(new Set());
  // Map ini nyimpen notificationId hasil schedule per kategori, dipakai untuk cancel
  // kalau ternyata mahasiswa sudah mengerjakan ujian sebelum waktu reminder-nya kesampaian.
  const scheduledNotificationIdsRef = useRef<Record<string, string>>({});

  useEffect(() => {
    categories.forEach((cat) => {
      if (!cat.scheduleTimestamp) return; // belum ada jadwal pasti, skip

      const alreadyDone = history.some((h: any) => h.categoryId === cat.id);

      if (alreadyDone) {
        // Ujian ini sudah dikerjakan — kalau masih ada reminder yang ke-schedule, batalkan
        const existingId = scheduledNotificationIdsRef.current[cat.id];
        if (existingId) {
          cancelReminder(existingId);
          delete scheduledNotificationIdsRef.current[cat.id];
        }
        return;
      }

      const reminderKey = `${cat.id}-${cat.scheduleTimestamp}`;
      if (scheduledRemindersRef.current.has(reminderKey)) return; // sudah pernah dijadwalkan

      scheduleExamReminder(cat.title, new Date(cat.scheduleTimestamp), cat.id).then((notificationId) => {
        if (notificationId) {
          scheduledNotificationIdsRef.current[cat.id] = notificationId;
        }
      });
      scheduledRemindersRef.current.add(reminderKey);
    });
  }, [categories, history]);

  // --- Notifikasi mahasiswa: reminder jadwal ujian + hasil ujian ---
  const getNotifications = () => {
    const notifications: any[] = [];
    const now = Date.now();
    const in48h = now + 48 * 60 * 60 * 1000;

    categories.forEach((cat) => {
      const alreadyDone = history.some((h: any) => h.categoryId === cat.id);
      if (!alreadyDone && cat.scheduleTimestamp && cat.scheduleTimestamp > now && cat.scheduleTimestamp <= in48h) {
        notifications.push({
          id: `reminder-${cat.id}`,
          type: 'reminder',
          title: 'Ujian Akan Dimulai',
          message: `${cat.title} dijadwalkan ${cat.schedule}`,
          timestamp: cat.scheduleTimestamp,
        });
      }
    });

    history.forEach((h: any) => {
      notifications.push({
        id: `result-${h.id}`,
        type: 'result',
        title: h.status === 'Passed' ? 'Selamat, Kamu Lulus!' : 'Hasil Ujian Keluar',
        message: `${h.title}: Skor ${h.score}%`,
        timestamp: h.id,
      });
    });

    return notifications.sort((a, b) => b.timestamp - a.timestamp);
  };

  // ------------------------------------------------------------
  // MAHASISWA — terintegrasi Firestore (collection: "users", role == "mahasiswa")
  // ------------------------------------------------------------
  const [students, setStudents] = useState<StudentAccount[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'mahasiswa'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: StudentAccount[] = snapshot.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            name: data.name,
            nim: data.nim,
            kelas: data.kelas,
            prodi: data.prodi,
            tahun: data.tahun,
            username: data.nim,
            // Password Firebase Auth tidak bisa dibaca ulang; field ini hanya dipakai
            // untuk ditampilkan sesaat setelah akun dibuat/direset (lihat addStudent & resetStudentPassword).
            password: data.password || '',
            status: data.status,
          };
        });
        setStudents(items);
      },
      (error) => console.error('Gagal memuat data mahasiswa dari Firestore:', error)
    );
    return unsubscribe;
  }, []);

  const generatePassword = () => Math.floor(100000 + Math.random() * 900000).toString();

  const addStudent = async (student: Omit<StudentAccount, 'id' | 'username' | 'password'>) => {
    const generatedPassword = generatePassword();
    const email = `${student.nim}@student.stias.app`;

    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, generatedPassword);
    const uid = userCredential.user.uid;

    await setDoc(doc(db, 'users', uid), {
      role: 'mahasiswa',
      name: student.name,
      nim: student.nim,
      kelas: student.kelas,
      prodi: student.prodi,
      tahun: student.tahun,
      status: student.status,
      // Disimpan supaya admin masih bisa lihat password login mahasiswa kapan saja dari daftar.
      // (Firebase Auth tidak pernah menyimpan/mengembalikan password asli.)
      password: generatedPassword,
      createdAt: serverTimestamp(),
    });

    await signOut(secondaryAuth);

    const newStudent: StudentAccount = {
      ...student,
      id: uid,
      username: student.nim,
      password: generatedPassword,
    };
    return newStudent;
  };

  // CATATAN PENTING: Firebase Auth (client SDK) tidak mengizinkan satu akun mengganti
  // password akun LAIN. Reset password "sungguhan" di sisi Auth hanya bisa dilakukan lewat
  // Firebase Admin SDK (Cloud Function) yang dipanggil dari sini, atau lewat email reset link.
  // Untuk saat ini, fungsi di bawah memperbarui password yang tercatat di Firestore (dipakai
  // untuk ditampilkan ke admin), TAPI belum mengubah password login asli di Firebase Auth.
  const resetStudentPassword = async (studentId: string) => {
    const newPassword = generatePassword();
    await updateDoc(doc(db, 'users', studentId), { password: newPassword });
    return newPassword;
  };

  const updateStudent = (studentId: string, updates: Partial<StudentAccount>) => {
    const { id, username, password, ...safeUpdates } = updates as any;
    updateDoc(doc(db, 'users', studentId), safeUpdates).catch((error) =>
      console.error('Gagal memperbarui data mahasiswa:', error)
    );
  };

  // CATATAN: ini hanya menghapus dokumen profil mahasiswa di Firestore.
  // Akun Firebase Auth-nya tidak ikut terhapus dari client SDK (butuh Admin SDK/Cloud Function).
  const deleteStudent = (studentId: string) => {
    deleteDoc(doc(db, 'users', studentId)).catch((error) =>
      console.error('Gagal menghapus data mahasiswa:', error)
    );
  };

  return (
    <ExamContext.Provider
      value={{
        history,
        addHistory,
        violations,
        addViolation,
        questionBank,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        toggleQuestionInCategory,
        getQuestionsForCategory,
        getExamAccessStatus,
        getNotifications,
        students,
        addStudent,
        updateStudent,
        deleteStudent,
        resetStudentPassword,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = () => useContext(ExamContext);
