-- Script SQL COMPLETO para crear la base de datos en Supabase
-- Sistema de Turnos Médicos
-- Ejecuta este script completo en Supabase SQL Editor

-- ============================================
-- 1. CREAR EXTENSIÓN PARA UUIDs
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. CREAR TABLAS
-- ============================================

-- Tabla de especialidades
CREATE TABLE IF NOT EXISTS specialties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de doctores
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  specialty_id UUID NOT NULL REFERENCES specialties(id) ON DELETE RESTRICT,
  bio TEXT,
  years_experience INTEGER DEFAULT 0,
  profile_image TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de pacientes
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  date_of_birth DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de citas
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(doctor_id, appointment_date, appointment_time)
);

-- Tabla de horarios de doctores
CREATE TABLE IF NOT EXISTS doctor_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL CHECK (end_time > start_time),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(doctor_id, day_of_week)
);

-- ============================================
-- 3. CREAR ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty_id);
CREATE INDEX IF NOT EXISTS idx_doctors_active ON doctors(is_active);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_schedules_doctor ON doctor_schedules(doctor_id);

-- ============================================
-- 4. CREAR TRIGGERS PARA updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_specialties_updated_at BEFORE UPDATE ON specialties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON doctor_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. CONFIGURAR ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_schedules ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Especialidades son públicas para lectura" ON specialties;
DROP POLICY IF EXISTS "Doctores activos son públicos para lectura" ON doctors;
DROP POLICY IF EXISTS "Horarios son públicos para lectura" ON doctor_schedules;
DROP POLICY IF EXISTS "Pacientes pueden ser creados" ON patients;
DROP POLICY IF EXISTS "Pacientes pueden ser leídos" ON patients;
DROP POLICY IF EXISTS "Citas pueden ser creadas" ON appointments;
DROP POLICY IF EXISTS "Citas pueden ser leídas" ON appointments;

-- Crear políticas públicas
CREATE POLICY "Especialidades son públicas para lectura" ON specialties FOR SELECT USING (true);
CREATE POLICY "Doctores activos son públicos para lectura" ON doctors FOR SELECT USING (is_active = true);
CREATE POLICY "Horarios son públicos para lectura" ON doctor_schedules FOR SELECT USING (true);
CREATE POLICY "Pacientes pueden ser creados" ON patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Pacientes pueden ser leídos" ON patients FOR SELECT USING (true);
CREATE POLICY "Citas pueden ser creadas" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Citas pueden ser leídas" ON appointments FOR SELECT USING (true);

-- ============================================
-- 6. INSERTAR DATOS DE EJEMPLO
-- ============================================

-- Insertar especialidades
INSERT INTO specialties (name, description) VALUES
  ('Cardiología', 'Especialidad médica que se encarga del corazón y el sistema circulatorio'),
  ('Pediatría', 'Especialidad médica dedicada al cuidado de la salud de bebés, niños y adolescentes'),
  ('Dermatología', 'Especialidad médica que se ocupa del diagnóstico y tratamiento de enfermedades de la piel'),
  ('Neurología', 'Especialidad médica que trata los trastornos del sistema nervioso'),
  ('Oftalmología', 'Especialidad médica que estudia las enfermedades de los ojos')
ON CONFLICT (name) DO NOTHING;

-- Insertar doctores de ejemplo
INSERT INTO doctors (name, email, phone, specialty_id, bio, years_experience, is_active)
SELECT 
  'Dr. Juan Pérez',
  'juan.perez@hospital.com',
  '+54 11 1234-5678',
  id,
  'Cardiólogo con más de 15 años de experiencia',
  15,
  true
FROM specialties WHERE name = 'Cardiología'
ON CONFLICT (email) DO NOTHING;

INSERT INTO doctors (name, email, phone, specialty_id, bio, years_experience, is_active)
SELECT 
  'Dra. María González',
  'maria.gonzalez@hospital.com',
  '+54 11 2345-6789',
  id,
  'Pediatra especializada en atención neonatal',
  12,
  true
FROM specialties WHERE name = 'Pediatría'
ON CONFLICT (email) DO NOTHING;

INSERT INTO doctors (name, email, phone, specialty_id, bio, years_experience, is_active)
SELECT 
  'Dr. Carlos Rodríguez',
  'carlos.rodriguez@hospital.com',
  '+54 11 3456-7890',
  id,
  'Dermatólogo con experiencia en tratamientos estéticos',
  10,
  true
FROM specialties WHERE name = 'Dermatología'
ON CONFLICT (email) DO NOTHING;

-- Insertar horarios (Lunes a Viernes, 9am a 6pm)
-- day_of_week: 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado
INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time)
SELECT 
  d.id,
  day_num,
  '09:00:00',
  '18:00:00'
FROM doctors d
CROSS JOIN generate_series(1, 5) AS day_num
WHERE d.is_active = true
ON CONFLICT (doctor_id, day_of_week) DO NOTHING;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
-- Si todo salió bien, deberías ver: "Success. No rows returned"
-- Verifica los datos en: Table Editor → doctors, specialties, doctor_schedules

