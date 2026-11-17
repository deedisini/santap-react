# Kamus Data dan Pemetaan Domain SANTAP v1.2

Dokumen ini mendokumentasikan struktur data, batasan, hubungan antar-entitas, dan pemetaan dari [diagram kelas](models/SANTAP_V1_2_CLASS.puml) serta [conceptual/logical ERD](models/SANTAP_V1_2_CONCEPTUAL_ERD.puml) ke Cloud Firestore dan penyimpanan lokal. SANTAP menggunakan Firebase Authentication dan Cloud Firestore sebagai backend operasional tunggal. Materi relasional MySQL/MariaDB dipisahkan ke [tugas Database](../database-assignment/).

Acuan teknis terkait: [SRS Final](srs/SANTAP_SRS_FINAL.md), [Matriks Keterlacakan](KETERLACAKAN.md), [Laporan Pengujian](PENGUJIAN.md), [Firestore rules](../firestore.rules), dan [operasi Firestore](../server/operations.js).

---

## 1. Arsitektur penyimpanan

1. **Firebase Authentication:** menerbitkan ID token; identitas dan role diverifikasi server.
2. **Cloud Firestore:** menyimpan profil, master mahasiswa, periode, antrean, catatan pengambilan, konfigurasi operasional, serta metadata push.
3. **Server Node.js:** memakai Firebase Admin SDK untuk validasi role dan transaksi Firestore. Semua penulisan klien langsung ditolak oleh rules.
4. **Penyimpanan lokal klien:** menampung identifikasi sementara saat jaringan bermasalah; data tersebut bukan bukti pengambilan final.
5. **SMTP:** dipakai oleh endpoint server untuk undangan akun, Email Laporan, serta pengiriman rating/saran mahasiswa. Email bukan penyimpanan data operasional.

## 2. Kamus data Cloud Firestore

| Koleksi/key | Field utama | Pembacaan dan penulisan |
|---|---|---|
| `users/{uid}` | `role`, `nim` opsional, `nip` opsional, `name`, `email`; `faculty`/`residence` untuk mahasiswa | Pemilik atau Staff/Supervisor/Head/Admin dapat membaca sesuai rules; server Admin SDK mengelola |
| `studentAccounts/{nim}` | `uid`, `email` | Server saja; klaim unik untuk mencegah satu NIM memiliki beberapa akun |
| `students/{nim}` | `nim`, `name`, `faculty`, `residence`, `email` | NIM sendiri atau Staff/Supervisor/Head/Admin; server mengubah |
| `mealPeriods/{id}` | `label`, `servingTime`, `active`, `pausedDate` | Pengguna login membaca; operasi server mengubah jeda layanan |
| `queues/{date_period_nim}` | `nim`, `periodId`, `date`, `studentName`, `status`, `joinedAt`, `publicId`, `completedAt`/`recordId` | Pemilik atau Staff/Supervisor/Head/Admin; transaksi operasi server |
| `publicQueue/{randomUUID}` | `periodId`, `date`, `status`, `joinedAt` | Proyeksi antrean tanpa nama/NIM; dibuat dan diperbarui server |
| `mealRecords/{date_period_nim}` | `nim`, `periodId`, `period`, `studentName`, `staffUid`, `staffName`, `verificationToken`, `date`, `time`, `createdAt` | Pemilik atau Staff/Supervisor/Head/Admin; transaksi server mencegah duplikasi |
| `settings/operations` | `schedules`, `sabbath` | Semua pengguna login membaca; Admin menyimpan melalui `/api/admin/operations` |
| `pushSubscriptions/{sha256_token}` | `uid`, `token`, `updatedAt` | Server saja; Supervisor/Head mendaftar melalui `/api/push/register` |
| `pushDeliveries/{eventId_subscriptionId}` | `attemptedAt`, `status`, `code` opsional | Server saja; `create` mengklaim pengiriman sekali |

ID dokumen antrean dan catatan makan bersifat deterministik berdasarkan tanggal, periode, dan NIM. Transaksi Firestore memeriksa profil lengkap, jadwal WITA, antrean aktif, dan catatan makan yang sudah ada sebelum menulis.

## 3. QR, offline cache, email, dan feedback

| Jenis | Payload/contoh | Penggunaan |
|---|---|---|
| Identitas | `{"type":"santap.student","version":1,"nim":"23101001"}` | [StudentPage](../src/pages/StudentPage.jsx) menampilkan QR; parser juga menerima NIM mentah yang valid |
| Penanda layanan | `{"type":"santap.service","version":1}` | [ServiceQr](../src/components/ServiceQr.jsx); tidak memuat identitas |
| Bukti pengambilan | `{"type":"santap.meal-receipt","version":1,"recordId":"...","nim":"...","periodId":"morning","token":"..."}` | [StaffPage](../src/pages/StaffPage.jsx) dan StudentPage mencocokkan bukti terhadap catatan Firestore |

[pendingScans.js](../src/lib/pendingScans.js) memakai key `santap-pending-scans-${uid}`. Setiap entri berisi UUID, NIM, periode, tanggal WITA, waktu pengamatan, dan status. Saat sinkronisasi, server memvalidasi ulang jadwal, profil, tanggal, dan duplikasi.

[EmailReportPanel](../src/components/EmailReportPanel.jsx) menyusun ringkasan tujuh hari dari catatan Firestore yang sudah dimuat Supervisor/Head, lalu mengirimkannya melalui `/api/email-report`. [FeedbackPanel](../src/components/FeedbackPanel.jsx) mengirim rating 1–5 dan saran opsional melalui `/api/feedback`; server mengambil identitas Firebase mahasiswa dan mengirimkannya ke penerima `FEEDBACK_TO`. Feedback saat ini dikirim melalui email dan tidak disimpan sebagai riwayat review.

## 4. Pemetaan kelas domain ke fungsi nyata

| Operasi konseptual | Implementasi |
|---|---|
| `UserProfile.canAccess` | [auth.js](../server/auth.js): `authenticate` dan `requireRole`; navigasi [Sidebar](../src/components/Sidebar.jsx) |
| `Student.isComplete` | [operations.js](../server/operations.js): `checkStudent` |
| `MealPeriod.window/isServing` | [shared/operations.js](../shared/operations.js): `periodWindow`, `assertServing` |
| `QueueEntry.cancel/complete` | [operations.js](../server/operations.js): `firestoreOperation` |
| `MealRecord.isDuplicateOf` | Transaksi Firestore dan key deterministik pada `mealRecords` |
| `OperationsConfig.validate/activePeriod` | [shared/operations.js](../shared/operations.js): `validateOperations`, `activePeriod` |
| `PushSubscription.isAuthorized` | [push.js](../server/push.js): `registerPush` dan `dispatchClosingPush` |
| `PushDelivery.claimOnce` | `document.create` pada `pushDeliveries` |

Pembaruan profil mahasiswa memakai batch Firestore atomik di [profiles.js](../server/profiles.js). Tidak ada sinkronisasi atau transaksi lintas database di SANTAP.
