# Mobile Store (ITX front-end test)

Mini SPA para comprar dispositivos móviles: listado de productos (PLP) y ficha de producto (PDP) con carrito.

> Estado: en desarrollo por hitos. Ver el historial de commits.

## Requisitos

- Node `^22.18.0` o `>=24.12.0` (el proyecto incluye `.nvmrc`, compatible con fnm/nvm).
- npm 10+.

## Scripts

| Script          | Descripción                              |
| --------------- | ---------------------------------------- |
| `npm start`     | Modo desarrollo (Vite, HMR)              |
| `npm run build` | Type-check + compilación de producción   |
| `npm test`      | Lanza los tests (Vitest)                 |
| `npm run lint`  | Comprobación de código (oxlint + ESLint) |
| `npm run fix`   | Aplica las correcciones automáticas      |

## Stack

Vue 3 (Composition API, `<script setup>`) · TypeScript · Vite · Vue Router · Pinia · Zod · Vitest + Vue Test Utils · ESLint + oxlint + Prettier.

## Decisiones técnicas

### TypeScript

Para una aplicación de este tamaño el proyecto podría simplificarse a JavaScript, y no creo que cambiase la intención del ejercicio. Aun así he optado por TypeScript porque deja el contrato del API declarado en un único sitio y obliga a tratar de forma explícita los datos inconsistentes que devuelve. Además, aporta autocompletado y refactors más seguros.

### Caché a medida

Dada la sencillez de lo que se necesita (tres endpoints y una expiración de 1 hora), he implementado una caché propia en lugar de añadir una librería. Una librería como `@tanstack/vue-query` tendría sentido si el proyecto crece o la lógica de caché se complica.

### Validación y normalización con zod

Se usa zod para normalizar los datos del API y para controlar errores de tipo o de datos en el punto de entrada. Así el resto de la aplicación trabaja con tipos fiables.

### Pinia solo para el carrito

Es el único estado global compartido entre vistas. El resto del estado (listado, filtro, detalle) es local a cada vista o se resuelve con composables.

## Notas sobre el API

Los datos se normalizan en `src/api/schemas.ts` antes de llegar al resto de la aplicación:

- Los campos de pantalla llegan intercambiados: `displayResolution` contiene el tamaño en pulgadas y `displaySize` la resolución en píxeles. Se exponen como `screenSize` y `screenResolution`.
- `dimentions` y `secondaryCmera` se renombran a `dimensions` y `secondaryCamera`.
- Los valores vacíos (`""` o `"-"`) se convierten en `null`, y la interfaz muestra un valor por defecto. Esto afecta, por ejemplo, a `price` y `weight`, que además se convierten a número.
- Los campos que llegan como lista de textos se unen en un único texto.

Las respuestas del API ya normalizadas se guardan en `localStorage` durante 1 hora.
