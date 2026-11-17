# SANTAP

Sistem Antrean dan Pencatatan Aktivitas Pengambilan makanan untuk Fern Wallace Dining Hall, Universitas Klabat. Antarmuka berbahasa Indonesia menyediakan QR identitas, antrean, validasi pengambilan, monitoring, administrasi, dan masukan mahasiswa.

## Mulai dari sini

- [Dokumentasi dan berkas pengumpulan](docs/README.md)
- [SRS final dan penjelasan revisi](docs/srs/SANTAP_SRS_FINAL.md)
- [Hasil pengujian dan bug yang diperbaiki](docs/PENGUJIAN.md)
- [Checklist rubrik 1–6](Penilaian/CHECKLIST_FINAL.md)
- [Skenario demo 20 menit](docs/presentation/PANDUAN_DEMO.md)

## Instalasi dan demo lokal

Gunakan Node.js **22.12 atau lebih baru** dan npm. Pemeriksaan terakhir memakai Node.js 26.7.0 pada Windows.

```powershell
npm ci
npm run demo
```

Buka alamat yang dicetak Vite, biasanya `http://localhost:5173`. Mode demo tidak membutuhkan kata sandi dan menyediakan pemilih peran Mahasiswa, Staff, Supervisor, Head, serta Admin. Data contoh berada di memori tab; pergantian peran mempertahankan transaksi, sedangkan memuat ulang halaman mengembalikan data contoh. Konfigurasi Firebase lokal tidak dipakai dalam mode ini.

Gunakan NIM `23101001` untuk contoh baru, `23101002` untuk antrean awal, dan `23101005` untuk contoh pengambilan pagi yang sudah tercatat. Nama/data contoh bukan bukti transaksi Dining Hall nyata. Demo tetap mengikuti jadwal layanan WITA. Untuk demo di luar jam makan, ubah jadwal melalui **Admin → konfigurasi operasional** dalam mode demo, lalu kembali ke Staff. Perubahan ini hanya berlaku di tab demo.

## Mode dengan backend

1. Salin [.env.example](.env.example) ke `.env.local` jika berkas lokal belum ada. Jangan menimpa konfigurasi yang sudah digunakan.
2. Isi konfigurasi Firebase. Aktifkan autentikasi email/password dan pasang [Firestore rules](firestore.rules). Simpan kredensial Firebase Admin di luar repository.
3. Buat Admin pertama mengikuti [panduan akun](docs/setup/ACCOUNT_SETUP.md). Akun operasional harus mempunyai profil Firestore dan role yang sah. Mahasiswa membutuhkan NIM dan profil lengkap. [Daftar akun demo historis](docs/setup/AKUN_DEMO.md) bukan jaminan akun masih aktif; kata sandi tidak disimpan di repository.
4. Jalankan terminal terpisah:

```powershell
npm run email-server
npm run dev
```

Service API port 8787 menangani akun, konfigurasi, operasi Firestore, email, dan push. Semua API tetap membutuhkan Firebase ID token. SMTP dan VAPID hanya diperlukan untuk email serta push nyata. Demo tidak mengirim pesan. Materi MySQL/MariaDB untuk tugas Database berada terpisah di [database-assignment/](database-assignment/), bukan bagian dari runtime SANTAP.

## Pemeriksaan dan build

```powershell
npm test
npm run build
npm run check:docs
npm audit
npm run preview
```

`preview` hanya untuk memeriksa hasil build. Pada deployment, `/api` harus diteruskan ke service API; proxy Vite development tidak otomatis ikut dalam hosting statis. Kamera/push memerlukan HTTPS atau localhost. Tidak ada klaim deployment produksi dari pekerjaan ini.

## Struktur proyek

```text
src/          React: halaman, komponen, akses API, gaya, data demo
server/       API Firebase, validasi, bootstrap akun, email, push, dan pengujian
shared/       Aturan waktu WITA dan format QR bersama
public/       Service worker notifikasi
docs/         SRS, model, setup, worksheet, presentasi, arsip
Penilaian/    Rubrik asli, inisiasi, elisitasi, checklist final
database-assignment/  Materi MySQL/MariaDB terpisah untuk tugas Database
tools/        Skrip dokumentasi dan pemeriksaan tautan
.vscode/      Task pengembangan editor
```

Folder dependensi, build, lingkungan Python, dan cache lokal diabaikan Git. Dokumen lama disimpan untuk keterlacakan; [indeks dokumentasi](docs/README.md) menjelaskan mana yang menjadi acuan terbaru.

[Daftar perubahan lengkap](docs/DAFTAR_PERUBAHAN.md) memisahkan perubahan awal, pekerjaan Gemini yang ditemukan, perbaikan audit, dan pemindahan berkas.

## Batas verifikasi

Uji otomatis menggunakan mock backend dan DOM simulasi, bukan database produksi atau kamera nyata. Autentikasi Firebase langsung, migrasi database nyata, penerimaan SMTP/push, responsif di perangkat, dan target respons tiga detik di jaringan kampus masih memerlukan uji penerimaan. Persetujuan dosen, bukti wawancara asli, identitas/contribusi anggota, serta pengumpulan resmi harus dilengkapi tim.

AI digunakan untuk membantu audit kode, perbaikan, pengujian, dan penyusunan dokumentasi. Tim bertanggung jawab meninjau hasil sebelum pengumpulan.
