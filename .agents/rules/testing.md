# Testing

**Aplicación sugerida:** Auto Attached / Agent Requested.

- Añade pruebas cercanas al comportamiento cambiado: Vitest para utilidades del frontend y pytest para rutas y cálculos del backend. **Evidencia:** `frontend/src/lib/financial-utils.test.ts` y `backend/tests/test_routes.py` son las suites existentes.
- Para cambios en carga de datos, cubre éxito, error y respuesta vacía, además de las funciones puras. **Evidencia:** `frontend/src/App.tsx` gestiona estados de carga y error y hace `fetch`; las pruebas existentes de `frontend/src/lib/financial-utils.test.ts` se centran en funciones puras.
- Para filtros, agrupaciones y fechas, incluye límites y entradas vacías cuando sean válidas. **Evidencia:** `test_filter_movements_by_date_includes_range_edges` comprueba los extremos del filtro por fecha en `backend/tests/test_routes.py`.
- Comprueba el comportamiento de agregaciones con colecciones vacías. **Evidencia:** `test_build_metrics_facets_handles_empty_movements` cubre la respuesta vacía de `build_metrics_facets` en `backend/tests/test_routes.py`.
- Comprueba que los generadores deterministas no alteren estado global compartido. **Evidencia:** `test_generate_mock_movements_is_repeatable_without_changing_global_rng` en `backend/tests/test_routes.py` verifica repetibilidad y aislamiento del RNG.
- Ejecuta `npm test`, `npm run lint` y `npm run build` desde `frontend`; ejecuta `pytest` desde `backend`. **Evidencia:** esos scripts están declarados en `frontend/package.json` y las pruebas backend están bajo `backend/tests`.