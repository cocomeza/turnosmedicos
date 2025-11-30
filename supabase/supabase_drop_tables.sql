-- Script para eliminar todas las tablas de la base de datos
-- ⚠️ ADVERTENCIA: Este script eliminará TODOS los datos
-- Úsalo solo si necesitas empezar desde cero

-- Eliminar políticas primero
DROP POLICY IF EXISTS "Especialidades son públicas para lectura" ON specialties;
DROP POLICY IF EXISTS "Doctores activos son públicos para lectura" ON doctors;
DROP POLICY IF EXISTS "Horarios son públicos para lectura" ON doctor_schedules;
DROP POLICY IF EXISTS "Pacientes pueden ser creados" ON patients;
DROP POLICY IF EXISTS "Pacientes pueden ser leídos" ON patients;
DROP POLICY IF EXISTS "Citas pueden ser creadas" ON appointments;
DROP POLICY IF EXISTS "Citas pueden ser leídas" ON appointments;

-- Eliminar triggers
DROP TRIGGER IF EXISTS update_specialties_updated_at ON specialties;
DROP TRIGGER IF EXISTS update_doctors_updated_at ON doctors;
DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
DROP TRIGGER IF EXISTS update_doctor_schedules_updated_at ON doctor_schedules;

-- Eliminar función
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Eliminar tablas (en orden inverso debido a las foreign keys)
DROP TABLE IF EXISTS doctor_schedules CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS specialties CASCADE;

-- Nota: CASCADE eliminará automáticamente índices y constraints relacionados

