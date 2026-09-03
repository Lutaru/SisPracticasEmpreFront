# SisPracticasEmpreFront - Frontend del Sistema de Prácticas Universitarias

Aplicación web SPA desarrollada con **Angular 18**, **Tailwind CSS** y **Standalone Components** para la plataforma de gestión integral de prácticas empresariales universitarias.

Repositorio Backend correspondiente: [SisPracticasEmpreBack](https://github.com/Lutaru/SisPracticasEmpreBack)

---

## 🛠️ Stack Tecnológico
* **Framework:** Angular 18 (Standalone Components, Signals)
* **Estilos:** Tailwind CSS 3
* **Programación Reactiva:** RxJS
* **Seguridad:** Interceptor HTTP para JWT Bearer Tokens, Guards funcionales (`authGuard`, `roleGuard`)
* **Navegación:** Rutas hijas protegidas con Layout Principal responsivo

---

## 🚀 Guía de Instalación y Puesta en Marcha

### 1. Requisitos Previos
* **Node.js** (v18 o superior) y **npm**.
* El servidor backend ([SisPracticasEmpreBack](https://github.com/Lutaru/SisPracticasEmpreBack)) en ejecución en `http://localhost:3000`.

### 2. Configuración del Entorno
Verifica en `src/environments/environment.ts` que la URL del backend apunte al puerto correcto:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
};
```

### 3. Instalación de Dependencias
```bash
npm install
```

### 4. Iniciar el Servidor de Desarrollo
```bash
npm start
# o
ng serve
```

Navega a `http://localhost:4200` en tu navegador.

---

## 👥 Usuarios de Prueba para Acceso (Login)

Puedes ingresar usando cualquiera de los usuarios precargados en la base de datos:

| Rol | Email | Contraseña |
| :--- | :--- | :--- |
| **ADMIN** | `admin@universidad.edu.co` | `Admin123*` |
| **COORDINATOR** | `coordinador@universidad.edu.co` | `Coord123*` |
| **STUDENT** | `estudiante@universidad.edu.co` | `Student123*` |
| **COMPANY** | `contacto@techcorp.com` | `Empresa123*` |
| **TUTOR** | `tutor@universidad.edu.co` | `Tutor123*` |

---

## 📂 Estructura de la Aplicación

```text
src/app/
├── core/
│   ├── guards/
│   │   ├── auth.guard.ts           # Protección de rutas privadas
│   │   └── role.guard.ts           # Restricción basada en rol
│   ├── interceptors/
│   │   └── auth.interceptor.ts     # Inyección automática de token JWT Bearer
│   ├── models/
│   │   ├── user.model.ts           # Interfaces User, Role, DocumentType
│   │   └── auth-response.model.ts  # Interface respuesta de login
│   └── services/
│       └── auth.service.ts         # Login, logout, refresh token y Signals de estado
├── layouts/
│   └── main-layout/                # Sidebar, header, usuario activo y botón de logout
└── features/
    ├── auth/login/                 # Formulario de inicio de sesión reactivo
    └── dashboard/                  # Dashboard principal de bienvenida por rol
```

---

## 🗺️ Roadmap de Continuación del Frontend

Para ver el detalle completo de arquitectura y especificaciones del sistema, consulta [`docs/CONTEXT.md`](file:///C:/proyectos/frontend/docs/CONTEXT.md).

Próximas pantallas y módulos a implementar:
1. **Módulo de Usuarios (`features/users`)**: Listado, alta y edición de roles para el administrador.
2. **Módulo de Convocatorias (`features/offers`)**:
   - Para empresas/coordinadores: Crear y gestionar ofertas.
   - Para estudiantes: Catálogo de búsqueda y botón de postulación.
3. **Módulo de Postulaciones (`features/applications`)**:
   - Seguimiento del estado de postulaciones y revisión de candidatos.
4. **Módulo de Seguimiento (`features/internships`)**:
   - Subida de informes periódicos y aprobación del tutor.
5. **Módulo de Evaluaciones (`features/evaluations`)**:
   - Rúbricas de calificación y feedback.
