# Dokumentasi SANTAP

Acuan teknis terbaru adalah [SRS Markdown](srs/SANTAP_SRS_FINAL.md), [matriks keterlacakan](KETERLACAKAN.md), [kamus data](KAMUS_DATA.md), dan [laporan pengujian](PENGUJIAN.md). Dokumen tersebut menyelaraskan implementasi dengan rubrik 1–6 tanpa mengubah bukti historis.

| Kelompok | Isi dan penggunaan |
|---|---|
| [srs/](srs/) | SRS terbaru dalam Markdown; DOCX final lama, template dosen, v1.1, usulan v1.2, dan sumber KINTARA tetap tersedia. |
| [models/](models/) | Sumber PlantUML use case, tiga activity, tiga sequence, class, conceptual/logical ERD, dan physical ERD. |
| [setup/](setup/) | Instalasi akun/backend dan daftar akun historis. |
| [worksheets/](worksheets/) | Sheet kebutuhan lama dan workbook proyek dalam subfolder lembar-proyek. |
| [presentation/](presentation/) | Dokumen persiapan lama dan skenario demo terbaru. |
| [references/](references/) | Panduan tugas dosen dan catatan desain antarmuka. |
| [archive/](archive/) | UML dan catatan implementasi versi terdahulu. |
| [Penilaian/](../Penilaian/) | Enam gambar rubrik, sumber inisiasi/elisitasi, dan checklist final. |

Riwayat audit, perbaikan, dan pemindahan berkas tersedia pada [daftar perubahan lengkap](DAFTAR_PERUBAHAN.md).

## Paket pengumpulan

Mulai dari [README aplikasi](../README.md), lalu gunakan SRS terbaru beserta model, hasil pengujian, dan matriks keterlacakan. Format Word/Excel terdahulu dipertahankan sebagai snapshot; **belum disinkronkan dengan audit ini**. Jika dosen mewajibkan format tersebut, pindahkan revisi Markdown ke template Word/Excel dan periksa tampilan serta perhitungan sebelum menyerahkan. Skrip generator lama sudah diarahkan ke lokasi baru, tetapi masih membangun isi snapshot lama; jangan menjalankannya untuk menimpa hasil revisi tanpa memperbarui isinya.

[Checklist final](../Penilaian/CHECKLIST_FINAL.md) mencatat bukti yang tersedia dan pekerjaan eksternal yang belum bisa diklaim selesai. Jangan memakai checklist 1–4 lama untuk menyatakan kesiapan pengumpulan saat ini.

## Riwayat penataan

`SRS` dipindah ke `docs/srs`; `Lembar Kerja` ke `docs/worksheets/lembar-proyek`. Panduan setup dan daftar akun dikumpulkan di `docs/setup`; dokumen persiapan masuk `docs/presentation`; panduan dosen masuk `docs/references`; UML lama masuk `docs/archive`. Tidak ada dokumen akademik yang dibuang. Tiga komponen kosong dan halaman Head placeholder yang tidak dipakai dihapus; Head memakai halaman Staff dan Supervisor sesuai navigasi yang sudah diimplementasikan.
