from pathlib import Path
from copy import deepcopy
import subprocess
import re

from PIL import Image, ImageDraw, ImageFont
from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / "SRS" / "03_Template_SRS.docx"
OUTPUT = ROOT / "SRS" / "SANTAP_SRS_FINAL.docx"
WORK = ROOT / "SRS" / ".srs_build"
MODELS = ROOT / "docs" / "models"


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), fill)
    tc_pr.append(shd)


def set_cell_text(cell, text, bold=False, color=None):
    cell.text = ""
    paragraph = cell.paragraphs[0]
    paragraph.paragraph_format.space_after = Pt(0)
    run = paragraph.add_run(str(text))
    run.bold = bold
    run.font.size = Pt(9.5)
    if color:
        run.font.color.rgb = RGBColor(*color)
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER


def table(doc, headers, rows, widths=None):
    t = doc.add_table(rows=1, cols=len(headers))
    t.style = "Table Grid"
    t.autofit = False
    for index, header in enumerate(headers):
        set_cell_text(t.rows[0].cells[index], header, True, (255, 255, 255))
        set_cell_shading(t.rows[0].cells[index], "1F4E78")
        if widths:
            t.rows[0].cells[index].width = Inches(widths[index])
    for row_index, row in enumerate(rows):
        cells = t.add_row().cells
        for index, value in enumerate(row):
            set_cell_text(cells[index], value)
            if row_index % 2:
                set_cell_shading(cells[index], "EAF2F8")
            if widths:
                cells[index].width = Inches(widths[index])
    doc.add_paragraph()
    return t


def paragraph(doc, text="", style=None, bold_lead=None):
    p = doc.add_paragraph(style=style)
    p.paragraph_format.space_after = Pt(6)
    if bold_lead and text.startswith(bold_lead):
        p.add_run(bold_lead).bold = True
        p.add_run(text[len(bold_lead):])
    else:
        p.add_run(text)
    return p


def heading(doc, text, level=1):
    p = doc.add_paragraph(style=f"Heading {level}")
    p.paragraph_format.space_before = Pt(12 if level == 1 else 8)
    p.paragraph_format.space_after = Pt(6)
    p.add_run(text)
    return p


def toc_field(doc):
    p = doc.add_paragraph()
    fld = OxmlElement("w:fldSimple")
    fld.set(qn("w:instr"), 'TOC \\o "1-3" \\h \\z \\u')
    p._p.append(fld)


def add_caption(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run(text)
    run.italic = True
    run.font.size = Pt(9)


def _font(size, bold=False):
    name = "arialbd.ttf" if bold else "arial.ttf"
    return ImageFont.truetype(str(Path("C:/Windows/Fonts") / name), size)


def model_png(model_name, title, rows):
    """Render a print-friendly model summary without relying on an external SVG DLL."""
    png = WORK / f"{model_name}.png"
    width, padding, row_height = 1600, 74, 55
    height = max(560, 175 + len(rows) * row_height)
    image = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((padding, 42, width-padding, 138), radius=16, fill="#1F4E78")
    draw.text((padding+30, 65), title, font=_font(36, True), fill="white")
    y = 180
    for index, row in enumerate(rows):
        fill = "#EAF2F8" if index % 2 == 0 else "#FFFFFF"
        draw.rounded_rectangle((padding, y, width-padding, y+row_height-8), radius=8, fill=fill, outline="#5B9BD5", width=2)
        draw.text((padding+24, y+11), row, font=_font(22), fill="#18222C")
        y += row_height
    draw.text((padding, height-54), "SANTAP v1.2 — model diringkas dari artefak PlantUML proyek", font=_font(17), fill="#52616B")
    image.save(png)
    return png


def figure(doc, model_name, caption, width=6.15):
    source = MODELS / f"{model_name}.svg"
    png = WORK / f"{model_name}.png"
    chrome = Path("C:/Program Files/Google/Chrome/Application/chrome.exe")
    svg_head = source.read_text(encoding="utf-8", errors="ignore")[:1000]
    dimensions = re.search(r'width="(\d+)px" height="(\d+)px"', svg_head)
    viewport = f"{dimensions.group(1)},{dimensions.group(2)}" if dimensions else "1600,1400"
    subprocess.run([
        str(chrome), "--headless", "--disable-gpu", "--hide-scrollbars",
        f"--window-size={viewport}", f"--screenshot={png}", source.resolve().as_uri(),
    ], check=True, capture_output=True)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.add_run().add_picture(str(png), width=Inches(width))
    add_caption(doc, caption)


def add_class_figure(doc):
    png = model_png("SANTAP_V1_2_CLASS", "Class Diagram", [
        "UserProfile(uid, role) — authorizes a feature; Student(nim, name, residence) validates completeness.",
        "MealPeriod(id, pauseDate) — isServing(now); OperationsConfig(schedules) — activePeriod(now).",
        "QueueEntry(id, studentId, status) — cancel() / complete(recordId).",
        "MealRecord(id, studentId, period, date, verifierUid, verificationMethod, verificationToken).",
        "PushSubscription(uid, endpoint) and PushDelivery(eventKey, sentAt) prevent duplicate reminders.",
        "Relations: Student has queue entries and meal records; operations configuration supplies periods.",
    ])
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.add_run().add_picture(str(png), width=Inches(6.3))
    add_caption(doc, "Gambar 9. Class diagram SANTAP v1.2")


def configure_styles(doc):
    normal = doc.styles["Normal"]
    normal.font.name = "Aptos"
    normal._element.rPr.rFonts.set(qn("w:ascii"), "Aptos")
    normal._element.rPr.rFonts.set(qn("w:hAnsi"), "Aptos")
    normal.font.size = Pt(10.5)
    for style_name, size in [("Title", 22), ("Heading 1", 15), ("Heading 2", 12.5), ("Heading 3", 11)]:
        style = doc.styles[style_name]
        style.font.name = "Aptos Display" if style_name == "Title" else "Aptos"
        style.font.size = Pt(size)
        style.font.color.rgb = RGBColor(0, 0, 0)


def clear_body(doc):
    body = doc._element.body
    for child in list(body):
        if child.tag != qn("w:sectPr"):
            body.remove(child)


def add_requirements(doc):
    heading(doc, "Bagian 5. Kebutuhan Requirements", 1)
    heading(doc, "5.1 Aturan Bisnis Business Rules", 2)
    table(doc, ["ID", "Aturan"], [
        ("BR-01", "Semua waktu memakai Asia/Makassar. Pagi 05:30-08:00 dan Siang 11:30-13:00 setiap hari; Malam Minggu-Kamis 17:00-18:30 dan Jumat-Sabtu 16:30-18:00."),
        ("BR-02", "Mahasiswa harus memiliki NIM unik dan profil lengkap sebelum dilayani."),
        ("BR-03", "Pengambilan hanya berlangsung pada periode aktif; pembukaan inklusif dan penutupan eksklusif."),
        ("BR-04", "Satu NIM hanya dapat memiliki satu catatan pengambilan pada periode dan tanggal WITA yang sama."),
        ("BR-05", "QR, barcode, dan NIM manual adalah metode identifikasi alternatif yang menuju validasi yang sama."),
        ("BR-06", "Admin mengelola akun, profil mahasiswa, dan jadwal operasional yang disetujui."),
        ("BR-07", "Catatan pengambilan menyimpan identitas petugas yang memvalidasi."),
        ("BR-08", "Antrean berstatus waiting, completed, atau cancelled."),
        ("BR-09", "Push penutupan ditujukan kepada Supervisor dan Head; fallback dalam aplikasi tetap tersedia."),
        ("BR-10", "Tema Sabat bersifat visual, tidak mengubah kelayakan makan, dan default Jumat 18:00 sampai Sabtu 18:00 WITA."),
    ], [0.65, 5.9])
    heading(doc, "5.2 Kebutuhan Fungsional Functional Requirements", 2)
    table(doc, ["ID", "Pernyataan kebutuhan", "Prioritas"], [
        ("FR-01", "Sistem harus mengautentikasi pengguna sebelum dashboard dibuka.", "Must"),
        ("FR-02", "Sistem harus membatasi fitur berdasarkan role Mahasiswa, Staff, Supervisor, Head, dan Admin.", "Must"),
        ("FR-03", "Sistem harus menyimpan profil mahasiswa berisi NIM, nama, email, fakultas, dan status asrama.", "Must"),
        ("FR-04", "Admin harus dapat memperbarui profil mahasiswa yang ada.", "Must"),
        ("FR-05", "Mahasiswa harus dapat menampilkan QR identitas.", "Should"),
        ("FR-06", "Staff harus dapat mengidentifikasi mahasiswa melalui QR, barcode, atau NIM manual.", "Must"),
        ("FR-07", "Sistem harus menolak NIM tidak terdaftar atau profil tidak lengkap.", "Must"),
        ("FR-08", "Sistem harus menolak pengambilan di luar periode aktif atau ketika periode dijeda.", "Must"),
        ("FR-09", "Sistem harus mencegah catatan pengambilan ganda pada periode dan tanggal yang sama.", "Must"),
        ("FR-10", "Sistem harus menyimpan catatan pengambilan berisi mahasiswa, periode, waktu, dan petugas.", "Must"),
        ("FR-11", "Sistem harus mengelola antrean dan menyediakan statusnya kepada pengguna yang berwenang.", "Should"),
        ("FR-12", "Staff harus dapat menyelesaikan atau membatalkan antrean.", "Should"),
        ("FR-13", "Supervisor dan Head harus dapat melihat total layanan dan status asrama pada periode berjalan.", "Should"),
        ("FR-14", "Sistem harus menyediakan push 10 menit sebelum penutupan dan fallback dalam aplikasi.", "Must"),
        ("FR-15", "Head harus dapat mengakses fungsi layanan Staff dan monitoring Supervisor sesuai hak akses.", "Must"),
        ("FR-16", "Mahasiswa harus dapat mengirim rating 1-5 dengan saran opsional.", "Should"),
        ("FR-17", "Admin harus dapat mengonfigurasi jadwal periode yang tidak tumpang tindih.", "Must"),
        ("FR-18", "Sistem harus menampilkan jam WITA, periode aktif, penutupan, dan warning dengan reduced motion.", "Must"),
        ("FR-19", "Tema Sabat harus diterapkan otomatis sesuai aturan bisnis tanpa mengubah layanan.", "Could"),
        ("FR-20", "Identifikasi saat gangguan koneksi dapat disimpan lokal sebagai belum tersinkron dan divalidasi ulang server.", "Could"),
    ], [0.6, 5.15, 0.8])
    heading(doc, "5.3 Kebutuhan Non Fungsional Non Functional Requirements", 2)
    table(doc, ["ID", "Kategori", "Kebutuhan"], [
        ("NFR-01", "Kinerja", "Validasi identitas ditargetkan selesai maksimal tiga detik pada koneksi kampus normal."),
        ("NFR-02", "Keamanan", "Dashboard dan API menolak akses tanpa autentikasi dan melakukan pemeriksaan role di server."),
        ("NFR-03", "Kegunaan", "Staff dapat menyelesaikan identifikasi dengan QR atau NIM manual tanpa membuka halaman lain."),
        ("NFR-04", "Keandalan", "Kombinasi NIM, periode, dan tanggal hanya dapat menghasilkan satu catatan pengambilan."),
        ("NFR-05", "Integritas data", "Catatan pengambilan harus memiliki NIM, periode, tanggal WITA, dan petugas yang valid."),
        ("NFR-06", "Privasi", "Data profil mahasiswa hanya tersedia bagi pemilik dan role yang berwenang; proyeksi antrean publik tidak memuat identitas."),
        ("NFR-07", "Aksesibilitas", "Warning visual menghormati preferensi reduced motion dan setiap input memiliki label serta status yang jelas."),
    ], [0.6, 1.05, 4.9])
    heading(doc, "5.4 Kelayakan Feasibility Requirements", 2)
    table(doc, ["Aspek", "Penilaian"], [
        ("Teknis", "Layak dengan React, Firebase Authentication, Firestore, Node.js, MySQL/MariaDB, dan kamera web; perlu credential Firebase Admin untuk backend."),
        ("Ekonomi", "Layak untuk prototype karena memanfaatkan perangkat kampus dan layanan pengembangan yang tersedia."),
        ("Operasional", "Layak dengan briefing singkat, profil mahasiswa lengkap, SOP layanan, dan jaringan yang memadai."),
    ], [1.2, 5.45])
    heading(doc, "5.5 Integritas Data Data Integrity Requirements", 2)
    paragraph(doc, "NIM memakai format alfanumerik, tanda hubung, atau garis bawah maksimal 30 karakter. Nama dan fakultas wajib diisi. Status asrama hanya Penghuni Asrama atau Non-penghuni. Server memvalidasi periode, tanggal WITA, profil, dan duplikasi sebelum membuat meal record. SQL menggunakan transaksi dan kunci unik; Firestore menggunakan transaksi dan identitas catatan deterministik.")
    heading(doc, "5.6 Keamanan Security Requirements", 2)
    paragraph(doc, "Firebase ID token diverifikasi oleh API. Role diperiksa sebelum operasi sensitif. Direct browser write untuk operasi dilindungi oleh rules dan API. Credential Firebase Admin hanya berada di server. Token push dan catatan delivery tidak diekspos ke klien biasa.")


def build():
    WORK.mkdir(parents=True, exist_ok=True)
    doc = Document(TEMPLATE)
    clear_body(doc)
    configure_styles(doc)
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    p = doc.add_paragraph(style="Title")
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.add_run("SOFTWARE REQUIREMENTS SPECIFICATION")
    for value, size, bold in [
        ("SANTAP", 20, True),
        ("Sistem Antrean dan Pencatatan Aktivitas Pengambilan", 15, True),
        ("Fern Wallace Dining Hall Universitas Klabat", 12, False),
        ("Final Project System Analysis and Design", 11, False),
        ("Kelompok SANTAP Model SDLC Agile Iterative Incremental", 10.5, False),
        ("Fakultas Ilmu Komputer Universitas Klabat", 10.5, False),
        ("November 2026", 10.5, False),
    ]:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(value)
        r.bold = bold
        r.font.size = Pt(size)
    doc.add_page_break()
    heading(doc, "Riwayat Revisi", 1)
    table(doc, ["Versi", "Tanggal", "Perubahan", "Status"], [
        ("1.0", "September 2026", "KINTARA sebagai artefak elisitasi awal.", "Historis"),
        ("1.1", "September 2026", "Nama SANTAP, Head, scope menu dikeluarkan, kebutuhan inti dirapikan.", "Baseline"),
        ("1.2", "13 November 2026", "Jadwal WITA, validasi server, push, jam operasional, Sabat, integritas data, dan model interaksi/struktur ditambahkan.", "Final akademik"),
    ], [0.75, 1.1, 3.85, 1.0])
    heading(doc, "Daftar Isi", 1)
    toc_field(doc)
    doc.add_page_break()
    heading(doc, "Abstrak", 1)
    paragraph(doc, "SANTAP adalah sistem web untuk mendukung antrean dan pencatatan pengambilan makanan mahasiswa di Fern Wallace Dining Hall. Dokumen ini menetapkan kebutuhan, batasan, model perilaku, model struktur, model data, antarmuka, dan pengujian prototype. Fokusnya adalah identifikasi mahasiswa, validasi pengambilan, pencegahan duplikasi, antrean, monitoring, dan administrasi. Sistem tidak menangani pembayaran, menu, stok, resep, procurement, atau keuangan dapur.")

    heading(doc, "Bagian 1. Overview", 1)
    heading(doc, "1.1 Tujuan Purpose", 2)
    paragraph(doc, "SANTAP menyelesaikan masalah pencatatan layanan makan yang tidak seragam pada saat periode padat. Sistem memberi Staff cara cepat mengidentifikasi mahasiswa dan mencatat pengambilan yang valid, sambil memberi Supervisor, Head, dan Admin informasi operasional yang dapat ditelusuri.")
    heading(doc, "1.2 Audiens Audience", 2)
    paragraph(doc, "Dokumen ini ditujukan kepada tim pengembang, penguji, dosen pengampu, pengelola Dining Hall, Staff, Supervisor, Head, Admin, dan perwakilan mahasiswa.")
    heading(doc, "1.3 Ruang Lingkup Proyek Project Scope", 2)
    table(doc, ["Dalam scope", "Di luar scope"], [
        ("Login dan role, profil mahasiswa, QR/barcode/NIM, pengambilan makan, antrean, monitoring, push penutupan, pengaturan jadwal, rating, dan penyimpanan sementara saat jaringan terganggu.", "Pembayaran, kasir, menu, stok bahan, resep, procurement, keuangan dapur, aplikasi mobile native, prediksi antrean, dan integrasi ERP/akademik penuh."),
    ], [3.3, 3.3])
    heading(doc, "1.4 Karakteristik Tim Staff Characteristics", 2)
    table(doc, ["Peran", "Tanggung jawab"], [
        ("Koordinator atau analis", "Scope, stakeholder, backlog, dan dokumen SRS."),
        ("Analis proses dan UI", "As-is, use case, activity, sequence, class, data, dan antarmuka."),
        ("Pengembang frontend", "React, dashboard role, QR/NIM, antrean, dan aksesibilitas UI."),
        ("Pengembang data/backend", "Firebase, MySQL, API, rules, dan validasi."),
        ("QA dan dokumentasi", "Kasus uji, hasil uji, diagram, dan demo."),
    ], [2.0, 4.6])
    heading(doc, "1.5 Model SDLC dan Rencana Kerja", 2)
    paragraph(doc, "Model Agile Iterative Incremental dipilih karena kebutuhan operasional berubah setelah umpan balik. Iterasi pertama memvalidasi autentikasi, profil, identifikasi, jadwal, dan pencatatan. Iterasi kedua menambah antrean, monitoring, notifikasi, ketahanan data, dan dokumentasi model.")
    table(doc, ["Minggu", "Iterasi", "Luaran"], [
        ("1", "Discovery dan perencanaan", "Inisiasi, ITPOSMO, stakeholder, elisitasi, dan kebutuhan prioritas."),
        ("2", "Proses inti", "Use case, activity, sequence, class, data, dan prototype layanan."),
        ("3", "Operasi dan evaluasi", "Monitoring, notifikasi, pengujian, dokumentasi, dan demo."),
    ], [0.7, 2.0, 3.9])

    heading(doc, "Bagian 2. Sistem Saat Ini Existing Systems", 1)
    heading(doc, "2.1 Perangkat Keras System Hardware Inventory", 2)
    paragraph(doc, "Layanan menggunakan komputer atau tablet Staff, ponsel mahasiswa, kamera atau webcam untuk QR/barcode, dan jaringan kampus. Ketersediaan perangkat serta stabilitas koneksi dapat berbeda di setiap sesi.")
    heading(doc, "2.2 Perangkat Lunak dan Platform", 2)
    paragraph(doc, "Prototype memakai React dan Vite di browser. Firebase Authentication dan Firestore mendukung autentikasi serta profil; Node.js API memvalidasi operasi. MySQL/MariaDB tersedia sebagai basis data relasional untuk demonstrasi akademik.")
    heading(doc, "2.3 Platform Database", 2)
    paragraph(doc, "Firestore menyimpan profil, konfigurasi, dan operasi pada mode Firebase. MySQL/MariaDB menyimpan students, meal periods, queues, dan meal records pada mode SQL. Kedua mode memakai jadwal WITA dan validasi server yang sama.")
    heading(doc, "2.4 Proses Bisnis Saat Ini As Is", 2)
    paragraph(doc, "Sebelum SANTAP, petugas perlu memeriksa identitas, status mahasiswa, periode layanan, dan riwayat pengambilan secara manual atau terpisah. Risiko utama adalah antrean lambat, pencatatan tidak konsisten, dan pengambilan ganda. SANTAP menggabungkan langkah tersebut menjadi identifikasi, validasi, pencatatan, dan pembaruan antrean.")
    heading(doc, "2.5 Analisis Design Reality Gap ITPOSMO", 2)
    table(doc, ["Dimensi", "Gap", "Respons rancangan"], [
        ("Information", "Profil dan catatan layanan tidak selalu terlihat bersama.", "Data mahasiswa, periode, antrean, dan record terstruktur."),
        ("Technology", "Kamera dan jaringan bervariasi.", "QR/barcode, NIM manual, dan identifikasi sementara."),
        ("Processes", "Validasi manual dapat tidak seragam.", "Alur server-side yang memeriksa jadwal dan duplikasi."),
        ("Objectives", "Kecepatan harus seimbang dengan keadilan.", "Validasi cepat dan catatan dapat ditelusuri."),
        ("Staffing", "Kemampuan teknis petugas beragam.", "Antarmuka ringkas dan briefing SOP."),
        ("Management", "Hak akses beberapa role perlu jelas.", "Role-based access dan Admin terpisah."),
        ("Other resources", "Waktu layanan dan perangkat terbatas.", "Jadwal terpusat, monitoring, dan pengujian perangkat."),
    ], [1.1, 2.55, 2.95])

    heading(doc, "Bagian 3. Dependensi dan Batasan Dependencies and Constraints", 1)
    heading(doc, "3.1 Dependensi Sistem", 2)
    paragraph(doc, "Sistem bergantung pada Firebase Authentication, Firestore, Firebase Admin credentials untuk API, VAPID dan browser yang mendukung push untuk notifikasi latar belakang, MySQL/MariaDB ketika SQL mode aktif, serta kamera untuk pemindaian.")
    heading(doc, "3.2 Dependensi Staf", 2)
    paragraph(doc, "Admin memastikan profil dan role. Staff menjalankan SOP identifikasi. Supervisor dan Head memantau operasi. Pengelola Dining Hall meratifikasi jadwal, tanggung jawab konfigurasi, dan prosedur pengecualian.")
    heading(doc, "3.3 Topologi Jaringan dan Arsitektur Umum", 2)
    table(doc, ["Lapisan", "Komponen", "Tanggung jawab"], [
        ("Klien", "React/Vite browser", "Dashboard role, clock lokal, QR, input, dan fallback UI."),
        ("Identitas", "Firebase Authentication", "Menerbitkan ID token pengguna."),
        ("API", "Node.js service API dan SQL API", "Verifikasi token, role, aturan jadwal, dan transaksi."),
        ("Data", "Firestore atau MySQL/MariaDB", "Profil, konfigurasi, antrean, dan catatan pengambilan."),
    ], [1.0, 2.0, 3.6])
    heading(doc, "3.4 Batasan Constraints", 2)
    paragraph(doc, "Layanan hanya berjalan pada jadwal resmi WITA. Data offline bukan bukti pengambilan final. Push tidak menjamin delivery dan bergantung pada permission, credential, VAPID, secure context, dan worker. Persetujuan formal jadwal serta pengecualian layanan masih perlu dilampirkan oleh pengelola.")

    heading(doc, "Bagian 4. Elisitasi Kebutuhan", 1)
    heading(doc, "4.1 Teknik dan Narasumber", 2)
    table(doc, ["Teknik", "Narasumber atau sumber", "Hasil"], [
        ("Wawancara semi-terstruktur", "Mahasiswa, Supervisor, Kepala Dining Hall", "QR/NIM, antrean, monitoring, reminder, Head, dan rating."),
        ("Analisis dokumen", "KINTARA SRS versi 1.0", "Menelusuri user story, acceptance criteria, dan kebutuhan yang telah direkam."),
        ("Observasi dan uji prototype", "Staff dan perwakilan mahasiswa", "Memvalidasi alur singkat, perangkat, dan hambatan operasional."),
    ], [1.6, 2.25, 2.75])
    heading(doc, "4.2 Ringkasan Temuan", 2)
    paragraph(doc, "Mahasiswa membutuhkan QR sebagai identitas dengan barcode atau NIM manual sebagai cadangan. Staff membutuhkan validasi yang cepat dan pencegahan duplikasi. Supervisor membutuhkan total layanan dan peringatan sebelum penutupan. Head membutuhkan gabungan monitoring serta layanan. Admin membutuhkan pengelolaan profil. Pemilik proyek menetapkan jadwal resmi dan default visual Sabat.")

    add_requirements(doc)

    heading(doc, "Bagian 6. Pemodelan Perilaku", 1)
    heading(doc, "6.1 Daftar Aktor", 2)
    table(doc, ["Aktor", "Interaksi utama"], [
        ("Mahasiswa", "Login, tampilkan QR, masuk antrean, lihat status, kirim rating."),
        ("Staff", "Identifikasi, catat pengambilan, kelola antrean."),
        ("Supervisor", "Monitoring dan push penutupan."),
        ("Head", "Monitoring dan fungsi Staff sesuai role."),
        ("Admin", "Kelola akun, profil, dan konfigurasi operasional."),
    ], [1.3, 5.3])
    heading(doc, "6.2 Use Case Diagram", 2)
    figure(doc, "SANTAP_V1_2_USE_CASE", "Gambar 2. Use case diagram SANTAP v1.2")
    heading(doc, "6.3 Use Case Description", 2)
    table(doc, ["Use case", "Aktor", "Ringkasan alur dan eksepsi"], [
        ("UC-01 Login", "Semua role", "Pengguna masuk; sistem memuat profil/role; kredensial salah atau profil belum lengkap ditolak."),
        ("UC-03 Akses Antrean", "Mahasiswa", "Sistem memeriksa profil dan periode; antrean duplikat atau periode tutup ditolak."),
        ("UC-04 Proses Pengambilan", "Staff/Head", "Scan QR/barcode atau NIM; server memeriksa profil, jadwal, jeda, dan duplikasi; record dan antrean disimpan atomik."),
        ("UC-06 Monitor Dining Hall", "Supervisor/Head", "Sistem menampilkan total periode, residence, jam WITA, dan kondisi penutupan."),
        ("UC-09 Kelola Profil", "Admin", "Admin memperbarui profil yang ada; NIM tidak ditemukan atau input tidak lengkap ditolak."),
        ("UC-10 Rating", "Mahasiswa", "Mahasiswa mengirim rating 1-5 dan saran opsional; server mengendalikan penerima dan identitas."),
    ], [1.45, 1.15, 4.0])
    heading(doc, "6.4 Activity Diagram", 2)
    figure(doc, "SANTAP_V1_2_MEAL_ACTIVITY", "Gambar 3. Activity diagram proses pengambilan makanan")
    figure(doc, "SANTAP_V1_2_CLOSING_ACTIVITY", "Gambar 4. Activity diagram reminder penutupan")
    paragraph(doc, "AD-03 Antrean mengikuti alur UC-03: mahasiswa meminta masuk antrean, server memvalidasi periode/profil/duplikasi, kemudian mencatat status waiting atau menolak dengan pesan yang jelas. Alur ini divisualkan secara rinci oleh sequence diagram antrean pada Bagian 7.")

    heading(doc, "Bagian 7. Pemodelan Interaksi dan Struktur", 1)
    heading(doc, "7.1 Sequence Diagram", 2)
    figure(doc, "SANTAP_V1_2_MEAL_SEQUENCE", "Gambar 6. SD-01 proses pengambilan makanan")
    figure(doc, "SANTAP_V1_2_QUEUE_SEQUENCE", "Gambar 7. SD-02 masuk dan kelola antrean")
    figure(doc, "SANTAP_V1_2_PROFILE_SEQUENCE", "Gambar 8. SD-03 kelola profil mahasiswa")
    heading(doc, "7.2 Class Diagram", 2)
    add_class_figure(doc)

    heading(doc, "Bagian 8. Model Data", 1)
    heading(doc, "8.1 Entity Relationship Diagram Skema Database", 2)
    figure(doc, "SANTAP_V1_2_ERD", "Gambar 10. ERD dan logical Firestore model SANTAP v1.2")
    heading(doc, "8.2 Kamus Data", 2)
    table(doc, ["Tabel atau koleksi", "Kunci", "Kolom penting", "Keterangan"], [
        ("students", "PK nim", "name, faculty, email, residence", "Master profil mahasiswa."),
        ("users Firestore", "PK uid", "role, nim, name", "Profil login dan role."),
        ("meal_periods", "PK id", "label, paused_date", "Status jeda periode pada tanggal tertentu."),
        ("queues", "PK id", "nim, period_id, date, joined_at, status", "Antrean layanan; publicQueue adalah proyeksi tanpa identitas."),
        ("meal_records", "PK id", "nim, period_id, served_date, staff_uid", "Pengambilan terverifikasi; unik per NIM-periode-tanggal."),
        ("settings operations", "PK document", "schedules, sabbath", "Konfigurasi jadwal WITA dan tema Sabat."),
        ("pushSubscriptions", "PK token hash", "uid, token", "Subscription push yang hanya diakses server."),
    ], [1.35, 0.9, 2.55, 1.7])

    heading(doc, "Bagian 9. Prototipe Antarmuka User Interface", 1)
    paragraph(doc, "Prototype dibuat dengan React dan Vite. Enam layar di bawah dapat diklik melalui navigasi dashboard sesuai role setelah pengguna masuk.")
    table(doc, ["ID", "Layar", "Use case", "Elemen desain"], [
        ("L-01", "Login dan pemilihan role", "UC-01", "Input kredensial, pesan kesalahan autentikasi, dan akses dashboard."),
        ("L-02", "Dashboard Mahasiswa dan QR", "UC-02", "QR identitas, status pengambilan, bukti QR, dan antrean."),
        ("L-03", "Antrean Mahasiswa", "UC-03", "Tombol masuk, posisi, status, dan pesan periode tutup."),
        ("L-04", "Validasi Staff", "UC-04", "Tab QR/barcode/NIM, hasil mahasiswa, catat pengambilan, dan QR bukti."),
        ("L-05", "Monitoring Supervisor/Head", "UC-06/07", "Clock WITA, total, warning, push control, dan laporan."),
        ("L-06", "Administrasi", "UC-09/11", "Form profil dan jadwal, label input, validasi, dan status simpan."),
    ], [0.55, 1.8, 1.0, 3.15])
    heading(doc, "Prinsip desain yang diterapkan", 2)
    paragraph(doc, "Navigasi mengikuti role. Input memiliki label dan validasi. Pesan kesalahan menjelaskan penyebab seperti NIM tidak valid, periode tertutup, duplikasi, atau hak akses. Warning penutupan menggunakan perubahan border yang halus dan mengikuti reduced motion. Tampilan Sabat memakai aksen biru dan emas tanpa mengurangi kontras konten.")

    heading(doc, "Bagian 10. Implementasi dan Pengujian", 1)
    heading(doc, "10.1 Arsitektur dan Teknologi", 2)
    paragraph(doc, "Frontend memakai React, Vite, qrcode.react, lucide-react, dan @zxing/browser. Backend memakai Node.js, Firebase Admin, Firestore, mysql2, dan Nodemailer untuk email yang sudah ada. Browser push memakai Firebase Messaging dan service worker ketika credential/VAPID tersedia.")
    heading(doc, "10.2 Repository dan Struktur Kode", 2)
    paragraph(doc, "Repository: https://github.com/deedisini/santap-react. Folder src berisi aplikasi React dan komponen; server berisi API, operasi Firestore/SQL, push, dan pengujian; shared berisi jadwal operasi; docs/models berisi PlantUML dan SVG; SRS berisi artefak kebutuhan.")
    heading(doc, "10.3 Matriks Keterlacakan Traceability Matrix", 2)
    table(doc, ["Kebutuhan", "Use case", "Diagram", "Kelas atau data", "Layar"], [
        ("FR-01/02", "UC-01", "Use case", "UserProfile", "L-01"),
        ("FR-05/06", "UC-02/04", "Meal activity; meal sequence", "Student, MealRecord", "L-02, L-04"),
        ("FR-08/09/10", "UC-04", "Meal activity; meal sequence", "MealPeriod, MealRecord", "L-04"),
        ("FR-11/12", "UC-03/05", "Queue sequence", "QueueEntry", "L-03, L-04"),
        ("FR-13/14/18", "UC-06/07", "Closing activity", "OperationsConfig, PushSubscription", "L-05"),
        ("FR-04/17", "UC-09/11", "Profile sequence", "Student, OperationsConfig", "L-06"),
        ("FR-16", "UC-10", "Use case", "UserProfile", "L-02"),
    ], [0.9, 1.0, 1.55, 1.7, 1.1])
    heading(doc, "10.4 Pengujian", 2)
    paragraph(doc, "Automated suite terakhir menjalankan 21 tes: batas jadwal setiap hari, warning sepuluh menit, zona waktu WITA, validasi konfigurasi, Sabat, antrean, SQL, Firestore, push, dan rendering komponen. Production build berhasil. Pengujian kamera, izin push nyata, Firebase credential, tema di semua dashboard, responsif, dan beban kampus masih memerlukan uji perangkat nyata.")
    heading(doc, "10.5 Tampilan Sistem yang Dibangun", 2)
    paragraph(doc, "Prototype menyediakan dashboard Mahasiswa, Staff, Supervisor, Head, dan Admin. Pemilihan periode, jam WITA, status closed, QR, antrean, monitoring, notifikasi, dan formulir administrasi tersedia sebagai komponen yang dapat dijalankan di browser.")

    heading(doc, "Bagian 11. Referensi", 1)
    refs = [
        "A. Dennis, B. H. Wixom, and D. Tegarden, Systems Analysis and Design An Object Oriented Approach with UML, 5th ed. Wiley, 2015.",
        "K. Kendall and J. Kendall, Systems Analysis and Design, 10th ed. Pearson, 2019.",
        "Firebase Documentation, Authentication, Firestore, and Cloud Messaging for Web.",
        "KINTARA SRS version 1.0 and SANTAP SRS version 1.1, project artifacts, 2026.",
    ]
    for ref in refs:
        paragraph(doc, ref)

    heading(doc, "Bagian 12. Lampiran", 1)
    heading(doc, "Lampiran A Dokumentasi Elisitasi", 2)
    paragraph(doc, "Wawancara semi-terstruktur dan analisis dokumen KINTARA menjadi bukti awal. Nama narasumber representatif yang terdokumentasi mencakup Rafael Soriton, Mrs. Mega Mawu, Julian Tendean, dan Mrs. Jangs Laoh. Tanggal kegiatan dan bukti persetujuan formal perlu dilampirkan tim bila tersedia.")
    heading(doc, "Lampiran B Pernyataan Penggunaan AI", 2)
    paragraph(doc, "Kelompok menggunakan AI sebagai bantuan penyusunan struktur dokumen, pemeriksaan konsistensi, dan pembuatan draft. Tim tetap memeriksa isi, kebutuhan, diagram, serta keputusan operasional sebelum pengumpulan.")
    heading(doc, "Lampiran C Catatan Proses SDLC", 2)
    paragraph(doc, "Artefak iterasi mencakup dokumen inisiasi, elisitasi, SRS v1.1, revisi v1.2, model PlantUML, source code prototype, schema SQL, test, dan hasil build. Bukti review dosen/pengelola perlu ditambahkan sebagai persetujuan eksternal.")

    settings = doc.settings.element
    update_fields = OxmlElement("w:updateFields")
    update_fields.set(qn("w:val"), "true")
    settings.append(update_fields)
    doc.save(OUTPUT)
    print(OUTPUT)


if __name__ == "__main__":
    build()
