import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'
import pkg from './package.json' with { type: 'json' }

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/venta_facil_app/' : '/',

  server: { host: true, port: 5173 },

  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },

  plugins: [
    vue(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['icons/*.png', 'sql-wasm.wasm', 'sql-wasm-browser.wasm'],
      manifest: {
        name: 'Calcula Ingreso',
        short_name: 'CalcIngreso',
        description: 'Registro de ventas diarias de tienda',
        theme_color: '#3880ff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        version: pkg.version,
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,wasm}'],
        cleanupOutdatedCaches: true,
      },
    }),
  ],

  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
