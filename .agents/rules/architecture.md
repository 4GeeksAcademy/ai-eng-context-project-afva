# Architecture

**Aplicación sugerida:** Agent Requested / Auto Attached.

- Mantén una fuente de datos autoritativa por flujo; no dupliques datos de aplicación como fixtures de producción. **Evidencia:** el dashboard consume `/api/metrics`, que usa `generate_mock_movements(seed=42)` en `backend/app/routes.py`.
- Mantén los cálculos en funciones que puedan probarse por separado de los handlers HTTP. **Evidencia:** `filter_movements`, `summarize_movements` y `calculate_net_value` son funciones llamadas por rutas en `backend/app/routes.py`.
- Define un resultado explícito para colecciones vacías en operaciones que obtienen extremos o agregados. **Evidencia:** `build_metrics_facets` devuelve listas vacías y fechas `None` cuando no hay movimientos en `backend/app/routes.py`.
- Si se incorpora una fuente de datos real, separa su acceso de las rutas y deja explícito qué fuente usa cada endpoint. **Evidencia:** los endpoints actuales llaman directamente a `generate_mock_movements` en `backend/app/routes.py`.