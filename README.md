# Mobile Store (ITX front-end test)

Mini SPA para comprar dispositivos móviles: listado de productos (PLP) y ficha de producto (PDP) con carrito.

> El historial de commits sigue el orden en que se fue construyendo, por hitos.

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

## Configuración

La URL del API se define en la variable de entorno `VITE_API_BASE_URL`, que ya viene en el archivo `.env`. Para usar otra en local, crea un `.env.local` con ese mismo nombre.

## Stack

Vue 3 (Composition API, `<script setup>`) · TypeScript · Vite · Vue Router · Pinia · Zod · Inter (`@fontsource-variable/inter`) · Vitest + Vue Test Utils · ESLint + oxlint + Prettier.

## Estructura

```
src/
  api/          cliente del API, esquemas zod y contrato de los datos
  components/   componentes de interfaz (los iconos, en components/icons/)
  composables/  lógica reutilizable: carga de datos, título de página, scroll, etc.
  router/       rutas, comportamiento del scroll y foco al navegar
  services/     caché y acceso seguro a localStorage
  stores/       carrito (Pinia)
  styles/       tokens de diseño y estilos globales
  utils/        funciones puras: filtro, formato de precio, nombre del producto
  views/        las vistas: listado, ficha y 404
```

## Decisiones técnicas

### TypeScript

Para una aplicación de este tamaño el proyecto podría simplificarse a JavaScript, y no creo que cambiase la intención del ejercicio. Aun así he optado por TypeScript porque deja el contrato del API declarado en un único sitio y obliga a tratar de forma explícita los datos inconsistentes que devuelve. Además, aporta autocompletado y refactors más seguros.

### Caché a medida

Dada la sencillez de lo que se necesita (tres endpoints y una expiración de 1 hora), he implementado una caché propia en lugar de añadir una librería. Guarda en memoria y en `localStorage`, y comparte la petición en curso entre quien la pide a la vez. Una librería como `@tanstack/vue-query` tendría sentido si el proyecto crece o la lógica de caché se complica.

### Validación y normalización con zod

Se usa zod para normalizar los datos del API y para controlar errores de tipo o de datos en el punto de entrada. Así el resto de la aplicación trabaja con tipos fiables.

### Pinia solo para el carrito

Es el único estado global compartido entre vistas. El resto del estado (listado, filtro, detalle) es local a cada vista o se resuelve con composables.

### Iconos propios, sin librería

Cada icono es un componente pequeño construido sobre `IconBase`, que fija el tamaño, el trazo y el color heredado del texto. Se importan por nombre, de modo que un nombre equivocado falla al compilar, y solo entra en el paquete lo que se usa. Un test recorre la carpeta y comprueba que todos usan la base. Con unos veinte iconos no compensaba añadir una dependencia.

## Decisiones de diseño

- **Sistema de diseño ligero.** Los colores, el espaciado (múltiplos de 4 px), los radios, las sombras y la escala tipográfica están en `src/styles/tokens.css`. Hay un único color de acento (azul), un fondo gris frío con tarjetas blancas y un lenguaje de «píldoras» compartido por las migas, el buscador, la cesta y los botones, para que la interfaz se lea como un conjunto.
- **Migas fuera de la cabecera.** El enunciado las sitúa en el header, pero las he sacado a una barra justo debajo porque les veía más sentido junto a la acción de cada página: el buscador en el listado y el botón de volver en la ficha. La cabecera se queda con el logo, que enlaza al inicio, y el contador de la cesta.
- **Fuente autoalojada.** Inter variable se sirve desde el propio paquete, sin peticiones a servicios externos.
- **Imágenes con proporción fija 3:4**, que es la de las fotos del API. Así todas las tarjetas miden lo mismo tengan foto o no, y no hay saltos al cargar. La imagen de respaldo, cuando falta la foto, es una ilustración con esa misma proporción.
- **Esqueletos con la forma del contenido.** Los de carga imitan la tarjeta del listado y la ficha, con las mismas medidas, para que no se mueva nada cuando llegan los datos.
- **Estados con acción.** Un único componente (`StateMessage`) cubre el error de carga, la lista vacía y la búsqueda sin resultados, cada uno con su salida («Try again», «Refresh», «Clear search»).
- **Móvil.** Por debajo de 40 rem, el botón de comprar va en una barra fija con el precio y las opciones elegidas. Para cambiarlas se abre una hoja desde abajo. En escritorio, las opciones están en la tarjeta de acciones.

## Comportamiento

- **La búsqueda vive en la URL** (`?q=`): se conserva al volver atrás y se puede compartir. Muestra cuántos productos coinciden, se limpia con un botón y se enfoca con `Ctrl+K` o `⌘K`.
- **El botón de volver de la ficha usa el historial**, así que conserva el scroll y la búsqueda del listado. Si se entró a la ficha directamente, lleva al listado.
- **Una página nueva se abre arriba**, y al volver atrás se restaura la posición.
- **Primera opción preseleccionada.** El enunciado pide que el selector venga elegido cuando solo hay una opción. Lo he hecho también cuando hay varias, para que se pueda comprar sin pasos extra.
- **El carrito se persiste** en `localStorage` y se muestra en la cabecera de cualquier vista.

## Accesibilidad

He diseñado la interfaz pensando en WCAG 2.1 AA y la he auditado revisando el código y calculando los contrastes con los tokens reales: estructura semántica, contraste de texto y de controles, uso completo con teclado, avisos para lectores de pantalla y respeto de `prefers-reduced-motion`.

Una decisión consciente: el buscador no lleva un contorno de 3:1 frente al fondo. El criterio 1.4.11 solo lo exige cuando el borde es necesario para identificar el control, y aquí lo identifican la lupa, el texto de ayuda y el anillo de foco.

Queda pendiente probarlo con un lector de pantalla real (NVDA o VoiceOver).

## Tests

Vitest, Vue Test Utils y jsdom, con más de 480 tests junto al código, en carpetas `__tests__`. Los nombres están en inglés y describen el comportamiento concreto. Cubren el cliente del API, los esquemas, la caché (caducidad y almacenamiento que falla), el carrito, los composables, los componentes (estados, teclado y accesibilidad) y las vistas.

No cubren el CSS, como la rejilla de cuatro columnas o el aspecto, que se comprueba a mano, y tampoco hay pruebas de extremo a extremo.

## Notas sobre el API

Los datos se normalizan en `src/api/schemas.ts` antes de llegar al resto de la aplicación:

- Los campos de pantalla llegan intercambiados: `displayResolution` contiene el tamaño en pulgadas y `displaySize` la resolución en píxeles. Se exponen como `screenSize` y `screenResolution`.
- `dimentions` y `secondaryCmera` se renombran a `dimensions` y `secondaryCamera`.
- Los valores vacíos (`""` o `"-"`) se convierten en `null`, y la interfaz muestra un valor por defecto. Esto afecta, por ejemplo, a `price` y `weight`, que además se convierten a número.
- Algunas opciones de almacenamiento llegan con el nombre en blanco (`" "`), como la del Acer DX650. Se conservan, porque el API necesita su código para añadir el producto, y se muestran como «Not specified».
- Los campos que llegan como lista de textos se unen en un único texto.
- Un producto del listado que no cumple el contrato se descarta con un aviso en consola. Si no lo cumple ninguno, se trata como un error y no se guarda en la caché.
- **Un id inexistente devuelve un 500** (`{"message":"An Unexpected Error Occurred","code":0}`), no un 404. No se puede distinguir de un fallo real del servidor, así que la ficha muestra un error genérico con «Try again» y «Back to the list».
- **`POST /api/cart` siempre responde `{"count":1}`**, añadas lo que añadas. El enunciado indica que la respuesta trae el número de productos de la cesta y que ese es el valor que se muestra en la cabecera, y así lo hace la aplicación. Como el API no lleva la cuenta, el contador se queda en 1. No lo he compensado sumando en el cliente para no mostrar un dato que el API no da.

Las respuestas del API ya normalizadas se guardan en `localStorage` durante 1 hora.

## Límites y qué haría con más tiempo

- Un tiempo máximo y reintentos en las peticiones. Hoy, una respuesta lenta deja los esqueletos hasta que llega.
- Servir datos caducados si falla la red, en lugar de mostrar el error.
- Distinguir «sin conexión» de «error del servidor» en los mensajes.
- Pruebas de extremo a extremo del flujo listar, buscar y añadir al carrito.
- Internacionalización: hoy los textos están fijos en inglés.
- Probar con lectores de pantalla y en más navegadores.
