# Checklist Penilaian 1–4 — System Analysis and Design SANTAP

Dokumen ini menyalin butir penilaian dari gambar rubrik yang diberikan untuk SANTAP. Simpan bersama dokumen proyek dan gunakan sebagai checklist; kolom status adalah penilaian kesiapan artefak saat ini, bukan nilai dari dosen.

**Skor rubrik:** 2 = lengkap dan benar; 1 = sebagian; 0 = tidak ada. Isi sel kuning pada lembar penilaian dosen.

## Penilaian 1 — Inisiasi proyek dan model SDLC

**Minggu 1 (2–6 Nov).** Memastikan masalah, objek, ruang lingkup, dan model SDLC jelas sebelum kebutuhan dikumpulkan.

| No. | Butir yang dicek | Bukti SANTAP saat ini | Status kesiapan |
|---|---|---|---|
| 1.1 | Nama sistem, latar belakang masalah, tujuan, dan manfaat dirumuskan dengan jelas | [DOKUMEN_INISIASI_SANTAP.md](./DOKUMEN_INISIASI_SANTAP.md), bagian 1.1 | Siap |
| 1.2 | Objek nyata atau realistis, berbeda dari kelompok lain, dan sudah disetujui dosen | Dokumen inisiasi, bagian 1.2; bukti persetujuan formal masih perlu dilampirkan | Sebagian |
| 1.3 | Stakeholder dan calon pengguna (aktor) diidentifikasi beserta kepentingannya | Dokumen inisiasi, bagian 1.3 | Siap |
| 1.4 | Kondisi saat ini (as-is) dijelaskan, termasuk analisis design-reality gap dengan 7 dimensi ITPOSMO | Dokumen inisiasi, bagian 1.4 | Siap |
| 1.5 | Ruang lingkup ditetapkan: apa yang termasuk dan tidak termasuk dalam sistem | Dokumen inisiasi, bagian 1.5 | Siap |
| 1.6 | Model SDLC dipilih dari materi, dengan alasan dan perbandingan terhadap minimal 2 model lain | Dokumen inisiasi, bagian 1.6 | Siap |
| 1.7 | Rencana kerja 3 minggu disusun sesuai tahapan/iterasi model SDLC yang dipilih | Dokumen inisiasi, bagian 1.7 | Siap |
| 1.8 | Rencana elisitasi: teknik, narasumber, dan draf daftar pertanyaan | Dokumen inisiasi, bagian 1.8 | Siap |
| 1.9 | Rencana platform dan teknologi (bahasa, framework, database, tools pemodelan) | Dokumen inisiasi, bagian 1.9 | Siap |
| 1.10 | Pembagian peran anggota tercantum; repository dan folder kerja bersama sudah dibuat | Dokumen inisiasi, bagian 1.10; nama anggota masih perlu diisi tim | Sebagian |

## Penilaian 2 — Elisitasi kebutuhan dan SRS

**Minggu 1 (2–6 Nov).** Memeriksa hasil elisitasi dan kualitas kebutuhan yang dituliskan dalam SRS.

| No. | Butir yang dicek | Bukti SANTAP saat ini | Status kesiapan |
|---|---|---|---|
| 2.1 | Elisitasi dilakukan dengan minimal 2 teknik kepada narasumber nyata atau representatif, dengan bukti | [ELISITASI_SRS_SANTAP.md](./ELISITASI_SRS_SANTAP.md), bagian 2.1 | Siap; bukti kegiatan lapangan tambahan diperlukan bila dosen mensyaratkannya |
| 2.2 | Minimal 10 pertanyaan wawancara/kuesioner beserta jawabannya terdokumentasi | Dokumen elisitasi, bagian 2.2 (12 pertanyaan) | Siap |
| 2.3 | Minimal 10 kebutuhan fungsional, ber-ID (FR-xx), dan dapat ditelusuri ke hasil elisitasi | Dokumen elisitasi, bagian 2.3 (FR-01 s.d. FR-18) | Siap |
| 2.4 | Minimal 5 kebutuhan non-fungsional dari kategori berbeda (kinerja, keamanan, kegunaan, keandalan, integritas data) | Dokumen elisitasi, bagian 2.4 (NFR-01 s.d. NFR-07) | Siap |
| 2.5 | Kebutuhan ditulis jelas dan dapat diuji (satu kebutuhan per pernyataan, tidak ambigu) | Dokumen elisitasi, bagian 2.5 | Siap |
| 2.6 | Prioritas kebutuhan ditentukan (MoSCoW) dan dipakai untuk menentukan cakupan pengembangan | Dokumen elisitasi, bagian 2.3 dan 2.6 | Siap |
| 2.7 | Aturan bisnis (business rules) dirumuskan | Dokumen elisitasi, bagian 2.7 | Siap |
| 2.8 | SRS Bagian 1–3 lengkap: overview, sistem saat ini, dependensi dan batasan | Dokumen elisitasi, bagian 2.8 | Siap |
| 2.9 | Analisis kelayakan singkat: teknis, ekonomi, dan operasional | Dokumen elisitasi, bagian 2.9 | Siap |
| 2.10 | Kebutuhan dicatat di sheet Kebutuhan pada Lembar Kerja Proyek | Dokumen elisitasi, bagian 2.10; sinkronkan workbook dengan revisi v1.2 sebelum penilaian | Sebagian |

## Penilaian 3 — Pemodelan perilaku: use case dan activity

**Minggu 2 (9–13 Nov).** Menilai ketepatan pemodelan interaksi pengguna dan alur kerja berdasarkan kebutuhan.

| No. | Butir yang dicek | Bukti SANTAP saat ini | Status kesiapan |
|---|---|---|---|
| 3.1 | Use case diagram: aktor, use case, dan batas sistem (system boundary) digambar dengan notasi yang benar | [SANTAP_V1_2_USE_CASE.puml](./docs/models/SANTAP_V1_2_USE_CASE.puml) | Siap |
| 3.2 | Relasi include, extend, dan generalisasi dipakai dengan tepat (jika ada) | Tinjau/ tambahkan relasi pada use case diagram jika memang diperlukan oleh alur | Perlu ditinjau |
| 3.3 | Minimal 2 aktor dan 6 use case yang mencakup semua kebutuhan fungsional prioritas Must | Use case v1.2 memuat 5 aktor dan 11 use case; pastikan FR Must terpetakan | Siap |
| 3.4 | Use case description lengkap untuk setiap use case: aktor, prakondisi, pascakondisi, alur utama, alur alternatif/eksepsi | Dokumen elisitasi, bagian 3.4; perlu lengkapi deskripsi untuk UC v1.2 yang belum tercakup | Sebagian |
| 3.5 | Minimal 3 activity diagram untuk use case utama dengan notasi benar (initial, final, decision, merge, fork/join) | [SANTAP_V1_2_MEAL_ACTIVITY.puml](./docs/models/SANTAP_V1_2_MEAL_ACTIVITY.puml) dan [SANTAP_V1_2_CLOSING_ACTIVITY.puml](./docs/models/SANTAP_V1_2_CLOSING_ACTIVITY.puml); masih perlu satu diagram lagi | Sebagian |
| 3.6 | Activity diagram memakai swimlane yang memisahkan aktor dan sistem | Meal activity memisahkan Staff dan Server; pastikan tiga diagram memenuhi ketentuan ini | Sebagian |
| 3.7 | Langkah di activity diagram konsisten dengan alur di use case description | Perlu review akhir setelah seluruh deskripsi/diagram dilengkapi | Perlu ditinjau |
| 3.8 | Setiap use case terhubung ke kebutuhan fungsional di matriks keterlacakan | Dokumen elisitasi, bagian 3.8; [usulan SRS v1.2](./SANTAP_SRS_V1_2_PROPOSED.md) | Siap |
| 3.9 | Diagram dibuat dengan tools pemodelan, rapi, dan terbaca | Sumber PlantUML di [docs/models/](./docs/models/) | Siap; render final perlu diperiksa |

## Penilaian 4 — Pemodelan interaksi, struktur, data, dan UI

**Minggu 2 (9–13 Nov).** Menilai penerjemahan model perilaku menjadi rancangan interaksi, struktur kelas, data, dan UI.

| No. | Butir yang dicek | Bukti SANTAP saat ini | Status kesiapan |
|---|---|---|---|
| 4.1 | Minimal 3 sequence diagram untuk use case utama: lifeline, pesan, pesan balasan, dan fragmen alt/opt/loop jika perlu | [Meal sequence](../docs/models/SANTAP_V1_2_MEAL_SEQUENCE.puml), [queue sequence](../docs/models/SANTAP_V1_2_QUEUE_SEQUENCE.puml), dan [profile sequence](../docs/models/SANTAP_V1_2_PROFILE_SEQUENCE.puml) | Siap; render final perlu diperiksa |
| 4.2 | Objek dan pesan di sequence diagram konsisten dengan kelas dan operasi di class diagram | Bergantung pada sequence dan class diagram | Belum siap |
| 4.3 | Class diagram minimal 5 kelas lengkap dengan atribut (bertipe), operasi, dan visibility | Belum ada sumber class diagram di [docs/models/](./docs/models/) | Belum siap |
| 4.4 | Relasi antarkelas benar: asosiasi, multiplicity, agregasi/komposisi, generalisasi | Bergantung pada class diagram | Belum siap |
| 4.5 | Model data (ERD atau skema database) minimal 5 entitas/tabel dengan PK, FK, dan kardinalitas | [SANTAP_V1_2_ERD.puml](./docs/models/SANTAP_V1_2_ERD.puml); cocokkan PK/FK eksplisit dengan [schema.sql](./server/schema.sql) | Sebagian |
| 4.6 | Model data konsisten dengan class diagram dan dilengkapi kamus data (nama kolom, tipe, keterangan) | Skema SQL tersedia, tetapi class diagram dan kamus data formal masih perlu dibuat | Belum siap |
| 4.7 | Prototipe UI minimal 6 layar yang mencakup use case utama, dapat diklik (clickable) | Prototype React di [src/](./src/); buat daftar enam layar dan bukti klik untuk demo | Sebagian |
| 4.8 | UI menerapkan prinsip desain input/output: konsisten, validasi input, pesan kesalahan yang jelas | Implementasi React dan validasi API; lakukan review UI akhir | Sebagian |
| 4.9 | Arsitektur sistem dan teknologi final ditetapkan; kerangka proyek dan database awal sudah ada di repository | Dokumen inisiasi, bagian 1.9; [src/](./src/), [server/](./server/), dan [schema.sql](./server/schema.sql) | Siap |
| 4.10 | Matriks keterlacakan diperbarui: kebutuhan → use case → diagram → kelas/tabel → layar | Matriks saat ini mencakup kebutuhan, use case, activity; perlu ditambah sequence, class, tabel, dan layar setelah artefaknya dibuat | Sebagian |

## Prioritas tindak lanjut Penilaian 4

1. Buat tiga sequence diagram untuk proses pengambilan makanan, antrean, dan kelola profil/akun.
2. Buat satu class diagram dengan minimal lima kelas dan cocokkan dengan operasi serta ERD.
3. Buat kamus data dari [schema.sql](./server/schema.sql) dan verifikasi PK, FK, tipe, serta kardinalitas.
4. Dokumentasikan enam layar clickable beserta tautan kebutuhan dan use case pada matriks keterlacakan.
5. Render seluruh PlantUML dan lakukan pemeriksaan keterbacaan sebelum dikumpulkan.
