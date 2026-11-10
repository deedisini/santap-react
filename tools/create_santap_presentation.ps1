$ErrorActionPreference = 'Stop'

$outDir = Join-Path $PSScriptRoot '..\presentation-output'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$outFile = Join-Path $outDir 'SANTAP_Project_Basis_Data.pptx'
if (Test-Path $outFile) { Remove-Item -LiteralPath $outFile -Force }

$ppt = New-Object -ComObject PowerPoint.Application
$ppt.Visible = -1
$deck = $ppt.Presentations.Add()
$deck.PageSetup.SlideSize = 15 # widescreen

$W = 13.333; $H = 7.5
$green = 0x244B38; $accent = 0x56A56F; $light = 0xF5F8F4; $ink = 0x1E2C24; $muted = 0x5D6C62; $white = 0xFFFFFF

function Add-Text($slide, $text, $x, $y, $w, $h, $size = 18, $color = $ink, $bold = $false, $align = 1) {
  $box = $slide.Shapes.AddTextbox(1, $x * 72, $y * 72, $w * 72, $h * 72)
  $box.TextFrame.TextRange.Text = $text
  $box.TextFrame.TextRange.Font.Name = 'Aptos'
  $box.TextFrame.TextRange.Font.Size = $size
  $box.TextFrame.TextRange.Font.Color.RGB = $color
  $box.TextFrame.TextRange.Font.Bold = [int]$bold
  $box.TextFrame.TextRange.ParagraphFormat.Alignment = $align
  $box.TextFrame.MarginLeft = 0; $box.TextFrame.MarginRight = 0
  return $box
}

function Add-Box($slide, $x, $y, $w, $h, $fill = $white, $line = $accent) {
  $shape = $slide.Shapes.AddShape(5, $x * 72, $y * 72, $w * 72, $h * 72)
  $shape.Fill.ForeColor.RGB = $fill
  $shape.Line.ForeColor.RGB = $line
  $shape.Line.Weight = 1.25
  return $shape
}

function New-Slide($title) {
  $slide = $deck.Slides.Add($deck.Slides.Count + 1, 12)
  $slide.FollowMasterBackground = 0
  $slide.Background.Fill.ForeColor.RGB = $light
  $bar = $slide.Shapes.AddShape(1, 0, 0, $W * 72, 0.16 * 72)
  $bar.Fill.ForeColor.RGB = $green; $bar.Line.Visible = 0
  Add-Text $slide $title 0.55 0.35 12.1 0.55 28 $green $true 1 | Out-Null
  Add-Text $slide 'SANTAP · Sistem Antrean dan Pencatatan Pengambilan Makan' 0.57 7.08 9.8 0.22 9 $muted $false 1 | Out-Null
  Add-Text $slide ("{0}" -f $deck.Slides.Count) 12.2 7.05 0.55 0.22 9 $muted $false 3 | Out-Null
  return $slide
}

# 1 — title
$s = $deck.Slides.Add(1, 12); $s.FollowMasterBackground = 0; $s.Background.Fill.ForeColor.RGB = $green
$band = $s.Shapes.AddShape(1, 0, 0, 0.25 * 72, $H * 72); $band.Fill.ForeColor.RGB = $accent; $band.Line.Visible = 0
Add-Text $s 'SANTAP' 0.8 1.35 8.6 0.8 44 $white $true 1 | Out-Null
Add-Text $s 'Sistem Antrean dan Pencatatan Pengambilan Makan' 0.82 2.25 8.5 0.6 26 $white $false 1 | Out-Null
Add-Text $s 'Project Basis Data · MySQL' 0.84 3.05 4.2 0.35 18 0xD9EBDC $false 1 | Out-Null
Add-Text $s 'Kelompok: ____________________`nKelas: ____________________`nTanggal: ____________________' 0.84 5.42 5.2 0.7 16 0xD9EBDC $false 1 | Out-Null
$q = Add-Box $s 9.5 1.35 2.55 2.55 0xE9F4EA $accent
Add-Text $s 'QR' 9.96 1.95 1.65 0.7 38 $green $true 2 | Out-Null
Add-Text $s 'Identifikasi mahasiswa\ndengan QR atau NIM' 9.75 2.95 2.05 0.45 15 $green $false 2 | Out-Null

# 2
$s = New-Slide 'Latar Belakang dan Tujuan Sistem'
Add-Text $s 'Masalah' 0.7 1.25 2 0.35 20 $green $true 1 | Out-Null
Add-Text $s "Pencatatan manual membuat antrean sulit dipantau dan riwayat pengambilan mudah terlewat. SANTAP mencatat identitas mahasiswa, antrean, periode makan, dan validasi staff dalam satu basis data." 0.7 1.72 5.55 1.6 20 $ink $false 1 | Out-Null
Add-Text $s 'Tujuan' 7.0 1.25 2 0.35 20 $green $true 1 | Out-Null
Add-Text $s "• Memvalidasi pengambilan makan\n• Menampilkan status antrean\n• Menyediakan riwayat untuk monitoring" 7.0 1.72 5.1 1.65 20 $ink $false 1 | Out-Null
Add-Text $s 'Batasan: fokus pada operasi Dining Hall dan data yang relevan untuk layanan makan.' 0.7 4.35 11.6 0.42 17 $muted $false 1 | Out-Null

# 3
$s = New-Slide 'Aktor dan Proses Utama'
$actors = @(@('Mahasiswa','Masuk antrean, menunjukkan QR, melihat status'),@('Staff','Memindai QR atau NIM, mencatat pengambilan'),@('Supervisor','Memantau rekaman dan antrean'),@('Head dan Admin','Mengatur periode serta akun'))
$x = 0.72
foreach ($a in $actors) { $b = Add-Box $s $x 1.6 2.85 2.2; Add-Text $s $a[0] ($x+0.18) 1.88 2.48 0.35 19 $green $true 2 | Out-Null; Add-Text $s $a[1] ($x+0.22) 2.5 2.4 0.8 15 $ink $false 2 | Out-Null; $x += 3.05 }
Add-Text $s 'Alur inti: mahasiswa diidentifikasi, sistem memeriksa periode, staff menyimpan catatan pengambilan.' 0.8 4.55 11.4 0.45 18 $muted $false 2 | Out-Null

# 4
$s = New-Slide 'Entitas dan Atribut Utama'
$data = @(@('users','firebase_uid (PK), email, name, role, nim'),@('students','nim (PK), name, faculty, residence, email'),@('meal_periods','id (PK), label, serving_time, active'),@('queues','id (PK), nim (FK), period_id (FK), status'),@('meal_records','id (PK), nim (FK), period_id (FK), staff_uid'))
$y=1.25; foreach ($row in $data) { Add-Text $s $row[0] 0.85 $y 2.2 0.35 20 $green $true 1 | Out-Null; Add-Text $s $row[1] 3.2 $y 8.8 0.38 18 $ink $false 1 | Out-Null; $line=$s.Shapes.AddLine(0.85*72,($y+0.52)*72,12.1*72,($y+0.52)*72); $line.Line.ForeColor.RGB=0xD5DED7; $y+=0.82 }

# 5 ERD
$s = New-Slide 'ERD SANTAP'
$nodes = @(@('students','nim (PK)'),@('users','firebase_uid (PK)'),@('meal_periods','id (PK)'),@('queues','id (PK)'),@('meal_records','id (PK)'))
$coords = @(@(0.7,2.0),@(3.35,0.95),@(3.35,4.0),@(6.2,2.0),@(9.15,2.0))
for($i=0;$i -lt $nodes.Count;$i++){ $b=Add-Box $s $coords[$i][0] $coords[$i][1] 2.15 1.1; Add-Text $s $nodes[$i][0] ($coords[$i][0]+0.12) ($coords[$i][1]+0.2) 1.9 0.3 18 $green $true 2 | Out-Null; Add-Text $s $nodes[$i][1] ($coords[$i][0]+0.1) ($coords[$i][1]+0.62) 1.95 0.22 13 $muted $false 2 | Out-Null }
foreach($l in @(@(2.85,2.55,3.35,1.5),@(2.85,2.55,3.35,4.55),@(5.5,1.5,6.2,2.55),@(5.5,4.55,6.2,2.55),@(8.35,2.55,9.15,2.55))){$line=$s.Shapes.AddLine($l[0]*72,$l[1]*72,$l[2]*72,$l[3]*72);$line.Line.ForeColor.RGB=$accent;$line.Line.Weight=2}
Add-Text $s 'Mahasiswa memiliki akun. Mahasiswa masuk antrean. Staff memvalidasi catatan pengambilan pada periode makan.' 0.75 5.8 11.8 0.42 17 $muted $false 2 | Out-Null

# 6
$s = New-Slide 'Relasi dan Kardinalitas'
$rels = @(@('students 1 : 0..1 users','Mahasiswa dapat memiliki satu akun login.'),@('students 1 : 0..N queues','Seorang mahasiswa dapat memiliki banyak riwayat antrean.'),@('meal_periods 1 : 0..N meal_records','Satu periode mencakup banyak pengambilan.'),@('users 1 : 0..N meal_records','Satu staff dapat memvalidasi banyak catatan.'),@('queues 0..1 : 0..1 meal_records','Antrean dapat selesai menjadi satu catatan pengambilan.'))
$y=1.15; foreach($r in $rels){Add-Text $s $r[0] 0.8 $y 3.9 0.35 19 $green $true 1 | Out-Null;Add-Text $s $r[1] 4.9 $y 7.1 0.35 17 $ink $false 1 | Out-Null;$y+=0.86}

# 7
$s = New-Slide 'Pemetaan ERD ke MySQL'
Add-Text $s 'Konsep ERD' 0.9 1.25 3.0 0.35 20 $green $true 1 | Out-Null
Add-Text $s 'Implementasi MySQL' 5.2 1.25 3.5 0.35 20 $green $true 1 | Out-Null
$pairs = @(@('Entity','CREATE TABLE'),@('Primary key','PRIMARY KEY'),@('Relasi','FOREIGN KEY'),@('Nilai terbatas','ENUM'),@('Pencarian umum','INDEX'))
$y=1.82; foreach($p in $pairs){Add-Text $s $p[0] 0.9 $y 3.0 0.32 18 $ink $false 1 | Out-Null;Add-Text $s $p[1] 5.2 $y 3.6 0.32 18 $ink $false 1 | Out-Null;$y+=0.7}
Add-Text $s 'Contoh FK: queues.nim → students.nim dan meal_records.period_id → meal_periods.id.' 0.9 5.7 11.2 0.4 18 $muted $false 1 | Out-Null

# 8 schema
$s = New-Slide 'Struktur Tabel MySQL'
Add-Text $s 'Tabel' 0.8 1.1 2.0 0.32 18 $green $true 1 | Out-Null
Add-Text $s 'Fungsi' 3.1 1.1 4.2 0.32 18 $green $true 1 | Out-Null
Add-Text $s 'Kunci penting' 8.0 1.1 3.4 0.32 18 $green $true 1 | Out-Null
$rows=@(@('users','Identitas dan peran akun','firebase_uid; nim unik'),@('students','Data mahasiswa dan asrama','nim'),@('meal_periods','Periode Pagi, Siang, Malam','id'),@('queues','Status antrean','nim, period_id'),@('meal_records','Bukti pengambilan','nim, period_id, staff_uid'))
$y=1.7; foreach($r in $rows){Add-Text $s $r[0] 0.8 $y 2.0 0.33 18 $ink $true 1|Out-Null;Add-Text $s $r[1] 3.1 $y 4.25 0.33 18 $ink $false 1|Out-Null;Add-Text $s $r[2] 8.0 $y 3.7 0.33 18 $ink $false 1|Out-Null;$y+=0.72}

# 9 records table
$s = New-Slide 'Data Demonstrasi: 20 Record per Tabel'
$table = $s.Shapes.AddTable(6,3,0.95*72,1.25*72,11.3*72,3.7*72)
$headers=@('Tabel','Jumlah record','Contoh data')
$values=@(@('users','20','Mahasiswa 01, Mahasiswa 02'),@('students','20','NIM, fakultas, status asrama'),@('meal_periods','20','Pagi, Siang, Malam'),@('queues','20','waiting, completed, cancelled'),@('meal_records','20','NIM, staff, waktu pengambilan'))
for($c=1;$c -le 3;$c++){ $cell=$table.Table.Cell(1,$c).Shape; $cell.Fill.ForeColor.RGB=$green; $cell.TextFrame.TextRange.Text=$headers[$c-1]; $cell.TextFrame.TextRange.Font.Name='Aptos';$cell.TextFrame.TextRange.Font.Size=17;$cell.TextFrame.TextRange.Font.Bold=-1;$cell.TextFrame.TextRange.Font.Color.RGB=$white }
for($r=2;$r -le 6;$r++){for($c=1;$c -le 3;$c++){$cell=$table.Table.Cell($r,$c).Shape;$cell.Fill.ForeColor.RGB=$white;$cell.TextFrame.TextRange.Text=$values[$r-2][$c-1];$cell.TextFrame.TextRange.Font.Name='Aptos';$cell.TextFrame.TextRange.Font.Size=16;$cell.TextFrame.TextRange.Font.Color.RGB=$ink}}
Add-Text $s 'Dataset tersedia pada server/demo-seed.sql dan memenuhi syarat minimal 20 record untuk masing-masing lima tabel.' 0.95 5.35 11.3 0.5 17 $muted $false 1 | Out-Null

# 10
$s = New-Slide 'Alur Transaksi Pengambilan Makan'
$steps=@(@('1','Scan QR atau NIM'),@('2','Cek data mahasiswa'),@('3','Cek periode aktif'),@('4','Simpan meal_records'),@('5','Perbarui status queue'))
$x=0.65;foreach($step in $steps){$b=Add-Box $s $x 2.0 2.3 1.5;$circle=$s.Shapes.AddShape(9,($x+0.15)*72,2.23*72,0.48*72,0.48*72);$circle.Fill.ForeColor.RGB=$green;$circle.Line.Visible=0;Add-Text $s $step[0] ($x+0.17) 2.31 0.44 0.2 12 $white $true 2|Out-Null;Add-Text $s $step[1] ($x+0.18) 2.86 1.95 0.35 15 $ink $true 2|Out-Null;$x+=2.5}
Add-Text $s 'Catatan pengambilan menyimpan mahasiswa, periode, staff, tanggal, waktu, dan token verifikasi.' 0.9 4.7 11.4 0.45 18 $muted $false 2 | Out-Null

# 11
$s = New-Slide 'Pengujian dan Aturan Data'
Add-Text $s "• NIM harus ada pada tabel students.\n• Periode harus terdaftar pada meal_periods.\n• Status antrean hanya waiting, completed, atau cancelled.\n• verification_token pada meal_records bersifat unik.\n• Foreign key menjaga relasi tetap konsisten." 0.95 1.35 7.3 3.3 21 $ink $false 1 | Out-Null
Add-Text $s 'Keyword: Primary Key, Foreign Key, Cardinality, Normalisasi, Transaction, Index' 0.95 5.3 11.3 0.4 18 $green $true 1 | Out-Null

# 12
$s = New-Slide 'Rencana Presentasi dan Demo'
$plan=@(@('1–2 menit','Masalah dan tujuan SANTAP'),@('3–6 menit','Entitas, atribut, dan ERD'),@('7–10 menit','Pemetaan ke MySQL dan lima tabel'),@('11–14 menit','Tampilkan 20 record per tabel'),@('15–17 menit','Demo scan atau input NIM'),@('18–20 menit','Tanya jawab'))
$y=1.15;foreach($p in $plan){Add-Text $s $p[0] 0.9 $y 2.1 0.32 18 $green $true 1|Out-Null;Add-Text $s $p[1] 3.25 $y 7.5 0.32 18 $ink $false 1|Out-Null;$y+=0.7}
Add-Text $s 'Persiapan kelas: laptop terisi, konektor tersedia, dan database lokal sudah berjalan.' 0.9 5.8 11.3 0.42 17 $muted $false 1 | Out-Null

# 13
$s = New-Slide 'Kesimpulan dan Tanya Jawab'
Add-Text $s 'SANTAP memetakan kebutuhan Dining Hall ke lima tabel relasional yang terhubung melalui primary key dan foreign key.' 0.95 1.55 11.2 0.78 24 $green $true 2 | Out-Null
Add-Text $s 'Terima kasih' 0.95 3.35 11.2 0.55 32 $green $true 2 | Out-Null
Add-Text $s 'Pertanyaan?' 0.95 4.22 11.2 0.38 21 $muted $false 2 | Out-Null

$deck.SaveAs($outFile)
$deck.Close()
$ppt.Quit()
[Runtime.InteropServices.Marshal]::ReleaseComObject($deck) | Out-Null
[Runtime.InteropServices.Marshal]::ReleaseComObject($ppt) | Out-Null
[GC]::Collect(); [GC]::WaitForPendingFinalizers()
Write-Output $outFile
