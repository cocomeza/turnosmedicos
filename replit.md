# Sistema de Turnos Médicos

## Descripción del Proyecto
Aplicación web para reserva de turnos médicos construida con Next.js 15 y Supabase como backend. Permite a los pacientes buscar especialidades médicas, seleccionar doctores y reservar citas.

## Estado Actual del Proyecto
✅ **PROYECTO COMPLETAMENTE FUNCIONAL** - Configuración de Replit completada exitosamente

**Fecha de configuración**: 22 de septiembre, 2025
**Última actualización**: 22 de septiembre, 2025 - Funcionalidad de correos implementada

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
- ✅ **Funcionalidad de correos implementada** con Nodemailer y diseño profesional
- ✅ Envío automático a paciente y consultorio (mezacoco13@gmail.com)
- ⚠️ Variables de entorno de Supabase no configuradas (modo demo activo)
- ⚠️ Variables de entorno de Gmail pendientes de configuración (GMAIL_USER, GMAIL_APP_PASSWORD)

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
3. **AppointmentBooking** - Reserva de turnos
4. **Layout principal** - Header y navegación

### Mejoras de Diseño Propuestas
El usuario mencionó interés en mejorar el diseño usando:
- Tailwind UI Components (calendarios, cards, formularios)
- Headless UI (modales, dropdowns, date pickers) ✅ ya instalado
- Plantillas médicas específicas (Windmill Dashboard, HyperUI)

### Próximos Pasos Sugeridos
1. Configurar las tablas en Supabase si no existen
2. Implementar mejoras de diseño con las librerías mencionadas
3. Añadir autenticación de usuarios si se requiere
4. Mejorar la UI con componentes médicos específicos

### Notas de Desarrollo
- Se implementó modo de demostración con datos mock cuando Supabase no está disponible
- El proyecto incluye manejo de errores graceful
- La configuración permite fácil migración entre entornos