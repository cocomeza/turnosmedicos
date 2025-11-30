# Verificar Estado del Proyecto Supabase

## El dominio `pxqtwdcmrsnyehigbnxh.supabase.co` no existe

Este proyecto de Supabase fue eliminado o pausado. Necesitas crear uno nuevo.

## Pasos para Crear un Nuevo Proyecto

### 1. Crear Proyecto en Supabase

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Inicia sesión con tu cuenta
3. Click en **"New Project"**
4. Completa el formulario:
   - **Name**: `turnosmedicos` (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña segura (guárdala)
   - **Region**: Elige la región más cercana (ej: South America)
   - **Pricing Plan**: Free tier está bien para empezar
5. Click en **"Create new project"**
6. Espera 2-3 minutos mientras se crea el proyecto

### 2. Obtener las Credenciales

Una vez creado el proyecto:

1. Ve a **Settings** (⚙️) → **API**
2. Encontrarás:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (⚠️ SECRETO)

### 3. Configurar la Base de Datos

1. Ve a **SQL Editor** en el menú lateral
2. Click en **"New Query"**
3. Abre el archivo `supabase/supabase_schema.sql` de tu proyecto local
4. Copia TODO el contenido y pégalo en el SQL Editor
5. Click en **"Run"** (o presiona Ctrl+Enter)
6. Deberías ver un mensaje de éxito

### 4. Insertar Datos de Ejemplo

1. En el mismo SQL Editor, crea una nueva query
2. Abre el archivo `supabase/insert_sample_data.sql`
3. Copia TODO el contenido y pégalo
4. Click en **"Run"**
5. Deberías ver que se insertaron especialidades y doctores

### 5. Verificar que los Datos se Insertaron

Ejecuta esta consulta en el SQL Editor:

```sql
-- Ver especialidades
SELECT * FROM specialties;

-- Ver doctores activos
SELECT 
  d.name,
  s.name as especialidad,
  d.is_active
FROM doctors d
JOIN specialties s ON d.specialty_id = s.id
WHERE d.is_active = true;
```

Deberías ver al menos 5 especialidades y 6 doctores.

### 6. Verificar Políticas RLS

Ejecuta esta consulta:

```sql
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('doctors', 'specialties', 'doctor_schedules')
ORDER BY tablename, policyname;
```

Deberías ver políticas para lectura pública en estas tablas.

## Si el Proyecto Anterior Todavía Existe

Si tienes acceso al proyecto anterior (`pxqtwdcmrsnyehigbnxh`):

1. Ve a Supabase Dashboard
2. Busca el proyecto en la lista
3. Si está pausado, haz click en **"Restore"** o **"Resume"**
4. Si fue eliminado, necesitarás crear uno nuevo

## Migrar Datos del Proyecto Anterior (si es posible)

Si puedes acceder al proyecto anterior:

1. Ve a **Settings** → **Database**
2. Click en **"Backups"** para ver si hay backups disponibles
3. O exporta los datos manualmente desde **Table Editor**

## Próximos Pasos

Después de crear el nuevo proyecto y configurar la base de datos:

1. Actualiza las variables de entorno en Vercel (ver `CONFIGURAR_VERCEL.md`)
2. Haz un nuevo deploy
3. Verifica que la aplicación funcione correctamente

