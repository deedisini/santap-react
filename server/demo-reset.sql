USE santap;

-- Mengosongkan HANYA tabel MySQL demo SANTAP sebelum mengisi ulang dataset presentasi.
-- Tidak menyentuh Firebase Authentication ataupun Firestore.
-- Migrasi kecil untuk database yang dibuat sebelum peran Admin ditambahkan.
ALTER TABLE users MODIFY role ENUM('Mahasiswa', 'Staff', 'Supervisor', 'Head', 'Admin') NOT NULL;
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE queues;
TRUNCATE TABLE meal_records;
TRUNCATE TABLE users;
TRUNCATE TABLE students;
TRUNCATE TABLE meal_periods;
SET FOREIGN_KEY_CHECKS = 1;
