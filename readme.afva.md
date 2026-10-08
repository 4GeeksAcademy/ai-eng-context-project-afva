# Financial Metrics Dashboard (AFVA)

Panel de métricas financieras con una interfaz React y una API FastAPI. El repositorio está preparado para desarrollo local con Docker Compose.

> Para las instrucciones generales de 4Geeks, consulta [readme.4geeks.md](./readme.4geeks.md). La versión inglesa de la guía general está en [README.md](./README.md).

## Contenido

- [Funcionalidad](#funcionalidad)
- [Arquitectura](#arquitectura)
- [Requisitos](#requisitos)
- [Ejecución con Docker](#ejecución-con-docker)
- [Configuración](#configuración)
- [API](#api)
- [Pruebas y calidad](#pruebas-y-calidad)
- [Estructura](#estructura)
- [Contribuir](#contribuir)

## Funcionalidad

- Indicadores de ingresos, gastos, beneficio y margen de beneficio.
- Gráficos mensuales de ingresos/gastos y margen.
- Movimientos ficticios generados por el backend para demostración.
- Endpoints de resumen, comparación, categorías principales, alertas y filtros B2B/B2C.

Los movimientos no provienen de una base de datos y no se persisten. La fuente de muestra es `generate_mock_movements(seed=42)` en `backend/app/routes.py`; el frontend consume `/api/metrics`. Las fechas se construyen con relación a la fecha actual.

## Arquitectura

- **Frontend:** React 19, TypeScript 6, Vite 8, Tailwind CSS y Recharts.
- **Backend:** Python 3.13, FastAPI, Pydantic y Uvicorn.
- **Comunicación local:** Vite reenvía `/api` al servicio Compose `backend:8000`.
- **Persistencia:** no hay base de datos.

## Requisitos

- Docker Engine y Docker Compose v2.
- Puertos locales `5173` y `8000` disponibles.

Para desarrollo sin Docker se necesitan Node.js 24 y Python 3.13; las imágenes Docker fijan esas versiones principales.

## Ejecución con Docker

Desde la raíz del repositorio:

```bash
docker compose up --build
```

Abre la aplicación desde el puerto `5173` (en Codespaces, usa **Ports → 5173 → Open in Browser**). La API está en el puerto `8000` y su documentación interactiva en `/docs`.

Para dejar los servicios en segundo plano:

```bash
docker compose up --build -d
```

Para detenerlos:

```bash
docker compose down
```

El Compose normal no expone el puerto de depuración. Para habilitar debugpy durante desarrollo local:

```bash
docker compose -f docker-compose.yml -f docker-compose.debug.yml up --build
```

El puerto `5678` de ese override queda enlazado a `127.0.0.1`.

## Configuración

- `VITE_API_BASE_URL` permite apuntar el frontend a una API distinta; consulta `frontend/.env.example`. Si no se define, se usa el proxy de Vite.
- `CORS_ALLOW_ORIGINS` acepta una lista separada por comas de orígenes permitidos. Por defecto está vacía; no abras CORS con `*` para despliegues.
- No guardes secretos en archivos versionados. `.gitignore` excluye `.env` y permite mantener ejemplos `.env.example`.

## API

La API valida respuestas con modelos Pydantic. Las fechas usan `YYYY-MM-DD` y los tipos/category admiten los valores indicados por sus modelos en `backend/app/routes.py`.

| Método y ruta | Uso |
|---|---|
| `GET /health` | Comprobar que el backend responde. |
| `GET /api/metrics` | Movimientos; acepta fechas, categoría y tipo de operación como filtros. |
| `GET /api/metrics/facets` | Valores disponibles para filtros y rango de fechas. |
| `GET /api/metrics/summary` | Totales por día, semana o mes; admite filtros. |
| `GET /api/metrics/categories/top` | Categorías principales por tipo de operación. |
| `GET /api/metrics/comparison` | Compara el neto entre dos periodos; requiere `start_date` y `end_date`. |
| `GET /api/metrics/alerts` | Detecta aumentos de gastos frente a la media anterior. |
| `GET /api/metrics/b2b` y `/api/metrics/b2c` | Movimientos filtrados por segmento de negocio. |

La referencia completa, parámetros y modelos se encuentran en `http://localhost:8000/docs` cuando se ejecuta en local.

## Pruebas y calidad

Frontend, desde `frontend/`:

```bash
npm ci
npm test
npm run lint
npm run build
```

Backend, desde la raíz usando Docker:

```bash
docker compose run --build --rm backend pytest
```

El build del frontend ejecuta TypeScript antes de generar los archivos de producción. Actualiza `frontend/package-lock.json` con npm cuando cambien dependencias. Para Python, declara dependencias directas en `backend/requirements.in` y regenera `backend/requirements.txt` con `pip-tools==7.6.2` bajo Python 3.13; el lock está fijado con hashes.

## Estructura

```text
backend/
  app/                 API, modelos, generación y cálculos
  tests/               pruebas pytest
frontend/
  src/components/      interfaz y gráficos
  src/lib/             tipos y utilidades financieras
  src/lib/*.test.ts    pruebas Vitest
.agents/rules/         convenciones propuestas para agentes
docker-compose.yml     servicios de desarrollo
docker-compose.debug.yml
```

## Contribuir

- Lee `AGENTS.md` y las reglas relevantes en `.agents/rules/` antes de cambiar código.
- Mantén sincronizados modelos Pydantic y tipos TypeScript cuando cambie el contrato de la API.
- Añade pruebas para cambios de comportamiento y actualiza esta guía cuando cambie la ejecución, configuración o API.
- No incluyas `node_modules`, `dist`, cachés, secretos ni cambios ajenos al objetivo del commit.