# Legal Case Management — Expedientes Legales con RBAC y Trazabilidad

Sistema full-stack para **gestión de expedientes legales** con **control de acceso basado en roles (RBAC)** y **trazabilidad/auditoría completa**.

Proyecto académico basado en el documento *"Desarrollo de un sistema full stack orientado a la gestión de expedientes legales utilizando control de acceso y trazabilidad"* (2026).

---

## Características

### Gestión Legal
- **Expedientes**: CRUD completo + búsqueda + control de estados (`ABIERTO` → `EN_TRAMITE` → `CERRADO` → `ARCHIVADO`)
- **Actuaciones**: registro cronológico de acciones vinculadas al expediente
- **Documentos**: adjuntos con metadatos, hash SHA-256, descarga y storage configurable (`local`/`s3`/`minio`)

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
| **Base de datos** | MySQL 8.4 |
| **DevOps** | Docker + docker-compose, MinIO (S3 compatible), GitHub Actions (CI/CD) |
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
│       ├── ci.yml
│       └── cd.yml
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── .env.prod.example
├── .editorconfig
└── package.json                # Monorepo (npm workspaces)
```

---

## Requisitos

- **Node.js** >= 20 (LTS)
- **MySQL** 8.4+
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

### 2. Levantar infraestructura con Docker

```bash
docker compose up -d db minio minio-init
```

El contenedor inicializa automáticamente una base `prisma_migrate_shadow` para migraciones de Prisma.
MinIO queda disponible en:

- API S3: `http://localhost:9000`
- Consola: `http://localhost:9001`

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
