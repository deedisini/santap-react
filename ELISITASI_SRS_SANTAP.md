# Elisitasi Kebutuhan dan SRS SANTAP

Dokumen ini melengkapi Penilaian 2 dan Penilaian 3 untuk SANTAP. Bukti elisitasi berasal dari artefak awal **KINTARA SRS versi 1.0**. KINTARA adalah nama kerja awal sistem Dining Hall yang kemudian dilanjutkan dan diberi nama SANTAP. Nama lama dipertahankan pada bukti sumber agar riwayatnya tidak dipalsukan.

## 2.1 Bukti dua teknik elisitasi

| Teknik | Narasumber representatif | Bukti | Status |
|---|---|---|---|
| Wawancara semi-terstruktur | Rafael Soriton, mahasiswa Asrama Crystal | User story US-01 dan kebutuhan QR, barcode, serta NIM manual pada KINTARA SRS v1.0 | Terdokumentasi |
| Wawancara semi-terstruktur | Mrs. Mega Mawu, Supervisor Dining Hall | User story US-02 dan kebutuhan monitoring/reminder pada KINTARA SRS v1.0 | Terdokumentasi |
| Wawancara semi-terstruktur | Julian Tendean, mahasiswa Asrama Crystal | User story US-03 dan kebutuhan antrean pada KINTARA SRS v1.0 | Terdokumentasi |
| Observasi proses layanan | Staff Dining Hall dan mahasiswa saat periode makan | Catatan alur, tanggal/lokasi, dan foto tanpa data pribadi | Masih perlu jika dosen menuntut dua teknik berbeda |

> Tiga wawancara di atas adalah bukti nyata. Namun semuanya memakai teknik yang sama. Jika dosen menafsirkan “minimal dua teknik” sebagai dua jenis teknik berbeda, tim perlu melengkapi observasi atau kuesioner singkat.

## 2.2 Instrumen wawancara dan dokumentasi jawaban

**Identitas kegiatan sumber:**

- Teknik: Wawancara semi-terstruktur
- Dokumen sumber: KINTARA SRS versi 1.0
- Narasumber: Rafael Soriton (Mahasiswa), Mrs. Mega Mawu (Supervisor Dining Hall), Julian Tendean (Mahasiswa)
- Tanggal/waktu wawancara dan nama pewawancara: belum tertulis pada artefak sumber; tambahkan bila catatan asli tersedia.
- Bentuk jawaban berikut: parafrasa kebutuhan dari user story dan requirement, bukan kutipan kata-per-kata.

| No. | Pertanyaan | Jawaban terdokumentasi/parafrasa | Sumber dan temuan yang dihasilkan |
|---|---|---|---|
| 1 | Bagaimana mahasiswa dapat diidentifikasi saat mengambil makanan? | Mahasiswa membutuhkan QR sebagai identitas dan alternatif barcode kartu atau input NIM/nomor registrasi. | Rafael, US-01; dasar FR-05 sampai FR-07. |
| 2 | Mengapa input NIM manual diperlukan? | Input manual diperlukan ketika pemindaian/perangkat mengalami kendala, termasuk kondisi jaringan/perangkat yang kurang mendukung. | Rafael, US-01; dasar FR-07 dan NFR-03. |
| 3 | Informasi apa yang dibutuhkan mahasiswa tentang antrean? | Sistem perlu mendukung antrean agar urutan pelayanan dapat dikelola lebih teratur. | Julian, US-03; dasar FR-12 dan FR-13. |
| 4 | Apa hasil minimal dari pengelolaan antrean? | Sistem harus merepresentasikan mahasiswa yang mengantre, mengetahui urutan, dan memperbarui status setelah layanan. | Julian, acceptance criteria antrean; dasar FR-12 dan FR-13. |
| 5 | Informasi apa yang dibutuhkan supervisor untuk memantau layanan? | Supervisor membutuhkan jumlah mahasiswa yang menggunakan Dining Hall per periode. | Mrs. Mega, US-02; dasar FR-14. |
| 6 | Apakah status asrama relevan untuk monitoring? | Ya. Supervisor perlu membedakan penghuni dan non-penghuni asrama dalam monitoring. | Mrs. Mega, US-02; dasar FR-03, FR-14, dan BR-02. |
| 7 | Apa kebutuhan supervisor menjelang akhir periode makan? | Supervisor membutuhkan pengingat ketika periode makan mendekati waktu penutupan. | Mrs. Mega, US-02; dasar FR-16. |
| 8 | Apa yang harus diperiksa sebelum pencatatan pengambilan? | Identitas, status pengguna, periode aktif, dan riwayat pengambilan perlu diperiksa. | KINTARA SRS v1.0, UC-04; dasar FR-08 sampai FR-10. |
| 9 | Apa tindakan sistem jika mahasiswa telah mengambil pada periode yang sama? | Sistem harus menolak pencatatan kedua untuk mencegah pengambilan ganda. | KINTARA SRS v1.0, FR-14 dan AC-06; dasar FR-10 dan BR-04. |
| 10 | Mengapa proses utama perlu ringkas? | Jaringan kampus dapat lambat; proses identifikasi dan pencatatan harus sederhana serta efisien. | KINTARA SRS v1.0, batasan sistem; dasar NFR-01 sampai NFR-03. |

## Keputusan perubahan KINTARA menjadi SANTAP

| Artefak KINTARA v1.0 | Keputusan pada SANTAP | Alasan |
|---|---|---|
| Nama sistem KINTARA | Diubah menjadi SANTAP | Nama proyek versi lanjutan. |
| Informasi menu | Dikeluarkan dari scope | Bukan prioritas operasional pada versi SANTAP saat ini. |
| Mahasiswa, Staff, Supervisor | Dipertahankan | Tetap merupakan aktor inti hasil elisitasi. |
| Head dan Admin | Ditambahkan | Mendukung pengawasan dan kelengkapan profil/role. |
| QR, barcode/NIM manual, validasi, antrean, monitoring, reminder | Dipertahankan/disempurnakan | Konsisten dengan kebutuhan yang terdokumentasi. |

## 2.3 Kebutuhan fungsional dan prioritas MoSCoW

| ID | Kebutuhan yang dapat diuji | Sumber elisitasi | Prioritas |
|---|---|---|---|
| FR-01 | Sistem harus mengautentikasi pengguna sebelum membuka dashboard. | Q1, Q9 | Must |
| FR-02 | Sistem harus menampilkan dashboard sesuai role Mahasiswa, Staff, Supervisor, Head, atau Admin. | Q8, Q9 | Must |
| FR-03 | Sistem harus menyimpan profil mahasiswa dengan NIM, nama, email, fakultas, dan status asrama. | Q3, Q5, Q9 | Must |
| FR-04 | Admin harus dapat membuat atau memperbarui profil mahasiswa, termasuk status penghuni/non-penghuni. | Q5, Q9 | Must |
| FR-05 | Mahasiswa harus dapat menampilkan QR identitas setelah login. | Q1, Q6 | Should |
| FR-06 | Staff harus dapat mengidentifikasi mahasiswa melalui QR/kamera. | Q1, Q6 | Must |
| FR-07 | Staff harus dapat memasukkan NIM secara manual jika pemindaian tidak tersedia atau gagal. | Q6, Q7 | Must |
| FR-08 | Sistem harus menolak pengambilan jika NIM tidak terdaftar atau profil tidak lengkap. | Q3, Q9 | Must |
| FR-09 | Sistem harus menolak pengambilan jika periode makan tidak aktif. | Q10 | Must |
| FR-10 | Sistem harus mencegah pengambilan kedua oleh mahasiswa yang sama pada periode dan tanggal yang sama. | Q4 | Must |
| FR-11 | Sistem harus menyimpan catatan pengambilan yang memuat mahasiswa, periode, waktu, dan petugas. | Q3, Q8 | Must |
| FR-12 | Sistem harus menambahkan mahasiswa ke antrean dan menampilkan antrean aktif kepada staff. | Q2 | Should |
| FR-13 | Staff harus dapat mengubah status antrean menjadi selesai atau dibatalkan. | Q1, Q2 | Should |
| FR-14 | Supervisor/Head harus dapat melihat jumlah pengambilan per periode dan status asrama. | Q8 | Should |
| FR-15 | Sistem harus menyimpan hasil scan secara lokal sementara saat koneksi putus dan menyinkronkannya setelah koneksi kembali. | Q7 | Could |
| FR-16 | Sistem dapat mengirim pengingat sebelum periode makan ditutup. | Q8, Q10 | Could |

**Tidak dikerjakan pada iterasi saat ini (Won't):** pembayaran, pengelolaan menu, stok bahan, procurement, resep, keuangan dapur, aplikasi mobile native, prediksi waktu antrean, dan integrasi penuh ERP/akademik.

## 2.4 Kebutuhan nonfungsional

| ID | Kategori | Kebutuhan yang dapat diuji |
|---|---|---|
| NFR-01 | Kinerja | Sistem harus menampilkan hasil validasi identitas dalam maksimal 3 detik pada koneksi kampus normal. |
| NFR-02 | Keamanan | Dashboard dan API harus menolak akses tanpa autentikasi; fitur dibatasi berdasarkan role. |
| NFR-03 | Kegunaan | Staff harus dapat menyelesaikan identifikasi menggunakan QR atau NIM manual tanpa membuka halaman lain. |
| NFR-04 | Keandalan | Sistem harus mencegah catatan pengambilan ganda untuk kombinasi NIM, periode, dan tanggal yang sama. |
| NFR-05 | Integritas data | Setiap catatan pengambilan harus terkait dengan NIM dan periode makan yang valid. |
| NFR-06 | Ketersediaan | Saat jaringan tidak tersedia, hasil scan dapat disimpan lokal sementara dan diberi status belum tersinkron. |
| NFR-07 | Privasi | Data profil mahasiswa hanya dapat dibaca/diubah oleh role yang berwenang. |

## 2.5 Kualitas penulisan kebutuhan

Setiap FR/NFR ditulis sebagai satu pernyataan, menggunakan kata **harus**, subjek yang jelas, dan kondisi yang dapat diuji. Contoh uji FR-10: buat dua permintaan pengambilan untuk NIM dan periode yang sama pada tanggal yang sama; permintaan kedua harus ditolak dan tidak boleh membuat catatan baru.

## 2.6 Dasar penentuan prioritas

Prioritas Must mencakup proses layanan yang tidak boleh gagal: autentikasi, profil, identifikasi cadangan, periode aktif, pencegahan duplikasi, dan pencatatan. Should meningkatkan kelancaran operasi. Could menambah ketahanan/kenyamanan setelah proses inti stabil. Won't dikeluarkan dari iterasi proyek agar scope tetap realistis.

## 2.7 Aturan bisnis

| ID | Aturan bisnis |
|---|---|
| BR-01 | Dining Hall memiliki tiga periode: Pagi 05.30-07.00, Siang 11.30-13.30, dan Malam 17.30-19.00. |
| BR-02 | Setiap mahasiswa harus memiliki NIM unik dan status asrama sebelum dapat dilayani. |
| BR-03 | Pengambilan hanya dapat dilakukan pada periode yang berstatus aktif. |
| BR-04 | Seorang mahasiswa hanya boleh memiliki satu catatan pengambilan untuk periode yang sama pada tanggal yang sama. |
| BR-05 | Staff dapat memakai QR/kamera atau NIM manual sebagai metode identifikasi alternatif. |
| BR-06 | Hanya Admin yang dapat mengubah profil dan status asrama mahasiswa. |
| BR-07 | Catatan pengambilan harus menyimpan identitas petugas yang memvalidasi. |
| BR-08 | Antrean berstatus waiting, completed, atau cancelled. |
| BR-09 | Data yang tersimpan lokal saat offline harus ditandai belum tersinkron dan tidak boleh dianggap catatan final sebelum unggahan berhasil. |

## 2.8 SRS bagian 1 sampai 3

### 1 Pendahuluan dan overview

SANTAP adalah sistem web untuk membantu proses antrean dan pencatatan aktivitas pengambilan makanan mahasiswa di Fern Wallace Dining Hall. Pengguna utama terdiri dari Mahasiswa, Staff, Supervisor, Head, dan Admin. Fokus versi ini adalah layanan makan, bukan pengelolaan dapur atau pembayaran.

### 2 Sistem saat ini atau as-is

Proses membutuhkan verifikasi identitas, pemeriksaan hak/status mahasiswa, dan pencatatan pengambilan pada waktu pelayanan yang padat. Risiko utama adalah pencatatan tidak seragam, pengambilan ganda, antrean tidak terpantau, dan hambatan saat kamera/jaringan tidak tersedia. Sistem menyediakan QR sebagai metode utama serta NIM manual sebagai fallback.

### 3 Dependensi dan batasan

| Jenis | Isi |
|---|---|
| Dependensi | Data profil mahasiswa dan role di Firebase/Firestore; koneksi internet untuk sinkronisasi; kamera/webcam untuk scan QR; database MySQL/MariaDB untuk demonstrasi relasional. |
| Batasan operasional | Layanan hanya dalam jadwal periode makan; perangkat staff dan jaringan dapat terbatas; staf membutuhkan alur singkat. |
| Batasan scope | Tidak menangani menu, pembayaran, stok, procurement, resep, atau keuangan. |
| Asumsi yang harus divalidasi | Hak makan untuk penghuni/non-penghuni, kebijakan pengecualian, volume puncak, serta prosedur offline. |

## 2.9 Analisis kelayakan singkat

| Aspek | Penilaian | Dasar |
|---|---|---|
| Teknis | Layak dengan risiko sedang | React/Firebase mendukung aplikasi web dan autentikasi; QR scanner serta input NIM tersedia. Perlu uji kamera, jaringan, dan sinkronisasi offline. |
| Ekonomi | Layak untuk prototype | Memakai perangkat kampus/mahasiswa yang tersedia serta layanan pengembangan yang berbiaya rendah. Biaya produksi harus dihitung lagi bila memerlukan banyak scanner atau perangkat khusus. |
| Operasional | Layak dengan pelatihan singkat | Staff memperoleh alur sederhana; kebijakan role, data profil, dan SOP pengecualian perlu disepakati pengelola. |

## 2.10 Sheet kebutuhan untuk Lembar Kerja Proyek

Salin tabel FR dan NFR di atas ke sheet kebutuhan dengan kolom minimal: `ID`, `Jenis`, `Pernyataan kebutuhan`, `Sumber`, `Prioritas MoSCoW`, `Kriteria uji`, `Status`, dan `Catatan`.

## 3.1 sampai 3.9 Checklist pemodelan perilaku

| Butir | Bukti yang disiapkan |
|---|---|
| 3.1-3.3 | `SANTAP_USE_CASE.puml`: lima aktor, system boundary, lebih dari enam use case, dan relasi include/extend. |
| 3.4 | Enam use case description di bawah. |
| 3.5-3.7 | Tiga activity diagram berswimlane: antrean, proses pengambilan, dan pengelolaan profil. |
| 3.8 | Matriks keterlacakan pada bagian akhir. |
| 3.9 | Diagram dibuat dengan PlantUML dan dapat dirender ulang. |

## 3.4 Use case description

### UC-01 Login

- Aktor: semua role.
- Prakondisi: pengguna memiliki akun aktif.
- Pascakondisi: dashboard sesuai role tampil.
- Alur utama: pengguna memasukkan kredensial; sistem mengautentikasi; sistem memuat profil/role; sistem membuka dashboard.
- Alternatif: kredensial salah atau profil belum lengkap; sistem menolak login operasional dan memberi pesan.

### UC-02 Tampilkan QR Identitas

- Aktor: Mahasiswa.
- Prakondisi: mahasiswa sudah login dan profil memiliki NIM.
- Pascakondisi: QR identitas tampil.
- Alur utama: mahasiswa membuka dashboard; sistem membangkitkan/menampilkan QR untuk NIM; mahasiswa memperlihatkan QR kepada staff.
- Alternatif: profil tanpa NIM; sistem meminta admin melengkapi profil.

### UC-03 Masuk Antrean

- Aktor: Mahasiswa.
- Prakondisi: sudah login, profil lengkap, dan periode aktif.
- Pascakondisi: entri antrean waiting tercatat.
- Alur utama: mahasiswa memilih masuk antrean; sistem memeriksa NIM dan periode; sistem membuat entri waiting; sistem menampilkan status.
- Alternatif: periode tidak aktif atau sudah ada antrean waiting; sistem menolak dan menjelaskan alasan.

### UC-04 Proses Pengambilan Makanan

- Aktor: Staff.
- Prakondisi: staff login dan periode aktif.
- Pascakondisi: catatan makan valid tersimpan dan antrean terkait diperbarui.
- Alur utama: staff scan QR atau memasukkan NIM; sistem memvalidasi profil, periode, dan duplikasi; staff mengonfirmasi; sistem menyimpan catatan dan menandai antrean completed.
- Alternatif: QR gagal dibaca, gunakan NIM manual; NIM tidak valid/profil tidak lengkap/periode tutup/sudah mengambil, sistem menolak tanpa menyimpan catatan.

### UC-05 Monitor Operasional

- Aktor: Supervisor dan Head.
- Prakondisi: aktor login.
- Pascakondisi: ringkasan periode dan pengambilan tampil.
- Alur utama: aktor membuka dashboard; sistem menghitung catatan per periode dan status asrama; sistem menampilkan ringkasan.
- Alternatif: belum ada data; sistem menampilkan nilai nol, bukan kesalahan.

### UC-06 Kelola Profil Mahasiswa

- Aktor: Admin.
- Prakondisi: admin login.
- Pascakondisi: profil mahasiswa baru/terbarui tersimpan.
- Alur utama: admin memasukkan NIM dan data profil; admin memilih status asrama; sistem memvalidasi kelengkapan; sistem menyimpan perubahan.
- Alternatif: NIM duplikat atau email tidak valid; sistem menolak dan meminta perbaikan.

## 3.8 Matriks keterlacakan

| Kebutuhan | Use case | Activity diagram |
|---|---|---|
| FR-01, FR-02 | UC-01 Login | - |
| FR-03, FR-04 | UC-06 Kelola Profil Mahasiswa | `SANTAP_ACTIVITY_PROFILE.puml` |
| FR-05 | UC-02 Tampilkan QR Identitas | - |
| FR-06 sampai FR-11 | UC-04 Proses Pengambilan Makanan | `SANTAP_ACTIVITY_MEAL_SERVICE.puml` |
| FR-12, FR-13 | UC-03 Masuk Antrean | `SANTAP_ACTIVITY_QUEUE.puml` |
| FR-14, FR-16 | UC-05 Monitor Operasional | - |
| FR-15, NFR-06, BR-09 | UC-04 Proses Pengambilan Makanan | `SANTAP_ACTIVITY_MEAL_SERVICE.puml` |
