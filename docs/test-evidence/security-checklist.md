# Checklist de seguridad (Fase 6)

Estado de controles principales para cierre tecnico.

## Auth y acceso
- [x] JWT access/refresh implementado (`/auth/login`, `/auth/refresh`).
- [x] Perfil autenticado (`/auth/me`).
- [x] Endpoints protegidos con guard de autenticacion.
- [x] RBAC por permisos con `@Permissions(...)` y guard global.
- [x] Pruebas negativas 401/403 cubiertas en e2e.
- [x] Invalidacion server-side de refresh token en logout (`token_version` en JWT + usuario).

## Hardening API
- [x] `helmet` habilitado para headers de seguridad.
- [x] CORS configurado con origen controlado por `CORS_ORIGIN`.
- [x] Validacion global `ValidationPipe` con `whitelist` y `forbidNonWhitelisted`.
- [x] Manejo de errores estandarizado en filtro global.
- [x] Rate limiting para `login` y `refresh` con `@nestjs/throttler`.

## Datos y trazabilidad
- [x] Hash SHA-256 para integridad documental.
- [x] Auditoria de solicitudes autenticadas (exito/denegado/error).
- [x] Integridad referencial en modelo SQL mediante Prisma.

## Operacion
- [x] Swagger/OpenAPI publicado (`/docs`, `/docs-json`).
- [x] Healthcheck para monitoreo (`/api/health`).
- [x] CI/CD definido con workflows de build/test/deploy.
- [x] Escaneo de dependencias (SCA) en CI (`dependency-review-action`).

## Decision de cierre
- Riesgo residual aceptable para release candidato: **medio-bajo**.
- Condiciones para pasar a release final: publicar tag al remoto y validar despliegue candidato en entorno objetivo.
