import { useNavigation, useRouter } from 'expo-router';
import { AlertTriangle, CheckCircle, LayoutGrid, Timer } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  AppState,
  BackHandler,
  Image,
  Modal,
  Platform,
  StatusBar as RNStatusBar,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
// Tambahkan import context
import { useExam } from '../../context/ExamContext';

// --- Tipe Data & Data Dummy tetap sama ---
interface Question {
    id: number;
    number: number;
    text: string;
    options: { key: string; text: string }[];
    correctAnswer: string; // Kunci jawaban benar
}

const DUMMY_QUESTIONS: Question[] = [
    { id: 1, number: 1, text: "What does the 'P' stand for in the HTTP protocol name?", options: [{ key: 'A', text: 'Program' }, { key: 'B', text: 'Protocol' }, { key: 'C', text: 'Private' }, { key: 'D', text: 'Process' }], correctAnswer: 'B' },
    { id: 2, number: 2, text: "Which network protocol is primarily used for real-time audio and video streaming over IP networks?", options: [{ key: 'A', text: 'HTTP' }, { key: 'B', text: 'FTP' }, { key: 'C', text: 'RTP' }, { key: 'D', text: 'SMTP' }], correctAnswer: 'C' },
    { id: 3, number: 3, text: "What is the primary function of the Domain Name System (DNS)?", options: [{ key: 'A', text: 'Encrypting network packets' }, { key: 'B', text: 'Assigning dynamic IP addresses' }, { key: 'C', text: 'Translating human-readable domain names to IP addresses' }, { key: 'D', text: 'Filtering malicious traffic' }], correctAnswer: 'C' },
    { id: 4, number: 4, text: "Which layer of the OSI model handles hardware addressing and media access control?", options: [{ key: 'A', text: 'Physical Layer' }, { key: 'B', text: 'Data Link Layer' }, { key: 'C', text: 'Network Layer' }, { key: 'D', text: 'Transport Layer' }], correctAnswer: 'B' },
    { id: 5, number: 5, text: "What is the standard port number used for secure web browsing via HTTPS?", options: [{ key: 'A', text: '80' }, { key: 'B', text: '21' }, { key: 'C', text: '443' }, { key: 'D', text: '25' }], correctAnswer: 'C' }
];

export default function ExamScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const { addHistory, addViolation } = useExam(); // Panggil hook context

    const [isListModalVisible, setIsListModalVisible] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [secondsLeft, setSecondsLeft] = useState<number>(5400);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
    // Catat waktu mulai ujian sekali saat komponen pertama kali dirender
    const [startTime] = useState<Date>(() => new Date());
    // Penanda apakah ujian sudah selesai (submit) — dipakai untuk mengizinkan keluar layar
    const examFinishedRef = useRef(false);

    // Helper untuk mencatat pelanggaran dengan format konsisten
    const logViolation = (type: string) => {
        addViolation({
            id: Date.now() + Math.random(),
            examTitle: 'National Competency Test',
            type,
            timestamp: new Date().toLocaleString('id-ID'),
        });
    };

    // 1. Blok tombol back fisik (Android)
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (examFinishedRef.current) return false; // Izinkan setelah ujian selesai
            logViolation('Menekan Tombol Back');
            Alert.alert('Tidak Diizinkan', 'Anda tidak dapat keluar dari ujian sebelum submit.');
            return true; // true = mencegah aksi back default
        });
        return () => backHandler.remove();
    }, []);

    // 2. Blok navigasi keluar layar (swipe-back, back programatis, dsb)
    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
            if (examFinishedRef.current) return; // Izinkan setelah ujian selesai
            e.preventDefault();
            logViolation('Mencoba Meninggalkan Layar Ujian');
            Alert.alert('Tidak Diizinkan', 'Anda tidak dapat meninggalkan layar ujian sebelum submit.');
        });
        return unsubscribe;
    }, [navigation]);

    // 3. Deteksi aplikasi diminimize / pindah ke app lain / layar dikunci
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextState) => {
            if (examFinishedRef.current) return;
            if (nextState === 'background' || nextState === 'inactive') {
                logViolation('Keluar dari Aplikasi / Berpindah Aplikasi');
            }
        });
        return () => subscription.remove();
    }, []);

    useEffect(() => {
        if (secondsLeft <= 0) return;
        const timerInterval = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
        return () => clearInterval(timerInterval);
    }, [secondsLeft]);

    // Helper untuk format jam:menit, contoh "09:15 WIB"
    const formatClock = (date: Date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes} WIB`;
    };

    // Tambahkan fungsi ini untuk menyimpan data saat submit
    const handleSubmitExam = () => {
    // Hitung jumlah jawaban benar dengan mencocokkan userAnswers ke correctAnswer tiap soal
    const totalQuestions = DUMMY_QUESTIONS.length;
    const correctCount = DUMMY_QUESTIONS.filter(
        (q) => answers[q.id] === q.correctAnswer
    ).length;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const PASSING_SCORE = 60; // Ambang batas kelulusan, bisa disesuaikan

    // Catat waktu selesai & hitung durasi pengerjaan yang sebenarnya
    const finishedTime = new Date();
    const elapsedMs = finishedTime.getTime() - startTime.getTime();
    const elapsedMinutes = Math.max(1, Math.round(elapsedMs / 60000));

    addHistory({
        id: Date.now(),
        title: "National Competency Test",
        date: new Date().toLocaleDateString(),
        status: scorePercentage >= PASSING_SCORE ? 'Passed' : 'Failed',
        startTime: formatClock(startTime),       // Waktu mulai ujian
        finishedTime: formatClock(finishedTime), // Waktu selesai ujian
        duration: `${elapsedMinutes} mins`,      // Durasi asli pengerjaan
        userAnswers: answers,
        questions: DUMMY_QUESTIONS,
        score: scorePercentage,       // Skor dalam persen, misal 80
        correctCount,                 // Jumlah jawaban benar
        totalQuestions                // Total soal
    });
    examFinishedRef.current = true; // Ujian selesai, izinkan navigasi keluar
    setIsModalVisible(false);
    setIsSuccessModalVisible(true);
};

    const formatTime = (totalSeconds: number) => {
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${pad(Math.floor(totalSeconds / 3600))} : ${pad(Math.floor((totalSeconds % 3600) / 60))} : ${pad(totalSeconds % 60)}`;
    };

    const currentQuestion = DUMMY_QUESTIONS[currentQuestionIndex];
    const isAllAnswered = Object.keys(answers).length === DUMMY_QUESTIONS.length;
    const isLastQuestion = currentQuestionIndex === DUMMY_QUESTIONS.length - 1;
    const progressPercentage = Math.round(((currentQuestionIndex + 1) / DUMMY_QUESTIONS.length) * 100);

    const handleNextOrSubmit = () => {
        if (isLastQuestion) setIsModalVisible(true);
        else setCurrentQuestionIndex(currentQuestionIndex + 1);
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) setCurrentQuestionIndex(currentQuestionIndex - 1);
    };

    const handleSelectAnswer = (key: string) => {
        setAnswers({ ...answers, [currentQuestion.id]: key });
    };

    return (
        <SafeAreaView style={styles.container}>
            <RNStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.profileSection}>
                    <Image source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60' }} style={styles.profileImage} />
                    <View style={styles.profileTextContainer}>
                        <Text style={styles.profileName}>Fauzia</Text>
                        <Text style={styles.profileNim}>14523012</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.questionListButton} onPress={() => setIsListModalVisible(true)}>
                    <Text style={styles.questionListText}>Question List</Text>
                    <LayoutGrid color="#61141A" size={24} />
                </TouchableOpacity>
            </View>

            <View style={styles.mainContent}>
                <View style={styles.examProgressCard}>
                    <Text style={styles.examTitle}>National Competency Test</Text>
                    <Text style={styles.questionCountText}>Questions {currentQuestionIndex + 1} of {DUMMY_QUESTIONS.length}</Text>
                    <View style={styles.timerRow}>
                        <Timer color="#FFFFFF" size={20} />
                        <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
                    </View>
                    <View style={styles.progressBarBackground}>
                        <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
                        <Text style={styles.progressPercentText}>{progressPercentage}%</Text>
                    </View>
                </View>

                <View style={styles.questionCard}>
                    <Text style={styles.questionNumberTitle}>Question {currentQuestion.number}</Text>
                    <Text style={styles.questionText}>{currentQuestion.text}</Text>
                    {currentQuestion.options.map((opt) => {
                        const isSelected = answers[currentQuestion.id] === opt.key;
                        return (
                            <TouchableOpacity key={opt.key} style={[styles.optionBox, isSelected && styles.optionBoxSelected]} onPress={() => handleSelectAnswer(opt.key)}>
                                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{opt.key}. {opt.text}</Text>
                            </TouchableOpacity>
                        );
                    })}
                    <View style={styles.navigationRow}>
                        <TouchableOpacity onPress={handlePrev}>
                            <Text style={[styles.navButtonText, currentQuestionIndex === 0 && styles.navButtonDisabled]}>‹ PREV</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleNextOrSubmit}>
                            <Text style={isLastQuestion ? styles.submitButtonText : styles.navButtonText}>
                                {isLastQuestion ? 'SUBMIT' : 'NEXT ›'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.footerContainer}>
                    <Text style={styles.footerSlogan}>One Step Closer to Success!</Text>
                    <Image source={require('../../../assets/images/graduation1.png')} style={styles.footerIllustration} />
                </View>
            </View>

            {/* Modal Konfirmasi */}
            <Modal animationType="fade" transparent={true} visible={isModalVisible}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <AlertTriangle color="#FFD700" size={50} style={{ marginBottom: 15 }} />
                        <Text style={styles.modalTitle}>{isAllAnswered ? "Finish Exam?" : "Incomplete Answers"}</Text>
                        <Text style={styles.modalDescription}>{isAllAnswered ? "Are you sure you want to submit? Changes cannot be undone." : "You must answer all questions before submitting."}</Text>
                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)}><Text style={styles.modalCancelText}>Cancel</Text></TouchableOpacity>
                            {/* Panggil handleSubmitExam di sini */}
                            <TouchableOpacity onPress={handleSubmitExam} disabled={!isAllAnswered}>
                                <Text style={[styles.modalSubmitText, !isAllAnswered && { color: '#666' }]}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal Sukses dan List tetap sama seperti kode asli Anda */}
            <Modal animationType="fade" transparent={true} visible={isSuccessModalVisible}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <CheckCircle color="#00E676" size={60} style={{ marginBottom: 15 }} />
                        <Text style={styles.modalTitle}>Exam Submitted Successfully</Text>
                        <TouchableOpacity onPress={() => router.replace('./')} style={{ marginTop: 20 }}>
                            <Text style={styles.modalSubmitText}>Back to Dashboard</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* (Bagian List Modal Anda di sini) */}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: Platform.OS === 'android' ? 40 : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 12 },
  profileSection: { flexDirection: 'row', alignItems: 'center' },
  profileImage: { width: 40, height: 40, borderRadius: 20 },
  profileTextContainer: { marginLeft: 12 },
  profileName: { fontSize: 16, fontWeight: 'bold', color: '#61141A' },
  profileNim: { fontSize: 14, color: '#61141A', fontWeight: '500' },
  questionListButton: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  questionListText: { fontSize: 16, fontWeight: 'bold', color: '#61141A' },
  mainContent: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between', paddingBottom: 20 },
  examProgressCard: { backgroundColor: '#61141A', borderRadius: 24, padding: 20, marginTop: 10, marginBottom: 20 },
  examTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', textDecorationLine: 'underline' },
  questionCountText: { fontSize: 13, color: '#FFFFFF', opacity: 0.9, marginTop: 14 },
  timerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginVertical: 14 },
  timerText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  progressBarBackground: { height: 14, backgroundColor: '#E5E5E5', borderRadius: 7, justifyContent: 'center' },
  progressBarFill: { height: '100%', backgroundColor: '#00E676', borderRadius: 7 },
  progressPercentText: { position: 'absolute', right: 8, fontSize: 10, fontWeight: 'bold', color: '#61141A' },
  questionCard: { borderWidth: 2, borderColor: '#61141A', borderRadius: 24, padding: 20, backgroundColor: '#FFFFFF' },
  questionNumberTitle: { fontSize: 18, fontWeight: 'bold', color: '#61141A', marginBottom: 16 },
  questionText: { fontSize: 14, color: '#61141A', lineHeight: 20, marginBottom: 20 },
  optionBox: { backgroundColor: '#F3F4F6', borderRadius: 18, paddingVertical: 14, paddingHorizontal: 18, marginBottom: 12 },
  optionBoxSelected: { backgroundColor: '#61141A' },
  optionText: { fontSize: 14, color: '#9CA3AF' },
  optionTextSelected: { color: '#FFFFFF', fontWeight: 'bold' },
  navigationRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  navButtonText: { fontSize: 15, fontWeight: 'bold', color: '#61141A' },
  submitButtonText: { fontSize: 15, fontWeight: 'bold', color: '#00E676' },
  navButtonDisabled: { opacity: 0.3 },
  footerContainer: { flexDirection: 'row', alignItems: 'flex-end', height: 110, marginTop: 10 },
  footerSlogan: { fontSize: 14, color: '#61141A', fontWeight: '600', opacity: 0.4, flex: 1 },
  footerIllustration: { width: 150, height: 120, position: 'absolute', right: -24, bottom: -20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#61141A', width: '85%', borderRadius: 24, padding: 30, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 15, textAlign: 'center' },
  modalDescription: { fontSize: 14, color: '#FFFFFF', textAlign: 'center', marginBottom: 30, opacity: 0.8 },
  modalButtonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20 },
  modalCancelText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  modalSubmitText: { color: '#FFD700', fontSize: 16, fontWeight: 'bold' },
  listModalContent: { backgroundColor: '#A17B7D', width: '90%', borderRadius: 24, padding: 20 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  listTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  closeButton: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  gridBox: { width: 45, height: 45, borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  gridAnswered: { backgroundColor: '#00E676' },
  gridCurrent: { backgroundColor: '#2196F3', borderWidth: 2, borderColor: '#FFFFFF' },
  gridUnanswered: { backgroundColor: '#FFFFFF' },
  gridText: { fontWeight: 'bold', color: '#61141A' },
  legendContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 25 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
});