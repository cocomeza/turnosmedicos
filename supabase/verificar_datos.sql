-- Script para verificar que los datos están en la base de datos
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Verificar especialidades
SELECT 'ESPECIALIDADES' as tipo, COUNT(*) as cantidad FROM specialties;
SELECT id, name, description FROM specialties ORDER BY name;

-- 2. Verificar doctores
SELECT 'DOCTORES TOTALES' as tipo, COUNT(*) as cantidad FROM doctors;
SELECT 'DOCTORES ACTIVOS' as tipo, COUNT(*) as cantidad FROM doctors WHERE is_active = true;

SELECT 
  d.id,
  d.name,
  d.email,
  s.name as especialidad,
  d.specialty_id,
  d.is_active,
  d.years_experience
FROM doctors d
LEFT JOIN specialties s ON d.specialty_id = s.id
ORDER BY d.name;

-- 3. Verificar horarios de doctores
SELECT 'HORARIOS CONFIGURADOS' as tipo, COUNT(*) as cantidad FROM doctor_schedules;

SELECT 
  d.name as doctor,
  s.name as especialidad,
  ds.day_of_week,
  CASE ds.day_of_week
    WHEN 0 THEN 'Domingo'
    WHEN 1 THEN 'Lunes'
    WHEN 2 THEN 'Martes'
    WHEN 3 THEN 'Miércoles'
    WHEN 4 THEN 'Jueves'
    WHEN 5 THEN 'Viernes'
    WHEN 6 THEN 'Sábado'
  END as dia,
  ds.start_time,
  ds.end_time
FROM doctor_schedules ds
JOIN doctors d ON ds.doctor_id = d.id
JOIN specialties s ON d.specialty_id = s.id
WHERE d.is_active = true
ORDER BY d.name, ds.day_of_week;

-- 4. Verificar políticas RLS
SELECT 
  tablename,
  policyname,
  cmd as operacion,
  qual as condicion
FROM pg_policies 
WHERE tablename IN ('doctors', 'specialties', 'doctor_schedules')
ORDER BY tablename, policyname;

-- 5. Verificar si hay doctores sin especialidad (esto causaría problemas)
SELECT 
  'DOCTORES SIN ESPECIALIDAD' as problema,
  COUNT(*) as cantidad
FROM doctors d
WHERE d.specialty_id IS NULL OR d.specialty_id NOT IN (SELECT id FROM specialties);

-- 6. Resumen completo
SELECT 
  'RESUMEN' as seccion,
  (SELECT COUNT(*) FROM specialties) as especialidades,
  (SELECT COUNT(*) FROM doctors WHERE is_active = true) as doctores_activos,
  (SELECT COUNT(*) FROM doctor_schedules) as horarios_configurados,
  (SELECT COUNT(DISTINCT doctor_id) FROM doctor_schedules) as doctores_con_horarios;

