CREATE DATABASE IF NOT EXISTS santap CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE santap;
SET time_zone = '+08:00';

CREATE TABLE IF NOT EXISTS users (
  firebase_uid VARCHAR(128) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(120) NOT NULL,
  role ENUM('Mahasiswa', 'Staff', 'Supervisor', 'Head', 'Admin') NOT NULL,
  nim VARCHAR(30) NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
  nim VARCHAR(30) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  faculty VARCHAR(120) NOT NULL,
  residence ENUM('Penghuni Asrama', 'Non-penghuni') NOT NULL,
  email VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS meal_periods (
  id VARCHAR(30) PRIMARY KEY,
  label VARCHAR(30) NOT NULL,
  serving_time VARCHAR(40) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT FALSE,
  paused_date DATE NULL
);

CREATE TABLE IF NOT EXISTS queues (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nim VARCHAR(30) NOT NULL,
  period_id VARCHAR(30) NOT NULL,
  student_name VARCHAR(120) NOT NULL,
  status ENUM('waiting', 'completed', 'cancelled') NOT NULL DEFAULT 'waiting',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  record_id BIGINT UNSIGNED NULL,
  FOREIGN KEY (nim) REFERENCES students(nim),
  FOREIGN KEY (period_id) REFERENCES meal_periods(id),
  INDEX queue_lookup (nim, period_id, status)
);

CREATE TABLE IF NOT EXISTS meal_records (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nim VARCHAR(30) NOT NULL,
  period_id VARCHAR(30) NOT NULL,
  period_label VARCHAR(30) NOT NULL,
  student_name VARCHAR(120) NOT NULL,
  staff_uid VARCHAR(128) NOT NULL,
  staff_name VARCHAR(120) NOT NULL,
  verification_token CHAR(36) NOT NULL UNIQUE,
  served_date DATE NOT NULL,
  served_time TIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (nim) REFERENCES students(nim),
  FOREIGN KEY (period_id) REFERENCES meal_periods(id),
  UNIQUE KEY record_lookup (nim, served_date, period_id)
);

INSERT INTO meal_periods (id, label, serving_time, active) VALUES
  ('morning', 'Pagi', '05:30-08:00', TRUE),
  ('afternoon', 'Siang', '11:30-13:00', FALSE),
  ('evening', 'Malam', '17:00-18:30', FALSE)
ON DUPLICATE KEY UPDATE label = VALUES(label), serving_time = VALUES(serving_time);

INSERT INTO students (nim, name, faculty, residence, email) VALUES
  ('23101001', 'Adrian Matthew', 'Informatika', 'Penghuni Asrama', 'adrianmatthew@unklab.ac.id'),
  ('23101002', 'Clara Elizabeth', 'Sistem Informasi', 'Non-penghuni', 'claraelizabeth@unklab.ac.id'),
  ('23101003', 'Nathaniel Joseph', 'Informatika', 'Penghuni Asrama', 'nathanieljoseph@unklab.ac.id'),
  ('23101004', 'Michelle Grace', 'Akuntansi', 'Non-penghuni', 'michellegrace@unklab.ac.id'),
  ('23101005', 'Daniel Samuel', 'Teknik Sipil', 'Penghuni Asrama', 'danielsamuel@unklab.ac.id')
ON DUPLICATE KEY UPDATE name = VALUES(name), faculty = VALUES(faculty), residence = VALUES(residence), email = VALUES(email);
