# Expedientes Especialidad (UCB) — Gestión de expedientes legales con ABAC, trazabilidad y Clean Architecture

Repositorio del **Proyecto de Especialidad Full Stack** orientado a la **gestión digital de expedientes legales**, integrando:

- **Control de acceso basado en atributos (ABAC)** (autorización contextual)
- **Trazabilidad / auditoría criptográficamente verificable** (encadenamiento hash)
- **Clean Architecture** (capas, inversión de dependencias, testabilidad)

> **Enfoque del módulo:** desarrollo funcional en local (backend + frontend + BD) y documentación de resultados. Despliegue cloud, CI/CD y pruebas a gran escala se trabajan en la fase de tutoría.

---

## 1) Objetivo del proyecto

Diseñar y desarrollar un modelo de sistema full stack para **gestión de expedientes legales** que fortalezca:

- **Integridad** de los registros
- **Autenticidad** de las actuaciones y documentos
- **Auditabilidad** y **trazabilidad** verificables

---

## 2) Alcance del módulo (Sesiones 1–6)

Incluye:

- **Backend (Node.js/Express + PostgreSQL)** con **Clean Architecture**:
  - Autenticación (login) y gestión de usuarios
  - CRUD de expedientes y sus componentes (**actuaciones** y **documentos**)
  - ABAC aplicado por caso de uso / endpoint
  - Auditoría/trazabilidad por operación con **encadenamiento hash**
- **Frontend (React + TypeScript)**:
  - Login
  - Dashboard
  - Listado/búsqueda de expedientes
  - Detalle de expediente (actuaciones/documentos)
  - Vista de trazabilidad (historial de auditoría)
- **Integración end-to-end** (frontend + backend + BD) y validación de flujos en local
- **Documentación** (Resultados, Conclusiones, Recomendaciones) y este README

Excluye (en este módulo):
- Despliegue en la nube
- CI/CD
- Pruebas unitarias/integración completas (se abordan en tutoría)

---

## 3) Stack tecnológico

- **Frontend:** React + TypeScript  
- **Backend:** Node.js + Express *(recomendado: TypeScript para contratos + DTOs + tipado de casos de uso)*  
- **Base de datos:** PostgreSQL  
- **Auth:** JWT  
- **ABAC (motor de políticas):** OPA o Casbin  
- **Trazabilidad:** SHA-256 (crypto de Node) + encadenamiento de auditoría

---

## 4) Arquitectura: Clean Architecture

### 4.1 Principios

- **Las dependencias apuntan hacia adentro**: Presentation → Infrastructure → Application → Domain
- **Domain no depende de nada** (frameworks, BD, libs)
- **Application define los casos de uso** y depende de **interfaces** (ports)
- **Infrastructure implementa** esas interfaces (adapters): repositorios DB, ABAC engine, hashing, storage, etc.
- **Presentation** (Express) adapta HTTP ↔ casos de uso (controllers/routes/middlewares)

### 4.2 Capas y responsabilidades

**Domain**
- Entidades: `Expediente`, `Actuacion`, `Documento`, `Usuario`
- Reglas del negocio (invariantes): por ejemplo, estados válidos, clasificación, etc.

**Application**
- Casos de uso: `CreateExpediente`, `AddActuacion`, `AttachDocumento`, `GetExpedienteDetail`, `GetAuditTrail`
- DTOs de entrada/salida (Request/Response Models)
- Interfaces (ports): `ExpedienteRepository`, `AuditRepository`, `PolicyEngine`, `Hasher`, `Clock`, etc.

**Infrastructure**
- Implementaciones: `PostgresExpedienteRepository`, `PostgresAuditRepository`
- ABAC adapter: `OpaPolicyEngine` / `CasbinPolicyEngine`
- Hashing: `Sha256Hasher`
- Mappers / ORMs / migraciones (si aplica)

**Presentation**
- Express: rutas, controladores, validaciones de request
- Autenticación (JWT middleware)
- Manejo de errores y logging

---

## 5) Estructura sugerida del repositorio (Clean Architecture)

> Ajusta los nombres si tu implementación difiere.

```
.
├─ backend/
│  ├─ src/
│  │  ├─ domain/
│  │  │  ├─ entities/
│  │  │  ├─ value-objects/
│  │  │  └─ errors/
│  │  ├─ application/
│  │  │  ├─ use-cases/
│  │  │  ├─ dtos/
│  │  │  └─ ports/                 # interfaces (repos, policy, hashing, etc.)
│  │  ├─ infrastructure/
│  │  │  ├─ db/                    # postgres client, migrations
│  │  │  ├─ repositories/          # implements ports
│  │  │  ├─ policy/                # OPA/Casbin adapters
│  │  │  └─ crypto/                # hashing implementation
│  │  ├─ presentation/
│  │  │  ├─ http/
│  │  │  │  ├─ routes/
│  │  │  │  ├─ controllers/
│  │  │  │  ├─ middlewares/
│  │  │  │  └─ validators/
│  │  │  └─ server.ts|server.js
│  │  └─ main/
│  │     ├─ di/                    # wiring: dependency injection
│  │     └─ app.ts                 # bootstrap
│  ├─ .env.example
│  └─ package.json
├─ frontend/
│  ├─ src/
│  │  ├─ app/                      # routing, providers
│  │  ├─ features/                 # expedientes, auth, auditoria
│  │  ├─ shared/                   # ui, hooks, utils, api client
│  │  └─ main.tsx
│  ├─ .env.example
│  └─ package.json
└─ docs/
   ├─ resultados.md
   ├─ conclusiones.md
   └─ recomendaciones.md
```

---

## 6) Funcionalidades clave

### 6.1 Flujos requeridos (demo)

**Flujo 1**
1. Login
2. Listado de expedientes
3. Ver detalle del expediente
4. Consultar documentos/actuaciones + historial de trazabilidad (**según decisión ABAC**)

**Flujo 2**
1. Login
2. Crear expediente
3. Registrar actuación y/o adjuntar documento
4. Ver trazabilidad generada (auditoría + hash/encadenamiento) por cada acción

---

## 7) Control de acceso ABAC (resumen)

ABAC toma decisiones evaluando **atributos** (sujeto, recurso, entorno). En el dominio legal permite reglas granulares por **confidencialidad, asignación y estado del expediente**.

### 7.1 Atributos sugeridos

**Sujeto (usuario)**
- `id`, `role` (abogado, asistente, admin)
- `oficinaId`
- `casesAssigned` (asignaciones)
- `clearanceLevel` (nivel de confidencialidad)

**Objeto (recurso)**
- `expedienteId`
- `classification` (público / reservado / confidencial)
- `estado` (abierto / cerrado / archivado)
- `ownerOficinaId`

**Entorno**
- `hora`, `ip`, `canal` (web), `motivo` (si aplica)

### 7.2 Recomendación de diseño (Clean Architecture + ABAC)

- La **decisión ABAC** debería ejecutarse en Application (caso de uso), usando un **port** (`PolicyEngine`) e inyectando su implementación desde Infrastructure.
- Registrar **allow/deny** en auditoría, incluyendo el **motivo** de la política.

---

## 8) Trazabilidad criptográficamente verificable (resumen)

Cada operación relevante genera un **evento de auditoría**.

### 8.1 Encadenamiento hash (idea)

Para cada evento:

- `prevHash`: hash del evento anterior
- `payloadCanonical`: serialización canónica del evento (orden estable de campos)
- `eventHash = sha256(prevHash + payloadCanonical)`

Esto ayuda a detectar alteraciones retrospectivas del historial.

### 8.2 Campos sugeridos de auditoría

- `eventId`
- `timestamp`
- `actorUserId`
- `action` (CRUD + tipo)
- `resourceType` (expediente/documento/actuacion)
- `resourceId`
- `decision` (allow/deny + motivo ABAC)
- `prevHash`
- `hash`

---

## 9) Instalación y ejecución en local

> Los comandos exactos dependen de tu implementación; esto es una guía base.

### 9.1 Requisitos
- Node.js (LTS recomendado)
- PostgreSQL 14+ (recomendado)
- npm / pnpm / yarn

### 9.2 Backend
```bash
cd backend
cp .env.example .env
npm install
# (si aplica) migraciones / schema
npm run dev
```

### 9.3 Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### 9.4 Variables de entorno (ejemplo recomendado)

**backend/.env.example**
```env
PORT=4000
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/expedientes
JWT_SECRET=change_me
ABAC_ENGINE=opa   # opa | casbin
AUDIT_HASH_ALGO=sha256
```

**frontend/.env.example**
```env
VITE_API_URL=http://localhost:4000
```

---

## 10) Semillas (seed) y usuarios demo

Recomendación:
- incluir `npm run seed` (si aplica) con:
  - usuarios y atributos ABAC
  - expedientes en distintos estados/clasificación
  - auditoría inicial para validar el encadenamiento

---

## 11) Documentación del módulo

En `docs/`:

- **Resultados:** evidencia de cumplimiento + capturas/tabla de verificación
- **Conclusiones:** aporte de ABAC y trazabilidad + hallazgos técnicos
- **Recomendaciones:** pasos para fase de tutoría (pruebas, hardening, observabilidad, etc.)

---

## 12) Autor

**Wilfredo Marcelino Yupanqui Villagaray**  
Proyecto de Especialidad — UCB (2026)

---

## 13) Licencia

Pendiente de definir (por defecto: uso académico).
