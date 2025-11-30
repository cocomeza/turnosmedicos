# Sistema de Turnos Médicos

Aplicación web para reserva de turnos médicos construida con Next.js 15 y Supabase como backend. Permite a los pacientes buscar especialidades médicas, seleccionar doctores y reservar citas.

## 🚀 Características

- ✅ Búsqueda de especialidades médicas
- ✅ Listado de doctores por especialidad
- ✅ Reserva de turnos con calendario interactivo
- ✅ Panel de administración completo
- ✅ Gestión de citas médicas
- ✅ Estadísticas en tiempo real
- ✅ Confirmación por email
- ✅ Generación de comprobantes PDF

## 🛠️ Tecnologías

- **Frontend**: Next.js 15.5.3 con TypeScript
- **Estilos**: Tailwind CSS 4 + Lucide React (iconos)
- **Base de datos**: Supabase (PostgreSQL)
- **Componentes UI**: Headless UI React
- **Formularios**: React Hook Form + Zod validation
- **Fechas**: React DatePicker + date-fns
- **PDF**: jsPDF para comprobantes

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase

## 🔧 Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/cocomeza/turnosmedicos.git
cd turnosmedicos
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Panel de Administración
ADMIN_EMAIL=admin@hospital.com
ADMIN_PASSWORD=tu-contraseña-segura
JWT_SECRET=tu-clave-secreta-jwt-aleatoria
```

4. Configura la base de datos:
   - Ve a la carpeta `supabase/`
   - Lee las instrucciones en `INSTRUCCIONES_SUPABASE.md`
   - Ejecuta el script `supabase_schema.sql` en el SQL Editor de Supabase

## 🗄️ Base de Datos

### Estructura de Tablas

- `specialties` - Especialidades médicas
- `doctors` - Información de doctores
- `patients` - Datos de pacientes
- `appointments` - Citas médicas
- `doctor_schedules` - Horarios de disponibilidad de doctores

### Scripts SQL

En la carpeta `supabase/` encontrarás:

- **`supabase_schema.sql`** - Script principal para crear todas las tablas, índices, triggers y políticas RLS
- **`supabase_drop_tables.sql`** - Script para eliminar todas las tablas (usar con precaución)
- **`INSTRUCCIONES_SUPABASE.md`** - Guía detallada paso a paso

Para más información sobre cómo configurar la base de datos, consulta `supabase/INSTRUCCIONES_SUPABASE.md`.

## 🚀 Desarrollo

Ejecuta el servidor de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
turnosmedicos/
├── pages/
│   └── api/              # API routes
│       ├── admin/       # Endpoints del panel admin
│       └── appointments.ts
├── src/
│   ├── app/             # Páginas de Next.js
│   │   ├── admin/       # Panel de administración
│   │   └── page.tsx     # Página principal
│   ├── components/      # Componentes React
│   │   ├── AppointmentBooking.tsx
│   │   ├── DoctorList.tsx
│   │   └── SpecialtySearch.tsx
│   └── lib/             # Utilidades y configuraciones
│       ├── supabase.ts
│       ├── supabase-admin.ts
│       └── admin-auth.ts
├── supabase/            # Scripts SQL y documentación
│   ├── supabase_schema.sql
│   ├── supabase_drop_tables.sql
│   └── INSTRUCCIONES_SUPABASE.md
└── public/              # Archivos estáticos
```

## 👨‍💼 Panel de Administración

Accede al panel de administración en `/admin` (redirige a `/admin/login` si no estás autenticado).

### Funcionalidades del Panel Admin:

- 📊 Dashboard con estadísticas en tiempo real
- 📋 Gestión completa de citas médicas
- 🔍 Búsqueda por paciente, doctor o fecha
- 🔄 Actualización de estados (programada, completada, cancelada)
- 📄 Paginación y ordenamiento
- 🔐 Autenticación segura con JWT

## 🔐 Variables de Entorno

### Requeridas para la Aplicación:

- `NEXT_PUBLIC_SUPABASE_URL` - URL del proyecto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Clave anónima de Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Clave de service role (para operaciones admin)

### Requeridas para el Panel Admin:

- `ADMIN_EMAIL` - Email del administrador
- `ADMIN_PASSWORD` - Contraseña del administrador
- `JWT_SECRET` - Clave secreta para JWT (genera una clave aleatoria segura)

## 📝 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm start

# Linting
npm run lint
```

## 🚢 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en el dashboard de Vercel
3. Deploy automático en cada push

### Otros Proveedores



## 📚 Documentación Adicional

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.
