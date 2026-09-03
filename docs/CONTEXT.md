# Contexto Técnico y Arquitectura del Sistema

> **Objetivo de este documento:** Proveer el contexto integral del proyecto (arquitectura, decisiones de diseño, modelo de datos y reglas de negocio) para que cualquier desarrollador, equipo o agente de IA en otro equipo pueda continuar el desarrollo de forma fluida y sin fricciones.

---

## 1. Visión General del Negocio

El **Sistema de Gestión de Prácticas Empresariales Universitarias** es una plataforma orientada a centralizar y automatizar el flujo completo de vinculación de estudiantes con el sector empresarial.

### Actores del Sistema y Roles (`Role` enum):
1. **`ADMIN` (Administrador General):**
   - Gestión integral de usuarios (crear, editar, activar/desactivar, asignar roles).
   - Consulta y exportación de logs de auditoría global (`AuditLog`).
   - Configuración general del sistema.
2. **`COORDINATOR` (Coordinador de Prácticas):**
   - Revisa y aprueba el registro de empresas y convenios marco.
   - Publica o aprueba convocatorias/ofertas de prácticas.
   - Valida la postulación de los estudiantes y requisitos académicos.
   - Asigna tutores docentes a las prácticas activas.
   - Supervisa el avance y aprueba las actas finales.
3. **`STUDENT` (Estudiante):**
   - Consulta ofertas de prácticas disponibles.
   - Aplica a convocatorias adjuntando hoja de vida y soportes.
   - Consulta el estado de sus postulaciones.
   - Si su práctica es aprobada: registra el plan de trabajo, sube informes periódicos y consulta sus calificaciones.
4. **`COMPANY` (Empresa Aliada):**
   - Registra datos organizacionales, NIT, representante legal y convenios.
   - Crea y publica ofertas de prácticas con requerimientos específicos.
   - Evalúa postulantes asignados y selecciona candidatos.
   - Realiza la evaluación intermedia y final del desempeño del practicante.
5. **`TUTOR` (Docente Asesor / Tutor Académico):**
   - Da seguimiento académico al estudiante asignado.
   - Revisa y aprueba los informes de avance periódicos.
   - Emite la calificación académica final de la práctica.

---

## 2. Arquitectura de Backend ([`backend/`](file:///C:/proyectos/backend))

### Tecnologías:
- **Framework:** NestJS 10 (TypeScript).
- **ORM:** TypeORM 0.3 conectando a PostgreSQL.
- **Validaciones:** `class-validator` y `class-transformer` con `ValidationPipe` global `{ whitelist: true, forbidNonWhitelisted: true, transform: true }`.
- **Seguridad:** `@nestjs/passport`, `@nestjs/jwt`, `passport-jwt`, `bcrypt`.
- **Documentación:** `@nestjs/swagger` montado en `/api/docs`.

### Componentes Globales ([`src/common/`](file:///C:/proyectos/backend/src/common)):
- **Guards:**
  - `JwtAuthGuard`: Protege todas las rutas de la API por defecto (registrado como `APP_GUARD` en `app.module.ts`).
  - `@Public()` decorator: Exonera endpoints específicos de autenticación (ej: `/auth/login`, `/auth/register`).
  - `RolesGuard`: Aplica RBAC usando el decorador `@Roles(...)`.
- **Decorators:**
  - `@CurrentUser()`: Extrae el usuario autenticado del request inyectado por `jwt.strategy.ts`.
- **Interceptors:**
  - `TransformResponseInterceptor`: Estandariza la respuesta JSON (`{ success: true, data, timestamp }`).
  - `AuditInterceptor`: Registra automáticamente eventos y cambios en la tabla `audit_logs`.
- **Filters:**
  - `HttpExceptionFilter`: Captura excepciones HTTP y devuelve formato de error unificado.

### Módulos Implementados:
1. **`AuthModule` (`src/modules/auth`):**
   - `POST /api/v1/auth/login`: Valida email y password con bcrypt, emite JWT de acceso y Refresh token.
   - `POST /api/v1/auth/register`: Registro de nuevos usuarios.
   - `POST /api/v1/auth/refresh`: Renovación de JWT expirado.
   - `GET /api/v1/auth/profile`: Retorna datos del usuario en sesión.
2. **`UsersModule` (`src/modules/users`):**
   - `GET /api/v1/users`: Listado paginado con búsqueda por nombre, email, documento y filtro por rol.
   - `GET /api/v1/users/:id`: Detalle de usuario.
   - `POST /api/v1/users`: Creación administrativa de usuarios.
   - `PATCH /api/v1/users/:id`: Edición parcial.
   - `DELETE /api/v1/users/:id`: Desactivación lógica / eliminación.
3. **`AuditModule` (`src/modules/audit`):**
   - `GET /api/v1/audit`: Listado histórico de acciones con usuario, entidad afectada, payload previo y nuevo, e IP.

---

## 3. Arquitectura de Frontend ([`frontend/`](file:///C:/proyectos/frontend))

### Tecnologías:
- **Framework:** Angular 18 con Standalone Components.
- **Estilos:** Tailwind CSS 3 (configurado con utilidades responsivas, botones, badges, modales y formularios).
- **Programación Reactiva:** RxJS y Angular Signals.

### Estructura de Directorios:
```text
src/app/
├── core/
│   ├── guards/
│   │   ├── auth.guard.ts       # Valida si hay sesión activa; si no, redirige a /auth/login
│   │   └── role.guard.ts       # Valida si el rol del usuario cumple con data: { roles: [...] }
│   ├── interceptors/
│   │   └── auth.interceptor.ts # Intercepta peticiones HTTP y añade "Authorization: Bearer <token>"
│   ├── models/
│   │   ├── user.model.ts       # Interface User, Role enum, DocumentType enum
│   │   └── auth-response.model.ts # Interface AuthResponse
│   └── services/
│       └── auth.service.ts     # Login, logout, refresh, Signal currentUser, Signal isAuthenticated
├── layouts/
│   └── main-layout/            # Barra lateral, cabecera superior, navegación y logout
└── features/
    ├── auth/login/             # Formulario de inicio de sesión con feedback visual
    └── dashboard/              # Tablero principal con cards por rol
```

---

## 4. Modelo de Datos Existente y Futuro

### Tablas Existentes:
- **`users`**: `id` (uuid), `email` (unique), `passwordHash`, `firstName`, `lastName`, `documentType`, `documentNumber`, `phone`, `role`, `isActive`, `createdAt`, `updatedAt`.
- **`audit_logs`**: `id` (uuid), `userId`, `action`, `entityName`, `entityId`, `details`, `ipAddress`, `createdAt`.

### Tablas a Desarrollar (Próximos Sprints):
1. **`companies`:**
   - `id`, `legalName` (Razón Social), `tradeName` (Nombre Comercial), `nit`, `contactEmail`, `phone`, `address`, `city`, `website`, `sector`, `isVerified` (boolean), `createdAt`.
2. **`agreements` (Convenios):**
   - `id`, `companyId`, `agreementNumber`, `startDate`, `endDate`, `status` (`DRAFT`, `PENDING_APPROVAL`, `ACTIVE`, `EXPIRED`, `TERMINATED`), `documentUrl`, `approvedById`.
3. **`internship_offers` (Convocatorias / Ofertas):**
   - `id`, `companyId`, `title`, `description`, `requirements`, `profileNeeded`, `vacancies`, `salaryCompensation`, `modality` (`ON_SITE`, `REMOTE`, `HYBRID`), `location`, `status` (`OPEN`, `CLOSED`, `CANCELLED`), `expiresAt`.
4. **`applications` (Postulaciones):**
   - `id`, `offerId`, `studentId`, `status` (`SUBMITTED`, `PRESELECTED`, `INTERVIEW_SCHEDULED`, `ACCEPTED`, `REJECTED`), `coverLetter`, `resumeUrl`, `feedback`, `appliedAt`.
5. **`internships` (Prácticas en Curso):**
   - `id`, `applicationId`, `studentId`, `companyId`, `tutorId`, `startDate`, `endDate`, `status` (`INITIATED`, `IN_PROGRESS`, `FINAL_EVALUATION`, `COMPLETED`, `CANCELLED`), `weeklyHours`.
6. **`internship_reports` (Informes de Seguimiento):**
   - `id`, `internshipId`, `reportType` (`INITIAL_PLAN`, `PARTIAL_1`, `PARTIAL_2`, `FINAL`), `fileUrl`, `submissionDate`, `status` (`SUBMITTED`, `APPROVED`, `OBSERVED`), `tutorObservations`.
7. **`evaluations` (Evaluaciones):**
   - `id`, `internshipId`, `evaluatorId`, `evaluatorType` (`COMPANY`, `TUTOR`), `score` (decimal), `rubricJson`, `recommendations`, `createdAt`.

---

## 5. Próximos Pasos Recomendados para Continuar

Para continuar el trabajo en otro equipo, se sugiere seguir este orden de prioridades:

### Paso 1: Módulo de Empresas y Convenios en Backend
1. Generar módulo:
   ```bash
   cd backend
   nest g module modules/companies
   nest g controller modules/companies
   nest g service modules/companies
   ```
2. Crear entidad `Company` y sus relaciones con TypeORM.
3. Crear endpoints para registro de empresa, aprobación por parte del coordinador y consulta de perfil.

### Paso 2: Módulo de Ofertas de Práctica
1. Crear módulo `offers` para publicación de vacantes por parte de empresas verificadas.
2. Endpoint para listar ofertas activas para estudiantes con filtros (modalidad, ciudad, perfil).

### Paso 3: Módulo de Postulaciones
1. Crear módulo `applications`.
2. Estudiante puede hacer `POST /applications` enviando oferta y URL/archivo de hoja de vida.
3. Empresa y coordinador pueden cambiar el estado de la postulación.

### Paso 4: Vistas en Frontend Angular
1. Crear componentes de administración de usuarios en `frontend/src/app/features/users/`.
2. Crear catálogo de ofertas para estudiantes en `frontend/src/app/features/offers/`.
3. Crear panel de empresa para gestionar candidatos en `frontend/src/app/features/company/`.

---

## 6. Variables de Entorno y Conexión Local

El archivo [`.env.example`](file:///C:/proyectos/backend/.env.example) contiene la configuración estándar para desarrollo local:
- Puerto backend: `3000`
- Prefijo API: `/api/v1`
- Swagger: `/api/docs`
- Base de datos PostgreSQL: `practicas_universitarias` en `localhost:5432`
- Usuarios precargados: Ver seeder en [`src/database/seeds/initial-seed.ts`](file:///C:/proyectos/backend/src/database/seeds/initial-seed.ts).
