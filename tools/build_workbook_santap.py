from pathlib import Path
from copy import copy
import math
import openpyxl
from openpyxl.workbook.properties import CalcProperties
from docx import Document

ROOT = Path(__file__).resolve().parents[1]
folder = ROOT / 'docs/worksheets/lembar-proyek'
template = folder / '04_Template_Lembar_Kerja_Proyek.xlsx'
out = folder / 'SANTAP_Lembar_Kerja_Proyek.xlsx'
w = openpyxl.load_workbook(template)
d = Document(ROOT / 'docs/srs/SANTAP_SRS_FINAL.docx')

def row(sheet, number, values):
    for col, value in enumerate(values, 1):
        if value is not None:
            w[sheet].cell(number, col, value)

notes = [
    'SANTAP — diisi dari artefak proyek. Tanggal penyusunan: 13 November 2026.',
    'Sumber: ../SRS/SANTAP_SRS_FINAL.docx; ../Penilaian/ELISITASI_SRS_SANTAP.md; ../Penilaian/DOKUMEN_INISIASI_SANTAP.md.',
    'Teknologi/data: ../MYSQL_SETUP.md; ../server/schema.sql; ../docs/models/. MySQL operasional; Firebase Auth dan profil/role Firestore.',
    'ID FR/NFR memakai namespace SRS FINAL. ID ELIS dan baseline v1.1 berbeda; perlu rekonsiliasi sebelum pengumpulan.',
    'AD-01 = MEAL_ACTIVITY; AD-02 = CLOSING_ACTIVITY; SD-01 = MEAL_SEQUENCE; SD-02 = QUEUE_SEQUENCE; SD-03 = PROFILE_SEQUENCE (docs/models/SANTAP_V1_2_*.puml).',
    'Deskripsi UC di SRS masih ringkas: belum lengkap prasyarat, pascakondisi, dan eksepsi. Status description ditandai Belum.',
    'Activity ketiga belum berupa diagram. Class diagram pada DOCX masih ringkasan teks; sumber PlantUML memuat 8 kelas.',
    'Kasus uji berikut adalah rencana black-box; belum dijalankan untuk workbook ini. Klaim tes otomatis dalam SRS tidak dianggap hasil aktual kasus uji.',
    'Identitas anggota, kontribusi/jam aktual, penanggung jawab, dan tanggal kerja dibiarkan kosong sampai bukti tersedia.',
    'Rencana adalah backlog usulan, bukan klaim pekerjaan/tanggal yang sudah dilakukan. Proses berarti ada artefak tetapi penerimaan belum diverifikasi.',
    'Ringkasan: 2 teknik dan 12 pertanyaan berupa parafrasa dari dokumen elisitasi; tanggal/bukti wawancara perlu dilengkapi.',
    'L-01 Login; L-02 Mahasiswa/QR; L-03 Antrean (bagian dashboard); L-04 Staff; L-05 Supervisor/Head; L-06 Admin. Jumlah 6 merujuk layar pada SRS, bukan 6 route terpisah.',
    'Peta tabel memakai skema SQL untuk data operasional. settings/operations dan push tetap koleksi Firestore, bukan tabel MySQL.',
]
for i, note in enumerate(notes, 31):
    w['Petunjuk'].cell(i, 3, note)
    w['Petunjuk'].cell(i, 3)._style = copy(w['Petunjuk']['C25']._style)

identity = ['SANTAP (nomor kelompok belum tersedia)', 'SANTAP — Sistem Antrean dan Pencatatan Aktivitas Pengambilan', 'Fern Wallace Dining Hall, Universitas Klabat', 'Mahasiswa, Staff, Supervisor, Head, Admin', 'Agile', 'React/Vite; Node.js; MySQL/MariaDB; Firebase Authentication dan Firestore untuk profil/role, konfigurasi dan push', 'https://github.com/deedisini/santap-react', 'http://localhost:5173/ (lokal; jalankan Vite dan API SQL sesuai MYSQL_SETUP.md)']
for i, v in enumerate(identity, 4):
    w['Identitas'].cell(i, 3, v)

# Tuple: UC, actor, AD, SD, class, data table/collection, screen.
maps = [
('UC-01','Semua role','','','UserProfile','users (Firestore)','L-01'),
('UC-01, UC-08','Semua role','','','UserProfile','users (Firestore)','L-01, L-05'),
('UC-09','Admin','','SD-03','Student','students','L-06'),
('UC-09','Admin','','SD-03','Student','students','L-06'),
('UC-02','Mahasiswa','','','Student','students','L-02'),
('UC-04','Staff, Head','AD-01','SD-01','Student, MealRecord','students, meal_records','L-04'),
('UC-04','Staff, Head','AD-01','SD-01','Student','students','L-04'),
('UC-04','Staff, Head','AD-01','SD-01','MealPeriod','meal_periods','L-04'),
('UC-04','Staff, Head','AD-01','SD-01','MealRecord','meal_records','L-04'),
('UC-04','Staff, Head','AD-01','SD-01','MealRecord','meal_records','L-04'),
('UC-03','Mahasiswa','','SD-02','QueueEntry','queues','L-03'),
('UC-05','Staff, Head','','SD-02','QueueEntry','queues','L-04'),
('UC-06','Supervisor, Head','AD-02','','MealRecord, Student','meal_records, students','L-05'),
('UC-07','Supervisor, Head','AD-02','','PushSubscription, PushDelivery','pushSubscriptions (Firestore)','L-05'),
('UC-08','Head','AD-01, AD-02','SD-01','UserProfile','users (Firestore)','L-04, L-05'),
('UC-10','Mahasiswa','','','UserProfile','users (Firestore); penyimpanan rating perlu diverifikasi','L-02'),
('UC-11','Admin','','','OperationsConfig','settings/operations (Firestore)','L-06'),
('UC-06','Supervisor, Head','AD-02','','OperationsConfig','settings/operations (Firestore)','L-05'),
('UC-11','Admin','','','OperationsConfig','settings/operations (Firestore)','L-06'),
('UC-04','Staff, Head','AD-01','SD-01','MealRecord','penyimpanan lokal; meal_records setelah validasi','L-04'),
]
sources = ['KINTARA login','KINTARA dashboard; Q11','Q6, Q8','Q6; administrasi','Q1','Q1, Q2','Q8','Q8; jadwal resmi pemilik proyek','Q9','Q8','Q3, Q4','Q4','Q5, Q6','Q7; push sesuai revisi v1.2','Q11','Q12','jadwal resmi pemilik proyek; v1.2','v1.2; warning 10 menit','instruksi pemilik: Jumat 18:00–Sabtu 18:00 WITA','Q2; v1.2 validasi ulang server']
fr = next(t for t in d.tables if t.cell(0,1).text == 'Pernyataan kebutuhan')
reqs = [[c.text for c in r.cells] for r in fr.rows[1:]]
for i, (rid, requirement, priority) in enumerate(reqs):
    uc, actor, ad, sd, cls, data, screen = maps[i]
    row('Kebutuhan',6+i,[rid,'FR',uc,requirement,actor,priority,'ELIS: '+sources[i],'Proses','SRS FINAL §5.2; status penerimaan belum diverifikasi.'])
    row('Keterlacakan',6+i,[rid,None,None,uc,ad,sd,cls,data,screen,f'TC-{i+1:02}'])

nfr = next(t for t in d.tables if t.cell(0,0).text == 'ID' and t.cell(0,1).text == 'Kategori')
for i,r in enumerate(nfr.rows[1:]):
    rid, category, requirement = [c.text for c in r.cells]
    row('Kebutuhan',26+i,[rid,'NFR',category,requirement,'Semua role','Must','SRS FINAL §5.3; prioritas usulan untuk validasi','Proses','Prioritas Must adalah usulan workbook; SRS FINAL belum memberi prioritas NFR.'])

names=['Login','Tampilkan QR Identitas','Akses Antrean','Proses Pengambilan','Kelola Antrean','Monitor Dining Hall','Reminder Push dan Penutupan Terjadwal','Akses Head','Kelola Akun dan Profil','Rating dan Saran','Konfigurasi Jadwal dan Tema Sabat']
for i,name in enumerate(names,1):
    uc=f'UC-{i:02}'
    indexes=[j for j,m in enumerate(maps) if uc in m[0].split(', ')]
    def join(k): return ', '.join(dict.fromkeys(v for j in indexes for v in maps[j][k].split(', ') if v))
    row('Use Case',5+i,[uc,name,join(1),', '.join(f'FR-{j+1:02}' for j in indexes),'Belum',join(2),join(3),join(6),None,'Proses'])

cases=[
('Login valid dan tidak valid','Buka login; masukkan kredensial valid lalu tidak valid','Akun uji tiap role; sandi salah','Login valid membuka dashboard; sandi salah ditolak'),
('Pembatasan role','Login Mahasiswa; coba akses operasi Admin dan Head','Akun Mahasiswa','Akses di luar role ditolak tanpa mutasi'),
('Kelengkapan profil','Buka profil mahasiswa melalui Admin; periksa field wajib','NIM, nama, email, fakultas, residence','Field tersimpan dan dibaca konsisten'),
('Pembaruan profil','Ubah fakultas; simpan; muat ulang; coba NIM tidak ada','Mahasiswa fixture; NIM tidak terdaftar','Perubahan valid tersimpan; NIM tidak dikenal ditolak'),
('QR identitas','Login Mahasiswa; buka dashboard; baca QR','Mahasiswa fixture','QR berisi identitas sesuai mahasiswa login'),
('Tiga metode identifikasi','Identifikasi fixture melalui QR, barcode, lalu NIM','Tiga metode untuk NIM yang sama','Semua metode menemukan mahasiswa yang sama'),
('Profil tidak lengkap','Coba catat makan untuk NIM tidak dikenal dan profil kosong','NIM tidak terdaftar; profil tanpa fakultas','Ditolak; tidak ada meal_records baru'),
('Batas jam dan jeda','Uji 07:59:59 dan 08:00; Jumat 17:59:59 dan 18:00; periode dijeda','Clock fixture Asia/Makassar; tanggal Jumat','Saat tutup atau dijeda ditolak; sebelum tutup dapat dilayani jika syarat lain valid'),
('Duplikasi pengambilan','Kirim dua permintaan serentak untuk NIM/periode/tanggal yang sama','Mahasiswa fixture yang belum makan','Hanya satu catatan tersimpan'),
('Pencatatan makan','Catat makan valid; baca SQL melalui API dan query SELECT','Mahasiswa dan petugas fixture; periode aktif','NIM, periode, served_date/time dan staff_uid sesuai; antrean terkait diselesaikan'),
('Masuk antrean','Login Mahasiswa; masuk antrean dua kali; buka status','Periode aktif; mahasiswa fixture','Satu antrean waiting; status terlihat; duplikasi ditolak'),
('Kelola antrean','Login Staff; selesaikan atau batalkan antrean fixture','Dua antrean waiting','Status completed/cancelled benar dan konsisten'),
('Monitoring','Bandingkan dashboard dengan records SQL per periode/residence','Records fixture dua status asrama','Total dan kelompok asrama cocok dengan data'),
('Push dan fallback','Izin push; simulasikan 10 menit sebelum tutup; ulangi; tolak izin','Supervisor; Jumat 17:50; konfigurasi FCM/VAPID','Notifikasi satu kali per event; fallback saat izin ditolak; perlu perangkat nyata'),
('Hak akses Head','Login Head; akses pencatatan dan monitoring','Akun Head fixture','Fungsi Staff dan Supervisor dapat diakses sesuai role'),
('Rating dan saran','Kirim rating 1 dan 5; coba 0 dan 6','Rating batas; saran kosong/terisi','1–5 diterima; nilai di luar rentang ditolak'),
('Konfigurasi jadwal','Admin simpan jadwal valid lalu tumpang tindih','Jadwal resmi; jadwal overlap','Valid tersimpan; overlap ditolak; backend mengikuti konfigurasi'),
('Jam dan warning','Simulasikan 07:49:59, 07:50, 08:00; aktifkan reduced motion','Clock fixture WITA; preferensi reduced motion','Warning hanya 10 menit terakhir; berhenti saat tutup; tanpa animasi jika reduced motion'),
('Tema Sabat','Aktifkan tema; uji Jumat 17:59,18:00 dan Sabtu 18:00','Clock fixture WITA','Tema aktif Jumat18–Sabtu18; kelayakan makan tidak berubah'),
('Gangguan jaringan','Putus jaringan sebelum pencatatan; pulihkan setelah periode tutup','Fixture belum makan; offline lalu online','Tidak menampilkan sukses final; validasi server tetap menolak periode tertutup'),
]
for i,(scenario,steps,inputs,expected) in enumerate(cases):
    row('Pengujian',6+i,[f'TC-{i+1:02}',maps[i][0],f'FR-{i+1:02}',scenario,steps,inputs,expected,None,'Belum diuji',None,None,'Gunakan data uji terisolasi. Hasil aktual diisi setelah eksekusi.'])

plans=[('Iterasi 1','Validasi identitas anggota dan bukti elisitasi','Identitas; lampiran wawancara'),('Iterasi 1','Rekonsiliasi ID baseline v1.1, ELIS dan SRS FINAL','Peta ID dan kebutuhan konsisten'),('Iterasi 2','Lengkapi deskripsi seluruh UC dan activity diagram ketiga','UC lengkap; AD-03'),('Iterasi 2','Selaraskan sequence/class/ERD dengan mode MySQL','Model SQL dan Firebase yang konsisten'),('Iterasi 2','Verifikasi UI dan konfigurasi jadwal, warning, push, Sabat','Bukti UI; konfigurasi Firebase/push'),('Iterasi 3','Jalankan TC-01 sampai TC-20 pada lingkungan uji','Hasil aktual, penguji, tanggal dan bukti'),('Iterasi 3','Review keterlacakan dan kumpulkan paket akademik','SRS; workbook; repository')]
for i,(stage,task,artifact) in enumerate(plans,6): row('Rencana',i,[stage,task,artifact,None,None,None,None,'Belum','Usulan tindak lanjut berdasarkan gap dokumen; tanggal/PIC belum dikonfirmasi.'])
for cell,value in {'C5':2,'C6':12,'C10':5,'C13':2,'C14':3,'C15':8,'C16':5,'C17':6}.items(): w['Ringkasan'][cell]=value
w['Ringkasan']['F15']='Sumber PlantUML CLASS: 8 kelas; visual di SRS perlu diperbaiki'
w['Ringkasan']['F16']='5 tabel pada server/schema.sql (mode MySQL)'
w['Ringkasan']['F13']='2 diagram tersedia; AD-03 masih narasi'
w['Ringkasan']['F6']='12 parafrasa di dokumen ELIS; bukti asli belum lengkap'

for s in w:
    s.freeze_panes='D6' if s.title in ('Kebutuhan','Keterlacakan','Pengujian') else 'B6'
    for cells in s:
        needed=0
        for c in cells:
            if c.value is None: continue
            a=copy(c.alignment); a.wrap_text=True; a.vertical='top'; c.alignment=a
            if c.data_type=='f': continue
            width=s.column_dimensions[c.column_letter].width or 12
            if s.title=='Identitas' and c.column==3: width=70
            needed=max(needed, math.ceil(len(str(c.value))/max(8,width-3))*15+8)
        if needed: s.row_dimensions[cells[0].row].height=max(s.row_dimensions[cells[0].row].height or 15,min(needed,300))
    s.sheet_properties.pageSetUpPr.fitToPage=True
    s.page_setup.orientation='landscape'; s.page_setup.paperSize=s.PAPERSIZE_A3
    s.page_setup.fitToWidth=1; s.page_setup.fitToHeight=0
    s.print_title_rows='1:5'
    s.print_options.horizontalCentered=True
w.calculation=CalcProperties(calcId=0,fullCalcOnLoad=True,forceFullCalc=True)
w.save(out)

# Preserve every template formula and validation while making a separate workbook.
base=openpyxl.load_workbook(template)
check=openpyxl.load_workbook(out)
assert base.sheetnames==check.sheetnames
for s in base:
    for cells in s:
        for c in cells:
            if c.data_type=='f': assert check[s.title][c.coordinate].value==c.value
    assert len(s.data_validations.dataValidation)==len(check[s.title].data_validations.dataValidation)
assert sum(check['Kebutuhan'].cell(r,2).value=='FR' for r in range(6,66))==20
assert sum(check['Pengujian'].cell(r,9).value=='Belum diuji' for r in range(6,86))==20
print(out)
print('Verified: 20 FR, 7 NFR, 11 UC, 20 test cases; template formulas and validations preserved.')
