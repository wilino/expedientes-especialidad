# Expedientes Legales — Sistema de Gestión para Buffet de Abogados

Sistema full-stack para **gestión de expedientes legales** con **RBAC**, **trazabilidad completa** y **dashboard operativo moderno** diseñado para bufetes de abogados.

Proyecto académico: *"Desarrollo de un sistema full stack orientado a la gestión de expedientes legales utilizando control de acceso y trazabilidad"* (2026).

---

## Características

### Dashboard operativo
- **Banner contextual** con saludo personalizado y conteo de recordatorios del día
- **KPI Cards** con métricas en tiempo real (expedientes, actuaciones, documentos, auditoría) y tendencia porcentual
- **Gauges semicirculares** — tacómetros visuales: tasa de resolución, cumplimiento de plazos, integridad documental, cobertura de auditoría
- **Gráfico donut** de expedientes por estado (Abierto / En trámite / Cerrado / Archivado)
- **Panel de notificaciones** con badge, tipos por color (vencimiento, alerta, éxito, info) y marcado de lectura
- **Panel de recordatorios** tipo to-do, agrupados por fecha con prioridades y checkboxes
- **Timeline de actividad reciente** con eventos linkados a recursos

### Gestión Legal
- **Expedientes**: CRUD completo + búsqueda + filtros + control de estados (`ABIERTO` → `EN_TRAMITE` → `CERRADO` → `ARCHIVADO`)
- **Actuaciones**: registro cronológico de acciones legales vinculadas al expediente
- **Documentos**: adjuntos con metadatos, hash SHA-256, descarga y storage configurable (`local` / `s3` / `minio`)

### Seguridad (RBAC + JWT)
- Autenticación con JWT (access + refresh tokens)
- Autorización RBAC por endpoint con matriz rol-permiso
- Política "deny by default": todo endpoint requiere autenticación salvo `/auth/login` y `/health`
- Hashing seguro de contraseñas con bcrypt

### Auditoría y Trazabilidad
- Registro automático de todas las acciones relevantes (interceptor)
- Login éxito/fracaso, acceso denegado, CRUD, cambios de estado, descargas
- Filtros por usuario, expediente, fecha, acción y resultado

### Identidad visual — "Legal Slate & Gold"
- Paleta navy profundo (`#1B2A4A`) + dorado (`#C8A951`) sobre fondo gris azulado (`#F4F6FA`)
- Sidebar oscura con acentos dorados y avatar del usuario en footer
- Tipografía moderna: Plus Jakarta Sans (títulos) + Inter (cuerpo) + DM Sans (métricas)
- Gradientes sutiles en hero banner, iconos de KPI y arcos de gauges

---

## Stack Tecnológico

| Capa | Tecnología |
| --- | --- |
| **Frontend** | React 19 + TypeScript (Vite 8), MUI v7 (Material UI), MUI X Charts, MUI X Data Grid, MUI Lab, TanStack React Query, React Hook Form + Zod, React Router 7, Notistack |
| **Backend** | NestJS + TypeScript, Prisma ORM (adapter MariaDB), JWT + bcrypt + Passport, Helmet, Throttler, OpenAPI/Swagger |
| **Base de datos** | MariaDB (MySQL compatible) via Docker |
| **Storage** | MinIO (S3 compatible) / local / AWS S3 |
| **DevOps** | Docker + Docker Compose, GitHub Actions (CI + CD), deploy remoto por SSH |
| **Calidad** | ESLint, TypeScript strict, Jest, Supertest (e2e) |

---

## Arquitectura

Monorepo con npm workspaces. Arquitectura por capas con separación de responsabilidades:

```
Presentación (MUI + React)  →  API (NestJS Controllers)  →  Servicios  →  Prisma ORM  →  MariaDB / MinIO
                                  ↕ Cross-cutting: Auth/RBAC Guards, Auditoría Interceptor, Throttling
```

---

## 📂 Estructura del repositorio

```
expedientes-especialidad/
├── 📦 apps/
│   ├── 🖥️ api/                        # Backend (NestJS)
│   │   ├── src/
│   │   │   ├── 🧩 modules/            # auth, users, rbac, expedientes, actuaciones,
│   │   │   │                          # documentos, auditoria, reportes, health
│   │   │   ├── 🔧 shared/             # dto, errors, middleware, guards, interceptors, utils
│   │   │   ├── 🗄️ prisma/             # PrismaService, adapter factory
│   │   │   └── ⚙️ config/             # swagger, http-app config
│   │   ├── 📐 prisma/                 # schema.prisma + migraciones + seed
│   │   └── 🧪 test/                   # e2e tests
│   └── 🌐 web/                        # Frontend (React + MUI + Vite)
│       ├── src/
│       │   ├── 🚀 app/                # router, providers, error-boundary
│       │   ├── 🎯 features/
│       │   │   ├── 🔐 auth/           # login, context, guards, hooks
│       │   │   ├── 📐 layout/         # AppLayout (sidebar navy + appbar)
│       │   │   ├── 📊 dashboard/      # greeting, stat-cards, gauges, donut,
│       │   │   │                      # notificaciones, recordatorios, timeline
│       │   │   ├── 📁 expedientes/    # listado, detalle, formularios
│       │   │   └── 👥 admin/          # gestión usuarios, roles, permisos
│       │   ├── 📄 pages/              # 12 páginas (dashboard, expedientes, actuaciones,
│       │   │                          # documentos, auditoría, reportes, admin, login, 403)
│       │   ├── 🎨 ui/
│       │   │   ├── 🎭 theme/          # palette, typography, components, gradients
│       │   │   └── 🧱 components/     # data-table, loading-state, empty-state,
│       │   │                          # page-header, permission-guard, confirm-dialog
│       │   └── 📚 lib/                # contracts, helpers, api client
│       └── 🌍 public/
├── 📦 packages/
│   └── 🤝 shared/                     # Tipos y contratos compartidos
├── 📜 scripts/
│   ├── 🗄️ db/                         # mysql-init-shadow.sql
│   └── 🚢 deploy/                     # remote-deploy.sh
├── ⚡ .github/workflows/              # ci.yml + cd.yml
├── 🐳 docker-compose.yml
├── 🐳 docker-compose.prod.yml
├── 🔑 .env.example
├── 🔑 .env.prod.example
├── 📏 .editorconfig
└── 📦 package.json                    # Monorepo (npm workspaces)
```

---

## Requisitos

- **Node.js** >= 20 (LTS)
- **npm** >= 10
- **Docker** + Docker Compose

---

## Ejecución en local

### 1. Clonar y configurar

```bash
git clone <repo-url>
cd expedientes-especialidad
cp .env.example .env
```

### 2. Levantar infraestructura con Docker

```bash
docker compose up -d db minio minio-init
```

El contenedor inicializa automáticamente una base `prisma_migrate_shadow` para migraciones de Prisma.

- **MariaDB**: `localhost:3306`
- **MinIO API S3**: `http://localhost:9000`
- **MinIO Consola**: `http://localhost:9001`

### 3. Backend

```bash
npm install
npm run db:migrate
npm run db:seed          # Roles, permisos, usuario admin
npm run dev:api
```

API: `http://localhost:4000` — Swagger: `http://localhost:4000/docs`

### 4. Frontend

```bash
npm run dev:web
```

App: `http://localhost:5173`

---

## Variables de entorno

### apps/api/.env

```env
PORT=4000
DATABASE_URL=mysql://expedientes:expedientes@localhost:3306/expedientes
SHADOW_DATABASE_URL=mysql://root:root@localhost:3306/prisma_migrate_shadow
JWT_SECRET=change_me_in_production
JWT_REFRESH_SECRET=change_me_in_production_refresh
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
DOCUMENTS_STORAGE_DRIVER=local
DOCUMENTS_STORAGE_PATH=uploads
DOCUMENTS_STORAGE_S3_ENDPOINT=http://localhost:9000
DOCUMENTS_STORAGE_S3_REGION=us-east-1
DOCUMENTS_STORAGE_S3_BUCKET=expedientes-docs
DOCUMENTS_STORAGE_S3_PREFIX=
DOCUMENTS_STORAGE_S3_ACCESS_KEY=minioadmin
DOCUMENTS_STORAGE_S3_SECRET_KEY=minioadmin
DOCUMENTS_STORAGE_S3_FORCE_PATH_STYLE=true
```

Si ejecutas la API dentro de Docker Compose y activas `DOCUMENTS_STORAGE_DRIVER=minio`, usa `DOCUMENTS_STORAGE_S3_ENDPOINT=http://minio:9000`.

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
- `PATCH /expedientes/:id/estado` — Transición de estado

### Actuaciones
- `POST /expedientes/:id/actuaciones` — Registrar actuación
- `GET /expedientes/:id/actuaciones` — Listar actuaciones

### Documentos
- `POST /expedientes/:id/documentos` — Subir documento (multipart)
- `GET /expedientes/:id/documentos` — Listar documentos
- `GET /expedientes/:id/documentos/:docId/download` — Descargar documento

### Auditoría / Reportes
- `GET /auditoria` — Consultar bitácora (filtros por usuario, expediente, fecha, acción)
- `GET /reportes/estados` — Reporte por estados
- `GET /reportes/actividad` — Reporte de actividad

### Dashboard
- `GET /dashboard/summary` — KPIs consolidados con tendencias
- `GET /dashboard/gauges` — Métricas calculadas para tacómetros

### Notificaciones
- `GET /notificaciones` — Lista de notificaciones del usuario
- `POST /notificaciones/:id/read` — Marcar como leída

### Recordatorios
- `GET /recordatorios` — Recordatorios del usuario (agrupados por fecha)
- `POST /recordatorios` — Crear recordatorio
- `PATCH /recordatorios/:id` — Marcar completado / editar

### Actividad
- `GET /actividad/reciente` — Últimos 10 eventos con detalle para timeline

---

## CI/CD

- **CI**: `.github/workflows/ci.yml` (lint, build, tests, e2e).
- **CD**: `.github/workflows/cd.yml` (build/push de imágenes a GHCR + deploy opcional por SSH).
- **Deploy remoto**: `scripts/deploy/remote-deploy.sh` (usa `docker-compose.prod.yml`).

Secrets para habilitar deploy remoto:

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY`

Opcionales:

- `DEPLOY_COMMAND` (si no se define, se usa plantilla por defecto)
- `GHCR_USERNAME` y `GHCR_TOKEN` (si necesitas `docker login` en el servidor)

Variable de repositorio recomendada:

- `DEPLOY_APP_DIR` (ruta absoluta del repo en el servidor; por defecto `~/expedientes-especialidad`)

Plantilla por defecto de `DEPLOY_COMMAND`:

```bash
cd ~/expedientes-especialidad && bash scripts/deploy/remote-deploy.sh
```

Despliegue manual en servidor:

```bash
cp .env.prod.example .env.prod
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d
```

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
- **notificacion** — Notificaciones por usuario (tipo, leída, recurso vinculado)
- **recordatorio** — Recordatorios con fecha/hora, prioridad y estado de completado

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

| Fase | Alcance | Estado |
| --- | --- | --- |
| **Fase 0** — Preparación | Repo, Docker, CI, estándares | ✅ Completada |
| **Fase 1** — Modelado | Schema Prisma, migraciones, seed | ✅ Completada |
| **Fase 2** — Backend base | Auth, JWT, estructura modular, Swagger | ✅ Completada |
| **Fase 3** — RBAC + Auditoría | Guards, interceptor auditoría, deny-by-default | ✅ Completada |
| **Fase 4** — Dominio | Expedientes, actuaciones, documentos, estados | ✅ Completada |
| **Fase 5** — Frontend | Login, dashboard, CRUD, admin, bitácora | ✅ Completada |
| **Fase 6** — QA + Deploy | Reportes, tests, performance, CD, docs | ✅ Completada |
| **v2** — Refactor UI | Migración a MUI v7, theme system, DataGrid | ✅ Completada |
| **v3** — Dashboard moderno | Paleta Legal Slate & Gold, gauges, notificaciones, recordatorios, timeline, sidebar navy | ✅ Completada |

---

## Convenciones

- **Commits**: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`)
- **Branching**: feature branches → PR → `develop` → `main`
- **Versionado**: tags semánticos (`v0.1.0`, `v0.2.0`, ...)

---

## Screenshots

### Dashboard
El dashboard operativo muestra un banner de bienvenida contextual, 4 KPI cards con tendencia, gauges semicirculares tipo tacómetro, gráfico donut de estados, panel de notificaciones con badges, recordatorios tipo to-do y timeline de actividad reciente.

### Sidebar
Sidebar con fondo navy (`#1B2A4A`), iconos claros, item activo con borde dorado, secciones agrupadas (Operativo / Administración) y avatar del usuario en el footer.

---

## Licencia

Pendiente.
