# Daftar perubahan lengkap SANTAP

Audit 16–17 November 2026, dilanjutkan setelah pekerjaan Antigravity/Gemini. Pembanding Git: HEAD 03197c9. Perubahan lokal awal sudah ada sebelum audit; daftar ini menjelaskan hasil gabungan, bukan mengklaim seluruh implementasi dibuat oleh satu asisten. Atribusi Gemini berdasarkan perubahan yang ditemukan saat melanjutkan; tidak tersedia commit terpisah untuk membuktikan penulis setiap baris.

## 1. Perbaikan aplikasi pada audit awal

1. [App](../src/App.jsx): pisahkan inisialisasi demo, subscription profil, dan subscription data. Transaksi serta konfigurasi demo tidak lagi direset setiap pergantian role.
2. Bersihkan profil, role, mahasiswa, antrean, publicQueue, record, periode dan konfigurasi pada perubahan sesi; batasi subscription berdasarkan profil yang siap dan NIM yang valid.
3. Key halaman berdasarkan identitas pengguna agar state identifikasi dan receipt tidak terbawa ke akun lain; pertahankan objek user saat mengganti role demo.
4. Antrean demo memakai ID unik dan tanggal WITA; penyelesaian dibatasi ke tanggal/periode yang sama. Tambahkan tombol masuk kembali ke demo setelah logout pada [LoginPage](../src/pages/LoginPage.jsx).
5. [.env.demo](../.env.demo), [firebase.js](../src/lib/firebase.js), dan skrip npm demo: demo lokal eksplisit tanpa inisialisasi Firebase.
6. [Parser QR](../shared/serviceQr.js): validasi tipe, versi, format NIM, dan bentuk JSON; payload NIM object/number tidak lagi menyebabkan trim crash. Digunakan Staff dan pending scans.
7. [StudentPage](../src/pages/StudentPage.jsx): bedakan QR identitas, marker layanan umum, dan receipt; cocokkan receipt terhadap ID/NIM/periode/token milik mahasiswa. Marker umum tidak memberi hak mencatat makan sendiri.
8. [QrScanner](../src/components/QrScanner.jsx): tombol Tutup bertipe button sehingga tidak mengirim form induk.
9. [sqlOperations](../server/sqlOperations.js) dan [operations](../server/operations.js): tolak periode tak dikenal dan ID pembatalan tak valid sebelum akses penyimpanan.
10. [SupervisorPage](../src/pages/SupervisorPage.jsx): jumlah menunggu hanya tanggal WITA hari ini dan periode dipilih.
11. [email.js](../server/email.js): hanya satu alamat penerima biasa; tolak daftar penerima, delimiter, dan karakter kendali.
12. [sqlServer](../server/sqlServer.js): hilangkan pencarian antrean berulang untuk setiap mahasiswa pada proyeksi data mahasiswa.
13. [styles.css](../src/styles.css): pembungkusan teks panjang dan fokus keyboard; pertahankan perubahan tampilan lokal yang sudah ada.
14. Hapus tiga komponen kosong Header/QueueList/StudentCard, placeholder HeadPage yang tidak dipakai, dan helper findStudentByNim yang tidak terpakai. Head menggunakan halaman Staff dan Supervisor.

## 2. Pengujian, tooling dan dependensi

- Tambah [validation.test.js](../server/validation.test.js) dan [ui.test.js](../server/ui.test.js); perbaiki konfigurasi SSR pada [render.test.js](../server/render.test.js) agar test tidak menggantung.
- Tambah React Testing Library/JSDOM dan Resvg sebagai dev dependency, engines Node >=22.12.0, serta timeout test 30 detik.
- Perbarui dependensi melalui audit kompatibel; Nodemailer menjadi ^10.6.0, override @grpc/grpc-js ^1.14.7, dan [lockfile](../package-lock.json) disinkronkan. Lockfile dipakai npm ci untuk instalasi yang dapat diulang.
- [check-doc-links.mjs](../tools/check-doc-links.mjs) dan npm run check:docs memeriksa target tautan Markdown lokal; [repair-doc-links.mjs](../tools/repair-doc-links.mjs) membantu memperbaiki lokasi unik setelah pemindahan.
- [render-models.mjs](../tools/render-models.mjs) menghasilkan SVG PlantUML melalui Kroki (KROKI_URL dapat diarahkan ke server lokal); [preview-models.mjs](../tools/preview-models.mjs) menghasilkan PNG pratinjau lokal.
- [.gitignore](../.gitignore) mengabaikan lingkungan Python, cache, hasil render sementara, coverage dan log. Dependensi/cache pengguna tidak dihapus.

## 3. Perubahan yang ditemukan setelah Gemini mengambil alih

- Alias lucide dikembalikan ke bundle CJS yang tersedia di [vite.config.js](../vite.config.js). Percobaan alias ESM pada audit awal gagal karena entry tersebut tidak tersedia; build kini berhasil. Konfigurasi ini sama dengan HEAD sehingga tidak muncul sebagai diff akhir.
- Cleanup test UI menunggu 50 ms sebelum membuang window JSDOM agar pekerjaan tertunda React selesai. Perubahan dipertahankan.
- Tautan dokumentasi diperbaiki.
- Draft laporan pengujian, keterlacakan, kamus data, checklist final dan panduan demo ditambahkan. Pada audit lanjutan, isi yang tidak sesuai kode atau mengklaim pengujian nyata tanpa bukti telah dikoreksi.

## 4. Perbaikan baru pada kelanjutan 17 November

1. [profiles.js](../server/profiles.js): pemulihan Firestore hanya berjalan jika batch sebelumnya benar-benar berhasil. Kegagalan validasi/SQL sebelum penulisan tidak lagi menimpa profil Firestore.
2. Pemulihan menggunakan snapshot masing-masing dokumen user/master, bukan menyalin nilai SQL ke semua dokumen. Keterbatasan kompensasi lintas store tetap dicatat; bukan transaksi terdistribusi.
3. Tambah empat [test profil](../server/profiles.test.js): pembaruan valid, input kosong, batch Firestore gagal, commit SQL gagal dan pemulihan snapshot yang berbeda.
4. ID antrean publik Firestore memakai UUID acak. Hash tanggal/periode/NIM sebelumnya dapat ditebak dengan enumerasi NIM. Tambah test batal/masuk ulang, ID publik baru, dan tidak terciptanya meal record pada pembatalan.
5. Perkuat test monitoring dengan antrean/record hari ini, tanggal lama, periode lain, dan status selesai; angka yang benar diperiksa. Label kartu kini menyatakan periode dan hari ini.
6. Test UI memeriksa kedua tampilan Head. Nama test tidak lagi mengklaim menguji filter yang sebelumnya tidak diperiksa.
7. Nonaktifkan WebSocket Vite pada test SSR/JSDOM sehingga suite tidak memperebutkan port 24678.
8. Koreksi diagram autentikasi: token menghasilkan UID, role dibaca dari profil Firestore. Diagram profil memuat cabang kompensasi SQL gagal, QR publik memakai randomUUID, class memetakan document.create, dan ERD menyebut firebase_uid SQL. Relasi profil-mahasiswa bersifat opsional; klaim push historis dapat bertahan setelah langganan dihapus, dan antrean masuk ulang dapat meninggalkan proyeksi publik historis.
9. Koreksi kamus data: santap.student, marker santap.service, cache santap-pending-scans-UID, field record date/time, key deterministik tanpa prefix meal_, rules berbasis profil, endpoint konfigurasi, field push, dan fungsi modul yang benar-benar ada.
10. Hapus klaim seluruh Must/black-box/layanan eksternal telah lulus. Laporan mencatat 22 skenario perilaku dengan expected/actual dan lapisan mock/DOM; checklist menandai bukti yang masih perlu dilengkapi.
11. [Usulan v1.2](srs/SANTAP_SRS_V1_2_PROPOSED.md) diberi penanda arsip dan tautan ke acuan FINAL Bahasa Indonesia, tanpa mengubah ID historisnya.
12. Panduan demo memperjelas pratinjau rating tanpa email, QR identitas statis, tombol antrean disabled, konfigurasi jadwal demo sebelum tampil, dan status rencana presentasi yang belum dilatih.
13. Font pratinjau diagram ditetapkan ke Arial/Consolas agar tidak memakai font sistem acak yang sulit dibaca.

## 5. Dokumen dan model akademik

- [SRS FINAL](srs/SANTAP_SRS_FINAL.md): 20 FR (13 Must/5 Should/2 Could), 7 NFR, 11 deskripsi UC, aturan bisnis, arsitektur, layar, referensi dan pernyataan AI.
- [Keterlacakan](KETERLACAKAN.md): hubungan FR/NFR → UC → model → kode → layar → pengujian dengan cakupan parsial dinyatakan.
- [Kamus data](KAMUS_DATA.md): SQL, Firestore, QR, cache dan pemetaan domain ke implementasi.
- [Pengujian](PENGUJIAN.md): hasil aktual otomatis, 22 skenario untuk 11 UC, batas pengujian dan regresi.
- [Checklist final](../Penilaian/CHECKLIST_FINAL.md): seluruh butir yang terlihat pada enam rubrik, tanpa nilai dosen atau bukti akademik rekaan.
- [Panduan demo](presentation/PANDUAN_DEMO.md): rencana presentasi 20 menit dan skenario lima role.
- [README](../README.md) dan [indeks](README.md): instalasi/demo/backend, akun uji, struktur folder, dokumen acuan dan snapshot.
- Tambah activity antrean; perbaiki swimlane penutupan, tiga sequence, class, ERD; hasil SVG terkait diregenerasi. Total tersedia 9 model (1 use case, 3 activity, 3 sequence, 1 class, 1 ERD).
- Dokumen Word/Excel lama tetap snapshot; isi biner belum disinkronkan. Skrip generator lama diperbaiki path-nya saja; jangan digunakan untuk menimpa revisi FINAL tanpa memperbarui isi generator.

## 6. Pemindahan berkas

Dokumen akademik tidak dibuang. Git dapat menampilkan sumber sebagai D dan tujuan sebagai untracked sampai perubahan di-stage; ini pemindahan, bukan kehilangan dokumen.

| Lokasi lama | Lokasi sekarang |
|---|---|
| SRS/03_Template_SRS.docx | [docs/srs/03_Template_SRS.docx](<../docs/srs/03_Template_SRS.docx>) |
| SRS/KINTARA SRS.docx | [docs/srs/KINTARA SRS.docx](<../docs/srs/KINTARA SRS.docx>) |
| SRS/SANTAP_SRS_FINAL.docx | [docs/srs/SANTAP_SRS_FINAL.docx](<../docs/srs/SANTAP_SRS_FINAL.docx>) |
| SRS/SANTAP_SRS_V1_1 (1).docx | [docs/srs/SANTAP_SRS_V1_1 (1).docx](<../docs/srs/SANTAP_SRS_V1_1 (1).docx>) |
| SRS/SANTAP_SRS_V1_2_PROPOSED.md | [docs/srs/SANTAP_SRS_V1_2_PROPOSED.md](<../docs/srs/SANTAP_SRS_V1_2_PROPOSED.md>) |
| Lembar Kerja/04_Template_Lembar_Kerja_Proyek.xlsx | [docs/worksheets/lembar-proyek/04_Template_Lembar_Kerja_Proyek.xlsx](<../docs/worksheets/lembar-proyek/04_Template_Lembar_Kerja_Proyek.xlsx>) |
| Lembar Kerja/SANTAP_Lembar_Kerja_Proyek.xlsx | [docs/worksheets/lembar-proyek/SANTAP_Lembar_Kerja_Proyek.xlsx](<../docs/worksheets/lembar-proyek/SANTAP_Lembar_Kerja_Proyek.xlsx>) |
| LEMBAR_KERJA_KEBUTUHAN_SANTAP.xlsx | [docs/worksheets/LEMBAR_KERJA_KEBUTUHAN_SANTAP.xlsx](<../docs/worksheets/LEMBAR_KERJA_KEBUTUHAN_SANTAP.xlsx>) |
| LEMBAR_KERJA_KEBUTUHAN_SANTAP.preview.png | [docs/worksheets/LEMBAR_KERJA_KEBUTUHAN_SANTAP.preview.png](<../docs/worksheets/LEMBAR_KERJA_KEBUTUHAN_SANTAP.preview.png>) |
| ACCOUNT_SETUP.md | [docs/setup/ACCOUNT_SETUP.md](<../docs/setup/ACCOUNT_SETUP.md>) |
| MYSQL_SETUP.md | [docs/setup/MYSQL_SETUP.md](<../docs/setup/MYSQL_SETUP.md>) |
| Demo.md | [docs/setup/AKUN_DEMO.md](<../docs/setup/AKUN_DEMO.md>) |
| IMPLEMENTATION_V1_2.md | [docs/archive/IMPLEMENTATION_V1_2.md](<../docs/archive/IMPLEMENTATION_V1_2.md>) |
| SANTAP_UML.pdf | [docs/archive/SANTAP_UML.pdf](<../docs/archive/SANTAP_UML.pdf>) |
| SANTAP_USE_CASE.puml | [docs/archive/SANTAP_USE_CASE.puml](<../docs/archive/SANTAP_USE_CASE.puml>) |
| 01_Panduan_Final_Project_SAD.docx | [docs/references/01_Panduan_Final_Project_SAD.docx](<../docs/references/01_Panduan_Final_Project_SAD.docx>) |
| antislop.md | [docs/references/antislop.md](<../docs/references/antislop.md>) |
| Dokumen_Persiapan_Presentasi_SANTAP_IDB.docx | [docs/presentation/Dokumen_Persiapan_Presentasi_SANTAP_IDB.docx](<../docs/presentation/Dokumen_Persiapan_Presentasi_SANTAP_IDB.docx>) |

Path pada empat generator, panduan setup, checklist lama, inisiasi dan elisitasi disesuaikan. Folder kosong lama dapat tetap ada secara lokal; Git tidak menyimpan folder kosong.

## 7. Perubahan lokal yang sudah ada sebelum audit

[auth.js](../server/auth.js), [sqlServer.js](../server/sqlServer.js), [App](../src/App.jsx), [sqlApi](../src/lib/sqlApi.js), [StaffPage](../src/pages/StaffPage.jsx), [StudentPage](../src/pages/StudentPage.jsx), dan [styles.css](../src/styles.css) sudah berubah sebelum audit pertama. Demikian pula dokumen akun demo, dua gambar Penilaian 5/6, [QR_AND_MEAL_VALIDATION](QR_AND_MEAL_VALIDATION.md), format QR bersama, dan [ServiceQr](../src/components/ServiceQr.jsx) sudah hadir sebagai berkas lokal.

Perubahan awal tersebut mencakup penyesuaian autentikasi, pemulihan error SQL, integrasi QR layanan/bukti, dan tampilan. Audit mempertahankan serta memperbaiki bagian terkait; tidak mengatribusikan seluruh diff kepada audit ini. Jadwal WITA, operasi transaksi, privasi proyeksi dasar, push dan pending offline sebagian besar merupakan implementasi sebelum audit.

## 8. Hasil verifikasi

- npm test: **31 lulus, 0 gagal, 0 dilewati**, 17 November 2026; mock/DOM, bukan integrasi layanan nyata.
- npm audit --json: **0 kerentanan terlapor**, termasuk dependensi pengembangan, pada pemeriksaan ini.
- npm run build: **berhasil**, Vite 8.3.5, 307 modul. Bundle utama 1.949,79 kB (gzip 537,06 kB); peringatan chunk >500 kB masih ada.
- npm run check:docs: **413 target tautan lokal diperiksa, 0 rusak**. Anchor heading dan tautan internet tidak termasuk pemeriksaan ini.
- Pemeriksaan Problems editor: **tidak ditemukan error**.
- **11 berkas akademik biner yang dipindah identik dengan HEAD**, diverifikasi melalui hash objek Git. Isi DOCX/XLSX/PDF/PNG tersebut tidak diubah.
- Kesembilan SVG berhasil dirender dan pratinjaunya diperiksa secara visual; ini diagram, bukan screenshot aplikasi. Diagram panjang sebaiknya diperbesar/dibagi saat dimasukkan ke slide.
- Pada akhir audit sebelum permintaan publikasi, belum ada commit atau push. Tidak ada deployment atau pengiriman email nyata yang dilakukan.
- Persiapan push atas permintaan pemilik: hapus kata sandi demo dari dokumen akun dan rapikan whitespace Markdown. Daftar akun tetap tersedia; kata sandi diperoleh melalui undangan/reset administrator.

## 9. Hal yang belum dapat dinyatakan selesai

Uji layanan Firebase/MySQL/SMTP/push nyata, kamera/unduh QR/aksesibilitas/perangkat, beban kampus, sinkronisasi Word/Excel, slide/template final, latihan presentasi dan bukti stakeholder/tim masih diperlukan. PublicQueue historis dengan hash deterministik tidak dimigrasikan pada layanan nyata. Kompensasi profil lintas store bersifat best-effort, sehingga kegagalan pemulihan tetap memerlukan rekonsiliasi. Bundle frontend masih besar; lihat hasil build. Rincian tindakan ada pada checklist final.

## 10. Inventaris diff akhir terhadap HEAD

Daftar berikut meliputi berkas terlacak yang berubah, penghapusan placeholder, pemindahan, dan berkas baru. Cache/build/preview yang diabaikan Git tidak termasuk.

| Status | Berkas atau tujuan baru |
|---|---|
| Diubah | [.gitignore](<../.gitignore>) |
| Dipindah | 01_Panduan_Final_Project_SAD.docx → [docs/references/01_Panduan_Final_Project_SAD.docx](<../docs/references/01_Panduan_Final_Project_SAD.docx>) |
| Dipindah | ACCOUNT_SETUP.md → [docs/setup/ACCOUNT_SETUP.md](<../docs/setup/ACCOUNT_SETUP.md>) |
| Dipindah | Dokumen_Persiapan_Presentasi_SANTAP_IDB.docx → [docs/presentation/Dokumen_Persiapan_Presentasi_SANTAP_IDB.docx](<../docs/presentation/Dokumen_Persiapan_Presentasi_SANTAP_IDB.docx>) |
| Dipindah | IMPLEMENTATION_V1_2.md → [docs/archive/IMPLEMENTATION_V1_2.md](<../docs/archive/IMPLEMENTATION_V1_2.md>) |
| Dipindah | LEMBAR_KERJA_KEBUTUHAN_SANTAP.preview.png → [docs/worksheets/LEMBAR_KERJA_KEBUTUHAN_SANTAP.preview.png](<../docs/worksheets/LEMBAR_KERJA_KEBUTUHAN_SANTAP.preview.png>) |
| Dipindah | LEMBAR_KERJA_KEBUTUHAN_SANTAP.xlsx → [docs/worksheets/LEMBAR_KERJA_KEBUTUHAN_SANTAP.xlsx](<../docs/worksheets/LEMBAR_KERJA_KEBUTUHAN_SANTAP.xlsx>) |
| Dipindah | Lembar Kerja/04_Template_Lembar_Kerja_Proyek.xlsx → [docs/worksheets/lembar-proyek/04_Template_Lembar_Kerja_Proyek.xlsx](<../docs/worksheets/lembar-proyek/04_Template_Lembar_Kerja_Proyek.xlsx>) |
| Dipindah | Lembar Kerja/SANTAP_Lembar_Kerja_Proyek.xlsx → [docs/worksheets/lembar-proyek/SANTAP_Lembar_Kerja_Proyek.xlsx](<../docs/worksheets/lembar-proyek/SANTAP_Lembar_Kerja_Proyek.xlsx>) |
| Dipindah | MYSQL_SETUP.md → [docs/setup/MYSQL_SETUP.md](<../docs/setup/MYSQL_SETUP.md>) |
| Diubah | [Penilaian/CHECKLIST_PENILAIAN_1_4_SAD.md](<../Penilaian/CHECKLIST_PENILAIAN_1_4_SAD.md>) |
| Diubah | [Penilaian/DOKUMEN_INISIASI_SANTAP.md](<../Penilaian/DOKUMEN_INISIASI_SANTAP.md>) |
| Diubah | [Penilaian/ELISITASI_SRS_SANTAP.md](<../Penilaian/ELISITASI_SRS_SANTAP.md>) |
| Dipindah | SANTAP_UML.pdf → [docs/archive/SANTAP_UML.pdf](<../docs/archive/SANTAP_UML.pdf>) |
| Dipindah | SANTAP_USE_CASE.puml → [docs/archive/SANTAP_USE_CASE.puml](<../docs/archive/SANTAP_USE_CASE.puml>) |
| Dipindah | SRS/03_Template_SRS.docx → [docs/srs/03_Template_SRS.docx](<../docs/srs/03_Template_SRS.docx>) |
| Dipindah | SRS/KINTARA SRS.docx → [docs/srs/KINTARA SRS.docx](<../docs/srs/KINTARA SRS.docx>) |
| Dipindah | SRS/SANTAP_SRS_FINAL.docx → [docs/srs/SANTAP_SRS_FINAL.docx](<../docs/srs/SANTAP_SRS_FINAL.docx>) |
| Dipindah | SRS/SANTAP_SRS_V1_1 (1).docx → [docs/srs/SANTAP_SRS_V1_1 (1).docx](<../docs/srs/SANTAP_SRS_V1_1 (1).docx>) |
| Dipindah | SRS/SANTAP_SRS_V1_2_PROPOSED.md → [docs/srs/SANTAP_SRS_V1_2_PROPOSED.md](<../docs/srs/SANTAP_SRS_V1_2_PROPOSED.md>) |
| Dipindah | antislop.md → [docs/references/antislop.md](<../docs/references/antislop.md>) |
| Diubah | [docs/models/SANTAP_V1_2_CLASS.puml](<../docs/models/SANTAP_V1_2_CLASS.puml>) |
| Diubah | [docs/models/SANTAP_V1_2_CLOSING_ACTIVITY.puml](<../docs/models/SANTAP_V1_2_CLOSING_ACTIVITY.puml>) |
| Diubah | [docs/models/SANTAP_V1_2_CLOSING_ACTIVITY.svg](<../docs/models/SANTAP_V1_2_CLOSING_ACTIVITY.svg>) |
| Diubah | [docs/models/SANTAP_V1_2_ERD.puml](<../docs/models/SANTAP_V1_2_ERD.puml>) |
| Diubah | [docs/models/SANTAP_V1_2_ERD.svg](<../docs/models/SANTAP_V1_2_ERD.svg>) |
| Diubah | [docs/models/SANTAP_V1_2_MEAL_SEQUENCE.puml](<../docs/models/SANTAP_V1_2_MEAL_SEQUENCE.puml>) |
| Diubah | [docs/models/SANTAP_V1_2_MEAL_SEQUENCE.svg](<../docs/models/SANTAP_V1_2_MEAL_SEQUENCE.svg>) |
| Diubah | [docs/models/SANTAP_V1_2_PROFILE_SEQUENCE.puml](<../docs/models/SANTAP_V1_2_PROFILE_SEQUENCE.puml>) |
| Diubah | [docs/models/SANTAP_V1_2_PROFILE_SEQUENCE.svg](<../docs/models/SANTAP_V1_2_PROFILE_SEQUENCE.svg>) |
| Diubah | [docs/models/SANTAP_V1_2_QUEUE_SEQUENCE.puml](<../docs/models/SANTAP_V1_2_QUEUE_SEQUENCE.puml>) |
| Diubah | [docs/models/SANTAP_V1_2_QUEUE_SEQUENCE.svg](<../docs/models/SANTAP_V1_2_QUEUE_SEQUENCE.svg>) |
| Diubah | [package-lock.json](<../package-lock.json>) |
| Diubah | [package.json](<../package.json>) |
| Diubah | [server/auth.js](<../server/auth.js>) |
| Diubah | [server/email.js](<../server/email.js>) |
| Diubah | [server/firestoreOperations.test.js](<../server/firestoreOperations.test.js>) |
| Diubah | [server/operations.js](<../server/operations.js>) |
| Diubah | [server/profiles.js](<../server/profiles.js>) |
| Diubah | [server/render.test.js](<../server/render.test.js>) |
| Diubah | [server/sqlOperations.js](<../server/sqlOperations.js>) |
| Diubah | [server/sqlServer.js](<../server/sqlServer.js>) |
| Diubah | [src/App.jsx](<../src/App.jsx>) |
| Dihapus (tidak dipakai) | src/components/Header.jsx |
| Diubah | [src/components/PendingScans.jsx](<../src/components/PendingScans.jsx>) |
| Diubah | [src/components/QrScanner.jsx](<../src/components/QrScanner.jsx>) |
| Dihapus (tidak dipakai) | src/components/QueueList.jsx |
| Dihapus (tidak dipakai) | src/components/StudentCard.jsx |
| Diubah | [src/data/demoData.js](<../src/data/demoData.js>) |
| Diubah | [src/lib/firebase.js](<../src/lib/firebase.js>) |
| Diubah | [src/lib/santap.js](<../src/lib/santap.js>) |
| Diubah | [src/lib/sqlApi.js](<../src/lib/sqlApi.js>) |
| Dihapus (tidak dipakai) | src/pages/HeadPage.jsx |
| Diubah | [src/pages/LoginPage.jsx](<../src/pages/LoginPage.jsx>) |
| Diubah | [src/pages/StaffPage.jsx](<../src/pages/StaffPage.jsx>) |
| Diubah | [src/pages/StudentPage.jsx](<../src/pages/StudentPage.jsx>) |
| Diubah | [src/pages/SupervisorPage.jsx](<../src/pages/SupervisorPage.jsx>) |
| Diubah | [src/styles.css](<../src/styles.css>) |
| Diubah | [tools/build_final_srs.py](<../tools/build_final_srs.py>) |
| Diubah | [tools/build_requirement_sheet.mjs](<../tools/build_requirement_sheet.mjs>) |
| Diubah | [tools/build_workbook_santap.py](<../tools/build_workbook_santap.py>) |
| Diubah | [tools/create_santap_presentation.ps1](<../tools/create_santap_presentation.ps1>) |
| Baru/lokal belum terlacak | [.env.demo](<../.env.demo>) |
| Baru/lokal belum terlacak | [Penilaian/CHECKLIST_FINAL.md](<../Penilaian/CHECKLIST_FINAL.md>) |
| Baru/lokal belum terlacak | [Penilaian/Penilaian 5 SAD.jpeg](<../Penilaian/Penilaian 5 SAD.jpeg>) |
| Baru/lokal belum terlacak | [Penilaian/Penilaian 6 SAD.jpeg](<../Penilaian/Penilaian 6 SAD.jpeg>) |
| Baru/lokal belum terlacak | [README.md](<../README.md>) |
| Baru/lokal belum terlacak | [docs/KAMUS_DATA.md](<../docs/KAMUS_DATA.md>) |
| Baru/lokal belum terlacak | [docs/KETERLACAKAN.md](<../docs/KETERLACAKAN.md>) |
| Baru/lokal belum terlacak | [docs/PENGUJIAN.md](<../docs/PENGUJIAN.md>) |
| Baru/lokal belum terlacak | [docs/QR_AND_MEAL_VALIDATION.md](<../docs/QR_AND_MEAL_VALIDATION.md>) |
| Baru/lokal belum terlacak | [docs/README.md](<../docs/README.md>) |
| Baru/lokal belum terlacak | [docs/models/SANTAP_V1_2_CLASS.svg](<../docs/models/SANTAP_V1_2_CLASS.svg>) |
| Baru/lokal belum terlacak | [docs/models/SANTAP_V1_2_QUEUE_ACTIVITY.puml](<../docs/models/SANTAP_V1_2_QUEUE_ACTIVITY.puml>) |
| Baru/lokal belum terlacak | [docs/models/SANTAP_V1_2_QUEUE_ACTIVITY.svg](<../docs/models/SANTAP_V1_2_QUEUE_ACTIVITY.svg>) |
| Baru/lokal belum terlacak | [docs/presentation/PANDUAN_DEMO.md](<../docs/presentation/PANDUAN_DEMO.md>) |
| Baru/lokal belum terlacak | [docs/srs/SANTAP_SRS_FINAL.md](<../docs/srs/SANTAP_SRS_FINAL.md>) |
| Baru/lokal belum terlacak | [server/profiles.test.js](<../server/profiles.test.js>) |
| Baru/lokal belum terlacak | [server/ui.test.js](<../server/ui.test.js>) |
| Baru/lokal belum terlacak | [server/validation.test.js](<../server/validation.test.js>) |
| Baru/lokal belum terlacak | [shared/serviceQr.js](<../shared/serviceQr.js>) |
| Baru/lokal belum terlacak | [src/components/ServiceQr.jsx](<../src/components/ServiceQr.jsx>) |
| Baru/lokal belum terlacak | [tools/check-doc-links.mjs](<../tools/check-doc-links.mjs>) |
| Baru/lokal belum terlacak | [tools/preview-models.mjs](<../tools/preview-models.mjs>) |
| Baru/lokal belum terlacak | [tools/render-models.mjs](<../tools/render-models.mjs>) |
| Baru/lokal belum terlacak | [tools/repair-doc-links.mjs](<../tools/repair-doc-links.mjs>) |
| Baru | [Daftar perubahan ini](DAFTAR_PERUBAHAN.md) |
