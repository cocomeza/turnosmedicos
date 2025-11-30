# Configurar Variables de Entorno en Vercel

## Problema: ERR_NAME_NOT_RESOLVED

El error `ERR_NAME_NOT_RESOLVED` significa que el dominio de Supabase no existe o está incorrecto.

## Solución Paso a Paso

### 1. Verificar/Crear Proyecto en Supabase

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Si no tienes un proyecto activo, crea uno nuevo:
   - Click en "New Project"
   - Completa el formulario
   - Espera a que se cree el proyecto (puede tardar unos minutos)

### 2. Obtener las Credenciales de Supabase

Una vez que tengas tu proyecto:

1. Ve a **Settings** → **API**
2. Copia los siguientes valores:
   - **Project URL** (ejemplo: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (la clave que empieza con `eyJhbGci...`)
   - **service_role** key (la clave secreta, guárdala bien)

### 3. Configurar Variables de Entorno en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona el proyecto `turnosmedicos-vr`
3. Ve a **Settings** → **Environment Variables**
4. Agrega las siguientes variables:

#### Variables Requeridas:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-nuevo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci... (tu clave anon public)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (tu clave service_role)
ADMIN_EMAIL=admin@hospital.com
ADMIN_PASSWORD=tu-contraseña-segura
JWT_SECRET=una-clave-secreta-aleatoria-muy-larga-y-segura
```

**⚠️ IMPORTANTE:**
- Marca todas las variables para los entornos: **Production**, **Preview**, y **Development**
- Después de agregar las variables, debes hacer un **nuevo deploy**

### 4. Crear la Base de Datos

Después de configurar las variables:

1. Ve a Supabase Dashboard → **SQL Editor**
2. Ejecuta el script `supabase/supabase_schema.sql`
3. Luego ejecuta `supabase/insert_sample_data.sql` para agregar datos de ejemplo

### 5. Hacer un Nuevo Deploy en Vercel

Después de configurar las variables de entorno:

1. Ve a **Deployments** en Vercel
2. Click en los **3 puntos** del último deployment
3. Selecciona **Redeploy**
4. O mejor aún, haz un pequeño cambio y haz push:
   ```bash
   git commit --allow-empty -m "trigger: redeploy con nuevas variables"
   git push origin main
   ```

### 6. Verificar que Funciona

1. Espera a que termine el deploy
2. Abre tu aplicación en Vercel
3. Abre la consola del navegador (F12)
4. Deberías ver mensajes como:
   - ✅ `Se encontraron X doctores`
   - ✅ `Se encontraron X especialidades`

Si aún ves errores, verifica:
- Que las variables de entorno estén correctamente escritas (sin espacios extra)
- Que el proyecto de Supabase esté activo
- Que hayas ejecutado los scripts SQL en Supabase

## Verificar Variables de Entorno en Vercel

Para verificar que las variables están configuradas:

1. Ve a **Settings** → **Environment Variables**
2. Deberías ver todas las variables listadas
3. Puedes hacer click en el ojo 👁️ para ver el valor (excepto las secretas)

## Notas Importantes

- **NEXT_PUBLIC_** significa que la variable será accesible en el cliente (navegador)
- **SUPABASE_SERVICE_ROLE_KEY** NO debe tener el prefijo `NEXT_PUBLIC_` porque es secreta
- Después de cambiar variables de entorno, SIEMPRE debes hacer un nuevo deploy
- Las variables se aplican en el próximo deploy, no inmediatamente

