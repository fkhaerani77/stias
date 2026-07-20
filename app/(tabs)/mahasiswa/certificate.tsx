import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { Award, ChevronLeft, Download } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useExam } from '../../context/ExamContext';
import { useAuth } from '../../context/AuthContext'; // sesuaikan path-nya

// ============================================================
// DATA YANG BISA KAMU SESUAIKAN SENDIRI DI SINI
// ============================================================
// CATATAN: Data kandidat (nama, NIM, prodi) SEKARANG diambil otomatis
// dari akun yang sedang login lewat useAuth() -> profile.
// Object CANDIDATE hardcode yang lama sudah dihapus supaya tidak
// selalu menampilkan "Fauzia Khaerani" untuk semua mahasiswa.

// Data institusi
const INSTITUTION = {
  line1: 'SEKOLAH TINGGI ILMU KOMPUTER',
  line2: 'POLITEKNIK CIREBON',
  address: 'Jl. Sriwijaya No. 1, Kedawung, Kab. Cirebon, Jawa Barat',
};

// Data penandatangan — GANTI nama & NIP sesuai data asli kampus kamu
const REKTOR = {
  label: 'Rektor',
  name: '[Nama Rektor]',
  nip: 'NIP. -',
};

const PUKET_1 = {
  label: 'Pembantu Ketua I',
  name: '[Nama Pembantu Ketua I]',
  nip: 'NIP. -',
};

// ============================================================

// Tipe data kandidat yang sekarang diambil dari profile user yang login
type Candidate = {
  name: string;
  nim: string;
  prodi: string;
};

// Template HTML sertifikat. Semua styling inline karena expo-print merender lewat WebView/PDF engine.
// `candidate` sekarang jadi parameter, bukan variabel global lagi.
function buildCertificateHtml(
  item: any,
  candidate: Candidate,
  logos: { stikom: string | null; merdeka: string | null }
) {
  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          @page { size: A4 landscape; margin: 0; }
          body {
            margin: 0;
            padding: 0;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background: #FFFFFF;
          }
          .outerFrame {
            box-sizing: border-box;
            width: 100%;
            height: 100vh;
            padding: 14px;
            background: #FFFFFF;
          }
          .frame {
            box-sizing: border-box;
            width: 100%;
            height: 100%;
            border: 6px solid #61141A;
            padding: 8px;
          }
          .innerFrame {
            box-sizing: border-box;
            width: 100%;
            height: 100%;
            border: 1.5px solid #C9A227;
            padding: 30px 50px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            text-align: center;
          }
          .headerRow {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 6px;
          }
          .logo {
            width: 80px;
            height: 80px;
            object-fit: contain;
          }
          .headerCenter {
            flex: 1;
            padding: 0 12px;
          }
          .instName1 {
            color: #61141A;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 0.5px;
            margin: 0;
          }
          .instName2 {
            color: #61141A;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 0.5px;
            margin: 2px 0 0 0;
          }
          .instAddress {
            color: #333;
            font-size: 14px;
            margin-top: 4px;
          }
          .divider {
            width: 100%;
            border-top: 2px solid #61141A;
            margin: 10px 0 18px 0;
          }
          .title {
            color: #61141A;
            font-size: 28px;
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 4px;
          }
          .subtitle {
            color: #61141A;
            font-size: 15px;
            font-style: italic;
            margin-bottom: 18px;
          }
          .presented {
            font-size: 13px;
            color: #333;
            margin-bottom: 10px;
          }
          .name {
            font-size: 30px;
            color: #61141A;
            font-weight: bold;
            margin-bottom: 6px;
          }
          .nimProdi {
            font-size: 13px;
            color: #444;
            margin-bottom: 18px;
          }
          .description {
            font-size: 13.5px;
            color: #333;
            max-width: 600px;
            line-height: 1.7;
            margin-bottom: 14px;
          }
          .examTitle {
            color: #61141A;
            font-weight: bold;
          }
          .scoreBadge {
            display: inline-block;
            border: 2px solid #61141A;
            border-radius: 10px;
            padding: 8px 26px;
            margin-bottom: 26px;
          }
          .scoreLabel {
            font-size: 10.5px;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .scoreValue {
            font-size: 22px;
            color: #61141A;
            font-weight: bold;
            margin-top: 2px;
          }
          .footerRow {
            display: flex;
            justify-content: space-between;
            width: 100%;
            max-width: 560px;
            margin-top: auto;
          }
          .footerCol {
            text-align: center;
            font-size: 12px;
            color: #333;
            width: 45%;
          }
          .footerDate {
            margin-bottom: 4px;
          }
          .signatureLabel {
            margin-bottom: 55px;
          }
          .line {
            border-top: 1px solid #61141A;
            width: 170px;
            margin: 0 auto 6px;
          }
          .signName {
            font-weight: bold;
            color: #333;
          }
        </style>
      </head>
      <body>
        <div class="outerFrame">
          <div class="frame">
            <div class="innerFrame">

              <div class="headerRow">
                ${logos.stikom ? `<img class="logo" src="${logos.stikom}" />` : `<div style="width:64px"></div>`}
                <div class="headerCenter">
                  <p class="instName1">${INSTITUTION.line1}</p>
                  <p class="instName2">${INSTITUTION.line2}</p>
                  <p class="instAddress">${INSTITUTION.address}</p>
                </div>
                ${logos.merdeka ? `<img class="logo" src="${logos.merdeka}" />` : `<div style="width:64px"></div>`}
              </div>

              <div class="divider"></div>

              <div class="title">SERTIFIKAT KOMPETENSI</div>
              <div class="subtitle">Certificate of Competency</div>

              <div class="presented">Dengan ini menyatakan bahwa</div>
              <div class="name">${candidate.name}</div>
              <div class="nimProdi">NIM ${candidate.nim} &middot; Program Studi ${candidate.prodi}</div>

              <div class="description">
                Telah dinyatakan <b>LULUS</b> mengikuti <span class="examTitle">${item.title}</span>
                yang diselenggarakan pada ${item.date}, dan diakui telah memiliki kompetensi
                sebagaimana tercantum dalam sertifikat ini.
              </div>

              <div class="scoreBadge">
                <div class="scoreLabel">Score</div>
                <div class="scoreValue">${item.score ?? '-'}%</div>
              </div>

              <div class="footerRow">
                <div class="footerCol">
                  <div class="footerDate">Cirebon, ${item.date}</div>
                  <div class="signatureLabel">${REKTOR.label},</div>
                  <div class="line"></div>
                  <div class="signName">${REKTOR.name}</div>
                  <div>${REKTOR.nip}</div>
                </div>
                <div class="footerCol">
                  <div class="footerDate">&nbsp;</div>
                  <div class="signatureLabel">${PUKET_1.label},</div>
                  <div class="line"></div>
                  <div class="signName">${PUKET_1.name}</div>
                  <div>${PUKET_1.nip}</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

export default function CertificateScreen() {
  const router = useRouter();
  const { history } = useExam();
  const { profile } = useAuth(); // data user yang sedang login (name, nim, prodi, dll)
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const logosRef = useRef<{ stikom: string | null; merdeka: string | null }>({ stikom: null, merdeka: null });

  // Convert kedua logo jadi base64 sekali saat layar dibuka
  useEffect(() => {
    const loadLogos = async () => {
      try {
        const stikomAsset = Asset.fromModule(require('../../../assets/images/logo-stikom-merah.png'));
        await stikomAsset.downloadAsync();
        if (stikomAsset.localUri) {
          const base64 = await FileSystem.readAsStringAsync(stikomAsset.localUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          logosRef.current.stikom = `data:image/png;base64,${base64}`;
        }
      } catch (err) {
        console.log('Gagal load logo STIKOM:', err);
      }

      try {
        const merdekaAsset = Asset.fromModule(require('../../../assets/images/logo-kampus-merdeka.png'));
        await merdekaAsset.downloadAsync();
        if (merdekaAsset.localUri) {
          const base64 = await FileSystem.readAsStringAsync(merdekaAsset.localUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          logosRef.current.merdeka = `data:image/png;base64,${base64}`;
        }
      } catch (err) {
        console.log('Gagal load logo Kampus Merdeka:', err);
      }
    };
    loadLogos();
  }, []);

  // Hanya tampilkan ujian yang lulus (Passed) sebagai kandidat sertifikat
  const passedExams = (history || []).filter((item: any) => item.status === 'Passed');

  const handleDownload = async (item: any) => {
    try {
      setGeneratingId(item.id);

      // Data kandidat sekarang diambil dari akun yang sedang login,
      // bukan dari object CANDIDATE hardcode lagi.
      const candidate: Candidate = {
        name: profile?.name ?? '-',
        nim: profile?.nim ?? '-',
        prodi: profile?.prodi ?? '-',
      };

      const html = buildCertificateHtml(item, candidate, logosRef.current);
      const { uri } = await Print.printToFileAsync({ html, base64: false });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Certificate - ${item.title}`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Sertifikat Dibuat', `File tersimpan di:\n${uri}`);
      }
    } catch (err) {
      Alert.alert('Gagal', 'Terjadi kesalahan saat membuat sertifikat. Coba lagi.');
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color="#61141A" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Certificate</Text>
      </View>

      <FlatList
        style={{ flex: 1 }}
        data={passedExams}
        contentContainerStyle={styles.listContainer}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTopRow}>
              <Award color="#FFD700" size={28} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardMeta}>{item.date} · Score {item.score}%</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => handleDownload(item)}
              disabled={generatingId === item.id}
            >
              {generatingId === item.id ? (
                <ActivityIndicator color="#61141A" size="small" />
              ) : (
                <>
                  <Download color="#61141A" size={16} />
                  <Text style={styles.downloadText}>Download / Share PDF</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 50, color: '#61141A' }}>
            Belum ada sertifikat. Lulus ujian dulu ya!
          </Text>
        }
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>One Step Closer to Success!</Text>
        <Image source={require('../../../assets/images/graduation1.png')} style={styles.footerIllustration} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, marginTop: 40, justifyContent: 'center' },
  backButton: { position: 'absolute', left: 24, padding: 6 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#61141A' },
  listContainer: { paddingHorizontal: 24 },
  card: { backgroundColor: '#61141A', borderRadius: 20, padding: 18, marginBottom: 16 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  cardTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  cardMeta: { color: '#F3EFEF', fontSize: 12, opacity: 0.85, marginTop: 2 },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFD700',
    borderRadius: 14,
    paddingVertical: 10,
  },
  downloadText: { color: '#61141A', fontSize: 13, fontWeight: 'bold' },
  footer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginHorizontal: 24, marginBottom: 20, height: 110 },
  footerText: { fontSize: 14, color: '#61141A', fontWeight: '600', opacity: 0.4, flex: 1 },
  footerIllustration: { width: 150, height: 120, position: 'absolute', right: -10, bottom: -20 },
});
