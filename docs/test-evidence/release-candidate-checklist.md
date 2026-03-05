# Release candidate checklist

## Estado general
- [x] Backend con modulos clave operativos (auth, rbac, expedientes, actuaciones, documentos, auditoria, reportes).
- [x] Swagger habilitado y versionable.
- [x] Frontend con rutas protegidas y modulos de negocio visibles.
- [x] Pruebas unitarias y e2e ejecutadas en local sin fallos.
- [x] Definicion de despliegue con `docker-compose.prod.yml` y script remoto.
- [x] Hardening de auth aplicado (logout invalida refresh token + rate limiting en login/refresh).
- [x] Tag de release creado en git (`v0.1.0-rc.1`, local).

## Evidencia asociada
- QA run: `docs/test-evidence/qa-run-2026-03-04.md`
- Seguridad: `docs/test-evidence/security-checklist.md`
- Fase 6: `_docs/fase-6/checklist.md`

## Gate de salida
1. Publicar tag: `git push origin v0.1.0-rc.1`
2. Ejecutar pipeline CD con ese tag.
3. Validar despliegue y healthcheck en entorno objetivo.

## Decision actual
- El proyecto esta listo para generar **release candidato**.
- El tag local `v0.1.0-rc.1` apunta al commit `b942f7b`; para liberar cambios no comiteados se debe generar commit y retagear si corresponde.
- La liberacion final a produccion queda condicionada a publicar tag remoto y validar smoke en entorno destino.
