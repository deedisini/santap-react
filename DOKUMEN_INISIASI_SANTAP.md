# Inisiasi Proyek SANTAP dan Model SDLC

## 1.1 Nama sistem, masalah, tujuan, dan manfaat

**SANTAP** adalah Sistem Antrean dan Pencatatan Aktivitas Pengambilan makanan di Fern Wallace Dining Hall, Universitas Klabat. Sistem ini berfokus pada identifikasi mahasiswa, pengaturan antrean, validasi pengambilan makanan, dan pemantauan operasional per periode makan.

### Latar belakang masalah

Pelayanan Dining Hall membutuhkan proses yang cepat dan dapat ditelusuri pada waktu makan yang padat. Jika identitas mahasiswa dan pengambilan makanan dicatat secara manual, petugas sulit memastikan siapa yang sudah dilayani, mencegah pengambilan ganda, mengetahui jumlah pengguna, serta membedakan penghuni dan non-penghuni asrama. Kondisi ini dapat memperpanjang antrean dan menghasilkan data operasional yang tidak konsisten.

### Tujuan

1. Mempercepat identifikasi mahasiswa melalui QR, kamera, atau input NIM.
2. Mencatat pengambilan makanan pada periode Pagi, Siang, atau Malam secara konsisten.
3. Mencegah mahasiswa mengambil makanan dua kali pada periode yang sama.
4. Memberi petugas dan pengawas informasi antrean serta jumlah pengambilan makanan.
5. Menyediakan data yang dapat ditelusuri untuk evaluasi layanan Dining Hall.

### Manfaat

| Pihak | Manfaat |
|---|---|
| Mahasiswa | Proses identifikasi lebih cepat dan status layanan lebih jelas. |
| Staff Dining Hall | Validasi, pencatatan, dan pengelolaan antrean lebih terstruktur. |
| Supervisor dan Head | Dapat memantau jumlah layanan dan status operasional per periode. |
| Administrasi | Memiliki data pengambilan yang rapi untuk pelaporan dan evaluasi. |

## 1.2 Objek nyata dan kelayakan proyek

Objek proyek adalah **layanan pengambilan makanan mahasiswa di Fern Wallace Dining Hall**. Objek ini nyata karena melibatkan mahasiswa, petugas, jadwal makan, antrean, dan catatan pengambilan yang terjadi setiap hari. Fokus SANTAP dibedakan dari sistem kantin atau kasir: tidak menangani pembayaran, menu, stok bahan, resep, procurement, atau keuangan dapur. Persetujuan masalah, prioritas fitur, dan akses narasumber perlu dikonfirmasi kepada dosen serta pengelola Dining Hall sebelum kebutuhan dibekukan.

## 1.3 Stakeholder dan calon pengguna

| Stakeholder atau aktor | Kepentingan | Pengaruh pada sistem |
|---|---|---|
| Mahasiswa | Mendapat layanan makan yang cepat dan sesuai haknya. | Sumber data identitas, antrean, dan pengambilan. |
| Staff Dining Hall | Melayani, memvalidasi, dan mencatat pengambilan dengan cepat. | Pengguna utama proses operasional. |
| Supervisor | Memantau jumlah layanan, status asrama, dan periode makan. | Menentukan kebutuhan monitoring dan laporan. |
| Kepala Dining Hall | Mengawasi operasi serta mengambil keputusan layanan. | Menentukan kebijakan dan prioritas tingkat unit. |
| Admin | Mengelola data akun dan profil pengguna. | Menjaga kelengkapan data dan role. |
| Dosen pengampu | Menilai kesesuaian proses analisis dan rancangan. | Menyetujui arah akademik proyek. |
| Tim pengembang | Menganalisis, membangun, menguji, dan mendokumentasikan sistem. | Mengubah kebutuhan menjadi solusi teknis. |

## 1.4 Kondisi saat ini dan design reality gap ITPOSMO

### Kondisi saat ini atau as-is

Proses layanan membutuhkan verifikasi identitas mahasiswa dan pencatatan pengambilan pada tiga periode makan. Tanpa satu sumber data operasional yang konsisten, pengecekan status asrama, riwayat pengambilan pada periode yang sama, serta jumlah pengguna harus dilakukan secara terpisah atau manual. Saat koneksi atau kamera tidak tersedia, petugas tetap membutuhkan cadangan input NIM.

### Analisis ITPOSMO

| Dimensi | Kondisi as-is | Rancangan SANTAP | Gap dan respons |
|---|---|---|---|
| Information | Data mahasiswa, status asrama, dan pengambilan belum selalu berada dalam tampilan operasional yang sama. | Profil mahasiswa, status asrama, periode makan, antrean, dan catatan pengambilan disimpan terstruktur. | Sedang; admin harus memastikan profil dan NIM lengkap sebelum layanan. |
| Technology | Perangkat staff dapat memiliki kamera/scanner dan koneksi yang bervariasi. | Web React dengan QR scanner, input NIM cadangan, Firebase, serta API MySQL untuk demo relasional. | Sedang; input NIM dan pencatatan lokal sementara menjadi mitigasi gangguan kamera/jaringan. |
| Processes | Validasi pengambilan dan antrean berisiko tidak seragam bila dilakukan manual. | Alur identifikasi, cek periode aktif, cek duplikasi, simpan catatan, lalu perbarui antrean. | Sedang; SOP petugas dan uji skenario diperlukan. |
| Objectives and values | Kecepatan layanan perlu seimbang dengan keakuratan dan keadilan akses. | Sistem memprioritaskan validasi cepat, pencegahan duplikasi, dan keterlacakan. | Rendah-sedang; aturan hak makan dan pengecualian harus disepakati pengelola. |
| Staffing and skills | Tidak semua petugas memiliki kemampuan teknis yang sama. | Antarmuka ringkas dengan pemindaian QR dan input NIM. | Sedang; perlu briefing singkat dan panduan operasional. |
| Management systems and structures | Pengawasan melibatkan staff, supervisor, kepala Dining Hall, dan admin. | Role-based access memisahkan pelayanan, monitoring, pengawasan, dan administrasi. | Sedang; hak akses dan tanggung jawab tiap role perlu disetujui. |
| Other resources | Waktu layanan terbatas, perangkat terbatas, dan jaringan kampus dapat tidak stabil. | Sistem web ringan, data terstruktur, dan rancangan mode offline sementara untuk scan saat gangguan. | Sedang; perlu perangkat cadangan, uji beban, dan jadwal implementasi realistis. |

**Kesimpulan gap:** proyek layak dilanjutkan dengan risiko utama pada kelengkapan data profil, kesiapan petugas, dan keandalan jaringan. Ketiga risiko tersebut menjadi fokus elisitasi dan pengujian awal.

## 1.5 Ruang lingkup

### In scope

- Login dan akses berbasis role: Mahasiswa, Staff, Supervisor, Head, dan Admin.
- Profil mahasiswa dengan NIM dan status penghuni atau non-penghuni asrama.
- Identifikasi melalui QR, kamera/webcam, atau input NIM manual.
- Validasi periode makan aktif dan pencegahan pengambilan ganda.
- Catatan pengambilan makanan dan pengelolaan dasar antrean.
- Monitoring jumlah layanan serta pemisahan data penghuni dan non-penghuni.
- Pengelolaan akun/profil oleh admin.
- Mode penyimpanan lokal sementara untuk hasil scan ketika koneksi terganggu, dengan sinkronisasi setelah koneksi tersedia.

### Out of scope

- Pembayaran, kasir, dan transaksi keuangan.
- Menu makanan, resep, stok bahan, procurement, dan manajemen dapur.
- Integrasi penuh dengan sistem akademik, ERP, atau data kependudukan kampus.
- Estimasi waktu tunggu, notifikasi panggilan antrean, dan analitik prediktif lanjutan.
- Aplikasi mobile native terpisah.

## 1.6 Model SDLC yang dipilih

Model yang dipilih adalah **Agile Iterative Incremental**. Setiap iterasi menghasilkan bagian sistem yang dapat diuji: autentikasi/profil, proses layanan, lalu monitoring dan ketahanan operasional. Pilihan ini sesuai karena kebutuhan SANTAP berubah setelah umpan balik operasional, misalnya metode kamera, status asrama, jadwal sarapan, dan kebutuhan mode offline.

| Model | Kelebihan | Keterbatasan untuk SANTAP | Keputusan |
|---|---|---|---|
| Agile Iterative Incremental | Cepat menerima umpan balik; fitur dapat dikembangkan dan diuji bertahap. | Memerlukan disiplin prioritas dan komunikasi rutin. | Dipilih. |
| Waterfall | Tahapan dan dokumen sangat terstruktur. | Sulit menyesuaikan kebutuhan yang berubah setelah uji layanan. | Tidak dipilih sebagai model utama. |
| Prototyping | Cepat memvalidasi tampilan dan alur dengan pengguna. | Dapat menghasilkan prototype tanpa penguatan data, keamanan, dan pengujian. | Dipakai sebagai teknik pendukung dalam iterasi Agile. |

## 1.7 Rencana kerja tiga minggu

| Minggu | Tahap Agile | Kegiatan utama | Luaran |
|---|---|---|---|
| 1 | Discovery dan perencanaan | Observasi alur as-is, identifikasi stakeholder, wawancara awal, scope, ITPOSMO, user story, dan backlog prioritas. | Dokumen inisiasi, daftar kebutuhan awal, backlog. |
| 2 | Iterasi 1: proses inti | Rancang alur login/profile, data mahasiswa, identifikasi QR/NIM, validasi periode, dan pencatatan pengambilan. Uji skenario normal serta pengambilan ganda. | Prototype proses inti, rancangan data, hasil uji awal. |
| 3 | Iterasi 2: operasi dan evaluasi | Tambah antrean, monitoring, hak akses admin/supervisor/head, mode offline sementara, pengujian integrasi, perbaikan, dan demo. | Prototype terintegrasi, hasil uji, dokumentasi dan demo. |

## 1.8 Rencana elisitasi

### Teknik dan narasumber

| Teknik | Narasumber | Tujuan |
|---|---|---|
| Observasi singkat | Staff Dining Hall dan mahasiswa | Memetakan alur nyata, titik antrean, perangkat, dan hambatan. |
| Wawancara semi-terstruktur | Staff, supervisor, kepala Dining Hall, admin | Menggali aturan layanan, pengecualian, hak akses, dan kebutuhan laporan. |
| Kuesioner singkat | Mahasiswa | Mengukur pengalaman antrean dan penerimaan QR/NIM. |
| Uji prototype | Staff dan perwakilan mahasiswa | Memvalidasi kemudahan alur sebelum fitur dikunci. |

### Draf pertanyaan

1. Bagaimana langkah staff memverifikasi mahasiswa saat ini?
2. Kapan antrean biasanya paling padat dan berapa perkiraan jumlah mahasiswa per sesi?
3. Data apa yang wajib dicek sebelum makanan diberikan?
4. Apa yang harus terjadi jika mahasiswa sudah mengambil makanan pada periode yang sama?
5. Bagaimana perlakuan layanan untuk penghuni dan non-penghuni asrama?
6. Perangkat apa yang tersedia: PC, tablet, webcam, pemindai, dan jaringan?
7. Apa prosedur saat kamera atau jaringan tidak dapat digunakan?
8. Informasi apa yang paling dibutuhkan supervisor dan kepala Dining Hall?
9. Siapa yang boleh menambah atau mengubah profil mahasiswa serta status asrama?
10. Kapan periode Pagi, Siang, dan Malam dibuka dan ditutup?

## 1.9 Rencana platform dan teknologi

| Lapisan | Teknologi | Alasan |
|---|---|---|
| Antarmuka | React dan Vite | Membuat antarmuka web responsif dengan iterasi cepat. |
| Autentikasi dan data operasional | Firebase Authentication dan Firestore | Mendukung autentikasi berbasis role serta pembaruan data operasional. |
| QR dan kamera | `@zxing/browser` dan Web Camera API | Mendukung pembacaan QR dengan webcam atau kamera ponsel yang terhubung ke Windows. |
| Database relasional untuk demonstrasi akademik | MySQL/MariaDB | Menunjukkan tabel, primary key, foreign key, relasi, dan query SQL. |
| API SQL demo | Node.js, HTTP, dan `mysql2` | Menghubungkan prototype dengan database relasional saat mode SQL diaktifkan. |
| Pemodelan | PlantUML dan diagram use case/ERD | Mendokumentasikan proses dan struktur data secara dapat direvisi. |
| Kolaborasi dan pengujian | Git repository, VS Code, npm, PowerShell | Menjaga kode, pembagian kerja, dan pengujian terpusat. |

**Catatan arsitektur:** Firebase digunakan untuk operasi aplikasi yang aktif. MySQL/MariaDB digunakan sebagai implementasi dan demonstrasi basis data relasional untuk kebutuhan tugas; SQL API dapat diaktifkan untuk demo tersebut.

## 1.10 Pembagian peran dan ruang kerja bersama

| Peran tim | Tanggung jawab utama |
|---|---|
| Koordinator atau analis | Menjaga scope, stakeholder, backlog, dokumen inisiasi, dan komunikasi kelompok. |
| Analis proses dan UI | Memetakan as-is/to-be, user story, use case, wireframe, dan skenario uji. |
| Pengembang frontend | Mengerjakan antarmuka React, login, dashboard role, QR/NIM, dan antrean. |
| Pengembang data/backend | Menjaga Firebase, skema MySQL, SQL API, validasi data, serta seed demo. |
| QA dan dokumentasi | Menyusun kasus uji, menguji alur, mencatat temuan, serta menyiapkan demo/presentasi. |

Ruang kerja bersama menggunakan repository proyek `santap-react` sebagai sumber kode dan dokumentasi. Struktur minimum yang dipakai adalah `src/` untuk aplikasi React, `server/` untuk API dan SQL, `tools/` untuk utilitas, serta dokumen `.md`, `.puml`, dan `.docx` di akar proyek. Setiap perubahan kebutuhan dicatat pada backlog atau issue agar keputusan kelompok dapat ditelusuri.

## Persetujuan dan tindak lanjut

Sebelum iterasi pembangunan berikutnya, tim perlu memperoleh konfirmasi dosen/pengelola untuk: aturan kelayakan makan, perbedaan layanan penghuni dan non-penghuni, jadwal periode makan, pengecualian layanan, perangkat yang tersedia, serta penanggung jawab data mahasiswa.
