# Spesifikasi kebutuhan SANTAP

Revisi audit 17 November 2026. Dokumen ini menjadi acuan teknis terbaru bersama [keterlacakan](../KETERLACAKAN.md), [kamus data](../KAMUS_DATA.md), dan [pengujian](../PENGUJIAN.md). Nomor FR-01 sampai FR-20 dan UC-01 sampai UC-11 mengikuti **SRS FINAL** sebelumnya. ID pada elisitasi diberi awalan ELIS saat dirujuk karena nomor historisnya berbeda. Dokumen Word lama tetap merupakan snapshot sebelum audit ini.

## 1. Overview

SANTAP membantu petugas Fern Wallace Dining Hall, Universitas Klabat, mengidentifikasi mahasiswa, mengelola antrean, dan mencatat pengambilan makanan. Masalah yang ditangani adalah pencatatan tidak konsisten, pengambilan ganda, serta sulitnya memantau jumlah layanan ketika antrean padat. Tujuannya menyediakan satu alur terverifikasi dan catatan yang dapat ditelusuri.

Mahasiswa menggunakan identitas, antrean, status pengambilan, dan rating. Staff melakukan validasi serta pelayanan. Supervisor memonitor dan menjeda layanan. Head memiliki gabungan pelayanan dan monitoring. Admin mengelola akun, profil, dan konfigurasi. Pembayaran, pengelolaan menu/stok/resep, procurement, ERP, dan aplikasi mobile native berada di luar scope.

Rincian manfaat, stakeholder, tujuh dimensi ITPOSMO, pembandingan Agile dengan Waterfall dan Prototyping, rencana tiga minggu, serta pembagian tanggung jawab tersedia dalam [inisiasi](../../Penilaian/DOKUMEN_INISIASI_SANTAP.md). Model yang dipakai adalah **Agile Iterative Incremental**: discovery pada minggu pertama, implementasi proses inti pada minggu kedua, lalu operasi, pengujian, dan penutupan pada minggu ketiga. Nama anggota dan bukti persetujuan belum boleh diisi berdasarkan dugaan.

## 2. Sistem saat ini

Petugas perlu memeriksa identitas, status mahasiswa, periode layanan, dan riwayat pengambilan. Pada alur manual atau terpisah, pengecekan tersebut memperlambat pelayanan dan meningkatkan risiko pencatatan ganda. Rancangan menggabungkan identifikasi, validasi server, pencatatan, serta pembaruan antrean dalam satu alur.

Perangkat yang dibutuhkan adalah browser komputer/ponsel, kamera opsional, dan jaringan. NIM manual menjadi alternatif kamera. Ketika jaringan gagal, identifikasi dapat disimpan lokal sebagai **belum tersinkron**. Penyimpanan tersebut tidak membuktikan makanan sudah diserahkan dan tidak mengizinkan bypass validasi.

## 3. Dependensi, batasan, dan kelayakan

React/Vite menyediakan antarmuka. Firebase Authentication menerbitkan token, Firestore menyimpan profil role, konfigurasi, dan push. Data operasional memakai Firestore atau MySQL/MariaDB, dipilih melalui konfigurasi. Node.js memverifikasi token dan role serta menjalankan transaksi. MySQL bukan pengganti Firebase Authentication. Data operasional kedua mode tidak direplikasi otomatis.

Kamera dan push memerlukan secure context. Email memerlukan SMTP; push memerlukan permission, VAPID, Firebase Messaging, dan worker aktif. Push dapat gagal dan selalu mempunyai fallback dalam aplikasi. Pemeriksaan token saat ini memvalidasi tanda tangan dan kedaluwarsa; pemeriksaan pencabutan token Firebase tidak diaktifkan. Perubahan role tetap dibaca dari profil server setiap permintaan.

Secara teknis prototype dapat memakai stack dan perangkat yang tersedia. Secara ekonomi biaya produksi belum diukur; tidak ada klaim penghematan angka tertentu. Secara operasional dibutuhkan pelatihan singkat, data profil lengkap, dan SOP identitas. Kebijakan hak makan atau pengecualian belum diratifikasi; aplikasi tidak menolak seseorang hanya karena berstatus non-penghuni.

## 4. Elisitasi

[Dokumen elisitasi](../../Penilaian/ELISITASI_SRS_SANTAP.md) memuat dua teknik yang terdokumentasi, yakni wawancara yang diringkas dalam sumber KINTARA dan analisis dokumen tersebut, serta 12 pertanyaan/jawaban parafrasa. Nama sumber, bentuk jawaban, dan keterbatasan tanggal/bukti dicatat di sana. Observasi tambahan belum dianggap selesai. Jika rubrik mengharuskan dua teknik lapangan, tim perlu melampirkan kegiatan nyata yang kedua.

## 5. Kebutuhan dan aturan bisnis

| ID | Pernyataan yang dapat diuji | Prioritas | Sumber |
|---|---|---|---|
| FR-01 | Pengguna operasional harus terautentikasi sebelum dashboard tersedia. | Must | ELIS FR-01 |
| FR-02 | Fitur dan API harus membatasi tindakan berdasarkan role. | Must | ELIS FR-02, Q11 |
| FR-03 | Profil mahasiswa harus memuat NIM, nama, email, fakultas, dan status asrama. | Must | ELIS FR-03, Q6/Q8 |
| FR-04 | Admin harus dapat memperbarui nama, fakultas, dan status asrama profil yang ada. | Must | ELIS FR-04 |
| FR-05 | Mahasiswa harus dapat menampilkan dan mengunduh QR identitasnya. | Should | ELIS FR-05, Q1 |
| FR-06 | Staff harus dapat mengidentifikasi melalui QR, barcode, atau NIM manual. | Must | ELIS FR-06/07, Q1/Q2 |
| FR-07 | Sistem harus menolak NIM tidak terdaftar dan profil tidak lengkap. | Must | Q8, ELIS FR-08/09 |
| FR-08 | Server harus menolak pengambilan di luar jadwal atau saat dijeda. | Must | Jadwal operasional, ELIS FR-08 |
| FR-09 | Satu NIM tidak boleh mempunyai dua catatan pada tanggal dan periode yang sama. | Must | ELIS FR-10, Q9 |
| FR-10 | Catatan harus memuat mahasiswa, periode, waktu WITA, dan identitas petugas dari server. | Must | ELIS FR-11, Q8 |
| FR-11 | Pengguna berwenang harus dapat melihat antrean, dan mahasiswa dapat masuk antrean sendiri. | Should | ELIS FR-12/13, Q3/Q4 |
| FR-12 | Staff harus dapat menyelesaikan atau membatalkan antrean. | Should | ELIS FR-13, Q4 |
| FR-13 | Supervisor dan Head harus dapat melihat total layanan serta status asrama per periode. | Should | ELIS FR-14, Q5/Q6 |
| FR-14 | Sistem harus menyediakan pengingat 10 menit sebelum tutup dan fallback dalam aplikasi. | Must | ELIS FR-16, Q7, revisi push |
| FR-15 | Head harus dapat menggunakan pelayanan Staff dan monitoring Supervisor. | Must | ELIS FR-17, Q11 |
| FR-16 | Mahasiswa harus dapat mengirim rating bilangan bulat 1–5 dan saran opsional. | Should | ELIS FR-18, Q12 |
| FR-17 | Admin harus dapat menyimpan jadwal valid yang tidak tumpang tindih. | Must | Revisi operasional v1.2 |
| FR-18 | Antarmuka harus menampilkan jam WITA, status layanan, dan peringatan sebelum tutup. | Must | Revisi operasional v1.2 |
| FR-19 | Tema Sabat opsional harus mengikuti rentang konfigurasi tanpa mengubah aturan makan. | Could | Revisi operasional v1.2 |
| FR-20 | Identifikasi sementara harus tersimpan per akun dan divalidasi ulang ketika disinkronkan. | Could | ELIS FR-15, Q2 |

Must menentukan cakupan minimum; Should meningkatkan pelayanan; Could bersifat pelengkap. Pembuatan akun Admin merupakan bagian UC-09 untuk menyediakan FR-01/03, bukan penomoran FR baru.

| ID | Kategori | Kriteria penerimaan | Status verifikasi |
|---|---|---|---|
| NFR-01 | Kinerja | Validasi identitas maksimal tiga detik pada jaringan kampus normal. | Target, belum diukur di kampus. |
| NFR-02 | Keamanan | Token tidak sah dan role tanpa izin ditolak server. | Mock API teruji; rules deployment perlu diuji. |
| NFR-03 | Kegunaan | Identifikasi dan pencatatan tersedia pada satu halaman Staff. | Render dan DOM teruji; kamera nyata belum. |
| NFR-04 | Keandalan | Kombinasi NIM/periode/tanggal hanya menghasilkan satu catatan. | Transaksi mock teruji; konkurensi database nyata belum. |
| NFR-05 | Integritas | Setiap catatan menggunakan mahasiswa/periode valid, tanggal WITA, dan petugas terautentikasi. | Validasi SQL/Firestore teruji dengan mock. |
| NFR-06 | Privasi | Mahasiswa hanya menerima data pribadi miliknya; antrean publik tidak memuat NIM/nama orang lain. | Proyeksi Firestore teruji; SQL dan rules perlu uji integrasi. |
| NFR-07 | Aksesibilitas | Input mempunyai label, fokus terlihat, pesan kesalahan jelas, animasi mengikuti reduced motion. | Pemeriksaan kode/DOM; uji keyboard dan visual perangkat belum. |

BR-01: Semua jadwal memakai Asia/Makassar. Pagi 05.30–08.00, siang 11.30–13.00, malam Minggu–Kamis 17.00–18.30 dan Jumat–Sabtu 16.30–18.00. Saat buka inklusif, saat tutup eksklusif. Admin dapat mengganti jadwal sesuai persetujuan pengelola.

BR-02: NIM unik, alfanumerik/garis bawah/tanda hubung, maksimal 30 karakter. Nama, fakultas, email, dan residence harus lengkap. Residence hanya `Penghuni Asrama` atau `Non-penghuni`.

BR-03: Jeda berlaku untuk satu tanggal WITA. Membuka ulang pada hari yang sama tidak menghapus jatah yang sudah dipakai. Staff/Head dapat melayani; Supervisor/Admin juga mempunyai kewenangan operasi pada API sesuai implementasi, meskipun UI mereka berfokus pada monitoring/administrasi.

BR-04: Antrean berstatus `waiting`, `completed`, atau `cancelled`. Penyelesaian mencatat makan; pembatalan tidak. Catatan dan antrean pada tanggal/periode yang sama diperbarui dalam transaksi.

BR-05: QR identitas bersifat statis dan dapat disalin. Petugas harus mencocokkan nama/NIM dengan kartu fisik dan pemegangnya. QR layanan universal hanya penanda layanan, bukan izin mengambil makanan. QR bukti memuat ID transaksi dan token dan hanya cocok dengan catatan pemiliknya.

BR-06: Pengingat untuk Supervisor/Head menggunakan event yang dideduplikasi. Tema Sabat default Jumat 18.00 sampai Sabtu 18.00 WITA; tema tidak mengubah kelayakan atau jadwal layanan.

BR-07: Rating 1–5, saran maksimal 5.000 karakter, penerima dan identitas dikendalikan server. Rating dikirim melalui email; tidak ada tabel rating permanen dalam versi ini.

BR-08: Data offline belum final. Sinkronisasi dari tanggal sebelumnya atau periode yang sudah berakhir ditolak dan tetap perlu ditinjau petugas. Akun lain tidak memperoleh daftar pending melalui aplikasi; penyimpanan browser bukan penyimpanan terenkripsi.

## 6. Deskripsi use case

### UC-01 Login

**Aktor:** semua peran. **Prakondisi:** akun Firebase tersedia dan aktif. **Alur:** pengguna memasukkan email/kata sandi, Firebase mengautentikasi, aplikasi membaca profil, kemudian membuka navigasi sesuai role. **Pascakondisi:** sesi dan role tersedia. **Alternatif:** kredensial salah menampilkan kesalahan; profil tidak lengkap/role tidak dikenal menampilkan halaman profil belum siap; keluar menghapus tampilan sesi. Demo lokal adalah simulasi terpisah, tanpa autentikasi layanan nyata.

### UC-02 Tampilkan QR identitas

**Aktor:** Mahasiswa. **Prakondisi:** profil lengkap. **Alur:** buka dashboard, baca QR, unduh PNG bila perlu, tunjukkan kepada petugas. **Pascakondisi:** QR merepresentasikan NIM tanpa membuat transaksi. **Alternatif:** kegagalan unduh ditampilkan; NIM manual tetap tersedia pada petugas. QR bukti yang dipindai mahasiswa hanya dinyatakan cocok jika ID, NIM, periode, dan token sesuai catatan yang dimuat.

### UC-03 Akses antrean

**Aktor:** Mahasiswa. **Prakondisi:** login, profil lengkap, periode aktif, belum mengambil. **Alur:** pilih masuk antrean, server memvalidasi NIM pemilik, jadwal, jeda dan duplikasi, simpan waiting, tampilkan posisi. **Pascakondisi:** satu antrean aktif untuk NIM/periode/tanggal. **Alternatif:** periode tutup, sudah makan, profil tidak lengkap, atau sudah mengantre ditolak tanpa entri tambahan. Identitas mahasiswa lain tidak ditampilkan.

### UC-04 Proses pengambilan

**Aktor:** Staff atau Head. **Prakondisi:** login, mahasiswa dikenali, periode aktif. **Alur:** scan QR/barcode atau masukkan NIM, cocokkan kartu/pemegang, catat pengambilan, server memvalidasi ulang, simpan meal record dan selesaikan antrean terkait, tampilkan bukti. **Pascakondisi:** satu catatan final dengan petugas dan waktu server. **Alternatif:** input rusak, profil tidak lengkap, duplikasi, jeda, atau periode berakhir ditolak; jaringan gagal dapat memakai identifikasi sementara yang belum final.

### UC-05 Kelola antrean

**Aktor:** Staff atau Head. **Prakondisi:** login dan entri waiting tersedia. **Alur:** pilih entri dan cocokkan identitas; Selesaikan menjalankan UC-04, Batalkan mengubah status menjadi cancelled. **Pascakondisi:** entri tidak lagi waiting. **Alternatif:** entri sudah selesai/batal ditolak; penyelesaian di luar jam ditolak. Pembatalan tidak menghasilkan meal record.

### UC-06 Monitor Dining Hall

**Aktor:** Supervisor atau Head. **Prakondisi:** login dan data dimuat. **Alur:** pilih periode, lihat total hari berjalan, penghuni/non-penghuni, antrean periode tersebut, ringkasan mingguan; opsional pratinjau laporan. **Pascakondisi:** informasi layanan tersedia. **Alternatif:** data kosong tampil nol; kesalahan backend tampil jelas. Riwayat mingguan demo diberi konteks simulasi. Mengirim laporan nyata membutuhkan SMTP dan penerima valid.

### UC-07 Pengingat dan penutupan

**Aktor:** Supervisor/Head; pemicu sistem adalah waktu. **Prakondisi:** jadwal valid, periode tidak dijeda; push membutuhkan konfigurasi dan izin. **Alur:** pada sepuluh menit sebelum tutup tampilkan peringatan, worker mengecek role penerima dan klaim event, kirim push jika tersedia; saat tutup server menolak transaksi baru. **Pascakondisi:** layanan mengikuti waktu server, tidak bergantung pada dashboard terbuka. **Alternatif:** push tidak tersedia memakai peringatan dalam aplikasi; event duplikat tidak dikirim ulang; periode dijeda meniadakan pengingat.

### UC-08 Akses Head

**Aktor:** Head. **Prakondisi:** profil Head. **Alur:** buka Monitoring, pindah ke Antrean & Validasi, jalankan UC-04/05/06/07. **Pascakondisi:** kedua kelompok fungsi dapat diakses. **Alternatif:** endpoint administrasi akun tetap menolak Head dengan 403. Ini kelompok akses, bukan kelas turunan Admin.

### UC-09 Kelola akun dan profil

**Aktor:** Admin. **Prakondisi:** akun Admin terautentikasi. **Alur:** isi identitas dan role untuk membuat akun, validasi field, simpan akun/profil, buat undangan; untuk profil yang ada, pilih NIM dan simpan nama/fakultas/residence. **Pascakondisi:** profil tersedia atau diperbarui. **Alternatif:** NIM duplikat/unknown/input kosong ditolak. SMTP gagal mempertahankan akun yang sudah dibuat dan menawarkan kirim ulang. Penyimpanan profil lintas SQL/Firestore menggunakan kompensasi, bukan transaksi terdistribusi yang menjamin atomicity pada semua kegagalan jaringan.

### UC-10 Rating dan saran

**Aktor:** Mahasiswa. **Prakondisi:** profil dengan NIM tersedia. **Alur:** pilih rating, tulis saran opsional, kirim; API memvalidasi dan mengirim email ke penerima server. **Pascakondisi:** layanan email menerima pengiriman atau kesalahan ditampilkan. **Alternatif:** rating di luar 1–5, pesan terlalu panjang, atau SMTP gagal ditolak. Mode demo hanya pratinjau dan tidak mengirim email.

### UC-11 Konfigurasi operasional

**Aktor:** Admin. **Prakondisi:** profil Admin. **Alur:** ubah jam per periode dan pengaturan tema, validasi format dan overlap, simpan konfigurasi terpusat. **Pascakondisi:** operasi server dan pembacaan klien menggunakan jadwal valid. **Alternatif:** interval tidak valid/tumpang tindih ditolak; pengguna selain Admin ditolak. Mode demo mengubah state lokal saja. Pada mode SQL, klien perlu memuat ulang konfigurasi; server membaca konfigurasi pada setiap operasi.

## 7. Model dan implementasi

Model utama berada di [models](../models/): [use case](../models/SANTAP_V1_2_USE_CASE.puml), [activity pengambilan](../models/SANTAP_V1_2_MEAL_ACTIVITY.puml), [activity penutupan](../models/SANTAP_V1_2_CLOSING_ACTIVITY.puml), [activity antrean](../models/SANTAP_V1_2_QUEUE_ACTIVITY.puml), [sequence pengambilan](../models/SANTAP_V1_2_MEAL_SEQUENCE.puml), [sequence antrean](../models/SANTAP_V1_2_QUEUE_SEQUENCE.puml), [sequence profil](../models/SANTAP_V1_2_PROFILE_SEQUENCE.puml), [class](../models/SANTAP_V1_2_CLASS.puml), dan [ERD](../models/SANTAP_V1_2_ERD.puml).

Class diagram menggambarkan model domain; implementasi JavaScript menggunakan objek dan fungsi modul. Operasi domain dipetakan secara eksplisit dalam [kamus data](../KAMUS_DATA.md), bukan klaim adanya deklarasi kelas JavaScript yang sama. Tautan antarstore adalah relasi logis, bukan FK SQL. Relasi include/extend/generalization tidak dipaksakan jika hanya mengulang prasyarat login atau pilihan metode input.

## 8. Antarmuka

| Layar | Isi | Navigasi |
|---|---|---|
| L-01 | Login dan profil belum siap | Setelah keluar atau sesi belum ada |
| L-02 | Identitas, QR, bukti pengambilan | Dashboard Mahasiswa |
| L-03 | Antrean mahasiswa | Panel dalam Dashboard Mahasiswa |
| L-04 | Identifikasi, validasi, antrean Staff | Staff atau menu pelayanan Head |
| L-05 | Monitoring, jam, pengingat, laporan | Supervisor atau menu monitoring Head |
| L-06 | Akun, profil, konfigurasi | Admin |

Enam layar merupakan enam tampilan/panel fungsional, bukan enam URL. Uji DOM mencakup perpindahan peran, transaksi, validasi NIM, dan keluar/masuk demo. Uji kamera, keyboard, screenshot responsif, dan keterbacaan visual pada perangkat nyata masih diperlukan. Perubahan audit menjaga desain yang ada sambil memperbaiki label, fokus, pembungkusan teks, dan state antarsesi.

## 9. Implementasi, pengujian, dan proses

[README](../../README.md) menjelaskan instalasi, akun, database, build, dan struktur kode. [Pengujian](../PENGUJIAN.md) mencatat hasil aktual otomatis, regresi, dan skenario yang belum dijalankan. [Keterlacakan](../KETERLACAKAN.md) menghubungkan semua kebutuhan dengan UC, model, implementasi, layar, dan kasus uji. [Checklist final](../../Penilaian/CHECKLIST_FINAL.md) menilai kesiapan artefak tanpa memberi nilai dosen.

## 10. Referensi dan AI

Sumber proyek: [panduan dosen](../references/01_Panduan_Final_Project_SAD.docx), enam rubrik pada [Penilaian](../../Penilaian/), sumber KINTARA dan SANTAP v1.1 pada folder ini, serta dokumen inisiasi/elisitasi. Rujukan teknis: [React](https://react.dev/), [Firebase Authentication](https://firebase.google.com/docs/auth), [transaksi Firestore](https://firebase.google.com/docs/firestore/manage-data/transactions), [MySQL](https://dev.mysql.com/doc/), dan [PlantUML](https://plantuml.com/).

AI membantu audit kode, penyusunan uji, perbaikan bug, penataan folder, dan draft dokumentasi. Hasil pengujian hanya diklaim jika benar-benar dijalankan. Tim harus memeriksa keluaran, melampirkan bukti elisitasi/persetujuan asli, menyelaraskan template Word/Excel bila diwajibkan, serta mengisi kontribusi anggota sebelum pengumpulan.
