import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
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
  scheduleTimestamp?: number; // epoch ms, dipakai untuk hitung reminder
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
// DATA AWAL (seed)
// ============================================================

const DEFAULT_QUESTION_BANK: ExamQuestion[] = [
  { id: 1, text: "What does the 'P' stand for in the HTTP protocol name?", options: [{ key: 'A', text: 'Program' }, { key: 'B', text: 'Protocol' }, { key: 'C', text: 'Private' }, { key: 'D', text: 'Process' }], correctAnswer: 'B' },
  { id: 2, text: "Which network protocol is primarily used for real-time audio and video streaming over IP networks?", options: [{ key: 'A', text: 'HTTP' }, { key: 'B', text: 'FTP' }, { key: 'C', text: 'RTP' }, { key: 'D', text: 'SMTP' }], correctAnswer: 'C' },
  { id: 3, text: "What is the primary function of the Domain Name System (DNS)?", options: [{ key: 'A', text: 'Encrypting network packets' }, { key: 'B', text: 'Assigning dynamic IP addresses' }, { key: 'C', text: 'Translating human-readable domain names to IP addresses' }, { key: 'D', text: 'Filtering malicious traffic' }], correctAnswer: 'C' },
  { id: 4, text: "Which layer of the OSI model handles hardware addressing and media access control?", options: [{ key: 'A', text: 'Physical Layer' }, { key: 'B', text: 'Data Link Layer' }, { key: 'C', text: 'Network Layer' }, { key: 'D', text: 'Transport Layer' }], correctAnswer: 'B' },
  { id: 5, text: "What is the standard port number used for secure web browsing via HTTPS?", options: [{ key: 'A', text: '80' }, { key: 'B', text: '21' }, { key: 'C', text: '443' }, { key: 'D', text: '25' }], correctAnswer: 'C' },
];

const DEFAULT_CATEGORY: ExamCategory = {
  id: 'cat-1',
  title: 'National Competency Test',
  schedule: '12 Jun 2026 • 09:00 WIB',
  scheduleTimestamp: Date.now() + 16 * 60 * 1000, // TESTING: 16 menit dari sekarang, biar reminder H-15 langsung kena
  duration: 90,
  questionIds: [1, 2, 3, 4, 5],
};

const DEFAULT_STUDENTS: StudentAccount[] = [
  { id: 'std-1', name: 'Fauzia Khaerani', nim: '145423012', kelas: 'TI-3A', prodi: 'Teknik Informatika', tahun: '2023', username: '145423012', password: '123456', status: 'Aktif' },
  { id: 'std-2', name: "Fatchatus Sa'adah", nim: '145423014', kelas: 'TI-3A', prodi: 'Teknik Informatika', tahun: '2023', username: '145423014', password: '123456', status: 'Aktif' },
  { id: 'std-3', name: 'M. Zinal Idris', nim: '145423015', kelas: 'SI-3B', prodi: 'Sistem Informasi', tahun: '2023', username: '145423015', password: '123456', status: 'Aktif' },
];

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

  const [questionBank, setQuestionBank] = useState<ExamQuestion[]>(DEFAULT_QUESTION_BANK);

  const addQuestion = (question: Omit<ExamQuestion, 'id'>) => {
    const newQuestion: ExamQuestion = { ...question, id: Date.now() };
    setQuestionBank((prev) => [...prev, newQuestion]);
    return newQuestion;
  };

  const updateQuestion = (questionId: number, updates: Partial<ExamQuestion>) => {
    setQuestionBank((prev) => prev.map((q) => (q.id === questionId ? { ...q, ...updates } : q)));
  };

  const deleteQuestion = (questionId: number) => {
    setQuestionBank((prev) => prev.filter((q) => q.id !== questionId));
    setCategories((prev) =>
      prev.map((c) => ({ ...c, questionIds: c.questionIds.filter((id) => id !== questionId) }))
    );
  };

  const [categories, setCategories] = useState<ExamCategory[]>([DEFAULT_CATEGORY]);

  const addCategory = (category: Omit<ExamCategory, 'id' | 'questionIds'>) => {
    const newCategory: ExamCategory = { ...category, id: `cat-${Date.now()}`, questionIds: [] };
    setCategories((prev) => [...prev, newCategory]);
    return newCategory;
  };

  const updateCategory = (categoryId: string, updates: Partial<ExamCategory>) => {
    setCategories((prev) => prev.map((c) => (c.id === categoryId ? { ...c, ...updates } : c)));
  };

  const deleteCategory = (categoryId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
  };

  const toggleQuestionInCategory = (categoryId: string, questionId: number) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== categoryId) return c;
        const alreadyIn = c.questionIds.includes(questionId);
        return {
          ...c,
          questionIds: alreadyIn
            ? c.questionIds.filter((id) => id !== questionId)
            : [...c.questionIds, questionId],
        };
      })
    );
  };

  const getQuestionsForCategory = (categoryId: string): ExamQuestion[] => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return [];
    return category.questionIds
      .map((id) => questionBank.find((q) => q.id === id))
      .filter(Boolean) as ExamQuestion[];
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

  const [students, setStudents] = useState<StudentAccount[]>(DEFAULT_STUDENTS);

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
    });

    await signOut(secondaryAuth);

    const newStudent: StudentAccount = {
      ...student,
      id: uid,
      username: student.nim,
      password: generatedPassword,
    };
    setStudents((prev) => [...prev, newStudent]);
    return newStudent;
  };

  const resetStudentPassword = (studentId: string) => {
    const newPassword = generatePassword();
    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, password: newPassword } : s)));
    return newPassword;
  };

  const updateStudent = (studentId: string, updates: Partial<StudentAccount>) => {
    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, ...updates } : s)));
  };

  const deleteStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
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
