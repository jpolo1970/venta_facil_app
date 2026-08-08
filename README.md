# app-pwa-calculatuingreso

PWA para registrar ventas diarias de una tienda y calcular ingresos por mes. Funciona completamente en el navegador: no requiere backend ni conexión a internet una vez instalada.

## Stack

- [Vue 3](https://vuejs.org/) + [Ionic Vue](https://ionicframework.com/docs/vue/overview) — UI y componentes tipo nativo
- [Vite](https://vitejs.dev/) + [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) — build, manifest y Service Worker
- [sql.js](https://sql.js.org/) (SQLite compilado a WASM) + [idb-keyval](https://github.com/jakearchibald/idb-keyval) — base de datos SQLite real corriendo en memoria en el navegador, persistida en IndexedDB

No usa Capacitor ni build nativo: es una PWA pura, instalable desde el navegador (Android: prompt nativo / iOS: "Agregar a pantalla de inicio").

## Requisitos

- Node.js 20+

## Empezar

```bash
npm install
npm run dev
```

Abre http://localhost:5173

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve `dist/` localmente (necesario para probar el Service Worker/PWA real, `dev` no lo simula bien) |

## Funcionalidad

- **Ventas**: lista las ventas del día (o de una fecha elegida en el calendario), con total acumulado y opción de eliminar un ítem.
- **Registrar**: arma una venta agregando artículos con precio y cantidad; cada entrada a la pantalla empieza un formulario nuevo.
- **Productos**: catálogo de artículos (nombre + precio) usado al registrar ventas; permite agregar nuevos.
- **Cálculo**: resumen de ventas agrupado por año-mes (cantidad de artículos y total vendido).

## Datos y almacenamiento

Los datos viven enteramente en el dispositivo del usuario: SQLite corre en memoria vía WASM y se exporta a IndexedDB después de cada cambio. No hay sincronización con ningún servidor, así que los datos no se comparten entre dispositivos ni sobreviven a borrar los datos del sitio en el navegador.

## Actualizaciones de la app

Las actualizaciones del Service Worker no se aplican solas: hay que abrir el menú lateral y presionar "Actualizar App". Esto preserva los datos locales (no reinstala la app).

## Despliegue

Cada push a `main` dispara el workflow [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml), que compila el proyecto y lo publica en GitHub Pages.

## Para Claude Code / agentes de IA

Este repo incluye un `CLAUDE.md` con guía de arquitectura y convenciones para trabajar con Claude Code. No está versionado en git (ver `.gitignore`): si clonas el repo desde cero, pídele a Claude que lo regenere con el skill `init`, o cópialo de otra copia local del proyecto.
