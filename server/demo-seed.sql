USE santap;

-- Dataset demonstrasi SANTAP.
-- meal_periods adalah tabel referensi; hanya ada tiga nilai yang sah secara bisnis.
-- Syarat 20 record dipenuhi oleh tabel profil dan transaksi, bukan lookup statis.

-- Bersihkan periode fiktif buatan seed versi sebelumnya.
DELETE FROM meal_periods WHERE id LIKE 'period-%';

INSERT INTO meal_periods (id, label, serving_time, active) VALUES
  ('morning', 'Pagi', '05.30-07.00', TRUE),
  ('afternoon', 'Siang', '11.30-13.30', FALSE),
  ('evening', 'Malam', '17.30-19.00', FALSE)
ON DUPLICATE KEY UPDATE label = VALUES(label), serving_time = VALUES(serving_time), active = VALUES(active);

INSERT INTO students (nim, name, faculty, residence, email) VALUES
  ('23101001', 'Adrian Matthew', 'Informatika', 'Penghuni Asrama', '23101001@student.unklab.ac.id'),
  ('23101002', 'Clara Elizabeth', 'Sistem Informasi', 'Non-penghuni', '23101002@student.unklab.ac.id'),
  ('23101003', 'Nathaniel Joseph', 'Informatika', 'Penghuni Asrama', '23101003@student.unklab.ac.id'),
  ('23101004', 'Michelle Grace', 'Akuntansi', 'Non-penghuni', '23101004@student.unklab.ac.id'),
  ('23101005', 'Daniel Samuel', 'Teknik Sipil', 'Penghuni Asrama', '23101005@student.unklab.ac.id'),
  ('23101006', 'Jonathan William', 'Manajemen', 'Non-penghuni', '23101006@student.unklab.ac.id'),
  ('23101007', 'Rachel Naomi', 'Informatika', 'Penghuni Asrama', '23101007@student.unklab.ac.id'),
  ('23101008', 'Kevin Andrew', 'Sistem Informasi', 'Penghuni Asrama', '23101008@student.unklab.ac.id'),
  ('23101009', 'Deborah Angel', 'Akuntansi', 'Non-penghuni', '23101009@student.unklab.ac.id'),
  ('23101010', 'Samuel David', 'Teknik Sipil', 'Penghuni Asrama', '23101010@student.unklab.ac.id'),
  ('23101011', 'Joshua Peter', 'Manajemen', 'Non-penghuni', '23101011@student.unklab.ac.id'),
  ('23101012', 'Esther Maria', 'Informatika', 'Penghuni Asrama', '23101012@student.unklab.ac.id'),
  ('23101013', 'Caleb Thomas', 'Sistem Informasi', 'Non-penghuni', '23101013@student.unklab.ac.id'),
  ('23101014', 'Hannah Ruth', 'Akuntansi', 'Penghuni Asrama', '23101014@student.unklab.ac.id'),
  ('23101015', 'Benjamin Paul', 'Teknik Sipil', 'Non-penghuni', '23101015@student.unklab.ac.id'),
  ('23101016', 'Sarah Joy', 'Manajemen', 'Penghuni Asrama', '23101016@student.unklab.ac.id'),
  ('23101017', 'Matthew John', 'Informatika', 'Non-penghuni', '23101017@student.unklab.ac.id'),
  ('23101018', 'Rebecca Hope', 'Sistem Informasi', 'Penghuni Asrama', '23101018@student.unklab.ac.id'),
  ('23101019', 'Andrew Mark', 'Akuntansi', 'Non-penghuni', '23101019@student.unklab.ac.id'),
  ('23101020', 'Lydia Faith', 'Manajemen', 'Penghuni Asrama', '23101020@student.unklab.ac.id')
ON DUPLICATE KEY UPDATE name = VALUES(name), faculty = VALUES(faculty), residence = VALUES(residence), email = VALUES(email);

-- 20 akun mahasiswa dan akun petugas yang betul-betul dapat membuat riwayat layanan.
INSERT INTO users (firebase_uid, email, name, role, nim) VALUES
  ('demo-student-01', '23101001@student.unklab.ac.id', 'Adrian Matthew', 'Mahasiswa', '23101001'),
  ('demo-student-02', '23101002@student.unklab.ac.id', 'Clara Elizabeth', 'Mahasiswa', '23101002'),
  ('demo-student-03', '23101003@student.unklab.ac.id', 'Nathaniel Joseph', 'Mahasiswa', '23101003'),
  ('demo-student-04', '23101004@student.unklab.ac.id', 'Michelle Grace', 'Mahasiswa', '23101004'),
  ('demo-student-05', '23101005@student.unklab.ac.id', 'Daniel Samuel', 'Mahasiswa', '23101005'),
  ('demo-student-06', '23101006@student.unklab.ac.id', 'Jonathan William', 'Mahasiswa', '23101006'),
  ('demo-student-07', '23101007@student.unklab.ac.id', 'Rachel Naomi', 'Mahasiswa', '23101007'),
  ('demo-student-08', '23101008@student.unklab.ac.id', 'Kevin Andrew', 'Mahasiswa', '23101008'),
  ('demo-student-09', '23101009@student.unklab.ac.id', 'Deborah Angel', 'Mahasiswa', '23101009'),
  ('demo-student-10', '23101010@student.unklab.ac.id', 'Samuel David', 'Mahasiswa', '23101010'),
  ('demo-student-11', '23101011@student.unklab.ac.id', 'Joshua Peter', 'Mahasiswa', '23101011'),
  ('demo-student-12', '23101012@student.unklab.ac.id', 'Esther Maria', 'Mahasiswa', '23101012'),
  ('demo-student-13', '23101013@student.unklab.ac.id', 'Caleb Thomas', 'Mahasiswa', '23101013'),
  ('demo-student-14', '23101014@student.unklab.ac.id', 'Hannah Ruth', 'Mahasiswa', '23101014'),
  ('demo-student-15', '23101015@student.unklab.ac.id', 'Benjamin Paul', 'Mahasiswa', '23101015'),
  ('demo-student-16', '23101016@student.unklab.ac.id', 'Sarah Joy', 'Mahasiswa', '23101016'),
  ('demo-student-17', '23101017@student.unklab.ac.id', 'Matthew John', 'Mahasiswa', '23101017'),
  ('demo-student-18', '23101018@student.unklab.ac.id', 'Rebecca Hope', 'Mahasiswa', '23101018'),
  ('demo-student-19', '23101019@student.unklab.ac.id', 'Andrew Mark', 'Mahasiswa', '23101019'),
  ('demo-student-20', '23101020@student.unklab.ac.id', 'Lydia Faith', 'Mahasiswa', '23101020'),
  ('demo-staff-01', '10001@staffdining.unklab.ac.id', 'Martha Waworuntu', 'Staff', NULL),
  ('demo-staff-02', '10002@staffdining.unklab.ac.id', 'Randy Kambey', 'Staff', NULL),
  ('demo-staff-03', '10003@staffdining.unklab.ac.id', 'Lina Sompotan', 'Staff', NULL),
  ('demo-staff-04', '10004@staffdining.unklab.ac.id', 'Ferry Runtuwene', 'Staff', NULL),
  ('demo-staff-05', '10005@staffdining.unklab.ac.id', 'Yuliana Sondakh', 'Staff', NULL),
  ('demo-supervisor-01', '20001@supervisordining.unklab.ac.id', 'Rizky Lumintang', 'Supervisor', NULL),
  ('demo-supervisor-02', '20002@supervisordining.unklab.ac.id', 'Maria Rimbing', 'Supervisor', NULL),
  ('demo-supervisor-03', '20003@supervisordining.unklab.ac.id', 'Denny Paat', 'Supervisor', NULL),
  ('demo-supervisor-04', '20004@supervisordining.unklab.ac.id', 'Nadia Tumbelaka', 'Supervisor', NULL),
  ('demo-supervisor-05', '20005@supervisordining.unklab.ac.id', 'Joice Pangemanan', 'Supervisor', NULL),
  ('demo-head-01', '30001@kepaladining.unklab.ac.id', 'Hendra Wenas', 'Head', NULL),
  ('demo-admin-01', '40001@admin.unklab.ac.id', 'Cynthia Kairupan', 'Admin', NULL)
ON DUPLICATE KEY UPDATE email = VALUES(email), name = VALUES(name), role = VALUES(role), nim = VALUES(nim);

-- 20 pengambilan: 15 melalui antrean, 5 pemindaian langsung (tanpa antrean).
INSERT INTO meal_records (id, nim, period_id, period_label, student_name, staff_uid, staff_name, verification_token, served_date, served_time) VALUES
  (1, '23101001', 'morning', 'Pagi', 'Adrian Matthew', 'demo-staff-01', 'Martha Waworuntu', '00000000-0000-0000-0000-000000000001', CURRENT_DATE, '06:48:00'),
  (2, '23101002', 'morning', 'Pagi', 'Clara Elizabeth', 'demo-staff-01', 'Martha Waworuntu', '00000000-0000-0000-0000-000000000002', CURRENT_DATE, '06:52:00'),
  (3, '23101003', 'morning', 'Pagi', 'Nathaniel Joseph', 'demo-staff-02', 'Randy Kambey', '00000000-0000-0000-0000-000000000003', CURRENT_DATE, '06:57:00'),
  (4, '23101004', 'morning', 'Pagi', 'Michelle Grace', 'demo-staff-02', 'Randy Kambey', '00000000-0000-0000-0000-000000000004', CURRENT_DATE, '06:43:00'),
  (5, '23101005', 'morning', 'Pagi', 'Daniel Samuel', 'demo-staff-03', 'Lina Sompotan', '00000000-0000-0000-0000-000000000005', CURRENT_DATE, '06:51:00'),
  (6, '23101006', 'afternoon', 'Siang', 'Jonathan William', 'demo-staff-03', 'Lina Sompotan', '00000000-0000-0000-0000-000000000006', CURRENT_DATE - INTERVAL 1 DAY, '11:52:00'),
  (7, '23101007', 'afternoon', 'Siang', 'Rachel Naomi', 'demo-staff-04', 'Ferry Runtuwene', '00000000-0000-0000-0000-000000000007', CURRENT_DATE - INTERVAL 1 DAY, '12:01:00'),
  (8, '23101008', 'afternoon', 'Siang', 'Kevin Andrew', 'demo-staff-04', 'Ferry Runtuwene', '00000000-0000-0000-0000-000000000008', CURRENT_DATE - INTERVAL 1 DAY, '12:11:00'),
  (9, '23101009', 'afternoon', 'Siang', 'Deborah Angel', 'demo-staff-05', 'Yuliana Sondakh', '00000000-0000-0000-0000-000000000009', CURRENT_DATE - INTERVAL 1 DAY, '12:23:00'),
  (10, '23101010', 'afternoon', 'Siang', 'Samuel David', 'demo-staff-05', 'Yuliana Sondakh', '00000000-0000-0000-0000-000000000010', CURRENT_DATE - INTERVAL 1 DAY, '12:35:00'),
  (11, '23101011', 'evening', 'Malam', 'Joshua Peter', 'demo-staff-01', 'Martha Waworuntu', '00000000-0000-0000-0000-000000000011', CURRENT_DATE - INTERVAL 2 DAY, '17:46:00'),
  (12, '23101012', 'evening', 'Malam', 'Esther Maria', 'demo-staff-01', 'Martha Waworuntu', '00000000-0000-0000-0000-000000000012', CURRENT_DATE - INTERVAL 2 DAY, '17:55:00'),
  (13, '23101013', 'evening', 'Malam', 'Caleb Thomas', 'demo-staff-02', 'Randy Kambey', '00000000-0000-0000-0000-000000000013', CURRENT_DATE - INTERVAL 2 DAY, '18:07:00'),
  (14, '23101014', 'evening', 'Malam', 'Hannah Ruth', 'demo-staff-03', 'Lina Sompotan', '00000000-0000-0000-0000-000000000014', CURRENT_DATE - INTERVAL 2 DAY, '18:18:00'),
  (15, '23101015', 'evening', 'Malam', 'Benjamin Paul', 'demo-staff-03', 'Lina Sompotan', '00000000-0000-0000-0000-000000000015', CURRENT_DATE - INTERVAL 2 DAY, '18:31:00'),
  (16, '23101016', 'morning', 'Pagi', 'Sarah Joy', 'demo-staff-04', 'Ferry Runtuwene', '00000000-0000-0000-0000-000000000016', CURRENT_DATE - INTERVAL 3 DAY, '06:38:00'),
  (17, '23101017', 'morning', 'Pagi', 'Matthew John', 'demo-staff-05', 'Yuliana Sondakh', '00000000-0000-0000-0000-000000000017', CURRENT_DATE - INTERVAL 3 DAY, '06:55:00'),
  (18, '23101018', 'afternoon', 'Siang', 'Rebecca Hope', 'demo-staff-04', 'Ferry Runtuwene', '00000000-0000-0000-0000-000000000018', CURRENT_DATE - INTERVAL 4 DAY, '12:04:00'),
  (19, '23101019', 'afternoon', 'Siang', 'Andrew Mark', 'demo-staff-05', 'Yuliana Sondakh', '00000000-0000-0000-0000-000000000019', CURRENT_DATE - INTERVAL 4 DAY, '12:42:00'),
  (20, '23101020', 'evening', 'Malam', 'Lydia Faith', 'demo-staff-01', 'Martha Waworuntu', '00000000-0000-0000-0000-000000000020', CURRENT_DATE - INTERVAL 5 DAY, '18:06:00')
ON DUPLICATE KEY UPDATE period_id = VALUES(period_id), period_label = VALUES(period_label), student_name = VALUES(student_name), staff_uid = VALUES(staff_uid), staff_name = VALUES(staff_name), served_date = VALUES(served_date), served_time = VALUES(served_time);

-- 15 antrean selesai yang cocok dengan record 1-15, lalu 5 antrean aktif untuk demo staf.
INSERT INTO queues (id, nim, period_id, student_name, status, joined_at, completed_at, record_id) VALUES
  (1, '23101001', 'morning', 'Adrian Matthew', 'completed', TIMESTAMP(CURRENT_DATE, '06:09:00'), TIMESTAMP(CURRENT_DATE, '06:18:00'), 1),
  (2, '23101002', 'morning', 'Clara Elizabeth', 'completed', TIMESTAMP(CURRENT_DATE, '06:15:00'), TIMESTAMP(CURRENT_DATE, '06:24:00'), 2),
  (3, '23101003', 'morning', 'Nathaniel Joseph', 'completed', TIMESTAMP(CURRENT_DATE, '06:22:00'), TIMESTAMP(CURRENT_DATE, '06:31:00'), 3),
  (4, '23101004', 'morning', 'Michelle Grace', 'completed', TIMESTAMP(CURRENT_DATE, '06:35:00'), TIMESTAMP(CURRENT_DATE, '06:43:00'), 4),
  (5, '23101005', 'morning', 'Daniel Samuel', 'completed', TIMESTAMP(CURRENT_DATE, '06:44:00'), TIMESTAMP(CURRENT_DATE, '06:51:00'), 5),
  (6, '23101006', 'afternoon', 'Jonathan William', 'completed', TIMESTAMP(CURRENT_DATE - INTERVAL 1 DAY, '11:43:00'), TIMESTAMP(CURRENT_DATE - INTERVAL 1 DAY, '11:52:00'), 6),
  (7, '23101007', 'afternoon', 'Rachel Naomi', 'completed', TIMESTAMP(CURRENT_DATE - INTERVAL 1 DAY, '11:52:00'), TIMESTAMP(CURRENT_DATE - INTERVAL 1 DAY, '12:01:00'), 7),
  (8, '23101008', 'afternoon', 'Kevin Andrew', 'completed', TIMESTAMP(CURRENT_DATE - INTERVAL 1 DAY, '12:02:00'), TIMESTAMP(CURRENT_DATE - INTERVAL 1 DAY, '12:11:00'), 8),
  (9, '23101009', 'afternoon', 'Deborah Angel', 'completed', TIMESTAMP(CURRENT_DATE - INTERVAL 1 DAY, '12:14:00'), TIMESTAMP(CURRENT_DATE - INTERVAL 1 DAY, '12:23:00'), 9),
  (10, '23101010', 'afternoon', 'Samuel David', 'completed', TIMESTAMP(CURRENT_DATE - INTERVAL 1 DAY, '12:27:00'), TIMESTAMP(CURRENT_DATE - INTERVAL 1 DAY, '12:35:00'), 10),
  (11, '23101011', 'evening', 'Joshua Peter', 'completed', TIMESTAMP(CURRENT_DATE - INTERVAL 2 DAY, '17:37:00'), TIMESTAMP(CURRENT_DATE - INTERVAL 2 DAY, '17:46:00'), 11),
  (12, '23101012', 'evening', 'Esther Maria', 'completed', TIMESTAMP(CURRENT_DATE - INTERVAL 2 DAY, '17:47:00'), TIMESTAMP(CURRENT_DATE - INTERVAL 2 DAY, '17:55:00'), 12),
  (13, '23101013', 'evening', 'Caleb Thomas', 'completed', TIMESTAMP(CURRENT_DATE - INTERVAL 2 DAY, '17:58:00'), TIMESTAMP(CURRENT_DATE - INTERVAL 2 DAY, '18:07:00'), 13),
  (14, '23101014', 'evening', 'Hannah Ruth', 'completed', TIMESTAMP(CURRENT_DATE - INTERVAL 2 DAY, '18:09:00'), TIMESTAMP(CURRENT_DATE - INTERVAL 2 DAY, '18:18:00'), 14),
  (15, '23101015', 'evening', 'Benjamin Paul', 'completed', TIMESTAMP(CURRENT_DATE - INTERVAL 2 DAY, '18:21:00'), TIMESTAMP(CURRENT_DATE - INTERVAL 2 DAY, '18:31:00'), 15),
  (16, '23101016', 'afternoon', 'Sarah Joy', 'waiting', CURRENT_TIMESTAMP - INTERVAL 5 MINUTE, NULL, NULL),
  (17, '23101017', 'afternoon', 'Matthew John', 'waiting', CURRENT_TIMESTAMP - INTERVAL 4 MINUTE, NULL, NULL),
  (18, '23101018', 'afternoon', 'Rebecca Hope', 'waiting', CURRENT_TIMESTAMP - INTERVAL 3 MINUTE, NULL, NULL),
  (19, '23101019', 'afternoon', 'Andrew Mark', 'waiting', CURRENT_TIMESTAMP - INTERVAL 2 MINUTE, NULL, NULL),
  (20, '23101020', 'afternoon', 'Lydia Faith', 'waiting', CURRENT_TIMESTAMP - INTERVAL 1 MINUTE, NULL, NULL)
ON DUPLICATE KEY UPDATE nim = VALUES(nim), period_id = VALUES(period_id), student_name = VALUES(student_name), status = VALUES(status), joined_at = VALUES(joined_at), completed_at = VALUES(completed_at), record_id = VALUES(record_id);
