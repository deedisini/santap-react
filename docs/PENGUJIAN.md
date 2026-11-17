# Laporan pengujian SANTAP

Audit dilanjutkan pada 17 November 2026. Acuan: [SRS final](srs/SANTAP_SRS_FINAL.md), [keterlacakan](KETERLACAKAN.md), [daftar perubahan](DAFTAR_PERUBAHAN.md). Laporan ini mengganti klaim LULUS tanpa bukti pada draft sebelumnya.

## Lingkungan dan batas bukti

Node.js, node:test, Vite, React Testing Library, dan JSDOM digunakan untuk pengujian otomatis. Waktu operasi diuji dengan tanggal WITA tetap. Database, Firebase Auth, messaging, dan transport email pada pengujian diganti test double; Nodemailer diuji dengan stream transport tanpa mengirim email. Pengujian transaksi mock tidak membuktikan isolasi/konkurensi database produksi.

Perintah verifikasi: npm test, npm run build, npm run check:docs, npm audit. Hasil akhir dicatat di bagian verifikasi pada [daftar perubahan](DAFTAR_PERUBAHAN.md). Pemeriksaan tautan memeriksa target lokal, bukan anchor heading atau tautan internet.

## Cakupan suite otomatis

| Berkas | Jumlah test | Bukti yang diperiksa |
|---|---:|---|
| [firestoreOperations.test.js](../server/firestoreOperations.test.js) | 3 | Duplikasi makan, antrean selesai/batal/masuk ulang, ID publik acak, profil tidak lengkap, tanggal kedaluwarsa; penyimpanan mock |
| [notifications.test.js](../server/notifications.test.js) | 3 | Klaim pengiriman, jeda layanan, pencabutan role, dan pencegahan duplikasi service worker; messaging mock |
| [operations.test.js](../server/operations.test.js) | 10 | Batas jadwal WITA, peringatan, tema, validasi konfigurasi, pending per UID, operasi SQL dan otorisasi mock |
| [render.test.js](../server/render.test.js) | 1 | Render empat halaman, bentuk timestamp Firestore, banner jam, angka monitoring hanya tanggal/periode terpilih |
| [ui.test.js](../server/ui.test.js) | 1 | NIM salah, catat makan, cegah duplikasi, transaksi tetap ada setelah ganti role, dua tampilan Head, keluar/masuk demo |
| [validation.test.js](../server/validation.test.js) | 4 | Parser QR, marker layanan, periode/ID SQL tidak valid, satu alamat email dan stream transport |
| [workflows.test.js](../server/workflows.test.js) | 5 | Token/UID palsu, kegagalan undangan, NIM duplikat, larangan Head membuat akun, rating melalui handler mock |
| [profiles.test.js](../server/profiles.test.js) | 4 | Pembaruan profil, penolakan input, kegagalan batch Firestore, pemulihan snapshot setelah commit SQL gagal |
| **Total** | **31** | Jumlah test runner; setiap test dapat memuat beberapa assertion |

## Kasus uji perilaku: diharapkan vs aktual

Lulus di bawah berarti lulus pada lapisan yang disebutkan, bukan sertifikasi end-to-end lingkungan kampus. Satu UC dapat memiliki cakupan parsial.

| ID / UC | Masukan atau aksi | Hasil diharapkan | Hasil aktual dan bukti |
|---|---|---|---|
| TC-01 / UC-01 | Header UID tanpa Bearer atau token palsu | Tolak 401 | Lulus; workflows, authenticate dengan Auth mock |
| TC-02 / UC-01 | Keluar lalu Buka demo lokal | Login tampil, demo dapat dibuka kembali | Lulus; ui, JSDOM. Login email/password Firebase nyata belum diuji |
| TC-03 / UC-02 | QR identitas valid, JSON dengan NIM object/number, tipe receipt/service | Hanya identitas bertipe santap.student v1 atau NIM mentah valid diterima parser identitas | Lulus; validation. Kamera dan unduh PNG belum diuji |
| TC-04 / UC-03 | Mahasiswa membuat antrean untuk NIM sendiri | waiting dengan proyeksi publik tanpa nama/NIM | Lulus; firestoreOperations dengan DB mock |
| TC-05 / UC-03 | Permintaan memakai NIM mahasiswa lain | Tolak 403 | Lulus; operations pada operasi SQL mock |
| TC-06 / UC-04 | Masukkan tidak-ada | Tampilkan Mahasiswa tidak ditemukan | Lulus; ui pada layar Staff |
| TC-07 / UC-04 | NIM 23101001, Catat pengambilan saat buka | Sukses; tombol berubah Sudah tercatat | Lulus; ui demo, state bertahan saat ganti role |
| TC-08 / UC-04 | Dua request pengambilan NIM/periode/tanggal sama | Hanya satu catatan; duplikat ditolak | Lulus; firestoreOperations memakai transaksi mock berurutan; bukan uji beban database |
| TC-09 / UC-04 | Tepat jam tutup atau expectedDate kemarin | Tolak tanpa catatan baru | Lulus; operations dan firestoreOperations |
| TC-10 / UC-05 | Staff membatalkan antrean lalu mahasiswa masuk ulang | cancelled, tanpa meal record, ID publik baru | Lulus; firestoreOperations mock |
| TC-11 / UC-05 | Mahasiswa meminta pembatalan | Tolak 403 | Lulus; operations mock |
| TC-12 / UC-06 | Campur antrean/record hari ini, kemarin, periode lain, completed | Statistik hanya periode terpilih hari ini | Lulus; render memeriksa angka Total pengambilan dan Antrean menunggu = 1 |
| TC-13 / UC-07 | 10 menit sebelum tutup dan tepat tutup | Peringatan aktif sebelum tutup saja | Lulus; operations dan render |
| TC-14 / UC-07 | Pemicu push berulang, layanan dijeda, role dicabut | Tidak ada pengiriman ganda/tidak berhak | Lulus; notifications mock. Pengiriman perangkat nyata belum diuji |
| TC-15 / UC-08 | Head pindah Monitoring ↔ Antrean & Validasi | Kedua halaman dapat dibuka | Lulus; ui JSDOM |
| TC-16 / UC-08 | Head POST pembuatan akun | Tolak 403 | Lulus; workflows handler mock |
| TC-17 / UC-09 | Nama/fakultas dengan spasi, residence valid | Nilai dipangkas, user/master diperbarui, identitas tetap | Lulus; profiles mock; UI dengan backend nyata belum diuji |
| TC-18 / UC-09 | Nama kosong pada mode SQL | Tolak, Firestore tetap utuh | Lulus; profiles regresi pemulihan |
| TC-19 / UC-09 | Batch Firestore gagal / commit SQL gagal | Rollback SQL; pulihkan Firestore hanya jika telah berubah, per snapshot asli | Lulus; profiles, kegagalan disuntikkan pada mock |
| TC-20 / UC-10 | Rating 4 tanpa saran, penerima/pengirim palsu di payload | Identitas/penerima ditentukan server | Lulus; workflows, email ditangkap mock |
| TC-21 / UC-10 | Rating 6 | Tolak 400, tidak memanggil kirim email | Lulus; workflows |
| TC-22 / UC-11 | Jadwal valid atau bertumpuk | Terima konfigurasi valid, tolak overlap | Lulus; operations fungsi validasi. Simpan konfigurasi via Admin ke layanan nyata belum diuji |

## Regresi dan asal perbaikan

Audit sebelumnya memperbaiki reset demo saat ganti role, sisa state antarsesi, parser QR, validasi periode/ID, filter monitoring, validasi alamat email, serta tombol tutup scanner. Perbaikan Gemini yang ditemukan saat melanjutkan adalah pemulihan alias lucide CJS dan flushing cleanup test UI. Audit lanjutan memperbaiki pemulihan profil lintas store, mengganti hash NIM antrean publik dengan UUID acak, memperjelas label statistik, menambah assertion monitoring/Head, dan mematikan WebSocket pada test Vite.

Proteksi WITA, transaksi makan, proyeksi antrean publik, dan validasi sinkronisasi offline telah ada sebelum audit ini; suite menguji ulang perilakunya. Jangan menganggap seluruh fitur tersebut baru dibuat dalam audit. Detail ada di [daftar perubahan](DAFTAR_PERUBAHAN.md).

## Pengujian yang belum dilaksanakan

1. Login/role nyata dengan Firebase dan penegakan Firestore Rules melalui emulator atau layanan nyata.
2. Impor skema dan operasi MySQL nyata, konkurensi, kegagalan jaringan lintas SQL/Firestore, serta rekonsiliasi jika kompensasi ikut gagal.
3. Kamera, QR receipt, unduh PNG, responsivitas, keyboard, pembaca layar, dan kontras pada browser/perangkat fisik.
4. SMTP/inbox dan Web Push nyata; izin notifikasi, background delivery, serta perangkat mobile.
5. Uji beban kampus untuk NFR waktu respons maksimal 3 detik dan penerimaan pengguna.
6. Sinkronisasi laporan ke template Word/Excel, verifikasi slide, serta latihan presentasi 20 menit.

ID publik acak berlaku untuk antrean yang baru dibuat. Dokumen antrean publik lama yang memakai hash deterministik tidak dimigrasikan oleh audit ini; lakukan retensi/pembersihan pada lingkungan uji sebelum menggunakan data operasional sensitif.
