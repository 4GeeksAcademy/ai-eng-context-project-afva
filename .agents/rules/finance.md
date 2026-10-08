# Financial Data

**Aplicación sugerida:** Auto Attached.

- Antes de usar importes reales, define moneda y precisión; evita heredar el uso de coma flotante sin evaluar el redondeo. **Evidencia:** `amount` es `float` en `backend/app/routes.py` y `number` en `frontend/src/lib/financial-types.ts`.
- No ocultes precisión monetaria sin una decisión explícita de producto. **Evidencia:** `formatCurrency` en `frontend/src/lib/financial-utils.ts` presenta USD con cero decimales aunque los importes de muestra incluyen centavos.