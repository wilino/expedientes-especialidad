# Frontend baseline - 2026-03-05

Fecha: 2026-03-05 00:34 -04  
Proyecto: `apps/web`  
Ambiente: `vite preview` local en `http://127.0.0.1:4173`

## 1) Contexto de medicion
- Build ejecutado: `npm -w apps/web run build`
- Bundle generado:
  - `dist/assets/index-DbeihGCI.js`: 307.21 kB (gzip 95.08 kB)
  - `dist/assets/index-DnBQT9Km.css`: 4.40 kB (gzip 1.61 kB)
- Lighthouse ejecutado sobre:
  - `/login`
  - `/`

Comandos:
```bash
npm -w apps/web run build
npm -w apps/web run preview -- --host 127.0.0.1 --port 4173
npx --yes lighthouse http://127.0.0.1:4173/login --chrome-flags='--headless --no-sandbox --disable-dev-shm-usage' --output=json --output-path=docs/test-evidence/lighthouse/login-2026-03-05.json --quiet
npx --yes lighthouse http://127.0.0.1:4173/ --chrome-flags='--headless --no-sandbox --disable-dev-shm-usage' --output=json --output-path=docs/test-evidence/lighthouse/root-2026-03-05.json --quiet
```

## 2) Resultados Lighthouse
| Ruta | Performance | Accessibility | Best Practices | SEO | FCP | LCP | CLS | TBT | Speed Index |
|---|---:|---:|---:|---:|---|---|---|---|---|
| `/login` | 84 | 96 | 100 | 82 | 3.4 s | 3.4 s | 0 | 0 ms | 3.4 s |
| `/` | 83 | 96 | 100 | 82 | 3.6 s | 3.6 s | 0 | 0 ms | 3.6 s |

Archivos:
- `docs/test-evidence/lighthouse/login-2026-03-05.json`
- `docs/test-evidence/lighthouse/root-2026-03-05.json`

## 3) Errores de consola y red (baseline)
- `errors-in-console`: score `1` en ambas rutas (sin errores detectados por Lighthouse).
- Requests de red observadas por audit: `7` por ruta.
- Requests fallidas (`status >= 400`): `0`.

## 4) Observaciones
- Accesibilidad y buenas practicas parten con baseline alto.
- Performance inicial es aceptable, con oportunidad de mejora (FCP/LCP ~3.4-3.6s en entorno local).
- El baseline fue tomado en una corrida local unica; para tendencia se requiere repetir en CI con entorno estable.

## 5) Uso de esta linea base
Este baseline se usara para comparar mejoras en:
1. Migracion de layout (Fase 2).
2. Migracion de pantallas y code splitting (Fase 3).
3. Optimizacion final de rendimiento (Fase 5).
