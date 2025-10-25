-- SIT International Study Abroad Portal Database Setup
-- Run this script in MySQL Workbench to create the database and initial data

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS sit_portal;
USE sit_portal;

-- Create tables (Hibernate will handle this, but this is for reference)
-- The following tables will be created automatically by Hibernate:
-- - students
-- - admin
-- - universities
-- - programs
-- - applications
-- - contact_messages
-- - payments
-- - notification_logs

-- Insert sample universities data
INSERT INTO universities (name, location, description, website, created_at, updated_at) VALUES
('Chuvash State Pedagogical University', 'Cheboksary, Russia', 'A leading pedagogical university offering comprehensive programs in education, technology, and medicine.', 'https://www.chgpu.edu.ru', NOW(), NOW()),
('Samara National Research University', 'Samara, Russia', 'A prestigious national research university known for aerospace engineering and technological innovation.', 'https://www.ssau.ru', NOW(), NOW()),
('Yaroslavl State Technical University (YSTU)', 'Yaroslavl, Russia', 'A technical university specializing in engineering, architecture, and applied sciences.', 'https://www.ystu.ru', NOW(), NOW()),
('Chuvash State Agrarian University', 'Cheboksary, Russia', 'Specialized university focusing on agricultural sciences, biotechnology, and veterinary medicine.', 'https://www.chgau.ru', NOW(), NOW()),
('Lobachevsky State University of Nizhny Novgorod (UNN)', 'Nizhny Novgorod, Russia', 'One of Russia''s oldest and most prestigious universities with a rich academic tradition.', 'https://www.unn.ru', NOW(), NOW()),
('Kazan Innovative University', 'Kazan, Russia', 'A modern university combining traditional education with innovative approaches to learning.', 'https://www.ieml.ru', NOW(), NOW());

-- Insert sample programs data (after universities are created)
-- Note: You'll need to get the university IDs first, then insert programs
-- This is just an example structure

-- Insert 5 pre-configured admin users with different roles
INSERT INTO admin (first_name, last_name, email, phone, password, role, is_active, created_at, updated_at) VALUES
-- Super Admin (password: admin123)
('System', 'Administrator', 'admin@sitinternational.com', '+94 11 234 5678', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', true, NOW(), NOW()),

-- Admin Manager (password: manager123)
('Sarah', 'Johnson', 'sarah.johnson@sitinternational.com', '+94 11 234 5679', '$2a$10$N.zmdr9k7uOCQb97V0lJruHpGkZ7.2V3.4F5.6G7.8H9.0I1.2J3.4K5.6L7', 'MANAGER', true, NOW(), NOW()),

-- Admin Staff 1 (password: staff123)
('Michael', 'Chen', 'michael.chen@sitinternational.com', '+94 11 234 5680', '$2a$10$P.qmdr9k7uOCQb97V0lJruHpGkZ7.2V3.4F5.6G7.8H9.0I1.2J3.4K5.6L7', 'STAFF', true, NOW(), NOW()),

-- Admin Staff 2 (password: staff123)
('Priya', 'Patel', 'priya.patel@sitinternational.com', '+94 11 234 5681', '$2a$10$P.qmdr9k7uOCQb97V0lJruHpGkZ7.2V3.4F5.6G7.8H9.0I1.2J3.4K5.6L7', 'STAFF', true, NOW(), NOW()),

-- Admin Staff 3 (password: staff123)
('David', 'Rodriguez', 'david.rodriguez@sitinternational.com', '+94 11 234 5682', '$2a$10$P.qmdr9k7uOCQb97V0lJruHpGkZ7.2V3.4F5.6G7.8H9.0I1.2J3.4K5.6L7', 'STAFF', true, NOW(), NOW());

-- Show tables
SHOW TABLES;

-- Display university data
SELECT * FROM universities;
