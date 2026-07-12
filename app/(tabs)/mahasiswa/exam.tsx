import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
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
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { useExam } from '../../context/ExamContext';

export default function ExamScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
    const { addHistory, addViolation, categories, getQuestionsForCategory } = useExam();
    const { user, profile } = useAuth();
    const category = categories.find((c: any) => c.id === categoryId);
    // Soal sungguhan dari kategori ini — bukan DUMMY_QUESTIONS lagi
    const QUESTIONS = category ? getQuestionsForCategory(category.id) : [];

    const [isListModalVisible, setIsListModalVisible] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [secondsLeft, setSecondsLeft] = useState<number>((category?.duration || 90) * 60);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
    const [startTime] = useState<Date>(() => new Date());
    const examFinishedRef = useRef(false);

    const logViolation = (type: string) => {
        addViolation({
            id: Date.now() + Math.random(),
            examTitle: category?.title || 'Unknown Exam',
            type,
            timestamp: new Date().toLocaleString('id-ID'),
        });
    };

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (examFinishedRef.current) return false;
            logViolation('Menekan Tombol Back');
            Alert.alert('Tidak Diizinkan', 'Anda tidak dapat keluar dari ujian sebelum submit.');
            return true;
        });
        return () => backHandler.remove();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
            if (examFinishedRef.current) return;
            e.preventDefault();
            logViolation('Mencoba Meninggalkan Layar Ujian');
            Alert.alert('Tidak Diizinkan', 'Anda tidak dapat meninggalkan layar ujian sebelum submit.');
        });
        return unsubscribe;
    }, [navigation]);

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

    const formatClock = (date: Date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes} WIB`;
    };

    const handleSubmitExam = async () => {
        const totalQuestions = QUESTIONS.length;
        const correctCount = QUESTIONS.filter(
            (q: any) => answers[q.id] === q.correctAnswer
        ).length;
        const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
        const PASSING_SCORE = 60;

        const finishedTime = new Date();
        const elapsedMs = finishedTime.getTime() - startTime.getTime();
        const elapsedMinutes = Math.max(1, Math.round(elapsedMs / 60000));
        const finalStatus = scorePercentage >= PASSING_SCORE ? 'Passed' : 'Failed';
        const examDate = new Date().toLocaleDateString();

        // 1. Simpan ke state lokal seperti biasa
        addHistory({
            id: Date.now(),
            categoryId: category?.id,
            title: category?.title || 'Unknown Exam',
            date: examDate,
            status: finalStatus,
            startTime: formatClock(startTime),
            finishedTime: formatClock(finishedTime),
            duration: `${elapsedMinutes} mins`,
            userAnswers: answers,
            questions: QUESTIONS,
            score: scorePercentage,
            correctCount,
            totalQuestions
        });

        // 2. Simpan juga ke Firestore — supaya admin bisa lihat lintas mahasiswa
        if (user) {
            try {
                await addDoc(collection(db, 'examResults'), {
                    studentId: user.uid,
                    studentName: profile?.name || '-',
                    nim: profile?.nim || '-',
                    kelas: profile?.kelas || '-',
                    prodi: profile?.prodi || '-',
                    categoryId: category?.id || null,
                    categoryTitle: category?.title || 'Unknown Exam',
                    date: examDate,
                    timestamp: Date.now(),
                    status: finalStatus,
                    score: scorePercentage,
                    correctCount,
                    totalQuestions,
                });
            } catch (err) {
                console.error('Gagal menyimpan hasil ujian ke Firestore:', err);
            }
        }

        examFinishedRef.current = true;
        setIsModalVisible(false);
        setIsSuccessModalVisible(true);
    };

    const formatTime = (totalSeconds: number) => {
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${pad(Math.floor(totalSeconds / 3600))} : ${pad(Math.floor((totalSeconds % 3600) / 60))} : ${pad(totalSeconds % 60)}`;
    };

    // Guard: kalau kategori tidak ditemukan atau tidak ada soal, jangan render layar ujian
    if (!category || QUESTIONS.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
                    <Text style={{ color: '#61141A', textAlign: 'center', marginBottom: 16 }}>
                        Ujian tidak tersedia atau belum ada soal untuk kategori ini.
                    </Text>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={{ color: '#61141A', fontWeight: 'bold' }}>Kembali</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const currentQuestion = QUESTIONS[currentQuestionIndex];
    const isAllAnswered = Object.keys(answers).length === QUESTIONS.length;
    const isLastQuestion = currentQuestionIndex === QUESTIONS.length - 1;
    const progressPercentage = Math.round(((currentQuestionIndex + 1) / QUESTIONS.length) * 100);

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

    const handleJumpToQuestion = (index: number) => {
        setCurrentQuestionIndex(index);
        setIsListModalVisible(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <RNStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

            <View style={styles.header}>
                <View style={styles.profileSection}>
                <Image source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60' }} style={styles.profileImage} />
                <View style={styles.profileTextContainer}>
                    <Text style={styles.profileName}>{profile?.name || 'Mahasiswa'}</Text>
                    <Text style={styles.profileNim}>{profile?.nim || ''}</Text>
                </View>
            </View>
                <TouchableOpacity style={styles.questionListButton} onPress={() => setIsListModalVisible(true)}>
                    <Text style={styles.questionListText}>Question List</Text>
                    <LayoutGrid color="#61141A" size={24} />
                </TouchableOpacity>
            </View>

            <View style={styles.mainContent}>
                <View style={styles.examProgressCard}>
                    <Text style={styles.examTitle}>{category.title}</Text>
                    <Text style={styles.questionCountText}>Questions {currentQuestionIndex + 1} of {QUESTIONS.length}</Text>
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
                    <Text style={styles.questionNumberTitle}>Question {currentQuestionIndex + 1}</Text>
                    <Text style={styles.questionText}>{currentQuestion.text}</Text>
                    {currentQuestion.options.map((opt: any) => {
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

            <Modal animationType="fade" transparent={true} visible={isModalVisible}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <AlertTriangle color="#FFD700" size={50} style={{ marginBottom: 15 }} />
                        <Text style={styles.modalTitle}>{isAllAnswered ? "Finish Exam?" : "Incomplete Answers"}</Text>
                        <Text style={styles.modalDescription}>{isAllAnswered ? "Are you sure you want to submit? Changes cannot be undone." : "You must answer all questions before submitting."}</Text>
                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)}><Text style={styles.modalCancelText}>Cancel</Text></TouchableOpacity>
                            <TouchableOpacity onPress={handleSubmitExam} disabled={!isAllAnswered}>
                                <Text style={[styles.modalSubmitText, !isAllAnswered && { color: '#666' }]}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal animationType="fade" transparent={true} visible={isSuccessModalVisible}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <CheckCircle color="#00E676" size={60} style={{ marginBottom: 15 }} />
                        <Text style={styles.modalTitle}>Exam Submitted Successfully</Text>
                        <TouchableOpacity onPress={() => router.replace('/mahasiswa' as any)} style={{ marginTop: 20 }}>
                            <Text style={styles.modalSubmitText}>Back to Dashboard</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="fade"
                transparent={true}
                visible={isListModalVisible}
                onRequestClose={() => setIsListModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.listModalContent}>
                        <View style={styles.listHeader}>
                            <Text style={styles.listTitle}>Question List</Text>
                            <TouchableOpacity onPress={() => setIsListModalVisible(false)}>
                                <Text style={styles.closeButton}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.gridContainer}>
                            {QUESTIONS.map((q: any, index: number) => {
                                const isAnswered = !!answers[q.id];
                                const isCurrent = index === currentQuestionIndex;
                                return (
                                    <TouchableOpacity
                                        key={q.id}
                                        style={[
                                            styles.gridBox,
                                            isCurrent ? styles.gridCurrent : isAnswered ? styles.gridAnswered : styles.gridUnanswered,
                                        ]}
                                        onPress={() => handleJumpToQuestion(index)}
                                    >
                                        <Text style={[styles.gridText, isCurrent && { color: '#FFFFFF' }]}>
                                            {index + 1}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <View style={styles.legendContainer}>
                            <View style={styles.legendItem}>
                                <View style={[styles.dot, { backgroundColor: '#00E676' }]} />
                                <Text style={styles.legendText}>Answered</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.dot, { backgroundColor: '#2196F3' }]} />
                                <Text style={styles.legendText}>Current</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.dot, { backgroundColor: '#FFFFFF' }]} />
                                <Text style={styles.legendText}>Unanswered</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
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