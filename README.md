# Legal Case Management — Expedientes Legales con RBAC y Trazabilidad

Sistema full-stack para **gestión de expedientes legales** con **control de acceso basado en roles (RBAC)** y **trazabilidad/auditoría completa**.

Proyecto académico basado en el documento *"Desarrollo de un sistema full stack orientado a la gestión de expedientes legales utilizando control de acceso y trazabilidad"* (2026).

---

## Características

### Gestión Legal
- **Expedientes**: CRUD completo + búsqueda + control de estados (`ABIERTO` → `EN_TRAMITE` → `CERRADO` → `ARCHIVADO`)
- **Actuaciones**: registro cronológico de acciones vinculadas al expediente
- **Documentos**: adjuntos con metadatos, hash SHA-256 para verificación de integridad

### Seguridad (RBAC + JWT)
- Autenticación con JWT (access + refresh tokens)
- Autorización RBAC por endpoint con matriz rol-permiso
- Política "deny by default": todo endpoint requiere autenticación salvo `/auth/login` y `/health`
- Hashing seguro de contraseñas con bcrypt

### Auditoría y Trazabilidad
- Registro automático de todas las acciones relevantes (interceptor)
- Login éxito/fracaso, acceso denegado, CRUD, cambios de estado, descargas
- Filtros por usuario, expediente, fecha, acción y resultado

---

## Stack Tecnológico

| Capa | Tecnología |
| --- | --- |
| **Frontend** | React + TypeScript (Vite), Tailwind CSS, TanStack Query, Zustand, React Hook Form + Zod, React Router |
| **Backend** | NestJS + TypeScript, Prisma ORM, JWT + bcrypt, OpenAPI/Swagger |
| **Base de datos** | PostgreSQL 16 |
| **DevOps** | Docker + docker-compose, GitHub Actions (CI/CD) |
| **Calidad** | ESLint + Prettier, Jest/Vitest, Supertest |

---

## Arquitectura

Arquitectura por capas con separación de responsabilidades:

```
Presentación (UI)  →  API (Controllers)  →  Aplicación (Casos de uso)  →  Dominio (Entidades)  →  Infraestructura (DB/Storage)
                                    ↕ Cross-cutting: Auth/RBAC, Auditoría, Observabilidad
```

---

## Estructura del repositorio

```
legal-case-mgmt/
├── apps/
│   ├── api/                    # Backend (NestJS + TypeScript)
│   │   ├── src/
│   │   │   ├── modules/        # auth, users, rbac, expedientes, actuaciones, documentos, auditoria, reportes, health
│   │   │   └── shared/         # dto, errors, middleware, guards, interceptors, utils
│   │   ├── prisma/             # schema + migraciones
│   │   └── test/
│   └── web/                    # Frontend (React + TypeScript + Vite)
│       ├── src/
│       │   ├── features/       # auth, expedientes, documentos, auditoria, admin
│       │   ├── pages/
│       │   ├── components/
│       │   └── lib/            # helpers, api client, hooks
│       └── public/
├── packages/
│   └── shared/                 # Tipos y contratos compartidos (DTOs, enums)
├── scripts/
│   └── db/                     # seed, reset
├── .github/
│   └── workflows/
│       └── ci.yml
├── docker-compose.yml
├── .env.example
├── .editorconfig
└── package.json                # Monorepo (npm workspaces)
```

---

## Requisitos

- **Node.js** >= 20 (LTS)
- **PostgreSQL** 16+
- **npm** >= 10
- **Docker** + Docker Compose (opcional, recomendado)

---

## Ejecución en local

### 1. Clonar y configurar

```bash
git clone <repo-url>
cd expedientes-especialidad
cp .env.example .env
```

### 2. Levantar base de datos con Docker

```bash
docker compose up -d db
```

### 3. Backend

```bash
# Instalar dependencias (desde la raíz del monorepo)
npm install

# Ejecutar migraciones
npm run db:migrate

# Seed de datos iniciales (roles, permisos, usuario admin)
npm run db:seed

# Iniciar en modo desarrollo
npm run dev:api
```

La API estará disponible en `http://localhost:4000` y Swagger en `http://localhost:4000/docs`.

### 4. Frontend

```bash
npm run dev:web
```

La aplicación estará disponible en `http://localhost:5173`.

---

## Variables de entorno

### apps/api/.env

```env
PORT=4000
DATABASE_URL=postgresql://expedientes:expedientes@localhost:5432/expedientes
JWT_SECRET=change_me_in_production
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
```

### apps/web/.env

```env
VITE_API_URL=http://localhost:4000
```

---

## Endpoints principales (API REST)

### Auth
- `POST /auth/login` — Iniciar sesión
- `POST /auth/refresh` — Refrescar token
- `POST /auth/logout` — Cerrar sesión
- `GET /auth/me` — Usuario actual

### Usuarios / RBAC
- `GET /users` — Listar usuarios (admin)
- `POST /users` — Crear usuario (admin)
- `PATCH /users/:id` — Editar usuario (admin)
- `GET /roles` — Listar roles (admin)
- `PUT /roles/:id/permissions` — Asignar permisos (admin)

### Expedientes
- `GET /expedientes` — Listar con filtros (estado, búsqueda, fechas)
- `POST /expedientes` — Crear expediente
- `GET /expedientes/:id` — Detalle
- `PATCH /expedientes/:id` — Editar
- `POST /expedientes/:id/cambiar-estado` — Transición de estado

### Actuaciones
- `POST /expedientes/:id/actuaciones` — Registrar actuación
- `GET /expedientes/:id/actuaciones` — Listar actuaciones

### Documentos
- `POST /expedientes/:id/documentos` — Subir documento (multipart)
- `GET /expedientes/:id/documentos` — Listar documentos
- `GET /documentos/:id/download` — Descargar documento

### Auditoría / Reportes
- `GET /audit` — Consultar bitácora (filtros por usuario, expediente, fecha, acción)
- `GET /reportes/estados` — Reporte por estados
- `GET /reportes/actividad` — Reporte de actividad

---

## Modelo de datos

Tablas principales:

- **usuario** — Usuarios del sistema
- **rol** / **permiso** / **rol_permiso** — RBAC
- **usuario_rol** — Asignación usuario-rol
- **expediente** — Expedientes legales con estados controlados
- **actuacion** — Acciones vinculadas a expedientes
- **documento** — Archivos adjuntos con hash SHA-256
- **audit_log** — Bitácora de auditoría

---

## Seguridad

Controles alineados a OWASP:

- **A01 Broken Access Control**: RBAC en servidor, deny-by-default, pruebas negativas
- **A02 Cryptographic Failures**: contraseñas con bcrypt, JWT secrets en `.env`, TLS
- **A03 Injection**: ORM (Prisma) + consultas parametrizadas + validación con class-validator/Zod
- **A09 Logging & Monitoring**: auditoría estructurada en base de datos
- Rate limiting en login, CORS estricto, headers de seguridad (helmet)

---

## Plan de implementación

| Fase | Alcance | Progreso |
| --- | --- | --- |
| **Fase 0** — Preparación | Repo, Docker, CI, estándares | 0% → 10% |
| **Fase 1** — Modelado | Schema Prisma, migraciones, seed | 10% → 25% |
| **Fase 2** — Backend base | Auth, JWT, estructura modular, Swagger | 25% → 45% |
| **Fase 3** — RBAC + Auditoría | Guards, interceptor auditoría, deny-by-default | 45% → 60% |
| **Fase 4** — Dominio | Expedientes, actuaciones, documentos, estados | 60% → 80% |
| **Fase 5** — Frontend | Login, dashboard, CRUD, admin, bitácora | 80% → 92% |
| **Fase 6** — QA + Deploy | Reportes, tests, performance, CD, docs | 92% → 100% |

---

## Convenciones

- **Commits**: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`)
- **Branching**: feature branches → PR → `develop` → `main`
- **Versionado**: tags semánticos (`v0.1.0`, `v0.2.0`, ...)

---

## Licencia

Pendiente.
