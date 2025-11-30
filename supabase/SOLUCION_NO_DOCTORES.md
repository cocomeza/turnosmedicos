# Solución: No se cargan los médicos

## Posibles Causas

### 1. No hay doctores en la base de datos
**Solución:** Ejecuta el script `insert_sample_data.sql` en el SQL Editor de Supabase

### 2. Las políticas RLS están bloqueando la lectura
**Verificación:** 
- Ve a Supabase Dashboard → Authentication → Policies
- Verifica que exista la política "Doctores activos son públicos para lectura" en la tabla `doctors`

**Solución:** Si no existe, ejecuta esta política:
```sql
CREATE POLICY "Doctores activos son públicos para lectura"
  ON doctors FOR SELECT
  USING (is_active = true);
```

### 3. Los doctores no tienen `is_active = true`
**Verificación:** Ejecuta esta consulta en Supabase:
```sql
SELECT id, name, email, specialty_id, is_active 
FROM doctors;
```

**Solución:** Si los doctores tienen `is_active = false`, actualízalos:
```sql
UPDATE doctors SET is_active = true;
```

### 4. Las variables de entorno no están configuradas
**Verificación:** 
- Abre la consola del navegador (F12)
- Busca errores relacionados con Supabase
- Verifica que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén configuradas

**Solución:** 
- Crea o actualiza el archivo `.env.local` en la raíz del proyecto
- Reinicia el servidor de desarrollo después de cambiar las variables

### 5. Los doctores no tienen el `specialty_id` correcto
**Verificación:** Ejecuta esta consulta:
```sql
SELECT 
  d.id,
  d.name as doctor,
  d.specialty_id,
  s.name as especialidad,
  d.is_active
FROM doctors d
LEFT JOIN specialties s ON d.specialty_id = s.id;
```

**Solución:** Si hay doctores sin especialidad o con `specialty_id` incorrecto, corrígelos:
```sql
-- Ver todas las especialidades disponibles
SELECT id, name FROM specialties;

-- Actualizar un doctor con el specialty_id correcto
UPDATE doctors 
SET specialty_id = (SELECT id FROM specialties WHERE name = 'Cardiología' LIMIT 1)
WHERE email = 'juan.perez@hospital.com';
```

## Pasos para Solucionar

1. **Ejecuta el script de datos de ejemplo:**
   - Ve a Supabase Dashboard → SQL Editor
   - Abre el archivo `supabase/insert_sample_data.sql`
   - Copia y pega el contenido
   - Ejecuta el script

2. **Verifica que los datos se insertaron:**
   ```sql
   SELECT COUNT(*) FROM doctors WHERE is_active = true;
   ```

3. **Verifica las políticas RLS:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'doctors';
   ```

4. **Revisa la consola del navegador:**
   - Abre las herramientas de desarrollador (F12)
   - Ve a la pestaña Console
   - Busca mensajes que empiecen con 🔍, 📊, ✅ o ❌
   - Estos mensajes te dirán exactamente qué está pasando

5. **Reinicia el servidor de desarrollo:**
   ```bash
   # Detén el servidor (Ctrl+C)
   # Luego inícialo de nuevo
   npm run dev
   ```

## Consultas Útiles para Diagnosticar

```sql
-- Ver todos los doctores activos
SELECT 
  d.id,
  d.name,
  d.email,
  s.name as especialidad,
  d.is_active,
  COUNT(ds.id) as horarios_configurados
FROM doctors d
LEFT JOIN specialties s ON d.specialty_id = s.id
LEFT JOIN doctor_schedules ds ON d.id = ds.doctor_id
WHERE d.is_active = true
GROUP BY d.id, d.name, d.email, s.name, d.is_active;

-- Ver especialidades disponibles
SELECT id, name FROM specialties ORDER BY name;

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('doctors', 'specialties', 'doctor_schedules');
```

