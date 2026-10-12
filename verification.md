# Verification Record

Fecha de revisión: 2026-10-08. Este documento registra evidencia comprobada en el código, las pruebas y Git. No presenta prioridades candidatas como roadmap aprobado.

## Fase 1 — Comprensión del proyecto

- Se revisaron los README, `AGENTS.md`, Compose, los puntos de entrada de frontend/backend, tipos, cálculos y suites de pruebas.
- El producto es un dashboard financiero con indicadores y gráficos; la UI carga `GET /api/metrics` y calcula KPIs/gráficos en frontend (`frontend/src/App.tsx`, `frontend/src/lib/financial-utils.ts`). La API ofrece además rutas de resumen, comparación, alertas y categorías (`backend/app/routes.py`).
- La muestra es generada con `generate_mock_movements(seed=42)`; no hay base de datos ni persistencia (`backend/app/routes.py`).
- El flujo documentado es Docker Compose. Durante la sesión, `docker compose ps` mostró frontend en `5173` y backend en `8000`; `GET /health` respondió `{"status":"ok"}`.
- El resumen verificable de producto, stack, comportamiento y gaps está en `memory-bank/project-overview.md` y `readme.afva.md`.

## Fase 2 — Hallazgos de ingeniería y reglas

Los hallazgos se contrastaron con código antes de convertirlos en reglas:

- `build_metrics_facets` indexaba el primer y último movimiento sin contemplar una lista vacía (`backend/app/routes.py`).
- `generate_mock_movements` usaba `random.seed`, que cambia el estado aleatorio global (`backend/app/routes.py`).
- CORS permitía cualquier origen y el Compose normal exponía debugpy (`backend/app/main.py`, `backend/Dockerfile`, `docker-compose.yml`).
- Los modelos API del backend y los tipos TS del frontend se mantienen por separado (`backend/app/routes.py`, `frontend/src/lib/financial-types.ts`).

Las reglas accionables, agrupadas y respaldadas por evidencia están en `.agents/rules/`; el índice es `.agents/rules/project-conventions.md`.

## Fase 3 — Implementación y validación

- Las facetas ahora devuelven listas vacías y fechas nulas si no hay movimientos; el generador usa un `random.Random` local (`backend/app/routes.py`).
- CORS no permite orígenes por defecto y las credenciales están desactivadas (`backend/app/main.py`). El Compose normal no inicia debugpy; `docker-compose.debug.yml` lo habilita bajo demanda, enlazado a loopback.
- Se añadieron pruebas de regresión para lista vacía, aislamiento del RNG y CORS (`backend/tests/test_routes.py`).
- El periodo del dashboard se deriva de las fechas devueltas por la API, y se eliminó el mock frontend que no tenía consumidores (`frontend/src/App.tsx`, `frontend/src/lib/financial-utils.ts`, `frontend/src/lib/financial-utils.test.ts`).
- Se validaron reglas con una tarea real: sus hallazgos de vacíos, estado global aleatorio y exposición CORS/debug se convirtieron en cambios de código y pruebas.

### Verificaciones ejecutadas

- Backend: `docker compose run --build --rm backend pytest` — 18 pruebas pasaron.
- Frontend: `npm test` — 7 pruebas pasaron; `npm run lint` pasó; `npm run build` pasó.
- Compose: `docker compose config` validó el modo normal sin puerto `5678` y el override con `5678` enlazado a `127.0.0.1`.
- Avisos no bloqueantes: Starlette advierte de la futura deprecación de `TestClient` con `httpx`; Vite advierte que el bundle supera 500 kB.

## Fase 4 — Memoria del proyecto

`memory-bank/project-overview.md` registra producto, stack, estado actual, gaps y prioridades candidatas, todos enlazados a evidencia del repo. Las prioridades están marcadas como propuestas que requieren decisión de producto, no como roadmap.

## Historial de commits

| Commit | Contenido comprobado |
|---|---|
| `dc1b642` | Cambios del frontend: periodo dinámico, pruebas de utilidades y eliminación de `mock-data.ts`. Su mensaje dice que organizó reglas, pero el diff no contiene `.agents/rules`. |
| `23b65a5` | Commit dedicado de memoria: solo `memory-bank/project-overview.md`. |
| `efa1121` | Commit dedicado de reglas: ocho archivos bajo `.agents/rules/`. |
| `8559bdf` | README español/AFVA y archivos de instalación/debug; mezcla documentación y configuración. |
| `c87f3a5` | Backend, pruebas, lock de Python y Compose; implementa mitigaciones. |

`1241c6a` también aparece en el historial, pero su diff es solo un cambio de fin de línea en `frontend/tsconfig.node.json`; no es evidencia de una fase de ingeniería.

La secuencia tiene commits dedicados para memoria y reglas, y commits separados para frontend y backend. No es una separación perfectamente ordenada de cuatro commits, y algunos mensajes (en particular `dc1b642`) no describen fielmente su contenido; se documenta aquí en vez de ocultarlo.

En la última comprobación, `develop1` estaba limpia y sincronizada con `origin/develop1` en `c87f3a5`.

## Alcance no verificado

- La URL remota observada es `https://github.com/4GeeksAcademy/ai-eng-context-project-afva`. El remoto local confirma dónde se publica la rama, pero no demuestra por sí solo que el repositorio sea un fork; para certificarlo, hay que comprobar en GitHub la relación “Forked from”.
- La revisión y corrección asistida se hizo durante la sesión. Este archivo aporta el rastro técnico disponible en el repo; la aprobación humana final sigue siendo responsabilidad del contribuidor.

## Sesión de trabajo — 2026-10-12: Specs y mejoras del dashboard

En esta sesión se revisaron en Swagger (`/docs`) los contratos del backend frente a las tres funcionalidades solicitadas. El trabajo fue de análisis; no se implementaron cambios en la API ni en el dashboard.

### Contraste de requisitos con el API y aclaraciones de la spec

El frontend usa un patrón local de `fetch` en `App.tsx`: construye la URL con `VITE_API_BASE_URL`, comprueba `response.ok` y representa estados de carga y error. No hay un cliente HTTP compartido. Actualmente solo se consume `GET /api/metrics`.

| Funcionalidad | Requisito de PM | API y datos actuales | Wording acordado para la spec |
|---|---|---|---|
| Rango de fechas | Dos fechas opcionales `YYYY-MM-DD`; mostrar el intervalo disponible y filtrar todos los datos actuales. | `GET /api/metrics` acepta `start_date` y `end_date`; compara ambos extremos de forma inclusiva. `GET /api/metrics/facets` devuelve `min_date` y `max_date`. | Enviar solo los parámetros no vacíos; obtener el intervalo de referencia de `facets`. Calcular KPI y gráficos a partir de los movimientos filtrados que devuelve `/api/metrics`. |
| Alertas | Mostrar outcome, media móvil de los tres períodos previos e incremento porcentual. Umbral entre `0.01` y `1.0`, por defecto `0.3`. | `GET /api/metrics/alerts` acepta fechas y `threshold` desde `0`, sin máximo. Responde `period`, `outcome_total`, `baseline_average` e `increase_ratio`. La media de referencia usa todos los períodos anteriores del rango, no solo los tres anteriores. | Para alinearse con el comportamiento disponible, la columna se denomina “media de los períodos anteriores del rango”. El control de UI limita el ratio a `0.01–1.0`; el incremento mostrado es `increase_ratio × 100`. Mantener el mensaje de estado vacío solicitado. |
| Comparativa B2B/B2C | Mostrar las cinco categorías de ingreso principales por grupo, importe y porcentaje; comparar ingresos totales y permitir filtrar por fechas. | `/api/metrics/categories/top` acepta `operation_type`, `limit`, fechas y `business_type`; devuelve `category`, `operation_type` y `total_amount`, sin porcentaje ni total del grupo. `/api/metrics/facets` devuelve categorías globales. La muestra genera ingresos solo en `sales` y `others`. | Especificar “hasta cinco categorías de ingreso disponibles”, sin completar categorías inexistentes. Usar `total_amount` para el importe y calcular su porcentaje sobre la suma de `income` de `/api/metrics/summary` filtrada por `business_type` y fechas. Comparar esas sumas en el gráfico. |

Las aclaraciones anteriores resuelven las discrepancias de wording respecto al contrato y al dataset actuales; no describen cambios implementados. Los endpoints analíticos existen, pero aún deben conectarse al dashboard y cubrirse con pruebas.

## Seguimiento de implementación — 2026-10-12: Dashboard (fase 2)

Esta sesión implementó en el frontend las funcionalidades descritas en la sesión de análisis anterior, respetando el contrato actual del backend. No se modificó el backend.

- Se añadieron los tipos de respuesta y query params de fase 2 en `frontend/specs/api-types.ts` y `frontend/specs/param-types.ts`; `App` los usa para las consultas de alertas y categorías.
- El dashboard principal obtiene facets y muestra el intervalo disponible. Las fechas opcionales se envían como `start_date` y `end_date`; los KPI y gráficos se calculan con los movimientos filtrados y el mismo rango se aplica a las alertas.
- Se añadió la tabla de anomalías con outcome, baseline, ratio mostrado como porcentaje y estado vacío. El control limita el ratio a `0.01–1.0`; el baseline mantiene la semántica existente de media de todos los períodos previos en el rango.
- Se añadió navegación local a la vista B2B/B2C, con rango independiente, tablas de categorías por segmento y un gráfico único. Los porcentajes se calculan sobre ingresos derivados de los movimientos B2B/B2C; se muestran solo las categorías devueltas por el API, hasta cinco.
- Se añadieron pruebas para omitir filtros vacíos y sumar solo movimientos de ingreso (`frontend/src/lib/api-utils.test.ts`).

### Verificaciones de la fase 2

- Frontend: `npm test` — 10 pruebas pasaron; `npm run lint` pasó; `npm run build` pasó.
- API en ejecución: la página del frontend, `/api/metrics/facets`, `/api/metrics/alerts` y `/api/metrics/categories/top` para B2B respondieron HTTP 200.
- Vite mantiene el aviso de bundle superior a 500 kB; no impidió el build.