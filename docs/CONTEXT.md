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
4. **`CompaniesModule` (`src/modules/companies`):**
   - `POST /api/v1/companies`: Registro de empresa aliada (vinculación automática a usuario Company o asignada por Admin).
   - `GET /api/v1/companies`: Catálogo de empresas con filtros (búsqueda, sector, ciudad, verificación) y paginación.
   - `GET /api/v1/companies/me`: Perfil de empresa para el usuario Company autenticado.
   - `GET /api/v1/companies/:id`: Detalle completo con convenios vinculados.
   - `PATCH /api/v1/companies/:id`: Actualización de datos organizacionales.
   - `PATCH /api/v1/companies/:id/verify`: Aprobación jurídica de empresa (Admin / Coordinador).
   - `POST /api/v1/companies/:companyId/agreements`: Registro de convenios marco.
   - `GET /api/v1/companies/:companyId/agreements`: Consulta de convenios por empresa.
   - `PATCH /api/v1/agreements/:id/status`: Aprobación, activación o finalización de convenios marco.
5. **`OffersModule` (`src/modules/offers`):**
   - `POST /api/v1/offers`: Publicación de convocatorias para empresas verificadas (o por Coordinación/Admin).
   - `GET /api/v1/offers`: Catálogo de convocatorias abiertas para estudiantes y docentes; gestión de ofertas propias para empresas. Filtros por modalidad (`REMOTE`, `HYBRID`, `ON_SITE`), ubicación, perfil y búsqueda.
   - `GET /api/v1/offers/:id`: Detalle completo de una convocatoria y empresa ofertante.
   - `PATCH /api/v1/offers/:id`: Actualización de términos y fechas de la oferta.
   - `PATCH /api/v1/offers/:id/status`: Cambio de estado (`OPEN`, `CLOSED`, `CANCELLED`).
6. **`ApplicationsModule` (`src/modules/applications`):**
   - `POST /api/v1/applications`: Postulación de estudiante a una convocatoria abierta con hoja de vida y carta de motivación.
   - `GET /api/v1/applications/my-applications`: Historial de aplicaciones para el estudiante en sesión.
   - `GET /api/v1/applications`: Panel de postulaciones filtrable por oferta, estudiante y estado.
   - `GET /api/v1/applications/:id`: Detalle completo de la postulación.
   - `PATCH /api/v1/applications/:id/status`: Transición de estado (`SUBMITTED`, `PRESELECTED`, `INTERVIEW_SCHEDULED`, `ACCEPTED`, `REJECTED`), asignación de fecha de entrevista y feedback.
7. **`InternshipsModule` (`src/modules/internships`):**
   - `POST /api/v1/internships`: Formalización de práctica activa a partir de postulación aceptada.
   - `GET /api/v1/internships`: Listado de prácticas en curso filtradas por rol (estudiante ve la suya, docente las asignadas, empresa las de sus ofertas, coordinación/admin todas).
   - `GET /api/v1/internships/:id`: Detalle completo de la práctica con reportes y datos de seguimiento.
   - `PATCH /api/v1/internships/:id/assign-tutor`: Asignación de tutor académico por Coordinador/Admin.
   - `PATCH /api/v1/internships/:id/status`: Transición de ciclo de vida (`INITIATED`, `IN_PROGRESS`, `FINAL_EVALUATION`, `COMPLETED`, `CANCELLED`).
   - `POST /api/v1/internships/:internshipId/reports`: Subida de informe de avance (`INITIAL_PLAN`, `PARTIAL_1`, `PARTIAL_2`, `FINAL`) por el estudiante practicante.
   - `GET /api/v1/internships/:internshipId/reports`: Consulta de bitácora e informes entregados.
   - `PATCH /api/v1/internships/reports/:id/review`: Calificación y observaciones (`APPROVED`, `OBSERVED`) por el tutor docente o coordinador.
8. **`EvaluationsModule` (`src/modules/evaluations`):**
   - `POST /api/v1/evaluations`: Registro o edición de evaluación con rúbrica ponderada (Supervisor Empresarial o Tutor Académico). Recalcula automáticamente la nota definitiva (50% Empresa + 50% Tutor) y actualiza el estado de la práctica a `COMPLETED` si la nota es aprobatoria (≥ 3.0).
   - `GET /api/v1/evaluations`: Listado con filtros y control de visibilidad por rol.
   - `GET /api/v1/evaluations/internship/:internshipId/summary`: Acta oficial consolidada con datos del estudiante, empresa, tutor, desglose de calificaciones y dictamen institucional (`APROBADO` / `REPROBADO`).
   - `GET /api/v1/evaluations/internship/:internshipId`: Lista de evaluaciones registradas para una práctica.
   - `GET /api/v1/evaluations/:id`: Consulta individual de evaluación con sus criterios y retroalimentación cualitativa.

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
│   │   ├── company.model.ts    # Interface Company, Agreement, AgreementStatus
│   │   ├── offer.model.ts      # Interface InternshipOffer, OfferModality, OfferStatus
│   │   ├── application.model.ts# Interface Application, ApplicationStatus
│   │   ├── internship.model.ts # Interface Internship, InternshipReport, Enums
│   │   ├── evaluation.model.ts # Interface Evaluation, EvaluationSummary, RubricCriteria
│   │   └── auth-response.model.ts # Interface AuthResponse
│   └── services/
│       ├── auth.service.ts     # Login, logout, refresh, Signal currentUser, Signal isAuthenticated
│       ├── user.service.ts     # Gestión administrativa de usuarios y roles
│       ├── company.service.ts  # CRUD de empresas, verificación y convenios
│       ├── offer.service.ts    # Búsqueda, publicación y gestión de ofertas de práctica
│       ├── application.service.ts # Postulaciones, seguimiento y gestión de candidatos
│       ├── internship.service.ts  # Prácticas activas, bitácora de informes y revisión docente
│       └── evaluation.service.ts  # Calificaciones, rúbricas y acta consolidada
├── layouts/
│   └── main-layout/            # Barra lateral, cabecera superior, navegación y logout
└── features/
    ├── auth/login/             # Formulario de inicio de sesión con feedback visual
    ├── dashboard/              # Tablero principal con cards por rol
    ├── users/                  # Directorio institucional de usuarios, filtros RBAC, edición y creación
    ├── companies/              # Directorio de empresas, filtros, aprobación y registro de convenios
    ├── offers/                 # Catálogo exploratorio de convocatorias, tarjetas, filtros y publicación
    ├── applications/           # Gestión de candidatos y seguimiento de postulaciones
    ├── internships/            # Bitácora de seguimiento, plan de trabajo, subida de informes y evaluación de tutor
    └── evaluations/            # Rúbricas interactivas con cálculo en tiempo real y acta de finalización
```

---

## 4. Modelo de Datos Existente y Futuro

### Tablas Existentes:
- **`users`**: `id` (uuid), `email` (unique), `passwordHash`, `firstName`, `lastName`, `documentType`, `documentNumber`, `phone`, `role`, `isActive`, `createdAt`, `updatedAt`.
- **`audit_logs`**: `id` (uuid), `userId`, `action`, `entityName`, `entityId`, `details`, `ipAddress`, `createdAt`.
- **`companies`**: `id` (uuid), `legalName`, `tradeName`, `nit` (unique), `contactEmail`, `phone`, `address`, `city`, `website`, `sector`, `description`, `isVerified` (boolean), `userId` (FK User), `createdAt`, `updatedAt`.
- **`agreements`**: `id` (uuid), `companyId` (FK Company), `agreementNumber` (unique), `startDate`, `endDate`, `status` (`DRAFT`, `PENDING_APPROVAL`, `ACTIVE`, `EXPIRED`, `TERMINATED`), `documentUrl`, `approvedById` (FK User), `observations`, `createdAt`, `updatedAt`.
- **`internship_offers`**: `id` (uuid), `companyId` (FK Company), `title`, `description`, `requirements`, `profileNeeded`, `vacancies`, `salaryCompensation`, `modality` (`ON_SITE`, `REMOTE`, `HYBRID`), `location`, `status` (`DRAFT`, `OPEN`, `CLOSED`, `CANCELLED`), `expiresAt`, `createdAt`, `updatedAt`.
- **`applications`**: `id` (uuid), `offerId` (FK Offer), `studentId` (FK User), `status` (`SUBMITTED`, `PRESELECTED`, `INTERVIEW_SCHEDULED`, `ACCEPTED`, `REJECTED`), `coverLetter`, `resumeUrl`, `feedback`, `interviewDate`, `appliedAt`, `updatedAt`.
- **`internships`**: `id` (uuid), `applicationId` (FK Application), `studentId` (FK User), `companyId` (FK Company), `tutorId` (FK User Tutor), `startDate`, `endDate`, `status` (`INITIATED`, `IN_PROGRESS`, `FINAL_EVALUATION`, `COMPLETED`, `CANCELLED`), `weeklyHours`, `companySupervisorName`, `companySupervisorEmail`, `finalGrade`, `createdAt`, `updatedAt`.
- **`internship_reports`**: `id` (uuid), `internshipId` (FK Internship), `reportType` (`INITIAL_PLAN`, `PARTIAL_1`, `PARTIAL_2`, `FINAL`), `fileUrl`, `description`, `status` (`SUBMITTED`, `APPROVED`, `OBSERVED`), `tutorObservations`, `reviewedAt`, `submittedAt`, `createdAt`, `updatedAt`.
- **`evaluations`**: `id` (uuid), `internshipId` (FK Internship), `evaluatorId` (FK User), `evaluatorType` (`COMPANY`, `TUTOR`), `score` (decimal 0.00 - 5.00), `criteriaScores` (jsonb con competencias técnicas, actitudinales, cumplimiento), `strengths`, `improvements`, `recommendations`, `createdAt`, `updatedAt`.

### Tablas a Desarrollar (Próximos Sprints):
1. **`certificates` (Actas y Certificados de Finalización):**
   - Generación de certificado digital de culminación de práctica profesional con código QR o hash verificable.

---

## 5. Próximos Pasos Recomendados para Continuar

Para continuar el trabajo, se sugiere seguir este orden de prioridades:

### Paso 1: Certificados y Exportación de Actas Digitales
1. Módulo para emitir el certificado oficial de cumplimiento de práctica con código de verificación.
2. Endpoint para descarga directa o visualización en PDF con sello institucional.

---

## 6. Variables de Entorno y Conexión Local

El archivo [`.env.example`](file:///C:/proyectos/backend/.env.example) contiene la configuración estándar para desarrollo local:
- Puerto backend: `3000`
- Prefijo API: `/api/v1`
- Swagger: `/api/docs`
- Base de datos PostgreSQL: `practicas_universitarias` en `localhost:5432`
- Usuarios precargados: Ver seeder en [`src/database/seeds/initial-seed.ts`](file:///C:/proyectos/backend/src/database/seeds/initial-seed.ts).
