# Sistema de Turnos Médicos

## Descripción del Proyecto
Aplicación web para reserva de turnos médicos construida con Next.js 15 y Supabase como backend. Permite a los pacientes buscar especialidades médicas, seleccionar doctores y reservar citas.

## Estado Actual del Proyecto
✅ **PROYECTO COMPLETAMENTE FUNCIONAL** - Panel de administración implementado

**Fecha de configuración**: 22 de septiembre, 2025
**Última actualización**: 22 de septiembre, 2025 - Panel de administración completado

### Configuración Técnica
- **Frontend**: Next.js 15.5.3 con TypeScript
- **Estilos**: Tailwind CSS 4 + Lucide React (iconos)  
- **Base de datos**: Supabase (PostgreSQL)
- **Componentes UI**: Headless UI React
- **Formularios**: React Hook Form + Zod validation
- **Fechas**: React DatePicker + date-fns

### Estado de Configuración
- ✅ Dependencias instaladas correctamente (npm install completado)
- ✅ Servidor de desarrollo funcionando en puerto 5000
- ✅ Configuración de Next.js para entorno Replit (allowedDevOrigins configurado)
- ✅ Configuración de despliegue completada (autoscale)
- ✅ Workflow configurado correctamente
- ✅ **Panel de administración implementado** (/admin con autenticación JWT)
- ✅ **Sistema de gestión de citas completo** con búsqueda, filtros y actualización de estados
- ✅ **Mensaje de confirmación mejorado** en reservas de turnos
- ⚠️ Variables de entorno de admin pendientes (ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET)
- ⚠️ Variables de entorno de Supabase Admin pendientes (SUPABASE_SERVICE_ROLE_KEY)

### Base de Datos (Supabase)
**URL del Proyecto**: https://pxqtwdcmrsnyehigbnxh.supabase.co

**Estructura esperada de tablas**:
- `specialties` - Especialidades médicas
- `doctors` - Información de doctores
- `patients` - Datos de pacientes  
- `appointments` - Citas médicas

### Componentes Principales
1. **SpecialtySearch** - Búsqueda y selección de especialidades
2. **DoctorList** - Lista de doctores por especialidad  
3. **AppointmentBooking** - Reserva de turnos con confirmación mejorada
4. **Layout principal** - Header y navegación
5. **Panel Admin** (/admin) - Gestión completa de citas médicas
   - Autenticación segura con JWT y cookies
   - Dashboard con estadísticas en tiempo real
   - Tabla de citas con búsqueda, filtros y paginación
   - Actualización de estados (programada, completada, cancelada)
   - Protegido con middleware de autenticación

### Mejoras de Diseño Propuestas
El usuario mencionó interés en mejorar el diseño usando:
- Tailwind UI Components (calendarios, cards, formularios)
- Headless UI (modales, dropdowns, date pickers) ✅ ya instalado
- Plantillas médicas específicas (Windmill Dashboard, HyperUI)

### Variables de Entorno Requeridas

**Para Panel de Administración:**
- `ADMIN_EMAIL` - Email del administrador (ej: admin@hospital.com)
- `ADMIN_PASSWORD` - Contraseña del admin (en desarrollo, texto plano)
- `JWT_SECRET` - Clave secreta para JWT (generar string aleatorio)
- `SUPABASE_SERVICE_ROLE_KEY` - Clave de service role de Supabase

**Para Base de Datos:**
- `NEXT_PUBLIC_SUPABASE_URL` - URL del proyecto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Clave anónima de Supabase

### Acceso al Panel Admin
- **URL**: `/admin` (redirige a `/admin/login` si no autenticado)
- **Funcionalidades**:
  - Dashboard con estadísticas de citas
  - Gestión completa de appointments
  - Búsqueda por paciente, filtros por estado y doctor
  - Actualización de estados de citas
  - Paginación y ordenamiento

### Comandos Git para Subir Cambios
```bash
# Agregar todos los cambios
git add .

# Hacer commit con mensaje descriptivo
git commit -m "feat: implementar panel de administración con gestión de citas"

# Subir al repositorio remoto
git push origin main
```

### Notas de Desarrollo
- Se implementó modo de demostración con datos mock cuando Supabase no está disponible
- El proyecto incluye manejo de errores graceful
- La configuración permite fácil migración entre entornos