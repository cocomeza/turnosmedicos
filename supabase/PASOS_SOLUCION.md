# Pasos para Solucionar: No se Muestran Médicos ni Horarios

## ✅ El Deploy Funcionó Correctamente

Si el deploy funcionó, significa que las variables de entorno están bien configuradas. El problema es que **no hay datos en la base de datos**.

## 🔧 Solución Paso a Paso

### Paso 1: Verificar que las Tablas Existen

1. Ve a Supabase Dashboard → **Table Editor**
2. Deberías ver estas tablas:
   - `specialties`
   - `doctors`
   - `patients`
   - `appointments`
   - `doctor_schedules`

**Si NO ves las tablas**, ejecuta primero `supabase_schema.sql`

### Paso 2: Verificar si Hay Datos

Ejecuta este script en **SQL Editor**:

```sql
-- Ver cuántos registros hay
SELECT 'Especialidades' as tabla, COUNT(*) as cantidad FROM specialties
UNION ALL
SELECT 'Doctores activos', COUNT(*) FROM doctors WHERE is_active = true
UNION ALL
SELECT 'Horarios', COUNT(*) FROM doctor_schedules;
```

**Si todos muestran 0**, necesitas insertar datos.

### Paso 3: Insertar Datos de Ejemplo

1. Ve a **SQL Editor** en Supabase
2. Abre el archivo `supabase/insert_sample_data.sql`
3. Copia TODO el contenido
4. Pégalo en el SQL Editor
5. Click en **"Run"** (o Ctrl+Enter)
6. Deberías ver mensajes de éxito y al final una tabla con los doctores insertados

### Paso 4: Verificar que los Datos se Insertaron

Ejecuta este script:

```sql
-- Ver especialidades
SELECT * FROM specialties ORDER BY name;

-- Ver doctores con sus especialidades
SELECT 
  d.name as doctor,
  s.name as especialidad,
  d.is_active,
  COUNT(ds.id) as horarios_configurados
FROM doctors d
JOIN specialties s ON d.specialty_id = s.id
LEFT JOIN doctor_schedules ds ON d.id = ds.doctor_id
GROUP BY d.id, d.name, s.name, d.is_active
ORDER BY d.name;
```

**Deberías ver:**
- Al menos 5 especialidades
- Al menos 6 doctores activos
- Cada doctor con 5 horarios (Lunes a Viernes)

### Paso 5: Verificar Políticas RLS

Las políticas RLS deben permitir lectura pública. Ejecuta:

```sql
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('doctors', 'specialties', 'doctor_schedules');
```

**Deberías ver políticas como:**
- "Especialidades son públicas para lectura" en `specialties`
- "Doctores activos son públicos para lectura" en `doctors`
- "Horarios son públicos para lectura" en `doctor_schedules`

Si NO existen, ejecuta esta parte del `supabase_schema.sql`:

```sql
-- Políticas para lectura pública
CREATE POLICY "Especialidades son públicas para lectura"
  ON specialties FOR SELECT
  USING (true);

CREATE POLICY "Doctores activos son públicos para lectura"
  ON doctors FOR SELECT
  USING (is_active = true);

CREATE POLICY "Horarios son públicos para lectura"
  ON doctor_schedules FOR SELECT
  USING (true);
```

### Paso 6: Verificar en la Aplicación

1. Abre tu aplicación en Vercel
2. Abre la consola del navegador (F12)
3. Busca mensajes que empiecen con:
   - 🔍 (buscando)
   - ✅ (éxito)
   - ❌ (error)
   - 📊 (resultados)

4. Si ves errores, compártelos para diagnosticar mejor

### Paso 7: Si Aún No Funciona

Ejecuta el script completo de verificación:

1. Abre `supabase/verificar_datos.sql`
2. Copia y ejecuta todo el contenido
3. Revisa los resultados de cada sección
4. Comparte los resultados si necesitas ayuda

## 🐛 Problemas Comunes

### Problema: "No hay médicos disponibles"

**Causa:** No hay doctores en la base de datos o todos tienen `is_active = false`

**Solución:**
```sql
-- Ver todos los doctores
SELECT id, name, email, is_active FROM doctors;

-- Si hay doctores pero is_active = false, activarlos:
UPDATE doctors SET is_active = true;
```

### Problema: "No hay horarios disponibles"

**Causa:** Los doctores no tienen horarios configurados en `doctor_schedules`

**Solución:**
```sql
-- Ver qué doctores tienen horarios
SELECT 
  d.name,
  COUNT(ds.id) as horarios
FROM doctors d
LEFT JOIN doctor_schedules ds ON d.id = ds.doctor_id
WHERE d.is_active = true
GROUP BY d.id, d.name;

-- Si un doctor no tiene horarios, insertarlos:
INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time)
SELECT 
  id,
  day_num,
  '09:00:00',
  '18:00:00'
FROM doctors
CROSS JOIN generate_series(1, 5) AS day_num
WHERE email = 'juan.perez@hospital.com'  -- Cambia el email
ON CONFLICT (doctor_id, day_of_week) DO NOTHING;
```

### Problema: Los doctores no se muestran para una especialidad

**Causa:** El `specialty_id` del doctor no coincide con el ID de la especialidad seleccionada

**Solución:**
```sql
-- Ver la relación entre doctores y especialidades
SELECT 
  d.id as doctor_id,
  d.name as doctor,
  d.specialty_id,
  s.id as specialty_id_real,
  s.name as especialidad
FROM doctors d
LEFT JOIN specialties s ON d.specialty_id = s.id
WHERE d.is_active = true;

-- Si hay doctores sin especialidad o con ID incorrecto, corregirlos:
UPDATE doctors 
SET specialty_id = (SELECT id FROM specialties WHERE name = 'Cardiología' LIMIT 1)
WHERE email = 'juan.perez@hospital.com';
```

## ✅ Checklist Final

- [ ] Las tablas existen en Supabase
- [ ] Hay al menos 5 especialidades insertadas
- [ ] Hay al menos 6 doctores activos (`is_active = true`)
- [ ] Cada doctor tiene horarios configurados (Lunes a Viernes)
- [ ] Las políticas RLS permiten lectura pública
- [ ] Las variables de entorno en Vercel están correctas
- [ ] Se hizo un nuevo deploy después de configurar las variables
- [ ] La consola del navegador no muestra errores de conexión

Si todos los items están marcados y aún no funciona, comparte los mensajes de la consola del navegador.

