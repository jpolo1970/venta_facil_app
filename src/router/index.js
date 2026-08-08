import { createRouter, createWebHistory } from '@ionic/vue-router'
import TabsPage from '@/components/TabsPage.vue'

const routes = [
  { path: '/', redirect: '/tabs/ventas' },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      { path: '', redirect: '/tabs/ventas' },
      { path: 'ventas', component: () => import('@/pages/VentasPage.vue') },
      { path: 'registrar', component: () => import('@/pages/RegistrarPage.vue') },
      { path: 'productos', component: () => import('@/pages/ProductosPage.vue') },
      { path: 'calculo', component: () => import('@/pages/CalculoPage.vue') },
    ],
  },
]

const router = createRouter({
  // Debe coincidir con `base` de vite.config.js — en GitHub Pages la app vive
  // en /app-pwa-calculatuingreso/, no en la raíz, y sin esto el router no
  // encuentra ninguna ruta (pantalla en blanco, sin error en consola).
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
