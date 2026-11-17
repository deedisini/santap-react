# Panduan Skenario Presentasi Akhir dan Live Demo 20 Menit SANTAP

Dokumen ini adalah skenario panduan pelaksanaan presentasi akhir dan demonstrasi langsung (*live demo*) prototipe **SANTAP (Sistem Antrean dan Pencatatan Aktivitas Pengambilan Makanan)** untuk Fern Wallace Dining Hall, Universitas Klabat.

Struktur dan durasi panduan ini dirancang memenuhi **Rubrik Penilaian 6 (S1 s/d S6, K1 s/d K5)** mata kuliah System Analysis and Design (SAD).

---

> Ini rencana presentasi, bukan bukti latihan atau persetujuan stakeholder. Pembicara adalah usulan peran; sesuaikan dengan anggota nyata. Slide/template dan durasi aktual belum diverifikasi.

## 1. Alokasi Waktu Presentasi (Total 20 Menit)

| Sesi | Topik Bahasan | Durasi | Pembicara yang Disarankan |
|---|---|---|---|
| **Sesi 1** | Latar Belakang Masalah, Objek Nyata, Analisis ITPOSMO & SDLC | 3 Menit | Anggota 1 (Project Manager / Analyst) |
| **Sesi 2** | Elisitasi Kebutuhan, Kebutuhan Inti (MoSCoW), & Aturan Bisnis | 3 Menit | Anggota 2 (Requirement Engineer) |
| **Sesi 3** | Arsitektur Sistem, Pemodelan UML, & Desain Basis Data | 3 Menit | Anggota 3 (System Architect / Designer) |
| **Sesi 4** | **Live Demo Aplikasi Interaktif (5 Peran Pengguna + Error Cases)** | 8 Menit | Anggota 4 & Anggota 5 (Full-stack Developer & Tester) |
| **Sesi 5** | Hasil Pengujian Otomatis, Mitigasi Risiko, & Penutup / Q&A | 3 Menit | Seluruh Anggota Tim |

---

## 2. Naskah Presentasi Teori & Desain (Menit 00:00 – 09:00)

### 2.1 Sesi 1: Masalah dan Analisis Gap (00:00 – 03:00)
- **Salam Pembuka & Pengenalan Objek:**
  *"Selamat pagi/siang dosen penguji dan rekan-rekan. Kami mempresentasikan SANTAP, solusi digitalisasi antrean dan validasi pengambilan makanan untuk Fern Wallace Dining Hall Universitas Klabat."*
- **Masalah Utama (*Problem Statement*):**
  Pada jam-jam puncak (pagi 05.30–08.00, siang 11.30–13.00, malam 17.00–18.30), pencatatan manual berbasis kertas atau pengecekan visual menghadapi 3 kendala besar:
  1. *Pengambilan Ganda:* Mahasiswa berpotensi mengambil lebih dari satu jatah porsi makan karena tidak ada validasi terpusat seketika.
  2. *Waktu Tunggu Antrean:* Pencocokan identitas yang tidak efisien berpotensi memperlambat pelayanan; konfirmasikan kondisi as-is dengan narasumber, jangan menyebut penggunaan lembar cetak sebagai hasil observasi yang belum dibuktikan.
  3. *Ketiadaan Visibilitas Pengelola:* Kepala Dining Hall dan Supervisor tidak memiliki metrik jumlah porsi dan rasio penghuni asrama vs non-penghuni secara waktu nyata.
- **Analisis Design-Reality Gap (ITPOSMO):**
  Jelaskan kesenjangan antara kondisi manual (kertas, rentan manipulasi) dengan solusi SANTAP (QR kode unik, validasi otomatis, basis data terverifikasi).
- **Justifikasi Model SDLC:**
  Mengapa memilih **Agile Iterative Incremental**? Karena kebutuhan operasional Dining Hall memerlukan umpan balik cepat dari staf lapangan dan penyempurnaan fitur bertahap dalam 3 minggu (Minggu 1 Discovery, Minggu 2 Core Operations, Minggu 3 Hardening & Audit), berbeda dari Waterfall yang kaku atau Prototyping yang sering mengabaikan arsitektur data formal.

### 2.2 Sesi 2: Elisitasi dan Kebutuhan Sistem (03:00 – 06:00)
- **Metode Elisitasi:** Wawancara langsung dengan pemangku kepentingan Dining Hall dan studi dokumen spesifikasi operasional KINTARA.
- **Kebutuhan Fungsional (MoSCoW):**
  - **Must Have (13 FR):** Autentikasi role, pencegahan jatah ganda per periode, integrasi jam operasional resmi WITA (UTC+8), identifikasi QR/Barcode/NIM manual, transaksi atomik pencatatan makan, pengingat 10 menit sebelum jam tutup, dan otorisasi terpadu untuk peran Head.
  - **Should Have (5 FR):** QR identitas mahasiswa, antrean mandiri mahasiswa, penyelesaian/pembatalan antrean, visualisasi metrik monitoring, dan rating layanan.
  - **Could Have (2 FR):** Tema visual Sabat (Jumat 18.00 s/d Sabtu 18.00 WITA) dan penyimpanan sementara saat offline (*pending scans*).
- **Aturan Bisnis Kunci:**
  - *BR-01:* Zona waktu resmi menggunakan Asia/Makassar (WITA). Buka inklusif, tutup eksklusif.
  - *BR-04:* Kombinasi NIM + Tanggal WITA + Periode Makan bersifat unik.

### 2.3 Sesi 3: Arsitektur dan Pemodelan Sistem (06:00 – 09:00)
- **Use Case & Activity Diagram:**
  Tampilkan [SANTAP_V1_2_USE_CASE.svg](../models/SANTAP_V1_2_USE_CASE.svg) dan [SANTAP_V1_2_MEAL_ACTIVITY.svg](../models/SANTAP_V1_2_MEAL_ACTIVITY.svg). Jelaskan swimlane pemisahan tanggung jawab antara Mahasiswa, Petugas Staff, dan Sistem Server.
- **Sequence Diagram & Struktur Kelas:**
  Tunjukkan [SANTAP_V1_2_MEAL_SEQUENCE.svg](../models/SANTAP_V1_2_MEAL_SEQUENCE.svg) yang memperlihatkan fragmen alternatif (`alt`): jika belum makan -> berhasil dicatat dan antrean diselesaikan; jika sudah makan -> transaksi di-rollback dan penolakan dikembalikan.
- **Model Data & Kamus Data:**
  Perlihatkan [SANTAP_V1_2_CONCEPTUAL_ERD.svg](../models/SANTAP_V1_2_CONCEPTUAL_ERD.svg) dan jelaskan relasi mahasiswa, periode, antrean, catatan pengambilan, serta proyeksi antrean publik di Cloud Firestore.

---

## 3. Skenario Live Demo Interaktif (Menit 09:00 – 17:00)

> **Persiapan Sebelum Tampil:**
> Jalankan perintah demo lokal di terminal:
> ```powershell
> npm run demo
> ```
> Jika presentasi berlangsung di luar jam layanan, ubah jadwal **mode demo** melalui Admin terlebih dahulu, hindari interval tumpang tindih, lalu pilih periode yang dibuka. Setelah refresh, konfigurasi demo kembali ke nilai awal.
> Buka browser pada alamat `http://localhost:5173`. Pastikan layar bersih dan siap di jendela demo.

### Langkah Demi Langkah Live Demo

#### Tahap 1: Pengenalan Layar dan Peran Mahasiswa (2 Menit)
1. **Antarmuka Mahasiswa (L-02 & L-03):**
   - Tunjukkan pemilih peran demo di pojok kanan atas: *"Gunakan demo sebagai Mahasiswa"*.
   - Pilih mahasiswa contoh: **Adrian Matthew (23101001)**.
   - **Kartu Mahasiswa & QR Identitas:** Tunjukkan kartu mahasiswa digital lengkap dengan nama, fakultas, status tempat tinggal (Penghuni Asrama), dan tombol *Unduh QR identitas*.
   - **Antrean Layanan:** Klik tombol **Masuk antrean**. Tunjukkan bahwa antrean berhasil dibuat dengan status `waiting`. Jelaskan bahwa antrean publik melindungi privasi dengan menyembunyikan identitas mahasiswa lain.
   - **Uji Coba Masuk Antrean Ganda (Negatif):** Tunjukkan tombol yang berubah menjadi *Sudah masuk antrean* dan dinonaktifkan; tidak perlu mencoba mengeklik tombol disabled.

#### Tahap 2: Pelayanan dan Validasi oleh Staff (2.5 Menit)
2. **Beralih ke Peran Staff (L-04):**
   - Ubah pemilih peran menjadi **Staff**.
   - Tunjukkan jam operasional WITA di panel atas dan status periode makan (Pagi / Siang / Malam).
   - **Metode 1: Identifikasi dengan NIM Manual (Contoh Salah / Negatif):**
     - Masukkan NIM sembarang: `tidak-ada` lalu klik tombol **Identifikasi**.
     - Tunjukkan pesan kesalahan berwarna merah: *"Mahasiswa tidak ditemukan. Periksa NIM yang dimasukkan"*. Tunjukkan bahwa tombol pencatatan tetap nonaktif.
   - **Metode 2: Identifikasi Mahasiswa Valid:**
     - Masukkan NIM: `23101001` lalu klik **Identifikasi**.
     - Sistem langsung menampilkan profil Adrian Matthew, fakultas, status asrama, serta badge hijau *"Teridentifikasi"*.
   - **Pencatatan Transaksi:**
     - Klik tombol hijau **Catat pengambilan**.
     - Sistem memproses secara instan: muncul konfirmasi sukses *"Pengambilan Adrian Matthew berhasil dicatat"* dan antrean mahasiswa otomatis terselesaikan.
     - Tunjukkan **QR Bukti Pengambilan (Receipt QR)** yang muncul untuk dipindai atau dicocokkan oleh mahasiswa.
   - **Pencegahan Pengambilan Ganda (Uji Keamanan Kunci):**
     - Klik kembali tombol **Identifikasi** untuk NIM `23101001`.
     - Sistem mendeteksi transaksi yang baru saja dicatat: muncul badge kuning *"Sudah mengambil"* dan tombol pencatatan menjadi dinonaktifkan dengan tulisan *"Sudah tercatat"*.

#### Tahap 3: Verifikasi Status di Sisi Mahasiswa (1 Menit)
3. **Kembali ke Mahasiswa:**
   - Ganti peran kembali ke **Mahasiswa**.
   - Tunjukkan bahwa dashboard mahasiswa kini memperlihatkan tanda centang hijau *"Pengambilan periode ini sudah tercatat pada..."* dan tombol masuk antrean terkunci.
   - **Rating Layanan (UC-10):**
     - Tunjukkan panel masukan layanan (*FeedbackPanel*).
     - Berikan rating 5 bintang, isi saran singkat *"Pelayanan cepat dan ramah"*, lalu klik **Pratinjau masukan**. Tegaskan bahwa mode demo tidak mengirim email.

#### Tahap 4: Monitoring Operasional oleh Supervisor & Head (1.5 Menit)
4. **Beralih ke Peran Supervisor / Head (L-05):**
   - Ganti peran ke **Supervisor**.
   - Tunjukkan dashboard metrik:
     - Total porsi terlayani hari ini.
     - Rasio perbandingan Penghuni Asrama vs Non-penghuni.
     - Daftar antrean yang sedang menunggu dan riwayat transaksi.
   - **Simulasi Peringatan Penutupan Layanan (UC-07):**
     - Tunjukkan jam operasional WITA di widget *OperationsClock*.
     - Jelaskan bahwa 10 menit sebelum jam layanan ditutup (misal pukul 07.50 WITA untuk makan pagi), sistem otomatis memunculkan banner peringatan kuning di bagian atas layar agar pengawas dan staf bersiap menutup layanan.
   - **Akses Terpadu Peran Head (L-04 & L-05):**
     - Ganti peran ke **Head**. Tunjukkan bahwa Head memiliki akses navigasi *Antrean & Validasi* (seperti Staff) dan *Monitoring* (seperti Supervisor).

#### Tahap 5: Administrasi Sistem dan Penyesuaian Jadwal oleh Admin (1 Menit)
5. **Beralih ke Peran Admin (L-06):**
   - Ganti peran ke **Admin**.
   - **Manajemen Profil Mahasiswa:** Buka editor profil, perbarui status asrama mahasiswa dari non-penghuni menjadi penghuni asrama.
   - **Konfigurasi Operasional & Tema Sabat:**
     - Tunjukkan tabel konfigurasi jam operasional.
     - Tunjukkan sakelar *Tema Sabat* otomatis (Jumat 18.00 s/d Sabtu 18.00 WITA) yang memberikan nuansa aksen visual damai bagi sivitas akademika Universitas Klabat tanpa mengubah aturan hak makan.

---

## 4. Pengujian dan Penutup (Menit 17:00 – 20:00)

### 4.1 Ringkasan Pengujian Otomatis
- Tunjukkan bukti eksekusi pengujian:
  ```powershell
  npm test
  ```
- Soroti jumlah pengujian otomatis aktual (`node:test`) yang mencakup operasi Firestore dengan mock, validasi role, QR, WITA, email, push, serta regresi profil. Hasil ini belum membuktikan konkurensi database atau layanan eksternal nyata; gunakan [laporan pengujian](../PENGUJIAN.md) untuk batas bukti.

### 4.2 Kesimpulan & Penutup
- *"SANTAP berhasil menjawab kebutuhan Fern Wallace Dining Hall melalui sistem yang cepat, mencegah duplikasi porsi makan secara andal, melindungi privasi mahasiswa, dan memberikan visibilitas penuh bagi pimpinan Dining Hall."*
- Buka sesi tanya jawab dengan dosen penguji.

---

## 5. Tips Mengatasi Kendala Saat Live Demo (*Troubleshooting*)

1. **Bagaimana jika jaringan kampus / internet terputus saat presentasi?**
   - Jangan panik. Mode demo (`npm run demo`) beroperasi 100% secara lokal (*in-memory*) di peramban tanpa memerlukan koneksi ke internet, Firebase, maupun database eksternal.
2. **Bagaimana jika waktu demo berada di luar jam makan Dining Hall?**
   - Masuk ke peran **Admin**, buka tab *Pengaturan Operasional*, sesuaikan sementara jam periode aktif dengan jam saat presentasi berlangsung, simpan, lalu kembali ke layar Staff.
3. **Bagaimana cara mengulang data demo dari awal?**
   - Cukup lakukan *refresh* (tekan tombol `F5` atau `Ctrl+R`) pada browser. Data contoh akan kembali ke kondisi awal yang bersih.
