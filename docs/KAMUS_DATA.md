# Kamus Data dan Pemetaan Domain SANTAP v1.2

Dokumen ini mendokumentasikan spesifikasi struktur data, tipe data, batasan (*constraints*), hubungan antar-entitas, serta pemetaan formal dari diagram kelas domain ([SANTAP_V1_2_CLASS.puml](models/SANTAP_V1_2_CLASS.puml)) dan ERD ([SANTAP_V1_2_ERD.puml](models/SANTAP_V1_2_ERD.puml)) ke dalam implementasi database SQL ([schema.sql](../server/schema.sql)), Cloud Firestore ([firestore.rules](../firestore.rules), [operations.js](../server/operations.js)), dan penyimpanan lokal (*offline cache*).

Acuan teknis terkait: [SRS Final](srs/SANTAP_SRS_FINAL.md), [Matriks Keterlacakan](KETERLACAKAN.md), dan [Laporan Pengujian](PENGUJIAN.md).

---

## 1. Arsitektur Dual Persistence (SQL & NoSQL)

SANTAP dirancang mendukung dua mode penyimpanan operasional:
1. **Mode SQL (MySQL / MariaDB):** Menggunakan skema relasional dengan *foreign keys*, indeks komposit, dan konstrain keunikan (*unique constraint*) untuk integritas data ketat.
2. **Mode NoSQL (Cloud Firestore):** Menggunakan koleksi dokumen dengan transaksi atomik dan keamanan deklaratif berbasis aturan (*Security Rules*).
3. **Penyimpanan Lokal Klien (Web Storage / LocalStorage):** Menampung *pending scans* (identifikasi saat jaringan bermasalah) yang terisolasi per UID pengguna dan token perangkat *Web Push*.

Tautan antar-store bersifat logis. Sinkronisasi antar kedua basis data tidak dilakukan otomatis secara duplikasi penuh, melainkan dipilih via konfigurasi `VITE_SQL_API_URL`.

---

## 2. Kamus Data Entitas Relasional (MySQL / MariaDB)

### 2.1 Tabel `users`
Tabel SQL profil akun. Sumber otorisasi API tetap dokumen users/{uid} di Firestore, termasuk pada mode SQL; tabel ini bukan sumber role saat autentikasi.

| Nama Kolom | Tipe Data | Nullable | Keterangan & Batasan |
|---|---|---|---|
| `firebase_uid` | `VARCHAR(128)` | NO | **Primary Key**. UID terverifikasi dari Firebase Authentication. |
| `email` | `VARCHAR(255)` | NO | Alamat email institusi pengguna (contoh: `@unklab.ac.id`). |
| `name` | `VARCHAR(120)` | NO | Nama lengkap pengguna. |
| `role` | `ENUM` | NO | Kategori peran: `'Mahasiswa'`, `'Staff'`, `'Supervisor'`, `'Head'`, `'Admin'`. |
| `nim` | `VARCHAR(30)` | YES | **Unique Key**. Nomor Induk Mahasiswa (wajib jika role adalah `'Mahasiswa'`). |
| `created_at` | `TIMESTAMP` | Lihat DDL | Waktu akun didaftarkan (default: `CURRENT_TIMESTAMP`). |

### 2.2 Tabel `students`
Menyimpan data master mahasiswa penerima layanan Dining Hall.

| Nama Kolom | Tipe Data | Nullable | Keterangan & Batasan |
|---|---|---|---|
| `nim` | `VARCHAR(30)` | NO | **Primary Key**. Nomor Induk Mahasiswa unik (alfanumerik/strip/garis bawah, maks 30 karakter). |
| `name` | `VARCHAR(120)` | NO | Nama lengkap mahasiswa. |
| `faculty` | `VARCHAR(120)` | NO | Nama fakultas (contoh: `Informatika`, `Sistem Informasi`, `Akuntansi`). |
| `residence` | `ENUM` | NO | Status tempat tinggal: `'Penghuni Asrama'` atau `'Non-penghuni'`. |
| `email` | `VARCHAR(255)` | NO | Email kontak/profil mahasiswa; tidak ada pengiriman bukti otomatis berdasarkan kolom ini. |

### 2.3 Tabel `meal_periods`
Menyimpan metadata periode dan paused_date. Jadwal otoritatif dibaca dari settings/operations di Firestore; active/serving_time adalah metadata lama, bukan penentu final jadwal aktif.

| Nama Kolom | Tipe Data | Nullable | Keterangan & Batasan |
|---|---|---|---|
| `id` | `VARCHAR(30)` | NO | **Primary Key**. Pengenal periode: `'morning'`, `'afternoon'`, `'evening'`. |
| `label` | `VARCHAR(30)` | NO | Nama tampilan periode: `'Pagi'`, `'Siang'`, `'Malam'`. |
| `serving_time` | `VARCHAR(40)` | NO | Rentang jam saji (contoh: `'05:30-08:00'`, `'11:30-13:00'`, `'17:00-18:30'`). |
| `active` | `BOOLEAN` | NO | Status aktif bawaan periode (`TRUE` / `FALSE`). |
| `paused_date` | `DATE` | YES | Tanggal jeda sementara (format `YYYY-MM-DD`). Jika sama dengan hari berjalan, layanan ditutup sementara. |

### 2.4 Tabel `queues`
Menyimpan antrean pengambilan makanan mahasiswa pada hari berjalan.

| Nama Kolom | Tipe Data | Nullable | Keterangan & Batasan |
|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | NO | **Primary Key**, `AUTO_INCREMENT`. ID unik entri antrean. |
| `nim` | `VARCHAR(30)` | NO | **Foreign Key** ke `students(nim)`. Identitas mahasiswa yang mengantre. |
| `period_id` | `VARCHAR(30)` | NO | **Foreign Key** ke `meal_periods(id)`. Periode makan antrean. |
| `student_name` | `VARCHAR(120)` | NO | Nama mahasiswa (denormalisasi untuk performa antrean). |
| `status` | `ENUM` | NO | Status antrean: `'waiting'`, `'completed'`, `'cancelled'`. Default: `'waiting'`. |
| `joined_at` | `TIMESTAMP` | Lihat DDL | Waktu masuk antrean (default: `CURRENT_TIMESTAMP`). |
| `completed_at` | `TIMESTAMP` | YES | Waktu antrean diselesaikan dengan pengambilan; pembatalan hanya mengubah status. |
| `record_id` | `BIGINT UNSIGNED` | YES | Referensi logis ke `meal_records(id)` jika antrean diselesaikan dengan pengambilan makanan. |

> **Indeks Kinerja:** `INDEX queue_lookup (nim, period_id, status)` untuk membantu pencarian status antrean; latensi belum diukur pada database nyata.

### 2.5 Tabel `meal_records`
Menyimpan catatan transaksi resmi pengambilan makanan mahasiswa.

| Nama Kolom | Tipe Data | Nullable | Keterangan & Batasan |
|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | NO | **Primary Key**, `AUTO_INCREMENT`. ID unik bukti transaksi. |
| `nim` | `VARCHAR(30)` | NO | **Foreign Key** ke `students(nim)`. Mahasiswa penerima makanan. |
| `period_id` | `VARCHAR(30)` | NO | **Foreign Key** ke `meal_periods(id)`. ID periode makan. |
| `period_label` | `VARCHAR(30)` | NO | Label periode makan saat transaksi dicatat (`'Pagi'`, `'Siang'`, `'Malam'`). |
| `student_name` | `VARCHAR(120)` | NO | Nama mahasiswa saat transaksi. |
| `staff_uid` | `VARCHAR(128)` | NO | UID Firebase petugas pencatat (dari token sesi terverifikasi). |
| `staff_name` | `VARCHAR(120)` | NO | Nama petugas yang mencatat transaksi. |
| `verification_token` | `CHAR(36)` | NO | UUID v4 acak sebagai token verifikasi keaslian bukti pengambilan. |
| `served_date` | `DATE` | NO | Tanggal layanan resmi WITA (`YYYY-MM-DD`). |
| `served_time` | `TIME` | NO | Waktu pencatatan resmi WITA (`HH:MM:SS`). |
| `created_at` | `TIMESTAMP` | Lihat DDL | Timestamp waktu pembuatan entri database. |

> **Konstrain Kritis (Pencegahan Duplikasi):**
> `UNIQUE KEY record_lookup (nim, served_date, period_id)`
> Menjamin secara level basis data bahwa satu mahasiswa tidak dapat menerima lebih dari satu porsi makanan pada tanggal dan periode yang sama.

---

## 3. Kamus data Cloud Firestore

Aturan pembacaan klien mengikuti [firestore.rules](../firestore.rules). Semua penulisan langsung klien ditolak, termasuk untuk Admin; server memakai Admin SDK dan memeriksa token serta role pada API. ownNim membaca NIM dari users/{uid}, bukan custom claim token. ID dokumen merupakan key; loader dapat menambahkan properti id ke objek UI.

| Koleksi/key | Field yang disimpan | Pembacaan klien dan penulisan server |
|---|---|---|
| users/{uid} | role, nim opsional, name, email; faculty/residence untuk profil mahasiswa | Pemilik atau Staff/Supervisor/Head/Admin; API Admin mengelola |
| students/{nim} | nim, name, faculty, residence, email (string) | NIM sendiri atau Staff/Supervisor/Head/Admin; API Admin mengelola |
| mealPeriods/{id} | label/servingTime/active metadata seed opsional, pausedDate: string atau null | Semua yang login; operasi period server mengubah pausedDate |
| queues/{date_period_nim} | nim, periodId, date, studentName, status, joinedAt: timestamp, publicId: string; completedAt/recordId ketika selesai | NIM sendiri atau Staff/Supervisor/Head/Admin; transaksi API operasi |
| publicQueue/{randomUUID} | periodId, date, status, joinedAt: timestamp | Semua yang login; proyeksi tanpa nama/NIM. Key baru acak, bukan hash NIM. Key lama tidak dimigrasikan otomatis |
| mealRecords/{date_period_nim} | nim, periodId, period, studentName, staffUid, staffName, verificationToken, date, time (string), createdAt: timestamp | NIM sendiri atau Staff/Supervisor/Head/Admin; transaksi API operasi |
| settings/operations | schedules: map periode → label/open/close; evening menambah weekendOpen/weekendClose untuk Jumat–Sabtu. sabbath: enabled, startTime, endTime, windows | Semua yang login; Admin menyimpan melalui POST /api/admin/operations. GET /api/operations/config membaca |
| pushSubscriptions/{sha256_token} | uid, token: string, updatedAt: timestamp | Klien tidak boleh membaca/menulis langsung; Supervisor/Head mendaftar lewat /api/push/register |
| pushDeliveries/{eventId_subscriptionId} | attemptedAt: timestamp, status: sending/sent/failed, code opsional | Server saja; document.create mengklaim pengiriman sekali. Event ID ada di key, bukan field |

Dokumen SQL TIMESTAMP yang tidak menyebut NULL/NOT NULL secara eksplisit dicatat sebagai Lihat DDL di atas; perilaku akhirnya bergantung versi/konfigurasi server. Relasi users, staff_uid, push, dan antarstore merupakan relasi logis. queues.record_id belum memiliki FK SQL. Lihat [schema.sql](../server/schema.sql) sebagai sumber definisi fisik.

## 4. QR dan cache lokal

| Jenis | Payload/contoh | Pembuat dan penggunaan |
|---|---|---|
| Identitas | {"type":"santap.student","version":1,"nim":"23101001"} | [StudentPage](../src/pages/StudentPage.jsx) memakai canvas QR; diunduh sebagai PNG. Parser juga menerima NIM mentah alfanumerik, underscore, strip, panjang 1–30 |
| Penanda layanan | {"type":"santap.service","version":1} | [ServiceQr](../src/components/ServiceQr.jsx); marker umum, tidak memuat identitas/hak makan |
| Bukti pengambilan | {"type":"santap.meal-receipt","version":1,"recordId":104,"nim":"23101001","periodId":"morning","token":"UUID-bukti"} | [StaffPage](../src/pages/StaffPage.jsx) dan StudentPage; recordId angka pada SQL atau string pada Firestore. Dicocokkan terhadap record pengguna, bukan otorisasi untuk mencatat makan |

[pendingScans.js](../src/lib/pendingScans.js) memakai key localStorage **santap-pending-scans-${uid}**. Setiap entri berisi id UUID, nim, periodId, date WITA, observedAt ISO, status. Maksimal 100 entri dibaca. Cache adalah identifikasi belum final; server memvalidasi ulang tanggal, jadwal, profil, dan duplikasi ketika sinkronisasi. Cache bukan penyimpanan terenkripsi.

## 5. Pemetaan kelas domain ke fungsi nyata

Diagram adalah model domain, bukan deklarasi kelas JavaScript. Nilai kembali boolean pada diagram menyatakan keputusan domain; fungsi validasi implementasi dapat melempar error.

| Operasi konseptual | Implementasi nyata |
|---|---|
| UserProfile.canAccess | [auth.js](../server/auth.js): requireRole; navigasi [Sidebar](../src/components/Sidebar.jsx) |
| Student.isComplete | [operations.js](../server/operations.js): checkStudent |
| MealPeriod.window/isServing | [shared/operations.js](../shared/operations.js): periodWindow, assertServing |
| QueueEntry.cancel/complete | [operations.js](../server/operations.js): firestoreOperation dengan action cancel/meal; [sqlOperations.js](../server/sqlOperations.js): sqlOperation |
| MealRecord.isDuplicateOf | Pencarian record dalam transaksi Firestore + key deterministik; UNIQUE record_lookup SQL |
| OperationsConfig.validate/activePeriod | [shared/operations.js](../shared/operations.js): validateOperations, activePeriod |
| PushSubscription.isAuthorized | [push.js](../server/push.js): registerPush dan pemeriksaan role oleh dispatchClosingPush |
| PushDelivery.claimOnce | dispatchClosingPush memanggil document.create; already-exists menahan percobaan ulang |

Pembaruan profil memakai [updateStudentProfile](../server/profiles.js). Pada kegagalan commit SQL setelah batch Firestore berhasil, pemulihan memakai snapshot masing-masing dokumen. Ini kompensasi best-effort; bukan transaksi atomik terdistribusi dan tetap memerlukan rekonsiliasi jika pemulihan jaringan gagal.
