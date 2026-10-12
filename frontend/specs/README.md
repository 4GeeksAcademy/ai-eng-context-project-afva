# Contrato de datos del dashboard

## 1. Introducción

Este documento describe los datos que consumen las tres funcionalidades del dashboard: referencia de facetas y fechas, alertas de gasto y comparación de categorías de ingreso B2B/B2C. Sirve para identificar qué endpoint consultar, qué parámetros enviar, qué respuesta esperar y cómo se comporta la interfaz ante respuestas vacías o errores.

Los contratos TypeScript están en:

- [`api-types.ts`](./api-types.ts): esquemas de respuesta `FacetsResponse`, `AlertEntry`, `AlertsResponse`, `CategoryEntry` y `TopCategoriesResponse`, además de los enums de dominio.
- [`param-types.ts`](./param-types.ts): parámetros de consulta `DateRangeFilter`, `AlertsParams` y `TopCategoriesParams`.

La fuente de verdad del contrato de transporte es OpenAPI servido por FastAPI en [`/docs`](http://localhost:8000/docs) (esquema OpenAPI en `/openapi.json`), contrastado con los modelos Pydantic y las firmas de [backend/app/routes.py](../../backend/app/routes.py). La interfaz actual se comprobó en [App.tsx](../src/App.tsx) y los componentes de filtros, alertas y comparativa. El backend genera movimientos simulados deterministas; no hay persistencia.

Los ejemplos de casos límite de este documento se comprobaron contra el backend activo. Los estados de interfaz descritos como confirmados se basan en el frontend actual. Un `200` con una lista vacía es una respuesta válida, no un error HTTP.

## 2. Funcionalidad 1: Facets y rango de fechas

### Objetivo y petición

`facets` proporciona los valores globales disponibles y las fechas mínima y máxima del dataset. La interfaz muestra estas fechas junto a los controles y los usa como límites. Al cambiar el filtro en cualquiera de las pestañas, el mismo rango compartido se envía a las consultas de métricas, alertas, categorías y movimientos B2B/B2C.

| Elemento | Contrato |
|---|---|
| Endpoint de facetas | `GET /api/metrics/facets` |
| Query params de facetas | Ninguno |
| Respuesta | `FacetsResponse` |
| Endpoint filtrado del dashboard | `GET /api/metrics` |
| Filtro de fechas | `DateRangeFilter`: `start_date?`, `end_date?` |
| Formato | Fechas ISO `YYYY-MM-DD`; cada extremo es inclusivo en el backend |
| Rango vacío | Omitir la clave vacía de la query; si ambas están vacías se pide el dataset completo |

`FacetsResponse` tiene estas propiedades, todas requeridas en la respuesta:

| Propiedad | Tipo | Significado y valores respaldados |
|---|---|---|
| `operation_types` | `OperationType[]` | Tipos presentes: `income`, `outcome` |
| `business_types` | `BusinessType[]` | Segmentos presentes: `B2B`, `B2C` |
| `categories` | `Category[]` | Categorías globales: `suppliers`, `sales`, `operational`, `administrative`, `others`; no se segmentan por negocio |
| `min_date` | `string \| null` | Fecha más antigua en formato ISO; `null` si la colección que procesa la función está vacía |
| `max_date` | `string \| null` | Fecha más reciente en formato ISO; `null` si la colección que procesa la función está vacía |

Aunque `min_date` y `max_date` permiten `null`, no son propiedades opcionales: OpenAPI las declara requeridas. La ruta actual genera 360 movimientos con `seed=42`, por lo que su respuesta normal contiene fechas; la rama sin movimientos está cubierta por la prueba de `build_metrics_facets([])`.

### Casos límite

| Caso límite | Respuesta de la API | Comportamiento esperado de la UI | Fuente |
|---|---|---|---|
| La función de facetas recibe cero movimientos | El helper devuelve las tres listas vacías y ambas fechas como `null`. La ruta HTTP actual genera movimientos y no produce este caso por sí sola. | Si la respuesta contiene límites nulos, `DateRangeFilter` deshabilita los inputs y muestra `no data`. | [routes.py](../../backend/app/routes.py), [test_routes.py](../../backend/tests/test_routes.py), [date-range-filter.tsx](../src/components/dashboard/date-range-filter.tsx) |
| El rango válido no contiene movimientos (comprobado con 2099-01-01 a 2099-01-31) | `GET /api/metrics` responde `200` con `[]`; `facets` sigue describiendo el dataset completo. | Los KPI se calculan con totales cero; el período indica `No data` y los gráficos muestran su estado vacío. | [routes.py](../../backend/app/routes.py), [App.tsx](../src/App.tsx), [financial-utils.ts](../src/lib/financial-utils.ts), componentes de gráficos |
| Query de fecha malformada | FastAPI responde `422` con el esquema OpenAPI `HTTPValidationError` al validar `start_date`/`end_date`; no se genera una respuesta de movimientos válida. | El `fetch` no exitoso se convierte en el mensaje genérico de error de métricas. Los controles HTML ofrecen fechas acotadas, pero el cliente no interpreta el detalle de validación del `422`. | OpenAPI, [routes.py](../../backend/app/routes.py), [App.tsx](../src/App.tsx), [date-range-filter.tsx](../src/components/dashboard/date-range-filter.tsx) |
| Error al cargar facets | La respuesta depende del error HTTP/transporte; OpenAPI no define un esquema de error para esta ruta. | `App` muestra una alerta de error. Como `facets` sigue siendo `null`, los inputs permanecen deshabilitados y el texto del componente sigue siendo `Loading available range...`. No hay reintento automático documentado. | [App.tsx](../src/App.tsx), [date-range-filter.tsx](../src/components/dashboard/date-range-filter.tsx) |

El rango compartido evita que la vista general y la comparativa usen períodos distintos. `facets.categories` es una lista global; para obtener categorías por segmento se consulta `GET /api/metrics/categories/top` con `business_type`.

## 3. Funcionalidad 2: Alerts

### Objetivo y petición

El endpoint agrupa los movimientos por período y devuelve los períodos cuyo gasto supera el umbral solicitado. El dashboard usa la tabla para mostrar outcome registrado, baseline e incremento.

| Elemento | Contrato |
|---|---|
| Endpoint | `GET /api/metrics/alerts` |
| Tipo de respuesta | `AlertsResponse` (`AlertEntry[]`) |
| Params TypeScript | `AlertsParams extends DateRangeFilter` |

Todos los query params son opcionales en OpenAPI:

| Parámetro | Tipo OpenAPI / TypeScript | Default y restricciones |
|---|---|---|
| `threshold` | `number` | Default `0.3`; mínimo `0`; OpenAPI no define máximo |
| `group_by` | `"day" \| "week" \| "month"` | Default `"month"` |
| `start_date` | fecha o ausente | ISO `YYYY-MM-DD`; filtro inclusivo |
| `end_date` | fecha o ausente | ISO `YYYY-MM-DD`; filtro inclusivo |
| `business_type` | `"B2B" \| "B2C"` o ausente | Sin default |

La UI actual inicia `threshold` en `0.3`, limita el control visual a `0.01–1.0` y envía `threshold`, `start_date` y `end_date`; no envía `group_by` ni `business_type`, por lo que el backend agrupa por mes y considera ambos segmentos. Este límite visual es una restricción de UI, no una restricción completa del endpoint.

### Respuesta

`AlertsResponse` es un array que puede estar vacío. Cada `AlertEntry` tiene todas estas propiedades requeridas y no anulables:

| Propiedad | Tipo | Significado |
|---|---|---|
| `period` | `string` | Clave del período: fecha ISO para `day`, `YYYY-Www` para `week`, `YYYY-MM` para `month` (formatos derivados del código; OpenAPI solo lo tipa como string) |
| `outcome_total` | `number` | Suma de outcome del período, redondeada a dos decimales |
| `baseline_average` | `number` | Media de outcome de todos los períodos anteriores en la serie filtrada, redondeada a dos decimales; no es una ventana móvil de tres períodos |
| `increase_ratio` | `number` | Ratio `(outcome_total - baseline_average) / baseline_average`, redondeado a cuatro decimales; la tabla lo multiplica por 100 para mostrar porcentaje |

La serie se filtra por fechas y, si se envía, por negocio antes del cálculo. Un período solo se devuelve cuando existe al menos un período histórico con baseline positivo y el ratio es **estrictamente mayor** que `threshold`.

### Casos límite

| Caso límite | Respuesta de la API | Comportamiento esperado de la UI | Fuente |
|---|---|---|---|
| El rango no contiene registros (comprobado con fechas de 2099) | `200 []` | La tabla muestra `No spending anomalies found for this range and threshold.` | [routes.py](../../backend/app/routes.py), [anomaly-alerts-table.tsx](../src/components/dashboard/anomaly-alerts-table.tsx) |
| Hay un solo período en la serie filtrada, o ningún período previo con baseline positivo | `200 []`: el algoritmo no genera alerta sin períodos anteriores y baseline positivo. | La tabla muestra el mismo estado vacío explícito. | `detect_outcome_alerts` en [routes.py](../../backend/app/routes.py), [anomaly-alerts-table.tsx](../src/components/dashboard/anomaly-alerts-table.tsx) |
| `threshold < 0` | FastAPI responde `422` con el esquema `HTTPValidationError` (comprobado con `-0.01`). | `App` muestra `Could not load spending anomalies from the API.`; la UI no muestra el cuerpo de validación. El control normal limita valores a `0.01–1.0`. | OpenAPI, [routes.py](../../backend/app/routes.py), [App.tsx](../src/App.tsx), [anomaly-alerts-table.tsx](../src/components/dashboard/anomaly-alerts-table.tsx) |
| `group_by` fuera del enum o fecha inválida | FastAPI responde `422` con `HTTPValidationError`; se comprobó `group_by=year`. | `App` muestra el error genérico de alertas. Mostrar el detalle de validación del servidor está pendiente de definir. | OpenAPI, [routes.py](../../backend/app/routes.py), [App.tsx](../src/App.tsx) |

El endpoint no impone el máximo `1.0` ni el mínimo visual `0.01`. Si se usa un cliente distinto de la UI, el contrato documentado permite ratios desde cero sin máximo.

## 4. Funcionalidad 3: Top Categories B2B/B2C

### Objetivo y petición

Se consulta el ranking de ingresos por separado para `B2B` y `B2C`. La vista actual usa también los endpoints de movimientos de cada segmento para calcular el total de ingresos del grupo y el gráfico comparativo; `facets` aporta categorías globales, no categorías por grupo.

| Elemento | Contrato |
|---|---|
| Endpoint de categorías | `GET /api/metrics/categories/top` |
| Endpoints auxiliares del total de grupo | `GET /api/metrics/b2b` y `GET /api/metrics/b2c` |
| Respuesta de categorías | `TopCategoriesResponse` (`CategoryEntry[]`) |
| Respuesta auxiliar | Array de `FinancialMovement` |
| Params TypeScript | `TopCategoriesParams extends DateRangeFilter` |

Todos los params de `/api/metrics/categories/top` son opcionales:

| Parámetro | Tipo OpenAPI / TypeScript | Default y restricciones |
|---|---|---|
| `operation_type` | `"income" \| "outcome"` | Default `"outcome"`; la vista envía explícitamente `"income"` |
| `limit` | entero / `number` | Default `5`; mínimo `1`, máximo `20` |
| `start_date` | fecha o ausente | ISO `YYYY-MM-DD`; inclusiva |
| `end_date` | fecha o ausente | ISO `YYYY-MM-DD`; inclusiva |
| `business_type` | `"B2B" \| "B2C"` o ausente | Sin default; la vista envía uno por llamada |

`TopCategoriesParams` incluye `business_type`, aunque la lista abreviada original de la tarea solo nombraba operación, límite y fechas. Es un parámetro real de OpenAPI y es necesario para separar los dos rankings.

### Respuesta y cálculo de la vista

`TopCategoriesResponse` es un array que puede estar vacío. Cada `CategoryEntry` tiene propiedades requeridas y no anulables:

| Propiedad | Tipo | Significado |
|---|---|---|
| `category` | `Category` | `suppliers`, `sales`, `operational`, `administrative` o `others` |
| `operation_type` | `OperationType` | `income` u `outcome` |
| `total_amount` | `number` | Suma por categoría y tipo de operación después de filtros; redondeada a dos decimales |

El backend ordena los resultados por `total_amount` descendente y devuelve hasta `limit` elementos. El dataset simulado genera ingresos solo en `sales` y `others`; puede devolver menos de cinco categorías y no se deben inventar filas para completar el límite.

La vista actual suma `amount` de los movimientos con `operation_type === "income"` obtenidos de `/api/metrics/b2b` y `/api/metrics/b2c`. Calcula el porcentaje de cada categoría como `total_amount / ingreso_total_del_grupo * 100`; si el total del grupo es cero muestra `—`. La comparativa usa el mismo `start_date`/`end_date` que la vista general.

### Casos límite

| Caso límite | Respuesta de la API | Comportamiento esperado de la UI | Fuente |
|---|---|---|---|
| Rango sin ingresos para un segmento (comprobado con B2B y fechas de 2099) | `200 []` en categorías; el endpoint de movimientos del grupo devuelve `200 []`. | La tabla de ese grupo muestra `No income categories available for this range.`. Si ambos totales son cero, el gráfico muestra `No income available for this range.` | [routes.py](../../backend/app/routes.py), [business-comparison-view.tsx](../src/components/dashboard/business-comparison-view.tsx) |
| Un segmento no tiene categorías en el rango, el otro sí | El ranking vacío es `[]`; el otro ranking conserva sus entradas disponibles. | Cada tabla muestra sus propios registros o su estado vacío, respectivamente; no se rellenan categorías artificiales. | `build_top_categories` en [routes.py](../../backend/app/routes.py), [business-comparison-view.tsx](../src/components/dashboard/business-comparison-view.tsx) |
| `limit` es `0` o `21` | FastAPI responde `422` con `HTTPValidationError` (se comprobaron ambos límites). | `Promise.all` rechaza la carga comparativa; `App` presenta `Could not load the B2B vs. B2C comparison.` y sustituye los datos de comparación por arrays/totales vacíos. El detalle del `422` no se muestra. | OpenAPI, [routes.py](../../backend/app/routes.py), [App.tsx](../src/App.tsx) |
| Alguna petición de categorías o movimientos falla | Los parámetros inválidos tienen `422` con `HTTPValidationError`; OpenAPI no define un esquema general común para fallos de transporte o servidor. | Al fallar cualquiera de las cuatro peticiones paralelas, la vista muestra el error genérico de comparación y estados vacíos. Un mensaje que identifique cuál endpoint falló está pendiente de definir. | OpenAPI, [App.tsx](../src/App.tsx), [business-comparison-view.tsx](../src/components/dashboard/business-comparison-view.tsx) |

## 5. Consistencia y límites de los tipos

- Las rutas, nombres de propiedades, campos requeridos, enums y nulabilidad de las respuestas en `api-types.ts` coinciden con OpenAPI y los modelos Pydantic revisados. No se encontraron discrepancias de estructura.
- Los nombres y tipos básicos de query params en `param-types.ts` coinciden con OpenAPI; todos son opcionales, incluidos `group_by` y `business_type` en alerts y `business_type` en top categories.
- TypeScript define fechas como `string`, `limit` como `number` y `threshold` como `number`. Los comentarios JSDoc documentan formato, integralidad y límites, pero el sistema de tipos no los impone estáticamente. FastAPI valida los valores en runtime y responde `422` ante entradas inválidas comprobadas.
- OpenAPI solo define `MetricsAlert.period` como `string`; los formatos concretos se derivan de la función de agrupación del backend. No se aplica validación de formato de período en el cliente.
- La UI muestra mensajes genéricos para errores HTTP. Presentar el detalle de validación (`422`), permitir reintentos de carga de facets y distinguir mejor un error de carga del texto `Loading available range...` no está definido en los requisitos actuales.

## 6. Archivos de referencia

- [OpenAPI / Swagger UI](http://localhost:8000/docs)
- [Rutas y modelos Pydantic](../../backend/app/routes.py)
- [Tipos de respuesta TypeScript](./api-types.ts)
- [Tipos de parámetros TypeScript](./param-types.ts)
- [Integración y estados de carga/error](../src/App.tsx)
- [Filtro de rango de fechas](../src/components/dashboard/date-range-filter.tsx)
- [Tabla de alertas](../src/components/dashboard/anomaly-alerts-table.tsx)
- [Vista de comparación](../src/components/dashboard/business-comparison-view.tsx)