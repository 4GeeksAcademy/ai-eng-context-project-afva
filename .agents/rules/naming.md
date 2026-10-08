# Naming and API Contracts

**Aplicación sugerida:** Auto Attached.

- Mantén sincronizados los modelos Pydantic y los tipos TypeScript cuando cambie un campo o valor permitido. **Evidencia:** `FinancialMovement` y los `Literal` de `backend/app/routes.py` tienen sus equivalentes en `frontend/src/lib/financial-types.ts`.
- Conserva los nombres JSON del backend al consumir la API; no los renombres de forma unilateral en el frontend. **Evidencia:** el backend expone campos como `create_date` y `operation_type`, y TypeScript los declara con el mismo nombre en `frontend/src/lib/financial-types.ts`.
- Cuando cambies un contrato, actualiza las pruebas de ambos lados en el mismo cambio. **Evidencia:** la respuesta del endpoint se valida con modelos Pydantic, mientras que los tests de `frontend/src/lib/financial-utils.test.ts` construyen objetos `FinancialMovement`.