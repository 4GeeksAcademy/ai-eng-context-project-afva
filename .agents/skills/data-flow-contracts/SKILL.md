---
name: data-flow-contracts
description: Audita un flujo concreto de datos entre etapas y límites del sistema para verificar que la forma, los tipos, el formato y el significado se conservan desde el origen hasta el consumidor. Úsala al investigar errores de integración, discrepancias entre frontend y backend, serialización, transformaciones o contratos de API.
---

# Data Flow Contracts

## Objetivo

Verificar que los datos que produce una etapa cumplen el contrato que espera la siguiente, y que cualquier transformación conserva el formato y el significado requeridos hasta el consumidor final. Basa cada conclusión en el código, las pruebas o una observación de ejecución disponibles.

## Alcance

- Sigue un flujo específico: `origen -> transformación -> frontera -> consumidor`.
- Incluye solo las etapas necesarias para explicar ese flujo y el comportamiento reportado.
- Comprueba, cuando corresponda, nombres de campos, estructura, tipos, opcionalidad, valores permitidos, restricciones, formatos, unidades, precisión y semántica.
- En límites entre procesos o tecnologías, comprueba explícitamente la serialización y la interpretación del dato.
- Distingue validación estática de validación en ejecución. Un tipo TypeScript, una anotación o un genérico de `fetch` no demuestran por sí solos que la respuesta real cumple el contrato.

No conviertas la revisión en una auditoría general de logging, observabilidad, seguridad o rendimiento. No supongas que existen colas, trazas, bases de datos ni infraestructura que no aparezcan en la ruta examinada. No fuerces cambios de arquitectura ni añadas dependencias para completar la auditoría.

## Entradas

- **Flujo o síntoma:** endpoint, campo, transformación, consumidor o discrepancia que se quiere revisar. Si no se especifica, identifica una ruta real a partir del comportamiento descrito y declara el alcance elegido.
- **Contrato esperado:** formatos o reglas de negocio proporcionados por el usuario o documentados en el repositorio. Si no están definidos, no los inventes; registra esa limitación.
- **Evidencia disponible:** código, esquemas, pruebas y, cuando existan y sean pertinentes, respuestas observadas o registros aportados. No exijas instrumentación nueva para empezar.

Si falta un dato no esencial, continúa con evidencia del repositorio y anota la incertidumbre. Si la solicitud no permite distinguir entre flujos con conclusiones materialmente distintas, pide una aclaración concreta antes de concluir.

## Procedimiento

1. Delimita el dato y el resultado esperado a partir de la solicitud. Si hay varias rutas posibles, elige la ruta real más cercana al síntoma y declara ese alcance.
2. Localiza el origen y sigue sus usos hasta el consumidor, incluidos los mapeos, cálculos, validadores y serializadores que afecten al dato. Usa las reglas del repositorio y pruebas cercanas cuando apliquen.
3. En cada frontera, compara lo que entrega la etapa anterior con lo que acepta la siguiente. Revisa tanto la forma como el significado; por ejemplo, no trates `null` y campo ausente como equivalentes, ni fechas, porcentajes, importes o unidades como intercambiables sin evidencia.
4. Busca validación ejecutable y pruebas que ejerzan el flujo. Identifica qué garantiza cada mecanismo y qué deja sin comprobar. No presentes inferencias estáticas como una observación de runtime.
5. Clasifica cada discrepancia como **fallo confirmado**, **riesgo** o **sin discrepancia observada**. Un fallo confirmado requiere evidencia directa de incompatibilidad; un riesgo describe una ruta plausible que no está validada o probada. No eleves una ausencia de pruebas a fallo demostrado.
6. Si se solicita una corrección, cambia el contrato en su punto propietario y actualiza consumidores y pruebas afectados según las convenciones existentes. Mantén la corrección dentro del flujo examinado.

## Evidencia e informe

Entrega un resumen breve con:

- **Flujo revisado:** origen, fronteras y consumidor reales.
- **Hallazgos:** primero fallos confirmados, después riesgos; para cada uno indica dato/campo, contrato esperado y observado, impacto, evidencia concreta y archivo/ruta relevante.
- **Validación:** pruebas, validadores o comprobaciones de ejecución consultados y qué demuestran.
- **Límites:** etapas no observables o aspectos que no se pudieron verificar.

Si no encuentras defectos, dilo explícitamente y separa esa conclusión de cualquier riesgo pendiente. Cita evidencia precisa; no inventes contratos, requisitos de negocio, rutas ni comportamiento runtime. No hagas cambios si solo se pidió una auditoría.

## Criterios de aceptación

La auditoría está completa cuando:

- el recorrido analizado corresponde al flujo real y termina en el consumidor relevante;
- cada frontera examinada tiene productor y consumidor identificados;
- las discrepancias se apoyan en evidencia y se distinguen de las lagunas de cobertura;
- se informa qué validaciones son estáticas, de ejecución o de prueba;
- el alcance y las limitaciones quedan claros, sin conclusiones más amplias que la evidencia.
