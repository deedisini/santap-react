# Checklist final berdasarkan rubrik Penilaian 1–6

Audit 17 November 2026. Status **Tersedia** berarti artefak dapat ditinjau, bukan skor dosen atau penerimaan produksi. **Sebagian** berarti ada bukti tetapi syarat belum semuanya dibuktikan. **Belum** berarti perlu pelaksanaan/bukti tambahan. Tidak ada nilai yang diisi atas nama dosen.

Sumber rubrik: enam gambar JPEG di [folder ini](./). Sumber teknis: [SRS final](../docs/srs/SANTAP_SRS_FINAL.md), [pengujian](../docs/PENGUJIAN.md), [perubahan](../docs/DAFTAR_PERUBAHAN.md).

## Penilaian 1 — Inisiasi

| Butir | Status | Bukti dan pekerjaan tersisa |
|---|---|---|
| 1.1 Nama, masalah, tujuan, manfaat | Tersedia | [Inisiasi §1.1](DOKUMEN_INISIASI_SANTAP.md) |
| 1.2 Objek realistis, berbeda, disetujui dosen | Sebagian | Objek tercatat; keunikan antar kelompok dan persetujuan dosen belum dibuktikan |
| 1.3 Stakeholder/aktor dan kepentingan | Tersedia | Inisiasi dan SRS; 5 role aplikasi |
| 1.4 As-is dan tujuh dimensi ITPOSMO | Tersedia | Inisiasi §1.4; konfirmasi kondisi lapangan tetap diperlukan |
| 1.5 Termasuk/tidak termasuk scope | Tersedia | Inisiasi dan SRS |
| 1.6 SDLC dan perbandingan dua alternatif | Tersedia | Inisiasi §1.6 |
| 1.7 Rencana tiga minggu | Tersedia | Inisiasi §1.7; rencana bukan bukti pelaksanaan |
| 1.8 Teknik, narasumber, draft pertanyaan | Tersedia | Inisiasi dan [elisitasi](ELISITASI_SRS_SANTAP.md) |
| 1.9 Platform/teknologi | Tersedia | [README](../README.md), SRS dan inisiasi |
| 1.10 Anggota, peran, repository/folder bersama | Sebagian | Struktur dan repository ada; lengkapi nama/NIM dan kontribusi nyata |

## Penilaian 2 — Elisitasi dan SRS

| Butir | Status | Bukti dan pekerjaan tersisa |
|---|---|---|
| 2.1 Dua teknik dan bukti narasumber | Sebagian | Elisitasi mereferensikan wawancara historis serta analisis dokumen KINTARA; tanggal/pewawancara dan bukti asli perlu dilampirkan |
| 2.2 Minimal 10 pertanyaan beserta jawaban | Tersedia | 12 pertanyaan dan parafrasa kebutuhan; bukan transkrip verbatim |
| 2.3 Minimal 10 FR ber-ID dan sumber | Tersedia | SRS final memuat 20 FR; sumber ELIS dan keputusan pemilik dibedakan |
| 2.4 Minimal 5 NFR kategori berbeda | Tersedia | 7 NFR; kinerja/aksesibilitas belum dibuktikan penuh |
| 2.5 Pernyataan jelas dan dapat diuji | Tersedia | Kriteria pada SRS dan test; lihat batas pengujian |
| 2.6 MoSCoW menentukan cakupan | Tersedia | 13 Must, 5 Should, 2 Could |
| 2.7 Aturan bisnis | Tersedia | SRS: WITA, jeda, duplikasi, role, data |
| 2.8 SRS bagian awal lengkap | Tersedia | Versi Markdown; kesesuaian semua field template Word perlu diselaraskan |
| 2.9 Kelayakan teknis/ekonomi/operasional | Tersedia | SRS dan elisitasi |
| 2.10 Sheet Kebutuhan | Sebagian | [Worksheet](../docs/worksheets/) ada sebagai snapshot; belum disinkronkan ke revisi FINAL |

## Penilaian 3 — Perilaku

| Butir | Status | Bukti dan pekerjaan tersisa |
|---|---|---|
| 3.1 Aktor, use case, batas sistem | Tersedia | [Use case](../docs/models/SANTAP_V1_2_USE_CASE.puml) dan SVG |
| 3.2 include/extend/generalisasi tepat jika ada | Tersedia | Tidak memaksakan relasi yang tidak diperlukan; login merupakan prasyarat |
| 3.3 Minimal 2 aktor, 6 use case, semua Must | Tersedia | 5 aktor dan 11 UC; pemetaan di [matriks](../docs/KETERLACAKAN.md) |
| 3.4 Deskripsi setiap use case | Tersedia | SRS §6: aktor, prakondisi, pascakondisi, alur dan alternatif |
| 3.5 Minimal 3 activity diagram | Tersedia | [Model](../docs/models/): pengambilan, penutupan, antrean |
| 3.6 Swimlane aktor/sistem | Tersedia | Ketiga activity menggunakan swimlane |
| 3.7 Konsistensi alur | Tersedia | Validasi dan cabang penolakan diselaraskan dengan SRS |
| 3.8 UC terhubung FR | Tersedia | Matriks keterlacakan; namespace FINAL berbeda dari dokumen historis |
| 3.9 Dibuat dengan tools dan terbaca | Tersedia | Sumber PlantUML dan SVG; gunakan SVG saat memperbesar untuk presentasi |

Gambar rubrik yang diberikan menampilkan 3.1–3.9. Tidak ditambahkan butir 3.10 sebagai persyaratan dosen yang tidak tampak pada sumber.

## Penilaian 4 — Interaksi, struktur, data, UI

| Butir | Status | Bukti dan pekerjaan tersisa |
|---|---|---|
| 4.1 Minimal 3 sequence diagram | Tersedia | Pengambilan, antrean, profil; request/response dan alt/opt |
| 4.2 Konsistensi sequence dan kelas | Tersedia | Model konseptual dipetakan ke fungsi nyata dalam [kamus data](../docs/KAMUS_DATA.md) |
| 4.3 Minimal 5 kelas, atribut/operasi/visibility | Tersedia | [Class](../docs/models/SANTAP_V1_2_CLASS.puml): 8 kelas domain dan enum |
| 4.4 Relasi dan multiplicity | Tersedia | Asosiasi/dependensi; tidak memaksakan komposisi/generalization yang tidak ada pada domain |
| 4.5 Minimal 5 tabel/entitas, PK/FK/kardinalitas | Tersedia | [Conceptual ERD](../docs/models/SANTAP_V1_2_CONCEPTUAL_ERD.puml) memuat entitas dan kardinalitas domain; relational SQL material is separate in [database-assignment](../database-assignment/) |
| 4.6 Model dan kamus data konsisten | Tersedia | Nama field, tipe, akses Firestore, QR, cache, dan fungsi diselaraskan dengan kode |
| 4.7 Minimal 6 layar clickable | Tersedia | 6 tampilan/panel fungsional SRS §8; bukan 6 URL terpisah |
| 4.8 Konsistensi/validasi/pesan UI | Sebagian | Validasi dan alur utama diuji DOM; kamera, seluruh keyboard/kontras/responsif belum diuji perangkat nyata |
| 4.9 Arsitektur final, kerangka/database awal | Tersedia | src/server/shared, Firestore rules dan collection mapping; koneksi Firebase nyata perlu verifikasi lingkungan |
| 4.10 Keterlacakan sampai kelas/tabel/layar | Tersedia | Matriks bersama kamus data dan SRS |

## Penilaian 5 — Pengembangan dan pengujian

| Butir | Status | Bukti dan pekerjaan tersisa |
|---|---|---|
| 5.1 Repository dan commit semua anggota | Sebagian | Repository ada; audit belum di-commit. Riwayat kontribusi semua anggota tidak dibuat/direkayasa |
| 5.2 Semua Must berjalan end-to-end | Sebagian | 31 test mock/DOM lulus; login/backend/perangkat nyata belum diuji end-to-end |
| 5.3 Database sesuai model | Sebagian | Firestore collections and operations are mapped; Firebase rules/emulator and production concurrency are not yet verified |
| 5.4 Struktur kode mengikuti domain | Tersedia | Pemetaan fungsi modul dalam kamus data; bukan kelas OOP literal |
| 5.5 UI dan alasan perubahan desain | Sebagian | [Daftar perubahan](../docs/DAFTAR_PERUBAHAN.md) dan SRS §8; pencocokan screenshot prototipe final belum dilakukan |
| 5.6 Validasi/error tidak crash | Sebagian | QR, NIM, periode, profil dan role diuji pada kasus tercatat; tidak mengklaim bebas semua bug |
| 5.7 Minimal 10 black-box, minimal 1/UC | Sebagian | 22 skenario expected/actual mencakup 11 UC di laporan, dengan lapisan mock/DOM ditandai; penerimaan sistem nyata belum dilaksanakan |
| 5.8 Bug diperbaiki dan diuji ulang | Tersedia | Suite lulus setelah patch; regresi profil, privasi antrean, monitoring, Head dan parser |
| 5.9 README dapat diikuti | Tersedia | Instruksi demo/backend, versi Node, akun, struktur dan batas verifikasi |
| 5.10 Bukti proses SDLC | Sebagian | Rencana dan perubahan teknis tersedia; catatan review stakeholder/iterasi nyata perlu dilampirkan tim |

## Penilaian 6 — Dokumen, sistem, presentasi

| Butir | Status | Bukti dan pekerjaan tersisa |
|---|---|---|
| D1 SRS final sesuai template dan masukan P1–P5 | Sebagian | SRS Markdown mutakhir; Word dan daftar masukan dosen belum diselaraskan/diverifikasi |
| D2 Konsistensi diagram | Tersedia | 9 model sumber/SVG; fungsi, role, transaksi dan data diselaraskan |
| D3 Setiap Must punya UC/desain/kode/uji | Tersedia | Matriks memetakan 13 Must; cakupan test parsial dinyatakan, bukan acceptance penuh |
| D4 Hasil di SRS dan worksheet | Sebagian | Laporan Markdown terbaru dirujuk SRS; worksheet masih snapshot |
| D5 Referensi dan penggunaan AI | Tersedia | SRS §10, README, daftar perubahan |
| K1 Demo lancar termasuk input salah | Sebagian | Alur inti diuji JSDOM; latihan browser dan kamera belum dilakukan |
| K2 Demo sesuai UC/SRS | Tersedia | [Panduan demo](../docs/presentation/PANDUAN_DEMO.md) dengan batas simulasi |
| K3 README lengkap | Tersedia | [README](../README.md) |
| K4 Kode rapi/terstruktur | Tersedia | Lapisan src/server/shared; placeholder tidak terpakai dihapus |
| K5 Source, Firestore rules, README | Tersedia | Berkas ada; materi SQL terpisah di database-assignment; belum commit/push paket audit |
| S1 Alur presentasi lengkap | Tersedia | Panduan mencakup masalah hingga pengujian |
| S2 Alasan desain | Tersedia | SDLC, peran, data dan trade-off penyimpanan dijelaskan |
| S3 Template slide, diagram/screenshot jelas | Sebagian | Diagram SVG dan panduan tersedia; slide final/screenshot belum diperbarui dan diverifikasi |
| S4 Durasi 20 menit | Belum | Alokasi waktu tersedia; perlu latihan dengan pengukuran nyata |
| S5 Semua anggota berbicara/menguasai | Belum | Pembagian peran berupa usulan; perlu nama anggota dan latihan |
| S6 Berkas terkumpul tepat waktu | Belum | Pengumpulan resmi belum dilakukan; selesaikan dokumen format wajib dan bukti tim |

## Tindakan sebelum pengumpulan

1. Lengkapi persetujuan dosen, bukti elisitasi, identitas anggota dan catatan review asli.
2. Jalankan uji penerimaan Firebase/SMTP/push/kamera di lingkungan uji dan catat hasil nyata.
3. Salin revisi FINAL ke template Word/Excel yang diwajibkan dan verifikasi format serta angka; jangan menjalankan generator isi lama untuk menimpa revisi.
4. Selesaikan slide sesuai template, lakukan latihan 20 menit, tinjau diff dan commit dengan kontribusi anggota sebenarnya, kemudian kumpulkan melalui kanal kampus.
