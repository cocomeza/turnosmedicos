-- Script SQL para crear la base de datos en Supabase
-- Sistema de Turnos Médicos

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Especialidades Médicas
CREATE TABLE IF NOT EXISTS specialties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de Doctores
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

-- 3. Tabla de Pacientes
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  date_of_birth DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de Citas Médicas (Appointments)
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
  -- Evitar duplicados: mismo doctor, fecha y hora
  UNIQUE(doctor_id, appointment_date, appointment_time)
);

-- 5. Tabla de Horarios de Doctores
CREATE TABLE IF NOT EXISTS doctor_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL CHECK (end_time > start_time),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Un doctor solo puede tener un horario por día de la semana
  UNIQUE(doctor_id, day_of_week)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty_id);
CREATE INDEX IF NOT EXISTS idx_doctors_active ON doctors(is_active);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON appointments(doctor_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_doctor_schedules_doctor ON doctor_schedules(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_schedules_day ON doctor_schedules(day_of_week);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_specialties_updated_at BEFORE UPDATE ON specialties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctor_schedules_updated_at BEFORE UPDATE ON doctor_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas de seguridad RLS (Row Level Security)
-- Habilitar RLS en todas las tablas
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_schedules ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen (para evitar conflictos)
DROP POLICY IF EXISTS "Especialidades son públicas para lectura" ON specialties;
DROP POLICY IF EXISTS "Doctores activos son públicos para lectura" ON doctors;
DROP POLICY IF EXISTS "Horarios son públicos para lectura" ON doctor_schedules;
DROP POLICY IF EXISTS "Pacientes pueden ser creados" ON patients;
DROP POLICY IF EXISTS "Pacientes pueden ser leídos" ON patients;
DROP POLICY IF EXISTS "Citas pueden ser creadas" ON appointments;
DROP POLICY IF EXISTS "Citas pueden ser leídas" ON appointments;

-- Políticas para lectura pública (anon key)
-- Especialidades: lectura pública
CREATE POLICY "Especialidades son públicas para lectura"
  ON specialties FOR SELECT
  USING (true);

-- Doctores: lectura pública de doctores activos
CREATE POLICY "Doctores activos son públicos para lectura"
  ON doctors FOR SELECT
  USING (is_active = true);

-- Horarios: lectura pública
CREATE POLICY "Horarios son públicos para lectura"
  ON doctor_schedules FOR SELECT
  USING (true);

-- Pacientes: permitir inserción y lectura
CREATE POLICY "Pacientes pueden ser creados"
  ON patients FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Pacientes pueden ser leídos"
  ON patients FOR SELECT
  USING (true);

-- Citas: permitir creación y lectura
CREATE POLICY "Citas pueden ser creadas"
  ON appointments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Citas pueden ser leídas"
  ON appointments FOR SELECT
  USING (true);

-- Nota: Para operaciones administrativas (UPDATE, DELETE), 
-- se debe usar el service_role_key que bypassa RLS
-- O crear políticas específicas para usuarios autenticados

-- Datos de ejemplo (opcional - comentar si no se necesitan)
-- Insertar especialidades de ejemplo
INSERT INTO specialties (name, description) VALUES
  ('Cardiología', 'Especialidad médica que se encarga del corazón y el sistema circulatorio'),
  ('Pediatría', 'Especialidad médica dedicada al cuidado de la salud de bebés, niños y adolescentes'),
  ('Dermatología', 'Especialidad médica que se ocupa del diagnóstico y tratamiento de enfermedades de la piel'),
  ('Neurología', 'Especialidad médica que trata los trastornos del sistema nervioso'),
  ('Oftalmología', 'Especialidad médica que estudia las enfermedades de los ojos')
ON CONFLICT (name) DO NOTHING;

-- Insertar doctores de ejemplo (ajustar specialty_id según los IDs generados)
-- Nota: Estos inserts pueden fallar si las especialidades no existen, 
-- por lo que es mejor insertarlos manualmente después de crear las especialidades

