-- Script para insertar datos de ejemplo en la base de datos
-- Ejecuta este script DESPUÉS de ejecutar supabase_schema.sql

-- Insertar especialidades si no existen
INSERT INTO specialties (name, description) VALUES
  ('Cardiología', 'Especialidad médica que se encarga del corazón y el sistema circulatorio'),
  ('Pediatría', 'Especialidad médica dedicada al cuidado de la salud de bebés, niños y adolescentes'),
  ('Dermatología', 'Especialidad médica que se ocupa del diagnóstico y tratamiento de enfermedades de la piel'),
  ('Neurología', 'Especialidad médica que trata los trastornos del sistema nervioso'),
  ('Oftalmología', 'Especialidad médica que estudia las enfermedades de los ojos'),
  ('Ginecología', 'Especialidad médica dedicada a la salud del sistema reproductor femenino')
ON CONFLICT (name) DO NOTHING;

-- Insertar doctores de ejemplo
-- Nota: Los IDs de especialidades se obtienen automáticamente
INSERT INTO doctors (name, email, phone, specialty_id, bio, years_experience, is_active) VALUES
  (
    'Juan Pérez',
    'juan.perez@hospital.com',
    '+54 11 1234-5678',
    (SELECT id FROM specialties WHERE name = 'Cardiología' LIMIT 1),
    'Cardiólogo con más de 15 años de experiencia en el tratamiento de enfermedades cardiovasculares. Especializado en arritmias y cardiología preventiva.',
    15,
    true
  ),
  (
    'María González',
    'maria.gonzalez@hospital.com',
    '+54 11 2345-6789',
    (SELECT id FROM specialties WHERE name = 'Pediatría' LIMIT 1),
    'Pediatra con amplia experiencia en atención de niños y adolescentes. Especializada en desarrollo infantil y vacunación.',
    12,
    true
  ),
  (
    'Carlos Rodríguez',
    'carlos.rodriguez@hospital.com',
    '+54 11 3456-7890',
    (SELECT id FROM specialties WHERE name = 'Dermatología' LIMIT 1),
    'Dermatólogo certificado con experiencia en tratamiento de enfermedades de la piel, cabello y uñas. Especializado en dermatología estética.',
    10,
    true
  ),
  (
    'Ana Martínez',
    'ana.martinez@hospital.com',
    '+54 11 4567-8901',
    (SELECT id FROM specialties WHERE name = 'Neurología' LIMIT 1),
    'Neuróloga con más de 18 años de experiencia. Especializada en trastornos del sueño y enfermedades neurodegenerativas.',
    18,
    true
  ),
  (
    'Luis Fernández',
    'luis.fernandez@hospital.com',
    '+54 11 5678-9012',
    (SELECT id FROM specialties WHERE name = 'Oftalmología' LIMIT 1),
    'Oftalmólogo con experiencia en cirugía refractiva y tratamiento de enfermedades oculares. Especializado en cataratas y glaucoma.',
    14,
    true
  ),
  (
    'Laura Sánchez',
    'laura.sanchez@hospital.com',
    '+54 11 6789-0123',
    (SELECT id FROM specialties WHERE name = 'Ginecología' LIMIT 1),
    'Ginecóloga con amplia experiencia en salud reproductiva femenina. Especializada en obstetricia y ginecología oncológica.',
    16,
    true
  )
ON CONFLICT (email) DO NOTHING;

-- Insertar horarios para los doctores (Lunes a Viernes, 9:00 - 18:00)
-- Nota: day_of_week: 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado
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

-- Verificar que los datos se insertaron correctamente
SELECT 
  d.name as doctor,
  s.name as especialidad,
  COUNT(ds.day_of_week) as dias_atencion
FROM doctors d
JOIN specialties s ON d.specialty_id = s.id
LEFT JOIN doctor_schedules ds ON d.id = ds.doctor_id
WHERE d.is_active = true
GROUP BY d.id, d.name, s.name
ORDER BY d.name;

