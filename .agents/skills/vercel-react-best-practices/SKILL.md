---
name: vercel-react-best-practices
description: Revisa componentes React del dashboard financiero aplicando las mejores prácticas de Vercel y React moderno (React 19, TypeScript, Vite). Evalúa rendimiento, tipado, estructura de componentes, hooks, estado y patrones de datos.
---

# Skill: Vercel React Best Practices Review — Financial Dashboard

## Propósito

Esta skill revisa componentes React del proyecto Financial Metrics Dashboard aplicando las mejores prácticas recomendadas por **Vercel** y la comunidad de **React moderna** (React 19, TypeScript 6, Vite 8). Cada revisión identifica áreas de mejora en rendimiento, tipado, estructura, manejo de estado, y patrones de datos.

## Criterios de revisión

Aplica estos criterios en orden al inspeccionar cualquier componente del frontend (`frontend/src/components/`).

### 1. Tipado TypeScript

- **Props tipadas**: Toda prop debe tener interfaz/type explícito (no `any` ni `React.FC` sin tipado).
- **Tipos importados**: Usar tipos del proyecto (`@/lib/financial-types`, `@/../specs/api-types`, `@/../specs/param-types`).
- **`useState` con tipo**: Inicializar con tipo explícito o inferencia clara. Estados complejos deben usar `type` o `interface`.
- **Eventos tipados**: Usar `ChangeEvent<HTMLInputElement>`, `MouseEvent<HTMLButtonElement>`, etc.
- **Evitar `any`**: No usar `any` en props, estados o retornos. Preferir `unknown` si es necesario.

### 2. Hooks y manejo de estado

- **`useEffect` limpio**: Siempre retornar cleanup function cuando hay suscripciones o `AbortController`.
- **Dependencias correctas**: `useEffect` debe listar todas las dependencias usadas; evitar arrays de dependencias incompletos.
- **Separar efectos**: Diferentes preocupaciones → diferentes `useEffect`.
- **Estado derivado**: Preferir `useMemo` para valores calculados sobre `useState` + `useEffect`.
- **Callbacks estables**: Usar `useCallback` para funciones pasadas como props a hijos.
- **Evitar estados redundantes**: No duplicar datos que pueden derivarse de props u otros estados.

### 3. Componentes y rendering

- **Componentes puros**: Los componentes deben ser funciones puras (misma entrada → misma salida).
- **Early returns**: Para estados de carga/vacío, usar early return en lugar de ternarias anidadas.
- **Fragmentos**: Usar `<></>` o `<Fragment>` en lugar de `<div>` extras cuando no se necesita contenedor.
- **Keys en listas**: Usar keys estables y únicas (no índices a menos que la lista sea estática).
- **Composición sobre configuración**: Preferir composición de hijos (`children`, slots) sobre props de configuración monstruosas.

### 4. Patrones de datos y fetching

- **Fetch en `useEffect`**: Usar `AbortController` para cancelar requests obsoletos.
- **Separar lógica de datos**: Mover fetching complejo a hooks personalizados o capas de servicio (`@/lib/api-utils.ts`).
- **Manejo de errores**: Cada request debe tener estado `loading`/`error`/`success` manejado.
- **Caché**: Considerar SWR o TanStack Query para datos del servidor si hay múltiples dependencias.
- **Estado global**: Evaluar si el estado necesita contexto o puede ser props.

### 5. Rendimiento

- **`React.memo`**: Usar en componentes que reciben props que cambian infrecuentemente o se renderizan en listas.
- **`useMemo`/`useCallback`**: Para cálculos costosos o referencias estables pasadas como props.
- **Bundle splitting**: Lazy loading con `React.lazy` para vistas no críticas o modales.
- **Evitar re-renders**: Pasar valores primitivos en lugar de objetos/arrays creados inline.
- **Recharts**: No renderizar gráficos hasta que los datos estén listos; usar `ResponsiveContainer` correctamente.

### 6. Estructura de archivos

- **Componente por archivo**: Un componente principal por archivo.
- **Colocar types cerca**: Tipos específicos pueden co-ubicarse con el componente.
- **Subcomponentes**: Componentes internos (usados solo aquí) pueden estar en el mismo archivo.
- **Nombres exportados**: Preferir exports named (`export function`) sobre `export default`.

### 7. CSS y Tailwind

- **CSS Modules vs utility**: Usar Tailwind utilities; evitar CSS-in-JS inline a menos que sea dinámico.
- **`cn()` helper**: Usar `@/lib/utils` `cn()` para combinar clases condicionalmente.
- **Responsive**: Diseño mobile-first con breakpoints `sm:`, `md:`, `lg:`, `xl:`.
- **Variables CSS**: Usar variables del tema (`var(--color-border)`, `var(--color-muted-foreground)`).
- **`data-slot`**: Los componentes base (`card.tsx`) ya usan `data-slot` para los slots de shadcn/ui — no romper ese patrón.

### 8. Estados del componente

- **Loading state**: Esqueleto o spinner mientras se cargan datos.
- **Empty state**: Mensaje claro cuando no hay datos.
- **Error state**: Mensaje de error con opción de reintento si aplica.
- **Edge cases**: Valores `null`, `undefined`, listas vacías, valores negativos en finanzas.

## Formato de reporte

Para cada componente revisado, entrega:

```markdown
## Componente: [nombre]

### Issue 1: [título breve]
- **Criterio**: [práctica violada]
- **Ubicación**: [archivo:línea]
- **Problema**: [explicación clara]
- **Sugerencia**: [código o cambio concreto]

### Issue 2: ...
```

Si no se detectan issues, indícalo explícitamente.

## Lista de verificación rápida

- [ ] Props tipadas sin `any`
- [ ] Eventos con tipos específicos (`ChangeEvent<T>`, etc.)
- [ ] `useEffect` con cleanup y dependencias correctas
- [ ] `useMemo`/`useCallback` para valores/funciones estables
- [ ] Componentes puros sin mutaciones externas
- [ ] Keys únicas y estables en listas
- [ ] Estados loading/empty/error cubiertos
- [ ] Fetch con `AbortController`
- [ ] `React.memo` en componentes de lista/table
- [ ] Tailwind responsive mobile-first
- [ ] `cn()` para clases condicionales
- [ ] Componentes con named exports