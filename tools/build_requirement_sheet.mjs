import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputPath = new URL("../LEMBAR_KERJA_KEBUTUHAN_SANTAP.xlsx", import.meta.url);

const requirements = [
  ["FR-01", "Fungsional", "Sistem harus mengautentikasi pengguna sebelum membuka dashboard.", "Q1, Q9", "Must", "Akses dashboard tanpa autentikasi ditolak.", "Terdokumentasi", ""],
  ["FR-02", "Fungsional", "Sistem harus menampilkan dashboard sesuai role pengguna.", "Q8, Q9", "Must", "Masuk dengan setiap role dan periksa dashboard.", "Terdokumentasi", ""],
  ["FR-03", "Fungsional", "Sistem harus menyimpan profil mahasiswa beserta NIM dan status asrama.", "Q3, Q5, Q9", "Must", "Simpan profil lengkap lalu periksa data.", "Terdokumentasi", ""],
  ["FR-04", "Fungsional", "Admin harus dapat membuat atau memperbarui profil mahasiswa.", "Q5, Q9", "Must", "Admin membuat dan memperbarui profil.", "Terdokumentasi", ""],
  ["FR-05", "Fungsional", "Mahasiswa harus dapat menampilkan QR identitas setelah login.", "Q1, Q6", "Should", "Mahasiswa login dan membuka QR.", "Terdokumentasi", ""],
  ["FR-06", "Fungsional", "Staff harus dapat mengidentifikasi mahasiswa melalui QR atau kamera.", "Q1, Q6", "Must", "Staff memindai QR mahasiswa valid.", "Terdokumentasi", ""],
  ["FR-07", "Fungsional", "Staff harus dapat memasukkan NIM manual saat scan gagal.", "Q6, Q7", "Must", "Simulasikan scan gagal lalu masukkan NIM.", "Terdokumentasi", ""],
  ["FR-08", "Fungsional", "Sistem harus menolak pengambilan untuk NIM tidak terdaftar atau profil tidak lengkap.", "Q3, Q9", "Must", "Uji NIM tidak valid dan profil tidak lengkap.", "Terdokumentasi", ""],
  ["FR-09", "Fungsional", "Sistem harus menolak pengambilan saat periode makan tidak aktif.", "Q10", "Must", "Coba pengambilan di luar periode aktif.", "Terdokumentasi", ""],
  ["FR-10", "Fungsional", "Sistem harus mencegah pengambilan kedua pada periode dan tanggal yang sama.", "Q4", "Must", "Kirim dua pengambilan identik; yang kedua ditolak.", "Terdokumentasi", ""],
  ["FR-11", "Fungsional", "Sistem harus menyimpan mahasiswa, periode, waktu, dan petugas pada catatan pengambilan.", "Q3, Q8", "Must", "Periksa isi catatan sesudah pengambilan valid.", "Terdokumentasi", ""],
  ["FR-12", "Fungsional", "Sistem harus menambahkan mahasiswa ke antrean dan menampilkan antrean aktif.", "Q2", "Should", "Mahasiswa masuk antrean; staff melihat entri aktif.", "Terdokumentasi", ""],
  ["FR-13", "Fungsional", "Staff harus dapat mengubah status antrean menjadi selesai atau dibatalkan.", "Q1, Q2", "Should", "Ubah entri waiting ke completed/cancelled.", "Terdokumentasi", ""],
  ["FR-14", "Fungsional", "Supervisor atau Head harus dapat melihat jumlah pengambilan per periode dan status asrama.", "Q8", "Should", "Buka monitor dan periksa ringkasan.", "Terdokumentasi", ""],
  ["FR-15", "Fungsional", "Sistem harus menyimpan hasil scan lokal sementara saat koneksi putus dan menyinkronkannya saat koneksi kembali.", "Q7", "Could", "Putuskan koneksi, simpan scan, lalu sinkronkan.", "Terdokumentasi", ""],
  ["FR-16", "Fungsional", "Sistem dapat mengirim pengingat sebelum periode makan ditutup.", "Q8, Q10", "Could", "Atur periode mendekati tutup dan periksa pengingat.", "Terdokumentasi", ""],
  ["FR-17", "Fungsional", "Head harus dapat mengakses kemampuan operasional Staff dan monitoring Supervisor sesuai hak aksesnya.", "Q11", "Must", "Login sebagai Head dan buka Monitoring serta Antrean & Validasi.", "Terdokumentasi", ""],
  ["FR-18", "Fungsional", "Mahasiswa harus dapat mengirim rating pengalaman makan bernilai 1 sampai 5 beserta saran opsional kepada pengelola Dining Hall.", "Q12", "Should", "Kirim rating valid; tolak nilai di luar rentang 1–5.", "Terdokumentasi", ""],
  ["NFR-01", "Nonfungsional – Kinerja", "Sistem harus menampilkan hasil validasi identitas maksimal 3 detik pada koneksi normal.", "Q10", "Must", "Ukur waktu validasi pada sepuluh percobaan.", "Terdokumentasi", ""],
  ["NFR-02", "Nonfungsional – Keamanan", "Dashboard dan API harus menolak akses tanpa autentikasi serta membatasi fitur berdasarkan role.", "Q9", "Must", "Akses dashboard/API tanpa login dan dengan role salah.", "Terdokumentasi", ""],
  ["NFR-03", "Nonfungsional – Kegunaan", "Staff harus dapat menggunakan QR atau NIM manual tanpa membuka halaman lain.", "Q2, Q6", "Should", "Selesaikan identifikasi dari satu halaman layanan.", "Terdokumentasi", ""],
  ["NFR-04", "Nonfungsional – Keandalan", "Sistem harus mencegah catatan ganda untuk NIM, periode, dan tanggal yang sama.", "Q4", "Must", "Uji dua pengiriman identik secara berurutan.", "Terdokumentasi", ""],
  ["NFR-05", "Nonfungsional – Integritas data", "Setiap catatan pengambilan harus terkait dengan NIM dan periode makan yang valid.", "Q3, Q8", "Must", "Coba menyimpan catatan dengan referensi tidak valid.", "Terdokumentasi", ""],
  ["NFR-06", "Nonfungsional – Ketersediaan", "Saat jaringan tidak tersedia, hasil scan dapat disimpan lokal dan ditandai belum tersinkron.", "Q7", "Could", "Simulasikan offline dan periksa status sinkronisasi.", "Terdokumentasi", ""],
  ["NFR-07", "Nonfungsional – Privasi", "Data profil mahasiswa hanya dapat dibaca atau diubah oleh role berwenang.", "Q5, Q9", "Must", "Coba akses profil dengan role tanpa izin.", "Terdokumentasi", ""],
];

const workbook = Workbook.create();
const sheet = workbook.worksheets.add("Kebutuhan");
sheet.showGridLines = false;
sheet.getRange("A1:H1").merge();
sheet.getRange("A1").values = [["Lembar Kerja Kebutuhan SANTAP"]];
sheet.getRange("A2:H2").merge();
sheet.getRange("A2").values = [["Sumber: ELISITASI_SRS_SANTAP.md. Perbarui kolom Status dan Catatan setelah pengujian."]];
const headers = [["ID", "Jenis", "Pernyataan kebutuhan", "Sumber", "Prioritas MoSCoW", "Kriteria uji", "Status", "Catatan"]];
sheet.getRange("A4:H4").values = headers;
sheet.getRange(`A5:H${4 + requirements.length}`).values = requirements;
sheet.getRange(`A4:H${4 + requirements.length}`).format.font = { name: "Arial", size: 10 };
sheet.getRange("A1").format = { font: { name: "Arial", size: 16, bold: true, color: "#1F2937" } };
sheet.getRange("A2").format = { font: { name: "Arial", size: 10, italic: true, color: "#4B5563" } };
sheet.getRange("A4:H4").format = { fill: "#1F4E78", font: { name: "Arial", size: 10, bold: true, color: "#FFFFFF" }, horizontalAlignment: "center", verticalAlignment: "center", wrapText: true };
sheet.getRange(`A4:H${4 + requirements.length}`).format.verticalAlignment = "top";
sheet.getRange(`A4:H${4 + requirements.length}`).format.wrapText = true;
sheet.getRange(`A4:H${4 + requirements.length}`).format.borders = { preset: "all", style: "thin", color: "#D9E2F3" };
sheet.getRange(`G5:H${4 + requirements.length}`).format.fill = "#FFF2CC";
sheet.getRange(`E5:E${4 + requirements.length}`).dataValidation = { rule: { type: "list", values: ["Must", "Should", "Could", "Won't"] } };
sheet.getRange(`G5:G${4 + requirements.length}`).dataValidation = { rule: { type: "list", values: ["Terdokumentasi", "Diuji", "Selesai", "Perlu tindak lanjut"] } };
sheet.getRange("A:A").format.columnWidth = 12;
sheet.getRange("B:B").format.columnWidth = 22;
sheet.getRange("C:C").format.columnWidth = 48;
sheet.getRange("D:D").format.columnWidth = 16;
sheet.getRange("E:E").format.columnWidth = 18;
sheet.getRange("F:F").format.columnWidth = 40;
sheet.getRange("G:G").format.columnWidth = 20;
sheet.getRange("H:H").format.columnWidth = 30;
sheet.getRange("A1:H1").format.rowHeight = 24;
sheet.getRange("A4:H4").format.rowHeight = 28;
sheet.getRange(`A5:H${4 + requirements.length}`).format.rowHeight = 42;
sheet.freezePanes.freezeRows(4);
sheet.tables.add(`A4:H${4 + requirements.length}`, true, "SANTAPKebutuhan");
workbook.recalculate();
const inspection = await workbook.inspect({ kind: "table", range: `Kebutuhan!A1:H${4 + requirements.length}`, include: "values,formulas", tableMaxRows: 30, tableMaxCols: 8 });
console.log(inspection.ndjson);
const preview = await workbook.render({ sheetName: "Kebutuhan", range: `A1:H${4 + requirements.length}`, scale: 1.3, format: "png" });
await fs.writeFile(new URL("../LEMBAR_KERJA_KEBUTUHAN_SANTAP.preview.png", import.meta.url), new Uint8Array(await preview.arrayBuffer()));
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(fileURLToPath(outputPath));
