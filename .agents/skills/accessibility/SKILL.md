---
name: accessibility
description: Revisa componentes React del dashboard financiero aplicando mejores prácticas de accesibilidad web (WCAG 2.2 AA, WAI-ARIA). Evalúa estructura semántica, navegación por teclado, contraste de color, soporte de lectores de pantalla, y roles ARIA.
---

# Skill: Accessibility Review — Financial Dashboard

## Propósito

Esta skill revisa componentes React del proyecto Financial Metrics Dashboard para garantizar que cumplan con **WCAG 2.2 nivel AA** y las mejores prácticas de **WAI-ARIA**. Cada revisión detecta problemas reales de accesibilidad, explica por qué son un problema, y propone correcciones concretas adaptadas al código del componente.

## Criterios de revisión

Aplica estos criterios en orden al inspeccionar cualquier componente del frontend (`frontend/src/components/`).

### 1. Estructura semántica HTML

- **Landmarks**: ¿El componente usa elementos semánticos (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`) o `<div>`s genéricos?
- **Encabezados**: ¿Los títulos usan `<h1>`–`<h6>` con jerarquía correcta (sin saltos)?
- **Listas**: ¿Las listas de items usan `<ul>`/`<ol>` con `<li>` en lugar de `<div>`?
- **Tablas de datos**: ¿Usan `<table>`, `<th scope>`, `<caption>` o `aria-label` en lugar de `<div>` simulados?

### 2. Navegación por teclado

- **Orden de tabulación lógico**: `tabindex="0"` o implícito; evitar `tabindex > 0`.
- **Focus visible**: Todos los elementos interactivos deben tener `:focus-visible` (manejado por Tailwind o CSS).
- **Sin trampas de foco**: No debe haber elementos que capturen el foco sin posibilidad de salir.
- **Manejo de Enter/Escape**: Botones, inputs y elementos interactivos deben responder a teclas estándar.

### 3. Contraste y color

- **Texto normal**: relación de contraste ≥ 4.5:1 (WCAG AA).
- **Texto grande** (≥18px bold o ≥24px): ≥ 3:1.
- **Componentes gráficos** (barras, líneas, bordes): ≥ 3:1 contra el fondo adyacente.
- **No solo color**: No usar color como única forma de transmitir información (ej: gráficos deben tener patrones o etiquetas además del color).

### 4. Soporte para lectores de pantalla

- **`aria-label` / `aria-labelledby`**: Todos los elementos interactivos sin texto visible deben tener etiqueta accesible.
- **`aria-live`**: Regiones con contenido dinámico (errores, alertas) deben usar `aria-live="polite"` o `"assertive"`.
- **`role="status"`**: Para mensajes de carga, resultados vacíos, o estados transitorios.
- **Texto alternativo en imágenes**: `alt` descriptivo en `<img>`, o `aria-hidden` si son decorativas.
- **Ocultar decorativamente**: Iconos decorativos deben tener `aria-hidden="true"`.

### 5. Formularios y controles

- **`<label>` asociado**: Cada `<input>`, `<select>` debe tener un `<label>` con `htmlFor` o envolvente.
- **Mensajes de error**: Errores de validación deben estar asociados al campo con `aria-describedby` o `aria-errormessage`.
- **`fieldset`/`legend`**: Grupos de radios/checkboxes deben agruparse con `<fieldset>` y `<legend>`.

### 6. Recharts y datos visuales

- **Puntos de datos**: Usar `aria-label` en datos de gráficos o proporcionar tabla de datos alternativa.
- **Tooltips**: Deben ser accesibles por teclado (no solo hover).
- **Leyendas**: Deben estar en el orden de tabulación si son interactivas.

### 7. Estados de carga y error

- **Indicadores de carga**: Usar `aria-busy="true"` o `role="status"` con `aria-live`.
- **Mensajes de error**: Deben ser anunciados por lectores de pantalla (`role="alert"` o `aria-live="assertive"`).

## Formato de reporte

Para cada componente revisado, entrega:

```markdown
## Componente: [nombre]

### Issue 1: [título breve]
- **Criterio**: [criterio WCAG/ARIA violado]
- **Ubicación**: [archivo:línea]
- **Problema**: [explicación clara]
- **Sugerencia**: [código o cambio concreto]

### Issue 2: ...
```

Si no se detectan issues, indícalo explícitamente.

## Lista de verificación rápida

- [ ] ¿Usa `<section>`, `<header>`, `<nav>` en lugar de `<div>`?
- [ ] ¿Jerarquía de encabezados correcta?
- [ ] ¿Tablas de datos usan `<th scope>`?
- [ ] ¿Focus visible en todos los interactivos?
- [ ] ¿Contraste ≥ 4.5:1 para texto?
- [ ] ¿No solo color para transmitir información?
- [ ] ¿Iconos decorativos con `aria-hidden`?
- [ ] ¿`aria-label` en inputs sin label visible?
- [ ] ¿Carga/error con `role="status"` o `aria-live`?
- [ ] ¿Saltos de sección con `aria-label` en landmarks?